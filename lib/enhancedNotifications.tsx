/**
 * @fileoverview Enhanced Notification Utilities - Türkçe bildirim sistemi
 *
 * @author Dernek Yönetim Sistemi Team
 * @version 2.0.0
 */

import { toast } from 'sonner';

export type NotificationCategory =
  | 'genel'
  | 'bagis'
  | 'uye'
  | 'yardim'
  | 'mali'
  | 'etkinlik'
  | 'sistem'
  | 'onay';

export type NotificationPriority = 'dusuk' | 'orta' | 'yuksek' | 'acil';

// =============================================================================
// MAPPING FOR ENGLISH TO TURKISH (for notificationStore compatibility)
// =============================================================================

// Map English categories from notificationStore to Turkish categories
export const CATEGORY_MAP: Record<string, NotificationCategory> = {
  general: 'genel',
  donation: 'bagis',
  member: 'uye',
  aid: 'yardim',
  campaign: 'yardim', // Campaign maps to aid/yardim
  finance: 'mali',
  event: 'etkinlik',
  system: 'sistem',
  approval: 'onay',
  // Turkish to Turkish (pass-through)
  genel: 'genel',
  bagis: 'bagis',
  uye: 'uye',
  yardim: 'yardim',
  mali: 'mali',
  etkinlik: 'etkinlik',
  sistem: 'sistem',
  onay: 'onay',
};

// Map English priorities from notificationStore to Turkish priorities
export const PRIORITY_MAP: Record<string, NotificationPriority> = {
  low: 'dusuk',
  medium: 'orta',
  high: 'yuksek',
  urgent: 'acil',
  // Turkish to Turkish (pass-through)
  dusuk: 'dusuk',
  orta: 'orta',
  yuksek: 'yuksek',
  acil: 'acil',
};

