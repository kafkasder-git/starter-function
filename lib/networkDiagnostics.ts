/**
 * @fileoverview Network Diagnostics and Error Handling
 * @description Comprehensive network error diagnosis and recovery mechanisms
 */

import { logger } from './logging/logger';

export interface NetworkError {
  type:
    | 'NETWORK_ERROR'
    | 'CORS_ERROR'
    | 'TIMEOUT_ERROR'
    | 'AUTH_ERROR'
    | 'SERVER_ERROR'
    | 'UNKNOWN_ERROR';
  message: string;
  status?: number;
  statusText?: string;
  url?: string;
  details?: any;
}

export interface NetworkDiagnostics {
  isOnline: boolean;
  canReachAppwrite: boolean;
  canReachInternet: boolean;
  lastError?: NetworkError;
  connectionQuality: 'excellent' | 'good' | 'poor' | 'offline';
  appwriteStatus?: 'connected' | 'disconnected' | 'unknown';
  lastChecked?: Date;
  latency?: number | null;
  error?: string | null;
}

/**
 * Enhanced fetch wrapper with comprehensive error handling
 */
export class NetworkManager {
  private static instance: NetworkManager;
  private diagnostics: NetworkDiagnostics = {
    isOnline: true,
    canReachAppwrite: false,
    canReachInternet: false,
    connectionQuality: 'offline',
  };

  static getInstance(): NetworkManager {
    if (!NetworkManager.instance) {
      NetworkManager.instance = new NetworkManager();
    }
    return NetworkManager.instance;
  }

  /**
   * Enhanced fetch with retry logic and error handling
   */
  async fetchWithRetry(
    url: string,
    options: RequestInit = {},
    maxRetries: number = 3
  ): Promise<Response> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        // Add timeout to prevent hanging requests
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

        const response = await fetch(url, {
          ...options,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        // Check if response is ok
        if (!response.ok) {
          const error = this.createNetworkError(response, url);
          this.diagnostics.lastError = error;

          // Don't retry on client errors (4xx)
          if (response.status >= 400 && response.status < 500) {
            throw error;
          }

          // Retry on server errors (5xx) or network issues
          if (attempt === maxRetries) {
            throw error;
          }

          logger.warn(`Request failed (attempt ${attempt}/${maxRetries}):`, error);
          await this.delay(this.calculateBackoffDelay(attempt));
          continue;
        }

        // Update diagnostics on success
        this.updateDiagnostics(true, url);
        return response;
      } catch (error: any) {
        lastError = error;

        // Don't retry on AbortError (timeout)
        if (error.name === 'AbortError') {
          const timeoutError: NetworkError = {
            type: 'TIMEOUT_ERROR',
            message: 'Request timeout - the server took too long to respond',
            url,
          };
          this.diagnostics.lastError = timeoutError;
          throw timeoutError;
        }

        // Don't retry on network errors for the last attempt
        if (attempt === maxRetries) {
          const networkError = this.createNetworkErrorFromException(error, url);
          this.diagnostics.lastError = networkError;
          throw networkError;
        }

        logger.warn(`Network error (attempt ${attempt}/${maxRetries}):`, error);
        await this.delay(this.calculateBackoffDelay(attempt));
      }
    }

