# API Reference

## createContainer(config)

Creates a type-safe DI container from a configuration object.

### Signature

```typescript
function createContainer<const T extends Record<string, any>>(config: T): Container<InferServiceTypes<T>>;
```

### Parameters

- **config**: `T extends Record<string, any>`
  - Object containing service definitions
  - Must use `as const` for proper type inference
  - Keys become service tokens
  - Values can be:
    - Direct values
    - Factory functions `() => T`
    - Config objects `{ factory: () => T, singleton?: boolean }`

### Returns

`Container<TServices>` - Typed container instance with methods:

- `get(token)` - Retrieve service
- `has(token)` - Check if service exists
- `keys()` - Get all service tokens
- `clear()` - Clear singleton cache

### Examples

#### Basic Usage

```typescript
import { createContainer } from '@medianaura/di-manager';

const services = {
  database: new DatabaseService(),
  config: { apiUrl: 'https://api.example.com' },
} as const;

const container = createContainer(services);
```

#### With Factory Functions

```typescript
const services = {
  database: () => new DatabaseService(),
  cache: () => new CacheService(),
} as const;

const container = createContainer(services);
```

#### With Lifecycle Control

```typescript
const services = {
  singleton: {
    factory: () => new SingletonService(),
    singleton: true, // Default
  },
  transient: {
    factory: () => new TransientService(),
    singleton: false, // New instance each time
  },
} as const;

const container = createContainer(services);
```

---

## Container.get(token)

Retrieves a service by its token.

### Signature

```typescript
get<K extends keyof TServices>(token: K): TServices[K]
get<T>(token: string | symbol): T  // Fallback overload
```

### Parameters

- **token**: `K extends keyof TServices`
  - Service token (string or symbol)
  - Autocompletes with all registered service tokens
  - Type-safe: only accepts registered tokens

### Returns

Service instance with inferred type based on the token.

### Throws

`Error` if service is not registered.

### Examples

```typescript
const services = {
  database: new DatabaseService(),
  cache: new CacheService(),
  config: { apiUrl: 'https://api.example.com' },
} as const;

const container = createContainer(services);

// Full autocomplete and type inference
const db = container.get('database'); // Type: DatabaseService
const cache = container.get('cache'); // Type: CacheService
const cfg = container.get('config'); // Type: { apiUrl: string }

// Error: Service not registered
try {
  const unknown = container.get('unknown');
} catch (error) {
  console.error(error.message); // "Service "unknown" not registered"
}
```

### Behavior

#### Direct Values

Returns the value as-is:

```typescript
const services = { apiKey: 'secret-123' } as const;
const container = createContainer(services);
const key = container.get('apiKey'); // Returns 'secret-123'
```

#### Factory Functions (Singleton)

Calls factory once, caches result:

```typescript
const services = {
  database: () => new DatabaseService(),
} as const;
const container = createContainer(services);

const db1 = container.get('database'); // Calls factory
const db2 = container.get('database'); // Returns cached instance
console.log(db1 === db2); // true
```

#### Transient Services

Creates new instance each time:

```typescript
const services = {
  request: {
    factory: () => new RequestContext(),
    singleton: false,
  },
} as const;
const container = createContainer(services);

const req1 = container.get('request'); // New instance
const req2 = container.get('request'); // New instance
console.log(req1 === req2); // false
```

---

## Container.has(token)

Checks if a service is registered in the container.

### Signature

```typescript
has(token: keyof TServices | string | symbol): boolean
```

### Parameters

- **token**: `keyof TServices | string | symbol`
  - Service token to check

### Returns

`boolean` - `true` if service is registered, `false` otherwise

### Examples

```typescript
const services = {
  database: new DatabaseService(),
} as const;

const container = createContainer(services);

if (container.has('database')) {
  const db = container.get('database');
}

console.log(container.has('cache')); // false
```

---

## Container.keys()

Returns all registered service tokens.

### Signature

```typescript
keys(): Array<keyof TServices>
```

### Returns

`Array<keyof TServices>` - Array of all service tokens

### Examples

```typescript
const services = {
  database: new DatabaseService(),
  cache: new CacheService(),
  config: { apiUrl: 'https://api.example.com' },
} as const;

const container = createContainer(services);

const tokens = container.keys();
console.log(tokens); // ['database', 'cache', 'config']

// Iterate over all services
for (const token of container.keys()) {
  console.log(`Service: ${token}`);
}
```

