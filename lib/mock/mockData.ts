/**
 * @fileoverview Mock Data for Development
 * @description Provides mock data when Appwrite is not configured
 */

import { logger } from '../logging/logger';

// Mock User Data
const mockUsers = {
  admin: {
    $id: 'mock-admin-001',
    email: 'admin@kafkasder.org',
    name: 'Admin User',
    labels: ['admin'],
    prefs: {},
  },
  manager: {
    $id: 'mock-manager-001',
    email: 'manager@kafkasder.org',
    name: 'Manager User',
    labels: ['manager'],
    prefs: {},
  },
  user: {
    $id: 'mock-user-001',
    email: 'user@kafkasder.org',
    name: 'Regular User',
    labels: ['user'],
    prefs: {},
  },
};

// Mock Authentication Service
export class MockAuthService {
  private currentUser: typeof mockUsers.admin | null = null;

  async login(email: string, password: string) {
    logger.info('[MockAuth] Attempting login', { email });

    // Simple mock authentication
    if (password.length < 6) {
      throw new Error('Şifre en az 6 karakter olmalı');
    }

    // Match user by email or use default
    let user = mockUsers.user;
    if (email.includes('admin') || email === 'admin') {
      user = mockUsers.admin;
    } else if (email.includes('manager')) {
      user = mockUsers.manager;
    }

    this.currentUser = user;
    logger.info('[MockAuth] Login successful', { userId: user.$id });

    return {
      userId: user.$id,
      secret: 'mock-session-secret',
    };
  }

  async getCurrentUser() {
    if (!this.currentUser) {
      throw new Error('No user logged in');
    }
    return this.currentUser;
  }

  async logout() {
    logger.info('[MockAuth] Logout');
    this.currentUser = null;
  }

  async createEmailSession(email: string, password: string) {
    return this.login(email, password);
  }

  async get() {
    return this.getCurrentUser();
  }

  async deleteSession(sessionId: string) {
    logger.info('[MockAuth] Delete session', { sessionId });
    this.currentUser = null;
  }
}

// Singleton instance
let mockAuthInstance: MockAuthService | null = null;

export const getMockAuthService = (): MockAuthService => {
  if (!mockAuthInstance) {
    mockAuthInstance = new MockAuthService();
  }
  return mockAuthInstance;
};

// Mock Databases Service
export class MockDatabasesService {
  async listDocuments() {
    logger.info('[MockDB] List documents');
    return {
      total: 0,
      documents: [],
    };
  }

  async getDocument() {
    throw new Error('Document not found');
  }

  async createDocument() {
    logger.info('[MockDB] Create document');
    return {
      $id: 'mock-doc-' + Date.now(),
      $createdAt: new Date().toISOString(),
      $updatedAt: new Date().toISOString(),
    };
  }

  async updateDocument(databaseId: string, collectionId: string, documentId: string, data: any) {
    logger.info('[MockDB] Update document', { documentId });
    return {
      $id: documentId,
      ...data,
      $updatedAt: new Date().toISOString(),
    };
  }

  async deleteDocument(databaseId: string, collectionId: string, documentId: string) {
    logger.info('[MockDB] Delete document', { documentId });
  }
}

export const getMockDatabasesService = () => new MockDatabasesService();
