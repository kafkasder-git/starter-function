/**
 * @fileoverview Two-Factor Authentication Flow Tests
 * @description Tests for 2FA database operations and user flows
 * Comment 5: Unit tests with Supabase mocked to assert DB contracts
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  enable2FA,
  verify2FASetup,
  verify2FALogin,
  disable2FA,
  is2FAEnabled,
  getBackupCodesCount,
  regenerateBackupCodes,
} from '../auth/twoFactor';

// Comment 5: Mock Supabase
vi.mock('../supabase', () => {
  const mockSupabase = {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(),
        })),
      })),
      upsert: vi.fn(),
      update: vi.fn(() => ({
        eq: vi.fn(),
      })),
    })),
  };

  return {
    supabase: mockSupabase,
  };
});

// Import after mock
import { supabase } from '../supabase';

describe('Two-Factor Authentication Flows', () => {
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.clearAllMocks();
    // Comment 6: Spy on console.error
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  describe('enable2FA', () => {
    it('should enable 2FA for valid user (happy path)', async () => {
      const userId = 'user-123';
      const mockUser = { email: 'user@example.com' };

      // Mock user fetch
      const singleMock = vi.fn().mockResolvedValue({ data: mockUser, error: null });
      const eqMock = vi.fn().mockReturnValue({ single: singleMock });
      const selectMock = vi.fn().mockReturnValue({ eq: eqMock });
      (supabase.from as any).mockReturnValue({ select: selectMock, upsert: vi.fn().mockResolvedValue({}) });

      const result = await enable2FA(userId);

      expect(result).toBeDefined();
      expect(result.secret).toBeDefined();
      expect(result.secret.length).toBe(32);
      expect(result.qrCodeURL).toContain('https://api.qrserver.com');
      expect(result.backupCodes).toHaveLength(10);

      // Verify database calls
      expect(supabase.from).toHaveBeenCalledWith('users');
      expect(selectMock).toHaveBeenCalledWith('email');
      expect(eqMock).toHaveBeenCalledWith('id', userId);
    });

    it('should throw error when user not found', async () => {
      const userId = 'invalid-user';

      const singleMock = vi.fn().mockResolvedValue({ data: null, error: null });
      const eqMock = vi.fn().mockReturnValue({ single: singleMock });
      const selectMock = vi.fn().mockReturnValue({ eq: eqMock });
      (supabase.from as any).mockReturnValue({ select: selectMock });

      await expect(enable2FA(userId)).rejects.toThrow('User not found');

      // Comment 6: Verify error logging
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Failed to enable 2FA:',
        expect.any(Error)
      );
    });

    // Comment 7: Security footgun documentation
    it.todo('should store encrypted secret and hashed backup codes in production');
  });

  describe('verify2FASetup', () => {
    it('should verify valid code and enable 2FA', async () => {
      const userId = 'user-123';
      const validCode = '123456';
      const mockTwoFA = { secret: 'JBSWY3DPEHPK3PXP' };

      // Mock 2FA fetch
      const singleMock = vi.fn().mockResolvedValue({ data: mockTwoFA, error: null });
      const eqMock = vi.fn().mockReturnValue({ single: singleMock });
      const selectMock = vi.fn().mockReturnValue({ eq: eqMock });
      
      // Mock update
      const updateEqMock = vi.fn().mockResolvedValue({});
      const updateMock = vi.fn().mockReturnValue({ eq: updateEqMock });
      
      (supabase.from as any).mockReturnValue({ 
        select: selectMock,
        update: updateMock,
      });

      // Mock verifyTOTP to return true
      vi.mock('../auth/twoFactor', async () => {
        const actual = await vi.importActual('../auth/twoFactor');
        return {
          ...actual,
          verifyTOTP: vi.fn().mockReturnValue(true),
        };
      });

      const result = await verify2FASetup(userId, validCode);

      expect(result).toBe(true);
      expect(updateMock).toHaveBeenCalledWith({ enabled: true });
      expect(updateEqMock).toHaveBeenCalledWith('user_id', userId);
    });

    it('should reject invalid code', async () => {
      const userId = 'user-123';
      const invalidCode = '000000';
      const mockTwoFA = { secret: 'JBSWY3DPEHPK3PXP' };

      const singleMock = vi.fn().mockResolvedValue({ data: mockTwoFA, error: null });
      const eqMock = vi.fn().mockReturnValue({ single: singleMock });
      const selectMock = vi.fn().mockReturnValue({ eq: eqMock });
      (supabase.from as any).mockReturnValue({ select: selectMock });

      const result = await verify2FASetup(userId, invalidCode);

      expect(result).toBe(false);
    });

    it('should throw error when 2FA not set up', async () => {
      const userId = 'user-123';
      const code = '123456';

      const singleMock = vi.fn().mockResolvedValue({ data: null, error: null });
      const eqMock = vi.fn().mockReturnValue({ single: singleMock });
      const selectMock = vi.fn().mockReturnValue({ eq: eqMock });
      (supabase.from as any).mockReturnValue({ select: selectMock });

      await expect(verify2FASetup(userId, code)).rejects.toThrow('2FA not set up');
    });
  });

  describe('verify2FALogin', () => {
    it('should return true when 2FA is disabled', async () => {
      const userId = 'user-123';
      const code = '123456';
      const mockTwoFA = { enabled: false };

      const singleMock = vi.fn().mockResolvedValue({ data: mockTwoFA, error: null });
      const eqMock = vi.fn().mockReturnValue({ single: singleMock });
      const selectMock = vi.fn().mockReturnValue({ eq: eqMock });
      (supabase.from as any).mockReturnValue({ select: selectMock });

      const result = await verify2FALogin(userId, code);

      expect(result).toBe(true);
    });

    it('should consume backup code and update database', async () => {
      const userId = 'user-123';
      const backupCode = 'BACKUP01';
      const mockTwoFA = {
        secret: 'JBSWY3DPEHPK3PXP',
        enabled: true,
        backup_codes: ['BACKUP01', 'BACKUP02', 'BACKUP03'],
      };

      const singleMock = vi.fn().mockResolvedValue({ data: mockTwoFA, error: null });
      const eqMock = vi.fn().mockReturnValue({ single: singleMock });
      const selectMock = vi.fn().mockReturnValue({ eq: eqMock });
      
      const updateEqMock = vi.fn().mockResolvedValue({});
      const updateMock = vi.fn().mockReturnValue({ eq: updateEqMock });
      
      (supabase.from as any).mockReturnValue({ 
        select: selectMock,
        update: updateMock,
      });

      const result = await verify2FALogin(userId, backupCode);

      expect(result).toBe(true);
      expect(updateMock).toHaveBeenCalledWith({
        backup_codes: ['BACKUP02', 'BACKUP03'],
      });
      expect(updateEqMock).toHaveBeenCalledWith('user_id', userId);
    });

    it('should return false for invalid code', async () => {
      const userId = 'user-123';
      const invalidCode = '000000';
      const mockTwoFA = {
        secret: 'JBSWY3DPEHPK3PXP',
        enabled: true,
        backup_codes: ['BACKUP01'],
      };

      const singleMock = vi.fn().mockResolvedValue({ data: mockTwoFA, error: null });
      const eqMock = vi.fn().mockReturnValue({ single: singleMock });
      const selectMock = vi.fn().mockReturnValue({ eq: eqMock });
      (supabase.from as any).mockReturnValue({ select: selectMock });

      const result = await verify2FALogin(userId, invalidCode);

      expect(result).toBe(false);
    });

    it('should handle database errors gracefully', async () => {
      const userId = 'user-123';
      const code = '123456';

      const singleMock = vi.fn().mockRejectedValue(new Error('Database error'));
      const eqMock = vi.fn().mockReturnValue({ single: singleMock });
      const selectMock = vi.fn().mockReturnValue({ eq: eqMock });
      (supabase.from as any).mockReturnValue({ select: selectMock });

      const result = await verify2FALogin(userId, code);

      expect(result).toBe(false);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Failed to verify 2FA login:',
        expect.any(Error)
      );
    });
  });

  describe('disable2FA', () => {
    it('should disable 2FA after verifying code', async () => {
      const userId = 'user-123';
      const validCode = '123456';
      const mockTwoFA = {
        secret: 'JBSWY3DPEHPK3PXP',
        enabled: true,
        backup_codes: [],
      };

      const singleMock = vi.fn().mockResolvedValue({ data: mockTwoFA, error: null });
      const eqMock = vi.fn().mockReturnValue({ single: singleMock });
      const selectMock = vi.fn().mockReturnValue({ eq: eqMock });
      
      const updateEqMock = vi.fn().mockResolvedValue({});
      const updateMock = vi.fn().mockReturnValue({ eq: updateEqMock });
      
      (supabase.from as any).mockReturnValue({ 
        select: selectMock,
        update: updateMock,
      });

      const result = await disable2FA(userId, validCode);

      expect(result).toBe(true);
      expect(updateMock).toHaveBeenCalledWith({ enabled: false });
    });

    it('should reject invalid verification code', async () => {
      const userId = 'user-123';
      const invalidCode = '000000';
      const mockTwoFA = {
        secret: 'JBSWY3DPEHPK3PXP',
        enabled: true,
        backup_codes: [],
      };

      const singleMock = vi.fn().mockResolvedValue({ data: mockTwoFA, error: null });
      const eqMock = vi.fn().mockReturnValue({ single: singleMock });
      const selectMock = vi.fn().mockReturnValue({ eq: eqMock });
      (supabase.from as any).mockReturnValue({ select: selectMock });

      const result = await disable2FA(userId, invalidCode);

      expect(result).toBe(false);
    });
  });

  describe('is2FAEnabled', () => {
    it('should return true when 2FA is enabled', async () => {
      const userId = 'user-123';
      const mockTwoFA = { enabled: true };

      const singleMock = vi.fn().mockResolvedValue({ data: mockTwoFA, error: null });
      const eqMock = vi.fn().mockReturnValue({ single: singleMock });
      const selectMock = vi.fn().mockReturnValue({ eq: eqMock });
      (supabase.from as any).mockReturnValue({ select: selectMock });

      const result = await is2FAEnabled(userId);

      expect(result).toBe(true);
    });

    it('should return false when 2FA is disabled', async () => {
      const userId = 'user-123';
      const mockTwoFA = { enabled: false };

      const singleMock = vi.fn().mockResolvedValue({ data: mockTwoFA, error: null });
      const eqMock = vi.fn().mockReturnValue({ single: singleMock });
      const selectMock = vi.fn().mockReturnValue({ eq: eqMock });
      (supabase.from as any).mockReturnValue({ select: selectMock });

      const result = await is2FAEnabled(userId);

      expect(result).toBe(false);
    });

    it('should return false on error', async () => {
      const userId = 'user-123';

      const singleMock = vi.fn().mockRejectedValue(new Error('Database error'));
      const eqMock = vi.fn().mockReturnValue({ single: singleMock });
      const selectMock = vi.fn().mockReturnValue({ eq: eqMock });
      (supabase.from as any).mockReturnValue({ select: selectMock });

      const result = await is2FAEnabled(userId);

      expect(result).toBe(false);
    });
  });

  describe('getBackupCodesCount', () => {
    it('should return correct backup codes count', async () => {
      const userId = 'user-123';
      const mockTwoFA = { backup_codes: ['CODE1', 'CODE2', 'CODE3'] };

      const singleMock = vi.fn().mockResolvedValue({ data: mockTwoFA, error: null });
      const eqMock = vi.fn().mockReturnValue({ single: singleMock });
      const selectMock = vi.fn().mockReturnValue({ eq: eqMock });
      (supabase.from as any).mockReturnValue({ select: selectMock });

      const result = await getBackupCodesCount(userId);

      expect(result).toBe(3);
    });

    it('should return 0 when no backup codes', async () => {
      const userId = 'user-123';
      const mockTwoFA = { backup_codes: [] };

      const singleMock = vi.fn().mockResolvedValue({ data: mockTwoFA, error: null });
      const eqMock = vi.fn().mockReturnValue({ single: singleMock });
      const selectMock = vi.fn().mockReturnValue({ eq: eqMock });
      (supabase.from as any).mockReturnValue({ select: selectMock });

      const result = await getBackupCodesCount(userId);

      expect(result).toBe(0);
    });
  });

  describe('regenerateBackupCodes', () => {
    it('should regenerate backup codes after verification', async () => {
      const userId = 'user-123';
      const validCode = '123456';
      const mockTwoFA = {
        secret: 'JBSWY3DPEHPK3PXP',
        enabled: true,
        backup_codes: ['OLD1', 'OLD2'],
      };

      const singleMock = vi.fn().mockResolvedValue({ data: mockTwoFA, error: null });
      const eqMock = vi.fn().mockReturnValue({ single: singleMock });
      const selectMock = vi.fn().mockReturnValue({ eq: eqMock });
      
      const updateEqMock = vi.fn().mockResolvedValue({});
      const updateMock = vi.fn().mockReturnValue({ eq: updateEqMock });
      
      (supabase.from as any).mockReturnValue({ 
        select: selectMock,
        update: updateMock,
      });

      const result = await regenerateBackupCodes(userId, validCode);

      expect(result).toBeDefined();
      expect(result).toHaveLength(10);
      expect(result).not.toContain('OLD1');
      expect(result).not.toContain('OLD2');
    });

    it('should throw error for invalid verification code', async () => {
      const userId = 'user-123';
      const invalidCode = '000000';
      const mockTwoFA = {
        secret: 'JBSWY3DPEHPK3PXP',
        enabled: true,
        backup_codes: [],
      };

      const singleMock = vi.fn().mockResolvedValue({ data: mockTwoFA, error: null });
      const eqMock = vi.fn().mockReturnValue({ single: singleMock });
      const selectMock = vi.fn().mockReturnValue({ eq: eqMock });
      (supabase.from as any).mockReturnValue({ select: selectMock });

      await expect(regenerateBackupCodes(userId, invalidCode)).rejects.toThrow(
        'Invalid verification code'
      );
    });
  });

  // Comment 7: Security footgun documentation
  describe('Security Considerations', () => {
    it.todo('should encrypt secrets before storing in database');
    it.todo('should hash backup codes before storing in database');
    it.todo('should use crypto.getRandomValues() for secret generation');
    it.todo('should implement proper HMAC-SHA1 for TOTP generation');
    it.todo('should rate-limit 2FA verification attempts');
  });
});
