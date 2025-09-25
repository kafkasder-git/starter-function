/**
 * @fileoverview DonationReportsPage Module - Application module
 * 
 * @author Dernek Yönetim Sistemi Team
 * @version 1.0.0
 */

import { BarChart3, Calendar, Download, Heart, PieChart, TrendingUp, Users } from 'lucide-react';
import { motion } from 'motion/react';
import { useState } from 'react';
import { toast } from 'sonner';
import { useIsMobile } from '../../hooks/useTouchDevice';
import { MobileInfoCard, ResponsiveCardGrid } from '../ResponsiveCard';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Progress } from '../ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

/**
 * DonationReportsPage function
 * 
 * @param {Object} params - Function parameters
 * @returns {void} Nothing
 */
export function DonationReportsPage() {
  const isMobile = useIsMobile();
  const [reportType, setReportType] = useState('monthly');
  const [reportPeriod, setReportPeriod] = useState('thisYear');

  const stats = {
    totalDonations: 245650,
    totalDonors: 1247,
    avgDonation: 197,
    monthlyGrowth: 12.5,
  };

  const monthlyData = [
    { month: 'Ocak', amount: 18500, donors: 95 },
    { month: 'Şubat', amount: 22000, donors: 110 },
    { month: 'Mart', amount: 28000, donors: 142 },
    { month: 'Nisan', amount: 19500, donors: 98 },
    { month: 'Mayıs', amount: 31000, donors: 156 },
    { month: 'Haziran', amount: 26500, donors: 134 },
  ];

  const categoryData = [
    { category: 'Nakdi Bağış', amount: 180000, percentage: 73 },
    { category: 'Ayni Bağış', amount: 45000, percentage: 18 },
    { category: 'Kumbara', amount: 20650, percentage: 9 },
  ];

  const handleExportReport = () => {
    toast.success('Bağış raporu Excel formatında dışa aktarılıyor...');
  };

  const handleGenerateReport = () => {
    toast.success('Detaylı rapor oluşturuluyor...');
  };

  return (
    <div className="p-3 sm:p-6 lg:p-8 space-y-6 bg-slate-50/50 min-h-full safe-area">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1 sm:space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 flex items-center gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-rose-600 to-pink-700 rounded-xl flex items-center justify-center">
              <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            Bağış Raporları
          </h1>
          <p className="text-sm sm:text-base text-slate-600">Bağış analizleri ve istatistikleri</p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={handleExportReport} variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Dışa Aktar
          </Button>
          <Button onClick={handleGenerateReport} size="sm">
            <BarChart3 className="w-4 h-4 mr-2" />
            Rapor Oluştur
          </Button>
        </div>
      </div>

      {/* Statistics */}
      <ResponsiveCardGrid cols={{ default: 2, sm: 4 }} gap="sm">
        <MobileInfoCard
          icon={<Heart className="w-5 h-5" />}
          title="Toplam Bağış"
          value={`₺${stats.totalDonations.toLocaleString()}`}
          color="text-rose-600"
        />
        <MobileInfoCard
          icon={<Users className="w-5 h-5" />}
          title="Bağışçı Sayısı"
          value={stats.totalDonors.toString()}
          color="text-blue-600"
        />
        <MobileInfoCard
          icon={<TrendingUp className="w-5 h-5" />}
          title="Ortalama Bağış"
          value={`₺${stats.avgDonation}`}
          color="text-green-600"
        />
        <MobileInfoCard
          icon={<Calendar className="w-5 h-5" />}
          title="Aylık Büyüme"
          value={`+%${stats.monthlyGrowth}`}
          color="text-purple-600"
        />
      </ResponsiveCardGrid>

      {/* Report Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Rapor Ayarları</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select value={reportType} onValueChange={setReportType}>
              <SelectTrigger>
                <SelectValue placeholder="Rapor Tipi" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monthly">Aylık Rapor</SelectItem>
                <SelectItem value="yearly">Yıllık Rapor</SelectItem>
                <SelectItem value="category">Kategori Analizi</SelectItem>
                <SelectItem value="donor">Bağışçı Analizi</SelectItem>
              </SelectContent>
            </Select>
            <Select value={reportPeriod} onValueChange={setReportPeriod}>
              <SelectTrigger>
                <SelectValue placeholder="Dönem" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="thisYear">Bu Yıl</SelectItem>
                <SelectItem value="lastYear">Geçen Yıl</SelectItem>
                <SelectItem value="custom">Özel Tarih</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Aylık Trend
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {monthlyData.map((month, index) => (
              <motion.div
                key={month.month}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
              >
                <div>
                  <div className="font-medium text-slate-900">{month.month}</div>
                  <div className="text-sm text-slate-600">{month.donors} bağışçı</div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-rose-600">
                    ₺{month.amount.toLocaleString()}
                  </div>
                </div>
              </motion.div>
            ))}
          </CardContent>
        </Card>

        {/* Category Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="w-5 h-5" />
              Kategori Dağılımı
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {categoryData.map((category, index) => (
              <motion.div
                key={category.category}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="space-y-2"
              >
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-slate-700">{category.category}</span>
                  <span className="font-semibold text-rose-600">
                    ₺{category.amount.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Progress value={category.percentage} className="flex-1 h-2" />
                  <span className="text-xs text-slate-500 w-10 text-right">
                    %{category.percentage}
                  </span>
                </div>
              </motion.div>
            ))}
          </CardContent>
        </Card>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-12"
      >
        <div className="w-16 h-16 bg-gradient-to-br from-rose-600 to-pink-700 rounded-2xl flex items-center justify-center mx-auto shadow-lg mb-4">
          <span className="text-white text-2xl">📊</span>
        </div>
        <h2 className="text-xl font-semibold text-slate-800 mb-2">Gelişmiş Raporlama</h2>
        <p className="text-slate-600 mb-4">
          Detaylı analiz ve raporlama özellikleri yakında eklenecek.
        </p>
        <Badge variant="secondary">Geliştiriliyor</Badge>
      </motion.div>
    </div>
  );
}
