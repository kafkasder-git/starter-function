import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  TrendingUp,
  TrendingDown,
  Heart,
  Users,
  Calendar,
  BarChart3,
  PieChart,
  Download,
  RefreshCw,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { PageLayout } from '../layouts/PageLayout';
import { useToast } from '@/hooks/use-toast';
import { reportingService } from '@/services/reportingService';
import type { DonationAnalytics, DateRange } from '@/types/reporting';
import { LazyChartWrapper } from '../LazyComponents';

export function DonationReportsPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [timeRange, setTimeRange] = useState('monthly');
  const [loading, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState<DonationAnalytics | null>(null);
  const { toast } = useToast();

  // Get date range based on selection
  const getDateRange = (range: string): DateRange => {
    const now = new Date();
    const start = new Date();

    switch (range) {
      case 'weekly':
        start.setDate(now.getDate() - 7);
        break;
      case 'monthly':
        start.setMonth(now.getMonth() - 1);
        break;
      case 'quarterly':
        start.setMonth(now.getMonth() - 3);
        break;
      case 'yearly':
        start.setFullYear(now.getFullYear() - 1);
        break;
      default:
        start.setMonth(now.getMonth() - 1);
    }

    return { start, end: now };
  };

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const dateRange = getDateRange(timeRange);
        const data = await reportingService.generateDonationAnalytics(dateRange);
        setAnalyticsData(data);
      } catch (error) {
        toast('Bağış analitikleri yüklenirken hata oluştu');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [timeRange, toast]);

  const handleExport = () => {
    toast('Rapor Excel formatında dışa aktarılıyor...');
  };

  const handleRefresh = () => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const dateRange = getDateRange(timeRange);
        const data = await reportingService.generateDonationAnalytics(dateRange);
        setAnalyticsData(data);
      } catch (error) {
        toast('Bağış analitikleri yüklenirken hata oluştu');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  };

  if (loading) {
    return (
      <PageLayout
        title="Bağış Raporları"
        subtitle="Bağış analitikleri ve detaylı raporlar"
        actions={
          <div className="flex gap-2">
            <Button variant="outline" disabled>
              <Download className="w-4 h-4 mr-2" />
              Dışa Aktar
            </Button>
            <Button variant="outline" disabled>
              <RefreshCw className="w-4 h-4 mr-2" />
              Yenile
            </Button>
          </div>
        }
      >
        <div className="flex h-64 items-center justify-center">
          <div className="text-center">
            <div className="border-primary mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2" />
            <p className="text-muted-foreground">Rapor verileri yükleniyor...</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title="Bağış Raporları"
      subtitle="Bağış analitikleri ve detaylı raporlar"
      actions={
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Dışa Aktar
          </Button>
          <Button variant="outline" onClick={handleRefresh}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Yenile
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Time Range Selector */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center"
        >
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Bağış Analitikleri</h2>
            <p className="text-gray-600">Detaylı bağış raporları ve trend analizi</p>
          </div>
          <div className="flex gap-3">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Zaman aralığı" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="weekly">Son 7 Gün</SelectItem>
                <SelectItem value="monthly">Son 1 Ay</SelectItem>
                <SelectItem value="quarterly">Son 3 Ay</SelectItem>
                <SelectItem value="yearly">Son 1 Yıl</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </motion.div>

        {/* KPI Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
        >
          <Card className="border-0 bg-gradient-to-br from-blue-50 to-blue-100 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600">Toplam Bağış</p>
                  <p className="mt-1 text-2xl font-bold text-blue-900">
                    ₺{analyticsData?.performance.total_donations.toLocaleString('tr-TR') ?? '0'}
                  </p>
                  <div className="mt-2 flex items-center gap-1">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    <span className="text-sm font-medium text-green-600">
                      +{analyticsData?.performance.growth_rate.toFixed(1) ?? '0'}%
                    </span>
                  </div>
                </div>
                <div className="rounded-lg p-3 bg-blue-200">
                  <Heart className="h-6 w-6 text-blue-700" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 bg-gradient-to-br from-green-50 to-green-100 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600">Bağışçı Sayısı</p>
                  <p className="mt-1 text-2xl font-bold text-green-900">
                    {analyticsData?.performance.unique_donors.toLocaleString('tr-TR') ?? '0'}
                  </p>
                  <div className="mt-2 flex items-center gap-1">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    <span className="text-sm font-medium text-green-600">
                      +{analyticsData?.performance.retention_rate.toFixed(1) ?? '0'}%
                    </span>
                  </div>
                </div>
                <div className="rounded-lg p-3 bg-green-200">
                  <Users className="h-6 w-6 text-green-700" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 bg-gradient-to-br from-purple-50 to-purple-100 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600">Ortalama Bağış</p>
                  <p className="mt-1 text-2xl font-bold text-purple-900">
                    ₺{analyticsData?.performance.average_donation.toLocaleString('tr-TR') ?? '0'}
                  </p>
                  <div className="mt-2 flex items-center gap-1">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    <span className="text-sm font-medium text-green-600">+5.2%</span>
                  </div>
                </div>
                <div className="rounded-lg p-3 bg-purple-200">
                  <BarChart3 className="h-6 w-6 text-purple-700" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 bg-gradient-to-br from-orange-50 to-orange-100 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-600">Büyüme Oranı</p>
                  <p className="mt-1 text-2xl font-bold text-orange-900">
                    {analyticsData?.performance.growth_rate.toFixed(1) ?? '0'}%
                  </p>
                  <div className="mt-2 flex items-center gap-1">
                    {analyticsData?.performance.growth_rate &&
                    analyticsData.performance.growth_rate > 0 ? (
                      <TrendingUp className="h-4 w-4 text-green-500" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-500" />
                    )}
                    <span
                      className={`text-sm font-medium ${
                        analyticsData?.performance.growth_rate &&
                        analyticsData.performance.growth_rate > 0
                          ? 'text-green-600'
                          : 'text-red-600'
                      }`}
                    >
                      {analyticsData?.performance.growth_rate &&
                      analyticsData.performance.growth_rate > 0
                        ? '+'
                        : ''}
                      {analyticsData?.performance.growth_rate.toFixed(1) ?? '0'}%
                    </span>
                  </div>
                </div>
                <div className="rounded-lg p-3 bg-orange-200">
                  <Calendar className="h-6 w-6 text-orange-700" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Main Content Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 lg:flex lg:w-auto lg:grid-cols-none">
              <TabsTrigger value="overview">Genel Bakış</TabsTrigger>
              <TabsTrigger value="trends">Trendler</TabsTrigger>
              <TabsTrigger value="segmentation">Segmentasyon</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* Monthly Trends Chart */}
                <Card className="border-0 bg-white/80 shadow-lg backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5 text-blue-600" />
                      Aylık Bağış Trendleri
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <LazyChartWrapper height={300}>
                      <div className="flex h-[300px] items-center justify-center rounded-lg bg-gray-50">
                        <div className="text-center">
                          <BarChart3 className="mx-auto mb-2 h-12 w-12 text-gray-400" />
                          <p className="text-gray-500">Trend grafiği yükleniyor...</p>
                        </div>
                      </div>
                    </LazyChartWrapper>
                  </CardContent>
                </Card>

                {/* Predictions */}
                <Card className="border-0 bg-white/80 shadow-lg backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-green-600" />
                      Tahminler
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="rounded-lg bg-gradient-to-r from-green-50 to-blue-50 p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-600">Gelecek Ay Tahmini</p>
                            <p className="text-2xl font-bold text-gray-900">
                              ₺
                              {analyticsData?.predictions.next_month_forecast.toLocaleString(
                                'tr-TR'
                              ) ?? '0'}
                            </p>
                          </div>
                          <Badge variant="outline" className="text-green-600">
                            %{analyticsData?.predictions.confidence_interval.toFixed(0) ?? '0'}{' '}
                            Güven
                          </Badge>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="rounded-lg bg-blue-50 p-4 text-center">
                          <p className="text-lg font-semibold text-gray-900">
                            ₺
                            {analyticsData?.predictions.quarterly_forecast.toLocaleString(
                              'tr-TR'
                            ) ?? '0'}
                          </p>
                          <p className="text-sm text-gray-600">Çeyreklik Tahmin</p>
                        </div>
                        <div className="rounded-lg bg-purple-50 p-4 text-center">
                          <p className="text-lg font-semibold text-gray-900">
                            {analyticsData?.predictions.trend_direction === 'up'
                              ? '↗'
                              : analyticsData?.predictions.trend_direction === 'down'
                                ? '↘'
                                : '→'}
                          </p>
                          <p className="text-sm text-gray-600">Trend Yönü</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="trends" className="space-y-6">
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* Seasonal Patterns */}
                <Card className="border-0 bg-white/80 shadow-lg backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle>Mevsimsel Paternler</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <LazyChartWrapper height={400}>
                      <div className="flex h-[400px] items-center justify-center rounded-lg bg-gray-50">
                        <div className="text-center">
                          <Calendar className="mx-auto mb-2 h-12 w-12 text-gray-400" />
                          <p className="text-gray-500">Mevsimsel analiz yükleniyor...</p>
                        </div>
                      </div>
                    </LazyChartWrapper>
                  </CardContent>
                </Card>

                {/* Yearly Comparison */}
                <Card className="border-0 bg-white/80 shadow-lg backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle>Yıllık Karşılaştırma</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {(analyticsData?.trends.yearly_comparison ?? []).map((year, index) => (
                        <div
                          key={year.year}
                          className="flex items-center justify-between rounded-lg bg-gray-50 p-3"
                        >
                          <div>
                            <p className="font-medium text-gray-900">{year.year} Yılı</p>
                            <p className="text-sm text-gray-600">{year.count} bağış</p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-gray-900">
                              ₺{year.amount.toLocaleString('tr-TR')}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="segmentation" className="space-y-6">
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* Donor Type Distribution */}
                <Card className="border-0 bg-white/80 shadow-lg backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <PieChart className="h-5 w-5 text-green-600" />
                      Bağışçı Tipi Dağılımı
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {(analyticsData?.segmentation.by_donor_type ?? []).map((donorType, index) => (
                        <div
                          key={donorType.type}
                          className="flex items-center justify-between rounded-lg bg-gray-50 p-3"
                        >
                          <div className="flex items-center gap-3">
                            <div className="h-4 w-4 rounded-full bg-blue-500" />
                            <span className="font-medium text-gray-900 capitalize">
                              {donorType.type === 'individual'
                                ? 'Bireysel'
                                : donorType.type === 'corporate'
                                  ? 'Kurumsal'
                                  : donorType.type === 'anonymous'
                                    ? 'Anonim'
                                    : donorType.type}
                            </span>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-gray-900">{donorType.count} kişi</p>
                            <p className="text-sm text-gray-600">
                              ₺{donorType.total.toLocaleString('tr-TR')}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Amount Range Distribution */}
                <Card className="border-0 bg-white/80 shadow-lg backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle>Bağış Tutarı Dağılımı</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {(analyticsData?.segmentation.by_amount_range ?? []).map((range, index) => (
                        <div key={range.range} className="rounded-lg bg-gray-50 p-4">
                          <div className="mb-2 flex items-center justify-between">
                            <h3 className="font-semibold text-gray-900">{range.range}</h3>
                            <Badge variant="outline">{range.count} bağış</Badge>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Toplam:</span>
                            <span className="font-medium">
                              ₺{range.total.toLocaleString('tr-TR')}
                            </span>
                          </div>
                          <div className="mt-2 h-2 w-full rounded-full bg-gray-200">
                            <div
                              className="h-2 rounded-full bg-blue-600 transition-all duration-500"
                              style={{
                                width: `${(range.count / Math.max(...(analyticsData?.segmentation.by_amount_range ?? []).map((r) => r.count))) * 100}%`,
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </PageLayout>
  );
}
