import * as THREE from 'three'

export class ParticleSystem {
  constructor(particleCount = 5000) {
    this.particleCount = particleCount
    this.geometry = null
    this.material = null
    this.points = null
    this.time = 0
    
    this.init()
  }

  init() {
    console.log('ParticleSystem init started with', this.particleCount, 'particles')
    this.createGeometry()
    this.createMaterial()
    this.createPoints()
    console.log('ParticleSystem initialized successfully')
  }

  createGeometry() {
    this.geometry = new THREE.BufferGeometry()
    
    const positions = new Float32Array(this.particleCount * 3)
    const colors = new Float32Array(this.particleCount * 3)
    const sizes = new Float32Array(this.particleCount)
    
    // Create brain-like shape using mathematical functions
    for (let i = 0; i < this.particleCount; i++) {
      const i3 = i * 3
      
      // Generate brain-like structure using spherical coordinates with deformation
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(Math.random() * 2 - 1)
      
      // Base sphere radius with brain-like deformation
      let radius = 50 + Math.random() * 30
      
      // Add brain cortex-like bumps
      const cortexNoise = 
        Math.sin(theta * 3) * Math.cos(phi * 2) * 8 +
        Math.sin(theta * 5) * Math.sin(phi * 4) * 5 +
        Math.cos(theta * 7) * Math.cos(phi * 6) * 3
      
      radius += cortexNoise
      
      // Convert to cartesian coordinates
      const x = radius * Math.sin(phi) * Math.cos(theta)
      const y = radius * Math.cos(phi) * 0.8 // Flatten slightly
      const z = radius * Math.sin(phi) * Math.sin(theta)
      
      positions[i3] = x
      positions[i3 + 1] = y
      positions[i3 + 2] = z
      
      // Original project style - predominantly white particles with subtle variations
      const color = new THREE.Color()
      // Base white color with very subtle blue tinting like original
      const whiteVariation = 0.9 + Math.random() * 0.1
      const blueShift = 0.05 + Math.random() * 0.05
      color.setRGB(
        whiteVariation, 
        whiteVariation, 
        Math.min(1.0, whiteVariation + blueShift)
      )
      
      colors[i3] = color.r
      colors[i3 + 1] = color.g
      colors[i3 + 2] = color.b
      
      // Varying particle sizes
      sizes[i] = 0.5 + Math.random() * 2.0
    }
    
    this.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    this.geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    this.geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1))
    
    console.log('Geometry created with', this.particleCount, 'particles')
    // Calculate actual ranges for each axis
    const xValues = []
    const yValues = []
    const zValues = []
    
    for (let i = 0; i < positions.length; i += 3) {
      xValues.push(positions[i])
      yValues.push(positions[i + 1])
      zValues.push(positions[i + 2])
    }
    
    console.log('Position ranges:', {
      x: [Math.min(...xValues), Math.max(...xValues)],
      y: [Math.min(...yValues), Math.max(...yValues)],
      z: [Math.min(...zValues), Math.max(...zValues)]
    })
    
    console.log('First 10 particles positions:')
    for (let i = 0; i < 30; i += 3) {
      console.log(`Particle ${i/3}: (${positions[i].toFixed(2)}, ${positions[i+1].toFixed(2)}, ${positions[i+2].toFixed(2)})`)
    }
  }

  createMaterial() {
    // Simplified material for better visibility
    this.material = new THREE.PointsMaterial({
      size: 5.0,  // Mucho más grande
      vertexColors: true,
      transparent: false,  // Sin transparencia por ahora
      opacity: 1.0,  // Completamente opaco
      // blending: THREE.AdditiveBlending,  // Sin blending por ahora
      depthWrite: true,  // Con depth write
      sizeAttenuation: false  // Tamaño constante
    })
    
    console.log('Material created:', this.material)
  }

  createPoints() {
    this.points = new THREE.Points(this.geometry, this.material)
    console.log('Points object created:', this.points)
    console.log('Points position:', this.points.position)
    console.log('Points visible:', this.points.visible)
  }

  update() {
    this.time += 0.01
    
    // Gentle rotation
    this.points.rotation.y += 0.002
    
    // Breathing effect
    const breathe = Math.sin(this.time * 0.5) * 0.1 + 1.0
    this.points.scale.setScalar(breathe)
  }

  setSize(size) {
    this.material.size = size
  }

  setColor(colorHex) {
    const color = new THREE.Color(colorHex)
    const colors = this.geometry.attributes.color.array
    
    for (let i = 0; i < colors.length; i += 3) {
      const factor = 0.7 + Math.random() * 0.3
      colors[i] = color.r * factor
      colors[i + 1] = color.g * factor
      colors[i + 2] = color.b * factor
    }
    
    this.geometry.attributes.color.needsUpdate = true
  }

  setParticleCount(count) {
    this.particleCount = count
    this.geometry.dispose()
    this.createGeometry()
    this.points.geometry = this.geometry
  }

  dispose() {
    if (this.geometry) this.geometry.dispose()
    if (this.material) this.material.dispose()
  }
}