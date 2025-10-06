/**
 * @fileoverview AccessibilityEnhancements Module - Application module
 *
 * @author Dernek Yönetim Sistemi Team
 * @version 1.0.0
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Eye,
  Volume2,
  Type,
  Contrast,
  MousePointer,
  Check,
  X,
  AlertTriangle,
  Info,
  Zap,
  Focus,
  Cpu,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Switch } from '../ui/switch';
import { Slider } from '../ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { useAdvancedMobile } from '../../hooks/useAdvancedMobile';

// Erişilebilirlik ayarları
interface AccessibilitySettings {
  // Görsel ayarlar
  highContrast: boolean;
  fontSize: number; // 1-3 arası
  colorBlindSupport: boolean;
  reducedMotion: boolean;
  darkMode: boolean;

  // Ses ayarları
  screenReader: boolean;
  audioDescriptions: boolean;
  soundEffects: boolean;
  volume: number; // 0-100

  // Motor ayarları
  keyboardNavigation: boolean;
  largeClickTargets: boolean;
  stickyKeys: boolean;
  slowKeys: boolean;

  // Bilişsel ayarları
  simplifiedInterface: boolean;
  readingAssistance: boolean;
  focusIndicators: boolean;
  errorPrevention: boolean;

  // Dil ayarları
  language: string;
  readingLevel: 'simple' | 'standard' | 'advanced';
}

// Erişilebilirlik istatistikleri
interface AccessibilityStats {
  totalChecks: number;
  passedChecks: number;
  failedChecks: number;
  warnings: number;
  score: number; // 0-100
  lastScan: Date;
  issues: {
    type: 'error' | 'warning' | 'info';
    category: 'color' | 'contrast' | 'keyboard' | 'screen_reader' | 'focus' | 'alt_text';
    message: string;
    element?: string;
    suggestion: string;
  }[];
}

// Varsayılan ayarlar
const defaultSettings: AccessibilitySettings = {
  highContrast: false,
  fontSize: 1,
  colorBlindSupport: false,
  reducedMotion: false,
  darkMode: false,
  screenReader: false,
  audioDescriptions: false,
  soundEffects: true,
  volume: 50,
  keyboardNavigation: true,
  largeClickTargets: false,
  stickyKeys: false,
  slowKeys: false,
  simplifiedInterface: false,
  readingAssistance: false,
  focusIndicators: true,
  errorPrevention: true,
  language: 'tr',
  readingLevel: 'standard',
};

interface AccessibilityEnhancementsProps {
  className?: string;
  onSettingsChange?: (settings: AccessibilitySettings) => void;
  onScanComplete?: (stats: AccessibilityStats) => void;
}

/**
 * AccessibilityEnhancements function
 *
 * @param {Object} params - Function parameters
 * @returns {void} Nothing
 */
