// 🏠 İHTİYAÇ SAHİPLERİ TYPES
// İhtiyaç sahipleri için TypeScript tip tanımları

export interface IhtiyacSahibi {
  id: string;

  // Personal Information
  ad_soyad: string;
  kimlik_no?: string;
  uyruk?: string;
  ulkesi?: string;

  // Location Information
  sehri?: string;
  yerlesimi?: string;
  mahalle?: string;
  adres?: string;

  // Family Information
  ailedeki_kisi_sayisi?: number;

  // Connection Information
  bagli_yetim?: string;
  bagli_kart?: string;
  telefon_no?: string;

  // Registration Information
  kayit_tarihi?: string;
  kaydi_acan_birim?: string;

  // Classification Information
  kategori?: string;
  tur?: string;
  fon_bolgesi?: string;

  // Financial Information
  toplam_tutar?: number;
  iban?: string;

  // System Information
  status?: 'active' | 'inactive' | 'suspended';
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  updated_by?: string;
}

export interface IhtiyacSahibiInsert {
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
}

export interface IhtiyacSahibiUpdate {
  ad_soyad?: string;
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
}

export interface IhtiyacSahibiFilters {
  ad_soyad?: string;
  kimlik_no?: string;
  sehri?: string;
  yerlesimi?: string;
  mahalle?: string;
  kategori?: string;
  tur?: string;
  fon_bolgesi?: string;
  status?: 'active' | 'inactive' | 'suspended';
  created_by?: string;
  date_from?: string;
  date_to?: string;
  min_amount?: number;
  max_amount?: number;
}

export interface IhtiyacSahibiStats {
  total_count: number;
  active_count: number;
  inactive_count: number;
  suspended_count: number;
  total_amount: number;
  average_amount: number;
  by_category: Record<string, number>;
  by_city: Record<string, number>;
  by_type: Record<string, number>;
  recent_registrations: number;
}

// CSV Import/Export types
export interface IhtiyacSahibiCSVRow {
  ID: string;
  'Ad Soyad': string;
  'Kimlik No': string;
  Uyruk: string;
  Ülkesi: string;
  Şehri: string;
  Yerleşimi: string;
  Mahalle: string;
  Adres: string;
  'Ailedeki Kişi Sayısı': string;
  'Bağlı Yetim': string;
  'Bağlı Kart': string;
  'Telefon No': string;
  'Kayıt Tarihi': string;
  'Kaydı Açan Birim': string;
  Kategori: string;
  Tür: string;
  'Fon Bölgesi': string;
  'Toplam Tutar': string;
  Iban: string;
}

// Validation schema
export const IHTIYAC_SAHIBI_VALIDATION = {
  ad_soyad: {
    required: true,
    minLength: 2,
    maxLength: 255,
    pattern: /^[a-zA-ZğüşıöçĞÜŞİÖÇ\s]+$/,
  },
  kimlik_no: {
    required: false,
    pattern: /^[0-9]{11}$/,
  },
  telefon_no: {
    required: false,
    pattern: /^(\+90|0)?[5][0-9]{9}$/,
  },
  iban: {
    required: false,
    pattern: /^TR[0-9]{24}$/,
  },
  ailedeki_kisi_sayisi: {
    required: false,
    min: 1,
    max: 20,
  },
  toplam_tutar: {
    required: false,
    min: 0,
  },
} as const;

// Status options
export const IHTIYAC_SAHIBI_STATUS_OPTIONS = [
  { value: 'active', label: 'Aktif', color: 'green' },
  { value: 'inactive', label: 'Pasif', color: 'gray' },
  { value: 'suspended', label: 'Askıda', color: 'red' },
] as const;

// Category options
export const IHTIYAC_SAHIBI_CATEGORY_OPTIONS = [
  { value: 'yardim_alani', label: 'Yardım Alanı' },
  { value: 'muhtaç', label: 'Muhtaç' },
  { value: 'yetim', label: 'Yetim' },
  { value: 'engelli', label: 'Engelli' },
  { value: 'yaşlı', label: 'Yaşlı' },
  { value: 'hasta', label: 'Hasta' },
  { value: 'diğer', label: 'Diğer' },
] as const;

