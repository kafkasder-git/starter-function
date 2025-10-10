// Gelişmiş Raporlama Sistemi - TypeScript Tip Tanımları

export interface DateRange {
  start: Date;
  end: Date;
}

export interface ReportConfig {
  format: 'pdf' | 'excel' | 'csv' | 'json';
  filters?: any;
  columns?: string[];
  title?: string;
  dateRange?: DateRange;
}

export interface ReportData {
  data: any[];
  metadata: any;
  totalRecords?: number;
  generatedAt?: Date;
}

export interface ChartData {
  labels: string[];
  datasets: any[];
  options?: any;
}

// Validation constraints
export interface DateRangeConstraints {
  maxDays?: number;
  minDate?: Date;
  maxDate?: Date;
}

export interface NumericConstraints {
  min?: number;
  max?: number;
  step?: number;
  precision?: number;
}

export interface ReportFilters {
  dateRange?: DateRange;
  categories?: string[];
  status?: string[];
  amountRange?: {
    min: number;
    max: number;
  };
  searchTerm?: string;
  customFilters?: Record<string, string | number | boolean | Date>;
}

/**
 * Represents a custom report configuration
 * @interface CustomReport
 */
export interface CustomReport {
  /** Unique identifier for the report */
  id: string;
  /** Human-readable name for the report */
  name: string;
  /** Optional description of what the report contains */
  description?: string;
  /** Type of report being generated */
  type: ReportType;

  config: {
    dataSources: DataSourceConfig[];
    fields: FieldConfig[];
    filters: FilterConfig[];
    groupBy: string[];
    sortBy: SortConfig[];
    chartType: ChartType;
    layout: LayoutConfig;
    metrics?: string[]; // Moved here from root level
  };

  schedule?: {
    enabled: boolean;
    frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly';
    time: string;
    recipients: string[];
    format: ExportFormat;
  };

  metadata: {
    created_by: string;
    created_at: Date;
    updated_by: string;
    updated_at: Date;
    last_run?: Date;
    run_count: number;
  };
}

export interface DataSourceConfig {
  source: 'beneficiaries' | 'donations' | 'members' | 'financial' | 'campaigns';
  table: string;
  joins?: JoinConfig[];
  conditions?: ConditionConfig[];
}

export interface JoinConfig {
  table: string;
  type: 'inner' | 'left' | 'right' | 'full';
  on: string;
}

export interface ConditionConfig {
  field: string;
  operator: '=' | '!=' | '>' | '<' | '>=' | '<=' | 'like' | 'in' | 'between';
  value: any;
}

export interface FieldConfig {
  name: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'currency' | 'percentage' | 'boolean';
  format?: string;
  aggregation?: 'sum' | 'avg' | 'count' | 'min' | 'max';
  visible: boolean;
}

export interface FilterConfig {
  field: string;
  type: 'text' | 'number' | 'date' | 'select' | 'multiselect' | 'range';
  label: string;
  options?: { value: any; label: string }[];
  defaultValue?: any;
}

export interface SortConfig {
  field: string;
  direction: 'asc' | 'desc';
}

export interface LayoutConfig {
  columns: number;
  rows: number;
  widgets: WidgetConfig[];
}

export interface WidgetConfig {
  id: string;
  type: 'chart' | 'table' | 'metric' | 'text';
  position: { x: number; y: number; w: number; h: number };
  config: WidgetSpecificConfig;
}

export interface WidgetSpecificConfig {
  chart?: ChartConfig;
  table?: {
    columns: string[];
    sortable?: boolean;
    filterable?: boolean;
  };
  metric?: {
    title: string;
    format: 'number' | 'currency' | 'percentage';
    showTrend?: boolean;
  };
  text?: {
    content: string;
    fontSize?: number;
    alignment?: 'left' | 'center' | 'right';
  };
}

export enum ChartType {
  BAR = 'bar',
  LINE = 'line',
  PIE = 'pie',
  DOUGHNUT = 'doughnut',
  AREA = 'area',
  SCATTER = 'scatter',
  HEATMAP = 'heatmap',
  TREEMAP = 'treemap',
}

export enum ReportType {
  FINANCIAL = 'financial',
  DONATION = 'donation',
  MEMBER = 'member',
  IMPACT = 'impact',
  CUSTOM = 'custom',
}

export enum ReportStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export enum ExportFormat {
  PDF = 'pdf',
  EXCEL = 'excel',
  CSV = 'csv',
  PNG = 'png',
  SVG = 'svg',
}

export interface ChartConfig {
  type: ChartType;
  xAxis: string;
  yAxis: string | string[];
  groupBy?: string;
  colors?: string[];
  options: ChartOptions;
}

export interface ChartOptions {
  title?: string;
  subtitle?: string;
  legend?: boolean;
  grid?: boolean;
  responsive?: boolean;
  animation?: boolean;
  tooltip?: boolean;
  zoom?: boolean;
  export?: boolean;
}

// Analitik veri modelleri
export interface AnalyticsData {
  metrics: MetricData[];
  timeSeries: TimeSeriesData[];
  categories: CategoryData[];
  comparisons: ComparisonData;
}

export interface MetricData {
  key: string;
  value: number | string;
  change?: number;
  trend?: 'up' | 'down' | 'stable';
  format?: 'number' | 'currency' | 'percentage';
  icon?: string;
  color?: string;
}

export interface TimeSeriesData {
  date: string;
  values: Record<string, number>;
}

export interface CategoryData {
  name: string;
  value: number;
  percentage: number;
  color?: string;
}

export interface ComparisonData {
  current: number;
  previous: number;
  change: number;
  changePercent: number;
}

