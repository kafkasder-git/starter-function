/**
 * @fileoverview Two-Factor Authentication (2FA) Implementation
 * @description TOTP-based 2FA for enhanced security
 */

import { supabase } from '../supabase';

/**
 * Generate TOTP secret
 */
export function generateSecret(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let secret = '';
  
  for (let i = 0; i < 32; i++) {
    secret += chars[Math.floor(Math.random() * chars.length)];
  }
  
  return secret;
}

/**
 * Generate QR code URL for authenticator apps
 */
export function generateQRCodeURL(
  secret: string,
  email: string,
  issuer: string = 'Kafkasder'
): string {
  const otpauthURL = `otpauth://totp/${encodeURIComponent(issuer)}:${encodeURIComponent(email)}?secret=${secret}&issuer=${encodeURIComponent(issuer)}`;
  return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(otpauthURL)}`;
}

/**
 * Simple hash function (replace with proper HMAC-SHA1 in production)
 */
function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

/**
 * Generate TOTP code (for testing/backup)
 * @internal Exported for testing purposes
 */
export function generateTOTP(secret: string, window: number = 0): string {
  const epoch = Math.floor(Date.now() / 1000);
  const time = Math.floor(epoch / 30) + window;
  
  // Simple TOTP implementation (in production, use a library like otplib)
  const hash = simpleHash(secret + time.toString());
  const code = (hash % 1000000).toString().padStart(6, '0');
  
  return code;
}

/**
 * Generate TOTP code for specific timestamp (for testing)
 * @internal Exported for testing purposes
 */
export function computeTOTPForTest(secret: string, timestamp: number): string {
  const time = Math.floor(timestamp / 1000 / 30);
  const hash = simpleHash(secret + time.toString());
  const code = (hash % 1000000).toString().padStart(6, '0');
  return code;
}

/**
 * Verify TOTP code
 */
export function verifyTOTP(secret: string, code: string): boolean {
  // Check current window and ±1 window for clock drift
  for (let window = -1; window <= 1; window++) {
    const expectedCode = generateTOTP(secret, window);
    if (expectedCode === code) {
      return true;
    }
  }
  
  return false;
}

/**
 * Enable 2FA for user
 */
export async function enable2FA(userId: string): Promise<{
  secret: string;
  qrCodeURL: string;
  backupCodes: string[];
}> {
  try {
    // Get user email
    const { data: user } = await supabase
      .from('users')
      .select('email')
      .eq('id', userId)
      .single();

    if (!user) {
      throw new Error('User not found');
    }

    // Generate secret
    const secret = generateSecret();
    
    // Generate QR code URL
    const qrCodeURL = generateQRCodeURL(secret, user.email);
    
    // Generate backup codes
    const backupCodes = generateBackupCodes();
    
    // Store in database (encrypted)
    await supabase
      .from('user_2fa')
      .upsert({
        user_id: userId,
        secret: secret, // Should be encrypted in production
        backup_codes: backupCodes, // Should be hashed in production
        enabled: false, // Will be enabled after verification
        created_at: new Date().toISOString(),
      });

    return {
      secret,
      qrCodeURL,
      backupCodes,
    };
  } catch (error) {
    console.error('Failed to enable 2FA:', error);
    throw error;
  }
}

/**
 * Verify and activate 2FA
 */
export async function verify2FASetup(
  userId: string,
  code: string
): Promise<boolean> {
  try {
    // Get user's 2FA secret
    const { data: twoFA } = await supabase
      .from('user_2fa')
      .select('secret')
      .eq('user_id', userId)
      .single();

    if (!twoFA) {
      throw new Error('2FA not set up');
    }

    // Verify code
    const isValid = verifyTOTP(twoFA.secret, code);
    
    if (isValid) {
      // Enable 2FA
      await supabase
        .from('user_2fa')
        .update({ enabled: true })
        .eq('user_id', userId);
      
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Failed to verify 2FA setup:', error);
    throw error;
  }
}

/**
 * Verify 2FA code during login
 */
export async function verify2FALogin(
  userId: string,
  code: string
): Promise<boolean> {
  try {
    // Get user's 2FA settings
    const { data: twoFA } = await supabase
      .from('user_2fa')
      .select('secret, enabled, backup_codes')
      .eq('user_id', userId)
      .single();

    if (!twoFA || !twoFA.enabled) {
      return true; // 2FA not enabled
    }

    // Check if it's a backup code
    if (twoFA.backup_codes && twoFA.backup_codes.includes(code)) {
      // Remove used backup code
      const updatedCodes = twoFA.backup_codes.filter((c: string) => c !== code);
      await supabase
        .from('user_2fa')
        .update({ backup_codes: updatedCodes })
        .eq('user_id', userId);
      
      return true;
    }

    // Verify TOTP code
    return verifyTOTP(twoFA.secret, code);
  } catch (error) {
    console.error('Failed to verify 2FA login:', error);
    return false;
  }
}

/**
 * Disable 2FA
 */
export async function disable2FA(userId: string, code: string): Promise<boolean> {
  try {
    // Verify code before disabling
    const isValid = await verify2FALogin(userId, code);
    
    if (!isValid) {
      return false;
    }

    // Disable 2FA
    await supabase
      .from('user_2fa')
      .update({ enabled: false })
      .eq('user_id', userId);

    return true;
  } catch (error) {
    console.error('Failed to disable 2FA:', error);
    throw error;
  }
}

/**
 * Generate backup codes
 */
export function generateBackupCodes(count: number = 10): string[] {
  const codes: string[] = [];
  
  for (let i = 0; i < count; i++) {
    const code = Math.random().toString(36).substring(2, 10).toUpperCase();
    codes.push(code);
  }
  
  return codes;
}

/**
 * Check if user has 2FA enabled
 */
export async function is2FAEnabled(userId: string): Promise<boolean> {
  try {
    const { data } = await supabase
      .from('user_2fa')
      .select('enabled')
      .eq('user_id', userId)
      .single();

    return data?.enabled || false;
  } catch (error) {
    return false;
  }
}

/**
 * Get remaining backup codes count
 */
export async function getBackupCodesCount(userId: string): Promise<number> {
  try {
    const { data } = await supabase
      .from('user_2fa')
      .select('backup_codes')
      .eq('user_id', userId)
      .single();

    return data?.backup_codes?.length || 0;
  } catch (error) {
    return 0;
  }
}

/**
 * Regenerate backup codes
 */
export async function regenerateBackupCodes(
  userId: string,
  code: string
): Promise<string[]> {
  try {
    // Verify current code
    const isValid = await verify2FALogin(userId, code);
    
    if (!isValid) {
      throw new Error('Invalid verification code');
    }

    // Generate new backup codes
    const backupCodes = generateBackupCodes();
    
    // Update in database
    await supabase
      .from('user_2fa')
      .update({ backup_codes: backupCodes })
      .eq('user_id', userId);

    return backupCodes;
  } catch (error) {
    console.error('Failed to regenerate backup codes:', error);
    throw error;
  }
}

export default {
  generateSecret,
  generateQRCodeURL,
  verifyTOTP,
  enable2FA,
  verify2FASetup,
  verify2FALogin,
  disable2FA,
  generateBackupCodes,
  is2FAEnabled,
  getBackupCodesCount,
  regenerateBackupCodes,
};
