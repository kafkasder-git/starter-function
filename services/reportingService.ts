/**
 * @fileoverview reportingService Module - Application module
 *
 * @author Dernek Yönetim Sistemi Team
 * @version 1.0.0
 */

import type {
  AnalyticsData,
  CustomReport,
  DateRange,
  DonationAnalytics,
  DonorTypeData,
  FinancialData,
  ImpactData,
  ReportFilters,
  ReportResponse,
  FilterConfig,
} from '../types/reporting';
import { supabase } from '../lib/supabase';
import { logger } from '../lib/logging/logger';

// Raw data interfaces for type safety
interface FinancialRawData {
  donations: { amount: number }[];
  expenses: { amount: number; category?: string }[];
}

interface DonationRawData {
  donations: DonationRawItem[];
}

interface DonationRawItem {
  amount: number;
  donor_type?: string;
  created_at?: string;
  is_recurring?: boolean;
  campaign_id?: number;
  donor_email?: string;
  donor_name?: string;
}

interface ImpactRawData {
  beneficiaries: ImpactRawBeneficiary[];
}

interface ImpactRawBeneficiary {
  category?: string;
  city?: string;
  gender?: string;
  household_size?: number;
  created_at?: string;
  updated_at?: string;
}

/**
 * ReportingService Service
 *
 * Service class for handling reportingservice operations
 *
 * @class ReportingService
 */
export class ReportingService {
  private readonly cache = new Map<
    string,
    { data: unknown; timestamp: number; ttl: number; key: string }
  >();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes
  private readonly MAX_CACHE_SIZE = 100; // Maximum number of cached items

