/**
 * Enhanced Error Handling Utilities for Kafkasder Management Panel
 * Provides comprehensive error handling, logging, and user-friendly error messages
 */

import { toast } from 'sonner';

import { logger } from './logging/logger';
// Error types for better categorization
export enum ErrorType {
  NETWORK = 'NETWORK',
  VALIDATION = 'VALIDATION',
  AUTHENTICATION = 'AUTHENTICATION',
  AUTHORIZATION = 'AUTHORIZATION',
  NOT_FOUND = 'NOT_FOUND',
  SERVER = 'SERVER',
  CLIENT = 'CLIENT',
  UNKNOWN = 'UNKNOWN',
}

// Error severity levels
export enum ErrorSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

// Custom error interface
/**
 * AppError Interface
 * 
 * @interface AppError
 */
export interface AppError {
  type: ErrorType;
  severity: ErrorSeverity;
  message: string;
  code?: string | number;
  details?: Record<string, unknown>;
  timestamp: Date;
  stack?: string;
  userMessage?: string;
  actionRequired?: boolean;
}

// Error context for better debugging
/**
 * ErrorContext Interface
 * 
 * @interface ErrorContext
 */
export interface ErrorContext {
  userId?: string;
  sessionId?: string;
  component?: string;
  action?: string;
  url?: string;
  userAgent?: string;
  timestamp: Date;
}

/**
 * Custom Error class for application-specific errors
 */
/**
 * AppErrorClass Service
 * 
 * Service class for handling apperrorclass operations
 * 
 * @class AppErrorClass
 */
export class AppErrorClass extends Error implements AppError {
  public readonly type: ErrorType;
  public readonly severity: ErrorSeverity;
  public readonly code?: string | number;
  public readonly details?: Record<string, unknown>;
  public readonly timestamp: Date;
  public readonly userMessage?: string;
  public readonly actionRequired?: boolean;

  constructor(
    type: ErrorType,
    message: string,
    severity: ErrorSeverity = ErrorSeverity.MEDIUM,
    options: {
      code?: string | number;
      details?: Record<string, unknown>;
      userMessage?: string;
      actionRequired?: boolean;
    } = {}
  ) {
    super(message);
    this.name = 'AppError';
    this.type = type;
    this.severity = severity;
    this.code = options.code;
    this.details = options.details;
    this.timestamp = new Date();
    this.userMessage = options.userMessage;
    this.actionRequired = options.actionRequired;

    // Maintain proper stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AppErrorClass);
    }
  }
}

/**
 * Error handler class for centralized error management
 */
/**
 * ErrorHandler Service
 * 
 * Service class for handling errorhandler operations
 * 
 * @class ErrorHandler
 */
export class ErrorHandler {
  private static instance: ErrorHandler;
  private errorLog: AppError[] = [];
  private readonly maxLogSize = 100;

  private constructor() {}

  public static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  /**
   * Handle and process errors
   */
  public handleError(
    error: Error | AppError,
    context?: ErrorContext
  ): AppError {
    const appError = this.normalizeError(error, context);
    this.logError(appError);
    this.notifyUser(appError);
    this.reportError(appError, context);
    return appError;
  }

  /**
   * Normalize different error types to AppError
   */
  private normalizeError(
    error: Error | AppError,
    context?: ErrorContext
  ): AppError {
    if (error instanceof AppErrorClass) {
      return error;
    }

    // Determine error type based on error properties
    const type = this.determineErrorType(error);
    const severity = this.determineErrorSeverity(error, type);
    const userMessage = this.generateUserMessage(error, type);

    return {
      type,
      severity,
      message: error.message,
      code: (error as any).code || (error as any).status,
      details: {
        name: error.name,
        stack: error.stack,
        ...context,
      },
      timestamp: new Date(),
      userMessage,
      actionRequired: severity === ErrorSeverity.HIGH || severity === ErrorSeverity.CRITICAL,
    };
  }

