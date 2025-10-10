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
  | 'food' // Gıda
  | 'clothing' // Giyim
  | 'shelter' // Barınma
  | 'medical' // Tıbbi
  | 'education' // Eğitim
  | 'transportation' // Ulaşım
  | 'utilities' // Faturalar
  | 'other'; // Diğer

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
  /** Uyruk/Milliyet */
  nationality?: string;
  /** Ülke */
  country?: string;
  /** Yerleşim */
  settlement?: string;
  /** Mahalle/Semt */
  neighborhood?: string;
  /** IBAN */
  iban?: string;
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
  /** Destekleyici belgeler */
  supporting_documents?: string[];
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
export interface BeneficiaryUpdate
  extends Partial<Omit<Beneficiary, 'id' | 'created_at' | 'updated_at'>> {
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
  monthlyTrend: {
    month: string;
    count: number;
  }[];
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

// =============================================================================
// DATABASE FIELD MAPPING (Türkçe DB ↔ İngilizce App)
// =============================================================================

/**
 * Database field names (Turkish)
 * Maps to the actual ihtiyac_sahipleri table structure
 */
export interface BeneficiaryDBFields {
  id: number | string;
  ad_soyad: string;
  kimlik_no?: string;
  uyruk?: string;
  ulkesi?: string;
  sehri?: string;
  yerlesimi?: string;
  mahalle?: string;
  adres?: string;
  ailedeki_kisi_sayisi?: number;
  bagli_yetim?: string;
  bagli_kart?: string;
  telefon_no?: string;
  kayit_tarihi?: string;
  kaydi_acan_birim?: string;
  kategori?: string;
  tur?: string;
  fon_bolgesi?: string;
  toplam_tutar?: number;
  iban?: string;
  status?: 'active' | 'inactive' | 'suspended';
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  updated_by?: string;
}

/**
 * Maps database fields (Turkish) to application model (English)
 * @param dbData - Data from ihtiyac_sahipleri table
 * @returns Beneficiary object with English field names
 */
export function mapDBToBeneficiary(dbData: BeneficiaryDBFields): Beneficiary {
  const nameParts = dbData.ad_soyad?.split(' ') || [];
  const name = nameParts[0] || '';
  const surname = nameParts.slice(1).join(' ') || '';

  return {
    id: String(dbData.id),
    name,
    surname,
    full_name: dbData.ad_soyad,
    phone: dbData.telefon_no || '',
    identity_number: dbData.kimlik_no,
    address: dbData.adres || '',
    city: dbData.sehri || '',
    district: dbData.yerlesimi, // yerlesimi -> district
    postal_code: undefined,
    nationality: dbData.uyruk,
    country: dbData.ulkesi,
    settlement: dbData.yerlesimi,
    neighborhood: dbData.mahalle, // mahalle -> neighborhood
    iban: dbData.iban,
    family_members_count: dbData.ailedeki_kisi_sayisi,
    monthly_income: dbData.toplam_tutar,
    need_types: [], // DB'de array yok, kategori var
    priority: 'medium', // Default priority
    status:
      dbData.status === 'active'
        ? 'active'
        : dbData.status === 'inactive'
          ? 'suspended'
          : 'suspended',
    description: dbData.kategori,
    notes: dbData.tur,
    application_date: dbData.kayit_tarihi || dbData.created_at || new Date().toISOString(),
    created_at: dbData.created_at || undefined,
    updated_at: dbData.updated_at || undefined,
    created_by: dbData.created_by || undefined,
    updated_by: dbData.updated_by || undefined,
  };
}

/**
 * Maps application model (English) to database fields (Turkish)
 * @param beneficiary - Beneficiary object with English field names
 * @returns Data for ihtiyac_sahipleri table with Turkish field names
 */
export function mapBeneficiaryToDB(
  beneficiary: Partial<Beneficiary>,
): Partial<BeneficiaryDBFields> {
  const dbData: Partial<BeneficiaryDBFields> = {};

  // Map name fields
  if (beneficiary.full_name) {
    dbData.ad_soyad = beneficiary.full_name;
  } else if (beneficiary.name || beneficiary.surname) {
    dbData.ad_soyad = `${beneficiary.name || ''} ${beneficiary.surname || ''}`.trim();
  }

  // Map other fields
  if (beneficiary.identity_number !== undefined) dbData.kimlik_no = beneficiary.identity_number;
  if (beneficiary.phone !== undefined) dbData.telefon_no = beneficiary.phone;
  if (beneficiary.city !== undefined) dbData.sehri = beneficiary.city;
  if (beneficiary.district !== undefined) dbData.yerlesimi = beneficiary.district;
  if (beneficiary.neighborhood !== undefined) dbData.mahalle = beneficiary.neighborhood;
  if (beneficiary.address !== undefined) dbData.adres = beneficiary.address;
  if (beneficiary.nationality !== undefined) dbData.uyruk = beneficiary.nationality;
  if (beneficiary.country !== undefined) dbData.ulkesi = beneficiary.country;
  if (beneficiary.settlement !== undefined) dbData.yerlesimi = beneficiary.settlement;
  if (beneficiary.iban !== undefined) dbData.iban = beneficiary.iban;
  if (beneficiary.family_members_count !== undefined)
    dbData.ailedeki_kisi_sayisi = beneficiary.family_members_count;
  if (beneficiary.monthly_income !== undefined) dbData.toplam_tutar = beneficiary.monthly_income;
  if (beneficiary.description !== undefined) dbData.kategori = beneficiary.description;
  if (beneficiary.notes !== undefined) dbData.tur = beneficiary.notes;
  if (beneficiary.application_date !== undefined)
    dbData.kayit_tarihi = beneficiary.application_date;

  // Map status
  if (beneficiary.status !== undefined) {
    if (beneficiary.status === 'active') dbData.status = 'active';
    else if (beneficiary.status === 'completed') dbData.status = 'inactive';
    else dbData.status = 'suspended';
  }

  return dbData;
}
