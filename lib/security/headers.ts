/**
 * @fileoverview Security Headers Module
 *
 * @author Dernek Yönetim Sistemi Team
 * @version 2.0.0
 */

/**
 * Security Headers Manager
 * Provides security headers for HTTP responses
 *
 * @class SecurityHeaders
 */
export class SecurityHeaders {
  /**
   * Get Content Security Policy header value
   *
   * @returns CSP header value
   */
  static getCSPHeader(): string {
    return [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "font-src 'self' data:",
      "connect-src 'self' https://*.appwrite.io",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join('; ');
  }

  /**
   * Get all security headers
   *
   * @returns Object containing all security headers
   */
  static getSecurityHeaders(): Record<string, string> {
    return {
      'Content-Security-Policy': this.getCSPHeader(),
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
    };
  }

  /**
   * Add security headers to a response object
   *
   * @param response - Response object with setHeader method
   */
  static addSecurityHeaders(response: any): void {
    const headers = this.getSecurityHeaders();
    Object.entries(headers).forEach(([key, value]) => {
      response.setHeader(key, value);
    });
  }
}

/**
 * Get CSP header (standalone function for convenience)
 *
 * @returns CSP header value
 */
export function getCSPHeader(): string {
  return SecurityHeaders.getCSPHeader();
}

/**
 * Get all security headers (standalone function for convenience)
 *
 * @returns Object containing all security headers
 */
export function getSecurityHeaders(): Record<string, string> {
  return SecurityHeaders.getSecurityHeaders();
}

/**
 * Add security headers to response (standalone function for convenience)
 *
 * @param response - Response object
 */
export function addSecurityHeaders(response: any): void {
  SecurityHeaders.addSecurityHeaders(response);
}

export default SecurityHeaders;
