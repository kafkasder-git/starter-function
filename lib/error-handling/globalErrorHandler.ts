/**
 * @fileoverview Global Error Handler
 * @description Centralized error handling and reporting system
 */

import { logger } from '../logging/logger';

/**
 * Error types for better categorization
 */
export enum ErrorType {
  NETWORK = 'network',
  VALIDATION = 'validation',
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  NOT_FOUND = 'not_found',
  SERVER = 'server',
  CLIENT = 'client',
  UNKNOWN = 'unknown',
}

/**
 * Error severity levels
 */
export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

/**
 * Enhanced error interface
 */
export interface EnhancedError extends Error {
  type?: ErrorType;
  severity?: ErrorSeverity;
  code?: string;
  context?: Record<string, any>;
  timestamp?: string;
  userId?: string;
  sessionId?: string;
  userAgent?: string;
  url?: string;
}

/**
 * Error handler configuration
 */
interface ErrorHandlerConfig {
  enableReporting: boolean;
  enableUserNotifications: boolean;
  enableAutoRetry: boolean;
  maxRetries: number;
  retryDelay: number;
}

/**
 * Default error handler configuration
 */
const defaultConfig: ErrorHandlerConfig = {
  enableReporting: true,
  enableUserNotifications: true,
  enableAutoRetry: false,
  maxRetries: 3,
  retryDelay: 1000,
};

/**
 * Global error handler class
 */
class GlobalErrorHandler {
  private config: ErrorHandlerConfig;
  private errorCount: Map<string, number> = new Map();
  private retryQueue: Array<() => Promise<void>> = [];

  constructor(config: Partial<ErrorHandlerConfig> = {}) {
    this.config = { ...defaultConfig, ...config };
    this.initialize();
  }

  /**
   * Initialize global error handlers
   */
  private initialize(): void {
    if (typeof window !== 'undefined') {
      // Handle unhandled promise rejections
      window.addEventListener('unhandledrejection', this.handleUnhandledRejection.bind(this));
      
      // Handle JavaScript errors
      window.addEventListener('error', this.handleError.bind(this));
      
      // Handle React error boundaries
      window.addEventListener('react-error', this.handleReactError.bind(this));
    }
  }

  /**
   * Handle unhandled promise rejections
   */
  private handleUnhandledRejection(event: PromiseRejectionEvent): void {
    const error = this.enhanceError(event.reason);
    this.processError(error);
    event.preventDefault();
  }

  /**
   * Handle JavaScript errors
   */
  private handleError(event: ErrorEvent): void {
    const error = this.enhanceError(event.error || new Error(event.message));
    this.processError(error);
  }

  /**
   * Handle React error boundary errors
   */
  private handleReactError(event: CustomEvent): void {
    const error = this.enhanceError(event.detail?.error || new Error('React Error'));
    this.processError(error);
  }

  /**
   * Enhance error with additional context
   */
  private enhanceError(error: any): EnhancedError {
    const enhanced: EnhancedError = error instanceof Error ? error : new Error(String(error));
    
    // Add timestamp
    enhanced.timestamp = new Date().toISOString();
    
    // Add browser context
    if (typeof window !== 'undefined') {
      enhanced.userAgent = navigator.userAgent;
      enhanced.url = window.location.href;
    }
    
    // Add user context if available
    try {
      const userData = localStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
        enhanced.userId = user.id;
      }
    } catch (e) {
      // Ignore localStorage errors
    }
    
    // Determine error type and severity
    enhanced.type = this.determineErrorType(enhanced);
    enhanced.severity = this.determineErrorSeverity(enhanced);
    
