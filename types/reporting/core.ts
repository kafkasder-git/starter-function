// Core reporting types
export interface CustomReport {
  id: string;
  name: string;
  description?: string;
  type: 'financial' | 'donation' | 'impact' | 'custom';
  filters: ReportFilters;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReportFilters {
  dateRange?: {
    start: Date;
    end: Date;
  };
  categories?: string[];
  status?: string[];
  [key: string]: any;
}

export interface AnalyticsData {
  summary: {
    totalRecords: number;
    dateRange: {
      start: Date;
      end: Date;
    };
    lastUpdated: string;
  };
  metrics: Array<{
    name: string;
    value: number;
    change?: number;
    trend?: 'up' | 'down' | 'stable';
  }>;
  trends: Array<{
    period: string;
    value: number;
    change?: number;
  }>;
  insights: Array<{
    type: 'info' | 'warning' | 'error';
    message: string;
    data?: any;
  }>;
}

export interface FinancialData {
  totalDonations: number;
  totalExpenses: number;
  netIncome: number;
  donationsCount: number;
  expensesCount: number;
}

export interface DonationAnalytics {
  totalAmount: number;
  totalCount: number;
  averageAmount: number;
  recurringCount: number;
  donorTypes: Array<{
    type: string;
    count: number;
    total: number;
    average: number;
  }>;
  trends: {
    monthly_donations: TimeSeriesData[];
    yearly_comparison: TimeSeriesData[];
    seasonal_patterns: TimeSeriesData[];
    amount_ranges: Array<{
      range: string;
      count: number;
      total: number;
    }>;
    frequency_analysis: Array<{
      frequency: string;
      count: number;
      total: number;
    }>;
    campaign_performance: Array<{
      campaign: string;
      count: number;
      total: number;
    }>;
    trend_direction: 'up' | 'down' | 'stable';
  };
  predictions: {
    next_month_forecast: number;
    quarterly_forecast: number;
    confidence_interval: number;
    trend_direction: 'up' | 'down' | 'stable';
  };
  performance: {
    total_donations: number;
    unique_donors: number;
    average_donation: number;
    recurring_percentage: number;
  };
}

export interface ImpactData {
  totalBeneficiaries: number;
  categories: {
    by_age_group: Array<{
      ageGroup: string;
      count: number;
      percentage: number;
    }>;
    by_gender: Array<{
      gender: string;
      count: number;
      percentage: number;
    }>;
  };
  services: {
    education_support: number;
    healthcare_assistance: number;
    food_aid: number;
    financialSupport: number;
  };
  impact_metrics: {
    families_helped: number;
    children_supported: number;
    elderly_cared_for: number;
    emergency_cases: number;
  };
}

export interface TimeSeriesData {
  date: string;
  value: number;
  values?: number[];
}
