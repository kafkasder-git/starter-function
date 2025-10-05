/**
 * @fileoverview Internationalization Service
 * @description Çoklu dil desteği ve yerelleştirme servisi
 */

import { useState, useEffect } from 'react';

import { logger } from '../lib/logging/logger';
// Desteklenen diller
export type SupportedLanguage = 'tr' | 'en' | 'ar' | 'ku' | 'de' | 'fr' | 'es';

// Dil ayarları
/**
 * LanguageSettings Interface
 * 
 * @interface LanguageSettings
 */
export interface LanguageSettings {
  current: SupportedLanguage;
  fallback: SupportedLanguage;
  rtl: boolean; // Right-to-left
  dateFormat: string;
  numberFormat: string;
  currency: string;
  timezone: string;
}

// Çeviri anahtarları
/**
 * TranslationKeys Interface
 * 
 * @interface TranslationKeys
 */
export interface TranslationKeys {
  // Genel
  common: {
    save: string;
    cancel: string;
    delete: string;
    edit: string;
    add: string;
    search: string;
    filter: string;
    loading: string;
    error: string;
    success: string;
    warning: string;
    info: string;
    yes: string;
    no: string;
    ok: string;
    close: string;
  };

  // Navigasyon
  navigation: {
    home: string;
    dashboard: string;
    beneficiaries: string;
    donations: string;
    members: string;
    events: string;
    reports: string;
    settings: string;
    profile: string;
    logout: string;
  };

  // Dashboard
  dashboard: {
    title: string;
    welcome: string;
    totalBeneficiaries: string;
    totalDonations: string;
    totalMembers: string;
    totalEvents: string;
    recentActivity: string;
    upcomingTasks: string;
  };

  // Formlar
  forms: {
    required: string;
    invalidEmail: string;
    invalidPhone: string;
    minLength: string;
    maxLength: string;
    passwordMismatch: string;
    selectOption: string;
    uploadFile: string;
    dragDrop: string;
  };

  // Hata mesajları
  errors: {
    networkError: string;
    serverError: string;
    unauthorized: string;
    forbidden: string;
    notFound: string;
    validationError: string;
    unknownError: string;
  };
}

