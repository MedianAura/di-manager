# Migration Guide: v1.x to v2.0

This guide helps you migrate from `@medianaura/di-manager` v1.x (TSyringe wrapper) to v2.0 (standalone type-safe container).

## Breaking Changes Overview

| Feature             | v1.x                              | v2.0              | Status      |
| ------------------- | --------------------------------- | ----------------- | ----------- |
| TSyringe dependency | Required (peer)                   | Removed           | ❌ Breaking |
| Decorators          | `@InjectDependency`               | Not available     | ❌ Breaking |
| API function        | `getFromContainer<T>()`           | `container.get()` | ❌ Breaking |
| Registration        | TSyringe's `container.register()` | Config object     | ❌ Breaking |
| Type annotations    | Manual `<T>`                      | Auto-inferred     | ✅ Improved |
| Bundle size         | ~4KB                              | <1KB              | ✅ Improved |

## Installation

### v1.x

```json
{
  "dependencies": {
    "@medianaura/di-manager": "^1.0.4"
  },
  "peerDependencies": {
    "tsyringe": ">=4.x"
  }
}
```

### v2.0

```json
{
  "dependencies": {
    "@medianaura/di-manager": "^2.0.0"
  }
}
```

**Action Required:**

1. Update package version: `npm install @medianaura/di-manager@^2.0.0`
2. Remove TSyringe: `npm uninstall tsyringe`

## Migration Patterns

### Pattern 1: Basic Service Registration

#### v1.x

```typescript
import { container } from 'tsyringe';
import { getFromContainer } from '@medianaura/di-manager';

// Registration
container.register('database', { useClass: DatabaseService });
container.register('cache', { useClass: CacheService });

// Usage
const db = getFromContainer<DatabaseService>('database');
const cache = getFromContainer<CacheService>('cache');
```

#### v2.0

```typescript
import { createContainer } from '@medianaura/di-manager';

// Registration (all in one place)
const services = {
  database: new DatabaseService(),
  cache: new CacheService(),
} as const;

const container = createContainer(services);

// Usage (auto-typed!)
const db = container.get('database'); // Type: DatabaseService
const cache = container.get('cache'); // Type: CacheService
```

**Migration Steps:**

1. Create a `container.ts` file
2. Define all services in a config object
3. Export the container
4. Replace `getFromContainer<T>('token')` with `container.get('token')`

---

### Pattern 2: Singleton Services

#### v1.x

```typescript
import { container } from 'tsyringe';
import { injectable, singleton } from 'tsyringe';

@singleton()
@injectable()
class DatabaseService {
  constructor() {
    console.log('DB created');
  }
}

container.register('database', DatabaseService);
```

#### v2.0

```typescript
import { createContainer } from '@medianaura/di-manager';

class DatabaseService {
  constructor() {
    console.log('DB created');
  }
}

const services = {
  // Factory functions are singletons by default
  database: () => new DatabaseService(),
} as const;

const container = createContainer(services);
```

**Migration Steps:**

1. Remove `@singleton()` decorator
2. Use factory function in config: `() => new Service()`
3. Factory is called once, result is cached

---

### Pattern 3: Property Injection with Decorators

#### v1.x

```typescript
import { InjectDependency } from '@medianaura/di-manager';

class UserService {
  @InjectDependency('database')
  database!: DatabaseService;

  @InjectDependency('cache')
  cache!: CacheService;

  getUser(id: string) {
    return this.database.findById(id);
  }
}
```

#### v2.0

```typescript
import { container } from './container'; // Your container file

class UserService {
  database = container.get('database');
  cache = container.get('cache');

  getUser(id: string) {
    return this.database.findById(id);
  }
}
```

**Migration Steps:**

1. Remove `@InjectDependency` decorators
2. Replace with simple property assignments: `= container.get('token')`
3. Remove `!` assertion (no longer needed)

---

### Pattern 4: Constructor Injection

#### v1.x

```typescript
import { injectable, inject } from 'tsyringe';

@injectable()
class UserService {
  constructor(
    @inject('database') private database: DatabaseService,
    @inject('cache') private cache: CacheService,
  ) {}
}

container.register('userService', UserService);
```

#### v2.0

```typescript
import { createContainer } from '@medianaura/di-manager';

class UserService {
  constructor(
    private database: DatabaseService,
    private cache: CacheService,
  ) {}
}

const services = {
  database: new DatabaseService(),
  cache: new CacheService(),

  // Explicitly inject dependencies
  userService: () => new UserService(services.database, services.cache),
} as const;

const container = createContainer(services);
```

**Migration Steps:**

1. Remove `@injectable()` and `@inject()` decorators
2. Create service using factory function
3. Explicitly pass dependencies in factory

---

### Pattern 5: Transient Services

#### v1.x

```typescript
import { container } from 'tsyringe';

container.register('requestContext', RequestContext); // Transient by default
```

#### v2.0

```typescript
import { createContainer } from '@medianaura/di-manager';

const services = {
  requestContext: {
    factory: () => new RequestContext(),
    singleton: false, // New instance each time
  },
} as const;

const container = createContainer(services);
```

**Migration Steps:**

1. Use config object with `singleton: false`
2. Default is singleton, so explicitly set to false for transient

---

### Pattern 6: Value Registration

#### v1.x

```typescript
import { container } from 'tsyringe';

container.register('apiUrl', { useValue: 'https://api.example.com' });
container.register('config', { useValue: { timeout: 5000 } });
```

#### v2.0

```typescript
import { createContainer } from '@medianaura/di-manager';

const services = {
  apiUrl: 'https://api.example.com',
  config: { timeout: 5000 },
} as const;

const container = createContainer(services);
```

**Migration Steps:**

