/**
 * @fileoverview ContextualTooltipSystem Module - Application module
 * 
 * @author Dernek Yönetim Sistemi Team
 * @version 1.0.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { HelpCircle, Info, Lightbulb, Zap, X, ChevronRight } from 'lucide-react';
import { Button } from '../ui/button';
import { cn } from '../ui/utils';

import { logger } from '../../lib/logging/logger';
interface TooltipContent {
  id: string;
  title: string;
  description: string;
  tips?: string[];
  shortcuts?: {
    key: string;
    description: string;
  }[];
  relatedActions?: {
    label: string;
    action: () => void;
  }[];
  learnMoreUrl?: string;
}

interface SmartTooltipProps {
  children: React.ReactNode;
  content: TooltipContent;
  position?: 'top' | 'bottom' | 'left' | 'right';
  triggerOn?: 'hover' | 'click' | 'focus';
  delay?: number;
  disabled?: boolean;
  className?: string;
}

/**
 * SmartTooltip function
 * 
 * @param {Object} params - Function parameters
 * @returns {void} Nothing
 */
export function SmartTooltip({
  children,
  content,
  position = 'top',
  triggerOn = 'hover',
  delay = 500,
  disabled = false,
  className,
}: SmartTooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const showTooltip = () => {
    if (disabled) return;

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
    }, delay);
  };

  const hideTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
    setIsExpanded(false);
  };

  const toggleTooltip = () => {
    if (disabled) return;
    setIsVisible(!isVisible);
  };

  const getPositionClasses = () => {
    const base = 'absolute z-50 ';

    switch (position) {
      case 'top':
        return `${base  }bottom-full left-1/2 transform -translate-x-1/2 mb-2`;
      case 'bottom':
        return `${base  }top-full left-1/2 transform -translate-x-1/2 mt-2`;
      case 'left':
        return `${base  }right-full top-1/2 transform -translate-y-1/2 mr-2`;
      case 'right':
        return `${base  }left-full top-1/2 transform -translate-y-1/2 ml-2`;
      default:
        return `${base  }bottom-full left-1/2 transform -translate-x-1/2 mb-2`;
    }
  };

  const getArrowClasses = () => {
    const base = 'absolute w-2 h-2 bg-popover border rotate-45 ';

    switch (position) {
      case 'top':
        return (
          `${base 
          }top-full left-1/2 transform -translate-x-1/2 -translate-y-1/2 border-t-0 border-l-0`
        );
      case 'bottom':
        return (
          `${base 
          }bottom-full left-1/2 transform -translate-x-1/2 translate-y-1/2 border-b-0 border-r-0`
        );
      case 'left':
        return (
          `${base 
          }left-full top-1/2 transform -translate-x-1/2 -translate-y-1/2 border-l-0 border-b-0`
        );
      case 'right':
        return (
          `${base 
          }right-full top-1/2 transform translate-x-1/2 -translate-y-1/2 border-r-0 border-t-0`
        );
      default:
        return (
          `${base 
          }top-full left-1/2 transform -translate-x-1/2 -translate-y-1/2 border-t-0 border-l-0`
        );
    }
  };

  const triggerProps = {
    ...(triggerOn === 'hover' && {
      onMouseEnter: showTooltip,
      onMouseLeave: hideTooltip,
    }),
    ...(triggerOn === 'click' && {
      onClick: toggleTooltip,
    }),
    ...(triggerOn === 'focus' && {
      onFocus: showTooltip,
      onBlur: hideTooltip,
    }),
  };

  return (
    <div ref={triggerRef} className={cn('relative inline-block', className)}>
      <div {...triggerProps}>{children}</div>

      {isVisible && (
        <div
          ref={tooltipRef}
          className={cn(
            getPositionClasses(),
            'w-80 max-w-sm bg-popover border border-border rounded-lg shadow-lg overflow-hidden',
            'animate-in fade-in-0 zoom-in-95 duration-200',
          )}
          onMouseEnter={() => {
            if (timeoutRef.current) {
              clearTimeout(timeoutRef.current);
            }
          }}
          onMouseLeave={hideTooltip}
        >
          <div className={getArrowClasses()} />

          {/* Header */}
          <div className="flex items-center justify-between p-3 border-b border-border">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-primary" />
              <h4 className="font-medium text-sm">{content.title}</h4>
            </div>
            <div className="flex items-center gap-1">
              {content.tips && content.tips.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setIsExpanded(!isExpanded);
                  }}
                  className="h-6 w-6 p-0"
                >
                  <ChevronRight
                    className={cn('w-3 h-3 transition-transform', isExpanded && 'rotate-90')}
                  />
                </Button>
              )}
              <Button variant="ghost" size="sm" onClick={hideTooltip} className="h-6 w-6 p-0">
                <X className="w-3 h-3" />
              </Button>
            </div>
          </div>

          {/* Content */}
          <div className="p-3 space-y-3">
            <p className="text-sm text-muted-foreground leading-relaxed">{content.description}</p>

            {/* Shortcuts */}
            {content.shortcuts && content.shortcuts.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-1">
                  <Zap className="w-3 h-3 text-amber-500" />
                  <span className="text-xs font-medium">Kısayollar</span>
                </div>
                <div className="space-y-1">
                  {content.shortcuts.map((shortcut, index) => (
                    <div key={index} className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">{shortcut.description}</span>
                      <kbd className="px-1.5 py-0.5 bg-muted border border-border rounded text-xs font-mono">
                        {shortcut.key}
                      </kbd>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tips (Expanded) */}
            {content.tips && content.tips.length > 0 && isExpanded && (
              <div className="space-y-2 pt-2 border-t border-border">
                <div className="flex items-center gap-1">
                  <Lightbulb className="w-3 h-3 text-yellow-500" />
                  <span className="text-xs font-medium">İpuçları</span>
                </div>
                <ul className="space-y-1 text-xs text-muted-foreground">
                  {content.tips.map((tip, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="w-1 h-1 bg-primary rounded-full flex-shrink-0 mt-1.5" />
                      <span className="leading-relaxed">{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Related Actions */}
            {content.relatedActions && content.relatedActions.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-border">
                <span className="text-xs font-medium">Hızlı İşlemler</span>
                <div className="flex flex-wrap gap-1">
                  {content.relatedActions.map((action, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        action.action();
                        hideTooltip();
                      }}
                      className="h-7 px-2 text-xs"
                    >
                      {action.label}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Contextual Help System
interface ContextualHelpProps {
  context: 'dashboard' | 'beneficiaries' | 'donations' | 'members' | 'finance' | 'general';
  className?: string;
}

/**
 * ContextualHelp function
 * 
 * @param {Object} params - Function parameters
 * @returns {void} Nothing
 */
export function ContextualHelp({ context, className }: ContextualHelpProps) {
  const getContextualContent = (): TooltipContent => {
    const baseContent = {
      dashboard: {
        id: 'help-dashboard',
        title: 'Ana Dashboard Yardımı',
        description:
          'Dernek faaliyetlerinizin genel durumunu buradan takip edebilirsiniz. Kartlar üzerinde detaylı bilgi almak için üzerlerine tıklayın.',
        tips: [
          'Grafikleri tıklayarak detaylarını görüntüleyebilirsiniz',
          'Son aktiviteler bölümünden hızlıca işlemlerinizi takip edin',
          'Önemli metrikler için bildirimleri etkinleştirin',
        ],
        shortcuts: [
          { key: '⌘+K', description: 'Komut paletini aç' },
          { key: '⌘+/', description: 'Yardım merkezi' },
        ],
        relatedActions: [
          {
            label: 'Rapor Oluştur',
            action: () => {
              logger.info('Create report');
            },
          },
          {
            label: 'Ayarları Aç',
            action: () => {
              logger.info('Open settings');
            },
          },
        ],
      },
      beneficiaries: {
        id: 'help-beneficiaries',
        title: 'İhtiyaç Sahipleri Yönetimi',
        description:
          'Yardım talebinde bulunan kişileri kaydedin, başvurularını takip edin ve yardım süreçlerini yönetin.',
        tips: [
          'Filtreleme özelliğini kullanarak hızlıca kişi bulun',
          "Toplu işlemler için checkbox'ları kullanın",
          'Detay sayfasında tüm başvuru geçmişini görebilirsiniz',
        ],
        shortcuts: [
          { key: '⌘+N', description: 'Yeni kayıt ekle' },
          { key: '⌘+F', description: 'Ara ve filtrele' },
        ],
        relatedActions: [
          {
            label: 'Yeni Başvuru',
            action: () => {
              logger.info('New application');
            },
          },
          {
            label: 'Rapor Al',
            action: () => {
              logger.info('Export report');
            },
          },
        ],
      },
      donations: {
        id: 'help-donations',
        title: 'Bağış Yönetimi',
        description:
          'Gelen bağışları kaydedin, takip edin ve raporlayın. Bağışçı bilgilerini güvenli şekilde saklayın.',
        tips: [
          'Düzenli bağışçıları favorilere ekleyin',
          'Makbuz numaralarını takip etmeyi unutmayın',
          'Aylık bağış raporlarını düzenli oluşturun',
        ],
        shortcuts: [
          { key: '⌘+D', description: 'Yeni bağış kaydı' },
          { key: '⌘+R', description: 'Rapor oluştur' },
        ],
      },
      members: {
        id: 'help-members',
        title: 'Üye Yönetimi',
        description:
          'Dernek üyelerini kaydedin, aidat takiplerini yapın ve üyelik işlemlerini yönetin.',
        tips: [
          'Üye kategorilerini kullanarak organizasyon sağlayın',
          'Aidat hatırlatmalarını otomatikleştirin',
          'Üye haklarını ve sorumluluklarını belirleyin',
        ],
        shortcuts: [
          { key: '⌘+M', description: 'Yeni üye ekle' },
          { key: '⌘+A', description: 'Aidat takibi' },
        ],
      },
      finance: {
        id: 'help-finance',
        title: 'Mali İşler',
        description:
          'Dernek gelir-giderlerini takip edin, bütçe planlaması yapın ve mali raporlar oluşturun.',
        tips: [
          'Tüm giderleri kategorilere ayırın',
          'Aylık mali raporları düzenli hazırlayın',
          'Bütçe limitlerini belirlemeyi unutmayın',
        ],
        shortcuts: [
          { key: '⌘+E', description: 'Gider kaydı' },
          { key: '⌘+I', description: 'Gelir kaydı' },
        ],
      },
      general: {
        id: 'help-general',
        title: 'Genel Yardım',
        description: 'Sistem kullanımı hakkında genel bilgiler ve ipuçları.',
        tips: [
          'Sol menüden tüm modüllere erişebilirsiniz',
          'Sağ üst köşedeki bildirimlerinizi kontrol edin',
          'Arama çubuğunu kullanarak hızlıca bulun',
        ],
        shortcuts: [
          { key: '⌘+K', description: 'Komut paleti' },
          { key: '⌘+?', description: 'Yardım' },
        ],
      },
    };

    return baseContent[context] ?? baseContent.general;
  };

  return (
    <SmartTooltip
      content={getContextualContent()}
      position="bottom"
      triggerOn="click"
      className={className}
    >
      <Button
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
      >
        <HelpCircle className="h-4 w-4" />
        <span className="sr-only">Yardım</span>
      </Button>
    </SmartTooltip>
  );
}

export default SmartTooltip;
