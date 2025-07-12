/* eslint no-param-reassign: ["error", { "props": true, "ignorePropertyModificationsFor": ["data"] }] */
import * as THREE from 'three';

class ParticleSystem {
    constructor(mainBrain, brainParticles, memories) {
        console.log('ParticleSystem constructor called');
        this.brainParticles = brainParticles;
        this.memories = memories;
        this.mainBrain = mainBrain;
        this.particlesStartColor = new THREE.Color(0xffffff);
        this.particlesColor = new THREE.Color(0xffffff);

        const { xRayEffect, systemPoints } = this.init();
        this.particles = systemPoints;
        this.xRay = xRayEffect;

        console.log('ParticleSystem initialized successfully');
    }

    static getLoadingPoints() {
        const geometry = new THREE.RingBufferGeometry(100, 40, 150, 150, 20);
        return geometry.attributes.position.array;
    }

    init() {
        console.log('ParticleSystem init started');

        if (!this.brainParticles || !this.brainParticles.attributes || !this.brainParticles.attributes.position) {
            console.error('Invalid brain particles data');
            return { systemPoints: null, xRayEffect: null };
        }

        const brainPoints = this.brainParticles.attributes.position.array;
        console.log('Brain points count:', brainPoints.length / 3);

        const count = brainPoints.length / 3;

        // Use standard Three.js geometry
        const geometry = new THREE.BufferGeometry();

        // Create positions array
        const positions = [];
        for (let i = 0; i < count; i++) {
            positions.push(
                brainPoints[i * 3 + 0] || 0,
                brainPoints[i * 3 + 1] || 0,
                brainPoints[i * 3 + 2] || 0
            );
        }

        geometry.addAttribute('position', new THREE.Float32BufferAttribute(positions, 3));

        // Add colors
        const colors = [];
        for (let i = 0; i < count; i++) {
            colors.push(1.0, 1.0, 1.0); // White color
        }
        geometry.addAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

        // Create improved particle material
        const material = new THREE.PointsMaterial({
            color: 0xffffff,
            size: 1.5,
            vertexColors: THREE.VertexColors,
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthTest: true,
            sizeAttenuation: true
        });

        // Create particles system
        const systemPoints = new THREE.Points(geometry, material);
        console.log('Particle system created with', count, 'points');

        // Create enhanced x-ray effect (wireframe brain)
        const xRayMaterial = new THREE.MeshBasicMaterial({
            color: 0x00ffff,
            wireframe: true,
            transparent: true,
            opacity: 0.6
        });

        let xRayEffect = null;
        try {
            const xRayGeometry = new THREE.Geometry().fromBufferGeometry(this.mainBrain.endPointsCollections);
            xRayEffect = new THREE.Mesh(xRayGeometry, xRayMaterial);
            console.log('X-Ray effect created');
        } catch (error) {
            console.error('Error creating X-Ray effect:', error);
            // Create fallback wireframe cube
            const cubeGeometry = new THREE.BoxGeometry(50, 50, 50);
            xRayEffect = new THREE.Mesh(cubeGeometry, xRayMaterial);
            console.log('Fallback X-Ray cube created');
        }

        return { systemPoints, xRayEffect };
    }

    update(deltaTime, camera, brain) {
        // Simple update - just rotate particles slowly
        if (this.particles) {
            this.particles.rotation.y += 0.001;
        }
        if (this.xRay) {
            this.xRay.rotation.y += 0.002;
        }
    }

    isXRayActive(status) {
        if (this.xRay) {
            this.xRay.visible = status;
        }
        console.log('X-Ray active:', status);
    }

    updateTransitioning(progress) {
        // Simple transition effect
        if (this.particles && this.particles.material) {
            this.particles.material.opacity = progress;
        }
    }

    transform(status) {
        console.log('Transform called:', status);
        // Simple transform - show/hide particles
        if (this.particles) {
            this.particles.visible = status;
        }
    }
}

export default ParticleSystem;
