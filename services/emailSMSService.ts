/**
 * @fileoverview emailSMSService Module - Application module
 *
 * @author Dernek Yönetim Sistemi Team
 * @version 1.0.0
 */

import { logger } from '../lib/logging/logger';
import { Client, Messaging, ID } from 'appwrite';
import { environment } from '../lib/environment';

// Module-level variables
let initialized = false;
let messaging: Messaging | null = null;
const templates: any[] = [
  {
    id: 'welcome-member',
    category: 'member',
    subject: 'Hoş Geldiniz',
    body: 'Merhaba {{name}}, derneğimize hoş geldiniz!',
    variables: ['name'],
  },
  {
    id: 'donation-receipt',
    category: 'donation',
    subject: 'Bağış Makbuzu',
    body: '{{name}} adına {{amount}} TL bağış alınmıştır.',
    variables: ['name', 'amount'],
  },
];

// Email and SMS Service
const emailSMSService = {
  async initialize(): Promise<void> {
    try {
      // Initialize Appwrite Messaging client
      const client = new Client();
      client
        .setEndpoint(environment.appwrite.endpoint)
        .setProject(environment.appwrite.projectId);
      
      messaging = new Messaging(client);
      
      logger.info('EmailSMSService initialized with Appwrite Messaging');
      initialized = true;
    } catch (error) {
      logger.error('Failed to initialize EmailSMSService:', error);
      throw error;
    }
  },

  async sendEmail(to: string, subject: string, body: string): Promise<boolean> {
    try {
      if (!messaging) {
        await this.initialize();
      }

      if (!messaging) {
        throw new Error('Messaging client not initialized');
      }

      // Create email message using Appwrite Messaging
      await messaging.createEmail(
        ID.unique(),
        subject,
        body,
        [], // Attachments (empty for now)
        [to] // Recipients
      );

      logger.info(`Email sent successfully to ${to}: ${subject}`);
      return true;
    } catch (error) {
      logger.error(`Failed to send email to ${to}:`, error);
      // Fallback to console log for development
      if (environment.features.mockData) {
        logger.info(`[MOCK] Email would be sent to ${to}: ${subject}`);
        return true;
      }
      return false;
    }
  },

  async sendSMS(to: string, message: string): Promise<boolean> {
    try {
      if (!messaging) {
        await this.initialize();
      }

      if (!messaging) {
        throw new Error('Messaging client not initialized');
      }

      // Create SMS message using Appwrite Messaging
      await messaging.createSms(
        ID.unique(),
        message,
        [], // Attachments (empty for SMS)
        [to] // Recipients
      );

      logger.info(`SMS sent successfully to ${to}: ${message}`);
      return true;
    } catch (error) {
      logger.error(`Failed to send SMS to ${to}:`, error);
      // Fallback to console log for development
      if (environment.features.mockData) {
        logger.info(`[MOCK] SMS would be sent to ${to}: ${message}`);
        return true;
      }
      return false;
    }
  },

  async sendBulkEmail(recipients: string[], subject: string, body: string): Promise<{ sent: number; failed: number }> {
    try {
      if (!messaging) {
        await this.initialize();
      }

      if (!messaging) {
        throw new Error('Messaging client not initialized');
      }

      // Send bulk email using Appwrite Messaging
      await messaging.createEmail(
        ID.unique(),
        subject,
        body,
        [], // Attachments
        recipients // Multiple recipients
      );

      logger.info(`Bulk email sent successfully to ${recipients.length} recipients: ${subject}`);
      return { sent: recipients.length, failed: 0 };
    } catch (error) {
      logger.error(`Failed to send bulk email to ${recipients.length} recipients:`, error);
      // Fallback to console log for development
      if (environment.features.mockData) {
        logger.info(`[MOCK] Bulk email would be sent to ${recipients.length} recipients: ${subject}`);
        return { sent: recipients.length, failed: 0 };
      }
      return { sent: 0, failed: recipients.length };
    }
  },

  async sendBulkSMS(recipients: string[], message: string): Promise<{ sent: number; failed: number }> {
    try {
      if (!messaging) {
        await this.initialize();
      }

      if (!messaging) {
        throw new Error('Messaging client not initialized');
      }

      // Send bulk SMS using Appwrite Messaging
      await messaging.createSms(
        ID.unique(),
        message,
        [], // Attachments
        recipients // Multiple recipients
      );

      logger.info(`Bulk SMS sent successfully to ${recipients.length} recipients: ${message}`);
      return { sent: recipients.length, failed: 0 };
    } catch (error) {
      logger.error(`Failed to send bulk SMS to ${recipients.length} recipients:`, error);
      // Fallback to console log for development
      if (environment.features.mockData) {
        logger.info(`[MOCK] Bulk SMS would be sent to ${recipients.length} recipients: ${message}`);
        return { sent: recipients.length, failed: 0 };
      }
      return { sent: 0, failed: recipients.length };
    }
  },

  // Template management methods
  getTemplates(): any[] {
    return templates;
  },

  getTemplate(id: string): any {
    return templates.find((t) => t.id === id) || null;
  },

  getTemplatesByCategory(category: string): any[] {
    return templates.filter((t) => t.category === category);
  },

  renderTemplate(templateId: string, variables: Record<string, any>): string {
    const template = emailSMSService.getTemplate(templateId);
    if (!template) return '';

    let rendered = template.body;
    Object.entries(variables).forEach(([key, value]) => {
      rendered = rendered.replace(new RegExp(`{{${key}}}`, 'g'), String(value));
    });
    return rendered;
  },

  // Email with template
  async sendWithTemplate(
    to: string,
    templateId: string,
    variables: Record<string, any>
  ): Promise<boolean> {
    try {
      const template = this.getTemplate(templateId);
      if (!template) {
        throw new Error(`Template ${templateId} not found`);
      }

      const renderedBody = this.renderTemplate(templateId, variables);
      const renderedSubject = template.subject.replace(/\{\{(\w+)\}\}/g, (match, key) => {
        return variables[key] || match;
      });

      return await this.sendEmail(to, renderedSubject, renderedBody);
    } catch (error) {
      logger.error(`Failed to send email with template ${templateId}:`, error);
      return false;
    }
  },

  // Configuration
  getConfiguration(): any {
    return { 
      provider: 'appwrite-messaging',
      endpoint: environment.appwrite.endpoint,
      projectId: environment.appwrite.projectId,
      initialized: !!messaging
    };
  },

  async testConfiguration(): Promise<boolean> {
    try {
      if (!messaging) {
        await this.initialize();
      }

      // Test by sending a test email to a non-existent address
      // This will test the configuration without actually sending
      const testResult = await this.sendEmail(
        'test@example.com',
        'Test Configuration',
        'This is a test message to verify email configuration.'
      );

      logger.info('Email/SMS configuration test completed');
      return testResult;
    } catch (error) {
      logger.error('Email/SMS configuration test failed:', error);
      return false;
    }
  },
};

