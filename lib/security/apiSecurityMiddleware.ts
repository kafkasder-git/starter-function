/**
 * @fileoverview apiSecurityMiddleware Module - Application module
 *
 * @author Dernek Yönetim Sistemi Team
 * @version 1.0.0
 */

import { ServiceError, ServiceErrorCode } from '../../services/config';
import { logger } from './logging/logger';
import { DEFAULT_SECURITY_CONFIG, type APISecurityConfig, APIVersionManager } from './apiSecurity';
import { RateLimiter } from './rateLimit';
import { InputSanitizer } from './sanitization';
import { SQLInjectionPrevention } from './sqlInjection';
import { CSRFTokenManager } from './csrf';
import { SecurityHeaders } from './headers';

// Request context interface
/**
 * SecurityContext Interface
 *
 * @interface SecurityContext
 */
export interface SecurityContext {
  userId?: string;
  sessionId: string;
  ipAddress: string;
  userAgent: string;
  endpoint: string;
  method: string;
  version: string;
  timestamp: number;
}

// Security middleware result
/**
 * SecurityResult Interface
 *
 * @interface SecurityResult
 */
export interface SecurityResult {
  allowed: boolean;
  error?: ServiceError;
  warnings?: string[];
  rateLimitInfo?: {
    remaining: number;
    resetTime: number;
    limit: number;
  };
}

// API Security Middleware class
/**
 * APISecurityMiddleware Service
 *
 * Service class for handling apisecuritymiddleware operations
 *
 * @class APISecurityMiddleware
 */
export class APISecurityMiddleware {
  private readonly rateLimiters = new Map<string, RateLimiter>();
  private config: APISecurityConfig;

  constructor(config: APISecurityConfig = DEFAULT_SECURITY_CONFIG) {
    this.config = config;
    this.initializeRateLimiters();

    // Start cleanup intervals
    this.startCleanupIntervals();
  }

  private initializeRateLimiters(): void {
    // Global rate limiter
    this.rateLimiters.set('global', new RateLimiter(this.config.rateLimiting.global));

    // Per-user rate limiter
    this.rateLimiters.set('per-user', new RateLimiter(this.config.rateLimiting.perUser));

    // Per-endpoint rate limiters
    Object.entries(this.config.rateLimiting.perEndpoint).forEach(([endpoint, config]) => {
      this.rateLimiters.set(`endpoint:${endpoint}`, new RateLimiter(config));
    });
  }

  private rateLimiterIntervalId?: NodeJS.Timeout;
  private csrfCleanupIntervalId?: NodeJS.Timeout;

  private startCleanupIntervals(): void {
    // Cleanup rate limiters every 5 minutes
    this.rateLimiterIntervalId = setInterval(
      () => {
        this.rateLimiters.forEach((limiter) => {
          limiter.cleanup();
        });
      },
      5 * 60 * 1000,
    );

    // Cleanup CSRF tokens every hour
    this.csrfCleanupIntervalId = setInterval(
      () => {
        CSRFTokenManager.cleanup();
      },
      60 * 60 * 1000,
    );
  }

  // Cleanup method to stop intervals and prevent memory leaks
  public cleanup(): void {
    if (this.rateLimiterIntervalId) {
      clearInterval(this.rateLimiterIntervalId);
      this.rateLimiterIntervalId = undefined;
    }

    if (this.csrfCleanupIntervalId) {
      clearInterval(this.csrfCleanupIntervalId);
      this.csrfCleanupIntervalId = undefined;
    }
  }

  // Dispose method for cleanup
  public dispose(): void {
    this.cleanup();
  }

