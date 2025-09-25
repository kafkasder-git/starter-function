/**
 * @fileoverview donationsService Module - Application module
 * 
 * @author Dernek Yönetim Sistemi Team
 * @version 1.0.0
 */

import { supabase } from '../lib/supabase';
import { logger } from '../lib/logging/logger';

// Donation interface
/**
 * Donation Interface
 * 
 * @interface Donation
 */
export interface Donation {
  id: number;
  donor_name: string;
  donor_email?: string;
  donor_phone?: string;
  donor_type: 'individual' | 'corporate' | 'foundation' | 'government';
  amount: number;
  currency: string;
  donation_type: 'cash' | 'in_kind' | 'services' | 'other';
  category?: string;
  description?: string;
  payment_method: 'bank_transfer' | 'credit_card' | 'cash' | 'check' | 'online' | 'other';
  payment_reference?: string;
  bank_account?: string;
  transaction_id?: string;
  status: 'pending' | 'approved' | 'rejected' | 'processing' | 'completed';
  approval_date?: string;
  processed_by?: string;
  rejection_reason?: string;
  allocated_to?: string;
  beneficiary_id?: number;
  allocation_percentage: number;
  receipt_issued: boolean;
  receipt_number?: string;
  receipt_date?: string;
  tax_deductible: boolean;
  tax_certificate_number?: string;
  campaign_id?: number;
  source?: string;
  referral_code?: string;
  thank_you_sent: boolean;
  thank_you_date?: string;
  communication_preference?: 'email' | 'phone' | 'mail' | 'none';
  is_recurring: boolean;
  recurring_frequency?: 'monthly' | 'quarterly' | 'yearly';
  recurring_end_date?: string;
  recurring_amount?: number;
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
  ip_address?: string;
  user_agent?: string;
  notes?: string;
}

// API response type
/**
 * DonationsApiResponse Interface
 * 
 * @interface DonationsApiResponse
 */
export interface DonationsApiResponse<T> {
  data?: T;
  error?: string;
  count?: number;
  totalPages?: number;
}

// Filters interface
/**
 * DonationsFilters Interface
 * 
 * @interface DonationsFilters
 */
export interface DonationsFilters {
  searchTerm?: string;
  status?: string;
  donationType?: string;
  paymentMethod?: string;
  donorType?: string;
  dateFrom?: string;
  dateTo?: string;
  minAmount?: number;
  maxAmount?: number;
}

// Donation statistics interface
/**
 * DonationStats Interface
 * 
 * @interface DonationStats
 */
export interface DonationStats {
  total: number;
  totalAmount: number;
  pending: number;
  approved: number;
  rejected: number;
  averageAmount: number;
  monthlyTrend: Record<string, number>;
  donorTypes: Record<string, number>;
  donationTypes: Record<string, number>;
  paymentMethods: Record<string, number>;
}

/**
 * DonationsService Service
 * 
 * Service class for handling donationsservice operations
 * 
 * @class DonationsService
 */
