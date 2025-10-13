/**
 * @fileoverview EnhancedDashboard Module - Application module
 *
 * @author Dernek Yönetim Sistemi Team
 * @version 1.0.0
 */

import { Activity, Calendar, Clock, Heart, RefreshCw, Users, type LucideIcon } from 'lucide-react';
import React, { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { Badge } from './badge';
import { Button } from './button';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Progress } from './progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './tabs';
import InteractiveChart from './InteractiveChart';
import MetricCard from './MetricCard';
// Auth import removed for simplified implementation
import { useAdvancedMobile } from '../../hooks/useAdvancedMobile';
import { intelligentStatsService } from '../../services/intelligentStatsService';
import { PersonalizedQuickActions } from '../ux/PersonalizedQuickActions';

// Yardımcı fonksiyon - zaman hesaplama
const getTimeAgo = (date: Date): string => {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return 'Az önce';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} dakika önce`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} saat önce`;
  }
  const days = Math.floor(diffInSeconds / 86400);
  return `${days} gün önce`;
};

// Sample data for charts
const sampleDonationData = [
  { name: 'Ocak', value: 45000, month: 'Ocak' },
  { name: 'Şubat', value: 52000, month: 'Şubat' },
  { name: 'Mart', value: 48000, month: 'Mart' },
  { name: 'Nisan', value: 61000, month: 'Nisan' },
  { name: 'Mayıs', value: 55000, month: 'Mayıs' },
  { name: 'Haziran', value: 67000, month: 'Haziran' },
];

const sampleAidDistribution = [
  { name: 'Gıda Yardımı', value: 35, color: 'hsl(var(--primary-500))' },
  { name: 'Nakdi Yardım', value: 25, color: 'hsl(var(--info-500))' },
  { name: 'Eğitim Desteği', value: 20, color: 'hsl(var(--success-500))' },
  { name: 'Sağlık Yardımı', value: 12, color: 'hsl(var(--warning-500))' },
  { name: 'Barınma Desteği', value: 8, color: 'hsl(var(--neutral-500))' },
];

// Recent activities interface
interface RecentActivity {
  id: string;
  title: string;
  description: string;
  timestamp: Date;
  type: 'donation' | 'aid_request' | 'member_join' | 'campaign' | 'event' | 'report';
  status: 'completed' | 'pending' | 'in_progress';
  user?: string;
  amount?: number;
  icon?: string;
  color?: string;
  priority?: 'low' | 'medium' | 'high';
}

const recentActivities: RecentActivity[] = [
  {
    id: '1',
    title: 'Yeni Bağış Kaydı',
    description: 'ABC Şirketi tarafından 5.000₺ bağış yapıldı',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 saat önce
    type: 'donation',
    status: 'completed',
    user: 'Muhasebe Ekibi',
    amount: 5000,
    icon: 'Heart',
    color: 'text-success-600',
    priority: 'medium',
  },
  {
    id: '2',
    title: 'Yardım Başvurusu',
    description: 'Ahmet Yılmaz - Gıda yardımı başvurusu',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 saat önce
    type: 'aid_request',
    status: 'pending',
    user: 'Sosyal Hizmetler',
    icon: 'Users',
    color: 'text-info-600',
    priority: 'high',
  },
  {
    id: '3',
    title: 'Yeni Üye Kaydı',
    description: 'Elif Öztürk sisteme üye olarak eklendi',
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 saat önce
    type: 'member_join',
    status: 'completed',
    user: 'İnsan Kaynakları',
    icon: 'UserPlus',
    color: 'text-primary-600',
    priority: 'low',
  },
  {
    id: '4',
    title: 'Gıda Dağıtımı',
    description: "Merkez Ofis'te gıda dağıtımı tamamlandı",
    timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8 saat önce
    type: 'event',
    status: 'completed',
    user: 'Saha Ekibi',
    icon: 'Package',
    color: 'text-warning-600',
    priority: 'medium',
  },
  {
    id: '5',
    title: 'Aylık Rapor',
    description: 'Ocak ayı mali raporu hazırlandı',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 gün önce
    type: 'report',
    status: 'completed',
    user: 'Muhasebe Ekibi',
    icon: 'FileText',
    color: 'text-info-600',
    priority: 'high',
  },
];

