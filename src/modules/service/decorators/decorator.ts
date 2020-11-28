import { container } from 'tsyringe';

export function InjectFromContainer(token: any) {
    return function (target: any, propertyKey: string) {
        target[propertyKey] = getServiceFromContainer(token);
    };
}

export function getServiceFromContainer<T>(token: any): T {
    return container.resolve<T>(token);
}
