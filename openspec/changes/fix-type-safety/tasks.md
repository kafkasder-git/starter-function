# Implementation Tasks: Fix Type Safety Issues

## Phase 1: Property Access Fixes (~250 errors)

### 1.1 MobileNavigation.tsx
- [ ] 1.1.1 Fix line 218 - Object is possibly 'undefined'
- [ ] 1.1.2 Add nullish coalescing operator
- [ ] 1.1.3 Test navigation functionality

### 1.2 PullToRefresh.tsx
- [ ] 1.2.1 Fix line 56 - Object is possibly 'undefined'
- [ ] 1.2.2 Fix line 68 - Object is possibly 'undefined'
- [ ] 1.2.3 Add null checks
- [ ] 1.2.4 Test pull-to-refresh gesture

### 1.3 BeneficiaryDocuments.tsx
- [ ] 1.3.1 Fix line 140 - Object is possibly 'undefined'
- [ ] 1.3.2 Fix line 141 - Object is possibly 'undefined'
- [ ] 1.3.3 Fix line 142 - Object is possibly 'undefined'
- [ ] 1.3.4 Fix line 214 - Argument of type 'Blob | null'
- [ ] 1.3.5 Add type guards
- [ ] 1.3.6 Test document upload

### 1.4 BeneficiaryFinancial.tsx
- [ ] 1.4.1 Fix line 43 - Property 'monthlyIncome' does not exist
- [ ] 1.4.2 Fix line 44 - Property 'monthlyExpenses' does not exist
- [ ] 1.4.3 Fix line 45 - Property 'savings' does not exist
- [ ] 1.4.4 Fix line 46 - Property 'debts' does not exist
- [ ] 1.4.5 Fix line 198 - Property 'incomeSource' does not exist
- [ ] 1.4.6 Fix line 205 - Property 'incomeSource' does not exist
- [ ] 1.4.7 Update Beneficiary type definition
- [ ] 1.4.8 Test financial data display

### 1.5 Batch Property Access Fixes
- [ ] 1.5.1 Search all "possibly 'undefined'" errors
- [ ] 1.5.2 Apply optional chaining pattern
- [ ] 1.5.3 Add default values where appropriate
- [ ] 1.5.4 Run type-check to verify progress

## Phase 2: Type Annotation Fixes (~200 errors)

### 2.1 RecentActivity.tsx
- [ ] 2.1.1 Fix line 129 - Parameter 'n' implicitly has 'any' type
- [ ] 2.1.2 Add type to map callback parameter
- [ ] 2.1.3 Define Activity interface
- [ ] 2.1.4 Test recent activity display

### 2.2 AdvancedMetrics.tsx
- [ ] 2.2.1 Fix line 158 - 'entry' declared but never read
- [ ] 2.2.2 Remove or prefix with underscore
- [ ] 2.2.3 Test metrics display

### 2.3 Batch Type Annotations
- [ ] 2.3.1 Search all "implicitly has an 'any'" errors
- [ ] 2.3.2 Add function parameter types
- [ ] 2.3.3 Add arrow function types
- [ ] 2.3.4 Add event handler types
- [ ] 2.3.5 Run type-check to verify

## Phase 3: Type Mismatch Fixes (~100 errors)

### 3.1 ErrorBoundary.tsx
- [ ] 3.1.1 Fix line 257 - Type conversion error (ALREADY FIXED)
- [ ] 3.1.2 Verify fix works
- [ ] 3.1.3 Test error boundary

### 3.2 Header.tsx
- [ ] 3.2.1 Fix line 421 - Expected 2 arguments, but got 3
- [ ] 3.2.2 Check function signature
- [ ] 3.2.3 Update function call
- [ ] 3.2.4 Test header functionality

### 3.3 ResponsiveCard.tsx
- [ ] 3.3.1 Fix line 228 - Property 'default' does not exist
- [ ] 3.3.2 Fix line 233 - Property 'default' does not exist
- [ ] 3.3.3 Add 'default' to color mapping
- [ ] 3.3.4 Test card variants

### 3.4 RecentActivity.tsx (Type Mismatches)
- [ ] 3.4.1 Fix line 76 - Property 'completed' does not exist (ALREADY FIXED)
- [ ] 3.4.2 Fix line 77 - Property 'completed' does not exist (ALREADY FIXED)
- [ ] 3.4.3 Verify fixes work

