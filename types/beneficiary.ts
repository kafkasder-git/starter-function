/**
 * @fileoverview Beneficiary Types - İhtiyaç sahipleri tip tanımları
 * 
 * @author Dernek Yönetim Sistemi Team
 * @version 1.0.0
 */

import type { BaseEntity } from '../services/baseService';

/**
 * İhtiyaç sahibi durumları
 */
export type BeneficiaryStatus = 'active' | 'completed' | 'suspended' | 'deleted';

/**
 * Öncelik seviyeleri
 */
export type BeneficiaryPriority = 'low' | 'medium' | 'high' | 'urgent';

/**
 * İhtiyaç türleri
 */
export type NeedType = 
  | 'food'           // Gıda
  | 'clothing'       // Giyim
  | 'shelter'        // Barınma
  | 'medical'        // Tıbbi
  | 'education'      // Eğitim
  | 'transportation' // Ulaşım
  | 'utilities'      // Faturalar
  | 'other';         // Diğer

/**
 * Aile durumu
 */
export type FamilyStatus = 'single' | 'married' | 'widowed' | 'divorced' | 'separated';

/**
 * İhtiyaç sahibi ana interface'i
 */
export interface Beneficiary extends BaseEntity {
  /** İhtiyaç sahibinin adı */
  name: string;
  /** İhtiyaç sahibinin soyadı */
  surname: string;
  /** Tam ad (name + surname) */
  full_name: string;
  /** Telefon numarası */
  phone: string;
  /** E-posta adresi */
  email?: string;
  /** Doğum tarihi */
  birth_date?: string;
  /** Cinsiyet */
  gender?: 'male' | 'female' | 'other';
  /** Kimlik numarası */
  identity_number?: string;
  /** Adres bilgisi */
  address: string;
  /** Şehir */
  city: string;
  /** İlçe */
  district?: string;
  /** Posta kodu */
  postal_code?: string;
  /** Aile durumu */
  family_status?: FamilyStatus;
  /** Çocuk sayısı */
  children_count?: number;
  /** Aile birey sayısı */
  family_members_count?: number;
  /** Aylık gelir */
  monthly_income?: number;
  /** Gelir kaynağı */
  income_source?: string;
  /** İhtiyaç türleri */
  need_types: NeedType[];
  /** Öncelik seviyesi */
  priority: BeneficiaryPriority;
  /** Durum */
  status: BeneficiaryStatus;
  /** Açıklama */
  description?: string;
  /** Notlar */
  notes?: string;
  /** Belge dosyaları */
  documents?: string[];
  /** Fotoğraflar */
  photos?: string[];
  /** İlk değerlendirme tarihi */
  first_assessment_date?: string;
  /** Son değerlendirme tarihi */
  last_assessment_date?: string;
  /** Sonraki değerlendirme tarihi */
  next_assessment_date?: string;
  /** Yardım miktarı */
  assistance_amount?: number;
  /** Yardım türü */
  assistance_type?: string;
  /** Yardım tarihi */
  assistance_date?: string;
  /** Referans kişi */
  reference_person?: string;
  /** Referans telefonu */
  reference_phone?: string;
  /** Sosyal medya hesapları */
  social_media?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    linkedin?: string;
  };
  /** Acil durum iletişim bilgileri */
  emergency_contact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  /** Özel durumlar */
  special_conditions?: string[];
  /** Engellilik durumu */
  disability_status?: boolean;
  /** Engellilik türü */
  disability_type?: string;
  /** Sağlık durumu */
  health_status?: string;
  /** İlaç kullanımı */
  medication_usage?: string;
  /** Alerjiler */
  allergies?: string[];
  /** Kan grubu */
  blood_type?: string;
  /** Eğitim durumu */
  education_level?: string;
  /** Meslek */
  occupation?: string;
  /** İş durumu */
  employment_status?: 'employed' | 'unemployed' | 'retired' | 'student' | 'disabled';
  /** Dil bilgisi */
  languages?: string[];
  /** Hobi ve ilgi alanları */
  hobbies?: string[];
  /** Gönüllü çalışma deneyimi */
  volunteer_experience?: string;
  /** Başvuru tarihi */
  application_date: string;
  /** Onay tarihi */
  approval_date?: string;
  /** Red tarihi */
  rejection_date?: string;
  /** Red sebebi */
  rejection_reason?: string;
  /** Gönüllü ataması */
  assigned_volunteer?: string;
  /** Takip eden kişi */
  follow_up_person?: string;
  /** Son güncelleme notu */
  last_update_note?: string;
}

/**
 * İhtiyaç sahibi oluşturma için interface
 */
export interface BeneficiaryInsert extends Omit<Beneficiary, 'id' | 'created_at' | 'updated_at'> {
  /** ID otomatik oluşturulur */
  id?: never;
  /** Oluşturma tarihi otomatik set edilir */
  created_at?: never;
  /** Güncelleme tarihi otomatik set edilir */
  updated_at?: never;
}

/**
 * İhtiyaç sahibi güncelleme için interface
 */
