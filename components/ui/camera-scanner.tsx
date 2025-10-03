/**
 * @fileoverview Camera Scanner - Kamera ile belge tarama bileşeni
 * 
 * @author Dernek Yönetim Sistemi Team
 * @version 1.0.0
 */

import { Camera, X, RotateCcw, Check, AlertCircle } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { Button } from './button';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './dialog';
import { Label } from './label';
import { ocrService, type OCRResult } from '../../services/ocrService';
import { logger } from '../../lib/logging/logger';

interface CameraScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onScanComplete: (result: OCRResult) => void;
  title?: string;
}

export function CameraScanner({ 
  isOpen, 
  onClose, 
  onScanComplete, 
  title = "Belge Tarama" 
}: CameraScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cameraSupported, setCameraSupported] = useState(false);
  const [lastResult, setLastResult] = useState<OCRResult | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Kamera desteğini kontrol et
  useEffect(() => {
    const checkSupport = async () => {
      const supported = await ocrService.checkCameraSupport();
      setCameraSupported(supported);
    };
    checkSupport();
  }, []);

  // Kamera başlat
  const startCamera = useCallback(async () => {
    try {
      setError(null);
      setIsScanning(true);
      
      const video = await ocrService.startCamera({
        facingMode: 'environment',
        width: 1280,
        height: 720
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = video.srcObject;
        videoRef.current.play();
      }
      
      logger.info('Kamera başlatıldı');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Kamera başlatılamadı';
      setError(errorMessage);
      setIsScanning(false);
      toast.error(errorMessage);
      logger.error('Kamera başlatma hatası:', error);
    }
  }, []);

  // Kamera durdur
  const stopCamera = useCallback(() => {
    try {
      ocrService.stopCamera();
      setIsScanning(false);
      setError(null);
      logger.info('Kamera durduruldu');
    } catch (error) {
      logger.error('Kamera durdurma hatası:', error);
    }
  }, []);

  // Belge tara
  const scanDocument = useCallback(async () => {
    if (!isScanning) return;
    
    try {
      setIsProcessing(true);
      setError(null);
      
      const result = await ocrService.scanDocument();
      setLastResult(result);
      
      if (result.confidence && result.confidence > 0.3) {
        toast.success('Belge başarıyla okundu');
        logger.info('Belge tarama başarılı', { confidence: result.confidence });
      } else {
        toast.warning('Belge okunamadı, lütfen daha net gösterin');
        logger.warn('Düşük güven seviyesi', { confidence: result.confidence });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Belge okuma hatası';
      setError(errorMessage);
      toast.error(errorMessage);
      logger.error('Belge tarama hatası:', error);
    } finally {
      setIsProcessing(false);
    }
  }, [isScanning]);

  // Sonucu kabul et
  const acceptResult = useCallback(() => {
    if (lastResult) {
      onScanComplete(lastResult);
      stopCamera();
      onClose();
    }
  }, [lastResult, onScanComplete, stopCamera, onClose]);

  // Dialog kapatıldığında kamerayı durdur
  useEffect(() => {
    if (!isOpen) {
      stopCamera();
    }
  }, [isOpen, stopCamera]);

  // Component unmount olduğunda kamerayı durdur
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  if (!cameraSupported) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              Kamera Desteği Yok
            </DialogTitle>
          </DialogHeader>
          <div className="text-center py-6">
            <p className="text-gray-600 mb-4">
              Tarayıcınız kamera erişimini desteklemiyor veya güvenli bağlantı (HTTPS) gerekiyor.
            </p>
            <Button onClick={onClose} variant="outline">
              Kapat
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            {title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Kamera Görüntüsü */}
          <Card>
            <CardContent className="p-4">
              <div 
                ref={containerRef}
                className="relative bg-black rounded-lg overflow-hidden aspect-video"
              >
                {!isScanning ? (
                  <div className="flex items-center justify-center h-full text-white">
                    <div className="text-center">
                      <Camera className="h-16 w-16 mx-auto mb-4 opacity-50" />
                      <p className="text-lg mb-2">Kamera Hazır</p>
                      <p className="text-sm opacity-75">
                        Belgeyi kameraya gösterin ve tarayın
                      </p>
                    </div>
                  </div>
                ) : (
                  <video
                    ref={videoRef}
                    className="w-full h-full object-cover"
                    autoPlay
                    playsInline
                    muted
                  />
                )}

                {/* Tarama Çerçevesi */}
                {isScanning && (
                  <div className="absolute inset-4 border-2 border-blue-500 rounded-lg pointer-events-none">
                    <div className="absolute top-2 left-2 w-6 h-6 border-t-2 border-l-2 border-blue-500" />
                    <div className="absolute top-2 right-2 w-6 h-6 border-t-2 border-r-2 border-blue-500" />
                    <div className="absolute bottom-2 left-2 w-6 h-6 border-b-2 border-l-2 border-blue-500" />
                    <div className="absolute bottom-2 right-2 w-6 h-6 border-b-2 border-r-2 border-blue-500" />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Hata Mesajı */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center gap-2 text-red-700">
                <AlertCircle className="h-4 w-4" />
                <span className="font-medium">Hata:</span>
                <span>{error}</span>
              </div>
            </div>
          )}

          {/* Kontrol Butonları */}
          <div className="flex justify-center gap-4">
            {!isScanning ? (
              <Button onClick={startCamera} className="flex items-center gap-2">
                <Camera className="h-4 w-4" />
                Kamerayı Başlat
              </Button>
            ) : (
              <>
                <Button 
                  onClick={scanDocument} 
                  disabled={isProcessing}
                  className="flex items-center gap-2"
                >
                  {isProcessing ? (
                    <>
                      <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      İşleniyor...
                    </>
                  ) : (
                    <>
                      <Camera className="h-4 w-4" />
                      Belgeyi Tara
                    </>
                  )}
                </Button>
                
                <Button onClick={stopCamera} variant="outline" className="flex items-center gap-2">
                  <X className="h-4 w-4" />
                  Durdur
                </Button>
              </>
            )}
          </div>

          {/* Sonuç Önizleme */}
          {lastResult && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Okunan Bilgiler</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {lastResult.fullName && (
                    <div>
                      <Label className="text-sm font-medium">Ad Soyad</Label>
                      <p className="text-sm text-gray-600">{lastResult.fullName}</p>
                    </div>
                  )}
                  
                  {lastResult.identityNumber && (
                    <div>
                      <Label className="text-sm font-medium">
                        {lastResult.documentType === 'passport' ? 'Pasaport No' : 'Kimlik No'}
                      </Label>
                      <p className="text-sm text-gray-600">{lastResult.identityNumber}</p>
                    </div>
                  )}
                  
                  {lastResult.nationality && (
                    <div>
                      <Label className="text-sm font-medium">Uyruk</Label>
                      <p className="text-sm text-gray-600">{lastResult.nationality}</p>
                    </div>
                  )}
                  
                  {lastResult.birthDate && (
                    <div>
                      <Label className="text-sm font-medium">Doğum Tarihi</Label>
                      <p className="text-sm text-gray-600">{lastResult.birthDate}</p>
                    </div>
                  )}
                  
                  {lastResult.gender && (
                    <div>
                      <Label className="text-sm font-medium">Cinsiyet</Label>
                      <p className="text-sm text-gray-600">
                        {lastResult.gender === 'male' ? 'Erkek' : 
                         lastResult.gender === 'female' ? 'Kadın' : 'Diğer'}
                      </p>
                    </div>
                  )}
                  
                  {lastResult.confidence && (
                    <div>
                      <Label className="text-sm font-medium">Güven Seviyesi</Label>
                      <p className="text-sm text-gray-600">
                        {Math.round(lastResult.confidence * 100)}%
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button onClick={scanDocument} variant="outline" size="sm">
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Tekrar Tara
                  </Button>
                  <Button onClick={acceptResult} size="sm">
                    <Check className="h-4 w-4 mr-2" />
                    Kabul Et
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