const upcomingTasks = [
  {
    id: 1,
    title: 'Aylık rapor hazırlama',
    deadline: '2 gün kaldı',
    priority: 'high',
    category: 'Rapor',
    assignee: 'Siz',
    progress: 75,
    description: 'Ocak ayı mali raporu ve istatistikler',
  },
  {
    id: 2,
    title: 'Bağışçı toplantısı',
    deadline: '3 gün kaldı',
    priority: 'medium',
    category: 'Toplantı',
    assignee: 'Ekip',
    progress: 40,
    description: 'Yıllık bağışçı değerlendirme toplantısı',
  },
  {
    id: 3,
    title: 'Yardım dağıtımı',
    deadline: '5 gün kaldı',
    priority: 'high',
    category: 'Operasyon',
    assignee: 'Saha Ekibi',
    progress: 20,
    description: 'Merkez bölge gıda yardımı dağıtımı',
  },
  {
    id: 4,
    title: 'Gönüllü eğitimi',
    deadline: '1 hafta kaldı',
    priority: 'medium',
    category: 'Eğitim',
    assignee: 'Eğitim Ekibi',
    progress: 60,
    description: 'Yeni gönüllüler için oryantasyon',
  },
  {
    id: 5,
    title: 'Bütçe planlaması',
    deadline: '10 gün kaldı',
    priority: 'high',
    category: 'Planlama',
    assignee: 'Yönetim',
    progress: 30,
    description: '2024 yılı ikinci çeyrek bütçe planı',
  },
];

interface EnhancedDashboardProps {
  className?: string;
  onNavigate?: (module: string, page?: string) => void;
  onQuickAction?: (actionId: string) => void;
}