  /**
   * Determine error type from error object
   */
  private determineErrorType(error: Error): ErrorType {
    const message = error.message.toLowerCase();
    const name = error.name.toLowerCase();

    if (name.includes('network') || message.includes('fetch') || message.includes('network')) {
      return ErrorType.NETWORK;
    }
    if (name.includes('validation') || message.includes('validation')) {
      return ErrorType.VALIDATION;
    }
    if (name.includes('auth') || message.includes('unauthorized')) {
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
  private determineErrorSeverity(error: Error, type: ErrorType): ErrorSeverity {
    // Critical errors
    if (type === ErrorType.SERVER || type === ErrorType.AUTHENTICATION) {
      return ErrorSeverity.CRITICAL;
    }

    // High severity errors
    if (type === ErrorType.NETWORK || type === ErrorType.AUTHORIZATION) {
      return ErrorSeverity.HIGH;
    }

    // Medium severity errors
    if (type === ErrorType.VALIDATION || type === ErrorType.NOT_FOUND) {
      return ErrorSeverity.MEDIUM;
    }

    return ErrorSeverity.LOW;
  }

  /**
   * Generate user-friendly error messages
   */
  private generateUserMessage(error: Error, type: ErrorType): string {
    const messages = {
      [ErrorType.NETWORK]: 'Bağlantı hatası. Lütfen internet bağlantınızı kontrol edin.',
      [ErrorType.VALIDATION]: 'Girilen bilgilerde hata var. Lütfen kontrol edin.',
      [ErrorType.AUTHENTICATION]: 'Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.',
      [ErrorType.AUTHORIZATION]: 'Bu işlem için yetkiniz bulunmuyor.',
      [ErrorType.NOT_FOUND]: 'Aradığınız kayıt bulunamadı.',
      [ErrorType.SERVER]: 'Sunucu hatası. Lütfen daha sonra tekrar deneyin.',
      [ErrorType.CLIENT]: 'Bir hata oluştu. Lütfen sayfayı yenileyin.',
      [ErrorType.UNKNOWN]: 'Beklenmeyen bir hata oluştu.',
    };

    return messages[type] ?? messages[ErrorType.UNKNOWN];
  }

  /**
   * Log error to internal log
   */
  private logError(error: AppError): void {
    this.errorLog.unshift(error);
    
    // Keep log size manageable
    if (this.errorLog.length > this.maxLogSize) {
      this.errorLog = this.errorLog.slice(0, this.maxLogSize);
    }

    // Logging for development
    if (import.meta.env.DEV) {
      logger.group(`🚨 ${error.severity} Error: ${error.type}`);
      logger.error('Message:', error.message);
      logger.error('User Message:', error.userMessage);
      logger.error('Details:', error.details);
      logger.error('Stack:', error.stack);
      logger.groupEnd();
    }
  }

  /**
   * Notify user about error
   */
  private notifyUser(error: AppError): void {
    if (!error.userMessage) return;

    const toastOptions = {
      duration: error.severity === ErrorSeverity.CRITICAL ? 0 : 5000,
      action: error.actionRequired ? {
        label: 'Yeniden Dene',
        onClick: () => { window.location.reload(); },
      } : undefined,
    };

    switch (error.severity) {
      case ErrorSeverity.CRITICAL:
        toast.error(error.userMessage, toastOptions);
        break;
      case ErrorSeverity.HIGH:
        toast.error(error.userMessage, toastOptions);
        break;
      case ErrorSeverity.MEDIUM:
        toast.warning(error.userMessage, toastOptions);
        break;
      case ErrorSeverity.LOW:
        toast.info(error.userMessage, toastOptions);
        break;
    }
  }

  /**
   * Report error to external services (external error tracking services)
   */
  private reportError(error: AppError, context?: ErrorContext): void {
    // Only report high severity errors in production
    if (import.meta.env.PROD &&
        (error.severity === ErrorSeverity.HIGH || error.severity === ErrorSeverity.CRITICAL)) {

      // External error reporting can be configured here
      // Currently no external error tracking service is configured
    }
  }

  /**
   * Get error log for debugging
   */
  public getErrorLog(): AppError[] {
    return [...this.errorLog];
  }

  /**
   * Clear error log
   */
  public clearErrorLog(): void {
    this.errorLog = [];
  }

  /**
   * Get error statistics
   */
  public getErrorStats(): Record<string, number> {
    const stats: Record<string, number> = {};
    
    this.errorLog.forEach(error => {
      const key = `${error.type}_${error.severity}`;
      stats[key] = (stats[key] ?? 0) + 1;
    });

    return stats;
  }
}

/**
 * Utility functions for common error scenarios
 */
export const ErrorUtils = {
  /**
   * Create a network error
   */
  networkError: (message: string, details?: Record<string, unknown>): AppErrorClass => {
    return new AppErrorClass(
      ErrorType.NETWORK,
      message,
      ErrorSeverity.HIGH,
      { details, userMessage: 'Bağlantı hatası. Lütfen internet bağlantınızı kontrol edin.' }
    );
  },

  /**
   * Create a validation error
   */
  validationError: (message: string, details?: Record<string, unknown>): AppErrorClass => {
    return new AppErrorClass(
      ErrorType.VALIDATION,
      message,
      ErrorSeverity.MEDIUM,
      { details, userMessage: 'Girilen bilgilerde hata var. Lütfen kontrol edin.' }
    );
  },

  /**
   * Create an authentication error
   */
  authError: (message: string, details?: Record<string, unknown>): AppErrorClass => {
    return new AppErrorClass(
      ErrorType.AUTHENTICATION,
      message,
      ErrorSeverity.CRITICAL,
      { details, userMessage: 'Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.', actionRequired: true }
    );
  },

  /**
   * Create a server error
   */
  serverError: (message: string, details?: Record<string, unknown>): AppErrorClass => {
    return new AppErrorClass(
      ErrorType.SERVER,
      message,
      ErrorSeverity.CRITICAL,
      { details, userMessage: 'Sunucu hatası. Lütfen daha sonra tekrar deneyin.' }
    );
  },

  /**
   * Wrap async functions with error handling
   */
  async withErrorHandling<T>(
    fn: () => Promise<T>,
    _context?: ErrorContext
  ): Promise<T | null> {
    try {
      return await fn();
    } catch (error) {
      const errorHandler = ErrorHandler.getInstance();
      errorHandler.handleError(error as Error, context);
      return null;
    }
  },

  /**
   * Wrap sync functions with error handling
   */
  withSyncErrorHandling<T>(
    fn: () => T,
    context?: ErrorContext
  ): T | null {
    try {
      return fn();
    } catch (error) {
      const errorHandler = ErrorHandler.getInstance();
      errorHandler.handleError(error as Error, context);
      return null;
    }
  },
};

// Export singleton instance
export const errorHandler = ErrorHandler.getInstance();

// Default export
export default ErrorHandler;