### 3.5 ToastProvider.tsx
- [ ] 3.5.1 Fix line 20 - Type is not assignable to 'IntrinsicAttributes'
- [ ] 3.5.2 Check Sonner component props
- [ ] 3.5.3 Update prop types
- [ ] 3.5.4 Test toast notifications

### 3.6 Batch Type Mismatches
- [ ] 3.6.1 Search all "is not assignable" errors
- [ ] 3.6.2 Fix interface mismatches
- [ ] 3.6.3 Update type definitions
- [ ] 3.6.4 Run type-check to verify

## Phase 4: Cleanup Unused (~50 errors)

### 4.1 SupabaseConnectionStatus.tsx
- [ ] 4.1.1 Remove unused React import (ALREADY FIXED)
- [ ] 4.1.2 Verify component still works

### 4.2 BeneficiaryDocuments.tsx
- [ ] 4.2.1 Fix line 55 - 'documents' declared but never read
- [ ] 4.2.2 Remove or use the variable
- [ ] 4.2.3 Test document component

### 4.3 BeneficiaryForm.tsx
- [ ] 4.3.1 Fix line 608 - 'member' declared but never read
- [ ] 4.3.2 Remove or prefix with underscore
- [ ] 4.3.3 Test form functionality

### 4.4 Batch Unused Cleanup
- [ ] 4.4.1 Search all "declared but never read" errors
- [ ] 4.4.2 Remove truly unused variables
- [ ] 4.4.3 Prefix intentionally unused with '_'
- [ ] 4.4.4 Run lint:fix for unused imports
- [ ] 4.4.5 Run type-check to verify

## Phase 5: Block-Scoped Variable Fixes (~3 errors)

### 5.1 AccessibilityEnhancements.tsx
- [ ] 5.1.1 Fix line 135 - 'applyAccessibilitySettings' used before declaration
- [ ] 5.1.2 Fix line 234 - 'announceToScreenReader' used before declaration
- [ ] 5.1.3 Fix line 234 - 'performAccessibilityChecks' used before declaration
- [ ] 5.1.4 Move function declarations up or use useCallback
- [ ] 5.1.5 Test accessibility features

## Phase 6: Validation & Testing

### 6.1 Type Check Validation
- [ ] 6.1.1 Run full type check
  ```bash
  npm run type-check:all
  ```
- [ ] 6.1.2 Verify 0 type errors
- [ ] 6.1.3 Document any remaining issues

### 6.2 Build Validation
- [ ] 6.2.1 Run production build
  ```bash
  npm run build
  ```
- [ ] 6.2.2 Verify build succeeds
- [ ] 6.2.3 Check bundle sizes

### 6.3 Lint Validation
- [ ] 6.3.1 Run lint check
  ```bash
  npm run lint:check
  ```
- [ ] 6.3.2 Fix any new lint errors
- [ ] 6.3.3 Verify clean output

### 6.4 Test Suite
- [ ] 6.4.1 Run test suite
  ```bash
  npm run test
  ```
- [ ] 6.4.2 Fix any failing tests
- [ ] 6.4.3 Verify pass rate >90%

### 6.5 Manual Testing
- [ ] 6.5.1 Test beneficiary management
- [ ] 6.5.2 Test document uploads
- [ ] 6.5.3 Test financial info
- [ ] 6.5.4 Test recent activity
- [ ] 6.5.5 Test navigation
- [ ] 6.5.6 Test accessibility features

## Progress Tracking

### Metrics
- **Total Errors**: 603
- **Phase 1 Target**: 353 remaining (250 fixed)
- **Phase 2 Target**: 153 remaining (200 fixed)
- **Phase 3 Target**: 53 remaining (100 fixed)
- **Phase 4 Target**: 3 remaining (50 fixed)
- **Phase 5 Target**: 0 remaining (3 fixed)

### Estimated Time
- **Phase 1**: 4 hours
- **Phase 2**: 3 hours
- **Phase 3**: 2 hours
- **Phase 4**: 1 hour
- **Phase 5**: 30 minutes
- **Validation**: 1 hour

**Total**: ~12 hours (1.5 days)

### Status Updates
Update after each phase:
```bash
npm run type-check 2>&1 | grep "error TS" | wc -l
# Track reduction from 603 → 0
```

