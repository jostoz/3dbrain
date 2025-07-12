import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

class SimpleBrainApp {
  constructor() {
    this.init()
  }

  init() {
    // Scene with dark background for better contrast
    this.scene = new THREE.Scene()
    this.scene.background = new THREE.Color(0x222222)  // Dark gray for contrast
    // this.scene.fog = new THREE.Fog(0xa7b6d2, 300, 1300)  // No fog for now

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

    // Create brain particles
    this.createBrainParticles()

    // Add lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 0.8)
    this.scene.add(ambientLight)

    // Start animation
    this.animate()
    this.hideLoading()
  }

  createBrainParticles() {
    console.log('Creating brain particles...')
    
    const particleCount = 2000
    const geometry = new THREE.BufferGeometry()
    
    const positions = new Float32Array(particleCount * 3)
    const colors = new Float32Array(particleCount * 3)
    
    // Create a simple sphere first to test
    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3
      
      // Simple sphere for testing
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(Math.random() * 2 - 1)
      const radius = 50 + Math.random() * 10  // Smaller radius, tighter distribution
      
      const x = radius * Math.sin(phi) * Math.cos(theta)
      const y = radius * Math.cos(phi)
      const z = radius * Math.sin(phi) * Math.sin(theta)
      
      positions[i3] = x
      positions[i3 + 1] = y
      positions[i3 + 2] = z
      
      // Bright white particles
      colors[i3] = 1.0
      colors[i3 + 1] = 1.0
      colors[i3 + 2] = 1.0
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    
    // Very visible material with bright color
    const material = new THREE.PointsMaterial({
      color: 0xffffff,    // Force white color
      size: 8,            // Even bigger
      vertexColors: false, // Don't use vertex colors for now
      transparent: false,
      sizeAttenuation: false,
      depthTest: false
    })
    
    this.particles = new THREE.Points(geometry, material)
    this.scene.add(this.particles)
    
    console.log('Brain particles created!')
    console.log('- Particle count:', particleCount)
    console.log('- Particle size:', 8)
    console.log('- Camera position:', this.camera.position)
    console.log('- Scene children count:', this.scene.children.length)
    console.log('- Particles object:', this.particles)
    console.log('- First few positions:', positions.slice(0, 9))
    
    // Add a large test sphere to verify positioning
    const testGeometry = new THREE.SphereGeometry(60, 16, 16)
    const testMaterial = new THREE.MeshBasicMaterial({ 
      color: 0xff0000, 
      wireframe: true,
      opacity: 0.3,
      transparent: true
    })
    const testSphere = new THREE.Mesh(testGeometry, testMaterial)
    this.scene.add(testSphere)
    console.log('Test wireframe sphere added')
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
new SimpleBrainApp()