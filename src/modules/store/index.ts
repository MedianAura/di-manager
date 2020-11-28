import { StoreManager } from './controllers/store-manager';

export function registerStores(options: RegisterStoresOption[], store: any) {
    options.forEach((option) => {
        registerStore(option, store);
    });
}

export function registerStore(option: RegisterStoresOption, store: any) {
    StoreManager.getInstance().register(option.name, new option.Module({ name: option.name, store }));
}

export interface RegisterStoresOption {
    Module: any;
    name: string;
}
