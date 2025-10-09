/**
 * @fileoverview Enhanced Supabase Service with Network Error Handling
 * @description Improved Supabase client with comprehensive error handling and retry logic
 */

import { supabase } from '../lib/supabase';
import { NetworkManager, getUserFriendlyErrorMessage } from '../lib/networkDiagnostics';
import type { NetworkError } from '../lib/networkDiagnostics';
import { logger } from '../lib/logging/logger';
import type { PostgrestFilterBuilder } from '@supabase/postgrest-js';

export type QueryBuilder<T> = PostgrestFilterBuilder<any, any, T>;
export type QueryBuilderFn<T> = (builder: QueryBuilder<T>) => QueryBuilder<T>;

export interface SupabaseResponse<T> {
  data: T | null;
  error: NetworkError | null;
  success: boolean;
  metadata?: {
    retryCount: number;
    latency: number;
    timestamp: string;
  };
}

export interface BatchOperationResult<T> {
  successful: T[];
  failed: Array<{ data: any; error: NetworkError }>;
  totalCount: number;
  successCount: number;
  failureCount: number;
}

export interface ConnectionStatus {
  connected: boolean;
  latency?: number;
  endpoint?: string;
  error?: string;
  timestamp: string;
}

export enum RetryStrategy {
  EXPONENTIAL = 'exponential',
  LINEAR = 'linear',
  FIXED = 'fixed',
}

export interface SupabaseQueryOptions {
  retries?: number;
  timeout?: number;
  fallbackData?: any;
  retryStrategy?: RetryStrategy;
  checkNetwork?: boolean;
  single?: boolean;
}

export class EnhancedSupabaseService {
  private static instance: EnhancedSupabaseService;
  private networkManager: NetworkManager;

  private constructor() {
    this.networkManager = NetworkManager.getInstance();
  }

  static getInstance(): EnhancedSupabaseService {
    if (!EnhancedSupabaseService.instance) {
      EnhancedSupabaseService.instance = new EnhancedSupabaseService();
    }
    return EnhancedSupabaseService.instance;
  }

  /**
   * Enhanced query with error handling and retry logic
   * @param table - The table name to query
   * @param queryBuilder - Function that builds the query using Supabase query builder
   * @param options - Query options including retries, timeout, etc.
   * @returns Promise resolving to SupabaseResponse with data or error
   * @throws NetworkError on unrecoverable errors
   * @example
   * ```typescript
   * const result = await enhancedSupabase.query<Beneficiary[]>(
   *   'beneficiaries',
   *   (qb) => qb.select('*').eq('status', 'active'),
   *   { retries: 3, timeout: 30000 }
   * );
   * ```
   */
  async query<T>(
    table: string,
    queryBuilder: QueryBuilderFn<T>,
    options: SupabaseQueryOptions = {},
  ): Promise<SupabaseResponse<T>> {
    const { retries = 3, timeout = 30000, fallbackData = null, checkNetwork = true } = options;
    const startTime = Date.now();

    try {
      // Check network connectivity first
      if (checkNetwork) {
        await this.checkNetworkConnectivity();
      }

      // Execute query with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const builder = supabase.from(table);
      const query = queryBuilder(builder);
      const { data, error } = await query.abortSignal(controller.signal);

      clearTimeout(timeoutId);

      if (error) {
        logger.error('Supabase query error:', error);

        const networkError: NetworkError = {
          type: this.determineErrorType(error),
          message: getUserFriendlyErrorMessage({
            type: this.determineErrorType(error),
            message: error.message,
          }),
          details: error,
        };

        // Retry on certain errors
        if (this.shouldRetry(error) && retries > 0) {
          logger.info(`Retrying query (${retries} attempts left)...`);
          await this.delay(this.calculateBackoffDelay(3 - retries));
          return this.query(table, queryBuilder, { ...options, retries: retries - 1 });
        }

        return {
          data: fallbackData,
          error: networkError,
          success: false,
          metadata: {
            retryCount: 3 - retries,
            latency: Date.now() - startTime,
            timestamp: new Date().toISOString(),
          },
        };
      }

      return {
        data: data as T,
        error: null,
        success: true,
        metadata: {
          retryCount: 3 - retries,
          latency: Date.now() - startTime,
          timestamp: new Date().toISOString(),
        },
      };
    } catch (error: any) {
      logger.error('Supabase service error:', error);

      let networkError: NetworkError;

      if (error.name === 'AbortError') {
        networkError = {
          type: 'TIMEOUT_ERROR',
          message: getUserFriendlyErrorMessage({
            type: 'TIMEOUT_ERROR',
            message: 'Request timeout',
          }),
        };
      } else if (error.message?.includes('Failed to fetch')) {
        networkError = {
          type: 'NETWORK_ERROR',
          message: getUserFriendlyErrorMessage({
            type: 'NETWORK_ERROR',
            message: 'Failed to fetch',
          }),
        };
      } else {
        networkError = {
          type: 'UNKNOWN_ERROR',
          message: getUserFriendlyErrorMessage({
            type: 'UNKNOWN_ERROR',
            message: error.message || 'Unknown error',
          }),
        };
      }

      // Retry on network errors
      if (networkError.type === 'NETWORK_ERROR' && retries > 0) {
        logger.info(`Retrying query due to network error (${retries} attempts left)...`);
        await this.delay(this.calculateBackoffDelay(3 - retries));
        return this.query(table, queryBuilder, { ...options, retries: retries - 1 });
      }

      return {
        data: fallbackData,
        error: networkError,
        success: false,
        metadata: {
          retryCount: 3 - retries,
          latency: Date.now() - startTime,
          timestamp: new Date().toISOString(),
        },
      };
    }
  }

