import React, { useState, useEffect, useRef } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  X,
  Play,
  CheckCircle,
  Circle,
  Star,
  Zap,
  Users,
  Heart,
  Target,
} from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '../ui/dialog';
import { cn } from '../ui/utils';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  content: React.ReactNode;
  targetElement?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  tips?: string[];
  videoUrl?: string;
  estimatedTime?: string;
}

interface UserOnboardingFlowProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
  userRole?: 'admin' | 'moderator' | 'user';
  variant?: 'welcome' | 'feature' | 'update';
  className?: string;
}

const onboardingSteps: Record<string, OnboardingStep[]> = {
  welcome: [
    {
      id: 'welcome',
      title: 'Dernek Yönetim Sistemine Hoş Geldiniz! 🎉',
      description: 'Size sistemimizin temel özelliklerini tanıtacağız.',
      estimatedTime: '5-7 dakika',
      content: (
        <div className="space-y-6 text-center">
          <div className="w-20 h-20 mx-auto bg-gradient-to-br from-primary/20 to-primary/5 rounded-full flex items-center justify-center mb-6">
            <Star className="w-10 h-10 text-primary" />
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Modern Dernek Yönetimi</h3>
            <p className="text-muted-foreground leading-relaxed">
              Derneğinizin tüm işlemlerini tek yerden yönetin. İhtiyaç sahiplerinden bağışlara, üye
              takibinden mali işlere kadar her şey elinizin altında.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2 text-left">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>Mobil Uyumlu</span>
            </div>
            <div className="flex items-center gap-2 text-left">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>Güvenli & Hızlı</span>
            </div>
            <div className="flex items-center gap-2 text-left">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>Kolay Kullanım</span>
            </div>
            <div className="flex items-center gap-2 text-left">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>Kapsamlı Raporlama</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'dashboard',
      title: 'Ana Dashboard - Kontrol Merkezi',
      description: 'Tüm önemli bilgilere hızlıca erişin.',
      targetElement: '[data-onboarding="dashboard"]',
      content: (
        <div className="space-y-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Target className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold">Dashboard Özellikleri</h3>
              <p className="text-sm text-muted-foreground">İhtiyacınız olan her şey</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-emerald-100 rounded flex items-center justify-center flex-shrink-0 mt-0.5">
                <div className="w-2 h-2 bg-emerald-600 rounded-full" />
              </div>
              <div>
                <h4 className="text-sm font-medium">İstatistik Kartları</h4>
                <p className="text-xs text-muted-foreground">
                  Aktif yardımlar, toplam bağışlar, üye sayısı gibi önemli metrikleri görün
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-100 rounded flex items-center justify-center flex-shrink-0 mt-0.5">
                <div className="w-2 h-2 bg-blue-600 rounded-full" />
              </div>
              <div>
                <h4 className="text-sm font-medium">Son Aktiviteler</h4>
                <p className="text-xs text-muted-foreground">
                  Yeni başvurular, onaylar ve güncellemeleri takip edin
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-purple-100 rounded flex items-center justify-center flex-shrink-0 mt-0.5">
                <div className="w-2 h-2 bg-purple-600 rounded-full" />
              </div>
              <div>
                <h4 className="text-sm font-medium">Hızlı İşlemler</h4>
                <p className="text-xs text-muted-foreground">
                  Sık kullandığınız işlemlere tek tıkla erişin
                </p>
              </div>
            </div>
          </div>
        </div>
      ),
      tips: [
        'Kartların üzerine tıklayarak detaylı görünüme geçebilirsiniz',
        'Grafikler interaktiftir - üzerlerinde gezinerek detayları görün',
        'Dashboard düzenini kişiselleştirebilirsiniz',
      ],
    },
    {
      id: 'navigation',
      title: 'Kolay Navigasyon',
      description: 'Sol menü ile tüm modüllere erişin.',
      targetElement: '[data-onboarding="sidebar"]',
      content: (
        <div className="space-y-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <h3 className="font-semibold">11 Ana Modül</h3>
              <p className="text-sm text-muted-foreground">Her ihtiyacınız için</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Users className="w-3 h-3 text-blue-600" />
                <span>Yardım Yönetimi</span>
              </div>
              <div className="flex items-center gap-2">
                <Heart className="w-3 h-3 text-red-600" />
                <span>Bağış Takibi</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-3 h-3 text-green-600" />
                <span>Üye Yönetimi</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Target className="w-3 h-3 text-purple-600" />
                <span>Mali İşler</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-3 h-3 text-yellow-600" />
                <span>Hukuki Yardım</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-3 h-3 text-indigo-600" />
                <span>+6 Modül Daha</span>
              </div>
            </div>
          </div>
        </div>
      ),
      tips: [
        'Her modül kendi alt sayfalarına sahiptir',
        'Mobilde alt menü kullanın',
        'Favori sayfalarınızı işaretleyebilirsiniz',
      ],
    },
    {
      id: 'search',
      title: 'Akıllı Arama Sistemi',
      description: '⌘K ile her şeyi hızlıca bulun.',
      targetElement: '[data-onboarding="search"]',
      content: (
        <div className="space-y-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold">Güçlü Arama</h3>
              <p className="text-sm text-muted-foreground">İstediğinizi hemen bulun</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="p-3 bg-muted/30 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <kbd className="px-2 py-1 bg-background border rounded text-xs">⌘K</kbd>
                <span className="text-sm">Komut paletini açar</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Sayfalar, kayıtlar ve işlemler arasında arama yapabilirsiniz
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="text-center p-2 bg-blue-50 rounded">
                <div className="font-medium text-blue-900">Sayfalar</div>
                <div className="text-blue-600">Modüller ve alt sayfalar</div>
              </div>
              <div className="text-center p-2 bg-green-50 rounded">
                <div className="font-medium text-green-900">Kayıtlar</div>
                <div className="text-green-600">Kişiler, bağışlar vb.</div>
              </div>
              <div className="text-center p-2 bg-orange-50 rounded">
                <div className="font-medium text-orange-900">İşlemler</div>
                <div className="text-orange-600">Hızlı eylemler</div>
              </div>
              <div className="text-center p-2 bg-purple-50 rounded">
                <div className="font-medium text-purple-900">Yardım</div>
                <div className="text-purple-600">Rehberler ve ipuçları</div>
              </div>
            </div>
          </div>
        </div>
      ),
      action: {
        label: 'Aramayı Dene',
        onClick: () => {
          // Trigger search palette
          const event = new KeyboardEvent('keydown', {
            key: 'k',
            metaKey: true,
            bubbles: true,
          });
          document.dispatchEvent(event);
        },
      },
      tips: [
        'Arama yazırken öneriler otomatik gelir',
        'Geçmiş aramalarınız hatırlanır',
        'Filtreler ile sonuçları daraltabilirsiniz',
      ],
    },
    {
      id: 'mobile',
      title: 'Mobil Deneyim',
      description: 'Telefon ve tablette mükemmel çalışır.',
      content: (
        <div className="space-y-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h3 className="font-semibold">Her Cihazda Mükemmel</h3>
              <p className="text-sm text-muted-foreground">Responsive tasarım</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
              <h4 className="text-sm font-medium text-blue-900 mb-1">Dokunmatik Optimize</h4>
              <p className="text-xs text-blue-700">
                Minimum 44px dokunma alanları, gesture desteği
              </p>
            </div>

            <div className="p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg">
              <h4 className="text-sm font-medium text-green-900 mb-1">Hızlı Yükleme</h4>
              <p className="text-xs text-green-700">Optimize edilmiş performans, PWA desteği</p>
            </div>

            <div className="p-3 bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg">
              <h4 className="text-sm font-medium text-orange-900 mb-1">Offline Çalışma</h4>
              <p className="text-xs text-orange-700">
                İnternet bağlantısı olmadan da kullanabilirsiniz
              </p>
            </div>
          </div>
        </div>
      ),
      tips: [
        'Alt navigasyon mobilde aktif',
        'Pull-to-refresh ile sayfa yenileme',
        'Ana ekranda kısayol ekleyebilirsiniz',
      ],
    },
    {
      id: 'complete',
      title: 'Hazırsınız! 🚀',
      description: 'Artık sistemi kullanmaya başlayabilirsiniz.',
      content: (
        <div className="space-y-6 text-center">
          <div className="w-16 h-16 mx-auto bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-white" />
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-green-900">Tebrikler!</h3>
            <p className="text-muted-foreground leading-relaxed">
              Dernek yönetim sistemimizin temel özelliklerini öğrendiniz. Artık derneğinizi daha
              verimli yönetebilirsiniz.
            </p>
          </div>

          <div className="space-y-3">
            <div className="p-3 bg-blue-50 rounded-lg text-left">
              <div className="flex items-center gap-2 mb-1">
                <Star className="w-4 h-4 text-blue-600" />
                <span className="font-medium text-blue-900">İlk İpucu</span>
              </div>
              <p className="text-sm text-blue-700">
                ⌘K tuşları ile komut paletini açıp istediğinizi hızlıca bulabilirsiniz
              </p>
            </div>

            <div className="p-3 bg-emerald-50 rounded-lg text-left">
              <div className="flex items-center gap-2 mb-1">
                <Heart className="w-4 h-4 text-emerald-600" />
                <span className="font-medium text-emerald-900">Yardım</span>
              </div>
              <p className="text-sm text-emerald-700">
                Sağ üst köşedeki (?) simgesi ile her zaman yardım alabilirsiniz
              </p>
            </div>
          </div>

          <div className="pt-4">
            <Badge variant="secondary" className="text-sm">
              Kurulum tamamlandı ✓
            </Badge>
          </div>
        </div>
      ),
    },
  ],
};

export function UserOnboardingFlow({
  isOpen,
  onClose,
  onComplete,
  userRole = 'user',
  variant = 'welcome',
  className,
}: UserOnboardingFlowProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  const steps = onboardingSteps[variant] || onboardingSteps.welcome;
  const totalSteps = steps.length;
  const progress = ((currentStep + 1) / totalSteps) * 100;

  // Mark step as completed when viewed
  useEffect(() => {
    setCompletedSteps((prev) => new Set([...prev, currentStep]));
  }, [currentStep]);

  // Auto advance timer for certain steps
  useEffect(() => {
    if (!isOpen) return;

    const step = steps[currentStep];
    if (step?.id === 'welcome') {
      // Auto advance welcome step after 5 seconds unless user interacts
      const timer = setTimeout(() => {
        if (currentStep === 0) {
          setCurrentStep(1);
        }
      }, 5000);

      return () => {
        clearTimeout(timer);
      };
    }
  }, [currentStep, isOpen, steps]);

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    // Mark onboarding as completed in localStorage
    try {
      localStorage.setItem(
        'onboarding-completed',
        JSON.stringify({
          variant,
          completedAt: new Date().toISOString(),
          userRole,
          version: '1.0',
        }),
      );
    } catch (error) {
      console.warn('Error saving onboarding completion:', error);
    }

    onComplete();
    onClose();
  };

  const handleSkip = () => {
    onClose();
  };

  if (!isOpen) return null;

  const currentStepData = steps[currentStep];
  const isLastStep = currentStep === totalSteps - 1;
  const isFirstStep = currentStep === 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={cn('sm:max-w-lg p-0 gap-0', className)}>
        <DialogTitle className="sr-only">Kullanıcı Hoşgeldin Turu</DialogTitle>
        <DialogDescription className="sr-only">
          Sistem özelliklerini tanıtan interaktif rehber. {totalSteps} adımda temel özellikleri
          öğrenin.
        </DialogDescription>

        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              {Array.from({ length: totalSteps }, (_, index) => (
                <div
                  key={index}
                  className={cn(
                    'w-2 h-2 rounded-full transition-colors',
                    index <= currentStep ? 'bg-primary' : 'bg-muted',
                  )}
                />
              ))}
            </div>
            <span className="text-sm text-muted-foreground">
              {currentStep + 1} / {totalSteps}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSkip}
              className="text-muted-foreground"
            >
              Geç
            </Button>
            <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="px-4">
          <Progress value={progress} className="h-1" />
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="space-y-4">
            {/* Step Header */}
            <div className="text-center space-y-2">
              <h2 className="text-lg font-semibold leading-tight">{currentStepData.title}</h2>
              <p className="text-sm text-muted-foreground">{currentStepData.description}</p>
              {currentStepData.estimatedTime && (
                <Badge variant="outline" className="text-xs">
                  {currentStepData.estimatedTime}
                </Badge>
              )}
            </div>

            {/* Step Content */}
            <div className="py-4">{currentStepData.content}</div>

            {/* Action Button */}
            {currentStepData.action && (
              <div className="flex justify-center">
                <Button
                  variant="outline"
                  onClick={currentStepData.action.onClick}
                  className="gap-2"
                >
                  <Play className="w-4 h-4" />
                  {currentStepData.action.label}
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t bg-muted/20">
          <Button variant="ghost" onClick={handlePrevious} disabled={isFirstStep} className="gap-2">
            <ChevronLeft className="w-4 h-4" />
            Geri
          </Button>

          <div className="text-center">
            <div className="text-xs text-muted-foreground">
              {completedSteps.size} / {totalSteps} tamamlandı
            </div>
          </div>

          <Button onClick={handleNext} className="gap-2">
            {isLastStep ? 'Başla' : 'İleri'}
            {!isLastStep && <ChevronRight className="w-4 h-4" />}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default UserOnboardingFlow;
