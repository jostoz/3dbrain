/* eslint no-param-reassign: ["error", { "props": true, "ignorePropertyModificationsFor": ["child", "memories"] }] */
import * as THREE from "three";
import { Power4, gsap } from "gsap";
import * as BufferGeometryUtils from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import AbstractApplication from "./views/AbstractApplication";
import Loaders from "./Loaders/Loaders";
import BubblesAnimation from "./services/bubblesAnimation";
import ThinkingAnimation from "./services/thinkingAnimation";
import GUI from "./services/gui";
import Font from "./services/font";
import ParticleSystem from "./services/particlesSystem";
import Memories from "./data/memories.json";
import { BrainStateManager, BrainState } from "./services/BrainStateManager";
import { EventEmitter } from "./services/EventEmitter";

class MainBrain extends AbstractApplication {
  constructor() {
    console.log('MainBrain constructor called');
    super(); // Original behavior: no container parameter
    
    // Initialize state manager
    this.stateManager = new BrainStateManager();
    this.stateManager.attachToMainBrain(this);

    this.clock = new THREE.Clock();
    this.addBrain = this.addBrain.bind(this);
    this.addFloor();
    this.addIllumination();

    this.deltaTime = 0;
    this.particlesColor = new THREE.Color(0xffffff);
    this.particlesStartColor = new THREE.Color(0xffffff);
    this.loaders = new Loaders(this.runAnimation.bind(this));
    this.memories = Memories;
    this.memorySelected = [
      "analytic",
      "episodic",
      "process",
      "semantic",
      "affective",
    ];
    this.frame = 0;
    this.frameName = 0;
    this.isRecording = false;
    this.particlesSystem = null;

    // Start in LOADING state
    this.stateManager.updateState('brain', {
      current: BrainState.LOADING
    });

    setTimeout(() => {
      this.startIntro();
    }, 1000);
  }

  addFloor() {
    const geometry = new THREE.PlaneGeometry(20000, 20000);
    const material = new THREE.MeshPhongMaterial({
      opacity: 0.1,
      transparent: true,
    });
    this.plane = new THREE.Mesh(geometry, material);
    this.plane.receiveShadow = true;
    this.plane.position.y = -160;
    this.plane.rotation.x = -0.5 * Math.PI;
    this.scene.add(this.plane);
  }
  addIllumination() {
    this.ambienlight = new THREE.AmbientLight(0xb8c5cf, 0);
    this.scene.add(this.ambienlight);

    this.spotLight = new THREE.SpotLight(
      0xb8c5cf,
      1.45,
      175,
      Math.PI / 2,
      0.0,
      0.0
    );
    this.spotLight.position.set(0, 500, -10);
    this.spotLight.castShadow = true;

    // Configure shadow properties directly on the light
    this.spotLight.shadow.bias = -0.000222;
    this.spotLight.shadow.mapSize.width = 1024;
    this.spotLight.shadow.mapSize.height = 1024;

    // Set up shadow camera parameters if needed
    this.spotLight.shadow.camera.near = 1;
    this.spotLight.shadow.camera.far = 2000;
    this.spotLight.shadow.camera.fov = 54;
    this.spotLight.shadow.camera.aspect = window.innerWidth / window.innerHeight;

    this.scene.add(this.spotLight);
    this.spotLightHelper = new THREE.SpotLightHelper(this.spotLight);
  }

  addBrain() {
    console.log('=== addBrain started ===');
    this.brainBufferGeometries = [];

    let meshCount = 0;
    let lineCount = 0;
    
    this.loaders.BRAIN_MODEL.traverse((child) => {
      console.log('Traversing child:', child.type, child);
      
      if (child instanceof THREE.LineSegments) {
        lineCount++;
        this.memories.lines = {
          ...this.memories.lines,
          ...MainBrain.addLinesPath(child, this.memories),
        };
      }
      if (!(child instanceof THREE.Mesh)) {
        return;
      }
      meshCount++;
      child.geometry.verticesNeedUpdate = true;
      // child.material.map = this.loaders.lightTexture;
      this.brainBufferGeometries.push(child.geometry);

      this.memories = {
        ...this.memories,
        ...MainBrain.storeBrainVertices(child, this.memories),
      };
    });

    console.log('Found meshes:', meshCount, 'lines:', lineCount);
    console.log('Buffer geometries to merge:', this.brainBufferGeometries.length);

    if (this.brainBufferGeometries.length > 0) {
      this.endPointsCollections = BufferGeometryUtils.mergeGeometries(
        this.brainBufferGeometries
      );
      console.log('Merged geometry:', this.endPointsCollections);
    } else {
      console.error('No geometries to merge!');
    }
  }

