import * as THREE from 'three'
import 'three/examples/js/controls/OrbitControls'

class AbstractApplication {
  constructor () {
    this._camera = new THREE.PerspectiveCamera(54, window.innerWidth / window.innerHeight, 1, 1000)
    this._camera.position.z = 500

    this._scene = new THREE.Scene()
    this._scene.background = new THREE.Color('#CED7DF')
    this._scene.fog = new THREE.Fog(0xcce0ff, 500, 10000)

    this._renderer = new THREE.WebGLRenderer({ antialias: true })
    this._renderer.setPixelRatio(window.devicePixelRatio)
    this._renderer.setSize(window.innerWidth, window.innerHeight)

    this._renderer.shadowMap.enabled = true
    this._renderer.shadowMap.type = THREE.PCFSoftShadowMap
    this._renderer.gammaInput = true
    this._renderer.gammaOutput = true

    document.body.appendChild(this._renderer.domElement)

    this._controls = new THREE.OrbitControls(this._camera, this._renderer.domElement)
    // this._controls.addEventListener( 'change', render ) // add this only if there is no animation loop (requestAnimationFrame)
    this._controls.enableDamping = true
    this._controls.dampingFactor = 0.25
    this._controls.enableZoom = true

    window.addEventListener('resize', this.onWindowResize.bind(this), false)
  }

  get renderer () {
    return this._renderer
  }

  get camera () {
    return this._camera
  }

  get scene () {
    return this._scene
  }

  onWindowResize () {
    this._camera.aspect = window.innerWidth / window.innerHeight
    this._camera.updateProjectionMatrix()

    this._renderer.setSize(window.innerWidth, window.innerHeight)
  }

  animate (timestamp) {
    requestAnimationFrame(this.animate.bind(this))
    this._renderer.render(this._scene, this._camera)
  }
}

export default AbstractApplication
