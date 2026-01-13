import { container } from '@src/core/global-container';
import type { ContainerToken } from '@src/core/types';

export function InjectDependency(token: ContainerToken) {
  return function (target: unknown, propertyKey: string) {
    Object.defineProperty(target, propertyKey, {
      get(): unknown {
        return container.get(token);
      },
    });
  };
}