export interface BeneficiaryUpdate extends Partial<Omit<Beneficiary, 'id' | 'created_at' | 'updated_at'>> {
  /** ID değiştirilemez */
  id?: never;
  /** Oluşturma tarihi değiştirilemez */
  created_at?: never;
  /** Güncelleme tarihi otomatik set edilir */
  updated_at?: never;
}

/**
 * İhtiyaç sahibi filtreleri
 */
export interface BeneficiaryFilters {
  /** Arama terimi */
  searchTerm?: string;
  /** Durum filtresi */
  status?: BeneficiaryStatus;
  /** Öncelik filtresi */
  priority?: BeneficiaryPriority;
  /** Şehir filtresi */
  city?: string;
  /** İlçe filtresi */
  district?: string;
  /** İhtiyaç türü filtresi */
  needType?: NeedType;
  /** Aile durumu filtresi */
  familyStatus?: FamilyStatus;
  /** Yaş aralığı */
  ageRange?: {
    min: number;
    max: number;
  };
  /** Gelir aralığı */
  incomeRange?: {
    min: number;
    max: number;
  };
  /** Başvuru tarihi aralığı */
  applicationDateRange?: {
    from: string;
    to: string;
  };
  /** Engellilik durumu */
  hasDisability?: boolean;
  /** Çocuk sayısı */
  hasChildren?: boolean;
  /** Belge durumu */
  hasDocuments?: boolean;
  /** Fotoğraf durumu */
  hasPhotos?: boolean;
  /** Gönüllü ataması */
  hasAssignedVolunteer?: boolean;
  /** Takip eden kişi */
  hasFollowUpPerson?: boolean;
}

/**
 * İhtiyaç sahibi istatistikleri
 */
export interface BeneficiaryStats {
  /** Toplam sayı */
  total: number;
  /** Aktif sayı */
  active: number;
  /** Tamamlanan sayı */
  completed: number;
  /** Askıya alınan sayı */
  suspended: number;
  /** Silinen sayı */
  deleted: number;
  /** Acil durum sayısı */
  urgent: number;
  /** Şehir bazında dağılım */
  byCity: Record<string, number>;
  /** İhtiyaç türü bazında dağılım */
  byNeedType: Record<NeedType, number>;
  /** Öncelik bazında dağılım */
  byPriority: Record<BeneficiaryPriority, number>;
  /** Aile durumu bazında dağılım */
  byFamilyStatus: Record<FamilyStatus, number>;
  /** Yaş grupları */
  byAgeGroup: Record<string, number>;
  /** Gelir grupları */
  byIncomeGroup: Record<string, number>;
  /** Aylık trend */
  monthlyTrend: Array<{
    month: string;
    count: number;
  }>;
}

/**
 * İhtiyaç sahibi form verisi
 */
export interface BeneficiaryFormData {
  /** Kişisel bilgiler */
  personalInfo: {
    name: string;
    surname: string;
    phone: string;
    email?: string;
    birthDate?: string;
    gender?: 'male' | 'female' | 'other';
    identityNumber?: string;
  };
  /** Adres bilgileri */
  addressInfo: {
    address: string;
    city: string;
    district?: string;
    postalCode?: string;
  };
  /** Aile bilgileri */
  familyInfo: {
    familyStatus?: FamilyStatus;
    childrenCount?: number;
    familyMembersCount?: number;
    monthlyIncome?: number;
    incomeSource?: string;
  };
  /** İhtiyaç bilgileri */
  needInfo: {
    needTypes: NeedType[];
    priority: BeneficiaryPriority;
    description?: string;
    specialConditions?: string[];
  };
  /** Sağlık bilgileri */
  healthInfo?: {
    healthStatus?: string;
    medicationUsage?: string;
    allergies?: string[];
    bloodType?: string;
    disabilityStatus?: boolean;
    disabilityType?: string;
  };
  /** İletişim bilgileri */
  contactInfo?: {
    referencePerson?: string;
    referencePhone?: string;
    emergencyContact?: {
      name: string;
      phone: string;
      relationship: string;
    };
  };
  /** Diğer bilgiler */
  otherInfo?: {
    educationLevel?: string;
    occupation?: string;
    employmentStatus?: 'employed' | 'unemployed' | 'retired' | 'student' | 'disabled';
    languages?: string[];
    hobbies?: string[];
    volunteerExperience?: string;
  };
  /** Belge ve fotoğraflar */
  documents?: {
    files: File[];
    photos: File[];
  };
}

/**
 * İhtiyaç sahibi arama sonuçları
 */
export interface BeneficiarySearchResult {
  /** İhtiyaç sahibi bilgileri */
  beneficiary: Beneficiary;
  /** Arama skoru */
  score: number;
  /** Eşleşen alanlar */
  matchedFields: string[];
}

/**
 * İhtiyaç sahibi raporu
 */
export interface BeneficiaryReport {
  /** Rapor ID'si */
  id: string;
  /** Rapor türü */
  type: 'summary' | 'detailed' | 'statistical';
  /** Oluşturulma tarihi */
  createdAt: string;
  /** Rapor verisi */
  data: any;
  /** Rapor formatı */
  format: 'json' | 'csv' | 'pdf' | 'excel';
  /** Rapor boyutu */
  size: number;
  /** İndirme linki */
  downloadUrl?: string;
}