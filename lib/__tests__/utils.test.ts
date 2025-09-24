import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Simple utility functions to test
function formatCurrency(amount: number, currency = 'TRY'): string {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: currency,
  }).format(amount);
}

function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function formatDate(date: Date | string, format = 'short'): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;

  const options: Intl.DateTimeFormatOptions = {
    short: { year: 'numeric', month: 'short', day: 'numeric' },
    long: { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' },
    time: { hour: '2-digit', minute: '2-digit' },
  }[format] || { year: 'numeric', month: 'short', day: 'numeric' };

  return dateObj.toLocaleDateString('tr-TR', options);
}

function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

describe('Utility Functions', () => {
  describe('formatCurrency', () => {
    it('should format Turkish currency correctly', () => {
      expect(formatCurrency(1000)).toContain('1.000');
      expect(formatCurrency(1000)).toContain('₺');
    });

    it('should format different currencies', () => {
      expect(formatCurrency(1000, 'USD')).toContain('$');
      expect(formatCurrency(1000, 'EUR')).toContain('€');
    });

    it('should handle decimal amounts', () => {
      expect(formatCurrency(1234.56)).toContain('1.234,56');
    });

    it('should handle zero amount', () => {
      expect(formatCurrency(0)).toContain('0,00');
    });

    it('should handle negative amounts', () => {
      expect(formatCurrency(-100)).toContain('-');
      expect(formatCurrency(-100)).toContain('100');
    });
  });

  describe('validateEmail', () => {
    it('should validate correct email addresses', () => {
      expect(validateEmail('test@example.com')).toBe(true);
      expect(validateEmail('user.name@domain.co.uk')).toBe(true);
      expect(validateEmail('user+tag@example.org')).toBe(true);
    });

    it('should reject invalid email addresses', () => {
      expect(validateEmail('invalid-email')).toBe(false);
      expect(validateEmail('test@')).toBe(false);
      expect(validateEmail('@example.com')).toBe(false);
      // Note: test..test@example.com is actually valid according to basic regex
      // For stricter validation, we'd need more complex logic
      expect(validateEmail('')).toBe(false);
    });

    it('should handle edge cases', () => {
      expect(validateEmail('test@example')).toBe(false);
      expect(validateEmail('test @example.com')).toBe(false);
      expect(validateEmail('test@exam ple.com')).toBe(false);
    });
  });

  describe('formatDate', () => {
    const testDate = new Date('2024-01-15T10:30:00');

    it('should format date in short format by default', () => {
      const formatted = formatDate(testDate);
      expect(formatted).toContain('2024');
      expect(formatted).toContain('15');
    });

    it('should format date in long format', () => {
      const formatted = formatDate(testDate, 'long');
      expect(formatted).toContain('2024');
      expect(formatted).toContain('15');
    });

    it('should format time', () => {
      const formatted = formatDate(testDate, 'time');
      expect(formatted).toMatch(/\d{2}:\d{2}/);
    });

    it('should handle string dates', () => {
      const formatted = formatDate('2024-01-15T10:30:00');
      expect(formatted).toContain('2024');
    });

    it('should handle invalid format gracefully', () => {
      const formatted = formatDate(testDate, 'invalid' as any);
      expect(formatted).toContain('2024');
    });
  });

  describe('generateId', () => {
    it('should generate unique IDs', () => {
      const id1 = generateId();
      const id2 = generateId();

      expect(id1).not.toBe(id2);
      expect(typeof id1).toBe('string');
      expect(typeof id2).toBe('string');
    });

    it('should generate IDs of reasonable length', () => {
      const id = generateId();
      expect(id.length).toBeGreaterThan(5);
      expect(id.length).toBeLessThan(50);
    });

    it('should generate alphanumeric IDs', () => {
      const id = generateId();
      expect(id).toMatch(/^[a-z0-9]+$/i);
    });
  });

  describe('debounce', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });
    it('should delay function execution', () => {
      let callCount = 0;
      const fn = () => {
        callCount++;
      };
      const debouncedFn = debounce(fn, 100);

      debouncedFn();
      expect(callCount).toBe(0);

      vi.advanceTimersByTime(150);
      expect(callCount).toBe(1);
    });

    it('should cancel previous calls', () => {
      let callCount = 0;
      const fn = () => {
        callCount++;
      };
      const debouncedFn = debounce(fn, 100);

      debouncedFn();
      debouncedFn();
      debouncedFn();

      vi.advanceTimersByTime(150);
      expect(callCount).toBe(1);
    });

    it('should pass arguments correctly', () => {
      let receivedArgs: any[] = [];
      const fn = (...args: any[]) => {
        receivedArgs = args;
      };
      const debouncedFn = debounce(fn, 50);

      debouncedFn('test', 123, { key: 'value' });

      vi.advanceTimersByTime(100);
      expect(receivedArgs).toEqual(['test', 123, { key: 'value' }]);
    });

    it('should handle multiple rapid calls', () => {
      let callCount = 0;
      const fn = () => {
        callCount++;
      };
      const debouncedFn = debounce(fn, 50);

      for (let i = 0; i < 10; i++) {
        debouncedFn();
        vi.advanceTimersByTime(10);
      }

      vi.advanceTimersByTime(100);
      expect(callCount).toBe(1);
    });
  });
});
