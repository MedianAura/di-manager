# PRD: DI Manager v2.0 - Runtime Container Implementation

## Introduction

Implement the core `createContainer()` function that converts a TypeScript config object into a working dependency injection container with support for direct values, factory functions, singleton/transient lifecycle, and dependency injection patterns.

## Goals

- Implement `createContainer()` function that takes a config object and returns a typed Container
- Support three service registration patterns: direct values, factory functions, explicit config objects
- Implement singleton caching with `clear()` method for testing
- Support dependency injection where services can reference other services
- Achieve <1KB gzipped bundle size with no external dependencies

## User Stories

### US-005: Implement Service Registry and Initialization

**Description:** As a developer, I need the container to register all services from the config object so they can be retrieved by token.

**Acceptance Criteria:**

- [ ] `createContainer(config)` accepts config object parameter
- [ ] Internal Map-based registry stores all services by token
- [ ] Registry is populated from config object entries
- [ ] Both string and symbol keys are supported
- [ ] Services are stored as-is (no transformation at registration)
- [ ] Typecheck passes
- [ ] No errors during container creation

### US-006: Implement Direct Value Resolution

**Description:** As a developer, I need the container to return direct values immediately so config objects and constants are accessible.

**Acceptance Criteria:**

- [ ] `get(token)` returns direct values unchanged
- [ ] Works for strings, numbers, objects, any non-function value
- [ ] Example: `get('config')` returns `{ apiUrl: 'https://...' }`
- [ ] No caching needed for direct values
- [ ] Returns exact same reference on repeated calls
- [ ] Typecheck passes
- [ ] Unit tests verify behavior

### US-007: Implement Factory Function Resolution with Singleton Caching

**Description:** As a developer, I need the container to call factory functions and cache the result so singleton services are created once and reused.

**Acceptance Criteria:**

- [ ] `get(token)` detects if value is a function
- [ ] First call to factory function executes and result is cached
- [ ] Subsequent calls return cached instance (same reference)
- [ ] Singleton cache is separate from registry
- [ ] Works for factories without explicit config: `() => new Service()`
- [ ] Unit tests verify singleton behavior with identity checks
- [ ] Typecheck passes

### US-008: Implement Explicit Lifecycle Control

**Description:** As a developer, I need the container to support explicit configuration with `singleton` flag so I can create transient services that get new instances each time.

**Acceptance Criteria:**

- [ ] Config objects with `{ factory: () => T, singleton?: true }` are cached
- [ ] Config objects with `{ factory: () => T, singleton: false }` create new instance each time
- [ ] Default singleton value is `true` if not specified
- [ ] Both patterns work: `services.prop: { factory: ..., singleton: false }`
- [ ] Transient services are never cached
- [ ] Unit tests verify transient behavior with identity checks
- [ ] Typecheck passes

### US-009: Implement Container.has() Method

**Description:** As a developer, I need `container.has(token)` to check if a service is registered so I can safely test for service availability.

**Acceptance Criteria:**

- [ ] `has(token)` returns `true` if service is registered
- [ ] `has(token)` returns `false` if service is not registered
- [ ] Works for both string and symbol tokens
- [ ] Does not invoke any factories (safe to call)
- [ ] Unit tests verify all cases
- [ ] Typecheck passes

### US-010: Implement Container.keys() Method

**Description:** As a developer, I need `container.keys()` to get all registered service tokens so I can iterate over services or debug configuration.

**Acceptance Criteria:**

- [ ] `keys()` returns Array of all registered tokens
- [ ] Tokens are returned in insertion order
- [ ] Works for both string and symbol tokens
- [ ] Returns empty array if no services registered
- [ ] Does not invoke any factories
- [ ] Unit tests verify iteration works correctly
- [ ] Typecheck passes

### US-011: Implement Container.clear() Method

**Description:** As a developer, I need `container.clear()` to reset singleton cache so tests can run in isolation with fresh instances.

**Acceptance Criteria:**

- [ ] `clear()` removes all cached singletons
- [ ] Next call to `get(token)` creates new instance for cached factories
- [ ] Direct values are unaffected
- [ ] Transient services already create new instances
- [ ] Safe to call multiple times
- [ ] Unit tests verify factory is re-invoked after clear
- [ ] Typecheck passes

### US-012: Implement Dependency Injection Patterns

**Description:** As a developer, I need to be able to reference other services in the config object so I can create complex dependency graphs.

**Acceptance Criteria:**

- [ ] Services can reference other services directly: `userRepo: () => new UserRepo(services.db)`
- [ ] Services can use `container.get()` for lazy resolution after container is created
- [ ] Circular dependencies are detectable (throw error)
- [ ] Dependency resolution works across all three service patterns
- [ ] Unit tests demonstrate simple and complex dependency graphs
- [ ] Examples show both direct reference and lazy resolution patterns
- [ ] Typecheck passes

### US-013: Error Handling and Validation

**Description:** As a developer, I need the container to provide clear error messages when services are not found so I can debug configuration issues quickly.

**Acceptance Criteria:**

- [ ] `get(token)` throws Error if service not registered
- [ ] Error message includes the token name: `Service "database" not registered`
- [ ] Error message is descriptive and actionable
- [ ] Error is thrown before any factory execution
- [ ] Unit tests verify error cases
- [ ] Error handling works for both string and symbol tokens
- [ ] Typecheck passes

## Functional Requirements

- FR-1: `createContainer()` must return an object implementing Container interface
- FR-2: Registry must be encapsulated (not accessible externally)
- FR-3: Singleton cache must be encapsulated (not accessible externally)
- FR-4: Service tokens are strings or symbols from config object keys
- FR-5: Factory functions must be called at most once (singleton) or every time (transient)
- FR-6: `clear()` must work atomically (all or nothing)
- FR-7: No external dependencies - pure TypeScript implementation

## Non-Goals

- Async service initialization (planned for v2.1)
- Property injection decorators (removed in v2.0)
- Child containers or scoping (planned for v2.2)
- Circular dependency detection (assumed user responsibility)

## Technical Considerations

- Use native `Map` for O(1) lookups
- Singleton cache separated from registry for memory control
- Factory detection uses `typeof === 'function'` check
- Config object pattern uses duck typing (checks for `factory` property)
- Error messages use `String(token)` to handle symbol keys

## Success Metrics

- All 9 user stories fully implemented
- 100% unit test coverage for runtime behavior
- Container creation takes <1ms
- Service resolution (get) is O(1) operation
- Zero external dependencies

## Open Questions

- Should we add a `register()` method to dynamically add services after creation?
- Should we warn about services that are never retrieved?
