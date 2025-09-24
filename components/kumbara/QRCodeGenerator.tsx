// 🔳 QR CODE GENERATOR COMPONENT
// Professional QR code generation and display component

import { Copy, Download, Palette, Printer, RefreshCw, Settings } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import type {
  QRCodeGenerationResult,
  QRCodeOptions,
  QRCodePrintOptions,
} from '../../services/qrCodeService';
import qrCodeService from '../../services/qrCodeService';
import type { Kumbara } from '../../types/kumbara';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Slider } from '../ui/slider';
import { Switch } from '../ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';

interface QRCodeGeneratorProps {
  kumbara: Kumbara;
  onClose?: () => void;
  className?: string;
}

interface QRCustomization {
  size: number;
  errorCorrection: 'L' | 'M' | 'Q' | 'H';
  colors: {
    foreground: string;
    background: string;
  };
  margin: number;
  includeLogo: boolean;
  includeText: boolean;
}

export function QRCodeGenerator({ kumbara, onClose, className = '' }: QRCodeGeneratorProps) {
  const [qrResult, setQrResult] = useState<QRCodeGenerationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [isPrintDialogOpen, setIsPrintDialogOpen] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [customization, setCustomization] = useState<QRCustomization>({
    size: 256,
    errorCorrection: 'M',
    colors: {
      foreground: '#1e40af',
      background: '#ffffff',
    },
    margin: 2,
    includeLogo: false,
    includeText: true,
  });

  const [printOptions, setPrintOptions] = useState<QRCodePrintOptions>({
    format: 'thermal',
    size: { width: 40, height: 30, unit: 'mm' },
    includeText: true,
    includeLogo: false,
    copies: 1,
  });

  // Generate QR code
  const generateQRCode = useCallback(async () => {
    try {
      setLoading(true);

      const qrData = qrCodeService.generateKumbaraQRData(kumbara);

      const options: Partial<QRCodeOptions> = {
        size: customization.size,
        errorCorrectionLevel: customization.errorCorrection,
        color: {
          dark: customization.colors.foreground,
          light: customization.colors.background,
        },
        margin: customization.margin,
      };

      const result = await qrCodeService.generateQRCode(qrData, options);
      setQrResult(result);

      // Also update canvas if available
      if (canvasRef.current) {
        await qrCodeService.generateCanvas(canvasRef.current, qrData, options);
      }
    } catch (error) {
      toast.error('QR kod oluşturulamadı');
      console.error('QR generation error:', error);
    } finally {
      setLoading(false);
    }
  }, [kumbara, customization]);

  // Generate QR code on mount and when customization changes
  useEffect(() => {
    generateQRCode();
  }, [generateQRCode]);

  // Handle download
  const handleDownload = async (format: 'png' | 'svg' | 'pdf' = 'png') => {
    if (!qrResult) return;

    try {
      const qrData = qrCodeService.generateKumbaraQRData(kumbara);
      const filename = `qr-${kumbara.code}-${Date.now()}`;

      await qrCodeService.downloadQRCode(qrData, filename, format, {
        size: customization.size,
        errorCorrectionLevel: customization.errorCorrection,
        color: {
          dark: customization.colors.foreground,
          light: customization.colors.background,
        },
        margin: customization.margin,
      });

      toast.success(`QR kod ${format.toUpperCase()} formatında indirildi`);
    } catch (error) {
      toast.error('QR kod indirilemedi');
    }
  };

  // Handle print
  const handlePrint = async () => {
    try {
      await qrCodeService.printQRCode(kumbara, printOptions);
      toast.success('QR kod yazdırma işlemi başlatıldı');
      setIsPrintDialogOpen(false);
    } catch (error) {
      toast.error('QR kod yazdırılamadı');
    }
  };

  // Handle copy to clipboard
  const handleCopyToClipboard = async () => {
    if (!qrResult) return;

    try {
      const qrData = qrCodeService.generateKumbaraQRData(kumbara);
      await navigator.clipboard.writeText(JSON.stringify(qrData, null, 2));
      toast.success('QR kod verileri panoya kopyalandı');
    } catch (error) {
      toast.error('Panoya kopyalanamadı');
    }
  };

  // Update customization
  const updateCustomization = (key: keyof QRCustomization, value: any) => {
    setCustomization((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">QR Kod Üretici</h2>
          <p className="text-slate-600">
            <strong>{kumbara.name}</strong> için QR kod oluşturun ve özelleştirin
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => {
            setIsCustomizing(!isCustomizing);
          }}
          className="flex items-center gap-2"
        >
          {isCustomizing ? <Settings className="w-4 h-4" /> : <Palette className="w-4 h-4" />}
          {isCustomizing ? 'Ayarları Gizle' : 'Özelleştir'}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* QR Code Display */}
        <Card className="border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <div className="w-4 h-4 bg-white rounded-sm"></div>
              </div>
              QR Kod Önizleme
            </CardTitle>
            <CardDescription>Oluşturulan QR kodu görüntüleyin ve indirin</CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* QR Code Display */}
            <div className="flex flex-col items-center space-y-4">
              {loading ? (
                <div className="w-64 h-64 bg-slate-100 rounded-xl flex items-center justify-center">
                  <RefreshCw className="w-8 h-8 animate-spin text-slate-400" />
                </div>
              ) : qrResult ? (
                <div className="relative">
                  <img
                    src={qrResult.dataURL}
                    alt={`QR Kod - ${kumbara.code}`}
                    className="w-64 h-64 rounded-xl shadow-lg"
                  />
                  <canvas
                    ref={canvasRef}
                    className="hidden"
                    width={customization.size}
                    height={customization.size}
                  />
                </div>
              ) : (
                <div className="w-64 h-64 bg-slate-100 rounded-xl flex items-center justify-center">
                  <span className="text-slate-500">QR kod oluşturuluyor...</span>
                </div>
              )}

              {/* QR Code Info */}
              {qrResult && (
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-100 w-full">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="font-medium text-blue-800">Kumbara Kodu:</span>
                      <span className="font-mono text-blue-600">{kumbara.code}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-blue-800">Boyut:</span>
                      <span className="text-blue-600">
                        {qrResult.size}x{qrResult.size}px
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-blue-800">Oluşturulma:</span>
                      <span className="text-blue-600">
                        {new Date(qrResult.timestamp).toLocaleString('tr-TR')}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={() => handleDownload('png')}
                disabled={!qrResult}
                className="flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                PNG İndir
              </Button>

              <Button
                variant="outline"
                onClick={() => handleDownload('svg')}
                disabled={!qrResult}
                className="flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                SVG İndir
              </Button>

              <Button
                variant="outline"
                onClick={() => {
                  setIsPrintDialogOpen(true);
                }}
                disabled={!qrResult}
                className="flex items-center gap-2"
              >
                <Printer className="w-4 h-4" />
                Yazdır
              </Button>

              <Button
                variant="outline"
                onClick={handleCopyToClipboard}
                disabled={!qrResult}
                className="flex items-center gap-2"
              >
                <Copy className="w-4 h-4" />
                Kopyala
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Customization Panel */}
        {isCustomizing && (
          <Card className="border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="w-5 h-5" />
                QR Kod Özelleştirme
              </CardTitle>
              <CardDescription>QR kodunuzu ihtiyaçlarınıza göre özelleştirin</CardDescription>
            </CardHeader>

            <CardContent>
              <Tabs defaultValue="appearance" className="space-y-4">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="appearance">Görünüm</TabsTrigger>
                  <TabsTrigger value="advanced">Gelişmiş</TabsTrigger>
                </TabsList>

                <TabsContent value="appearance" className="space-y-6">
                  {/* Size */}
                  <div className="space-y-3">
                    <Label>Boyut: {customization.size}px</Label>
                    <Slider
                      value={[customization.size]}
                      onValueChange={(value) => {
                        updateCustomization('size', value[0]);
                      }}
                      min={128}
                      max={512}
                      step={32}
                      className="w-full"
                    />
                  </div>

                  {/* Colors */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="foreground-color">Ön Plan Rengi</Label>
                      <div className="flex gap-2">
                        <Input
                          id="foreground-color"
                          type="color"
                          value={customization.colors.foreground}
                          onChange={(e) => {
                            updateCustomization('colors', {
                              ...customization.colors,
                              foreground: e.target.value,
                            });
                          }}
                          className="w-12 h-10 p-1 border rounded"
                        />
                        <Input
                          value={customization.colors.foreground}
                          onChange={(e) => {
                            updateCustomization('colors', {
                              ...customization.colors,
                              foreground: e.target.value,
                            });
                          }}
                          className="flex-1"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="background-color">Arka Plan Rengi</Label>
                      <div className="flex gap-2">
                        <Input
                          id="background-color"
                          type="color"
                          value={customization.colors.background}
                          onChange={(e) => {
                            updateCustomization('colors', {
                              ...customization.colors,
                              background: e.target.value,
                            });
                          }}
                          className="w-12 h-10 p-1 border rounded"
                        />
                        <Input
                          value={customization.colors.background}
                          onChange={(e) => {
                            updateCustomization('colors', {
                              ...customization.colors,
                              background: e.target.value,
                            });
                          }}
                          className="flex-1"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Margin */}
                  <div className="space-y-3">
                    <Label>Kenar Boşluğu: {customization.margin}</Label>
                    <Slider
                      value={[customization.margin]}
                      onValueChange={(value) => {
                        updateCustomization('margin', value[0]);
                      }}
                      min={0}
                      max={8}
                      step={1}
                      className="w-full"
                    />
                  </div>
                </TabsContent>

                <TabsContent value="advanced" className="space-y-6">
                  {/* Error Correction */}
                  <div className="space-y-2">
                    <Label>Hata Düzeltme Seviyesi</Label>
                    <Select
                      value={customization.errorCorrection}
                      onValueChange={(value: 'L' | 'M' | 'Q' | 'H') => {
                        updateCustomization('errorCorrection', value);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="L">Düşük (~7%)</SelectItem>
                        <SelectItem value="M">Orta (~15%)</SelectItem>
                        <SelectItem value="Q">Yüksek (~25%)</SelectItem>
                        <SelectItem value="H">Çok Yüksek (~30%)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Options */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="include-logo">Logo Ekle</Label>
                      <Switch
                        id="include-logo"
                        checked={customization.includeLogo}
                        onCheckedChange={(checked) => {
                          updateCustomization('includeLogo', checked);
                        }}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="include-text">Metin Bilgisi Ekle</Label>
                      <Switch
                        id="include-text"
                        checked={customization.includeText}
                        onCheckedChange={(checked) => {
                          updateCustomization('includeText', checked);
                        }}
                      />
                    </div>
                  </div>

                  {/* Reset Button */}
                  <Button
                    variant="outline"
                    onClick={() => {
                      setCustomization({
                        size: 256,
                        errorCorrection: 'M',
                        colors: {
                          foreground: '#1e40af',
                          background: '#ffffff',
                        },
                        margin: 2,
                        includeLogo: false,
                        includeText: true,
                      });
                    }}
                    className="w-full"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Varsayılana Sıfırla
                  </Button>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Print Dialog */}
      <Dialog open={isPrintDialogOpen} onOpenChange={setIsPrintDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Printer className="w-5 h-5" />
              Yazdırma Ayarları
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Yazdırma Formatı</Label>
              <Select
                value={printOptions.format}
                onValueChange={(value: any) => {
                  setPrintOptions((prev) => ({ ...prev, format: value }));
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="thermal">Termal (40x30mm)</SelectItem>
                  <SelectItem value="label">Etiket (50x25mm)</SelectItem>
                  <SelectItem value="sticker">Stiker (35x35mm)</SelectItem>
                  <SelectItem value="a4">A4 Kağıt</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Kopya Sayısı</Label>
              <Input
                type="number"
                min="1"
                max="10"
                value={printOptions.copies}
                onChange={(e) => {
                  setPrintOptions((prev) => ({
                    ...prev,
                    copies: parseInt(e.target.value) || 1,
                  }));
                }}
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Metin Bilgisi</Label>
                <Switch
                  checked={printOptions.includeText}
                  onCheckedChange={(checked) => {
                    setPrintOptions((prev) => ({
                      ...prev,
                      includeText: checked,
                    }));
                  }}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label>Logo</Label>
                <Switch
                  checked={printOptions.includeLogo}
                  onCheckedChange={(checked) => {
                    setPrintOptions((prev) => ({
                      ...prev,
                      includeLogo: checked,
                    }));
                  }}
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setIsPrintDialogOpen(false);
                }}
                className="flex-1"
              >
                İptal
              </Button>
              <Button onClick={handlePrint} className="flex-1">
                <Printer className="w-4 h-4 mr-2" />
                Yazdır
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default QRCodeGenerator;
