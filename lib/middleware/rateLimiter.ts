/**
 * @fileoverview Rate Limiting Middleware
 * @description Prevent API abuse with rate limiting
 */

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  message?: string;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}

type RateLimitStore = Record<
  string,
  {
    count: number;
    resetTime: number;
  }
>;

class RateLimiter {
  private store: RateLimitStore = {};
  private readonly config: RateLimitConfig;

  constructor(config: RateLimitConfig) {
    this.config = {
      windowMs: config.windowMs || 60000, // 1 minute default
      maxRequests: config.maxRequests || 100,
      message: config.message || 'Too many requests, please try again later.',
      skipSuccessfulRequests: config.skipSuccessfulRequests || false,
      skipFailedRequests: config.skipFailedRequests || false,
    };

    // Cleanup old entries every minute
    setInterval(() => {
      this.cleanup();
    }, 60000);
  }

  /**
   * Check if request should be rate limited
   */
  public check(identifier: string): { allowed: boolean; remaining: number; resetTime: number } {
    const now = Date.now();
    const record = this.store[identifier];

    // No record or expired
    if (!record || now > record.resetTime) {
      this.store[identifier] = {
        count: 1,
        resetTime: now + this.config.windowMs,
      };

      return {
        allowed: true,
        remaining: this.config.maxRequests - 1,
        resetTime: this.store[identifier].resetTime,
      };
    }

    // Increment count
    record.count++;

    // Check if limit exceeded
    if (record.count > this.config.maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: record.resetTime,
      };
    }

    return {
      allowed: true,
      remaining: this.config.maxRequests - record.count,
      resetTime: record.resetTime,
    };
  }

  /**
   * Reset rate limit for identifier
   */
  public reset(identifier: string): void {
    delete this.store[identifier];
  }

  /**
   * Cleanup expired entries
   */
  private cleanup(): void {
    const now = Date.now();
    Object.keys(this.store).forEach((key) => {
      if (now > this.store[key].resetTime) {
        delete this.store[key];
      }
    });
  }

  /**
   * Get current stats
   */
  public getStats(): { totalKeys: number; activeKeys: number } {
    const now = Date.now();
    const activeKeys = Object.keys(this.store).filter(
      (key) => now <= this.store[key].resetTime
    ).length;

    return {
      totalKeys: Object.keys(this.store).length,
      activeKeys,
    };
  }
}

/**
 * Create rate limiter instances for different endpoints
 */
export const apiRateLimiter = new RateLimiter({
  windowMs: 60000, // 1 minute
  maxRequests: 100,
  message: 'API rate limit exceeded. Please try again later.',
});

export const authRateLimiter = new RateLimiter({
  windowMs: 900000, // 15 minutes
  maxRequests: 5,
  message: 'Too many login attempts. Please try again later.',
  skipSuccessfulRequests: true,
});

export const uploadRateLimiter = new RateLimiter({
  windowMs: 3600000, // 1 hour
  maxRequests: 20,
  message: 'Upload limit exceeded. Please try again later.',
});

/**
 * Get identifier from request (IP or user ID)
 */
export function getIdentifier(userId?: string): string {
  if (userId) {
    return `user:${userId}`;
  }

  // In browser, use a combination of factors
  const fingerprint = [
    navigator.userAgent,
    navigator.language,
    screen.colorDepth,
    screen.width,
    screen.height,
  ].join('|');

  return `fp:${btoa(fingerprint)}`;
}

/**
 * Rate limit decorator for functions
 */
export function rateLimit(limiter: RateLimiter) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const identifier = getIdentifier();
      const result = limiter.check(identifier);

      if (!result.allowed) {
        throw new Error('Rate limit exceeded');
      }

      return originalMethod.apply(this, args);
    };

    return descriptor;
  };
}

/**
 * React hook for rate limiting
 */
export function useRateLimit(limiter: RateLimiter, identifier?: string) {
  const id = identifier || getIdentifier();

  const checkLimit = () => {
    return limiter.check(id);
  };

  const resetLimit = () => {
    limiter.reset(id);
  };

  return { checkLimit, resetLimit };
}

export default {
  RateLimiter,
  apiRateLimiter,
  authRateLimiter,
  uploadRateLimiter,
  getIdentifier,
  rateLimit,
  useRateLimit,
};
