// 🧪 USE KUMBARA HOOK TESTS
// Comprehensive tests for useKumbara custom hook

import { act, renderHook, waitFor } from '@testing-library/react';
import { toast } from 'sonner';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useKumbara, useKumbaraDashboard, useKumbaraDetail } from '../../hooks/useKumbara';
import kumbaraService from '../../services/kumbaraService';
import type { KumbaraFilters, KumbaraInsert, KumbaraUpdate } from '../../types/kumbara';
import { createMockKumbara, createMockCollection } from '../utils';

// Mock the service
vi.mock('../../services/kumbaraService', () => ({
  kumbaraService: {
    getKumbaras: vi.fn(),
    createKumbara: vi.fn(),
    updateKumbara: vi.fn(),
    deleteKumbara: vi.fn(),
    getKumbara: vi.fn(),
    getCollections: vi.fn(),
    recordCollection: vi.fn(),
    validateKumbaraData: vi.fn(),
    exportKumbaras: vi.fn(),
    getDashboardStats: vi.fn(),
    getKumbaraAlerts: vi.fn(),
    acknowledgeAlert: vi.fn(),
  },
  default: {
    getKumbaras: vi.fn(),
    createKumbara: vi.fn(),
    updateKumbara: vi.fn(),
    deleteKumbara: vi.fn(),
    getKumbara: vi.fn(),
    getCollections: vi.fn(),
    recordCollection: vi.fn(),
    validateKumbaraData: vi.fn(),
    exportKumbaras: vi.fn(),
    getDashboardStats: vi.fn(),
    getKumbaraAlerts: vi.fn(),
    acknowledgeAlert: vi.fn(),
  },
}));

// Get the mocked service using vi.mocked
const mockedKumbaraService = vi.mocked((await import('../../services/kumbaraService')).default);

