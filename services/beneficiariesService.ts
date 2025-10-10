/**
 * @fileoverview Beneficiaries Service - İhtiyaç sahipleri yönetimi
 *
 * @author Dernek Yönetim Sistemi Team
 * @version 1.0.0
 */

import { logger } from '../lib/logging/logger';
import { supabase, TABLES } from '../lib/supabase';
import type {
  Beneficiary,
  BeneficiaryInsert,
  BeneficiaryUpdate,
  BeneficiaryDBFields,
} from '../types/beneficiary';
import { mapDBToBeneficiary, mapBeneficiaryToDB } from '../types/beneficiary';
import type { ApiResponse } from './config';

// Module-level constants
const tableName = 'ihtiyac_sahipleri';

/**
 * BeneficiariesService - İhtiyaç sahipleri için CRUD operasyonları
 */
const beneficiariesService = {
  /**
   * Override getAll to use Turkish DB fields with mapping
   */
  async getAll(): Promise<ApiResponse<Beneficiary[]>> {
    try {
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        logger.error('Error fetching all beneficiaries', error);
        return { data: null, error: error.message };
      }

      const mapped = data?.map((item: BeneficiaryDBFields) => mapDBToBeneficiary(item)) || [];
      return { data: mapped, error: null };
    } catch (error) {
      logger.error('Unexpected error in getAll', error);
      return { data: null, error: 'Beklenmeyen bir hata oluştu' };
    }
  },

  /**
   * Override getById to use Turkish DB fields with mapping
   */
  async getById(id: string): Promise<ApiResponse<Beneficiary>> {
    try {
      const { data, error } = await supabase.from(tableName).select('*').eq('id', id).single();

      if (error) {
        logger.error('Error fetching beneficiary by ID', error);
        return { data: null, error: error.message };
      }

      const mapped = mapDBToBeneficiary(data as BeneficiaryDBFields);
      return { data: mapped, error: null };
    } catch (error) {
      logger.error('Unexpected error in getById', error);
      return { data: null, error: 'Beklenmeyen bir hata oluştu' };
    }
  },

  /**
   * Override create to use Turkish DB fields with mapping
   */
  async create(data: BeneficiaryInsert): Promise<ApiResponse<Beneficiary>> {
    try {
      // Convert English fields to Turkish DB fields
      const dbData = mapBeneficiaryToDB(data as Partial<Beneficiary>);

      const { data: result, error } = await supabase
        .from(tableName)
        .insert(dbData)
        .select()
        .single();

      if (error) {
        logger.error('Error creating beneficiary', error);
        return { data: null, error: error.message };
      }

      const mapped = mapDBToBeneficiary(result as BeneficiaryDBFields);
      return { data: mapped, error: null };
    } catch (error) {
      logger.error('Unexpected error in create', error);
      return { data: null, error: 'Beklenmeyen bir hata oluştu' };
    }
  },

  /**
   * Override update to use Turkish DB fields with mapping
   */
  async update(id: string, data: BeneficiaryUpdate): Promise<ApiResponse<Beneficiary>> {
    try {
      // Convert English fields to Turkish DB fields
      const dbData = mapBeneficiaryToDB(data as Partial<Beneficiary>);

      const { data: result, error } = await supabase
        .from(tableName)
        .update(dbData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        logger.error('Error updating beneficiary', error);
        return { data: null, error: error.message };
      }

      const mapped = mapDBToBeneficiary(result as BeneficiaryDBFields);
      return { data: mapped, error: null };
    } catch (error) {
      logger.error('Unexpected error in update', error);
      return { data: null, error: 'Beklenmeyen bir hata oluştu' };
    }
  },

  /**
   * Override delete to use Turkish table name
   */
  async delete(id: string): Promise<ApiResponse<boolean>> {
    try {
      const { error } = await supabase.from(tableName).delete().eq('id', id);

      if (error) {
        logger.error('Error deleting beneficiary', error);
        return { data: null, error: error.message };
      }

      return { data: true, error: null };
    } catch (error) {
      logger.error('Unexpected error in delete', error);
      return { data: null, error: 'Beklenmeyen bir hata oluştu' };
    }
  },

  /**
   * Aktif ihtiyaç sahiplerini getirir
   *
   * @returns Promise<ApiResponse<Beneficiary[]>>
   */
  async getActiveBeneficiaries(): Promise<ApiResponse<Beneficiary[]>> {
    try {
      logger.info('Fetching active beneficiaries');

      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) {
        logger.error('Error fetching active beneficiaries', error);
        return { data: null, error: error.message };
      }

      // Map Turkish DB fields to English app model
      const mapped = data?.map((item: BeneficiaryDBFields) => mapDBToBeneficiary(item)) || [];

      logger.info(`Successfully fetched ${mapped.length} active beneficiaries`);
      return { data: mapped, error: null };
    } catch (error) {
      logger.error('Unexpected error in getActiveBeneficiaries', error);
      return { data: null, error: 'Beklenmeyen bir hata oluştu' };
    }
  },

  /**
   * Şehre göre ihtiyaç sahiplerini getirir
   *
   * @param city - Şehir adı
   * @returns Promise<ApiResponse<Beneficiary[]>>
   */
  async getBeneficiariesByCity(city: string): Promise<ApiResponse<Beneficiary[]>> {
    try {
      logger.info('Fetching beneficiaries by city', { city });

      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .eq('sehri', city) // Use Turkish DB field name
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) {
        logger.error('Error fetching beneficiaries by city', error);
        return { data: null, error: error.message };
      }

      // Map Turkish DB fields to English app model
      const mapped = data?.map((item: BeneficiaryDBFields) => mapDBToBeneficiary(item)) || [];

      logger.info(`Successfully fetched ${mapped.length} beneficiaries for city: ${city}`);
      return { data: mapped, error: null };
    } catch (error) {
      logger.error('Unexpected error in getBeneficiariesByCity', error);
      return { data: null, error: 'Beklenmeyen bir hata oluştu' };
    }
  },

  /**
   * İhtiyaç türüne göre ihtiyaç sahiplerini getirir
   *
   * @param needType - İhtiyaç türü
   * @returns Promise<ApiResponse<Beneficiary[]>>
   */
  async getBeneficiariesByNeedType(needType: string): Promise<ApiResponse<Beneficiary[]>> {
    try {
      logger.info('Fetching beneficiaries by need type', { needType });

      // Note: DB uses 'kategori' field instead of need_types array
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .eq('kategori', needType) // Use Turkish DB field name
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) {
        logger.error('Error fetching beneficiaries by need type', error);
        return { data: null, error: error.message };
      }

      // Map Turkish DB fields to English app model
      const mapped = data?.map((item: BeneficiaryDBFields) => mapDBToBeneficiary(item)) || [];

      logger.info(`Successfully fetched ${mapped.length} beneficiaries for need type: ${needType}`);
      return { data: mapped, error: null };
    } catch (error) {
      logger.error('Unexpected error in getBeneficiariesByNeedType', error);
      return { data: null, error: 'Beklenmeyen bir hata oluştu' };
    }
  },

  /**
   * Acil durumdaki ihtiyaç sahiplerini getirir
   *
   * @returns Promise<ApiResponse<Beneficiary[]>>
   */
  async getUrgentBeneficiaries(): Promise<ApiResponse<Beneficiary[]>> {
    try {
      logger.info('Fetching urgent beneficiaries');

      // Note: DB doesn't have priority field, return all active
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(20); // Limit to recent entries as fallback

      if (error) {
        logger.error('Error fetching urgent beneficiaries', error);
        return { data: null, error: error.message };
      }

      // Map Turkish DB fields to English app model
      const mapped = data?.map((item: BeneficiaryDBFields) => mapDBToBeneficiary(item)) || [];

      logger.info(`Successfully fetched ${mapped.length} urgent beneficiaries`);
      return { data: mapped, error: null };
    } catch (error) {
      logger.error('Unexpected error in getUrgentBeneficiaries', error);
      return { data: null, error: 'Beklenmeyen bir hata oluştu' };
    }
  },

  /**
   * İhtiyaç sahibinin durumunu günceller
   *
   * @param id - İhtiyaç sahibi ID'si
   * @param status - Yeni durum
   * @returns Promise<ApiResponse<Beneficiary>>
   */
  async updateBeneficiaryStatus(id: number, status: string): Promise<ApiResponse<Beneficiary>> {
    try {
      logger.info('Updating beneficiary status', { id, status });

      const { data, error } = await supabase
        .from(tableName)
        .update({
          status,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        logger.error('Error updating beneficiary status', error);
        return { data: null, error: error.message };
      }

      // Map Turkish DB fields to English app model
      const mapped = mapDBToBeneficiary(data as BeneficiaryDBFields);

      logger.info(`Successfully updated beneficiary status for ID: ${id}`);
      return { data: mapped, error: null };
    } catch (error) {
      logger.error('Unexpected error in updateBeneficiaryStatus', error);
      return { data: null, error: 'Beklenmeyen bir hata oluştu' };
    }
  },

  /**
   * İhtiyaç sahibi istatistiklerini getirir
   *
   * @returns Promise<ApiResponse<any>>
   */
  async getBeneficiaryStats(): Promise<ApiResponse<any>> {
    try {
      logger.info('Fetching beneficiary statistics');

      const { data, error } = await supabase.from(tableName).select('status, sehri, kategori'); // Use Turkish DB field names

      if (error) {
        logger.error('Error fetching beneficiary statistics', error);
        return { data: null, error: error.message };
      }

      // İstatistikleri hesapla
      const stats: any = {
        total: data?.length || 0,
        active: data?.filter((b: any) => b.status === 'active').length || 0,
        completed: data?.filter((b: any) => b.status === 'inactive').length || 0,
        urgent: 0, // DB doesn't have priority field
        byCity: {} as Record<string, number>,
        byNeedType: {} as Record<string, number>,
      };

      // Şehir bazında istatistikler (using Turkish field name)
      data?.forEach((beneficiary: any) => {
        if (beneficiary.sehri) {
          stats.byCity[beneficiary.sehri] = (stats.byCity[beneficiary.sehri] || 0) + 1;
        }
      });

      // İhtiyaç türü bazında istatistikler (using kategori field)
      data?.forEach((beneficiary: any) => {
        if (beneficiary.kategori) {
          stats.byNeedType[beneficiary.kategori] =
            (stats.byNeedType[beneficiary.kategori] || 0) + 1;
        }
      });

      logger.info('Successfully calculated beneficiary statistics');
      return { data: stats, error: null };
    } catch (error) {
      logger.error('Unexpected error in getBeneficiaryStats', error);
      return { data: null, error: 'Beklenmeyen bir hata oluştu' };
    }
  },

  /**
   * Destekleyici belgeleri ekler
   *
   * @param beneficiaryId - İhtiyaç sahibi ID'si
   * @param documentUrls - Eklenecek belge URL'leri
   * @returns Promise<ApiResponse<Beneficiary>>
   */
  async addSupportingDocuments(
    beneficiaryId: string,
    documentUrls: string[],
  ): Promise<ApiResponse<Beneficiary>> {
    try {
      logger.info('Adding supporting documents', { beneficiaryId, count: documentUrls.length });

      // Mevcut ihtiyaç sahibini getir
      const currentResult = await this.getById(beneficiaryId);
      if (currentResult.error || !currentResult.data) {
        logger.error('Failed to fetch beneficiary for adding documents', {
          beneficiaryId,
          error: currentResult.error,
        });
        return { data: null, error: currentResult.error || 'İhtiyaç sahibi bulunamadı' };
      }

      const currentBeneficiary = currentResult.data;
      const currentDocuments = currentBeneficiary.supporting_documents || [];
      const updatedDocuments = [...currentDocuments, ...documentUrls];

      // Güncelle
      const updateResult = await this.update(beneficiaryId, {
        supporting_documents: updatedDocuments,
      });
      if (updateResult.error) {
        logger.error('Failed to update beneficiary with new documents', {
          beneficiaryId,
          error: updateResult.error,
        });
        return { data: null, error: updateResult.error };
      }

      logger.info('Successfully added supporting documents', {
        beneficiaryId,
        addedCount: documentUrls.length,
      });
      return updateResult;
    } catch (error) {
      logger.error('Unexpected error in addSupportingDocuments', error);
      return { data: null, error: 'Beklenmeyen bir hata oluştu' };
    }
  },

  /**
   * Destekleyici belgeyi kaldırır
   *
   * @param beneficiaryId - İhtiyaç sahibi ID'si
   * @param documentUrl - Kaldırılacak belge URL'si
   * @returns Promise<ApiResponse<Beneficiary>>
   */
  async removeSupportingDocument(
    beneficiaryId: string,
    documentUrl: string,
  ): Promise<ApiResponse<Beneficiary>> {
    try {
      logger.info('Removing supporting document', { beneficiaryId, documentUrl });

      // Mevcut ihtiyaç sahibini getir
      const currentResult = await this.getById(beneficiaryId);
      if (currentResult.error || !currentResult.data) {
        logger.error('Failed to fetch beneficiary for removing document', {
          beneficiaryId,
          error: currentResult.error,
        });
        return { data: null, error: currentResult.error || 'İhtiyaç sahibi bulunamadı' };
      }

      const currentBeneficiary = currentResult.data;
      const currentDocuments = currentBeneficiary.supporting_documents || [];
      const updatedDocuments = currentDocuments.filter((url) => url !== documentUrl);

      // Eğer belge bulunamadıysa hata döndür
      if (updatedDocuments.length === currentDocuments.length) {
        logger.warn('Document URL not found in beneficiary documents', {
          beneficiaryId,
          documentUrl,
        });
        return { data: null, error: 'Belge bulunamadı' };
      }

      // Güncelle
      const updateResult = await this.update(beneficiaryId, {
        supporting_documents: updatedDocuments,
      });
      if (updateResult.error) {
        logger.error('Failed to update beneficiary after removing document', {
          beneficiaryId,
          error: updateResult.error,
        });
        return { data: null, error: updateResult.error };
      }

      logger.info('Successfully removed supporting document', { beneficiaryId, documentUrl });
      return updateResult;
    } catch (error) {
      logger.error('Unexpected error in removeSupportingDocument', error);
      return { data: null, error: 'Beklenmeyen bir hata oluştu' };
    }
  },

  /**
   * Destekleyici belgeleri getirir
   *
   * @param beneficiaryId - İhtiyaç sahibi ID'si
   * @returns Promise<ApiResponse<string[]>>
   */
  async getSupportingDocuments(beneficiaryId: string): Promise<ApiResponse<string[]>> {
    try {
      logger.info('Fetching supporting documents', { beneficiaryId });

      const result = await this.getById(beneficiaryId);
      if (result.error || !result.data) {
        logger.error('Failed to fetch beneficiary for documents', {
          beneficiaryId,
          error: result.error,
        });
        return { data: null, error: result.error || 'İhtiyaç sahibi bulunamadı' };
      }

      const documents = result.data.supporting_documents || [];
      logger.info('Successfully fetched supporting documents', {
        beneficiaryId,
        count: documents.length,
      });
      return { data: documents, error: null };
    } catch (error) {
      logger.error('Unexpected error in getSupportingDocuments', error);
      return { data: null, error: 'Beklenmeyen bir hata oluştu' };
    }
  },

  /**
   * Destekleyici belgeleri toplu günceller
   *
   * @param beneficiaryId - İhtiyaç sahibi ID'si
   * @param documentUrls - Yeni belge URL'leri
   * @returns Promise<ApiResponse<Beneficiary>>
   */
  async updateSupportingDocuments(
    beneficiaryId: string,
    documentUrls: string[],
  ): Promise<ApiResponse<Beneficiary>> {
    try {
      logger.info('Updating supporting documents', { beneficiaryId, count: documentUrls.length });

      // İhtiyaç sahibinin varlığını doğrula
      const currentResult = await this.getById(beneficiaryId);
      if (currentResult.error || !currentResult.data) {
        logger.error('Failed to fetch beneficiary for updating documents', {
          beneficiaryId,
          error: currentResult.error,
        });
        return { data: null, error: currentResult.error || 'İhtiyaç sahibi bulunamadı' };
      }

      // Güncelle
      const updateResult = await this.update(beneficiaryId, { supporting_documents: documentUrls });
      if (updateResult.error) {
        logger.error('Failed to update beneficiary documents', {
          beneficiaryId,
          error: updateResult.error,
        });
        return { data: null, error: updateResult.error };
      }

      logger.info('Successfully updated supporting documents', {
        beneficiaryId,
        count: documentUrls.length,
      });
      return updateResult;
    } catch (error) {
      logger.error('Unexpected error in updateSupportingDocuments', error);
      return { data: null, error: 'Beklenmeyen bir hata oluştu' };
    }
  },

  /**
   * Legacy compatibility: getIhtiyacSahipleri
   * Paginated beneficiaries with filters (Turkish field names in filters)
   */
  async getBeneficiaries(
    page: number = 1,
    limit: number = 10,
    filters: {
      searchTerm?: string;
      sehir?: string;
      kategori?: string;
      status?: string;
      sortBy?: string;
    } = {},
  ): Promise<{
    data: Beneficiary[];
    total: number;
    page: number;
    limit: number;
    error?: string;
  }> {
    try {
      logger.info('Fetching beneficiaries with pagination', { page, limit, filters });

      const offset = (page - 1) * limit;

      let query = supabase.from(tableName).select('*', { count: 'exact' });

      // Apply filters using Turkish DB field names
      if (filters.sehir) {
        query = query.eq('sehri', filters.sehir);
      }

      if (filters.kategori) {
        query = query.eq('kategori', filters.kategori);
      }

      if (filters.status) {
        query = query.eq('status', filters.status);
      }

      if (filters.searchTerm) {
        query = query.or(
          `ad_soyad.ilike.%${filters.searchTerm}%,kimlik_no.ilike.%${filters.searchTerm}%,telefon_no.ilike.%${filters.searchTerm}%`,
        );
      }

      // Apply sorting
      let sortField = 'ad_soyad';
      let ascending = true;

      if (filters.sortBy) {
        switch (filters.sortBy) {
          case 'name-asc':
            sortField = 'ad_soyad';
            ascending = true;
            break;
          case 'name-desc':
            sortField = 'ad_soyad';
            ascending = false;
            break;
          case 'date-newest':
            sortField = 'created_at';
            ascending = false;
            break;
          case 'date-oldest':
            sortField = 'created_at';
            ascending = true;
            break;
          case 'city-asc':
            sortField = 'sehri';
            ascending = true;
            break;
          case 'category-asc':
            sortField = 'kategori';
            ascending = true;
            break;
          default:
            sortField = 'ad_soyad';
            ascending = true;
        }
      }

      const { data, error, count } = await query
        .order(sortField, { ascending })
        .range(offset, offset + limit - 1);

      if (error) {
        logger.error('Error fetching beneficiaries', error);
        return {
          data: [],
          total: 0,
          page,
          limit,
          error: error.message,
        };
      }

      // Map Turkish DB fields to English app model
      const mapped = data?.map((item: BeneficiaryDBFields) => mapDBToBeneficiary(item)) || [];

      logger.info(`Successfully fetched ${mapped.length} beneficiaries from ${count ?? 0} total`);

      return {
        data: mapped,
        total: count ?? 0,
        page,
        limit,
      };
    } catch (error) {
      logger.error('Error in getBeneficiaries:', error);
      return {
        data: [],
        total: 0,
        page,
        limit,
        error: 'İhtiyaç sahipleri verileri alınamadı',
      };
    }
  },

  /**
   * Legacy compatibility: getSehirler
   * Get unique cities from beneficiaries
   */
  async getCities(): Promise<{ data: string[]; error?: string }> {
    try {
      logger.info('Getting unique cities');

      const { data, error } = await supabase
        .from(tableName)
        .select('sehri')
        .not('sehri', 'is', null);

      if (error) {
        logger.error('Error fetching cities:', error);
        return {
          data: [],
          error: error.message,
        };
      }

      // Get unique cities
      const cities = [...new Set(data?.map((item: any) => item.sehri).filter(Boolean))].sort(
        (a, b) => a.localeCompare(b),
      );

      logger.info('Successfully fetched cities:', cities);
      return {
        data: cities as string[],
      };
    } catch (error) {
      logger.error('Error in getCities:', error);
      return {
        data: [],
        error: 'Şehirler alınamadı',
      };
    }
  },

  /**
   * Legacy compatibility: testConnection
   * Test database connection and table existence
   */
  async testConnection(): Promise<{ exists: boolean; data?: any; error?: string }> {
    try {
      logger.info('Testing Supabase connection and table existence...');

      const { data: tableData, error: tableError } = await supabase
        .from(tableName)
        .select('*')
        .limit(1);

      logger.info('Table test result:', { tableData, tableError });

      if (tableError) {
        logger.error('Table does not exist or access denied:', tableError);
        return { exists: false, error: tableError.message };
      }

      logger.info('Table exists and is accessible');
      return { exists: true, data: tableData };
    } catch (error) {
      logger.error('Connection test failed:', error);
      return { exists: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  },
};

// Export the service
export { beneficiariesService };
export default beneficiariesService;
