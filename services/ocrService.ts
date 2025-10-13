/**
 * @fileoverview OCR Service - Kimlik ve pasaport okuma servisi
 *
 * @author Dernek Yönetim Sistemi Team
 * @version 1.0.0
 */

import { logger } from '../lib/logging/logger';

export interface OCRResult {
  fullName?: string;
  identityNumber?: string;
  nationality?: string;
  country?: string;
  birthDate?: string;
  gender?: 'male' | 'female' | 'other';
  documentType?: 'identity' | 'passport';
  confidence?: number;
  rawText?: string;
}

export interface CameraOptions {
  facingMode?: 'user' | 'environment';
  width?: number;
  height?: number;
}

class OCRService {
  private static instance: OCRService;
  private mediaStream: MediaStream | null = null;
  private videoElement: HTMLVideoElement | null = null;
  private canvas: HTMLCanvasElement | null = null;

  static getInstance(): OCRService {
    if (!OCRService.instance) {
      OCRService.instance = new OCRService();
    }
    return OCRService.instance;
  }

  /**
   * Kamera erişimini kontrol et
   */
  async checkCameraSupport(): Promise<boolean> {
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        logger.warn('Kamera API desteklenmiyor');
        return false;
      }
      return true;
    } catch (error) {
      logger.error('Kamera desteği kontrolü başarısız:', error);
      return false;
    }
  }

  /**
   * Kamera akışını başlat
   */
  async startCamera(options: CameraOptions = {}): Promise<HTMLVideoElement> {
    try {
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: options.facingMode || 'environment',
          width: { ideal: options.width || 1280 },
          height: { ideal: options.height || 720 },
        },
        audio: false,
      };

      this.mediaStream = await navigator.mediaDevices.getUserMedia(constraints);

      this.videoElement = document.createElement('video');
      this.videoElement.srcObject = this.mediaStream;
      this.videoElement.autoplay = true;
      this.videoElement.playsInline = true;
      this.videoElement.style.width = '100%';
      this.videoElement.style.height = 'auto';

      this.canvas = document.createElement('canvas');
      this.canvas.style.display = 'none';

      logger.info('Kamera başarıyla başlatıldı');
      return this.videoElement;
    } catch (error) {
      logger.error('Kamera başlatma hatası:', error);
      throw new Error('Kamera erişimi sağlanamadı. Lütfen kamera izinlerini kontrol edin.');
    }
  }

  /**
   * Kamera akışını durdur
   */
  stopCamera(): void {
    try {
      if (this.mediaStream) {
        this.mediaStream.getTracks().forEach((track) => {
          track.stop();
        });
        this.mediaStream = null;
      }

      if (this.videoElement) {
        this.videoElement.srcObject = null;
        this.videoElement = null;
      }

      if (this.canvas) {
        this.canvas = null;
      }

      logger.info('Kamera durduruldu');
    } catch (error) {
      logger.error('Kamera durdurma hatası:', error);
    }
  }

  /**
   * Video'dan frame yakala
   */
  private captureFrame(): string | null {
    if (!this.videoElement || !this.canvas) {
      return null;
    }

    try {
      const context = this.canvas.getContext('2d');
      if (!context) return null;

      this.canvas.width = this.videoElement.videoWidth;
      this.canvas.height = this.videoElement.videoHeight;

      context.drawImage(this.videoElement, 0, 0);
      return this.canvas.toDataURL('image/jpeg', 0.8);
    } catch (error) {
      logger.error('Frame yakalama hatası:', error);
      return null;
    }
  }

  /**
   * OCR işlemi - Tesseract.js kullanarak
   */
  async performOCR(imageData: string): Promise<OCRResult> {
    try {
      // Tesseract.js'i dinamik olarak yükle
      const { createWorker } = await import('tesseract.js');

      const worker = await createWorker('tur+eng', 1, {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            logger.debug(`OCR Progress: ${Math.round(m.progress * 100)}%`);
          }
        },
      });

      const {
        data: { text, confidence },
      } = await worker.recognize(imageData);
      await worker.terminate();

      logger.info('OCR işlemi tamamlandı', { confidence });

      // Metni parse et
      const result = this.parseDocumentText(text);
      result.confidence = confidence;
      result.rawText = text;

      return result;
    } catch (error) {
      logger.error('OCR işlemi başarısız:', error);
      throw new Error(
        'Belge okuma işlemi başarısız oldu. Lütfen belgeyi daha net bir şekilde gösterin.'
      );
    }
  }

  /**
   * Kimlik/pasaport metnini parse et
   */
  private parseDocumentText(text: string): OCRResult {
    const result: OCRResult = {};
    const cleanText = text.replace(/\s+/g, ' ').trim();

    // Türkçe kimlik kartı pattern'leri
    const identityPatterns = {
      identityNumber: /(?:TC|T\.C\.|TUR|TURKEY)[\s:]*(\d{11})/i,
      fullName: /(?:ADI|AD|NAME)[\s:]*([A-ZÇĞIİÖŞÜ\s]+)/i,
      nationality: /(?:UYRUK|NATIONALITY)[\s:]*([A-ZÇĞIİÖŞÜ\s]+)/i,
      birthDate: /(?:DOĞUM|DOGUM|BIRTH)[\s:]*(\d{1,2}[./]\d{1,2}[./]\d{4})/i,
      gender: /(?:CİNSİYET|CINSIYET|GENDER)[\s:]*([A-ZÇĞIİÖŞÜ\s]+)/i,
    };

    // Pasaport pattern'leri
    const passportPatterns = {
      identityNumber: /(?:PASSPORT|PASAPORT)[\s:]*([A-Z0-9]{6,12})/i,
      fullName: /(?:SURNAME|SURNAMES|SOYADI)[\s:]*([A-ZÇĞIİÖŞÜ\s,]+)/i,
      nationality: /(?:NATIONALITY|UYRUK)[\s:]*([A-ZÇĞIİÖŞÜ\s]+)/i,
      birthDate: /(?:DATE OF BIRTH|DOĞUM TARİHİ)[\s:]*(\d{1,2}[./]\d{1,2}[./]\d{4})/i,
      gender: /(?:SEX|CİNSİYET)[\s:]*([A-ZÇĞIİÖŞÜ\s]+)/i,
    };

    // Önce kimlik kartı pattern'lerini dene
    let patterns = identityPatterns;
    result.documentType = 'identity';

    // Kimlik numarası bulunamazsa pasaport pattern'lerini dene
    if (!identityPatterns.identityNumber.test(cleanText)) {
      patterns = passportPatterns;
      result.documentType = 'passport';
    }

    // Pattern'leri uygula
    Object.entries(patterns).forEach(([key, pattern]) => {
      const match = cleanText.match(pattern);
      if (match) {
        const value = match[1].trim();

        switch (key) {
          case 'identityNumber':
            result.identityNumber = value;
            break;
          case 'fullName':
            result.fullName = this.cleanName(value);
            break;
          case 'nationality':
            result.nationality = this.cleanNationality(value);
            break;
          case 'birthDate':
            result.birthDate = this.cleanDate(value);
            break;
          case 'gender':
            result.gender = this.parseGender(value);
            break;
        }
      }
    });

    // Ülke kodu belirle
    if (result.nationality) {
      result.country = this.getCountryCode(result.nationality);
    }

    return result;
  }

  /**
   * İsmi temizle
   */
  private cleanName(name: string): string {
    return name
      .replace(/[^A-ZÇĞIİÖŞÜ\s]/gi, '')
      .replace(/\s+/g, ' ')
      .trim()
      .toLowerCase()
      .replace(/\b\w/g, (l) => l.toUpperCase());
  }

  /**
   * Uyruğu temizle
   */
  private cleanNationality(nationality: string): string {
    return nationality
      .replace(/[^A-ZÇĞIİÖŞÜ\s]/gi, '')
      .replace(/\s+/g, ' ')
      .trim()
      .toLowerCase()
      .replace(/\b\w/g, (l) => l.toUpperCase());
  }

  /**
   * Tarihi temizle
   */
  private cleanDate(date: string): string {
    return date.replace(/[^\d./]/g, '');
  }

  /**
   * Cinsiyeti parse et
   */
  private parseGender(gender: string): 'male' | 'female' | 'other' {
    const cleanGender = gender.toLowerCase().trim();

    if (
      cleanGender.includes('erkek') ||
      cleanGender.includes('male') ||
      cleanGender.includes('m')
    ) {
      return 'male';
    } else if (
      cleanGender.includes('kadın') ||
      cleanGender.includes('female') ||
      cleanGender.includes('f')
    ) {
      return 'female';
    }

    return 'other';
  }

  /**
   * Ülke kodu belirle
   */
  private getCountryCode(nationality: string): string {
    const countryMap: Record<string, string> = {
      türk: 'TR',
      turk: 'TR',
      turkey: 'TR',
      türkiye: 'TR',
      syrian: 'SY',
      suriyeli: 'SY',
      afghan: 'AF',
      afgan: 'AF',
      iraqi: 'IQ',
      iraklı: 'IQ',
      iranian: 'IR',
      iranlı: 'IR',
    };

    const lowerNationality = nationality.toLowerCase();
    for (const [key, code] of Object.entries(countryMap)) {
      if (lowerNationality.includes(key)) {
        return code;
      }
    }

    return 'TR'; // Varsayılan
  }

  /**
   * Kamera ile belge tara
   */
  async scanDocument(): Promise<OCRResult> {
    try {
      const imageData = this.captureFrame();
      if (!imageData) {
        throw new Error('Görüntü yakalanamadı');
      }

      return await this.performOCR(imageData);
    } catch (error) {
      logger.error('Belge tarama hatası:', error);
      throw error;
    }
  }
}

export const ocrService = OCRService.getInstance();
export default ocrService;
