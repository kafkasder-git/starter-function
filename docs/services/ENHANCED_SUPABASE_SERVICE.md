# Enhanced Supabase Service Documentation

## Overview

The Enhanced Supabase Service is a robust wrapper around the Supabase client
that provides enhanced error handling, automatic retry logic, network
diagnostics, and user-friendly error messages. It serves as a drop-in
replacement for direct Supabase usage in applications requiring high reliability
and better user experience.

### Purpose

This service addresses common issues with direct Supabase usage:

- **Network instability**: Automatic retries with exponential backoff
- **Poor error messages**: User-friendly Turkish error messages
- **Timeout handling**: Configurable timeouts with abort controllers
- **Connection diagnostics**: Built-in connectivity testing
- **Type safety**: Enhanced TypeScript generics for better development
  experience

### When to Use vs Direct Supabase

**Use Enhanced Supabase Service when:**

- Building user-facing applications where reliability is critical
- Dealing with unreliable network conditions
- Needing Turkish error messages for end users
- Requiring automatic retry logic
- Wanting detailed connection diagnostics

**Use Direct Supabase when:**

- Building internal tools or admin panels
- Network conditions are guaranteed stable
- Custom error handling is preferred
- Performance is critical and retries are not needed

### Key Features

- **Automatic Retries**: Exponential backoff retry logic for network and server
  errors
- **Network Diagnostics**: Comprehensive connectivity testing and diagnostics
- **Timeout Handling**: Configurable timeouts with proper abort controllers
- **User-Friendly Errors**: Turkish error messages for better UX
- **Type Safety**: Enhanced TypeScript generics and interfaces
- **Batch Operations**: Efficient bulk insert/update/delete operations
- **Connection Testing**: Detailed connection status with latency metrics
- **Singleton Pattern**: Consistent instance across the application

## Architecture

### Singleton Pattern

The service implements a singleton pattern to ensure consistent behavior and
resource management across the application:

```typescript
export class EnhancedSupabaseService {
  private static instance: EnhancedSupabaseService;

  static getInstance(): EnhancedSupabaseService {
    if (!EnhancedSupabaseService.instance) {
      EnhancedSupabaseService.instance = new EnhancedSupabaseService();
    }
    return EnhancedSupabaseService.instance;
  }
}

export const enhancedSupabase = EnhancedSupabaseService.getInstance();
```

### Integration with Network Diagnostics

The service integrates with `NetworkManager` from `lib/networkDiagnostics.ts`
for:

- Pre-flight network connectivity checks
- Connection quality assessment
- User-friendly error message generation
- Diagnostic information gathering

### Error Handling Flow

```
Request → Network Check → Execute Query → Success
    ↓              ↓              ↓
  Error → Determine Type → Retry? → Yes → Backoff Delay → Execute Query
    ↓              ↓              ↓
  Error → User Message → Return Error Response
```

### Retry Logic

The service implements exponential backoff retry logic:

- **Base delay**: 1000ms
- **Multiplier**: 2^attempt
- **Max delay**: 5000ms
- **Retryable errors**: NETWORK_ERROR, TIMEOUT_ERROR, SERVER_ERROR
- **Non-retryable errors**: AUTH_ERROR, client errors (4xx)

## API Reference

### Core Types

```typescript
export interface SupabaseResponse<T> {
  data: T | null;
  error: NetworkError | null;
  success: boolean;
  metadata?: {
    retryCount: number;
    latency: number;
    timestamp: string;
  };
}

export interface BatchOperationResult<T> {
  successful: T[];
  failed: Array<{ data: any; error: NetworkError }>;
  totalCount: number;
  successCount: number;
  failureCount: number;
}

export interface ConnectionStatus {
  connected: boolean;
  latency?: number;
  endpoint?: string;
  error?: string;
  timestamp: string;
}

export interface SupabaseQueryOptions {
  retries?: number;
  timeout?: number;
  fallbackData?: any;
  retryStrategy?: RetryStrategy;
  checkNetwork?: boolean;
  single?: boolean;
}
```

