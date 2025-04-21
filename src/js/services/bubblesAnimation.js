/* eslint no-param-reassign: ["error", { "props": true, "ignorePropertyModificationsFor": ["bubbles"] }] */
import * as THREE from 'three';
import { gsap, Power1 } from 'gsap';
import _ from 'lodash';
import glowVertex from '../shaders/glow.vert';
import glowFrag from '../shaders/glow.frag';
import memoryMapping from '../data/memoryMaping.json';
import testPayload from '../data/testPayload.json';
import { TransitionState } from './BrainStateManager';

class BubblesAnimation {
    constructor(mainBrain) {
        this.mainBrain = mainBrain;
        this.stateManager = mainBrain.stateManager;
        this.isFlashing = false;
        this.memorySelected = mainBrain.memorySelected;
        this.isBubblesInserted = false;
        this.winner = '';
        this.winnerGroup = '';
        this.fistCameraReposition = false;
    }

    /**
     * memories //Array of 3 positions x y z
     * @param bubbles
     * @returns {Array} of 4 positions x y z w when 'w' is the selector bubble 2.0 = memory and 3.0 = winner
     */
    getBubblesSelected(bubbles, subsystem) {
        const { memories } = this.mainBrain;
        const bubbleList = [];
        const { winner, winnerGroup, subsystemResults } = subsystem;

        // Update Winner to use in Update animation
        this.winner = winner;
        this.winnerGroup = winnerGroup;

        for (const m of subsystemResults) {
            const memoryGroup = BubblesAnimation.getSubsystemGroup(m.subsystem) || 'episodic';
            const memory = memories[memoryGroup][0].attributes.position.array;
            const randomPos = THREE.MathUtils.randInt(3 * 1500, (memory.length / 3) - 4);

            const x = memory[(randomPos * 3) + 0] || 0;
            const y = memory[(randomPos * 3) + 1] || 0;
            const z = memory[(randomPos * 3) + 2] || 0;
            let altitude = THREE.MathUtils.randInt(120, 150);
            const parent = this.mainBrain.particlesSystem.particles;

            if (winner === m.subsystem) {
                altitude = 200; // highest position
                const geometry = new THREE.SphereGeometry(2, 32, 32);
                const material = new THREE.MeshNormalMaterial();
                const mesh = new THREE.Mesh(geometry, material);
                parent.add(mesh);
                mesh.position.set(x, y, z);
                bubbleList.push(x, y + 150.0, z, 3.0); // w = 3.0 for the winner
            }
            const group = new THREE.Object3D();
            parent.add(group);
        }

        // Inject bubbles selected in to the all flashing bubbles replace the older one
        let memoryPos = 0;
        if (this.isBubblesInserted) {
            for (let i = 0; i < bubbles.length / 4; i += 1) {
                const w = bubbles[(i * 4) + 3] || 0;
                if (w === 2.0 || w === 3.0) {
                    if (memoryPos < bubbleList.length / 4) {
                        bubbles[(i * 4) + 0] = bubbleList[(memoryPos * 4) + 0];
                        bubbles[(i * 4) + 1] = bubbleList[(memoryPos * 4) + 1];
                        bubbles[(i * 4) + 2] = bubbleList[(memoryPos * 4) + 2];
                        memoryPos += 1;
                    }
                }
            }
        } else {
            for (let i = 0; i < bubbleList.length / 4; i += 1) {
                bubbles[(i * 4) + 0] = bubbleList[(memoryPos * 4) + 0];
                bubbles[(i * 4) + 1] = bubbleList[(memoryPos * 4) + 1];
                bubbles[(i * 4) + 2] = bubbleList[(memoryPos * 4) + 2];
                bubbles[(i * 4) + 3] = bubbleList[(memoryPos * 4) + 3];
                memoryPos += 1;
            }
            this.isBubblesInserted = true;
        }
        return bubbleList;
    }