  // Main security check method
  async checkSecurity(context: SecurityContext, requestData?: any): Promise<SecurityResult> {
    const warnings: string[] = [];

    try {
      // 1. Rate limiting check
      const rateLimitResult = this.checkRateLimit(context);
      if (!rateLimitResult.allowed) {
        return rateLimitResult;
      }

      // 2. API version validation
      const versionResult = this.checkAPIVersion(context.version);
      if (!versionResult.allowed) {
        return versionResult;
      }
      if (versionResult.warnings) {
        warnings.push(...versionResult.warnings);
      }

      // 3. Input validation and sanitization
      if (requestData) {
        const inputResult = await this.validateInput(requestData, context);
        if (!inputResult.allowed) {
          return inputResult;
        }
      }

      // 4. CSRF protection (for state-changing operations)
      if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(context.method)) {
        const csrfResult = this.checkCSRFProtection(context, requestData);
        if (!csrfResult.allowed) {
          return csrfResult;
        }
      }

      return {
        allowed: true,
        warnings: warnings.length > 0 ? warnings : undefined,
        rateLimitInfo: rateLimitResult.rateLimitInfo,
      };
    } catch (error) {
      return {
        allowed: false,
        error:
          error instanceof ServiceError
            ? error
            : new ServiceError(ServiceErrorCode.UNKNOWN_ERROR, 'Security check failed', {
                originalError: error,
              }),
      };
    }
  }

  // Rate limiting check
  private checkRateLimit(context: SecurityContext): SecurityResult {
    const checks = [
      { key: 'global', limiter: this.rateLimiters.get('global')! },
      {
        key: `user:${context.userId ?? context.ipAddress}`,
        limiter: this.rateLimiters.get('per-user')!,
      },
    ];

    // Check endpoint-specific rate limit
    const endpointLimiter = this.rateLimiters.get(`endpoint:${context.endpoint}`);
    if (endpointLimiter) {
      checks.push({
        key: `endpoint:${context.endpoint}:${context.userId ?? context.ipAddress}`,
        limiter: endpointLimiter,
      });
    }

    for (const { key, limiter } of checks) {
      if (!limiter.isAllowed(key)) {
        return {
          allowed: false,
          error: new ServiceError(
            ServiceErrorCode.PERMISSION_DENIED,
            'Rate limit exceeded. Please try again later.',
            {
              rateLimitType: key.split(':')[0],
              resetTime: limiter.getResetTime(key),
            },
          ),
          rateLimitInfo: {
            remaining: 0,
            resetTime: limiter.getResetTime(key),
            limit: limiter.config.maxRequests,
          },
        };
      }
    }

    // Return rate limit info for the most restrictive limiter
    const userLimiter = this.rateLimiters.get('per-user')!;
    const userKey = `user:${context.userId ?? context.ipAddress}`;

    return {
      allowed: true,
      rateLimitInfo: {
        remaining: userLimiter.getRemainingRequests(userKey),
        resetTime: userLimiter.getResetTime(userKey),
        limit: this.config.rateLimiting.perUser.maxRequests,
      },
    };
  }

  // API version validation
  private checkAPIVersion(version: string): SecurityResult {
    if (!APIVersionManager.isVersionSupported(version)) {
      return {
        allowed: false,
        error: new ServiceError(
          ServiceErrorCode.VALIDATION_ERROR,
          `Unsupported API version: ${version}. Supported versions: ${this.config.apiVersioning.supportedVersions.join(', ')}`,
          {
            requestedVersion: version,
            supportedVersions: this.config.apiVersioning.supportedVersions,
          },
        ),
      };
    }

    const warnings: string[] = [];
    const deprecationWarning = APIVersionManager.getDeprecationWarning(version);
    if (deprecationWarning) {
      warnings.push(deprecationWarning);
    }

    return {
      allowed: true,
      warnings: warnings.length > 0 ? warnings : undefined,
    };
  }

  // Input validation and sanitization
  private async validateInput(requestData: any, context: SecurityContext): Promise<SecurityResult> {
    try {
      // Check for SQL injection patterns
      SQLInjectionPrevention.validateSQLInput(requestData);

      // Sanitize input if enabled
      let sanitizedData = requestData;
      if (this.config.inputValidation.sanitizeInput) {
        sanitizedData = InputSanitizer.sanitizeObject(requestData);
      }

      // Validate request size (approximate)
      const requestSize = JSON.stringify(sanitizedData).length;
      if (requestSize > this.config.inputValidation.maxRequestSize) {
        return {
          allowed: false,
          error: new ServiceError(
            ServiceErrorCode.VALIDATION_ERROR,
            `Request size exceeds maximum allowed size of ${this.config.inputValidation.maxRequestSize} bytes`,
            { requestSize, maxSize: this.config.inputValidation.maxRequestSize },
          ),
        };
      }

      return { allowed: true };
    } catch (error) {
      return {
        allowed: false,
        error:
          error instanceof ServiceError
            ? error
            : new ServiceError(ServiceErrorCode.VALIDATION_ERROR, 'Input validation failed', {
                originalError: error,
              }),
      };
    }
  }

  // CSRF protection check
  private checkCSRFProtection(context: SecurityContext, requestData: any): SecurityResult {
    if (!this.config.csrfProtection.enabled) {
      return { allowed: true };
    }

    const csrfToken =
      requestData?.[this.config.csrfProtection.tokenName] ||
      requestData?.headers?.[`x-${this.config.csrfProtection.tokenName}`];

    if (!csrfToken) {
      return {
        allowed: false,
        error: new ServiceError(
          ServiceErrorCode.VALIDATION_ERROR,
          'CSRF token is required for this operation',
          { tokenName: this.config.csrfProtection.tokenName },
        ),
      };
    }

    if (!CSRFTokenManager.validateToken(context.sessionId, csrfToken)) {
      return {
        allowed: false,
        error: new ServiceError(
          ServiceErrorCode.VALIDATION_ERROR,
          'Invalid or expired CSRF token',
          { tokenName: this.config.csrfProtection.tokenName },
        ),
      };
    }

    return { allowed: true };
  }

  // Generate CSRF token for session
  generateCSRFToken(sessionId: string): string {
    return CSRFTokenManager.generateToken(sessionId);
  }

  // Refresh CSRF token
  refreshCSRFToken(sessionId: string): string {
    return CSRFTokenManager.refreshToken(sessionId);
  }

  // Get security headers
  getSecurityHeaders(): Record<string, string> {
    return SecurityHeaders.getSecurityHeaders();
  }

  // Update configuration
  updateConfig(newConfig: Partial<APISecurityConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.rateLimiters.clear();
    this.initializeRateLimiters();
  }

  // Get current configuration
  getConfig(): APISecurityConfig {
    return { ...this.config };
  }
}

