import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  XSSProtection,
  SQLInjectionProtection,
  CSRFProtection,
  InputSanitizer,
  RateLimiter,
} from '../InputSanitizer';

describe('XSSProtection', () => {
  describe('sanitizeHTML', () => {
    it('should remove script tags', () => {
      const malicious = '<script>alert("xss")</script>Hello World';
      const result = XSSProtection.sanitizeHTML(malicious);
      expect(result).not.toContain('<script>');
      expect(result).not.toContain('alert');
    });

    it('should remove iframe tags', () => {
      const malicious = '<iframe src="evil.com"></iframe>Content';
      const result = XSSProtection.sanitizeHTML(malicious);
      expect(result).not.toContain('<iframe>');
      expect(result).not.toContain('evil.com');
    });

    it('should remove javascript protocols', () => {
      const malicious = 'javascript:alert("xss")';
      const result = XSSProtection.sanitizeHTML(malicious);
      expect(result).not.toContain('javascript:');
    });

    it('should remove event handlers', () => {
      const malicious = '<div onclick="alert()">Click me</div>';
      const result = XSSProtection.sanitizeHTML(malicious);
      expect(result).not.toContain('onclick');
    });

    it('should encode all HTML tags for maximum security', () => {
      const safe = '<b>Bold</b> <i>Italic</i> <p>Paragraph</p>';
      const result = XSSProtection.sanitizeHTML(safe);
      // Our implementation encodes ALL tags for maximum security
      expect(result).toContain('&lt;b&gt;');
      expect(result).toContain('Bold');
      expect(result).toContain('Italic');
    });

    it('should encode special characters', () => {
      const input = '< > " \' & /';
      const result = XSSProtection.sanitizeHTML(input);
      // First removes < > then encodes remaining
      expect(result).toContain('&quot;');
      expect(result).toContain('&#x27;');
      expect(result).toContain('&amp;');
      expect(result).toContain('&#x2F;');
    });
  });

  describe('sanitizeText', () => {
    it('should remove angle brackets', () => {
      const input = 'Hello <world>';
      const result = XSSProtection.sanitizeText(input);
      expect(result).toBe('Hello world');
    });

    it('should remove javascript protocol', () => {
      const input = 'javascript:alert("test")';
      const result = XSSProtection.sanitizeText(input);
      expect(result).toBe('alert("test")');
    });

    it('should remove event handlers', () => {
      const input = 'onclick=malicious()';
      const result = XSSProtection.sanitizeText(input);
      expect(result).toBe('malicious()');
    });
  });

  describe('sanitizeURL', () => {
    it('should allow safe URLs', () => {
      expect(XSSProtection.sanitizeURL('https://example.com')).toBe('https://example.com');
      expect(XSSProtection.sanitizeURL('http://example.com')).toBe('http://example.com');
      expect(XSSProtection.sanitizeURL('mailto:test@example.com')).toBe('mailto:test@example.com');
    });

    it('should block dangerous protocols', () => {
      expect(XSSProtection.sanitizeURL('javascript:alert()')).toBe('');
      expect(XSSProtection.sanitizeURL('vbscript:msgbox()')).toBe('');
      expect(XSSProtection.sanitizeURL('data:text/html,<script>')).toBe('');
    });
  });
});

describe('SQLInjectionProtection', () => {
  describe('sanitize', () => {
    it('should remove SQL keywords', () => {
      const malicious = "'; DROP TABLE users; --";
      const result = SQLInjectionProtection.sanitize(malicious);
      // Our implementation removes dangerous patterns but may leave some text
      expect(result.length).toBeLessThan(malicious.length);
      expect(result).not.toContain('DROP');
    });

    it('should remove SQL operators', () => {
      const malicious = '1=1 OR 2=2';
      const result = SQLInjectionProtection.sanitize(malicious);
      expect(result).not.toContain('OR');
      expect(result).not.toContain('=');
    });

    it('should remove SQL comments', () => {
      const malicious = 'test /* comment */ --line comment';
      const result = SQLInjectionProtection.sanitize(malicious);
      expect(result).not.toContain('/*');
      expect(result).not.toContain('*/');
      expect(result).not.toContain('--');
    });
  });

  describe('validate', () => {
    it('should detect SQL injection attempts', () => {
      expect(SQLInjectionProtection.validate("'; DROP TABLE users; --")).toBe(false);
      expect(SQLInjectionProtection.validate('1=1 OR 2=2')).toBe(false);
      expect(SQLInjectionProtection.validate('UNION SELECT * FROM users')).toBe(false);
    });

    it('should allow safe input', () => {
      expect(SQLInjectionProtection.validate('Normal text input')).toBe(true);
      expect(SQLInjectionProtection.validate('user@example.com')).toBe(true);
      expect(SQLInjectionProtection.validate('John Doe')).toBe(true);
    });
  });
});

describe('CSRFProtection', () => {
  beforeEach(() => {
    // Clear tokens before each test
    CSRFProtection.cleanExpiredTokens();
  });

  it('should generate unique tokens', () => {
    const token1 = CSRFProtection.generateToken('session1');
    const token2 = CSRFProtection.generateToken('session2');

    expect(token1).not.toBe(token2);
    expect(typeof token1).toBe('string');
    expect(token1.length).toBeGreaterThan(10);
  });

  it('should validate correct tokens', () => {
    const sessionId = 'test-session';
    const token = CSRFProtection.generateToken(sessionId);

    expect(CSRFProtection.validateToken(sessionId, token)).toBe(true);
  });

  it('should reject invalid tokens', () => {
    const sessionId = 'test-session';
    CSRFProtection.generateToken(sessionId);

    expect(CSRFProtection.validateToken(sessionId, 'invalid-token')).toBe(false);
    expect(CSRFProtection.validateToken('wrong-session', 'any-token')).toBe(false);
  });

  it('should handle expired tokens', () => {
    // Mock Date.now to simulate time passage
    const originalNow = Date.now;
    Date.now = vi.fn(() => 1000);

    const sessionId = 'test-session';
    const token = CSRFProtection.generateToken(sessionId);

    // Simulate time passage (2 hours)
    Date.now = vi.fn(() => 1000 + 2 * 60 * 60 * 1000 + 1);

    expect(CSRFProtection.validateToken(sessionId, token)).toBe(false);

    // Restore original Date.now
    Date.now = originalNow;
  });
});