### Public Methods

#### `query<T>(table: string, queryBuilder: QueryBuilderFn<T>, options?: SupabaseQueryOptions): Promise<SupabaseResponse<T>>`

Executes a flexible query with error handling and retries.

**Parameters:**

- `table`: The table name to query
- `queryBuilder`: Function that builds the query using Supabase query builder
- `options`: Query options (retries, timeout, etc.)

**Returns:** Promise resolving to `SupabaseResponse<T>`

**Throws:** NetworkError on unrecoverable errors

#### `insert<T>(table: string, data: any, options?: SupabaseQueryOptions): Promise<SupabaseResponse<T | T[]>>`

Inserts data with error handling and retries.

**Parameters:**

- `table`: The table name to insert into
- `data`: Data to insert (single object or array)
- `options`: Insert options including `single` flag

**Returns:** Promise resolving to `SupabaseResponse<T | T[]>`

#### `update<T>(table: string, data: any, filter: any, options?: SupabaseQueryOptions): Promise<SupabaseResponse<T | T[]>>`

Updates data with error handling and retries.

**Parameters:**

- `table`: The table name to update
- `data`: Data to update
- `filter`: Filter criteria for update
- `options`: Update options including `single` flag

**Returns:** Promise resolving to `SupabaseResponse<T | T[]>`

#### `delete<T>(table: string, filter: any, options?: SupabaseQueryOptions): Promise<SupabaseResponse<T | T[]>>`

Deletes data with error handling and retries.

**Parameters:**

- `table`: The table name to delete from
- `filter`: Filter criteria for delete
- `options`: Delete options including `single` flag

**Returns:** Promise resolving to `SupabaseResponse<T | T[]>`

#### `batchInsert<T>(table: string, data: any[], options?: SupabaseQueryOptions): Promise<BatchOperationResult<T>>`

Performs batch insert operations.

**Parameters:**

- `table`: The table name to insert into
- `data`: Array of data objects to insert
- `options`: Batch insert options

**Returns:** Promise resolving to `BatchOperationResult<T>`

#### `batchUpdate<T>(table: string, updates: Array<{ data: any; filter: any }>, options?: SupabaseQueryOptions): Promise<BatchOperationResult<T>>`

Performs batch update operations.

**Parameters:**

- `table`: The table name to update
- `updates`: Array of update objects with data and filter
- `options`: Batch update options

**Returns:** Promise resolving to `BatchOperationResult<T>`

#### `batchDelete<T>(table: string, filters: any[], options?: SupabaseQueryOptions): Promise<BatchOperationResult<T>>`

Performs batch delete operations.

**Parameters:**

- `table`: The table name to delete from
- `filters`: Array of filter objects
- `options`: Batch delete options

**Returns:** Promise resolving to `BatchOperationResult<T>`

#### `buildQuery<T>(table: string): QueryBuilder<T>`

Returns a query builder for flexible query construction.

**Parameters:**

- `table`: The table name

**Returns:** QueryBuilder instance

#### `testConnection(): Promise<ConnectionStatus>`

Tests Supabase connection with detailed diagnostics.

**Returns:** Promise resolving to `ConnectionStatus`

#### `getDiagnostics(): Promise<NetworkDiagnostics>`

Returns current network diagnostics information.

**Returns:** Network diagnostics object

## Usage Examples

### Basic Query Example

```typescript
import { enhancedSupabase } from '@/services/enhancedSupabaseService';

const result = await enhancedSupabase.query<Beneficiary[]>(
  'beneficiaries',
  (qb) => qb.select('*').eq('status', 'active'),
  { retries: 3, timeout: 30000 },
);

if (result.success) {
  console.log('Data:', result.data);
} else {
  console.error('Error:', result.error.message);
}
```

