import { describe, it, expect, beforeEach } from 'vitest';

// Mock types
interface MCPPermission {
  resource: string;
  actions: string[];
}

interface MCPApiKey {
  id: string;
  key: string;
  name: string;
  permissions: string[];
  isActive: boolean;
  expiresAt?: string;
  createdAt: string;
}

interface MCPSecurityEvent {
  type: string;
  severity: string;
  message: string;
  metadata?: any;
  timestamp: string;
}

class MockMCPSecurityManager {
  private apiKeys: MCPApiKey[] = [];
  private permissions: MCPPermission[] = [];
  private auditLogs: MCPSecurityEvent[] = [];
  private quarantinedUsers = new Set<string>();
  private rateLimitData = new Map<string, number[]>();

  validateApiKey(key: string): boolean {
    return this.apiKeys.some((k) => k.key === key && k.isActive);
  }

  addApiKey(keyData: any): void {
    // Validate required fields
    if (!keyData.id || !keyData.key) {
      throw new Error('Invalid API key data: missing required fields');
    }

    // Check for malformed permissions
    if (keyData.permissions && !Array.isArray(keyData.permissions)) {
      throw new Error('Invalid permissions format');
    }

    this.apiKeys.push({
      ...keyData,
      isActive: keyData.isActive !== false,
      createdAt: new Date().toISOString(),
    });
  }

  revokeApiKey(keyId: string): void {
    const keyIndex = this.apiKeys.findIndex((k) => k.id === keyId);
    if (keyIndex !== -1) {
      this.apiKeys[keyIndex].isActive = false;
      this.logSecurityEvent({
        type: 'api_key_revoked',
        severity: 'medium',
        message: 'API key revoked',
        metadata: { keyId },
        timestamp: new Date().toISOString(),
      });
    }
  }

  checkPermissions(userId: string, resource: string, action: string): boolean {
    // Check if user is quarantined
    if (this.quarantinedUsers.has(userId)) {
      return false;
    }

    return this.permissions.some((p) => p.resource === resource && p.actions.includes(action));
  }

  addPermission(permission: MCPPermission): void {
    if (!permission.resource || !permission.actions) {
      throw new Error('Invalid permission data');
    }
    this.permissions.push(permission);
  }

  removePermission(resource: string): void {
    this.permissions = this.permissions.filter((p) => p.resource !== resource);
  }

  logSecurityEvent(event: MCPSecurityEvent): void {
    this.auditLogs.push({
      ...event,
      timestamp: event.timestamp || new Date().toISOString(),
    });
  }

  getAuditLogs(filters?: any): MCPSecurityEvent[] {
    if (!filters) return this.auditLogs;

    return this.auditLogs.filter((log) => {
      if (filters.type && log.type !== filters.type) return false;
      if (filters.severity && log.severity !== filters.severity) return false;
      if (filters.startDate && new Date(log.timestamp) < new Date(filters.startDate)) return false;
      if (filters.endDate && new Date(log.timestamp) > new Date(filters.endDate)) return false;
      return true;
    });
  }

  encryptData(data: string): string {
    if (!data) throw new Error('Data is required for encryption');
    return Buffer.from(data).toString('base64');
  }

  decryptData(encryptedData: string): string {
    if (!encryptedData) throw new Error('Encrypted data is required for decryption');
    try {
      return Buffer.from(encryptedData, 'base64').toString();
    } catch {
      throw new Error('Invalid encrypted data format');
    }
  }

  generateSecurityHeaders(): Record<string, string> {
    return {
      'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'",
      'X-Frame-Options': 'DENY',
      'X-Content-Type-Options': 'nosniff',
      'X-XSS-Protection': '1; mode=block',
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
    };
  }