describe('useKumbara Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Initial State', () => {
    it('should initialize with correct default state', () => {
      const { result } = renderHook(() => useKumbara({ autoFetch: false }));

      expect(result.current.kumbaras).toEqual([]);
      expect(result.current.kumbara).toBeNull();
      expect(result.current.searchResult).toBeNull();
      expect(result.current.dashboardStats).toBeNull();
      expect(result.current.collections).toEqual([]);
      expect(result.current.alerts).toEqual([]);

      expect(result.current.loading).toBe(false);
      expect(result.current.creating).toBe(false);
      expect(result.current.updating).toBe(false);
      expect(result.current.deleting).toBe(false);
      expect(result.current.collecting).toBe(false);

      expect(result.current.error).toBeNull();
    });

    it('should auto-fetch data when autoFetch is true', async () => {
      const mockKumbaras = [createMockKumbara()];
      mockedKumbaraService.getKumbaras.mockResolvedValue({
        kumbaras: mockKumbaras,
        total_count: 1,
        page: 1,
        page_size: 10,
        total_pages: 1,
        filters_applied: {},
      });

      const { result } = renderHook(() => useKumbara({ autoFetch: true }));

      await waitFor(() => {
        expect(result.current.kumbaras).toEqual(mockKumbaras);
      });

      expect(mockedKumbaraService.getKumbaras).toHaveBeenCalledWith({});
    });

    it('should not auto-fetch when autoFetch is false', () => {
      renderHook(() => useKumbara({ autoFetch: false }));

      expect(mockedKumbaraService.getKumbaras).not.toHaveBeenCalled();
    });
  });

  describe('fetchKumbaras', () => {
    it('should fetch kumbaras successfully', async () => {
      const mockKumbaras = [
        createMockKumbara({ id: '1' }),
        createMockKumbara({ id: '2' }),
      ];

      mockedKumbaraService.getKumbaras.mockResolvedValue({
        kumbaras: mockKumbaras,
        total_count: 2,
        page: 1,
        page_size: 10,
        total_pages: 1,
        filters_applied: {},
      });

      const { result } = renderHook(() => useKumbara({ autoFetch: false }));

      await act(async () => {
        await result.current.fetchKumbaras();
      });

      expect(result.current.kumbaras).toEqual(mockKumbaras);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('should handle fetch errors', async () => {
      const errorMessage = 'Network error';
      mockedKumbaraService.getKumbaras.mockRejectedValue(new Error(errorMessage));

      const { result } = renderHook(() => useKumbara({ autoFetch: false }));

      await act(async () => {
        await result.current.fetchKumbaras();
      });

      expect(result.current.error).toBe(errorMessage);
      expect(result.current.kumbaras).toEqual([]);
      expect(toast.error).toHaveBeenCalledWith(errorMessage);
    });

    it('should apply custom filters', async () => {
      const customFilters: KumbaraFilters = {
        status: ['active'],
        search_term: 'test',
      };

      mockedKumbaraService.getKumbaras.mockResolvedValue({
        kumbaras: [],
        total_count: 0,
        page: 1,
        page_size: 10,
        total_pages: 1,
        filters_applied: customFilters,
      });

      const { result } = renderHook(() => useKumbara({ autoFetch: false }));

      await act(async () => {
        await result.current.fetchKumbaras(customFilters);
      });

      expect(mockedKumbaraService.getKumbaras).toHaveBeenCalledWith(customFilters);
    });

    it('should set loading state correctly', async () => {
      let resolvePromise: (value: any) => void;
      const promise = new Promise((resolve) => {
        resolvePromise = resolve;
      });

      mockedKumbaraService.getKumbaras.mockReturnValue(promise as any);

      const { result } = renderHook(() => useKumbara({ autoFetch: false }));

      // Start fetch
      act(() => {
        result.current.fetchKumbaras();
      });

      // Should be loading
      expect(result.current.loading).toBe(true);

      // Resolve promise
      await act(async () => {
        resolvePromise!({
          kumbaras: [],
          total_count: 0,
          page: 1,
          page_size: 10,
          total_pages: 1,
          filters_applied: {},
        });
        await promise;
      });

      // Should not be loading anymore
      expect(result.current.loading).toBe(false);
    });
  });

  describe('createKumbara', () => {
    it('should create kumbara successfully', async () => {
      const newKumbaraData: KumbaraInsert = {
        name: 'New Kumbara',
        location: 'New Location',
        address: 'New Address',
        created_by: 'test-user',
      };

      const createdKumbara = createMockKumbara(newKumbaraData);

      mockedKumbaraService.validateKumbaraData.mockReturnValue({
        isValid: true,
        errors: [],
      });
      mockedKumbaraService.createKumbara.mockResolvedValue(createdKumbara);

      const { result } = renderHook(() => useKumbara({ autoFetch: false }));

      let createdResult: any;
      await act(async () => {
        createdResult = await result.current.createKumbara(newKumbaraData);
      });

      expect(createdResult).toEqual(createdKumbara);
      expect(result.current.kumbaras).toContain(createdKumbara);
      expect(result.current.creating).toBe(false);
      expect(toast.success).toHaveBeenCalledWith('Kumbara başarıyla oluşturuldu');
    });

    it('should handle validation errors', async () => {
      const invalidData: KumbaraInsert = {
        name: 'AB', // Too short
        location: 'New Location',
        address: 'New Address',
        created_by: 'test-user',
      };

      mockedKumbaraService.validateKumbaraData.mockReturnValue({
        isValid: false,
        errors: ['Kumbara adı en az 3 karakter olmalıdır'],
      });

      const { result } = renderHook(() => useKumbara({ autoFetch: false }));

      let createdResult: any;
      await act(async () => {
        createdResult = await result.current.createKumbara(invalidData);
      });

      expect(createdResult).toBeNull();
      expect(result.current.error).toBe('Kumbara adı en az 3 karakter olmalıdır');
      expect(toast.error).toHaveBeenCalled();
    });

    it('should handle creation errors', async () => {
      const newKumbaraData: KumbaraInsert = {
        name: 'New Kumbara',
        location: 'New Location',
        address: 'New Address',
        created_by: 'test-user',
      };

      mockedKumbaraService.validateKumbaraData.mockReturnValue({
        isValid: true,
        errors: [],
      });
      mockedKumbaraService.createKumbara.mockRejectedValue(new Error('Creation failed'));

      const { result } = renderHook(() => useKumbara({ autoFetch: false }));

      let createdResult: any;
      await act(async () => {
        createdResult = await result.current.createKumbara(newKumbaraData);
      });

      expect(createdResult).toBeNull();
      expect(result.current.error).toBe('Creation failed');
    });
  });

  describe('updateKumbara', () => {
    it('should update kumbara successfully', async () => {
      const existingKumbara = createMockKumbara();
      const updateData: KumbaraUpdate = {
        name: 'Updated Name',
        updated_by: 'test-user',
      };
      const updatedKumbara = { ...existingKumbara, ...updateData };

      mockedKumbaraService.updateKumbara.mockResolvedValue(updatedKumbara);

      const { result } = renderHook(() => useKumbara({ autoFetch: false }));

      // Set initial state
      act(() => {
        result.current.kumbaras.push(existingKumbara);
      });

      let updateResult: any;
      await act(async () => {
        updateResult = await result.current.updateKumbara(existingKumbara.id, updateData);
      });

      expect(updateResult).toEqual(updatedKumbara);
      expect(toast.success).toHaveBeenCalledWith('Kumbara başarıyla güncellendi');
    });

    it('should update local state after successful update', async () => {
      const existingKumbara = createMockKumbara();
      const updateData: KumbaraUpdate = {
        name: 'Updated Name',
        updated_by: 'test-user',
      };
      const updatedKumbara = { ...existingKumbara, ...updateData };

      mockedKumbaraService.updateKumbara.mockResolvedValue(updatedKumbara);

      const { result } = renderHook(() => useKumbara({ autoFetch: false }));

      // Set initial kumbaras
      act(() => {
        (result.current as any).setKumbaras([existingKumbara]);
      });

      await act(async () => {
        await result.current.updateKumbara(existingKumbara.id, updateData);
      });

      // Check if kumbara was updated in the list
      const updatedKumbaraInList = result.current.kumbaras.find((k) => k.id === existingKumbara.id);
      expect(updatedKumbaraInList?.name).toBe('Updated Name');
    });
  });

  describe('deleteKumbara', () => {
    it('should delete kumbara successfully', async () => {
      const existingKumbara = createMockKumbara();

      mockedKumbaraService.deleteKumbara.mockResolvedValue(true);

      const { result } = renderHook(() => useKumbara({ autoFetch: false }));

      let deleteResult: any;
      await act(async () => {
        deleteResult = await result.current.deleteKumbara(existingKumbara.id, 'test-user');
      });

      expect(deleteResult).toBe(true);
      expect(toast.success).toHaveBeenCalledWith('Kumbara başarıyla silindi');
    });

    it('should remove kumbara from local state after deletion', async () => {
      const kumbara1 = createMockKumbara({ id: '1' });
      const kumbara2 = createMockKumbara({ id: '2' });

      mockedKumbaraService.deleteKumbara.mockResolvedValue(true);

      const { result } = renderHook(() => useKumbara({ autoFetch: false }));

      // Set initial kumbaras
      act(() => {
        (result.current as any).setKumbaras([kumbara1, kumbara2]);
      });

      await act(async () => {
        await result.current.deleteKumbara(kumbara1.id, 'test-user');
      });

      expect(result.current.kumbaras).toHaveLength(1);
      expect(result.current.kumbaras[0].id).toBe(kumbara2.id);
    });
  });

  describe('recordCollection', () => {
    it('should record collection successfully', async () => {
      const collectionData = {
        kumbara_id: 'test-kumbara-1',
        amount: 150.75,
        collector_name: 'Test Collector',
        created_by: 'test-user',
      };

      const mockCollection = createMockCollection(collectionData);
      mockedKumbaraService.recordCollection.mockResolvedValue(mockCollection);

      const { result } = renderHook(() => useKumbara({ autoFetch: false }));

      let collectionResult: any;
      await act(async () => {
        collectionResult = await result.current.recordCollection(collectionData);
      });

      expect(collectionResult).toEqual(mockCollection);
      expect(result.current.collections).toContain(mockCollection);
      expect(toast.success).toHaveBeenCalledWith('Toplama kaydı başarıyla oluşturuldu');
    });

    it('should update kumbara total amount after collection', async () => {
      const existingKumbara = createMockKumbara({
        id: 'test-kumbara-1',
        totalAmount: 1000,
      });

      const collectionData = {
        kumbara_id: 'test-kumbara-1',
        amount: 150.75,
        collector_name: 'Test Collector',
        created_by: 'test-user',
      };

      const mockCollection = createMockCollection(collectionData);
      mockedKumbaraService.recordCollection.mockResolvedValue(mockCollection);

      const { result } = renderHook(() => useKumbara({ autoFetch: false }));

      // Set initial state
      act(() => {
        (result.current as any).setKumbaras([existingKumbara]);
        (result.current as any).setKumbara(existingKumbara);
      });

      await act(async () => {
        await result.current.recordCollection(collectionData);
      });

      // Check if total amount was updated
      const updatedKumbara = result.current.kumbaras.find((k) => k.id === 'test-kumbara-1');
      expect(updatedKumbara?.totalAmount).toBe(1000 + 150.75);

      expect(result.current.kumbara?.totalAmount).toBe(1000 + 150.75);
    });
  });

  describe('Error Handling', () => {
    it('should handle errors with custom error handler', async () => {
      const customErrorHandler = vi.fn();
      const errorMessage = 'Custom error';

      mockedKumbaraService.getKumbaras.mockRejectedValue(new Error(errorMessage));

      const { result } = renderHook(() =>
        useKumbara({
          autoFetch: false,
          onError: customErrorHandler,
        }),
      );

      await act(async () => {
        await result.current.fetchKumbaras();
      });

      expect(customErrorHandler).toHaveBeenCalledWith(new Error(errorMessage));
      expect(toast.error).not.toHaveBeenCalled();
    });

    it('should use default error handler when none provided', async () => {
      const errorMessage = 'Default error handling';
      mockedKumbaraService.getKumbaras.mockRejectedValue(new Error(errorMessage));

      const { result } = renderHook(() => useKumbara({ autoFetch: false }));

      await act(async () => {
        await result.current.fetchKumbaras();
      });

      expect(toast.error).toHaveBeenCalledWith(errorMessage);
    });

    it('should clear errors', () => {
      const { result } = renderHook(() => useKumbara({ autoFetch: false }));

      // Set error state
      act(() => {
        (result.current as any).setError('Test error');
      });

      expect(result.current.error).toBe('Test error');

      // Clear error
      act(() => {
        result.current.clearError();
      });

      expect(result.current.error).toBeNull();
    });
  });

  describe('Success Handling', () => {
    it('should handle success with custom success handler', async () => {
      const customSuccessHandler = vi.fn();
      const newKumbaraData: KumbaraInsert = {
        name: 'New Kumbara',
        location: 'New Location',
        address: 'New Address',
        created_by: 'test-user',
      };

      const createdKumbara = createMockKumbara(newKumbaraData);

      mockedKumbaraService.validateKumbaraData.mockReturnValue({
        isValid: true,
        errors: [],
      });
      mockedKumbaraService.createKumbara.mockResolvedValue(createdKumbara);

      const { result } = renderHook(() =>
        useKumbara({
          autoFetch: false,
          onSuccess: customSuccessHandler,
        }),
      );

      await act(async () => {
        await result.current.createKumbara(newKumbaraData);
      });

      expect(customSuccessHandler).toHaveBeenCalledWith('Kumbara başarıyla oluşturuldu');
      expect(toast.success).not.toHaveBeenCalled();
    });
  });

  describe('exportKumbaras', () => {
    it('should export kumbaras and trigger download', async () => {
      const mockBlob = new Blob(['mock-csv-content'], { type: 'text/csv' });
      mockedKumbaraService.exportKumbaras.mockResolvedValue(mockBlob);

      // Mock document.createElement for download link
      const mockAnchor = {
        href: '',
        download: '',
        click: vi.fn(),
      };
      vi.spyOn(document, 'createElement').mockReturnValue(mockAnchor as any);
      vi.spyOn(document.body, 'appendChild').mockImplementation(() => mockAnchor as any);
      vi.spyOn(document.body, 'removeChild').mockImplementation(() => mockAnchor as any);

      const { result } = renderHook(() => useKumbara({ autoFetch: false }));

      let exportResult: any;
      await act(async () => {
        exportResult = await result.current.exportKumbaras('csv');
      });

      expect(exportResult).toBe(mockBlob);
      expect(mockAnchor.click).toHaveBeenCalled();
      expect(toast.success).toHaveBeenCalledWith('Kumbara verileri CSV formatında dışa aktarıldı');
    });
  });

  describe('refresh', () => {
    it('should refresh all data', async () => {
      mockedKumbaraService.getKumbaras.mockResolvedValue({
        kumbaras: [],
        total_count: 0,
        page: 1,
        page_size: 10,
        total_pages: 1,
        filters_applied: {},
      });
      mockedKumbaraService.getDashboardStats.mockResolvedValue({
        total_kumbaras: 0,
        active_kumbaras: 0,
        inactive_kumbaras: 0,
        maintenance_kumbaras: 0,
        total_collections_today: 0,
        total_amount_today: 0,
        total_collections_month: 0,
        total_amount_month: 0,
        top_performing_kumbaras: [],
        recent_collections: [],
        maintenance_alerts: [],
        performance_trends: [],
      });
      mockedKumbaraService.getKumbaraAlerts.mockResolvedValue([]);

      const { result } = renderHook(() => useKumbara({ autoFetch: false }));

      await act(async () => {
        await result.current.refresh();
      });

      expect(mockedKumbaraService.getKumbaras).toHaveBeenCalled();
      expect(mockedKumbaraService.getDashboardStats).toHaveBeenCalled();
      expect(mockedKumbaraService.getKumbaraAlerts).toHaveBeenCalled();
    });
  });
});

