/**
 * @fileoverview useKumbara Module - Application module
 *
 * @author Dernek Yönetim Sistemi Team
 * @version 1.0.0
 */

// 🏦 USE KUMBARA HOOK
// Custom React hook for Kumbara (Piggy Bank) management

import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import kumbaraService from '../services/kumbaraService';
import type {
  Kumbara,
  KumbaraAlert,
  KumbaraCollection,
  KumbaraCollectionInsert,
  KumbaraDashboardStats,
  KumbaraFilters,
  KumbaraInsert,
  KumbaraSearchResult,
  KumbaraUpdate,
} from '../types/kumbara';

// Hook options interface
/**
 * UseKumbaraOptions Interface
 *
 * @interface UseKumbaraOptions
 */
export interface UseKumbaraOptions {
  autoFetch?: boolean;
  realtime?: boolean;
  filters?: KumbaraFilters;
  onError?: (error: Error) => void;
  onSuccess?: (message: string) => void;
}

// Hook return type
/**
 * UseKumbaraReturn Interface
 *
 * @interface UseKumbaraReturn
 */
export interface UseKumbaraReturn {
  // Data
  kumbaras: Kumbara[];
  kumbara: Kumbara | null;
  searchResult: KumbaraSearchResult | null;
  dashboardStats: KumbaraDashboardStats | null;
  collections: KumbaraCollection[];
  alerts: KumbaraAlert[];

  // Loading states
  loading: boolean;
  creating: boolean;
  updating: boolean;
  deleting: boolean;
  collecting: boolean;

  // Error states
  error: string | null;

  // Actions
  fetchKumbaras: (filters?: KumbaraFilters) => Promise<void>;
  fetchKumbara: (id: string) => Promise<void>;
  createKumbara: (data: KumbaraInsert) => Promise<Kumbara | null>;
  updateKumbara: (id: string, data: KumbaraUpdate) => Promise<Kumbara | null>;
  deleteKumbara: (id: string, deletedBy: string) => Promise<boolean>;
  recordCollection: (data: KumbaraCollectionInsert) => Promise<KumbaraCollection | null>;
  fetchDashboardStats: () => Promise<void>;
  fetchCollections: (kumbaraId: string, limit?: number) => Promise<void>;
  fetchAlerts: () => Promise<void>;
  acknowledgeAlert: (alertId: string, acknowledgedBy: string) => Promise<boolean>;
  exportKumbaras: (format?: 'csv' | 'excel' | 'pdf') => Promise<Blob | null>;

  // Utility functions
  clearError: () => void;
  refresh: () => Promise<void>;
  validateKumbara: (data: KumbaraInsert) => { isValid: boolean; errors: string[] };
}

/**
 * Main Kumbara management hook
 */
/**
 * useKumbara function
 *
 * @param {Object} params - Function parameters
 * @returns {void} Nothing
 */
