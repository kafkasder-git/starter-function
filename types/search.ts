export interface SearchConfig {
  searchableFields: string[];
  filterableFields: string[];
  sortableFields: string[];
  defaultSort?: SortConfig;
  itemsPerPage?: number;
  enableFuzzySearch?: boolean;
  enableTurkishSearch?: boolean;
  debounceMs?: number;
}

export interface SortConfig {
  field: string;
  direction: 'asc' | 'desc';
}

export interface FilterConfig {
  field: string;
  type: 'text' | 'select' | 'date' | 'number' | 'boolean' | 'range';
  label: string;
  options?: FilterOption[];
  placeholder?: string;
  min?: number;
  max?: number;
}

export interface FilterOption {
  label: string;
  value: string | number | boolean;
  count?: number;
  color?: string;
}

export interface SearchFilters {
  query?: string;
  category?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  [key: string]: any;
}

export interface SearchOptions {
  limit?: number;
  offset?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}

export interface FilterValue {
  field: string;
  value: any;
  operator?:
    | 'eq'
    | 'ne'
    | 'gt'
    | 'gte'
    | 'lt'
    | 'lte'
    | 'contains'
    | 'startsWith'
    | 'endsWith'
    | 'in'
    | 'between';
}

export interface SearchState {
  query: string;
  filters: FilterValue[];
  sort: SortConfig;
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  isLoading: boolean;
  results: any[];
  hasMore: boolean;
  lastSearchTime: Date | null;
}

export interface SearchResult<T = any> {
  items: T[];
  totalCount: number;
  filteredCount: number;
  facets?: SearchFacet[];
  suggestions?: string[];
  searchTime?: number;
}

export interface SearchFacet {
  field: string;
  label: string;
  options: FilterOption[];
}

export interface PaginationConfig {
  page: number;
  limit: number;
  showFirstLast?: boolean;
  showPrevNext?: boolean;
  showPageNumbers?: boolean;
  maxPageNumbers?: number;
  boundaryCount?: number;
  siblingCount?: number;
}

export interface ExportConfig {
  format: 'csv' | 'excel' | 'pdf' | 'json';
  fields?: string[];
  filename?: string;
  includeFilters?: boolean;
  dateRange?: {
    start: Date;
    end: Date;
  };
}

// Turkish character mapping for search
export const TURKISH_CHAR_MAP: Record<string, string> = {
  ç: 'c',
  Ç: 'C',
  ğ: 'g',
  Ğ: 'G',
  ı: 'i',
  I: 'i',
  İ: 'I',
  i: 'i',
  ö: 'o',
  Ö: 'O',
  ş: 's',
  Ş: 'S',
  ü: 'u',
  Ü: 'U',
};