describe('useKumbaraDetail Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch kumbara details on mount', async () => {
    const kumbaraId = 'test-kumbara-1';
    const mockKumbara = createMockKumbara({ id: kumbaraId });
    const mockCollections = [createMockCollection()];

    mockedKumbaraService.getKumbara.mockResolvedValue(mockKumbara);
    mockedKumbaraService.getCollections.mockResolvedValue(mockCollections);

    const { result } = renderHook(() => useKumbaraDetail(kumbaraId));

    await waitFor(() => {
      expect(result.current.kumbara).toEqual(mockKumbara);
      expect(result.current.collections).toEqual(mockCollections);
    });

    expect(mockedKumbaraService.getKumbara).toHaveBeenCalledWith(kumbaraId);
    expect(mockedKumbaraService.getCollections).toHaveBeenCalledWith(kumbaraId);
  });

  it('should not fetch when ID is empty', () => {
    renderHook(() => useKumbaraDetail(''));

    expect(mockedKumbaraService.getKumbara).not.toHaveBeenCalled();
    expect(mockedKumbaraService.getCollections).not.toHaveBeenCalled();
  });

  it('should refresh data when refresh is called', async () => {
    const kumbaraId = 'test-kumbara-1';
    const mockKumbara = createMockKumbara({ id: kumbaraId });

    mockedKumbaraService.getKumbara.mockResolvedValue(mockKumbara);
    mockedKumbaraService.getCollections.mockResolvedValue([]);

    const { result } = renderHook(() => useKumbaraDetail(kumbaraId));

    await act(async () => {
      result.current.refresh();
    });

    // Should be called twice (initial + refresh)
    expect(mockedKumbaraService.getKumbara).toHaveBeenCalledTimes(2);
    expect(mockedKumbaraService.getCollections).toHaveBeenCalledTimes(2);
  });
});

