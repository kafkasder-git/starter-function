/**
 * @fileoverview NotificationContext Module - Application module
 *
 * @author Dernek Yönetim Sistemi Team
 * @version 1.0.0
 */

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { notificationService, notify } from '../services/notificationService';
import { useNotificationStore } from '../stores/notificationStore';

import { logger } from '../lib/logging/logger';
interface NotificationContextType {
  // Store integration
  store: ReturnType<typeof useNotificationStore>;

  // Quick notification methods
  notify: typeof notify;

  // Real-time methods
  startRealTimeUpdates: () => void;
  stopRealTimeUpdates: () => void;
  isRealTimeActive: boolean;

  // System integration methods
  triggerSystemNotification: (
    type: 'donation' | 'member' | 'aid' | 'system' | 'event'
  ) => Promise<void>;
  simulateWorkflow: (
    workflowType: 'donation-process' | 'aid-application' | 'member-registration'
  ) => Promise<void>;

  // Statistics
  getNotificationStats: () => Promise<any>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

/**
 * NotificationProvider function
 *
 * @param {Object} params - Function parameters
 * @returns {void} Nothing
 */
export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const store = useNotificationStore();
  const [isRealTimeActive, setIsRealTimeActive] = useState(false);
  const [realTimeInterval, setRealTimeInterval] = useState<NodeJS.Timeout | null>(null);

  // Simulate real-time notifications
  const startRealTimeUpdates = useCallback(() => {
    if (isRealTimeActive) return;

    setIsRealTimeActive(true);

    const interval = setInterval(async () => {
      // Simulate random system notifications
      const randomNotifications = [
        () => notify.newDonation('Anonim Bağışçı', Math.floor(Math.random() * 1000) + 50, 'TL'),
        () => notify.newMember(`Üye${Math.floor(Math.random() * 1000)}`),
        () => notify.backup(Math.random() > 0.1, new Date().toLocaleString('tr-TR')),
        () => notify.payment('Aidatlar', Math.floor(Math.random() * 500) + 100, 'Banka Transferi'),
        () =>
          notificationService.createNotification({
            title: 'Sistem Güncelleme',
            message: 'Sistem başarıyla güncellendi.',
            type: 'success',
            category: 'system',
            priority: 'low',
          }),
      ];

      try {
        const randomNotification =
          randomNotifications[Math.floor(Math.random() * randomNotifications.length)];
        await randomNotification();

        logger.info('Real-time notification created');
      } catch (error) {
        logger.error('Error creating real-time notification:', error);
      }
    }, 10000); // Every 10 seconds

    setRealTimeInterval(interval);
    toast.success('Gerçek zamanlı bildirimler aktifleştirildi');
  }, [isRealTimeActive, store, notify]);

