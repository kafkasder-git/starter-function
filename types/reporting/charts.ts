// Chart and visualization types
export type ChartType =
  | 'bar'
  | 'line'
  | 'pie'
  | 'doughnut'
  | 'area'
  | 'scatter'
  | 'heatmap'
  | 'treemap';

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
