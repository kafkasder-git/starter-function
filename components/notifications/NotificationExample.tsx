import React from 'react';
import { Button } from '../ui/button';
import { enhancedNotifications, quickNotifications } from '../../lib/enhancedNotifications';

/**
 * Örnek bileşen - Enhanced Notification sisteminin nasıl kullanılacağını gösterir
 */
export const NotificationExample: React.FC = () => {
  return (
    <div className="p-6 space-y-4">
      <h3 className="text-lg font-semibold mb-4">Geliştirilmiş Bildirim Sistemi Örneği</h3>
      
      <div className="grid grid-cols-2 gap-4">
        {/* Temel bildirimler */}
        <div>
          <h4 className="font-medium mb-2">Temel Bildirimler</h4>
          <div className="space-y-2">
            <Button 
              onClick={() => enhancedNotifications.basari({
                title: 'İşlem Başarılı',
                message: 'İşlem başarıyla tamamlandı!',
                category: 'genel'
              })}
              className="w-full"
              variant="outline"
            >
              Başarı Bildirimi
            </Button>
            
            <Button 
              onClick={() => enhancedNotifications.hata({
                title: 'Hata Oluştu',
                message: 'Bir hata oluştu!',
                category: 'sistem',
                priority: 'yuksek'
              })}
              className="w-full"
              variant="outline"
            >
              Hata Bildirimi
            </Button>
            
            <Button 
              onClick={() => enhancedNotifications.uyari({
                title: 'Uyarı',
                message: 'Dikkat! Bu işlem geri alınamaz.',
                category: 'genel',
                priority: 'yuksek'
              })}
              className="w-full"
              variant="outline"
            >
              Uyarı Bildirimi
            </Button>
            
            <Button 
              onClick={() => enhancedNotifications.bilgi({
                title: 'Bilgilendirme',
                message: 'Yeni güncelleme mevcut.',
                category: 'sistem'
              })}
              className="w-full"
              variant="outline"
            >
              Bilgi Bildirimi
            </Button>
          </div>
        </div>

        {/* Hızlı bildirimler */}
        <div>
          <h4 className="font-medium mb-2">Hızlı Bildirimler</h4>
          <div className="space-y-2">
            <Button 
              onClick={() => { quickNotifications.yeniUye('Ahmet Yılmaz'); }}
              className="w-full"
              variant="outline"
            >
              Yeni Üye
            </Button>
            
            <Button 
              onClick={() => { quickNotifications.yeniBagis('Ayşe Demir', 500); }}
              className="w-full"
              variant="outline"
            >
              Yeni Bağış
            </Button>
            
            <Button 
              onClick={() => { quickNotifications.yardimBasvurusu('Mehmet Ali', 'Gıda Yardımı'); }}
              className="w-full"
              variant="outline"
            >
              Yardım Başvurusu
            </Button>
            
            <Button 
              onClick={() => { quickNotifications.butceUyarisi('Gıda Yardımları', 85); }}
              className="w-full"
              variant="outline"
            >
              Bütçe Uyarısı
            </Button>
          </div>
        </div>
      </div>

      {/* Aksiyon butonlu bildirimler */}
      <div className="mt-6">
        <h4 className="font-medium mb-2">Aksiyon Butonlu Bildirimler</h4>
        <div className="space-x-2">
          <Button 
            onClick={() => enhancedNotifications.uyari({
              title: 'Onay Gerekli',
              message: 'Yeni bağış onayınızı bekliyor',
              category: 'onay',
              priority: 'yuksek',
              action: {
                label: 'Onayla',
                onClick: () => { alert('Bağış onaylandı!'); }
              }
            })}
            variant="outline"
          >
            Onay Bildirimi
          </Button>
          
          <Button 
            onClick={() => enhancedNotifications.bilgi({
              title: 'Rapor Hazır',
              message: 'Aylık faaliyet raporu görüntülenebilir',
              category: 'sistem',
              action: {
                label: 'Görüntüle',
                onClick: () => { alert('Rapor açılıyor...'); }
              }
            })}
            variant="outline"
          >
            Rapor Bildirimi
          </Button>
        </div>
      </div>

      {/* Sesli bildirimler */}
      <div className="mt-6">
        <h4 className="font-medium mb-2">Sesli Bildirimler</h4>
        <div className="space-x-2">
          <Button 
            onClick={() => enhancedNotifications.uyari({
              title: 'Acil Durum',
              message: 'Bu bildirim sesli olarak çalacak',
              category: 'sistem',
              priority: 'acil',
              sound: true
            })}
            variant="outline"
          >
            Acil Bildirim
          </Button>
          
          <Button 
            onClick={() => enhancedNotifications.basari({
              title: 'İşlem Tamamlandı',
              message: 'Bu bildirim başarı sesi çalacak',
              category: 'genel',
              priority: 'orta',
              sound: true
            })}
            variant="outline"
          >
            Sesli Başarı
          </Button>
        </div>
      </div>

      {/* Özel süre bildirimi */}
      <div className="mt-6">
        <h4 className="font-medium mb-2">Özel Süre</h4>
        <Button 
          onClick={() => enhancedNotifications.bilgi({
            title: 'Uzun Süreli Bildirim',
            message: 'Bu bildirim 10 saniye görünecek',
            category: 'sistem',
            duration: 10000
          })}
          variant="outline"
        >
          10 Saniye Bildirim
        </Button>
      </div>
    </div>
  );
};

export default NotificationExample;