// Çeviri verileri
const translations: Record<SupportedLanguage, TranslationKeys> = {
  tr: {
    common: {
      save: 'Kaydet',
      cancel: 'İptal',
      delete: 'Sil',
      edit: 'Düzenle',
      add: 'Ekle',
      search: 'Ara',
      filter: 'Filtrele',
      loading: 'Yükleniyor...',
      error: 'Hata',
      success: 'Başarılı',
      warning: 'Uyarı',
      info: 'Bilgi',
      yes: 'Evet',
      no: 'Hayır',
      ok: 'Tamam',
      close: 'Kapat',
    },
    navigation: {
      home: 'Ana Sayfa',
      dashboard: 'Dashboard',
      beneficiaries: 'İhtiyaç Sahipleri',
      donations: 'Bağışlar',
      members: 'Üyeler',
      events: 'Etkinlikler',
      reports: 'Raporlar',
      settings: 'Ayarlar',
      profile: 'Profil',
      logout: 'Çıkış',
    },
    dashboard: {
      title: 'Dashboard',
      welcome: 'Hoş Geldiniz',
      totalBeneficiaries: 'Toplam İhtiyaç Sahibi',
      totalDonations: 'Toplam Bağış',
      totalMembers: 'Toplam Üye',
      totalEvents: 'Toplam Etkinlik',
      recentActivity: 'Son Aktiviteler',
      upcomingTasks: 'Yaklaşan Görevler',
    },
    forms: {
      required: 'Bu alan zorunludur',
      invalidEmail: 'Geçerli bir e-posta adresi girin',
      invalidPhone: 'Geçerli bir telefon numarası girin',
      minLength: 'En az {min} karakter olmalı',
      maxLength: 'En fazla {max} karakter olmalı',
      passwordMismatch: 'Şifreler eşleşmiyor',
      selectOption: 'Seçenek seçin',
      uploadFile: 'Dosya yükle',
      dragDrop: 'Dosyaları buraya sürükleyin',
    },
    errors: {
      networkError: 'Ağ bağlantısı hatası',
      serverError: 'Sunucu hatası',
      unauthorized: 'Yetkisiz erişim',
      forbidden: 'Erişim reddedildi',
      notFound: 'Bulunamadı',
      validationError: 'Doğrulama hatası',
      unknownError: 'Bilinmeyen hata',
    },
  },

  en: {
    common: {
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',
      edit: 'Edit',
      add: 'Add',
      search: 'Search',
      filter: 'Filter',
      loading: 'Loading...',
      error: 'Error',
      success: 'Success',
      warning: 'Warning',
      info: 'Info',
      yes: 'Yes',
      no: 'No',
      ok: 'OK',
      close: 'Close',
    },
    navigation: {
      home: 'Home',
      dashboard: 'Dashboard',
      beneficiaries: 'Beneficiaries',
      donations: 'Donations',
      members: 'Members',
      events: 'Events',
      reports: 'Reports',
      settings: 'Settings',
      profile: 'Profile',
      logout: 'Logout',
    },
    dashboard: {
      title: 'Dashboard',
      welcome: 'Welcome',
      totalBeneficiaries: 'Total Beneficiaries',
      totalDonations: 'Total Donations',
      totalMembers: 'Total Members',
      totalEvents: 'Total Events',
      recentActivity: 'Recent Activity',
      upcomingTasks: 'Upcoming Tasks',
    },
    forms: {
      required: 'This field is required',
      invalidEmail: 'Please enter a valid email address',
      invalidPhone: 'Please enter a valid phone number',
      minLength: 'Must be at least {min} characters',
      maxLength: 'Must be at most {max} characters',
      passwordMismatch: 'Passwords do not match',
      selectOption: 'Select an option',
      uploadFile: 'Upload file',
      dragDrop: 'Drag and drop files here',
    },
    errors: {
      networkError: 'Network connection error',
      serverError: 'Server error',
      unauthorized: 'Unauthorized access',
      forbidden: 'Access denied',
      notFound: 'Not found',
      validationError: 'Validation error',
      unknownError: 'Unknown error',
    },
  },

  ar: {
    common: {
      save: 'حفظ',
      cancel: 'إلغاء',
      delete: 'حذف',
      edit: 'تعديل',
      add: 'إضافة',
      search: 'بحث',
      filter: 'تصفية',
      loading: 'جاري التحميل...',
      error: 'خطأ',
      success: 'نجح',
      warning: 'تحذير',
      info: 'معلومات',
      yes: 'نعم',
      no: 'لا',
      ok: 'موافق',
      close: 'إغلاق',
    },
    navigation: {
      home: 'الرئيسية',
      dashboard: 'لوحة التحكم',
      beneficiaries: 'المستفيدون',
      donations: 'التبرعات',
      members: 'الأعضاء',
      events: 'الأحداث',
      reports: 'التقارير',
      settings: 'الإعدادات',
      profile: 'الملف الشخصي',
      logout: 'تسجيل الخروج',
    },
    dashboard: {
      title: 'لوحة التحكم',
      welcome: 'مرحباً',
      totalBeneficiaries: 'إجمالي المستفيدين',
      totalDonations: 'إجمالي التبرعات',
      totalMembers: 'إجمالي الأعضاء',
      totalEvents: 'إجمالي الأحداث',
      recentActivity: 'النشاط الأخير',
      upcomingTasks: 'المهام القادمة',
    },
    forms: {
      required: 'هذا الحقل مطلوب',
      invalidEmail: 'يرجى إدخال عنوان بريد إلكتروني صحيح',
      invalidPhone: 'يرجى إدخال رقم هاتف صحيح',
      minLength: 'يجب أن يكون على الأقل {min} أحرف',
      maxLength: 'يجب أن يكون على الأكثر {max} أحرف',
      passwordMismatch: 'كلمات المرور غير متطابقة',
      selectOption: 'اختر خياراً',
      uploadFile: 'رفع ملف',
      dragDrop: 'اسحب وأفلت الملفات هنا',
    },
    errors: {
      networkError: 'خطأ في الاتصال بالشبكة',
      serverError: 'خطأ في الخادم',
      unauthorized: 'وصول غير مصرح به',
      forbidden: 'تم رفض الوصول',
      notFound: 'غير موجود',
      validationError: 'خطأ في التحقق',
      unknownError: 'خطأ غير معروف',
    },
  },

  ku: {
    common: {
      save: 'پاشەکەوتن',
      cancel: 'هەڵوەشاندنەوە',
      delete: 'سڕینەوە',
      edit: 'دەستکاری',
      add: 'زیادکردن',
      search: 'گەڕان',
      filter: 'پاڵاوتن',
      loading: 'بارکردن...',
      error: 'هەڵە',
      success: 'سەرکەوتوو',
      warning: 'ئاگادارکردنەوە',
      info: 'زانیاری',
      yes: 'بەڵێ',
      no: 'نەخێر',
      ok: 'باشە',
      close: 'داخستن',
    },
    navigation: {
      home: 'سەرەکی',
      dashboard: 'داشبۆرد',
      beneficiaries: 'سوودبەخەکان',
      donations: 'بەخشینەکان',
      members: 'ئەندامان',
      events: 'ڕووداوەکان',
      reports: 'ڕاپۆرتەکان',
      settings: 'ڕێکخستنەکان',
      profile: 'پرۆفایل',
      logout: 'دەرچوون',
    },
    dashboard: {
      title: 'داشبۆرد',
      welcome: 'بەخێربێن',
      totalBeneficiaries: 'کۆی سوودبەخەکان',
      totalDonations: 'کۆی بەخشینەکان',
      totalMembers: 'کۆی ئەندامان',
      totalEvents: 'کۆی ڕووداوەکان',
      recentActivity: 'چالاکی دوایی',
      upcomingTasks: 'ئەرکە داهاتووەکان',
    },
    forms: {
      required: 'ئەم خانەیە پێویستە',
      invalidEmail: 'تکایە ئیمەیڵێکی دروست بنووسە',
      invalidPhone: 'تکایە ژمارەی تەلەفۆنێکی دروست بنووسە',
      minLength: 'دەبێت لانیکەم {min} پیت بێت',
      maxLength: 'دەبێت زۆرترین {max} پیت بێت',
      passwordMismatch: 'وشەی نهێنییەکان یەکناگرنەوە',
      selectOption: 'هەڵبژاردنێک هەڵبژێرە',
      uploadFile: 'فایل بارکردن',
      dragDrop: 'فایلەکان لێرە ڕاکێشە و فڕێ بدە',
    },
    errors: {
      networkError: 'هەڵەی پەیوەندی تۆڕ',
      serverError: 'هەڵەی سێرڤەر',
      unauthorized: 'دەستپێگەیشتنی بێ مۆڵەت',
      forbidden: 'دەستپێگەیشتن ڕەتکراوە',
      notFound: 'نەدۆزرایەوە',
      validationError: 'هەڵەی پشتڕاستکردنەوە',
      unknownError: 'هەڵەی نەناسراو',
    },
  },

  de: {
    common: {
      save: 'Speichern',
      cancel: 'Abbrechen',
      delete: 'Löschen',
      edit: 'Bearbeiten',
      add: 'Hinzufügen',
      search: 'Suchen',
      filter: 'Filtern',
      loading: 'Laden...',
      error: 'Fehler',
      success: 'Erfolgreich',
      warning: 'Warnung',
      info: 'Information',
      yes: 'Ja',
      no: 'Nein',
      ok: 'OK',
      close: 'Schließen',
    },
    navigation: {
      home: 'Startseite',
      dashboard: 'Dashboard',
      beneficiaries: 'Begünstigte',
      donations: 'Spenden',
      members: 'Mitglieder',
      events: 'Veranstaltungen',
      reports: 'Berichte',
      settings: 'Einstellungen',
      profile: 'Profil',
      logout: 'Abmelden',
    },
    dashboard: {
      title: 'Dashboard',
      welcome: 'Willkommen',
      totalBeneficiaries: 'Gesamte Begünstigte',
      totalDonations: 'Gesamte Spenden',
      totalMembers: 'Gesamte Mitglieder',
      totalEvents: 'Gesamte Veranstaltungen',
      recentActivity: 'Letzte Aktivitäten',
      upcomingTasks: 'Anstehende Aufgaben',
    },
    forms: {
      required: 'Dieses Feld ist erforderlich',
      invalidEmail: 'Bitte geben Sie eine gültige E-Mail-Adresse ein',
      invalidPhone: 'Bitte geben Sie eine gültige Telefonnummer ein',
      minLength: 'Muss mindestens {min} Zeichen haben',
      maxLength: 'Darf höchstens {max} Zeichen haben',
      passwordMismatch: 'Passwörter stimmen nicht überein',
      selectOption: 'Option auswählen',
      uploadFile: 'Datei hochladen',
      dragDrop: 'Dateien hierher ziehen',
    },
    errors: {
      networkError: 'Netzwerkverbindungsfehler',
      serverError: 'Serverfehler',
      unauthorized: 'Unbefugter Zugriff',
      forbidden: 'Zugriff verweigert',
      notFound: 'Nicht gefunden',
      validationError: 'Validierungsfehler',
      unknownError: 'Unbekannter Fehler',
    },
  },

  fr: {
    common: {
      save: 'Enregistrer',
      cancel: 'Annuler',
      delete: 'Supprimer',
      edit: 'Modifier',
      add: 'Ajouter',
      search: 'Rechercher',
      filter: 'Filtrer',
      loading: 'Chargement...',
      error: 'Erreur',
      success: 'Succès',
      warning: 'Avertissement',
      info: 'Information',
      yes: 'Oui',
      no: 'Non',
      ok: 'OK',
      close: 'Fermer',
    },
    navigation: {
      home: 'Accueil',
      dashboard: 'Tableau de bord',
      beneficiaries: 'Bénéficiaires',
      donations: 'Dons',
      members: 'Membres',
      events: 'Événements',
      reports: 'Rapports',
      settings: 'Paramètres',
      profile: 'Profil',
      logout: 'Déconnexion',
    },
    dashboard: {
      title: 'Tableau de bord',
      welcome: 'Bienvenue',
      totalBeneficiaries: 'Total des bénéficiaires',
      totalDonations: 'Total des dons',
      totalMembers: 'Total des membres',
      totalEvents: 'Total des événements',
      recentActivity: 'Activité récente',
      upcomingTasks: 'Tâches à venir',
    },
    forms: {
      required: 'Ce champ est requis',
      invalidEmail: 'Veuillez saisir une adresse e-mail valide',
      invalidPhone: 'Veuillez saisir un numéro de téléphone valide',
      minLength: 'Doit contenir au moins {min} caractères',
      maxLength: 'Doit contenir au maximum {max} caractères',
      passwordMismatch: 'Les mots de passe ne correspondent pas',
      selectOption: 'Sélectionner une option',
      uploadFile: 'Télécharger un fichier',
      dragDrop: 'Glisser-déposer les fichiers ici',
    },
    errors: {
      networkError: 'Erreur de connexion réseau',
      serverError: 'Erreur serveur',
      unauthorized: 'Accès non autorisé',
      forbidden: 'Accès refusé',
      notFound: 'Non trouvé',
      validationError: 'Erreur de validation',
      unknownError: 'Erreur inconnue',
    },
  },

  es: {
    common: {
      save: 'Guardar',
      cancel: 'Cancelar',
      delete: 'Eliminar',
      edit: 'Editar',
      add: 'Agregar',
      search: 'Buscar',
      filter: 'Filtrar',
      loading: 'Cargando...',
      error: 'Error',
      success: 'Éxito',
      warning: 'Advertencia',
      info: 'Información',
      yes: 'Sí',
      no: 'No',
      ok: 'OK',
      close: 'Cerrar',
    },
    navigation: {
      home: 'Inicio',
      dashboard: 'Panel de control',
      beneficiaries: 'Beneficiarios',
      donations: 'Donaciones',
      members: 'Miembros',
      events: 'Eventos',
      reports: 'Informes',
      settings: 'Configuración',
      profile: 'Perfil',
      logout: 'Cerrar sesión',
    },
    dashboard: {
      title: 'Panel de control',
      welcome: 'Bienvenido',
      totalBeneficiaries: 'Total de beneficiarios',
      totalDonations: 'Total de donaciones',
      totalMembers: 'Total de miembros',
      totalEvents: 'Total de eventos',
      recentActivity: 'Actividad reciente',
      upcomingTasks: 'Tareas próximas',
    },
    forms: {
      required: 'Este campo es obligatorio',
      invalidEmail: 'Por favor ingrese una dirección de correo válida',
      invalidPhone: 'Por favor ingrese un número de teléfono válido',
      minLength: 'Debe tener al menos {min} caracteres',
      maxLength: 'Debe tener como máximo {max} caracteres',
      passwordMismatch: 'Las contraseñas no coinciden',
      selectOption: 'Seleccionar una opción',
      uploadFile: 'Subir archivo',
      dragDrop: 'Arrastra y suelta archivos aquí',
    },
    errors: {
      networkError: 'Error de conexión de red',
      serverError: 'Error del servidor',
      unauthorized: 'Acceso no autorizado',
      forbidden: 'Acceso denegado',
      notFound: 'No encontrado',
      validationError: 'Error de validación',
      unknownError: 'Error desconocido',
    },
  },
};

