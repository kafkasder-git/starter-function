// 📷 QR CODE SCANNER COMPONENT
// Professional QR code scanning component with camera and file support

import { AlertCircle, Camera, CheckCircle, RotateCcw, Settings, Upload, X } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import type { CameraDevice, QRScanResult } from '../../services/qrScannerService';
import qrScannerService from '../../services/qrScannerService';
import type { KumbaraQRData } from '../../types/kumbara';
import { Alert, AlertDescription } from '../ui/alert';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';

interface QRCodeScannerProps {
  onScanSuccess: (result: QRScanResult, kumbaraData?: KumbaraQRData) => void;
  onScanError?: (error: string) => void;
  onClose?: () => void;
  className?: string;
}

interface ScannerState {
  isScanning: boolean;
  hasPermissions: boolean;
  availableCameras: CameraDevice[];
  selectedCamera: string | null;
  scanMode: 'camera' | 'file';
  lastScanResult: QRScanResult | null;
}

export function QRCodeScanner({
  onScanSuccess,
  onScanError,
  onClose,
  className = '',
}: QRCodeScannerProps) {
  const [state, setState] = useState<ScannerState>({
    isScanning: false,
    hasPermissions: false,
    availableCameras: [],
    selectedCamera: null,
    scanMode: 'camera',
    lastScanResult: null,
  });

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const scannerElementRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize scanner
  const initializeScanner = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Check permissions
      const hasPermissions = await qrScannerService.checkCameraPermissions();
      if (!hasPermissions) {
        const granted = await qrScannerService.requestCameraPermissions();
        if (!granted) {
          setError('Kamera izni gerekli');
          return;
        }
      }

      // Get available cameras
      const cameras = await qrScannerService.getAvailableCameras();

      setState((prev) => ({
        ...prev,
        hasPermissions: true,
        availableCameras: cameras,
        selectedCamera: cameras[0]?.id || null,
      }));
    } catch (error) {
      console.error('Scanner initialization failed:', error);
      setError('QR tarayıcı başlatılamadı');
      if (onScanError) {
        onScanError('QR tarayıcı başlatılamadı');
      }
    } finally {
      setLoading(false);
    }
  }, [onScanError]);

  // Start camera scanning
  const startCameraScanning = useCallback(async () => {
    if (!scannerElementRef.current || !state.selectedCamera) return;

    try {
      setLoading(true);
      setError(null);

      const scannerControl = await qrScannerService.startCameraScanning(
        scannerElementRef.current.id,
        state.selectedCamera,
      );

      scannerControl.onSuccess((result: QRScanResult) => {
        setState((prev) => ({ ...prev, lastScanResult: result }));

        // Validate if it's a kumbara QR code
        const validation = qrScannerService.validateKumbaraQR(result);

        if (validation.isValid && validation.kumbaraData) {
          onScanSuccess(result, validation.kumbaraData);
          toast.success('Kumbara QR kodu başarıyla okundu!');
        } else {
          onScanSuccess(result);
          toast.info('QR kod okundu (Kumbara QR kodu değil)');
        }
      });

      scannerControl.onError((error: string) => {
        if (!error.includes('No QR code found')) {
          setError(error);
          if (onScanError) {
            onScanError(error);
          }
        }
      });

      setState((prev) => ({ ...prev, isScanning: true }));
    } catch (error) {
      console.error('Camera scanning failed:', error);
      setError('Kamera tarama başlatılamadı');
      if (onScanError) {
        onScanError('Kamera tarama başlatılamadı');
      }
    } finally {
      setLoading(false);
    }
  }, [state.selectedCamera, onScanSuccess, onScanError]);

  // Stop scanning
  const stopScanning = useCallback(async () => {
    try {
      await qrScannerService.stopScanning();
      setState((prev) => ({ ...prev, isScanning: false }));
    } catch (error) {
      console.error('Failed to stop scanning:', error);
    }
  }, []);

  // Handle file upload
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setLoading(true);
      setError(null);

      const result = await qrScannerService.scanFromFile(file);
      setState((prev) => ({ ...prev, lastScanResult: result }));

      if (result.success) {
        // Validate if it's a kumbara QR code
        const validation = qrScannerService.validateKumbaraQR(result);

        if (validation.isValid && validation.kumbaraData) {
          onScanSuccess(result, validation.kumbaraData);
          toast.success('Dosyadan kumbara QR kodu başarıyla okundu!');
        } else {
          onScanSuccess(result);
          toast.info('QR kod okundu (Kumbara QR kodu değil)');
        }
      } else {
        setError(result.error || 'QR kod okunamadı');
        if (onScanError) {
          onScanError(result.error || 'QR kod okunamadı');
        }
      }
    } catch (error) {
      console.error('File upload failed:', error);
      setError('Dosya yüklenemedi');
      if (onScanError) {
        onScanError('Dosya yüklenemedi');
      }
    } finally {
      setLoading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Switch camera
  const switchCamera = async (cameraId: string) => {
    try {
      await qrScannerService.switchCamera(cameraId);
      setState((prev) => ({ ...prev, selectedCamera: cameraId }));
      toast.success('Kamera değiştirildi');
    } catch (error) {
      toast.error('Kamera değiştirilemedi');
    }
  };

  // Initialize on mount
  useEffect(() => {
    initializeScanner();

    return () => {
      qrScannerService.cleanup();
    };
  }, [initializeScanner]);

  // Auto-start camera scanning when ready
  useEffect(() => {
    if (
      state.hasPermissions &&
      state.selectedCamera &&
      state.scanMode === 'camera' &&
      !state.isScanning
    ) {
      startCameraScanning();
    }
  }, [
    state.hasPermissions,
    state.selectedCamera,
    state.scanMode,
    state.isScanning,
    startCameraScanning,
  ]);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">QR Kod Tarayıcı</h2>
          <p className="text-slate-600">Kumbara QR kodlarını okuyun ve doğrulayın</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setIsSettingsOpen(true);
            }}
          >
            <Settings className="w-4 h-4" />
          </Button>
          {onClose && (
            <Button variant="outline" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="w-4 h-4" />
          <AlertDescription className="text-red-800">
            {error}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setError(null);
              }}
              className="ml-2 text-red-600 hover:bg-red-100"
            >
              ✕
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Scan Mode Tabs */}
      <Tabs
        value={state.scanMode}
        onValueChange={(value: any) => {
          setState((prev) => ({ ...prev, scanMode: value }));
        }}
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="camera" className="flex items-center gap-2">
            <Camera className="w-4 h-4" />
            Kamera
          </TabsTrigger>
          <TabsTrigger value="file" className="flex items-center gap-2">
            <Upload className="w-4 h-4" />
            Dosya
          </TabsTrigger>
        </TabsList>

        <TabsContent value="camera" className="space-y-4">
          <Card className="border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="w-5 h-5" />
                Kamera ile Tarama
              </CardTitle>
              <CardDescription>Kameranızı kumbara QR koduna doğrultun</CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Camera Selection */}
              {state.availableCameras.length > 1 && (
                <div className="space-y-2">
                  <Label>Kamera Seçimi</Label>
                  <Select value={state.selectedCamera || ''} onValueChange={switchCamera}>
                    <SelectTrigger>
                      <SelectValue placeholder="Kamera seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      {state.availableCameras.map((camera) => (
                        <SelectItem key={camera.id} value={camera.id}>
                          {camera.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Scanner Container */}
              <div className="relative">
                <div
                  id="qr-scanner-container"
                  ref={scannerElementRef}
                  className="w-full h-80 bg-slate-100 rounded-xl overflow-hidden border-2 border-dashed border-slate-300"
                >
                  {!state.isScanning && (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <Camera className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                        <p className="text-slate-600 mb-4">Kamera tarama başlatılıyor...</p>
                        {!state.hasPermissions && (
                          <Button onClick={initializeScanner} size="sm">
                            Kamera İzni Ver
                          </Button>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Scanning Overlay */}
                {state.isScanning && (
                  <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-4 left-4 right-4 bg-black/70 text-white p-3 rounded-lg">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                        <span className="text-sm font-medium">QR kod aranıyor...</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Scanner Controls */}
              <div className="flex gap-3">
                {state.isScanning ? (
                  <Button onClick={stopScanning} variant="outline" className="flex-1">
                    <X className="w-4 h-4 mr-2" />
                    Taramayı Durdur
                  </Button>
                ) : (
                  <Button
                    onClick={startCameraScanning}
                    disabled={!state.hasPermissions || !state.selectedCamera}
                    className="flex-1"
                  >
                    <Camera className="w-4 h-4 mr-2" />
                    Taramayı Başlat
                  </Button>
                )}

                <Button variant="outline" onClick={initializeScanner} disabled={loading}>
                  <RotateCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="file" className="space-y-4">
          <Card className="border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="w-5 h-5" />
                Dosyadan Tarama
              </CardTitle>
              <CardDescription>QR kod içeren bir resim dosyası seçin</CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* File Upload Area */}
              <div
                className="w-full h-40 border-2 border-dashed border-slate-300 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                    <p className="text-slate-600 font-medium">Resim dosyası seçin</p>
                    <p className="text-slate-500 text-sm">PNG, JPG, WEBP desteklenir</p>
                  </div>
                </div>
              </div>

              <Input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />

              {/* Manual File Button */}
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="w-full"
                disabled={loading}
              >
                <Upload className="w-4 h-4 mr-2" />
                Dosya Seç
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Last Scan Result */}
      {state.lastScanResult && (
        <Card className="border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {state.lastScanResult.success ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-600" />
              )}
              Son Tarama Sonucu
            </CardTitle>
          </CardHeader>

          <CardContent>
            {state.lastScanResult.success ? (
              <div className="space-y-3">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="text-sm space-y-2">
                    <div className="flex justify-between">
                      <span className="font-medium text-green-800">Durum:</span>
                      <span className="text-green-600">Başarılı</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-green-800">Format:</span>
                      <span className="text-green-600">{state.lastScanResult.format}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-green-800">Zaman:</span>
                      <span className="text-green-600">
                        {new Date(state.lastScanResult.timestamp).toLocaleString('tr-TR')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* QR Data Preview */}
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                  <Label className="text-sm font-medium text-slate-700 mb-2 block">
                    QR Kod Verisi:
                  </Label>
                  <pre className="text-xs text-slate-600 bg-white p-3 rounded border overflow-auto max-h-32">
                    {state.lastScanResult.parsedData
                      ? JSON.stringify(state.lastScanResult.parsedData, null, 2)
                      : state.lastScanResult.data}
                  </pre>
                </div>

                {/* Validation Result */}
                {state.lastScanResult.parsedData?.type === 'kumbara' && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="w-4 h-4 text-blue-600" />
                      <span className="font-medium text-blue-800">Geçerli Kumbara QR Kodu</span>
                    </div>
                    <div className="text-sm text-blue-700 space-y-1">
                      <div>
                        Kumbara Kodu: <strong>{state.lastScanResult.parsedData.code}</strong>
                      </div>
                      <div>
                        İsim: <strong>{state.lastScanResult.parsedData.name}</strong>
                      </div>
                      <div>
                        Lokasyon: <strong>{state.lastScanResult.parsedData.location}</strong>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="w-4 h-4 text-red-600" />
                  <span className="font-medium text-red-800">Tarama Başarısız</span>
                </div>
                <p className="text-sm text-red-700">
                  {state.lastScanResult.error || 'QR kod okunamadı'}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Settings Dialog */}
      <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Tarayıcı Ayarları
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Kamera</Label>
              <Select
                value={state.selectedCamera || ''}
                onValueChange={(value) => {
                  setState((prev) => ({ ...prev, selectedCamera: value }));
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Kamera seçin" />
                </SelectTrigger>
                <SelectContent>
                  {state.availableCameras.map((camera) => (
                    <SelectItem key={camera.id} value={camera.id}>
                      {camera.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Tarama Modu</Label>
              <Select
                value={state.scanMode}
                onValueChange={(value: any) => {
                  setState((prev) => ({ ...prev, scanMode: value }));
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="camera">Kamera</SelectItem>
                  <SelectItem value="file">Dosya</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Scanner Status */}
            <div className="bg-slate-50 rounded-lg p-4 space-y-2">
              <div className="text-sm font-medium text-slate-700">Durum Bilgisi:</div>
              <div className="space-y-1 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>Tarama Durumu:</span>
                  <span className={state.isScanning ? 'text-green-600' : 'text-slate-500'}>
                    {state.isScanning ? 'Aktif' : 'Pasif'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Kamera İzni:</span>
                  <span className={state.hasPermissions ? 'text-green-600' : 'text-red-600'}>
                    {state.hasPermissions ? 'Verildi' : 'Verilmedi'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Kamera Sayısı:</span>
                  <span>{state.availableCameras.length}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setIsSettingsOpen(false);
                }}
                className="flex-1"
              >
                Kapat
              </Button>
              <Button onClick={initializeScanner} disabled={loading} className="flex-1">
                <RotateCcw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Yenile
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default QRCodeScanner;
