import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Bell,
  BellRing,
  X,
  Check,
  AlertTriangle,
  Info,
  CheckCircle,
  XCircle,
  Settings,
  Search,
  Clock,
  User,
  Heart,
  Calendar,
  MapPin,
  DollarSign,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Switch } from '../ui/switch';
import { useAdvancedMobile } from '../../hooks/useAdvancedMobile';

// Bildirim türleri
export type NotificationType =
  | 'info'
  | 'success'
  | 'warning'
  | 'error'
  | 'donation'
  | 'beneficiary'
  | 'event'
  | 'system';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: string;
  actionUrl?: string;
  actionText?: string;
  metadata?: {
    userId?: string;
    amount?: number;
    location?: string;
    eventId?: string;
    beneficiaryId?: string;
  };
  expiresAt?: Date;
}

// Mock bildirim verileri
const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'donation',
    title: 'Yeni Bağış Geldi!',
    message: 'ABC Şirketi tarafından 5.000₺ bağış yapıldı',
    timestamp: new Date(Date.now() - 5 * 60 * 1000), // 5 dakika önce
    read: false,
    priority: 'high',
    category: 'Bağış',
    actionUrl: '/bagis/detay/1',
    actionText: 'Detayları Gör',
    metadata: {
      amount: 5000,
      userId: 'user123',
    },
  },
  {
    id: '2',
    type: 'beneficiary',
    title: 'Yeni Başvuru',
    message: 'Ahmet Yılmaz gıda yardımı için başvuru yaptı',
    timestamp: new Date(Date.now() - 15 * 60 * 1000), // 15 dakika önce
    read: false,
    priority: 'medium',
    category: 'Başvuru',
    actionUrl: '/yardim/basvuru/2',
    actionText: 'İncele',
    metadata: {
      beneficiaryId: 'beneficiary456',
      location: 'İstanbul',
    },
  },
  {
    id: '3',
    type: 'event',
    title: 'Etkinlik Hatırlatması',
    message: "Gıda dağıtımı yarın saat 10:00'da başlayacak",
    timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 dakika önce
    read: true,
    priority: 'medium',
    category: 'Etkinlik',
    actionUrl: '/etkinlik/detay/3',
    actionText: 'Detaylar',
    metadata: {
      eventId: 'event789',
      location: 'Merkez Ofis',
    },
  },
  {
    id: '4',
    type: 'system',
    title: 'Sistem Güncellemesi',
    message: 'Yeni özellikler eklendi. Detayları görmek için tıklayın',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 saat önce
    read: true,
    priority: 'low',
    category: 'Sistem',
    actionUrl: '/sistem/guncellemeler',
    actionText: 'Güncellemeler',
  },
  {
    id: '5',
    type: 'warning',
    title: 'Bütçe Uyarısı',
    message: "Gıda yardımı bütçesinin %80'i kullanıldı",
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 saat önce
    read: false,
    priority: 'urgent',
    category: 'Mali',
    actionUrl: '/mali/budget',
    actionText: 'Bütçeyi Gör',
    metadata: {
      amount: 80000,
    },
  },
];

interface SmartNotificationSystemProps {
  className?: string;
  onNotificationClick?: (notification: Notification) => void;
  onMarkAsRead?: (notificationId: string) => void;
  onMarkAllAsRead?: () => void;
}