describe('useKumbaraDashboard Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch dashboard data on mount', async () => {
    const mockStats = {
      total_kumbaras: 5,
      active_kumbaras: 4,
      inactive_kumbaras: 1,
      maintenance_kumbaras: 0,
      total_collections_today: 10,
      total_amount_today: 500,
      total_collections_month: 100,
      total_amount_month: 5000,
      top_performing_kumbaras: [],
      recent_collections: [],
      maintenance_alerts: [],
      performance_trends: [],
    };

    const mockAlerts = [
      {
        id: '1',
        kumbara_id: 'test-kumbara-1',
        alert_type: 'maintenance_due' as const,
        severity: 'warning' as const,
        title: 'Test Alert',
        message: 'Test message',
        action_required: true,
        acknowledged: false,
        resolved: false,
        created_at: new Date().toISOString(),
      },
    ];

    mockedKumbaraService.getDashboardStats.mockResolvedValue(mockStats);
    mockedKumbaraService.getKumbaraAlerts.mockResolvedValue(mockAlerts);

    const { result } = renderHook(() => useKumbaraDashboard());

    await waitFor(() => {
      expect(result.current.dashboardStats).toEqual(mockStats);
      expect(result.current.alerts).toEqual(mockAlerts);
    });

    expect(mockedKumbaraService.getDashboardStats).toHaveBeenCalled();
    expect(mockedKumbaraService.getKumbaraAlerts).toHaveBeenCalled();
  });

  it('should acknowledge alerts successfully', async () => {
    const alertId = 'test-alert-1';
    const acknowledgedBy = 'test-user';

    mockedKumbaraService.acknowledgeAlert.mockResolvedValue(true);
    mockedKumbaraService.getDashboardStats.mockResolvedValue({} as any);
    mockedKumbaraService.getKumbaraAlerts.mockResolvedValue([]);

    const { result } = renderHook(() => useKumbaraDashboard());

    let acknowledgeResult: any;
    await act(async () => {
      acknowledgeResult = await result.current.acknowledgeAlert(alertId, acknowledgedBy);
    });

    expect(acknowledgeResult).toBe(true);
    expect(mockedKumbaraService.acknowledgeAlert).toHaveBeenCalledWith(alertId, acknowledgedBy);
  });

  it('should refresh dashboard data', async () => {
    mockedKumbaraService.getDashboardStats.mockResolvedValue({} as any);
    mockedKumbaraService.getKumbaraAlerts.mockResolvedValue([]);

    const { result } = renderHook(() => useKumbaraDashboard());

    await act(async () => {
      result.current.refresh();
    });

    // Should be called twice (initial + refresh)
    expect(mockedKumbaraService.getDashboardStats).toHaveBeenCalledTimes(2);
    expect(mockedKumbaraService.getKumbaraAlerts).toHaveBeenCalledTimes(2);
  });
});

