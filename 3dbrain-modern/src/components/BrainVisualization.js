import * as THREE from 'three'

export class BrainVisualization {
  constructor() {
    this.group = new THREE.Group()
    this.wireframeBrain = null
    this.neuralNetworks = []
    this.time = 0
    
    this.init()
  }

  init() {
    this.createWireframeBrain()
    this.createNeuralNetworks()
    this.createMemoryRegions()
  }

  createWireframeBrain() {
    // Create a brain-like wireframe structure
    const brainGeometry = new THREE.SphereGeometry(60, 32, 16)
    
    // Deform the sphere to look more brain-like
    const positions = brainGeometry.attributes.position.array
    for (let i = 0; i < positions.length; i += 3) {
      const x = positions[i]
      const y = positions[i + 1]
      const z = positions[i + 2]
      
      // Add brain cortex deformation
      const theta = Math.atan2(z, x)
      const phi = Math.acos(y / Math.sqrt(x*x + y*y + z*z))
      
      const deformation = 
        Math.sin(theta * 3) * Math.cos(phi * 2) * 8 +
        Math.sin(theta * 5) * Math.sin(phi * 4) * 5
      
      const length = Math.sqrt(x*x + y*y + z*z)
      const newLength = length + deformation
      
      positions[i] = (x / length) * newLength
      positions[i + 1] = (y / length) * newLength * 0.8 // Flatten
      positions[i + 2] = (z / length) * newLength
    }
    
    brainGeometry.attributes.position.needsUpdate = true
    brainGeometry.computeVertexNormals()
    
    const wireframeMaterial = new THREE.MeshBasicMaterial({
      color: 0x00ffff,  // Original cyan wireframe color
      wireframe: true,
      transparent: true,
      opacity: 0.6  // Match original opacity
    })
    
    this.wireframeBrain = new THREE.Mesh(brainGeometry, wireframeMaterial)
    this.group.add(this.wireframeBrain)
  }

  createNeuralNetworks() {
    // Create animated neural pathway lines
    const networkCount = 8
    
    for (let i = 0; i < networkCount; i++) {
      const network = this.createNeuralPath()
      this.neuralNetworks.push(network)
      this.group.add(network)
    }
  }

  createNeuralPath() {
    const points = []
    const pointCount = 20
    
    // Generate random path through brain
    for (let i = 0; i < pointCount; i++) {
      const t = i / (pointCount - 1)
      
      // Create curved path using bezier-like interpolation
      const angle1 = Math.random() * Math.PI * 2
      const angle2 = Math.random() * Math.PI
      const radius = 30 + Math.random() * 40
      
      const x = Math.cos(angle1) * Math.sin(angle2) * radius
      const y = (Math.cos(angle2) * radius - 20) * 0.8
      const z = Math.sin(angle1) * Math.sin(angle2) * radius
      
      points.push(new THREE.Vector3(x, y, z))
    }
    
    const curve = new THREE.CatmullRomCurve3(points)
    const tubeGeometry = new THREE.TubeGeometry(curve, 64, 0.5, 8, false)
    
    const tubeMaterial = new THREE.MeshBasicMaterial({
      color: new THREE.Color().setHSL(0.5 + Math.random() * 0.1, 0.7, 0.8), // Blue-cyan range like original
      transparent: true,
      opacity: 0.6
    })
    
    const tube = new THREE.Mesh(tubeGeometry, tubeMaterial)
    return tube
  }

  createMemoryRegions() {
    // Create glowing memory region spheres with original project color scheme
    const regions = [
      { name: 'Frontal Cortex', pos: [0, 30, 40], color: 0x00ffff },    // Cyan like original
      { name: 'Hippocampus', pos: [-25, -10, 0], color: 0x88ccff },      // Light blue
      { name: 'Amygdala', pos: [20, -15, -10], color: 0xaaeeff },        // Very light blue
      { name: 'Cerebellum', pos: [0, -40, -20], color: 0x66aaff },       // Medium blue
      { name: 'Temporal Lobe', pos: [-40, 0, 0], color: 0xccddff }       // Pale blue
    ]
    
    regions.forEach(region => {
      const geometry = new THREE.SphereGeometry(5, 16, 16)
      const material = new THREE.MeshBasicMaterial({
        color: region.color,
        transparent: true,
        opacity: 0.7
      })
      
      const sphere = new THREE.Mesh(geometry, material)
      sphere.position.set(...region.pos)
      sphere.userData = { name: region.name, originalScale: 1 }
      
      this.group.add(sphere)
      
      // Add glow effect
      const glowGeometry = new THREE.SphereGeometry(8, 16, 16)
      const glowMaterial = new THREE.MeshBasicMaterial({
        color: region.color,
        transparent: true,
        opacity: 0.2,
        side: THREE.BackSide
      })
      
      const glow = new THREE.Mesh(glowGeometry, glowMaterial)
      glow.position.copy(sphere.position)
      this.group.add(glow)
    })
  }

  update() {
    this.time += 0.01
    
    // Animate wireframe opacity
    if (this.wireframeBrain) {
      this.wireframeBrain.material.opacity = 0.1 + Math.sin(this.time * 2) * 0.1
    }
    
    // Animate neural networks
    this.neuralNetworks.forEach((network, index) => {
      const phase = this.time + index * 0.5
      network.material.opacity = 0.3 + Math.sin(phase) * 0.3
      network.rotation.z += 0.001
    })
    
    // Animate memory regions
    this.group.children.forEach(child => {
      if (child.userData.name) {
        const pulse = Math.sin(this.time * 3 + child.position.x * 0.1) * 0.2 + 1
        child.scale.setScalar(pulse)
      }
    })
    
    // Gentle group rotation
    this.group.rotation.y += 0.001
  }

  activateRegion(regionName) {
    // Highlight specific brain region
    this.group.children.forEach(child => {
      if (child.userData.name === regionName) {
        child.material.opacity = 1.0
        child.scale.setScalar(1.5)
      }
    })
  }

  resetRegions() {
    this.group.children.forEach(child => {
      if (child.userData.name) {
        child.material.opacity = 0.7
        child.scale.setScalar(1.0)
      }
    })
  }

  dispose() {
    this.group.children.forEach(child => {
      if (child.geometry) child.geometry.dispose()
      if (child.material) child.material.dispose()
    })
  }
}