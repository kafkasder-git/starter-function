/**
 * @fileoverview EnhancedDashboard Module - Application module
 *
 * @author Dernek Yönetim Sistemi Team
 * @version 1.0.0
 */

import { Activity, Calendar, Clock, Heart, RefreshCw, Users, type LucideIcon } from 'lucide-react';
import React, { memo, useCallback, useMemo, useState, Suspense, lazy } from 'react';
import { Badge } from './badge';
import { Button } from './button';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Progress } from './progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './tabs';
import MetricCard from './MetricCard';

// Lazy load InteractiveChart for better performance
const InteractiveChart = lazy(() =>
  import('./InteractiveChart').then((module) => ({ default: module.InteractiveChart }))
);
// Auth import removed for simplified implementation
import { useAdvancedMobile } from '../../hooks/useAdvancedMobile';
import { PersonalizedQuickActions } from '../ux/PersonalizedQuickActions';

// React Query hooks
import { useDashboardMetrics } from '../../hooks/queries/useDashboardMetrics';
import { useRecentActivities } from '../../hooks/queries/useRecentActivities';
import { DashboardSkeleton } from './skeleton-loaders';

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
    const [activeTab, setActiveTab] = useState('overview');
    const [lastUpdate, setLastUpdate] = useState(new Date());

    const { deviceInfo, triggerHapticFeedback } = useAdvancedMobile();

    // Use React Query for dashboard metrics
    const {
      data: metricsData,
      isLoading: metricsLoading,
      error: metricsError,
      refetch: refetchMetrics,
    } = useDashboardMetrics({
      enabled: true,
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchInterval: 2 * 60 * 1000, // Refetch every 2 minutes
    });

    // Use React Query for recent activities
    const {
      data: activitiesData,
      isLoading: activitiesLoading,
      error: activitiesError,
      refetch: refetchActivities,
    } = useRecentActivities({
      limit: 10,
      enabled: true,
      staleTime: 2 * 60 * 1000, // 2 minutes
      refetchInterval: 30 * 1000, // Refetch every 30 seconds
    });

    // Combined loading state
    const loading = metricsLoading || activitiesLoading;
    const error = metricsError || activitiesError;

    // Transform metrics data to match old format
    const dashboardData = useMemo(() => {
      if (!metricsData) {
        return {
          beneficiaries: { total: 0, active: 0 },
          donations: { totalAmount: 0, count: 0 },
          members: { total: 0, active: 0 },
          aidRequests: { total: 0, pending: 0 },
        };
      }

      return {
        beneficiaries: {
          total: metricsData.totalMembers || 0,
          active: Math.floor((metricsData.totalMembers || 0) * 0.85),
        },
        donations: {
          totalAmount: metricsData.totalDonations || 0,
          count: Math.floor((metricsData.totalDonations || 0) / 2000),
        },
        members: {
          total: metricsData.totalMembers || 0,
          active: Math.floor((metricsData.totalMembers || 0) * 0.9),
        },
        aidRequests: {
          total: metricsData.totalAidRequests || 0,
          pending: Math.floor((metricsData.totalAidRequests || 0) * 0.15),
        },
      };
    }, [metricsData]);

    // Transform activities data
    const recentActivities = useMemo(() => {
      return activitiesData || [];
    }, [activitiesData]);

    const handleRefresh = useCallback(() => {
      if (deviceInfo.isMobile) {
        triggerHapticFeedback('medium');
      }

      // Update last refresh time
      setLastUpdate(new Date());

      // Refetch both queries
      refetchMetrics();
      refetchActivities();
    }, [deviceInfo.isMobile, triggerHapticFeedback, refetchMetrics, refetchActivities]);

    // All hooks must be called before any early returns
    const metrics = useMemo(
      () => [
        {
          title: 'Toplam Bağış',
          value: `₺${dashboardData.donations.totalAmount.toLocaleString()}`,
          change: {
            value: metricsData?.monthlyDonationGrowth || 12.5,
            type: 'increase' as const,
            period: 'bu ay',
          },
          icon: <Heart className="w-5 h-5" />,
          color: 'green' as const,
          onClick: () => {
            onNavigate?.('donations');
          },
        },
        {
          title: 'Aktif Üyeler',
          value: dashboardData.members.active.toString(),
          change: {
            value: 8.3,
            type: 'increase' as const,
            period: 'bu ay',
          },
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
      [dashboardData, metricsData, onNavigate]
    );

    // Show skeleton loader while loading
    if (loading) {
      return <DashboardSkeleton />;
    }

    // Show error state if there's an error
    if (error) {
      return (
        <div className="flex items-center justify-center min-h-[400px] p-8">
          <div className="text-center">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Dashboard Yüklenemedi</h3>
            <p className="text-gray-600 mb-4">
              Veriler yüklenirken bir hata oluştu. Lütfen tekrar deneyin.
            </p>
            <Button onClick={handleRefresh} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Tekrar Dene
            </Button>
          </div>
        </div>
      );
    }

    return (
      <div
        className={`min-h-full space-y-6 bg-gradient-to-br from-neutral-50 via-neutral-100 to-neutral-200 p-6 dark:from-neutral-900 dark:via-neutral-950 dark:to-neutral-950 ${className}`}
      >
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 sm:text-3xl dark:text-neutral-50">
              Dashboard
            </h1>
            <p className="mt-1 text-neutral-600 dark:text-neutral-400">
              Dernek yönetim sistemi - Güncel durum özeti
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Badge
              variant="outline"
              className="border-success-200 bg-success-50 text-success-700 dark:border-success-500/40 dark:bg-success-500/10 dark:text-success-400"
            >
              <Activity className="w-3 h-3 mr-1" />
              Sistem Aktif
            </Badge>

            <div className="flex items-center gap-2">
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

              <span className="text-xs text-neutral-500 dark:text-neutral-400">
                Son güncelleme:{' '}
                {lastUpdate.toLocaleTimeString('tr-TR', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {metrics.map((metric) => (
            <MetricCard key={metric.title} {...metric} loading={false} />
          ))}
        </div>

        {/* Main Content Tabs */}
        <div>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:grid-cols-none lg:flex">
              <TabsTrigger value="overview">Genel Bakış</TabsTrigger>
              <TabsTrigger value="analytics">Analizler</TabsTrigger>
              <TabsTrigger value="activities">Aktiviteler</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Personalized Quick Actions */}
                <div className="lg:col-span-2">
                  <PersonalizedQuickActions
                    currentModule="genel"
                    onNavigate={onNavigate}
                    onQuickAction={onQuickAction}
                    className="h-full"
                  />
                </div>

                {/* Upcoming Tasks */}
                <div>
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
                              <h4 className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                                {task.title}
                              </h4>
                              <Badge
                                variant={task.priority === 'high' ? 'destructive' : 'secondary'}
                                className="text-xs"
                              >
                                {task.priority === 'high' ? 'Acil' : 'Normal'}
                              </Badge>
                            </div>
                            <p className="mb-2 text-xs text-neutral-600 dark:text-neutral-400">
                              {task.description}
                            </p>
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
                              <span className="text-xs text-neutral-500 dark:text-neutral-400">
                                {task.deadline}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Suspense
                  fallback={<div className="h-[300px] bg-gray-100 rounded-lg animate-pulse" />}
                >
                  <InteractiveChart
                    title="Aylık Bağış Trendi"
                    description="Son 6 ayın bağış miktarları"
                    data={sampleDonationData}
                    type="area"
                    height={300}
                    loading={false}
                  />
                </Suspense>

                <Suspense
                  fallback={<div className="h-[300px] bg-gray-100 rounded-lg animate-pulse" />}
                >
                  <InteractiveChart
                    title="Yardım Dağılımı"
                    description="Yardım türlerine göre dağılım"
                    data={sampleAidDistribution}
                    type="pie"
                    height={300}
                    loading={false}
                  />
                </Suspense>
              </div>
            </TabsContent>

            <TabsContent value="activities" className="space-y-6">
              <div>
                <Card className="border border-neutral-200 bg-white/80 shadow-lg backdrop-blur-sm dark:border-neutral-700 dark:bg-neutral-900/80">
                  <CardHeader>
                    <CardTitle>Son Aktiviteler</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {activitiesLoading
                        ? // Show skeleton for activities
                          Array.from({ length: 5 }).map((_, i) => (
                            <div key={i} className="flex items-center gap-4 p-3">
                              <div className="h-8 w-8 bg-gray-200 rounded-lg animate-pulse" />
                              <div className="flex-1 space-y-2">
                                <div className="h-4 bg-gray-200 rounded animate-pulse" />
                                <div className="h-3 bg-gray-200 rounded animate-pulse w-3/4" />
                              </div>
                              <div className="h-6 w-16 bg-gray-200 rounded animate-pulse" />
                            </div>
                          ))
                        : recentActivities.map((activity) => {
                            const timeAgo = getTimeAgo(activity.timestamp);
                            return (
                              <div
                                key={activity.id}
                                className="flex cursor-pointer items-center gap-4 rounded-lg p-3 transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800/80"
                              >
                                <div
                                  className={
                                    'flex-shrink-0 rounded-lg bg-neutral-100 p-2 dark:bg-neutral-800'
                                  }
                                >
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
                                  <p className="mb-1 text-sm text-neutral-600 dark:text-neutral-400">
                                    {activity.description}
                                  </p>
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
                              </div>
                            );
                          })}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    );
  }
);

EnhancedDashboard.displayName = 'EnhancedDashboard';

export { EnhancedDashboard };

export default EnhancedDashboard;
