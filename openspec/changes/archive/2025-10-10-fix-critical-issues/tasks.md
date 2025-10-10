# Implementation Tasks: Fix Critical Issues

## 1. React Hooks Violations Fix

- [ ] 1.1 Fix PermissionGuard.tsx
  - [ ] 1.1.1 Move usePermission hook to top level
  - [ ] 1.1.2 Move useRole hook to top level
  - [ ] 1.1.3 Apply conditional logic after hooks
  - [ ] 1.1.4 Test permission guard functionality
  - [ ] 1.1.5 Verify no runtime errors

## 2. Type Safety Improvements

- [ ] 2.1 Fix types/index.ts
  - [ ] 2.1.1 Add missing Beneficiary export
  - [ ] 2.1.2 Add missing type exports
  - [ ] 2.1.3 Verify all imports resolve

- [ ] 2.2 Fix Implicit Any Types
  - [ ] 2.2.1 Add type annotations to intelligentStatsService.ts
  - [ ] 2.2.2 Add type annotations to beneficiariesService.ts
  - [ ] 2.2.3 Fix property access errors
  - [ ] 2.2.4 Run type-check and verify 0 errors

- [ ] 2.3 Align Beneficiary Type
  - [ ] 2.3.1 Match database schema
  - [ ] 2.3.2 Add supporting_documents field
  - [ ] 2.3.3 Update all usages

## 3. Bundle Optimization

- [ ] 3.1 Split EnhancedDashboard
  - [ ] 3.1.1 Identify heavy components
  - [ ] 3.1.2 Create lazy loaded sections
  - [ ] 3.1.3 Add Suspense boundaries
  - [ ] 3.1.4 Test loading states
  - [ ] 3.1.5 Verify bundle size <200KB

- [ ] 3.2 Optimize CSS Bundle
  - [ ] 3.2.1 Enable PurgeCSS
  - [ ] 3.2.2 Remove unused Tailwind classes
  - [ ] 3.2.3 Verify CSS bundle <200KB

- [ ] 3.3 Code Splitting Configuration
  - [ ] 3.3.1 Update vite.config.ts manualChunks
  - [ ] 3.3.2 Verify vendor splitting
  - [ ] 3.3.3 Test production build

## 4. ESLint Errors Fix

- [ ] 4.1 Fix Duplicate Imports
  - [ ] 4.1.1 Fix ErrorBoundary.tsx
  - [ ] 4.1.2 Fix NetworkStatus.tsx
  - [ ] 4.1.3 Run eslint:fix

- [ ] 4.2 Fix Switch Exhaustiveness
  - [ ] 4.2.1 Add default case or UNKNOWN_ERROR
  - [ ] 4.2.2 Verify switch statements

- [ ] 4.3 Add Readonly Modifiers
  - [ ] 4.3.1 Mark class members as readonly
  - [ ] 4.3.2 Update 5+ occurrences

- [ ] 4.4 Fix Confusing Void Expression
  - [ ] 4.4.1 Identify and fix
  - [ ] 4.4.2 Verify no void expression errors

## 5. Console Statements Cleanup

- [ ] 5.1 Configure Vite for Console Removal
  - [ ] 5.1.1 Update vite.config.ts esbuild.drop
  - [ ] 5.1.2 Verify production build removes console
  - [ ] 5.1.3 Test build output

- [ ] 5.2 Replace Critical Consoles with Logger
  - [ ] 5.2.1 Identify critical debug points
  - [ ] 5.2.2 Replace with logger service
  - [ ] 5.2.3 Keep development logging

- [ ] 5.3 Clean Development Console Usage
  - [ ] 5.3.1 Remove debug console.logs
  - [ ] 5.3.2 Keep only intentional dev logs
  - [ ] 5.3.3 Add eslint rule for console

## 6. Dead Code Cleanup

- [ ] 6.1 Remove Unused Imports
  - [ ] 6.1.1 Run unused-imports eslint plugin
  - [ ] 6.1.2 Auto-fix unused imports
  - [ ] 6.1.3 Verify no breaking changes

- [ ] 6.2 Clean Unused Variables
  - [ ] 6.2.1 Fix 30+ unused variable warnings
  - [ ] 6.2.2 Prefix with _ if intentionally unused
  - [ ] 6.2.3 Remove truly unused code

- [ ] 6.3 Refactor Duplicate Code
  - [ ] 6.3.1 Identify remaining duplicates
  - [ ] 6.3.2 Extract to shared utilities
  - [ ] 6.3.3 Verify ~5% duplicate code ratio

## 7. Validation & Testing

- [ ] 7.1 Build Validation
  - [ ] 7.1.1 Run npm run build
  - [ ] 7.1.2 Verify no errors
  - [ ] 7.1.3 Check bundle sizes

- [ ] 7.2 Type Check Validation
  - [ ] 7.2.1 Run npm run type-check:all
  - [ ] 7.2.2 Verify 0 type errors
  - [ ] 7.2.3 Check strict mode compliance

- [ ] 7.3 Lint Validation
  - [ ] 7.3.1 Run npm run lint:check
  - [ ] 7.3.2 Verify 0 errors
  - [ ] 7.3.3 Verify <10 warnings

- [ ] 7.4 Test Suite
  - [ ] 7.4.1 Run npm run test
  - [ ] 7.4.2 Fix failing tests
  - [ ] 7.4.3 Verify >90% pass rate

## 8. Documentation Updates

- [ ] 8.1 Update CHANGELOG
  - [ ] 8.1.1 Document all fixes
  - [ ] 8.1.2 Add migration notes if needed
  
- [ ] 8.2 Update Code Review Report
  - [ ] 8.2.1 Document improvements
  - [ ] 8.2.2 Update metrics

## Progress Tracking

- **Total Tasks**: 60+
- **Estimated Time**: 1-2 days
- **Priority**: 🔴 CRITICAL