  /**
   * Enhanced insert with error handling
   * @param table - The table name to insert into
   * @param data - Data to insert
   * @param options - Insert options including retries, single, etc.
   * @returns Promise resolving to SupabaseResponse with inserted data or error
   * @throws NetworkError on unrecoverable errors
   * @example
   * ```typescript
   * const result = await enhancedSupabase.insert<Beneficiary>(
   *   'beneficiaries',
   *   { name: 'John Doe', status: 'active' },
   *   { retries: 2, single: true }
   * );
   * ```
   */
  async insert<T>(
    table: string,
    data: any,
    options: SupabaseQueryOptions = {},
  ): Promise<SupabaseResponse<T | T[]>> {
    const { retries = 3, single = true, checkNetwork = true } = options;
    const startTime = Date.now();

    try {
      if (checkNetwork) {
        await this.checkNetworkConnectivity();
      }

      let query = supabase.from(table).insert(data).select();

      if (single) {
        query = query.single();
      }

      const { data: result, error } = await query;

      if (error) {
        logger.error('Supabase insert error:', error);

        const networkError: NetworkError = {
          type: this.determineErrorType(error),
          message: getUserFriendlyErrorMessage({
            type: this.determineErrorType(error),
            message: error.message,
          }),
          details: error,
        };

        if (this.shouldRetry(error) && retries > 0) {
          await this.delay(this.calculateBackoffDelay(3 - retries));
          return this.insert(table, data, { ...options, retries: retries - 1 });
        }

        return {
          data: null,
          error: networkError,
          success: false,
          metadata: {
            retryCount: 3 - retries,
            latency: Date.now() - startTime,
            timestamp: new Date().toISOString(),
          },
        };
      }

      return {
        data: result as T | T[],
        error: null,
        success: true,
        metadata: {
          retryCount: 3 - retries,
          latency: Date.now() - startTime,
          timestamp: new Date().toISOString(),
        },
      };
    } catch (error: any) {
      logger.error('Supabase insert service error:', error);

      const networkError: NetworkError = {
        type: 'UNKNOWN_ERROR',
        message: getUserFriendlyErrorMessage({
          type: 'UNKNOWN_ERROR',
          message: error.message || 'Insert failed',
        }),
      };

      return {
        data: null,
        error: networkError,
        success: false,
        metadata: {
          retryCount: 3 - retries,
          latency: Date.now() - startTime,
          timestamp: new Date().toISOString(),
        },
      };
    }
  }

