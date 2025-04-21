export class EventEmitter {
    constructor() {
        this.events = {};
    }

    on(event, callback) {
        if (!this.events[event]) {
            this.events[event] = [];
        }
        this.events[event].push(callback);
    }

    emit(event, data) {
        const callbacks = this.events[event];
        if (callbacks) {
            callbacks.forEach(callback => callback(data));
        }
    }

    off(event, callback) {
        const callbacks = this.events[event];
        if (callbacks) {
            this.events[event] = callbacks.filter(cb => cb !== callback);
        }
    }
} 