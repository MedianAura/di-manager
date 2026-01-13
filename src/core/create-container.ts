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
  const registry = new Map<ContainerToken, ServiceConfig<unknown>>();
  const singletonCache = new Map<ContainerToken, unknown>();

  populateRegistry(registry, config);

  return createContainerMethods<TConfig>(registry, singletonCache);
}

/**
 * Creates the container methods with access to registry and cache
 */
function createContainerMethods<TConfig extends Record<ContainerToken, ServiceConfig<unknown>>>(
  registry: Map<ContainerToken, ServiceConfig<unknown>>,
  singletonCache: Map<ContainerToken, unknown>,
): Container<InferServiceTypes<TConfig>> {
  return {
    clear: () => singletonCache.clear(),
    get: createGetMethod<TConfig>(registry, singletonCache),
    has: (token: ContainerToken | keyof InferServiceTypes<TConfig>) => registry.has(token as ContainerToken),
    keys: () => [...registry.keys()] as Array<keyof InferServiceTypes<TConfig>>,
    register: <K extends ContainerToken, T>(token: K, service: ServiceConfig<T>) => registry.set(token, service as ServiceConfig<unknown>),
  };
}

/**
 * Creates the get method for the container
 */
function createGetMethod<TConfig extends Record<ContainerToken, ServiceConfig<unknown>>>(
  registry: Map<ContainerToken, ServiceConfig<unknown>>,
  singletonCache: Map<ContainerToken, unknown>,
) {
  return function get<K extends keyof InferServiceTypes<TConfig>>(token: K): InferServiceTypes<TConfig>[K] {
    if (!registry.has(token as ContainerToken)) {
      throw new Error(`Service "${String(token)}" not registered`);
    }

    const service = registry.get(token as ContainerToken);
    return resolveService(service, token as ContainerToken, singletonCache);
  };
}

/**
 * Checks if a service is a config object with factory property
 */
function isConfigObject(service: ServiceConfig<unknown>): boolean {
  return typeof service === 'object' && service !== null && 'factory' in service;
}

/**
 * Populates the registry with services from the config object
 */
function populateRegistry<TConfig extends Record<ContainerToken, ServiceConfig<unknown>>>(registry: Map<ContainerToken, ServiceConfig<unknown>>, config: TConfig): void {
  for (const [token, service] of Object.entries(config)) {
    registry.set(token, service);
  }

  for (const token of Object.getOwnPropertySymbols(config)) {
    registry.set(token, config[token]);
  }
}

/**
 * Resolves a config object with factory and optional singleton flag
 */
function resolveConfigObject<T>(service: ServiceConfig<unknown>, token: ContainerToken, cache: Map<ContainerToken, unknown>): T {
  const config = service as { factory: () => unknown; singleton?: boolean };
  const isSingleton = config.singleton !== false; // Default to true

  if (isSingleton) {
    return resolveFactory(config.factory, token, cache);
  }

  // Transient: always create a new instance
  const factory = config.factory;
  const instance = factory();
  return instance as T;
}

/**
 * Resolves a direct value service
 */
function resolveDirectValue<T>(service: ServiceConfig<unknown>, _token: ContainerToken): T {
  return service as T;
}

/**
 * Resolves a factory function service with singleton caching
 */
function resolveFactory<T>(service: ServiceConfig<unknown>, token: ContainerToken, cache: Map<ContainerToken, unknown>): T {
  if (cache.has(token)) {
    return cache.get(token) as T;
  }

  const factory = service as () => unknown;
  const instance = factory();
  cache.set(token, instance);

  return instance as T;
}

/**
 * Resolves a service from the registry
 */
function resolveService<T>(service: ServiceConfig<unknown>, token: ContainerToken, cache: Map<ContainerToken, unknown>): T {
  if (isConfigObject(service)) {
    return resolveConfigObject(service, token, cache);
  }

  if (typeof service === 'function') {
    return resolveFactory(service, token, cache);
  }

  return resolveDirectValue(service, token);
}
