import { useState, useRef, useCallback, useEffect } from 'react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import {
  Camera,
  X,
  RotateCw,
  CheckCircle,
  AlertTriangle,
  FileText,
  Scan,
  Upload,
  Loader2,
} from 'lucide-react';
import { cn } from './ui/utils';
import { toast } from 'sonner';

interface OCRScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onResult: (data: OCRResult) => void;
  documentType?: 'id' | 'passport';
  className?: string;
}

interface OCRResult {
  name?: string;
  surname?: string;
  idNumber?: string;
  birthDate?: string;
  birthPlace?: string;
  nationality?: string;
  documentNumber?: string;
  documentType: 'id' | 'passport';
  confidence: number;
  rawText?: string;
}

// Real OCR Service using Tesseract.js
const processOCR = async (
  imageData: string,
  documentType: 'id' | 'passport',
): Promise<OCRResult> => {
  let worker: any = null;

  try {
    // Import Tesseract.js with correct default export handling
    let Tesseract;
    try {
      const tesseractModule = await import('tesseract.js');
      // Handle both default and named exports
      Tesseract = tesseractModule.default || tesseractModule;
    } catch (importError) {
      console.error('Tesseract.js import failed:', importError);
      throw new Error('OCR kütüphanesi yüklenemedi. İnternet bağlantınızı kontrol edin.');
    }

    // Create worker instance using correct API
    try {
      worker = await Tesseract.createWorker('tur+eng', 1);
    } catch (workerError) {
      console.error('Worker creation failed:', workerError);
      // Fallback to basic worker creation
      try {
        worker = await Tesseract.createWorker();

        // Load and initialize languages manually
        await worker.loadLanguage('tur+eng');
        await worker.initialize('tur+eng');
      } catch (fallbackError) {
        console.error('Fallback worker creation failed:', fallbackError);
        throw new Error('OCR işlemcisi oluşturulamadı.');
      }
    }

    try {
      // Set OCR parameters for better document recognition
      console.log('Configuring OCR parameters...');
      await worker.setParameters({
        tessedit_pageseg_mode: '1', // Automatic page segmentation with OSD
        tessedit_char_whitelist:
          'ABCÇDEFGĞHIİJKLMNOÖPRSŞTUÜVYZabcçdefgğhıijklmnoöprsştuüvyz0123456789./-: ()',
        preserve_interword_spaces: '1',
        tessedit_ocr_engine_mode: '1', // Use LSTM OCR engine
      });

      // Perform OCR recognition
      const result = await worker.recognize(imageData);

      const text = result.data.text;
      const confidence = result.data.confidence;

      // Parse extracted text based on document type
      const parsedData = parseDocumentText(text, documentType);

      return {
        ...parsedData,
        confidence: confidence / 100,
        rawText: text,
        documentType,
      };
    } catch (ocrError) {
      console.error('OCR processing failed:', ocrError);

      if (ocrError instanceof Error) {
        if (ocrError.message.includes('language') || ocrError.message.includes('Loading')) {
          throw new Error('Dil paketi yüklenemedi. İnternet bağlantınızı kontrol edin.');
        } else if (
          ocrError.message.includes('recognize') ||
          ocrError.message.includes('recognition')
        ) {
          throw new Error('Metin tanıma başarısız. Daha net bir görüntü deneyin.');
        } else if (ocrError.message.includes('network') || ocrError.message.includes('fetch')) {
          throw new Error('İnternet bağlantısı sorunu. Lütfen bağlantınızı kontrol edin.');
        }
      }

      throw new Error('OCR işlemi başarısız oldu. Görüntü kalitesini artırın.');
    }
  } catch (error) {
    console.error('OCR processing error:', error);

    // Re-throw known errors
    if (
      error instanceof Error &&
      (error.message.includes('OCR') ||
        error.message.includes('Dil paketi') ||
        error.message.includes('Metin tanıma') ||
        error.message.includes('İnternet'))
    ) {
      throw error;
    }

    // Generic error for unknown issues
    throw new Error('Belge işlenirken hata oluştu. Lütfen tekrar deneyin.');
  } finally {
    // Always terminate worker to free memory
    if (worker) {
      try {
        await worker.terminate();
      } catch (terminateError) {
        console.warn('Worker termination warning:', terminateError);
      }
    }
  }
};

