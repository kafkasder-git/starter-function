/**
 * Enhanced Notification System Integration Guide
 * 
 * Bu dosya enhanced notification sisteminin mevcut bileşenlere
 * nasıl entegre edileceğini gösterir.
 * 
 * NOTE: This file contains example components that are intentionally unused.
 * They are for demonstration purposes only.
 */

/* eslint-disable @typescript-eslint/no-unused-vars */

import React from 'react';
// Removed unused import: useNavigate
import { toast } from 'sonner';
import { logger } from '@/lib/logging/logger';

// 1. ToastProvider'ı ana App bileşeninde kullanın
// eslint-disable-next-line unused-imports/no-unused-imports
import { ToastProvider } from '@/components/ToastProvider';

// function _App() {
//   return (
//     <div className="App">
//       {/* Diğer bileşenler */}
      
//       {/* Enhanced notification provider'ı en üst seviyede ekleyin */}
//       <ToastProvider />
//     </div>
//   );
// }

// 2. Bileşenlerde enhanced notifications kullanımı
import { enhancedNotifications, quickNotifications } from '@/lib/enhancedNotifications';

// Mock functions for the guide
interface MemberData {
  name: string;
  email: string;
  phone?: string;
  [key: string]: string | number | boolean | undefined;
}

// Mock API
interface ApiResponse {
  data: {
    id: string;
    [key: string]: unknown;
  }
}

const api = {
  post: async (_url: string, _data: Record<string, unknown>): Promise<ApiResponse> => {
    // Simulated API call
    return new Promise(resolve => {
      setTimeout(() => {
        resolve({ data: { id: '123', ..._data } });
      }, 500);
    });
  }
};

// Mock functions for member creation
const createMember = async (memberData: MemberData): Promise<string> => {
  const response = await api.post('/members', memberData);
  return response.data.id;
};

const newMemberId = '123';

// Örnek: Üye ekleme bileşeni
// NOTE: This is an example component to show notification usage
// Note: Using __ prefix for unused components to bypass the React component naming requirement
// while still following the unused variable naming convention
const __AddMemberExampleComponent: React.FC = () => {
  // Since __ prefix isn't recognized as a component name, we need to define this without hooks
  // Replacing useNavigate with a mock function
  const navigate = { push: (route: string): void => { 
    // eslint-disable-next-line no-console
    console.log(`Navigate to ${route}`); 
  }};
  
  const _handleSubmit = async (memberData: MemberData): Promise<void> => {
    try {
      await createMember(memberData);
      
      // Başarı bildirimi göster
      enhancedNotifications.basari({
        title: 'Üye Kaydedildi',
        message: `${memberData.name} başarıyla sisteme eklendi`,
        category: 'uye',
        priority: 'orta',
        sound: true,
        action: {
          label: 'Üyeyi Görüntüle',
          onClick: (): void => { 
            navigate.push(`/uyeler/${newMemberId}`);
          }
        }
      });
      
      // Alternatif olarak hızlı bildirim
      // quickNotifications.yeniUye(memberData.name);
      
    } catch (error) {
      // Using logger for error reporting
      logger.error('Member creation error:', error);
      
      // Hata bildirimi - unused parameter so using underscore prefix
      enhancedNotifications.hata({
        title: 'Üye Eklenemedi',
        message: 'Üye eklenirken bir hata oluştu. Lütfen tekrar deneyin.',
        category: 'uye',
        priority: 'yuksek',
        sound: true
      });
    }
  };
  
  return (
    <div>
      {/* Form implementation would go here */}
      <p>Üye ekleme formu örneği</p>
    </div>
  );
};

// 3. Bildirim merkezini header'da gösterin
import { EnhancedNotificationCenter } from '@/components/notifications/EnhancedNotificationCenter';

/**
 * Header component that includes notification center
 * Using proper React FC definition for hooks
 */
