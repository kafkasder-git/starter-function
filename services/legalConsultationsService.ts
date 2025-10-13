/**
 * @fileoverview Legal Consultations Service
 * @description Service for managing legal consultations and lawyer assignments
 */

import { db, collections, queryHelpers } from '@/lib/database';
import { ID } from '@/lib/appwrite';
import { logger } from '@/lib/logging/logger';
import type { Models } from 'appwrite';

export interface LegalConsultation {
  id: string;
  title: string;
  description: string;
  category: 'contract' | 'litigation' | 'compliance' | 'general';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  requestedBy: string;
  assignedLawyer?: string;
  requestedAt: string;
  dueDate?: string;
  completedAt?: string;
  documents?: string[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Lawyer {
  id: string;
  name: string;
  email: string;
  phone: string;
  specialization: string[];
  experience: number;
  rating: number;
  isAvailable: boolean;
  currentWorkload: number;
  maxWorkload: number;
}

export interface LegalConsultationDocument extends Omit<LegalConsultation, 'id'>, Models.Document {}

export interface CreateConsultationData {
  title: string;
  description: string;
  category: 'contract' | 'litigation' | 'compliance' | 'general';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dueDate?: string;
  documents?: string[];
  notes?: string;
}

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  success: boolean;
}

class LegalConsultationsService {
  private static instance: LegalConsultationsService;

  public static getInstance(): LegalConsultationsService {
    if (!LegalConsultationsService.instance) {
      LegalConsultationsService.instance = new LegalConsultationsService();
    }
    return LegalConsultationsService.instance;
  }

  private constructor() {
    logger.info('LegalConsultationsService initialized');
  }

  /**
   * Get all consultations
   */
  async getConsultations(
    filters: {
      status?: string;
      category?: string;
      priority?: string;
      assignedLawyer?: string;
      limit?: number;
      offset?: number;
    } = {}
  ): Promise<ApiResponse<LegalConsultation[]>> {
    try {
      const queries = [
        queryHelpers.orderDesc('requested_at'),
        queryHelpers.limit(filters.limit || 50),
      ];

      if (filters.status) {
        queries.push(queryHelpers.equal('status', filters.status));
      }

      if (filters.category) {
        queries.push(queryHelpers.equal('category', filters.category));
      }

      if (filters.priority) {
        queries.push(queryHelpers.equal('priority', filters.priority));
      }

      if (filters.assignedLawyer) {
        queries.push(queryHelpers.equal('assigned_lawyer', filters.assignedLawyer));
      }

      if (filters.offset) {
        queries.push(queryHelpers.offset(filters.offset));
      }

      const { data, error } = await db.list(collections.LEGAL_CONSULTATIONS, queries);

      if (error) {
        return { data: null, error: 'Failed to fetch consultations', success: false };
      }

      const consultations =
        data?.documents?.map((doc) => this.mapDocumentToConsultation(doc)) || [];

      return { data: consultations, error: null, success: true };
    } catch (error) {
      logger.error('Failed to get consultations', error);
      return { data: null, error: 'Failed to fetch consultations', success: false };
    }
  }

  /**
   * Get consultation by ID
   */
  async getConsultationById(consultationId: string): Promise<ApiResponse<LegalConsultation>> {
    try {
      const { data, error } = await db.get<LegalConsultationDocument>(
        collections.LEGAL_CONSULTATIONS,
        consultationId
      );

      if (error || !data) {
        return { data: null, error: 'Consultation not found', success: false };
      }

      const consultation = this.mapDocumentToConsultation(data);
      return { data: consultation, error: null, success: true };
    } catch (error) {
      logger.error('Failed to get consultation by ID', error);
      return { data: null, error: 'Failed to fetch consultation', success: false };
    }
  }