  /**
   * Generate a custom report based on the provided configuration.
   * @param reportConfig - The configuration for the custom report
   * @returns A promise that resolves to the generated report response
   */
  async generateReport(reportConfig: CustomReport): Promise<ReportResponse<AnalyticsData>> {
    const startTime = Date.now();
    const cacheKey = this.getCacheKey('generateReport', reportConfig);

    try {
      const cached = this.getFromCache<ReportResponse<AnalyticsData>>(cacheKey);
      if (cached) {
        return cached;
      }

      const rawData = await this.fetchReportData(reportConfig);
      const processedData = await this.processReportData(rawData, reportConfig);

      const result: ReportResponse<AnalyticsData> = {
        data: processedData,
        metadata: {
          total_records: 0,
          page: 1,
          page_size: 0,
          execution_time: Date.now() - startTime,
          generated_at: new Date(),
        },
      };

      this.setCache(cacheKey, result);
      return result;
    } catch (error) {
      logger.error('Report generation failed:', error);
      throw new Error(
        `Report generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  /**
   * Generate financial report
   * @param dateRange - Date range for the report
   * @param filters - Optional filters
   * @returns Financial report data
   */
  async generateFinancialReport(
    dateRange: DateRange,
    _filters?: ReportFilters,
  ): Promise<FinancialData> {
    const startDate = dateRange.start.toISOString();
    const endDate = dateRange.end.toISOString();

    try {
      const { data: donationsData, error: donationsError } = await supabase
        .from('donations')
        .select('amount, created_at, status')
        .gte('created_at', startDate)
        .lte('created_at', endDate);

      if (donationsError) throw donationsError;

      const { data: expensesData, error: expensesError } = await supabase
        .from('expenses')
        .select('amount, created_at, category')
        .gte('created_at', startDate)
        .lte('created_at', endDate);

      if (expensesError) throw expensesError;

      const totalDonations = donationsData?.reduce((sum: number, d: any) => sum + d.amount, 0) ?? 0;
      const totalExpenses = expensesData?.reduce((sum: number, e: any) => sum + e.amount, 0) ?? 0;

      return {
        income: {
          donations: totalDonations,
          membership_fees: 0,
          grants: 0,
          other: 0,
          total: totalDonations,
        },
        expenses: {
          aid_payments: totalExpenses,
          operational: 0,
          staff: 0,
          marketing: 0,
          other: 0,
          total: totalExpenses,
        },
        budget: {
          planned_income: 0,
          actual_income: totalDonations,
          planned_expenses: 0,
          actual_expenses: totalExpenses,
          variance: totalDonations - totalExpenses,
          variance_percent:
            totalDonations > 0 ? ((totalDonations - totalExpenses) / totalDonations) * 100 : 0,
        },
        cashFlow: {
          opening_balance: 0,
          cash_inflow: totalDonations,
          cash_outflow: totalExpenses,
          closing_balance: totalDonations - totalExpenses,
          monthly_trend: [],
        },
      };
    } catch (error) {
      logger.error('Financial report generation failed:', error);
      throw new Error('Financial report generation failed');
    }
  }

  /**
   * Generate donation analytics
   * @param dateRange - Date range for the report
   * @param filters - Optional filters
   * @returns Donation analytics data
   */
  async generateDonationAnalytics(
    dateRange: DateRange,
    _filters?: ReportFilters,
  ): Promise<DonationAnalytics> {
    const startDate = dateRange.start.toISOString();
    const endDate = dateRange.end.toISOString();

    try {
      const { data: donationsData, error } = await supabase
        .from('donations')
        .select('amount, created_at, donor_type, is_recurring')
        .gte('created_at', startDate)
        .lte('created_at', endDate);

      if (error) throw error;

      const totalAmount =
        donationsData?.reduce((sum: number, d: DonationRawItem) => sum + d.amount, 0) ?? 0;
      const totalCount = donationsData?.length ?? 0;
      const averageAmount = totalCount > 0 ? totalAmount / totalCount : 0;

      // Donor type segmentation -> DonorTypeData[] { type, count, amount, percentage }
      const donorTypeData: DonorTypeData[] = (() => {
        if (!donationsData) return [];
        const grouped = donationsData.reduce(
          (acc: Record<string, { amount: number; count: number }>, d: DonationRawItem) => {
            const raw = (d.donor_type ?? 'individual').toLowerCase();
            const normalized: DonorTypeData['type'] =
              raw === 'corporate'
                ? 'corporate'
                : raw === 'foundation'
                  ? 'foundation'
                  : 'individual';
            const current = acc[normalized] ?? { amount: 0, count: 0 };
            current.amount += d.amount;
            current.count += 1;
            acc[normalized] = current;
            return acc;
          },
          {},
        );
        return (
          Object.entries(grouped) as [DonorTypeData['type'], { amount: number; count: number }][]
        ).map(([type, info]) => ({
          type,
          count: info.count,
          amount: info.amount,
          percentage: totalAmount > 0 ? (info.amount / totalAmount) * 100 : 0,
        }));
      })();

      return {
        trends: {
          monthly_donations: this.aggregateMonthlyData(donationsData ?? []),
          yearly_comparison: this.calculateYearlyComparison(donationsData ?? []),
          seasonal_patterns: this.analyzeSeasonalPatterns(donationsData ?? []),
        },
        segmentation: {
          by_donor_type: donorTypeData,
          by_amount_range: this.segmentByAmountRange(donationsData ?? []),
          by_frequency: this.segmentByFrequency(donationsData ?? []),
          by_campaign: this.segmentByCampaign(donationsData ?? []),
        },
        predictions: {
          next_month_forecast: this.calculateNextMonthForecast(donationsData ?? []),
          quarterly_forecast: this.calculateQuarterlyForecast(donationsData ?? []),
          confidence_interval: this.calculateConfidenceInterval(donationsData ?? []),
          trend_direction: (() => {
            const dir = this.analyzeTrendDirection(donationsData ?? []);
            if (dir === 'increasing') return 'up';
            if (dir === 'decreasing') return 'down';
            return dir as 'up' | 'down' | 'stable';
          })(),
        },
        performance: {
          total_donations: totalAmount,
          unique_donors: totalCount,
          average_donation: averageAmount,
          retention_rate: this.calculateRetentionRate(donationsData ?? []),
          growth_rate: this.calculateGrowthRate(donationsData ?? []),
        },
      };
    } catch (error) {
      logger.error('Donation analytics generation failed:', error);
      throw new Error('Donation analytics generation failed');
    }
  }

  /**
   * Generate impact report
   * @param dateRange - Date range for the report
   * @param filters - Optional filters
   * @returns Impact report data
   */
  async generateImpactReport(dateRange: DateRange, _filters?: ReportFilters): Promise<ImpactData> {
    const startDate = dateRange.start.toISOString();
    const endDate = dateRange.end.toISOString();

    try {
      const { data: beneficiariesData, error } = await supabase
        .from('beneficiaries')
        .select('category, city, gender, household_size, created_at, updated_at')
        .gte('created_at', startDate)
        .lte('created_at', endDate);

      if (error) throw error;

      const totalBeneficiaries = beneficiariesData?.length ?? 0;

      // Group by city
      const cities: Record<string, number> = {};
      beneficiariesData?.forEach((beneficiary: any) => {
        const city = beneficiary.city ?? 'Unknown';
        cities[city] = (cities[city] ?? 0) + 1;
      });

      return {
        beneficiaries: {
          total_served: totalBeneficiaries,
          by_category: [],
          by_location: Object.entries(cities).map(([city, count]) => ({
            city,
            count,
            percentage: totalBeneficiaries > 0 ? (count / totalBeneficiaries) * 100 : 0,
          })),
          by_age_group: this.processAgeGroupData(beneficiariesData ?? []),
          by_gender: this.processGenderData(beneficiariesData ?? []),
        },
        services: {
          education_support: 0,
          healthcare_assistance: 0,
          food_aid: 0,
          emergency_relief: 0,
          skill_development: 0,
        },
        outcomes: {
          lives_improved: totalBeneficiaries,
          families_supported: 0,
          communities_reached: 0,
          success_stories: [],
        },

        geographic: {
          cities_covered: 0,
          districts_reached: 0,
          coverage_map: [],
        },
      };
    } catch (error) {
      logger.error('Impact report generation failed:', error);
      throw new Error('Impact report generation failed');
    }
  }

  /**
   * Export report in specified format
   * @param reportConfig - Report configuration
   * @param format - Export format
   * @param filename - Optional filename
   * @returns Export result
   */
  async exportReport(
    reportConfig: CustomReport,
    format: 'csv' | 'excel' | 'pdf' = 'csv',
    filename?: string,
  ): Promise<{ success: boolean; url?: string; error?: string }> {
    try {
      await this.generateReport(reportConfig);

      // This would implement actual export logic
      const exportFilename = filename ?? `report_${Date.now()}.${format}`;

      return {
        success: true,
        url: `/exports/${exportFilename}`,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Export failed',
      };
    }
  }

  // Private helper methods
  private async fetchReportData(reportConfig: CustomReport): Promise<unknown> {
    const dataSource = reportConfig.config.dataSources?.[0]?.source ?? 'default';
    const dateRange = this.extractDateRange(reportConfig.config.filters);
    const defaultDateRange: DateRange = { start: new Date(0), end: new Date() };

    switch (dataSource) {
      case 'financial':
        return await this.fetchFinancialData(dateRange ?? defaultDateRange);
      case 'donations':
        return await this.fetchDonationData(dateRange ?? defaultDateRange);
      case 'beneficiaries':
        return await this.fetchImpactData(dateRange ?? defaultDateRange);
      case 'members':
        return await this.fetchMemberData(dateRange ?? defaultDateRange);
      case 'campaigns':
        return await this.fetchCampaignData(dateRange ?? defaultDateRange);
      default:
        return await this.fetchFinancialData(dateRange ?? defaultDateRange);
    }
  }

  private extractDateRange(filters: FilterConfig[] | undefined): DateRange | undefined {
    if (!filters) return undefined;
    const dateFilter = filters?.find((filter) => filter.field === 'date_range');
    if (dateFilter?.defaultValue) {
      const { start, end } = dateFilter.defaultValue as { start: string; end: string };
      return { start: new Date(start), end: new Date(end) };
    }
    return undefined;
  }

  private async fetchFinancialData(dateRange: DateRange): Promise<FinancialRawData> {
    const startDate = dateRange.start.toISOString();
    const endDate = dateRange.end.toISOString();

    const { data: donationsData } = await supabase
      .from('donations')
      .select('amount')
      .gte('created_at', startDate)
      .lte('created_at', endDate);

    const { data: expensesData } = await supabase
      .from('expenses')
      .select('amount, category')
      .gte('created_at', startDate)
      .lte('created_at', endDate);

    return {
      donations: donationsData ?? [],
      expenses: expensesData ?? [],
    };
  }

  private async fetchDonationData(dateRange: DateRange): Promise<DonationRawData> {
    const startDate = dateRange.start.toISOString();
    const endDate = dateRange.end.toISOString();

    const { data: donationsData } = await supabase
      .from('donations')
      .select('amount, donor_type, created_at, is_recurring, campaign_id, donor_email, donor_name')
      .gte('created_at', startDate)
      .lte('created_at', endDate);

    return {
      donations: donationsData ?? [],
    };
  }

  private async fetchImpactData(dateRange: DateRange): Promise<ImpactRawData> {
    const startDate = dateRange.start.toISOString();
    const endDate = dateRange.end.toISOString();

    const { data: beneficiariesData } = await supabase
      .from('beneficiaries')
      .select('category, city, gender, household_size, created_at, updated_at')
      .gte('created_at', startDate)
      .lte('created_at', endDate);

    return {
      beneficiaries: beneficiariesData ?? [],
    };
  }

  private async processReportData(
    _rawData: unknown,
    _reportConfig: CustomReport,
  ): Promise<AnalyticsData> {
    // This would implement the actual data processing logic
    return {
      metrics: [],
      timeSeries: [],
      categories: [],
      comparisons: {
        current: 0,
        previous: 0,
        change: 0,
        changePercent: 0,
      },
    };
  }

  // Cache management
  private getCacheKey(operation: string, params: unknown): string {
    return `${operation}_${JSON.stringify(params)}`;
  }

  private getFromCache<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (!cached) return null;

    if (Date.now() - cached.timestamp > cached.ttl) {
      this.cache.delete(key);
      return null;
    }

    return cached.data as T;
  }

  private setCache(key: string, data: unknown): void {
    if (this.cache.size >= this.MAX_CACHE_SIZE) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
      }
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: this.CACHE_TTL,
      key,
    });
  }

  // Data processing methods
  private aggregateMonthlyData(donations: DonationRawItem[]) {
    // MonthlyData[] -> { month: string; income: number; expenses: number; net: number }
    const monthlyTotals = new Map<string, number>();
    donations.forEach((donation) => {
      if (!donation.created_at) return;
      const date = new Date(donation.created_at);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthlyTotals.set(monthKey, (monthlyTotals.get(monthKey) ?? 0) + donation.amount);
    });
    return Array.from(monthlyTotals.entries()).map(([month, income]) => ({
      month,
      income,
      expenses: 0, // No expense data in this context
      net: income, // net == income - expenses (0)
    }));
  }

  private calculateYearlyComparison(donations: DonationRawItem[]) {
    // YearlyData[] -> { year: number; amount: number; count: number; growth: number }
    const yearly = new Map<number, { amount: number; count: number }>();
    donations.forEach((d) => {
      if (!d.created_at) return;
      const year = new Date(d.created_at).getFullYear();
      const current = yearly.get(year) ?? { amount: 0, count: 0 };
      current.amount += d.amount;
      current.count += 1;
      yearly.set(year, current);
    });
    const years = Array.from(yearly.entries()).sort((a, b) => a[0] - b[0]);
    return years.map(([year, info], idx) => {
      const prevEntry = idx > 0 ? years[idx - 1] : null;
      const prev = prevEntry ? prevEntry[1].amount : 0;
      const growth = prev > 0 ? ((info.amount - prev) / prev) * 100 : 0;
      return { year, amount: info.amount, count: info.count, growth };
    });
  }

  private analyzeSeasonalPatterns(donations: DonationRawItem[]) {
    // SeasonalData[] -> { season: 'spring' | 'summer' | 'autumn' | 'winter'; amount: number; count: number; average: number }
    const seasonal = new Map<string, { amount: number; count: number }>();
    donations.forEach((d) => {
      if (!d.created_at) return;
      const date = new Date(d.created_at);
      const season = this.getSeason(date.getMonth()); // returns capitalized currently
      const key = season.toLowerCase();
      const current = seasonal.get(key) ?? { amount: 0, count: 0 };
      current.amount += d.amount;
      current.count += 1;
      seasonal.set(key, current);
    });
    return Array.from(seasonal.entries()).map(([season, info]) => ({
      season: season as 'spring' | 'summer' | 'autumn' | 'winter',
      amount: info.amount,
      count: info.count,
      average: info.count > 0 ? info.amount / info.count : 0,
    }));
  }

  private getSeason(month: number): string {
    if (month >= 2 && month <= 4) return 'Spring';
    if (month >= 5 && month <= 7) return 'Summer';
    if (month >= 8 && month <= 10) return 'Autumn';
    return 'Winter';
  }

  private segmentByAmountRange(donations: DonationRawItem[]) {
    // AmountRangeData[] -> { range: string; count: number; amount: number; percentage: number }
    const ranges: { min: number; max: number; label: string }[] = [
      { min: 0, max: 100, label: '0-100 TL' },
      { min: 100, max: 500, label: '100-500 TL' },
      { min: 500, max: 1000, label: '500-1000 TL' },
      { min: 1000, max: 5000, label: '1000-5000 TL' },
      { min: 5000, max: Number.POSITIVE_INFINITY, label: '5000+ TL' },
    ];

    const totalAmount = donations.reduce((sum, d) => sum + d.amount, 0) || 0;

    return ranges.map(({ min, max, label }) => {
      const inRange = donations.filter((d) => d.amount >= min && d.amount < max);
      const amount = inRange.reduce((sum, d) => sum + d.amount, 0);
      return {
        range: label,
        count: inRange.length,
        amount,
        percentage: totalAmount > 0 ? (amount / totalAmount) * 100 : 0,
      };
    });
  }

  private segmentByFrequency(donations: DonationRawItem[]) {
    // FrequencyData[] -> { frequency: 'one-time' | 'monthly' | 'quarterly' | 'yearly'; count; amount; percentage }
    const totalAmount = donations.reduce((s, d) => s + d.amount, 0) || 0;
    const oneTimeDonations = donations.filter((d) => !d.is_recurring);
    const recurringDonations = donations.filter((d) => d.is_recurring);

    const oneTimeAmount = oneTimeDonations.reduce((s, d) => s + d.amount, 0);
    const recurringAmount = recurringDonations.reduce((s, d) => s + d.amount, 0);

    // For now classify recurring as monthly (common pattern). Other frequencies could be inferred later.
    return [
      {
        frequency: 'one-time' as const,
        count: oneTimeDonations.length,
        amount: oneTimeAmount,
        percentage: totalAmount > 0 ? (oneTimeAmount / totalAmount) * 100 : 0,
      },
      {
        frequency: 'monthly' as const,
        count: recurringDonations.length,
        amount: recurringAmount,
        percentage: totalAmount > 0 ? (recurringAmount / totalAmount) * 100 : 0,
      },
    ];
  }

  private segmentByCampaign(donations: DonationRawItem[]) {
    // CampaignData[] -> { campaign_id, campaign_name, target_amount, raised_amount, donor_count, success_rate }
    const campaignMap = new Map<string, { raisedAmount: number; donorCount: number }>();

    donations.forEach((donation) => {
      const id = donation.campaign_id ? donation.campaign_id.toString() : 'no-campaign';
      const existing = campaignMap.get(id) ?? { raisedAmount: 0, donorCount: 0 };
      existing.raisedAmount += donation.amount;
      existing.donorCount += 1;
      campaignMap.set(id, existing);
    });

    return Array.from(campaignMap.entries()).map(([id, info]) => {
      const targetAmount = 10000; // Placeholder target assumption
      return {
        campaign_id: id,
        campaign_name: id === 'no-campaign' ? 'General Fund' : `Campaign ${id}`,
        target_amount: targetAmount,
        raised_amount: info.raisedAmount,
        donor_count: info.donorCount,
        success_rate: targetAmount > 0 ? (info.raisedAmount / targetAmount) * 100 : 0,
      };
    });
  }

  private calculateNextMonthForecast(donations: DonationRawItem[]): number {
    const lastThreeMonths = this.getLastThreeMonthsData(donations);
    const average =
      lastThreeMonths.reduce((sum, amount) => sum + amount, 0) / lastThreeMonths.length;
    return Math.round(average);
  }

  private calculateQuarterlyForecast(donations: DonationRawItem[]): number {
    const lastQuarter = this.getLastQuarterData(donations);
    return Math.round(lastQuarter.reduce((sum, amount) => sum + amount, 0));
  }

  private calculateConfidenceInterval(donations: DonationRawItem[]): number {
    const amounts = donations.map((d) => d.amount);
    const mean = amounts.reduce((sum, amount) => sum + amount, 0) / amounts.length;
    const variance =
      amounts.reduce((sum, amount) => sum + Math.pow(amount - mean, 2), 0) / amounts.length;
    return Math.round(Math.sqrt(variance) * 1.96); // 95% confidence interval
  }

  private analyzeTrendDirection(
    donations: DonationRawItem[],
  ): 'increasing' | 'decreasing' | 'stable' {
    const lastThreeMonths = this.getLastThreeMonthsData(donations);
    if (lastThreeMonths.length < 2) return 'stable';

    const lastValue = lastThreeMonths[lastThreeMonths.length - 1];
    const firstValue = lastThreeMonths[0];
    if (lastValue === undefined || firstValue === undefined) return 'stable';

    const trend = lastValue - firstValue;
    if (trend > 0.1) return 'increasing';
    if (trend < -0.1) return 'decreasing';
    return 'stable';
  }

  private calculateRetentionRate(donations: DonationRawItem[]): number {
    const uniqueDonors = new Set(donations.map((d) => d.donor_email).filter(Boolean));
    const recurringDonors = donations.filter((d) => d.is_recurring).length;
    return uniqueDonors.size > 0 ? (recurringDonors / uniqueDonors.size) * 100 : 0;
  }

  private calculateGrowthRate(donations: DonationRawItem[]): number {
    const currentMonth = this.getCurrentMonthData(donations);
    const previousMonth = this.getPreviousMonthData(donations);

    if (previousMonth.length === 0) return 0;

    const currentTotal = currentMonth.reduce((sum, d) => sum + d.amount, 0);
    const previousTotal = previousMonth.reduce((sum, d) => sum + d.amount, 0);

    return previousTotal > 0 ? ((currentTotal - previousTotal) / previousTotal) * 100 : 0;
  }

  private processAgeGroupData(beneficiaries: ImpactRawBeneficiary[]) {
    const ageGroups = new Map<string, number>();
    const totalCount = beneficiaries.length;

    beneficiaries.forEach((_beneficiary) => {
      const ageGroup = 'Unknown'; // Placeholder - would need actual age calculation
      ageGroups.set(ageGroup, (ageGroups.get(ageGroup) ?? 0) + 1);
    });

    return Array.from(ageGroups.entries()).map(([age_group, count]) => ({
      age_group,
      count,
      percentage: totalCount > 0 ? (count / totalCount) * 100 : 0,
    }));
  }

  private processGenderData(beneficiaries: ImpactRawBeneficiary[]) {
    const genderCounts = new Map<string, number>();
    const totalCount = beneficiaries.length;

    beneficiaries.forEach((_beneficiary) => {
      const gender = 'other'; // Placeholder - would need actual gender field
      genderCounts.set(gender, (genderCounts.get(gender) ?? 0) + 1);
    });

    return Array.from(genderCounts.entries()).map(([genderKey, count]) => ({
      gender: genderKey as 'male' | 'female' | 'other',
      count,
      percentage: totalCount > 0 ? (count / totalCount) * 100 : 0,
    }));
  }

  private getLastThreeMonthsData(donations: DonationRawItem[]): number[] {
    const now = new Date();
    const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, 1);

    return donations
      .filter((d) => d.created_at && new Date(d.created_at) >= threeMonthsAgo)
      .map((d) => d.amount);
  }

  private getLastQuarterData(donations: DonationRawItem[]): number[] {
    const now = new Date();
    const quarterStart = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);

    return donations
      .filter((d) => d.created_at && new Date(d.created_at) >= quarterStart)
      .map((d) => d.amount);
  }

  private getCurrentMonthData(donations: DonationRawItem[]): DonationRawItem[] {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    return donations.filter((d) => d.created_at && new Date(d.created_at) >= monthStart);
  }

  private getPreviousMonthData(donations: DonationRawItem[]): DonationRawItem[] {
    const now = new Date();
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    return donations.filter((d) => {
      if (!d.created_at) return false;
      const date = new Date(d.created_at);
      return date >= lastMonthStart && date <= lastMonthEnd;
    });
  }

  private async fetchMemberData(dateRange: DateRange): Promise<unknown> {
    // Placeholder for member data fetching
    const startDate = dateRange.start.toISOString();
    const endDate = dateRange.end.toISOString();

    try {
      const { data, error } = await supabase
        .from('members')
        .select('*')
        .gte('created_at', startDate)
        .lte('created_at', endDate);

      if (error) throw error;
      return data;
    } catch (error) {
      throw new Error(
        `Member data fetch failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  private async fetchCampaignData(dateRange: DateRange): Promise<unknown> {
    // Placeholder for campaign data fetching
    const startDate = dateRange.start.toISOString();
    const endDate = dateRange.end.toISOString();

    try {
      const { data, error } = await supabase
        .from('campaigns')
        .select('*')
        .gte('created_at', startDate)
        .lte('created_at', endDate);

      if (error) throw error;
      return data;
    } catch (error) {
      throw new Error(
        `Campaign data fetch failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }
}

// Create instance
// const reportingService = new ReportingService();

// Export functions
export const generateReport = (reportConfig: CustomReport) =>
  reportingService.generateReport(reportConfig);

export const generateFinancialReport = (dateRange: DateRange, filters?: ReportFilters) =>
  reportingService.generateFinancialReport(dateRange, filters);

export const generateDonationAnalytics = (dateRange: DateRange, filters?: ReportFilters) =>
  reportingService.generateDonationAnalytics(dateRange, filters);

export const generateImpactReport = (dateRange: DateRange, filters?: ReportFilters) =>
  reportingService.generateImpactReport(dateRange, filters);

export const exportReport = (
  reportConfig: CustomReport,
  format?: 'csv' | 'excel' | 'pdf',
  filename?: string,
) => reportingService.exportReport(reportConfig, format, filename);

export default ReportingService;
export const reportingService = new ReportingService();