// Type options
export const IHTIYAC_SAHIBI_TYPE_OPTIONS = [
  { value: 'nakdi_yardim', label: 'Nakdi Yardım' },
  { value: 'ayni_yardim', label: 'Ayni Yardım' },
  { value: 'hizmet_yardimi', label: 'Hizmet Yardımı' },
  { value: 'egitim_yardimi', label: 'Eğitim Yardımı' },
  { value: 'saglik_yardimi', label: 'Sağlık Yardımı' },
  { value: 'konaklama_yardimi', label: 'Konaklama Yardımı' },
] as const;

// Fund region options
export const FUND_REGION_OPTIONS = [
  { value: 'istanbul', label: 'İstanbul' },
  { value: 'ankara', label: 'Ankara' },
  { value: 'izmir', label: 'İzmir' },
  { value: 'bursa', label: 'Bursa' },
  { value: 'antalya', label: 'Antalya' },
  { value: 'adana', label: 'Adana' },
  { value: 'konya', label: 'Konya' },
  { value: 'gaziantep', label: 'Gaziantep' },
  { value: 'mersin', label: 'Mersin' },
  { value: 'diyarbakir', label: 'Diyarbakır' },
  { value: 'kayseri', label: 'Kayseri' },
  { value: 'eskisehir', label: 'Eskişehir' },
  { value: 'urfa', label: 'Şanlıurfa' },
  { value: 'malatya', label: 'Malatya' },
  { value: 'erzurum', label: 'Erzurum' },
  { value: 'van', label: 'Van' },
  { value: 'batman', label: 'Batman' },
  { value: 'elazig', label: 'Elazığ' },
  { value: 'izmit', label: 'İzmit' },
  { value: 'manisa', label: 'Manisa' },
  { value: 'sivas', label: 'Sivas' },
  { value: 'balikesir', label: 'Balıkesir' },
  { value: 'kahramanmaras', label: 'Kahramanmaraş' },
  { value: 'denizli', label: 'Denizli' },
  { value: 'sakarya', label: 'Sakarya' },
  { value: 'uzungol', label: 'Uzungöl' },
  { value: 'muş', label: 'Muş' },
  { value: 'trabzon', label: 'Trabzon' },
  { value: 'ordu', label: 'Ordu' },
  { value: 'afyon', label: 'Afyon' },
  { value: 'duzce', label: 'Düzce' },
  { value: 'tekirdag', label: 'Tekirdağ' },
  { value: 'zonguldak', label: 'Zonguldak' },
  { value: 'kutahya', label: 'Kütahya' },
  { value: 'osmaniye', label: 'Osmaniye' },
  { value: 'çorum', label: 'Çorum' },
  { value: 'mugla', label: 'Muğla' },
  { value: 'aydin', label: 'Aydın' },
  { value: 'tokat', label: 'Tokat' },
  { value: 'giresun', label: 'Giresun' },
  { value: 'samsun', label: 'Samsun' },
  { value: 'amasya', label: 'Amasya' },
  { value: 'kirikkale', label: 'Kırıkkale' },
  { value: 'kirsehir', label: 'Kırşehir' },
  { value: 'nevsehir', label: 'Nevşehir' },
  { value: 'nigde', label: 'Niğde' },
  { value: 'karaman', label: 'Karaman' },
  { value: 'mersin', label: 'Mersin' },
  { value: 'hatay', label: 'Hatay' },
  { value: 'osmaniye', label: 'Osmaniye' },
  { value: 'kilis', label: 'Kilis' },
  { value: 'gaziantep', label: 'Gaziantep' },
  { value: 'adıyaman', label: 'Adıyaman' },
  { value: 'malatya', label: 'Malatya' },
  { value: 'elazig', label: 'Elazığ' },
  { value: 'tunceli', label: 'Tunceli' },
  { value: 'bingol', label: 'Bingöl' },
  { value: 'muş', label: 'Muş' },
  { value: 'bitlis', label: 'Bitlis' },
  { value: 'hakkari', label: 'Hakkari' },
  { value: 'van', label: 'Van' },
  { value: 'siirt', label: 'Siirt' },
  { value: 'mardin', label: 'Mardin' },
  { value: 'batman', label: 'Batman' },
  { value: 'sirnak', label: 'Şırnak' },
  { value: 'diyarbakir', label: 'Diyarbakır' },
  { value: 'urfa', label: 'Şanlıurfa' },
  { value: 'adana', label: 'Adana' },
  { value: 'mersin', label: 'Mersin' },
  { value: 'hatay', label: 'Hatay' },
  { value: 'osmaniye', label: 'Osmaniye' },
  { value: 'kilis', label: 'Kilis' },
] as const;