  startIntro() {
    this.stateManager.updateState('brain', {
      current: BrainState.TRANSITIONING
    });

    const progress = { p: 1000 };
    gsap.fromTo(
      progress,
      6.5,
      { p: 1000 },
      {
        p: 380,
        ease: Power4.easeInOut,
        onUpdate: () => {
          if (this.camera) {
            this.camera.position.z = progress.p;
            this.stateManager.updateState('camera', {
              position: {
                x: this.camera.position.x,
                y: this.camera.position.y,
                z: this.camera.position.z
              }
            });
          }
        },
        onStart: () => {
          if (this.particlesSystem?.transform) {
            this.particlesSystem.transform(true);
          }
        },
        onComplete: () => {
          if (this.particlesSystem?.xRay?.material?.uniforms?.c) {
            this.particlesSystem.xRay.material.uniforms.c.value = 1.0;
          }
          this.stateManager.updateState('brain', {
            current: BrainState.READY
          });
          this.startAutoDemo();
        }
      }
    );
  }

  startAutoDemo() {
    if (!this.particlesSystem?.xRay) return;

    let memoryCount = 1;
    this.scene.add(this.particlesSystem.xRay);
    let memoryTimer;
    
    setTimeout(() => {
      if (this.particlesSystem?.isXRayActive) {
        this.particlesSystem.isXRayActive(true);
        setTimeout(() => {
          if (this.particlesSystem?.isXRayActive) {
            this.particlesSystem.isXRayActive(false);
          }
          memoryTimer = setInterval(() => {
            if (memoryCount < 5 && this.bubblesAnimation?.updateSubSystem) {
              this.bubblesAnimation.updateSubSystem(memoryCount);
              memoryCount += 1;
            } else {
              if (this.bubblesAnimation?.updateSubSystem) {
                this.bubblesAnimation.updateSubSystem(0);
              }
              clearInterval(memoryTimer);
            }
          }, 9000);
        }, 4000);
      }
    }, 2000);
  }

  static addLinesPath(mesh, memories) {
    const keys = Object.keys(memories.lines);
    keys.map((l) => {
      if (mesh.name.includes(l)) {
        memories.lines[l] = mesh.geometry.attributes.position.array;
        return memories.lines;
      }
      return [];
    });
  }

  static storeBrainVertices(mesh, memories) {
    const keys = Object.keys(memories);

    return keys.map((m) => {
      if (mesh.name.includes(m)) {
        if (memories[m].length) {
          memories[m].push(mesh.geometry);
          memories[m] = [
            BufferGeometryUtils.mergeGeometries(memories[m])
          ];
          return memories;
        }
        memories[m].push(mesh.geometry);
        return memories;
      }
      return [];
    });
  }

  runAnimation() {
    console.log('=== Starting runAnimation ===');
    console.log('Brain model loaded:', this.loaders.BRAIN_MODEL);
    
    // Add debug cube to verify rendering works
    this.addDebugCube();
    
    try {
      this.gui = new GUI(this);
    } catch (error) {
      console.error('GUI initialization failed:', error);
    }
    
    try {
      this.addBrain();
      
      console.log('Brain buffer geometries count:', this.brainBufferGeometries?.length);
      console.log('endPointsCollections:', this.endPointsCollections);
      
      // Add safety check for endPointsCollections
      if (!this.endPointsCollections) {
          console.error('Failed to initialize particle system: endPointsCollections is not available');
          console.error('brainBufferGeometries:', this.brainBufferGeometries);
          // Add the brain model directly as fallback
          this.addBrainModelDirectly();
      } else {
        this.addParticlesSystem();
        console.log('Particle system created:', this.particlesSystem);
        
        // Also add direct model for debugging
        if (this.brainBufferGeometries?.length > 0) {
          this.addBrainWireframe();
        }
      }
      
      console.log('Scene children count:', this.scene.children.length);
      console.log('Camera position:', this.camera.position);
      console.log('Camera looking at:', new THREE.Vector3(0, 0, 0));
      console.log('Renderer size:', this.renderer.getSize(new THREE.Vector2()));
      console.log('Renderer DOM element:', this.renderer.domElement);
      console.log('Canvas in DOM:', document.contains(this.renderer.domElement));
      
    } catch (error) {
      console.error('Error in brain initialization:', error);
    }
    
    try {
      this.font = new Font(this.loaders, this.scene);
      this.bubblesAnimation = new BubblesAnimation(this);
      this.bubblesAnimation.initAnimation();

      this.thinkingAnimation = new ThinkingAnimation(this);
      this.thinkingAnimation.initAnimation();
    } catch (error) {
      console.error('Error initializing animations:', error);
    }

    this.animate();
  }
  
  addDebugCube() {
    // Add a much larger colored cube to verify rendering
    const geometry = new THREE.BoxGeometry(200, 200, 200);
    const material = new THREE.MeshBasicMaterial({ 
      color: 0xff0000,
      wireframe: true 
    });
    const cube = new THREE.Mesh(geometry, material);
    cube.position.set(0, 0, 0);
    this.scene.add(cube);
    
    // Add a solid cube too
    const solidGeometry = new THREE.BoxGeometry(100, 100, 100);
    const solidMaterial = new THREE.MeshBasicMaterial({ 
      color: 0x00ff00
    });
    const solidCube = new THREE.Mesh(solidGeometry, solidMaterial);
    solidCube.position.set(200, 0, 0);
    this.scene.add(solidCube);
    
    // Add much larger axes helper
    const axesHelper = new THREE.AxesHelper(500);
    this.scene.add(axesHelper);
    
    console.log('Debug cubes and axes added to scene');
    console.log('Red wireframe cube at (0,0,0), Green solid cube at (200,0,0)');
  }
  
