/**
 * @fileoverview Beneficiaries Service - İhtiyaç sahipleri yönetimi
 * 
 * @author Dernek Yönetim Sistemi Team
 * @version 1.0.0
 */

import { logger } from '../lib/logging/logger';
import { supabase, TABLES } from '../lib/supabase';
import type { Beneficiary, BeneficiaryInsert, BeneficiaryUpdate } from '../types/beneficiary';
import type { ApiResponse } from './config';
import { BaseService } from './baseService';

/**
 * BeneficiariesService sınıfı - İhtiyaç sahipleri için CRUD operasyonları
 * 
 * @class BeneficiariesService
 * @extends BaseService
 */
export class BeneficiariesService extends BaseService<
  Beneficiary,
  BeneficiaryInsert,
  BeneficiaryUpdate
> {
  constructor() {
    super(TABLES.BENEFICIARIES);
  }

  /**
   * Aktif ihtiyaç sahiplerini getirir
   * 
   * @returns Promise<ApiResponse<Beneficiary[]>>
   */
  async getActiveBeneficiaries(): Promise<ApiResponse<Beneficiary[]>> {
    try {
      logger.info('Fetching active beneficiaries');

      const { data, error } = await supabase
        .from(TABLES.BENEFICIARIES)
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });
      
      if (error) {
        logger.error('Error fetching active beneficiaries', error);
        return { data: null, error: error.message };
      }

      logger.info(`Successfully fetched ${data?.length || 0} active beneficiaries`);
      return { data: data || [], error: null };
    } catch (error) {
      logger.error('Unexpected error in getActiveBeneficiaries', error);
      return { data: null, error: 'Beklenmeyen bir hata oluştu' };
    }
  }

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
        .from(TABLES.BENEFICIARIES)
        .select('*')
        .eq('city', city)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) {
        logger.error('Error fetching beneficiaries by city', error);
        return { data: null, error: error.message };
      }

      logger.info(`Successfully fetched ${data?.length || 0} beneficiaries for city: ${city}`);
      return { data: data || [], error: null };
    } catch (error) {
      logger.error('Unexpected error in getBeneficiariesByCity', error);
      return { data: null, error: 'Beklenmeyen bir hata oluştu' };
    }
  }

  /**
   * İhtiyaç türüne göre ihtiyaç sahiplerini getirir
   * 
   * @param needType - İhtiyaç türü
   * @returns Promise<ApiResponse<Beneficiary[]>>
   */
  async getBeneficiariesByNeedType(needType: string): Promise<ApiResponse<Beneficiary[]>> {
    try {
      logger.info('Fetching beneficiaries by need type', { needType });

      const { data, error } = await supabase
        .from(TABLES.BENEFICIARIES)
        .select('*')
        .contains('need_types', [needType])
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) {
        logger.error('Error fetching beneficiaries by need type', error);
        return { data: null, error: error.message };
      }

      logger.info(`Successfully fetched ${data?.length || 0} beneficiaries for need type: ${needType}`);
      return { data: data || [], error: null };
    } catch (error) {
      logger.error('Unexpected error in getBeneficiariesByNeedType', error);
      return { data: null, error: 'Beklenmeyen bir hata oluştu' };
    }
  }

  /**
   * Acil durumdaki ihtiyaç sahiplerini getirir
   * 
   * @returns Promise<ApiResponse<Beneficiary[]>>
   */
  async getUrgentBeneficiaries(): Promise<ApiResponse<Beneficiary[]>> {
    try {
      logger.info('Fetching urgent beneficiaries');

      const { data, error } = await supabase
        .from(TABLES.BENEFICIARIES)
        .select('*')
        .eq('priority', 'urgent')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) {
        logger.error('Error fetching urgent beneficiaries', error);
        return { data: null, error: error.message };
      }

      logger.info(`Successfully fetched ${data?.length || 0} urgent beneficiaries`);
      return { data: data || [], error: null };
    } catch (error) {
      logger.error('Unexpected error in getUrgentBeneficiaries', error);
      return { data: null, error: 'Beklenmeyen bir hata oluştu' };
    }
  }

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
        .from(TABLES.BENEFICIARIES)
        .update({ 
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        logger.error('Error updating beneficiary status', error);
        return { data: null, error: error.message };
      }

      logger.info(`Successfully updated beneficiary status for ID: ${id}`);
      return { data, error: null };
    } catch (error) {
      logger.error('Unexpected error in updateBeneficiaryStatus', error);
      return { data: null, error: 'Beklenmeyen bir hata oluştu' };
    }
  }

  /**
   * İhtiyaç sahibi istatistiklerini getirir
   * 
   * @returns Promise<ApiResponse<any>>
   */
  async getBeneficiaryStats(): Promise<ApiResponse<any>> {
    try {
      logger.info('Fetching beneficiary statistics');

      const { data, error } = await supabase
        .from(TABLES.BENEFICIARIES)
        .select('status, priority, city, need_types');

      if (error) {
        logger.error('Error fetching beneficiary statistics', error);
        return { data: null, error: error.message };
      }

      // İstatistikleri hesapla
      const stats: any = {
        total: data?.length || 0,
        active: data?.filter(b => b.status === 'active').length || 0,
        completed: data?.filter(b => b.status === 'completed').length || 0,
        urgent: data?.filter(b => b.priority === 'urgent').length || 0,
        byCity: {} as Record<string, number>,
        byNeedType: {} as Record<string, number>
      };

      // Şehir bazında istatistikler
      data?.forEach(beneficiary => {
        if (beneficiary.city) {
          stats.byCity[beneficiary.city] = (stats.byCity[beneficiary.city] || 0) + 1;
        }
      });

      // İhtiyaç türü bazında istatistikler
      data?.forEach(beneficiary => {
        if (beneficiary.need_types && Array.isArray(beneficiary.need_types)) {
          beneficiary.need_types.forEach(needType => {
            stats.byNeedType[needType] = (stats.byNeedType[needType] || 0) + 1;
          });
        }
      });

      logger.info('Successfully calculated beneficiary statistics');
      return { data: stats, error: null };
    } catch (error) {
      logger.error('Unexpected error in getBeneficiaryStats', error);
      return { data: null, error: 'Beklenmeyen bir hata oluştu' };
    }
  }

  /**
   * Destekleyici belgeleri ekler
   *
   * @param beneficiaryId - İhtiyaç sahibi ID'si
   * @param documentUrls - Eklenecek belge URL'leri
   * @returns Promise<ApiResponse<Beneficiary>>
   */
  async addSupportingDocuments(beneficiaryId: string, documentUrls: string[]): Promise<ApiResponse<Beneficiary>> {
    try {
      logger.info('Adding supporting documents', { beneficiaryId, count: documentUrls.length });

      // Mevcut ihtiyaç sahibini getir
      const currentResult = await this.getById(beneficiaryId);
      if (currentResult.error || !currentResult.data) {
        logger.error('Failed to fetch beneficiary for adding documents', { beneficiaryId, error: currentResult.error });
        return { data: null, error: currentResult.error || 'İhtiyaç sahibi bulunamadı' };
      }

      const currentBeneficiary = currentResult.data;
      const currentDocuments = currentBeneficiary.supporting_documents || [];
      const updatedDocuments = [...currentDocuments, ...documentUrls];

      // Güncelle
      const updateResult = await this.update(beneficiaryId, { supporting_documents: updatedDocuments });
      if (updateResult.error) {
        logger.error('Failed to update beneficiary with new documents', { beneficiaryId, error: updateResult.error });
        return { data: null, error: updateResult.error };
      }

      logger.info('Successfully added supporting documents', { beneficiaryId, addedCount: documentUrls.length });
      return updateResult;
    } catch (error) {
      logger.error('Unexpected error in addSupportingDocuments', error);
      return { data: null, error: 'Beklenmeyen bir hata oluştu' };
    }
  }

  /**
   * Destekleyici belgeyi kaldırır
   *
   * @param beneficiaryId - İhtiyaç sahibi ID'si
   * @param documentUrl - Kaldırılacak belge URL'si
   * @returns Promise<ApiResponse<Beneficiary>>
   */
  async removeSupportingDocument(beneficiaryId: string, documentUrl: string): Promise<ApiResponse<Beneficiary>> {
    try {
      logger.info('Removing supporting document', { beneficiaryId, documentUrl });

      // Mevcut ihtiyaç sahibini getir
      const currentResult = await this.getById(beneficiaryId);
      if (currentResult.error || !currentResult.data) {
        logger.error('Failed to fetch beneficiary for removing document', { beneficiaryId, error: currentResult.error });
        return { data: null, error: currentResult.error || 'İhtiyaç sahibi bulunamadı' };
      }

      const currentBeneficiary = currentResult.data;
      const currentDocuments = currentBeneficiary.supporting_documents || [];
      const updatedDocuments = currentDocuments.filter(url => url !== documentUrl);

      // Eğer belge bulunamadıysa hata döndür
      if (updatedDocuments.length === currentDocuments.length) {
        logger.warn('Document URL not found in beneficiary documents', { beneficiaryId, documentUrl });
        return { data: null, error: 'Belge bulunamadı' };
      }

      // Güncelle
      const updateResult = await this.update(beneficiaryId, { supporting_documents: updatedDocuments });
      if (updateResult.error) {
        logger.error('Failed to update beneficiary after removing document', { beneficiaryId, error: updateResult.error });
        return { data: null, error: updateResult.error };
      }

      logger.info('Successfully removed supporting document', { beneficiaryId, documentUrl });
      return updateResult;
    } catch (error) {
      logger.error('Unexpected error in removeSupportingDocument', error);
      return { data: null, error: 'Beklenmeyen bir hata oluştu' };
    }
  }

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
        logger.error('Failed to fetch beneficiary for documents', { beneficiaryId, error: result.error });
        return { data: null, error: result.error || 'İhtiyaç sahibi bulunamadı' };
      }

      const documents = result.data.supporting_documents || [];
      logger.info('Successfully fetched supporting documents', { beneficiaryId, count: documents.length });
      return { data: documents, error: null };
    } catch (error) {
      logger.error('Unexpected error in getSupportingDocuments', error);
      return { data: null, error: 'Beklenmeyen bir hata oluştu' };
    }
  }

  /**
   * Destekleyici belgeleri toplu günceller
   *
   * @param beneficiaryId - İhtiyaç sahibi ID'si
   * @param documentUrls - Yeni belge URL'leri
   * @returns Promise<ApiResponse<Beneficiary>>
   */
  async updateSupportingDocuments(beneficiaryId: string, documentUrls: string[]): Promise<ApiResponse<Beneficiary>> {
    try {
      logger.info('Updating supporting documents', { beneficiaryId, count: documentUrls.length });

      // İhtiyaç sahibinin varlığını doğrula
      const currentResult = await this.getById(beneficiaryId);
      if (currentResult.error || !currentResult.data) {
        logger.error('Failed to fetch beneficiary for updating documents', { beneficiaryId, error: currentResult.error });
        return { data: null, error: currentResult.error || 'İhtiyaç sahibi bulunamadı' };
      }

      // Güncelle
      const updateResult = await this.update(beneficiaryId, { supporting_documents: documentUrls });
      if (updateResult.error) {
        logger.error('Failed to update beneficiary documents', { beneficiaryId, error: updateResult.error });
        return { data: null, error: updateResult.error };
      }

      logger.info('Successfully updated supporting documents', { beneficiaryId, count: documentUrls.length });
      return updateResult;
    } catch (error) {
      logger.error('Unexpected error in updateSupportingDocuments', error);
      return { data: null, error: 'Beklenmeyen bir hata oluştu' };
    }
  }
}

// Singleton instance
export const beneficiariesService = new BeneficiariesService();
