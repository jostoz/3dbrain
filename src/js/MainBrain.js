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
    const container = document.getElementById('container');
    console.log('Container in MainBrain:', container);
    super(container);
    
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
    this.brainBufferGeometries = [];

    this.loaders.BRAIN_MODEL.traverse((child) => {
      if (child instanceof THREE.LineSegments) {
        this.memories.lines = {
          ...this.memories.lines,
          ...MainBrain.addLinesPath(child, this.memories),
        };
      }
      if (!(child instanceof THREE.Mesh)) {
        return;
      }
      child.geometry.verticesNeedUpdate = true;
      // child.material.map = this.loaders.lightTexture;
      this.brainBufferGeometries.push(child.geometry);

      this.memories = {
        ...this.memories,
        ...MainBrain.storeBrainVertices(child, this.memories),
      };
    });

    this.endPointsCollections = BufferGeometryUtils.mergeGeometries(
      this.brainBufferGeometries
    );
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
          this.camera.position.z = progress.p;
          this.stateManager.updateState('camera', {
            position: {
              x: this.camera.position.x,
              y: this.camera.position.y,
              z: this.camera.position.z
            }
          });
        },
        onStart: () => {
          this.particlesSystem.transform(true);
        },
        onComplete: () => {
          this.particlesSystem.xRay.material.uniforms.c.value = 1.0;
          this.stateManager.updateState('brain', {
            current: BrainState.READY
          });
          this.startAutoDemo();
        }
      }
    );
  }

  startAutoDemo() {
    let memoryCount = 1;
    this.scene.add(this.particlesSystem.xRay);
    let memoryTimer;
    
    setTimeout(() => {
      this.particlesSystem.isXRayActive(true);
      setTimeout(() => {
        this.particlesSystem.isXRayActive(false);
        memoryTimer = setInterval(() => {
          if (memoryCount < 5) {
            this.bubblesAnimation.updateSubSystem(memoryCount);
            memoryCount += 1;
          } else {
            this.bubblesAnimation.updateSubSystem(0);
            clearInterval(memoryTimer);
          }
        }, 9000);
      }, 4000);
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

    keys.map((m) => {
      if (mesh.name.includes(m)) {
        if (memories[m].length) {
          memories[m].push(mesh.geometry);
          memories[m] = [
            THREE.BufferGeometryUtils.BufferGeometryUtils.mergeGeometries(memories[m]),
          ];
          return memories;
        }
        return memories[m].push(mesh.geometry);
      }
      return [];
    });
  }

  runAnimation() {
    this.gui = new GUI(this);
    this.addBrain();
    this.addParticlesSystem();
    this.font = new Font(this.loaders, this.scene);
    this.bubblesAnimation = new BubblesAnimation(this);
    this.bubblesAnimation.initAnimation();

    this.thinkingAnimation = new ThinkingAnimation(this);
    this.thinkingAnimation.initAnimation();

    this.animate();
  }

  animate(timestamp) {
    this.orbitControls.update();
    this.orbitControls.autoRotateSpeed = this.gui?.controls?.rotationSpeed;

    this.deltaTime += this.clock.getDelta();

    // Actualizar progreso de transición si está activa
    this.stateManager.updateTransitionProgress();

    this.particlesSystem.update(
      this.deltaTime,
      this.camera,
      this.particlesSystem.xRay
    );
    this.bubblesAnimation.update(this.camera, this.deltaTime);
    this.thinkingAnimation.update(this.camera, this.deltaTime);

    this.stats.update();
    requestAnimationFrame(this.animate.bind(this));

    this.font.facingToCamera(this.camera);
    this.camera.updateProjectionMatrix();

    this.thinkingAnimation.flashing.geometry.verticesNeedUpdate = true;
    this.thinkingAnimation.flashing.geometry.attributes.position.needsUpdate = true;

    this.composer.render();

    if (this.isRecording) {
      if (this.frame > 10) {
        this.frameName += 1;
        this.socket.emit("render-frame", {
          frame: this.frameName,
          file: document.querySelector("canvas").toDataURL(),
        });
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
    this.particlesSystem = new ParticleSystem(
      this,
      this.endPointsCollections,
      this.memories
    );
    this.scene.add(this.particlesSystem.particles);
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