// Enhanced helper function to parse document text with better accuracy
const parseDocumentText = (text: string, documentType: 'id' | 'passport') => {
  // Clean and normalize text - preserve Turkish characters and common patterns
  const cleanText = text
    .toUpperCase()
    .replace(/[^A-ZÇĞİÖŞÜ0-9\s\.\-\/\(\)]/g, ' ') // Keep more characters for better parsing
    .replace(/\s+/g, ' ')
    .trim();

  if (documentType === 'id') {
    // Enhanced Turkish ID card parsing patterns

    // Look for TC Kimlik pattern and extract information around it
    const tcPattern = /T\.?C\.?\s*(KİMLİK|KIMLIK)?\s*KARTI?/i;
    const hasTcIndicator = tcPattern.test(cleanText);

    // Extract ID number (11 digits)
    const idMatch = /(\d{11})/.exec(cleanText);

    // Extract names - look for consecutive capitalized Turkish words
    const namePatterns = [
      /([A-ZÇĞİÖŞÜ]{2,})\s+([A-ZÇĞİÖŞÜ]{2,})/g,
      /ADI?\s*:?\s*([A-ZÇĞİÖŞÜ]+)/i,
      /SOYADI?\s*:?\s*([A-ZÇĞİÖŞÜ]+)/i,
    ];

    let name = '';
    let surname = '';

    // Try to extract names using different patterns
    for (const pattern of namePatterns) {
      const matches = [...cleanText.matchAll(pattern)];
      if (matches.length > 0) {
        const match = matches[0];
        if (match[1] && match[2]) {
          name = match[1];
          surname = match[2];
          break;
        } else if (match[1]) {
          if (!name) name = match[1];
          else if (!surname) surname = match[1];
        }
      }
    }

    // Extract birth date (DD.MM.YYYY or DD/MM/YYYY or DD-MM-YYYY)
    const dateMatch = /(\d{1,2})[\.\-\/](\d{1,2})[\.\-\/](\d{4})/.exec(cleanText);

    // Extract birth place
    const birthPlace = extractBirthPlace(cleanText);

    return {
      name: name || '',
      surname: surname || '',
      idNumber: idMatch?.[1] || '',
      birthDate: dateMatch
        ? `${dateMatch[1].padStart(2, '0')}.${dateMatch[2].padStart(2, '0')}.${dateMatch[3]}`
        : '',
      birthPlace: birthPlace,
      nationality: 'T.C.',
    };
  } else {
    // Enhanced passport parsing patterns

    // Look for passport indicators
    const passportPattern = /(PASSPORT|PASAPORT|REPUBLIC|TÜRKİYE)/i;
    const hasPassportIndicator = passportPattern.test(cleanText);

    // Extract document number (letter followed by 8-9 digits)
    const docMatch = /([A-Z]\d{8,9})/.exec(cleanText);

    // Extract names - similar to ID but adapt for passport format
    const namePatterns = [
      /SURNAME\s*[:\s]*([A-ZÇĞİÖŞÜ]+)/i,
      /GIVEN\s*NAMES?\s*[:\s]*([A-ZÇĞİÖŞÜ]+)/i,
      /([A-ZÇĞİÖŞÜ]{2,})\s+([A-ZÇĞİÖŞÜ]{2,})/g,
    ];

    let name = '';
    let surname = '';

    for (const pattern of namePatterns) {
      const matches = [...cleanText.matchAll(pattern)];
      if (matches.length > 0) {
        const match = matches[0];
        if (pattern.source.includes('SURNAME')) {
          surname = match[1];
        } else if (pattern.source.includes('GIVEN')) {
          name = match[1];
        } else if (match[1] && match[2]) {
          name = match[1];
          surname = match[2];
          break;
        }
      }
    }

    // Extract birth date
    const dateMatch = /(\d{1,2})[\.\-\/](\d{1,2})[\.\-\/](\d{4})/.exec(cleanText);

    // Extract birth place
    const birthPlace = extractBirthPlace(cleanText);

    return {
      name: name || '',
      surname: surname || '',
      documentNumber: docMatch?.[1] || '',
      birthDate: dateMatch
        ? `${dateMatch[1].padStart(2, '0')}.${dateMatch[2].padStart(2, '0')}.${dateMatch[3]}`
        : '',
      birthPlace: birthPlace,
      nationality: 'TUR',
    };
  }
};