export interface NotificationConfig {
  title: string;
  message: string;
  category?: NotificationCategory | string; // Allow both Turkish and English
  priority?: NotificationPriority | string; // Allow both Turkish and English
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
  sound?: boolean;
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Convert English category to Turkish category
 * Useful when working with notificationStore which uses English categories
 */
export function mapCategory(category: string | undefined): NotificationCategory {
  if (!category) return 'genel';
  return CATEGORY_MAP[category] || 'genel';
}

/**
 * Convert English priority to Turkish priority
 * Useful when working with notificationStore which uses English priorities
 */
export function mapPriority(priority: string | undefined): NotificationPriority {
  if (!priority) return 'orta';
  return PRIORITY_MAP[priority] || 'orta';
}

// Öncelik süreleri (ms)
const priorityDurations = {
  dusuk: 3000,
  orta: 4000,
  yuksek: 6000,
  acil: 8000,
};

// Kategori renkleri CSS sınıfları
const categoryStyles = {
  genel: 'border-l-4 border-l-blue-500 bg-blue-50',
  bagis: 'border-l-4 border-l-pink-500 bg-pink-50',
  uye: 'border-l-4 border-l-green-500 bg-green-50',
  yardim: 'border-l-4 border-l-purple-500 bg-purple-50',
  mali: 'border-l-4 border-l-yellow-500 bg-yellow-50',
  etkinlik: 'border-l-4 border-l-indigo-500 bg-indigo-50',
  sistem: 'border-l-4 border-l-gray-500 bg-gray-50',
  onay: 'border-l-4 border-l-orange-500 bg-orange-50',
};

// Ses efektleri
const playNotificationSound = (priority: NotificationPriority = 'orta') => {
  if (priority === 'acil' && typeof Audio !== 'undefined') {
    try {
      const audio = new Audio('/notification.mp3');
      audio.volume = 0.3;
      audio.play().catch(() => {
        // Ses çalınamadı, sessizce devam et
      });
    } catch {
      // Ses dosyası bulunamadı
    }
  }
};

// Gelişmiş bildirim fonksiyonları
export const enhancedNotifications = {
  // Başarı bildirimi
  basari: (config: NotificationConfig) => {
    const mappedPriority = mapPriority(config.priority);
    const mappedCategory = mapCategory(config.category);
    const duration = config.duration ?? priorityDurations[mappedPriority];
    const categoryStyle = categoryStyles[mappedCategory];

    if (config.sound) {
      playNotificationSound(mappedPriority);
    }

    const toastOptions: any = {
      description: config.title,
      duration,
      className: categoryStyle,
    };

    if (config.action) {
      toastOptions.action = {
        label: config.action.label,
        onClick: config.action.onClick,
      };
    }

    toast.success(config.message, toastOptions);
  },

  // Hata bildirimi
  hata: (config: NotificationConfig) => {
    const mappedPriority = mapPriority(config.priority);
    const mappedCategory = mapCategory(config.category);
    const duration = config.duration ?? priorityDurations[mappedPriority];
    const categoryStyle = mappedCategory
      ? categoryStyles[mappedCategory]
      : 'border-l-4 border-l-red-500 bg-red-50';

    if (config.sound) {
      playNotificationSound(mappedPriority);
    }

    const toastOptions: any = {
      description: config.title,
      duration,
      className: categoryStyle,
    };

    if (config.action) {
      toastOptions.action = {
        label: config.action.label,
        onClick: config.action.onClick,
      };
    }

    toast.error(config.message, toastOptions);
  },

  // Uyarı bildirimi
  uyari: (config: NotificationConfig) => {
    const mappedPriority = mapPriority(config.priority);
    const mappedCategory = mapCategory(config.category);
    const duration = config.duration ?? priorityDurations[mappedPriority];
    const categoryStyle = mappedCategory
      ? categoryStyles[mappedCategory]
      : 'border-l-4 border-l-amber-500 bg-amber-50';

    if (config.sound && mappedPriority === 'acil') {
      playNotificationSound(mappedPriority);
    }

    const toastOptions: any = {
      description: config.title,
      duration,
      className: categoryStyle,
    };

    if (config.action) {
      toastOptions.action = {
        label: config.action.label,
        onClick: config.action.onClick,
      };
    }

    toast.warning(config.message, toastOptions);
  },

  // Bilgi bildirimi
  bilgi: (config: NotificationConfig) => {
    const mappedPriority = mapPriority(config.priority);
    const mappedCategory = mapCategory(config.category);
    const duration = config.duration ?? priorityDurations[mappedPriority];
    const categoryStyle = categoryStyles[mappedCategory];

    const toastOptions: any = {
      description: config.title,
      duration,
      className: categoryStyle,
    };

    if (config.action) {
      toastOptions.action = {
        label: config.action.label,
        onClick: config.action.onClick,
      };
    }

    toast.info(config.message, toastOptions);
  },
};

// Kolay kullanım için önceden tanımlanmış bildirimler
export const quickNotifications = {
  // Bağış bildirimleri
  yeniBagis: (bagisci: string, miktar: number, paraBirimi = 'TL') => {
    enhancedNotifications.basari({
      title: 'Yeni Bağış Alındı',
      message: `${bagisci} tarafından ${miktar} ${paraBirimi} bağış yapıldı.`,
      category: 'bagis',
      priority: 'orta',
      sound: true,
      action: {
        label: 'Detayları Gör',
        onClick: () => {
          window.location.href = '/bagislar';
        },
      },
    });
  },

  // Üye bildirimleri
  yeniUye: (uyeAdi: string) => {
    enhancedNotifications.basari({
      title: 'Yeni Üye Kaydı',
      message: `${uyeAdi} sisteme başarıyla kaydedildi.`,
      category: 'uye',
      priority: 'orta',
      action: {
        label: 'Üyeyi Gör',
        onClick: () => {
          window.location.href = '/uyeler';
        },
      },
    });
  },

  // Yardım bildirimleri
  yardimBasvurusu: (basvuranAdi: string, yardimTuru: string) => {
    enhancedNotifications.uyari({
      title: 'Yeni Yardım Başvurusu',
      message: `${basvuranAdi} tarafından ${yardimTuru} başvurusu yapıldı.`,
      category: 'yardim',
      priority: 'yuksek',
      sound: true,
      action: {
        label: 'Başvuruyu İncele',
        onClick: () => {
          window.location.href = '/yardimlar/basvurular';
        },
      },
    });
  },

  // Sistem bildirimleri
  yedekleme: (basarili: boolean, tarih: string) => {
    if (basarili) {
      enhancedNotifications.basari({
        title: 'Yedekleme Tamamlandı',
        message: `Sistem yedeği ${tarih} tarihinde başarıyla oluşturuldu.`,
        category: 'sistem',
        priority: 'dusuk',
      });
    } else {
      enhancedNotifications.hata({
        title: 'Yedekleme Başarısız',
        message: `Sistem yedeği ${tarih} tarihinde oluşturulamadı.`,
        category: 'sistem',
        priority: 'yuksek',
        sound: true,
      });
    }
  },

  // Onay bildirimleri
  onayBekleniyor: (tur: string, oge: string) => {
    enhancedNotifications.uyari({
      title: 'Onay Bekleniyor',
      message: `${tur} için ${oge} yönetici onayı bekliyor.`,
      category: 'onay',
      priority: 'yuksek',
      action: {
        label: 'Onayla/Reddet',
        onClick: () => {
          window.location.href = '/onaylar';
        },
      },
    });
  },

  // Mali bildirimler
  butceUyarisi: (kategori: string, oran: number) => {
    const priority: NotificationPriority = oran >= 90 ? 'acil' : oran >= 80 ? 'yuksek' : 'orta';

    enhancedNotifications.uyari({
      title: 'Bütçe Uyarısı',
      message: `${kategori} bütçesinin %${oran}'i kullanıldı.`,
      category: 'mali',
      priority,
      sound: priority === 'acil',
      action: {
        label: 'Bütçeyi Gör',
        onClick: () => {
          window.location.href = '/mali/butce';
        },
      },
    });
  },

  // Etkinlik bildirimleri
  etkinlikHatirlatmasi: (etkinlikAdi: string, tarih: string, sure: string) => {
    enhancedNotifications.bilgi({
      title: 'Etkinlik Hatırlatması',
      message: `${etkinlikAdi} etkinliği ${sure} sonra (${tarih}) başlayacak.`,
      category: 'etkinlik',
      priority: 'orta',
      action: {
        label: 'Etkinlik Detayları',
        onClick: () => {
          window.location.href = '/etkinlikler';
        },
      },
    });
  },
};

// Bildirim geçmişi için yardımcı fonksiyonlar
export const notificationHistory = {
  save: (notification: Record<string, unknown>) => {
    try {
      const history = JSON.parse(localStorage.getItem('notification-history') ?? '[]');
      history.unshift({
        ...notification,
        timestamp: new Date().toISOString(),
      });

      // Son 100 bildirimi sakla
      if (history.length > 100) {
        history.splice(100);
      }

      localStorage.setItem('notification-history', JSON.stringify(history));
    } catch {
      // LocalStorage kullanılamıyor
    }
  },

  get: () => {
    try {
      return JSON.parse(localStorage.getItem('notification-history') ?? '[]');
    } catch {
      return [];
    }
  },

  clear: () => {
    try {
      localStorage.removeItem('notification-history');
    } catch {
      // LocalStorage kullanılamıyor
    }
  },
};
