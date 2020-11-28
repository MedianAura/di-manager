import { StoreManager } from '../controllers/store-manager';

export function InjectFromStore(module: string): any {
    return function (target: any, propertyKey: string) {
        target[propertyKey] = getModuleFromStore(module);
    };
}

export function getModuleFromStore<T>(module: string): T {
    return StoreManager.getInstance().resolve(module) as T;
}