/**
 * @fileoverview apiSecurity Module - Application module
 * 
 * @author Dernek Yönetim Sistemi Team
 * @version 1.0.0
 */

import { ServiceError, ServiceErrorCode } from '../../services/config';

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

// Rate limiter implementation
/**
 * RateLimiter Service
 * 
 * Service class for handling ratelimiter operations
 * 
 * @class RateLimiter
 */
export class RateLimiter {
  private readonly requests = new Map<string, { count: number; resetTime: number }>();

  constructor(private readonly config: RateLimitConfig) {}

  isAllowed(key: string): boolean {
    const now = Date.now();
    const record = this.requests.get(key);

    if (!record ?? now > record.resetTime) {
      // Reset or create new record
      this.requests.set(key, {
        count: 1,
        resetTime: now + this.config.windowMs,
      });
      return true;
    }

    if (record.count >= this.config.maxRequests) {
      if (this.config.onLimitReached) {
        this.config.onLimitReached({ key, count: record.count });
      }
      return false;
    }

    record.count++;
    return true;
  }

  getRemainingRequests(key: string): number {
    const record = this.requests.get(key);
    if (!record ?? Date.now() > record.resetTime) {
      return this.config.maxRequests;
    }
    return Math.max(0, this.config.maxRequests - record.count);
  }

  getResetTime(key: string): number {
    const record = this.requests.get(key);
    return record?.resetTime ?? Date.now() + this.config.windowMs;
  }

  cleanup(): void {
    const now = Date.now();
    for (const [key, record] of this.requests.entries()) {
      if (now > record.resetTime) {
        this.requests.delete(key);
      }
    }
  }
}

// Input sanitization utilities
/**
 * InputSanitizer Service
 * 
 * Service class for handling inputsanitizer operations
 * 
 * @class InputSanitizer
 */
export class InputSanitizer {
  private static readonly HTML_ESCAPE_MAP: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
  };

  static escapeHtml(text: string): string {
    return text.replace(/[&<>"'/]/g, (char) => this.HTML_ESCAPE_MAP[char] ?? char);
  }

  static sanitizeString(input: string): string {
    // Import DOMPurify for robust XSS protection
    const DOMPurify = require('dompurify');

    // Remove null bytes and control characters (pre-processing)
    let sanitized = input.replace(/[\x00-\x1F\x7F]/g, '');

    // Use DOMPurify for comprehensive XSS protection
    sanitized = DOMPurify.sanitize(sanitized, {
      // Strip scripts, event handlers, and dangerous URI schemes
      FORBID_TAGS: ['script', 'object', 'embed', 'iframe'],
      FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'onfocus', 'onblur'],
      ALLOWED_URI_REGEXP:
        /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
      // Safe SVG handling
      ALLOW_DATA_ATTR: false,
      // Unicode normalization
      KEEP_CONTENT: true,
      // Strict allowlist of tags and attributes
      ADD_ATTR: ['target'],
      ALLOWED_ATTR: ['href', 'title', 'alt', 'class', 'id', 'target'],
      ALLOWED_TAGS: [
        'p',
        'br',
        'strong',
        'em',
        'u',
        'h1',
        'h2',
        'h3',
        'h4',
        'h5',
        'h6',
        'ul',
        'ol',
        'li',
        'a',
      ],
    });

    return sanitized.trim();
  }

  static sanitizeObject(obj: unknown): unknown {
    if (typeof obj === 'string') {
      return this.sanitizeString(obj);
    }

    if (Array.isArray(obj)) {
      return obj.map((item) => this.sanitizeObject(item));
    }

    if (obj && typeof obj === 'object') {
      const sanitized: any = {};
      for (const [key, value] of Object.entries(obj)) {
        const sanitizedKey = this.sanitizeString(key);
        sanitized[sanitizedKey] = this.sanitizeObject(value);
      }
      return sanitized;
    }

    return obj;
  }

  static validateContentType(contentType: string, allowedTypes: string[]): boolean {
    const normalizedType = contentType.toLowerCase().split(';')[0].trim();
    return allowedTypes.some(
      (allowed) =>
        normalizedType === allowed.toLowerCase() ?? normalizedType.startsWith(`${allowed.toLowerCase()  }/`),
    );
  }
}