// Common filter presets for Turkish entities
export const FILTER_PRESETS = {
  member: {
    membershipType: [
      { label: 'Standart Üye', value: 'standard' },
      { label: 'Premium Üye', value: 'premium' },
      { label: 'Kurumsal Üye', value: 'corporate' },
      { label: 'Öğrenci Üyesi', value: 'student' },
      { label: 'Emekli Üyesi', value: 'senior' },
    ],
    status: [
      { label: 'Aktif', value: 'active', color: 'green' },
      { label: 'Pasif', value: 'inactive', color: 'gray' },
      { label: 'Askıda', value: 'suspended', color: 'yellow' },
      { label: 'İptal', value: 'cancelled', color: 'red' },
    ],
    gender: [
      { label: 'Erkek', value: 'male' },
      { label: 'Kadın', value: 'female' },
      { label: 'Belirtmek İstemiyorum', value: 'other' },
    ],
  },
  donation: {
    type: [
      { label: 'Nakit Bağış', value: 'cash' },
      { label: 'Ayni Bağış', value: 'in-kind' },
      { label: 'Kurban Bağışı', value: 'sacrifice' },
      { label: 'Zekât', value: 'zakat' },
      { label: 'Fitre', value: 'fitre' },
    ],
    status: [
      { label: 'Tamamlandı', value: 'completed', color: 'green' },
      { label: 'Beklemede', value: 'pending', color: 'yellow' },
      { label: 'İptal', value: 'cancelled', color: 'red' },
    ],
    paymentMethod: [
      { label: 'Nakit', value: 'cash' },
      { label: 'Banka Havalesi', value: 'bank_transfer' },
      { label: 'Kredi Kartı', value: 'credit_card' },
      { label: 'Çek', value: 'check' },
    ],
  },
  aid: {
    type: [
      { label: 'Nakit Yardım', value: 'cash' },
      { label: 'Gıda Yardımı', value: 'food' },
      { label: 'Giyim Yardımı', value: 'clothing' },
      { label: 'Eğitim Yardımı', value: 'education' },
      { label: 'Sağlık Yardımı', value: 'health' },
      { label: 'Barınma Yardımı', value: 'housing' },
    ],
    status: [
      { label: 'Onaylandı', value: 'approved', color: 'green' },
      { label: 'Beklemede', value: 'pending', color: 'yellow' },
      { label: 'İnceleniyor', value: 'under_review', color: 'blue' },
      { label: 'Reddedildi', value: 'rejected', color: 'red' },
      { label: 'Tamamlandı', value: 'completed', color: 'purple' },
    ],
    urgency: [
      { label: 'Acil', value: 'urgent', color: 'red' },
      { label: 'Yüksek', value: 'high', color: 'orange' },
      { label: 'Normal', value: 'normal', color: 'blue' },
      { label: 'Düşük', value: 'low', color: 'gray' },
    ],
  },
};

// Search operators with Turkish labels
export const SEARCH_OPERATORS = {
  eq: 'Eşittir',
  ne: 'Eşit Değildir',
  gt: 'Büyüktür',
  gte: 'Büyük Eşittir',
  lt: 'Küçüktür',
  lte: 'Küçük Eşittir',
  contains: 'İçerir',
  startsWith: 'İle Başlar',
  endsWith: 'İle Biter',
  in: 'İçinde',
  between: 'Arasında',
};

// Date range presets
export const DATE_RANGE_PRESETS = [
  { label: 'Bugün', value: 'today' },
  { label: 'Dün', value: 'yesterday' },
  { label: 'Bu Hafta', value: 'this_week' },
  { label: 'Geçen Hafta', value: 'last_week' },
  { label: 'Bu Ay', value: 'this_month' },
  { label: 'Geçen Ay', value: 'last_month' },
  { label: 'Bu Yıl', value: 'this_year' },
  { label: 'Geçen Yıl', value: 'last_year' },
  { label: 'Son 7 Gün', value: 'last_7_days' },
  { label: 'Son 30 Gün', value: 'last_30_days' },
  { label: 'Son 90 Gün', value: 'last_90_days' },
  { label: 'Özel Aralık', value: 'custom' },
];

// Quick search suggestions for different modules
export const SEARCH_SUGGESTIONS = {
  member: [
    'Aktif üyeler',
    'Premium üyeler',
    'Bu ay katılan üyeler',
    'Borcu olan üyeler',
    'İstanbul üyeleri',
  ],
  donation: [
    'Bu ay yapılan bağışlar',
    'Büyük bağışlar (>1000₺)',
    'Nakit bağışlar',
    'Tamamlanmayan bağışlar',
  ],
  aid: [
    'Bekleyen başvurular',
    'Acil yardımlar',
    'Bu ay onaylanan yardımlar',
    'Nakit yardım başvuruları',
  ],
};

// =============================================================================
// HOOK TYPES
// =============================================================================

/**
 * Hook props for useSearch
 */
export interface UseSearchProps<T = unknown> {
  config: SearchConfig;
  data?: T[];
  onSearch?: (
    query: string,
    filters: FilterValue[],
    sort: SortConfig,
  ) => Promise<SearchResult<T>> | SearchResult<T>;
  initialQuery?: string;
  initialFilters?: FilterValue[];
  initialSort?: SortConfig;
}