    isWinnerActive(status) {
        if (status) {
            for (let i = 0; i < this.mainBrain.memorySelected.length; i += 1) {
                if (this.mainBrain.memorySelected[i] === this.winnerGroup) {
                    gsap.to(this.bubbles.material.uniforms.uWinnerAlpha, {
                        value: 1,
                        duration: 2.5,
                        ease: "power1.inOut",
                        onStart: () => {
                            this.bubbles.material.uniforms.uWinnerSelected.value = i;
                            this.bubbles.material.uniforms.isWinnerActive.value = true;
                        }
                    });
                }
            }
        } else {
            gsap.to(this.bubbles.material.uniforms.uWinnerAlpha, {
                value: 0,
                duration: 2.5,
                ease: "power1.inOut",
                onComplete: () => {
                    this.bubbles.material.uniforms.isWinnerActive.value = false;
                    this.bubbles.material.uniforms.uWinnerSelected.value = 0.0;
                }
            });
        }
    }


    initAnimation() {
        const { scene, camera, memories } = this.mainBrain;

        const particles = 100000;
        const geometry = new THREE.BufferGeometry();
        const sizes = [];
        const positions = [];
        const colors = [];
        const delay = [];
        const duration = 2.5;
        const maxPointDelay = 1.5;
        const bubbles = [];
        const memory = [];

        // Add fake shining bubbles
        for (let i = 0; i < particles - (this.memorySelected.length * 3); i += 1) {
            const r = THREE.MathUtils.randInt(0, 4);
            const mSelector = this.memorySelected[r];
            const x = memories[mSelector][0].attributes.position.array[(i * 3) + 0] || 0;
            const y = memories[mSelector][0].attributes.position.array[(i * 3) + 1] || 0;
            const z = memories[mSelector][0].attributes.position.array[(i * 3) + 2] || 0;

            positions.push(x, y, z);
            memory.push(x, y, z, r);

            sizes[i] = THREE.MathUtils.randFloat(10.0, 20.0);
            if ((i % 100) === 0) {
                const altitude = THREE.MathUtils.randInt(100, 250) + y;
                bubbles.push(x, altitude, z, 1.0);
            } else {
                bubbles.push(x, y, z, 0.0);
            }

            delay[(i * 2) + 0] = THREE.MathUtils.randFloat(0.5, maxPointDelay);
            delay[(i * 2) + 1] = duration;
        }

        geometry.setAttribute('aDelayDuration', new THREE.Float32BufferAttribute(delay, 2));
        geometry.setAttribute('bubbles', new THREE.Float32BufferAttribute(bubbles, 4));
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
        geometry.setAttribute('size', new THREE.Float32BufferAttribute(sizes, 1));
        geometry.setAttribute('aMemory', new THREE.Float32BufferAttribute(memory, 4));
        geometry.computeBoundingSphere();
        const customMaterial = new THREE.ShaderMaterial({
            uniforms:
                    {
                        c: { type: 'f', value: 0.9 }, // Control the dynamically intensity.. Disabled
                        p: { type: 'f', value: 2.8 }, // Control the dynamically intensity.. Disabled
                        glowColor: { type: 'c', value: new THREE.Color(0x2C3E93) },
                        viewVector: { type: 'v3', value: camera.position }, // To make intensity dynamically.. Disabled
                        uTime: { type: 'f', value: 0.0 },
                        uSlowTime: { type: 'f', value: 0.0 }, // Slow time to make some particles blinking slowly
                        uBubblesUp: { type: 'f', value: 0.0 }, // Start the animation bubbling up
                        uIsFlashing: { type: 'b', value: false }, // Make the whole brain flashing
                        isWinnerActive: { type: 'b', value: false }, // Active the winner section of the brain
                        uWinnerSelected: { type: 'f', value: 0.0 }, // activate section of the brain from 0 - 4 ['analytic', 'episodic', 'process', 'semantic', 'affective'];
                        uWinnerAlpha: { type: 'f', value: 0.0 }, // smooth transition
                        uFlashingAlpha: { type: 'f', value: 0.0 }, // Smooth fade out and fade in to activate or deactivate
                        uMouse: { type: 'f', value: new THREE.Vector2(0.0) },
                    },
            vertexShader: glowVertex,
            fragmentShader: glowFrag,
            flatShading: THREE.SmoothShading,
            blending: THREE.AdditiveBlending,
            side: THREE.DoubleSide,
            depthTest: false,
            vertexColors: false,
            transparent: true,

        });
        this.bubbles = new THREE.Points(geometry, customMaterial);
        this.bubbles.name = 'memory';
        scene.add(this.bubbles);
        console.log('Bubble Object', this.bubbles);
    }

