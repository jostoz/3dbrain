import { EventEmitter } from 'events';

// Enums para los diferentes estados
export const BrainState = {
    IDLE: 'IDLE',
    LOADING: 'LOADING',
    READY: 'READY',
    TRANSITIONING: 'TRANSITIONING',
    ERROR: 'ERROR'
};

export const MemoryState = {
    INACTIVE: 'INACTIVE',
    ACTIVE: 'ACTIVE',
    SELECTED: 'SELECTED',
    TRANSITIONING: 'TRANSITIONING',
    HIGHLIGHTED: 'HIGHLIGHTED'
};

export const TransitionState = {
    NONE: 'NONE',
    ZOOM_IN: 'ZOOM_IN',
    ZOOM_OUT: 'ZOOM_OUT',
    FADE_IN: 'FADE_IN',
    FADE_OUT: 'FADE_OUT',
    PORTAL: 'PORTAL'
};

export const InteractionState = {
    NONE: 'NONE',
    HOVERING: 'HOVERING',
    CLICKING: 'CLICKING',
    DRAGGING: 'DRAGGING'
};

export class BrainStateManager extends EventEmitter {
    constructor() {
        super();
        
        this.state = {
            brain: {
                current: BrainState.IDLE,
                previous: null,
                timestamp: Date.now()
            },
            memory: {
                active: new Map(),
                selected: null,
                highlighted: null,
                history: []
            },
            transition: {
                active: false,
                type: TransitionState.NONE,
                progress: 0,
                source: null,
                target: null,
                startTime: null,
                duration: 0
            },
            interaction: {
                current: InteractionState.NONE,
                target: null,
                position: { x: 0, y: 0, z: 0 },
                startTime: null
            },
            camera: {
                position: { x: 0, y: 0, z: 0 },
                target: { x: 0, y: 0, z: 0 },
                zoom: 1
            }
        };

        this.mainBrain = null;
    }

    attachToMainBrain(mainBrain) {
        this.mainBrain = mainBrain;
        this.on('stateChange', this.handleStateChange.bind(this));
    }

    updateState(stateType, newState, metadata = {}) {
        const previousState = { ...this.state[stateType] };
        
        this.state[stateType] = {
            ...this.state[stateType],
            ...newState,
            timestamp: Date.now()
        };

        this.emit('stateChange', {
            type: stateType,
            previous: previousState,
            current: this.state[stateType],
            metadata
        });

        return true;
    }

    handleStateChange({ type, previous, current, metadata }) {
        switch (type) {
            case 'brain':
                this.updateBrainVisualization(current);
                break;
            case 'memory':
                this.updateMemoryVisualization(current, previous);
                break;
            case 'transition':
                this.updateTransitionEffects(current);
                break;
            case 'interaction':
                this.updateInteractionFeedback(current);
                break;
        }
    }

    updateBrainVisualization(brainState) {
        if (!this.mainBrain?.bubblesAnimation) return;

        switch (brainState.current) {
            case BrainState.TRANSITIONING:
                this.mainBrain.bubblesAnimation.flashingAnimation(true);
                break;
            case BrainState.READY:
                this.mainBrain.bubblesAnimation.flashingAnimation(false);
                break;
        }
    }

    updateMemoryVisualization(currentMemory, previousMemory) {
        if (!this.mainBrain?.bubblesAnimation?.bubbles) return;

        const bubbles = this.mainBrain.bubblesAnimation.bubbles;
        
        if (currentMemory.selected) {
            bubbles.material.uniforms.isWinnerActive.value = true;
            bubbles.material.uniforms.uWinnerAlpha.value = 1.0;
        } else {
            bubbles.material.uniforms.isWinnerActive.value = false;
            bubbles.material.uniforms.uWinnerAlpha.value = 0.0;
        }
    }

    updateTransitionEffects(transitionState) {
        if (!transitionState.active || !this.mainBrain?.bubblesAnimation?.bubbles) return;

        const bubbles = this.mainBrain.bubblesAnimation.bubbles;
        bubbles.material.uniforms.uTransitionProgress.value = transitionState.progress;
    }

    updateInteractionFeedback(interactionState) {
        // Implementar según necesidades
    }

    startTransition(source, target, type, duration = 2500) {
        return this.updateState('transition', {
            active: true,
            type,
            source,
            target,
            startTime: Date.now(),
            duration,
            progress: 0
        });
    }

    getTransitionProgress() {
        if (!this.state.transition.active) return 0;
        
        const elapsed = Date.now() - this.state.transition.startTime;
        return Math.min(elapsed / this.state.transition.duration, 1);
    }

    updateTransitionProgress() {
        if (!this.state.transition.active) return;

        const progress = this.getTransitionProgress();
        this.updateState('transition', { progress });

        if (progress >= 1) {
            this.completeTransition();
        }
    }

    completeTransition() {
        const { target } = this.state.transition;
        
        this.updateState('transition', {
            active: false,
            type: TransitionState.NONE,
            progress: 0,
            source: null,
            target: null,
            startTime: null,
            duration: 0
        });

        if (target) {
            this.updateState('memory', {
                selected: target,
                history: [...this.state.memory.history, target]
            });
        }
    }
} 