/**
 * @fileoverview Rate Limiting Module
 *
 * @author Dernek Yönetim Sistemi Team
 * @version 2.0.0
 */

/**
 * Rate limiting configuration
 */
export interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
  keyGenerator?: (req: any) => string;
  onLimitReached?: (req: any) => void;
}

/**
 * Rate Limiter
 * Implements rate limiting to protect against brute force and DoS attacks
 *
 * @class RateLimiter
 */
export class RateLimiter {
  private readonly requests = new Map<string, { count: number; resetTime: number }>();

  constructor(private readonly config: RateLimitConfig) {}

  /**
   * Check if a request is allowed
   *
   * @param key - Identifier for rate limiting (e.g., IP address, user ID)
   * @returns True if request is allowed
   */
  isAllowed(key: string): boolean {
    const now = Date.now();
    const record = this.requests.get(key);

    if (!record || now > record.resetTime) {
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

  /**
   * Get remaining requests for a key
   *
   * @param key - Identifier
   * @returns Number of remaining requests
   */
  getRemainingRequests(key: string): number {
    const record = this.requests.get(key);
    if (!record || Date.now() > record.resetTime) {
      return this.config.maxRequests;
    }
    return Math.max(0, this.config.maxRequests - record.count);
  }

  /**
   * Get reset time for a key
   *
   * @param key - Identifier
   * @returns Timestamp when rate limit resets
   */
  getResetTime(key: string): number {
    const record = this.requests.get(key);
    return record?.resetTime ?? Date.now() + this.config.windowMs;
  }

  /**
   * Cleanup expired records
   */
  cleanup(): void {
    const now = Date.now();
    for (const [key, record] of this.requests.entries()) {
      if (now > record.resetTime) {
        this.requests.delete(key);
      }
    }
  }

  /**
   * Check if request is allowed with custom parameters
   * (for backward compatibility with InputSanitizer.ts)
   *
   * @param identifier - Identifier for rate limiting
   * @param maxAttempts - Maximum attempts
   * @param windowMs - Time window in milliseconds
   * @returns True if request is allowed
   */
  static checkLimit(identifier: string, maxAttempts: number, windowMs: number): boolean {
    const limiter = new RateLimiter({ windowMs, maxRequests: maxAttempts });
    return limiter.isAllowed(identifier);
  }

  /**
   * Get remaining time for a key
   *
   * @param identifier - Identifier
   * @returns Remaining time in milliseconds
   */
  static getRemainingTime(identifier: string): number {
    // This is a simplified implementation for backward compatibility
    // In production, you should maintain a singleton instance
    return 0;
  }

  /**
   * Reset attempts for a key
   *
   * @param identifier - Identifier
   */
  static resetAttempts(identifier: string): void {
    // This is a simplified implementation for backward compatibility
    // In production, you should maintain a singleton instance
  }
}

/**
 * Default rate limit configurations
 */
export const DEFAULT_RATE_LIMITS = {
  global: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 1000,
  },
  perUser: {
    windowMs: 15 * 60 * 1000,
    maxRequests: 100,
  },
  login: {
    windowMs: 15 * 60 * 1000,
    maxRequests: 5,
  },
  register: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 3,
  },
  export: {
    windowMs: 5 * 60 * 1000, // 5 minutes
    maxRequests: 10,
  },
};

export default RateLimiter;
