/**
 * @fileoverview EmailSMS Service Tests
 * @description Unit tests for Email/SMS notification service
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { EmailSMSService } from '../emailSMSService';

// Mock monitoring service
vi.mock('../../services/monitoringService', () => ({
  monitoring: {
    trackApiCall: vi.fn(),
    trackEvent: vi.fn(),
  },
}));

describe('EmailSMSService', () => {
  let service: EmailSMSService;

  beforeEach(() => {
    service = EmailSMSService.getInstance();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Service Initialization', () => {
    it('should create singleton instance', () => {
      const instance1 = EmailSMSService.getInstance();
      const instance2 = EmailSMSService.getInstance();

      expect(instance1).toBe(instance2);
      expect(instance1).toBeDefined();
    });

    it('should initialize with default configuration', () => {
      const config = service.getConfiguration();

      expect(config.provider).toBe('mock');
    });

    it('should load templates on initialization', () => {
      const templates = service.getTemplates();

      expect(templates.length).toBeGreaterThan(0);
      expect(templates.some((t) => t.id === 'welcome-member')).toBe(true);
      expect(templates.some((t) => t.id === 'donation-receipt')).toBe(true);
    });
  });

  describe('Template Management', () => {
    it('should get template by ID', () => {
      const template = service.getTemplate('welcome-member');

      expect(template).toBeDefined();
      expect(template?.id).toBe('welcome-member');
      expect(template?.variables).toContain('name');
      expect(template?.variables).toContain('memberNumber');
    });

    it('should return null for non-existent template', () => {
      const template = service.getTemplate('non-existent');

      expect(template).toBeNull();
    });

    it('should render template with variables', () => {
      const template = service.getTemplate('verification-code')!;
      const rendered = service.renderTemplate(template, { code: '123456' });

      expect(rendered).toContain('123456');
      expect(rendered).toContain('Kafkas Derneği');
    });

    it('should get templates by category', () => {
      const userTemplates = service.getTemplates('user');
      const systemTemplates = service.getTemplates('system');

      expect(userTemplates.length).toBeGreaterThan(0);
      expect(systemTemplates.length).toBeGreaterThan(0);
      expect(userTemplates.every((t) => t.category === 'user')).toBe(true);
      expect(systemTemplates.every((t) => t.category === 'system')).toBe(true);
    });
  });

  describe('Email Operations', () => {
    it('should send email successfully', async () => {
      const emailData = {
        to: 'test@example.com',
        subject: 'Test Email',
        text: 'This is a test email',
        priority: 'normal' as const,
      };

      const result = await service.sendEmail(emailData);

      expect(result.success).toBe(true);
      expect(result.messageId).toBeDefined();
      expect(result.timestamp).toBeInstanceOf(Date);
      expect(result.provider).toBe('smtp');
    });

    it('should send email with template', async () => {
      const variables = {
        name: 'Test User',
        memberNumber: '12345',
        verificationLink: 'https://example.com/verify',
      };

      const result = await service.sendWithTemplate(
        'welcome-member',
        'test@example.com',
        variables,
      );

      expect(result.success).toBe(true);
      expect(result.messageId).toBeDefined();
    });

    it('should throw error for invalid template', async () => {
      await expect(
        service.sendWithTemplate('invalid-template', 'test@example.com', {}),
      ).rejects.toThrow('Template not found');
    });

    it('should handle email errors gracefully', async () => {
      // Mock SMTP failure
      vi.spyOn(service as any, 'sendWithSMTP').mockRejectedValueOnce(
        new Error('SMTP connection failed'),
      );

      const emailData = {
        to: 'test@example.com',
        subject: 'Test Email',
        text: 'This is a test email',
        priority: 'normal' as const,
      };

      await expect(service.sendEmail(emailData)).rejects.toThrow('SMTP connection failed');
    });
  });

  describe('SMS Operations', () => {
    it('should send SMS successfully', async () => {
      const smsData = {
        to: '+1234567890',
        subject: 'Test SMS',
        text: 'This is a test SMS',
        priority: 'normal' as const,
      };

      const result = await service.sendSMS(smsData);

      expect(result.success).toBe(true);
      expect(result.messageId).toBeDefined();
      expect(result.timestamp).toBeInstanceOf(Date);
      expect(result.provider).toBe('twilio');
      expect(result.cost).toBe(0.0075);
    });

    it('should send SMS with template', async () => {
      const variables = {
        code: '123456',
      };

      const result = await service.sendWithTemplate('verification-code', '+1234567890', variables);

      expect(result.success).toBe(true);
      expect(result.messageId).toBeDefined();
    });

    it('should handle SMS errors gracefully', async () => {
      // Mock Twilio failure
      vi.spyOn(service as any, 'sendWithTwilio').mockRejectedValueOnce(
        new Error('SMS service unavailable'),
      );

      const smsData = {
        to: '+1234567890',
        subject: 'Test SMS',
        text: 'This is a test SMS',
        priority: 'normal' as const,
      };

      await expect(service.sendSMS(smsData)).rejects.toThrow('SMS service unavailable');
    });
  });

  describe('Provider Switching', () => {
    it('should support multiple email providers', async () => {
      // Test SendGrid
      (service as any).emailConfig.provider = 'sendgrid';
      const result1 = await service.sendEmail({
        to: 'test@example.com',
        subject: 'Test',
        text: 'Test',
        priority: 'normal',
      });

      expect(result1.provider).toBe('sendgrid');
      expect(result1.cost).toBe(0.0001);

      // Test Mailgun
      (service as any).emailConfig.provider = 'mailgun';
      const result2 = await service.sendEmail({
        to: 'test@example.com',
        subject: 'Test',
        text: 'Test',
        priority: 'normal',
      });

      expect(result2.provider).toBe('mailgun');
      expect(result2.cost).toBe(0.0001);
    });

    it('should support multiple SMS providers', async () => {
      // Test NetGSM
      (service as any).smsConfig.provider = 'netgsm';
      const result1 = await service.sendSMS({
        to: '+1234567890',
        subject: 'Test',
        text: 'Test',
        priority: 'normal',
      });

      expect(result1.provider).toBe('netgsm');
      expect(result1.cost).toBe(0.005);

      // Test Twilio
      (service as any).smsConfig.provider = 'twilio';
      const result2 = await service.sendSMS({
        to: '+1234567890',
        subject: 'Test',
        text: 'Test',
        priority: 'normal',
      });

      expect(result2.provider).toBe('twilio');
      expect(result2.cost).toBe(0.0075);
    });
  });

  describe('Configuration Testing', () => {
    it('should test configuration successfully', async () => {
      const result = await service.testConfiguration();

      expect(result).toHaveProperty('email');
      expect(result).toHaveProperty('sms');
      expect(result).toHaveProperty('errors');
      expect(Array.isArray(result.errors)).toBe(true);
    });

    it('should handle configuration test failures', async () => {
      // Mock failures
      vi.spyOn(service as any, 'sendEmail').mockRejectedValueOnce(new Error('Email failed'));
      vi.spyOn(service as any, 'sendSMS').mockRejectedValueOnce(new Error('SMS failed'));

      const result = await service.testConfiguration();

      expect(result.email).toBe(false);
      expect(result.sms).toBe(false);
      expect(result.errors).toContain('Email test failed');
      expect(result.errors).toContain('SMS test failed');
    });
  });

  describe('Utility Functions', () => {
    it('should export utility functions', () => {
      expect(typeof sendEmail).toBe('function');
      expect(typeof sendSMS).toBe('function');
      expect(typeof sendWithTemplate).toBe('function');
      expect(typeof service.getTemplates).toBe('function');
    });

    it('should provide service instance', () => {
      expect(service).toBeDefined();
      expect(service instanceof EmailSMSService).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors', async () => {
      vi.spyOn(service as any, 'sendWithSMTP').mockRejectedValueOnce(new Error('Network timeout'));

      await expect(
        service.sendEmail({
          to: 'test@example.com',
          subject: 'Test',
          text: 'Test',
          priority: 'normal',
        }),
      ).rejects.toThrow('Network timeout');
    });

    it('should handle invalid email addresses', async () => {
      vi.spyOn(service as any, 'sendWithSMTP').mockRejectedValueOnce(
        new Error('Invalid email address'),
      );

      await expect(
        service.sendEmail({
          to: 'invalid-email',
          subject: 'Test',
          text: 'Test',
          priority: 'normal',
        }),
      ).rejects.toThrow('Invalid email address');
    });

    it('should handle SMS rate limiting', async () => {
      vi.spyOn(service as any, 'sendWithTwilio').mockRejectedValueOnce(
        new Error('Rate limit exceeded'),
      );

      await expect(
        service.sendSMS({
          to: '+1234567890',
          subject: 'Test',
          text: 'Test',
          priority: 'normal',
        }),
      ).rejects.toThrow('Rate limit exceeded');
    });
  });

  describe('Performance', () => {
    it('should handle concurrent requests', async () => {
      const promises = Array.from({ length: 5 }, (_, i) =>
        service.sendEmail({
          to: `test${i}@example.com`,
          subject: 'Concurrent Test',
          text: `Test message ${i}`,
          priority: 'normal',
        }),
      );

      const results = await Promise.all(promises);

      expect(results).toHaveLength(5);
      expect(results.every((r) => r.success)).toBe(true);
    });

    it('should process requests within reasonable time', async () => {
      const startTime = Date.now();

      await service.sendEmail({
        to: 'test@example.com',
        subject: 'Performance Test',
        text: 'Testing performance',
        priority: 'normal',
      });

      const duration = Date.now() - startTime;
      expect(duration).toBeLessThan(1000); // Should complete within 1 second
    });
  });
});
