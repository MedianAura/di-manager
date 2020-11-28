"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StoreManager = void 0;
class StoreManager {
    constructor() {
        this.stores = new Map();
        // Singleton Instance
    }
    static getInstance() {
        if (typeof this.instance === 'undefined') {
            this.instance = new StoreManager();
        }
        return this.instance;
    }
    register(name, store) {
        this.stores.set(name, store);
    }
    resolve(name) {
        if (!this.stores.has(name))
            throw new Error("Requested service doesn't exists.");
        return this.stores.get(name);
    }
}
exports.StoreManager = StoreManager;