// Mali raporlama tipleri
export interface FinancialData {
  income: {
    donations: number;
    membership_fees: number;
    grants: number;
    other: number;
    total: number;
  };

  expenses: {
    aid_payments: number;
    operational: number;
    staff: number;
    marketing: number;
    other: number;
    total: number;
  };

  budget: {
    planned_income: number;
    actual_income: number;
    planned_expenses: number;
    actual_expenses: number;
    variance: number;
    variance_percent: number;
  };

  cashFlow: {
    opening_balance: number;
    cash_inflow: number;
    cash_outflow: number;
    closing_balance: number;
    monthly_trend: MonthlyData[];
  };
}

export interface MonthlyData {
  month: string;
  income: number;
  expenses: number;
  net: number;
}

// Bağış analitik tipleri
export interface DonationAnalytics {
  trends: {
    monthly_donations: MonthlyData[];
    yearly_comparison: YearlyData[];
    seasonal_patterns: SeasonalData[];
  };

  segmentation: {
    by_donor_type: DonorTypeData[];
    by_amount_range: AmountRangeData[];
    by_frequency: FrequencyData[];
    by_campaign: CampaignData[];
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
    retention_rate: number;
    growth_rate: number;
  };
}

export interface YearlyData {
  year: number;
  amount: number;
  count: number;
  growth: number;
}

export interface SeasonalData {
  season: 'spring' | 'summer' | 'autumn' | 'winter';
  amount: number;
  count: number;
  average: number;
}

export interface DonorTypeData {
  type: 'individual' | 'corporate' | 'foundation';
  count: number;
  amount: number;
  percentage: number;
}

export interface AmountRangeData {
  range: string;
  count: number;
  amount: number;
  percentage: number;
}

export interface FrequencyData {
  frequency: 'one-time' | 'monthly' | 'quarterly' | 'yearly';
  count: number;
  amount: number;
  percentage: number;
}

export interface CampaignData {
  campaign_id: string;
  campaign_name: string;
  target_amount: number;
  raised_amount: number;
  donor_count: number;
  success_rate: number;
}

// Sosyal etki ölçüm tipleri
export interface ImpactData {
  beneficiaries: {
    total_served: number;
    by_category: CategoryData[];
    by_location: LocationData[];
    by_age_group: AgeGroupData[];
    by_gender: GenderData[];
  };

  services: {
    education_support: number;
    healthcare_assistance: number;
    food_aid: number;
    emergency_relief: number;
    skill_development: number;
  };

  outcomes: {
    lives_improved: number;
    families_supported: number;
    communities_reached: number;
    success_stories: SuccessStory[];
  };

  geographic: {
    cities_covered: number;
    districts_reached: number;
    coverage_map: GeoData[];
  };
}

export interface LocationData {
  city: string;
  district?: string;
  count: number;
  percentage: number;
}

export interface AgeGroupData {
  age_group: string;
  count: number;
  percentage: number;
}

export interface GenderData {
  gender: 'male' | 'female' | 'other';
  count: number;
  percentage: number;
}

export interface SuccessStory {
  id: string;
  title: string;
  description: string;
  beneficiary_name?: string;
  impact_category: string;
  date: Date;
  image_url?: string;
}

export interface GeoData {
  location: string;
  coordinates: [number, number];
  value: number;
  color?: string;
}

// Tahminleme modeli tipleri
export interface PredictionData {
  forecast: {
    date: string;
    predicted_value: number;
    confidence_lower: number;
    confidence_upper: number;
  }[];

  accuracy: {
    mae: number; // Mean Absolute Error
    mape: number; // Mean Absolute Percentage Error
    rmse: number; // Root Mean Square Error
  };

  factors: {
    name: string;
    importance: number;
    impact: 'positive' | 'negative';
  }[];
}

// Export ve paylaşım tipleri
export interface ExportConfig {
  format: 'pdf' | 'excel' | 'csv' | 'png' | 'svg';
  filename?: string;
  includeCharts?: boolean;
  includeData?: boolean;
  template?: string;
  options?: ExportOptions;
}

export interface ExportOptions {
  pageSize?: 'A4' | 'A3' | 'Letter';
  orientation?: 'portrait' | 'landscape';
  margins?: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  compression?: boolean;
  quality?: number;
}

// API yanıt tipleri
export interface ReportResponse<T = any> {
  data: T;
  metadata: {
    total_records: number;
    page: number;
    page_size: number;
    execution_time: number;
    generated_at: Date;
  };
  error?: string;
}

export enum ErrorType {
  DATA_ERROR = 'data',
  DATA_FETCH_ERROR = 'data_fetch',
  PROCESSING_ERROR = 'processing',
  EXPORT_ERROR = 'export',
  SCHEDULE_ERROR = 'schedule',
  PERMISSION_ERROR = 'permission',
  VALIDATION_ERROR = 'validation',
  NETWORK_ERROR = 'network',
}

export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export interface ReportingError {
  code: string;
  message: string;
  type: ErrorType;
  severity: ErrorSeverity;
  context?: Record<string, string | number | boolean>;
  timestamp: Date;
  recoverable: boolean;
  retryable: boolean;
  suggestedAction?: string;
}

// Performans ve cache tipleri
export interface CacheConfig {
  enabled: boolean;
  ttl: number; // Time to live in seconds
  key: string;
  tags?: string[];
}

export interface PerformanceMetrics {
  query_time: number;
  processing_time: number;
  render_time: number;
  total_time: number;
  memory_usage: number;
  cache_hit: boolean;
  data_size: number;
  optimization_applied: string[];
}

export interface CacheStrategy {
  type: 'memory' | 'localStorage' | 'sessionStorage' | 'indexedDB';
  ttl: number;
  maxSize?: number;
  compression?: boolean;
}
