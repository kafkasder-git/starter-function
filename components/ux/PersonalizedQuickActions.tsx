/**
 * @fileoverview PersonalizedQuickActions Module - Application module
 * 
 * @author Dernek Yönetim Sistemi Team
 * @version 1.0.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  Plus,
  Star,
  Clock,
  TrendingUp,
  Users,
  Heart,
  DollarSign,
  Calendar,
  FileText,
  Settings,
  Zap,
} from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { cn } from '../ui/utils';

import { logger } from '../../lib/logging/logger';
interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  category: 'frequent' | 'recent' | 'suggested' | 'favorite';
  priority: number;
  usage_count: number;
  last_used?: Date;
  estimated_time?: string;
  onExecute: () => void;
  shortcuts?: string;
  requiresContext?: boolean;
  contextData?: any;
}

interface PersonalizedQuickActionsProps {
  currentModule?: string;
  currentContext?: any;
  onQuickAction?: (actionId: string, data?: any) => void;
  onNavigate?: (module: string, page?: string) => void;
  className?: string;
}

/**
 * PersonalizedQuickActions function
 * 
 * @param {Object} params - Function parameters
 * @returns {void} Nothing
 */
export function PersonalizedQuickActions({
  currentModule = 'genel',
  currentContext: _currentContext,
  onQuickAction,
  onNavigate,
  className,
}: PersonalizedQuickActionsProps) {
  const [userPreferences, setUserPreferences] = useState<Record<string, any>>({});
  const [selectedAction, setSelectedAction] = useState<QuickAction | null>(null);
  const [showActionDialog, setShowActionDialog] = useState(false);

  // Load user preferences from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('quick-actions-preferences');
      if (saved) {
        setUserPreferences(JSON.parse(saved));
      }
    } catch (error) {
      logger.warn('Error loading quick actions preferences:', error);
    }
  }, []);

  // Save preferences when they change
  const updatePreferences = (updates: Record<string, any>) => {
    const newPrefs = { ...userPreferences, ...updates };
    setUserPreferences(newPrefs);
    try {
      localStorage.setItem('quick-actions-preferences', JSON.stringify(newPrefs));
    } catch (error) {
      logger.warn('Error saving quick actions preferences:', error);
    }
  };

  // Track action usage
  const trackAction = (actionId: string) => {
    const usage = userPreferences.usage || {};
    updatePreferences({
      usage: {
        ...usage,
        [actionId]: {
          count: (usage[actionId]?.count ?? 0) + 1,
          lastUsed: new Date().toISOString(),
        },
      },
    });
  };

  // Define all available actions
  const allActions: QuickAction[] = useMemo(
    () => [
      // Beneficiary Actions
      {
        id: 'new-beneficiary',
        title: 'Yeni İhtiyaç Sahibi',
        description: 'Hızlı başvuru kaydı oluştur',
        icon: <Users className="w-4 h-4" />,
        category: 'frequent',
        priority: 10,
        usage_count: userPreferences.usage?.['new-beneficiary']?.count ?? 0,
        last_used: userPreferences.usage?.['new-beneficiary']?.lastUsed
          ? new Date(userPreferences.usage['new-beneficiary'].lastUsed)
          : undefined,
        estimated_time: '3-5 dk',
        shortcuts: '⌘+N',
        onExecute: () => {
          trackAction('new-beneficiary');
          onQuickAction?.('new-beneficiary');
        },
      },
      {
        id: 'approve-applications',
        title: 'Başvuru Onayları',
        description: 'Bekleyen başvuruları incele',
        icon: <FileText className="w-4 h-4" />,
        category: 'recent',
        priority: 9,
        usage_count: userPreferences.usage?.['approve-applications']?.count ?? 0,
        onExecute: () => {
          trackAction('approve-applications');
          onNavigate?.('yardim', '/yardim/basvurular');
        },
      },

      // Donation Actions
      {
        id: 'record-donation',
        title: 'Bağış Kaydı',
        description: 'Yeni bağış girişi yap',
        icon: <Heart className="w-4 h-4" />,
        category: 'frequent',
        priority: 9,
        usage_count: userPreferences.usage?.['record-donation']?.count ?? 0,
        estimated_time: '2-3 dk',
        shortcuts: '⌘+D',
        onExecute: () => {
          trackAction('record-donation');
          onQuickAction?.('record-donation');
        },
      },
      {
        id: 'donation-receipt',
        title: 'Makbuz Oluştur',
        description: 'Bağış makbuzu hazırla',
        icon: <FileText className="w-4 h-4" />,
        category: 'frequent',
        priority: 8,
        usage_count: userPreferences.usage?.['donation-receipt']?.count ?? 0,
        onExecute: () => {
          trackAction('donation-receipt');
          logger.info('Generate receipt');
        },
      },

      // Member Actions
      {
        id: 'new-member',
        title: 'Üye Kaydı',
        description: 'Yeni dernek üyesi ekle',
        icon: <Users className="w-4 h-4" />,
        category: 'frequent',
        priority: 8,
        usage_count: userPreferences.usage?.['new-member']?.count ?? 0,
        estimated_time: '5-7 dk',
        onExecute: () => {
          trackAction('new-member');
          onNavigate?.('uye', '/uye/yeni');
        },
      },
      {
        id: 'member-dues',
        title: 'Aidat Takibi',
        description: 'Üye aidatlarını kontrol et',
        icon: <DollarSign className="w-4 h-4" />,
        category: 'suggested',
        priority: 7,
        usage_count: userPreferences.usage?.['member-dues']?.count ?? 0,
        onExecute: () => {
          trackAction('member-dues');
          onNavigate?.('uye', '/uye/aidat');
        },
      },

      // Financial Actions
      {
        id: 'expense-entry',
        title: 'Gider Girişi',
        description: 'Yeni gider kaydı oluştur',
        icon: <DollarSign className="w-4 h-4" />,
        category: 'frequent',
        priority: 7,
        usage_count: userPreferences.usage?.['expense-entry']?.count ?? 0,
        estimated_time: '2-4 dk',
        onExecute: () => {
          trackAction('expense-entry');
          onQuickAction?.('expense-entry');
        },
      },
      {
        id: 'financial-report',
        title: 'Mali Rapor',
        description: 'Aylık gelir-gider raporu',
        icon: <TrendingUp className="w-4 h-4" />,
        category: 'suggested',
        priority: 6,
        usage_count: userPreferences.usage?.['financial-report']?.count ?? 0,
        onExecute: () => {
          trackAction('financial-report');
          onNavigate?.('fon', '/fon/raporlar');
        },
      },

      // Event Actions
      {
        id: 'new-event',
        title: 'Etkinlik Planlama',
        description: 'Yeni etkinlik oluştur',
        icon: <Calendar className="w-4 h-4" />,
        category: 'recent',
        priority: 6,
        usage_count: userPreferences.usage?.['new-event']?.count ?? 0,
        estimated_time: '10-15 dk',
        onExecute: () => {
          trackAction('new-event');
          onNavigate?.('is', '/is/etkinlikler');
        },
      },

      // System Actions
      {
        id: 'backup-data',
        title: 'Veri Yedeği',
        description: 'Sistem verilerini yedekle',
        icon: <Settings className="w-4 h-4" />,
        category: 'suggested',
        priority: 5,
        usage_count: userPreferences.usage?.['backup-data']?.count ?? 0,
        onExecute: () => {
          trackAction('backup-data');
          logger.info('Start backup process');
        },
      },
    ],
    [userPreferences.usage, onQuickAction, onNavigate],
  );

  // Filter and sort actions based on context and usage
  const personalizedActions = useMemo(() => {
    let filtered = [...allActions];

    // Context-based filtering
    if (currentModule !== 'genel') {
      filtered = filtered.filter((action) => {
        const moduleMap: Record<string, string[]> = {
          yardim: ['new-beneficiary', 'approve-applications'],
          bagis: ['record-donation', 'donation-receipt'],
          uye: ['new-member', 'member-dues'],
          fon: ['expense-entry', 'financial-report'],
          is: ['new-event'],
        };

        const relevantActions = moduleMap[currentModule] || [];
        return relevantActions.includes(action.id) || action.category === 'favorite';
      });
    }

    // Sort by usage and priority
    filtered.sort((a, b) => {
      const aUsage = userPreferences.usage?.[a.id]?.count ?? 0;
      const bUsage = userPreferences.usage?.[b.id]?.count ?? 0;

      // Recently used items get priority
      if (aUsage > 0 && bUsage > 0) {
        const aLastUsed = new Date(userPreferences.usage[a.id]?.lastUsed ?? 0);
        const bLastUsed = new Date(userPreferences.usage[b.id]?.lastUsed ?? 0);

        if (Math.abs(aLastUsed.getTime() - bLastUsed.getTime()) < 24 * 60 * 60 * 1000) {
          return bUsage - aUsage; // Sort by usage if recently used
        }

        return bLastUsed.getTime() - aLastUsed.getTime(); // Sort by recency
      }

      // Fall back to priority and usage
      return b.priority + bUsage * 0.1 - (a.priority + aUsage * 0.1);
    });

    return filtered.slice(0, 6); // Show top 6 actions
  }, [allActions, currentModule, userPreferences]);

  const getCategoryIcon = (category: QuickAction['category']) => {
    switch (category) {
      case 'frequent':
        return <Zap className="w-3 h-3" />;
      case 'recent':
        return <Clock className="w-3 h-3" />;
      case 'suggested':
        return <TrendingUp className="w-3 h-3" />;
      case 'favorite':
        return <Star className="w-3 h-3" />;
      default:
        return <Plus className="w-3 h-3" />;
    }
  };

  const getCategoryColor = (category: QuickAction['category']) => {
    switch (category) {
      case 'frequent':
        return 'text-amber-600 bg-amber-50 border-amber-200';
      case 'recent':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'suggested':
        return 'text-emerald-600 bg-emerald-50 border-emerald-200';
      case 'favorite':
        return 'text-pink-600 bg-pink-50 border-pink-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const _getCategoryLabel = (category: QuickAction['category']) => {
    switch (category) {
      case 'frequent':
        return 'Sık Kullanılan';
      case 'recent':
        return 'Son Kullanılan';
      case 'suggested':
        return 'Önerilen';
      case 'favorite':
        return 'Favoriler';
      default:
        return 'Diğer';
    }
  };

  const handleActionClick = (action: QuickAction) => {
    if (action.requiresContext) {
      setSelectedAction(action);
      setShowActionDialog(true);
    } else {
      action.onExecute();
    }
  };

  const executeAction = () => {
    if (selectedAction) {
      selectedAction.onExecute();
      setShowActionDialog(false);
      setSelectedAction(null);
    }
  };

  return (
    <>
      <Card className={cn('h-full', className)}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Hızlı İşlemler</CardTitle>
            <Badge variant="outline" className="text-xs">
              Kişiselleştirilmiş
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-3 pt-0">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {personalizedActions.map((action) => (
              <Button
                key={action.id}
                variant="outline"
                className={cn(
                  'h-auto p-3 flex flex-col items-start gap-2 hover:bg-accent/50',
                  'transition-all duration-200 group',
                )}
                onClick={() => {
                  handleActionClick(action);
                }}
              >
                <div className="w-full flex items-center justify-between">
                  <div className="w-8 h-8 rounded-md bg-muted/50 flex items-center justify-center group-hover:bg-muted transition-colors">
                    {action.icon}
                  </div>
                  <div className="flex items-center gap-1">
                    <div
                      className={cn(
                        'px-1.5 py-0.5 rounded-md border text-xs flex items-center gap-1',
                        getCategoryColor(action.category),
                      )}
                    >
                      {getCategoryIcon(action.category)}
                    </div>
                    {action.usage_count > 0 && (
                      <Badge variant="secondary" className="text-xs h-4 px-1">
                        {action.usage_count}
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="w-full text-left">
                  <h4 className="font-medium text-sm mb-1 line-clamp-1">{action.title}</h4>
                  <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                    {action.description}
                  </p>
                </div>

                <div className="w-full flex items-center justify-between text-xs text-muted-foreground mt-1">
                  {action.estimated_time && <span>{action.estimated_time}</span>}
                  {action.shortcuts && (
                    <kbd className="px-1 py-0.5 bg-muted border border-border rounded text-xs font-mono">
                      {action.shortcuts}
                    </kbd>
                  )}
                </div>
              </Button>
            ))}
          </div>

          {personalizedActions.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Plus className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Bu modül için henüz hızlı işlem bulunamadı</p>
              <p className="text-xs mt-1">Sistem kullanımınıza göre öneriler gelişecek</p>
            </div>
          )}

          <div className="mt-3 pt-3 border-t border-border">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{currentModule !== 'genel' && `${currentModule} modülü`}</span>
              <span>Son güncelleme: Az önce</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Confirmation Dialog */}
      <Dialog open={showActionDialog} onOpenChange={setShowActionDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedAction?.icon}
              {selectedAction?.title}
            </DialogTitle>
            <DialogDescription>{selectedAction?.description}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Tahmini süre:</span>
              <Badge variant="outline">{selectedAction?.estimated_time ?? '1-2 dk'}</Badge>
            </div>

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowActionDialog(false);
                }}
              >
                İptal
              </Button>
              <Button onClick={executeAction}>Başlat</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default PersonalizedQuickActions;
