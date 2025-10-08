/**
 * @fileoverview SmartAutomationSystem Module - Application module
 * 
 * @author Dernek Yönetim Sistemi Team
 * @version 1.0.0
 */

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Zap,
  Play,
  Pause,
  Plus,
  Edit,
  Trash2,
  Clock,
  Bell,
  CheckCircle,
  Activity,
  BarChart3,
  Search,
  Upload,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Switch } from '../ui/switch';
import { Textarea } from '../ui/textarea';
import { useAdvancedMobile } from '../../hooks/useAdvancedMobile';

// Otomasyon türleri
export type AutomationType =
  | 'workflow'
  | 'notification'
  | 'report'
  | 'data_sync'
  | 'approval'
  | 'reminder';

export type AutomationStatus = 'active' | 'paused' | 'draft' | 'error' | 'completed';

export type TriggerType = 'time' | 'event' | 'condition' | 'manual' | 'api';

/**
 * AutomationRule Interface
 * 
 * @interface AutomationRule
 */
export interface AutomationRule {
  id: string;
  name: string;
  description: string;
  type: AutomationType;
  status: AutomationStatus;
  trigger: {
    type: TriggerType;
    config: any;
  };
  actions: {
    id: string;
    type: string;
    config: any;
    order: number;
  }[];
  conditions?: {
    field: string;
    operator: string;
    value: any;
  }[];
  schedule?: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'custom';
    time: string;
    days?: number[];
    customCron?: string;
  };
  lastRun?: Date;
  nextRun?: Date;
  runCount: number;
  successCount: number;
  errorCount: number;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  tags: string[];
}

// Example automation rules
const exampleAutomations: AutomationRule[] = [
  {
    id: '1',
    name: 'Günlük Bağış Raporu',
    description: "Her gün saat 09:00'da günlük bağış raporunu e-posta ile gönder",
    type: 'report',
    status: 'active',
    trigger: {
      type: 'time',
      config: { time: '09:00', timezone: 'Europe/Istanbul' },
    },
    actions: [
      {
        id: 'action1',
        type: 'email_report',
        config: {
          recipients: ['admin@kafkasdernegi.org', 'muhasebe@kafkasdernegi.org'],
          template: 'daily_donation_report',
          includeCharts: true,
        },
        order: 1,
      },
    ],
    schedule: {
      frequency: 'daily',
      time: '09:00',
    },
    lastRun: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 saat önce
    nextRun: new Date(Date.now() + 22 * 60 * 60 * 1000), // 22 saat sonra
    runCount: 45,
    successCount: 44,
    errorCount: 1,
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 gün önce
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    createdBy: 'admin',
    tags: ['rapor', 'bağış', 'günlük'],
  },
  {
    id: '2',
    name: 'Yeni Başvuru Bildirimi',
    description: 'Yeni yardım başvurusu geldiğinde ilgili ekibe bildirim gönder',
    type: 'notification',
    status: 'active',
    trigger: {
      type: 'event',
      config: { event: 'new_beneficiary_application' },
    },
    actions: [
      {
        id: 'action2',
        type: 'push_notification',
        config: {
          recipients: ['social_team'],
          message: 'Yeni yardım başvurusu: {{beneficiary_name}}',
          priority: 'high',
        },
        order: 1,
      },
      {
        id: 'action3',
        type: 'email_notification',
        config: {
          recipients: ['social@kafkasdernegi.org'],
          template: 'new_application_alert',
          data: ['beneficiary_name', 'application_type', 'urgency_level'],
        },
        order: 2,
      },
    ],
    conditions: [{ field: 'urgency_level', operator: '>=', value: 'medium' }],
    lastRun: new Date(Date.now() - 15 * 60 * 1000), // 15 dakika önce
    nextRun: undefined,
    runCount: 23,
    successCount: 23,
    errorCount: 0,
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 gün önce
    updatedAt: new Date(Date.now() - 15 * 60 * 1000),
    createdBy: 'social_team',
    tags: ['bildirim', 'başvuru', 'acil'],
  },
  {
    id: '3',
    name: 'Aylık Mali Rapor',
    description: 'Her ayın sonunda mali raporu hazırla ve yönetime gönder',
    type: 'report',
    status: 'active',
    trigger: {
      type: 'time',
      config: { day: 'last', time: '18:00' },
    },
    actions: [
      {
        id: 'action4',
        type: 'generate_report',
        config: {
          reportType: 'financial_summary',
          period: 'monthly',
          includeCharts: true,
          format: 'pdf',
        },
        order: 1,
      },
      {
        id: 'action5',
        type: 'email_report',
        config: {
          recipients: ['management@kafkasdernegi.org'],
          subject: 'Aylık Mali Rapor - {{month}} {{year}}',
          attachment: true,
        },
        order: 2,
      },
    ],
    schedule: {
      frequency: 'monthly',
      time: '18:00',
    },
    lastRun: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 gün önce
    nextRun: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000), // 25 gün sonra
    runCount: 6,
    successCount: 6,
    errorCount: 0,
    createdAt: new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000), // 6 ay önce
    updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    createdBy: 'finance_team',
    tags: ['rapor', 'mali', 'aylık'],
  },
  {
    id: '4',
    name: 'Bağış Teşekkür Mesajı',
    description: 'Bağış yapıldığında otomatik teşekkür e-postası gönder',
    type: 'notification',
    status: 'paused',
    trigger: {
      type: 'event',
      config: { event: 'donation_received' },
    },
    actions: [
      {
        id: 'action6',
        type: 'email_notification',
        config: {
          recipients: ['{{donor_email}}'],
          template: 'donation_thank_you',
          data: ['donor_name', 'donation_amount', 'donation_date'],
        },
        order: 1,
      },
    ],
    lastRun: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 gün önce
    nextRun: undefined,
    runCount: 156,
    successCount: 154,
    errorCount: 2,
    createdAt: new Date(Date.now() - 3 * 30 * 24 * 60 * 60 * 1000), // 3 ay önce
    updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    createdBy: 'marketing_team',
    tags: ['teşekkür', 'bağış', 'e-posta'],
  },
];