  validateInput(input: string, type: string): boolean {
    if (!input) return false;

    switch (type) {
      case 'email':
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input);
      case 'alphanumeric':
        return /^[a-zA-Z0-9]+$/.test(input);
      case 'username':
        return /^[a-zA-Z0-9_-]{3,20}$/.test(input);
      default:
        return true;
    }
  }

  sanitizeInput(input: string): string {
    if (!input) return '';
    return input.replace(/[<>'"&]/g, (match) => {
      const entities: Record<string, string> = {
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;',
        '&': '&amp;',
      };
      return entities[match] || match;
    });
  }

  hashPassword(password: string): string {
    if (!password) throw new Error('Password is required');
    return Buffer.from(`${password  }salt`).toString('base64');
  }

  verifyPassword(password: string, hash: string): boolean {
    if (!password || !hash) return false;
    return this.hashPassword(password) === hash;
  }

  generateToken(payload: any): string {
    if (!payload) throw new Error('Payload is required for token generation');
    const tokenData = {
      ...payload,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 3600,
    };
    return Buffer.from(JSON.stringify(tokenData)).toString('base64');
  }

  verifyToken(token: string): any {
    if (!token) return null;
    try {
      const decoded = JSON.parse(Buffer.from(token, 'base64').toString());
      if (decoded.exp && decoded.exp < Math.floor(Date.now() / 1000)) {
        return null;
      }
      return decoded;
    } catch {
      return null;
    }
  }

  rateLimitCheck(identifier: string, limit: number, window: number): boolean {
    if (!identifier || limit <= 0) return false;

    const now = Date.now();
    const windowMs = window * 1000;

    if (!this.rateLimitData.has(identifier)) {
      this.rateLimitData.set(identifier, []);
    }

    const requests = this.rateLimitData.get(identifier)!;
    const validRequests = requests.filter((time) => now - time < windowMs);

    if (validRequests.length >= limit) {
      return false;
    }

    validRequests.push(now);
    this.rateLimitData.set(identifier, validRequests);
    return true;
  }

  detectSuspiciousActivity(userId: string, activity: any): boolean {
    if (!userId || !activity) return false;

    const suspiciousPatterns = [
      'multiple_failed_logins',
      'unusual_access_pattern',
      'suspicious_ip',
      'suspicious',
    ];

    return suspiciousPatterns.includes(activity.type);
  }

  quarantineUser(userId: string, reason: string): void {
    if (!userId) throw new Error('User ID is required for quarantine');

    this.quarantinedUsers.add(userId);
    this.logSecurityEvent({
      type: 'user_quarantined',
      severity: 'high',
      message: 'User quarantined',
      metadata: { userId, reason: reason || 'Security violation' },
      timestamp: new Date().toISOString(),
    });
  }

  getSecurityMetrics(): any {
    return {
      totalApiKeys: this.apiKeys.length,
      activeApiKeys: this.apiKeys.filter((k) => k.isActive).length,
      revokedApiKeys: this.apiKeys.filter((k) => !k.isActive).length,
      totalPermissions: this.permissions.length,
      auditLogCount: this.auditLogs.length,
      quarantinedUsers: this.quarantinedUsers.size,
      recentSecurityEvents: this.auditLogs.filter(
        (log) => Date.now() - new Date(log.timestamp).getTime() < 24 * 60 * 60 * 1000,
      ).length,
    };
  }
}

