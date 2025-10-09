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
// Domain shapes (lightweight to avoid deep coupling). Adjust if DB types exist elsewhere.
interface BeneficiaryRecord {
  status?: string;
  toplam_tutar?: number;
  sehir?: string;
  oncelik?: string;
}

interface MemberRecord {
  membership_status?: string;
  membership_type?: string;
  city?: string;
  joined_date?: string;
  birth_date?: string;
}

interface DonationRecord {
  amount?: number;
  status?: string;
  category?: string;
  payment_method?: string;
  donation_type?: string;
  created_at?: string;
  donor_name?: string;
}

interface AidRequestRecord {
  status?: string;
  requested_amount?: number;
  approved_amount?: number;
  aid_type?: string;
  urgency?: string;
  created_at?: string;
  updated_at?: string;
}

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
        donations: donationsResult,
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
      const active =
        beneficiaries?.filter((b: BeneficiaryRecord) => b.status === 'active').length ?? 0;
      const passive =
        beneficiaries?.filter((b: BeneficiaryRecord) => b.status === 'passive').length ?? 0;
      const suspended =
        beneficiaries?.filter((b: BeneficiaryRecord) => b.status === 'suspended').length ?? 0;
      const underEvaluation =
        beneficiaries?.filter((b: BeneficiaryRecord) => b.status === 'under_evaluation').length ??
        0;

      const totalAidAmount =
        beneficiaries?.reduce(
          (sum: number, b: BeneficiaryRecord) => sum + (b.toplam_tutar ?? 0),
          0,
        ) || 0;
      const averageAidAmount = total > 0 ? totalAidAmount / total : 0;

      // Group by city
      const byCity: Record<string, number> = {};
      beneficiaries?.forEach((b: BeneficiaryRecord) => {
        const city = b.sehir ?? 'Belirtilmemiş';
        byCity[city] = (byCity[city] ?? 0) + 1;
      });

      // Group by priority
      const byPriority: Record<string, number> = {};
      beneficiaries?.forEach((b: BeneficiaryRecord) => {
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
      const active =
        members?.filter((m: MemberRecord) => m.membership_status === 'active').length ?? 0;
      const inactive =
        members?.filter((m: MemberRecord) => m.membership_status === 'inactive').length ?? 0;
      const suspended =
        members?.filter((m: MemberRecord) => m.membership_status === 'suspended').length ?? 0;

      // Group by membership type
      const byMembershipType: Record<string, number> = {};
      members?.forEach((m: MemberRecord) => {
        const type = m.membership_type ?? 'Bireysel';
        byMembershipType[type] = (byMembershipType[type] ?? 0) + 1;
      });

      // Group by city
      const byCity: Record<string, number> = {};
      members?.forEach((m: MemberRecord) => {
        const city = m.city ?? 'Belirtilmemiş';
        byCity[city] = (byCity[city] ?? 0) + 1;
      });

      // Recent joins (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const recentJoins =
        members?.filter(
          (m: MemberRecord) => m.joined_date && new Date(m.joined_date) >= thirtyDaysAgo,
        ).length ?? 0;

      // Average age
      const ages =
        members
          ?.map((m: MemberRecord) => {
            if (m.birth_date) {
              const birthDate = new Date(m.birth_date);
              const today = new Date();
              return today.getFullYear() - birthDate.getFullYear();
            }
            return null;
          })
          .filter((age: number | null): age is number => age !== null) || [];

      const averageAge =
        ages.length > 0 ? ages.reduce((sum: number, age: number) => sum + age, 0) / ages.length : 0;

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
      const totalAmount =
        donations?.reduce((sum: number, d: DonationRecord) => sum + (d.amount ?? 0), 0) || 0;
      const averageAmount = total > 0 ? totalAmount / total : 0;

      // Group by status
      const byStatus: Record<string, number> = {};
      donations?.forEach((d: DonationRecord) => {
        const status = d.status ?? 'pending';
        byStatus[status] = (byStatus[status] ?? 0) + 1;
      });

      // Group by category
      const byCategory: Record<string, number> = {};
      donations?.forEach((d: DonationRecord) => {
        const category = d.category ?? 'Genel';
        byCategory[category] = (byCategory[category] ?? 0) + 1;
      });

      // Group by payment method
      const byPaymentMethod: Record<string, number> = {};
      donations?.forEach((d: DonationRecord) => {
        const method = d.payment_method ?? 'bank_transfer';
        byPaymentMethod[method] = (byPaymentMethod[method] ?? 0) + 1;
      });

      // Group by type
      const byType: Record<string, number> = {};
      donations?.forEach((d: DonationRecord) => {
        const type = d.donation_type ?? 'cash';
        byType[type] = (byType[type] ?? 0) + 1;
      });

      // Monthly trend (last 6 months)
      const monthlyTrend = this.calculateMonthlyTrend(donations || []);

      // Top donors
      const topDonors = this.calculateTopDonors(donations || []);

      return {
        total,
        count: total,
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
        count: 0,
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
      const pending =
        aidRequests?.filter((a: AidRequestRecord) => a.status === 'pending').length ?? 0;
      const underReview =
        aidRequests?.filter((a: AidRequestRecord) => a.status === 'under_review').length ?? 0;
      const approved =
        aidRequests?.filter((a: AidRequestRecord) => a.status === 'approved').length ?? 0;
      const rejected =
        aidRequests?.filter((a: AidRequestRecord) => a.status === 'rejected').length ?? 0;
      const completed =
        aidRequests?.filter((a: AidRequestRecord) => a.status === 'completed').length ?? 0;

      const totalRequestedAmount =
        aidRequests?.reduce(
          (sum: number, a: AidRequestRecord) => sum + (a.requested_amount ?? 0),
          0,
        ) || 0;
      const totalApprovedAmount =
        aidRequests?.reduce(
          (sum: number, a: AidRequestRecord) => sum + (a.approved_amount ?? 0),
          0,
        ) || 0;

      // Group by aid type
      const byAidType: Record<string, number> = {};
      aidRequests?.forEach((a: AidRequestRecord) => {
        const type = a.aid_type ?? 'Genel';
        byAidType[type] = (byAidType[type] ?? 0) + 1;
      });

      // Group by urgency
      const byUrgency: Record<string, number> = {};
      aidRequests?.forEach((a: AidRequestRecord) => {
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
  private calculateMonthlyTrend(donations: DonationRecord[]) {
    const monthlyData: Record<string, { amount: number; count: number }> = {};
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

    donations.forEach((donation: DonationRecord) => {
      if (donation.created_at) {
        const date = new Date(donation.created_at);
        const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
        if (!monthlyData[monthKey]) {
          monthlyData[monthKey] = { amount: 0, count: 0 };
        }
        monthlyData[monthKey].amount += donation.amount ?? 0;
        monthlyData[monthKey].count += 1;
      }
    });

    // Get last 6 months
    const last6Months = [];
    const today = new Date();
    for (let i = 5; i >= 0; i--) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
      const monthName = months[date.getMonth()] || 'Bilinmeyen';
      const data = monthlyData[monthKey] ?? { amount: 0, count: 0 };
      last6Months.push({
        month: monthName,
        amount: data.amount,
        count: data.count,
      });
    }

    return last6Months;
  }

  private calculateTopDonors(donations: DonationRecord[]) {
    const donorData: Record<string, { amount: number; count: number }> = {};

    donations.forEach((donation: DonationRecord) => {
      const donor = donation.donor_name ?? 'Anonim';
      if (!donorData[donor]) {
        donorData[donor] = { amount: 0, count: 0 };
      }
      donorData[donor].amount += donation.amount ?? 0;
      donorData[donor].count += 1;
    });

    return Object.entries(donorData)
      .map(([name, data]) => ({ name, amount: data.amount, count: data.count }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);
  }

  private calculateAverageProcessingDays(aidRequests: AidRequestRecord[]) {
    const processingDays = aidRequests
      .filter((a: AidRequestRecord) => a.status === 'completed' && a.created_at && a.updated_at)
      .map((a: AidRequestRecord) => {
        const created = new Date(a.created_at!);
        const updated = new Date(a.updated_at!);
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
