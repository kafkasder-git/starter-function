/**
 * @fileoverview errorHandler Module - Application module
 * 
 * @author Dernek Yönetim Sistemi Team
 * @version 1.0.0
 */

// Centralized Error Handling for Services

import type { ApiResponse } from './config';
import { ServiceError, ServiceErrorCode } from './config';

import { logger } from '../lib/logging/logger';
/**
 * ErrorHandler Service
 * 
 * Service class for handling errorhandler operations
 * 
 * @class ErrorHandler
 */
export class ErrorHandler {
  static handleServiceError<T>(error: unknown, context: string): ApiResponse<T> {
    logger.error(`Service error in ${context}:`, error);

    if (error instanceof ServiceError) {
      return {
        data: null,
        error: error.message,
      };
    }

    if (error instanceof Error) {
      return {
        data: null,
        error: error.message,
      };
    }

    return {
      data: null,
      error: 'An unexpected error occurred',
    };
  }

  static async safeExecute<T>(
    operation: () => Promise<T>,
    context: string,
  ): Promise<ApiResponse<T>> {
    try {
      const result = await operation();
      return {
        data: result,
        error: null,
      };
    } catch (error) {
      return this.handleServiceError<T>(error, context);
    }
  }

  static createValidationError(message: string, field?: string): ServiceError {
    return new ServiceError(ServiceErrorCode.VALIDATION_ERROR, message, { field });
  }

  static createNotFoundError(resource: string, id: string): ServiceError {
    return new ServiceError(ServiceErrorCode.NOT_FOUND, `${resource} with ID ${id} not found`);
  }

  static createDuplicateError(resource: string, field: string): ServiceError {
    return new ServiceError(
      ServiceErrorCode.DUPLICATE_ENTRY,
      `${resource} with this ${field} already exists`,
    );
  }
}