interface SmartAutomationSystemProps {
  className?: string;
  onAutomationToggle?: (automationId: string, status: AutomationStatus) => void;
  onAutomationEdit?: (automation: AutomationRule) => void;
  onAutomationDelete?: (automationId: string) => void;
  onAutomationRun?: (automationId: string) => void;
}

/**
 * SmartAutomationSystem function
 * 
 * @param {Object} params - Function parameters
 * @returns {void} Nothing
 */
export function SmartAutomationSystem({
  className = '',
  onAutomationToggle,
  onAutomationEdit,
  onAutomationDelete,
  onAutomationRun,
}: SmartAutomationSystemProps) {
  const [automations, setAutomations] = useState<AutomationRule[]>(exampleAutomations);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<AutomationType | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<AutomationStatus | 'all'>('all');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [, _setSelectedAutomation] = useState<AutomationRule | null>(null);

  const { triggerHapticFeedback } = useAdvancedMobile();

  // Filtrelenmiş otomasyonlar
  const filteredAutomations = automations.filter((automation) => {
    const matchesTab =
      activeTab === 'all' ||
      (activeTab === 'active' && automation.status === 'active') ||
      (activeTab === 'paused' && automation.status === 'paused') ||
      (activeTab === 'draft' && automation.status === 'draft');

    const matchesSearch =
      searchQuery === '' ||
      automation.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      automation.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = filterType === 'all' || automation.type === filterType;
    const matchesStatus = filterStatus === 'all' || automation.status === filterStatus;

    return matchesTab && matchesSearch && matchesType && matchesStatus;
  });

  // Otomasyon türü ikonları
  const getAutomationIcon = (type: AutomationType) => {
    switch (type) {
      case 'workflow':
        return Activity;
      case 'notification':
        return Bell;
      case 'report':
        return BarChart3;
      case 'data_sync':
        return Upload;
      case 'approval':
        return CheckCircle;
      case 'reminder':
        return Clock;
      default:
        return Zap;
    }
  };

  // Otomasyon türü renkleri
  const getAutomationColor = (type: AutomationType) => {
    switch (type) {
      case 'workflow':
        return 'text-blue-600 bg-blue-100';
      case 'notification':
        return 'text-green-600 bg-green-100';
      case 'report':
        return 'text-purple-600 bg-purple-100';
      case 'data_sync':
        return 'text-orange-600 bg-orange-100';
      case 'approval':
        return 'text-yellow-600 bg-yellow-100';
      case 'reminder':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  // Durum renkleri
  const getStatusColor = (status: AutomationStatus) => {
    switch (status) {
      case 'active':
        return 'text-green-600 bg-green-100 border-green-200';
      case 'paused':
        return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      case 'draft':
        return 'text-gray-600 bg-gray-100 border-gray-200';
      case 'error':
        return 'text-red-600 bg-red-100 border-red-200';
      case 'completed':
        return 'text-blue-600 bg-blue-100 border-blue-200';
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

  // Otomasyon durumunu değiştir
  const handleToggleStatus = useCallback(
    (automationId: string) => {
      setAutomations((prev) =>
        prev.map((automation) =>
          automation.id === automationId
            ? {
                ...automation,
                status: automation.status === 'active' ? 'paused' : 'active',
                updatedAt: new Date(),
              }
            : automation,
        ),
      );
      onAutomationToggle?.(automationId, 'active');
      triggerHapticFeedback('medium');
    },
    [onAutomationToggle, triggerHapticFeedback],
  );

  // Otomasyonu düzenle
  const handleEdit = useCallback(
    (automation: AutomationRule) => {
      _setSelectedAutomation(automation);
      onAutomationEdit?.(automation);
      triggerHapticFeedback('light');
    },
    [onAutomationEdit, triggerHapticFeedback],
  );

  // Otomasyonu sil
  const handleDelete = useCallback(
    (automationId: string) => {
      setAutomations((prev) => prev.filter((a) => a.id !== automationId));
      onAutomationDelete?.(automationId);
      triggerHapticFeedback('light');
    },
    [onAutomationDelete, triggerHapticFeedback],
  );

  // Otomasyonu çalıştır
  const handleRun = useCallback(
    (automationId: string) => {
      onAutomationRun?.(automationId);
      triggerHapticFeedback('medium');
    },
    [onAutomationRun, triggerHapticFeedback],
  );

  // Başarı oranı hesapla
  const getSuccessRate = (automation: AutomationRule): number => {
    if (automation.runCount === 0) return 0;
    return Math.round((automation.successCount / automation.runCount) * 100);
  };

  // İstatistikler
  const stats = {
    total: automations.length,
    active: automations.filter((a) => a.status === 'active').length,
    paused: automations.filter((a) => a.status === 'paused').length,
    totalRuns: automations.reduce((sum, a) => sum + a.runCount, 0),
    successRate:
      automations.length > 0
        ? Math.round(
            automations.reduce((sum, a) => sum + getSuccessRate(a), 0) / automations.length,
          )
        : 0,
  };

  return (
    <div className={`w-full max-w-6xl mx-auto ${className}`}>
      <Card className="shadow-xl border-0 bg-white/95 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Zap className="w-6 h-6 text-blue-600" />
              <div>
                <CardTitle className="text-xl font-semibold text-gray-900">
                  Akıllı Otomasyon Sistemi
                </CardTitle>
                <p className="text-sm text-gray-600">
                  {stats.total} otomasyon, {stats.active} aktif, %{stats.successRate} başarı oranı
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowCreateForm(!showCreateForm);
                }}
                className="gap-2"
              >
                <Plus className="w-4 h-4" />
                Yeni Otomasyon
              </Button>
            </div>
          </div>

          {/* Arama ve Filtreler */}
          <div className="flex flex-col sm:flex-row gap-3 mt-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Otomasyonlarda ara..."
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
                setFilterType(value as AutomationType | 'all');
              }}
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Tür" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Türler</SelectItem>
                <SelectItem value="workflow">İş Akışı</SelectItem>
                <SelectItem value="notification">Bildirim</SelectItem>
                <SelectItem value="report">Rapor</SelectItem>
                <SelectItem value="data_sync">Veri Senkronizasyonu</SelectItem>
                <SelectItem value="approval">Onay</SelectItem>
                <SelectItem value="reminder">Hatırlatma</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filterStatus}
              onValueChange={(value) => {
                setFilterStatus(value as AutomationStatus | 'all');
              }}
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Durum" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Durumlar</SelectItem>
                <SelectItem value="active">Aktif</SelectItem>
                <SelectItem value="paused">Duraklatılmış</SelectItem>
                <SelectItem value="draft">Taslak</SelectItem>
                <SelectItem value="error">Hata</SelectItem>
                <SelectItem value="completed">Tamamlandı</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4 mx-6 mb-4">
              <TabsTrigger value="all" className="flex items-center gap-2">
                <Activity className="w-4 h-4" />
                Tümü ({stats.total})
              </TabsTrigger>
              <TabsTrigger value="active" className="flex items-center gap-2">
                <Play className="w-4 h-4" />
                Aktif ({stats.active})
              </TabsTrigger>
              <TabsTrigger value="paused" className="flex items-center gap-2">
                <Pause className="w-4 h-4" />
                Duraklatılmış ({stats.paused})
              </TabsTrigger>
              <TabsTrigger value="draft" className="flex items-center gap-2">
                <Edit className="w-4 h-4" />
                Taslak ({automations.filter((a) => a.status === 'draft').length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="px-6 pb-6">
              <div className="space-y-4">
                <AnimatePresence>
                  {filteredAutomations.map((automation, index) => {
                    const IconComponent = getAutomationIcon(automation.type);
                    const colorClass = getAutomationColor(automation.type);
                    const statusClass = getStatusColor(automation.status);
                    const successRate = getSuccessRate(automation);

                    return (
                      <motion.div
                        key={automation.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ delay: index * 0.05 }}
                        className="p-6 rounded-lg border-2 bg-white shadow-sm hover:shadow-md transition-all duration-200"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-start gap-4">
                            <div className={`p-3 rounded-lg ${colorClass} flex-shrink-0`}>
                              <IconComponent className="w-6 h-6" />
                            </div>

                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="text-lg font-semibold text-gray-900">
                                  {automation.name}
                                </h3>
                                <Badge variant="outline" className={`text-xs ${statusClass}`}>
                                  {automation.status === 'active'
                                    ? 'Aktif'
                                    : automation.status === 'paused'
                                      ? 'Duraklatılmış'
                                      : automation.status === 'draft'
                                        ? 'Taslak'
                                        : automation.status === 'error'
                                          ? 'Hata'
                                          : 'Tamamlandı'}
                                </Badge>
                              </div>

                              <p className="text-gray-600 mb-3">{automation.description}</p>

                              <div className="flex flex-wrap gap-2 mb-3">
                                {automation.tags.map((tag, tagIndex) => (
                                  <Badge key={tagIndex} variant="secondary" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                handleRun(automation.id);
                              }}
                              className="gap-2"
                            >
                              <Play className="w-4 h-4" />
                              Çalıştır
                            </Button>

                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                handleEdit(automation);
                              }}
                              className="gap-2"
                            >
                              <Edit className="w-4 h-4" />
                              Düzenle
                            </Button>

                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                handleToggleStatus(automation.id);
                              }}
                              className="gap-2"
                            >
                              {automation.status === 'active' ? (
                                <>
                                  <Pause className="w-4 h-4" />
                                  Duraklat
                                </>
                              ) : (
                                <>
                                  <Play className="w-4 h-4" />
                                  Başlat
                                </>
                              )}
                            </Button>

                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                handleDelete(automation.id);
                              }}
                              className="gap-2 text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                              Sil
                            </Button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t border-gray-200">
                          <div className="text-center">
                            <p className="text-2xl font-bold text-gray-900">
                              {automation.runCount}
                            </p>
                            <p className="text-sm text-gray-600">Toplam Çalışma</p>
                          </div>

                          <div className="text-center">
                            <p className="text-2xl font-bold text-green-600">{successRate}%</p>
                            <p className="text-sm text-gray-600">Başarı Oranı</p>
                          </div>

                          <div className="text-center">
                            <p className="text-sm text-gray-600">Son Çalışma</p>
                            <p className="text-sm font-medium text-gray-900">
                              {automation.lastRun ? getTimeAgo(automation.lastRun) : 'Hiç'}
                            </p>
                          </div>

                          <div className="text-center">
                            <p className="text-sm text-gray-600">Sonraki Çalışma</p>
                            <p className="text-sm font-medium text-gray-900">
                              {automation.nextRun ? getTimeAgo(automation.nextRun) : 'Belirsiz'}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>

                {filteredAutomations.length === 0 && (
                  <div className="text-center py-12">
                    <Zap className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Otomasyon Bulunamadı</h3>
                    <p className="text-gray-500">
                      {(searchQuery ?? filterType !== 'all') || filterStatus !== 'all'
                        ? 'Arama kriterlerinize uygun otomasyon bulunamadı'
                        : 'Henüz otomasyon bulunmuyor'}
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Yeni Otomasyon Formu */}
      <AnimatePresence>
        {showCreateForm && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mt-6"
          >
            <Card className="shadow-lg border-0 bg-white/95 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="w-5 h-5 text-blue-600" />
                  Yeni Otomasyon Oluştur
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Otomasyon Adı
                      </label>
                      <Input placeholder="Örn: Günlük Bağış Raporu" />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Açıklama
                      </label>
                      <Textarea placeholder="Otomasyonun ne yaptığını açıklayın..." rows={3} />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Otomasyon Türü
                      </label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Tür seçin" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="workflow">İş Akışı</SelectItem>
                          <SelectItem value="notification">Bildirim</SelectItem>
                          <SelectItem value="report">Rapor</SelectItem>
                          <SelectItem value="data_sync">Veri Senkronizasyonu</SelectItem>
                          <SelectItem value="approval">Onay</SelectItem>
                          <SelectItem value="reminder">Hatırlatma</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tetikleyici Türü
                      </label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Tetikleyici seçin" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="time">Zaman</SelectItem>
                          <SelectItem value="event">Olay</SelectItem>
                          <SelectItem value="condition">Koşul</SelectItem>
                          <SelectItem value="manual">Manuel</SelectItem>
                          <SelectItem value="api">API</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Etiketler
                      </label>
                      <Input placeholder="rapor, günlük, bağış (virgülle ayırın)" />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-700">Otomatik Başlat</p>
                        <p className="text-sm text-gray-500">
                          Oluşturulduktan sonra otomatik başlat
                        </p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowCreateForm(false);
                    }}
                  >
                    İptal
                  </Button>
                  <Button className="gap-2">
                    <Plus className="w-4 h-4" />
                    Otomasyon Oluştur
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default SmartAutomationSystem;
