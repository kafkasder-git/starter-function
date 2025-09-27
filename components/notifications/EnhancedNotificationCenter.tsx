/**
 * @fileoverview Enhanced Notification Center - Geliştirilmiş Bildirim Merkezi
 * 
 * @author Dernek Yönetim Sistemi Team
 * @version 2.0.0
 */

import React, { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Bell,
  BellRing,
  X,
  Check,
  CheckCheck,
  Settings,
  Search,
  Clock,
  Info,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Heart,
  Users,
  DollarSign,
  Calendar,
  Shield,
  Trash2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Switch } from '../ui/switch';
import { ScrollArea } from '../ui/scroll-area';
import { Separator } from '../ui/separator';
import { useNotificationStore, type NotificationState } from '../../stores/notificationStore';
import type { NotificationCategory, NotificationPriority } from '../../lib/enhancedNotifications';

// Kategori ikonları
const categoryIcons = {
  genel: Info,
  bagis: Heart,
  uye: Users,
  yardim: Heart,
  mali: DollarSign,
  etkinlik: Calendar,
  sistem: Settings,
  onay: Shield,
};

// Bildirim türü ikonları
const typeIcons = {
  info: Info,
  success: CheckCircle,
  warning: AlertTriangle,
  error: XCircle,
};

// Öncelik renkleri
const priorityColors = {
  dusuk: 'text-gray-500 bg-gray-100',
  orta: 'text-blue-500 bg-blue-100',
  yuksek: 'text-orange-500 bg-orange-100',
  acil: 'text-red-500 bg-red-100',
};

// Kategori renkleri
const categoryColors = {
  genel: 'text-blue-600 bg-blue-50 border-blue-200',
  bagis: 'text-pink-600 bg-pink-50 border-pink-200',
  uye: 'text-green-600 bg-green-50 border-green-200',
  yardim: 'text-purple-600 bg-purple-50 border-purple-200',
  mali: 'text-yellow-600 bg-yellow-50 border-yellow-200',
  etkinlik: 'text-indigo-600 bg-indigo-50 border-indigo-200',
  sistem: 'text-gray-600 bg-gray-50 border-gray-200',
  onay: 'text-orange-600 bg-orange-50 border-orange-200',
};

interface EnhancedNotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}

