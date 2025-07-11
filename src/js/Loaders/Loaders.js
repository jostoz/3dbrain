import * as THREE from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';

class Loaders {
    constructor(startAnimation) {
        this.BRAIN_MODEL = {};
        this.brainXRayLight = {};
        this.FONT = {};
        this.assets = new Map();
        this.models = ['BrainUVs.obj'];
        this.loadingManager = new THREE.LoadingManager();
        this.startAnimation = startAnimation;
        this.loadingManager.onLoad = this.handlerLoad.bind(this);
        this.loadingManager.onProgress = this.handlerProgress;
        this.loadingManager.onError = this.handlerError;
        this.loadingManager.onStart = this.handlerStart;
        this.setModel = this.setModel.bind(this);
        this.loadBrainTextures();
        this.loadOBJs();
        this.loadTextures();
        this.loadFont();
        this.loadSceneBackground();
    }

    static handlerStart() {
        console.log('Starting');
    }
    static handlerProgress(url, itemsLoaded, itemsTotal) {
        console.log(`Loading file: ${url}.\nLoaded ${itemsLoaded} of ${itemsTotal} files.`);
    }
    handlerLoad() {
        console.log('loading Complete!');
        this.startAnimation();
    }
    static handlerError(url) {
        console.log(`There was an error loading ${url}`);
    }
    setModel(model, i) {
        switch (i) {
            case 0:
                this.BRAIN_MODEL = model;
                break;
            case 1:
                this.XRAY_MODEL = model;
                break;
            default:
                this.BRAIN_MODEL = model;
        }
    }

    loadOBJs() {
        const loader = new OBJLoader(this.loadingManager);
        this.models.forEach((m, i) => {
            const modelPath = `static/models/${m}`;
            console.log(`Loading model: ${modelPath}`);
            
            loader.load(
                modelPath, 
                (model) => {
                    console.log(`Model loaded successfully: ${modelPath}`);
                    console.log('Model structure:', model);
                    
                    let meshCount = 0;
                    let vertexCount = 0;
                    
                    model.traverse((child) => {
                        if (child instanceof THREE.Mesh) {
                            meshCount++;
                            const positions = child.geometry.attributes.position;
                            if (positions) {
                                vertexCount += positions.count;
                            }
                        }
                    });
                    
                    console.log(`Model stats - Meshes: ${meshCount}, Total vertices: ${vertexCount}`);
                    this.setModel(model, i);
                },
                (xhr) => {
                    console.log(`Loading progress: ${(xhr.loaded / xhr.total * 100).toFixed(2)}%`);
                },
                (error) => {
                    console.error(`Error loading model ${modelPath}:`, error);
                }
            );
        });
    }

    loadTextures() {
        const loader = new THREE.TextureLoader(this.loadingManager);
        loader.load('static/textures/spark1.png', (t) => {
            this.spark = t;
        });
    }

    loadBrainTextures() {
        const loader = new THREE.TextureLoader(this.loadingManager);
        loader.load('static/textures/brainXRayLight.png', (t) => {
            this.brainXRayLight = t;
        });
    }

    loadSceneBackground() {
        const cubeTextureLoader = new THREE.CubeTextureLoader(this.loadingManager);
        const path = 'static/textures/sky/';
        const format = '.png';
        const urls = [
            `${path}px${format}`, `${path}nx${format}`,
            `${path}py${format}`, `${path}ny${format}`,
            `${path}pz${format}`, `${path}nz${format}`,
        ];

        cubeTextureLoader.load(urls, (textureCube) => {
            this.assets.set('sky', textureCube);
        });
    }

    loadFont() {
        const fontLoader = new FontLoader(this.loadingManager);
        fontLoader.load('static/fonts/Roboto_Regular.json', (font) => {
            this.FONT = font;
        });
    }
}

export default Loaders;
