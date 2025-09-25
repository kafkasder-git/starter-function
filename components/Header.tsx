/**
 * @fileoverview Header Module - Application module
 * 
 * @author Dernek Yönetim Sistemi Team
 * @version 1.0.0
 */

import {
  Bot,
  Building2,
  Command,
  HelpCircle,
  Keyboard,
  Lightbulb,
  LogOut,
  Menu,
  Moon,
  Search,
  Settings,
  Sun,
  User,
  X,
  Zap,
} from 'lucide-react';
import { useState } from 'react';
import { useSupabaseAuth } from '../contexts/SupabaseAuthContext';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
// SearchInput removed - using EnhancedSearchExperience instead
import { motion } from 'motion/react';
import { toast } from 'sonner';
import { useUserPreferences } from '../hooks/useLocalStorage';
import { StoreErrorBoundary } from './StoreErrorBoundary';
import { NotificationBell } from './notifications/NotificationBell';
import { NotificationErrorBoundary } from './notifications/NotificationErrorBoundary';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
// Enhanced UX imports
import { ContextualHelp } from './ux/ContextualTooltipSystem';
import { EnhancedSearchExperience } from './ux/EnhancedSearchExperience';
import { SmartCommandPalette } from './ux/SmartCommandPalette';
import { useCommandPalette } from './ux/hooks/useCommandPalette';
import { useUXAnalytics } from './ux/hooks/useUXAnalytics';

import { logger } from '../lib/logging/logger';
// AI functions are now defined inline in App.tsx
const useBasicAI = () => ({
  toggleAssistant: () => {},
  toggleHelp: () => {},
});

interface HeaderProps {
  onNavigateToProfile?: () => void;
  onNavigateToSettings?: () => void;
  onNavigateToUserManagement?: () => void;
  notificationComponent?: React.ReactNode; // Modern notifications component
  onNavigate?: (module: string, page?: string) => void; // For UX features
  onQuickAction?: (actionId: string) => void; // For UX features
  currentModule?: string; // Current active module
  onMobileMenuToggle?: () => void; // Mobile menu toggle
}

/**
 * Header function
 * 
 * @param {Object} params - Function parameters
 * @returns {void} Nothing
 */