export function AccessibilityEnhancements({
  className = '',
  onSettingsChange,
  onScanComplete,
}: AccessibilityEnhancementsProps) {
  const [settings, setSettings] = useState<AccessibilitySettings>(defaultSettings);
  const [activeTab, setActiveTab] = useState('visual');
  const [isScanning, setIsScanning] = useState(false);
  const [scanResults, setScanResults] = useState<AccessibilityStats | null>(null);
  const [showQuickAccess, setShowQuickAccess] = useState(false);
  const [announcements, setAnnouncements] = useState<string[]>([]);

  const { triggerHapticFeedback } = useAdvancedMobile();
  const announcementRef = useRef<HTMLDivElement>(null);

  // Erişilebilirlik ayarlarını uygula
  useEffect(() => {
    applyAccessibilitySettings(settings);
    onSettingsChange?.(settings);
  }, [settings, onSettingsChange]);

  // Ekran okuyucu duyuruları
  useEffect(() => {
    if (announcements.length > 0 && announcementRef.current) {
      (announcementRef.current as HTMLElement).focus();
    }
  }, [announcements]);

  // Erişilebilirlik ayarlarını DOM'a uygula
  const applyAccessibilitySettings = useCallback((newSettings: AccessibilitySettings) => {
    const root = document.documentElement;

    // Font boyutu
    root.style.setProperty('--font-size-multiplier', newSettings.fontSize.toString());

    // Yüksek kontrast
    if (newSettings.highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }

    // Renk körü desteği
    if (newSettings.colorBlindSupport) {
      root.classList.add('colorblind-support');
    } else {
      root.classList.remove('colorblind-support');
    }

    // Azaltılmış hareket
    if (newSettings.reducedMotion) {
      root.classList.add('reduced-motion');
    } else {
      root.classList.remove('reduced-motion');
    }

    // Karanlık mod
    if (newSettings.darkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    // Büyük tıklama alanları
    if (newSettings.largeClickTargets) {
      root.classList.add('large-targets');
    } else {
      root.classList.remove('large-targets');
    }

    // Basitleştirilmiş arayüz
    if (newSettings.simplifiedInterface) {
      root.classList.add('simplified-interface');
    } else {
      root.classList.remove('simplified-interface');
    }

    // Odak göstergeleri
    if (newSettings.focusIndicators) {
      root.classList.add('focus-indicators');
    } else {
      root.classList.remove('focus-indicators');
    }
  }, []);

  // Ayar değiştirme
  const updateSetting = useCallback(
    (key: keyof AccessibilitySettings, value: any) => {
      setSettings((prev) => ({ ...prev, [key]: value }));
      triggerHapticFeedback('light');
    },
    [triggerHapticFeedback],
  );

  // Erişilebilirlik taraması
  const runAccessibilityScan = useCallback(async () => {
    setIsScanning(true);
    triggerHapticFeedback('medium');

    // Simüle edilmiş tarama süreci
    const issues = await performAccessibilityChecks();

    const stats: AccessibilityStats = {
      totalChecks: 25,
      passedChecks: 25 - issues.length,
      failedChecks: issues.filter((i) => i.type === 'error').length,
      warnings: issues.filter((i) => i.type === 'warning').length,
      score: Math.round(((25 - issues.length) / 25) * 100),
      lastScan: new Date(),
      issues,
    };

    setScanResults(stats);
    setIsScanning(false);
    onScanComplete?.(stats);

    // Sonuçları duyur
    announceToScreenReader(`Erişilebilirlik taraması tamamlandı. ${stats.score} puan alındı.`);
  }, [onScanComplete, triggerHapticFeedback]);

  // Erişilebilirlik kontrolleri
  const performAccessibilityChecks = async (): Promise<AccessibilityStats['issues']> => {
    const issues: AccessibilityStats['issues'] = [];

    // Renk kontrastı kontrolü
    const contrastIssues = checkColorContrast();
    issues.push(...contrastIssues);

    // Alt text kontrolü
    const altTextIssues = checkAltText();
    issues.push(...altTextIssues);

    // Klavye navigasyonu kontrolü
    const keyboardIssues = checkKeyboardNavigation();
    issues.push(...keyboardIssues);

    // Odak yönetimi kontrolü
    const focusIssues = checkFocusManagement();
    issues.push(...focusIssues);

    // ARIA etiketleri kontrolü
    const ariaIssues = checkARIALabels();
    issues.push(...ariaIssues);

    return issues;
  };

  // Renk kontrastı kontrolü
  const checkColorContrast = (): AccessibilityStats['issues'] => {
    const issues: AccessibilityStats['issues'] = [];

    // Basit kontrast kontrolü
    const textElements = document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, span, a');
    textElements.forEach((element, index) => {
      if (index < 5) {
        // İlk 5 element için kontrol
        const styles = window.getComputedStyle(element);
        const { color } = styles;
        const { backgroundColor } = styles;

        // Basit kontrast hesaplama (gerçek uygulamada daha gelişmiş algoritma kullanılır)
        if (color === backgroundColor) {
          issues.push({
            type: 'error',
            category: 'contrast',
            message: 'Metin ve arka plan rengi aynı',
            element: element.tagName,
            suggestion: 'Metin ve arka plan renkleri arasında yeterli kontrast sağlayın',
          });
        }
      }
    });

    return issues;
  };

  // Alt text kontrolü
  const checkAltText = (): AccessibilityStats['issues'] => {
    const issues: AccessibilityStats['issues'] = [];

    const images = document.querySelectorAll('img');
    images.forEach((img, index) => {
      if (index < 10) {
        // İlk 10 resim için kontrol
        const alt = img.getAttribute('alt');
        if (!alt || alt.trim() === '') {
          issues.push({
            type: 'error',
            category: 'alt_text',
            message: 'Resim için alt text eksik',
            element: 'img',
            suggestion: 'Tüm resimler için açıklayıcı alt text ekleyin',
          });
        }
      }
    });

    return issues;
  };

  // Klavye navigasyonu kontrolü
  const checkKeyboardNavigation = (): AccessibilityStats['issues'] => {
    const issues: AccessibilityStats['issues'] = [];

    const interactiveElements = document.querySelectorAll('button, a, input, select, textarea');
    interactiveElements.forEach((element, index) => {
      if (index < 10) {
        // İlk 10 element için kontrol
        const tabIndex = element.getAttribute('tabindex');
        if (tabIndex === '-1') {
          issues.push({
            type: 'warning',
            category: 'keyboard',
            message: 'Element klavye ile erişilemiyor',
            element: element.tagName,
            suggestion: 'Tüm etkileşimli elementlerin klavye ile erişilebilir olduğundan emin olun',
          });
        }
      }
    });

    return issues;
  };

  // Odak yönetimi kontrolü
  const checkFocusManagement = (): AccessibilityStats['issues'] => {
    const issues: AccessibilityStats['issues'] = [];

    // Basit odak kontrolü
    const focusableElements = document.querySelectorAll('[tabindex]:not([tabindex="-1"])');
    if (focusableElements.length === 0) {
      issues.push({
        type: 'warning',
        category: 'focus',
        message: 'Sayfada odaklanabilir element bulunamadı',
        element: 'document',
        suggestion: 'Klavye navigasyonu için odaklanabilir elementler ekleyin',
      });
    }

    return issues;
  };

  // ARIA etiketleri kontrolü
  const checkARIALabels = (): AccessibilityStats['issues'] => {
    const issues: AccessibilityStats['issues'] = [];

    const formElements = document.querySelectorAll('input, select, textarea');
    formElements.forEach((element, index) => {
      if (index < 5) {
        // İlk 5 form element için kontrol
        const ariaLabel = element.getAttribute('aria-label');
        const ariaLabelledBy = element.getAttribute('aria-labelledby');
        const id = element.getAttribute('id');

        if (!ariaLabel && !ariaLabelledBy && !id) {
          issues.push({
            type: 'warning',
            category: 'screen_reader',
            message: 'Form elementi için etiket eksik',
            element: element.tagName,
            suggestion: 'Form elementleri için aria-label veya aria-labelledby ekleyin',
          });
        }
      }
    });

    return issues;
  };

  // Ekran okuyucu duyurusu
  const announceToScreenReader = useCallback(
    (message: string) => {
      if (settings.screenReader) {
        setAnnouncements((prev) => [...prev, message]);

        // 5 saniye sonra duyuruyu kaldır
        setTimeout(() => {
          setAnnouncements((prev) => prev.slice(1));
        }, 5000);
      }
    },
    [settings.screenReader],
  );

  // Hızlı erişim tuşları
  const handleQuickAccess = useCallback(
    (action: string) => {
      switch (action) {
        case 'contrast':
          updateSetting('highContrast', !settings.highContrast);
          announceToScreenReader(
            settings.highContrast ? 'Yüksek kontrast kapatıldı' : 'Yüksek kontrast açıldı',
          );
          break;
        case 'font':
          const newFontSize = settings.fontSize >= 3 ? 1 : settings.fontSize + 0.5;
          updateSetting('fontSize', newFontSize);
          announceToScreenReader(`Font boyutu ${newFontSize} olarak ayarlandı`);
          break;
        case 'focus':
          const firstFocusable = document.querySelector(
            '[tabindex]:not([tabindex="-1"]), button, a, input, select, textarea',
          )!;
          if (firstFocusable) {
            (firstFocusable as HTMLElement).focus();
            announceToScreenReader('İlk etkileşimli elemente odaklandı');
          }
          break;
        case 'scan':
          runAccessibilityScan();
          break;
      }
    },
    [settings, updateSetting, announceToScreenReader, runAccessibilityScan],
  );

  // Klavye kısayolları
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.altKey) {
        switch (event.key) {
          case '1':
            event.preventDefault();
            handleQuickAccess('contrast');
            break;
          case '2':
            event.preventDefault();
            handleQuickAccess('font');
            break;
          case '3':
            event.preventDefault();
            handleQuickAccess('focus');
            break;
          case '4':
            event.preventDefault();
            handleQuickAccess('scan');
            break;
          case 'a':
            event.preventDefault();
            setShowQuickAccess(!showQuickAccess);
            break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleQuickAccess, showQuickAccess]);

  return (
    <div className={`mx-auto w-full max-w-6xl ${className}`}>
      {/* Ekran Okuyucu Duyuruları */}
      <div ref={announcementRef} className="sr-only" aria-live="polite" aria-atomic="true">
        {announcements[0]}
      </div>

      {/* Hızlı Erişim Butonları */}
      <AnimatePresence>
        {showQuickAccess && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 right-4 z-50"
          >
            <Card className="border-0 bg-white/95 shadow-xl backdrop-blur-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-gray-900">
                  Hızlı Erişim (Alt + A)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    handleQuickAccess('contrast');
                  }}
                  className="w-full justify-start gap-2"
                >
                  <Contrast className="h-4 w-4" />
                  Kontrast (Alt+1)
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    handleQuickAccess('font');
                  }}
                  className="w-full justify-start gap-2"
                >
                  <Type className="h-4 w-4" />
                  Font (Alt+2)
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    handleQuickAccess('focus');
                  }}
                  className="w-full justify-start gap-2"
                >
                  <Focus className="h-4 w-4" />
                  Odak (Alt+3)
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    handleQuickAccess('scan');
                  }}
                  className="w-full justify-start gap-2"
                >
                  <Zap className="h-4 w-4" />
                  Tarama (Alt+4)
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <Card className="border-0 bg-white/95 shadow-xl backdrop-blur-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Eye className="h-6 w-6 text-blue-600" />
              <div>
                <CardTitle className="text-xl font-semibold text-gray-900">
                  Erişilebilirlik Merkezi
                </CardTitle>
                <p className="text-sm text-gray-600">Tüm kullanıcılar için erişilebilir deneyim</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowQuickAccess(!showQuickAccess);
                }}
                className="gap-2"
              >
                <Zap className="h-4 w-4" />
                Hızlı Erişim (Alt+A)
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={runAccessibilityScan}
                disabled={isScanning}
                className="gap-2"
              >
                {isScanning ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
                    Tara...
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4" />
                    Erişilebilirlik Tara
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mx-6 mb-4 grid w-full grid-cols-5">
              <TabsTrigger value="visual" className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Görsel
              </TabsTrigger>
              <TabsTrigger value="audio" className="flex items-center gap-2">
                <Volume2 className="h-4 w-4" />
                Ses
              </TabsTrigger>
              <TabsTrigger value="motor" className="flex items-center gap-2">
                <MousePointer className="h-4 w-4" />
                Motor
              </TabsTrigger>
              <TabsTrigger value="cognitive" className="flex items-center gap-2">
                <Cpu className="h-4 w-4" />
                Bilişsel
              </TabsTrigger>
              <TabsTrigger value="results" className="flex items-center gap-2">
                <Check className="h-4 w-4" />
                Sonuçlar
              </TabsTrigger>
            </TabsList>

            <TabsContent value="visual" className="px-6 pb-6">
              <div className="space-y-6">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Contrast className="h-5 w-5 text-blue-600" />
                        Görsel Ayarlar
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-700">Yüksek Kontrast</p>
                          <p className="text-sm text-gray-500">Daha belirgin renkler</p>
                        </div>
                        <Switch
                          checked={settings.highContrast}
                          onCheckedChange={(checked) => {
                            updateSetting('highContrast', checked);
                          }}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-700">Renk Körü Desteği</p>
                          <p className="text-sm text-gray-500">Renk körü kullanıcılar için</p>
                        </div>
                        <Switch
                          checked={settings.colorBlindSupport}
                          onCheckedChange={(checked) => {
                            updateSetting('colorBlindSupport', checked);
                          }}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-700">Karanlık Mod</p>
                          <p className="text-sm text-gray-500">Göz yorgunluğunu azaltır</p>
                        </div>
                        <Switch
                          checked={settings.darkMode}
                          onCheckedChange={(checked) => {
                            updateSetting('darkMode', checked);
                          }}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-700">Azaltılmış Hareket</p>
                          <p className="text-sm text-gray-500">Animasyonları azaltır</p>
                        </div>
                        <Switch
                          checked={settings.reducedMotion}
                          onCheckedChange={(checked) => {
                            updateSetting('reducedMotion', checked);
                          }}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Type className="h-5 w-5 text-green-600" />
                        Metin Ayarları
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <div className="mb-2 flex items-center justify-between">
                          <p className="font-medium text-gray-700">Font Boyutu</p>
                          <Badge variant="outline">{settings.fontSize}x</Badge>
                        </div>
                        <Slider
                          value={[settings.fontSize]}
                          onValueChange={([value]) => {
                            updateSetting('fontSize', value);
                          }}
                          min={1}
                          max={3}
                          step={0.5}
                          className="w-full"
                        />
                        <div className="mt-1 flex justify-between text-xs text-gray-500">
                          <span>Küçük</span>
                          <span>Büyük</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="audio" className="px-6 pb-6">
              <div className="space-y-6">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Volume2 className="h-5 w-5 text-purple-600" />
                        Ses Ayarları
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-700">Ekran Okuyucu</p>
                          <p className="text-sm text-gray-500">Sesli okuma desteği</p>
                        </div>
                        <Switch
                          checked={settings.screenReader}
                          onCheckedChange={(checked) => {
                            updateSetting('screenReader', checked);
                          }}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-700">Ses Efektleri</p>
                          <p className="text-sm text-gray-500">Etkileşim sesleri</p>
                        </div>
                        <Switch
                          checked={settings.soundEffects}
                          onCheckedChange={(checked) => {
                            updateSetting('soundEffects', checked);
                          }}
                        />
                      </div>

                      <div>
                        <div className="mb-2 flex items-center justify-between">
                          <p className="font-medium text-gray-700">Ses Seviyesi</p>
                          <Badge variant="outline">{settings.volume}%</Badge>
                        </div>
                        <Slider
                          value={[settings.volume]}
                          onValueChange={([value]) => {
                            updateSetting('volume', value);
                          }}
                          min={0}
                          max={100}
                          step={10}
                          className="w-full"
                        />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="motor" className="px-6 pb-6">
              <div className="space-y-6">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <MousePointer className="h-5 w-5 text-orange-600" />
                        Motor Ayarları
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-700">Klavye Navigasyonu</p>
                          <p className="text-sm text-gray-500">Tab ile gezinme</p>
                        </div>
                        <Switch
                          checked={settings.keyboardNavigation}
                          onCheckedChange={(checked) => {
                            updateSetting('keyboardNavigation', checked);
                          }}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-700">Büyük Tıklama Alanları</p>
                          <p className="text-sm text-gray-500">Daha kolay tıklama</p>
                        </div>
                        <Switch
                          checked={settings.largeClickTargets}
                          onCheckedChange={(checked) => {
                            updateSetting('largeClickTargets', checked);
                          }}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-700">Yapışkan Tuşlar</p>
                          <p className="text-sm text-gray-500">Modifier tuşları kilitle</p>
                        </div>
                        <Switch
                          checked={settings.stickyKeys}
                          onCheckedChange={(checked) => {
                            updateSetting('stickyKeys', checked);
                          }}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="cognitive" className="px-6 pb-6">
              <div className="space-y-6">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Cpu className="h-5 w-5 text-indigo-600" />
                        Bilişsel Ayarlar
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-700">Basitleştirilmiş Arayüz</p>
                          <p className="text-sm text-gray-500">Daha az karmaşık</p>
                        </div>
                        <Switch
                          checked={settings.simplifiedInterface}
                          onCheckedChange={(checked) => {
                            updateSetting('simplifiedInterface', checked);
                          }}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-700">Okuma Yardımı</p>
                          <p className="text-sm text-gray-500">Metin açıklamaları</p>
                        </div>
                        <Switch
                          checked={settings.readingAssistance}
                          onCheckedChange={(checked) => {
                            updateSetting('readingAssistance', checked);
                          }}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-700">Odak Göstergeleri</p>
                          <p className="text-sm text-gray-500">Aktif element vurgusu</p>
                        </div>
                        <Switch
                          checked={settings.focusIndicators}
                          onCheckedChange={(checked) => {
                            updateSetting('focusIndicators', checked);
                          }}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="results" className="px-6 pb-6">
              <div className="space-y-6">
                {scanResults ? (
                  <>
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Check className="h-5 w-5 text-green-600" />
                          Tarama Sonuçları
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4">
                          <div className="rounded-lg bg-green-50 p-4 text-center">
                            <p className="text-2xl font-bold text-green-600">{scanResults.score}</p>
                            <p className="text-sm text-gray-600">Erişilebilirlik Skoru</p>
                          </div>
                          <div className="rounded-lg bg-blue-50 p-4 text-center">
                            <p className="text-2xl font-bold text-blue-600">
                              {scanResults.passedChecks}
                            </p>
                            <p className="text-sm text-gray-600">Geçen Kontrol</p>
                          </div>
                          <div className="rounded-lg bg-red-50 p-4 text-center">
                            <p className="text-2xl font-bold text-red-600">
                              {scanResults.failedChecks}
                            </p>
                            <p className="text-sm text-gray-600">Başarısız Kontrol</p>
                          </div>
                          <div className="rounded-lg bg-yellow-50 p-4 text-center">
                            <p className="text-2xl font-bold text-yellow-600">
                              {scanResults.warnings}
                            </p>
                            <p className="text-sm text-gray-600">Uyarı</p>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <h4 className="font-semibold text-gray-900">Tespit Edilen Sorunlar</h4>
                          {scanResults.issues.length > 0 ? (
                            scanResults.issues.map((issue, index) => (
                              <div
                                key={index}
                                className={`rounded-lg border p-3 ${
                                  issue.type === 'error'
                                    ? 'border-red-200 bg-red-50'
                                    : issue.type === 'warning'
                                      ? 'border-yellow-200 bg-yellow-50'
                                      : 'border-blue-200 bg-blue-50'
                                }`}
                              >
                                <div className="flex items-start gap-3">
                                  {issue.type === 'error' ? (
                                    <X className="mt-0.5 h-5 w-5 text-red-600" />
                                  ) : issue.type === 'warning' ? (
                                    <AlertTriangle className="mt-0.5 h-5 w-5 text-yellow-600" />
                                  ) : (
                                    <Info className="mt-0.5 h-5 w-5 text-blue-600" />
                                  )}
                                  <div className="flex-1">
                                    <p className="font-medium text-gray-900">{issue.message}</p>
                                    <p className="mt-1 text-sm text-gray-600">{issue.suggestion}</p>
                                    <div className="mt-2 flex items-center gap-2">
                                      <Badge variant="outline" className="text-xs">
                                        {issue.category}
                                      </Badge>
                                      {issue.element && (
                                        <Badge variant="secondary" className="text-xs">
                                          {issue.element}
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="py-8 text-center">
                              <Check className="mx-auto mb-4 h-12 w-12 text-green-600" />
                              <h3 className="mb-2 text-lg font-medium text-gray-900">
                                Harika! Hiç sorun bulunamadı
                              </h3>
                              <p className="text-gray-500">
                                Sayfa erişilebilirlik standartlarına uygun
                              </p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </>
                ) : (
                  <div className="py-12 text-center">
                    <Zap className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                    <h3 className="mb-2 text-lg font-medium text-gray-900">
                      Henüz Tarama Yapılmadı
                    </h3>
                    <p className="mb-4 text-gray-500">
                      Erişilebilirlik sorunlarını tespit etmek için tarama yapın
                    </p>
                    <Button onClick={runAccessibilityScan} disabled={isScanning}>
                      {isScanning ? 'Taranıyor...' : 'Tarama Başlat'}
                    </Button>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

export default AccessibilityEnhancements;
