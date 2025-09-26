/**
 * @fileoverview ResponsiveConsistencyAnalyzer Module - Application module
 * 
 * @author Dernek Yönetim Sistemi Team
 * @version 1.0.0
 */

import React, { useState, useEffect } from 'react';
import { Monitor, Smartphone, Tablet, AlertTriangle, CheckCircle2, Info } from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { logger } from '../../lib/logging/logger';
// import { ResponsiveSection } from '../EnhancedResponsiveWrapper'; // File doesn't exist
// Using a simple div as fallback
const ResponsiveSection = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={className}>{children}</div>
);

/**
 * Responsive Consistency Analyzer
 * Mobil/Web arası tutarlılık sorunlarını tespit eder ve raporlar
 */
interface ConsistencyIssue {
  id: string;
  type: 'spacing' | 'typography' | 'layout' | 'navigation' | 'performance';
  severity: 'low' | 'medium' | 'high';
  title: string;
  description: string;
  recommendation: string;
  affectedDevices: ('mobile' | 'tablet' | 'desktop')[];
}

interface DeviceMetrics {
  screenWidth: number;
  screenHeight: number;
  devicePixelRatio: number;
  viewportWidth: number;
  viewportHeight: number;
  userAgent: string;
  touchSupport: boolean;
  orientation: 'portrait' | 'landscape';
}

/**
 * ResponsiveConsistencyAnalyzer function
 * 
 * @param {Object} params - Function parameters
 * @returns {void} Nothing
 */
