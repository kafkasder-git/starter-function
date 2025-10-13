/**
 * @fileoverview Database Service - Dernek Yönetim Sistemi Veritabanı Servisi
 * @description Appwrite database işlemleri için centralized service
 */

import { databases, ID, Query, DATABASE_ID } from '@/lib/appwrite';

// Collection IDs
export const COLLECTIONS = {
  USERS: 'users',
  DONATIONS: 'donations',
  BENEFICIARIES: 'beneficiaries',
  AID_REQUESTS: 'aid_requests',
  SCHOLARSHIPS: 'scholarships',
  EVENTS: 'events',
  MESSAGES: 'messages',
  BULK_MESSAGES: 'bulk_messages',
  MESSAGE_TEMPLATES: 'message_templates',
  NOTIFICATION_SETTINGS: 'notification_settings',
  PARTNERS: 'partners',
  FINANCIAL_TRANSACTIONS: 'financial_transactions',
} as const;

// Base types
export interface BaseDocument {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
}

// User types
export interface User extends BaseDocument {
  email: string;
  name: string;
  role: 'super_admin' | 'admin' | 'manager' | 'operator' | 'viewer' | 'volunteer';
  phone?: string;
  isActive: boolean;
  lastLogin?: string;
  profileImage?: string;
}

// Donation types
export interface Donation extends BaseDocument {
  donorName: string;
  donorEmail?: string;
  donorPhone?: string;
  amount: number;
  currency: string;
  type: 'nakit' | 'ayni' | 'hizmet';
  status: 'beklemede' | 'onaylandı' | 'reddedildi';
  description?: string;
  donationDate: string;
  processedBy?: string;
}

// Beneficiary types
export interface Beneficiary extends BaseDocument {
  fullName: string;
  email?: string;
  phone: string;
  address: string;
  city: string;
  status: 'aktif' | 'pasif' | 'beklemede';
  priority: 'düşük' | 'orta' | 'yüksek' | 'acil';
  notes?: string;
  createdBy: string;
}

// Aid Request types
export interface AidRequest extends BaseDocument {
  beneficiaryId: string;
  requestType: 'nakit' | 'ayni' | 'hizmet';
  amount?: number;
  currency?: string;
  description: string;
  status: 'yeni' | 'inceleniyor' | 'onaylandı' | 'reddedildi';
  priority: 'düşük' | 'orta' | 'yüksek' | 'acil';
  requestDate: string;
  processedBy?: string;
  documents?: string[];
}

// Scholarship types
export interface Scholarship extends BaseDocument {
  studentName: string;
  studentId: string;
  school: string;
  grade: string;
  amount: number;
  currency: string;
  status: 'aktif' | 'pasif' | 'tamamlandı';
  startDate: string;
  endDate?: string;
  notes?: string;
}

// Event types
export interface Event extends BaseDocument {
  title: string;
  description: string;
  location: string;
  startDate: string;
  endDate: string;
  maxParticipants?: number;
  status: 'planlanıyor' | 'aktif' | 'tamamlandı' | 'iptal';
  organizerId: string;
  participants?: string[];
}

// Message types
export interface Message extends BaseDocument {
  senderId: string;
  recipientIds: string[];
  subject: string;
  content: string;
  type: 'email' | 'sms' | 'push' | 'internal';
  status: 'draft' | 'sent' | 'delivered' | 'failed';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  scheduledAt?: string;
  sentAt?: string;
  attachments?: string[];
  metadata?: string;
}

// Partner types
export interface Partner extends BaseDocument {
  name: string;
  type: 'kurum' | 'kişi' | 'şirket';
  contactPerson?: string;
  email?: string;
  phone?: string;
  address?: string;
  website?: string;
  status: 'aktif' | 'pasif';
  notes?: string;
}

// Financial Transaction types
export interface FinancialTransaction extends BaseDocument {
  type: 'gelir' | 'gider';
  category: string;
  amount: number;
  currency: string;
  description: string;
  transactionDate: string;
  processedBy: string;
  referenceId?: string;
  receipt?: string;
}

class DatabaseService {
  /**
   * Generic document creation
   */
  async createDocument<T extends Record<string, any>>(
    collectionId: string,
    data: Omit<T, '$id' | '$createdAt' | '$updatedAt'>
  ): Promise<T> {
    try {
      const result = await databases.createDocument({
        databaseId: DATABASE_ID,
        collectionId,
        documentId: ID.unique(),
        data,
      });

      return result as T;
    } catch (error) {
      console.error(`Document oluşturulurken hata (${collectionId}):`, error);
      throw new Error(`Document oluşturulamadı: ${error.message}`);
    }
  }

