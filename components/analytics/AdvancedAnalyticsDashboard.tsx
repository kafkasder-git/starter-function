/**
 * @fileoverview AdvancedAnalyticsDashboard Module - Application module
 * 
 * @author Dernek Yönetim Sistemi Team
 * @version 1.0.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  TrendingUp,
  TrendingDown,
  Users,
  Heart,
  Calendar,
  MapPin,
  Clock,
  BarChart3,
  PieChart,
  Activity,
  Target,
  Award,
  AlertTriangle,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { LazyChartWrapper } from '../LazyComponents';

// Analytics data will be fetched from API
const getAnalyticsData = async () => {
  // TODO: Implement real API calls to fetch analytics data
  return {
    overview: {
      totalBeneficiaries: 0,
      totalDonations: 0,
      totalMembers: 0,
      totalEvents: 0,
      growthRates: {
        beneficiaries: 0,
        donations: 0,
        members: 0,
        events: 0,
      },
    },
    trends: {
      monthly: [],
      weekly: [],
    },
    geographic: {
      cities: [],
    },
    categories: {
      aidTypes: [],
    },
    performance: {
      kpis: [],
    },
    alerts: [],
  };
};

interface AdvancedAnalyticsDashboardProps {
  className?: string;
  onNavigate?: (section: string) => void;
}

/**
 * AdvancedAnalyticsDashboard function
 * 
 * @param {Object} params - Function parameters
 * @returns {void} Nothing
 */