export function ResponsiveConsistencyAnalyzer() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentDevice, setCurrentDevice] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');
  const [deviceMetrics, setDeviceMetrics] = useState<DeviceMetrics | null>(null);
  const [consistencyIssues, setConsistencyIssues] = useState<ConsistencyIssue[]>([]);
  const [analysisComplete, setAnalysisComplete] = useState(false);

  // Device detection and metrics collection
  useEffect(() => {
    const collectDeviceMetrics = () => {
      const metrics: DeviceMetrics = {
        screenWidth: window.screen.width,
        screenHeight: window.screen.height,
        devicePixelRatio: window.devicePixelRatio ?? 1,
        viewportWidth: window.innerWidth,
        viewportHeight: window.innerHeight,
        userAgent: navigator.userAgent,
        touchSupport: 'ontouchstart' in window,
        orientation: window.innerWidth > window.innerHeight ? 'landscape' : 'portrait',
      };

      setDeviceMetrics(metrics);

      // Determine device type
      if (metrics.viewportWidth < 768) {
        setCurrentDevice('mobile');
      } else if (metrics.viewportWidth < 1024) {
        setCurrentDevice('tablet');
      } else {
        setCurrentDevice('desktop');
      }
    };

    collectDeviceMetrics();
    window.addEventListener('resize', collectDeviceMetrics);
    window.addEventListener('orientationchange', collectDeviceMetrics);

    return () => {
      window.removeEventListener('resize', collectDeviceMetrics);
      window.removeEventListener('orientationchange', collectDeviceMetrics);
    };
  }, []);

  // Consistency analysis
  const analyzeConsistency = async () => {
    setIsAnalyzing(true);
    const issues: ConsistencyIssue[] = [];

    try {
      // Simulate analysis delay
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Analyze spacing consistency
      const spacingElements = document.querySelectorAll(
        '[class*="p-"], [class*="m-"], [class*="gap-"]',
      );
      if (spacingElements.length > 0) {
        // Check for inconsistent spacing patterns
        const hasInconsistentSpacing = Array.from(spacingElements).some((el) => {
          const classes = el.className;
          return !classes.includes('sm:') && !classes.includes('md:') && !classes.includes('lg:');
        });

        if (hasInconsistentSpacing) {
          issues.push({
            id: 'spacing-consistency',
            type: 'spacing',
            severity: 'medium',
            title: 'Spacing Tutarlılığı',
            description: 'Bazı elementlerde responsive spacing kullanılmamış',
            recommendation:
              'Tüm spacing değerlerinde responsive classes kullanın (p-4 sm:p-6 lg:p-8)',
            affectedDevices: ['mobile', 'tablet', 'desktop'],
          });
        }
      }

      // Analyze typography consistency
      const typographyElements = document.querySelectorAll('h1, h2, h3, h4, p, span');
      const hasInconsistentTypography = Array.from(typographyElements).some((el) => {
        const styles = getComputedStyle(el);
        const fontSize = parseInt(styles.fontSize);
        return fontSize < 16 && currentDevice === 'mobile'; // Mobile'da 16px altı problemli
      });

      if (hasInconsistentTypography) {
        issues.push({
          id: 'typography-consistency',
          type: 'typography',
          severity: 'high',
          title: 'Typography Tutarlılığı',
          description: 'Mobilde 16px altında font boyutları tespit edildi',
          recommendation: "Mobilde minimum 16px font size kullanarak zoom'u önleyin",
          affectedDevices: ['mobile'],
        });
      }

      // Analyze navigation consistency
      const mobileNav = document.querySelector('[class*="md:hidden"]');
      const desktopNav = document.querySelector(
        '[class*="hidden"][class*="md:flex"], [class*="hidden"][class*="md:block"]',
      );

      if (currentDevice === 'mobile' && !mobileNav) {
        issues.push({
          id: 'navigation-mobile',
          type: 'navigation',
          severity: 'high',
          title: 'Mobil Navigasyon Eksik',
          description: 'Mobil cihazlarda özel navigasyon bulunamadı',
          recommendation: 'Bottom navigation veya hamburger menu ekleyin',
          affectedDevices: ['mobile'],
        });
      }

      if (currentDevice === 'desktop' && !desktopNav) {
        issues.push({
          id: 'navigation-desktop',
          type: 'navigation',
          severity: 'medium',
          title: 'Desktop Navigasyon',
          description: 'Desktop için optimize edilmiş navigasyon kontrol edilmeli',
          recommendation: 'Sidebar veya horizontal navigation kullanın',
          affectedDevices: ['desktop'],
        });
      }

      // Analyze touch targets (mobile)
      if (currentDevice === 'mobile') {
        const buttons = document.querySelectorAll('button, a[role="button"], [onclick]');
        const smallButtons = Array.from(buttons).filter((btn) => {
          const rect = btn.getBoundingClientRect();
          return rect.width < 44 ?? rect.height < 44;
        });

        if (smallButtons.length > 0) {
          issues.push({
            id: 'touch-targets',
            type: 'layout',
            severity: 'high',
            title: 'Touch Target Boyutu',
            description: `${smallButtons.length} adet küçük touch target tespit edildi`,
            recommendation: "Touch target'ları minimum 44x44px yapın",
            affectedDevices: ['mobile'],
          });
        }
      }

      // Analyze performance on mobile
      if (
        currentDevice === 'mobile' &&
        deviceMetrics?.devicePixelRatio &&
        deviceMetrics.devicePixelRatio > 2
      ) {
        const images = document.querySelectorAll('img');
        const highResImages = Array.from(images).filter((img) => {
          return img.naturalWidth > window.innerWidth * 2;
        });

        if (highResImages.length > 3) {
          issues.push({
            id: 'image-optimization',
            type: 'performance',
            severity: 'medium',
            title: 'Görsel Optimizasyonu',
            description: 'Yüksek çözünürlükte görseller performansı etkileyebilir',
            recommendation: 'Responsive images ve lazy loading kullanın',
            affectedDevices: ['mobile'],
          });
        }
      }

      setConsistencyIssues(issues);
      setAnalysisComplete(true);
    } catch (error) {
      logger.error('Consistency analysis error:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'destructive';
      case 'medium':
        return 'warning';
      case 'low':
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'high':
        return <AlertTriangle className="w-4 h-4" />;
      case 'medium':
        return <Info className="w-4 h-4" />;
      case 'low':
        return <CheckCircle2 className="w-4 h-4" />;
      default:
        return <Info className="w-4 h-4" />;
    }
  };

  const getDeviceIcon = (device: string) => {
    switch (device) {
      case 'mobile':
        return <Smartphone className="w-4 h-4" />;
      case 'tablet':
        return <Tablet className="w-4 h-4" />;
      case 'desktop':
        return <Monitor className="w-4 h-4" />;
      default:
        return <Monitor className="w-4 h-4" />;
    }
  };

  return (
    <ResponsiveSection
      title="Responsive Tutarlılık Analizi"
      description="Mobil ve web arasındaki görünüm farklılıklarını analiz edin"
      spacing="lg"
    >
      {/* Current Device Info */}
      <Card className="p-4 border-l-4 border-l-blue-500">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            {getDeviceIcon(currentDevice)}
            <span className="font-medium">
              Mevcut Cihaz: {currentDevice.charAt(0).toUpperCase() + currentDevice.slice(1)}
            </span>
          </div>
          <Badge variant="outline">
            {deviceMetrics?.viewportWidth}x{deviceMetrics?.viewportHeight}
          </Badge>
        </div>

        {deviceMetrics && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-slate-600">Pixel Ratio:</span>
              <div className="font-medium">{deviceMetrics.devicePixelRatio}x</div>
            </div>
            <div>
              <span className="text-slate-600">Touch:</span>
              <div className="font-medium">
                {deviceMetrics.touchSupport ? 'Destekleniyor' : 'Desteklenmiyor'}
              </div>
            </div>
            <div>
              <span className="text-slate-600">Yön:</span>
              <div className="font-medium">
                {deviceMetrics.orientation === 'portrait' ? 'Dikey' : 'Yatay'}
              </div>
            </div>
            <div>
              <span className="text-slate-600">Ekran:</span>
              <div className="font-medium">
                {deviceMetrics.screenWidth}x{deviceMetrics.screenHeight}
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Analysis Controls */}
      <div className="flex items-center gap-4">
        <Button
          onClick={analyzeConsistency}
          disabled={isAnalyzing}
          className="flex items-center gap-2"
        >
          {isAnalyzing ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Analiz Yapılıyor...
            </>
          ) : (
            <>
              <AlertTriangle className="w-4 h-4" />
              Tutarlılık Analizi Başlat
            </>
          )}
        </Button>

        {analysisComplete && (
          <Badge variant="outline" className="flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            Analiz Tamamlandı
          </Badge>
        )}
      </div>

      {/* Analysis Results */}
      {analysisComplete && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Analiz Sonuçları</h3>
            <Badge variant={consistencyIssues.length === 0 ? 'default' : 'destructive'}>
              {consistencyIssues.length} Sorun Tespit Edildi
            </Badge>
          </div>

          {consistencyIssues.length === 0 ? (
            <Card className="p-6 text-center border-green-200 bg-green-50">
              <CheckCircle2 className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <h4 className="text-green-800 font-medium mb-1">Tutarlılık Mükemmel!</h4>
              <p className="text-green-700 text-sm">
                Mobil ve web arasında tutarlılık sounu tespit edilmedi.
              </p>
            </Card>
          ) : (
            <div className="space-y-3">
              {consistencyIssues.map((issue) => (
                <Card key={issue.id} className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {getSeverityIcon(issue.severity)}
                      <h4 className="font-medium">{issue.title}</h4>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={getSeverityColor(issue.severity) as any}>
                        {issue.severity.charAt(0).toUpperCase() + issue.severity.slice(1)}
                      </Badge>
                    </div>
                  </div>

                  <p className="text-sm text-slate-600 mb-3">{issue.description}</p>

                  <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg mb-3">
                    <h5 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-1">
                      Önerilen Çözüm:
                    </h5>
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      {issue.recommendation}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500">Etkilenen Cihazlar:</span>
                    {issue.affectedDevices.map((device) => (
                      <div key={device} className="flex items-center gap-1">
                        {getDeviceIcon(device)}
                        <span className="text-xs">{device}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Quick Fixes */}
      {consistencyIssues.length > 0 && (
        <Card className="p-4 bg-amber-50 border-amber-200">
          <h4 className="font-medium text-amber-800 mb-2">Hızlı Çözümler</h4>
          <div className="space-y-2 text-sm text-amber-700">
            <p>• Tüm spacing class'larında responsive prefixler kullanın (sm:, md:, lg:)</p>
            <p>• Touch target'ları minimum 44x44px yapın</p>
            <p>• Mobilde 16px altında font size kullanmaktan kaçının</p>
            <p>• Her breakpoint için test yapın</p>
          </div>
        </Card>
      )}
    </ResponsiveSection>
  );
}

export default ResponsiveConsistencyAnalyzer;
