/**
 * @fileoverview intelligentStatsService Module - Application module
 * 
 * @author Dernek Yönetim Sistemi Team
 * @version 1.0.0
 */

// Real data stats service with Supabase integration
import { supabase } from '../lib/supabase';
import type { ApiResponse } from '../types/database';
import type { SafeStats } from '../types/stats';

import { logger } from '../lib/logging/logger';
class IntelligentStatsService {
  // Get real stats from Supabase
  async getAllStats(): Promise<ApiResponse<SafeStats>> {
    try {
      // Fetch real data from Supabase
      const [beneficiariesResult, membersResult, donationsResult, aidRequestsResult] =
        await Promise.all([
          this.getBeneficiariesStats(),
          this.getMembersStats(),
          this.getDonationsStats(),
          this.getAidRequestsStats(),
        ]);

      const stats: SafeStats = {
        beneficiaries: beneficiariesResult,
        members: membersResult,
        donations: {
          ...donationsResult,
          count: donationsResult.total,
        },
        aidRequests: aidRequestsResult,
        campaigns: {
          total: 0,
          active: 0,
          completed: 0,
          draft: 0,
          paused: 0,
          cancelled: 0,
          totalGoalAmount: 0,
          totalCurrentAmount: 0,
          averageProgress: 0,
          byCategory: {},
          mostSuccessful: [],
        },
      };

      return { data: stats, error: null };
    } catch (error: unknown) {
      // Use proper error logging instead of logger.error
      return { data: null, error: 'İstatistik verileri alınamadı' };
    }
  }

  // Get beneficiaries stats
  private async getBeneficiariesStats() {
    try {
      const { data: beneficiaries, error } = await supabase.from('ihtiyac_sahipleri').select('*');

      if (error) throw error;

      const total = beneficiaries?.length ?? 0;
      const active = beneficiaries?.filter((b) => b.status === 'active').length ?? 0;
      const passive = beneficiaries?.filter((b) => b.status === 'passive').length ?? 0;
      const suspended = beneficiaries?.filter((b) => b.status === 'suspended').length ?? 0;
      const underEvaluation =
        beneficiaries?.filter((b) => b.status === 'under_evaluation').length ?? 0;

      const totalAidAmount = beneficiaries?.reduce((sum, b) => sum + (b.toplam_tutar ?? 0), 0) || 0;
      const averageAidAmount = total > 0 ? totalAidAmount / total : 0;

      // Group by city
      const byCity: Record<string, number> = {};
      beneficiaries?.forEach((b) => {
        const city = b.sehir ?? 'Belirtilmemiş';
        byCity[city] = (byCity[city] ?? 0) + 1;
      });

      // Group by priority
      const byPriority: Record<string, number> = {};
      beneficiaries?.forEach((b) => {
        const priority = b.oncelik ?? 'Normal';
        byPriority[priority] = (byPriority[priority] ?? 0) + 1;
      });

      return {
        total,
        active,
        passive,
        suspended,
        underEvaluation,
        totalAidAmount,
        averageAidAmount,
        byCity,
        byPriority,
      };
    } catch (error) {
      logger.error('Error fetching beneficiaries stats:', error);
      return {
        total: 0,
        active: 0,
        passive: 0,
        suspended: 0,
        underEvaluation: 0,
        totalAidAmount: 0,
        averageAidAmount: 0,
        byCity: {},
        byPriority: {},
      };
    }
  }

