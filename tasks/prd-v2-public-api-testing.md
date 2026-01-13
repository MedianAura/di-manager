# PRD: DI Manager v2.0 - Public API and Testing

## Introduction

Establish the public API exports and comprehensive test suite for the DI container. This ensures users have a clean import surface, all functionality is verified, and the library is production-ready.

## Goals

- Export clean public API from `src/index.ts`
- Create comprehensive unit test suite covering all container functionality
- Create type-level tests verifying type inference
- Create real-world integration examples
- Ensure >95% code coverage with meaningful tests

## User Stories

### US-014: Create Public API Exports

**Description:** As a library user, I need to import `createContainer` and type utilities from a single package entry point so the API is clean and discoverable.

**Acceptance Criteria:**

- [ ] `src/index.ts` exports `createContainer` function
- [ ] `src/index.ts` exports `Container` interface
- [ ] `src/index.ts` exports `ServiceConfig` type
- [ ] `src/index.ts` exports `InferServiceTypes` type utility
- [ ] All exports have JSDoc comments
- [ ] Exports are re-exported, not re-implemented
- [ ] `package.json` `exports` field points to correct entry point
- [ ] Typecheck passes
- [ ] Tree-shaking is enabled (unused exports can be removed)

### US-015: Create Core Functionality Unit Tests

**Description:** As a developer, I need unit tests that verify container creation, service registration, and retrieval work correctly so changes don't break core functionality.

**Acceptance Criteria:**

- [ ] Create `tests/container.test.ts` with vitest tests
- [ ] Test `createContainer()` creation succeeds
- [ ] Test direct value retrieval (strings, objects, numbers)
- [ ] Test factory function resolution with singleton caching
- [ ] Test explicit config with `singleton: true`
- [ ] Test explicit config with `singleton: false` (transient)
- [ ] Test `container.has()` returns true for registered services
- [ ] Test `container.has()` returns false for unregistered services
- [ ] Test `container.keys()` returns all registered tokens
- [ ] Test `container.clear()` clears singleton cache
- [ ] Test error thrown for unregistered service token
- [ ] All tests pass
- [ ] Coverage >95% for core functionality

### US-016: Create Dependency Injection Integration Tests

**Description:** As a developer, I need tests that verify services can depend on other services in realistic scenarios so the DI patterns work end-to-end.

**Acceptance Criteria:**

- [ ] Create test for service referencing another service directly
- [ ] Create test for service using `container.get()` for lazy resolution
- [ ] Create test for multi-level dependencies (A → B → C)
- [ ] Create test for shared dependencies (multiple services depend on same service)
- [ ] Create test demonstrating singleton shared instance
- [ ] Create test demonstrating transient instances with dependencies
- [ ] All tests pass
- [ ] Tests verify correct instances are injected

### US-017: Create Type-Level Tests

**Description:** As a developer, I need compile-time type tests that verify autocomplete and type inference work correctly so IDEs provide proper suggestions.

**Acceptance Criteria:**

- [ ] Create `tests/types.test.ts` file using satisfies operator
- [ ] Test `InferServiceTypes` extracts correct types
- [ ] Test `container.get()` infers return type from token
- [ ] Test autocomplete suggests all registered tokens
- [ ] Test invalid token is rejected by type system
- [ ] Test type inference works across all three `ServiceConfig` patterns
- [ ] Test transient services have same type as singletons
- [ ] At least 10 type-level test cases
- [ ] All TypeScript checks pass without errors

### US-018: Create Real-World Integration Example

**Description:** As a developer, I need a realistic example showing how to structure a DI container for a real application so I can understand best practices.

**Acceptance Criteria:**

- [ ] Create `tests/examples/real-world.test.ts`
- [ ] Example includes service classes: `DatabaseService`, `UserRepository`, `UserService`
- [ ] Example shows factory functions with dependencies
- [ ] Example shows singleton configuration
- [ ] Example demonstrates container usage
- [ ] Example includes inline comments explaining patterns
- [ ] Test verifies the example works end-to-end
- [ ] Example is suitable for documentation

### US-019: Create Migration Example Test

**Description:** As a developer, I need a test showing the before/after of migrating from v1.x to v2.0 so migration path is clear.

**Acceptance Criteria:**

- [ ] Create test demonstrating v1.x pattern (commented out or in comments)
- [ ] Create test demonstrating v2.0 equivalent pattern
- [ ] Show TSyringe-based registration → config object registration
- [ ] Show `getFromContainer<T>()` → `container.get()`
- [ ] Show decorator injection → direct property assignment
- [ ] Show constructor injection patterns before/after
- [ ] Test verifies both approaches work functionally equivalent
- [ ] Comments explain the differences clearly

### US-020: Configure Build and Test Scripts

**Description:** As a developer, I need npm scripts configured so I can easily run tests and verify the build works.

**Acceptance Criteria:**

- [ ] `npm run test:unit` runs all tests in `tests/`
- [ ] `npm run test:unit:coverage` runs tests with coverage report
- [ ] Coverage includes both runtime and type-level code
- [ ] Build succeeds with `npm run build`
- [ ] All tests pass before build completes
- [ ] Test configuration in `vitest.config.mjs` is proper
- [ ] Coverage threshold is ≥95% for meaningful metrics

## Functional Requirements

- FR-1: Public API must include `createContainer`, `Container`, `ServiceConfig`, `InferServiceTypes`
- FR-2: All exports must have JSDoc comments
- FR-3: Unit tests must cover all public methods
- FR-4: Type tests must verify autocomplete and inference
- FR-5: Integration tests must verify real-world patterns work
- FR-6: Test suite must run in <5 seconds total
- FR-7: Coverage reports must be generated in `coverage/` directory

## Non-Goals

- Performance benchmarks (will be done later)
- Browser testing (library is Node/Server-side)
- Visual testing (not applicable)

## Technical Considerations

- Use vitest for testing framework (already in project)
- Type tests use TypeScript `satisfies` operator for compile-time verification
- Integration tests import real service classes to simulate real usage
- Coverage reports in both terminal and HTML format
- Tests should be isolated and not depend on each other

## Success Metrics

- All unit tests pass (100% pass rate)
- All type tests pass (0 TypeScript errors)
- Code coverage ≥95%
- Integration tests demonstrate realistic usage
- Public API is clean and discoverable
- Documentation examples work as tested

## Open Questions

- Should we include performance benchmarks in test suite?
- Should we test with different TypeScript versions?
