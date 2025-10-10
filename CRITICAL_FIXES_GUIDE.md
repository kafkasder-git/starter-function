# Critical Fixes Guide

This document provides step-by-step instructions to fix the critical issues
found in the code review.

---

## 🔴 Fix 1: React Hooks Rule Violations (15 minutes)

**File:** `components/auth/PermissionGuard.tsx` **Lines:** 65, 70 **Error:**
React Hooks called conditionally

### Problem:

```typescript
// WRONG - Hooks called conditionally
if (permission) {
  const hasPermission = usePermission(permission);
}
if (role) {
  const hasRole = useRole(role);
}
```

### Solution:

```typescript
// CORRECT - Call hooks unconditionally at the top
function PermissionGuard({ permission, role, children, fallback }) {
  const hasPermission = usePermission(permission || '');
  const hasRole = useRole(role || '');

  // Then do conditional logic
  if (permission && !hasPermission) {
    return fallback || <UnauthorizedPage />;
  }

  if (role && !hasRole) {
    return fallback || <UnauthorizedPage />;
  }

  return children;
}
```

**Alternative:** Refactor to separate components if needed.

---

## 🔴 Fix 2: Duplicate Imports (5 minutes)

### Fix 2a: ErrorBoundary.tsx

**File:** `components/ErrorBoundary.tsx` **Line:** 14

### Problem:

```typescript
import { NetworkManager } from '../lib/networkDiagnostics';
// ... other imports ...
import type { NetworkError } from '../lib/networkDiagnostics'; // Duplicate
```

### Solution:

```typescript
import {
  NetworkManager,
  type NetworkError,
  getUserFriendlyErrorMessage,
  isRetryableError,
} from '../lib/networkDiagnostics';
```

### Fix 2b: NetworkStatus.tsx

**File:** `components/NetworkStatus.tsx` **Line:** 22

Apply the same fix - combine all imports from the same module.

---

## 🔴 Fix 3: Switch Exhaustiveness (5 minutes)

**File:** `components/ErrorBoundary.tsx` **Line:** 123

### Problem:

```typescript
switch (error.type) {
  case 'NETWORK_ERROR':
    return <WifiOff className="h-8 w-8 text-red-500" />;
  case 'CORS_ERROR':
    return <Shield className="h-8 w-8 text-yellow-500" />;
  case 'TIMEOUT_ERROR':
    return <AlertTriangle className="h-8 w-8 text-orange-500" />;
  case 'AUTH_ERROR':
    return <Shield className="h-8 w-8 text-red-500" />;
  case 'SERVER_ERROR':
    return <Server className="h-8 w-8 text-red-500" />;
  default:
    return <AlertTriangle className="h-8 w-8 text-gray-500" />;
  // Missing: UNKNOWN_ERROR case
}
```

### Solution:

```typescript
switch (error.type) {
  case 'NETWORK_ERROR':
    return <WifiOff className="h-8 w-8 text-red-500" />;
  case 'CORS_ERROR':
    return <Shield className="h-8 w-8 text-yellow-500" />;
  case 'TIMEOUT_ERROR':
    return <AlertTriangle className="h-8 w-8 text-orange-500" />;
  case 'AUTH_ERROR':
    return <Shield className="h-8 w-8 text-red-500" />;
  case 'SERVER_ERROR':
    return <Server className="h-8 w-8 text-red-500" />;
  case 'UNKNOWN_ERROR':
    return <AlertTriangle className="h-8 w-8 text-gray-500" />;
  default:
    return <AlertTriangle className="h-8 w-8 text-gray-500" />;
}
```

---

## 🔴 Fix 4: Mark Members as Readonly (10 minutes)

**File:** `components/ErrorBoundary.tsx` **Lines:** 42, 122, 139, 179, 189

### Problem:

```typescript
export class ErrorBoundary extends Component<Props, State> {
  private networkManager?: NetworkManager; // Not readonly

  private getErrorIcon = (error: NetworkError) => { ... }; // Not readonly
  private getDiagnosticsInfo = () => { ... }; // Not readonly
  private getConnectionQualityText = (quality: string) => { ... }; // Not readonly
  private getSuggestedActions = (error: NetworkError) => { ... }; // Not readonly
}
```

### Solution:

```typescript
export class ErrorBoundary extends Component<Props, State> {
  private readonly networkManager?: NetworkManager;

  private readonly getErrorIcon = (error: NetworkError) => { ... };
  private readonly getDiagnosticsInfo = () => { ... };
  private readonly getConnectionQualityText = (quality: string) => { ... };
  private readonly getSuggestedActions = (error: NetworkError) => { ... };
}
```