  /**
   * Enhanced update with error handling
   * @param table - The table name to update
   * @param data - Data to update
   * @param filter - Filter criteria for update
   * @param options - Update options including retries, single, etc.
   * @returns Promise resolving to SupabaseResponse with updated data or error
   * @throws NetworkError on unrecoverable errors
   * @example
   * ```typescript
   * const result = await enhancedSupabase.update<Beneficiary>(
   *   'beneficiaries',
   *   { status: 'inactive' },
   *   { id: 123 },
   *   { retries: 2, single: true }
   * );
   * ```
   */
  async update<T>(
    table: string,
    data: any,
    filter: any,
    options: SupabaseQueryOptions = {},
  ): Promise<SupabaseResponse<T | T[]>> {
    const { retries = 3, single = true, checkNetwork = true } = options;
    const startTime = Date.now();

    try {
      if (checkNetwork) {
        await this.checkNetworkConnectivity();
      }

      let query = supabase.from(table).update(data).match(filter).select();

      if (single) {
        query = query.single();
      }

      const { data: result, error } = await query;

      if (error) {
        logger.error('Supabase update error:', error);

        const networkError: NetworkError = {
          type: this.determineErrorType(error),
          message: getUserFriendlyErrorMessage({
            type: this.determineErrorType(error),
            message: error.message,
          }),
          details: error,
        };

        if (this.shouldRetry(error) && retries > 0) {
          await this.delay(this.calculateBackoffDelay(3 - retries));
          return this.update(table, data, filter, { ...options, retries: retries - 1 });
        }

        return {
          data: null,
          error: networkError,
          success: false,
          metadata: {
            retryCount: 3 - retries,
            latency: Date.now() - startTime,
            timestamp: new Date().toISOString(),
          },
        };
      }

      return {
        data: result as T | T[],
        error: null,
        success: true,
        metadata: {
          retryCount: 3 - retries,
          latency: Date.now() - startTime,
          timestamp: new Date().toISOString(),
        },
      };
    } catch (error: any) {
      logger.error('Supabase update service error:', error);

      const networkError: NetworkError = {
        type: 'UNKNOWN_ERROR',
        message: getUserFriendlyErrorMessage({
          type: 'UNKNOWN_ERROR',
          message: error.message || 'Update failed',
        }),
      };

      return {
        data: null,
        error: networkError,
        success: false,
        metadata: {
          retryCount: 3 - retries,
          latency: Date.now() - startTime,
          timestamp: new Date().toISOString(),
        },
      };
    }
  }

  /**
   * Enhanced delete with error handling
   * @param table - The table name to delete from
   * @param filter - Filter criteria for delete
   * @param options - Delete options including retries, single, etc.
   * @returns Promise resolving to SupabaseResponse with deleted data or error
   * @throws NetworkError on unrecoverable errors
   * @example
   * ```typescript
   * const result = await enhancedSupabase.delete<Beneficiary>(
   *   'beneficiaries',
   *   { id: 123 },
   *   { retries: 2, single: true }
   * );
   * ```
   */
  async delete<T>(
    table: string,
    filter: any,
    options: SupabaseQueryOptions = {},
  ): Promise<SupabaseResponse<T | T[]>> {
    const { retries = 3, single = true, checkNetwork = true } = options;
    const startTime = Date.now();

    try {
      if (checkNetwork) {
        await this.checkNetworkConnectivity();
      }

      let query = supabase.from(table).delete().match(filter).select();

      if (single) {
        query = query.single();
      }

      const { data: result, error } = await query;

      if (error) {
        logger.error('Supabase delete error:', error);

        const networkError: NetworkError = {
          type: this.determineErrorType(error),
          message: getUserFriendlyErrorMessage({
            type: this.determineErrorType(error),
            message: error.message,
          }),
          details: error,
        };

        if (this.shouldRetry(error) && retries > 0) {
          await this.delay(this.calculateBackoffDelay(3 - retries));
          return this.delete(table, filter, { ...options, retries: retries - 1 });
        }

        return {
          data: null,
          error: networkError,
          success: false,
          metadata: {
            retryCount: 3 - retries,
            latency: Date.now() - startTime,
            timestamp: new Date().toISOString(),
          },
        };
      }

      return {
        data: result as T | T[],
        error: null,
        success: true,
        metadata: {
          retryCount: 3 - retries,
          latency: Date.now() - startTime,
          timestamp: new Date().toISOString(),
        },
      };
    } catch (error: any) {
      logger.error('Supabase delete service error:', error);

      const networkError: NetworkError = {
        type: 'UNKNOWN_ERROR',
        message: getUserFriendlyErrorMessage({
          type: 'UNKNOWN_ERROR',
          message: error.message || 'Delete failed',
        }),
      };

      return {
        data: null,
        error: networkError,
        success: false,
        metadata: {
          retryCount: 3 - retries,
          latency: Date.now() - startTime,
          timestamp: new Date().toISOString(),
        },
      };
    }
  }