// Security middleware instance
export const apiSecurityMiddleware = new APISecurityMiddleware();

// Helper function to create security context
/**
 * createSecurityContext function
 *
 * @param {Object} params - Function parameters
 * @returns {void} Nothing
 */
export function createSecurityContext(
  endpoint: string,
  method: string,
  options: {
    userId?: string;
    sessionId?: string;
    ipAddress?: string;
    userAgent?: string;
    version?: string;
  } = {},
): SecurityContext {
  return {
    userId: options.userId,
    sessionId: options.sessionId ?? 'anonymous',
    ipAddress: options.ipAddress ?? '127.0.0.1',
    userAgent: options.userAgent ?? 'Unknown',
    endpoint,
    method: method.toUpperCase(),
    version: options.version ?? DEFAULT_SECURITY_CONFIG.apiVersioning.currentVersion,
    timestamp: Date.now(),
  };
}

// Decorator for securing service methods
/**
 * SecureEndpoint function
 *
 * @param {Object} params - Function parameters
 * @returns {void} Nothing
 */
export function SecureEndpoint(endpoint: string, options: { requireAuth?: boolean } = {}) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const context = createSecurityContext(endpoint, 'POST', {
        userId: options.requireAuth ? 'required' : undefined,
      });

      const securityResult = await apiSecurityMiddleware.checkSecurity(context, args[0]);

      if (!securityResult.allowed) {
        throw securityResult.error;
      }

      if (securityResult.warnings) {
        logger.warn('Security warnings:', securityResult.warnings);
      }

      return method.apply(this, args);
    };

    return descriptor;
  };
}