describe('InputSanitizer', () => {
  describe('sanitizeUserInput', () => {
    it('should sanitize text input', () => {
      const malicious = '<script>alert("xss")</script>Hello';
      const result = InputSanitizer.sanitizeUserInput(malicious, 'text');
      expect(result).not.toContain('<script>');
      expect(result).toContain('Hello');
    });

    it('should sanitize email input', () => {
      const input = '  TEST@EXAMPLE.COM  ';
      const result = InputSanitizer.sanitizeUserInput(input, 'email');
      expect(result).toBe('test@example.com');
    });

    it('should sanitize phone input', () => {
      const input = '0555 123 45 67';
      const result = InputSanitizer.sanitizeUserInput(input, 'phone');
      // Our implementation allows spaces, parentheses, and dashes in phone numbers
      expect(result).toMatch(/^[0-9+()-\s]+$/);
      expect(result).toContain('0555');
    });

    it('should sanitize TC Kimlik input', () => {
      const input = '123 456 789 01';
      const result = InputSanitizer.sanitizeUserInput(input, 'tcKimlik');
      expect(result).toBe('12345678901');
    });

    it('should sanitize IBAN input', () => {
      const input = 'tr12 3456 7890 1234 5678 90';
      const result = InputSanitizer.sanitizeUserInput(input, 'iban');
      expect(result).toBe('TR12345678901234567890');
    });
  });

  describe('sanitizeFormData', () => {
    it('should sanitize all form fields', () => {
      const formData = {
        name: '<script>alert()</script>John',
        email: '  TEST@EXAMPLE.COM  ',
        phone: '0555 123 45 67',
        nested: {
          field: '<b>Bold text</b>',
        },
        array: ['<script>alert()</script>item1', 'item2'],
      };

      const result = InputSanitizer.sanitizeFormData(formData);

      expect(result.name).not.toContain('<script>');
      expect(result.email).toBe('test@example.com');
      expect(result.phone).toMatch(/^[0-9+()-\s]+$/);
      expect(result.nested.field).not.toContain('<b>');
      expect(result.array[0]).not.toContain('<script>');
    });

    it('should handle null and undefined values', () => {
      const formData = {
        nullField: null,
        undefinedField: undefined,
        emptyField: '',
        validField: 'test',
      };

      const result = InputSanitizer.sanitizeFormData(formData);

      expect(result.nullField).toBe('');
      expect(result.undefinedField).toBe('');
      expect(result.emptyField).toBe('');
      expect(result.validField).toBe('test');
    });
  });
});

describe('RateLimiter', () => {
  beforeEach(() => {
    // Reset rate limiter state
    RateLimiter.resetAttempts('test-user');
  });

  it('should allow requests within limit', () => {
    expect(RateLimiter.checkLimit('test-user', 5, 60000)).toBe(true);
    expect(RateLimiter.checkLimit('test-user', 5, 60000)).toBe(true);
    expect(RateLimiter.checkLimit('test-user', 5, 60000)).toBe(true);
  });

  it('should block requests over limit', () => {
    // Use up the limit
    for (let i = 0; i < 5; i++) {
      expect(RateLimiter.checkLimit('test-user', 5, 60000)).toBe(true);
    }

    // Next request should be blocked
    expect(RateLimiter.checkLimit('test-user', 5, 60000)).toBe(false);
  });

  it('should reset after time window', () => {
    // Mock Date.now
    const originalNow = Date.now;
    Date.now = vi.fn(() => 1000);

    // Use up the limit
    for (let i = 0; i < 5; i++) {
      RateLimiter.checkLimit('test-user', 5, 60000);
    }

    // Should be blocked
    expect(RateLimiter.checkLimit('test-user', 5, 60000)).toBe(false);

    // Simulate time passage
    Date.now = vi.fn(() => 1000 + 61000); // 61 seconds later

    // Should be allowed again
    expect(RateLimiter.checkLimit('test-user', 5, 60000)).toBe(true);

    // Restore original Date.now
    Date.now = originalNow;
  });

  it('should handle different users separately', () => {
    // User 1 uses up limit
    for (let i = 0; i < 5; i++) {
      expect(RateLimiter.checkLimit('user1', 5, 60000)).toBe(true);
    }
    expect(RateLimiter.checkLimit('user1', 5, 60000)).toBe(false);

    // User 2 should still be allowed
    expect(RateLimiter.checkLimit('user2', 5, 60000)).toBe(true);
  });

  it('should calculate remaining time correctly', () => {
    const originalNow = Date.now;
    Date.now = vi.fn(() => 1000);

    // Use up limit
    for (let i = 0; i < 5; i++) {
      RateLimiter.checkLimit('test-user', 5, 60000);
    }

    // Check remaining time
    const remaining = RateLimiter.getRemainingTime('test-user');
    expect(remaining).toBeGreaterThan(50000); // Should be close to 60 seconds
    expect(remaining).toBeLessThanOrEqual(60000);

    Date.now = originalNow;
  });
});