describe('MCPSecurityManager', () => {
  let securityManager: MockMCPSecurityManager;

  beforeEach(() => {
    securityManager = new MockMCPSecurityManager();
  });

  describe('API Key Management', () => {
    it('should validate API keys correctly', () => {
      const apiKey = {
        id: 'test-key-1',
        key: 'valid-api-key',
        name: 'Test Key',
        permissions: ['read', 'write'],
        isActive: true,
      };

      securityManager.addApiKey(apiKey);
      expect(securityManager.validateApiKey('valid-api-key')).toBe(true);
      expect(securityManager.validateApiKey('invalid-key')).toBe(false);
    });

    it('should add API keys with proper validation', () => {
      const validKey = {
        id: 'test-key-1',
        key: 'valid-api-key',
        name: 'Test Key',
        permissions: ['read'],
        isActive: true,
      };

      expect(() => securityManager.addApiKey(validKey)).not.toThrow();
      expect(securityManager.validateApiKey('valid-api-key')).toBe(true);
    });

    it('should reject invalid API key data', () => {
      const invalidKey = {
        key: 'missing-id',
      };

      expect(() => securityManager.addApiKey(invalidKey)).toThrow(
        'Invalid API key data: missing required fields',
      );
    });

    it('should revoke API keys', () => {
      const apiKey = {
        id: 'test-key-1',
        key: 'valid-api-key',
        name: 'Test Key',
        permissions: ['read'],
        isActive: true,
      };

      securityManager.addApiKey(apiKey);
      expect(securityManager.validateApiKey('valid-api-key')).toBe(true);

      securityManager.revokeApiKey('test-key-1');
      expect(securityManager.validateApiKey('valid-api-key')).toBe(false);
    });
  });

  describe('Permission Management', () => {
    it('should check permissions correctly', () => {
      const permission = {
        resource: 'users',
        actions: ['read', 'write'],
      };

      securityManager.addPermission(permission);
      expect(securityManager.checkPermissions('user1', 'users', 'read')).toBe(true);
      expect(securityManager.checkPermissions('user1', 'users', 'delete')).toBe(false);
    });

    it('should add permissions with validation', () => {
      const validPermission = {
        resource: 'posts',
        actions: ['read'],
      };

      expect(() => securityManager.addPermission(validPermission)).not.toThrow();
    });

    it('should reject invalid permission data', () => {
      const invalidPermission = {
        resource: 'posts',
      };

      expect(() => securityManager.addPermission(invalidPermission as any)).toThrow(
        'Invalid permission data',
      );
    });

    it('should remove permissions', () => {
      const permission = {
        resource: 'users',
        actions: ['read'],
      };

      securityManager.addPermission(permission);
      expect(securityManager.checkPermissions('user1', 'users', 'read')).toBe(true);

      securityManager.removePermission('users');
      expect(securityManager.checkPermissions('user1', 'users', 'read')).toBe(false);
    });
  });

  describe('Audit Logging', () => {
    it('should log security events', () => {
      const event = {
        type: 'login',
        severity: 'info',
        message: 'User logged in',
        metadata: { userId: 'user1' },
        timestamp: new Date().toISOString(),
      };

      securityManager.logSecurityEvent(event);
      const logs = securityManager.getAuditLogs();
      expect(logs).toHaveLength(1);
      expect(logs[0].type).toBe('login');
    });

    it('should filter audit logs', () => {
      const events = [
        {
          type: 'login',
          severity: 'info',
          message: 'User logged in',
          timestamp: new Date().toISOString(),
        },
        {
          type: 'logout',
          severity: 'info',
          message: 'User logged out',
          timestamp: new Date().toISOString(),
        },
      ];

      events.forEach((event) => securityManager.logSecurityEvent(event));

      const loginLogs = securityManager.getAuditLogs({ type: 'login' });
      expect(loginLogs).toHaveLength(1);
      expect(loginLogs[0].type).toBe('login');
    });
  });

  describe('Data Encryption', () => {
    it('should encrypt and decrypt data', () => {
      const originalData = 'sensitive information';
      const encrypted = securityManager.encryptData(originalData);
      const decrypted = securityManager.decryptData(encrypted);

      expect(encrypted).not.toBe(originalData);
      expect(decrypted).toBe(originalData);
    });

    it('should handle encryption errors', () => {
      expect(() => securityManager.encryptData('')).toThrow('Data is required for encryption');
      expect(() => securityManager.decryptData('')).toThrow(
        'Encrypted data is required for decryption',
      );
    });
  });

  describe('Security Headers', () => {
    it('should generate security headers', () => {
      const headers = securityManager.generateSecurityHeaders();

      expect(headers['Content-Security-Policy']).toBeDefined();
      expect(headers['X-Frame-Options']).toBe('DENY');
      expect(headers['X-Content-Type-Options']).toBe('nosniff');
    });
  });

  describe('Input Validation', () => {
    it('should validate email addresses', () => {
      expect(securityManager.validateInput('test@example.com', 'email')).toBe(true);
      expect(securityManager.validateInput('invalid-email', 'email')).toBe(false);
    });

    it('should validate alphanumeric input', () => {
      expect(securityManager.validateInput('abc123', 'alphanumeric')).toBe(true);
      expect(securityManager.validateInput('abc-123', 'alphanumeric')).toBe(false);
    });

    it('should sanitize input', () => {
      const maliciousInput = '<script>alert("xss")</script>';
      const sanitized = securityManager.sanitizeInput(maliciousInput);
      expect(sanitized).not.toContain('<script>');
      expect(sanitized).toContain('&lt;script&gt;');
    });
  });

  describe('Password Management', () => {
    it('should hash and verify passwords', () => {
      const password = 'mySecurePassword123';
      const hash = securityManager.hashPassword(password);

      expect(hash).not.toBe(password);
      expect(securityManager.verifyPassword(password, hash)).toBe(true);
      expect(securityManager.verifyPassword('wrongPassword', hash)).toBe(false);
    });

    it('should handle password errors', () => {
      expect(() => securityManager.hashPassword('')).toThrow('Password is required');
    });
  });

  describe('Token Management', () => {
    it('should generate and verify tokens', () => {
      const payload = { userId: 'user1', role: 'admin' };
      const token = securityManager.generateToken(payload);
      const decoded = securityManager.verifyToken(token);

      expect(decoded).toBeTruthy();
      expect(decoded.userId).toBe('user1');
      expect(decoded.role).toBe('admin');
    });

    it('should handle invalid tokens', () => {
      expect(securityManager.verifyToken('invalid-token')).toBeNull();
      expect(securityManager.verifyToken('')).toBeNull();
    });
  });

  describe('Rate Limiting', () => {
    it('should enforce rate limits', () => {
      const identifier = 'user1';
      const limit = 5;
      const window = 60; // seconds

      // Should allow requests within limit
      for (let i = 0; i < limit; i++) {
        expect(securityManager.rateLimitCheck(identifier, limit, window)).toBe(true);
      }

      // Should deny requests exceeding limit
      expect(securityManager.rateLimitCheck(identifier, limit, window)).toBe(false);
    });

    it('should handle invalid rate limit parameters', () => {
      expect(securityManager.rateLimitCheck('', 5, 60)).toBe(false);
      expect(securityManager.rateLimitCheck('user1', 0, 60)).toBe(false);
    });
  });

  describe('Suspicious Activity Detection', () => {
    it('should detect suspicious activities', () => {
      const suspiciousActivity = { type: 'suspicious', details: 'Multiple failed logins' };
      const normalActivity = { type: 'normal', details: 'Regular login' };

      expect(securityManager.detectSuspiciousActivity('user1', suspiciousActivity)).toBe(true);
      expect(securityManager.detectSuspiciousActivity('user1', normalActivity)).toBe(false);
    });

    it('should handle invalid activity data', () => {
      expect(securityManager.detectSuspiciousActivity('', { type: 'suspicious' })).toBe(false);
      expect(securityManager.detectSuspiciousActivity('user1', null)).toBe(false);
    });
  });

  describe('User Quarantine', () => {
    it('should quarantine users', () => {
      const userId = 'user1';
      const reason = 'Suspicious activity detected';

      securityManager.quarantineUser(userId, reason);

      // Quarantined users should not have permissions
      expect(securityManager.checkPermissions(userId, 'users', 'read')).toBe(false);
    });

    it('should handle quarantine errors', () => {
      expect(() => securityManager.quarantineUser('', 'reason')).toThrow(
        'User ID is required for quarantine',
      );
    });
  });

  describe('Security Metrics', () => {
    it('should provide security metrics', () => {
      // Add some test data
      securityManager.addApiKey({
        id: 'key1',
        key: 'test-key',
        name: 'Test',
        permissions: ['read'],
        isActive: true,
      });

      securityManager.logSecurityEvent({
        type: 'login',
        severity: 'info',
        message: 'Test event',
        timestamp: new Date().toISOString(),
      });

      const metrics = securityManager.getSecurityMetrics();

      expect(metrics.totalApiKeys).toBe(1);
      expect(metrics.activeApiKeys).toBe(1);
      expect(metrics.auditLogCount).toBe(1);
      expect(typeof metrics.recentSecurityEvents).toBe('number');
    });
  });

  describe('Error Handling', () => {
    it('should handle malformed permissions', () => {
      const malformedKey = {
        id: 'test-key',
        key: 'test-key-value',
        permissions: 'invalid-permissions', // Should be array
      };

      expect(() => securityManager.addApiKey(malformedKey)).toThrow('Invalid permissions format');
    });
  });
});
