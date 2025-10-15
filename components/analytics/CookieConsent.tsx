/**
 * @fileoverview Cookie Consent Component
 * @description GDPR compliant cookie consent banner with analytics opt-in/out
 */

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { X, Settings, Cookie, Shield, BarChart3, Mail } from 'lucide-react';
import { analytics } from '@/lib/analytics/analytics';

interface CookieConsentProps {
  onConsentChange?: (consent: CookieConsentState) => void;
  showSettings?: boolean;
  position?: 'top' | 'bottom';
  theme?: 'light' | 'dark';
}

interface CookieConsentState {
  necessary: boolean;
  functional: boolean;
  analytics: boolean;
  marketing: boolean;
  preferences: boolean;
}

const STORAGE_KEY = 'cookie_consent';

export function CookieConsent({
  onConsentChange,
  showSettings = false,
  position = 'bottom',
  theme = 'light'
}: CookieConsentProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [consent, setConsent] = useState<CookieConsentState>({
    necessary: true, // Always true
    functional: false,
    analytics: false,
    marketing: false,
    preferences: false
  });

  useEffect(() => {
    // Check if consent has been given before
    const savedConsent = localStorage.getItem(STORAGE_KEY);
    if (savedConsent) {
      const parsedConsent = JSON.parse(savedConsent);
      setConsent(parsedConsent);
      setIsVisible(false);
      
      // Update analytics consent
      analytics.updateConsent(parsedConsent);
    } else {
      setIsVisible(true);
    }
  }, []);

  const handleAcceptAll = () => {
    const newConsent: CookieConsentState = {
      necessary: true,
      functional: true,
      analytics: true,
      marketing: false, // Keep marketing false by default
      preferences: true
    };
    
    setConsent(newConsent);
    saveConsent(newConsent);
    setIsVisible(false);
    
    // Update analytics
    analytics.updateConsent(newConsent);
    onConsentChange?.(newConsent);
  };

  const handleRejectAll = () => {
    const newConsent: CookieConsentState = {
      necessary: true, // Always true
      functional: false,
      analytics: false,
      marketing: false,
      preferences: false
    };
    
    setConsent(newConsent);
    saveConsent(newConsent);
    setIsVisible(false);
    
    // Update analytics
    analytics.updateConsent(newConsent);
    onConsentChange?.(newConsent);
  };

  const handleSavePreferences = () => {
    saveConsent(consent);
    setIsVisible(false);
    setShowDetails(false);
    
    // Update analytics
    analytics.updateConsent(consent);
    onConsentChange?.(consent);
  };

  const saveConsent = (consentState: CookieConsentState) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(consentState));
  };

  const updateConsent = (key: keyof CookieConsentState, value: boolean) => {
    setConsent(prev => ({
      ...prev,
      [key]: value
    }));
  };

  if (!isVisible) {
    return null;
  }

  const bannerClasses = `
    fixed ${position === 'top' ? 'top-0' : 'bottom-0'} left-0 right-0 z-50
    ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}
    border-t border-gray-200 shadow-lg
    p-4 md:p-6
  `;

  return (
    <div className={bannerClasses}>
      <div className="max-w-7xl mx-auto">
        {!showDetails ? (
          // Simple banner
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-start gap-3 flex-1">
              <Cookie className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-lg mb-1">
                  Çerez Kullanımı
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Web sitemizde size en iyi deneyimi sunabilmek için çerezler kullanıyoruz. 
                  Gerekli çerezler site işlevselliği için zorunludur. 
                  Diğer çerezler isteğe bağlıdır.
                </p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDetails(true)}
                className="flex items-center gap-2"
              >
                <Settings className="w-4 h-4" />
                Ayarlar
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleRejectAll}
              >
                Reddet
              </Button>
              
              <Button
                size="sm"
                onClick={handleAcceptAll}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Kabul Et
              </Button>
            </div>
          </div>
        ) : (
          // Detailed settings
          <Card className="max-w-4xl mx-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Shield className="w-6 h-6 text-blue-600" />
                  <div>
                    <CardTitle>Çerez Ayarları</CardTitle>
                    <CardDescription>
                      Hangi çerezleri kabul etmek istediğinizi seçin
                    </CardDescription>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowDetails(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Necessary Cookies */}
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-green-600" />
                  <div>
                    <Label className="font-medium">Gerekli Çerezler</Label>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Site işlevselliği için zorunlu çerezler. Devre dışı bırakılamaz.
                    </p>
                  </div>
                </div>
                <Switch
                  checked={consent.necessary}
                  disabled
                  className="data-[state=checked]:bg-green-600"
                />
              </div>

              {/* Functional Cookies */}
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Settings className="w-5 h-5 text-blue-600" />
                  <div>
                    <Label className="font-medium">İşlevsel Çerezler</Label>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Gelişmiş özellikler ve kişiselleştirme için kullanılır.
                    </p>
                  </div>
                </div>
                <Switch
                  checked={consent.functional}
                  onCheckedChange={(checked) => updateConsent('functional', checked)}
                />
              </div>

              {/* Analytics Cookies */}
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <BarChart3 className="w-5 h-5 text-purple-600" />
                  <div>
                    <Label className="font-medium">Analitik Çerezler</Label>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Site kullanımını analiz etmek ve iyileştirmeler yapmak için kullanılır.
                    </p>
                  </div>
                </div>
                <Switch
                  checked={consent.analytics}
                  onCheckedChange={(checked) => updateConsent('analytics', checked)}
                />
              </div>

              {/* Marketing Cookies */}
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-orange-600" />
                  <div>
                    <Label className="font-medium">Pazarlama Çerezleri</Label>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Kişiselleştirilmiş reklamlar ve pazarlama kampanyaları için kullanılır.
                    </p>
                  </div>
                </div>
                <Switch
                  checked={consent.marketing}
                  onCheckedChange={(checked) => updateConsent('marketing', checked)}
                />
              </div>

              {/* Preferences Cookies */}
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Settings className="w-5 h-5 text-gray-600" />
                  <div>
                    <Label className="font-medium">Tercih Çerezleri</Label>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Kullanıcı tercihlerini ve ayarlarını hatırlamak için kullanılır.
                    </p>
                  </div>
                </div>
                <Switch
                  checked={consent.preferences}
                  onCheckedChange={(checked) => updateConsent('preferences', checked)}
                />
              </div>

              {/* Privacy Policy Link */}
              <div className="text-center text-sm text-gray-600 dark:text-gray-300">
                <p>
                  Çerez kullanımı hakkında daha fazla bilgi için{' '}
                  <a 
                    href="/privacy-policy" 
                    className="text-blue-600 hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Gizlilik Politikası
                  </a>
                  'mızı inceleyebilirsiniz.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 justify-end">
                <Button
                  variant="outline"
                  onClick={handleRejectAll}
                >
                  Tümünü Reddet
                </Button>
                
                <Button
                  onClick={handleSavePreferences}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Tercihleri Kaydet
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

// Hook for using cookie consent state
export function useCookieConsent() {
  const [consent, setConsent] = useState<CookieConsentState | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const savedConsent = localStorage.getItem(STORAGE_KEY);
    if (savedConsent) {
      setConsent(JSON.parse(savedConsent));
    }
    setIsLoaded(true);
  }, []);

  const updateConsent = (newConsent: CookieConsentState) => {
    setConsent(newConsent);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newConsent));
    analytics.updateConsent(newConsent);
  };

  const hasConsent = (type: keyof CookieConsentState) => {
    return consent?.[type] ?? false;
  };

  return {
    consent,
    isLoaded,
    updateConsent,
    hasConsent,
    hasAnalyticsConsent: hasConsent('analytics'),
    hasMarketingConsent: hasConsent('marketing'),
    hasFunctionalConsent: hasConsent('functional'),
    hasPreferencesConsent: hasConsent('preferences')
  };
}

export default CookieConsent;