export class DonationsService {
  // Get all donations with pagination and filters
  async getDonations(
    page = 1,
    pageSize = 10,
    filters: DonationsFilters = {},
  ): Promise<DonationsApiResponse<Donation[]>> {
    try {
      logger.info('🔄 Fetching donations with filters:', filters);

      let query = supabase.from('donations').select('*', { count: 'exact' });

      // Search filter
      if (filters.searchTerm) {
        const term = filters.searchTerm.toLowerCase();
        query = query.or(
          `donor_name.ilike.%${term}%,donor_email.ilike.%${term}%,payment_reference.ilike.%${term}%`,
        );
      }

      // Status filter
      if (filters.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }

      // Donation type filter
      if (filters.donationType && filters.donationType !== 'all') {
        query = query.eq('donation_type', filters.donationType);
      }

      // Payment method filter
      if (filters.paymentMethod && filters.paymentMethod !== 'all') {
        query = query.eq('payment_method', filters.paymentMethod);
      }

      // Donor type filter
      if (filters.donorType && filters.donorType !== 'all') {
        query = query.eq('donor_type', filters.donorType);
      }

      // Date range filter
      if (filters.dateFrom) {
        query = query.gte('created_at', filters.dateFrom);
      }
      if (filters.dateTo) {
        query = query.lte('created_at', filters.dateTo);
      }

      // Amount range filter
      if (filters.minAmount) {
        query = query.gte('amount', filters.minAmount);
      }
      if (filters.maxAmount) {
        query = query.lte('amount', filters.maxAmount);
      }

      // Pagination
      const startIndex = (page - 1) * pageSize;
      query = query.range(startIndex, startIndex + pageSize - 1);

      // Order by creation date (newest first)
      query = query.order('created_at', { ascending: false });

      const { data, error, count } = await query;

      if (error) {
        logger.error('❌ Error fetching donations:', error);
        return { error: error.message };
      }

      logger.info('✅ Successfully fetched', data?.length ?? 0, 'donations');

      return {
        data: data || [],
        count: count ?? 0,
        totalPages: Math.ceil((count ?? 0) / pageSize),
      };
    } catch (error: any) {
      logger.error('❌ Unexpected error in getDonations:', error);
      return { error: error.message ?? 'Beklenmeyen hata oluştu' };
    }
  }

  // Get single donation
  async getDonation(id: number): Promise<DonationsApiResponse<Donation>> {
    try {
      logger.info('🔄 Fetching single donation with id:', id);

      const { data, error } = await supabase.from('donations').select('*').eq('id', id).single();

      if (error) {
        logger.error('❌ Error fetching single donation:', error);
        return { error: error.message };
      }

      logger.info('✅ Successfully fetched donation:', data?.donor_name);
      return { data };
    } catch (error: any) {
      logger.error('❌ Unexpected error in getDonation:', error);
      return { error: error.message ?? 'Bağış bulunamadı' };
    }
  }

  // Get donation statistics
  async getDonationStats(): Promise<DonationsApiResponse<DonationStats>> {
    try {
      logger.info('🔄 Fetching donation statistics');

      // Get total count and amount
      const { data: totalData, error: totalError } = await supabase
        .from('donations')
        .select('amount, status, donor_type, donation_type, payment_method, created_at');

      if (totalError) {
        logger.error('❌ Error fetching donation stats:', totalError);
        return { error: totalError.message };
      }

      const donations = totalData || [];

      // Calculate statistics
      const total = donations.length;
      const totalAmount = donations.reduce((sum, d) => sum + (d.amount ?? 0), 0);
      const averageAmount = total > 0 ? totalAmount / total : 0;

      // Status breakdown
      const statusCounts = donations.reduce<Record<string, number>>((acc, d) => {
        acc[d.status] = (acc[d.status] || 0) + 1;
        return acc;
      }, {});

      // Monthly trend (last 12 months)
      const monthlyTrend: Record<string, number> = {};
      const now = new Date();
      for (let i = 11; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        monthlyTrend[monthKey] = 0;
      }

      donations.forEach((d) => {
        if (d.created_at) {
          const date = new Date(d.created_at);
          const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          if (monthlyTrend[monthKey] !== undefined) {
            monthlyTrend[monthKey] += d.amount ?? 0;
          }
        }
      });

      // Donor types breakdown
      const donorTypes = donations.reduce<Record<string, number>>((acc, d) => {
        acc[d.donor_type] = (acc[d.donor_type] || 0) + 1;
        return acc;
      }, {});

      // Donation types breakdown
      const donationTypes = donations.reduce<Record<string, number>>((acc, d) => {
        acc[d.donation_type] = (acc[d.donation_type] || 0) + 1;
        return acc;
      }, {});

      // Payment methods breakdown
      const paymentMethods = donations.reduce<Record<string, number>>((acc, d) => {
        acc[d.payment_method] = (acc[d.payment_method] || 0) + 1;
        return acc;
      }, {});

      const stats: DonationStats = {
        total,
        totalAmount,
        pending: statusCounts.pending ?? 0,
        approved: statusCounts.approved ?? 0,
        rejected: statusCounts.rejected ?? 0,
        averageAmount,
        monthlyTrend,
        donorTypes,
        donationTypes,
        paymentMethods,
      };

      logger.info('✅ Successfully calculated donation statistics:', {
        total: stats.total,
        totalAmount: stats.totalAmount,
        averageAmount: stats.averageAmount,
      });

      return { data: stats };
    } catch (error: any) {
      logger.error('❌ Error calculating donation statistics:', error);
      return { error: error.message ?? 'İstatistikler hesaplanamadı' };
    }
  }