describe('Hook Performance', () => {
  it('should memoize return values to prevent unnecessary re-renders', () => {
    const { result, rerender } = renderHook(() => useKumbara({ autoFetch: false }));

    const firstResult = result.current;

    // Rerender without changing props
    rerender();

    const secondResult = result.current;

    // Should be the same object reference (memoized)
    expect(firstResult).toBe(secondResult);
  });

  it('should only re-memoize when dependencies change', async () => {
    const { result } = renderHook(() => useKumbara({ autoFetch: false }));

    const initialFetchFunction = result.current.fetchKumbaras;

    // Trigger a state change
    await act(async () => {
      result.current.clearError();
    });

    // fetchKumbaras function should remain the same (useCallback)
    expect(result.current.fetchKumbaras).toBe(initialFetchFunction);
  });
});

describe('Hook Integration', () => {
  it('should work with real service calls', async () => {
    // Use real service instead of mock for integration test
    vi.unmock('../../services/kumbaraService');

    const { result } = renderHook(() => useKumbara({ autoFetch: false }));

    await act(async () => {
      await result.current.fetchKumbaras();
    });

    // Should not throw and should have some structure
    expect(result.current.kumbaras).toBeInstanceOf(Array);
    expect(result.current.loading).toBe(false);
  });

  it('should maintain data consistency across hook instances', () => {
    const { result: result1 } = renderHook(() => useKumbara({ autoFetch: false }));
    const { result: result2 } = renderHook(() => useKumbara({ autoFetch: false }));

    // Both hooks should start with the same initial state
    expect(result1.current.kumbaras).toEqual(result2.current.kumbaras);
    expect(result1.current.loading).toBe(result2.current.loading);
    expect(result1.current.error).toBe(result2.current.error);
  });
});
