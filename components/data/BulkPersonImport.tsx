// 👥 BULK PERSON IMPORT COMPONENT
// High-performance bulk import for 1000+ person records

import {
  AlertCircle,
  CheckCircle,
  Clock,
  Database,
  Download,
  FileText,
  Loader2,
  Pause,
  Play,
  RotateCcw,
  TrendingUp,
  Upload,
  Users,
  X,
  Zap,
} from 'lucide-react';
import React, { useCallback, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { z } from 'zod';

import { Alert, AlertDescription } from '../ui/alert';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Progress } from '../ui/progress';
import { Separator } from '../ui/separator';
import { Switch } from '../ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';

import useBulkImport from '../../hooks/useBulkImport';

// Person data schema for validation
const personSchema = z
  .object({
    id: z.string().optional(),
    name: z
      .string()
      .trim()
      .min(2, 'Ad en az 2 karakter olmalıdır')
      .max(100, 'Ad en fazla 100 karakter olabilir'),

    nationalId: z
      .string()
      .regex(/^[0-9]{11}$/, 'TC Kimlik No 11 haneli olmalıdır')
      .optional()
      .or(z.literal('')),

    nationality: z
      .string()
      .max(50, 'Uyruk en fazla 50 karakter olabilir')
      .optional()
      .or(z.literal('')),

    country: z.string().max(50, 'Ülke en fazla 50 karakter olabilir').optional().or(z.literal('')),

    city: z.string().max(50, 'Şehir en fazla 50 karakter olabilir').optional().or(z.literal('')),

    settlement: z
      .string()
      .max(50, 'Yerleşim en fazla 50 karakter olabilir')
      .optional()
      .or(z.literal('')),

    neighborhood: z
      .string()
      .max(50, 'Mahalle en fazla 50 karakter olabilir')
      .optional()
      .or(z.literal('')),

    address: z
      .string()
      .max(500, 'Adres en fazla 500 karakter olabilir')
      .optional()
      .or(z.literal('')),

    familyMemberCount: z
      .number()
      .min(1, 'Ailedeki kişi sayısı en az 1 olmalıdır')
      .max(20, 'Ailedeki kişi sayısı en fazla 20 olabilir')
      .optional(),

    linkedOrphan: z
      .string()
      .max(100, 'Bağlı yetim en fazla 100 karakter olabilir')
      .optional()
      .or(z.literal('')),

    linkedCard: z
      .string()
      .max(100, 'Bağlı kart en fazla 100 karakter olabilir')
      .optional()
      .or(z.literal('')),

    phone: z
      .string()
      .regex(/^(\+90|0)?[5][0-9]{9}$/, 'Geçerli bir telefon numarası giriniz')
      .optional()
      .or(z.literal('')),

    registrationDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Kayıt tarihi YYYY-MM-DD formatında olmalıdır')
      .optional()
      .or(z.literal('')),

    registrationUnit: z
      .string()
      .max(100, 'Kaydı açan birim en fazla 100 karakter olabilir')
      .optional()
      .or(z.literal('')),

    category: z
      .string()
      .max(50, 'Kategori en fazla 50 karakter olabilir')
      .optional()
      .or(z.literal('')),

    type: z.string().max(50, 'Tür en fazla 50 karakter olabilir').optional().or(z.literal('')),

    fundRegion: z
      .string()
      .max(50, 'Fon bölgesi en fazla 50 karakter olabilir')
      .optional()
      .or(z.literal('')),

    totalAmount: z.number().min(0, 'Toplam tutar negatif olamaz').optional(),

    iban: z
      .string()
      .regex(/^TR[0-9]{24}$/, 'Geçerli bir IBAN numarası giriniz')
      .optional()
      .or(z.literal('')),

    status: z.enum(['active', 'inactive'] as const).default('active'),
  })
  .strict();

type PersonData = z.infer<typeof personSchema>;

interface BulkPersonImportProps {
  readonly onImportComplete?: (data: PersonData[]) => void;
  readonly onClose?: () => void;
  readonly maxRecords?: number;
  readonly allowedTypes?: ('member' | 'beneficiary' | 'volunteer' | 'donor')[];
}

