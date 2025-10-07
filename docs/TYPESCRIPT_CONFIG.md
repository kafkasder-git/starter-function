# TypeScript Configuration Guide

## Overview

This project uses a multi-config TypeScript setup for optimal type safety and build performance.

## Configuration Files

### Base Config (`tsconfig.json`)

The base configuration contains shared compiler options and project references. It doesn't include any files directly but serves as the foundation for other configs.

**Key Features:**
- Maximum strict mode enabled
- Modern ESM with `verbatimModuleSyntax`
- Explicit path aliases
- Project references for incremental builds

### App Config (`tsconfig.app.json`)

Used for application source code type-checking.

**Includes:**
- `components/`, `hooks/`, `lib/`, `services/`, `stores/`, `types/`, `utils/`
- `main.tsx`, `App.tsx`

**Excludes:**
- Test files
- Build outputs
- Node modules

**Usage:**
```bash
npm run type-check
npm run type-check:app
```

### Test Config (`tsconfig.test.json`)

Used for test files with relaxed rules where appropriate.

**Includes:**
- `tests/**/*`
- `**/__tests__/**/*`
- `**/*.test.ts`, `**/*.spec.ts`

**Relaxed Rules:**
- `noUnusedLocals: false`
- `noUnusedParameters: false`

**Usage:**
```bash
npm run type-check:test
```

### Node Config (`tsconfig.node.json`)

Used for Node.js tooling files (Vite, Vitest, Playwright configs).

**Module System:**
- `module: "NodeNext"`
- `moduleResolution: "NodeNext"`

**Usage:**
```bash
npm run type-check:node
```

## Strict Mode Settings

All strict mode flags are enabled for maximum type safety:

### Enabled Flags

| Flag | Purpose | Rationale |
|------|---------|-----------|
| `noImplicitAny` | Catch implicit any types | Prevents accidental loss of type information |
| `noImplicitReturns` | Ensure all code paths return | Catches missing return statements |
| `noImplicitThis` | Prevent implicit this binding | Avoids this-related bugs |
| `noUnusedLocals` | Remove unused variables | Keeps code clean |
| `noUnusedParameters` | Remove unused parameters | Identifies dead code |
| `exactOptionalPropertyTypes` | Strict optional handling | Prevents `undefined` vs missing property confusion |
| `noImplicitOverride` | Require explicit override | Makes inheritance explicit |
| `noUncheckedIndexedAccess` | Add undefined to indexed access | Prevents index out of bounds errors |
| `noFallthroughCasesInSwitch` | Prevent switch fallthrough | Catches missing break statements |
| `allowUnusedLabels: false` | Disallow unused labels | Removes dead code |
| `allowUnreachableCode: false` | Disallow unreachable code | Catches logic errors |

### Why Strict Mode?

1. **Catch Bugs Early**: Type errors are caught at compile time
2. **Better IDE Support**: More accurate autocomplete and refactoring
3. **Self-Documenting**: Types serve as inline documentation
4. **Safer Refactoring**: Confidence when making changes
5. **Team Consistency**: Enforces coding standards

## Path Aliases

Explicit path aliases for cleaner imports:

```typescript
// Instead of
import { Button } from '../../../components/ui/button';

// Use
import { Button } from '@components/ui/button';
```

### Available Aliases

- `@/*` - Project root
- `@components/*` - Components directory
- `@lib/*` - Library utilities
- `@services/*` - Business logic services
- `@hooks/*` - Custom React hooks
- `@stores/*` - State management
- `@types/*` - Type definitions
- `@utils/*` - Utility functions

## Modern ESM Features

### verbatimModuleSyntax

Enabled for clearer type-only imports:

```typescript
// Type-only import (will be removed in JS output)
import type { User } from './types';

// Value import (will remain in JS output)
import { getUser } from './api';
```

### Benefits

1. **Explicit Intent**: Clear distinction between types and values
2. **Smaller Bundles**: Type imports are completely removed
3. **Faster Builds**: Less work for bundler
4. **Better Tree-Shaking**: Clearer dependency graph