  const stopRealTimeUpdates = useCallback(() => {
    if (!isRealTimeActive) return;

    if (realTimeInterval) {
      clearInterval(realTimeInterval);
      setRealTimeInterval(null);
    }

    setIsRealTimeActive(false);
    toast.info('Gerçek zamanlı bildirimler durduruldu');
  }, [isRealTimeActive, realTimeInterval]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (realTimeInterval) {
        clearInterval(realTimeInterval);
      }
    };
  }, [realTimeInterval]);

  // System integration examples
  const triggerSystemNotification = useCallback(
    async (type: 'donation' | 'member' | 'aid' | 'system' | 'event') => {
      try {
        switch (type) {
          case 'donation':
            await notify.newDonation('Test Bağışçı', 500, 'TL');
            await notify.payment('Bağış', 500, 'Kredi Kartı');
            break;

          case 'member':
            await notify.newMember('Yeni Test Üyesi');
            await notificationService.createNotification({
              title: 'Üyelik Onayı',
              message: 'Yeni üye başvurusu yönetici onayı bekliyor.',
              type: 'warning',
              category: 'member',
              priority: 'medium',
            });
            break;

          case 'aid':
            await notify.aidApplication('Test Başvuru Sahibi', 'Gıda Paketi');
            await notificationService.createNotification({
              title: 'Yardım Değerlendirmesi',
              message: 'Yardım başvurusu saha ekibi tarafından değerlendirildi.',
              type: 'info',
              category: 'aid',
              priority: 'medium',
            });
            break;

          case 'system':
            await notify.backup(true, new Date().toLocaleString('tr-TR'));
            await notify.systemMaintenance('23:00', '01:00');
            break;

          case 'event':
            await notify.event('Örnek Etkinlik', 'Yarın', '15:00');
            break;

          default:
            throw new Error('Geçersiz bildirim tipi');
        }

        toast.success('Sistem bildirimleri oluşturuldu');
      } catch (error) {
        logger.error('Error triggering system notification:', error);
        toast.error('Sistem bildirimi oluşturulurken hata oluştu');
      }
    },
    [store, notify]
  );

  // Simulate complex workflows
  const simulateWorkflow = useCallback(
    async (workflowType: 'donation-process' | 'aid-application' | 'member-registration') => {
      try {
        switch (workflowType) {
          case 'donation-process':
            toast.info('Bağış süreci simülasyonu başlatılıyor...');

            // Step 1: Donation received
            await notify.newDonation('Ahmet Kaya', 750, 'TL');
            await new Promise((resolve) => setTimeout(resolve, 1000));

            // Step 2: Payment processing
            await notify.payment('Bağış', 750, 'Banka Transferi');
            await new Promise((resolve) => setTimeout(resolve, 1000));

            // Step 3: Thank you notification
            await notificationService.createNotification({
              title: 'Teşekkür Mesajı Gönderildi',
              message: "Ahmet Kaya'ya teşekkür mesajı otomatik olarak gönderildi.",
              type: 'success',
              category: 'donation',
              priority: 'low',
            });

            break;

          case 'aid-application':
            toast.info('Yardım başvuru süreci simülasyonu başlatılıyor...');

            // Step 1: Application received
            await notify.aidApplication('Fatma Yılmaz', 'Kırtasiye Yardımı');
            await new Promise((resolve) => setTimeout(resolve, 1000));

            // Step 2: Evaluation
            await notificationService.createNotification({
              title: 'Başvuru Değerlendirmesi',
              message: "Fatma Yılmaz'ın başvurusu sosyal hizmet uzmanı tarafından inceleniyor.",
              type: 'info',
              category: 'aid',
              priority: 'medium',
            });
            await new Promise((resolve) => setTimeout(resolve, 1000));

            // Step 3: Approval
            await notify.approval('Yardım Başvurusu', 'Kırtasiye Yardımı', 'Sosyal Hizmet Uzmanı');
            await new Promise((resolve) => setTimeout(resolve, 1000));

            // Step 4: Distribution
            await notificationService.createNotification({
              title: 'Yardım Dağıtıldı',
              message: "Fatma Yılmaz'a kırtasiye yardımı başarıyla teslim edildi.",
              type: 'success',
              category: 'aid',
              priority: 'low',
            });

            break;

          case 'member-registration':
            toast.info('Üye kayıt süreci simülasyonu başlatılıyor...');

            // Step 1: New member
            await notify.newMember('Zeynep Kaya');
            await new Promise((resolve) => setTimeout(resolve, 1000));

            // Step 2: Document verification
            await notificationService.createNotification({
              title: 'Belge Kontrolü',
              message: "Zeynep Kaya'nın üyelik belgeleri kontrol ediliyor.",
              type: 'info',
              category: 'member',
              priority: 'medium',
            });
            await new Promise((resolve) => setTimeout(resolve, 1000));

            // Step 3: Approval needed
            await notify.approval('Üyelik Başvurusu', 'Zeynep Kaya', 'Üyelik Komisyonu');
            await new Promise((resolve) => setTimeout(resolve, 1000));

            // Step 4: Welcome message
            await notificationService.createNotification({
              title: 'Hoş Geldin Mesajı',
              message: "Zeynep Kaya'ya hoş geldin mesajı ve üyelik kılavuzu gönderildi.",
              type: 'success',
              category: 'member',
              priority: 'low',
            });

            break;

          default:
            throw new Error('Geçersiz iş akışı tipi');
        }

        toast.success('İş akışı simülasyonu tamamlandı');
      } catch (error) {
        logger.error('Error simulating workflow:', error);
        toast.error('İş akışı simülasyonu sırasında hata oluştu');
      }
    },
    [store, notify]
  );

  // Get notification statistics
  const getNotificationStats = useCallback(async () => {
    try {
      return await notificationService.getNotificationStats();
    } catch (error) {
      logger.error('Error getting notification stats:', error);
      return null;
    }
  }, []);

  const value: NotificationContextType = {
    store,
    notify,
    startRealTimeUpdates,
    stopRealTimeUpdates,
    isRealTimeActive,
    triggerSystemNotification,
    simulateWorkflow,
    getNotificationStats,
  };

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
}

/**
 * useNotifications function
 *
 * @param {Object} params - Function parameters
 * @returns {void} Nothing
 */
export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}

export default NotificationProvider;
