import { container } from 'tsyringe';

export function InjectDependency(token: string | symbol) {
  return function (target: unknown, propertyKey: string) {
    Object.defineProperty(target, propertyKey, {
      get(): unknown {
        return getFromContainer(token);
      },
    });
  };
}

export function getFromContainer<T>(token: string | symbol): T {
  return container.resolve<T>(token);
}
