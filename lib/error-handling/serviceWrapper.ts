/**
 * @fileoverview Service Wrapper
 * @description Wrapper utilities for service calls with error handling and retry logic
 */

import { globalErrorHandler, ErrorType, ErrorSeverity } from './globalErrorHandler';

/**
 * Retry configuration
 */
interface RetryConfig {
  maxRetries: number;
  delay: number;
  backoffMultiplier: number;
  retryCondition?: (error: any) => boolean;
}

/**
 * Service call options
 */
interface ServiceCallOptions {
  retry?: RetryConfig;
  timeout?: number;
  enableLogging?: boolean;
  context?: Record<string, any>;
}

/**
 * Service call result
 */
interface ServiceCallResult<T> {
  data?: T;
  error?: Error;
  success: boolean;
  retryCount: number;
  duration: number;
}

/**
 * Default retry configuration
 */
const defaultRetryConfig: RetryConfig = {
  maxRetries: 3,
  delay: 1000,
  backoffMultiplier: 2,
  retryCondition: (error) => {
    // Retry on network errors and 5xx server errors
    return error.name === 'NetworkError' || (error.status >= 500 && error.status < 600);
  },
};

/**
 * Wrap service calls with error handling and retry logic
 */
export async function withServiceWrapper<T>(
  serviceCall: () => Promise<T>,
  options: ServiceCallOptions = {}
): Promise<ServiceCallResult<T>> {
  const startTime = Date.now();
  let lastError: Error | undefined;
  let retryCount = 0;

  const {
    retry = defaultRetryConfig,
    timeout = 30000,
    enableLogging = true,
    context = {},
  } = options;

  // Create timeout promise
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => {
      reject(new Error(`Service call timed out after ${timeout}ms`));
    }, timeout);
  });

  while (retryCount <= retry.maxRetries) {
    try {
      if (enableLogging) {
        console.log(`Service call attempt ${retryCount + 1}/${retry.maxRetries + 1}`, context);
      }

      // Race between service call and timeout
      const result = await Promise.race([serviceCall(), timeoutPromise]);

      const duration = Date.now() - startTime;

      if (enableLogging) {
        console.log(`Service call succeeded in ${duration}ms`, context);
      }

      return {
        data: result,
        success: true,
        retryCount,
        duration,
      };
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      retryCount++;

      // Log error
      if (enableLogging) {
        console.error(`Service call failed (attempt ${retryCount}):`, lastError);
      }

      // Check if we should retry
      const shouldRetry =
        retryCount <= retry.maxRetries &&
        (!retry.retryCondition || retry.retryCondition(lastError));

      if (!shouldRetry) {
        break;
      }

      // Calculate delay with exponential backoff
      const delay = retry.delay * Math.pow(retry.backoffMultiplier, retryCount - 1);

      if (enableLogging) {
        console.log(`Retrying in ${delay}ms...`);
      }

      // Wait before retry
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  const duration = Date.now() - startTime;

  // Report final error
  globalErrorHandler.reportManualError(lastError, {
    ...context,
    retryCount,
    duration,
    serviceCall: 'serviceWrapper',
  });

  return {
    error: lastError,
    success: false,
    retryCount,
    duration,
  };
}

/**
 * Wrap async service functions with error handling
 */
export function wrapService<T extends (...args: any[]) => Promise<any>>(
  serviceFunction: T,
  options: ServiceCallOptions = {}
): T {
  return (async (...args: Parameters<T>) => {
    const result = await withServiceWrapper(() => serviceFunction(...args), {
      ...options,
      context: {
        ...options.context,
        functionName: serviceFunction.name,
        args: args.length > 0 ? 'provided' : 'none',
      },
    });

    if (!result.success && result.error) {
      throw result.error;
    }

    return result.data;
  }) as T;
}

/**
 * Batch service calls with error handling
 */
export async function withBatchWrapper<T>(
  serviceCalls: Array<() => Promise<T>>,
  options: ServiceCallOptions = {}
): Promise<ServiceCallResult<T[]>> {
  const startTime = Date.now();
  const results: T[] = [];
  const errors: Error[] = [];

  const { enableLogging = true, context = {} } = options;

  if (enableLogging) {
    console.log(`Starting batch of ${serviceCalls.length} service calls`, context);
  }

  // Execute all calls concurrently
  const promises = serviceCalls.map((call, index) =>
    withServiceWrapper(call, {
      ...options,
      context: {
        ...context,
        batchIndex: index,
        totalCalls: serviceCalls.length,
      },
    })
  );

  const callResults = await Promise.allSettled(promises);

  callResults.forEach((result, index) => {
    if (result.status === 'fulfilled') {
      if (result.value.success && result.value.data !== undefined) {
        results[index] = result.value.data;
      } else if (result.value.error) {
        errors[index] = result.value.error;
      }
    } else {
      errors[index] = result.reason;
    }
  });

  const duration = Date.now() - startTime;
  const successCount = results.length;
  const errorCount = errors.length;

  if (enableLogging) {
    console.log(
      `Batch completed: ${successCount} successful, ${errorCount} failed in ${duration}ms`,
      context
    );
  }

  // Report batch errors if any
  if (errorCount > 0) {
    globalErrorHandler.reportManualError(new Error(`Batch operation had ${errorCount} failures`), {
      ...context,
      successCount,
      errorCount,
      duration,
      errors: errors.map((e) => e.message),
    });
  }

  return {
    data: results,
    success: errorCount === 0,
    retryCount: 0,
    duration,
    error: errorCount > 0 ? new Error(`${errorCount} calls failed`) : undefined,
  } as ServiceCallResult<T[]>;
}

/**
 * Create a circuit breaker for service calls
 */
export class CircuitBreaker {
  private failureCount = 0;
  private lastFailureTime = 0;
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';

  constructor(
    private threshold: number = 5,
    private timeout: number = 60000, // 1 minute
    private resetTimeout: number = 30000 // 30 seconds
  ) {}

  async execute<T>(serviceCall: () => Promise<T>): Promise<T> {
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailureTime > this.resetTimeout) {
        this.state = 'HALF_OPEN';
      } else {
        throw new Error('Circuit breaker is OPEN - service unavailable');
      }
    }

    try {
      const result = await serviceCall();

      if (this.state === 'HALF_OPEN') {
        this.state = 'CLOSED';
        this.failureCount = 0;
      }

      return result;
    } catch (error) {
      this.failureCount++;
      this.lastFailureTime = Date.now();

      if (this.failureCount >= this.threshold) {
        this.state = 'OPEN';
      }

      throw error;
    }
  }

  getState() {
    return {
      state: this.state,
      failureCount: this.failureCount,
      lastFailureTime: this.lastFailureTime,
    };
  }

  reset() {
    this.state = 'CLOSED';
    this.failureCount = 0;
    this.lastFailureTime = 0;
  }
}