// Example components intentionally unused - they're for demonstration purposes
/* eslint-disable @typescript-eslint/no-unused-vars */
// This is a mock component for demonstration purposes
// Using _HeaderExampleMock name convention for unused variables
const _HeaderExampleMock: React.FC = () => {
  // Mocked state values - not using React hooks
  const isNotificationCenterOpen = false;
  const setIsNotificationCenterOpen = (value: boolean): void => {
    // Mock implementation
    // eslint-disable-next-line no-console
    console.log('Setting notification center open to:', value);
  };

  return (
    <header className="bg-white shadow-sm">
      <div className="flex items-center justify-between px-4 py-2">
        <h1>Dernek Yönetim Sistemi</h1>
        
        <div className="flex items-center space-x-4">
          {/* Bildirim merkezi */}
          <EnhancedNotificationCenter 
            isOpen={isNotificationCenterOpen} 
            onClose={() => { setIsNotificationCenterOpen(false); }} 
          />
          
          {/* Notification center toggle button would be here */}
          <button 
            onClick={() => { setIsNotificationCenterOpen(true); }}
            className="p-2 rounded-full hover:bg-gray-100"
            aria-label="Bildirimleri göster"
          >
            <span>🔔</span>
          </button>
          
          {/* Diğer header öğeleri */}
        </div>
      </div>
    </header>
  );
};

// 4. Service layer entegrasyonu
interface MemberDataInsert extends MemberData {
  createdAt?: string;
  createdBy?: string;
}

class _MemberService {
  async createMember(memberData: MemberDataInsert): Promise<{ id: string; [key: string]: unknown }> {
    try {
      const response = await api.post('/members', memberData);
      
      // Başarılı işlem sonrası bildirim
      quickNotifications.yeniUye(memberData.name);
      
      return response.data;
    } catch (error) {
      // Hata durumunda bildirim
      enhancedNotifications.hata({
        title: 'API Hatası',
        message: 'Üye kaydı sırasında sunucu hatası oluştu',
        category: 'sistem',
        priority: 'yuksek'
      });
      throw error;
    }
  }
}

// 5. Bağış işlemleri örneği
interface DonationData {
  donorName: string;
  amount: number;
  currency: string;
  note?: string;
}

// Example donation submission function - simulates data submission
const submitDonation = async (data: DonationData): Promise<{id: string}> => {
  return new Promise((resolve) => {
    // Simulate processing with the data (using it to prevent unused variable warning)
    const donorInfo = `${data.donorName}-${data.amount}`;
    // Log in development only
    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.log(`Processing donation: ${donorInfo}`);
    }
    setTimeout(() => {
      resolve({id: '456'});
    }, 1000);
  });
};

function _DonationForm() {
  const _handleDonationSubmit = async (donationData: DonationData): Promise<void> => {
    try {
      // İşlem başladığında bilgi bildirimi
      const loadingToast = enhancedNotifications.bilgi({
        title: 'Bağış İşleniyor',
        message: 'Bağış kaydı oluşturuluyor...',
        category: 'bagis',
        duration: 0 // Manuel olarak kapatılacak
      });
      
      await submitDonation(donationData);
      
      // Loading toast'ı kapat
      toast.dismiss(loadingToast);
      
      // Başarı bildirimi
      quickNotifications.yeniBagis(
        donationData.donorName, 
        donationData.amount,
        donationData.currency
      );
      
    } catch (unknownError: unknown) {
      const error = unknownError as Error;
      // Using a fallback for when error.message might be empty string (not null/undefined)
      const errorMessage = error.message || 'Beklenmeyen bir hata oluştu';
      enhancedNotifications.hata({
        title: 'Bağış İşlenemedi',
        message: errorMessage,
        category: 'bagis',
        priority: 'yuksek',
        sound: true
      });
    }
  };
}

// 6. Sistem uyarıları için middleware
function _setupSystemNotifications(): void {
  // Bağlantı durumu kontrolü
  window.addEventListener('online', () => {
    enhancedNotifications.basari({
      title: 'Bağlantı Yeniden Kuruldu',
      message: 'İnternet bağlantısı geri döndü',
      category: 'sistem',
      priority: 'orta'
    });
  });
  
  window.addEventListener('offline', () => {
    enhancedNotifications.uyari({
      title: 'Bağlantı Kesildi',
      message: 'İnternet bağlantısı kesildi. Çevrimdışı modda çalışıyorsunuz.',
      category: 'sistem',
      priority: 'yuksek',
      sound: true,
      duration: 8000
    });
  });
}

// 7. Otomatik bildirimler için interval sistemi
interface BudgetCategory {
  name: string;
  usagePercentage: number;
  budget: number;
  spent: number;
}

