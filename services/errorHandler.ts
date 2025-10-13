/**
 * @fileoverview errorHandler Module - Application module
 *
 * @author Dernek Yönetim Sistemi Team
 * @version 1.0.0
 */

// Centralized Error Handling for Services

import { ServiceError, ServiceErrorCode, type ApiResponse } from './config';

import { logger } from '../lib/logging/logger';

// Utility functions for error handling
export function handleServiceError<T>(error: unknown, context: string): ApiResponse<T> {
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

export async function safeExecute<T>(
  operation: () => Promise<T>,
  context: string
): Promise<ApiResponse<T>> {
  try {
    const result = await operation();
    return {
      data: result,
      error: null,
    };
  } catch (error) {
    return handleServiceError<T>(error, context);
  }
}

export function createValidationError(message: string, field?: string): ServiceError {
  return new ServiceError(ServiceErrorCode.VALIDATION_ERROR, message, { field });
}

export function createNotFoundError(resource: string, id: string): ServiceError {
  return new ServiceError(ServiceErrorCode.NOT_FOUND, `${resource} with ID ${id} not found`);
}

export function createDuplicateError(resource: string, field: string): ServiceError {
  return new ServiceError(
    ServiceErrorCode.DUPLICATE_ENTRY,
    `${resource} with this ${field} already exists`
  );
}

// Helper object for backward compatibility
export const errorHandler = {
  handleServiceError,
  safeExecute,
  createValidationError,
  createNotFoundError,
  createDuplicateError,
};

export default errorHandler;
