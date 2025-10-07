import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { 
  generateSecret, 
  verifyTOTP, 
  generateBackupCodes,
  generateQRCodeURL,
  computeTOTPForTest 
} from '../auth/twoFactor';

describe('Two-Factor Authentication', () => {
  describe('generateSecret', () => {
    it('should generate 32-character secret', () => {
      const secret = generateSecret();
      
      expect(secret).toBeDefined();
      expect(secret.length).toBe(32);
      expect(/^[A-Z2-7]+$/.test(secret)).toBe(true);
    });

    it('should generate unique secrets', () => {
      const secret1 = generateSecret();
      const secret2 = generateSecret();
      
      expect(secret1).not.toBe(secret2);
    });

    // Comment 2: Enhanced entropy and character set validation
    it('should generate secrets with proper entropy and character distribution', () => {
      const secrets: string[] = [];
      const charFrequency: Record<string, number> = {};
      const allowedChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
      
      // Generate 1,000 secrets
      for (let i = 0; i < 1000; i++) {
        const secret = generateSecret();
        secrets.push(secret);
        
        // Count character frequency
        for (const char of secret) {
          charFrequency[char] = (charFrequency[char] || 0) + 1;
        }
      }

      // Assert all match base32 format
      secrets.forEach(secret => {
        expect(secret).toMatch(/^[A-Z2-7]{32}$/);
      });

      // Assert no collisions
      const uniqueSecrets = new Set(secrets);
      expect(uniqueSecrets.size).toBe(secrets.length);

      // Assert character distribution
      const totalChars = secrets.length * 32;
      const expectedFrequency = totalChars / allowedChars.length;
      
      // Each allowed character should appear at least once
      for (const char of allowedChars) {
        expect(charFrequency[char]).toBeGreaterThan(0);
        
        // No single char should be > 10% above expected proportion
        const proportion = charFrequency[char] / totalChars;
        const expectedProportion = 1 / allowedChars.length;
        expect(proportion).toBeLessThan(expectedProportion * 1.1);
      }

      // TODO: Production should use crypto.getRandomValues() or a cryptographic library
    });
  });

  describe('verifyTOTP', () => {
    beforeEach(() => {
      // Comment 1: Use deterministic timing
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2025-01-01T00:00:00Z'));
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should verify valid TOTP code with deterministic time', () => {
      const secret = 'JBSWY3DPEHPK3PXP';
      const timestamp = new Date('2025-01-01T00:00:00Z').getTime();
      
      // Generate valid code for fixed time
      const validCode = computeTOTPForTest(secret, timestamp);
      
      const result = verifyTOTP(secret, validCode);
      expect(result).toBe(true);
    });

    it('should accept codes within time window (±1)', () => {
      const secret = 'JBSWY3DPEHPK3PXP';
      const timestamp = new Date('2025-01-01T00:00:00Z').getTime();
      
      // Generate code for previous window
      const prevCode = computeTOTPForTest(secret, timestamp - 30000);
      expect(verifyTOTP(secret, prevCode)).toBe(true);
      
      // Generate code for next window
      const nextCode = computeTOTPForTest(secret, timestamp + 30000);
      expect(verifyTOTP(secret, nextCode)).toBe(true);
    });

    it('should reject codes outside time window', () => {
      const secret = 'JBSWY3DPEHPK3PXP';
      const timestamp = new Date('2025-01-01T00:00:00Z').getTime();
      
      // Generate code for 2 windows ago (outside ±1 window)
      const oldCode = computeTOTPForTest(secret, timestamp - 60000);
      expect(verifyTOTP(secret, oldCode)).toBe(false);
    });

    it('should reject invalid code', () => {
      const secret = 'JBSWY3DPEHPK3PXP';
      const invalidCode = '000000';
      
      const result = verifyTOTP(secret, invalidCode);
      expect(result).toBe(false);
    });

    it('should handle empty code', () => {
      const secret = 'JBSWY3DPEHPK3PXP';
      const result = verifyTOTP(secret, '');
      
      expect(result).toBe(false);
    });

    // Comment 8: Extended input validation
    it('should reject whitespace codes', () => {
      const secret = 'JBSWY3DPEHPK3PXP';
      expect(verifyTOTP(secret, '  ')).toBe(false);
      expect(verifyTOTP(secret, '   123')).toBe(false);
    });

    it('should reject non-digit codes', () => {
      const secret = 'JBSWY3DPEHPK3PXP';
      expect(verifyTOTP(secret, 'abc123')).toBe(false);
      expect(verifyTOTP(secret, '12345a')).toBe(false);
    });

    it('should reject full-width digits', () => {
      const secret = 'JBSWY3DPEHPK3PXP';
      expect(verifyTOTP(secret, '１２３４５６')).toBe(false);
    });

    it('should reject codes with wrong length', () => {
      const secret = 'JBSWY3DPEHPK3PXP';
      expect(verifyTOTP(secret, '12345')).toBe(false); // Too short
      expect(verifyTOTP(secret, '1234567')).toBe(false); // Too long
    });
  });

  describe('generateBackupCodes', () => {
    it('should generate 10 backup codes by default', () => {
      const codes = generateBackupCodes();
      
      expect(codes).toBeDefined();
      expect(codes.length).toBe(10);
    });

    it('should generate unique codes', () => {
      const codes = generateBackupCodes();
      const uniqueCodes = new Set(codes);
      
      expect(uniqueCodes.size).toBe(codes.length);
    });

    // Comment 3: Enhanced backup code validation
    it('should generate codes with exactly 8 characters', () => {
      const codes = generateBackupCodes();
      
      codes.forEach(code => {
        expect(code.length).toBe(8);
        expect(code).toMatch(/^[A-Z0-9]{8}$/);
      });
    });

    it('should generate custom number of codes', () => {
      const codes = generateBackupCodes(5);
      expect(codes.length).toBe(5);
      
      codes.forEach(code => {
        expect(code.length).toBe(8);
      });
    });

    it('should handle edge case of zero codes', () => {
      const codes = generateBackupCodes(0);
      expect(codes).toEqual([]);
    });

    it('should ensure uniqueness across large batches', () => {
      const allCodes: string[] = [];
      
      // Generate 1,000 codes
      for (let i = 0; i < 100; i++) {
        const codes = generateBackupCodes(10);
        allCodes.push(...codes);
      }
      
      const uniqueCodes = new Set(allCodes);
      expect(uniqueCodes.size).toBe(allCodes.length);
    });
  });

  // Comment 4: QR code URL generation tests
  describe('generateQRCodeURL', () => {
    it('should generate valid QR code URL', () => {
      const secret = 'JBSWY3DPEHPK3PXP';
      const email = 'user@example.com';
      const issuer = 'TestApp';
      
      const url = generateQRCodeURL(secret, email, issuer);
      
      expect(url).toContain('https://api.qrserver.com/v1/create-qr-code/');
      expect(url).toContain('size=200x200');
    });

    it('should properly encode otpauth URL', () => {
      const secret = 'JBSWY3DPEHPK3PXP';
      const email = 'user@example.com';
      const issuer = 'TestApp';
      
      const url = generateQRCodeURL(secret, email, issuer);
      
      // Extract and decode the data parameter
      const dataMatch = url.match(/data=([^&]+)/);
      expect(dataMatch).toBeTruthy();
      
      const decodedData = decodeURIComponent(dataMatch![1]);
      const expectedOtpauth = `otpauth://totp/${encodeURIComponent(issuer)}:${encodeURIComponent(email)}?secret=${secret}&issuer=${encodeURIComponent(issuer)}`;
      
      expect(decodedData).toBe(expectedOtpauth);
    });

    it('should use default issuer', () => {
      const secret = 'JBSWY3DPEHPK3PXP';
      const email = 'user@example.com';
      
      const url = generateQRCodeURL(secret, email);
      
      expect(url).toContain('Kafkasder');
    });

    it('should handle custom issuer', () => {
      const secret = 'JBSWY3DPEHPK3PXP';
      const email = 'user@example.com';
      const customIssuer = 'My Custom App';
      
      const url = generateQRCodeURL(secret, email, customIssuer);
      
      const dataMatch = url.match(/data=([^&]+)/);
      const decodedData = decodeURIComponent(dataMatch![1]);
      
      expect(decodedData).toContain('My%20Custom%20App');
    });

    it('should properly encode emails with special characters', () => {
      const secret = 'JBSWY3DPEHPK3PXP';
      const emailWithPlus = 'user+test@example.com';
      const emailWithSpace = 'user name@example.com';
      
      const url1 = generateQRCodeURL(secret, emailWithPlus);
      expect(url1).toContain(encodeURIComponent(emailWithPlus));
      
      const url2 = generateQRCodeURL(secret, emailWithSpace);
      expect(url2).toContain(encodeURIComponent(emailWithSpace));
    });
  });
});