    return enhanced;
  }

  /**
   * Determine error type based on error properties
   */
  private determineErrorType(error: EnhancedError): ErrorType {
    const message = error.message.toLowerCase();
    const stack = error.stack?.toLowerCase() || '';
    
    if (message.includes('network') || message.includes('fetch') || message.includes('timeout')) {
      return ErrorType.NETWORK;
    }
    
    if (message.includes('validation') || message.includes('invalid')) {
      return ErrorType.VALIDATION;
    }
    
    if (message.includes('unauthorized') || message.includes('authentication')) {
      return ErrorType.AUTHENTICATION;
    }
    
    if (message.includes('forbidden') || message.includes('permission')) {
      return ErrorType.AUTHORIZATION;
    }
    
    if (message.includes('not found') || message.includes('404')) {
      return ErrorType.NOT_FOUND;
    }
    
    if (message.includes('server') || message.includes('500')) {
      return ErrorType.SERVER;
    }
    
    return ErrorType.UNKNOWN;
  }

  /**
   * Determine error severity
   */
  private determineErrorSeverity(error: EnhancedError): ErrorSeverity {
    const type = error.type || ErrorType.UNKNOWN;
    
    switch (type) {
      case ErrorType.AUTHENTICATION:
      case ErrorType.AUTHORIZATION:
        return ErrorSeverity.HIGH;
      
      case ErrorType.SERVER:
        return ErrorSeverity.CRITICAL;
      
      case ErrorType.NETWORK:
        return ErrorSeverity.MEDIUM;
      
      case ErrorType.VALIDATION:
      case ErrorType.NOT_FOUND:
        return ErrorSeverity.LOW;
      
      default:
        return ErrorSeverity.MEDIUM;
    }
  }

  /**
   * Process error through the handling pipeline
   */
  private processError(error: EnhancedError): void {
    // Log error
    this.logError(error);
    
    // Report error if enabled
    if (this.config.enableReporting) {
      this.reportError(error);
    }
    
    // Show user notification if enabled
    if (this.config.enableUserNotifications) {
      this.showUserNotification(error);
    }
    
    // Handle auto-retry if enabled
    if (this.config.enableAutoRetry && this.shouldRetry(error)) {
      this.scheduleRetry(error);
    }
  }

  /**
   * Log error with appropriate level
   */
  private logError(error: EnhancedError): void {
    const logData = {
      message: error.message,
      type: error.type,
      severity: error.severity,
      code: error.code,
      context: error.context,
      timestamp: error.timestamp,
      userId: error.userId,
      url: error.url,
      stack: error.stack,
    };
    
    switch (error.severity) {
      case ErrorSeverity.CRITICAL:
        logger.error('Critical error:', logData);
        break;
      case ErrorSeverity.HIGH:
        logger.error('High severity error:', logData);
        break;
      case ErrorSeverity.MEDIUM:
        logger.warn('Medium severity error:', logData);
        break;
      case ErrorSeverity.LOW:
        logger.info('Low severity error:', logData);
        break;
      default:
        logger.error('Unknown severity error:', logData);
    }
  }

  /**
   * Report error to external service
   */
  private reportError(error: EnhancedError): void {
    // Implement error reporting to external service (e.g., Sentry, LogRocket)
    // For now, just log to console
    console.log('Reporting error:', {
      type: error.type,
      severity: error.severity,
      message: error.message,
      timestamp: error.timestamp,
    });
  }

  /**
   * Show user-friendly notification
   */
  private showUserNotification(error: EnhancedError): void {
    const message = this.getUserFriendlyMessage(error);
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `error-notification error-${error.severity}`;
    notification.innerHTML = `
      <div class="error-content">
        <span class="error-icon">⚠️</span>
        <span class="error-message">${message}</span>
        <button class="error-close" onclick="this.parentElement.parentElement.remove()">×</button>
      </div>
    `;
    
    // Add styles
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${this.getNotificationColor(error.severity)};
      color: white;
      padding: 12px 16px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 10000;
      max-width: 400px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 14px;
    `;
    
    // Add to DOM
    document.body.appendChild(notification);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 5000);
  }

  /**
   * Get user-friendly error message
   */
  private getUserFriendlyMessage(error: EnhancedError): string {
    switch (error.type) {
      case ErrorType.NETWORK:
        return 'Bağlantı hatası oluştu. Lütfen internet bağlantınızı kontrol edin.';
      
      case ErrorType.AUTHENTICATION:
        return 'Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.';
      
      case ErrorType.AUTHORIZATION:
        return 'Bu işlem için yetkiniz bulunmuyor.';
      
      case ErrorType.VALIDATION:
        return 'Girilen bilgilerde hata var. Lütfen kontrol edin.';
      
      case ErrorType.NOT_FOUND:
        return 'Aradığınız sayfa bulunamadı.';
      
      case ErrorType.SERVER:
        return 'Sunucu hatası oluştu. Lütfen daha sonra tekrar deneyin.';
      
      default:
        return 'Beklenmeyen bir hata oluştu. Lütfen sayfayı yenileyin.';
    }
  }

  /**
   * Get notification color based on severity
   */
  private getNotificationColor(severity?: ErrorSeverity): string {
    switch (severity) {
      case ErrorSeverity.CRITICAL:
        return '#dc2626'; // red-600
      case ErrorSeverity.HIGH:
        return '#ea580c'; // orange-600
      case ErrorSeverity.MEDIUM:
        return '#d97706'; // amber-600
      case ErrorSeverity.LOW:
        return '#059669'; // emerald-600
      default:
        return '#6b7280'; // gray-500
    }
  }

  /**
   * Determine if error should be retried
   */
  private shouldRetry(error: EnhancedError): boolean {
    return error.type === ErrorType.NETWORK && 
           (this.errorCount.get(error.message) || 0) < this.config.maxRetries;
  }

  /**
   * Schedule error retry
   */
  private scheduleRetry(error: EnhancedError): void {
    const retryFn = async () => {
      const count = this.errorCount.get(error.message) || 0;
      this.errorCount.set(error.message, count + 1);
      
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, this.config.retryDelay * count));
      
      // Implement retry logic here
      console.log('Retrying error:', error.message);
    };
    
    this.retryQueue.push(retryFn);
    retryFn();
  }

  /**
   * Manually report an error
   */
  public reportManualError(error: any, context?: Record<string, any>): void {
    const enhanced = this.enhanceError(error);
    if (context) {
      enhanced.context = { ...enhanced.context, ...context };
    }
    this.processError(enhanced);
  }

  /**
   * Update configuration
   */
  public updateConfig(newConfig: Partial<ErrorHandlerConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Get error statistics
   */
  public getErrorStats(): Record<string, number> {
    const stats: Record<string, number> = {};
    for (const [key, value] of this.errorCount.entries()) {
      stats[key] = value;
    }
    return stats;
  }

  /**
   * Clear error statistics
   */
  public clearErrorStats(): void {
    this.errorCount.clear();
    this.retryQueue = [];
  }
}

// Export singleton instance
export const globalErrorHandler = new GlobalErrorHandler();

// Export types and classes
export { GlobalErrorHandler, ErrorHandlerConfig };