// Mock import function - replace with actual API call
const mockImportPersons = async (batch: PersonData[]): Promise<PersonData[]> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 200 + Math.random() * 300));

  // Simulate occasional failures for demonstration
  if (Math.random() < 0.05) {
    // 5% failure rate
    throw new Error('Batch processing failed - simulated error');
  }

  return batch.map((person) => ({
    ...person,
    id: Math.random().toString(36).substr(2, 9), // Generate mock ID
  })) as PersonData[];
};

export function BulkPersonImport({
  onImportComplete,
  onClose,
  maxRecords = 2000,
  allowedTypes = ['member', 'beneficiary', 'volunteer', 'donor'],
}: BulkPersonImportProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<unknown[]>([]);
  const [importOptions, setImportOptions] = useState({
    batchSize: 50,
    skipDuplicates: true,
    validateBeforeImport: true,
    delayBetweenBatches: 100,
  });

  // Table state management
  const [sortConfig, setSortConfig] = useState<{
    key: keyof PersonData | null;
    direction: 'asc' | 'desc';
  }>({ key: null, direction: 'asc' });

  const [filterConfig, setFilterConfig] = useState({
    searchTerm: '',
    statusFilter: 'all' as 'all' | 'success' | 'error',
    typeFilter: 'all' as 'all' | 'member' | 'beneficiary' | 'volunteer' | 'donor',
  });

  const [paginationConfig, setPaginationConfig] = useState({
    currentPage: 1,
    itemsPerPage: 10,
  });

  const {
    isImporting,
    progress,
    errors,
    importedData,
    startImport,
    cancelImport,
    clearResults,
    exportErrors,
    hasErrors,
    hasData,
    canCancel,
  } = useBulkImport(personSchema, mockImportPersons, importOptions);

  // File processing
  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      // 10MB limit
      toast.error("Dosya boyutu 10MB'dan büyük olamaz");
      return;
    }

    if (
      ![
        'text/csv',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      ].includes(file.type)
    ) {
      toast.error('Sadece CSV ve Excel dosyaları desteklenir');
      return;
    }

    setSelectedFile(file);
    parseFile(file);
  }, []);

  const parseFile = useCallback(
    async (file: File) => {
      try {
        const text = await file.text();

        if (file.name.endsWith('.csv')) {
          // Parse CSV
          const lines = text.split('\n').filter((line) => line.trim());
          const headers = lines[0].split(',').map((h) => h.trim().replace(/"/g, ''));
          const data = lines.slice(1).map((line) => {
            const values = line.split(',').map((v) => v.trim().replace(/"/g, ''));
            const obj: Record<string, string> = {};
            headers.forEach((header, index) => {
              obj[header] = values[index] || '';
            });
            return obj;
          });

          if (data.length > maxRecords) {
            toast.warning(
              `Maksimum ${maxRecords} kayıt işlenebilir. İlk ${maxRecords} kayıt alınacak.`,
            );
            setParsedData(data.slice(0, maxRecords));
          } else {
            setParsedData(data);
          }

          toast.success(`${Math.min(data.length, maxRecords)} kayıt yüklendi`);
        } else {
          toast.error('Excel dosyaları için ayrı parser gereklidir');
        }
      } catch (error) {
        toast.error('Dosya ayrıştırılırken hata oluştu');
      }
    },
    [maxRecords],
  );

  // Generate sample CSV
  const downloadSampleCSV = useCallback(() => {
    const sampleData = [
      'ID,Ad Soyad,Kimlik No,Uyruk,Ülkesi,Şehri,Yerleşimi,Mahalle,Adres,Ailedeki Kişi Sayısı,Bağlı Yetim,Bağlı Kart,Telefon No,Kayıt Tarihi,Kaydı Açan Birim,Kategori,Tür,Fon Bölgesi,Toplam Tutar,Iban',
      '1,Ahmet Yılmaz,12345678901,Türk,Türkiye,İstanbul,Ataşehir,Ataşehir Mah.,Ataşehir Mah. No:15,4,Yetim Ahmet,12345,05551234567,2024-01-15,Merkez Birim,Yardım Alanı,Üye,İstanbul,5000.00,TR1234567890123456789012345',
      '2,Fatma Demir,23456789012,Türk,Türkiye,Ankara,Çankaya,Çankaya Mah.,Çankaya Mah. No:25,3,Yetim Fatma,67890,05552345678,2024-01-16,Şube Birim,Yardım Alanı,Üye,Ankara,3500.00,TR2345678901234567890123456',
      '3,Mehmet Kaya,34567890123,Türk,Türkiye,İzmir,Konak,Konak Mah.,Konak Mah. No:35,5,Yetim Mehmet,11111,05553456789,2024-01-17,Temsilcilik,Yardım Alanı,Üye,İzmir,7500.00,TR3456789012345678901234567',
    ].join('\n');

    const blob = new Blob([sampleData], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'bulk-import-sample.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success('Örnek CSV dosyası indirildi');
  }, []);

  // Start import process
  const handleStartImport = useCallback(async () => {
    if (parsedData.length === 0) {
      toast.error('İçe aktarılacak veri bulunamadı');
      return;
    }

    try {
      const result = await startImport(parsedData, 'nationalId'); // Use nationalId as duplicate key

      if (result.successful.length > 0) {
        onImportComplete?.(result.successful);
      }
    } catch (error) {
      // Error already handled in hook
    }
  }, [parsedData, startImport, onImportComplete]);

  // Progress calculations
  const progressStats = useMemo(
    () => ({
      percentage: Math.round(progress.percentage),
      timeRemaining:
        progress.estimatedTimeRemaining > 0
          ? `${Math.ceil(progress.estimatedTimeRemaining)}s`
          : '---',
      speed:
        progress.processingSpeed > 0 ? `${Math.round(progress.processingSpeed)} kayıt/sn` : '---',
      eta:
        progress.estimatedTimeRemaining > 0
          ? new Date(Date.now() + progress.estimatedTimeRemaining * 1000).toLocaleTimeString(
              'tr-TR',
            )
          : '---',
    }),
    [progress],
  );

  // Table utilities
  const handleSort = useCallback((key: keyof PersonData) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  }, []);

  const filteredAndSortedData = useMemo(() => {
    let data = [...importedData];

    // Apply filters
    if (filterConfig.searchTerm) {
      const searchLower = filterConfig.searchTerm.toLowerCase();
      data = data.filter(
        (person) =>
          person.name.toLowerCase().includes(searchLower) ||
          person.nationalId?.includes(searchLower) ||
          person.phone?.includes(searchLower) ||
          person.city?.toLowerCase().includes(searchLower) ||
          person.neighborhood?.toLowerCase().includes(searchLower) ||
          person.linkedOrphan?.toLowerCase().includes(searchLower),
      );
    }

    if (filterConfig.typeFilter !== 'all') {
      data = data.filter((person) => person.type === filterConfig.typeFilter);
    }

    // Apply sorting
    if (sortConfig.key) {
      data.sort((a, b) => {
        const aVal = a[sortConfig.key!]!;
        const bVal = b[sortConfig.key!]!;

        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return data;
  }, [importedData, filterConfig, sortConfig]);

  const paginatedData = useMemo(() => {
    const startIndex = (paginationConfig.currentPage - 1) * paginationConfig.itemsPerPage;
    const endIndex = startIndex + paginationConfig.itemsPerPage;
    return filteredAndSortedData.slice(startIndex, endIndex);
  }, [filteredAndSortedData, paginationConfig]);

  const totalPages = Math.ceil(filteredAndSortedData.length / paginationConfig.itemsPerPage);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <Users className="h-6 w-6 text-blue-600" />
            Toplu Kişi Kaydı
          </h2>
          <p className="text-gray-600 mt-1">
            CSV dosyasından toplu olarak kişi verilerini içe aktarın (Maksimum {maxRecords} kayıt)
          </p>
        </div>
        {onClose && (
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      <Tabs defaultValue="upload" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="upload">📁 Dosya Yükle</TabsTrigger>
          <TabsTrigger value="settings">⚙️ Ayarlar</TabsTrigger>
          <TabsTrigger value="progress">📊 İlerleme</TabsTrigger>
          <TabsTrigger value="results">📋 Sonuçlar</TabsTrigger>
        </TabsList>

        {/* File Upload Tab */}
        <TabsContent value="upload" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Dosya Seçimi
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
                <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <div className="space-y-2">
                  <p className="text-lg font-medium">CSV dosyasını seçin</p>
                  <p className="text-sm text-gray-500">
                    Maksimum dosya boyutu: 10MB • Desteklenen formatlar: CSV, Excel
                  </p>
                  <Input
                    type="file"
                    accept=".csv,.xlsx,.xls"
                    onChange={handleFileSelect}
                    className="max-w-xs mx-auto"
                  />
                </div>
              </div>

              {selectedFile && (
                <Alert>
                  <FileText className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Seçili dosya:</strong> {selectedFile.name} (
                    {(selectedFile.size / 1024).toFixed(1)} KB)
                    <br />
                    <strong>Yüklenen kayıt sayısı:</strong> {parsedData.length}
                  </AlertDescription>
                </Alert>
              )}

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={downloadSampleCSV}
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Örnek CSV İndir
                </Button>

                {parsedData.length > 0 && (
                  <Button
                    onClick={handleStartImport}
                    disabled={isImporting}
                    className="flex items-center gap-2"
                  >
                    {isImporting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Play className="h-4 w-4" />
                    )}
                    İçe Aktarmayı Başlat
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>İçe Aktarma Ayarları</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="batchSize">Batch Boyutu</Label>
                  <Input
                    id="batchSize"
                    type="number"
                    min="10"
                    max="100"
                    value={importOptions.batchSize}
                    onChange={(e) => {
                      setImportOptions((prev) => ({
                        ...prev,
                        batchSize: parseInt(e.target.value) || 50,
                      }));
                    }}
                  />
                  <p className="text-xs text-gray-500">Aynı anda işlenecek kayıt sayısı</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="delay">Batch Arası Gecikme (ms)</Label>
                  <Input
                    id="delay"
                    type="number"
                    min="0"
                    max="1000"
                    value={importOptions.delayBetweenBatches}
                    onChange={(e) => {
                      setImportOptions((prev) => ({
                        ...prev,
                        delayBetweenBatches: parseInt(e.target.value) || 100,
                      }));
                    }}
                  />
                  <p className="text-xs text-gray-500">Sistemin nefes alması için gecikme</p>
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Tekrarları Atla</Label>
                    <p className="text-xs text-gray-500">
                      Aynı email adresine sahip kayıtları atla
                    </p>
                  </div>
                  <Switch
                    checked={importOptions.skipDuplicates}
                    onCheckedChange={(checked: boolean) => {
                      setImportOptions((prev) => ({ ...prev, skipDuplicates: checked }));
                    }}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Önce Doğrula</Label>
                    <p className="text-xs text-gray-500">
                      Tüm verileri önce doğrula, sonra içe aktar
                    </p>
                  </div>
                  <Switch
                    checked={importOptions.validateBeforeImport}
                    onCheckedChange={(checked: boolean) => {
                      setImportOptions((prev) => ({ ...prev, validateBeforeImport: checked }));
                    }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Progress Tab */}
        <TabsContent value="progress" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                İçe Aktarma İlerlemesi
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {isImporting && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">İlerleme</span>
                    <span className="text-sm text-gray-500">{progressStats.percentage}%</span>
                  </div>
                  <Progress value={progressStats.percentage} className="h-3" />

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <div className="font-semibold text-blue-700">{progress.processed}</div>
                      <div className="text-blue-600">İşlenen</div>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <div className="font-semibold text-green-700">{progress.successful}</div>
                      <div className="text-green-600">Başarılı</div>
                    </div>
                    <div className="text-center p-3 bg-red-50 rounded-lg">
                      <div className="font-semibold text-red-700">{progress.failed}</div>
                      <div className="text-red-600">Başarısız</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="font-semibold text-gray-700">
                        {progress.total - progress.processed}
                      </div>
                      <div className="text-gray-600">Kalan</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <span>Kalan Süre: {progressStats.timeRemaining}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-gray-500" />
                      <span>Hız: {progressStats.speed}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <span>Tahmini Bitiş: {progressStats.eta}</span>
                    </div>
                  </div>

                  {canCancel && (
                    <div className="flex justify-center">
                      <Button variant="destructive" onClick={cancelImport} size="sm">
                        <Pause className="h-4 w-4 mr-2" />
                        İptal Et
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {!isImporting && progress.total === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <TrendingUp className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>İçe aktarma başlatıldığında ilerleme burada görünecek</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Results Tab */}
        <TabsContent value="results" className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-700">Başarılı Kayıtlar</p>
                    <p className="text-2xl font-bold text-green-800">{importedData.length}</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-red-50 border-red-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-red-700">Hatalı Kayıtlar</p>
                    <p className="text-2xl font-bold text-red-800">{errors.length}</p>
                  </div>
                  <AlertCircle className="h-8 w-8 text-red-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-700">Toplam Kayıt</p>
                    <p className="text-2xl font-bold text-blue-800">
                      {importedData.length + errors.length}
                    </p>
                  </div>
                  <Database className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Results Tables */}
          <div className="grid grid-cols-1 gap-6">
            {/* Success Results Table */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-green-700">
                    <CheckCircle className="h-5 w-5" />
                    Başarılı Kayıtlar ({importedData.length})
                  </div>
                  {hasData && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        /* Export success data */
                      }}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Başarılı Kayıtları İndir
                    </Button>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {hasData ? (
                  <div className="space-y-4">
                    {/* Table Controls */}
                    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                      <div className="flex flex-col sm:flex-row gap-2">
                        <Input
                          placeholder="Ara (ad, TC, telefon, şehir...)"
                          value={filterConfig.searchTerm}
                          onChange={(e) => {
                            setFilterConfig((prev) => ({ ...prev, searchTerm: e.target.value }));
                          }}
                          className="w-full sm:w-64"
                        />
                        <select
                          value={filterConfig.typeFilter}
                          onChange={(e) => {
                            setFilterConfig((prev) => ({
                              ...prev,
                              typeFilter: e.target.value as any,
                            }));
                          }}
                          className="px-3 py-2 border rounded-md text-sm"
                        >
                          <option value="all">Tüm Türler</option>
                          <option value="Üye">Üye</option>
                          <option value="Yardım Alanı">Yardım Alanı</option>
                          <option value="Gönüllü">Gönüllü</option>
                          <option value="Bağışçı">Bağışçı</option>
                        </select>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <span>Sayfa başına:</span>
                        <select
                          value={paginationConfig.itemsPerPage}
                          onChange={(e) => {
                            setPaginationConfig((prev) => ({
                              ...prev,
                              itemsPerPage: parseInt(e.target.value),
                              currentPage: 1,
                            }));
                          }}
                          className="px-2 py-1 border rounded text-sm"
                        >
                          <option value={10}>10</option>
                          <option value={25}>25</option>
                          <option value={50}>50</option>
                          <option value={100}>100</option>
                        </select>
                      </div>
                    </div>

                    {/* Table */}
                    <div className="border rounded-lg overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full min-w-[1200px]">
                          <thead className="bg-green-50 border-b">
                            <tr>
                              <th
                                className="px-3 py-3 text-left text-xs font-medium text-green-700 uppercase tracking-wider cursor-pointer hover:bg-green-100"
                                onClick={() => {
                                  handleSort('id');
                                }}
                              >
                                ID{' '}
                                {sortConfig.key === 'id' &&
                                  (sortConfig.direction === 'asc' ? '↑' : '↓')}
                              </th>
                              <th
                                className="px-3 py-3 text-left text-xs font-medium text-green-700 uppercase tracking-wider cursor-pointer hover:bg-green-100"
                                onClick={() => {
                                  handleSort('name');
                                }}
                              >
                                Ad Soyad{' '}
                                {sortConfig.key === 'name' &&
                                  (sortConfig.direction === 'asc' ? '↑' : '↓')}
                              </th>
                              <th
                                className="px-3 py-3 text-left text-xs font-medium text-green-700 uppercase tracking-wider cursor-pointer hover:bg-green-100"
                                onClick={() => {
                                  handleSort('nationalId');
                                }}
                              >
                                Kimlik No{' '}
                                {sortConfig.key === 'nationalId' &&
                                  (sortConfig.direction === 'asc' ? '↑' : '↓')}
                              </th>
                              <th className="px-3 py-3 text-left text-xs font-medium text-green-700 uppercase tracking-wider">
                                Uyruk
                              </th>
                              <th className="px-3 py-3 text-left text-xs font-medium text-green-700 uppercase tracking-wider">
                                Ülke
                              </th>
                              <th
                                className="px-3 py-3 text-left text-xs font-medium text-green-700 uppercase tracking-wider cursor-pointer hover:bg-green-100"
                                onClick={() => {
                                  handleSort('city');
                                }}
                              >
                                Şehir{' '}
                                {sortConfig.key === 'city' &&
                                  (sortConfig.direction === 'asc' ? '↑' : '↓')}
                              </th>
                              <th className="px-3 py-3 text-left text-xs font-medium text-green-700 uppercase tracking-wider">
                                Yerleşim
                              </th>
                              <th className="px-3 py-3 text-left text-xs font-medium text-green-700 uppercase tracking-wider">
                                Mahalle
                              </th>
                              <th className="px-3 py-3 text-left text-xs font-medium text-green-700 uppercase tracking-wider">
                                Telefon
                              </th>
                              <th className="px-3 py-3 text-left text-xs font-medium text-green-700 uppercase tracking-wider">
                                Aile Sayısı
                              </th>
                              <th className="px-3 py-3 text-left text-xs font-medium text-green-700 uppercase tracking-wider">
                                Bağlı Yetim
                              </th>
                              <th
                                className="px-3 py-3 text-left text-xs font-medium text-green-700 uppercase tracking-wider cursor-pointer hover:bg-green-100"
                                onClick={() => {
                                  handleSort('totalAmount');
                                }}
                              >
                                Toplam Tutar{' '}
                                {sortConfig.key === 'totalAmount' &&
                                  (sortConfig.direction === 'asc' ? '↑' : '↓')}
                              </th>
                              <th className="px-3 py-3 text-left text-xs font-medium text-green-700 uppercase tracking-wider">
                                Durum
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {paginatedData.map((person, index) => (
                              <tr key={index} className="hover:bg-green-50 transition-colors">
                                <td className="px-3 py-3 text-sm text-gray-900 font-medium">
                                  {person.id || '—'}
                                </td>
                                <td className="px-3 py-3 text-sm text-gray-900">
                                  <div
                                    className="font-medium max-w-[150px] truncate"
                                    title={person.name}
                                  >
                                    {person.name}
                                  </div>
                                </td>
                                <td className="px-3 py-3 text-sm text-gray-600 font-mono">
                                  {person.nationalId || '—'}
                                </td>
                                <td className="px-3 py-3 text-sm text-gray-600">
                                  {person.nationality || '—'}
                                </td>
                                <td className="px-3 py-3 text-sm text-gray-600">
                                  {person.country || '—'}
                                </td>
                                <td className="px-3 py-3 text-sm text-gray-600">
                                  {person.city || '—'}
                                </td>
                                <td className="px-3 py-3 text-sm text-gray-600">
                                  {person.settlement || '—'}
                                </td>
                                <td className="px-3 py-3 text-sm text-gray-600">
                                  {person.neighborhood || '—'}
                                </td>
                                <td className="px-3 py-3 text-sm text-gray-600">
                                  {person.phone || '—'}
                                </td>
                                <td className="px-3 py-3 text-sm text-gray-600 text-center">
                                  {person.familyMemberCount || '—'}
                                </td>
                                <td
                                  className="px-3 py-3 text-sm text-gray-600 max-w-[100px] truncate"
                                  title={person.linkedOrphan}
                                >
                                  {person.linkedOrphan || '—'}
                                </td>
                                <td className="px-3 py-3 text-sm text-gray-600 font-mono">
                                  {person.totalAmount
                                    ? `₺${person.totalAmount.toLocaleString('tr-TR')}`
                                    : '—'}
                                </td>
                                <td className="px-3 py-3">
                                  <Badge
                                    variant="secondary"
                                    className="bg-green-100 text-green-800"
                                  >
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                    Başarılı
                                  </Badge>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Pagination */}
                      {totalPages > 1 && (
                        <div className="bg-green-50 px-4 py-3 flex items-center justify-between">
                          <div className="text-sm text-green-700">
                            {filteredAndSortedData.length} kayıttan{' '}
                            {(paginationConfig.currentPage - 1) * paginationConfig.itemsPerPage + 1}
                            -
                            {Math.min(
                              paginationConfig.currentPage * paginationConfig.itemsPerPage,
                              filteredAndSortedData.length,
                            )}{' '}
                            arası gösteriliyor
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setPaginationConfig((prev) => ({
                                  ...prev,
                                  currentPage: Math.max(1, prev.currentPage - 1),
                                }));
                              }}
                              disabled={paginationConfig.currentPage === 1}
                            >
                              Önceki
                            </Button>
                            <span className="text-sm text-green-700">
                              Sayfa {paginationConfig.currentPage} / {totalPages}
                            </span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setPaginationConfig((prev) => ({
                                  ...prev,
                                  currentPage: Math.min(totalPages, prev.currentPage + 1),
                                }));
                              }}
                              disabled={paginationConfig.currentPage === totalPages}
                            >
                              Sonraki
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <CheckCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">Henüz başarılı kayıt bulunmuyor</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Error Results Table */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-red-700">
                    <AlertCircle className="h-5 w-5" />
                    Hatalı Kayıtlar ({errors.length})
                  </div>
                  {hasErrors && (
                    <Button variant="outline" size="sm" onClick={exportErrors}>
                      <Download className="h-4 w-4 mr-2" />
                      Hataları İndir
                    </Button>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {hasErrors ? (
                  <div className="border rounded-lg overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-red-50 border-b">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-red-700 uppercase tracking-wider">
                              Satır #
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-red-700 uppercase tracking-wider">
                              Hata Türü
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-red-700 uppercase tracking-wider">
                              Alan
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-red-700 uppercase tracking-wider">
                              Hata Mesajı
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-red-700 uppercase tracking-wider">
                              Veri
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-red-700 uppercase tracking-wider">
                              Durum
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {errors.slice(0, 20).map((error, index) => (
                            <tr key={index} className="hover:bg-red-50 transition-colors">
                              <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                                {error.rowIndex}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-900">
                                <Badge variant="destructive" className="text-xs">
                                  {error.field ? 'Alan Hatası' : 'Genel Hata'}
                                </Badge>
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-600 font-medium">
                                {error.field || '—'}
                              </td>
                              <td className="px-4 py-3 text-sm text-red-600 max-w-xs">
                                <div className="truncate" title={error.error}>
                                  {error.error}
                                </div>
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-500 max-w-xs">
                                <div className="truncate font-mono text-xs">
                                  {error.field ? JSON.stringify(error.rowData[error.field]) : '—'}
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                <Badge variant="destructive" className="text-xs">
                                  <AlertCircle className="h-3 w-3 mr-1" />
                                  Hatalı
                                </Badge>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    {errors.length > 20 && (
                      <div className="bg-red-50 px-4 py-3 text-sm text-red-700 text-center">
                        ...ve {errors.length - 20} hata daha gösteriliyor
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-4" />
                    <p className="text-gray-500">
                      Hata bulunmuyor - Tüm kayıtlar başarıyla işlendi!
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {(hasData || hasErrors) && (
            <div className="flex justify-center gap-2">
              <Button variant="outline" onClick={clearResults}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Sonuçları Temizle
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default BulkPersonImport;
