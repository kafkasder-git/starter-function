/**
 * @fileoverview SmartNotificationCenter Module - Application module
 * 
 * @author Dernek Yönetim Sistemi Team
 * @version 1.0.0
 */

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Bell,
  CheckCheck,
  Archive,
  AlertCircle,
  Info,
  CheckCircle,
  AlertTriangle,
  Trash2,
  Settings,
  Clock,
  User,
  DollarSign,
  Users,
  FileText,
  Heart,
} from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsList, TabsTrigger } from '../ui/tabs';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { ScrollArea } from '../ui/scroll-area';
import { Separator } from '../ui/separator';
import { useAdvancedMobile } from '../../hooks/useAdvancedMobile';

/**
 * SmartNotification Interface
 * 
 * @interface SmartNotification
 */
export interface SmartNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  category:
    | 'system'
    | 'donation'
    | 'member'
    | 'aid'
    | 'finance'
    | 'deadline'
    | 'approval'
    | 'update';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  timestamp: Date;
  read: boolean;
  archived: boolean;
  actionable: boolean;
  actions?: {
    label: string;
    action: () => void;
    variant?: 'default' | 'destructive' | 'outline';
  }[];
  metadata?: Record<string, any>;
}

interface SmartNotificationCenterProps {
  notifications: SmartNotification[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onArchive: (id: string) => void;
  onDelete: (id: string) => void;
  onAction: (notificationId: string, actionIndex: number) => void;
  className?: string;
}

const typeIcons = {
  info: Info,
  success: CheckCircle,
  warning: AlertTriangle,
  error: AlertCircle,
};

const typeColors = {
  info: 'bg-blue-100 text-blue-700 border-blue-200',
  success: 'bg-green-100 text-green-700 border-green-200',
  warning: 'bg-orange-100 text-orange-700 border-orange-200',
  error: 'bg-red-100 text-red-700 border-red-200',
};

const categoryIcons = {
  system: Settings,
  donation: Heart,
  member: Users,
  aid: User,
  finance: DollarSign,
  deadline: Clock,
  approval: FileText,
  update: Info, // Add fallback for 'update' category
};

const priorityColors = {
  low: 'border-l-gray-300',
  medium: 'border-l-blue-500',
  high: 'border-l-orange-500',
  urgent: 'border-l-red-500',
};

/**
 * SmartNotificationCenter function
 * 
 * @param {Object} params - Function parameters
 * @returns {void} Nothing
 */
export function SmartNotificationCenter({
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onArchive,
  onDelete,
  onAction,
  className = '',
}: SmartNotificationCenterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  // Safe mobile detection with fallbacks
  const { deviceInfo, triggerHapticFeedback } = useAdvancedMobile() || {
    deviceInfo: { isMobile: false },
    triggerHapticFeedback: () => {},
  };

  // Filter and categorize notifications
  const { filteredNotifications, stats } = useMemo(() => {
    let filtered = notifications.filter((n) => !n.archived);

    // Apply tab filter
    switch (activeTab) {
      case 'unread':
        filtered = filtered.filter((n) => !n.read);
        break;
      case 'urgent':
        filtered = filtered.filter((n) => n.priority === 'urgent');
        break;
      case 'actionable':
        filtered = filtered.filter((n) => n.actionable);
        break;
    }

    // Apply type filter
    if (filterType !== 'all') {
      filtered = filtered.filter((n) => n.type === filterType);
    }

    // Apply category filter
    if (filterCategory !== 'all') {
      filtered = filtered.filter((n) => n.category === filterCategory);
    }

    // Sort by priority and timestamp
    filtered.sort((a, b) => {
      const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
      if (priorityDiff !== 0) return priorityDiff;
      return b.timestamp.getTime() - a.timestamp.getTime();
    });

    // Calculate stats
    const unreadCount = notifications.filter((n) => !n.read && !n.archived).length;
    const urgentCount = notifications.filter((n) => n.priority === 'urgent' && !n.archived).length;
    const actionableCount = notifications.filter(
      (n) => n.actionable && !n.read && !n.archived,
    ).length;

    return {
      filteredNotifications: filtered,
      stats: { unreadCount, urgentCount, actionableCount },
    };
  }, [notifications, activeTab, filterType, filterCategory]);

  const formatRelativeTime = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Şimdi';
    if (diffInMinutes < 60) return `${diffInMinutes}dk önce`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}sa önce`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}g önce`;