    // This should never be reached, but just in case
    throw lastError || new Error('Unknown network error');
  }

  /**
   * Test network connectivity
   */
  async testConnectivity(): Promise<NetworkDiagnostics> {
    const diagnostics: NetworkDiagnostics = {
      isOnline: navigator.onLine,
      canReachAppwrite: false,
      canReachInternet: false,
      connectionQuality: 'offline',
    };

    if (!diagnostics.isOnline) {
      this.diagnostics = diagnostics;
      return diagnostics;
    }

    // Test internet connectivity with multiple fallback endpoints
    const internetTestUrls = [
      'https://httpbin.org/status/200',
      'https://www.google.com/favicon.ico',
      'https://api.github.com/zen',
    ];

    for (const url of internetTestUrls) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

        await fetch(url, {
          method: 'HEAD',
          mode: 'no-cors',
          cache: 'no-cache',
          signal: controller.signal,
        });

        clearTimeout(timeoutId);
        diagnostics.canReachInternet = true;
        logger.info(`Internet connectivity test successful via ${url}`);
        break; // Exit loop on first success
      } catch (error) {
        logger.warn(`Internet connectivity test failed for ${url}:`, error);
        continue; // Try next URL
      }
    }

    // Test Appwrite connectivity
    try {
      const appwriteEndpoint = import.meta.env.VITE_APPWRITE_ENDPOINT;
      if (appwriteEndpoint) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

        try {
          const projectId = import.meta.env.VITE_APPWRITE_PROJECT_ID || '';
          const headers: Record<string, string> = {};
          if (projectId) {
            headers['X-Appwrite-Project'] = projectId;
          }

          await fetch(`${appwriteEndpoint}/health`, {
            method: 'HEAD',
            headers,
            cache: 'no-cache',
            signal: controller.signal,
          });
        } catch (error) {
          // Health endpoint requires authentication, ignore 401 errors
          if (error instanceof Error && error.message.includes('401')) {
            logger.debug('Health endpoint requires authentication, skipping');
            return {
              isOnline: true,
              canReachAppwrite: false,
              canReachInternet: true,
              connectionQuality: 'good',
              appwriteStatus: 'unknown',
              lastChecked: new Date(),
              latency: null,
              error: null,
            };
          }
          throw error;
        }

        clearTimeout(timeoutId);
        diagnostics.canReachAppwrite = true;
        logger.info('Appwrite connectivity test successful');
      }
    } catch (error) {
      logger.warn('Appwrite connectivity test failed:', error);
    }

    // Determine connection quality based on what we can reach
    if (diagnostics.canReachAppwrite && diagnostics.canReachInternet) {
      diagnostics.connectionQuality = 'excellent';
    } else if (diagnostics.canReachAppwrite) {
      diagnostics.connectionQuality = 'good'; // Appwrite is more important than general internet
    } else if (diagnostics.canReachInternet) {
      diagnostics.connectionQuality = 'poor';
    } else if (diagnostics.isOnline) {
      diagnostics.connectionQuality = 'offline'; // Browser says online but can't reach anything
    }

    this.diagnostics = diagnostics;
    return diagnostics;
  }

  /**
   * Get current diagnostics
   */
  getDiagnostics(): NetworkDiagnostics {
    return { ...this.diagnostics };
  }

  /**
   * Create network error from response
   */
  private createNetworkError(response: Response, url: string): NetworkError {
    let type: NetworkError['type'] = 'UNKNOWN_ERROR';
    let message = response.statusText || 'Unknown error';

    if (response.status === 0) {
      type = 'NETWORK_ERROR';
      message = 'Network error - check your internet connection';
    } else if (response.status >= 400 && response.status < 500) {
      if (response.status === 401 || response.status === 403) {
        type = 'AUTH_ERROR';
        message = 'Authentication failed - please log in again';
      } else {
        type = 'SERVER_ERROR';
        message = `Client error: ${response.status} ${response.statusText}`;
      }
    } else if (response.status >= 500) {
      type = 'SERVER_ERROR';
      message = `Server error: ${response.status} ${response.statusText}`;
    }

    return {
      type,
      message,
      status: response.status,
      statusText: response.statusText,
      url,
    };
  }

  /**
   * Create network error from exception
   */
  private createNetworkErrorFromException(error: Error, url: string): NetworkError {
    let type: NetworkError['type'] = 'NETWORK_ERROR';
    let message = error.message;

    if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
      type = 'NETWORK_ERROR';
      message =
        'Network error - unable to reach the server. Please check your internet connection and try again.';
    } else if (error.message.includes('CORS') || error.message.includes('cross-origin')) {
      type = 'CORS_ERROR';
      message = 'Cross-origin request blocked - this might be a configuration issue';
    } else if (error.message.includes('timeout') || error.name === 'AbortError') {
      type = 'TIMEOUT_ERROR';
      message = 'Request timeout - the server took too long to respond';
    } else if (error.message.includes('TypeError') && error.message.includes('fetch')) {
      type = 'NETWORK_ERROR';
      message = 'Network request failed - please check your connection and try again';
    } else if (
      error.message.includes('ERR_NETWORK') ||
      error.message.includes('ERR_INTERNET_DISCONNECTED')
    ) {
      type = 'NETWORK_ERROR';
      message = 'No internet connection - please check your network settings';
    } else if (error.message.includes('ERR_CONNECTION_REFUSED')) {
      type = 'SERVER_ERROR';
      message = 'Connection refused - the server is not accepting connections';
    } else if (error.message.includes('ERR_CONNECTION_TIMED_OUT')) {
      type = 'TIMEOUT_ERROR';
      message = 'Connection timeout - the server is not responding';
    }

    return {
      type,
      message,
      url,
      details: error,
    };
  }

  /**
   * Calculate backoff delay for retries
   */
  private calculateBackoffDelay(attempt: number): number {
    return Math.min(1000 * Math.pow(2, attempt - 1), 5000); // Exponential backoff, max 5 seconds
  }

  /**
   * Delay utility
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Update diagnostics on successful request
   */
  private updateDiagnostics(success: boolean, url: string): void {
    if (success) {
      this.diagnostics.isOnline = navigator.onLine;
      if (url.includes('appwrite')) {
        this.diagnostics.canReachAppwrite = true;
      }
      this.diagnostics.canReachInternet = true;
      this.diagnostics.connectionQuality = 'excellent';
      this.diagnostics.lastError = undefined;
    }
  }
}

/**
 * Get user-friendly error message
 */
export function getUserFriendlyErrorMessage(error: NetworkError): string {
  const messages = {
    NETWORK_ERROR: 'Bağlantı hatası. İnternet bağlantınızı kontrol edin ve tekrar deneyin.',
    CORS_ERROR: 'Güvenlik nedeniyle istek engellendi. Lütfen daha sonra tekrar deneyin.',
    TIMEOUT_ERROR: 'Sunucu yanıt vermiyor. Lütfen daha sonra tekrar deneyin.',
    AUTH_ERROR: 'Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.',
    SERVER_ERROR: 'Sunucu hatası oluştu. Lütfen daha sonra tekrar deneyin.',
    UNKNOWN_ERROR: 'Bilinmeyen bir hata oluştu. Lütfen daha sonra tekrar deneyin.',
  };

  return messages[error.type] || messages.UNKNOWN_ERROR;
}

/**
 * Check if error is retryable
 */
export function isRetryableError(error: NetworkError): boolean {
  return ['NETWORK_ERROR', 'TIMEOUT_ERROR', 'SERVER_ERROR'].includes(error.type);
}

export default NetworkManager;