### Insert with Error Handling

```typescript
const result = await enhancedSupabase.insert<Beneficiary>(
  'beneficiaries',
  { name: 'John Doe', status: 'active' },
  { retries: 2 },
);

if (result.success) {
  console.log('Inserted:', result.data);
} else {
  // Error is already user-friendly in Turkish
  alert(result.error.message);
}
```

### Batch Operations

```typescript
const result = await enhancedSupabase.batchInsert<Beneficiary>(
  'beneficiaries',
  [
    { name: 'John', status: 'active' },
    { name: 'Jane', status: 'active' },
  ],
);

console.log(`Successfully inserted: ${result.successCount}`);
console.log(`Failed: ${result.failureCount}`);
```

### Connection Testing

```typescript
const status = await enhancedSupabase.testConnection();
if (!status.connected) {
  console.error('Connection failed:', status.error);
  console.log('Latency:', status.latency, 'ms');
} else {
  console.log('Connected successfully');
}
```

### Advanced Query Building

```typescript
const qb = enhancedSupabase.buildQuery<Beneficiary>('beneficiaries');
const result = await qb
  .select('name, status, created_at')
  .eq('status', 'active')
  .order('created_at', { ascending: false })
  .limit(10);
```

## Integration Guide

### Migrating from Direct Supabase

**Before (Direct Supabase):**

```typescript
const { data, error } = await supabase
  .from('beneficiaries')
  .select('*')
  .eq('status', 'active');

if (error) {
  console.error('Error:', error.message);
  // Handle error manually
}
```

**After (Enhanced Supabase):**

```typescript
const result = await enhancedSupabase.query<Beneficiary[]>(
  'beneficiaries',
  (qb) => qb.select('*').eq('status', 'active'),
);

if (!result.success) {
  console.error('Error:', result.error.message);
  // Error message is already user-friendly
}
```

### Integrating with Existing Services

To integrate with services like `BeneficiariesService`:

```typescript
// In BeneficiariesService.ts
import { enhancedSupabase } from '../enhancedSupabaseService';

export class BeneficiariesService {
  async getActiveBeneficiaries(): Promise<ApiResponse<Beneficiary[]>> {
    const result = await enhancedSupabase.query<Beneficiary[]>(
      'beneficiaries',
      (qb) => qb.select('*').eq('status', 'active'),
      { retries: 3, timeout: 30000 },
    );

    if (result.success) {
      return { data: result.data, error: null };
    } else {
      return { data: null, error: result.error.message };
    }
  }
}
```

### Best Practices

1. **Always check `result.success`** instead of checking for error
2. **Use TypeScript generics** for better type safety
3. **Configure timeouts** appropriately for your use case
4. **Handle batch operation failures** gracefully
5. **Test connection status** before critical operations

### Performance Considerations

- **Batch operations** are more efficient than individual operations
- **Disable network checks** (`checkNetwork: false`) for internal operations
- **Adjust retry counts** based on operation criticality
- **Use appropriate timeouts** to prevent hanging requests

## Error Handling Guide

### Error Types

| Error Type      | When it Occurs                    | User Message (Turkish)                                                 |
| --------------- | --------------------------------- | ---------------------------------------------------------------------- |
| `NETWORK_ERROR` | Network connectivity issues       | Bağlantı hatası. İnternet bağlantınızı kontrol edin ve tekrar deneyin. |
| `CORS_ERROR`    | Cross-origin request blocked      | Güvenlik nedeniyle istek engellendi. Lütfen daha sonra tekrar deneyin. |
| `TIMEOUT_ERROR` | Request timeout                   | Sunucu yanıt vermiyor. Lütfen daha sonra tekrar deneyin.               |
| `AUTH_ERROR`    | Authentication failures (401/403) | Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.                      |
| `SERVER_ERROR`  | Server errors (5xx)               | Sunucu hatası oluştu. Lütfen daha sonra tekrar deneyin.                |
| `UNKNOWN_ERROR` | Unexpected errors                 | Bilinmeyen bir hata oluştu. Lütfen daha sonra tekrar deneyin.          |