export function AdvancedAnalyticsDashboard({
  className = '',
  onNavigate,
}: AdvancedAnalyticsDashboardProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [timeRange, setTimeRange] = useState('monthly');
  const [selectedMetric, setSelectedMetric] = useState('all');
  const [loading, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await getAnalyticsData();
        setAnalyticsData(data);
      } catch (error) {
        console.error('Failed to fetch analytics data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Veri filtreleme
  const filteredData = useMemo(() => {
    if (!analyticsData) return [];
    const data =
      timeRange === 'monthly' ? analyticsData.trends.monthly : analyticsData.trends.weekly;

    if (selectedMetric === 'all') return data;

    return data.map((item) => ({
      ...item,
      [selectedMetric]: item[selectedMetric as keyof typeof item],
    }));
  }, [timeRange, selectedMetric]);

  // KPI kartları
  const kpiCards = [
    {
      title: 'Toplam İhtiyaç Sahibi',
      value: analyticsData?.overview.totalBeneficiaries.toLocaleString('tr-TR') || '0',
      change: analyticsData?.overview.growthRates.beneficiaries || 0,
      icon: Users,
      color: 'blue',
      trend: 'up',
    },
    {
      title: 'Toplam Bağış',
      value: `₺${analyticsData?.overview.totalDonations.toLocaleString('tr-TR') || '0'}`,
      change: analyticsData?.overview.growthRates.donations || 0,
      icon: Heart,
      color: 'green',
      trend: 'up',
    },
    {
      title: 'Aktif Üye',
      value: analyticsData?.overview.totalMembers.toLocaleString('tr-TR') || '0',
      change: analyticsData?.overview.growthRates.members || 0,
      icon: Users,
      color: 'purple',
      trend: 'up',
    },
    {
      title: 'Toplam Etkinlik',
      value: analyticsData?.overview.totalEvents.toLocaleString('tr-TR') || '0',
      change: analyticsData?.overview.growthRates.events || 0,
      icon: Calendar,
      color: 'orange',
      trend: 'up',
    },
  ];

  // Performans göstergeleri
  const getPerformanceStatus = (status: string) => {
    switch (status) {
      case 'excellent':
        return { color: 'text-green-600', bg: 'bg-green-100', icon: CheckCircle };
      case 'good':
        return { color: 'text-blue-600', bg: 'bg-blue-100', icon: CheckCircle };
      case 'warning':
        return { color: 'text-yellow-600', bg: 'bg-yellow-100', icon: AlertTriangle };
      case 'critical':
        return { color: 'text-red-600', bg: 'bg-red-100', icon: XCircle };
      default:
        return { color: 'text-gray-600', bg: 'bg-gray-100', icon: Activity };
    }
  };

  // Alert türleri
  const getAlertType = (type: string) => {
    switch (type) {
      case 'success':
        return { color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' };
      case 'warning':
        return { color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200' };
      case 'info':
        return { color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' };
      case 'error':
        return { color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' };
      default:
        return { color: 'text-gray-600', bg: 'bg-gray-50', border: 'border-gray-200' };
    }
  };

  if (loading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Analitik veriler yükleniyor...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`p-6 space-y-6 bg-gradient-to-br from-slate-50 to-gray-100 min-h-full ${className}`}
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gelişmiş Analitik Dashboard</h1>
          <p className="text-gray-600 mt-1">Dernek performansı ve trend analizi</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Zaman aralığı" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="weekly">Haftalık</SelectItem>
              <SelectItem value="monthly">Aylık</SelectItem>
              <SelectItem value="quarterly">Çeyreklik</SelectItem>
              <SelectItem value="yearly">Yıllık</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedMetric} onValueChange={setSelectedMetric}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Metrik seçin" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tüm Metrikler</SelectItem>
              <SelectItem value="beneficiaries">İhtiyaç Sahipleri</SelectItem>
              <SelectItem value="donations">Bağışlar</SelectItem>
              <SelectItem value="events">Etkinlikler</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </motion.div>

      {/* KPI Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {kpiCards.map((kpi, index) => (
          <motion.div
            key={kpi.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + index * 0.05 }}
          >
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm hover:shadow-xl transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{kpi.title}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{kpi.value}</p>
                    <div className="flex items-center gap-1 mt-2">
                      {kpi.trend === 'up' ? (
                        <TrendingUp className="w-4 h-4 text-green-500" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-red-500" />
                      )}
                      <span
                        className={`text-sm font-medium ${
                          kpi.trend === 'up' ? 'text-green-600' : 'text-red-600'
                        }`}
                      >
                        +{kpi.change}%
                      </span>
                    </div>
                  </div>
                  <div className={`p-3 rounded-lg bg-${kpi.color}-100`}>
                    <kpi.icon className={`w-6 h-6 text-${kpi.color}-600`} />
                  </div>
                </div>
              </CardContent>
            </Card>
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
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:grid-cols-none lg:flex">
            <TabsTrigger value="overview">Genel Bakış</TabsTrigger>
            <TabsTrigger value="trends">Trendler</TabsTrigger>
            <TabsTrigger value="geographic">Coğrafi</TabsTrigger>
            <TabsTrigger value="performance">Performans</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Trend Grafiği */}
              <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-blue-600" />
                    Trend Analizi
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <LazyChartWrapper height={300}>
                    <div className="h-[300px] flex items-center justify-center bg-gray-50 rounded-lg">
                      <div className="text-center">
                        <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-500">Trend grafiği yükleniyor...</p>
                      </div>
                    </div>
                  </LazyChartWrapper>
                </CardContent>
              </Card>

              {/* Kategori Dağılımı */}
              <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="w-5 h-5 text-green-600" />
                    Yardım Kategorileri
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {(analyticsData?.categories.aidTypes || []).map((category, index) => (
                      <motion.div
                        key={category.name}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 + index * 0.05 }}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="w-4 h-4 rounded-full"
                            data-category-color={category.color}
                          />
                          <span className="font-medium text-gray-900">{category.name}</span>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">{category.count} kişi</p>
                          <p className="text-sm text-gray-600">
                            ₺{category.amount.toLocaleString('tr-TR')}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Uyarılar */}
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-orange-600" />
                  Sistem Uyarıları
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {(analyticsData?.alerts || []).map((alert, index) => {
                    const alertStyle = getAlertType(alert.type);
                    return (
                      <motion.div
                        key={alert.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 + index * 0.05 }}
                        className={`p-4 rounded-lg border ${alertStyle.bg} ${alertStyle.border}`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className={`font-medium ${alertStyle.color}`}>{alert.message}</p>
                            <p className="text-sm text-gray-600 mt-1">
                              Öncelik:{' '}
                              {alert.priority === 'high'
                                ? 'Yüksek'
                                : alert.priority === 'medium'
                                  ? 'Orta'
                                  : 'Düşük'}
                            </p>
                          </div>
                          <Badge
                            variant={
                              alert.priority === 'high'
                                ? 'destructive'
                                : alert.priority === 'medium'
                                  ? 'secondary'
                                  : 'outline'
                            }
                            className="ml-2"
                          >
                            {alert.priority === 'high'
                              ? 'Acil'
                              : alert.priority === 'medium'
                                ? 'Normal'
                                : 'Düşük'}
                          </Badge>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="trends" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Aylık Trend */}
              <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle>Zaman Serisi Analizi</CardTitle>
                </CardHeader>
                <CardContent>
                  <LazyChartWrapper height={400}>
                    <div className="h-[400px] flex items-center justify-center bg-gray-50 rounded-lg">
                      <div className="text-center">
                        <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-500">Trend grafiği yükleniyor...</p>
                      </div>
                    </div>
                  </LazyChartWrapper>
                </CardContent>
              </Card>

              {/* Performans Metrikleri */}
              <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle>Performans Göstergeleri</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {(analyticsData?.performance.kpis || []).map((kpi, index) => {
                      const status = getPerformanceStatus(kpi.status);
                      return (
                        <motion.div
                          key={kpi.name}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.1 + index * 0.05 }}
                          className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${status.bg}`}>
                              <status.icon className={`w-5 h-5 ${status.color}`} />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{kpi.name}</p>
                              <p className="text-sm text-gray-600">Hedef: {kpi.target}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-gray-900">{kpi.value}</p>
                            <Badge
                              variant={
                                kpi.status === 'excellent'
                                  ? 'default'
                                  : kpi.status === 'good'
                                    ? 'secondary'
                                    : kpi.status === 'warning'
                                      ? 'destructive'
                                      : 'outline'
                              }
                              className="text-xs"
                            >
                              {kpi.status === 'excellent'
                                ? 'Mükemmel'
                                : kpi.status === 'good'
                                  ? 'İyi'
                                  : kpi.status === 'warning'
                                    ? 'Dikkat'
                                    : 'Kritik'}
                            </Badge>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="geographic" className="space-y-6">
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-blue-600" />
                  Coğrafi Dağılım
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {(analyticsData?.geographic.cities || []).map((city, index) => (
                    <motion.div
                      key={city.name}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 + index * 0.05 }}
                      className="p-4 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold text-gray-900">{city.name}</h3>
                        <Badge variant="outline">{city.percentage}%</Badge>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">İhtiyaç Sahibi:</span>
                          <span className="font-medium">{city.beneficiaries}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Toplam Bağış:</span>
                          <span className="font-medium">
                            ₺{city.donations.toLocaleString('tr-TR')}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                            data-progress-width={`${city.percentage}%`}
                          />
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Performans Grafiği */}
              <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-purple-600" />
                    Hedef vs Gerçekleşen
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <LazyChartWrapper height={300}>
                    <div className="h-[300px] flex items-center justify-center bg-gray-50 rounded-lg">
                      <div className="text-center">
                        <Target className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-500">Performans grafiği yükleniyor...</p>
                      </div>
                    </div>
                  </LazyChartWrapper>
                </CardContent>
              </Card>

              {/* Başarı Metrikleri */}
              <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-yellow-600" />
                    Başarı Metrikleri
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center p-6 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg">
                      <Award className="w-12 h-12 text-yellow-600 mx-auto mb-2" />
                      <h3 className="text-2xl font-bold text-gray-900">%105</h3>
                      <p className="text-gray-600">Aylık Hedef Başarı Oranı</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <CheckCircle className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                        <p className="text-lg font-semibold text-gray-900">87%</p>
                        <p className="text-sm text-gray-600">Onay Oranı</p>
                      </div>
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <Clock className="w-8 h-8 text-green-600 mx-auto mb-2" />
                        <p className="text-lg font-semibold text-gray-900">3.2 gün</p>
                        <p className="text-sm text-gray-600">Ortalama Süre</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}

export default AdvancedAnalyticsDashboard;
