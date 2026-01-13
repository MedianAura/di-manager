# PRD: DI Manager v2.0 - Type System Implementation

## Introduction

Implement the core TypeScript type system for a lightweight, type-safe dependency injection container that enables full autocomplete and automatic type inference. This is the foundational layer that allows all services registered in a config object to be automatically typed with no manual annotations.

## Goals

- Define `ServiceConfig<T>` type that supports values, factories, and explicit lifecycle control
- Create `InferServiceTypes<T>` type that extracts types from config objects with `as const` assertion
- Design `Container<TServices>` interface with fully typed `get`, `has`, `keys`, and `clear` methods
- Enable IDE autocomplete for all registered service tokens
- Ensure return types are automatically inferred based on registered service types

## User Stories

### US-001: Create ServiceConfig Type Union

**Description:** As a developer, I need a type definition that accepts direct values, factory functions, or explicit configuration objects so I can configure services with different lifecycle patterns.

**Acceptance Criteria:**

- [ ] `ServiceConfig<T>` type accepts direct values: `T`
- [ ] `ServiceConfig<T>` type accepts factory functions: `() => T`
- [ ] `ServiceConfig<T>` type accepts config objects: `{ factory: () => T, singleton?: boolean }`
- [ ] Type is generic and works for any service type
- [ ] Typecheck passes
- [ ] Code examples work in tests without errors

### US-002: Implement InferServiceTypes Type Helper

**Description:** As a developer, I need a type utility that extracts service types from a configuration object so that the container knows the types of all registered services.

**Acceptance Criteria:**

- [ ] `InferServiceTypes<T>` extracts types from config object keys
- [ ] Works with `as const` assertion for literal type narrowing
- [ ] Returns object with same keys but extracted value types
- [ ] Example: `InferServiceTypes<{ db: DatabaseService }>` returns `{ db: DatabaseService }`
- [ ] Typecheck passes
- [ ] Type-level tests verify inference works correctly

### US-003: Create Container Interface

**Description:** As a developer, I need a typed Container interface that defines all methods with proper type safety so the API is predictable and auto-documented.

**Acceptance Criteria:**

- [ ] `Container<TServices>` interface defined with generic `TServices` parameter
- [ ] `get<K extends keyof TServices>(token: K): TServices[K]` method with autocomplete
- [ ] `has(token: keyof TServices | string | symbol): boolean` method
- [ ] `keys(): Array<keyof TServices>` method returning all tokens
- [ ] `clear(): void` method for clearing singleton caches
- [ ] All methods have proper JSDoc comments
- [ ] Typecheck passes

### US-004: Define Type-Level Test Suite for Type System

**Description:** As a developer, I need type-level tests that verify type inference works correctly at compile time so we ensure the type system matches the runtime behavior.

**Acceptance Criteria:**

- [ ] Create `tests/types.test.ts` file
- [ ] Test `InferServiceTypes` correctly extracts types from config
- [ ] Test `Container.get()` returns correct type based on token
- [ ] Test autocomplete works for service tokens (uses satisfies operator)
- [ ] Test `ServiceConfig` accepts all three patterns (value, factory, config)
- [ ] All tests pass without TypeScript errors
- [ ] At least 5 type-level test cases

## Functional Requirements

- FR-1: `ServiceConfig<T>` type must be exported and reusable
- FR-2: `InferServiceTypes<T>` must work exclusively with `as const` asserted config objects
- FR-3: Type inference must provide full autocomplete in IDEs (test with explicit `satisfies` operators)
- FR-4: `Container<TServices>` must be generic and not tied to specific service implementations
- FR-5: All types must be tree-shakeable and not introduce runtime code
- FR-6: Types must support symbol keys in addition to string keys
- FR-7: Singleton lifecycle must be expressible in type system

## Non-Goals

- No runtime validation of config objects
- No reflection or metadata generation
- No async factory support (planned for v2.1)
- No scoped containers (planned for v2.2)

## Technical Considerations

- Types must leverage TypeScript's `const` type parameters for precision
- Must work with TypeScript 5.0+ for optimal inference
- Export all types from `src/types.ts` for public use
- Type definitions should mirror the runtime implementation contract

## Success Metrics

- Full IDE autocomplete for all service tokens
- Zero manual type annotations needed when using container
- Type inference works across all three `ServiceConfig` patterns
- All type-level tests pass

## Open Questions

- Should we export the type helpers or keep them internal?
- Do we need a way to extend the Container interface at the type level?
