# Architecture Documentation

## Core Architecture

The DI container consists of three layers:

```
┌────────────────────────────────────────┐
│  User Config (container.ts)            │
│  const services = { ... } as const     │
└──────────────┬─────────────────────────┘
               │
               v
┌────────────────────────────────────────┐
│  Type Extraction Layer                 │
│  InferServiceTypes<typeof services>    │
└──────────────┬─────────────────────────┘
               │
               v
┌────────────────────────────────────────┐
│  Runtime Container (Map)               │
│  Simple get/has/resolve methods        │
└────────────────────────────────────────┘
```

## Type System

### Type Definitions

```typescript
// src/types.ts

/**
 * Extract types from service config object
 */
export type InferServiceTypes<T extends Record<string, any>> = {
  [K in keyof T]: T[K];
};

/**
 * Service configuration - either direct value or factory
 */
export type ServiceConfig<T = any> = T | (() => T) | { factory: () => T; singleton?: boolean };

/**
 * Typed container interface
 */
export interface Container<TServices extends Record<string, any>> {
  /**
   * Get service by token with full autocomplete
   */
  get<K extends keyof TServices>(token: K): TServices[K];

  /**
   * Check if service exists
   */
  has(token: keyof TServices): boolean;

  /**
   * Get all registered service tokens
   */
  keys(): Array<keyof TServices>;

  /**
   * Clear all cached singletons (for testing)
   */
  clear(): void;
}
```

### How Type Inference Works

1. **Const Assertion**: The `as const` makes the config object deeply readonly with literal types

   ```typescript
   const services = { db: new DB() } as const;
   // Type: { readonly db: DB }
   ```

2. **Type Extraction**: `InferServiceTypes<T>` extracts the types from the config

   ```typescript
   type Services = InferServiceTypes<typeof services>;
   // Result: { db: DB }
   ```

3. **Autocomplete**: `keyof TServices` provides string literal union for autocomplete

   ```typescript
   container.get('db'); // 'db' is autocompleted
   ```

4. **Return Type Inference**: Function overload maps token to its type
   ```typescript
   get<K extends keyof TServices>(token: K): TServices[K];
   // container.get('db') returns DB
   ```

## Container Implementation

### Core Implementation

```typescript
// src/container.ts

export function createContainer<const T extends Record<string, any>>(config: T): Container<InferServiceTypes<T>> {
  // Internal registry: token -> value/factory
  const registry = new Map<ContainerToken, any>();

  // Singleton cache
  const singletons = new Map<ContainerToken, any>();

  // Register all services from config
  for (const [token, value] of Object.entries(config)) {
    registry.set(token, value);
  }

  return {
    get(token: any) {
      if (!registry.has(token)) {
        throw new Error(`Service "${String(token)}" not registered`);
      }

      const registered = registry.get(token);

      // Handle factory functions (singleton by default)
      if (typeof registered === 'function') {
        if (singletons.has(token)) {
          return singletons.get(token);
        }
        const instance = registered();
        singletons.set(token, instance);
        return instance;
      }

      // Handle explicit factory config
      if (registered?.factory) {
        const { factory, singleton = true } = registered;
        if (singleton && singletons.has(token)) {
          return singletons.get(token);
        }
        const instance = factory();
        if (singleton) singletons.set(token, instance);
        return instance;
      }

      // Direct value
      return registered;
    },

    has(token: any) {
      return registry.has(token);
    },

    keys() {
      return Array.from(registry.keys());
    },

    clear() {
      singletons.clear();
    },
  };
}
```

### Service Registration Patterns

#### 1. Direct Values

```typescript
const services = {
  config: { apiUrl: 'https://api.example.com' },
  apiKey: 'secret-123',
} as const;
```

#### 2. Factory Functions (Singleton by default)

```typescript
const services = {
  database: () => new DatabaseService(),
  cache: () => new CacheService(),
} as const;
```

#### 3. Explicit Lifecycle Control

```typescript
const services = {
  // Singleton
  database: {
    factory: () => new DatabaseService(),
    singleton: true,
  },

  // Transient (new instance each time)
  requestContext: {
    factory: () => new RequestContext(),
    singleton: false,
  },
} as const;
```

#### 4. Dependency Injection

```typescript
const services = {
  database: new DatabaseService(),
  cache: new CacheService(),

  // Reference other services directly
  userRepository: () => new UserRepository(services.database, services.cache),

  // Or use container.get() for lazy resolution
  userService: () => new UserService(container.get('userRepository')),
} as const;
```

## File Structure

```
src/
├── types.ts              Type definitions
├── container.ts          Core implementation
├── index.ts              Public exports
└── utils/
    └── helpers.ts        Optional utilities

tests/
├── container.test.ts     Core functionality tests
├── types.test.ts         Type-level tests
└── examples/
    └── real-world.test.ts Integration examples

.docs/
├── IMPLEMENTATION_PLAN.md   Implementation roadmap
├── ARCHITECTURE.md          This file
├── API_REFERENCE.md         API documentation
└── MIGRATION_GUIDE.md       v1.x to v2.0 migration
```

## Design Decisions

### Why Not Use Decorators?

1. **Simplicity**: Decorators require `experimentalDecorators` and complex metadata
2. **Type Safety**: Config object provides better type inference
3. **Visibility**: All services visible in one place
4. **Flexibility**: Easy to conditionally register services

### Why Not Use Builder Pattern?

1. **Complexity**: Builder pattern adds unnecessary abstraction
2. **Type Accumulation**: Harder to maintain type safety across chained calls
3. **One Way**: Single pattern is easier to learn and maintain

### Why Map Instead of Object?

1. **Symbol Support**: Map supports symbol keys
2. **Performance**: Map optimized for frequent additions/deletions
3. **Clean API**: No prototype pollution concerns

### Singleton Caching Strategy

- **Default**: Factory functions are singleton by default
- **Rationale**: Most services should be singletons (databases, caches, etc.)
- **Override**: Explicit `singleton: false` for transient services
- **Testing**: `clear()` method resets singletons for test isolation

## Future Enhancements

### Async Services (v2.1)

```typescript
const services = {
  database: async () => {
    const db = new DatabaseService();
    await db.connect();
    return db;
  },
} as const;

const db = await container.getAsync('database');
```

### Scoped Containers (v2.2)

```typescript
const scopedContainer = container.createScope();
scopedContainer.clear(); // Only clears scoped instances
```

### Lazy Initialization (v2.3)

```typescript
const services = {
  database: { factory: () => new DB(), lazy: true },
} as const;
// Only instantiated when first accessed
```

## Performance Considerations

### Bundle Size

- Target: <1KB gzipped
- No dependencies
- Tree-shakeable ES modules

### Runtime Performance

- Map lookups: O(1)
- Singleton cache: O(1)
- Factory execution: One-time cost per singleton

### Memory

- Registry holds references to all services
- Singleton cache holds instantiated services
- Call `clear()` to release singleton instances
