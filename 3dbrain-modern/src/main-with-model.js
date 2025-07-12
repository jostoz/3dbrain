import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js'

class BrainAppWithModel {
  constructor() {
    this.brainModel = null
    this.particles = null
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
    document.getElementById('app').appendChild(this.renderer.domElement)

    // Controls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement)
    this.controls.enableDamping = true
    this.controls.dampingFactor = 0.05

    // Add lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 0.8)
    this.scene.add(ambientLight)

    // Load brain model
    this.loadBrainModel()

    // Start animation
    this.animate()
  }

  loadBrainModel() {
    const loader = new OBJLoader()
    
    console.log('Loading brain model...')
    
    loader.load(
      '/BrainUVs.obj',
      (object) => {
        console.log('Brain model loaded successfully!')
        this.brainModel = object
        this.createParticlesFromModel()
      },
      (progress) => {
        console.log('Loading progress:', (progress.loaded / progress.total * 100) + '%')
      },
      (error) => {
        console.error('Error loading brain model:', error)
        // Fallback to mathematical brain if model fails
        this.createFallbackBrain()
      }
    )
  }

  createParticlesFromModel() {
    console.log('Creating particles from brain model...')
    
    const allVertices = []
    
    // Extract vertices from all meshes in the model
    this.brainModel.traverse((child) => {
      if (child.isMesh && child.geometry) {
        console.log('Processing mesh:', child.name)
        
        const positions = child.geometry.attributes.position
        if (positions) {
          console.log('Found', positions.count, 'vertices in', child.name)
          
          for (let i = 0; i < positions.count; i++) {
            allVertices.push(
              positions.getX(i),
              positions.getY(i),
              positions.getZ(i)
            )
          }
        }
      }
    })
    
    console.log('Total vertices extracted:', allVertices.length / 3)
    
    if (allVertices.length === 0) {
      console.warn('No vertices found in model, using fallback')
      this.createFallbackBrain()
      return
    }
    
    // Create particle system from model vertices
    const geometry = new THREE.BufferGeometry()
    const colors = new Float32Array(allVertices.length) // Same length as positions
    
    // Set all particles to white with slight blue tint
    for (let i = 0; i < colors.length; i += 3) {
      colors[i] = 1.0     // R
      colors[i + 1] = 1.0 // G
      colors[i + 2] = 1.0 // B
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(allVertices), 3))
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    
    const material = new THREE.PointsMaterial({
      size: 2,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      sizeAttenuation: false
    })
    
    this.particles = new THREE.Points(geometry, material)
    this.scene.add(this.particles)
    
    console.log('Brain particles created from model!')
    this.hideLoading()
  }

  createFallbackBrain() {
    console.log('Creating fallback mathematical brain...')
    
    const particleCount = 3000
    const geometry = new THREE.BufferGeometry()
    
    const positions = new Float32Array(particleCount * 3)
    const colors = new Float32Array(particleCount * 3)
    
    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3
      
      // Simple brain shape - deformed sphere
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(Math.random() * 2 - 1)
      let radius = 40 + Math.random() * 20
      
      // Add brain-like bumps
      const bump = Math.sin(theta * 3) * Math.cos(phi * 2) * 8
      radius += bump
      
      const x = radius * Math.sin(phi) * Math.cos(theta)
      const y = radius * Math.cos(phi) * 0.8
      const z = radius * Math.sin(phi) * Math.sin(theta)
      
      positions[i3] = x
      positions[i3 + 1] = y
      positions[i3 + 2] = z
      
      // White particles
      colors[i3] = 1.0
      colors[i3 + 1] = 1.0
      colors[i3 + 2] = 1.0
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    
    const material = new THREE.PointsMaterial({
      size: 3,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      sizeAttenuation: false
    })
    
    this.particles = new THREE.Points(geometry, material)
    this.scene.add(this.particles)
    
    console.log('Fallback brain particles created!')
    this.hideLoading()
  }

  animate() {
    requestAnimationFrame(() => this.animate())
    
    this.controls.update()
    
    // Rotate particles slowly
    if (this.particles) {
      this.particles.rotation.y += 0.002
    }
    
    this.renderer.render(this.scene, this.camera)
  }

  hideLoading() {
    setTimeout(() => {
      document.getElementById('loading').style.display = 'none'
      document.getElementById('info').style.display = 'block'
    }, 1000)
  }
}

// Initialize
new BrainAppWithModel()