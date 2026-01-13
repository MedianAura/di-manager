import type { Container, ContainerReader, ContainerToken, InferServiceTypes, ServiceConfig, ServiceFactory } from './types';

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
 *   cache: { factory: () => new Cache(), singleton: false },
 *   logger: (c) => new Logger(c.get('config')),
 * });
 *
 * const config = container.get('config'); // { port: 3000 }
 * const db = container.get('db'); // Database instance (singleton)
 * const cache = container.get('cache'); // Cache instance (new each time)
 * const logger = container.get('logger'); // Logger instance with injected config
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
  // Declare a variable for the container, without initializing 'get' yet
  const partialContainer: { get?: Container<InferServiceTypes<TConfig>>['get'] } & Omit<Container<InferServiceTypes<TConfig>>, 'get'> = {
    clear: () => singletonCache.clear(),
    has: (token: ContainerToken | keyof InferServiceTypes<TConfig>) => registry.has(token as ContainerToken),
    keys: () => [...registry.keys()] as Array<keyof InferServiceTypes<TConfig>>,
    register: <K extends ContainerToken, T>(token: K, service: ServiceConfig<T>) => registry.set(token, service as ServiceConfig<unknown>),
  };

  // Now create the get method, passing a function that returns the *fully formed* container
  partialContainer.get = createGetMethod<TConfig>(registry, singletonCache, () => partialContainer as Container<InferServiceTypes<TConfig>>);

  return partialContainer as Container<InferServiceTypes<TConfig>>;
}

/**
 * Creates the get method for the container
 */
function createGetMethod<TConfig extends Record<ContainerToken, ServiceConfig<unknown>>>(
  registry: Map<ContainerToken, ServiceConfig<unknown>>,
  singletonCache: Map<ContainerToken, unknown>,
  getContainer: () => ContainerReader,
) {
  return function get<K extends keyof InferServiceTypes<TConfig>>(token: K): InferServiceTypes<TConfig>[K] {
    if (!registry.has(token as ContainerToken)) {
      throw new Error(`Service "${String(token)}" not registered`);
    }

    const service = registry.get(token as ContainerToken);
    return resolveService(service, token as ContainerToken, singletonCache, getContainer());
  };
}

/**
 * Checks if a service is a config object with factory property
 */
function isConfigObject(service: ServiceConfig<unknown>): service is { factory: ServiceFactory<unknown> } {
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
function resolveConfigObject<T>(
  service: { factory: ServiceFactory<unknown>; singleton?: boolean },
  token: ContainerToken,
  cache: Map<ContainerToken, unknown>,
  container: ContainerReader,
): T {
  const isSingleton = service.singleton !== false; // Default to true

  if (isSingleton) {
    return resolveFactory(service.factory, token, cache, container);
  }

  // Transient: always create a new instance
  const instance = service.factory(container);
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
function resolveFactory<T>(factory: ServiceFactory<unknown>, token: ContainerToken, cache: Map<ContainerToken, unknown>, container: ContainerReader): T {
  if (cache.has(token)) {
    return cache.get(token) as T;
  }

  const instance = factory(container);
  cache.set(token, instance);

  return instance as T;
}

/**
 * Resolves a service from the registry
 */
function resolveService<T>(service: ServiceConfig<unknown>, token: ContainerToken, cache: Map<ContainerToken, unknown>, container: ContainerReader): T {
  if (isConfigObject(service)) {
    return resolveConfigObject(service, token, cache, container);
  }

  if (typeof service === 'function') {
    return resolveFactory(service as ServiceFactory<unknown>, token, cache, container);
  }

  return resolveDirectValue(service, token);
}