  /**
   * Batch insert multiple records
   * @param table - The table name to insert into
   * @param data - Array of data to insert
   * @param options - Batch insert options
   * @returns Promise resolving to BatchOperationResult
   * @example
   * ```typescript
   * const result = await enhancedSupabase.batchInsert<Beneficiary>(
   *   'beneficiaries',
   *   [{ name: 'John' }, { name: 'Jane' }]
   * );
   * ```
   */
  async batchInsert<T>(
    table: string,
    data: any[],
    options: SupabaseQueryOptions = {},
  ): Promise<BatchOperationResult<T>> {
    const results: BatchOperationResult<T> = {
      successful: [],
      failed: [],
      totalCount: data.length,
      successCount: 0,
      failureCount: 0,
    };

    for (const item of data) {
      const result = await this.insert<T>(table, item, { ...options, single: true });
      if (result.success && result.data) {
        results.successful.push(result.data as T);
        results.successCount++;
      } else {
        results.failed.push({ data: item, error: result.error! });
        results.failureCount++;
      }
    }

    return results;
  }

  /**
   * Batch update multiple records
   * @param table - The table name to update
   * @param updates - Array of { data, filter } objects
   * @param options - Batch update options
   * @returns Promise resolving to BatchOperationResult
   * @example
   * ```typescript
   * const result = await enhancedSupabase.batchUpdate<Beneficiary>(
   *   'beneficiaries',
   *   [{ data: { status: 'active' }, filter: { id: 1 } }]
   * );
   * ```
   */
  async batchUpdate<T>(
    table: string,
    updates: Array<{ data: any; filter: any }>,
    options: SupabaseQueryOptions = {},
  ): Promise<BatchOperationResult<T>> {
    const results: BatchOperationResult<T> = {
      successful: [],
      failed: [],
      totalCount: updates.length,
      successCount: 0,
      failureCount: 0,
    };

    for (const update of updates) {
      const result = await this.update<T>(table, update.data, update.filter, {
        ...options,
        single: true,
      });
      if (result.success && result.data) {
        results.successful.push(result.data as T);
        results.successCount++;
      } else {
        results.failed.push({ data: update, error: result.error! });
        results.failureCount++;
      }
    }

    return results;
  }

  /**
   * Batch delete multiple records
   * @param table - The table name to delete from
   * @param filters - Array of filter objects
   * @param options - Batch delete options
   * @returns Promise resolving to BatchOperationResult
   * @example
   * ```typescript
   * const result = await enhancedSupabase.batchDelete<Beneficiary>(
   *   'beneficiaries',
   *   [{ id: 1 }, { id: 2 }]
   * );
   * ```
   */
  async batchDelete<T>(
    table: string,
    filters: any[],
    options: SupabaseQueryOptions = {},
  ): Promise<BatchOperationResult<T>> {
    const results: BatchOperationResult<T> = {
      successful: [],
      failed: [],
      totalCount: filters.length,
      successCount: 0,
      failureCount: 0,
    };

    for (const filter of filters) {
      const result = await this.delete<T>(table, filter, { ...options, single: true });
      if (result.success && result.data) {
        results.successful.push(result.data as T);
        results.successCount++;
      } else {
        results.failed.push({ data: filter, error: result.error! });
        results.failureCount++;
      }
    }

    return results;
  }