export function SmartNotificationSystem({
  className = '',
  onNotificationClick,
  onMarkAsRead,
  onMarkAllAsRead,
}: SmartNotificationSystemProps) {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<NotificationType | 'all'>('all');
  const [filterPriority, setFilterPriority] = useState<
    'all' | 'low' | 'medium' | 'high' | 'urgent'
  >('all');
  const [showSettings, setShowSettings] = useState(false);
  const [notificationSettings, setNotificationSettings] = useState({
    enablePush: true,
    enableEmail: true,
    enableSound: true,
    enableVibration: true,
    quietHours: false,
    quietStart: '22:00',
    quietEnd: '08:00',
  });

  const { triggerHapticFeedback, deviceInfo } = useAdvancedMobile();
  const notificationRef = useRef<HTMLDivElement>(null);

  // Bildirim sayısı
  const unreadCount = notifications.filter((n) => !n.read).length;
  const urgentCount = notifications.filter((n) => n.priority === 'urgent' && !n.read).length;

  // Filtrelenmiş bildirimler
  const filteredNotifications = notifications.filter((notification) => {
    const matchesTab =
      activeTab === 'all' ||
      (activeTab === 'unread' && !notification.read) ||
      (activeTab === 'urgent' && notification.priority === 'urgent');

    const matchesSearch =
      searchQuery === '' ||
      notification.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      notification.message.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = filterType === 'all' || notification.type === filterType;
    const matchesPriority = filterPriority === 'all' || notification.priority === filterPriority;

    return matchesTab && matchesSearch && matchesType && matchesPriority;
  });

  // Bildirim türü ikonları
  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case 'donation':
        return Heart;
      case 'beneficiary':
        return User;
      case 'event':
        return Calendar;
      case 'system':
        return Settings;
      case 'success':
        return CheckCircle;
      case 'warning':
        return AlertTriangle;
      case 'error':
        return XCircle;
      case 'info':
        return Info;
      default:
        return Bell;
    }
  };

  // Bildirim türü renkleri
  const getNotificationColor = (type: NotificationType) => {
    switch (type) {
      case 'donation':
        return 'text-green-600 bg-green-100';
      case 'beneficiary':
        return 'text-blue-600 bg-blue-100';
      case 'event':
        return 'text-purple-600 bg-purple-100';
      case 'system':
        return 'text-gray-600 bg-gray-100';
      case 'success':
        return 'text-green-600 bg-green-100';
      case 'warning':
        return 'text-yellow-600 bg-yellow-100';
      case 'error':
        return 'text-red-600 bg-red-100';
      case 'info':
        return 'text-blue-600 bg-blue-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  // Öncelik renkleri
  const getPriorityColor = (priority: Notification['priority']) => {
    switch (priority) {
      case 'urgent':
        return 'text-red-600 bg-red-100 border-red-200';
      case 'high':
        return 'text-orange-600 bg-orange-100 border-orange-200';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      case 'low':
        return 'text-gray-600 bg-gray-100 border-gray-200';
      default:
        return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  // Zaman formatı
  const getTimeAgo = (date: Date): string => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Az önce';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} dakika önce`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} saat önce`;
    return `${Math.floor(diffInSeconds / 86400)} gün önce`;
  };

  // Bildirimi okundu olarak işaretle
  const handleMarkAsRead = useCallback(
    (notificationId: string) => {
      setNotifications((prev) =>
        prev.map((notification) =>
          notification.id === notificationId ? { ...notification, read: true } : notification,
        ),
      );
      onMarkAsRead?.(notificationId);
      triggerHapticFeedback('light');
    },
    [onMarkAsRead, triggerHapticFeedback],
  );

  // Tümünü okundu olarak işaretle
  const handleMarkAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((notification) => ({ ...notification, read: true })));
    onMarkAllAsRead?.();
    triggerHapticFeedback('medium');
  }, [onMarkAllAsRead, triggerHapticFeedback]);

  // Bildirime tıkla
  const handleNotificationClick = useCallback(
    (notification: Notification) => {
      if (!notification.read) {
        handleMarkAsRead(notification.id);
      }
      onNotificationClick?.(notification);
      triggerHapticFeedback('medium');
    },
    [handleMarkAsRead, onNotificationClick, triggerHapticFeedback],
  );

  // Bildirimi sil
  const handleDeleteNotification = useCallback(
    (notificationId: string) => {
      setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
      triggerHapticFeedback('light');
    },
    [triggerHapticFeedback],
  );

  // Bildirim ayarlarını güncelle
  const handleSettingChange = useCallback(
    (key: string, value: any) => {
      setNotificationSettings((prev) => ({ ...prev, [key]: value }));
      triggerHapticFeedback('light');
    },
    [triggerHapticFeedback],
  );

  // Yeni bildirim simülasyonu
  useEffect(() => {
    const interval = setInterval(() => {
      // Rastgele yeni bildirim ekle (demo için)
      if (Math.random() > 0.95) {
        // %5 şans
        const newNotification: Notification = {
          id: Date.now().toString(),
          type: 'info',
          title: 'Yeni Bildirim',
          message: 'Bu bir test bildirimidir',
          timestamp: new Date(),
          read: false,
          priority: 'medium',
          category: 'Test',
        };
        setNotifications((prev) => [newNotification, ...prev]);
      }
    }, 30000); // 30 saniyede bir kontrol

    return () => {
      clearInterval(interval);
    };
  }, []);

  return (
    <div className={`w-full max-w-4xl mx-auto ${className}`}>
      <Card className="shadow-xl border-0 bg-white/95 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <BellRing className="w-6 h-6 text-blue-600" />
                {unreadCount > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -top-2 -right-2 w-5 h-5 flex items-center justify-center p-0 text-xs"
                  >
                    {unreadCount}
                  </Badge>
                )}
              </div>
              <div>
                <CardTitle className="text-xl font-semibold text-gray-900">Bildirimler</CardTitle>
                <p className="text-sm text-gray-600">
                  {unreadCount} okunmamış, {urgentCount} acil bildirim
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowSettings(!showSettings);
                }}
                className="gap-2"
              >
                <Settings className="w-4 h-4" />
                Ayarlar
              </Button>

              {unreadCount > 0 && (
                <Button variant="outline" size="sm" onClick={handleMarkAllAsRead} className="gap-2">
                  <Check className="w-4 h-4" />
                  Tümünü Okundu İşaretle
                </Button>
              )}
            </div>
          </div>

          {/* Arama ve Filtreler */}
          <div className="flex flex-col sm:flex-row gap-3 mt-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Bildirimlerde ara..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                }}
                className="pl-10"
              />
            </div>

            <Select
              value={filterType}
              onValueChange={(value) => {
                setFilterType(value as NotificationType | 'all');
              }}
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Tür" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Türler</SelectItem>
                <SelectItem value="donation">Bağış</SelectItem>
                <SelectItem value="beneficiary">İhtiyaç Sahibi</SelectItem>
                <SelectItem value="event">Etkinlik</SelectItem>
                <SelectItem value="system">Sistem</SelectItem>
                <SelectItem value="warning">Uyarı</SelectItem>
                <SelectItem value="error">Hata</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filterPriority}
              onValueChange={(value) => {
                setFilterPriority(value as any);
              }}
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Öncelik" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Öncelikler</SelectItem>
                <SelectItem value="urgent">Acil</SelectItem>
                <SelectItem value="high">Yüksek</SelectItem>
                <SelectItem value="medium">Orta</SelectItem>
                <SelectItem value="low">Düşük</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3 mx-6 mb-4">
              <TabsTrigger value="all" className="flex items-center gap-2">
                <Bell className="w-4 h-4" />
                Tümü ({notifications.length})
              </TabsTrigger>
              <TabsTrigger value="unread" className="flex items-center gap-2">
                <BellRing className="w-4 h-4" />
                Okunmamış ({unreadCount})
              </TabsTrigger>
              <TabsTrigger value="urgent" className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Acil ({urgentCount})
              </TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="px-6 pb-6">
              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                <AnimatePresence>
                  {filteredNotifications.map((notification, index) => {
                    const IconComponent = getNotificationIcon(notification.type);
                    const colorClass = getNotificationColor(notification.type);
                    const priorityClass = getPriorityColor(notification.priority);

                    return (
                      <motion.div
                        key={notification.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ delay: index * 0.05 }}
                        className={`p-4 rounded-lg border-2 transition-all duration-200 cursor-pointer hover:shadow-md ${
                          notification.read
                            ? 'bg-gray-50 border-gray-200'
                            : 'bg-white border-blue-200 shadow-sm'
                        }`}
                        onClick={() => {
                          handleNotificationClick(notification);
                        }}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-lg ${colorClass} flex-shrink-0`}>
                            <IconComponent className="w-5 h-5" />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex-1">
                                <h4
                                  className={`font-semibold ${notification.read ? 'text-gray-700' : 'text-gray-900'}`}
                                >
                                  {notification.title}
                                </h4>
                                <p
                                  className={`text-sm mt-1 ${notification.read ? 'text-gray-500' : 'text-gray-700'}`}
                                >
                                  {notification.message}
                                </p>
                              </div>

                              <div className="flex items-center gap-2 ml-3">
                                <Badge variant="outline" className={`text-xs ${priorityClass}`}>
                                  {notification.priority === 'urgent'
                                    ? 'Acil'
                                    : notification.priority === 'high'
                                      ? 'Yüksek'
                                      : notification.priority === 'medium'
                                        ? 'Orta'
                                        : 'Düşük'}
                                </Badge>

                                {!notification.read && (
                                  <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0" />
                                )}
                              </div>
                            </div>

                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4 text-xs text-gray-500">
                                <div className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {getTimeAgo(notification.timestamp)}
                                </div>
                                <Badge variant="secondary" className="text-xs">
                                  {notification.category}
                                </Badge>
                                {notification.metadata?.amount && (
                                  <div className="flex items-center gap-1">
                                    <DollarSign className="w-3 h-3" />₺
                                    {notification.metadata.amount.toLocaleString('tr-TR')}
                                  </div>
                                )}
                                {notification.metadata?.location && (
                                  <div className="flex items-center gap-1">
                                    <MapPin className="w-3 h-3" />
                                    {notification.metadata.location}
                                  </div>
                                )}
                              </div>

                              <div className="flex items-center gap-2">
                                {notification.actionText && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-xs h-7"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleNotificationClick(notification);
                                    }}
                                  >
                                    {notification.actionText}
                                  </Button>
                                )}

                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-xs h-7 w-7 p-0"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteNotification(notification.id);
                                  }}
                                >
                                  <X className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>

                {filteredNotifications.length === 0 && (
                  <div className="text-center py-12">
                    <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Bildirim Bulunamadı</h3>
                    <p className="text-gray-500">
                      {searchQuery || filterType !== 'all' || filterPriority !== 'all'
                        ? 'Arama kriterlerinize uygun bildirim bulunamadı'
                        : 'Henüz bildirim bulunmuyor'}
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Bildirim Ayarları */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mt-6"
          >
            <Card className="shadow-lg border-0 bg-white/95 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5 text-blue-600" />
                  Bildirim Ayarları
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900">Bildirim Türleri</h4>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-700">Push Bildirimleri</p>
                        <p className="text-sm text-gray-500">Tarayıcı bildirimleri</p>
                      </div>
                      <Switch
                        checked={notificationSettings.enablePush}
                        onCheckedChange={(checked) => {
                          handleSettingChange('enablePush', checked);
                        }}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-700">E-posta Bildirimleri</p>
                        <p className="text-sm text-gray-500">E-posta ile bildirim</p>
                      </div>
                      <Switch
                        checked={notificationSettings.enableEmail}
                        onCheckedChange={(checked) => {
                          handleSettingChange('enableEmail', checked);
                        }}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-700">Ses Bildirimleri</p>
                        <p className="text-sm text-gray-500">Bildirim sesi</p>
                      </div>
                      <Switch
                        checked={notificationSettings.enableSound}
                        onCheckedChange={(checked) => {
                          handleSettingChange('enableSound', checked);
                        }}
                      />
                    </div>

                    {deviceInfo.isMobile && (
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-700">Titreşim</p>
                          <p className="text-sm text-gray-500">Mobil titreşim</p>
                        </div>
                        <Switch
                          checked={notificationSettings.enableVibration}
                          onCheckedChange={(checked) => {
                            handleSettingChange('enableVibration', checked);
                          }}
                        />
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900">Sessiz Saatler</h4>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-700">Sessiz Saatleri Etkinleştir</p>
                        <p className="text-sm text-gray-500">Belirli saatlerde bildirim gönderme</p>
                      </div>
                      <Switch
                        checked={notificationSettings.quietHours}
                        onCheckedChange={(checked) => {
                          handleSettingChange('quietHours', checked);
                        }}
                      />
                    </div>

                    {notificationSettings.quietHours && (
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Başlangıç Saati
                          </label>
                          <Input
                            type="time"
                            value={notificationSettings.quietStart}
                            onChange={(e) => {
                              handleSettingChange('quietStart', e.target.value);
                            }}
                            className="w-full"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Bitiş Saati
                          </label>
                          <Input
                            type="time"
                            value={notificationSettings.quietEnd}
                            onChange={(e) => {
                              handleSettingChange('quietEnd', e.target.value);
                            }}
                            className="w-full"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default SmartNotificationSystem;
