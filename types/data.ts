export interface ExportConfig {
  format: 'csv' | 'excel' | 'pdf' | 'json';
  filename?: string;
  fields?: string[];
  filters?: Record<string, string | number | boolean | Date>;
  dateRange?: {
    start: Date;
    end: Date;
  };
  includeHeaders?: boolean;
  customHeaders?: Record<string, string>;
  template?: string;
  orientation?: 'portrait' | 'landscape';
  pageSize?: 'A4' | 'A3' | 'Letter';
  compression?: boolean;
}

export interface ImportConfig {
  format: 'csv' | 'excel' | 'json';
  file: File;
  mapping?: Record<string, string>;
  skipRows?: number;
  delimiter?: string;
  encoding?: string;
  validateData?: boolean;
  updateExisting?: boolean;
  batchSize?: number;
}

export interface ExportResult {
  success: boolean;
  filename: string;
  downloadUrl?: string;
  size: number;
  recordCount: number;
  message?: string;
  error?: string;
}

export interface ImportResult {
  success: boolean;
  processedCount: number;
  successCount: number;
  errorCount: number;
  errors: ImportError[];
  warnings: ImportWarning[];
  duplicates: number;
  skipped: number;
  message?: string;
}

export interface ImportError {
  row: number;
  field?: string;
  value?: string | number | boolean | null;
  message: string;
  code: string;
  severity: 'error' | 'warning';
}

export interface ImportWarning {
  row: number;
  field?: string;
  message: string;
  code: string;
}

export interface BulkOperation {
  id: string;
  type: 'update' | 'delete' | 'export' | 'import';
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  progress: number;
  totalItems: number;
  processedItems: number;
  successItems: number;
  errorItems: number;
  startTime: Date;
  endTime?: Date;
  errors: BulkError[];
  result?: ExportResult | ImportResult | { affectedRows: number };
}

export interface BulkError {
  itemId: string | number;
  message: string;
  code: string;
  data?: Record<string, unknown>;
}

export interface DataSyncConfig {
  endpoint: string;
  interval: number;
  retryCount: number;
  retryDelay: number;
  batchSize: number;
  priority: 'high' | 'normal' | 'low';
  compression: boolean;
  encryption: boolean;
}

export interface SyncResult {
  success: boolean;
  syncedItems: number;
  conflicts: number;
  errors: SyncError[];
  lastSyncTime: Date;
  nextSyncTime?: Date;
}

export interface SyncError {
  itemId: string | number;
  type: 'network' | 'validation' | 'conflict' | 'permission';
  message: string;
  retryable: boolean;
}

export interface OfflineData {
  id: string;
  type: string;
  data: Record<string, unknown>;
  timestamp: Date;
  synced: boolean;
  action: 'create' | 'update' | 'delete';
  priority: number;
}

export interface ReportConfig {
  title: string;
  description?: string;
  type: 'table' | 'chart' | 'summary' | 'custom';
  template?: string;
  data: Record<string, unknown>[];
  columns?: ReportColumn[];
  charts?: ChartConfig[];
  filters?: Record<string, string | number | boolean | Date>;
  groupBy?: string[];
  sortBy?: { field: string; direction: 'asc' | 'desc' }[];
  calculations?: ReportCalculation[];
  formatting?: ReportFormatting;
  branding?: {
    logo?: string;
    colors?: Record<string, string>;
    fonts?: Record<string, string>;
  };
}

export interface ReportColumn {
  field: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'currency' | 'percentage' | 'boolean';
  format?: string;
  width?: number;
  align?: 'left' | 'center' | 'right';
  visible?: boolean;
  calculation?: 'sum' | 'avg' | 'count' | 'min' | 'max';
}

export interface ChartConfig {
  type: 'bar' | 'line' | 'pie' | 'doughnut' | 'area' | 'scatter';
  title: string;
  data: Record<string, unknown>[];
  xField: string;
  yField: string;
  groupField?: string;
  colors?: string[];
  size?: { width: number; height: number };
}

