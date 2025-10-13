/**
 * @fileoverview useDonations Module - Application module
 *
 * @author Dernek Yönetim Sistemi Team
 * @version 1.0.0
 */

import { useCallback, useMemo } from 'react';
import { toast } from 'sonner';
import { collections } from '../lib/database';
import type {
  Donation,
  DonationInsert,
  DonationUpdate,
  DonationWithMember,
} from '../types/database';
import { useAppwriteData, useAppwritePagination } from './useAppwriteData';

// Basic donations hook
/**
 * useDonations function
 *
 * @param {Object} params - Function parameters
 * @returns {void} Nothing
 */
export function useDonations(
  options: {
    includeDeleted?: boolean;
    status?: 'pending' | 'completed' | 'cancelled' | 'refunded';
    donationType?: 'one_time' | 'monthly' | 'yearly';
    category?: string;
    campaignId?: string;
    memberId?: string;
    dateRange?: { start: string; end: string };
    realtime?: boolean;
  } = {}
) {
  const {
    includeDeleted = false,
    status,
    donationType,
    category,
    campaignId,
    memberId,
    dateRange: _dateRange,
    realtime = true,
  } = options;

  const filters = useMemo(() => {
    const f: Record<string, any> = {};

    if (!includeDeleted) {
      f.deleted_at = 'is.null';
    }

    if (status) {
      f.status = status;
    }

    if (donationType) {
      f.donation_type = donationType;
    }

    if (category) {
      f.category = category;
    }

    if (campaignId) {
      f.campaign_id = campaignId;
    }

    if (memberId) {
      f.member_id = memberId;
    }

    // Date range filtering would need to be handled differently in a real implementation
    // This is a simplified version

    return f;
  }, [includeDeleted, status, donationType, category, campaignId, memberId]);

  const {
    data: donations,
    loading,
    error,
    count,
    refetch,
    insert,
    update,
    delete: deleteDonation,
    bulkInsert,
    bulkUpdate,
    bulkDelete,
  } = useAppwriteData<Donation>(collections.DONATIONS, {
    select: '*',
    orderBy: { column: 'created_at', ascending: false },
    filters,
    realtime,
  });

  // Create new donation
  const createDonation = useCallback(
    async (donationData: Omit<DonationInsert, 'created_by'>) => {
      try {
        const newDonation = await insert({
          ...donationData,
          created_by: 'current-user-id', // Replace with actual user ID from auth context
        });

        toast.success(`${donationData.donor_name} bağışı başarıyla eklendi`);
        return newDonation;
      } catch (error) {
        throw error;
      }
    },
    [insert]
  );

  // Update donation
  const updateDonation = useCallback(
    async (id: string, donationData: Partial<DonationUpdate>) => {
      try {
        const updatedDonation = await update(id, {
          ...donationData,
          updated_by: 'current-user-id',
          updated_at: new Date().toISOString(),
        });

        return updatedDonation;
      } catch (error) {
        throw error;
      }
    },
    [update]
  );

  // Process donation (mark as completed)
  const processDonation = useCallback(
    async (id: string, processedBy?: string) => {
      return updateDonation(id, {
        status: 'completed',
        processed_by: processedBy ?? 'current-user-id',
      });
    },
    [updateDonation]
  );

  // Cancel donation
  const cancelDonation = useCallback(
    async (id: string, reason?: string) => {
      return updateDonation(id, {
        status: 'cancelled',
        notes: reason ? `İptal nedeni: ${reason}` : undefined,
      });
    },
    [updateDonation]
  );

  // Refund donation
  const refundDonation = useCallback(
    async (id: string, reason?: string) => {
      return updateDonation(id, {
        status: 'refunded',
        notes: reason ? `İade nedeni: ${reason}` : undefined,
      });
    },
    [updateDonation]
  );

  // Get donation statistics
  const getStats = useCallback(() => {
    const completedDonations = donations.filter((d: Donation) => d.status === 'completed');
    const totalAmount = completedDonations.reduce((sum: number, d: Donation) => sum + d.amount, 0);
    const averageAmount =
      completedDonations.length > 0 ? totalAmount / completedDonations.length : 0;

    return {
      total: donations.length,
      completed: completedDonations.length,
      pending: donations.filter((d: Donation) => d.status === 'pending').length,
      cancelled: donations.filter((d: Donation) => d.status === 'cancelled').length,
      refunded: donations.filter((d: Donation) => d.status === 'refunded').length,
      totalAmount,
      averageAmount,
      byType: {
        one_time: donations.filter((d: Donation) => d.donation_type === 'one_time').length,
        monthly: donations.filter((d: Donation) => d.donation_type === 'monthly').length,
        yearly: donations.filter((d: Donation) => d.donation_type === 'yearly').length,
      },
      byCategory: {
        general: donations.filter((d: Donation) => d.category === 'general').length,
        education: donations.filter((d: Donation) => d.category === 'education').length,
        health: donations.filter((d: Donation) => d.category === 'health').length,
        emergency: donations.filter((d: Donation) => d.category === 'emergency').length,
        other: donations.filter((d: Donation) => d.category === 'other').length,
      },
      byPaymentMethod: {
        cash: donations.filter((d: Donation) => d.payment_method === 'cash').length,
        bank_transfer: donations.filter((d: Donation) => d.payment_method === 'bank_transfer')
          .length,
        credit_card: donations.filter((d: Donation) => d.payment_method === 'credit_card').length,
        online: donations.filter((d: Donation) => d.payment_method === 'online').length,
      },
    };
  }, [donations]);

  // Bulk status updates
  const bulkUpdateStatus = useCallback(
    async (ids: string[], status: Donation['status']) => {
      const updates = ids.map((id) => ({
        id,
        data: {
          status,
          updated_by: 'current-user-id',
          updated_at: new Date().toISOString(),
          ...(status === 'completed' ? { processed_by: 'current-user-id' } : {}),
        } as Partial<Donation>,
      }));

      await bulkUpdate(updates);

      const statusText = {
        pending: 'beklemede',
        completed: 'tamamlandı',
        cancelled: 'iptal edildi',
        refunded: 'iade edildi',
      };

      toast.success(`${ids.length} bağış ${statusText[status]} olarak işaretlendi`);
    },
    [bulkUpdate]
  );

  // Get monthly donation trend
  const getMonthlyTrend = useCallback(() => {
    const monthlyData: Record<string, { count: number; amount: number }> = {};

    donations
      .filter((d: Donation) => d.status === 'completed')
      .forEach((donation: Donation) => {
        const month = new Date(donation.created_at).toISOString().slice(0, 7); // YYYY-MM

        if (!monthlyData[month]) {
          monthlyData[month] = { count: 0, amount: 0 };
        }

        monthlyData[month].count += 1;
        monthlyData[month].amount += donation.amount;
      });

    return Object.entries(monthlyData)
      .map(([month, data]) => ({
        month,
        count: data.count,
        amount: data.amount,
      }))
      .sort((a, b) => a.month.localeCompare(b.month));
  }, [donations]);

  return {
    donations,
    loading,
    error,
    count,
    stats: getStats(),
    monthlyTrend: getMonthlyTrend(),
    refetch,
    createDonation,
    updateDonation,
    deleteDonation,
    processDonation,
    cancelDonation,
    refundDonation,
    bulkInsert,
    bulkUpdate,
    bulkDelete,
    bulkUpdateStatus,
  };
}

