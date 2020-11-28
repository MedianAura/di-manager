export declare function registerStores(options: RegisterStoresOption[], store: any): void;
export declare function registerStore(option: RegisterStoresOption, store: any): void;
export interface RegisterStoresOption {
    Module: any;
    name: string;
}
