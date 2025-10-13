/**
 * @fileoverview KeyboardShortcuts Module - Application module
 *
 * @author Dernek Yönetim Sistemi Team
 * @version 1.0.0
 */

import { Command, Keyboard, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from './button';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Badge } from './badge';

interface Shortcut {
  keys: string[];
  description: string;
  category: 'navigation' | 'actions' | 'search' | 'system';
}

const SHORTCUTS: Shortcut[] = [
  // Navigation
  { keys: ['Ctrl', 'K'], description: 'Global arama', category: 'navigation' },
  { keys: ['Ctrl', 'N'], description: 'Yeni kayıt oluştur', category: 'navigation' },
  { keys: ['Ctrl', 'S'], description: 'Kaydet', category: 'navigation' },
  { keys: ['Ctrl', 'Z'], description: 'Geri al', category: 'navigation' },
  { keys: ['Ctrl', 'Y'], description: 'İleri al', category: 'navigation' },

  // Actions
  { keys: ['Enter'], description: 'Onayla/Seç', category: 'actions' },
  { keys: ['Escape'], description: 'İptal/Kapat', category: 'actions' },
  { keys: ['Tab'], description: 'İleri', category: 'actions' },
  { keys: ['Shift', 'Tab'], description: 'Geri', category: 'actions' },
  { keys: ['Delete'], description: 'Sil', category: 'actions' },

  // Search
  { keys: ['/', 'F'], description: 'Arama yap', category: 'search' },
  { keys: ['Ctrl', 'F'], description: 'Sayfada ara', category: 'search' },
  { keys: ['F3'], description: 'Sonraki sonuç', category: 'search' },
  { keys: ['Shift', 'F3'], description: 'Önceki sonuç', category: 'search' },

  // System
  { keys: ['F5'], description: 'Sayfayı yenile', category: 'system' },
  { keys: ['Ctrl', 'R'], description: 'Sayfayı yenile', category: 'system' },
  { keys: ['F11'], description: 'Tam ekran', category: 'system' },
  { keys: ['?'], description: 'Kısayolları göster', category: 'system' },
];

const CATEGORY_LABELS = {
  navigation: 'Navigasyon',
  actions: 'Eylemler',
  search: 'Arama',
  system: 'Sistem',
};

const CATEGORY_COLORS = {
  navigation: 'bg-blue-50 text-blue-700 border-blue-200',
  actions: 'bg-green-50 text-green-700 border-green-200',
  search: 'bg-purple-50 text-purple-700 border-purple-200',
  system: 'bg-gray-50 text-gray-700 border-gray-200',
};

interface KeyboardShortcutsProps {
  isOpen: boolean;
  onClose: () => void;
}

export function KeyboardShortcuts({ isOpen, onClose }: KeyboardShortcutsProps) {
  const [selectedCategory, setSelectedCategory] = useState<Shortcut['category']>('navigation');

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredShortcuts = SHORTCUTS.filter((shortcut) => shortcut.category === selectedCategory);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <Card className="w-full max-w-2xl max-h-[80vh] overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div className="flex items-center gap-2">
            <Keyboard className="h-5 w-5 text-blue-600" />
            <CardTitle>Klavye Kısayolları</CardTitle>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
            aria-label="Kapat"
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Category Tabs */}
          <div className="flex flex-wrap gap-2">
            {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
              <Button
                key={key}
                variant={selectedCategory === key ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  setSelectedCategory(key as Shortcut['category']);
                }}
                className="text-xs"
              >
                {label}
              </Button>
            ))}
          </div>

          {/* Shortcuts List */}
          <div className="max-h-96 overflow-y-auto space-y-2">
            {filteredShortcuts.map((shortcut, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 rounded-lg border bg-gray-50/50"
              >
                <span className="text-sm text-gray-700">{shortcut.description}</span>
                <div className="flex items-center gap-1">
                  {shortcut.keys.map((key, keyIndex) => (
                    <div key={keyIndex} className="flex items-center gap-1">
                      <Badge
                        variant="outline"
                        className={`text-xs font-mono ${CATEGORY_COLORS[shortcut.category]}`}
                      >
                        {key}
                      </Badge>
                      {keyIndex < shortcut.keys.length - 1 && (
                        <span className="text-gray-400 text-xs">+</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Command className="h-4 w-4" />
              <span>Kısayolları her zaman görmek için ? tuşuna basın</span>
            </div>
            <Button onClick={onClose} size="sm">
              Anladım
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Hook for keyboard shortcuts
export function useKeyboardShortcuts() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Show shortcuts with ? key
      if (e.key === '?' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        setIsOpen(true);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return {
    isOpen,
    openShortcuts: () => {
      setIsOpen(true);
    },
    closeShortcuts: () => {
      setIsOpen(false);
    },
  };
}