  /**
   * Create new consultation
   */
  async createConsultation(
    consultationData: CreateConsultationData
  ): Promise<ApiResponse<LegalConsultation>> {
    try {
      const consultationDoc: Omit<LegalConsultationDocument, keyof Models.Document> = {
        title: consultationData.title,
        description: consultationData.description,
        category: consultationData.category,
        priority: consultationData.priority,
        status: 'pending',
        requested_by: 'current-user', // TODO: Get from auth
        requested_at: new Date().toISOString(),
        due_date: consultationData.dueDate,
        documents: consultationData.documents || [],
        notes: consultationData.notes,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await db.create(
        collections.LEGAL_CONSULTATIONS,
        consultationDoc,
        ID.unique()
      );

      if (error || !data) {
        return { data: null, error: 'Failed to create consultation', success: false };
      }

      const consultation = this.mapDocumentToConsultation(data);
      return { data: consultation, error: null, success: true };
    } catch (error) {
      logger.error('Failed to create consultation', error);
      return { data: null, error: 'Failed to create consultation', success: false };
    }
  }

  /**
   * Assign lawyer to consultation
   */
  async assignLawyer(
    consultationId: string,
    lawyerId: string
  ): Promise<ApiResponse<LegalConsultation>> {
    try {
      const updateData = {
        assigned_lawyer: lawyerId,
        status: 'in_progress',
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await db.update(
        collections.LEGAL_CONSULTATIONS,
        consultationId,
        updateData
      );

      if (error || !data) {
        return { data: null, error: 'Failed to assign lawyer', success: false };
      }

      const consultation = this.mapDocumentToConsultation(data);
      return { data: consultation, error: null, success: true };
    } catch (error) {
      logger.error('Failed to assign lawyer', error);
      return { data: null, error: 'Failed to assign lawyer', success: false };
    }
  }

  /**
   * Update consultation status
   */
  async updateConsultationStatus(
    consultationId: string,
    status: LegalConsultation['status']
  ): Promise<ApiResponse<LegalConsultation>> {
    try {
      const updateData = {
        status,
        updated_at: new Date().toISOString(),
      };

      if (status === 'completed') {
        (updateData as any).completed_at = new Date().toISOString();
      }

      const { data, error } = await db.update(
        collections.LEGAL_CONSULTATIONS,
        consultationId,
        updateData
      );

      if (error || !data) {
        return { data: null, error: 'Failed to update consultation status', success: false };
      }

      const consultation = this.mapDocumentToConsultation(data);
      return { data: consultation, error: null, success: true };
    } catch (error) {
      logger.error('Failed to update consultation status', error);
      return { data: null, error: 'Failed to update consultation status', success: false };
    }
  }

  /**
   * Get available lawyers
   */
  async getAvailableLawyers(): Promise<ApiResponse<Lawyer[]>> {
    try {
      const { data, error } = await db.list('lawyers', [
        queryHelpers.equal('is_available', true),
        queryHelpers.orderAsc('current_workload'),
      ]);

      if (error) {
        return { data: null, error: 'Failed to fetch lawyers', success: false };
      }

      const lawyers = data?.documents?.map((doc) => this.mapDocumentToLawyer(doc)) || [];

      return { data: lawyers, error: null, success: true };
    } catch (error) {
      logger.error('Failed to get available lawyers', error);
      return { data: null, error: 'Failed to fetch lawyers', success: false };
    }
  }

  /**
   * Map document to consultation object
   */
  private mapDocumentToConsultation(doc: LegalConsultationDocument): LegalConsultation {
    return {
      id: doc.$id,
      title: doc.title,
      description: doc.description,
      category: doc.category,
      priority: doc.priority,
      status: doc.status,
      requestedBy: (doc as any).requested_by,
      assignedLawyer: (doc as any).assigned_lawyer,
      requestedAt: (doc as any).requested_at,
      dueDate: (doc as any).due_date,
      completedAt: (doc as any).completed_at,
      documents: (doc as any).documents,
      notes: (doc as any).notes,
      createdAt: (doc as any).created_at,
      updatedAt: (doc as any).updated_at,
    };
  }

  /**
   * Map document to lawyer object
   */
  private mapDocumentToLawyer(doc: any): Lawyer {
    return {
      id: doc.$id,
      name: doc.name,
      email: doc.email,
      phone: doc.phone,
      specialization: doc.specialization || [],
      experience: doc.experience || 0,
      rating: doc.rating || 0,
      isAvailable: doc.is_available || false,
      currentWorkload: doc.current_workload || 0,
      maxWorkload: doc.max_workload || 10,
    };
  }
}

// Export singleton instance
export const legalConsultationsService = LegalConsultationsService.getInstance();
export default legalConsultationsService;
