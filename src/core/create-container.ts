import type { Container, InferServiceTypes, ServiceConfig } from './types';

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
export function createContainer<TConfig extends Record<string | symbol, ServiceConfig<unknown>>>(config: TConfig): Container<InferServiceTypes<TConfig>> {
  // Internal registry stores all services by token
  const registry = new Map<string | symbol, ServiceConfig<unknown>>();

  // Populate registry from config object entries
  for (const [token, service] of Object.entries(config)) {
    registry.set(token, service);
  }

  // Also handle symbol keys
  for (const token of Object.getOwnPropertySymbols(config)) {
    registry.set(token, config[token]);
  }

  // Singleton cache for resolved instances
  const singletonCache = new Map<string | symbol, unknown>();

  const container: Container<InferServiceTypes<TConfig>> = {
    get<K extends keyof InferServiceTypes<TConfig>>(token: K): InferServiceTypes<TConfig>[K] {
      // Implementation will be added in subsequent user stories
      throw new Error(`Service "${String(token)}" not implemented yet`);
    },

    register<K extends string | symbol, T>(token: K, service: ServiceConfig<T>): void {
      registry.set(token, service as ServiceConfig<unknown>);
    },

    has(token: keyof InferServiceTypes<TConfig> | string | symbol): boolean {
      return registry.has(token as string | symbol);
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
