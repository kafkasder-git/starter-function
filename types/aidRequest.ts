/**
 * @fileoverview Aid Request Types - Yardım talebi tip tanımları
 *
 * @author Dernek Yönetim Sistemi Team
 * @version 1.0.0
 */

import type { BaseEntity } from '../services/baseService';

/**
 * Yardım talebi durumları
 */
export type AidRequestStatus = 'pending' | 'under_review' | 'approved' | 'rejected' | 'completed';

/**
 * Yardım türleri
 */
export type AidType = 'financial' | 'medical' | 'education' | 'housing' | 'food' | 'other';

/**
 * Aciliyet seviyeleri
 */
export type UrgencyLevel = 'low' | 'medium' | 'high' | 'critical';

/**
 * Yardım talebi ana interface'i
 */
export interface AidRequest extends BaseEntity {
  /** Başvuran adı */
  applicant_name: string;
  /** Başvuran e-posta */
  applicant_email?: string;
  /** Başvuran telefon */
  applicant_phone: string;
  /** Başvuran adres */
  applicant_address: string;
  /** Yardım türü */
  aid_type: AidType;
  /** Kategori */
  category?: string;
  /** İstenen miktar */
  requested_amount?: number;
  /** Para birimi */
  currency: string;
  /** Aciliyet seviyesi */
  urgency: UrgencyLevel;
  /** Açıklama */
  description: string;
  /** Sebep */
  reason: string;
  /** Aile büyüklüğü */
  family_size?: number;
  /** Aylık gelir */
  monthly_income?: number;
  /** Destekleyici belgeler */
  supporting_documents?: string[];
  /** Durum */
  status: AidRequestStatus;
  /** Atanan kişi */
  assigned_to?: string;
  /** Onaylanan miktar */
  approved_amount?: number;
  /** Onaylayan kişi */
  approved_by?: string;
  /** Onay tarihi */
  approval_date?: string;
  /** Ödeme tarihi */
  disbursement_date?: string;
  /** Ödeme yöntemi */
  disbursement_method?: string;
  /** Takip gerekli */
  follow_up_required: boolean;
  /** Takip tarihi */
  follow_up_date?: string;
  /** Notlar */
  notes?: string;
  /** İç notlar */
  internal_notes?: string;
  /** Oluşturan kişi */
  created_by: string;
  /** Güncelleyen kişi */
  updated_by?: string;
  /** Silinme tarihi */
  deleted_at?: string;
}

/**
 * Yardım talebi oluşturma için interface
 */
export interface AidRequestInsert extends Omit<AidRequest, 'id' | 'created_at' | 'updated_at'> {
  /** ID otomatik oluşturulur */
  id?: never;
  /** Oluşturma tarihi otomatik set edilir */
  created_at?: never;
  /** Güncelleme tarihi otomatik set edilir */
  updated_at?: never;
}

/**
 * Yardım talebi güncelleme için interface
 */
export interface AidRequestUpdate
  extends Partial<Omit<AidRequest, 'id' | 'created_at' | 'updated_at'>> {
  /** ID değiştirilemez */
  id?: never;
  /** Oluşturma tarihi değiştirilemez */
  created_at?: never;
  /** Güncelleme tarihi otomatik set edilir */
  updated_at?: never;
}

/**
 * Yardım talebi filtreleri
 */
export interface AidRequestFilters {
  status?: string;
  aidType?: string;
  urgency?: string;
  assignedTo?: string;
  searchTerm?: string;
  dateFrom?: string;
  dateTo?: string;
  minAmount?: number;
  maxAmount?: number;
}

/**
 * Yardım talebi istatistikleri
 */
export interface AidRequestStats {
  total: number;
  pending: number;
  underReview: number;
  approved: number;
  rejected: number;
  completed: number;
  totalRequestedAmount: number;
  totalApprovedAmount: number;
  byAidType: Record<string, number>;
  byUrgency: Record<string, number>;
  avgProcessingDays?: number;
}

/**
 * Note: Aid requests collection uses English field names in the database,
 * so no field mapping functions are needed.
 */