1. Remove `{ useValue: ... }` wrapper
2. Use direct values in config object

---

### Pattern 7: Factory Registration

#### v1.x

```typescript
import { container } from 'tsyringe';

container.register('database', {
  useFactory: (c) => {
    const config = c.resolve('config');
    return new DatabaseService(config);
  },
});
```

#### v2.0

```typescript
import { createContainer } from '@medianaura/di-manager';

const services = {
  config: { host: 'localhost' },

  database: () => new DatabaseService(services.config),
  // Or use container.get() for lazy resolution:
  // database: () => new DatabaseService(container.get('config')),
} as const;

const container = createContainer(services);
```

**Migration Steps:**

1. Remove `useFactory` wrapper
2. Use arrow function directly
3. Reference dependencies via `services.token` or `container.get('token')`

---

## TypeScript Configuration

### v1.x (tsconfig.json)

```json
{
  "compilerOptions": {
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true
  }
}
```

### v2.0 (tsconfig.json)

```json
{
  "compilerOptions": {
    // Decorator settings no longer needed!
    // Can be removed if not used elsewhere
  }
}
```

**Action Required:**

- If you're not using decorators elsewhere in your project, remove these settings

---

## Complete Migration Example

### Before (v1.x)

```typescript
// services/database.service.ts
import { singleton } from 'tsyringe';

@singleton()
export class DatabaseService {
  connect() {
    /* ... */
  }
}

// services/user.service.ts
import { injectable, inject } from 'tsyringe';
import { InjectDependency } from '@medianaura/di-manager';

@injectable()
export class UserService {
  @InjectDependency('database')
  database!: DatabaseService;

  constructor(@inject('config') private config: AppConfig) {}

  getUser(id: string) {
    return this.database.findById(id);
  }
}

// main.ts
import { container } from 'tsyringe';
import { getFromContainer } from '@medianaura/di-manager';

container.register('config', { useValue: { apiUrl: '...' } });
container.register('database', DatabaseService);
container.register('userService', UserService);

const userService = getFromContainer<UserService>('userService');
```

### After (v2.0)

```typescript
// services/database.service.ts
export class DatabaseService {
  connect() {
    /* ... */
  }
}

// services/user.service.ts
export class UserService {
  constructor(
    private database: DatabaseService,
    private config: AppConfig,
  ) {}

  getUser(id: string) {
    return this.database.findById(id);
  }
}

// container.ts (NEW FILE)
import { createContainer } from '@medianaura/di-manager';
import { DatabaseService } from './services/database.service';
import { UserService } from './services/user.service';

const services = {
  config: { apiUrl: '...' },
  database: () => new DatabaseService(),
  userService: () => new UserService(services.database, services.config),
} as const;

export const container = createContainer(services);
export type Container = typeof container;

// main.ts
import { container } from './container';

const userService = container.get('userService'); // Auto-typed!
```

---

## Migration Checklist

### Phase 1: Setup

- [ ] Update `@medianaura/di-manager` to v2.0.0
- [ ] Remove `tsyringe` dependency
- [ ] Create `container.ts` file in your project
- [ ] (Optional) Remove decorator settings from `tsconfig.json`

### Phase 2: Service Registration

- [ ] Move all `container.register()` calls to config object
- [ ] Convert `useValue` to direct values
- [ ] Convert `useClass` to factory functions or instances
- [ ] Convert `useFactory` to arrow functions
- [ ] Add `as const` assertion

### Phase 3: Service Retrieval

- [ ] Replace all `getFromContainer<T>('token')` with `container.get('token')`
- [ ] Remove manual type annotations (now auto-inferred)
- [ ] Update imports to use your `container.ts` file

### Phase 4: Remove Decorators

- [ ] Remove all `@InjectDependency` decorators
- [ ] Replace with `container.get('token')` properties
- [ ] Remove `@injectable()` decorators
- [ ] Remove `@inject()` decorators
- [ ] Update constructor parameters

### Phase 5: Testing

- [ ] Update tests to use new container API
- [ ] Use `container.clear()` in test teardown
- [ ] Verify all services resolve correctly
- [ ] Check autocomplete works in IDE

### Phase 6: Cleanup

- [ ] Remove unused TSyringe imports
- [ ] Remove decorator imports
- [ ] Update documentation
- [ ] Remove `!` type assertions

---

## Common Issues & Solutions

### Issue: "Cannot use decorators"

**Cause**: Trying to use `@InjectDependency` in v2.0

**Solution**: Replace with property assignment:

```typescript
// Before
@InjectDependency('db') database!: DB;

// After
database = container.get('db');
```

---

### Issue: "Type 'string' is not assignable to..."

**Cause**: Missing `as const` assertion

**Solution**: Add `as const`:

```typescript
// Before
const services = { db: new DB() };

// After
const services = { db: new DB() } as const;
```

---

### Issue: "Cannot access 'container' before initialization"

**Cause**: Circular dependency in config object

**Solution**: Use factory function with `container.get()`:

```typescript
const services = {
  serviceA: new ServiceA(),

  // Instead of: serviceB: new ServiceB(services.serviceA)
  serviceB: () => new ServiceB(container.get('serviceA')),
} as const;

const container = createContainer(services);
```

---

### Issue: "Service returns undefined"

**Cause**: Factory function not being called

**Solution**: Ensure you're using `() => new Service()`, not `new Service`:

```typescript
// Wrong
const services = { db: new DatabaseService() } as const;

// Correct (if you want singleton behavior)
const services = { db: () => new DatabaseService() } as const;
```

---

## Need Help?

- **Documentation**: See `.docs/` folder
- **Issues**: https://github.com/MedianAura/di-manager/issues
- **Examples**: See `tests/examples/` directory