  // Create new donation
  async createDonation(donationData: Partial<Donation>): Promise<DonationsApiResponse<Donation>> {
    try {
      logger.info('🔄 Creating new donation:', donationData);

      const { data: newDonation, error } = await supabase
        .from('donations')
        .insert([
          {
            donor_name: donationData.donor_name!,
            donor_email: donationData.donor_email,
            donor_phone: donationData.donor_phone,
            donor_type: donationData.donor_type ?? 'individual',
            amount: donationData.amount!,
            currency: donationData.currency ?? 'TRY',
            donation_type: donationData.donation_type ?? 'cash',
            category: donationData.category,
            description: donationData.description,
            payment_method: donationData.payment_method ?? 'bank_transfer',
            payment_reference: donationData.payment_reference,
            bank_account: donationData.bank_account,
            transaction_id: donationData.transaction_id,
            status: donationData.status ?? 'pending',
            allocated_to: donationData.allocated_to,
            beneficiary_id: donationData.beneficiary_id,
            allocation_percentage: donationData.allocation_percentage ?? 100.0,
            receipt_issued: donationData.receipt_issued ?? false,
            tax_deductible: donationData.tax_deductible ?? false,
            campaign_id: donationData.campaign_id,
            source: donationData.source,
            referral_code: donationData.referral_code,
            communication_preference: donationData.communication_preference,
            is_recurring: donationData.is_recurring ?? false,
            recurring_frequency: donationData.recurring_frequency,
            recurring_end_date: donationData.recurring_end_date,
            recurring_amount: donationData.recurring_amount,
            notes: donationData.notes,
          },
        ])
        .select()
        .single();

      if (error) {
        logger.error('❌ Error creating donation:', error);
        return { error: error.message };
      }

      logger.info('✅ Successfully created donation:', newDonation?.donor_name);
      return { data: newDonation };
    } catch (error: any) {
      logger.error('❌ Unexpected error in createDonation:', error);
      return { error: error.message ?? 'Bağış oluşturulamadı' };
    }
  }

