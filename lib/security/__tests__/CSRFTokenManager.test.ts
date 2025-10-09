import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { CSRFTokenManager } from '../apiSecurity';

describe('CSRFTokenManager', () => {
  beforeEach(() => {
    // Clear all tokens before each test
    CSRFTokenManager.cleanup();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Token Generation', () => {
    it('should generate a unique token', () => {
      const sessionId = 'test-session-1';
      const token = CSRFTokenManager.generateToken(sessionId);

      expect(token).toBeTruthy();
      expect(typeof token).toBe('string');
      expect(token.length).toBe(64); // 32 bytes = 64 hex chars
    });

    it('should generate different tokens for different sessions', () => {
      const token1 = CSRFTokenManager.generateToken('session-1');
      const token2 = CSRFTokenManager.generateToken('session-2');

      expect(token1).not.toBe(token2);
    });

    it('should override existing token when generating for same session', () => {
      const sessionId = 'test-session';
      const token1 = CSRFTokenManager.generateToken(sessionId);
      const token2 = CSRFTokenManager.generateToken(sessionId);

      // Second token should be different
      expect(token2).not.toBe(token1);

      // First token should no longer be valid
      expect(CSRFTokenManager.validateToken(sessionId, token1)).toBe(false);
      expect(CSRFTokenManager.validateToken(sessionId, token2)).toBe(true);
    });
  });

  describe('Token Validation', () => {
    it('should validate a valid token', () => {
      const sessionId = 'test-session';
      const token = CSRFTokenManager.generateToken(sessionId);

      expect(CSRFTokenManager.validateToken(sessionId, token)).toBe(true);
    });

    it('should reject invalid token', () => {
      const sessionId = 'test-session';
      CSRFTokenManager.generateToken(sessionId);

      expect(CSRFTokenManager.validateToken(sessionId, 'invalid-token')).toBe(false);
    });

    it('should reject token for non-existent session', () => {
      expect(CSRFTokenManager.validateToken('non-existent', 'any-token')).toBe(false);
    });

    it('should reject expired token', () => {
      const sessionId = 'test-session';
      const token = CSRFTokenManager.generateToken(sessionId);

      // Fast-forward time by 25 hours (token expires after 24 hours)
      vi.advanceTimersByTime(25 * 60 * 60 * 1000);

      expect(CSRFTokenManager.validateToken(sessionId, token)).toBe(false);
    });

    it('should accept token within expiry window', () => {
      const sessionId = 'test-session';
      const token = CSRFTokenManager.generateToken(sessionId);

      // Fast-forward time by 23 hours (still valid)
      vi.advanceTimersByTime(23 * 60 * 60 * 1000);

      expect(CSRFTokenManager.validateToken(sessionId, token)).toBe(true);
    });
  });

  describe('Token Refresh', () => {
    it('should refresh token and invalidate old one', () => {
      const sessionId = 'test-session';
      const oldToken = CSRFTokenManager.generateToken(sessionId);
      const newToken = CSRFTokenManager.refreshToken(sessionId);

      expect(newToken).toBeTruthy();
      expect(newToken).not.toBe(oldToken);
      expect(CSRFTokenManager.validateToken(sessionId, oldToken)).toBe(false);
      expect(CSRFTokenManager.validateToken(sessionId, newToken)).toBe(true);
    });

    it('should generate token for non-existent session during refresh', () => {
      const newToken = CSRFTokenManager.refreshToken('new-session');

      expect(newToken).toBeTruthy();
      expect(CSRFTokenManager.validateToken('new-session', newToken)).toBe(true);
    });
  });

  describe('Token Cleanup', () => {
    it('should remove expired tokens', () => {
      const session1 = 'session-1';
      const session2 = 'session-2';

      const token1 = CSRFTokenManager.generateToken(session1);
      CSRFTokenManager.generateToken(session2);

      // Fast-forward session1 to expire
      vi.advanceTimersByTime(25 * 60 * 60 * 1000);

      CSRFTokenManager.cleanup();

      // Session1 should be removed
      expect(CSRFTokenManager.validateToken(session1, token1)).toBe(false);
    });

    it('should keep valid tokens during cleanup', () => {
      const sessionId = 'valid-session';
      const token = CSRFTokenManager.generateToken(sessionId);

      // Fast-forward but keep within validity
      vi.advanceTimersByTime(12 * 60 * 60 * 1000); // 12 hours

      CSRFTokenManager.cleanup();

      // Should still be valid
      expect(CSRFTokenManager.validateToken(sessionId, token)).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty session ID', () => {
      const token = CSRFTokenManager.generateToken('');
      expect(token).toBeTruthy();
      expect(CSRFTokenManager.validateToken('', token)).toBe(true);
    });

    it('should handle special characters in session ID', () => {
      const sessionId = 'session-with-special-chars-!@#$%^&*()';
      const token = CSRFTokenManager.generateToken(sessionId);

      expect(CSRFTokenManager.validateToken(sessionId, token)).toBe(true);
    });

    it('should handle concurrent token generation', () => {
      const sessions = Array.from({ length: 100 }, (_, i) => `session-${i}`);
      const tokens = sessions.map(session => CSRFTokenManager.generateToken(session));

      // All tokens should be unique
      const uniqueTokens = new Set(tokens);
      expect(uniqueTokens.size).toBe(100);

      // All tokens should be valid
      sessions.forEach((session, i) => {
        expect(CSRFTokenManager.validateToken(session, tokens[i])).toBe(true);
      });
    });
  });
});