### Handling Errors in UI

```typescript
const handleSupabaseOperation = async () => {
  const result = await enhancedSupabase.query<Beneficiary[]>(
    'beneficiaries',
    (qb) => qb.select('*'),
  );

  if (!result.success) {
    switch (result.error.type) {
      case 'AUTH_ERROR':
        // Redirect to login
        redirectToLogin();
        break;
      case 'NETWORK_ERROR':
      case 'TIMEOUT_ERROR':
        // Show retry option
        showRetryDialog(result.error.message);
        break;
      default:
        // Show generic error
        showErrorToast(result.error.message);
    }
  }
};
```

### Turkish Error Messages Reference

All error messages are automatically translated to Turkish using
`getUserFriendlyErrorMessage()` from `networkDiagnostics.ts`. The messages are
designed to be user-friendly and actionable.

## Testing Guide

### Mocking the Service

```typescript
// In test files
import { vi } from 'vitest';
import { enhancedSupabase } from '@/services/enhancedSupabaseService';

// Mock the entire service
vi.mock('@/services/enhancedSupabaseService', () => ({
  enhancedSupabase: {
    query: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    testConnection: vi.fn(),
  },
}));
```

### Example Test Cases

```typescript
describe('EnhancedSupabaseService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('query', () => {
    it('should successfully query data', async () => {
      const mockData = [{ id: 1, name: 'Test' }];
      (enhancedSupabase.query as any).mockResolvedValue({
        data: mockData,
        error: null,
        success: true,
      });

      const result = await enhancedSupabase.query('test', (qb) =>
        qb.select('*'),
      );

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockData);
    });

    it('should handle network errors with retry', async () => {
      (enhancedSupabase.query as any)
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({
          data: [],
          error: null,
          success: true,
        });

      const result = await enhancedSupabase.query('test', (qb) =>
        qb.select('*'),
      );

      expect(enhancedSupabase.query).toHaveBeenCalledTimes(2);
      expect(result.success).toBe(true);
    });
  });
});
```

See `services/__tests__/enhancedSupabaseService.test.ts` for comprehensive test
examples.

## Troubleshooting

### Common Issues and Solutions

**Issue: "Connection failed" errors**

- Check internet connectivity
- Verify Supabase URL and keys
- Use `testConnection()` to diagnose

**Issue: Timeout errors**

- Increase timeout value in options
- Check network latency
- Verify Supabase service status

**Issue: Authentication errors**

- Check if user session is valid
- Refresh authentication tokens
- Verify RLS policies

**Issue: High latency**

- Use batch operations for multiple records
- Implement caching strategies
- Optimize query structure

### Debugging Tips

1. **Enable detailed logging**:

```typescript
// Logs are automatically handled by the logger
// Check console for detailed error information
```

2. **Use connection diagnostics**:

```typescript
const diagnostics = await enhancedSupabase.getDiagnostics();
console.log('Network status:', diagnostics);
```

3. **Test specific operations**:

```typescript
const status = await enhancedSupabase.testConnection();
console.log('Connection details:', status);
```

### Network Diagnostics Usage

```typescript
// Get comprehensive network diagnostics
const diagnostics = await enhancedSupabase.getDiagnostics();

if (!diagnostics.canReachSupabase) {
  console.error('Cannot reach Supabase servers');
}

if (diagnostics.connectionQuality === 'poor') {
  console.warn('Poor connection quality detected');
}
```

## Migration Guide

### Step-by-Step Migration

1. **Import the service**:

```typescript
import { enhancedSupabase } from '@/services/enhancedSupabaseService';
```

2. **Replace direct Supabase calls**:

```typescript
// Before
const { data, error } = await supabase.from('table').select('*');

// After
const result = await enhancedSupabase.query('table', (qb) => qb.select('*'));
```

