/**
 * MCP Security Layer
 * Hassas verileri koruma ve güvenli erişim kontrolü
 */

import { z } from 'zod';
import crypto from 'crypto';

// API Key validation schema
const ApiKeySchema = z.object({
  key: z.string().min(32),
  permissions: z.array(z.string()),
  expiresAt: z.date().optional(),
  rateLimit: z.number().default(100),
});

/**
 * MCPSecurityManager Service
 * 
 * Service class for handling mcpsecuritymanager operations
 * 
 * @class MCPSecurityManager
 */
export class MCPSecurityManager {
  private readonly apiKeys = new Map<string, z.infer<typeof ApiKeySchema>>();
  private readonly rateLimitStore = new Map<string, { count: number; resetTime: number }>();

  constructor() {
    this.initializeDefaultKeys();
  }

  /**
   * API Key doğrulama
   */
  validateApiKey(key: string): boolean {
    const apiKey = this.apiKeys.get(key);
    if (!apiKey) return false;

    // Expiry kontrolü
    if (apiKey.expiresAt && apiKey.expiresAt < new Date()) {
      this.apiKeys.delete(key);
      return false;
    }

    return true;
  }

  /**
   * Rate limiting kontrolü
   */
  checkRateLimit(apiKey: string, endpoint: string): boolean {
    const key = `${apiKey}:${endpoint}`;
    const now = Date.now();
    const windowMs = 60 * 1000; // 1 dakika

    let rateLimitData = this.rateLimitStore.get(key);

    if (!rateLimitData ?? now > rateLimitData.resetTime) {
      rateLimitData = { count: 0, resetTime: now + windowMs };
    }

    const apiKeyData = this.apiKeys.get(apiKey);
    const limit = apiKeyData?.rateLimit ?? 100;

    if (rateLimitData.count >= limit) {
      return false;
    }

    rateLimitData.count++;
    this.rateLimitStore.set(key, rateLimitData);
    return true;
  }

  /**
   * Veri sanitizasyonu
   */
  sanitizeData(data: any): any {
    if (typeof data === 'string') {
      // XSS koruması
      return data
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;');
    }

    if (Array.isArray(data)) {
      return data.map((item) => this.sanitizeData(item));
    }

    if (typeof data === 'object' && data !== null) {
      const sanitized: any = {};
      for (const [key, value] of Object.entries(data)) {
        // Hassas alanları filtrele
        if (this.isSensitiveField(key)) {
          sanitized[key] = '[REDACTED]';
        } else {
          sanitized[key] = this.sanitizeData(value);
        }
      }
      return sanitized;
    }

    return data;
  }

  /**
   * Hassas alan kontrolü
   */
  private isSensitiveField(fieldName: string): boolean {
    const sensitiveFields = [
      'password',
      'token',
      'secret',
      'key',
      'auth',
      'ssn',
      'credit_card',
      'phone',
      'email',
    ];

    return sensitiveFields.some((field) => fieldName.toLowerCase().includes(field));
  }

  /**
   * Güvenli API key oluşturma
   */
  generateApiKey(permissions: string[], expiresInDays?: number): string {
    const key = crypto.randomBytes(32).toString('hex');
    const expiresAt = expiresInDays
      ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000)
      : undefined;

    this.apiKeys.set(key, {
      key,
      permissions,
      expiresAt,
      rateLimit: 100,
    });

    return key;
  }

  /**
   * Permission kontrolü
   */
  hasPermission(apiKey: string, requiredPermission: string): boolean {
    const keyData = this.apiKeys.get(apiKey);
    if (!keyData) return false;

    return keyData.permissions.includes(requiredPermission) || keyData.permissions.includes('*');
  }

  private initializeDefaultKeys() {
    // Development için default key
    if (process.env.NODE_ENV === 'development') {
      this.apiKeys.set('dev-key-12345', {
        key: 'dev-key-12345',
        permissions: ['*'],
        rateLimit: 1000,
      });
    }
  }
}

export const mcpSecurity = new MCPSecurityManager();
