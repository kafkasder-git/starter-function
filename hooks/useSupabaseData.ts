// Lightweight stubs for Supabase data hooks to satisfy type-checking
// Replace with real implementations as needed

export interface OrderByOption {
  column: string;
  ascending?: boolean;
}

export interface UseSupabaseOptions {
  select?: string;
  orderBy?: OrderByOption;
  filters?: Record<string, unknown>;
  limit?: number;
  realtime?: boolean;
  pageSize?: number;
  searchQuery?: string;
  searchFields?: string[];
}

export function useSupabaseData<T = any>(
  _table: string,
  _options: UseSupabaseOptions = {},
): {
  data: T[];
  loading: boolean;
  error: string | null;
  count: number;
  refetch: () => Promise<void>;
  insert: (record: Partial<T>) => Promise<T>;
  update: (id: string, record: Partial<T>) => Promise<T>;
  delete: (id: string) => Promise<boolean>;
  bulkInsert: (records: Partial<T>[]) => Promise<T[]>;
  bulkUpdate: (updates: { id: string; data: Partial<T> }[]) => Promise<void>;
  bulkDelete: (ids: string[]) => Promise<void>;
} {
  return {
    data: [],
    loading: false,
    error: null,
    count: 0,
    async refetch() {},
    async insert(record) {
      return record as T;
    },
    async update(_id, record) {
      return record as T;
    },
    async delete(_id) {
      return true;
    },
    async bulkInsert(records) {
      return records as T[];
    },
    async bulkUpdate(_updates) {},
    async bulkDelete(_ids) {},
  };
}

export function useSupabasePagination<T = any>(
  _table: string,
  _options: UseSupabaseOptions = {},
): {
  data: T[];
  loading: boolean;
  error: string | null;
  count: number;
  page: number;
  setPage: (page: number) => void;
  refetch: () => Promise<void>;
} {
  let currentPage = 1;
  return {
    data: [],
    loading: false,
    error: null,
    count: 0,
    page: currentPage,
    setPage(page: number) {
      currentPage = page;
    },
    async refetch() {},
  };
}

export function useSupabaseSearch<T = any>(
  _table: string,
  _fields: string[],
  _options: UseSupabaseOptions = {},
): {
  data: T[];
  loading: boolean;
  error: string | null;
  search: (query: string) => Promise<void>;
} {
  return {
    data: [],
    loading: false,
    error: null,
    async search(_query: string) {},
  };
}

