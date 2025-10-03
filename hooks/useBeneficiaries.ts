/**
 * @fileoverview useBeneficiaries Hook - İhtiyaç sahipleri yönetimi
 * 
 * @author Dernek Yönetim Sistemi Team
 * @version 1.0.0
 */

import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { beneficiariesService } from '../services/beneficiariesService';
import type { Beneficiary, BeneficiaryInsert, BeneficiaryUpdate } from '../types/beneficiary';

/**
 * useBeneficiaries hook'u için seçenekler
 */
interface UseBeneficiariesOptions {
  /** Silinmiş kayıtları dahil et */
  includeDeleted?: boolean;
  /** Durum filtresi */
  status?: 'active' | 'completed' | 'suspended';
  /** Şehir filtresi */
  city?: string;
  /** İhtiyaç türü filtresi */
  needType?: string;
  /** Realtime güncellemeleri aktif et */
  realtime?: boolean;
  /** Otomatik veri yükleme */
  autoFetch?: boolean;
}

/**
 * useBeneficiaries hook'u - İhtiyaç sahipleri yönetimi
 * 
 * @param options - Hook seçenekleri
 * @returns İhtiyaç sahipleri yönetim fonksiyonları ve durumları
 */
export function useBeneficiaries(options: UseBeneficiariesOptions = {}) {
  const {
    includeDeleted = false,
    status,
    city,
    needType,
    realtime = true,
    autoFetch = true
  } = options;

  // State tanımlamaları
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<any>(null);

  /**
   * Tüm ihtiyaç sahiplerini getirir
   */
  const fetchBeneficiaries = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await beneficiariesService.getAll();
      
      if (response.success && response.data) {
        let filteredData = response.data;

        // Filtreleri uygula
        if (!includeDeleted) {
          filteredData = filteredData.filter(b => b.status !== 'deleted');
        }
        
        if (status) {
          filteredData = filteredData.filter(b => b.status === status);
        }
        
        if (city) {
          filteredData = filteredData.filter(b => b.city === city);
        }
        
        if (needType) {
          filteredData = filteredData.filter(b => 
            b.need_types?.includes(needType)
          );
        }

        setBeneficiaries(filteredData);
      } else {
        setError(response.error || 'İhtiyaç sahipleri getirilemedi');
        toast.error('İhtiyaç sahipleri yüklenirken hata oluştu');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Beklenmeyen bir hata oluştu';
      setError(errorMessage);
      toast.error('İhtiyaç sahipleri yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  }, [includeDeleted, status, city, needType]);

  /**
   * Aktif ihtiyaç sahiplerini getirir
   */
  const fetchActiveBeneficiaries = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await beneficiariesService.getActiveBeneficiaries();
      
      if (response.success && response.data) {
        setBeneficiaries(response.data);
      } else {
        setError(response.error || 'Aktif ihtiyaç sahipleri getirilemedi');
        toast.error('Aktif ihtiyaç sahipleri yüklenirken hata oluştu');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Beklenmeyen bir hata oluştu';
      setError(errorMessage);
      toast.error('Aktif ihtiyaç sahipleri yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Şehre göre ihtiyaç sahiplerini getirir
   */
  const fetchBeneficiariesByCity = useCallback(async (cityName: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await beneficiariesService.getBeneficiariesByCity(cityName);
      
      if (response.success && response.data) {
        setBeneficiaries(response.data);
      } else {
        setError(response.error || 'Şehir bazında ihtiyaç sahipleri getirilemedi');
        toast.error('Şehir bazında ihtiyaç sahipleri yüklenirken hata oluştu');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Beklenmeyen bir hata oluştu';
      setError(errorMessage);
      toast.error('Şehir bazında ihtiyaç sahipleri yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Acil durumdaki ihtiyaç sahiplerini getirir
   */
  const fetchUrgentBeneficiaries = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await beneficiariesService.getUrgentBeneficiaries();
      
      if (response.success && response.data) {
        setBeneficiaries(response.data);
      } else {
        setError(response.error || 'Acil durumdaki ihtiyaç sahipleri getirilemedi');
        toast.error('Acil durumdaki ihtiyaç sahipleri yüklenirken hata oluştu');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Beklenmeyen bir hata oluştu';
      setError(errorMessage);
      toast.error('Acil durumdaki ihtiyaç sahipleri yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * İhtiyaç sahibi oluşturur
   */
  const createBeneficiary = useCallback(async (beneficiaryData: BeneficiaryInsert) => {
    setLoading(true);
    setError(null);

    try {
      const response = await beneficiariesService.create(beneficiaryData);
      
      if (response.success && response.data) {
        setBeneficiaries(prev => [response.data!, ...prev]);
        toast.success('İhtiyaç sahibi başarıyla oluşturuldu');
        return response.data;
      } 
        setError(response.error || 'İhtiyaç sahibi oluşturulamadı');
        toast.error('İhtiyaç sahibi oluşturulurken hata oluştu');
        return null;
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Beklenmeyen bir hata oluştu';
      setError(errorMessage);
      toast.error('İhtiyaç sahibi oluşturulurken hata oluştu');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * İhtiyaç sahibi günceller
   */
  const updateBeneficiary = useCallback(async (id: number, updates: BeneficiaryUpdate) => {
    setLoading(true);
    setError(null);

    try {
      const response = await beneficiariesService.update(id, updates);
      
      if (response.success && response.data) {
        setBeneficiaries(prev => 
          prev.map(b => b.id === id ? response.data! : b)
        );
        toast.success('İhtiyaç sahibi başarıyla güncellendi');
        return response.data;
      } 
        setError(response.error || 'İhtiyaç sahibi güncellenemedi');
        toast.error('İhtiyaç sahibi güncellenirken hata oluştu');
        return null;
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Beklenmeyen bir hata oluştu';
      setError(errorMessage);
      toast.error('İhtiyaç sahibi güncellenirken hata oluştu');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * İhtiyaç sahibi durumunu günceller
   */
  const updateBeneficiaryStatus = useCallback(async (id: number, status: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await beneficiariesService.updateBeneficiaryStatus(id, status);
      
      if (response.success && response.data) {
        setBeneficiaries(prev => 
          prev.map(b => b.id === id ? response.data! : b)
        );
        toast.success('İhtiyaç sahibi durumu başarıyla güncellendi');
        return response.data;
      } 
        setError(response.error || 'İhtiyaç sahibi durumu güncellenemedi');
        toast.error('İhtiyaç sahibi durumu güncellenirken hata oluştu');
        return null;
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Beklenmeyen bir hata oluştu';
      setError(errorMessage);
      toast.error('İhtiyaç sahibi durumu güncellenirken hata oluştu');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * İhtiyaç sahibi siler
   */
  const deleteBeneficiary = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);

    try {
      const response = await beneficiariesService.delete(id);
      
      if (response.success) {
        setBeneficiaries(prev => prev.filter(b => b.id !== id));
        toast.success('İhtiyaç sahibi başarıyla silindi');
        return true;
      } 
        setError(response.error || 'İhtiyaç sahibi silinemedi');
        toast.error('İhtiyaç sahibi silinirken hata oluştu');
        return false;
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Beklenmeyen bir hata oluştu';
      setError(errorMessage);
      toast.error('İhtiyaç sahibi silinirken hata oluştu');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * İhtiyaç sahibi istatistiklerini getirir
   */
  const fetchStats = useCallback(async () => {
    try {
      const response = await beneficiariesService.getBeneficiaryStats();
      
      if (response.success && response.data) {
        setStats(response.data);
      } else {
        setError(response.error || 'İstatistikler getirilemedi');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Beklenmeyen bir hata oluştu';
      setError(errorMessage);
    }
  }, []);

  // Otomatik veri yükleme
  useEffect(() => {
    if (autoFetch) {
      fetchBeneficiaries();
    }
  }, [autoFetch, fetchBeneficiaries]);

  // İstatistikleri yükle
  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    // State
    beneficiaries,
    loading,
    error,
    stats,
    
    // Actions
    fetchBeneficiaries,
    fetchActiveBeneficiaries,
    fetchBeneficiariesByCity,
    fetchUrgentBeneficiaries,
    createBeneficiary,
    updateBeneficiary,
    updateBeneficiaryStatus,
    deleteBeneficiary,
    fetchStats,
    
    // Utilities
    refresh: fetchBeneficiaries,
    clearError: () => { setError(null); }
  };
}