  // Update donation
  async updateDonation(
    id: number,
    updates: Partial<Donation>,
  ): Promise<DonationsApiResponse<Donation>> {
    try {
      logger.info('🔄 Updating donation:', id, updates);

      const { data, error } = await supabase
        .from('donations')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        logger.error('❌ Error updating donation:', error);
        return { error: error.message };
      }

      logger.info('✅ Successfully updated donation:', data?.donor_name);
      return { data };
    } catch (error: any) {
      logger.error('❌ Unexpected error in updateDonation:', error);
      return { error: error.message ?? 'Bağış güncellenemedi' };
    }
  }

  // Delete donation
  async deleteDonation(id: number): Promise<DonationsApiResponse<boolean>> {
    try {
      logger.info('🔄 Deleting donation:', id);

      const { error } = await supabase.from('donations').delete().eq('id', id);

      if (error) {
        logger.error('❌ Error deleting donation:', error);
        return { error: error.message };
      }

      logger.info('✅ Successfully deleted donation:', id);
      return { data: true };
    } catch (error: any) {
      logger.error('❌ Unexpected error in deleteDonation:', error);
      return { error: error.message ?? 'Bağış silinemedi' };
    }
  }

  // Get donor types for filter dropdown
  async getDonorTypes(): Promise<DonationsApiResponse<string[]>> {
    try {
      const { data, error } = await supabase
        .from('donations')
        .select('donor_type')
        .not('donor_type', 'is', null);

      if (error) {
        return { error: error.message };
      }

      const donorTypes = [...new Set(data.map((item) => item.donor_type))].sort();
      return { data: donorTypes };
    } catch (error: any) {
      return { error: error.message ?? 'Bağışçı türleri getirilemedi' };
    }
  }

  // Get donation types for filter dropdown
  async getDonationTypes(): Promise<DonationsApiResponse<string[]>> {
    try {
      const { data, error } = await supabase
        .from('donations')
        .select('donation_type')
        .not('donation_type', 'is', null);

      if (error) {
        return { error: error.message };
      }

      const donationTypes = [...new Set(data.map((item) => item.donation_type))].sort();
      return { data: donationTypes };
    } catch (error: any) {
      return { error: error.message ?? 'Bağış türleri getirilemedi' };
    }
  }

  // Get payment methods for filter dropdown
  async getPaymentMethods(): Promise<DonationsApiResponse<string[]>> {
    try {
      const { data, error } = await supabase
        .from('donations')
        .select('payment_method')
        .not('payment_method', 'is', null);

      if (error) {
        return { error: error.message };
      }

      const paymentMethods = [...new Set(data.map((item) => item.payment_method))].sort();
      return { data: paymentMethods };
    } catch (error: any) {
      return { error: error.message ?? 'Ödeme yöntemleri getirilemedi' };
    }
  }

  // Bulk approve donations
  async bulkApproveDonations(ids: number[]): Promise<DonationsApiResponse<boolean>> {
    try {
      logger.info('🔄 Bulk approving donations:', ids);

      const { error } = await supabase
        .from('donations')
        .update({
          status: 'approved',
          approval_date: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .in('id', ids);

      if (error) {
        logger.error('❌ Error bulk approving donations:', error);
        return { error: error.message };
      }

      logger.info('✅ Successfully bulk approved', ids.length, 'donations');
      return { data: true };
    } catch (error: any) {
      logger.error('❌ Unexpected error in bulkApproveDonations:', error);
      return { error: error.message ?? 'Toplu onay işlemi başarısız' };
    }
  }

  // Export donations to CSV
  async exportDonations(filters: DonationsFilters = {}): Promise<DonationsApiResponse<Donation[]>> {
    try {
      logger.info('🔄 Exporting donations with filters:', filters);

      let query = supabase.from('donations').select('*');

      // Apply same filters as getDonations but without pagination
      if (filters.searchTerm) {
        const term = filters.searchTerm.toLowerCase();
        query = query.or(
          `donor_name.ilike.%${term}%,donor_email.ilike.%${term}%,payment_reference.ilike.%${term}%`,
        );
      }

      if (filters.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }

      if (filters.donationType && filters.donationType !== 'all') {
        query = query.eq('donation_type', filters.donationType);
      }

      if (filters.paymentMethod && filters.paymentMethod !== 'all') {
        query = query.eq('payment_method', filters.paymentMethod);
      }

      if (filters.donorType && filters.donorType !== 'all') {
        query = query.eq('donor_type', filters.donorType);
      }

      if (filters.dateFrom) {
        query = query.gte('created_at', filters.dateFrom);
      }
      if (filters.dateTo) {
        query = query.lte('created_at', filters.dateTo);
      }

      query = query.order('created_at', { ascending: false });

      const { data, error } = await query;

      if (error) {
        logger.error('❌ Error exporting donations:', error);
        return { error: error.message };
      }

      logger.info('✅ Successfully exported', data?.length ?? 0, 'donations');
      return { data: data || [] };
    } catch (error: any) {
      logger.error('❌ Unexpected error in exportDonations:', error);
      return { error: error.message ?? 'Dışa aktarma başarısız' };
    }
  }
}

// Singleton instance
export const donationsService = new DonationsService();

// Default export
export default donationsService;