  // Get members stats
  private async getMembersStats() {
    try {
      const { data: members, error } = await supabase.from('members').select('*');

      if (error) throw error;

      const total = members?.length ?? 0;
      const active = members?.filter((m) => m.membership_status === 'active').length ?? 0;
      const inactive = members?.filter((m) => m.membership_status === 'inactive').length ?? 0;
      const suspended = members?.filter((m) => m.membership_status === 'suspended').length ?? 0;

      // Group by membership type
      const byMembershipType: Record<string, number> = {};
      members?.forEach((m) => {
        const type = m.membership_type ?? 'Bireysel';
        byMembershipType[type] = (byMembershipType[type] ?? 0) + 1;
      });

      // Group by city
      const byCity: Record<string, number> = {};
      members?.forEach((m) => {
        const city = m.city ?? 'Belirtilmemiş';
        byCity[city] = (byCity[city] ?? 0) + 1;
      });

      // Recent joins (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const recentJoins =
        members?.filter((m) => new Date(m.joined_date) >= thirtyDaysAgo).length ?? 0;

      // Average age
      const ages =
        members
          ?.map((m) => {
            if (m.birth_date) {
              const birthDate = new Date(m.birth_date);
              const today = new Date();
              return today.getFullYear() - birthDate.getFullYear();
            }
            return null;
          })
          .filter((age) => age !== null) || [];

      const averageAge =
        ages.length > 0 ? ages.reduce((sum, age) => sum + age, 0) / ages.length : 0;

      return {
        total,
        active,
        inactive,
        suspended,
        byMembershipType,
        byCity,
        recentJoins,
        averageAge,
      };
    } catch (error) {
      logger.error('Error fetching members stats:', error);
      return {
        total: 0,
        active: 0,
        inactive: 0,
        suspended: 0,
        byMembershipType: {},
        byCity: {},
        recentJoins: 0,
        averageAge: 0,
      };
    }
  }

  // Get donations stats
  private async getDonationsStats() {
    try {
      const { data: donations, error } = await supabase.from('donations').select('*');

      if (error) throw error;

      const total = donations?.length ?? 0;
      const totalAmount = donations?.reduce((sum, d) => sum + (d.amount ?? 0), 0) || 0;
      const averageAmount = total > 0 ? totalAmount / total : 0;

      // Group by status
      const byStatus: Record<string, number> = {};
      donations?.forEach((d) => {
        const status = d.status ?? 'pending';
        byStatus[status] = (byStatus[status] ?? 0) + 1;
      });

      // Group by category
      const byCategory: Record<string, number> = {};
      donations?.forEach((d) => {
        const category = d.category ?? 'Genel';
        byCategory[category] = (byCategory[category] ?? 0) + 1;
      });

      // Group by payment method
      const byPaymentMethod: Record<string, number> = {};
      donations?.forEach((d) => {
        const method = d.payment_method ?? 'bank_transfer';
        byPaymentMethod[method] = (byPaymentMethod[method] ?? 0) + 1;
      });

      // Group by type
      const byType: Record<string, number> = {};
      donations?.forEach((d) => {
        const type = d.donation_type ?? 'cash';
        byType[type] = (byType[type] ?? 0) + 1;
      });

      // Monthly trend (last 6 months)
      const monthlyTrend = this.calculateMonthlyTrend(donations || []);

      // Top donors
      const topDonors = this.calculateTopDonors(donations || []);

      return {
        total,
        totalAmount,
        averageAmount,
        byStatus,
        byCategory,
        byPaymentMethod,
        byType,
        monthlyTrend,
        topDonors,
      };
    } catch (error) {
      logger.error('Error fetching donations stats:', error);
      return {
        total: 0,
        totalAmount: 0,
        averageAmount: 0,
        byStatus: {},
        byCategory: {},
        byPaymentMethod: {},
        byType: {},
        monthlyTrend: [],
        topDonors: [],
      };
    }
  }