// Mock budget check function
const checkBudgetStatus = async (): Promise<BudgetCategory[]> => {
  return [
    { name: 'Ofis Giderleri', usagePercentage: 87, budget: 10000, spent: 8700 },
    { name: 'Etkinlikler', usagePercentage: 65, budget: 25000, spent: 16250 },
    { name: 'Yardım Faaliyetleri', usagePercentage: 92, budget: 50000, spent: 46000 }
  ];
};

function _setupPeriodicNotifications(): void {
  // Her 30 dakikada bir bütçe kontrolü
  setInterval(async () => {
    try {
      const budgetStatus = await checkBudgetStatus();
      
      budgetStatus.forEach(category => {
        if (category.usagePercentage >= 85) {
          quickNotifications.butceUyarisi(category.name, category.usagePercentage);
        }
      });
    } catch (error) {
      // Using a safer console pattern
      if (process.env.NODE_ENV !== 'production') {
        // eslint-disable-next-line no-console
        console.error('Budget check failed:', error);
      }
    }
  }, 30 * 60 * 1000); // 30 dakika
}

// 8. WebSocket ile gerçek zamanlı bildirimler
function _setupRealTimeNotifications(): void {
  const socket = new WebSocket('ws://localhost:8080/notifications');
  
  socket.onmessage = (event) => {
    const notification = JSON.parse(event.data);
    
    switch (notification.type) {
      case 'new_donation':
        quickNotifications.yeniBagis(notification.donor, notification.amount);
        break;
        
      case 'help_request':
        quickNotifications.yardimBasvurusu(notification.applicant, notification.helpType);
        break;
        
      case 'system_alert':
        enhancedNotifications.uyari({
          title: notification.title,
          message: notification.message,
          category: 'sistem',
          priority: 'acil',
          sound: true
        });
        break;
        
      default:
        enhancedNotifications.bilgi({
          title: notification.title,
          message: notification.message,
          category: 'genel'
        });
    }
  };
}

// 9. Notification ayarları hook'u
interface NotificationSettings {
  soundEnabled: boolean;
  categories: {
    bagis: boolean;
    uye: boolean;
    yardim: boolean;
    mali: boolean;
    etkinlik: boolean;
    sistem: boolean;
    onay: boolean;
    genel: boolean;
  };
  priorities: {
    dusuk: boolean;
    orta: boolean;
    yuksek: boolean;
    acil: boolean;
  };
}

// Using underscore prefix as this interface is for documentation purposes
interface _NotificationConfig {
  title: string;
  message: string;
  category: keyof NotificationSettings['categories'];
  priority: keyof NotificationSettings['priorities'];
  sound?: boolean;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

// 9. Notification settings manager component
const _NotificationSettingsExampleUI: React.FC = () => {  
  // Example of usage in a component
  return (
    <div className="p-4 border rounded">
      <h3 className="text-lg font-bold">Bildirim Ayarları</h3>
      
      {/* This would be a real settings UI */}
      <div className="mt-4">
        <p>Bu bir örnek bileşendir. Gerçek bir bildirim ayarları arayüzünde kategori ve öncelik ayarlarını 
        gösteren toggle&apos;lar ve ayar kontrolleri olacaktır.</p>
      </div>
    </div>
  );
};

// 10. Error boundary ile global hata bildirimleri
interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class NotificationErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }
  
  static getDerivedStateFromError(_error: Error): ErrorBoundaryState {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }
  
  componentDidCatch(_error: Error, _errorInfo: React.ErrorInfo): void {
    // You can also log the error to an error reporting service
    enhancedNotifications.hata({
      title: 'Uygulama Hatası',
      message: 'Beklenmeyen bir hata oluştu. Sayfa yeniden yüklenecek.',
      category: 'sistem',
      priority: 'acil',
      sound: true,
      action: {
        label: 'Yeniden Yükle',
        onClick: (): void => { window.location.reload(); }
      }
    });
  }
  
  render(): React.ReactNode {
    if (this.state.hasError) {
      return <div>Bir şeyler ters gitti...</div>;
    }
    
    return this.props.children;
  }
}

// Only export the component
export { NotificationErrorBoundary };

// Move utility function exports to their own file to avoid fast refresh issues.
// In practice, create a separate file like notificationUtils.ts
/*
export {
  useNotificationSettings,
  setupSystemNotifications,
  setupPeriodicNotifications,
  setupRealTimeNotifications
};
*/