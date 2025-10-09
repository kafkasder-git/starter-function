/**
 * @fileoverview Enhanced Supabase Service with Network Error Handling
 * @description Improved Supabase client with comprehensive error handling and retry logic
 */

import { supabase } from '../lib/supabase';
import { NetworkManager } from '../lib/networkDiagnostics';
import type { NetworkError } from '../lib/networkDiagnostics';
import { logger } from '../lib/logging/logger';

export interface SupabaseResponse<T> {
  data: T | null;
  error: NetworkError | null;
  success: boolean;
}

export interface SupabaseQueryOptions {
  retries?: number;
  timeout?: number;
  fallbackData?: any;
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
   */
  async query<T>(
    table: string,
    query: any,
    options: SupabaseQueryOptions = {}
  ): Promise<SupabaseResponse<T>> {
    const { retries = 3, fallbackData = null } = options;

    try {
      // Check network connectivity first
      const diagnostics = await this.networkManager.testConnectivity();
      if (!diagnostics.canReachSupabase) {
        return {
          data: fallbackData,
          error: {
            type: 'NETWORK_ERROR',
            message: 'Supabase sunucusuna erişilemiyor. İnternet bağlantınızı kontrol edin.'
          },
          success: false
        };
      }

      // Execute query with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const { data, error } = await supabase
        .from(table)
        .select(query)
        .abortSignal(controller.signal);

      clearTimeout(timeoutId);

      if (error) {
        logger.error('Supabase query error:', error);
        
        const networkError: NetworkError = {
          type: this.determineErrorType(error),
          message: error.message,
          details: error
        };

        // Retry on certain errors
        if (this.shouldRetry(error) && retries > 0) {
          logger.info(`Retrying query (${retries} attempts left)...`);
          await this.delay(1000);
          return this.query(table, query, { ...options, retries: retries - 1 });
        }

        return {
          data: fallbackData,
          error: networkError,
          success: false
        };
      }

      return {
        data: data as T,
        error: null,
        success: true
      };

    } catch (error: any) {
      logger.error('Supabase service error:', error);

      let networkError: NetworkError;
      
      if (error.name === 'AbortError') {
        networkError = {
          type: 'TIMEOUT_ERROR',
          message: 'İstek zaman aşımına uğradı. Lütfen tekrar deneyin.'
        };
      } else if (error.message?.includes('Failed to fetch')) {
        networkError = {
          type: 'NETWORK_ERROR',
          message: 'Bağlantı hatası. İnternet bağlantınızı kontrol edin.'
        };
      } else {
        networkError = {
          type: 'UNKNOWN_ERROR',
          message: error.message || 'Bilinmeyen bir hata oluştu.'
        };
      }

      // Retry on network errors
      if (networkError.type === 'NETWORK_ERROR' && retries > 0) {
        logger.info(`Retrying query due to network error (${retries} attempts left)...`);
        await this.delay(this.calculateBackoffDelay(3 - retries));
        return this.query(table, query, { ...options, retries: retries - 1 });
      }

      return {
        data: fallbackData,
        error: networkError,
        success: false
      };
    }
  }

  /**
   * Enhanced insert with error handling
   */
  async insert<T>(
    table: string,
    data: any,
    options: SupabaseQueryOptions = {}
  ): Promise<SupabaseResponse<T>> {
    const { retries = 3 } = options;

    try {
      const { data: result, error } = await supabase
        .from(table)
        .insert(data)
        .select()
        .single();

      if (error) {
        logger.error('Supabase insert error:', error);
        
        const networkError: NetworkError = {
          type: this.determineErrorType(error),
          message: error.message,
          details: error
        };

        if (this.shouldRetry(error) && retries > 0) {
          await this.delay(1000);
          return this.insert(table, data, { ...options, retries: retries - 1 });
        }

        return {
          data: null,
          error: networkError,
          success: false
        };
      }

      return {
        data: result as T,
        error: null,
        success: true
      };

    } catch (error: any) {
      logger.error('Supabase insert service error:', error);

      const networkError: NetworkError = {
        type: 'UNKNOWN_ERROR',
        message: error.message || 'Veri ekleme işlemi başarısız oldu.'
      };

      return {
        data: null,
        error: networkError,
        success: false
      };
    }
  }

  /**
   * Enhanced update with error handling
   */
  async update<T>(
    table: string,
    data: any,
    filter: any,
    options: SupabaseQueryOptions = {}
  ): Promise<SupabaseResponse<T>> {
    const { retries = 3 } = options;

    try {
      const { data: result, error } = await supabase
        .from(table)
        .update(data)
        .match(filter)
        .select()
        .single();

      if (error) {
        logger.error('Supabase update error:', error);
        
        const networkError: NetworkError = {
          type: this.determineErrorType(error),
          message: error.message,
          details: error
        };

        if (this.shouldRetry(error) && retries > 0) {
          await this.delay(1000);
          return this.update(table, data, filter, { ...options, retries: retries - 1 });
        }

        return {
          data: null,
          error: networkError,
          success: false
        };
      }

      return {
        data: result as T,
        error: null,
        success: true
      };

    } catch (error: any) {
      logger.error('Supabase update service error:', error);

      const networkError: NetworkError = {
        type: 'UNKNOWN_ERROR',
        message: error.message || 'Veri güncelleme işlemi başarısız oldu.'
      };

      return {
        data: null,
        error: networkError,
        success: false
      };
    }
  }

  /**
   * Enhanced delete with error handling
   */
  async delete<T>(
    table: string,
    filter: any,
    options: SupabaseQueryOptions = {}
  ): Promise<SupabaseResponse<T>> {
    const { retries = 3 } = options;

    try {
      const { data: result, error } = await supabase
        .from(table)
        .delete()
        .match(filter)
        .select()
        .single();

      if (error) {
        logger.error('Supabase delete error:', error);
        
        const networkError: NetworkError = {
          type: this.determineErrorType(error),
          message: error.message,
          details: error
        };

        if (this.shouldRetry(error) && retries > 0) {
          await this.delay(1000);
          return this.delete(table, filter, { ...options, retries: retries - 1 });
        }

        return {
          data: null,
          error: networkError,
          success: false
        };
      }

      return {
        data: result as T,
        error: null,
        success: true
      };

    } catch (error: any) {
      logger.error('Supabase delete service error:', error);

      const networkError: NetworkError = {
        type: 'UNKNOWN_ERROR',
        message: error.message || 'Veri silme işlemi başarısız oldu.'
      };

      return {
        data: null,
        error: networkError,
        success: false
      };
    }
  }

  /**
   * Test Supabase connection
   */
  async testConnection(): Promise<{ connected: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('_supabase_migrations')
        .select('*')
        .limit(1);

      if (error) {
        // This is expected if migrations table doesn't exist
        // Try a different approach
        const { error: healthError } = await supabase
          .rpc('version');

        if (healthError) {
          return {
            connected: false,
            error: healthError.message
          };
        }

        return { connected: true };
      }

      return { connected: true };
    } catch (error: any) {
      return {
        connected: false,
        error: error.message || 'Bağlantı testi başarısız'
      };
    }
  }

  /**
   * Get network diagnostics
   */
  async getDiagnostics() {
    return this.networkManager.getDiagnostics();
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
    if (code === 'PGRST301' || message.includes('unauthorized')) {
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
    if (message.includes('network') || 
        message.includes('timeout') || 
        message.includes('fetch') ||
        code.startsWith('5')) {
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
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Export singleton instance
export const enhancedSupabase = EnhancedSupabaseService.getInstance();

export default EnhancedSupabaseService;