export function Header({
  onNavigateToProfile,
  onNavigateToSettings,
  onNavigateToUserManagement,
  notificationComponent,
  onNavigate,
  onQuickAction,
  currentModule = 'genel',
  onMobileMenuToggle,
}: HeaderProps) {
  // Get real authenticated user
  const { user, signOut } = useSupabaseAuth();
  const [showEnhancedSearch, setShowEnhancedSearch] = useState(false);
  const { toggleAssistant } = useBasicAI();

  // Enhanced UX features
  const commandPalette = useCommandPalette({
    shortcut: 'cmd+k',
    onOpen: () => {
      trackClick('header', 'command-palette-open');
    },
  });

  const { trackClick, trackSearch, trackFeatureUse } = useUXAnalytics();

  const { preferences, updatePreference, addRecentSearch } = useUserPreferences();

  const handleSearch = (value: string) => {
    if (value.trim()) {
      addRecentSearch(value);
      trackSearch(value, 0); // Track search event
      // Trigger enhanced search
      setShowEnhancedSearch(true);
    }
  };

  const toggleTheme = () => {
    const newTheme = preferences.theme === 'light' ? 'dark' : 'light';
    updatePreference('theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
    trackFeatureUse('theme', 'toggle', { newTheme });
  };

  const handleCommandPaletteOpen = () => {
    trackFeatureUse('command-palette', 'open', { trigger: 'manual' });
    commandPalette.open();
  };

  return (
    <header className="h-16 bg-gradient-to-r from-white to-slate-50/80 border-b border-slate-200/80 px-3 sm:px-6 flex items-center justify-between shadow-lg backdrop-blur-sm relative z-50">
      {/* Logo and Title */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex items-center gap-2 sm:gap-4 flex-shrink-0"
      >
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-primary via-blue-600 to-blue-800 rounded-xl flex items-center justify-center shadow-lg border border-blue-200/20">
            <Building2 className="w-4 h-4 sm:w-5 sm:h-5 text-white drop-shadow-sm" />
          </div>
          <div className="hidden md:block">
            <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
              Dernek Yönetim Sistemi
            </h1>
            <p className="text-xs text-slate-600 -mt-0.5 font-medium">Hayır İşleri Platformu</p>
          </div>
          <div className="block md:hidden">
            <h1 className="text-sm font-bold text-slate-900 tracking-tight">Dernek</h1>
          </div>
        </div>
      </motion.div>

      {/* Mobile Menu Button - Visible on small screens */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="block sm:hidden"
      >
        <Button
          variant="ghost"
          size="sm"
          className="min-h-[44px] min-w-[44px] p-2"
          onClick={onMobileMenuToggle}
          aria-label="Menü"
        >
          <Menu className="w-5 h-5" />
        </Button>
      </motion.div>

      {/* Enhanced Search - Hidden on small screens */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="hidden sm:flex flex-1 max-w-md lg:max-w-xl mx-4 lg:mx-8 relative"
        data-onboarding="search"
      >
        <div className="w-full relative">
          <EnhancedSearchExperience
            placeholder="Akıllı arama... (⌘K ile komut paleti)"
            onSearch={(query) => {
              trackSearch(query, 0);
              handleSearch(query);
            }}
            onNavigate={(url) => {
              trackClick('header', 'search-navigate', { url });
            }}
            showSuggestions={true}
            showFilters={true}
            className="w-full"
          />

          {/* Command Palette Trigger Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCommandPaletteOpen}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 opacity-60 hover:opacity-100"
            title="Komut Paleti (⌘K)"
          >
            <Command className="w-3 h-3" />
          </Button>
        </div>
      </motion.div>

      {/* Mobile Search & Command Buttons - Visible on small screens */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="block sm:hidden flex items-center gap-1"
      >
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCommandPaletteOpen}
          className="w-9 h-9 p-0 rounded-lg hover:bg-slate-100/80 transition-all duration-200 focus-corporate min-h-[44px] min-w-[44px]"
          title="Komut Paleti"
        >
          <Command className="w-4 h-4 text-slate-700" />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={(e: React.MouseEvent) => {
            e.preventDefault();
            e.stopPropagation();
            trackClick('header', 'mobile-search-open');
            setShowEnhancedSearch(true);
          }}
          className="w-9 h-9 p-0 rounded-lg hover:bg-slate-100/80 transition-all duration-200 focus-corporate min-h-[44px] min-w-[44px]"
          title="Arama"
        >
          <Search className="w-4 h-4 text-slate-700" />
        </Button>
      </motion.div>

      {/* Right Actions */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
        className="flex items-center gap-1 sm:gap-2 flex-shrink-0"
      >
        {/* Frontend Status */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1" title="Frontend Mode">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-xs text-green-600">Online</span>
          </div>

          {/* Status */}
          <div className="flex items-center gap-1" title="No Auth Required">
            <div className="w-2 h-2 bg-green-500 rounded-full" />
            <span className="text-xs text-green-600">Pure</span>
          </div>
        </div>

        {/* Mobile Status */}
        <div className="block sm:hidden">
          <div className="w-2 h-2 bg-green-500 rounded-full" title="Online Mode" />
        </div>

        {/* Theme Toggle */}
        <Button
          variant="ghost"
          size="sm"
          onClick={(e: React.MouseEvent) => {
            e.preventDefault();
            e.stopPropagation();
            toggleTheme();
          }}
          className="w-9 h-9 p-0 rounded-lg hover:bg-slate-100/80 transition-all duration-200 focus-corporate min-h-[44px] min-w-[44px]"
          title={`${preferences.theme === 'light' ? 'Karanlık' : 'Aydınlık'} Mod`}
        >
          {preferences.theme === 'light' ? (
            <Moon className="w-4 h-4 text-slate-700" />
          ) : (
            <Sun className="w-4 h-4 text-slate-700" />
          )}
        </Button>

        {/* AI Assistant - Enhanced with UX tracking */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            trackFeatureUse('ai-assistant', 'click');
            toggleAssistant();
            toast.success('AI Asistant - Geliştirilme aşamasında');
          }}
          className="w-9 h-9 p-0 rounded-lg hover:bg-purple-100/80 transition-all duration-200 focus-corporate min-h-[44px] min-w-[44px]"
          title="AI Asistant"
        >
          <Bot className="w-4 h-4 text-purple-600" />
        </Button>

        {/* Contextual Help System */}
        <ContextualHelp
          context={
            currentModule as
              | 'dashboard'
              | 'beneficiaries'
              | 'donations'
              | 'members'
              | 'finance'
              | 'general'
          }
          className="inline-flex"
        />

        {/* Enhanced Help System */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                trackClick('header', 'help-menu-open');
              }}
              className="w-9 h-9 p-0 rounded-lg hover:bg-slate-100/80 transition-all duration-200 focus-corporate"
            >
              <HelpCircle className="w-4 h-4 text-slate-700" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-0 shadow-xl border-slate-200/60" align="end">
            <div className="p-4 border-b border-slate-200/60 bg-gradient-to-r from-slate-50 to-slate-100/80">
              <h4 className="font-semibold text-slate-900 flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-primary" />
                Gelişmiş Yardım Sistemi
              </h4>
              <p className="text-xs text-slate-600 mt-1">
                Modern UX özellikleri ile daha iyi deneyim
              </p>
            </div>
            <div className="p-4 space-y-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  trackFeatureUse('command-palette', 'help-trigger');
                  commandPalette.open();
                }}
                className="w-full justify-start gap-2 text-slate-700 hover:bg-slate-50"
              >
                <Command className="w-4 h-4" />
                Komut Paleti (⌘K)
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  trackFeatureUse('enhanced-search', 'help-trigger');
                  setShowEnhancedSearch(true);
                }}
                className="w-full justify-start gap-2 text-blue-700 hover:bg-blue-50"
              >
                <Search className="w-4 h-4" />
                Akıllı Arama
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  trackFeatureUse('ai-assistant', 'help-trigger');
                  toggleAssistant();
                  toast.info('AI Asistant - Geliştirilme aşamasında');
                }}
                className="w-full justify-start gap-2 text-purple-700 hover:bg-purple-50"
              >
                <Bot className="w-4 h-4" />
                AI Asistant
              </Button>

              <hr className="my-2" />

              <div className="space-y-2">
                <h5 className="font-medium text-sm text-slate-900 flex items-center gap-2">
                  <Keyboard className="w-3 h-3" />
                  Gelişmiş Kısayollar
                </h5>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Komut Paleti</span>
                    <Badge variant="secondary" className="text-xs font-mono">
                      ⌘K
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Hızlı Yenile</span>
                    <Badge variant="secondary" className="text-xs font-mono">
                      ⌘R
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Yeni Kayıt</span>
                    <Badge variant="secondary" className="text-xs font-mono">
                      ⌘N
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Yardım</span>
                    <Badge variant="secondary" className="text-xs font-mono">
                      ⌘?
                    </Badge>
                  </div>
                </div>
              </div>

              <hr className="my-2" />

              <div className="text-center">
                <Badge variant="outline" className="text-xs">
                  <Zap className="w-3 h-3 mr-1" />
                  UX Enhanced v2.0
                </Badge>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {/* Smart Notifications - Use modern system if provided, fallback to legacy */}
        {notificationComponent || (
          <StoreErrorBoundary>
            <NotificationErrorBoundary>
              <NotificationBell size="sm" />
            </NotificationErrorBoundary>
          </StoreErrorBoundary>
        )}

        {/* User Profile Menu */}
        {user && (
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="w-9 h-9 p-0 rounded-lg hover:bg-slate-100/80 transition-all duration-200 focus-corporate"
              >
                <User className="w-4 h-4 text-slate-700" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-0 shadow-xl border-slate-200/60" align="end">
              <div className="p-4 border-b border-slate-200/60 bg-gradient-to-r from-slate-50 to-white">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary to-blue-700 rounded-xl flex items-center justify-center shadow-lg">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-900 truncate">
                        {user?.user_metadata?.name ?? user?.email?.split('@')[0] || 'Kullanıcı'}
                      </p>
                      <p className="text-sm text-slate-600 truncate">{user?.email ?? ''}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500">Rol:</span>
                    <Badge variant="outline" className="text-xs">
                      {user?.role
                        ? user.role.charAt(0).toUpperCase() + user.role.slice(1)
                        : 'Kullanıcı'}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="p-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e: React.MouseEvent) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onNavigateToProfile?.();
                  }}
                  className="w-full justify-start gap-2 text-slate-700 hover:bg-slate-50 min-h-[44px]"
                >
                  <User className="w-4 h-4" />
                  Profil Ayarları
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e: React.MouseEvent) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onNavigateToSettings?.();
                  }}
                  className="w-full justify-start gap-2 text-slate-700 hover:bg-slate-50 min-h-[44px]"
                >
                  <Settings className="w-4 h-4" />
                  Sistem Ayarları
                </Button>

                {user?.role === 'admin' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e: React.MouseEvent) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onNavigateToUserManagement?.();
                    }}
                    className="w-full justify-start gap-2 text-slate-700 hover:bg-slate-50 min-h-[44px]"
                  >
                    <User className="w-4 h-4" />
                    Kullanıcı Yönetimi
                  </Button>
                )}

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={async (e: React.MouseEvent) => {
                    e.preventDefault();
                    e.stopPropagation();
                    try {
                      await signOut();
                    } catch (error) {
                      logger.error('Logout error:', error);
                    }
                  }}
                  className="w-full justify-start gap-2 text-red-600 hover:bg-red-50 hover:text-red-700 min-h-[44px]"
                >
                  <LogOut className="w-4 h-4" />
                  Çıkış Yap
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        )}
      </motion.div>

      {/* Enhanced UX Components */}
      <SmartCommandPalette
        isOpen={commandPalette.isOpen}
        onClose={commandPalette.close}
        onNavigate={(module, page) => {
          trackFeatureUse('command-palette', 'navigate', { module, page });
          onNavigate?.(module, page);
        }}
        onQuickAction={(actionId) => {
          trackFeatureUse('command-palette', 'quick-action', { actionId });
          onQuickAction?.(actionId);
        }}
        currentModule={currentModule}
      />

      {/* Mobile Enhanced Search Modal */}
      {showEnhancedSearch && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-start justify-center pt-20 sm:hidden">
          <div className="bg-white rounded-lg shadow-xl w-full mx-4 max-w-md">
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium">Akıllı Arama</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowEnhancedSearch(false);
                  }}
                  className="h-6 w-6 p-0"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <EnhancedSearchExperience
                placeholder="Ne arıyorsunuz?"
                onSearch={(query) => {
                  trackSearch(query, 0, 'mobile-enhanced');
                  handleSearch(query);
                }}
                onNavigate={(url) => {
                  trackClick('mobile-search', 'navigate', { url });
                  setShowEnhancedSearch(false);
                }}
                showSuggestions={true}
                showFilters={true}
              />
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