const extractBirthPlace = (text: string): string => {
  // Comprehensive Turkish cities list for birth place extraction
  const cities = [
    'İSTANBUL',
    'ANKARA',
    'İZMİR',
    'BURSA',
    'ANTALYA',
    'ADANA',
    'KONYA',
    'GAZİANTEP',
    'MERSİN',
    'DİYARBAKIR',
    'KAYSERİ',
    'ESKİŞEHİR',
    'DENIZLI',
    'SAMSUN',
    'ADAPAZARI',
    'MALATYA',
    'KAHRAMANMARAŞ',
    'VAN',
    'BATMAN',
    'ELÂZIĞ',
    'ERZURUM',
    'TRABZON',
    'ORDU',
    'ISPARTA',
    'ÇORUM',
    'AFYON',
    'ZONGULDAK',
    'UŞAK',
    'DÜZCE',
    'OSMANIYE',
    'ÇANAKKALE',
    'AMASYA',
    'KASTAMONU',
    'KÜTAHYA',
    'MANISA',
    'BALIKESIR',
    'BOLU',
    'KIRIKKALE',
    'AKSARAY',
    'KARAMAN',
    'KIRKLARELI',
    'BILECIK',
    'YOZGAT',
    'ÇANKIRI',
    'SINOP',
    'KARABÜK',
    'ARTVIN',
    'YALOVA',
    'BARTIN',
  ];

  // Look for birth place indicators
  const birthPlacePatterns = [
    /DOĞUM\s*YERİ?\s*[:\s]*([A-ZÇĞİÖŞÜ]+)/i,
    /PLACE\s*OF\s*BIRTH\s*[:\s]*([A-ZÇĞİÖŞÜ]+)/i,
  ];

  // First try specific birth place patterns
  for (const pattern of birthPlacePatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      const foundCity = cities.find((city) => city.includes(match[1]) || match[1].includes(city));
      if (foundCity) return foundCity;
    }
  }

  // Then look for any city mentioned in the text
  for (const city of cities) {
    if (text.includes(city)) {
      return city;
    }
  }

  return '';
};