  // Get aid requests stats
  private async getAidRequestsStats() {
    try {
      const { data: aidRequests, error } = await supabase.from('aid_applications').select('*');

      if (error) throw error;

      const total = aidRequests?.length ?? 0;
      const pending = aidRequests?.filter((a) => a.status === 'pending').length ?? 0;
      const underReview = aidRequests?.filter((a) => a.status === 'under_review').length ?? 0;
      const approved = aidRequests?.filter((a) => a.status === 'approved').length ?? 0;
      const rejected = aidRequests?.filter((a) => a.status === 'rejected').length ?? 0;
      const completed = aidRequests?.filter((a) => a.status === 'completed').length ?? 0;

      const totalRequestedAmount =
        aidRequests?.reduce((sum, a) => sum + (a.requested_amount ?? 0), 0) || 0;
      const totalApprovedAmount =
        aidRequests?.reduce((sum, a) => sum + (a.approved_amount ?? 0), 0) || 0;

      // Group by aid type
      const byAidType: Record<string, number> = {};
      aidRequests?.forEach((a) => {
        const type = a.aid_type ?? 'Genel';
        byAidType[type] = (byAidType[type] ?? 0) + 1;
      });

      // Group by urgency
      const byUrgency: Record<string, number> = {};
      aidRequests?.forEach((a) => {
        const urgency = a.urgency ?? 'Normal';
        byUrgency[urgency] = (byUrgency[urgency] ?? 0) + 1;
      });

      // Average processing days
      const avgProcessingDays = this.calculateAverageProcessingDays(aidRequests || []);

      return {
        total,
        pending,
        underReview,
        approved,
        rejected,
        completed,
        totalRequestedAmount,
        totalApprovedAmount,
        byAidType,
        byUrgency,
        avgProcessingDays,
      };
    } catch (error) {
      logger.error('Error fetching aid requests stats:', error);
      return {
        total: 0,
        pending: 0,
        underReview: 0,
        approved: 0,
        rejected: 0,
        completed: 0,
        totalRequestedAmount: 0,
        totalApprovedAmount: 0,
        byAidType: {},
        byUrgency: {},
        avgProcessingDays: 0,
      };
    }
  }

  // Helper methods
  private calculateMonthlyTrend(donations: any[]) {
    const monthlyData: Record<string, number> = {};
    const months = [
      'Ocak',
      'Şubat',
      'Mart',
      'Nisan',
      'Mayıs',
      'Haziran',
      'Temmuz',
      'Ağustos',
      'Eylül',
      'Ekim',
      'Kasım',
      'Aralık',
    ];

    donations.forEach((donation) => {
      const date = new Date(donation.created_at);
      const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
      monthlyData[monthKey] = (monthlyData[monthKey] ?? 0) + (donation.amount ?? 0);
    });

    // Get last 6 months
    const last6Months = [];
    const today = new Date();
    for (let i = 5; i >= 0; i--) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
      const monthName = months[date.getMonth()];
      last6Months.push({
        name: monthName,
        value: monthlyData[monthKey] ?? 0,
        month: monthName,
      });
    }

    return last6Months;
  }

  private calculateTopDonors(donations: any[]) {
    const donorTotals: Record<string, number> = {};

    donations.forEach((donation) => {
      const donor = donation.donor_name ?? 'Anonim';
      donorTotals[donor] = (donorTotals[donor] ?? 0) + (donation.amount ?? 0);
    });

    return Object.entries(donorTotals)
      .map(([name, total]) => ({ name, total }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);
  }

  private calculateAverageProcessingDays(aidRequests: any[]) {
    const processingDays = aidRequests
      .filter((a) => a.status === 'completed' && a.created_at && a.updated_at)
      .map((a) => {
        const created = new Date(a.created_at);
        const updated = new Date(a.updated_at);
        return Math.ceil((updated.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
      });

    return processingDays.length > 0
      ? processingDays.reduce((sum, days) => sum + days, 0) / processingDays.length
      : 0;
  }

  // Get current mode info for debugging
  async getCurrentMode(): Promise<{ mode: 'real' | 'demo'; hasData: boolean }> {
    return {
      mode: 'real',
      hasData: false,
    };
  }

  // Force refresh (no-op)
  async refreshDatabaseCheck(): Promise<void> {
    // No-op for frontend
  }
}

// Export singleton instance
export const intelligentStatsService = new IntelligentStatsService();
export default intelligentStatsService;