---

## 🔴 Fix 5: Confusing Void Expression (5 minutes)

**File:** `components/ErrorBoundary.tsx` **Line:** 371

### Problem:

```typescript
<button onClick={() => this.setState({ hasError: false })}>
```

### Solution:

```typescript
<button onClick={() => { this.setState({ hasError: false }); }}>
```

Or better:

```typescript
private readonly handleReset = () => {
  this.setState({ hasError: false });
};

// Then use:
<button onClick={this.handleReset}>
```

---

## 🔴 Fix 6: Remove Console Statements (5 minutes)

**File:** `components/ErrorBoundary.tsx` **Lines:** 78, 103

### Problem:

```typescript
console.error('Failed to run network diagnostics:', error);
// and
console.error('Retry failed:', error);
```

### Solution:

```typescript
import { logger } from '../lib/logging/logger';

// Replace console.error with:
logger.error('Failed to run network diagnostics:', error);
logger.error('Retry failed:', error);
```

---

## 🔴 Fix 7: Restore Missing Type Exports (2-4 hours)

**File:** `types/index.ts`

### Missing Exports:

```typescript
// types/auth.ts - Add these exports:
export interface RegisterCredentials {
  email: string;
  password: string;
  name: string;
}

export interface AuthResponse {
  success: boolean;
  user?: User;
  error?: string;
}

// types/database.ts - Add:
export interface DonationFilters {
  status?: string;
  type?: string;
  dateFrom?: string;
  dateTo?: string;
}

// types/kumbara.ts - Add:
export interface KumbaraTransaction {
  id: string;
  kumbaraId: string;
  amount: number;
  date: string;
  type: 'deposit' | 'withdrawal';
}

export interface UseKumbaraOptions {
  kumbaraId?: string;
  autoRefresh?: boolean;
}

export interface UseKumbaraReturn {
  kumbara: Kumbara | null;
  transactions: KumbaraTransaction[];
  loading: boolean;
  error: string | null;
}

// types/search.ts - Add:
export interface SearchFilters {
  query?: string;
  category?: string;
  status?: string;
}

export interface SearchOptions {
  limit?: number;
  offset?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// types/stats.ts - Add:
export interface StatsData {
  total: number;
  active: number;
  inactive: number;
  trend: TrendData[];
}

export interface StatsFilters {
  period?: 'day' | 'week' | 'month' | 'year';
  category?: string;
}

export interface TrendData {
  date: string;
  value: number;
}

// types/validation.ts - Add:
export type ValidationRule = {
  rule: 'required' | 'email' | 'min' | 'max' | 'pattern';
  value?: any;
  message: string;
};

export type FormValidationSchema = {
  [key: string]: ValidationRule[];
};

export type ValidatorFunction = (value: any) => boolean | string;

// types/data.ts - Add:
export type ExportFormat = 'csv' | 'excel' | 'pdf' | 'json';

export type DataTransformer<T = any> = (data: T[]) => any[];

// types/monitoring.ts - Add:
export interface MonitoringEvent {
  type: string;
  timestamp: Date;
  data: any;
}

export interface ErrorLog {
  message: string;
  stack?: string;
  timestamp: Date;
}

// types/reporting.ts - Add:
export interface ReportConfig {
  format: ExportFormat;
  filters?: any;
  columns?: string[];
}

export interface ReportData {
  data: any[];
  metadata: any;
}

export interface ChartData {
  labels: string[];
  datasets: any[];
}

// types/supabase.ts - Add:
export interface SupabaseResponse<T> {
  data: T | null;
  error: Error | null;
}

export interface SupabaseQueryOptions {
  limit?: number;
  offset?: number;
  orderBy?: string;
}

export interface ConnectionStatus {
  connected: boolean;
  lastChecked: Date;
}

export interface BatchOperationResult<T> {
  success: T[];
  failed: Array<{ item: T; error: Error }>;
}
```

Then update `types/index.ts` to export these:

```typescript
// Add to types/index.ts:
export type { RegisterCredentials, AuthResponse } from './auth';

export type { DonationFilters } from './database';

export type {
  KumbaraTransaction,
  UseKumbaraOptions,
  UseKumbaraReturn,
} from './kumbara';

export type { SearchFilters, SearchOptions } from './search';

export type { StatsData, StatsFilters, TrendData } from './stats';

export type {
  ValidationRule,
  FormValidationSchema,
  ValidatorFunction,
} from './validation';

export type { ExportFormat, DataTransformer } from './data';

export type { MonitoringEvent, ErrorLog } from './monitoring';

export type { ReportConfig, ReportData, ChartData } from './reporting';

export type {
  SupabaseResponse,
  SupabaseQueryOptions,
  ConnectionStatus,
  BatchOperationResult,
} from './supabase';
```

---

## 🔴 Fix 8: Fix Beneficiary Type (1 hour)

**Files:**

- `types/beneficiary.ts`
- `types/database.ts`

### Problem:

The Beneficiary type uses English field names, but the database uses Turkish
names.

### Solution Option 1: Update Type to Match Database

```typescript
// types/beneficiary.ts
export interface Beneficiary {
  id: string;
  ad_soyad: string; // Full name
  kimlik_no: string; // ID number
  telefon_no: string; // Phone number
  sehri: string; // City
  adres: string; // Address
  uyruk: string; // Nationality
  ulkesi: string; // Country
  yerlesimi?: string; // Settlement
  mahalle?: string; // District
  kategori: string; // Category
  tur: string; // Type
  iban?: string; // Bank account
  durum?: string; // Status
  email?: string;
  created_at?: string;
  updated_at?: string;
}
```

### Solution Option 2: Add Field Mappers

```typescript
// Create a mapper utility
export const beneficiaryFieldMap = {
  fullName: 'ad_soyad',
  idNumber: 'kimlik_no',
  phoneNumber: 'telefon_no',
  city: 'sehri',
  address: 'adres',
  nationality: 'uyruk',
  country: 'ulkesi',
  settlement: 'yerlesimi',
  district: 'mahalle',
  category: 'kategori',
  type: 'tur',
  status: 'durum',
} as const;

// Use in components:
const fullName = beneficiary[beneficiaryFieldMap.fullName];
```

**Recommendation:** Use Option 1 for consistency with database.

---

## 🔴 Fix 9: Fix Test Failures (2-3 hours)

### Fix Enhanced Supabase Service Tests

**File:** `services/__tests__/enhancedSupabaseService.test.ts`

The main issue is that NetworkManager is not properly mocked.

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { EnhancedSupabaseService } from '../enhancedSupabaseService';
import { NetworkManager } from '@/lib/networkDiagnostics';

// Mock NetworkManager
vi.mock('@/lib/networkDiagnostics', () => ({
  NetworkManager: {
    getInstance: vi.fn(() => ({
      testConnectivity: vi.fn().mockResolvedValue({
        isOnline: true,
        canReachSupabase: true,
        canReachInternet: true,
        connectionQuality: 'excellent',
      }),
    })),
  },
  getUserFriendlyErrorMessage: vi.fn((error) => error.message),
  isRetryableError: vi.fn(() => true),
}));

// Update test setup
beforeEach(() => {
  vi.clearAllMocks();

  // Mock Supabase client methods
  const mockFrom = vi.fn(() => ({
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({
      data: { id: 1, name: 'Test' },
      error: null,
    }),
  }));

  vi.spyOn(supabase, 'from').mockImplementation(mockFrom);
});
```

### Fix CSRF Token Tests

**File:** `hooks/__tests__/useCSRFToken.test.ts`

The issue is sessionStorage is not properly cleared between tests.

```typescript
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useCSRFToken } from '../useCSRFToken';

// Properly mock sessionStorage
const sessionStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'sessionStorage', {
  value: sessionStorageMock,
});

beforeEach(() => {
  sessionStorageMock.clear();
  vi.clearAllMocks();
});

afterEach(() => {
  sessionStorageMock.clear();
});
```

---

## Quick Commands

Run these after making fixes:

```bash
# Check if type errors are fixed
npm run type-check

# Check if tests pass
npm test -- --run

# Check if linting is clean
npm run lint

# Build to verify everything works
npm run build
```

---

## Verification Checklist

After applying fixes:

- [ ] `npm run type-check` passes with 0 errors
- [ ] `npm test -- --run` shows all tests passing
- [ ] `npm run lint` shows 0 errors
- [ ] `npm run build` completes successfully
- [ ] Manual smoke test of key pages works

---

**Estimated Total Time:** 6-8 hours for all critical fixes

**Priority Order:**

1. React Hooks violations (breaks runtime)
2. Type exports (breaks builds)
3. ESLint errors (code quality)
4. Test failures (CI/CD)

Good luck! 🚀
