/**
 * @fileoverview CSRF Token Management Module
 *
 * @author Dernek Yönetim Sistemi Team
 * @version 2.0.0
 */

/**
 * CSRF Token Manager
 * Manages Cross-Site Request Forgery protection tokens
 *
 * @class CSRFTokenManager
 */
export class CSRFTokenManager {
  private static readonly tokens = new Map<string, { token: string; expires: number }>();
  private static readonly TOKEN_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours
  private static readonly TOKEN_LENGTH = 32; // 32 bytes

  /**
   * Generate a new CSRF token for a session
   *
   * @param sessionId - Session identifier
   * @returns Generated CSRF token
   */
  static generateToken(sessionId: string): string {
    const token = this.generateRandomToken();
    const expires = Date.now() + this.TOKEN_EXPIRY;

    this.tokens.set(sessionId, { token, expires });
    return token;
  }

  /**
   * Validate a CSRF token against a session
   *
   * @param sessionId - Session identifier
   * @param token - Token to validate
   * @returns True if token is valid
   */
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

  /**
   * Refresh a CSRF token for a session
   *
   * @param sessionId - Session identifier
   * @returns New CSRF token
   */
  static refreshToken(sessionId: string): string {
    this.tokens.delete(sessionId);
    return this.generateToken(sessionId);
  }

  /**
   * Generate a cryptographically secure random token
   *
   * @private
   * @returns Random token string
   */
  private static generateRandomToken(): string {
    const array = new Uint8Array(this.TOKEN_LENGTH);
    crypto.getRandomValues(array);
    return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Cleanup expired tokens
   */
  static cleanup(): void {
    const now = Date.now();
    for (const [sessionId, record] of this.tokens.entries()) {
      if (now > record.expires) {
        this.tokens.delete(sessionId);
      }
    }
  }
}

/**
 * Generate a simple CSRF token (for backward compatibility)
 *
 * @returns CSRF token
 */
export function generateCSRFToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Validate a CSRF token (for backward compatibility)
 *
 * @param token - Token to validate
 * @param sessionToken - Session token to compare against
 * @returns True if tokens match
 */
export function validateCSRFToken(token: string, sessionToken: string): boolean {
  return token === sessionToken && token.length > 0;
}

/**
 * CSRF Protection utility (for backward compatibility with InputSanitizer.ts)
 *
 * @class CSRFProtection
 */
export class CSRFProtection {
  private static readonly tokens = new Map<string, { token: string; expires: number }>();
  private static readonly TOKEN_LENGTH = 32;
  private static readonly TOKEN_EXPIRY = 30 * 60 * 1000; // 30 minutes

  static generateToken(sessionId?: string): string {
    const token = Array.from({ length: this.TOKEN_LENGTH }, () =>
      Math.random().toString(36).charAt(2)
    ).join('');

    const expires = Date.now() + this.TOKEN_EXPIRY;
    this.tokens.set(token, { token, expires });

    return token;
  }

  static validateToken(sessionId: string, token: string): boolean {
    const tokenData = this.tokens.get(token);
    if (!tokenData) return false;

    if (Date.now() > tokenData.expires) {
      this.tokens.delete(token);
      return false;
    }

    return true;
  }

  static cleanExpiredTokens(): void {
    const now = Date.now();
    for (const [token, data] of this.tokens.entries()) {
      if (now > data.expires) {
        this.tokens.delete(token);
      }
    }
  }
}

export default CSRFTokenManager;
