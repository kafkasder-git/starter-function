import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { enhancedSupabase, EnhancedSupabaseService } from '../enhancedSupabaseService';

// Mock dependencies
vi.mock('../../lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
  },
}));

vi.mock('../../lib/networkDiagnostics', () => ({
  NetworkManager: {
    getInstance: vi.fn(() => ({
      testConnectivity: vi.fn(),
      getDiagnostics: vi.fn(),
    })),
  },
  getUserFriendlyErrorMessage: vi.fn(),
}));

vi.mock('../../lib/logging/logger', () => ({
  logger: {
    error: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
  },
}));

// Import mocked modules
import { supabase } from '../../lib/supabase';
import { NetworkManager, getUserFriendlyErrorMessage } from '../../lib/networkDiagnostics';
import { logger } from '../../lib/logging/logger';

// Mock data factories
const createMockSupabaseResponse = (data: any = null, error: any = null) => ({
  data,
  error,
});

const createMockNetworkDiagnostics = (overrides = {}) => ({
  isOnline: true,
  canReachSupabase: true,
  canReachInternet: true,
  connectionQuality: 'excellent' as const,
  ...overrides,
});

const createMockError = (type: string, message: string, code?: string) => ({
  message,
  code,
  type,
});

describe('EnhancedSupabaseService', () => {
  let networkManagerMock: any;
  let supabaseMock: any;

  beforeEach(() => {
    vi.clearAllMocks();

    // Setup NetworkManager mock
    networkManagerMock = {
      testConnectivity: vi.fn(),
      getDiagnostics: vi.fn(),
    };
    (NetworkManager.getInstance as any).mockReturnValue(networkManagerMock);

    // Setup Supabase mock
    supabaseMock = {
      from: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(),
          abortSignal: vi.fn(),
        })),
        insert: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn(),
          })),
        })),
        update: vi.fn(() => ({
          match: vi.fn(() => ({
            select: vi.fn(() => ({
              single: vi.fn(),
            })),
          })),
        })),
        delete: vi.fn(() => ({
          match: vi.fn(() => ({
            select: vi.fn(() => ({
              single: vi.fn(),
            })),
          })),
        })),
      })),
    };
    (supabase.from as any).mockImplementation((table: string) => supabaseMock.from(table));
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Singleton Pattern', () => {
    it('should return same instance on multiple getInstance calls', () => {
      const instance1 = EnhancedSupabaseService.getInstance();
      const instance2 = EnhancedSupabaseService.getInstance();

      expect(instance1).toBe(instance2);
      expect(instance1).toBe(enhancedSupabase);
    });

    it('should maintain state across calls', () => {
      const instance1 = EnhancedSupabaseService.getInstance();
      const instance2 = EnhancedSupabaseService.getInstance();

      expect(instance1.networkManager).toBe(instance2.networkManager);
    });
  });

  describe('Query Method', () => {
    it('should successfully query data with proper network connectivity', async () => {
      const mockData = [{ id: 1, name: 'Test' }];
      const mockResponse = createMockSupabaseResponse(mockData);

      networkManagerMock.testConnectivity.mockResolvedValue(createMockNetworkDiagnostics());

      const selectMock = vi.fn().mockResolvedValue(mockResponse);
      const fromMock = supabaseMock.from('test_table');
      fromMock.select.mockReturnValue({
        abortSignal: vi.fn().mockReturnValue({
          single: selectMock,
        }),
      });

      const result = await enhancedSupabase.query('test_table', (qb) => qb.select('*'), {
        timeout: 5000,
      });

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockData);
      expect(result.error).toBeNull();
      expect(networkManagerMock.testConnectivity).toHaveBeenCalled();
    });

    it('should return fallback data when Supabase is unreachable', async () => {
      const fallbackData = [{ id: 0, name: 'Fallback' }];

      networkManagerMock.testConnectivity.mockResolvedValue(
        createMockNetworkDiagnostics({
          canReachSupabase: false,
        }),
      );

      const result = await enhancedSupabase.query('test_table', (qb) => qb.select('*'), {
        fallbackData,
      });

      expect(result.success).toBe(false);
      expect(result.data).toEqual(fallbackData);
      expect(result.error).toBeDefined();
      expect(result.error?.type).toBe('NETWORK_ERROR');
    });

    it('should retry on network errors', async () => {
      const mockData = [{ id: 1, name: 'Test' }];
      const networkError = createMockError('NETWORK_ERROR', 'Network failed');

      networkManagerMock.testConnectivity.mockResolvedValue(createMockNetworkDiagnostics());

      let callCount = 0;
      const selectMock = vi.fn().mockImplementation(() => {
        callCount++;
        if (callCount < 3) {
          return Promise.resolve(createMockSupabaseResponse(null, networkError));
        }
        return Promise.resolve(createMockSupabaseResponse(mockData));
      });

      const fromMock = supabaseMock.from('test_table');
      fromMock.select.mockReturnValue({
        abortSignal: vi.fn().mockReturnValue({
          single: selectMock,
        }),
      });

      const result = await enhancedSupabase.query('test_table', (qb) => qb.select('*'), {
        retries: 3,
      });

      expect(callCount).toBe(3);
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockData);
    });

    it('should handle timeout errors with abort controller', async () => {
      networkManagerMock.testConnectivity.mockResolvedValue(createMockNetworkDiagnostics());

      const selectMock = vi
        .fn()
        .mockImplementation(
          () =>
            new Promise((resolve) => setTimeout(() => resolve(createMockSupabaseResponse()), 100)),
        );

      const fromMock = supabaseMock.from('test_table');
      fromMock.select.mockReturnValue({
        abortSignal: vi.fn().mockReturnValue({
          single: selectMock,
        }),
      });

      const result = await enhancedSupabase.query(
        'test_table',
        (qb) => qb.select('*'),
        { timeout: 50 }, // Very short timeout
      );

      expect(result.success).toBe(false);
      expect(result.error?.type).toBe('TIMEOUT_ERROR');
    });

    it('should not retry on client errors (4xx)', async () => {
      const clientError = createMockError('AUTH_ERROR', 'Unauthorized', '401');

      networkManagerMock.testConnectivity.mockResolvedValue(createMockNetworkDiagnostics());

      const selectMock = vi.fn().mockResolvedValue(createMockSupabaseResponse(null, clientError));

      const fromMock = supabaseMock.from('test_table');
      fromMock.select.mockReturnValue({
        abortSignal: vi.fn().mockReturnValue({
          single: selectMock,
        }),
      });

      const result = await enhancedSupabase.query('test_table', (qb) => qb.select('*'), {
        retries: 3,
      });

      expect(selectMock).toHaveBeenCalledTimes(1); // No retries
      expect(result.success).toBe(false);
      expect(result.error?.type).toBe('AUTH_ERROR');
    });

    it('should handle abort signal properly', async () => {
      networkManagerMock.testConnectivity.mockResolvedValue(createMockNetworkDiagnostics());

      const abortController = new AbortController();
      abortController.abort();

      const selectMock = vi.fn().mockRejectedValue(new Error('Aborted'));

      const fromMock = supabaseMock.from('test_table');
      fromMock.select.mockReturnValue({
        abortSignal: vi.fn().mockReturnValue({
          single: selectMock,
        }),
      });

      const result = await enhancedSupabase.query('test_table', (qb) => qb.select('*'), {
        timeout: 5000,
      });

      expect(result.success).toBe(false);
      expect(result.error?.type).toBe('TIMEOUT_ERROR');
    });
  });

  describe('Insert Method', () => {
    it('should successfully insert single record', async () => {
      const mockData = { id: 1, name: 'Test' };
      const mockResponse = createMockSupabaseResponse(mockData);

      networkManagerMock.testConnectivity.mockResolvedValue(createMockNetworkDiagnostics());

      const insertMock = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue(mockResponse),
        }),
      });

      const fromMock = supabaseMock.from('test_table');
      fromMock.insert.mockReturnValue(insertMock);

      const result = await enhancedSupabase.insert('test_table', mockData);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockData);
      expect(networkManagerMock.testConnectivity).toHaveBeenCalled();
    });

    it('should successfully insert multiple records when single=false', async () => {
      const mockData = [
        { id: 1, name: 'Test1' },
        { id: 2, name: 'Test2' },
      ];
      const mockResponse = createMockSupabaseResponse(mockData);

      networkManagerMock.testConnectivity.mockResolvedValue(createMockNetworkDiagnostics());

      const insertMock = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue(mockResponse), // No single() call
      });

      const fromMock = supabaseMock.from('test_table');
      fromMock.insert.mockReturnValue(insertMock);

      const result = await enhancedSupabase.insert('test_table', mockData, { single: false });

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockData);
    });

    it('should retry on retryable errors', async () => {
      const mockData = { id: 1, name: 'Test' };
      const networkError = createMockError('NETWORK_ERROR', 'Network failed');

      networkManagerMock.testConnectivity.mockResolvedValue(createMockNetworkDiagnostics());

      let callCount = 0;
      const singleMock = vi.fn().mockImplementation(() => {
        callCount++;
        if (callCount < 2) {
          return Promise.resolve(createMockSupabaseResponse(null, networkError));
        }
        return Promise.resolve(createMockSupabaseResponse(mockData));
      });

      const insertMock = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: singleMock,
        }),
      });

      const fromMock = supabaseMock.from('test_table');
      fromMock.insert.mockReturnValue(insertMock);

      const result = await enhancedSupabase.insert('test_table', mockData, { retries: 2 });

      expect(callCount).toBe(2);
      expect(result.success).toBe(true);
    });

    it('should not retry on validation errors', async () => {
      const mockData = { id: 1, name: 'Test' };
      const validationError = createMockError('SERVER_ERROR', 'Validation failed', '400');

      networkManagerMock.testConnectivity.mockResolvedValue(createMockNetworkDiagnostics());

      const singleMock = vi
        .fn()
        .mockResolvedValue(createMockSupabaseResponse(null, validationError));

      const insertMock = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: singleMock,
        }),
      });

      const fromMock = supabaseMock.from('test_table');
      fromMock.insert.mockReturnValue(insertMock);

      const result = await enhancedSupabase.insert('test_table', mockData, { retries: 3 });

      expect(singleMock).toHaveBeenCalledTimes(1); // No retries
      expect(result.success).toBe(false);
    });

    it('should check network connectivity before insert', async () => {
      const mockData = { id: 1, name: 'Test' };

      networkManagerMock.testConnectivity.mockResolvedValue(
        createMockNetworkDiagnostics({
          canReachSupabase: false,
        }),
      );

      const result = await enhancedSupabase.insert('test_table', mockData);

      expect(networkManagerMock.testConnectivity).toHaveBeenCalled();
      expect(result.success).toBe(false);
      expect(result.error?.type).toBe('NETWORK_ERROR');
    });
  });

  describe('Update Method', () => {
    it('should successfully update single record', async () => {
      const mockData = { name: 'Updated Test' };
      const filter = { id: 1 };
      const mockResponse = createMockSupabaseResponse(mockData);

      networkManagerMock.testConnectivity.mockResolvedValue(createMockNetworkDiagnostics());

      const updateMock = vi.fn().mockReturnValue({
        match: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue(mockResponse),
          }),
        }),
      });

      const fromMock = supabaseMock.from('test_table');
      fromMock.update.mockReturnValue(updateMock);

      const result = await enhancedSupabase.update('test_table', mockData, filter);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockData);
      expect(networkManagerMock.testConnectivity).toHaveBeenCalled();
    });

    it('should successfully update multiple records when single=false', async () => {
      const mockData = { status: 'active' };
      const filter = { category: 'test' };
      const mockResponse = createMockSupabaseResponse([mockData, mockData]);

      networkManagerMock.testConnectivity.mockResolvedValue(createMockNetworkDiagnostics());

      const updateMock = vi.fn().mockReturnValue({
        match: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue(mockResponse), // No single() call
        }),
      });

      const fromMock = supabaseMock.from('test_table');
      fromMock.update.mockReturnValue(updateMock);

      const result = await enhancedSupabase.update('test_table', mockData, filter, {
        single: false,
      });

      expect(result.success).toBe(true);
      expect(result.data).toEqual([mockData, mockData]);
    });

    it('should retry on network errors', async () => {
      const mockData = { name: 'Updated Test' };
      const filter = { id: 1 };
      const networkError = createMockError('NETWORK_ERROR', 'Network failed');

      networkManagerMock.testConnectivity.mockResolvedValue(createMockNetworkDiagnostics());

      let callCount = 0;
      const singleMock = vi.fn().mockImplementation(() => {
        callCount++;
        if (callCount < 2) {
          return Promise.resolve(createMockSupabaseResponse(null, networkError));
        }
        return Promise.resolve(createMockSupabaseResponse(mockData));
      });

      const updateMock = vi.fn().mockReturnValue({
        match: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: singleMock,
          }),
        }),
      });

      const fromMock = supabaseMock.from('test_table');
      fromMock.update.mockReturnValue(updateMock);

      const result = await enhancedSupabase.update('test_table', mockData, filter, { retries: 2 });

      expect(callCount).toBe(2);
      expect(result.success).toBe(true);
    });

    it('should handle filter matching correctly', async () => {
      const mockData = { name: 'Updated Test' };
      const filter = { id: 1, status: 'active' };
      const mockResponse = createMockSupabaseResponse(mockData);

      networkManagerMock.testConnectivity.mockResolvedValue(createMockNetworkDiagnostics());

      const matchMock = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue(mockResponse),
        }),
      });

      const updateMock = vi.fn().mockReturnValue({
        match: matchMock,
      });

      const fromMock = supabaseMock.from('test_table');
      fromMock.update.mockReturnValue(updateMock);

      await enhancedSupabase.update('test_table', mockData, filter);

      expect(matchMock).toHaveBeenCalledWith(filter);
    });

    it('should check network connectivity before update', async () => {
      const mockData = { name: 'Updated Test' };
      const filter = { id: 1 };

      networkManagerMock.testConnectivity.mockResolvedValue(
        createMockNetworkDiagnostics({
          canReachSupabase: false,
        }),
      );

      const result = await enhancedSupabase.update('test_table', mockData, filter);

      expect(networkManagerMock.testConnectivity).toHaveBeenCalled();
      expect(result.success).toBe(false);
      expect(result.error?.type).toBe('NETWORK_ERROR');
    });
  });

  describe('Delete Method', () => {
    it('should successfully delete single record', async () => {
      const filter = { id: 1 };
      const mockResponse = createMockSupabaseResponse({ id: 1 });

      networkManagerMock.testConnectivity.mockResolvedValue(createMockNetworkDiagnostics());

      const deleteMock = vi.fn().mockReturnValue({
        match: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue(mockResponse),
          }),
        }),
      });

      const fromMock = supabaseMock.from('test_table');
      fromMock.delete.mockReturnValue(deleteMock);

      const result = await enhancedSupabase.delete('test_table', filter);

      expect(result.success).toBe(true);
      expect(result.data).toEqual({ id: 1 });
      expect(networkManagerMock.testConnectivity).toHaveBeenCalled();
    });

    it('should successfully delete multiple records when single=false', async () => {
      const filter = { category: 'test' };
      const mockResponse = createMockSupabaseResponse([{ id: 1 }, { id: 2 }]);

      networkManagerMock.testConnectivity.mockResolvedValue(createMockNetworkDiagnostics());

      const deleteMock = vi.fn().mockReturnValue({
        match: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue(mockResponse), // No single() call
        }),
      });

      const fromMock = supabaseMock.from('test_table');
      fromMock.delete.mockReturnValue(deleteMock);

      const result = await enhancedSupabase.delete('test_table', filter, { single: false });

      expect(result.success).toBe(true);
      expect(result.data).toEqual([{ id: 1 }, { id: 2 }]);
    });

    it('should retry on retryable errors', async () => {
      const filter = { id: 1 };
      const networkError = createMockError('NETWORK_ERROR', 'Network failed');

      networkManagerMock.testConnectivity.mockResolvedValue(createMockNetworkDiagnostics());

      let callCount = 0;
      const singleMock = vi.fn().mockImplementation(() => {
        callCount++;
        if (callCount < 2) {
          return Promise.resolve(createMockSupabaseResponse(null, networkError));
        }
        return Promise.resolve(createMockSupabaseResponse({ id: 1 }));
      });

      const deleteMock = vi.fn().mockReturnValue({
        match: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: singleMock,
          }),
        }),
      });

      const fromMock = supabaseMock.from('test_table');
      fromMock.delete.mockReturnValue(deleteMock);

      const result = await enhancedSupabase.delete('test_table', filter, { retries: 2 });

      expect(callCount).toBe(2);
      expect(result.success).toBe(true);
    });

    it('should check network connectivity before delete', async () => {
      const filter = { id: 1 };

      networkManagerMock.testConnectivity.mockResolvedValue(
        createMockNetworkDiagnostics({
          canReachSupabase: false,
        }),
      );

      const result = await enhancedSupabase.delete('test_table', filter);

      expect(networkManagerMock.testConnectivity).toHaveBeenCalled();
      expect(result.success).toBe(false);
      expect(result.error?.type).toBe('NETWORK_ERROR');
    });
  });

  describe('Connection Tests', () => {
    it('should successfully test connection when Supabase is reachable', async () => {
      const mockResponse = createMockSupabaseResponse(null); // No error means success

      const selectMock = vi.fn().mockResolvedValue(mockResponse);
      const fromMock = supabaseMock.from('health_check');
      fromMock.select.mockReturnValue({
        limit: vi.fn().mockReturnValue(selectMock),
      });

      const result = await enhancedSupabase.testConnection();

      expect(result.connected).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should return connection error when Supabase is unreachable', async () => {
      const error = new Error('Connection failed');

      const selectMock = vi.fn().mockRejectedValue(error);
      const fromMock = supabaseMock.from('health_check');
      fromMock.select.mockReturnValue({
        limit: vi.fn().mockReturnValue(selectMock),
      });

      const result = await enhancedSupabase.testConnection();

      expect(result.connected).toBe(false);
      expect(result.error).toBe('Connection failed');
    });

    it('should handle timeout in connection test', async () => {
      const selectMock = vi
        .fn()
        .mockImplementation(
          () =>
            new Promise((resolve) => setTimeout(() => resolve(createMockSupabaseResponse()), 100)),
        );

      const fromMock = supabaseMock.from('health_check');
      fromMock.select.mockReturnValue({
        limit: vi.fn().mockReturnValue(selectMock),
      });

      // Mock AbortController behavior
      const abortControllerMock = {
        abort: vi.fn(),
      };
      global.AbortController = vi.fn(() => abortControllerMock) as any;

      const result = await enhancedSupabase.testConnection();

      expect(result.connected).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should return detailed connection diagnostics', async () => {
      const mockResponse = createMockSupabaseResponse(null);

      const selectMock = vi.fn().mockResolvedValue(mockResponse);
      const fromMock = supabaseMock.from('health_check');
      fromMock.select.mockReturnValue({
        limit: vi.fn().mockReturnValue(selectMock),
      });

      const result = await enhancedSupabase.testConnection();

      expect(result).toHaveProperty('connected');
      expect(result).toHaveProperty('latency');
      expect(result).toHaveProperty('endpoint');
      expect(result).toHaveProperty('timestamp');
    });
  });

  describe('Error Handling', () => {
    it('should correctly determine error types', () => {
      const service = EnhancedSupabaseService.getInstance();

      expect(service['determineErrorType']({ message: 'network error', code: '' })).toBe(
        'NETWORK_ERROR',
      );
      expect(service['determineErrorType']({ message: 'timeout', code: 'PGRST301' })).toBe(
        'TIMEOUT_ERROR',
      );
      expect(service['determineErrorType']({ message: 'unauthorized', code: '401' })).toBe(
        'AUTH_ERROR',
      );
      expect(service['determineErrorType']({ message: 'server error', code: '500' })).toBe(
        'SERVER_ERROR',
      );
      expect(service['determineErrorType']({ message: 'unknown', code: '' })).toBe('UNKNOWN_ERROR');
    });

    it('should use correct Turkish error messages', async () => {
      const mockError = { type: 'NETWORK_ERROR', message: 'Network error' };
      (getUserFriendlyErrorMessage as any).mockReturnValue(
        'Bağlantı hatası. İnternet bağlantınızı kontrol edin.',
      );

      networkManagerMock.testConnectivity.mockResolvedValue(
        createMockNetworkDiagnostics({
          canReachSupabase: false,
        }),
      );

      const result = await enhancedSupabase.query('test_table', (qb) => qb.select('*'));

      expect(getUserFriendlyErrorMessage).toHaveBeenCalledWith(mockError);
      expect(result.error?.message).toBe('Bağlantı hatası. İnternet bağlantınızı kontrol edin.');
    });

    it('should determine which errors are retryable', () => {
      const service = EnhancedSupabaseService.getInstance();

      expect(service['shouldRetry']({ message: 'network', code: '' })).toBe(true);
      expect(service['shouldRetry']({ message: 'timeout', code: 'PGRST301' })).toBe(true);
      expect(service['shouldRetry']({ message: 'server error', code: '500' })).toBe(true);
      expect(service['shouldRetry']({ message: 'client error', code: '400' })).toBe(false);
    });

    it('should calculate backoff delay correctly', () => {
      const service = EnhancedSupabaseService.getInstance();

      expect(service['calculateBackoffDelay'](1)).toBe(2000); // 1000 * 2^1
      expect(service['calculateBackoffDelay'](2)).toBe(4000); // 1000 * 2^2
      expect(service['calculateBackoffDelay'](10)).toBe(5000); // Capped at 5000
    });
  });

  describe('Batch Operations', () => {
    it('should handle batch insert successfully', async () => {
      const batchData = [{ name: 'Item 1' }, { name: 'Item 2' }, { name: 'Item 3' }];

      networkManagerMock.testConnectivity.mockResolvedValue(createMockNetworkDiagnostics());

      const insertMock = vi.fn().mockReturnValue({
        select: vi.fn().mockResolvedValue(createMockSupabaseResponse(batchData)),
      });

      const fromMock = supabaseMock.from('test_table');
      fromMock.insert.mockReturnValue(insertMock);

      const result = await enhancedSupabase.batchInsert('test_table', batchData);

      expect(result.successful).toHaveLength(3);
      expect(result.failed).toHaveLength(0);
      expect(result.totalCount).toBe(3);
      expect(result.successCount).toBe(3);
    });

    it('should handle partial failures in batch insert', async () => {
      const batchData = [{ name: 'Item 1' }, { name: 'Item 2' }, { name: 'Item 3' }];

      networkManagerMock.testConnectivity.mockResolvedValue(createMockNetworkDiagnostics());

      const insertMock = vi.fn().mockRejectedValue(new Error('Insert failed'));

      const fromMock = supabaseMock.from('test_table');
      fromMock.insert.mockReturnValue(insertMock);

      const result = await enhancedSupabase.batchInsert('test_table', batchData);

      expect(result.successful).toHaveLength(0);
      expect(result.failed).toHaveLength(3);
      expect(result.totalCount).toBe(3);
      expect(result.failureCount).toBe(3);
    });

    it('should handle batch update', async () => {
      const updates = [
        { id: 1, name: 'Updated 1' },
        { id: 2, name: 'Updated 2' },
      ];

      networkManagerMock.testConnectivity.mockResolvedValue(createMockNetworkDiagnostics());

      const updateMock = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          select: vi.fn().mockResolvedValue(createMockSupabaseResponse(updates)),
        }),
      });

      const fromMock = supabaseMock.from('test_table');
      fromMock.update.mockReturnValue(updateMock);

      const result = await enhancedSupabase.batchUpdate('test_table', updates);

      expect(result.successful).toHaveLength(2);
      expect(result.failed).toHaveLength(0);
    });

    it('should handle batch delete', async () => {
      const ids = [1, 2, 3];

      networkManagerMock.testConnectivity.mockResolvedValue(createMockNetworkDiagnostics());

      const deleteMock = vi.fn().mockReturnValue({
        in: vi.fn().mockReturnValue({
          select: vi.fn().mockResolvedValue(createMockSupabaseResponse(ids.map((id) => ({ id })))),
        }),
      });

      const fromMock = supabaseMock.from('test_table');
      fromMock.delete.mockReturnValue(deleteMock);

      const result = await enhancedSupabase.batchDelete('test_table', ids);

      expect(result.successful).toHaveLength(3);
      expect(result.failed).toHaveLength(0);
    });
  });
});