// SQL injection prevention
/**
 * SQLInjectionPrevention Service
 * 
 * Service class for handling sqlinjectionprevention operations
 * 
 * @class SQLInjectionPrevention
 */
export class SQLInjectionPrevention {
  private static readonly DANGEROUS_PATTERNS = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE)\b)/gi,
    /(\b(UNION|OR|AND)\s+\d+\s*=\s*\d+)/gi,
    /(--|\/\*|\*\/|;)/g,
    /(\b(SCRIPT|JAVASCRIPT|VBSCRIPT)\b)/gi,
    /(\b(CHAR|NCHAR|VARCHAR|NVARCHAR)\s*\(\s*\d+\s*\))/gi,
  ];

  static containsSQLInjection(input: string): boolean {
    return this.DANGEROUS_PATTERNS.some((pattern) => pattern.test(input));
  }

  static sanitizeSQLInput(input: string): string {
    // Only perform harmless normalization - DB interactions must use parameterized queries
    // This function is deprecated in favor of parameterized queries/prepared statements

    // Trim whitespace
    let sanitized = input.trim();

    // Optional length limit to prevent buffer overflow attacks
    const MAX_LENGTH = 10000;
    if (sanitized.length > MAX_LENGTH) {
      sanitized = sanitized.substring(0, MAX_LENGTH);
    }

    // Unicode normalization (harmless)
    sanitized = sanitized.normalize('NFC');

    // NOTE: All database interactions should use parameterized queries or prepared statements
    // to prevent SQL injection. This function only provides basic normalization.

    return sanitized;
  }

  static validateSQLInput(input: unknown): void {
    if (typeof input === 'string' && this.containsSQLInjection(input)) {
      throw new ServiceError(
        ServiceErrorCode.VALIDATION_ERROR,
        'Potentially dangerous SQL patterns detected in input',
        { input: input.substring(0, 100) },
      );
    }

    if (typeof input === 'object' && input !== null) {
      Object.values(input).forEach((value) => {
        if (typeof value === 'string') {
          this.validateSQLInput(value);
        }
      });
    }
  }
}

// CSRF token management
/**
 * CSRFTokenManager Service
 * 
 * Service class for handling csrftokenmanager operations
 * 
 * @class CSRFTokenManager
 */
export class CSRFTokenManager {
  private static readonly tokens = new Map<string, { token: string; expires: number }>();

  static generateToken(sessionId: string): string {
    const token = this.generateRandomToken();
    const expires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

    this.tokens.set(sessionId, { token, expires });
    return token;
  }

  static validateToken(sessionId: string, token: string): boolean {
    const record = this.tokens.get(sessionId);

    if (!record) {
      return false;
    }

    if (Date.now() > record.expires) {
      this.tokens.delete(sessionId);
      return false;
    }

    return record.token === token;
  }

  static refreshToken(sessionId: string): string {
    this.tokens.delete(sessionId);
    return this.generateToken(sessionId);
  }

  private static generateRandomToken(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
  }

  static cleanup(): void {
    const now = Date.now();
    for (const [sessionId, record] of this.tokens.entries()) {
      if (now > record.expires) {
        this.tokens.delete(sessionId);
      }
    }
  }
}

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
    const {currentVersion} = DEFAULT_SECURITY_CONFIG.apiVersioning;
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

// Security headers utility
/**
 * SecurityHeaders Service
 * 
 * Service class for handling securityheaders operations
 * 
 * @class SecurityHeaders
 */
export class SecurityHeaders {
  static getSecurityHeaders(): Record<string, string> {
    return {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
      'Content-Security-Policy':
        "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'",
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
    };
  }

  static addSecurityHeaders(response: any): void {
    const headers = this.getSecurityHeaders();
    Object.entries(headers).forEach(([key, value]) => {
      response.setHeader(key, value);
    });
  }
}