---

## Container.clear()

Clears all singleton caches. Next call to `get()` will create new instances for factory-based services.

### Signature

```typescript
clear(): void
```

### Returns

`void`

### Examples

```typescript
const services = {
  database: () => new DatabaseService(),
} as const;

const container = createContainer(services);

const db1 = container.get('database');
container.clear(); // Clear singleton cache
const db2 = container.get('database'); // Creates new instance

console.log(db1 === db2); // false
```

### Use Cases

#### Testing

```typescript
describe('UserService', () => {
  afterEach(() => {
    container.clear(); // Reset singletons between tests
  });

  it('should create user', () => {
    const userService = container.get('userService');
    // Test with fresh instances
  });
});
```

#### Hot Module Replacement

```typescript
if (import.meta.hot) {
  import.meta.hot.accept(() => {
    container.clear(); // Reset on HMR
  });
}
```

---

## Type Utilities

### InferServiceTypes<T>

Extracts service types from a configuration object.

```typescript
type InferServiceTypes<T extends Record<string, any>> = {
  [K in keyof T]: T[K];
};
```

### Example

```typescript
const services = {
  database: new DatabaseService(),
  cache: new CacheService(),
} as const;

type Services = InferServiceTypes<typeof services>;
// Result: { database: DatabaseService, cache: CacheService }
```

### ServiceConfig<T>

Union type for service configuration.

```typescript
type ServiceConfig<T = any> = T | (() => T) | { factory: () => T; singleton?: boolean };
```

### Example

```typescript
const directValue: ServiceConfig<string> = 'value';
const factory: ServiceConfig<DB> = () => new DB();
const config: ServiceConfig<Cache> = {
  factory: () => new Cache(),
  singleton: true,
};
```

---

## Advanced Patterns

### Dependency Injection

Services can depend on other services:

```typescript
const services = {
  database: new DatabaseService(),
  cache: new CacheService(),

  // Reference services directly
  userRepo: () => new UserRepository(services.database, services.cache),

  // Or use container.get() for lazy resolution
  userService: () => new UserService(container.get('userRepo')),
} as const;

const container = createContainer(services);
```

### Conditional Registration

```typescript
const isDevelopment = process.env.NODE_ENV === 'development';

const services = {
  database: new DatabaseService(),
  logger: isDevelopment ? () => new ConsoleLogger() : () => new FileLogger(),
} as const;

const container = createContainer(services);
```

### Multiple Containers

```typescript
// Global services
const globalServices = {
  config: { apiUrl: 'https://api.example.com' },
} as const;

export const globalContainer = createContainer(globalServices);

// Feature-specific services
const featureServices = {
  featureA: new FeatureAService(),
  globalConfig: globalContainer.get('config'), // Reuse from global
} as const;

export const featureContainer = createContainer(featureServices);
```

### Type-Safe Service Tokens

```typescript
const services = {
  database: new DatabaseService(),
  cache: new CacheService(),
} as const;

const container = createContainer(services);

// Extract token type
type ServiceToken = keyof typeof services;
// Result: 'database' | 'cache'

// Use in function signatures
function getService<T extends ServiceToken>(token: T) {
  return container.get(token);
}

const db = getService('database'); // Type: DatabaseService
```

---

## Comparison with v1.x API

### v1.x (TSyringe-based)

```typescript
import { container } from 'tsyringe';
import { getFromContainer, InjectDependency } from '@medianaura/di-manager';

// Registration (verbose)
container.register('database', { useClass: DatabaseService });

// Retrieval (manual type annotation)
const db = getFromContainer<DatabaseService>('database');

// Decorator-based injection
class UserService {
  @InjectDependency('database')
  database!: DatabaseService;
}
```

### v2.0 (New API)

```typescript
import { createContainer } from '@medianaura/di-manager';

// Registration (concise)
const services = {
  database: new DatabaseService(),
} as const;

const container = createContainer(services);

// Retrieval (auto-typed)
const db = container.get('database'); // Type inferred!

// Simple property
class UserService {
  database = container.get('database');
}
```
