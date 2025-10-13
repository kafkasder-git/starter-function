/**
 * @fileoverview SmartCommandPalette Module - Application module
 *
 * @author Dernek Yönetim Sistemi Team
 * @version 1.0.0
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Search,
  Zap,
  Users,
  Heart,
  DollarSign,
  Settings,
  HelpCircle,
  BookOpen,
  Shield,
  Calendar,
  UserPlus,
  BarChart3,
} from 'lucide-react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '../ui/dialog';
import { Badge } from '../ui/badge';
import { cn } from '../ui/utils';

import { logger } from '../../lib/logging/logger';
interface CommandItem {
  id: string;
  title: string;
  description: string;
  category: 'navigation' | 'action' | 'search' | 'help';
  icon: React.ReactNode;
  shortcut?: string;
  onExecute: () => void;
  keywords: string[];
  priority: number;
}

interface SmartCommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate?: (module: string, page?: string) => void;
  onQuickAction?: (actionId: string) => void;
  currentModule?: string;
}

/**
 * SmartCommandPalette function
 *
 * @param {Object} params - Function parameters
 * @returns {void} Nothing
 */
export function SmartCommandPalette({
  isOpen,
  onClose,
  onNavigate,
  onQuickAction,
  currentModule = 'genel',
}: SmartCommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Comprehensive command database
  const commands: CommandItem[] = useMemo(
    () => [
      // Navigation Commands
      {
        id: 'nav-dashboard',
        title: 'Ana Dashboard',
        description: 'Sistem genel durumu ve istatistikler',
        category: 'navigation',
        icon: <Zap className="w-4 h-4" />,
        onExecute: () => onNavigate?.('genel'),
        keywords: ['dashboard', 'ana', 'genel', 'istatistik', 'özet'],
        priority: 10,
      },
      {
        id: 'nav-beneficiaries',
        title: 'İhtiyaç Sahipleri',
        description: 'Yardım alan kişileri yönet',
        category: 'navigation',
        icon: <Users className="w-4 h-4" />,
        onExecute: () => onNavigate?.('yardim', '/yardim/ihtiyac-sahipleri'),
        keywords: ['ihtiyaç', 'yardım', 'sahipleri', 'beneficiary', 'kişiler'],
        priority: 9,
      },
      {
        id: 'nav-donations',
        title: 'Bağışlar',
        description: 'Gelen bağışları takip et',
        category: 'navigation',
        icon: <Heart className="w-4 h-4" />,
        onExecute: () => onNavigate?.('bagis', '/bagis/liste'),
        keywords: ['bağış', 'donation', 'yardım', 'gelir'],
        priority: 9,
      },
      {
        id: 'nav-members',
        title: 'Üye Yönetimi',
        description: 'Dernek üyelerini yönet',
        category: 'navigation',
        icon: <Users className="w-4 h-4" />,
        onExecute: () => onNavigate?.('uye', '/uye/liste'),
        keywords: ['üye', 'member', 'kişiler', 'yönetim'],
        priority: 8,
      },
      {
        id: 'nav-finance',
        title: 'Mali İşler',
        description: 'Gelir-gider ve raporlar',
        category: 'navigation',
        icon: <DollarSign className="w-4 h-4" />,
        onExecute: () => onNavigate?.('fon', '/fon/gelir-gider'),
        keywords: ['mali', 'para', 'gelir', 'gider', 'finans', 'muhasebe'],
        priority: 8,
      },
      {
        id: 'nav-legal',
        title: 'Hukuki Yardım',
        description: 'Hukuki destek ve takip',
        category: 'navigation',
        icon: <Shield className="w-4 h-4" />,
        onExecute: () => onNavigate?.('hukuki', '/hukuki/danismanlik'),
        keywords: ['hukuk', 'avukat', 'dava', 'legal', 'yardım'],
        priority: 7,
      },
      {
        id: 'nav-events',
        title: 'Etkinlikler',
        description: 'Dernek etkinlikleri ve toplantılar',
        category: 'navigation',
        icon: <Calendar className="w-4 h-4" />,
        onExecute: () => onNavigate?.('is', '/is/etkinlikler'),
        keywords: ['etkinlik', 'event', 'toplantı', 'meeting', 'program'],
        priority: 7,
      },

      // Quick Actions
      {
        id: 'action-new-beneficiary',
        title: 'Yeni İhtiyaç Sahibi Ekle',
        description: 'Hızlı yardım başvurusu kaydı',
        category: 'action',
        icon: <UserPlus className="w-4 h-4" />,
        shortcut: '⌘+N',
        onExecute: () => onQuickAction?.('new-beneficiary'),
        keywords: ['yeni', 'ekle', 'ihtiyaç', 'başvuru', 'kayıt'],
        priority: 9,
      },
      {
        id: 'action-new-donation',
        title: 'Bağış Kaydı',
        description: 'Yeni bağış girişi yap',
        category: 'action',
        icon: <Heart className="w-4 h-4" />,
        shortcut: '⌘+D',
        onExecute: () => onQuickAction?.('new-donation'),
        keywords: ['bağış', 'kayıt', 'yeni', 'giriş'],
        priority: 8,
      },
      {
        id: 'action-new-member',
        title: 'Üye Kaydı',
        description: 'Yeni dernek üyesi kaydet',
        category: 'action',
        icon: <UserPlus className="w-4 h-4" />,
        onExecute: () => onQuickAction?.('new-member'),
        keywords: ['üye', 'kayıt', 'yeni', 'member'],
        priority: 8,
      },

      // Help Commands
      {
        id: 'help-getting-started',
        title: 'Başlangıç Rehberi',
        description: 'Sistemi kullanmaya başla',
        category: 'help',
        icon: <BookOpen className="w-4 h-4" />,
        onExecute: () => {
          logger.info('Help: Getting Started');
        },
        keywords: ['yardım', 'rehber', 'başlangıç', 'nasıl', 'guide'],
        priority: 6,
      },
      {
        id: 'help-shortcuts',
        title: 'Klavye Kısayolları',
        description: 'Hızlı çalışma için kısayollar',
        category: 'help',
        icon: <HelpCircle className="w-4 h-4" />,
        shortcut: '⌘+?',
        onExecute: () => {
          logger.info('Help: Shortcuts');
        },
        keywords: ['klavye', 'kısayol', 'shortcut', 'hızlı'],
        priority: 5,
      },

      // Settings
      {
        id: 'settings-system',
        title: 'Sistem Ayarları',
        description: 'Genel sistem yapılandırması',
        category: 'action',
        icon: <Settings className="w-4 h-4" />,
        onExecute: () => onNavigate?.('settings'),
        keywords: ['ayar', 'setting', 'yapılandırma', 'config'],
        priority: 6,
      },
    ],
    [onNavigate, onQuickAction]
  );

  // Fuzzy search implementation
  const filteredCommands = useMemo(() => {
    if (!query) {
      return commands.sort((a, b) => b.priority - a.priority).slice(0, 10);
    }

    const queryLower = query.toLowerCase();
    const scored = commands
      .map((command) => {
        let score = 0;

        // Title exact match gets highest score
        if (command.title.toLowerCase().includes(queryLower)) {
          score += 10;
        }

        // Description match
        if (command.description.toLowerCase().includes(queryLower)) {
          score += 5;
        }

        // Keyword matches
        const keywordMatches = command.keywords.filter((keyword) =>
          keyword.toLowerCase().includes(queryLower)
        ).length;
        score += keywordMatches * 3;

        // Fuzzy matching for typos
        const fuzzyMatches = command.keywords.some((keyword) => {
          const keyword_lower = keyword.toLowerCase();
          if (queryLower.length <= 2) return keyword_lower.startsWith(queryLower);

          // Simple fuzzy matching
          let matches = 0;
          for (const char of queryLower) {
            if (keyword_lower.includes(char)) matches++;
          }
          return matches >= queryLower.length * 0.6;
        });

        if (fuzzyMatches) score += 2;

        // Priority bonus
        score += command.priority;

        return { command, score };
      })
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 8)
      .map(({ command }) => command);

    return scored;
  }, [query, commands]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex((prev) => (prev < filteredCommands.length - 1 ? prev + 1 : 0));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex((prev) => (prev > 0 ? prev - 1 : filteredCommands.length - 1));
          break;
        case 'Enter':
          e.preventDefault();
          if (filteredCommands[selectedIndex]) {
            filteredCommands[selectedIndex].onExecute();
            onClose();
          }
          break;
        case 'Escape':
          onClose();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, filteredCommands, selectedIndex, onClose]);

  // Reset state when opened
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Auto-select first item when query changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const getCategoryColor = (category: CommandItem['category']) => {
    switch (category) {
      case 'navigation':
        return 'bg-blue-500';
      case 'action':
        return 'bg-emerald-500';
      case 'search':
        return 'bg-amber-500';
      case 'help':
        return 'bg-purple-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getCategoryLabel = (category: CommandItem['category']) => {
    switch (category) {
      case 'navigation':
        return 'Sayfa';
      case 'action':
        return 'İşlem';
      case 'search':
        return 'Arama';
      case 'help':
        return 'Yardım';
      default:
        return 'Diğer';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl p-0 gap-0 overflow-hidden">
        <DialogTitle className="sr-only">Akıllı Komut Paleti</DialogTitle>
        <DialogDescription className="sr-only">
          Sistem genelinde hızlı arama ve komut çalıştırma. Sayfalar arası geçiş, hızlı işlemler ve
          yardım için kullanabilirsiniz.
        </DialogDescription>
        <div className="border-b border-border p-4">
          <div className="flex items-center gap-3">
            <Search className="w-5 h-5 text-muted-foreground" />
            <input
              ref={inputRef}
              type="text"
              placeholder="Ne yapmak istiyorsunuz? (Komut ara...)"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
              }}
              className="flex-1 text-base bg-transparent border-none outline-none placeholder:text-muted-foreground"
            />
            <Badge variant="secondary" className="text-xs">
              {filteredCommands.length} sonuç
            </Badge>
          </div>
        </div>

        <div className="max-h-96 overflow-y-auto">
          {filteredCommands.length === 0 ? (
            <div className="p-8 text-center">
              <Search className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
              <p className="text-muted-foreground mb-2">
                {query ? 'Sonuç bulunamadı' : 'Komut aramaya başlayın'}
              </p>
              <p className="text-sm text-muted-foreground">
                Sayfa, işlem veya ayar arayabilirsiniz
              </p>
            </div>
          ) : (
            <div className="p-2">
              {filteredCommands.map((command, index) => (
                <button
                  key={command.id}
                  onClick={() => {
                    command.onExecute();
                    onClose();
                  }}
                  className={cn(
                    'w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors',
                    'hover:bg-accent hover:text-accent-foreground',
                    index === selectedIndex && 'bg-accent text-accent-foreground'
                  )}
                >
                  <div className="flex-shrink-0 w-8 h-8 rounded-md bg-muted/50 flex items-center justify-center">
                    {command.icon}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-sm truncate">{command.title}</h4>
                      <div
                        className={cn(
                          'w-1.5 h-1.5 rounded-full flex-shrink-0',
                          getCategoryColor(command.category)
                        )}
                      />
                      <span className="text-xs text-muted-foreground hidden sm:inline">
                        {getCategoryLabel(command.category)}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{command.description}</p>
                  </div>

                  {command.shortcut && (
                    <Badge
                      variant="outline"
                      className="text-xs font-mono ml-2 hidden sm:inline-flex"
                    >
                      {command.shortcut}
                    </Badge>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="border-t border-border p-3 bg-muted/30">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-background border border-border rounded text-xs">
                  ↑↓
                </kbd>
                Gezin
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-background border border-border rounded text-xs">
                  ⏎
                </kbd>
                Seç
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-background border border-border rounded text-xs">
                  Esc
                </kbd>
                Kapat
              </span>
            </div>
            <div className="hidden sm:block">
              <span className="text-xs">
                {currentModule !== 'genel' && `${currentModule} modülünde`}
              </span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default SmartCommandPalette;
