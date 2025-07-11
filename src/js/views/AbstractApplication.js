import * as THREE from "three";
import io from "socket.io-client";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import Stats from "three/examples/jsm/libs/stats.module";
import {
  EffectComposer,
  RenderPass,
  BloomEffect,
  EffectPass,
} from "postprocessing";

class AbstractApplication {
  constructor(container) {
    // Use document.body if no container is provided (original behavior)
    this.container = container || document.body;
    console.log('AbstractApplication constructor called');
    console.log('Container:', this.container);
    this.stats = AbstractApplication.initStats(this.container);
    
    // Scene setup
    this.a_scene = new THREE.Scene();
    this.a_scene.background = new THREE.Color(0x000000); // Black background
    this.mouse = { x: 0, y: 0 };

    // Camera setup
    this.a_camera = new THREE.PerspectiveCamera(
      45, 
      window.innerWidth / window.innerHeight, 
      1, 
      10000
    );
    this.a_camera.position.z = 1000;

    // Renderer setup
    this.a_renderer = new THREE.WebGLRenderer({ antialias: true });
    this.a_renderer.setSize(window.innerWidth, window.innerHeight);
    this.a_renderer.setClearColor(0x000000);
    this.a_renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.container.appendChild(this.a_renderer.domElement);

    // Controls setup
    this.orbitControls = new OrbitControls(this.a_camera, this.a_renderer.domElement);
    this.orbitControls.enableDamping = true;

    // Post-processing setup
    // Add a larger cube for debugging
    const debugGeometry = new THREE.BoxGeometry(150, 150, 150);
    const debugMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    const debugCube = new THREE.Mesh(debugGeometry, debugMaterial);
    debugCube.position.set(0, 200, 0);
    this.a_scene.add(debugCube);
    console.log('Debug cube added to scene at (0, 200, 0)');
    
    // Setup composer and effects
    this.composer = new EffectComposer(this.a_renderer);
    const renderPass = new RenderPass(this.a_scene, this.a_camera);
    
    const bloomEffect = new BloomEffect({
      luminanceSmoothing: 0.0
    });

    const effectPass = new EffectPass(this.a_camera, bloomEffect);

    this.composer.addPass(renderPass);
    this.composer.addPass(effectPass);
    effectPass.renderToScreen = true;

    // Event listeners
    window.addEventListener('resize', this.onWindowResize.bind(this));
    window.addEventListener('mousemove', this.onMouseMove.bind(this));
  }

  startAnimation() {
    // Start animation loop
    this.animate();
  }

  get renderer() {
    return this.a_renderer;
  }

  get camera() {
    return this.a_camera;
  }

  get scene() {
    return this.a_scene;
  }

  get blurScene() {
    return this.a_blurScene;
  }
  
  get bloomScene() {
    return this.a_bloomScene;
  }

  static initStats(container) {
    const stats = new Stats();
    stats.dom.style.position = "absolute";
    stats.dom.style.left = "0px";
    stats.dom.style.top = "0px";
    container.appendChild(stats.dom);
    return stats;
  }

  onWindowResize() {
    const width = window.innerWidth;
    const height = window.innerHeight;

    this.a_camera.aspect = width / height;
    this.a_camera.updateProjectionMatrix();

    this.a_renderer.setSize(width, height);
    this.composer.setSize(width, height);
  }

  onMouseMove(event) {
    event.preventDefault();
    this.mouse = {
      x: (event.clientX / window.innerWidth) * 2 - 1,
      y: -(event.clientY / window.innerHeight) * 2 + 1,
    };
  }

  animate() {
    requestAnimationFrame(this.animate.bind(this));
    this.orbitControls.update();
    this.composer.render();
    this.stats.update();
  }
}

export default AbstractApplication;
