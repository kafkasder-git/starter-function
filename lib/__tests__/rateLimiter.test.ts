import { describe, it, expect, beforeEach, vi } from 'vitest';
import rateLimiterModule from '../middleware/rateLimiter';

describe('RateLimiter', () => {
  let rateLimiter: typeof rateLimiterModule.RateLimiter;

  beforeEach(() => {
    rateLimiter = new rateLimiterModule.RateLimiter({
      windowMs: 60000,
      maxRequests: 5,
    });
  });

  describe('check', () => {
    it('should allow requests within limit', () => {
      const result1 = rateLimiter.check('user1');
      const result2 = rateLimiter.check('user1');
      const result3 = rateLimiter.check('user1');

      expect(result1.allowed).toBe(true);
      expect(result2.allowed).toBe(true);
      expect(result3.allowed).toBe(true);
      expect(result3.remaining).toBe(2);
    });

    it('should block requests exceeding limit', () => {
      for (let i = 0; i < 5; i++) {
        rateLimiter.check('user1');
      }

      const result = rateLimiter.check('user1');
      expect(result.allowed).toBe(false);
      expect(result.remaining).toBe(0);
    });

    it('should track different identifiers separately', () => {
      for (let i = 0; i < 5; i++) {
        rateLimiter.check('user1');
      }

      const result = rateLimiter.check('user2');
      expect(result.allowed).toBe(true);
    });

    it('should reset after window expires', () => {
      vi.useFakeTimers();

      for (let i = 0; i < 5; i++) {
        rateLimiter.check('user1');
      }

      const blocked = rateLimiter.check('user1');
      expect(blocked.allowed).toBe(false);

      vi.advanceTimersByTime(60001);

      const allowed = rateLimiter.check('user1');
      expect(allowed.allowed).toBe(true);

      vi.useRealTimers();
    });
  });

  describe('reset', () => {
    it('should reset rate limit for identifier', () => {
      for (let i = 0; i < 5; i++) {
        rateLimiter.check('user1');
      }

      rateLimiter.reset('user1');

      const result = rateLimiter.check('user1');
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(4);
    });
  });

  describe('getStats', () => {
    it('should return statistics', () => {
      rateLimiter.check('user1');
      rateLimiter.check('user2');
      rateLimiter.check('user3');

      const stats = rateLimiter.getStats();
      expect(stats.totalKeys).toBe(3);
      expect(stats.activeKeys).toBe(3);
    });
  });
});
