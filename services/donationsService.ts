import { db, collections, queryHelpers } from '../lib/database';
import { logger } from '../lib/logging/logger';
import type { ApiResponse } from '../types/database';
import type {
  Donation,
  DonationInsert,
  DonationUpdate,
  DonationFilters,
  DonationStats,
} from '../types/donation';

const donationsService = {
  // Get all donations with pagination and filters
  async getDonations(
    page = 1,
    pageSize = 10,
    filters: DonationFilters = {}
  ): Promise<ApiResponse<{ data: Donation[]; count: number; totalPages: number }>> {
    try {
      logger.info('🔄 Fetching donations with filters:', filters);

      const queries: string[] = [];

      // Status filter
      if (filters.status && filters.status !== 'all') {
        queries.push(queryHelpers.equal('status', filters.status));
      }

      // Donation type filter
      if (filters.donationType && filters.donationType !== 'all') {
        queries.push(queryHelpers.equal('donation_type', filters.donationType));
      }

      // Payment method filter
      if (filters.paymentMethod && filters.paymentMethod !== 'all') {
        queries.push(queryHelpers.equal('payment_method', filters.paymentMethod));
      }

      // Donor type filter
      if (filters.donorType && filters.donorType !== 'all') {
        queries.push(queryHelpers.equal('donor_type', filters.donorType));
      }

      // Date range filter
      if (filters.dateFrom) {
        queries.push(queryHelpers.greaterThanEqualDate('created_at', filters.dateFrom));
      }
      if (filters.dateTo) {
        queries.push(queryHelpers.lessThanEqualDate('created_at', filters.dateTo));
      }

      // Amount range filter
      if (filters.minAmount) {
        queries.push(queryHelpers.greaterThanEqual('amount', filters.minAmount));
      }
      if (filters.maxAmount) {
        queries.push(queryHelpers.lessThanEqual('amount', filters.maxAmount));
      }

      // Order by creation date (newest first)
      queries.push(queryHelpers.orderDesc('created_at'));

      // Pagination
      const startIndex = (page - 1) * pageSize;
      queries.push(queryHelpers.offset(startIndex));
      queries.push(queryHelpers.limit(pageSize));

      const { data, error } = await db.list(collections.DONATIONS, queries);

      if (error) {
        logger.error('❌ Error fetching donations:', error);
        return { data: null, error: error.message };
      }

      logger.info('✅ Successfully fetched', data?.documents?.length || 0, 'donations');

      return {
        data: {
          data: data?.documents || [],
          count: data?.total || 0,
          totalPages: Math.ceil((data?.total || 0) / pageSize),
        },
        error: null,
      };
    } catch (error: any) {
      logger.error('❌ Unexpected error in getDonations:', error);
      return { data: null, error: error.message || 'Beklenmeyen hata oluştu' };
    }
  },

  // Get single donation
  async getDonation(id: string): Promise<ApiResponse<Donation>> {
    try {
      logger.info('🔄 Fetching single donation with id:', id);

      const { data, error } = await db.get(collections.DONATIONS, id);

      if (error) {
        logger.error('❌ Error fetching single donation:', error);
        return { data: null, error: error.message };
      }

      logger.info('✅ Successfully fetched donation:', data?.donor_name);
      return { data, error: null };
    } catch (error: any) {
      logger.error('❌ Unexpected error in getDonation:', error);
      return { data: null, error: error.message || 'Bağış bulunamadı' };
    }
  },

  // Get donation statistics
  async getDonationStats(): Promise<ApiResponse<DonationStats>> {
    try {
      logger.info('🔄 Fetching donation statistics');

      // Get total count and amount
      const { data: totalData, error: totalError } = await db.list(collections.DONATIONS, [
        queryHelpers.select([
          'amount',
          'status',
          'donor_type',
          'donation_type',
          'payment_method',
          'created_at',
        ]),
      ]);

      if (totalError) {
        logger.error('❌ Error fetching donation stats:', totalError);
        return { data: null, error: totalError.message };
      }

      const donations = totalData?.documents || [];

      // Calculate statistics
      const total = donations.length;
      const totalAmount = donations.reduce((sum, d) => sum + (d.amount || 0), 0);
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
            monthlyTrend[monthKey] += d.amount || 0;
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

      return { data: stats, error: null };
    } catch (error: any) {
      logger.error('❌ Error calculating donation statistics:', error);
      return { data: null, error: error.message || 'İstatistikler hesaplanamadı' };
    }
  },

  // Create new donation
  async createDonation(donationData: Partial<Donation>): Promise<ApiResponse<Donation>> {
    try {
      logger.info('🔄 Creating new donation:', donationData);

      const insertData = {
        donor_name: donationData.donor_name!,
        donor_email: donationData.donor_email,
        donor_phone: donationData.donor_phone,
        donor_type: donationData.donor_type || 'individual',
        amount: donationData.amount!,
        currency: donationData.currency || 'TRY',
        donation_type: donationData.donation_type || 'cash',
        category: donationData.category,
        description: donationData.description,
        payment_method: donationData.payment_method || 'bank_transfer',
        payment_reference: donationData.payment_reference,
        bank_account: donationData.bank_account,
        transaction_id: donationData.transaction_id,
        status: donationData.status || 'pending',
        allocated_to: donationData.allocated_to,
        beneficiary_id: donationData.beneficiary_id,
        allocation_percentage: donationData.allocation_percentage || 100.0,
        receipt_issued: donationData.receipt_issued || false,
        tax_deductible: donationData.tax_deductible || false,
        campaign_id: donationData.campaign_id,
        source: donationData.source,
        referral_code: donationData.referral_code,
        communication_preference: donationData.communication_preference,
        is_recurring: donationData.is_recurring || false,
        recurring_frequency: donationData.recurring_frequency,
        recurring_end_date: donationData.recurring_end_date,
        recurring_amount: donationData.recurring_amount,
        notes: donationData.notes,
      };

      const { data: newDonation, error } = await db.create(collections.DONATIONS, insertData);

      if (error) {
        logger.error('❌ Error creating donation:', error);
        return { data: null, error: error.message };
      }

      logger.info('✅ Successfully created donation:', newDonation?.donor_name);
      return { data: newDonation, error: null };
    } catch (error: any) {
      logger.error('❌ Unexpected error in createDonation:', error);
      return { data: null, error: error.message || 'Bağış oluşturulamadı' };
    }
  },

  // Update donation
  async updateDonation(id: string, updates: Partial<Donation>): Promise<ApiResponse<Donation>> {
    try {
      logger.info('🔄 Updating donation:', id, updates);

      const { data, error } = await db.update(collections.DONATIONS, id, {
        ...updates,
        updated_at: new Date().toISOString(),
      });

      if (error) {
        logger.error('❌ Error updating donation:', error);
        return { data: null, error: error.message };
      }

      logger.info('✅ Successfully updated donation:', data?.donor_name);
      return { data, error: null };
    } catch (error: any) {
      logger.error('❌ Unexpected error in updateDonation:', error);
      return { data: null, error: error.message || 'Bağış güncellenemedi' };
    }
  },

  // Delete donation
  async deleteDonation(id: string): Promise<ApiResponse<boolean>> {
    try {
      logger.info('🔄 Deleting donation:', id);

      const { error } = await db.delete(collections.DONATIONS, id);

      if (error) {
        logger.error('❌ Error deleting donation:', error);
        return { data: null, error: error.message };
      }

      logger.info('✅ Successfully deleted donation:', id);
      return { data: true, error: null };
    } catch (error: any) {
      logger.error('❌ Unexpected error in deleteDonation:', error);
      return { data: null, error: error.message || 'Bağış silinemedi' };
    }
  },

  // Get donor types for filter dropdown
  async getDonorTypes(): Promise<ApiResponse<string[]>> {
    try {
      const { data, error } = await db.list(collections.DONATIONS, [
        queryHelpers.select(['donor_type']),
        queryHelpers.notEqual('donor_type', null),
      ]);

      if (error) {
        return { data: null, error: error.message };
      }

      const donorTypes = [...new Set(data?.documents?.map((item) => item.donor_type))].sort(
        (a, b) => a.localeCompare(b)
      );
      return { data: donorTypes, error: null };
    } catch (error: any) {
      return { data: null, error: error.message || 'Bağışçı türleri getirilemedi' };
    }
  },

  // Get donation types for filter dropdown
  async getDonationTypes(): Promise<ApiResponse<string[]>> {
    try {
      const { data, error } = await db.list(collections.DONATIONS, [
        queryHelpers.select(['donation_type']),
        queryHelpers.notEqual('donation_type', null),
      ]);

      if (error) {
        return { data: null, error: error.message };
      }

      const donationTypes = [...new Set(data?.documents?.map((item) => item.donation_type))].sort(
        (a, b) => a.localeCompare(b)
      );
      return { data: donationTypes, error: null };
    } catch (error: any) {
      return { data: null, error: error.message || 'Bağış türleri getirilemedi' };
    }
  },

  // Get payment methods for filter dropdown
  async getPaymentMethods(): Promise<ApiResponse<string[]>> {
    try {
      const { data, error } = await db.list(collections.DONATIONS, [
        queryHelpers.select(['payment_method']),
        queryHelpers.notEqual('payment_method', null),
      ]);

      if (error) {
        return { data: null, error: error.message };
      }

      const paymentMethods = [...new Set(data?.documents?.map((item) => item.payment_method))].sort(
        (a, b) => a.localeCompare(b)
      );
      return { data: paymentMethods, error: null };
    } catch (error: any) {
      return { data: null, error: error.message || 'Ödeme yöntemleri getirilemedi' };
    }
  },

  // Bulk approve donations
  async bulkApproveDonations(ids: string[]): Promise<ApiResponse<boolean>> {
    try {
      logger.info('🔄 Bulk approving donations:', ids);

      // Appwrite doesn't have bulk update, so we'll update each donation individually
      const updatePromises = ids.map((id) =>
        db.update(collections.DONATIONS, id, {
          status: 'approved',
          approval_date: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
      );

      const results = await Promise.allSettled(updatePromises);
      const errors = results.filter((result) => result.status === 'rejected');

      if (errors.length > 0) {
        logger.error('❌ Error bulk approving donations:', errors);
        return { data: null, error: `Failed to approve ${errors.length} donations` };
      }

      logger.info('✅ Successfully bulk approved', ids.length, 'donations');
      return { data: true, error: null };
    } catch (error: any) {
      logger.error('❌ Unexpected error in bulkApproveDonations:', error);
      return { data: null, error: error.message || 'Toplu onay işlemi başarısız' };
    }
  },

  // Export donations to CSV
  async exportDonations(filters: DonationFilters = {}): Promise<ApiResponse<Donation[]>> {
    try {
      logger.info('🔄 Exporting donations with filters:', filters);

      const queries: string[] = [];

      // Apply same filters as getDonations but without pagination
      if (filters.status && filters.status !== 'all') {
        queries.push(queryHelpers.equal('status', filters.status));
      }

      if (filters.donationType && filters.donationType !== 'all') {
        queries.push(queryHelpers.equal('donation_type', filters.donationType));
      }

      if (filters.paymentMethod && filters.paymentMethod !== 'all') {
        queries.push(queryHelpers.equal('payment_method', filters.paymentMethod));
      }

      if (filters.donorType && filters.donorType !== 'all') {
        queries.push(queryHelpers.equal('donor_type', filters.donorType));
      }

      if (filters.dateFrom) {
        queries.push(queryHelpers.greaterThanEqualDate('created_at', filters.dateFrom));
      }
      if (filters.dateTo) {
        queries.push(queryHelpers.lessThanEqualDate('created_at', filters.dateTo));
      }

      queries.push(queryHelpers.orderDesc('created_at'));

      const { data, error } = await db.list(collections.DONATIONS, queries);

      if (error) {
        logger.error('❌ Error exporting donations:', error);
        return { data: null, error: error.message };
      }

      logger.info('✅ Successfully exported', data?.documents?.length || 0, 'donations');
      return { data: data?.documents || [], error: null };
    } catch (error: any) {
      logger.error('❌ Unexpected error in exportDonations:', error);
      return { data: null, error: error.message || 'Dışa aktarma başarısız' };
    }
  },
};

// Export the service
export { donationsService };

// Default export
export default donationsService;
