// İhtiyaç Sahipleri - Güncellenmiş Tip Tanımları
// JSON yapısına göre yeni alanlar eklendi

export type BeneficiaryStatus = 'active' | 'inactive' | 'suspended' | 'archived';
export type BeneficiaryCategory =
  | 'gıda'
  | 'nakdi'
  | 'eğitim'
  | 'sağlık'
  | 'barınma'
  | 'giyim'
  | 'diğer';
export type AidType =
  | 'tek seferlik'
  | 'aylık paket'
  | 'acil yardım'
  | 'sürekli destek'
  | 'proje bazlı';
export type PriorityLevel = 'low' | 'medium' | 'high' | 'critical';

// Ana Beneficiary interface - Güncellenmiş
export interface Beneficiary {
  // Temel Kimlik Bilgileri
  id: string;
  full_name: string;
  name: string;
  surname: string;
  identity_no?: string; // TC Kimlik, Pasaport vb.
  tc_no?: string; // Backward compatibility
  nationality?: string; // Uyruk (TR, SY, AF vb.)
  country?: string; // Ülke kodu (TR, SY vb.)

  // İletişim Bilgileri
  phone?: string;
  phone_text?: string; // Formatted phone
  email?: string;

  // Adres Bilgileri
  address?: string;
  full_address?: string;
  city?: string;
  district?: string;
  settlement?: string; // İlçe/Semt
  neighborhood?: string;

  // Aile ve Demografik Bilgiler
  birth_date?: string;
  gender?: 'male' | 'female' | 'other';
  marital_status?: string;
  family_size?: number;
  household_size?: number;

  // Ekonomik Bilgiler
  monthly_income?: number;
  employment_status?: string;
  profession?: string;
  income_range?: string;
  receives_social_aid?: boolean;
  iban?: string;

  // Sağlık Bilgileri
  disability_status?: string;
  health_conditions?: string;
  medication_info?: string;
  disability_percentage?: number;

  // Yardım Bilgileri
  category?: BeneficiaryCategory;
  aid_type?: AidType;
  priority_level?: PriorityLevel;
  total_amount?: number;
  fund_region?: string;

  // Kart ve Bağlantı Bilgileri
  linked_orphan?: boolean;
  linked_card?: boolean;
  card_no?: string;
  is_family_member?: boolean;
  primary_beneficiary_id?: string;

  // Sistem Bilgileri
  status?: BeneficiaryStatus;
  registration_date?: string;
  opened_by_unit?: string;
  notes?: string;
  inputs_to_ignore?: string[];

  // Audit Bilgileri
  created_at?: string;
  updated_at?: string;
  created_by?: string;
}

// Insert için tip (yeni kayıt oluştururken)
export interface BeneficiaryInsert {
  // Zorunlu alanlar
  full_name: string;
  identity_no: string;

  // Temel bilgiler
  name?: string;
  surname?: string;
  nationality?: string;
  country?: string;

  // İletişim
  phone?: string;
  email?: string;

  // Adres
  city?: string;
  settlement?: string;
  neighborhood?: string;
  address?: string;
  full_address?: string;

  // Demografik
  household_size?: number;
  birth_date?: string;
  gender?: 'male' | 'female' | 'other';
  marital_status?: string;

  // Yardım bilgileri
  category?: BeneficiaryCategory;
  aid_type?: AidType;
  priority_level?: PriorityLevel;
  fund_region?: string;

  // Kart bilgileri
  linked_orphan?: boolean;
  linked_card?: boolean;
  card_no?: string;

  // Sistem
  status?: BeneficiaryStatus;
  registration_date?: string;
  opened_by_unit?: string;
  iban?: string;
  notes?: string;
  created_by?: string;
}

// Update için tip (güncelleme yaparken)
export interface BeneficiaryUpdate {
  full_name?: string;
  identity_no?: string;
  nationality?: string;
  country?: string;
  phone?: string;
  email?: string;
  city?: string;
  settlement?: string;
  neighborhood?: string;
  address?: string;
  household_size?: number;
  category?: BeneficiaryCategory;
  aid_type?: AidType;
  priority_level?: PriorityLevel;
  fund_region?: string;
  linked_orphan?: boolean;
  linked_card?: boolean;
  card_no?: string;
  status?: BeneficiaryStatus;
  opened_by_unit?: string;
  iban?: string;
  notes?: string;
  updated_at?: string;
}

// Filtreleme için tip
export interface BeneficiaryFilters {
  search_term?: string;
  city?: string;
  settlement?: string;
  category?: BeneficiaryCategory[];
  aid_type?: AidType[];
  status?: BeneficiaryStatus[];
  priority_level?: PriorityLevel[];
  fund_region?: string;
  nationality?: string;
  linked_card?: boolean;
  linked_orphan?: boolean;
  registration_date_from?: string;
  registration_date_to?: string;
  has_iban?: boolean;
}

// Liste response için tip
export interface BeneficiaryListResponse {
  data: Beneficiary[];
  count: number;
  total_count: number;
  page: number;
  page_size: number;
  has_next: boolean;
  has_previous: boolean;
}

// İstatistik için tip
export interface BeneficiaryStats {
  total: number;
  active: number;
  inactive: number;
  suspended: number;
  by_category: Record<BeneficiaryCategory, number>;
  by_city: Record<string, number>;
  by_fund_region: Record<string, number>;
  by_nationality: Record<string, number>;
  linked_card_count: number;
  linked_orphan_count: number;
  total_aid_amount: number;
  average_household_size: number;
}

// Form validation için tip
export interface BeneficiaryFormData {
  // Temel bilgiler
  full_name: string;
  identity_no: string;
  nationality: string;
  country: string;

  // İletişim
  phone: string;
  email?: string;

  // Adres
  city: string;
  settlement: string;
  neighborhood?: string;
  address: string;

  // Demografik
  household_size: number;
  birth_date?: string;
  gender?: 'male' | 'female' | 'other';

  // Yardım
  category: BeneficiaryCategory;
  aid_type: AidType;
  fund_region: string;

  // Kart
  linked_orphan: boolean;
  linked_card: boolean;
  card_no?: string;

  // Sistem
  opened_by_unit: string;
  iban?: string;
  notes?: string;
}
