import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'

class EnhancedBrainApp {
  constructor() {
    this.brainModel = null
    this.particles = null
    this.wireframeBrain = null
    this.composer = null
    this.init()
  }

  init() {
    // Scene
    this.scene = new THREE.Scene()
    this.scene.background = new THREE.Color(0xa7b6d2)
    this.scene.fog = new THREE.Fog(0xa7b6d2, 300, 1300)

    // Camera
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000)
    this.camera.position.set(0, 0, 200)

    // Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true })
    this.renderer.setSize(window.innerWidth, window.innerHeight)
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping
    this.renderer.toneMappingExposure = 1.2
    document.getElementById('app').appendChild(this.renderer.domElement)

    // Post-processing - Recreating original bloom effect
    this.setupPostProcessing()

    // Controls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement)
    this.controls.enableDamping = true
    this.controls.dampingFactor = 0.05
    this.controls.autoRotate = true
    this.controls.autoRotateSpeed = 0.5

    // Add lighting (minimal - particles will glow from bloom)
    const ambientLight = new THREE.AmbientLight(0x404040, 0.3)
    this.scene.add(ambientLight)

    // Load brain model
    this.loadBrainModel()

    // Start animation
    this.animate()
  }

  setupPostProcessing() {
    // Original project bloom settings recreation
    this.composer = new EffectComposer(this.renderer)
    
    const renderPass = new RenderPass(this.scene, this.camera)
    this.composer.addPass(renderPass)
    
    // Recreate original BloomPass settings with UnrealBloomPass
    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      2.3,  // intensity (original: 2.3)
      0.8,  // radius (approximation of original resolution: 2.9)
      0.1   // threshold (low threshold for bloom effect)
    )
    
    this.composer.addPass(bloomPass)
    console.log('Post-processing setup with bloom effects')
  }

  loadBrainModel() {
    const loader = new OBJLoader()
    
    console.log('Loading brain model...')
    
    loader.load(
      '/BrainUVs.obj',
      (object) => {
        console.log('Brain model loaded successfully!')
        this.brainModel = object
        this.createEnhancedVisualization()
      },
      (progress) => {
        console.log('Loading progress:', (progress.loaded / progress.total * 100) + '%')
      },
      (error) => {
        console.error('Error loading brain model:', error)
        this.createFallbackBrain()
      }
    )
  }

  createEnhancedVisualization() {
    console.log('Creating enhanced brain visualization...')
    
    const allVertices = []
    let mergedGeometry = new THREE.BufferGeometry()
    
    // Extract vertices and merge geometries like original
    this.brainModel.traverse((child) => {
      if (child.isMesh && child.geometry) {
        console.log('Processing mesh:', child.name)
        
        const positions = child.geometry.attributes.position
        if (positions) {
          console.log('Found', positions.count, 'vertices in', child.name)
          
          // Collect vertices for particles
          for (let i = 0; i < positions.count; i++) {
            allVertices.push(
              positions.getX(i),
              positions.getY(i), 
              positions.getZ(i)
            )
          }
          
          // Merge geometry for wireframe (like original BufferGeometryUtils.mergeBufferGeometries)
          if (!mergedGeometry.attributes.position) {
            mergedGeometry = child.geometry.clone()
          }
        }
      }
    })
    
    // Create particle system with original settings
    this.createParticleSystem(allVertices)
    
    // Create X-Ray wireframe effect like original
    this.createWireframeEffect(mergedGeometry)
    
    console.log('Enhanced brain visualization created!')
    this.hideLoading()
  }

  createParticleSystem(vertices) {
    const geometry = new THREE.BufferGeometry()
    const colors = new Float32Array(vertices.length) // Same length as positions
    
    // Original white color for all particles
    for (let i = 0; i < colors.length; i += 3) {
      colors[i] = 1.0     // R
      colors[i + 1] = 1.0 // G  
      colors[i + 2] = 1.0 // B
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(vertices), 3))
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    
    // Recreate original particle material settings exactly
    const material = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 1.5,                    // Original size
      vertexColors: true,           // Original: THREE.VertexColors
      transparent: true,
      blending: THREE.AdditiveBlending,  // KEY: Original additive blending
      depthTest: true,              // Original setting
      sizeAttenuation: true         // Original setting
    })
    
    this.particles = new THREE.Points(geometry, material)
    this.scene.add(this.particles)
    
    console.log('Particle system created with original settings, vertex count:', vertices.length / 3)
  }

  createWireframeEffect(geometry) {
    // Recreate original X-Ray wireframe effect
    const xRayMaterial = new THREE.MeshBasicMaterial({
      color: 0x00ffff,    // Original cyan color
      wireframe: true,
      transparent: true,
      opacity: 0.6        // Original opacity
    })
    
    this.wireframeBrain = new THREE.Mesh(geometry, xRayMaterial)
    this.scene.add(this.wireframeBrain)
    
    console.log('X-Ray wireframe effect created')
  }

  createFallbackBrain() {
    console.log('Creating fallback brain...')
    // Simplified fallback if model fails to load
    const particleCount = 3000
    const geometry = new THREE.BufferGeometry()
    
    const positions = new Float32Array(particleCount * 3)
    const colors = new Float32Array(particleCount * 3)
    
    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(Math.random() * 2 - 1)
      let radius = 40 + Math.random() * 20
      
      positions[i3] = radius * Math.sin(phi) * Math.cos(theta)
      positions[i3 + 1] = radius * Math.cos(phi) * 0.8
      positions[i3 + 2] = radius * Math.sin(phi) * Math.sin(theta)
      
      colors[i3] = colors[i3 + 1] = colors[i3 + 2] = 1.0
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    
    const material = new THREE.PointsMaterial({
      size: 1.5,
      vertexColors: true,
      transparent: true,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true
    })
    
    this.particles = new THREE.Points(geometry, material)
    this.scene.add(this.particles)
    this.hideLoading()
  }

  animate() {
    requestAnimationFrame(() => this.animate())
    
    this.controls.update()
    
    // Gentle rotation like original
    if (this.particles) {
      this.particles.rotation.y += 0.001
    }
    
    if (this.wireframeBrain) {
      this.wireframeBrain.rotation.y += 0.002
    }
    
    // Use composer for post-processing effects
    this.composer.render()
  }

  hideLoading() {
    setTimeout(() => {
      document.getElementById('loading').style.display = 'none'
      document.getElementById('info').style.display = 'block'
    }, 1000)
  }

  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight
    this.camera.updateProjectionMatrix()
    this.renderer.setSize(window.innerWidth, window.innerHeight)
    this.composer.setSize(window.innerWidth, window.innerHeight)
  }
}

// Initialize
const app = new EnhancedBrainApp()

// Handle window resize
window.addEventListener('resize', () => app.onWindowResize())