  /**
   * Generic document retrieval
   */
  async getDocument<T>(collectionId: string, documentId: string): Promise<T> {
    try {
      const result = await databases.getDocument({
        databaseId: DATABASE_ID,
        collectionId,
        documentId,
      });

      return result as T;
    } catch (error) {
      console.error(`Document alınırken hata (${collectionId}):`, error);
      throw new Error(`Document alınamadı: ${error.message}`);
    }
  }

  /**
   * Generic document listing
   */
  async listDocuments<T>(
    collectionId: string,
    queries: any[] = [],
    limit = 25,
    offset = 0
  ): Promise<{ documents: T[]; total: number }> {
    try {
      const result = await databases.listDocuments({
        databaseId: DATABASE_ID,
        collectionId,
        queries: [
          ...queries,
          Query.limit(limit),
          Query.offset(offset),
          Query.orderDesc('$createdAt'),
        ],
      });

      return {
        documents: result.documents as T[],
        total: result.total,
      };
    } catch (error) {
      console.error(`Documents listelenirken hata (${collectionId}):`, error);
      throw new Error(`Documents listelenemedi: ${error.message}`);
    }
  }

  /**
   * Generic document update
   */
  async updateDocument<T extends Record<string, any>>(
    collectionId: string,
    documentId: string,
    data: Partial<T>
  ): Promise<T> {
    try {
      const result = await databases.updateDocument({
        databaseId: DATABASE_ID,
        collectionId,
        documentId,
        data,
      });

      return result as T;
    } catch (error) {
      console.error(`Document güncellenirken hata (${collectionId}):`, error);
      throw new Error(`Document güncellenemedi: ${error.message}`);
    }
  }

  /**
   * Generic document deletion
   */
  async deleteDocument(collectionId: string, documentId: string): Promise<void> {
    try {
      await databases.deleteDocument({
        databaseId: DATABASE_ID,
        collectionId,
        documentId,
      });
    } catch (error) {
      console.error(`Document silinirken hata (${collectionId}):`, error);
      throw new Error(`Document silinemedi: ${error.message}`);
    }
  }

  // User operations
  async createUser(userData: Omit<User, '$id' | '$createdAt' | '$updatedAt'>): Promise<User> {
    return this.createDocument<User>(COLLECTIONS.USERS, userData);
  }

  async getUser(userId: string): Promise<User> {
    return this.getDocument<User>(COLLECTIONS.USERS, userId);
  }

  async listUsers(limit = 25, offset = 0): Promise<{ documents: User[]; total: number }> {
    return this.listDocuments<User>(COLLECTIONS.USERS, [], limit, offset);
  }

  async updateUser(userId: string, userData: Partial<User>): Promise<User> {
    return this.updateDocument<User>(COLLECTIONS.USERS, userId, userData);
  }

  async deleteUser(userId: string): Promise<void> {
    return this.deleteDocument(COLLECTIONS.USERS, userId);
  }

  // Donation operations
  async createDonation(donationData: Omit<Donation, '$id' | '$createdAt' | '$updatedAt'>): Promise<Donation> {
    return this.createDocument<Donation>(COLLECTIONS.DONATIONS, donationData);
  }

  async getDonation(donationId: string): Promise<Donation> {
    return this.getDocument<Donation>(COLLECTIONS.DONATIONS, donationId);
  }

  async listDonations(limit = 25, offset = 0): Promise<{ documents: Donation[]; total: number }> {
    return this.listDocuments<Donation>(COLLECTIONS.DONATIONS, [], limit, offset);
  }

  async updateDonation(donationId: string, donationData: Partial<Donation>): Promise<Donation> {
    return this.updateDocument<Donation>(COLLECTIONS.DONATIONS, donationId, donationData);
  }

  async deleteDonation(donationId: string): Promise<void> {
    return this.deleteDocument(COLLECTIONS.DONATIONS, donationId);
  }

  // Beneficiary operations
  async createBeneficiary(beneficiaryData: Omit<Beneficiary, '$id' | '$createdAt' | '$updatedAt'>): Promise<Beneficiary> {
    return this.createDocument<Beneficiary>(COLLECTIONS.BENEFICIARIES, beneficiaryData);
  }

