/**
 * Configuration for a service that can be registered in a DI container.
 * Supports three patterns:
 * - Direct value: T
 * - Factory function: () => T
 * - Configuration object: { factory: () => T, singleton?: boolean }
 */
export type ServiceConfig<T> =
  | T
  | (() => T)
  | {
      factory: () => T;
      singleton?: boolean;
    };

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
 * A typed dependency injection container that manages service instances.
 * @template TServices - The type of services managed by this container
 */
export interface Container<TServices extends Record<string | symbol, unknown>> {
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
  has(token: keyof TServices | string | symbol): boolean;

  /**
   * Get all registered service tokens.
   * @returns Array of all service tokens
   */
  keys(): Array<keyof TServices>;

  /**
   * Clear all singleton instances cached in the container.
   */
  clear(): void;
}