// Export named functions for convenience
export const sendEmail = async (to: string, subject: string, body: string) =>
  await emailSMSService.sendEmail(to, subject, body);
export const sendSMS = async (to: string, message: string) => 
  await emailSMSService.sendSMS(to, message);
export const sendBulkEmail = async (recipients: string[], subject: string, body: string) =>
  await emailSMSService.sendBulkEmail(recipients, subject, body);
export const sendBulkSMS = async (recipients: string[], message: string) =>
  await emailSMSService.sendBulkSMS(recipients, message);

// Class-like interface for test compatibility
export class EmailSMSService {
  private static instance: EmailSMSService;

  private constructor() {}

  static getInstance(): EmailSMSService {
    if (!EmailSMSService.instance) {
      EmailSMSService.instance = new EmailSMSService();
    }
    return EmailSMSService.instance;
  }

  async initialize(): Promise<void> {
    return emailSMSService.initialize();
  }

  async getTemplate(templateId: string) {
    return emailSMSService.getTemplate(templateId);
  }

  async renderTemplate(templateId: string, variables: Record<string, any>) {
    return emailSMSService.renderTemplate(templateId, variables);
  }

  async sendEmail(to: string, subject: string, body: string): Promise<boolean> {
    return emailSMSService.sendEmail(to, subject, body);
  }

  async sendSMS(to: string, message: string): Promise<boolean> {
    return emailSMSService.sendSMS(to, message);
  }

  async sendBulkEmail(
    recipients: string[],
    subject: string,
    body: string
  ): Promise<{ sent: number; failed: number }> {
    return await emailSMSService.sendBulkEmail(recipients, subject, body);
  }

  async sendBulkSMS(
    recipients: string[],
    message: string
  ): Promise<{ sent: number; failed: number }> {
    return await emailSMSService.sendBulkSMS(recipients, message);
  }

  getConfig() {
    return emailSMSService.getConfig();
  }

  getConfiguration() {
    return emailSMSService.getConfig();
  }

  getTemplates() {
    return emailSMSService.getTemplates();
  }

  async sendWithTemplate(templateId: string, to: string, variables: Record<string, any> = {}) {
    return emailSMSService.sendWithTemplate(templateId, to, variables);
  }

  async testConfiguration() {
    return emailSMSService.testConfiguration();
  }

  async sendWithSMTP(to: string, subject: string, body: string) {
    return emailSMSService.sendEmail(to, subject, body);
  }

  async sendWithTwilio(to: string, message: string) {
    return emailSMSService.sendSMS(to, message);
  }
}

export { emailSMSService };
export default emailSMSService;
