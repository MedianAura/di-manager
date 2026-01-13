import type { Container, ContainerToken, InferServiceTypes, ServiceConfig } from './types';

/**
 * Creates a dependency injection container from a configuration object.
 *
 * @template TConfig - The configuration object type
 * @param config - A configuration object where each key maps to a service
 * @returns A typed Container instance that manages the services
 *
 * @example
 * const container = createContainer({
 *   config: { port: 3000 },
 *   db: () => new Database(),
 *   cache: { factory: () => new Cache(), singleton: false }
 * });
 *
 * const config = container.get('config'); // { port: 3000 }
 * const db = container.get('db'); // Database instance (singleton)
 * const cache = container.get('cache'); // Cache instance (new each time)
 */
export function createContainer<TConfig extends Record<ContainerToken, ServiceConfig<unknown>>>(config: TConfig): Container<InferServiceTypes<TConfig>> {
  // Internal registry stores all services by token
  const registry = new Map<ContainerToken, ServiceConfig<unknown>>();

  // Populate registry from config object entries
  for (const [token, service] of Object.entries(config)) {
    registry.set(token, service);
  }

  // Also handle symbol keys
  for (const token of Object.getOwnPropertySymbols(config)) {
    registry.set(token, config[token]);
  }

  // Singleton cache for resolved instances
  const singletonCache = new Map<ContainerToken, unknown>();

  const container: Container<InferServiceTypes<TConfig>> = {
    get<K extends keyof InferServiceTypes<TConfig>>(token: K): InferServiceTypes<TConfig>[K] {
      // Check if service is registered
      if (!registry.has(token as ContainerToken)) {
        throw new Error(`Service "${String(token)}" not registered`);
      }

      const service = registry.get(token as ContainerToken);

      // Direct value resolution: if not a function and not a config object, return as-is
      if (typeof service !== 'function') {
        // Check if it's a config object with factory property
        if (typeof service === 'object' && service !== null && 'factory' in service) {
          // This is a config object - will be handled in US-008
          throw new Error(`Factory resolution not implemented yet for "${String(token)}"`);
        }
        // Direct value (string, number, object, boolean, null, undefined, array, etc.)
        return service as InferServiceTypes<TConfig>[K];
      }

      // Factory function resolution: check if result is already cached
      if (singletonCache.has(token as ContainerToken)) {
        return singletonCache.get(token as ContainerToken) as InferServiceTypes<TConfig>[K];
      }

      // Execute factory function
      const factory = service as () => unknown;
      const instance = factory();

      // Cache the result for singleton behavior
      singletonCache.set(token as ContainerToken, instance);

      return instance as InferServiceTypes<TConfig>[K];
    },

    register<K extends ContainerToken, T>(token: K, service: ServiceConfig<T>): void {
      registry.set(token, service as ServiceConfig<unknown>);
    },

    has(token: keyof InferServiceTypes<TConfig> | ContainerToken): boolean {
      return registry.has(token as ContainerToken);
    },

    keys(): Array<keyof InferServiceTypes<TConfig>> {
      return [...registry.keys()] as Array<keyof InferServiceTypes<TConfig>>;
    },

    clear(): void {
      singletonCache.clear();
    },
  };

  return container;
}