  addBrainModelDirectly() {
    console.log('Adding brain model directly to scene');
    
    if (!this.loaders?.BRAIN_MODEL) {
      console.error('No brain model available');
      return;
    }
    
    // Clone the original model and add it to the scene
    const brainModel = this.loaders.BRAIN_MODEL.clone();
    
    // Make all materials wireframe for visibility
    brainModel.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.material = new THREE.MeshBasicMaterial({ 
          color: 0x00ffff,
          wireframe: true 
        });
      }
    });
    
    // Scale and position the model much larger
    brainModel.scale.set(10, 10, 10);
    brainModel.position.set(-400, 0, 0);
    
    this.scene.add(brainModel);
    console.log('Brain model added directly to scene');
  }
  
  addBrainWireframe() {
    console.log('Adding brain wireframe overlay');
    
    if (!this.brainBufferGeometries?.length) {
      console.error('No brain geometries available for wireframe');
      return;
    }
    
    // Create wireframe from merged geometry
    const wireframeMaterial = new THREE.MeshBasicMaterial({ 
      color: 0xffffff,
      wireframe: true,
      transparent: true,
      opacity: 0.3
    });
    
    const wireframeMesh = new THREE.Mesh(this.endPointsCollections, wireframeMaterial);
    wireframeMesh.scale.set(10, 10, 10);
    wireframeMesh.position.set(400, 0, 0); // Offset so we can see both
    this.scene.add(wireframeMesh);
    
    console.log('Brain wireframe added to scene');
  }

  animate(timestamp) {
    this.orbitControls?.update();
    if (this.orbitControls && this.gui?.controls?.rotationSpeed) {
      this.orbitControls.autoRotateSpeed = this.gui.controls.rotationSpeed;
    }

    this.deltaTime += this.clock.getDelta();
    
    // Debug info every 120 frames (about 2 seconds)
    if (this.frame % 120 === 0) {
      console.log('=== Animation Frame Debug ===');
      console.log('Frame:', this.frame);
      console.log('Scene children:', this.scene.children.length);
      console.log('Camera position:', this.camera.position);
      console.log('OrbitControls target:', this.orbitControls?.target);
      console.log('Renderer info:', this.renderer.info);
    }

    // Actualizar progreso de transición si está activa
    this.stateManager.updateTransitionProgress();

    if (this.particlesSystem?.update && this.camera) {
      this.particlesSystem.update(
        this.deltaTime,
        this.camera,
        this.particlesSystem.xRay
      );
    }

    if (this.bubblesAnimation?.update && this.camera) {
      this.bubblesAnimation.update(this.camera, this.deltaTime);
    }

    if (this.thinkingAnimation?.update && this.camera) {
      this.thinkingAnimation.update(this.camera, this.deltaTime);
    }

    this.stats?.update();
    requestAnimationFrame(this.animate.bind(this));

    if (this.font?.facingToCamera && this.camera) {
      this.font.facingToCamera(this.camera);
    }
    
    if (this.camera) {
      this.camera.updateProjectionMatrix();
    }

    if (this.thinkingAnimation?.flashing?.geometry) {
      this.thinkingAnimation.flashing.geometry.verticesNeedUpdate = true;
      this.thinkingAnimation.flashing.geometry.attributes.position.needsUpdate = true;
    }

    this.composer?.render();

    if (this.isRecording) {
      if (this.frame > 10) {
        this.frameName += 1;
        const canvas = document.querySelector("canvas");
        if (canvas && this.socket?.emit) {
          this.socket.emit("render-frame", {
            frame: this.frameName,
            file: canvas.toDataURL(),
          });
        }
      }
      this.frame += 1;
    }
  }
  onMouseMove(event) {
    const y = window.innerHeight - event.clientY;
    const x = window.innerHeight - event.clientX;
    //  this.bubblesAnimation.updateMouse(new THREE.Vector2(x, y));
  }
  addParticlesSystem() {
    if (this.endPointsCollections) {
      this.particlesSystem = new ParticleSystem(
        this.endPointsCollections,
        this.memories,
        this
      );
      if (this.particlesSystem?.particles) {
        this.scene.add(this.particlesSystem.particles);
      }
    }
  }

  static getRandomPointOnSphere(r) {
    const u = THREE.MathUtils.randFloat(0, 1);
    const v = THREE.MathUtils.randFloat(0, 1);
    const theta = 2 * Math.PI * u;
    const phi = Math.acos(2 * v - 1);
    const x = r * Math.sin(theta) * Math.sin(phi);
    const y = r * Math.cos(theta) * Math.sin(phi);
    const z = r * Math.cos(phi);
    return {
      x,
      y,
      z,
    };
  }
}

export default MainBrain;


