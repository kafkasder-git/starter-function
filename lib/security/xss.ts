/**
 * @fileoverview XSS Protection Module
 *
 * @author Dernek Yönetim Sistemi Team
 * @version 2.0.0
 */

// Optimized HTML escape map using a Map for O(1) lookup
const HTML_ESCAPE_MAP = new Map([
  ['&', '&amp;'],
  ['<', '&lt;'],
  ['>', '&gt;'],
  ['"', '&quot;'],
  ["'", '&#x27;'],
  ['/', '&#x2F;'],
]);

// Dangerous patterns using optimized RegExp
const DANGEROUS_PATTERNS = new RegExp(
  [
    '<script[^>]*>[^<]*(?:</script>)?',
    '<iframe[^>]*>[^<]*(?:</iframe>)?',
    '<object[^>]*>[^<]*(?:</object>)?',
    '<embed[^>]*>[^<]*(?:</embed>)?',
    '<link[^>]*>[^<]*(?:</link>)?',
    '<meta[^>]*>[^<]*(?:</meta>)?',
    'javascript:',
    'vbscript:',
    'data:text/html',
    'on\\w+\\s*=',
  ].join('|'),
  'gi'
);

/**
 * XSS Protection Service
 * Provides protection against Cross-Site Scripting attacks
 *
 * @class XSSProtection
 */
export class XSSProtection {
  private static readonly ALLOWED_TAGS = new Set([
    'b',
    'i',
    'u',
    'strong',
    'em',
    'p',
    'br',
    'span',
    'div',
  ]);

  /**
   * Sanitize HTML by removing dangerous patterns
   *
   * @param input - HTML string to sanitize
   * @returns Sanitized HTML
   */
  static sanitizeHTML(input: string): string {
    if (!input) return '';

    // Remove dangerous patterns first
    let sanitized = input.replace(DANGEROUS_PATTERNS, '');

    // Remove script tags and content
    sanitized = sanitized.replace(/<script[^>]*>.*?<\/script>/gi, '');
    sanitized = sanitized.replace(/<script[^>]*>/gi, '');

    // Remove iframe tags and content
    sanitized = sanitized.replace(/<iframe[^>]*>.*?<\/iframe>/gi, '');
    sanitized = sanitized.replace(/<iframe[^>]*>/gi, '');

    // Remove event handlers
    sanitized = sanitized.replace(/on\w+\s*=\s*["'][^"']*["']/gi, '');

    // Remove javascript: protocols
    sanitized = sanitized.replace(/javascript:/gi, '');

    // Encode remaining HTML tags and special characters (avoid double encoding)
    sanitized = sanitized.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    sanitized = sanitized.replace(/"/g, '&quot;').replace(/'/g, '&#x27;');
    sanitized = sanitized.replace(/\//g, '&#x2F;');

    return sanitized;
  }

  /**
   * Sanitize plain text by removing dangerous characters
   *
   * @param input - Text to sanitize
   * @returns Sanitized text
   */
  static sanitizeText(input: string): string {
    if (!input) return '';
    return input
      .replace(/</g, '')
      .replace(/>/g, '')
      .replace(/javascript:/gi, '')
      .replace(/vbscript:/gi, '')
      .replace(/on\w+\s*=/gi, '');
  }

  /**
   * Sanitize URL to prevent XSS
   *
   * @param input - URL to sanitize
   * @returns Sanitized URL or empty string if dangerous
   */
  static sanitizeURL(input: string): string {
    if (!input) return '';
    const dangerous = ['javascript:', 'vbscript:', 'data:text/html'];
    for (const pattern of dangerous) {
      if (input.toLowerCase().includes(pattern)) {
        return '';
      }
    }
    return input;
  }

  /**
   * Escape HTML special characters
   *
   * @param input - String to escape
   * @returns Escaped string
   */
  static escapeHTML(input: string): string {
    return input.replace(/[&<>"'/]/g, (char) => HTML_ESCAPE_MAP.get(char) || char);
  }

  /**
   * Check if input contains dangerous content
   *
   * @param input - String to check
   * @returns True if dangerous content detected
   */
  static hasDangerousContent(input: string): boolean {
    return DANGEROUS_PATTERNS.test(input);
  }
}

/**
 * Detect XSS patterns (for backward compatibility)
 *
 * @param input - String to check
 * @returns True if XSS pattern detected
 */
export function detectXSS(input: string): boolean {
  const xssPatterns = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
    /<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi,
    /<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi,
  ];

  return xssPatterns.some((pattern) => pattern.test(input));
}

/**
 * XSS protection utilities (for backward compatibility)
 */
export const xssProtection = {
  escape: (input: string): string => {
    if (typeof document !== 'undefined') {
      const div = document.createElement('div');
      div.textContent = input;
      return div.innerHTML;
    }
    return XSSProtection.escapeHTML(input);
  },

  strip: (input: string): string => {
    return input.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  },
};

export default XSSProtection;
