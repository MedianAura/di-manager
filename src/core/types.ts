/**
 * A typed dependency injection container that manages service instances.
 * @template TServices - The type of services managed by this container
 */
export interface Container<TServices extends Record<ContainerToken, unknown>> extends ContainerReader {
  /**
   * Clear all singleton instances cached in the container.
   */
  clear(): void;

  /**
   * Retrieve a service instance by token.
   * @param token - The service token/key
   * @returns The service instance with inferred type
   * @throws Error if the service is not registered
   */
  get<K extends keyof TServices>(token: K): TServices[K];

  /**
   * Check if a service is registered in the container.
   * @param token - The service token/key
   * @returns true if the service is registered, false otherwise
   */
  has(token: ContainerToken | keyof TServices): boolean;

  /**
   * Get all registered service tokens.
   * @returns Array of all service tokens
   */
  keys(): Array<keyof TServices>;

  /**
   * Register a service in the container.
   * @param token - The service token/key
   * @param service - The service configuration (direct value, factory, or config object)
   */
  register<K extends ContainerToken, T>(token: K, service: ServiceConfig<T>): void;
}

export interface ContainerReader {
  get(token: ContainerToken): unknown;
  has(token: ContainerToken): boolean;
}

export type ContainerToken = string | symbol;

/**
 * Extracts the service types from a configuration object.
 * Works with `as const` assertion for literal type narrowing.
 *
 * @example
 * const config = {
 *   db: new DatabaseService(),
 *   cache: () => new CacheService(),
 * } as const;
 * type Services = InferServiceTypes<typeof config>;
 * // Services = { db: DatabaseService, cache: CacheService }
 */
export type InferServiceTypes<T> = {
  [K in keyof T]: T[K] extends ServiceConfig<infer U> ? U : never;
};

/**
 * Configuration for a service that can be registered in a DI container.
 * Supports three patterns:
 * - Direct value: T
 * - Factory function: () => T
 * - Configuration object: { factory: () => T, singleton?: boolean }
 */
export type ServiceConfig<T> =
  | {
      factory: ServiceFactory<T>;
      singleton?: boolean;
    }
  | ServiceFactory<T>
  | T;

export type ServiceFactory<T> = (container: ContainerReader) => T;