    updateSubSystem(subsystemPayload) {
        const payload = BubblesAnimation.processSubsystemResponses(subsystemPayload);
        this.mainBrain.thinkingAnimation.isActive(true);
        this.bubbles.geometry.attributes.bubbles.needsUpdate = false;

        // Actualizar estado de memoria
        if (payload.winner) {
            this.stateManager.updateState('memory', {
                selected: payload.winner
            });
        }

        this.isWinnerActive(false);
        this.mainBrain.font.removeText();

        // Iniciar transición
        this.stateManager.startTransition(
            null,
            payload.winner,
            TransitionState.ZOOM_IN,
            2500
        );

        gsap.to(this.bubbles.material.uniforms.uBubblesUp, {
            value: 0,
            duration: 2.5,
            ease: "power1.inOut",
            onStart: () => {
                if (this.fistCameraReposition) {
                    this.animate(false);
                }
            },
            onComplete: () => {
                const bubblesAttr = this.bubbles.geometry.attributes.bubbles.array;
                this.getBubblesSelected(bubblesAttr, payload);
                this.bubbles.geometry.attributes.bubbles.needsUpdate = true;
                this.animate(true);
                this.mainBrain.thinkingAnimation.isActive(false);
                this.fistCameraReposition = true;
            }
        });
    }

    static processSubsystemResponses(memoryNumber = 0) {
        const response = testPayload[memoryNumber]?.attributes || { subsystemResults: [] };
        const winner = response.winningSubsystem;
        const { subsystemResults } = response;
        const winnerGroup = BubblesAnimation.getSubsystemGroup(winner);
        return { winner, winnerGroup, subsystemResults };
    }

    static getSubsystemGroup(subsystem) {
        const map = _.head(_.filter(memoryMapping, { id: subsystem }));
        if (_.has(map, 'group')) {
            return map.group;
        }
        return undefined;
    }

    update(camera) {
        this.bubbles.material.uniforms.viewVector.value =
          new THREE.Vector3().subVectors(camera.position, this.bubbles.position);
        this.bubbles.material.uniforms.uTime.value += 1 / 20;
        this.bubbles.material.uniforms.uSlowTime.value += (1 / 400);
    }
    updateBurbleUp(val) {
        this.bubbles.material.uniforms.uBubblesUp.value = val;
    }
    updateMouse(coordinates) {
        this.bubbles.material.uniforms.uMouse.value = coordinates;
    }

    flashingAnimation(isActive) {
        this.bubbles.material.uniforms.uIsFlashing.value = isActive;
        this.mainBrain.thinkingAnimation.isActive(false);

        if (isActive) {
            gsap.to(this.bubbles.material.uniforms.uFlashingAlpha, {
                value: 1,
                duration: 2.5,
                ease: "power1.inOut",
                onStart: () => {
                    this.isFlashing = true;
                }
            });
        } else {
            gsap.to(this.bubbles.material.uniforms.uFlashingAlpha, {
                value: 0,
                duration: 2.5,
                ease: "power1.inOut",
                onComplete: () => {
                    this.isFlashing = false;
                }
            });
        }
    }

    animate(isActive) {
        const cameraPos = this.mainBrain.camera.position;
        const { target } = this.mainBrain.orbitControls;
        
        if (!this.isFlashing) {
            this.flashingAnimation(true);
        }
        
        if (isActive) {
            gsap.to(this.bubbles.material.uniforms.uBubblesUp, {
                value: 1,
                duration: 2.5,
                ease: "power1.inOut"
            });

            gsap.to([this.mainBrain.orbitControls.target, this.mainBrain.camera.position], {
                y: "+=0.5",
                duration: 2.5,
                ease: "power1.inOut",
                onComplete: () => this.isWinnerActive(true)
            });
        } else {
            gsap.to(this.bubbles.material.uniforms.uBubblesUp, {
                value: 0,
                duration: 2.5,
                ease: "power1.inOut"
            });

            gsap.to([this.mainBrain.orbitControls.target, this.mainBrain.camera.position], {
                y: "-=0.5",
                duration: 2.5,
                ease: "power1.inOut",
                onStart: () => this.isWinnerActive(false)
            });
        }
    }
}

export default BubblesAnimation;