  /**
   * Build a query builder for flexible query construction
   * @param table - The table name
   * @returns QueryBuilder instance
   * @example
   * ```typescript
   * const qb = enhancedSupabase.buildQuery<Beneficiary>('beneficiaries');
   * const result = await qb.select('*').eq('status', 'active');
   * ```
   */
  buildQuery<T>(table: string): QueryBuilder<T> {
    return supabase.from(table) as QueryBuilder<T>;
  }

  /**
   * Test Supabase connection with detailed diagnostics
   * @returns Promise resolving to ConnectionStatus
   * @example
   * ```typescript
   * const status = await enhancedSupabase.testConnection();
   * if (!status.connected) {
   *   console.error('Connection failed:', status.error);
   * }
   * ```
   */
  async testConnection(): Promise<ConnectionStatus> {
    const startTime = Date.now();
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    try {
      const { error } = await supabase
        .from('beneficiaries') // Use a known table
        .select('*')
        .limit(1)
        .abortSignal(controller.signal);

      clearTimeout(timeoutId);

      if (error) {
        return {
          connected: false,
          latency: Date.now() - startTime,
          endpoint: supabase.supabaseUrl,
          error: getUserFriendlyErrorMessage({
            type: this.determineErrorType(error),
            message: error.message,
          }),
          timestamp: new Date().toISOString(),
        };
      }

      return {
        connected: true,
        latency: Date.now() - startTime,
        endpoint: supabase.supabaseUrl,
        timestamp: new Date().toISOString(),
      };
    } catch (error: any) {
      clearTimeout(timeoutId);
      return {
        connected: false,
        latency: Date.now() - startTime,
        endpoint: supabase.supabaseUrl,
        error: getUserFriendlyErrorMessage({
          type: 'NETWORK_ERROR',
          message: error.message || 'Connection test failed',
        }),
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Get network diagnostics
   * @returns Network diagnostics information
   */
  async getDiagnostics() {
    return this.networkManager.getDiagnostics();
  }

  /**
   * Check network connectivity (private method)
   */
  private async checkNetworkConnectivity(): Promise<void> {
    const diagnostics = await this.networkManager.testConnectivity();
    if (!diagnostics.canReachSupabase) {
      throw new Error('Supabase sunucusuna erişilemiyor. İnternet bağlantınızı kontrol edin.');
    }
  }

  /**
   * Determine error type from Supabase error
   */
  private determineErrorType(error: any): NetworkError['type'] {
    const message = error.message?.toLowerCase() || '';
    const code = error.code || '';

    if (message.includes('network') || message.includes('fetch')) {
      return 'NETWORK_ERROR';
    }
    if (code === 'PGRST301' || message.includes('timeout')) {
      return 'TIMEOUT_ERROR';
    }
    if (code === '401' || code === '403' || message.includes('unauthorized')) {
      return 'AUTH_ERROR';
    }
    if (message.includes('server') || code.startsWith('5')) {
      return 'SERVER_ERROR';
    }

    return 'UNKNOWN_ERROR';
  }

  /**
   * Check if error should be retried
   */
  private shouldRetry(error: any): boolean {
    const message = error.message?.toLowerCase() || '';
    const code = error.code || '';

    // Retry on network errors and server errors
    if (
      message.includes('network') ||
      message.includes('timeout') ||
      message.includes('fetch') ||
      code.startsWith('5')
    ) {
      return true;
    }

    return false;
  }

  /**
   * Calculate backoff delay
   */
  private calculateBackoffDelay(attempt: number): number {
    return Math.min(1000 * Math.pow(2, attempt), 5000);
  }

  /**
   * Delay utility
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// Export singleton instance
export const enhancedSupabase = EnhancedSupabaseService.getInstance();

export default EnhancedSupabaseService;
