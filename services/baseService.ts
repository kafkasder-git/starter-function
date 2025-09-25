import type { ApiResponse, PaginatedResponse } from './config';
import { SERVICE_CONFIG } from './config';

export interface BaseEntity {
  id: number;
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
}

export interface BaseFilters {
  searchTerm?: string;
  dateFrom?: string;
  dateTo?: string;
  [key: string]: unknown;
}

export abstract class BaseService<
  T extends BaseEntity,
  TInsert,
  TUpdate,
  TFilters extends BaseFilters = BaseFilters,
> {
  protected nextId = 1;

  // Simulate network delay
  protected delay(ms: number = SERVICE_CONFIG.DEFAULT_DELAY_MS): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // Generic pagination
  protected paginateResults<TData>(
    data: TData[],
    page: number,
    pageSize: number,
  ): PaginatedResponse<TData> {
    const totalCount = data.length;
    const totalPages = Math.ceil(totalCount / pageSize);
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedData = data.slice(startIndex, endIndex);

    return {
      data: paginatedData,
      count: totalCount,
      page,
      pageSize,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    };
  }

  // Generic search filter
  protected applySearchFilter(data: T[], searchTerm: string, searchFields: (keyof T)[]): T[] {
    const searchLower = searchTerm.toLowerCase();
    return data.filter((item) =>
      searchFields.some((field) => {
        const value = item[field];
        return value && String(value).toLowerCase().includes(searchLower);
      }),
    );
  }

  // Get unique values for a field (to be implemented by subclasses if needed)
  protected getUniqueValues(field: keyof T, data: T[]): (string | number)[] {
    const values: (string | number)[] = [];

    for (const item of data) {
      const value = item[field];
      if (
        value !== null &&
        value !== undefined &&
        value !== '' &&
        (typeof value === 'string' || typeof value === 'number')
      ) {
        values.push(value);
      }
    }

    return Array.from(new Set(values)).sort();
  }

  // Generic date range filter
  protected applyDateRangeFilter(
    data: T[],
    dateFrom?: string,
    dateTo?: string,
    dateField: keyof T = 'created_at' as keyof T,
  ): T[] {
    let filteredData = data;

    if (dateFrom) {
      filteredData = filteredData.filter(
        (item) => new Date(item[dateField] as string) >= new Date(dateFrom),
      );
    }

    if (dateTo) {
      filteredData = filteredData.filter(
        (item) => new Date(item[dateField] as string) <= new Date(dateTo),
      );
    }

    return filteredData;
  }

  // Abstract methods that must be implemented by subclasses
  abstract getAll(
    page?: number,
    pageSize?: number,
    filters?: TFilters,
  ): Promise<PaginatedResponse<T>>;
  abstract getById(id: string): Promise<ApiResponse<T>>;
  abstract create(data: TInsert): Promise<ApiResponse<T>>;
  abstract update(id: string, data: TUpdate): Promise<ApiResponse<T>>;
  abstract delete(id: string, deletedBy: string): Promise<ApiResponse<boolean>>;

  // Abstract filter method that subclasses must implement
  protected abstract applyFilters(data: T[], filters: TFilters): T[];

  // Common utility methods
  protected findById(id: string, data: T[]): T | undefined {
    return data.find((item) => item.id.toString() === id);
  }

  protected generateId(): string {
    // Use crypto.randomUUID() for robust unique ID generation
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }

    // Fallback for environments without crypto.randomUUID()
    return `id_${  Date.now()  }_${  Math.random().toString(36).substr(2, 9)}`;
  }

  protected updateTimestamp(data: Partial<T>): Partial<T> {
    return {
      ...data,
      updated_at: new Date().toISOString(),
    };
  }
}

// Default export
export default BaseService;
