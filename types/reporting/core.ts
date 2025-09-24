// Core reporting types
export interface DateRange {
  start: Date;
  end: Date;
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
  customFilters?: Record<string, any>;
}

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

export interface ReportingError {
  code: string;
  message: string;
  type: 'data' | 'processing' | 'export' | 'schedule' | 'permission';
  severity: 'low' | 'medium' | 'high' | 'critical';
  context?: Record<string, any>;
}