/**
 * Create a service wrapper with circuit breaker
 */
export function withCircuitBreaker<T extends (...args: any[]) => Promise<any>>(
  serviceFunction: T,
  breakerConfig?: { threshold?: number; timeout?: number; resetTimeout?: number }
): T {
  const breaker = new CircuitBreaker(
    breakerConfig?.threshold,
    breakerConfig?.timeout,
    breakerConfig?.resetTimeout
  );

  return (async (...args: Parameters<T>) => {
    return breaker.execute(() => serviceFunction(...args));
  }) as T;
}

/**
 * Utility function to create service wrappers with common configurations
 */
export const serviceWrappers = {
  /**
   * Network service wrapper with retry logic
   */
  network: <T extends (...args: any[]) => Promise<any>>(serviceFunction: T) =>
    wrapService(serviceFunction, {
      retry: {
        maxRetries: 3,
        delay: 1000,
        backoffMultiplier: 2,
        retryCondition: (error) => error.name === 'NetworkError',
      },
      timeout: 30000,
      enableLogging: true,
    }),

  /**
   * Database service wrapper with circuit breaker
   */
  database: <T extends (...args: any[]) => Promise<any>>(serviceFunction: T) =>
    withCircuitBreaker(
      wrapService(serviceFunction, {
        retry: {
          maxRetries: 2,
          delay: 500,
          backoffMultiplier: 1.5,
        },
        timeout: 10000,
        enableLogging: true,
      }),
      { threshold: 5, timeout: 60000, resetTimeout: 30000 }
    ),

  /**
   * Critical service wrapper with extensive retry logic
   */
  critical: <T extends (...args: any[]) => Promise<any>>(serviceFunction: T) =>
    wrapService(serviceFunction, {
      retry: {
        maxRetries: 5,
        delay: 2000,
        backoffMultiplier: 2,
      },
      timeout: 60000,
      enableLogging: true,
    }),

  /**
   * Fast service wrapper with minimal retry
   */
  fast: <T extends (...args: any[]) => Promise<any>>(serviceFunction: T) =>
    wrapService(serviceFunction, {
      retry: {
        maxRetries: 1,
        delay: 100,
        backoffMultiplier: 1,
      },
      timeout: 5000,
      enableLogging: false,
    }),
};