    return date.toLocaleDateString('tr-TR');
  };

  const handleNotificationClick = (notification: SmartNotification) => {
    if (!notification.read) {
      onMarkAsRead(notification.id);
      if (deviceInfo.isMobile) {
        triggerHapticFeedback('light');
      }
    }
  };

  const handleAction = (notificationId: string, actionIndex: number) => {
    onAction(notificationId, actionIndex);
    if (deviceInfo.isMobile) {
      triggerHapticFeedback('medium');
    }
  };

  const renderNotification = (notification: SmartNotification) => {
    const TypeIcon = typeIcons[notification.type];
    const CategoryIcon = categoryIcons[notification.category] || Info; // Add fallback

    return (
      <motion.div
        key={`notification-${notification.id}-${notification.timestamp.getTime()}`}
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.2 }}
        className={`
          relative p-4 border-l-4 bg-white hover:bg-gray-50 transition-colors cursor-pointer
          ${priorityColors[notification.priority]}
          ${!notification.read ? 'bg-blue-50/30' : ''}
        `}
        onClick={() => {
          handleNotificationClick(notification);
        }}
      >
        <div className="flex items-start gap-3">
          {/* Type Icon */}
          <div
            className={`
            p-2 rounded-lg flex-shrink-0
            ${typeColors[notification.type]}
          `}
          >
            <TypeIcon className="w-4 h-4" />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-1">
              <h4
                className={`text-sm font-semibold truncate ${
                  !notification.read ? 'text-gray-900' : 'text-gray-700'
                }`}
              >
                {notification.title}
              </h4>

              <div className="flex items-center gap-1 flex-shrink-0">
                <CategoryIcon className="w-3 h-3 text-gray-400" />
                {!notification.read && <div className="w-2 h-2 bg-blue-500 rounded-full" />}
              </div>
            </div>

            <p className="text-sm text-gray-600 mb-3 line-clamp-2">{notification.message}</p>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">
                  {formatRelativeTime(notification.timestamp)}
                </span>

                {notification.priority === 'urgent' && (
                  <Badge variant="destructive" className="text-xs px-1.5 py-0.5">
                    Acil
                  </Badge>
                )}

                {notification.priority === 'high' && (
                  <Badge
                    variant="secondary"
                    className="text-xs px-1.5 py-0.5 bg-orange-100 text-orange-700"
                  >
                    Yüksek
                  </Badge>
                )}
              </div>

              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onArchive(notification.id);
                  }}
                  className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
                >
                  <Archive className="w-3 h-3" />
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(notification.id);
                  }}
                  className="h-6 w-6 p-0 text-gray-400 hover:text-red-600"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </div>

            {/* Actions */}
            {notification.actionable && notification.actions && notification.actions.length > 0 && (
              <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
                {notification.actions.map((action, index) => (
                  <Button
                    key={`action-${notification.id}-${index}-${action.label}`}
                    variant={action.variant ?? 'outline'}
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAction(notification.id, index);
                    }}
                    className="text-xs h-7 px-3"
                  >
                    {action.label}
                  </Button>
                ))}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="relative h-9 w-9 p-0">
          <Bell className="w-4 h-4" />
          {stats.unreadCount > 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center"
            >
              {stats.unreadCount > 99 ? '99+' : stats.unreadCount}
            </motion.div>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent
        className="w-80 sm:w-96 p-0"
        align="end"
        side={deviceInfo.isMobile ? 'bottom' : 'bottom'}
      >
        <Card className="border-0 shadow-none">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Bildirimler</CardTitle>
              <div className="flex items-center gap-2">
                {stats.unreadCount > 0 && (
                  <Button variant="ghost" size="sm" onClick={onMarkAllAsRead} className="text-xs">
                    <CheckCheck className="w-3 h-3 mr-1" />
                    Tümünü Okundu İşaretle
                  </Button>
                )}
              </div>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-4 h-8">
                <TabsTrigger value="all" className="text-xs">
                  Tümü
                </TabsTrigger>
                <TabsTrigger value="unread" className="text-xs relative">
                  Okunmamış
                  {stats.unreadCount > 0 && (
                    <Badge variant="destructive" className="ml-1 px-1 py-0 text-xs h-4 min-w-4">
                      {stats.unreadCount}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="urgent" className="text-xs relative">
                  Acil
                  {stats.urgentCount > 0 && (
                    <Badge variant="destructive" className="ml-1 px-1 py-0 text-xs h-4 min-w-4">
                      {stats.urgentCount}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="actionable" className="text-xs relative">
                  Eylem
                  {stats.actionableCount > 0 && (
                    <Badge variant="secondary" className="ml-1 px-1 py-0 text-xs h-4 min-w-4">
                      {stats.actionableCount}
                    </Badge>
                  )}
                </TabsTrigger>
              </TabsList>
            </Tabs>

            {/* Quick Filters */}
            <div className="flex gap-2 pt-2">
              <select
                value={filterType}
                onChange={(e) => {
                  setFilterType(e.target.value);
                }}
                className="text-xs border rounded px-2 py-1 bg-white"
              >
                <option value="all">Tüm Tipler</option>
                <option value="info">Bilgi</option>
                <option value="success">Başarılı</option>
                <option value="warning">Uyarı</option>
                <option value="error">Hata</option>
              </select>

              <select
                value={filterCategory}
                onChange={(e) => {
                  setFilterCategory(e.target.value);
                }}
                className="text-xs border rounded px-2 py-1 bg-white"
              >
                <option value="all">Tüm Kategoriler</option>
                <option value="system">Sistem</option>
                <option value="donation">Bağış</option>
                <option value="member">Üye</option>
                <option value="aid">Yardım</option>
                <option value="finance">Finans</option>
                <option value="deadline">Tarih</option>
                <option value="approval">Onay</option>
                <option value="update">Güncelleme</option>
              </select>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <ScrollArea className="h-96">
              <AnimatePresence mode="wait">
                {filteredNotifications.length > 0 ? (
                  <div className="space-y-0">
                    {filteredNotifications.map((notification, index) => (
                      <React.Fragment
                        key={`${notification.id}-${index}-${notification.timestamp.getTime()}`}
                      >
                        {renderNotification(notification)}
                        {index < filteredNotifications.length - 1 && (
                          <Separator key={`separator-${notification.id}-${index}`} />
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center justify-center py-12 text-gray-500"
                  >
                    <Bell className="w-12 h-12 mb-4 text-gray-300" />
                    <p className="text-sm">Bildirim bulunamadı</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {activeTab === 'all' ? 'Henüz bildirim yok' : "Bu kategoride bildirim yok"}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </ScrollArea>
          </CardContent>
        </Card>
      </PopoverContent>
    </Popover>
  );
}

export { SmartNotificationCenter as default };
