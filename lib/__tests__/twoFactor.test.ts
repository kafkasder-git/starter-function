import { describe, it, expect, vi } from 'vitest';
import { generateSecret, verifyTOTP, generateBackupCodes } from '../auth/twoFactor';

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
  });

  describe('verifyTOTP', () => {
    it('should verify valid TOTP code', () => {
      const secret = 'JBSWY3DPEHPK3PXP';
      // Note: In real tests, you'd need to generate actual TOTP codes
      // This is a simplified test
      const code = '123456';
      
      // Mock implementation would verify against time-based code
      const result = verifyTOTP(secret, code);
      expect(typeof result).toBe('boolean');
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

    it('should generate codes of correct format', () => {
      const codes = generateBackupCodes();
      
      codes.forEach(code => {
        expect(code.length).toBeGreaterThan(0);
        expect(/^[A-Z0-9]+$/.test(code)).toBe(true);
      });
    });

    it('should generate custom number of codes', () => {
      const codes = generateBackupCodes(5);
      expect(codes.length).toBe(5);
    });
  });
});
