/**
 * Comprehensive Input Sanitization and Security System
 * Protects against XSS, SQL Injection, and other security threats
 */

import DOMPurify from 'dompurify';

// Optimized HTML escape map using a Map for O(1) lookup
const HTML_ESCAPE_MAP = new Map([
  ['&', '&amp;'],
  ['<', '&lt;'],
  ['>', '&gt;'],
  ['"', '&quot;'],
  ["'", '&#x27;'],
  ['/', '&#x2F;'],
]);

// Optimized dangerous patterns using a single RegExp
const DANGEROUS_PATTERNS = new RegExp([
  /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/i,
  /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/i,
  /<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/i,
  /<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/i,
  /<link\b[^<]*(?:(?!<\/link>)<[^<]*)*<\/link>/i,
  /<meta\b[^<]*(?:(?!<\/meta>)<[^<]*)*<\/meta>/i,
  /javascript:/i,
  /vbscript:/i,
  /data:text\/html/i,
  /on\w+\s*=/i,
].map(r => r.source).join('|'), 'i');

// Optimized SQL injection patterns using a single RegExp
const SQL_INJECTION_PATTERNS = new RegExp([
  /(\bUNION\b|\bSELECT\b|\bINSERT\b|\bUPDATE\b|\bDELETE\b|\bDROP\b|\bCREATE\b|\bALTER\b)/i,
  /['";\\]/,
  /--/,
  /\/\*|\*\//,
].map(r => r.source).join('|'), 'i');

// XSS Protection
export class XSSProtection {
  private static readonly ALLOWED_TAGS = new Set([
    'b', 'i', 'u', 'strong', 'em', 'p', 'br', 'span', 'div'
  ]);

  static sanitizeHTML(input: string): string {
    if (!input) return '';

    // Use DOMPurify for comprehensive XSS protection
    return DOMPurify.sanitize(input, {
      ALLOWED_TAGS: Array.from(this.ALLOWED_TAGS),
      ALLOWED_ATTR: [],
      KEEP_CONTENT: true,
    });
  }

  static escapeHTML(input: string): string {
    return input.replace(/[&<>"'/]/g, char => HTML_ESCAPE_MAP.get(char) || char);
  }

  static hasDangerousContent(input: string): boolean {
    return DANGEROUS_PATTERNS.test(input);
  }
}

// SQL Injection Protection
export class SQLInjectionProtection {
  static validate(input: string): boolean {
    return !SQL_INJECTION_PATTERNS.test(input);
  }

  static sanitize(input: string): string {
    if (typeof input !== 'string') return '';
    return input.replace(SQL_INJECTION_PATTERNS, '').trim();
  }
}

// Input Sanitizer
export class InputSanitizer {
  static sanitize(input: unknown, type: 'text' | 'html' | 'sql' | 'email' | 'phone' | 'url' | 'filepath' = 'text'): string {
    if (input === null || input === undefined) return '';
    
    const stringInput = typeof input === 'string' ? input : String(input);
    
    switch (type) {
      case 'html':
        return XSSProtection.sanitizeHTML(stringInput);
      case 'sql':
        return SQLInjectionProtection.sanitize(stringInput);
      case 'email':
        return this.sanitizeEmail(stringInput);
      case 'phone':
        return this.sanitizePhone(stringInput);
      case 'url':
        return this.sanitizeURL(stringInput);
      case 'filepath':
        return this.sanitizeFilePath(stringInput);
      default:
        return this.sanitizeText(stringInput);
    }
  }

  static sanitizeText(input: string): string {
    return input
      .trim()
      .replace(/[<>"'&]/g, char => HTML_ESCAPE_MAP.get(char) || char)
      .replace(/[\x00-\x1F\x7F]/g, ''); // Remove control characters
  }

  static sanitizeEmail(input: string): string {
    return input
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9.@_-]/g, '');
  }

  static sanitizePhone(input: string): string {
    return input
      .replace(/[^\d+]/g, '')
      .slice(0, 15); // Maximum length for international numbers
  }

  static sanitizeURL(input: string): string {
    try {
      const url = new URL(input.trim());
      return ['http:', 'https:'].includes(url.protocol) ? url.toString() : '';
    } catch {
      return '';
    }
  }

  static sanitizeFilePath(input: string): string {
    return input
      .replace(/\.\./g, '') // Remove parent directory references
      .replace(/[<>:"|?*]/g, '') // Remove invalid filename characters
      .replace(/^[./\\]+|[./\\]+$/g, '') // Remove leading/trailing dots and slashes
      .trim();
  }

  static sanitizeObject<T extends Record<string, unknown>>(obj: T, options: {
    allowedKeys?: Set<string>;
    sanitizeType?: 'text' | 'html' | 'sql';
  } = {}): T {
    const { allowedKeys, sanitizeType = 'text' } = options;
    const result = {} as T;

    for (const [key, value] of Object.entries(obj)) {
      if (allowedKeys && !allowedKeys.has(key)) continue;

      if (typeof value === 'string') {
        result[key as keyof T] = this.sanitize(value, sanitizeType) as T[keyof T];
      } else if (value && typeof value === 'object' && !Array.isArray(value)) {
        result[key as keyof T] = this.sanitizeObject(value as Record<string, unknown>, options) as T[keyof T];
      } else if (Array.isArray(value)) {
        result[key as keyof T] = value.map(item => 
          typeof item === 'string' ? this.sanitize(item, sanitizeType) : item
        ) as T[keyof T];
      } else {
        result[key as keyof T] = value as T[keyof T];
      }
    }

    return result;
  }
}

// Security validation rules
export const SecurityValidationRules = {
  noScriptTags: {
    validate: (input: string) => ({
      isValid: !XSSProtection.hasDangerousContent(input),
      message: 'Script etiketleri izin verilmez',
      severity: 'error' as const,
    }),
  },

  noSQLInjection: {
    validate: (input: string) => ({
      isValid: SQLInjectionProtection.validate(input),
      message: 'Geçersiz karakterler tespit edildi',
      severity: 'error' as const,
    }),
  },

  maxLength: (max: number) => ({
    validate: (input: string) => ({
      isValid: input.length <= max,
      message: `Maksimum ${max} karakter olmalıdır`,
      severity: 'error' as const,
    }),
  }),

  noSpecialChars: {
    validate: (input: string) => ({
      isValid: /^[a-zA-ZçğıöşüÇĞIİÖŞÜ0-9\s._-]*$/.test(input),
      message: 'Özel karakterler izin verilmez',
      severity: 'warning' as const,
    }),
  },
};

// Security headers helper
export const SecurityHeaders = {
  getCSPHeader(): string {
    return [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "font-src 'self' data:",
      "connect-src 'self' https://*.supabase.co",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join('; ');
  },

  getSecurityHeaders(): Record<string, string> {
    return {
      'Content-Security-Policy': this.getCSPHeader(),
      'X-Frame-Options': 'DENY',
      'X-Content-Type-Options': 'nosniff',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
    };
  },
};
