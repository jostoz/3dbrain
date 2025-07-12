import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GUI } from 'lil-gui'
import { gsap } from 'gsap'
import { BrainVisualization } from './components/BrainVisualization.js'
import { ParticleSystem } from './components/ParticleSystem.js'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'

class ModernBrainApp {
  constructor() {
    this.scene = null
    this.camera = null
    this.renderer = null
    this.controls = null
    this.composer = null
    this.gui = null
    this.brainViz = null
    this.particleSystem = null
    this.stats = { fps: 0, frameCount: 0, lastTime: 0 }
    
    this.init()
  }

  init() {
    this.setupScene()
    this.setupCamera()
    this.setupRenderer()
    this.setupControls()
    this.setupPostProcessing()
    this.setupGUI()
    this.setupEventListeners()
    this.createBrainVisualization()
    this.animate()
    this.hideLoading()
  }

  setupScene() {
    this.scene = new THREE.Scene()
    // Original project colors - soft blue-grey atmosphere
    this.scene.background = new THREE.Color(0xa7b6d2)
    this.scene.fog = new THREE.Fog(0xa7b6d2, 300, 1300)
  }

  setupCamera() {
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      2000
    )
    // Start closer to see the brain better
    this.camera.position.set(0, 0, 150)
    console.log('Camera position set to:', this.camera.position)
  }

  setupRenderer() {
    this.renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    })
    this.renderer.setSize(window.innerWidth, window.innerHeight)
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    this.renderer.shadowMap.enabled = true
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping
    this.renderer.toneMappingExposure = 1.2
    
    document.getElementById('app').appendChild(this.renderer.domElement)
  }

  setupControls() {
    this.controls = new OrbitControls(this.camera, this.renderer.domElement)
    this.controls.enableDamping = true
    this.controls.dampingFactor = 0.05
    this.controls.minDistance = 50
    this.controls.maxDistance = 800
    this.controls.autoRotate = true
    this.controls.autoRotateSpeed = 0.5
  }

  setupPostProcessing() {
    this.composer = new EffectComposer(this.renderer)
    
    const renderPass = new RenderPass(this.scene, this.camera)
    this.composer.addPass(renderPass)
    
    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      1.2,  // strength
      0.8,  // radius
      0.3   // threshold
    )
    this.composer.addPass(bloomPass)
  }

  setupGUI() {
    this.gui = new GUI({ container: document.getElementById('controls') })
    this.gui.title('Brain Controls')
    
    const params = {
      autoRotate: true,
      particleSize: 2.0,
      particleCount: 5000,
      animationSpeed: 1.0,
      bloomStrength: 1.2,
      brainColor: '#ffffff',  // Original white particles
      backgroundColor: '#a7b6d2',  // Original blue-grey background
      resetCamera: () => this.resetCamera()
    }

    this.gui.add(params, 'autoRotate').onChange(value => {
      this.controls.autoRotate = value
    })

    this.gui.add(params, 'particleSize', 0.5, 5.0).onChange(value => {
      if (this.particleSystem) {
        this.particleSystem.setSize(value)
      }
    })

    this.gui.add(params, 'particleCount', 1000, 10000, 500).onChange(value => {
      if (this.particleSystem) {
        this.particleSystem.setParticleCount(value)
      }
    })

    this.gui.add(params, 'animationSpeed', 0.1, 3.0).onChange(value => {
      this.controls.autoRotateSpeed = value
    })

    this.gui.addColor(params, 'brainColor').onChange(value => {
      if (this.particleSystem) {
        this.particleSystem.setColor(value)
      }
    })

    this.gui.addColor(params, 'backgroundColor').onChange(value => {
      this.scene.background = new THREE.Color(value)
    })

    this.gui.add(params, 'resetCamera')
  }

  setupEventListeners() {
    window.addEventListener('resize', () => this.onWindowResize())
    
    // Keyboard controls
    window.addEventListener('keydown', (event) => {
      switch (event.code) {
        case 'Space':
          this.controls.autoRotate = !this.controls.autoRotate
          break
        case 'KeyR':
          this.resetCamera()
          break
      }
    })
  }

  createBrainVisualization() {
    console.log('Creating brain visualization...')
    
    // Create brain visualization
    this.brainViz = new BrainVisualization()
    this.scene.add(this.brainViz.group)
    console.log('Brain visualization added to scene')

    // Create particle system
    this.particleSystem = new ParticleSystem(5000)
    this.scene.add(this.particleSystem.points)
    console.log('Particle system added to scene, particle count:', this.particleSystem.particleCount)
    
    // Add a test cube to verify rendering works
    const testGeometry = new THREE.BoxGeometry(50, 50, 50)
    const testMaterial = new THREE.MeshBasicMaterial({ 
      color: 0xff0000, 
      wireframe: true,
      linewidth: 3
    })
    const testCube = new THREE.Mesh(testGeometry, testMaterial)
    testCube.position.set(0, 0, 0)
    this.scene.add(testCube)
    console.log('Large test cube added to scene at:', testCube.position)

    // Add ambient lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 0.3)
    this.scene.add(ambientLight)

    // Add point light with original cyan color
    const pointLight = new THREE.PointLight(0x00ffff, 1, 1000)
    pointLight.position.set(0, 100, 100)
    pointLight.castShadow = true
    this.scene.add(pointLight)

    // Animate intro
    this.animateIntro()
  }

  animateIntro() {
    // Camera intro animation
    gsap.from(this.camera.position, {
      duration: 3,
      z: 1000,
      ease: "power2.out"
    })

    // Particle system fade in
    if (this.particleSystem) {
      gsap.from(this.particleSystem.material, {
        duration: 2,
        opacity: 0,
        delay: 1,
        ease: "power2.out"
      })
    }
  }

  resetCamera() {
    gsap.to(this.camera.position, {
      duration: 1.5,
      x: 0,
      y: 0,
      z: 300,
      ease: "power2.inOut"
    })
    
    gsap.to(this.controls.target, {
      duration: 1.5,
      x: 0,
      y: 0,
      z: 0,
      ease: "power2.inOut"
    })
  }

  updateStats() {
    this.stats.frameCount++
    const now = performance.now()
    
    if (now - this.stats.lastTime >= 1000) {
      this.stats.fps = Math.round((this.stats.frameCount * 1000) / (now - this.stats.lastTime))
      this.stats.frameCount = 0
      this.stats.lastTime = now
      
      // Update UI
      document.getElementById('fps').textContent = this.stats.fps
      if (this.particleSystem) {
        document.getElementById('particle-count').textContent = this.particleSystem.particleCount
      }
    }
  }

  animate() {
    requestAnimationFrame(() => this.animate())
    
    this.controls.update()
    
    // Update particle system
    if (this.particleSystem) {
      this.particleSystem.update()
    }
    
    // Update brain visualization
    if (this.brainViz) {
      this.brainViz.update()
    }
    
    this.updateStats()
    
    // Debug: Log camera position occasionally
    if (Math.random() < 0.001) {
      console.log('Camera position:', this.camera.position)
      console.log('Camera looking at:', this.controls.target)
      console.log('Scene children count:', this.scene.children.length)
    }
    
    this.composer.render()
  }

  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight
    this.camera.updateProjectionMatrix()
    
    this.renderer.setSize(window.innerWidth, window.innerHeight)
    this.composer.setSize(window.innerWidth, window.innerHeight)
  }

  hideLoading() {
    setTimeout(() => {
      document.getElementById('loading').style.display = 'none'
      document.getElementById('info').style.display = 'block'
    }, 1500)
  }
}

// Initialize the application
new ModernBrainApp()