export function OCRScanner({
  isOpen,
  onClose,
  onResult,
  documentType = 'id',
  className,
}: OCRScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<OCRResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cameraPermission, setCameraPermission] = useState<'granted' | 'denied' | 'prompt'>(
    'prompt',
  );
  const [processingStep, setProcessingStep] = useState(0);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Camera access and permissions
  const startCamera = useCallback(async () => {
    try {
      setError(null);

      // Check camera permission
      if (navigator.permissions) {
        const permissionStatus = await navigator.permissions.query({
          name: 'camera' as PermissionName,
        });
        setCameraPermission(permissionStatus.state);

        if (permissionStatus.state === 'denied') {
          setError(
            'Kamera erişimi engellendi. Lütfen tarayıcı ayarlarından kamera iznini etkinleştirin.',
          );
          return;
        }
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment', // Back camera for better document scanning
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          aspectRatio: { ideal: 16 / 9 },
        },
      });

      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play();
      }
      setIsScanning(true);
      setCameraPermission('granted');
    } catch (error) {
      console.error('Camera access error:', error);
      setCameraPermission('denied');
      setError(
        'Kameraya erişilemedi. Lütfen kamera izni verin veya dosya yükleme seçeneğini kullanın.',
      );
    }
  }, []);

  // Stop camera stream
  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => {
        track.stop();
      });
      setStream(null);
    }
    setIsScanning(false);
  }, [stream]);

  // Capture photo from video
  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    // Set canvas dimensions to video dimensions
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert to data URL
    const imageData = canvas.toDataURL('image/jpeg', 0.9);
    setCapturedImage(imageData);

    // Stop camera after capture
    stopCamera();

    toast.success('Fotoğraf başarıyla çekildi!');
  }, [stopCamera]);

  // Process captured image with OCR
  const processImage = useCallback(
    async (imageData: string) => {
      try {
        setProcessing(true);
        setError(null);

        // Enhanced processing with quality checks
        const imageQuality = await checkImageQuality(imageData);

        if (imageQuality.score < 0.3) {
          setError(
            `Görüntü kalitesi çok düşük: ${imageQuality.issues.join(', ')}. Lütfen daha net bir fotoğraf çekin.`,
          );
          toast.error('Görüntü kalitesi çok düşük. Tekrar deneyin.');
          return;
        }

        // Warn about quality issues but proceed
        if (imageQuality.score < 0.6) {
          toast.warning(
            `Görüntü kalitesi: ${imageQuality.issues.join(', ')}. OCR sonuçları etkilenebilir.`,
          );
        }

        const result = await processOCR(imageData, documentType);

        // Always set result, let user decide if it's useful
        setScanResult(result);

        // Provide feedback based on confidence
        if (result.confidence < 0.3) {
          toast.warning(
            `Düşük güven skoru (%${Math.round(result.confidence * 100)}). Sonuçları kontrol edin.`,
          );
        } else if (result.confidence < 0.6) {
          toast.info(
            `Orta güven skoru (%${Math.round(result.confidence * 100)}). Sonuçları gözden geçirin.`,
          );
        } else {
          toast.success(
            `Yüksek güven skoru (%${Math.round(result.confidence * 100)}). Belge başarıyla tarandı!`,
          );
        }
      } catch (error) {
        console.error('OCR processing error:', error);
        const errorMessage =
          error instanceof Error
            ? error.message
            : 'Belge işlenirken hata oluştu. Lütfen tekrar deneyin.';
        setError(errorMessage);
        toast.error('Belge işlenirken hata oluştu');
      } finally {
        setProcessing(false);
      }
    },
    [documentType],
  );

  // Image quality assessment
  const checkImageQuality = async (
    imageData: string,
  ): Promise<{ score: number; issues: string[] }> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          resolve({ score: 0.5, issues: ['Canvas desteği yok'] });
          return;
        }

        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        let brightness = 0;
        let contrast = 0;
        const pixelCount = data.length / 4;

        // Calculate brightness
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          brightness += (r + g + b) / 3;
        }
        brightness /= pixelCount;

        // Calculate contrast (simplified)
        let variance = 0;
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const pixelBrightness = (r + g + b) / 3;
          variance += Math.pow(pixelBrightness - brightness, 2);
        }
        contrast = Math.sqrt(variance / pixelCount);

        const issues: string[] = [];
        let score = 1.0;

        // Quality checks
        if (brightness < 50) {
          issues.push('Çok karanlık');
          score -= 0.3;
        } else if (brightness > 200) {
          issues.push('Çok parlak');
          score -= 0.2;
        }

        if (contrast < 20) {
          issues.push('Düşük kontrast');
          score -= 0.2;
        }

        if (img.width < 800 || img.height < 600) {
          issues.push('Düşük çözünürlük');
          score -= 0.2;
        }

        resolve({ score: Math.max(0, score), issues });
      };

      img.onerror = () => {
        resolve({ score: 0, issues: ['Görüntü yüklenemedi'] });
      };

      img.src = imageData;
    });
  };

  // Handle file upload
  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Lütfen geçerli bir görsel dosyası seçin.');
      return;
    }

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('Dosya boyutu çok büyük. Maksimum 10MB olmalıdır.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setCapturedImage(result);
      toast.success('Dosya başarıyla yüklendi!');
    };
    reader.readAsDataURL(file);
  }, []);

  // Use OCR result
  const useResult = useCallback(() => {
    if (scanResult) {
      onResult(scanResult);
      onClose();
      toast.success('Bilgiler forma aktarıldı!');
    }
  }, [scanResult, onResult, onClose]);

  // Reset scanner
  const resetScanner = useCallback(() => {
    setCapturedImage(null);
    setScanResult(null);
    setError(null);
    setProcessing(false);
    stopCamera();
  }, [stopCamera]);

  // Cleanup on close
  useEffect(() => {
    if (!isOpen) {
      resetScanner();
    }
  }, [isOpen, resetScanner]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  // Auto-process captured image
  useEffect(() => {
    if (capturedImage && !scanResult && !processing) {
      processImage(capturedImage);
    }
  }, [capturedImage, scanResult, processing, processImage]);

  const getDocumentTypeName = () => {
    return documentType === 'id' ? 'TC Kimlik Kartı' : 'Pasaport';
  };

  const renderScanningView = () => (
    <div className="space-y-4">
      <div className="text-center space-y-2">
        <h3 className="text-lg font-medium">Kamera ile Tara</h3>
        <p className="text-sm text-muted-foreground">
          {getDocumentTypeName()} belgenizi kamera görüş alanına yerleştirin
        </p>
      </div>

      {/* Camera View */}
      <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
        <video ref={videoRef} className="w-full h-full object-cover" playsInline muted />

        {/* Scanning Overlay */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="border-2 border-white/50 border-dashed rounded-lg w-4/5 h-3/5 relative">
            <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-primary rounded-tl-lg"></div>
            <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-primary rounded-tr-lg"></div>
            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-primary rounded-bl-lg"></div>
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-primary rounded-br-lg"></div>

            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-white text-sm bg-black/50 px-3 py-1 rounded">
                {getDocumentTypeName()}
              </div>
            </div>
          </div>
        </div>

        {/* Capture Button */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
          <Button
            onClick={capturePhoto}
            size="lg"
            className="rounded-full w-16 h-16 bg-white text-black hover:bg-gray-100"
          >
            <Camera className="w-8 h-8" />
          </Button>
        </div>
      </div>

      <div className="flex justify-center gap-2">
        <Button variant="outline" onClick={stopCamera} className="min-h-[44px]">
          <X className="w-4 h-4 mr-2" />
          İptal
        </Button>
      </div>
    </div>
  );

  // Processing step management
  useEffect(() => {
    if (processing) {
      setProcessingStep(0);
      const steps = [
        'Görüntü kalitesi kontrol ediliyor...',
        'Tesseract.js kütüphanesi yükleniyor...',
        'Türkçe dil paketi yükleniyor...',
        'OCR motoru başlatılıyor...',
        'Belge metni tanınıyor...',
        'Bilgiler çıkarılıyor...',
      ];

      let currentStep = 0;
      const interval = setInterval(() => {
        if (currentStep < steps.length - 1) {
          currentStep++;
          setProcessingStep(currentStep);
        }
      }, 3000); // Realistic timing for OCR operations

      return () => {
        clearInterval(interval);
      };
    } else {
      setProcessingStep(0);
    }
  }, [processing]);

  const renderProcessingView = () => {
    const processingSteps = [
      'Görüntü kalitesi kontrol ediliyor...',
      'Tesseract.js kütüphanesi yükleniyor...',
      'Türkçe dil paketi yükleniyor...',
      'OCR motoru başlatılıyor...',
      'Belge metni tanınıyor...',
      'Bilgiler çıkarılıyor...',
    ];

    return (
      <div className="space-y-4">
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
          <h3 className="text-lg font-medium">Belge İşleniyor</h3>
          <p className="text-sm text-muted-foreground">{processingSteps[processingStep]}</p>

          {/* Progress indicator */}
          <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-500"
              style={{ width: `${((processingStep + 1) / processingSteps.length) * 100}%` }}
            ></div>
          </div>
        </div>

        {capturedImage && (
          <div className="flex justify-center">
            <div className="relative">
              <img
                src={capturedImage}
                alt="Captured document"
                className="max-w-full max-h-48 object-contain rounded-lg border"
              />
              {/* Scanning animation overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/20 to-transparent animate-pulse rounded-lg"></div>
            </div>
          </div>
        )}

        <div className="text-center">
          <p className="text-xs text-muted-foreground">
            İlk kullanımda OCR kütüphanesi indirildiği için işlem 2-3 dakika sürebilir
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Sonraki kullanımlarda daha hızlı olacaktır
          </p>
        </div>
      </div>
    );
  };

  const renderResultView = () => {
    if (!scanResult) return null;

    const hasData =
      scanResult.name ||
      scanResult.surname ||
      scanResult.idNumber ||
      scanResult.documentNumber ||
      scanResult.birthDate ||
      scanResult.birthPlace;

    return (
      <div className="space-y-4">
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <CheckCircle className={`w-8 h-8 ${hasData ? 'text-green-500' : 'text-yellow-500'}`} />
          </div>
          <h3 className="text-lg font-medium">Tarama Tamamlandı</h3>
          <p className="text-sm text-muted-foreground">
            {hasData
              ? 'Belge başarıyla okundu ve bilgiler çıkarıldı'
              : 'Belge tarandı ancak bazı bilgiler net okunamadı'}
          </p>
        </div>

        {/* Confidence Score */}
        <div className="flex justify-center">
          <Badge variant={scanResult.confidence > 0.7 ? 'default' : 'secondary'}>
            Güven Skoru: %{Math.round(scanResult.confidence * 100)}
          </Badge>
        </div>

        {/* Extracted Information */}
        <Card>
          <CardContent className="p-4 space-y-3">
            <h4 className="font-medium text-sm text-muted-foreground mb-3">Çıkarılan Bilgiler:</h4>

            {scanResult.name ? (
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Ad:</span>
                <span className="text-sm font-medium">{scanResult.name}</span>
              </div>
            ) : (
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Ad:</span>
                <span className="text-sm text-red-500">Okunamadı</span>
              </div>
            )}

            {scanResult.surname ? (
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Soyad:</span>
                <span className="text-sm font-medium">{scanResult.surname}</span>
              </div>
            ) : (
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Soyad:</span>
                <span className="text-sm text-red-500">Okunamadı</span>
              </div>
            )}

            {documentType === 'id' &&
              (scanResult.idNumber ? (
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">TC Kimlik No:</span>
                  <span className="text-sm font-medium">{scanResult.idNumber}</span>
                </div>
              ) : (
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">TC Kimlik No:</span>
                  <span className="text-sm text-red-500">Okunamadı</span>
                </div>
              ))}

            {documentType === 'passport' &&
              (scanResult.documentNumber ? (
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Belge No:</span>
                  <span className="text-sm font-medium">{scanResult.documentNumber}</span>
                </div>
              ) : (
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Belge No:</span>
                  <span className="text-sm text-red-500">Okunamadı</span>
                </div>
              ))}

            {scanResult.birthDate ? (
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Doğum Tarihi:</span>
                <span className="text-sm font-medium">{scanResult.birthDate}</span>
              </div>
            ) : (
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Doğum Tarihi:</span>
                <span className="text-sm text-red-500">Okunamadı</span>
              </div>
            )}

            {scanResult.birthPlace ? (
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Doğum Yeri:</span>
                <span className="text-sm font-medium">{scanResult.birthPlace}</span>
              </div>
            ) : (
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Doğum Yeri:</span>
                <span className="text-sm text-red-500">Okunamadı</span>
              </div>
            )}

            {/* Show raw OCR text for debugging */}
            {scanResult.rawText && (
              <details className="mt-4">
                <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground">
                  Ham OCR Metni (Debugging)
                </summary>
                <div className="mt-2 p-2 bg-gray-50 rounded text-xs max-h-20 overflow-y-auto">
                  {scanResult.rawText}
                </div>
              </details>
            )}
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button variant="outline" onClick={resetScanner} className="min-h-[44px] flex-1">
            <RotateCw className="w-4 h-4 mr-2" />
            Tekrar Tara
          </Button>
          <Button
            onClick={useResult}
            className="min-h-[44px] flex-1 bg-primary hover:bg-primary/90"
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Bilgileri Kullan
          </Button>
        </div>
      </div>
    );
  };

  const renderUploadView = () => (
    <div className="space-y-4">
      <div className="text-center space-y-2">
        <h3 className="text-lg font-medium">Belge Tarama</h3>
        <p className="text-sm text-muted-foreground">
          {getDocumentTypeName()} belgenizi tarayın veya fotoğrafını yükleyin
        </p>
      </div>

      {/* Upload Area */}
      <div
        onClick={() => fileInputRef.current?.click()}
        className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
      >
        <div className="space-y-2">
          <Upload className="w-8 h-8 mx-auto text-muted-foreground" />
          <div className="text-sm">
            <p className="font-medium">Dosya yükle</p>
            <p className="text-muted-foreground">JPG, PNG (Maks. 10MB)</p>
          </div>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        className="hidden"
      />

      <div className="text-center text-sm text-muted-foreground">veya</div>

      {/* Camera Button */}
      <div className="space-y-3">
        <Button
          onClick={startCamera}
          className="w-full min-h-[44px] bg-primary hover:bg-primary/90"
          disabled={cameraPermission === 'denied'}
        >
          <Camera className="w-4 h-4 mr-2" />
          Kamera ile Tara
        </Button>

        {cameraPermission === 'denied' && (
          <div className="flex items-center gap-2 text-sm text-amber-600 bg-amber-50 p-3 rounded-lg">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>Kamera erişimi engellendi. Dosya yükleme seçeneğini kullanabilirsiniz.</span>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className={cn('sm:max-w-lg max-w-[95vw] max-h-[90vh] overflow-y-auto', className)}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Scan className="w-5 h-5" />
            Belge Tarayıcı - {getDocumentTypeName()}
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Tesseract.js OCR teknolojisi ile TC Kimlik Kartı ve Pasaport belgelerindeki metinleri
            otomatik olarak tanır
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {error && (
            <div className="mb-4 flex items-center gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-lg">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {processing && renderProcessingView()}
          {scanResult && !processing && renderResultView()}
          {isScanning && !capturedImage && !processing && renderScanningView()}
          {!isScanning && !capturedImage && !processing && !scanResult && renderUploadView()}
        </div>

        {/* Hidden canvas for image processing */}
        <canvas ref={canvasRef} className="hidden" />
      </DialogContent>
    </Dialog>
  );
}
