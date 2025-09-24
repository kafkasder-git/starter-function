// 🏦 KUMBARA SYSTEM TYPES
// Comprehensive TypeScript types for Piggy Bank management system

export interface Kumbara {
  id: string;
  code: string;
  name: string;
  location: string;
  address: string;
  status: KumbaraStatus;
  installDate: string;
  lastCollection: string | null;
  totalAmount: number;
  monthlyAverage: number;
  qrCode: string;
  contactPerson?: string;
  phone?: string;
  notes?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by?: string;
  deleted_at?: string;
}

export interface KumbaraInsert {
  id?: string;
  code?: string; // Auto-generated if not provided
  name: string;
  location: string;
  address: string;
  status?: KumbaraStatus;
  installDate?: string;
  contactPerson?: string;
  phone?: string;
  notes?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  created_by: string;
}

export interface KumbaraUpdate {
  name?: string;
  location?: string;
  address?: string;
  status?: KumbaraStatus;
  contactPerson?: string;
  phone?: string;
  notes?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  updated_by: string;
}

export type KumbaraStatus = 'active' | 'inactive' | 'maintenance' | 'damaged' | 'removed';

// Collection related types
export interface KumbaraCollection {
  id: string;
  kumbara_id: string;
  collection_date: string;
  amount: number;
  currency: string;
  collector_name: string;
  collector_id?: string;
  notes?: string;
  receipt_url?: string;
  witness_name?: string;
  witness_phone?: string;
  verification_photos?: string[];
  weather_condition?: string;
  collection_method: 'scheduled' | 'emergency' | 'maintenance';
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by?: string;
}

export interface KumbaraCollectionInsert {
  kumbara_id: string;
  collection_date?: string;
  amount: number;
  currency?: string;
  collector_name: string;
  collector_id?: string;
  notes?: string;
  witness_name?: string;
  witness_phone?: string;
  verification_photos?: string[];
  weather_condition?: string;
  collection_method?: 'scheduled' | 'emergency' | 'maintenance';
  created_by: string;
}

// QR Code related types
export interface KumbaraQRData {
  kumbaraId: string;
  code: string;
  name: string;
  location: string;
  url: string;
  donationUrl?: string;
  contactInfo?: {
    phone?: string;
    person?: string;
  };
  metadata?: {
    installDate: string;
    lastUpdated: string;
    version: string;
  };
}

// Analytics and reporting types
export interface KumbaraAnalytics {
  kumbara_id: string;
  period_start: string;
  period_end: string;
  total_collections: number;
  total_amount: number;
  average_amount: number;
  collection_frequency: number; // days between collections
  performance_score: number; // 0-100
  trend: 'increasing' | 'decreasing' | 'stable';
  peak_months: string[];
  low_months: string[];
  recommendations?: string[];
}

export interface KumbaraPerformanceMetrics {
  daily_average: number;
  weekly_average: number;
  monthly_average: number;
  yearly_projection: number;
  efficiency_rating: 'excellent' | 'good' | 'average' | 'poor';
  location_rating: number; // 1-5 stars
  maintenance_score: number; // 1-5
  donor_satisfaction?: number; // 1-5
}

// Location and mapping types
export interface KumbaraLocation {
  id: string;
  name: string;
  type: 'mosque' | 'market' | 'restaurant' | 'shop' | 'office' | 'school' | 'hospital' | 'other';
  category: 'high_traffic' | 'medium_traffic' | 'low_traffic';
  coordinates: {
    lat: number;
    lng: number;
  };
  address: string;
  contact_person?: string;
  contact_phone?: string;
  operating_hours?: {
    open: string;
    close: string;
    days: string[];
  };
  accessibility: {
    wheelchair_accessible: boolean;
    parking_available: boolean;
    public_transport_nearby: boolean;
  };
  security_level: 'high' | 'medium' | 'low';
  foot_traffic_estimate: number; // people per day
  demographic: {
    age_groups: string[];
    income_level: 'high' | 'medium' | 'low' | 'mixed';
    cultural_background: string[];
  };
}

// Maintenance and service types
export interface KumbaraMaintenance {
  id: string;
  kumbara_id: string;
  maintenance_type: 'routine' | 'repair' | 'replacement' | 'cleaning' | 'security_check';
  scheduled_date: string;
  completed_date?: string;
  technician_name: string;
  technician_id?: string;
  description: string;
  issues_found?: string[];
  actions_taken?: string[];
  parts_replaced?: string[];
  cost: number;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  photos_before?: string[];
  photos_after?: string[];
  next_maintenance_date?: string;
  warranty_info?: {
    parts: string[];
    expiry_date: string;
    provider: string;
  };
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by?: string;
}