3. **Update error handling**:

```typescript
// Before
if (error) {
  console.error(error.message);
}

// After
if (!result.success) {
  console.error(result.error.message); // Already user-friendly
}
```

4. **Update return value handling**:

```typescript
// Before
return { data, error };

// After
return result.success
  ? { data: result.data, error: null }
  : { data: null, error: result.error.message };
```

### Code Comparison

**Before (Direct Supabase):**

```typescript
async function getBeneficiaries() {
  try {
    const { data, error } = await supabase
      .from('beneficiaries')
      .select('*')
      .eq('status', 'active');

    if (error) {
      logger.error('Failed to fetch beneficiaries:', error);
      return { data: null, error: error.message };
    }

    return { data, error: null };
  } catch (error) {
    logger.error('Unexpected error:', error);
    return { data: null, error: 'Unexpected error' };
  }
}
```

**After (Enhanced Supabase):**

```typescript
async function getBeneficiaries() {
  const result = await enhancedSupabase.query<Beneficiary[]>(
    'beneficiaries',
    (qb) => qb.select('*').eq('status', 'active'),
    { retries: 3, timeout: 30000 },
  );

  return result.success
    ? { data: result.data, error: null }
    : { data: null, error: result.error.message };
}
```

### Breaking Changes

- **Return types**: Now returns `SupabaseResponse<T>` instead of
  `{ data, error }`
- **Error format**: Errors are now `NetworkError` objects with user-friendly
  messages
- **Query building**: Requires function wrapper for query builder
- **Type safety**: Requires explicit generic types

### Rollback Strategy

To rollback to direct Supabase usage:

1. Replace `enhancedSupabase.query()` calls with direct
   `supabase.from().select()` calls
2. Update error handling to check `error` instead of `!result.success`
3. Remove generic types if not needed
4. Revert to manual retry logic if required

## Performance Optimization

### Retry Strategy Tuning

```typescript
// For critical operations
const result = await enhancedSupabase.query(
  'critical_data',
  (qb) => qb.select('*'),
  { retries: 5, timeout: 60000 },
);

// For non-critical operations
const result = await enhancedSupabase.query(
  'cacheable_data',
  (qb) => qb.select('*'),
  { retries: 1, timeout: 10000 },
);
```

### Timeout Configuration

- **Fast operations** (simple queries): 5000-10000ms
- **Complex operations** (with joins): 15000-30000ms
- **File uploads**: 60000-120000ms
- **Batch operations**: 30000-60000ms

### Batch Operation Best Practices

```typescript
// Good: Use batch operations for multiple records
const result = await enhancedSupabase.batchInsert(
  'beneficiaries',
  beneficiaries,
);

// Avoid: Individual inserts in a loop
for (const beneficiary of beneficiaries) {
  await enhancedSupabase.insert('beneficiaries', beneficiary);
}
```

### Caching Considerations

```typescript
// Implement caching for frequently accessed data
class CachedBeneficiariesService {
  private cache: Map<string, { data: Beneficiary[]; timestamp: number }> =
    new Map();

  async getActiveBeneficiaries(): Promise<SupabaseResponse<Beneficiary[]>> {
    const cacheKey = 'active_beneficiaries';
    const cached = this.cache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < 300000) {
      // 5 minutes
      return { data: cached.data, error: null, success: true };
    }

    const result = await enhancedSupabase.query<Beneficiary[]>(
      'beneficiaries',
      (qb) => qb.select('*').eq('status', 'active'),
    );

    if (result.success) {
      this.cache.set(cacheKey, { data: result.data, timestamp: Date.now() });
    }

    return result;
  }
}
```

### Connection Pooling and Reuse

The singleton pattern ensures connection reuse across the application, reducing
overhead and improving performance. Always use the exported `enhancedSupabase`
instance instead of creating new instances.