  async getBeneficiary(beneficiaryId: string): Promise<Beneficiary> {
    return this.getDocument<Beneficiary>(COLLECTIONS.BENEFICIARIES, beneficiaryId);
  }

  async listBeneficiaries(limit = 25, offset = 0): Promise<{ documents: Beneficiary[]; total: number }> {
    return this.listDocuments<Beneficiary>(COLLECTIONS.BENEFICIARIES, [], limit, offset);
  }

  async updateBeneficiary(beneficiaryId: string, beneficiaryData: Partial<Beneficiary>): Promise<Beneficiary> {
    return this.updateDocument<Beneficiary>(COLLECTIONS.BENEFICIARIES, beneficiaryId, beneficiaryData);
  }

  async deleteBeneficiary(beneficiaryId: string): Promise<void> {
    return this.deleteDocument(COLLECTIONS.BENEFICIARIES, beneficiaryId);
  }

  // Aid Request operations
  async createAidRequest(aidRequestData: Omit<AidRequest, '$id' | '$createdAt' | '$updatedAt'>): Promise<AidRequest> {
    return this.createDocument<AidRequest>(COLLECTIONS.AID_REQUESTS, aidRequestData);
  }

  async getAidRequest(aidRequestId: string): Promise<AidRequest> {
    return this.getDocument<AidRequest>(COLLECTIONS.AID_REQUESTS, aidRequestId);
  }

  async listAidRequests(limit = 25, offset = 0): Promise<{ documents: AidRequest[]; total: number }> {
    return this.listDocuments<AidRequest>(COLLECTIONS.AID_REQUESTS, [], limit, offset);
  }

  async updateAidRequest(aidRequestId: string, aidRequestData: Partial<AidRequest>): Promise<AidRequest> {
    return this.updateDocument<AidRequest>(COLLECTIONS.AID_REQUESTS, aidRequestId, aidRequestData);
  }

  async deleteAidRequest(aidRequestId: string): Promise<void> {
    return this.deleteDocument(COLLECTIONS.AID_REQUESTS, aidRequestId);
  }

  // Scholarship operations
  async createScholarship(scholarshipData: Omit<Scholarship, '$id' | '$createdAt' | '$updatedAt'>): Promise<Scholarship> {
    return this.createDocument<Scholarship>(COLLECTIONS.SCHOLARSHIPS, scholarshipData);
  }

  async getScholarship(scholarshipId: string): Promise<Scholarship> {
    return this.getDocument<Scholarship>(COLLECTIONS.SCHOLARSHIPS, scholarshipId);
  }

  async listScholarships(limit = 25, offset = 0): Promise<{ documents: Scholarship[]; total: number }> {
    return this.listDocuments<Scholarship>(COLLECTIONS.SCHOLARSHIPS, [], limit, offset);
  }

  async updateScholarship(scholarshipId: string, scholarshipData: Partial<Scholarship>): Promise<Scholarship> {
    return this.updateDocument<Scholarship>(COLLECTIONS.SCHOLARSHIPS, scholarshipId, scholarshipData);
  }

  async deleteScholarship(scholarshipId: string): Promise<void> {
    return this.deleteDocument(COLLECTIONS.SCHOLARSHIPS, scholarshipId);
  }

  // Event operations
  async createEvent(eventData: Omit<Event, '$id' | '$createdAt' | '$updatedAt'>): Promise<Event> {
    return this.createDocument<Event>(COLLECTIONS.EVENTS, eventData);
  }

  async getEvent(eventId: string): Promise<Event> {
    return this.getDocument<Event>(COLLECTIONS.EVENTS, eventId);
  }

  async listEvents(limit = 25, offset = 0): Promise<{ documents: Event[]; total: number }> {
    return this.listDocuments<Event>(COLLECTIONS.EVENTS, [], limit, offset);
  }

  async updateEvent(eventId: string, eventData: Partial<Event>): Promise<Event> {
    return this.updateDocument<Event>(COLLECTIONS.EVENTS, eventId, eventData);
  }

  async deleteEvent(eventId: string): Promise<void> {
    return this.deleteDocument(COLLECTIONS.EVENTS, eventId);
  }