## Incremental Builds

Project references enable incremental type-checking:

```bash
# Only checks changed files
npm run type-check

# Full check (slower but thorough)
npm run type-check:all
```

### Build Info Files

Stored in `node_modules/.tmp/` to avoid cluttering the repo:
- `tsconfig.app.tsbuildinfo`
- `tsconfig.test.tsbuildinfo`
- `tsconfig.node.tsbuildinfo`

## Source Maps

Source maps are controlled by Vite, not TypeScript:

- **Development**: Enabled via Vite
- **Production**: Disabled for security
- **TypeScript**: `sourceMap: false` (Vite handles it)

## Skip Lib Check

`skipLibCheck: true` is enabled for development speed.

**Weekly CI Check:**
```bash
npm run type-check:strict
```

This runs without `skipLibCheck` to catch upstream type issues.

## Decorator Support

**Status**: Removed

Decorators were enabled but not used in the codebase. They have been removed to:
- Reduce bundle size
- Eliminate unnecessary metadata
- Simplify configuration
- Avoid experimental features

If decorators are needed in the future, use the stable TC39 proposal.

## Migration Guide

### From Old Config

If you have existing code that fails with the new strict settings:

1. **Fix Implicit Any**
   ```typescript
   // Before
   function process(data) { }
   
   // After
   function process(data: unknown) { }
   ```

2. **Fix Missing Returns**
   ```typescript
   // Before
   function getValue(x: number) {
     if (x > 0) return x;
   }
   
   // After
   function getValue(x: number): number | undefined {
     if (x > 0) return x;
     return undefined;
   }
   ```

3. **Fix Indexed Access**
   ```typescript
   // Before
   const value = array[0];
   
   // After
   const value = array[0];
   if (value !== undefined) {
     // Use value
   }
   ```

### Gradual Migration

If needed, you can temporarily disable specific rules in individual files:

```typescript
// @ts-expect-error: Legacy code, will fix in TICKET-123
const value = legacyFunction();
```

## Best Practices

### 1. Use Type Inference

```typescript
// Good - TypeScript infers the type
const user = { name: 'John', age: 30 };

// Unnecessary - explicit type adds no value
const user: { name: string; age: number } = { name: 'John', age: 30 };
```

### 2. Prefer Interfaces for Objects

```typescript
// Good
interface User {
  name: string;
  age: number;
}

// Less ideal for object shapes
type User = {
  name: string;
  age: number;
};
```

### 3. Use Type Guards

```typescript
function isUser(value: unknown): value is User {
  return (
    typeof value === 'object' &&
    value !== null &&
    'name' in value &&
    'age' in value
  );
}
```

### 4. Avoid Type Assertions

```typescript
// Bad
const user = data as User;

// Good
if (isUser(data)) {
  // TypeScript knows data is User here
}
```

## Troubleshooting

### Build Errors After Update

1. Clear build cache:
   ```bash
   rm -rf node_modules/.tmp
   ```

2. Reinstall dependencies:
   ```bash
   npm ci
   ```

3. Run type check:
   ```bash
   npm run type-check:all
   ```

### IDE Not Picking Up Changes

1. Restart TypeScript server in VS Code: `Cmd+Shift+P` → "TypeScript: Restart TS Server"
2. Check that IDE is using workspace TypeScript version
3. Verify `.vscode/settings.json` has correct paths

### Slow Type Checking

1. Use project references (already configured)
2. Enable `incremental: true` (already enabled)
3. Exclude unnecessary files
4. Use `skipLibCheck: true` for development

## References

- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [TSConfig Reference](https://www.typescriptlang.org/tsconfig)
- [Project References](https://www.typescriptlang.org/docs/handbook/project-references.html)
- [Vite TypeScript](https://vitejs.dev/guide/features.html#typescript)

---

**Last Updated**: 2025-01-07  
**TypeScript Version**: 5.9.2
