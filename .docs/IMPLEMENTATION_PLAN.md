# Implementation Plan: Type-Safe DI Container v2.0

## Overview

This document outlines the implementation plan for migrating `@medianaura/di-manager` from a TSyringe wrapper to a standalone, type-safe dependency injection container.

## Objective

Create a lightweight, type-safe dependency injection container with:

- **Centralized configuration** (inspired by Symfony's service config)
- **Full autocomplete** for all registered services
- **Automatic type inference** (no manual annotations)
- **Zero external dependencies**
- **Simple, single-pattern API**

## Core Philosophy: Configuration Over Convention

The new API is inspired by Symfony's YAML service configuration, but leveraging TypeScript's type system:

```typescript
// container.ts - Single source of truth
import { createContainer } from '@medianaura/di-manager';

const services = {
  database: new DatabaseService(),
  cache: new CacheService(),
  userRepository: new UserRepository(),
  config: { apiUrl: 'https://api.example.com', timeout: 5000 },
  apiKey: 'secret-123',
} as const;

export const container = createContainer(services);

// Usage - full autocomplete and type inference
const db = container.get('database'); // Type: DatabaseService
const cfg = container.get('config'); // Type: { apiUrl: string, timeout: number }
```

## Why Custom Implementation?

### Advantages

1. **Simplicity**: ~100 lines of code vs thousands in TSyringe
2. **Zero dependencies**: No external runtime dependency
3. **Perfect TypeScript integration**: Designed for type inference from day one
4. **Full control**: Evolve the API exactly as needed
5. **Smaller bundle**: ~1KB vs ~4KB+ with TSyringe
6. **One clear pattern**: No decorators, no builders, just config

### Trade-offs

**What We Lose from TSyringe:**

- Constructor injection decorators (replaced by config)
- Singleton/transient scoping (config defines lifecycle)
- Child containers (not needed for this use case)
- Class registration (using instances in config)

**What We Gain:**

- Perfect autocomplete
- Zero boilerplate
- Single source of truth
- Compile-time type safety
- Simple mental model
- Full transparency

## Implementation Phases

See individual GitHub issues for detailed tasks:

### Phase 1: Core Type System

- **Issue**: #[TBD]
- **Duration**: ~1 hour
- **Files**: `src/types.ts`
- **Description**: Create type definitions that enable autocomplete and type inference

### Phase 2: Container Implementation

- **Issue**: #[TBD]
- **Duration**: ~2 hours
- **Files**: `src/container.ts`
- **Description**: Implement the core container with singleton caching and factory support

### Phase 3: Public API

- **Issue**: #[TBD]
- **Duration**: ~30 minutes
- **Files**: `src/index.ts`
- **Description**: Export clean public API and configure package exports

### Phase 4: Testing

- **Issue**: #[TBD]
- **Duration**: ~2 hours
- **Files**: `tests/**/*.test.ts`
- **Description**: Comprehensive test suite including type-level tests

### Phase 5: Documentation

- **Issue**: #[TBD]
- **Duration**: ~1 hour
- **Files**: `README.md`, `.docs/**`
- **Description**: Complete documentation with examples and migration guide

### Phase 6: Build & Publish

- **Issue**: #[TBD]
- **Duration**: ~30 minutes
- **Files**: `package.json`, build config
- **Description**: Verify build configuration and publish v2.0.0

## Success Criteria

- ✅ Autocomplete works for all registered tokens
- ✅ Return types inferred without manual annotations
- ✅ Zero external runtime dependencies
- ✅ Simple single-pattern API
- ✅ Comprehensive test coverage (>95%)
- ✅ Clear documentation with examples
- ✅ Bundle size < 2KB gzipped

## Bundle Size Target

- **Current (v1.x)**: ~4KB (with TSyringe as peer dep)
- **Target (v2.0)**: <1KB (standalone)
- **Reduction**: ~75% smaller

## Breaking Changes from v1.x

1. **Removed TSyringe dependency** - No longer a peer dependency
2. **Removed decorators** - `@InjectDependency` no longer available
3. **Removed `getFromContainer()`** - Use `container.get()` instead
4. **New API** - Must use `createContainer()` with config object
5. **No class registration** - Use instances or factories in config

## Resources

- [Architecture Documentation](.docs/ARCHITECTURE.md)
- [API Reference](.docs/API_REFERENCE.md)
- [Migration Guide](.docs/MIGRATION_GUIDE.md)
- [GitHub Issues](https://github.com/MedianAura/di-manager/issues)