  // Partner operations
  async createPartner(partnerData: Omit<Partner, '$id' | '$createdAt' | '$updatedAt'>): Promise<Partner> {
    return this.createDocument<Partner>(COLLECTIONS.PARTNERS, partnerData);
  }

  async getPartner(partnerId: string): Promise<Partner> {
    return this.getDocument<Partner>(COLLECTIONS.PARTNERS, partnerId);
  }

  async listPartners(limit = 25, offset = 0): Promise<{ documents: Partner[]; total: number }> {
    return this.listDocuments<Partner>(COLLECTIONS.PARTNERS, [], limit, offset);
  }

  async updatePartner(partnerId: string, partnerData: Partial<Partner>): Promise<Partner> {
    return this.updateDocument<Partner>(COLLECTIONS.PARTNERS, partnerId, partnerData);
  }

  async deletePartner(partnerId: string): Promise<void> {
    return this.deleteDocument(COLLECTIONS.PARTNERS, partnerId);
  }

  // Financial Transaction operations
  async createFinancialTransaction(
    transactionData: Omit<FinancialTransaction, '$id' | '$createdAt' | '$updatedAt'>
  ): Promise<FinancialTransaction> {
    return this.createDocument<FinancialTransaction>(COLLECTIONS.FINANCIAL_TRANSACTIONS, transactionData);
  }

  async getFinancialTransaction(transactionId: string): Promise<FinancialTransaction> {
    return this.getDocument<FinancialTransaction>(COLLECTIONS.FINANCIAL_TRANSACTIONS, transactionId);
  }

  async listFinancialTransactions(limit = 25, offset = 0): Promise<{ documents: FinancialTransaction[]; total: number }> {
    return this.listDocuments<FinancialTransaction>(COLLECTIONS.FINANCIAL_TRANSACTIONS, [], limit, offset);
  }

  async updateFinancialTransaction(
    transactionId: string,
    transactionData: Partial<FinancialTransaction>
  ): Promise<FinancialTransaction> {
    return this.updateDocument<FinancialTransaction>(COLLECTIONS.FINANCIAL_TRANSACTIONS, transactionId, transactionData);
  }

  async deleteFinancialTransaction(transactionId: string): Promise<void> {
    return this.deleteDocument(COLLECTIONS.FINANCIAL_TRANSACTIONS, transactionId);
  }

  // Search operations
  async searchDocuments<T>(
    collectionId: string,
    searchTerm: string,
    searchAttributes: string[],
    limit = 25,
    offset = 0
  ): Promise<{ documents: T[]; total: number }> {
    try {
      const queries = searchAttributes.map(attr => Query.search(attr, searchTerm));
      
      const result = await databases.listDocuments({
        databaseId: DATABASE_ID,
        collectionId,
        queries: [
          Query.or(queries),
          Query.limit(limit),
          Query.offset(offset),
          Query.orderDesc('$createdAt'),
        ],
      });

      return {
        documents: result.documents as T[],
        total: result.total,
      };
    } catch (error) {
      console.error(`Search işlemi sırasında hata (${collectionId}):`, error);
      throw new Error(`Search işlemi başarısız: ${error.message}`);
    }
  }

  // Statistics operations
  async getCollectionStats(collectionId: string): Promise<{ total: number; active?: number; inactive?: number }> {
    try {
      const result = await databases.listDocuments({
        databaseId: DATABASE_ID,
        collectionId,
        queries: [Query.limit(1)],
      });

      let active = 0;
      let inactive = 0;

      // Try to get active/inactive counts if status field exists
      try {
        const activeResult = await databases.listDocuments({
          databaseId: DATABASE_ID,
          collectionId,
          queries: [Query.equal('status', 'aktif'), Query.limit(1)],
        });
        active = activeResult.total;
      } catch {
        // Status field might not exist
      }

      try {
        const inactiveResult = await databases.listDocuments({
          databaseId: DATABASE_ID,
          collectionId,
          queries: [Query.equal('status', 'pasif'), Query.limit(1)],
        });
        inactive = inactiveResult.total;
      } catch {
        // Status field might not exist
      }

      return {
        total: result.total,
        active,
        inactive,
      };
    } catch (error) {
      console.error(`Stats alınırken hata (${collectionId}):`, error);
      throw new Error(`Stats alınamadı: ${error.message}`);
    }
  }
}

// Singleton instance
export const databaseService = new DatabaseService();
export default databaseService;