export function EnhancedNotificationCenter({ 
  isOpen, 
  onClose, 
  className = '' 
}: EnhancedNotificationCenterProps) {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAllNotifications,
  } = useNotificationStore();

  const [activeTab, setActiveTab] = useState<'all' | 'unread' | 'read'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showArchived, setShowArchived] = useState(false);

  // Filtreleme ve arama
  const filteredNotifications = useMemo(() => {
    let filtered = [...notifications];

    // Tab filtrelemesi
    if (activeTab === 'unread') {
      filtered = filtered.filter(n => !n.read);
    } else if (activeTab === 'read') {
      filtered = filtered.filter(n => n.read);
    }

    // Kategori filtrelemesi
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(n => n.category === selectedCategory);
    }

    // Öncelik filtrelemesi
    if (selectedPriority !== 'all') {
      filtered = filtered.filter(n => n.priority === selectedPriority);
    }

    // Arama filtrelemesi
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(n => 
        n.title.toLowerCase().includes(query) ||
        n.message.toLowerCase().includes(query)
      );
    }

    // Arşivlenmiş bildirimler (eğer gösterilmiyorsa)
    if (!showArchived) {
      // Varsayılan olarak son 7 günkü bildirimleri göster
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      filtered = filtered.filter(n => new Date(n.createdAt) >= sevenDaysAgo);
    }

    // Tarihe göre sırala (en yeni önce)
    return filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [notifications, activeTab, selectedCategory, selectedPriority, searchQuery, showArchived]);

  // Zaman formatı
  const formatTime = useCallback((date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Az önce';
    if (diffInMinutes < 60) return `${diffInMinutes} dakika önce`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} saat önce`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} gün önce`;
    
    return date.toLocaleDateString('tr-TR');
  }, []);

  // Bildirim öğesi
  const NotificationItem = useCallback(({ notification }: { notification: NotificationState }) => {
    const CategoryIcon = categoryIcons[notification.category as NotificationCategory];
    const TypeIcon = typeIcons[notification.type];
    const categoryColor = categoryColors[notification.category as NotificationCategory];
    const priorityColor = priorityColors[notification.priority as NotificationPriority];

    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className={`group relative p-4 border rounded-lg transition-all hover:shadow-md ${
          !notification.read ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-200'
        }`}
      >
        {/* Okunmamış göstergesi */}
        {!notification.read && (
          <div className="absolute left-2 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-blue-500 rounded-full" />
        )}

        <div className="flex items-start gap-3 ml-4">
          {/* Kategori ikonu */}
          <div className={`p-2 rounded-lg ${categoryColor}`}>
            <CategoryIcon className="w-4 h-4" />
          </div>

          {/* Bildirim içeriği */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <h4 className={`text-sm font-semibold ${!notification.read ? 'text-gray-900' : 'text-gray-700'}`}>
                  {notification.title}
                </h4>
                <p className={`text-sm mt-1 ${!notification.read ? 'text-gray-700' : 'text-gray-600'}`}>
                  {notification.message}
                </p>
              </div>

              {/* Bildirim türü ikonu */}
              <TypeIcon className={`w-4 h-4 ${
                notification.type === 'success' ? 'text-green-500' :
                notification.type === 'error' ? 'text-red-500' :
                notification.type === 'warning' ? 'text-amber-500' :
                'text-blue-500'
              }`} />
            </div>

            {/* Meta bilgiler */}
            <div className="flex items-center justify-between mt-3">
              <div className="flex items-center gap-2">
                {/* Kategori badge */}
                <Badge variant="secondary" className="text-xs">
                  {notification.category.charAt(0).toUpperCase() + notification.category.slice(1)}
                </Badge>

                {/* Öncelik badge */}
                <Badge className={`text-xs ${priorityColor}`}>
                  {notification.priority === 'low' ? 'Düşük' :
                   notification.priority === 'medium' ? 'Orta' :
                   notification.priority === 'high' ? 'Yüksek' : 'Acil'}
                </Badge>

                {/* Zaman */}
                <span className="text-xs text-gray-500 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formatTime(new Date(notification.createdAt))}
                </span>
              </div>

              {/* Eylem butonları */}
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {!notification.read && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      markAsRead(notification.id);
                    }}
                    className="h-6 w-6 p-0"
                  >
                    <Check className="w-3 h-3" />
                  </Button>
                )}
                
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    removeNotification(notification.id);
                  }}
                  className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </div>

            {/* Eylem URL'si varsa */}
            {notification.actionUrl && (
              <Button
                size="sm"
                variant="outline"
                className="mt-2 text-xs h-6"
                onClick={() => {
                  if (notification.actionUrl) {
                    window.location.href = notification.actionUrl;
                  }
                }}
              >
                Detayları Gör
              </Button>
            )}
          </div>
        </div>
      </motion.div>
    );
  }, [markAsRead, removeNotification, formatTime]);

  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 z-50 ${className}`}>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      
      {/* Panel */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-xl">
        <Card className="h-full rounded-none border-0">
          {/* Header */}
          <CardHeader className="pb-3 border-b sticky top-0 bg-white z-10">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <BellRing className="w-5 h-5" />
                Bildirimler
                {unreadCount > 0 && (
                  <Badge variant="destructive" className="text-xs">
                    {unreadCount}
                  </Badge>
                )}
              </CardTitle>
              
              <div className="flex items-center gap-1">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    markAllAsRead();
                  }}
                  className="text-xs h-7"
                  disabled={unreadCount === 0}
                >
                  <CheckCheck className="w-3 h-3 mr-1" />
                  Tümünü Okundu İşaretle
                </Button>
                
                <Button size="sm" variant="ghost" onClick={onClose} className="h-7 w-7 p-0">
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Arama */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Bildirim ara..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                }}
                className="pl-9 text-sm h-8"
              />
            </div>

            {/* Filtreler */}
            <div className="flex items-center gap-2 text-sm">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="h-7 text-xs">
                  <SelectValue placeholder="Kategori" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tüm Kategoriler</SelectItem>
                  <SelectItem value="general">Genel</SelectItem>
                  <SelectItem value="donation">Bağış</SelectItem>
                  <SelectItem value="member">Üye</SelectItem>
                  <SelectItem value="aid">Yardım</SelectItem>
                  <SelectItem value="finance">Mali</SelectItem>
                  <SelectItem value="event">Etkinlik</SelectItem>
                  <SelectItem value="system">Sistem</SelectItem>
                  <SelectItem value="approval">Onay</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedPriority} onValueChange={setSelectedPriority}>
                <SelectTrigger className="h-7 text-xs">
                  <SelectValue placeholder="Öncelik" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tüm Öncelikler</SelectItem>
                  <SelectItem value="low">Düşük</SelectItem>
                  <SelectItem value="medium">Orta</SelectItem>
                  <SelectItem value="high">Yüksek</SelectItem>
                  <SelectItem value="urgent">Acil</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex items-center gap-2">
                <Switch
                  checked={showArchived}
                  onCheckedChange={setShowArchived}
                  className="scale-75"
                />
                <label className="text-xs text-gray-600">Arşiv</label>
              </div>
            </div>
          </CardHeader>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={(value) => {
            setActiveTab(value as 'all' | 'unread' | 'read');
          }}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="all" className="text-xs">
                Tümü ({notifications.length})
              </TabsTrigger>
              <TabsTrigger value="unread" className="text-xs">
                Okunmamış ({unreadCount})
              </TabsTrigger>
              <TabsTrigger value="read" className="text-xs">
                Okunmuş ({notifications.length - unreadCount})
              </TabsTrigger>
            </TabsList>

            {/* İçerik */}
            <CardContent className="p-0 flex-1">
              <TabsContent value={activeTab} className="mt-0">
                {filteredNotifications.length > 0 ? (
                  <ScrollArea className="h-[calc(100vh-200px)]">
                    <div className="space-y-2 p-4">
                      <AnimatePresence>
                        {filteredNotifications.map((notification) => (
                          <NotificationItem
                            key={notification.id}
                            notification={notification}
                          />
                        ))}
                      </AnimatePresence>
                    </div>
                  </ScrollArea>
                ) : (
                  <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                    <Bell className="w-12 h-12 mb-2 opacity-50" />
                    <p className="text-sm">
                      {searchQuery || selectedCategory !== 'all' || selectedPriority !== 'all'
                        ? 'Filtrelere uygun bildirim bulunamadı'
                        : activeTab === 'unread'
                        ? 'Okunmamış bildirim yok'
                        : 'Henüz bildirim yok'}
                    </p>
                  </div>
                )}
              </TabsContent>
            </CardContent>
          </Tabs>

          {/* Footer */}
          {notifications.length > 0 && (
            <>
              <Separator />
              <div className="p-3 bg-gray-50">
                <div className="flex items-center justify-between">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={clearAllNotifications}
                    className="text-xs h-7"
                  >
                    <Trash2 className="w-3 h-3 mr-1" />
                    Tümünü Temizle
                  </Button>
                  
                  <Button size="sm" variant="ghost" className="text-xs h-7">
                    <Settings className="w-3 h-3 mr-1" />
                    Ayarlar
                  </Button>
                </div>
              </div>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}

export default EnhancedNotificationCenter;