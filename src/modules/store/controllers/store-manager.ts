export class StoreManager {
    private static instance: StoreManager;

    private readonly stores: Map<string, unknown> = new Map<string, unknown>();

    private constructor() {
        // Singleton Instance
    }

    public static getInstance(): StoreManager {
        if (typeof this.instance === 'undefined') {
            this.instance = new StoreManager();
        }

        return this.instance;
    }

    public register(name: string, store: unknown): void {
        this.stores.set(name, store);
    }

    public resolve(name: string): unknown {
        if (!this.stores.has(name)) throw new Error("Requested service doesn't exists.");
        return this.stores.get(name);
    }
}