// Campaign and marketing types
export interface KumbaraCampaign {
  id: string;
  name: string;
  description: string;
  start_date: string;
  end_date: string;
  target_amount: number;
  current_amount: number;
  participating_kumbaras: string[]; // kumbara IDs
  campaign_type: 'seasonal' | 'emergency' | 'special_cause' | 'general';
  marketing_materials: {
    posters?: string[];
    flyers?: string[];
    digital_assets?: string[];
    qr_codes?: string[];
  };
  status: 'draft' | 'active' | 'paused' | 'completed' | 'cancelled';
  performance_metrics: {
    total_donations: number;
    unique_donors: number;
    average_donation: number;
    conversion_rate: number;
  };
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by?: string;
}

// Dashboard and summary types
export interface KumbaraDashboardStats {
  total_kumbaras: number;
  active_kumbaras: number;
  inactive_kumbaras: number;
  maintenance_kumbaras: number;
  total_collections_today: number;
  total_amount_today: number;
  total_collections_month: number;
  total_amount_month: number;
  top_performing_kumbaras: {
    id: string;
    name: string;
    location: string;
    amount: number;
    collections: number;
  }[];
  recent_collections: {
    id: string;
    kumbara_name: string;
    amount: number;
    collection_date: string;
    collector_name: string;
  }[];
  maintenance_alerts: {
    kumbara_id: string;
    kumbara_name: string;
    issue: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    scheduled_date?: string;
  }[];
  performance_trends: {
    date: string;
    total_amount: number;
    collection_count: number;
  }[];
}

// Form validation types
export interface KumbaraFormData {
  name: string;
  location: string;
  address: string;
  contactPerson?: string;
  phone?: string;
  notes?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface KumbaraCollectionFormData {
  kumbara_id: string;
  collection_date: string;
  amount: number;
  collector_name: string;
  notes?: string;
  witness_name?: string;
  witness_phone?: string;
  verification_photos?: File[];
  weather_condition?: string;
  collection_method: 'scheduled' | 'emergency' | 'maintenance';
}

// Filter and search types
export interface KumbaraFilters {
  status?: KumbaraStatus[];
  location_type?: string[];
  date_range?: {
    start: string;
    end: string;
  };
  amount_range?: {
    min: number;
    max: number;
  };
  search_term?: string;
  sort_by?: 'name' | 'location' | 'amount' | 'last_collection' | 'created_at';
  sort_order?: 'asc' | 'desc';
}

export interface KumbaraSearchResult {
  kumbaras: Kumbara[];
  total_count: number;
  page: number;
  page_size: number;
  total_pages: number;
  filters_applied: KumbaraFilters;
}

// Export and import types
export interface KumbaraExportData {
  kumbara: Kumbara;
  collections: KumbaraCollection[];
  maintenance_history: KumbaraMaintenance[];
  analytics: KumbaraAnalytics;
  qr_data: KumbaraQRData;
}

export interface KumbaraImportData {
  kumbaras: KumbaraInsert[];
  collections?: KumbaraCollectionInsert[];
  validation_errors?: {
    row: number;
    field: string;
    error: string;
  }[];
}

// Notification and alert types
export interface KumbaraAlert {
  id: string;
  kumbara_id: string;
  alert_type:
    | 'maintenance_due'
    | 'low_performance'
    | 'security_issue'
    | 'collection_overdue'
    | 'damage_reported';
  severity: 'info' | 'warning' | 'error' | 'critical';
  title: string;
  message: string;
  action_required: boolean;
  action_url?: string;
  acknowledged: boolean;
  acknowledged_by?: string;
  acknowledged_at?: string;
  resolved: boolean;
  resolved_by?: string;
  resolved_at?: string;
  created_at: string;
  expires_at?: string;
}

// Integration types (for external services)
export interface KumbaraIntegration {
  payment_gateway?: {
    provider: string;
    api_key: string;
    webhook_url: string;
    supported_methods: string[];
  };
  mapping_service?: {
    provider: 'google' | 'mapbox' | 'openstreetmap';
    api_key: string;
    features: string[];
  };
  qr_service?: {
    provider: string;
    api_key: string;
    custom_domain?: string;
  };
  notification_service?: {
    provider: string;
    api_key: string;
    channels: string[];
  };
}

// API Response types
export interface KumbaraApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  metadata?: {
    timestamp: string;
    request_id: string;
    version: string;
  };
}

export type KumbaraListResponse = KumbaraApiResponse<KumbaraSearchResult>;
export type KumbaraDetailResponse = KumbaraApiResponse<Kumbara>;
export type KumbaraCollectionResponse = KumbaraApiResponse<KumbaraCollection>;
export type KumbaraDashboardResponse = KumbaraApiResponse<KumbaraDashboardStats>;

// Utility types
export type KumbaraStatusBadgeVariant = Record<
  KumbaraStatus,
  {
    className: string;
    label: string;
    icon?: string;
  }
>;

export type KumbaraActionType =
  | 'create'
  | 'update'
  | 'delete'
  | 'collect'
  | 'maintain'
  | 'activate'
  | 'deactivate'
  | 'generate_qr'
  | 'export'
  | 'import';
