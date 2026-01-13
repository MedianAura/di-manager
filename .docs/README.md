# DI Manager v2.0 Documentation

Welcome to the documentation for `@medianaura/di-manager` v2.0 - a lightweight, type-safe dependency injection container for TypeScript.

## Quick Links

- **[Implementation Plan](IMPLEMENTATION_PLAN.md)** - Complete roadmap for v2.0
- **[Architecture](ARCHITECTURE.md)** - Technical design and implementation details
- **[API Reference](API_REFERENCE.md)** - Complete API documentation
- **[Migration Guide](MIGRATION_GUIDE.md)** - Migrate from v1.x to v2.0

## GitHub Issues

The implementation is tracked through GitHub issues:

1. [Phase 1: Core Type System](https://github.com/MedianAura/di-manager/issues/1) - Type definitions (~1 hour)
2. [Phase 2: Container Implementation](https://github.com/MedianAura/di-manager/issues/2) - Core runtime (~2 hours)
3. [Phase 3: Public API](https://github.com/MedianAura/di-manager/issues/3) - Exports and package config (~30 min)
4. [Phase 4: Testing](https://github.com/MedianAura/di-manager/issues/4) - Comprehensive tests (~2 hours)
5. [Phase 5: Documentation](https://github.com/MedianAura/di-manager/issues/5) - User docs and examples (~1 hour)
6. [Phase 6: Build & Publish](https://github.com/MedianAura/di-manager/issues/6) - Release v2.0.0 (~30 min)

**Total Estimated Time**: ~7 hours

## What's New in v2.0?

### Major Changes

- ✅ **Custom implementation** - No longer depends on TSyringe
- ✅ **Perfect autocomplete** - IDE suggests all registered service tokens
- ✅ **Type inference** - Return types inferred automatically, no manual annotations
- ✅ **Simpler API** - One clear pattern: config object → container
- ✅ **Smaller bundle** - <1KB vs ~4KB (75% reduction)
- ✅ **Zero dependencies** - Completely standalone

### Breaking Changes

- ❌ Removed TSyringe dependency
- ❌ Removed decorators (`@InjectDependency`)
- ❌ Removed `getFromContainer<T>()` function
- ❌ New API: must use `createContainer(config)`

See [Migration Guide](MIGRATION_GUIDE.md) for detailed migration instructions.

## Philosophy

v2.0 embraces **Configuration Over Convention**, inspired by Symfony's service configuration:

```typescript
// Single source of truth - define all services in one place
const services = {
  database: new DatabaseService(),
  cache: new CacheService(),
  userService: new UserService(),
  config: { apiUrl: 'https://api.example.com' },
} as const;

// Create typed container
const container = createContainer(services);

// Full autocomplete and type inference!
const db = container.get('database'); // Type: DatabaseService
const cfg = container.get('config'); // Type: { apiUrl: string }
```

## Quick Start

### Installation

```bash
npm install @medianaura/di-manager@^2.0.0
```

### Basic Usage

```typescript
import { createContainer } from '@medianaura/di-manager';

// Define services
const services = {
  database: new DatabaseService(),
  cache: new CacheService(),
} as const;

// Create container
const container = createContainer(services);

// Use services (with autocomplete!)
const db = container.get('database');
```

See [API Reference](API_REFERENCE.md) for complete documentation.

## Project Structure

```
di-manager/
├── .docs/                    Documentation
│   ├── README.md            This file
│   ├── IMPLEMENTATION_PLAN.md
│   ├── ARCHITECTURE.md
│   ├── API_REFERENCE.md
│   └── MIGRATION_GUIDE.md
├── src/
│   ├── types.ts             Type definitions
│   ├── container.ts         Core implementation
│   └── index.ts             Public API
├── tests/
│   ├── container.test.ts    Unit tests
│   ├── types.test.ts        Type-level tests
│   └── examples/            Integration examples
└── package.json
```

## Development Workflow

1. **Start with Issues** - Pick a phase from the GitHub issues
2. **Read Documentation** - Check relevant docs before coding
3. **Implement** - Follow the implementation plan
4. **Test** - Write tests as you go
5. **Update Docs** - Keep documentation in sync

## Success Criteria

The v2.0 release is complete when:

- ✅ Autocomplete works for all registered tokens
- ✅ Return types inferred without manual annotations
- ✅ Zero external runtime dependencies
- ✅ Simple single-pattern API
- ✅ Comprehensive test coverage (>95%)
- ✅ Clear documentation with examples
- ✅ Bundle size < 2KB gzipped

## Resources

- **Repository**: https://github.com/MedianAura/di-manager
- **Issues**: https://github.com/MedianAura/di-manager/issues
- **npm Package**: https://www.npmjs.com/package/@medianaura/di-manager

## Contributing

1. Pick an issue from the [project board](https://github.com/MedianAura/di-manager/issues)
2. Read the relevant documentation
3. Implement following the architecture guidelines
4. Write tests
5. Submit a pull request

## Questions?

- Open an issue on GitHub
- Check the [API Reference](API_REFERENCE.md)
- Read the [Migration Guide](MIGRATION_GUIDE.md)
