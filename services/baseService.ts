/**
 * @fileoverview baseService Module - Application module
 * 
 * @author Dernek Yönetim Sistemi Team
 * @version 1.0.0
 */

import { SERVICE_CONFIG, type ApiResponse, type PaginatedResponse } from './config';

/**
 * Base entity interface that all database entities should extend
 * @interface BaseEntity
 */
/**
 * BaseEntity Interface
 * 
 * @interface BaseEntity
 */
export interface BaseEntity {
  /** Unique identifier for the entity */
  id: number;
  /** ISO timestamp when the entity was created */
  created_at: string;
  /** ISO timestamp when the entity was last updated */
  updated_at: string;
  /** ID of the user who created this entity */
  created_by?: string;
  /** ID of the user who last updated this entity */
  updated_by?: string;
}

/**
 * Base filters interface for search and filtering operations
 * @interface BaseFilters
 */
/**
 * BaseFilters Interface
 * 
 * @interface BaseFilters
 */
export interface BaseFilters {
  /** Search term for text-based filtering */
  searchTerm?: string;
  /** Start date for date range filtering (ISO format) */
  dateFrom?: string;
  /** End date for date range filtering (ISO format) */
  dateTo?: string;
  /** Additional filter properties */
  [key: string]: unknown;
}

/**
 * Abstract base service class providing common CRUD operations and utilities
 * @template T - The entity type that extends BaseEntity
 * @template TInsert - The type for creating new entities
 * @template TUpdate - The type for updating existing entities
 * @template TFilters - The type for filtering entities (defaults to BaseFilters)
 */
export abstract class BaseService<
  T extends BaseEntity,
  TInsert,
  TUpdate,
  TFilters extends BaseFilters = BaseFilters,
> {
  /** Next available ID for entity creation */
  protected nextId = 1;

  /**
   * Simulates network delay for realistic API behavior
   * @param ms - Delay in milliseconds (defaults to SERVICE_CONFIG.DEFAULT_DELAY_MS)
   * @returns Promise that resolves after the specified delay
   */
  protected delay(ms: number = SERVICE_CONFIG.DEFAULT_DELAY_MS): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Generic pagination utility for slicing data arrays
   * @template TData - The type of data being paginated
   * @param data - Array of data to paginate
   * @param page - Current page number (1-based)
   * @param pageSize - Number of items per page
   * @returns Paginated response with data, metadata, and navigation info
   */
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

  /**
   * Extracts unique values for a specific field from an array of entities
   * @param field - The field to extract unique values from
   * @param data - Array of entities to process
   * @returns Sorted array of unique values (strings or numbers)
   */
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

    return Array.from(new Set(values)).sort((a, b) => a.localeCompare(b));
  }

  /**
   * Applies date range filtering to an array of entities
   * @param data - Array of entities to filter
   * @param dateFrom - Start date for filtering (ISO format)
   * @param dateTo - End date for filtering (ISO format)
   * @param dateField - Field to use for date comparison (defaults to 'created_at')
   * @returns Filtered array of entities within the date range
   */
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

  /**
   * Retrieves all entities with pagination and filtering
   * @param page - Page number (1-based)
   * @param pageSize - Number of items per page
   * @param filters - Filtering criteria
   * @returns Promise resolving to paginated response
   */
  abstract getAll(
    page?: number,
    pageSize?: number,
    filters?: TFilters,
  ): Promise<PaginatedResponse<T>>;

  /**
   * Retrieves a single entity by its ID
   * @param id - Unique identifier of the entity
   * @returns Promise resolving to API response with entity data
   */
  abstract getById(id: string): Promise<ApiResponse<T>>;

  /**
   * Creates a new entity
   * @param data - Data for creating the new entity
   * @returns Promise resolving to API response with created entity
   */
  abstract create(data: TInsert): Promise<ApiResponse<T>>;

  /**
   * Updates an existing entity
   * @param id - Unique identifier of the entity to update
   * @param data - Data for updating the entity
   * @returns Promise resolving to API response with updated entity
   */
  abstract update(id: string, data: TUpdate): Promise<ApiResponse<T>>;

  /**
   * Deletes an entity by its ID
   * @param id - Unique identifier of the entity to delete
   * @param deletedBy - ID of the user performing the deletion
   * @returns Promise resolving to API response indicating success
   */
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
