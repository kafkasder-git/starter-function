/**
 * @fileoverview apiSecurity Module - API Security Configuration
 *
 * @author Dernek Yönetim Sistemi Team
 * @version 2.0.0
 */

import { ServiceError, ServiceErrorCode } from '../../services/config';
import { RateLimiter } from './rateLimit';
import { CSRFTokenManager } from './csrf';
import { SQLInjectionPrevention } from './sqlInjection';
import { SecurityHeaders } from './headers';

// Rate limiting configuration
/**
 * RateLimitConfig Interface
 *
 * @interface RateLimitConfig
 */
export interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
  keyGenerator?: (req: any) => string;
  onLimitReached?: (req: any) => void;
}

// API security configuration
/**
 * APISecurityConfig Interface
 *
 * @interface APISecurityConfig
 */
export interface APISecurityConfig {
  rateLimiting: {
    global: RateLimitConfig;
    perEndpoint: Record<string, RateLimitConfig>;
    perUser: RateLimitConfig;
  };

  inputValidation: {
    maxRequestSize: number;
    allowedContentTypes: string[];
    sanitizeInput: boolean;
    validateSchema: boolean;
  };

  xssProtection: {
    enabled: boolean;
    allowedTags: string[];
    allowedAttributes: Record<string, string[]>;
  };

  csrfProtection: {
    enabled: boolean;
    tokenName: string;
    cookieName: string;
    secure: boolean;
    sameSite: 'strict' | 'lax' | 'none';
  };

  apiVersioning: {
    currentVersion: string;
    supportedVersions: string[];
    deprecationWarnings: boolean;
    forceLatest: boolean;
  };
}

// Default security configuration
export const DEFAULT_SECURITY_CONFIG: APISecurityConfig = {
  rateLimiting: {
    global: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      maxRequests: 1000,
      skipSuccessfulRequests: false,
      skipFailedRequests: false,
    },
    perEndpoint: {
      '/api/auth/login': {
        windowMs: 15 * 60 * 1000,
        maxRequests: 5,
      },
      '/api/auth/register': {
        windowMs: 60 * 60 * 1000, // 1 hour
        maxRequests: 3,
      },
      '/api/reports/export': {
        windowMs: 5 * 60 * 1000, // 5 minutes
        maxRequests: 10,
      },
    },
    perUser: {
      windowMs: 15 * 60 * 1000,
      maxRequests: 100,
    },
  },

  inputValidation: {
    maxRequestSize: 10 * 1024 * 1024, // 10MB
    allowedContentTypes: [
      'application/json',
      'application/x-www-form-urlencoded',
      'multipart/form-data',
      'text/plain',
    ],
    sanitizeInput: true,
    validateSchema: true,
  },

  xssProtection: {
    enabled: true,
    allowedTags: ['b', 'i', 'em', 'strong', 'p', 'br'],
    allowedAttributes: {
      a: ['href', 'title'],
      img: ['src', 'alt', 'width', 'height'],
    },
  },

  csrfProtection: {
    enabled: true,
    tokenName: 'csrf-token',
    cookieName: 'csrf-cookie',
    secure: true,
    sameSite: 'strict',
  },

  apiVersioning: {
    currentVersion: 'v1',
    supportedVersions: ['v1'],
    deprecationWarnings: true,
    forceLatest: false,
  },
};

// RateLimiter is now imported from './rateLimit'
// Re-export for backward compatibility
export { RateLimiter } from './rateLimit';

// InputSanitizer is now imported from './sanitization'
// Re-export for backward compatibility
export { InputSanitizer } from './sanitization';

// SQLInjectionPrevention is now imported from './sqlInjection'
// Re-export for backward compatibility
export { SQLInjectionPrevention } from './sqlInjection';

// CSRFTokenManager is now imported from './csrf'
// Re-export for backward compatibility
export { CSRFTokenManager } from './csrf';

// API versioning utilities
/**
 * APIVersionManager Service
 *
 * Service class for handling apiversionmanager operations
 *
 * @class APIVersionManager
 */
export class APIVersionManager {
  static parseVersion(versionHeader?: string): string {
    if (!versionHeader) {
      return DEFAULT_SECURITY_CONFIG.apiVersioning.currentVersion;
    }

    // Support different version formats
    const versionMatch = /v?(\d+(?:\.\d+)*)/i.exec(versionHeader);
    return versionMatch
      ? `v${versionMatch[1]}`
      : DEFAULT_SECURITY_CONFIG.apiVersioning.currentVersion;
  }

  static isVersionSupported(version: string): boolean {
    return DEFAULT_SECURITY_CONFIG.apiVersioning.supportedVersions.includes(version);
  }

  static isVersionDeprecated(version: string): boolean {
    const { currentVersion } = DEFAULT_SECURITY_CONFIG.apiVersioning;
    return version !== currentVersion && this.isVersionSupported(version);
  }

  static getDeprecationWarning(version: string): string | null {
    if (!DEFAULT_SECURITY_CONFIG.apiVersioning.deprecationWarnings) {
      return null;
    }

    if (this.isVersionDeprecated(version)) {
      return `API version ${version} is deprecated. Please upgrade to ${DEFAULT_SECURITY_CONFIG.apiVersioning.currentVersion}`;
    }

    return null;
  }
}

// SecurityHeaders is now imported from './headers'
// Re-export for backward compatibility
export { SecurityHeaders } from './headers';
