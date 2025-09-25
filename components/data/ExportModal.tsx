import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Download,
  FileText,
  Table,
  File,
  Calendar,
  Settings,
  CheckCircle,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Checkbox } from '../ui/checkbox';
import { Switch } from '../ui/switch';
import { Calendar as CalendarComponent } from '../ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Separator } from '../ui/separator';
import { Progress } from '../ui/progress';
import { useDataExport } from '../../hooks/useDataExport';
import { useIsMobile } from '../../hooks/useTouchDevice';
import { cn } from '../ui/utils';
import type { ExportConfig, ExportResult } from '../../types/data';
import { EXPORT_TEMPLATES } from '../../types/data';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: any[];
  dataType: keyof typeof EXPORT_TEMPLATES;
  title?: string;
  defaultConfig?: Partial<ExportConfig>;
}

export function ExportModal({
  isOpen,
  onClose,
  data,
  dataType,
  title = 'Veri Dışa Aktarma',
  defaultConfig = {},
}: ExportModalProps) {
  const isMobile = useIsMobile();
  const [config, setConfig] = useState<ExportConfig>(() => ({
    format: 'csv',
    filename: `${dataType}-export-${new Date().toISOString().slice(0, 10)}`,
    fields: EXPORT_TEMPLATES[dataType]?.fields || [],
    includeHeaders: true,
    customHeaders: EXPORT_TEMPLATES[dataType]?.headers || {},
    orientation: 'portrait',
    pageSize: 'A4',
    compression: false,
    ...defaultConfig,
  }));

  const [dateRange, setDateRange] = useState<{ start: Date | null; end: Date | null }>({
    start: null,
    end: null,
  });

  const [step, setStep] = useState<'config' | 'preview' | 'export' | 'complete'>('config');
  const [result, setResult] = useState<ExportResult | null>(null);

  const { isExporting, progress, exportData, cancelExport } = useDataExport({
    onProgress: (progress) => {
      // Progress is handled by the hook's internal state
    },
    onComplete: (result) => {
      setResult(result);
      setStep('complete');
    },
    onError: (error) => {
      setResult({
        success: false,
        filename: '',
        size: 0,
        recordCount: 0,
        error,
      });
      setStep('complete');
    },
  });

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setStep('config');
      setResult(null);
    }
  }, [isOpen]);

  // Available formats
  const formats = [
    {
      value: 'csv',
      label: 'CSV',
      icon: <Table className="w-4 h-4" />,
      description: 'Hesap tablolarında açılabilen format',
    },
    {
      value: 'excel',
      label: 'Excel',
      icon: <FileText className="w-4 h-4" />,
      description: 'Microsoft Excel formatı',
    },
    {
      value: 'pdf',
      label: 'PDF',
      icon: <File className="w-4 h-4" />,
      description: 'Yazdırma için PDF format',
    },
    {
      value: 'json',
      label: 'JSON',
      icon: <Settings className="w-4 h-4" />,
      description: 'Programatik kullanım için',
    },
  ];

  // Get available fields
  const availableFields =
    data.length > 0 ? Object.keys(data[0]).filter((key) => !key.startsWith('_')) : [];

  // Handle field selection
  const handleFieldToggle = (field: string, checked: boolean) => {
    setConfig((prev) => ({
      ...prev,
      fields: checked
        ? [...(prev.fields || []), field]
        : (prev.fields || []).filter((f) => f !== field),
    }));
  };

  // Handle date range
  const handleDateRangeChange = (start: Date | null, end: Date | null) => {
    setDateRange({ start, end });
    setConfig((prev) => ({
      ...prev,
      dateRange: start && end ? { start, end } : undefined,
    }));
  };

  // Start export
  const handleExport = async () => {
    setStep('export');
    await exportData(data, config);
  };

  // Render format selection
  const renderFormatSelection = () => (
    <div className="space-y-4">
      <Label className="text-base font-medium">Dışa aktarma formatı</Label>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {formats.map((format) => (
          <motion.div key={format.value} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <button
              type="button"
              onClick={() => {
                setConfig((prev) => ({ ...prev, format: format.value as any }));
              }}
              className={cn(
                'w-full p-4 rounded-lg border-2 transition-all duration-200 text-left',
                config.format === format.value
                  ? 'border-primary bg-primary/5 shadow-md'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50',
              )}
            >
              <div className="flex items-start gap-3">
                <div
                  className={cn(
                    'w-8 h-8 rounded-lg flex items-center justify-center',
                    config.format === format.value
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-gray-600',
                  )}
                >
                  {format.icon}
                </div>
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{format.label}</div>
                  <div className="text-sm text-gray-600 mt-1">{format.description}</div>
                </div>
                {config.format === format.value && <CheckCircle className="w-5 h-5 text-primary" />}
              </div>
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );

  // Render field selection
  const renderFieldSelection = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-base font-medium">Dahil edilecek alanlar</Label>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setConfig((prev) => ({ ...prev, fields: availableFields }));
            }}
          >
            Tümünü Seç
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setConfig((prev) => ({ ...prev, fields: [] }));
            }}
          >
            Hiçbirini Seçme
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-64 overflow-y-auto">
        {availableFields.map((field) => (
          <div key={field} className="flex items-center space-x-2 p-2 rounded hover:bg-gray-50">
            <Checkbox
              id={field}
              checked={config.fields?.includes(field)}
              onCheckedChange={(checked) => {
                handleFieldToggle(field, checked as boolean);
              }}
            />
            <label htmlFor={field} className="text-sm font-medium cursor-pointer flex-1">
              {config.customHeaders?.[field] || field}
            </label>
          </div>
        ))}
      </div>
    </div>
  );

  // Render options
  const renderOptions = () => (
    <div className="space-y-6">
      {/* Filename */}
      <div className="space-y-2">
        <Label htmlFor="filename">Dosya adı</Label>
        <Input
          id="filename"
          value={config.filename}
          onChange={(e) => {
            setConfig((prev) => ({ ...prev, filename: e.target.value }));
          }}
          placeholder="export-filename"
        />
      </div>

      {/* Date Range */}
      <div className="space-y-2">
        <Label>Tarih aralığı (isteğe bağlı)</Label>
        <div className="flex gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="flex-1 justify-start text-left">
                <Calendar className="w-4 h-4 mr-2" />
                {dateRange.start ? dateRange.start.toLocaleDateString('tr-TR') : 'Başlangıç'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <CalendarComponent
                mode="single"
                selected={dateRange.start || undefined}
                onSelect={(date) => {
                  handleDateRangeChange(date || null, dateRange.end);
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="flex-1 justify-start text-left">
                <Calendar className="w-4 h-4 mr-2" />
                {dateRange.end ? dateRange.end.toLocaleDateString('tr-TR') : 'Bitiş'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <CalendarComponent
                mode="single"
                selected={dateRange.end || undefined}
                onSelect={(date) => {
                  handleDateRangeChange(dateRange.start, date || null);
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* PDF Options */}
      {config.format === 'pdf' && (
        <div className="space-y-4">
          <Separator />
          <Label className="text-base font-medium">PDF Seçenekleri</Label>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Yönlendirme</Label>
              <Select
                value={config.orientation}
                onValueChange={(value) => {
                  setConfig((prev) => ({ ...prev, orientation: value as any }));
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="portrait">Dikey</SelectItem>
                  <SelectItem value="landscape">Yatay</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Sayfa Boyutu</Label>
              <Select
                value={config.pageSize}
                onValueChange={(value) => {
                  setConfig((prev) => ({ ...prev, pageSize: value as any }));
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="A4">A4</SelectItem>
                  <SelectItem value="A3">A3</SelectItem>
                  <SelectItem value="Letter">Letter</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      )}

      {/* Advanced Options */}
      <div className="space-y-4">
        <Separator />
        <Label className="text-base font-medium">Gelişmiş Seçenekler</Label>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label htmlFor="headers" className="text-sm">
              Başlık satırını dahil et
            </Label>
            <Switch
              id="headers"
              checked={config.includeHeaders}
              onCheckedChange={(checked) => {
                setConfig((prev) => ({ ...prev, includeHeaders: checked }));
              }}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="compression" className="text-sm">
              Sıkıştırma (büyük dosyalar için)
            </Label>
            <Switch
              id="compression"
              checked={config.compression}
              onCheckedChange={(checked) => {
                setConfig((prev) => ({ ...prev, compression: checked }));
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );

  // Render preview
  const renderPreview = () => {
    const filteredData = config.dateRange
      ? data.filter((item) => {
          const itemDate = new Date(item.date || item.createdAt || item.timestamp);
          return itemDate >= config.dateRange!.start && itemDate <= config.dateRange!.end;
        })
      : data;

    return (
      <div className="space-y-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-blue-800">
            <AlertCircle className="w-5 h-5" />
            <span className="font-medium">Dışa aktarma özeti</span>
          </div>
          <div className="mt-2 space-y-1 text-sm text-blue-700">
            <p>
              • Format: <strong>{config.format.toUpperCase()}</strong>
            </p>
            <p>
              • Kayıt sayısı: <strong>{filteredData.length}</strong>
            </p>
            <p>
              • Alan sayısı: <strong>{config.fields?.length || 0}</strong>
            </p>
            <p>
              • Dosya adı:{' '}
              <strong>
                {config.filename}.{config.format}
              </strong>
            </p>
            {config.dateRange && (
              <p>
                • Tarih aralığı:{' '}
                <strong>
                  {config.dateRange.start.toLocaleDateString('tr-TR')} -{' '}
                  {config.dateRange.end.toLocaleDateString('tr-TR')}
                </strong>
              </p>
            )}
          </div>
        </div>

        {/* Preview table */}
        <div className="border rounded-lg overflow-hidden">
          <div className="bg-gray-50 px-4 py-2 border-b">
            <span className="text-sm font-medium text-gray-700">Önizleme (ilk 5 kayıt)</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  {config.fields?.map((field) => (
                    <th
                      key={field}
                      className="px-3 py-2 text-left font-medium text-gray-700 border-r last:border-r-0"
                    >
                      {config.customHeaders?.[field] || field}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredData.slice(0, 5).map((item, index) => (
                  <tr key={index} className="border-t">
                    {config.fields?.map((field) => (
                      <td
                        key={field}
                        className="px-3 py-2 border-r last:border-r-0 truncate max-w-32"
                      >
                        {String(item[field] || '')}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  // Render export progress
  const renderExportProgress = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Dışa aktarılıyor...</h3>
        <p className="text-gray-600">Verileriniz hazırlanıyor, lütfen bekleyin.</p>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>İlerleme</span>
          <span>{progress}%</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      <Button variant="outline" onClick={cancelExport} className="w-full">
        İptal Et
      </Button>
    </div>
  );

  // Render completion
  const renderCompletion = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div
          className={cn(
            'w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4',
            result?.success ? 'bg-green-100' : 'bg-red-100',
          )}
        >
          {result?.success ? (
            <CheckCircle className="w-8 h-8 text-green-600" />
          ) : (
            <AlertCircle className="w-8 h-8 text-red-600" />
          )}
        </div>

        <h3 className="text-lg font-medium text-gray-900 mb-2">
          {result?.success ? 'Dışa aktarma tamamlandı!' : 'Dışa aktarma başarısız'}
        </h3>

        <p className="text-gray-600">{result?.message || result?.error}</p>
      </div>

      {result?.success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="space-y-2 text-sm text-green-800">
            <p>
              • <strong>{result.recordCount}</strong> kayıt dışa aktarıldı
            </p>
            <p>
              • Dosya boyutu: <strong>{(result.size / 1024).toFixed(1)} KB</strong>
            </p>
            <p>
              • Dosya adı: <strong>{result.filename}</strong>
            </p>
          </div>
        </div>
      )}

      <div className="flex gap-2">
        <Button onClick={onClose} className="flex-1">
          Kapat
        </Button>
        <Button
          variant="outline"
          onClick={() => {
            setStep('config');
          }}
          className="flex-1"
        >
          Yeni Dışa Aktarma
        </Button>
      </div>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className={cn(
          'max-w-4xl max-h-[90vh] overflow-y-auto',
          isMobile && 'mx-4 max-w-[calc(100vw-2rem)]',
        )}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="w-5 h-5" />
            {title}
          </DialogTitle>
          <DialogDescription>
            {data.length} kayıt için dışa aktarma seçeneklerini yapılandırın
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Step indicators */}
          {step !== 'export' && step !== 'complete' && (
            <div className="flex items-center justify-center space-x-4">
              {[
                { key: 'config', label: 'Yapılandırma' },
                { key: 'preview', label: 'Önizleme' },
              ].map((s, index) => (
                <div key={s.key} className="flex items-center">
                  <div
                    className={cn(
                      'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium',
                      step === s.key ? 'bg-primary text-white' : 'bg-gray-200 text-gray-600',
                    )}
                  >
                    {index + 1}
                  </div>
                  <span
                    className={cn(
                      'ml-2 text-sm',
                      step === s.key ? 'text-primary font-medium' : 'text-gray-600',
                    )}
                  >
                    {s.label}
                  </span>
                  {index < 1 && <div className="w-12 h-0.5 bg-gray-200 mx-4" />}
                </div>
              ))}
            </div>
          )}

          {/* Content */}
          <AnimatePresence mode="wait">
            {step === 'config' && (
              <motion.div
                key="config"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <Tabs defaultValue="format" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="format">Format</TabsTrigger>
                    <TabsTrigger value="fields">Alanlar</TabsTrigger>
                    <TabsTrigger value="options">Seçenekler</TabsTrigger>
                  </TabsList>

                  <TabsContent value="format" className="space-y-4 mt-6">
                    {renderFormatSelection()}
                  </TabsContent>

                  <TabsContent value="fields" className="space-y-4 mt-6">
                    {renderFieldSelection()}
                  </TabsContent>

                  <TabsContent value="options" className="space-y-4 mt-6">
                    {renderOptions()}
                  </TabsContent>
                </Tabs>

                <div className="flex justify-between pt-4 border-t">
                  <Button variant="outline" onClick={onClose}>
                    İptal
                  </Button>
                  <Button
                    onClick={() => {
                      setStep('preview');
                    }}
                    disabled={!config.fields?.length}
                  >
                    Önizleme
                  </Button>
                </div>
              </motion.div>
            )}

            {step === 'preview' && (
              <motion.div
                key="preview"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                {renderPreview()}

                <div className="flex justify-between pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setStep('config');
                    }}
                  >
                    Geri
                  </Button>
                  <Button onClick={handleExport}>
                    <Download className="w-4 h-4 mr-2" />
                    Dışa Aktar
                  </Button>
                </div>
              </motion.div>
            )}

            {step === 'export' && (
              <motion.div
                key="export"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
              >
                {renderExportProgress()}
              </motion.div>
            )}

            {step === 'complete' && (
              <motion.div
                key="complete"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
              >
                {renderCompletion()}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
}
