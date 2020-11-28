export declare class StoreManager {
    private static instance;
    private readonly stores;
    private constructor();
    static getInstance(): StoreManager;
    register(name: string, store: unknown): void;
    resolve(name: string): unknown;
}
