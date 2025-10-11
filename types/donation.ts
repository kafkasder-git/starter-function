/**
 * @fileoverview Donation Types - Bağış tip tanımları
 *
 * @author Dernek Yönetim Sistemi Team
 * @version 1.0.0
 */

import type { BaseEntity } from '../services/baseService';

/**
 * Bağış durumları
 */
export type DonationStatus = 'pending' | 'approved' | 'rejected' | 'processing' | 'completed';

/**
 * Bağış türleri
 */
export type DonationType = 'cash' | 'in_kind' | 'services' | 'other';

/**
 * Bağışçı türleri
 */
export type DonorType = 'individual' | 'corporate' | 'foundation' | 'government';

/**
 * Ödeme yöntemleri
 */
export type PaymentMethod = 'bank_transfer' | 'credit_card' | 'cash' | 'check' | 'online' | 'other';

/**
 * Bağış ana interface'i
 */
export interface Donation extends BaseEntity<string> {
  /** Unique identifier (UUID) */
  id: string;
  /** Bağışçı adı */
  donor_name: string;
  /** Bağışçı e-posta */
  donor_email?: string;
  /** Bağışçı telefon */
  donor_phone?: string;
  /** Bağışçı türü */
  donor_type: DonorType;
  /** Bağış miktarı */
  amount: number;
  /** Para birimi */
  currency: string;
  /** Bağış türü */
  donation_type: DonationType;
  /** Kategori */
  category?: string;
  /** Açıklama */
  description?: string;
  /** Ödeme yöntemi */
  payment_method: PaymentMethod;
  /** Ödeme referansı */
  payment_reference?: string;
  /** Banka hesabı */
  bank_account?: string;
  /** İşlem ID */
  transaction_id?: string;
  /** Durum */
  status: DonationStatus;
  /** Onay tarihi */
  approval_date?: string;
  /** İşleyen kişi */
  processed_by?: string;
  /** Red sebebi */
  rejection_reason?: string;
  /** Ayrılan yer */
  allocated_to?: string;
  /** Faydalanıcı ID */
  beneficiary_id?: number;
  /** Ayrılma yüzdesi */
  allocation_percentage: number;
  /** Makbuz düzenlendi */
  receipt_issued: boolean;
  /** Makbuz numarası */
  receipt_number?: string;
  /** Makbuz tarihi */
  receipt_date?: string;
  /** Vergi indirimi */
  tax_deductible: boolean;
  /** Vergi sertifika numarası */
  tax_certificate_number?: string;
  /** Kampanya ID */
  campaign_id?: number;
  /** Kaynak */
  source?: string;
  /** Referans kodu */
  referral_code?: string;
  /** Teşekkür gönderildi */
  thank_you_sent: boolean;
  /** Teşekkür tarihi */
  thank_you_date?: string;
  /** İletişim tercihi */
  communication_preference?: 'email' | 'phone' | 'mail' | 'none';
  /** Tekrarlayan bağış */
  is_recurring: boolean;
  /** Tekrarlama sıklığı */
  recurring_frequency?: 'monthly' | 'quarterly' | 'yearly';
  /** Tekrarlama bitiş tarihi */
  recurring_end_date?: string;
  /** Tekrarlama miktarı */
  recurring_amount?: number;
  /** Oluşturulma tarihi */
  created_at: string;
  /** Güncellenme tarihi */
  updated_at: string;
  /** Oluşturan kişi */
  created_by?: string;
  /** Güncelleyen kişi */
  updated_by?: string;
  /** IP adresi */
  ip_address?: string;
  /** Kullanıcı ajanı */
  user_agent?: string;
  /** Notlar */
  notes?: string;
  /** Görüntüleme adı (computed) */
  display_name?: string;
  /** Formatlanmış miktar (computed) */
  formatted_amount?: string;
}

/**
 * Bağış oluşturma için interface
 */
export interface DonationInsert extends Omit<Donation, 'id' | 'created_at' | 'updated_at'> {
  /** ID otomatik oluşturulur */
  id?: never;
  /** Oluşturma tarihi otomatik set edilir */
  created_at?: never;
  /** Güncelleme tarihi otomatik set edilir */
  updated_at?: never;
}

/**
 * Bağış güncelleme için interface
 */
export interface DonationUpdate
  extends Partial<Omit<Donation, 'id' | 'created_at' | 'updated_at'>> {
  /** ID değiştirilemez */
  id?: never;
  /** Oluşturma tarihi değiştirilemez */
  created_at?: never;
  /** Güncelleme tarihi otomatik set edilir */
  updated_at?: never;
}

/**
 * Bağış filtreleri
 */
export interface DonationFilters {
  /** Arama terimi */
  searchTerm?: string;
  /** Durum filtresi */
  status?: string;
  /** Bağış türü filtresi */
  donationType?: string;
  /** Ödeme yöntemi filtresi */
  paymentMethod?: string;
  /** Bağışçı türü filtresi */
  donorType?: string;
  /** Başlangıç tarihi */
  dateFrom?: string;
  /** Bitiş tarihi */
  dateTo?: string;
  /** Minimum miktar */
  minAmount?: number;
  /** Maksimum miktar */
  maxAmount?: number;
}

/**
 * Bağış istatistikleri
 */
export interface DonationStats {
  /** Toplam sayı */
  total: number;
  /** Toplam miktar */
  totalAmount: number;
  /** Bekleyen sayı */
  pending: number;
  /** Onaylanan sayı */
  approved: number;
  /** Reddedilen sayı */
  rejected: number;
  /** Ortalama miktar */
  averageAmount: number;
  /** Aylık trend */
  monthlyTrend: Record<string, number>;
  /** Bağışçı türleri */
  donorTypes: Record<string, number>;
  /** Bağış türleri */
  donationTypes: Record<string, number>;
  /** Ödeme yöntemleri */
  paymentMethods: Record<string, number>;
}

/**
 * Note: Unlike beneficiaries, donations collection uses English field names
 * in the database, so no field mapping functions are needed.
 * The service can use these types directly with the database.
 */

// Type aliases for backward compatibility
export type DonationsFilters = DonationFilters;
export type DonationStatsType = DonationStats;