class InternationalizationService {
  private currentLanguage: SupportedLanguage = 'tr';
  private readonly fallbackLanguage: SupportedLanguage = 'en';
  private settings: LanguageSettings;

  constructor() {
    this.settings = this.getDefaultSettings();
    this.loadLanguageFromStorage();
    this.applyLanguageSettings();
  }

  /**
   * Varsayılan ayarlar
   */
  private getDefaultSettings(): LanguageSettings {
    return {
      current: 'tr',
      fallback: 'en',
      rtl: false,
      dateFormat: 'DD/MM/YYYY',
      numberFormat: 'tr-TR',
      currency: 'TRY',
      timezone: 'Europe/Istanbul',
    };
  }

  /**
   * Dil ayarlarını localStorage'dan yükle
   */
  private loadLanguageFromStorage(): void {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('language-settings');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          this.settings = { ...this.settings, ...parsed };
          this.currentLanguage = this.settings.current;
        } catch (error) {
          logger.warn('[i18n] Failed to load language settings:', error);
        }
      }
    }
  }

  /**
   * Dil ayarlarını localStorage'a kaydet
   */
  private saveLanguageToStorage(): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('language-settings', JSON.stringify(this.settings));
    }
  }

  /**
   * Dil ayarlarını uygula
   */
  private applyLanguageSettings(): void {
    if (typeof document !== 'undefined') {
      const html = document.documentElement;

      // Dil attribute'unu ayarla
      html.setAttribute('lang', this.currentLanguage);

      // RTL desteği
      if (this.settings.rtl) {
        html.setAttribute('dir', 'rtl');
      } else {
        html.setAttribute('dir', 'ltr');
      }

      // CSS sınıfları
      html.classList.remove(
        'lang-tr',
        'lang-en',
        'lang-ar',
        'lang-ku',
        'lang-de',
        'lang-fr',
        'lang-es',
      );
      html.classList.add(`lang-${this.currentLanguage}`);

      if (this.settings.rtl) {
        html.classList.add('rtl');
      } else {
        html.classList.remove('rtl');
      }
    }
  }

  /**
   * Çeviri al
   */
  public t(key: string, params?: Record<string, any>): string {
    const keys = key.split('.');
    let translation: any = translations[this.currentLanguage];

    // Anahtarı takip et
    for (const k of keys) {
      if (translation && typeof translation === 'object' && k in translation) {
        translation = translation[k];
      } else {
        // Fallback diline geç
        translation = translations[this.fallbackLanguage];
        for (const k of keys) {
          if (translation && typeof translation === 'object' && k in translation) {
            translation = translation[k];
          } else {
            return key; // Çeviri bulunamadı
          }
        }
        break;
      }
    }

    if (typeof translation !== 'string') {
      return key;
    }

    // Parametreleri değiştir
    if (params) {
      return translation.replace(/\{(\w+)\}/g, (match, param) => {
        return params[param] ?? match;
      });
    }

    return translation;
  }

  /**
   * Dil değiştir
   */
  public setLanguage(language: SupportedLanguage): void {
    this.currentLanguage = language;
    this.settings.current = language;
    this.settings.rtl = this.isRTLLanguage(language);

    this.applyLanguageSettings();
    this.saveLanguageToStorage();

    // Dil değişikliği eventi
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('languageChanged', {
          detail: { language, settings: this.settings },
        }),
      );
    }
  }

  /**
   * RTL dil kontrolü
   */
  private isRTLLanguage(language: SupportedLanguage): boolean {
    return language === 'ar' || language === 'ku';
  }

  /**
   * Mevcut dil
   */
  public getCurrentLanguage(): SupportedLanguage {
    return this.currentLanguage;
  }

  /**
   * Dil ayarları
   */
  public getSettings(): LanguageSettings {
    return { ...this.settings };
  }

  /**
   * Desteklenen diller
   */
  public getSupportedLanguages(): {
    code: SupportedLanguage;
    name: string;
    nativeName: string;
    rtl: boolean;
  }[] {
    return [
      { code: 'tr', name: 'Turkish', nativeName: 'Türkçe', rtl: false },
      { code: 'en', name: 'English', nativeName: 'English', rtl: false },
      { code: 'ar', name: 'Arabic', nativeName: 'العربية', rtl: true },
      { code: 'ku', name: 'Kurdish', nativeName: 'کوردی', rtl: true },
      { code: 'de', name: 'German', nativeName: 'Deutsch', rtl: false },
      { code: 'fr', name: 'French', nativeName: 'Français', rtl: false },
      { code: 'es', name: 'Spanish', nativeName: 'Español', rtl: false },
    ];
  }

  /**
   * Tarih formatla
   */
  public formatDate(date: Date, _format?: string): string {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    };

    return new Intl.DateTimeFormat(this.settings.numberFormat, options).format(date);
  }

  /**
   * Sayı formatla
   */
  public formatNumber(number: number): string {
    return new Intl.NumberFormat(this.settings.numberFormat).format(number);
  }

  /**
   * Para birimi formatla
   */
  public formatCurrency(amount: number): string {
    return new Intl.NumberFormat(this.settings.numberFormat, {
      style: 'currency',
      currency: this.settings.currency,
    }).format(amount);
  }

  /**
   * Çeviri yükle (dinamik)
   */
  public async loadTranslations(language: SupportedLanguage): Promise<void> {
    try {
      // Gerçek uygulamada API'den çeviriler yüklenebilir
      logger.info(`[i18n] Loading translations for ${language}`);
    } catch (error) {
      logger.error(`[i18n] Failed to load translations for ${language}:`, error);
    }
  }

  /**
   * Eksik çevirileri tespit et
   */
  public findMissingTranslations(): {
    language: SupportedLanguage;
    missingKeys: string[];
  }[] {
    const missing: { language: SupportedLanguage; missingKeys: string[] }[] = [];
    const referenceKeys = this.getAllKeys(translations.en);

    Object.keys(translations).forEach((lang) => {
      const langCode = lang as SupportedLanguage;
      if (langCode !== 'en') {
        const langKeys = this.getAllKeys(translations[langCode]);
        const missingKeys = referenceKeys.filter((key) => !langKeys.includes(key));

        if (missingKeys.length > 0) {
          missing.push({
            language: langCode,
            missingKeys,
          });
        }
      }
    });

    return missing;
  }

  /**
   * Tüm anahtarları al
   */
  private getAllKeys(obj: any, prefix = ''): string[] {
    let keys: string[] = [];

    for (const key in obj) {
      if (typeof obj[key] === 'object' && obj[key] !== null) {
        keys = keys.concat(this.getAllKeys(obj[key], prefix ? `${prefix}.${key}` : key));
      } else {
        keys.push(prefix ? `${prefix}.${key}` : key);
      }
    }

    return keys;
  }
}

// Singleton instance
export const i18n = new InternationalizationService();

// React hook for internationalization
export const useTranslation = () => {
  const [currentLanguage, setCurrentLanguage] = useState(i18n.getCurrentLanguage());
  const [settings, setSettings] = useState(i18n.getSettings());

  useEffect(() => {
    const handleLanguageChange = (event: CustomEvent) => {
      setCurrentLanguage(event.detail.language);
      setSettings(event.detail.settings);
    };

    window.addEventListener('languageChanged', handleLanguageChange as EventListener);
    return () => {
      window.removeEventListener('languageChanged', handleLanguageChange as EventListener);
    };
  }, []);

  return {
    t: (key: string, params?: Record<string, any>) => i18n.t(key, params),
    setLanguage: (language: SupportedLanguage) => {
      i18n.setLanguage(language);
    },
    currentLanguage,
    settings,
    supportedLanguages: i18n.getSupportedLanguages(),
    formatDate: (date: Date, format?: string) => i18n.formatDate(date, format),
    formatNumber: (number: number) => i18n.formatNumber(number),
    formatCurrency: (amount: number) => i18n.formatCurrency(amount),
  };
};

export default i18n;