// Paginated donations hook
/**
 * useDonationsPaginated function
 *
 * @param {Object} params - Function parameters
 * @returns {void} Nothing
 */
export function useDonationsPaginated(
  options: {
    pageSize?: number;
    includeDeleted?: boolean;
    searchQuery?: string;
    filters?: Record<string, any>;
  } = {}
) {
  const {
    pageSize = 20,
    includeDeleted = false,
    searchQuery = '',
    filters: additionalFilters = {},
  } = options;

  const filters = useMemo(() => {
    const f = { ...additionalFilters };

    if (!includeDeleted) {
      f.deleted_at = 'is.null';
    }

    return f;
  }, [includeDeleted, additionalFilters]);

  const searchFields = ['donor_name', 'donor_email', 'reference_number'];

  return useAppwritePagination<Donation>(collections.DONATIONS, {
    select: '*',
    orderBy: { column: 'created_at', ascending: false },
    pageSize,
    filters,
    searchQuery,
    searchFields,
  });
}

// Donations with member info hook
/**
 * useDonationsWithMembers function
 *
 * @param {Object} params - Function parameters
 * @returns {void} Nothing
 */
export function useDonationsWithMembers(
  options: {
    limit?: number;
    status?: string;
    includeDeleted?: boolean;
  } = {}
) {
  const { limit = 100, status, includeDeleted = false } = options;

  const filters = useMemo(() => {
    const f: Record<string, any> = {};

    if (!includeDeleted) {
      f.deleted_at = 'is.null';
    }

    if (status) {
      f.status = status;
    }

    return f;
  }, [includeDeleted, status]);

  // This would be a more complex query in real implementation using joins
  const {
    data: donations,
    loading: donationsLoading,
    error: donationsError,
  } = useAppwriteData<Donation>(collections.DONATIONS, {
    select: '*',
    orderBy: { column: 'created_at', ascending: false },
    filters,
    limit,
  });

  const {
    data: members,
    loading: membersLoading,
    error: membersError,
  } = useSupabaseData(TABLES.MEMBERS, {
    select: 'id, name, email, status, membership_type',
    filters: { deleted_at: 'is.null' },
  });

  const loading = donationsLoading ?? membersLoading;
  const error = donationsError ?? membersError;

  const donationsWithMembers: DonationWithMember[] = useMemo(() => {
    return donations.map((donation: Donation) => {
      const member = donation.member_id
        ? members.find((m: any) => m.id === donation.member_id)
        : undefined;

      return {
        ...donation,
        member,
      };
    });
  }, [donations, members]);

  return {
    donations: donationsWithMembers,
    loading,
    error,
  };
}

