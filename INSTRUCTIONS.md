# AI Instructions

This file provides guidance to AI assistants working with this codebase.

**For project documentation**, see [README.md](./README.md) for details on the concatenate tool and project overview.

## AI-Specific Guidelines

### Working with This Codebase

#### Project Overview

This is a single TypeScript library: `@medianaura/di-manager` - a dependency injection manager using tsyringe.

- Source code: `src/`
- Tests: `tests/`
- Build output: `dist/`

#### File Organization

When exploring or searching, avoid these directories (they're build artifacts or dependencies):

- `node_modules/`, `dist/`, `coverage/`

#### Code Style & Conventions

- **TypeScript**: Strict mode is enabled
- **Code Verification**: Run `npm run check` to verify the entire codebase (formatting, linting, type-checking via concatenate).
- **Auto-Fixing**: Run `npm run fix` to automatically resolve formatting and linting errors.
- **Testing**: Execute unit tests with `npm run test:unit` or `npm run test:unit:coverage` for coverage.
- **Build**: Run `npm run build` to build dist files using tsup and generate barrel exports via ctix.

#### Commit Message Format

Refer to the type listed below (DO NOT include AI attribution or co-author tags):

```
<type>: <description>

<body>
```

Where `<body>` is a brief explanation of what the commit does and why. It should be 1-3 sentences describing the changes and their purpose.

Common types: `feat`, `ui`, `ux`, `fix`, `maintenance`, `dep`, `docs`, `refactor`, `test`

**Type Definitions**:

- `feat`: New end-user functionality or features
- `ui`: User interface changes (layout, styling, components)
- `ux`: User experience changes (interactions, flow improvements)
- `fix`: Bug fixes for end-user issues
- `maintenance`: Non-behavioral changes (scripts, configs, tooling)
- `dep`: Dependency updates (add, remove, update packages)
- `docs`: Documentation changes
- `refactor`: Code restructuring without behavior change
- `test`: Test-related changes

Examples:

- `feat: add user authentication flow

  Implemented JWT-based authentication with login/logout endpoints and middleware for protected routes.`

- `ui: update button styling and layout

  Updated button components with new design system colors and improved accessibility.`

- `ux: improve form validation feedback

  Enhanced form validation to show real-time feedback and clearer error messages.`

- `fix: resolve navigation routing issue

  Fixed a bug where navigation links were not updating the URL correctly in nested routes.`

- `maintenance: add test scripts to package.json

  Added npm scripts for running tests in different modes to improve developer workflow.`

- `dep: update PrimeVue to latest version

  Updated PrimeVue from v3.15 to v3.20 to include new components and bug fixes.`

#### Commit Organization

**ALWAYS group related changes together into logical commits**:

- **Single feature/fix**: One commit with all related files (code + tests)
- **Multiple unrelated changes**: Create separate commits for each logical change
- **Documentation vs code**: Can combine docs with related functional changes, or separate if significant

**Avoid splitting**:

- Don't separate code changes from their tests
- Don't split configuration changes that are related
- Don't create multiple commits for the same logical change

### Tool Usage

- Use the Read tool before making any file modifications
- Prefer Edit over Write for existing files
- Use Grep for content search, Glob for file pattern matching
- Use Task tool with specialized agents for complex searches

### Workflow

1. Read relevant files first to understand context
2. Check INSTRUCTIONS.md for AI-specific guidelines
3. Reference README.md for project structure and commands
4. Make focused changes without over-engineering
5. Run quality checks before committing (see INSTRUCTIONS.md)

### Development Workflow

#### Before Making Changes

1. Read the relevant files first (use Read tool)
2. Understand existing patterns and architecture

#### When Implementing Features

1. Follow existing patterns in the codebase
2. Maintain TypeScript strict mode compliance

#### Before Committing

- [ ] Run `npm run check` (no errors)
- [ ] Run `npm run build` (build succeeds)
- [ ] Run `npm run test:unit` if tests are affected (tests pass)
- [ ] If `npm run check` fails, try running `npm run fix` to automatically resolve issues.

### Code Quality Standards

#### Avoid Over-Engineering

- Only make changes that are directly requested or clearly necessary
- Don't add features beyond what was asked
- Don't add error handling for scenarios that can't happen
- Don't create abstractions for one-time operations
- Keep solutions simple and focused

#### Security Considerations

- Avoid common vulnerabilities (XSS, SQL injection, command injection, etc.)
- Validate at system boundaries (user input, external APIs)
- Trust internal code and framework guarantees

#### TypeScript Best Practices

- Use proper typing (avoid `any`)

### Testing Guidelines

#### Test Commands

```bash
npm run test:unit                    # Run unit tests
npm run test:unit:coverage           # Run unit tests with coverage report
npm run test:coverage                # Open coverage HTML report
```
