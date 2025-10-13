// Chart-specific types for reporting
export interface ChartData {
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string | string[];
    borderWidth?: number;
  }>;
}

export interface PieChartData {
  name: string;
  value: number;
  color?: string;
  percentage?: number;
}

export interface LineChartData {
  x: string | number;
  y: number;
  label?: string;
}

export interface BarChartData {
  category: string;
  value: number;
  color?: string;
}

export interface ChartConfig {
  type: 'line' | 'bar' | 'pie' | 'doughnut' | 'area';
  title?: string;
  subtitle?: string;
  xAxisLabel?: string;
  yAxisLabel?: string;
  showLegend?: boolean;
  showGrid?: boolean;
  responsive?: boolean;
  maintainAspectRatio?: boolean;
}

export interface ChartOptions {
  responsive: boolean;
  plugins: {
    legend?: {
      display?: boolean;
      position?: 'top' | 'bottom' | 'left' | 'right';
    };
    title?: {
      display?: boolean;
      text?: string;
    };
  };
  scales?: {
    x?: {
      display?: boolean;
      title?: {
        display?: boolean;
        text?: string;
      };
    };
    y?: {
      display?: boolean;
      title?: {
        display?: boolean;
        text?: string;
      };
    };
  };
}