export interface ReportCalculation {
  field: string;
  type: 'sum' | 'avg' | 'count' | 'min' | 'max' | 'percentage';
  label?: string;
  format?: string;
}

export interface ReportFormatting {
  fontSize: number;
  fontFamily: string;
  lineHeight: number;
  margins: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  headerStyle?: Record<string, string | number>;
  cellStyle?: Record<string, string | number>;
  alternateRowColor?: string;
}

// Predefined export templates
export const EXPORT_TEMPLATES = {
  member: {
    fields: ['name', 'email', 'phone', 'membershipType', 'status', 'joinDate', 'totalDonations'],
    headers: {
      name: 'Ad Soyad',
      email: 'E-posta',
      phone: 'Telefon',
      membershipType: 'Üyelik Türü',
      status: 'Durum',
      joinDate: 'Katılım Tarihi',
      totalDonations: 'Toplam Bağış',
    },
  },
  donation: {
    fields: ['donorName', 'amount', 'type', 'status', 'date', 'paymentMethod', 'campaign'],
    headers: {
      donorName: 'Bağışçı',
      amount: 'Tutar',
      type: 'Bağış Türü',
      status: 'Durum',
      date: 'Tarih',
      paymentMethod: 'Ödeme Yöntemi',
      campaign: 'Kampanya',
    },
  },
  aid: {
    fields: ['applicantName', 'aidType', 'requestedAmount', 'status', 'urgency', 'applicationDate'],
    headers: {
      applicantName: 'Başvuru Sahibi',
      aidType: 'Yardım Türü',
      requestedAmount: 'Talep Tutarı',
      status: 'Durum',
      urgency: 'Aciliyet',
      applicationDate: 'Başvuru Tarihi',
    },
  },
};

// Turkish month names for export formatting
export const TURKISH_MONTHS = [
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

// Export file size limits
export const EXPORT_LIMITS = {
  csv: 50000, // 50K records
  excel: 100000, // 100K records
  pdf: 5000, // 5K records
  json: 25000, // 25K records
};

// Import validation rules
export const IMPORT_VALIDATION_RULES = {
  member: {
    required: ['name', 'email'],
    email: ['email'],
    phone: ['phone'],
    unique: ['email'],
  },
  donation: {
    required: ['donorName', 'amount'],
    number: ['amount'],
    date: ['date'],
  },
  aid: {
    required: ['applicantName', 'aidType'],
    number: ['requestedAmount'],
    date: ['applicationDate'],
  },
};

// Bulk operation types
export const BULK_OPERATIONS = {
  member: {
    update: ['status', 'membershipType', 'tags'],
    delete: ['soft', 'hard'],
    export: ['selected', 'filtered', 'all'],
    import: ['csv', 'excel'],
  },
  donation: {
    update: ['status', 'paymentMethod', 'campaign'],
    delete: ['soft'],
    export: ['selected', 'filtered', 'all'],
    import: ['csv', 'excel'],
  },
  aid: {
    update: ['status', 'urgency', 'assignedTo'],
    delete: ['soft'],
    export: ['selected', 'filtered', 'all'],
    import: ['csv', 'excel'],
  },
};

// Data formatting utilities
export const DATA_FORMATTERS = {
  currency: (value: number, currency = 'TRY') => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency,
    }).format(value);
  },

  date: (value: Date | string, format: 'short' | 'medium' | 'long' | 'full' = 'short') => {
    const date = typeof value === 'string' ? new Date(value) : value;
    return new Intl.DateTimeFormat('tr-TR', {
      dateStyle: format,
    }).format(date);
  },

  number: (value: number, decimals = 0) => {
    return new Intl.NumberFormat('tr-TR', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(value);
  },

  percentage: (value: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'percent',
      minimumFractionDigits: 1,
    }).format(value / 100);
  },

  boolean: (value: boolean) => {
    return value ? 'Evet' : 'Hayır';
  },
};
