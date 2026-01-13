export function InjectDependency(_token: string | symbol) {
  return function (target: unknown, propertyKey: string) {
    Object.defineProperty(target, propertyKey, {
      get(): unknown {
        return undefined;
      },
    });
  };
}