// Donation export data formatter
/**
 * useDonationExportData function
 *
 * @param {Object} params - Function parameters
 * @returns {void} Nothing
 */
export function useDonationExportData() {
  const formatDonationForExport = useCallback((donation: Donation) => {
    return {
      id: donation.id,
      donorName: donation.donor_name,
      donorEmail: donation.donor_email ?? '-',
      donorPhone: donation.donor_phone ?? '-',
      amount: donation.amount,
      currency: donation.currency,
      donationType: donation.donation_type,
      category: donation.category,
      paymentMethod: donation.payment_method,
      status: donation.status,
      referenceNumber: donation.reference_number ?? '-',
      isAnonymous: donation.is_anonymous ? 'Evet' : 'Hayır',
      taxDeductible: donation.tax_deductible ? 'Evet' : 'Hayır',
      notes: donation.notes ?? '-',
      createdAt: donation.created_at,
      processedBy: donation.processed_by ?? '-',
    };
  }, []);

  const formatDonationsForExport = useCallback(
    (donations: Donation[]) => {
      return donations.map(formatDonationForExport);
    },
    [formatDonationForExport]
  );

  const getDonationSummary = useCallback((donations: Donation[]) => {
    const completed = donations.filter((d: Donation) => d.status === 'completed');
    const totalAmount = completed.reduce((sum: number, d: Donation) => sum + d.amount, 0);

    return {
      totalDonations: donations.length,
      completedDonations: completed.length,
      totalAmount,
      averageAmount: completed.length > 0 ? totalAmount / completed.length : 0,
      exportDate: new Date().toISOString(),
    };
  }, []);

  return {
    formatDonationForExport,
    formatDonationsForExport,
    getDonationSummary,
  };
}
