import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import useMCPIntegration, { useMCPMembers } from '../useMCPIntegration';
import { mcpSecurity } from '../../lib/security/mcp-security';
import { MCPPaginator } from '../../lib/mcp-pagination';
import { mcpErrorHandler } from '../../lib/mcp-error-handler';
import { toast } from 'sonner';
import type { Member } from '../../types/database';

// Mock dependencies
vi.mock('../../lib/security/mcp-security', () => ({
  mcpSecurity: {
    validateApiKey: vi.fn(),
    checkRateLimit: vi.fn(),
    hasPermission: vi.fn(),
    sanitizeData: vi.fn((data) => data),
  },
}));

vi.mock('../../lib/mcp-pagination');

vi.mock('../../lib/mcp-error-handler', () => ({
  mcpErrorHandler: {
    handleAsync: vi.fn(async (fn) => {
      try {
        const data = await fn();
        return { success: true, data };
      } catch (error) {
        return { success: false, error };
      }
    }),
    handleWithRetry: vi.fn(async (fn) => {
      try {
        const data = await fn();
        return { success: true, data };
      } catch (error) {
        return { success: false, error };
      }
    }),
    getErrorStats: vi.fn(),
  },
}));

vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
  },
}));

const mockMembers: Member[] = [
  {
    id: '1',
    created_at: '2023-01-15T10:00:00Z',
    updated_at: '2023-01-15T10:00:00Z',
    name: 'Ahmet Yılmaz',
    email: 'ahmet@example.com',
    phone: '+905551234567',
    join_date: '2023-01-15',
    status: 'active',
    membership_type: 'standard',
    city: 'Istanbul',
  },
  {
    id: '2',
    created_at: '2023-02-20T10:00:00Z',
    updated_at: '2023-02-20T10:00:00Z',
    name: 'Fatma Demir',
    email: 'fatma@example.com',
    phone: '+905559876543',
    join_date: '2023-02-20',
    status: 'active',
    membership_type: 'premium',
    city: 'Ankara',
  },
];

describe('useMCPIntegration', () => {
  let mockPaginatorInstance: any;

  beforeEach(() => {
    vi.clearAllMocks();

    (mcpSecurity.validateApiKey as any).mockReturnValue(true);
    (mcpSecurity.checkRateLimit as any).mockReturnValue(true);
    (mcpSecurity.hasPermission as any).mockReturnValue(true);

    mockPaginatorInstance = {
      paginate: vi.fn().mockResolvedValue({
        data: mockMembers,
        pagination: { totalItems: mockMembers.length },
      }),
    };
    (MCPPaginator as any).mockImplementation(() => mockPaginatorInstance);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should initialize and check security', async () => {
    const { result } = renderHook(() => useMCPIntegration());

    await waitFor(() => {
      expect(result.current.isInitialized).toBe(true);
    });

    expect(mcpSecurity.validateApiKey).toHaveBeenCalled();
    expect(mcpSecurity.checkRateLimit).toHaveBeenCalled();
    expect(mcpSecurity.hasPermission).toHaveBeenCalled();
    expect(result.current.securityStatus.apiKeyValid).toBe(true);
  });

  it('should enhance members with security and pagination', async () => {
    const { result } = renderHook(() => useMCPIntegration());

    await waitFor(() => expect(result.current.isInitialized).toBe(true));

    let enhanced: any;
    await act(async () => {
      enhanced = await result.current.enhanceMembers(mockMembers);
    });

    expect(mcpErrorHandler.handleAsync).toHaveBeenCalled();
    expect(mcpSecurity.sanitizeData).toHaveBeenCalledTimes(mockMembers.length);
    expect(enhanced.success).toBe(true);
    expect(enhanced.data).toEqual(mockMembers);
    expect(enhanced.paginator).toBeDefined();

    let paginated: any;
    await act(async () => {
      paginated = await enhanced.createPaginatedView({ page: 1, limit: 1 });
    });
    expect(mockPaginatorInstance.paginate).toHaveBeenCalledWith({ page: 1, limit: 1 });
    expect(paginated.data).toEqual(mockMembers);
  });

  it('should handle security check failures', async () => {
    (mcpSecurity.hasPermission as any).mockReturnValue(false);

    const { result } = renderHook(() => useMCPIntegration());

    await waitFor(() => expect(result.current.isInitialized).toBe(true));

    expect(result.current.securityStatus.permissionsGranted).toBe(false);

    let enhanced: any;
    await act(async () => {
      enhanced = await result.current.enhanceMembers(mockMembers);
    });

    expect(toast.error).toHaveBeenCalledWith('MCP Error: Security checks failed');
    expect(enhanced.success).toBe(false);
  });

  it('should use secureBulkOperation for bulk actions', async () => {
    const { result } = renderHook(() => useMCPIntegration());
    const bulkOperation = vi.fn().mockResolvedValue('bulk success');

    await waitFor(() => expect(result.current.isInitialized).toBe(true));

    let operationResult: any;
    await act(async () => {
      operationResult = await result.current.secureBulkOperation(bulkOperation, 'test-bulk');
    });

    expect(mcpErrorHandler.handleWithRetry).toHaveBeenCalled();
    expect(bulkOperation).toHaveBeenCalled();
    expect(operationResult.data).toBe('bulk success');
  });
});

describe('useMCPMembers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (mcpSecurity.validateApiKey as any).mockReturnValue(true);
    (mcpSecurity.checkRateLimit as any).mockReturnValue(true);
    (mcpSecurity.hasPermission as any).mockReturnValue(true);
    (MCPPaginator as any).mockImplementation(() => ({
      paginate: vi.fn().mockResolvedValue({
        data: mockMembers,
        pagination: { totalItems: mockMembers.length },
      }),
    }));
  });

  it('should process members and set enhanced members', async () => {
    const { result } = renderHook(() => useMCPMembers());

    await waitFor(() => expect(result.current.isInitialized).toBe(true));

    expect(result.current.loading).toBe(false);
    expect(result.current.enhancedMembers).toBeNull();

    await act(async () => {
      await result.current.processMembers(mockMembers);
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.enhancedMembers).toBeDefined();
    expect(result.current.enhancedMembers.success).toBe(true);
    expect(result.current.enhancedMembers.data).toEqual(mockMembers);
  });

  it('should set loading state during processing', async () => {
    const { result } = renderHook(() => useMCPMembers());

    await waitFor(() => expect(result.current.isInitialized).toBe(true));

    const promise = act(async () => {
      await result.current.processMembers(mockMembers);
    });

    expect(result.current.loading).toBe(true);
    await promise;
    expect(result.current.loading).toBe(false);
  });

  it('should handle errors during member processing', async () => {
    (mcpSecurity.hasPermission as Vi.Mock).mockReturnValue(false);
    const { result } = renderHook(() => useMCPMembers());

    await waitFor(() => expect(result.current.isInitialized).toBe(true));

    await act(async () => {
      await result.current.processMembers(mockMembers);
    });

    expect(result.current.enhancedMembers.success).toBe(false);
    expect(toast.error).toHaveBeenCalledWith('MCP Error: Security checks failed');
  });
});
