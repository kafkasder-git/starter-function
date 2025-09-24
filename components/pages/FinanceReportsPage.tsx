import { BarChart3, Download, FileText } from 'lucide-react';
import { motion } from 'motion/react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

export function FinanceReportsPage() {
  const [reportType, setReportType] = useState('monthly');
  const [reportPeriod, setReportPeriod] = useState('thisYear');

  const handleGenerateReport = () => {
    toast.success('Rapor oluşturuluyor...');
  };

  const handleExportReport = () => {
    toast.success('Rapor Excel formatında dışa aktarılıyor...');
  };

  return (
    <div className="p-3 sm:p-6 lg:p-8 space-y-6 bg-slate-50/50 min-h-full safe-area">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1 sm:space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 flex items-center gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center">
              <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            Mali Raporlar
          </h1>
          <p className="text-sm sm:text-base text-slate-600">
            Detaylı finansal analizler ve raporlar
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={handleExportReport} variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Dışa Aktar
          </Button>
          <Button onClick={handleGenerateReport} size="sm">
            <FileText className="w-4 h-4 mr-2" />
            Rapor Oluştur
          </Button>
        </div>
      </div>

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
                <SelectItem value="budget">Bütçe Karşılaştırması</SelectItem>
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

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-12"
      >
        <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center mx-auto shadow-lg mb-4">
          <span className="text-white text-2xl">📊</span>
        </div>
        <h2 className="text-xl font-semibold text-slate-800 mb-2">Mali Raporlar</h2>
        <p className="text-slate-600 mb-4">
          Detaylı finansal raporlar yakında kullanılabilir olacak.
        </p>
        <Badge variant="secondary">Geliştiriliyor</Badge>
      </motion.div>
    </div>
  );
}