export function useKumbara(options: UseKumbaraOptions = {}): UseKumbaraReturn {
  const { autoFetch = true, realtime = false, filters = {}, onError, onSuccess } = options;

  // State management
  const [kumbaras, setKumbaras] = useState<Kumbara[]>([]);
  const [kumbara, setKumbara] = useState<Kumbara | null>(null);
  const [searchResult, setSearchResult] = useState<KumbaraSearchResult | null>(null);
  const [dashboardStats, setDashboardStats] = useState<KumbaraDashboardStats | null>(null);
  const [collections, setCollections] = useState<KumbaraCollection[]>([]);
  const [alerts, setAlerts] = useState<KumbaraAlert[]>([]);

  // Loading states
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [collecting, setCollecting] = useState(false);

  // Error state
  const [error, setError] = useState<string | null>(null);

  // Error handler
  const handleError = useCallback(
    (err: Error) => {
      const errorMessage = err.message ?? 'Bilinmeyen bir hata oluştu';
      setError(errorMessage);

      if (onError) {
        onError(err);
      } else {
        toast.error(errorMessage);
      }
    },
    [onError]
  );

  // Success handler
  const handleSuccess = useCallback(
    (message: string) => {
      if (onSuccess) {
        onSuccess(message);
      } else {
        toast.success(message);
      }
    },
    [onSuccess]
  );

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Fetch kumbaras
  const fetchKumbaras = useCallback(
    async (customFilters?: KumbaraFilters) => {
      try {
        setLoading(true);
        setError(null);

        const result = await kumbaraService.getKumbaras(customFilters ?? filters);
        setSearchResult(result);
        setKumbaras(result.kumbaras);
      } catch (err) {
        handleError(err as Error);
      } finally {
        setLoading(false);
      }
    },
    [filters, handleError]
  );

  // Fetch single kumbara
  const fetchKumbara = useCallback(
    async (id: string) => {
      try {
        setLoading(true);
        setError(null);

        const result = await kumbaraService.getKumbara(id);
        setKumbara(result);
      } catch (err) {
        handleError(err as Error);
      } finally {
        setLoading(false);
      }
    },
    [handleError]
  );

  // Create kumbara
  const createKumbara = useCallback(
    async (data: KumbaraInsert): Promise<Kumbara | null> => {
      try {
        setCreating(true);
        setError(null);

        // Validate data first
        const validation = kumbaraService.validateKumbaraData(data);
        if (!validation.isValid) {
          throw new Error(validation.errors.join(', '));
        }

        const newKumbara = await kumbaraService.createKumbara(data);

        // Update local state
        setKumbaras((prev) => [newKumbara, ...prev]);

        handleSuccess('Kumbara başarıyla oluşturuldu');
        return newKumbara;
      } catch (err) {
        handleError(err as Error);
        return null;
      } finally {
        setCreating(false);
      }
    },
    [handleError, handleSuccess]
  );

  // Update kumbara
  const updateKumbara = useCallback(
    async (id: string, data: KumbaraUpdate): Promise<Kumbara | null> => {
      try {
        setUpdating(true);
        setError(null);

        const updatedKumbara = await kumbaraService.updateKumbara(id, data);

        // Update local state
        setKumbaras((prev) => prev.map((k) => (k.id === id ? updatedKumbara : k)));

        if (kumbara && kumbara.id === id) {
          setKumbara(updatedKumbara);
        }

        handleSuccess('Kumbara başarıyla güncellendi');
        return updatedKumbara;
      } catch (err) {
        handleError(err as Error);
        return null;
      } finally {
        setUpdating(false);
      }
    },
    [kumbara, handleError, handleSuccess]
  );

  // Delete kumbara
  const deleteKumbara = useCallback(
    async (id: string, deletedBy: string): Promise<boolean> => {
      try {
        setDeleting(true);
        setError(null);

        const success = await kumbaraService.deleteKumbara(id, deletedBy);

        if (success) {
          // Remove from local state
          setKumbaras((prev) => prev.filter((k) => k.id !== id));

          if (kumbara && kumbara.id === id) {
            setKumbara(null);
          }

          handleSuccess('Kumbara başarıyla silindi');
        }

        return success;
      } catch (err) {
        handleError(err as Error);
        return false;
      } finally {
        setDeleting(false);
      }
    },
    [kumbara, handleError, handleSuccess]
  );

  // Record collection
  const recordCollection = useCallback(
    async (data: KumbaraCollectionInsert): Promise<KumbaraCollection | null> => {
      try {
        setCollecting(true);
        setError(null);

        const newCollection = await kumbaraService.recordCollection(data);

        // Update collections list
        setCollections((prev) => [newCollection, ...prev]);

        // Update kumbara total amount if loaded
        if (kumbara && kumbara.id === data.kumbara_id) {
          setKumbara((prev) =>
            prev
              ? {
                  ...prev,
                  totalAmount: prev.totalAmount + data.amount,
                  lastCollection: data.collection_date ?? new Date().toISOString(),
                }
              : prev
          );
        }

        // Update kumbaras list
        setKumbaras((prev) =>
          prev.map((k) =>
            k.id === data.kumbara_id
              ? {
                  ...k,
                  totalAmount: k.totalAmount + data.amount,
                  lastCollection: data.collection_date ?? new Date().toISOString(),
                }
              : k
          )
        );

        handleSuccess('Toplama kaydı başarıyla oluşturuldu');
        return newCollection;
      } catch (err) {
        handleError(err as Error);
        return null;
      } finally {
        setCollecting(false);
      }
    },
    [kumbara, handleError, handleSuccess]
  );

  // Fetch dashboard stats
  const fetchDashboardStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const stats = await kumbaraService.getDashboardStats();
      setDashboardStats(stats);
    } catch (err) {
      handleError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  // Fetch collections
  const fetchCollections = useCallback(
    async (kumbaraId: string, limit = 10) => {
      try {
        setLoading(true);
        setError(null);

        const result = await kumbaraService.getCollections(kumbaraId, limit);
        setCollections(result);
      } catch (err) {
        handleError(err as Error);
      } finally {
        setLoading(false);
      }
    },
    [handleError]
  );

  // Fetch alerts
  const fetchAlerts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await kumbaraService.getKumbaraAlerts();
      setAlerts(result);
    } catch (err) {
      handleError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  // Acknowledge alert
  const acknowledgeAlert = useCallback(
    async (alertId: string, acknowledgedBy: string): Promise<boolean> => {
      try {
        setError(null);

        const success = await kumbaraService.acknowledgeAlert(alertId, acknowledgedBy);

        if (success) {
          // Update alerts list
          setAlerts((prev) =>
            prev.map((alert) =>
              alert.id === alertId
                ? {
                    ...alert,
                    acknowledged: true,
                    acknowledged_by: acknowledgedBy,
                    acknowledged_at: new Date().toISOString(),
                  }
                : alert
            )
          );

          handleSuccess('Uyarı başarıyla onaylandı');
        }

        return success;
      } catch (err) {
        handleError(err as Error);
        return false;
      }
    },
    [handleError, handleSuccess]
  );

  // Export kumbaras
  const exportKumbaras = useCallback(
    async (format: 'csv' | 'excel' | 'pdf' = 'csv'): Promise<Blob | null> => {
      try {
        setLoading(true);
        setError(null);

        const blob = await kumbaraService.exportKumbaras(format);

        // Download file
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `kumbaralar-${new Date().toISOString().split('T')[0]}.${format}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        handleSuccess(`Kumbara verileri ${format.toUpperCase()} formatında dışa aktarıldı`);
        return blob;
      } catch (err) {
        handleError(err as Error);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [handleError, handleSuccess]
  );

  // Validate kumbara data
  const validateKumbara = useCallback((data: KumbaraInsert) => {
    return kumbaraService.validateKumbaraData(data);
  }, []);

  // Refresh all data
  const refresh = useCallback(async () => {
    await Promise.all([fetchKumbaras(), fetchDashboardStats(), fetchAlerts()]);
  }, [fetchKumbaras, fetchDashboardStats, fetchAlerts]);

  // Auto-fetch on mount
  useEffect(() => {
    if (autoFetch) {
      fetchKumbaras();
    }
  }, [autoFetch, fetchKumbaras]);

  // Realtime updates (implementation pending)
  useEffect(() => {
    if (!realtime) return;

    const interval = setInterval(() => {
      // In a real implementation, this would be WebSocket or EventSource
      fetchKumbaras();
    }, 30000); // 30 seconds

    return () => {
      clearInterval(interval);
    };
  }, [realtime, fetchKumbaras]);

  // Memoized return object
  return useMemo(
    () => ({
      // Data
      kumbaras,
      kumbara,
      searchResult,
      dashboardStats,
      collections,
      alerts,

      // Loading states
      loading,
      creating,
      updating,
      deleting,
      collecting,

      // Error state
      error,

      // Actions
      fetchKumbaras,
      fetchKumbara,
      createKumbara,
      updateKumbara,
      deleteKumbara,
      recordCollection,
      fetchDashboardStats,
      fetchCollections,
      fetchAlerts,
      acknowledgeAlert,
      exportKumbaras,

      // Utilities
      clearError,
      refresh,
      validateKumbara,
    }),
    [
      kumbaras,
      kumbara,
      searchResult,
      dashboardStats,
      collections,
      alerts,
      loading,
      creating,
      updating,
      deleting,
      collecting,
      error,
      fetchKumbaras,
      fetchKumbara,
      createKumbara,
      updateKumbara,
      deleteKumbara,
      recordCollection,
      fetchDashboardStats,
      fetchCollections,
      fetchAlerts,
      acknowledgeAlert,
      exportKumbaras,
      clearError,
      refresh,
      validateKumbara,
    ]
  );
}

/**
 * Hook for single kumbara management
 */
/**
 * useKumbaraDetail function
 *
 * @param {Object} params - Function parameters
 * @returns {void} Nothing
 */
export function useKumbaraDetail(id: string) {
  const {
    kumbara,
    collections,
    loading,
    error,
    fetchKumbara,
    fetchCollections,
    updateKumbara,
    recordCollection,
    clearError,
  } = useKumbara({ autoFetch: false });

  // Auto-fetch kumbara details
  useEffect(() => {
    if (id) {
      fetchKumbara(id);
      fetchCollections(id);
    }
  }, [id, fetchKumbara, fetchCollections]);

  return {
    kumbara,
    collections,
    loading,
    error,
    updateKumbara,
    recordCollection,
    refresh: () => {
      if (id) {
        fetchKumbara(id);
        fetchCollections(id);
      }
    },
    clearError,
  };
}

/**
 * Hook for kumbara dashboard
 */
/**
 * useKumbaraDashboard function
 *
 * @param {Object} params - Function parameters
 * @returns {void} Nothing
 */
export function useKumbaraDashboard() {
  const {
    dashboardStats,
    alerts,
    loading,
    error,
    fetchDashboardStats,
    fetchAlerts,
    acknowledgeAlert,
    clearError,
  } = useKumbara({ autoFetch: false });

  // Auto-fetch dashboard data
  useEffect(() => {
    fetchDashboardStats();
    fetchAlerts();
  }, [fetchDashboardStats, fetchAlerts]);

  return {
    dashboardStats,
    alerts,
    loading,
    error,
    acknowledgeAlert,
    refresh: () => {
      fetchDashboardStats();
      fetchAlerts();
    },
    clearError,
  };
}

/**
 * Hook for kumbara analytics
 */
/**
 * useKumbaraAnalytics function
 *
 * @param {Object} params - Function parameters
 * @returns {void} Nothing
 */
export function useKumbaraAnalytics(kumbaraId?: string) {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = useCallback(async (id: string, periodStart: string, periodEnd: string) => {
    try {
      setLoading(true);
      setError(null);

      const result = await kumbaraService.getKumbaraAnalytics(id, periodStart, periodEnd);
      setAnalytics(result);
    } catch (err) {
      setError((err as Error).message);
      toast.error('Analitik verileri alınamadı');
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    analytics,
    loading,
    error,
    fetchAnalytics,
    clearError: () => {
      setError(null);
    },
  };
}

export default useKumbara;