const EnhancedDashboard = memo(
  ({ className = '', onNavigate, onQuickAction }: EnhancedDashboardProps) => {
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');
    const [dashboardData, setDashboardData] = useState({
      beneficiaries: { total: 0, active: 0 },
      donations: { totalAmount: 0, count: 0 },
      members: { total: 0, active: 0 },
      aidRequests: { total: 0, pending: 0 },
    });

    const { deviceInfo, triggerHapticFeedback } = useAdvancedMobile();

    // Load dashboard data with useCallback optimization
    const loadData = useCallback(async () => {
      try {
        setLoading(true);
        const { data: stats } = await intelligentStatsService.getAllStats();

        if (stats) {
          setDashboardData({
            beneficiaries: stats.beneficiaries,
            donations: stats.donations,
            members: stats.members,
            aidRequests: stats.aidRequests,
          });
        }
      } catch {
        // Dashboard data loading failed, using fallback data
        // Use sample data as fallback
        setDashboardData({
          beneficiaries: { total: 125, active: 98 },
          donations: { totalAmount: 156800, count: 87 },
          members: { total: 234, active: 211 },
          aidRequests: { total: 156, pending: 23 },
        });
      } finally {
        setLoading(false);
      }
    }, []);

    // Load dashboard data
    useEffect(() => {
      loadData();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleRefresh = useCallback(() => {
      setLoading(true);
      if (deviceInfo.isMobile) {
        triggerHapticFeedback('medium');
      }

      // Simulate refresh
      setTimeout(() => {
        setLoading(false);
      }, 1000);
    }, [deviceInfo.isMobile, triggerHapticFeedback]);

    const metrics = useMemo(
      () => [
        {
          title: 'Toplam Bağış',
          value: loading ? '...' : `₺${dashboardData.donations.totalAmount.toLocaleString()}`,
          change: { value: 12.5, type: 'increase' as const, period: 'bu ay' },
          icon: <Heart className="w-5 h-5" />,
          color: 'green' as const,
          onClick: () => {
            onNavigate?.('donations');
          },
        },
        {
          title: 'Aktif Üyeler',
          value: loading ? '...' : dashboardData.members.active.toString(),
          change: { value: 8.3, type: 'increase' as const, period: 'bu ay' },
          icon: <Users className="w-5 h-5" />,
          color: 'blue' as const,
          onClick: () => {
            onNavigate?.('members');
          },
        },
        {
          title: 'İhtiyaç Sahipleri',
          value: loading ? '...' : dashboardData.beneficiaries.total.toString(),
          change: { value: 15.7, type: 'increase' as const, period: 'bu ay' },
          icon: <Users className="w-5 h-5" />,
          color: 'purple' as const,
          onClick: () => {
            onNavigate?.('beneficiaries');
          },
        },
        {
          title: 'Bekleyen Talepler',
          value: loading ? '...' : dashboardData.aidRequests.pending.toString(),
          change: { value: 22.1, type: 'increase' as const, period: 'bu ay' },
          icon: <Clock className="w-5 h-5" />,
          color: 'orange' as const,
          onClick: () => {
            onNavigate?.('aid-requests');
          },
        },
      ],
      [loading, dashboardData, onNavigate],
    );

    return (
      <div
        className={`min-h-full space-y-6 bg-gradient-to-br from-neutral-50 via-neutral-100 to-neutral-200 p-4 sm:p-6 dark:from-neutral-900 dark:via-neutral-950 dark:to-neutral-950 ${className}`}
      >
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        >
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 sm:text-3xl dark:text-neutral-50">Dashboard</h1>
            <p className="mt-1 text-neutral-600 dark:text-neutral-400">Dernek yönetim sistemi - Güncel durum özeti</p>
          </div>

          <div className="flex items-center gap-3">
            <Badge variant="outline" className="border-success-200 bg-success-50 text-success-700 dark:border-success-500/40 dark:bg-success-500/10 dark:text-success-400">
              <Activity className="w-3 h-3 mr-1" />
              Sistem Aktif
            </Badge>

            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={loading}
              className="gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Yenile
            </Button>
          </div>
        </motion.div>

        {/* Metrics Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6"
        >
          {metrics.map((metric, index) => (
            <motion.div
              key={metric.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.05 }}
            >
              <MetricCard {...metric} loading={loading} />
            </motion.div>
          ))}
        </motion.div>

        {/* Main Content Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:grid-cols-none lg:flex">
              <TabsTrigger value="overview">Genel Bakış</TabsTrigger>
              <TabsTrigger value="analytics">Analizler</TabsTrigger>
              <TabsTrigger value="activities">Aktiviteler</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Personalized Quick Actions */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                  className="lg:col-span-2"
                >
                  <PersonalizedQuickActions
                    currentModule="genel"
                    onNavigate={onNavigate}
                    onQuickAction={onQuickAction}
                    className="h-full"
                  />
                </motion.div>

                {/* Upcoming Tasks */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <Card className="border border-neutral-200 bg-white/80 shadow-lg backdrop-blur-sm dark:border-neutral-700 dark:bg-neutral-900/80">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-warning-600" />
                        Yaklaşan Görevler
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {upcomingTasks.map((task) => (
                          <div
                            key={task.id}
                            className="rounded-lg border border-neutral-200 bg-neutral-50 p-3 transition-colors hover:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-900/80 dark:hover:bg-neutral-800"
                          >
                            <div className="flex items-start justify-between mb-2">
                              <h4 className="text-sm font-medium text-neutral-900 dark:text-neutral-100">{task.title}</h4>
                              <Badge
                                variant={task.priority === 'high' ? 'destructive' : 'secondary'}
                                className="text-xs"
                              >
                                {task.priority === 'high' ? 'Acil' : 'Normal'}
                              </Badge>
                            </div>
                            <p className="mb-2 text-xs text-neutral-600 dark:text-neutral-400">{task.description}</p>
                            <p className="mb-2 text-xs text-neutral-600 dark:text-neutral-400">
                              {task.category} • {task.assignee}
                            </p>

                            {/* Progress Bar */}
                            <div className="mb-2">
                              <div className="mb-1 flex justify-between text-xs text-neutral-500 dark:text-neutral-400">
                                <span>İlerleme</span>
                                <span>{task.progress}%</span>
                              </div>
                              <Progress
                                value={task.progress}
                                className="h-1.5 rounded-full bg-neutral-200 dark:bg-neutral-800"
                              />
                            </div>

                            <div className="flex items-center gap-2">
                              <Clock className="h-3 w-3 text-neutral-400" />
                              <span className="text-xs text-neutral-500 dark:text-neutral-400">{task.deadline}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <InteractiveChart
                    title="Aylık Bağış Trendi"
                    description="Son 6 ayın bağış miktarları"
                    data={sampleDonationData}
                    type="area"
                    height={300}
                    loading={loading}
                  />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <InteractiveChart
                    title="Yardım Dağılımı"
                    description="Yardım türlerine göre dağılım"
                    data={sampleAidDistribution}
                    type="pie"
                    height={300}
                    loading={loading}
                  />
                </motion.div>
              </div>
            </TabsContent>

            <TabsContent value="activities" className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card className="border border-neutral-200 bg-white/80 shadow-lg backdrop-blur-sm dark:border-neutral-700 dark:bg-neutral-900/80">
                  <CardHeader>
                    <CardTitle>Son Aktiviteler</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {recentActivities.map((activity, index) => {
                        const timeAgo = getTimeAgo(activity.timestamp);
                        return (
                          <motion.div
                            key={activity.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 + index * 0.05 }}
                            className="flex cursor-pointer items-center gap-4 rounded-lg p-3 transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800/80"
                          >
                            <div className={'flex-shrink-0 rounded-lg bg-neutral-100 p-2 dark:bg-neutral-800'}>
                              {activity.icon &&
                                React.createElement(activity.icon as unknown as LucideIcon, {
                                  className: `h-4 w-4 ${activity.color ?? 'text-neutral-400'}`,
                                })}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                                  {activity.title}
                                </h4>
                                {activity.amount && (
                                  <Badge variant="outline" className="text-xs">
                                    {activity.amount.toLocaleString('tr-TR')}₺
                                  </Badge>
                                )}
                              </div>
                              <p className="mb-1 text-sm text-neutral-600 dark:text-neutral-400">{activity.description}</p>
                              <div className="flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400">
                                <span>{activity.user}</span>
                                <span>•</span>
                                <span>{timeAgo}</span>
                              </div>
                            </div>
                            <div className="flex flex-col items-end gap-1">
                              <Badge
                                variant={
                                  activity.status === 'completed'
                                    ? 'default'
                                    : activity.status === 'pending'
                                      ? 'secondary'
                                      : 'outline'
                                }
                                className="text-xs"
                              >
                                {activity.status === 'completed'
                                  ? 'Tamamlandı'
                                  : activity.status === 'pending'
                                    ? 'Beklemede'
                                    : 'Devam Ediyor'}
                              </Badge>
                              {activity.priority && (
                                <div
                                  className={`w-2 h-2 rounded-full ${
                                    activity.priority === 'high'
                                      ? 'bg-red-500'
                                      : activity.priority === 'medium'
                                        ? 'bg-yellow-500'
                                        : 'bg-green-500'
                                  }`}
                                />
                              )}
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    );
  },
);

EnhancedDashboard.displayName = 'EnhancedDashboard';

export { EnhancedDashboard };

export default EnhancedDashboard;
