/**
 * @fileoverview Header Module - Application module
 *
 * @author Dernek Yönetim Sistemi Team
 * @version 1.0.0
 */

import {
  Building2,
  Command,
  LogOut,
  Menu,
  Moon,
  Search,
  Settings,
  Sun,
  User,
  X,
} from 'lucide-react';
import { useState } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
// SearchInput removed - using basic search instead
import { motion } from 'motion/react';
import { useUserPreferences } from '../../hooks/useLocalStorage';
import { ErrorBoundary } from '../shared/ErrorBoundary';
import { NotificationBell } from '../notifications/NotificationBell';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { PerformanceIndicator } from '../ui/PerformanceIndicator';
// Enhanced UX imports
// import { EnhancedSearchExperience } from './ux/EnhancedSearchExperience';
import { SmartCommandPalette } from '../ux/SmartCommandPalette';
import { useCommandPalette } from '../ux/hooks/useCommandPalette';
// import { useUXAnalytics } from '../ux/hooks/useUXAnalytics';

import { logger } from '../../lib/logging/logger';

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
  currentModule,
  onMobileMenuToggle,
}: HeaderProps) {
  // Get real authenticated user
  const { user, logout } = useAuthStore();
  const [showEnhancedSearch, setShowEnhancedSearch] = useState(false);

  // Enhanced UX features
  const commandPalette = useCommandPalette({
    shortcut: 'cmd+k',
    onOpen: () => {
      trackClick('header', 'command-palette-open');
    },
  });

  // const { trackClick, trackSearch, trackFeatureUse } = useUXAnalytics();
  const trackClick = (..._args: any[]): void => {
    // TODO: Implement analytics tracking
  };
  const trackSearch = (..._args: any[]): void => {
    // TODO: Implement search analytics
  };
  const trackFeatureUse = (..._args: any[]): void => {
    // TODO: Implement feature usage tracking
  };

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
    <header className="relative z-50 flex h-16 items-center justify-between border-b border-slate-200/80 bg-gradient-to-r from-white to-slate-50/80 px-3 shadow-lg backdrop-blur-sm sm:px-6">
      {/* Logo and Title */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex flex-shrink-0 items-center gap-2 sm:gap-4"
      >
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="from-primary flex h-8 w-8 items-center justify-center rounded-xl border border-blue-200/20 bg-gradient-to-br via-blue-600 to-blue-800 shadow-lg sm:h-10 sm:w-10">
            <Building2 className="h-4 w-4 text-white drop-shadow-sm sm:h-5 sm:w-5" />
          </div>
          <div className="hidden md:block">
            <h1 className="text-base font-bold tracking-tight text-slate-900 sm:text-lg">
              Dernek Yönetim Sistemi
            </h1>
            <p className="-mt-0.5 text-xs font-medium text-slate-600">Hayır İşleri Platformu</p>
          </div>
          <div className="block md:hidden">
            <h1 className="text-sm font-bold tracking-tight text-slate-900">Dernek</h1>
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
          <Menu className="h-5 w-5" />
        </Button>
      </motion.div>

      {/* Enhanced Search - Hidden on small screens */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="relative mx-4 hidden max-w-md flex-1 sm:flex lg:mx-8 lg:max-w-xl"
        data-onboarding="search"
      >
        <div className="relative w-full">
          <input
            type="text"
            placeholder="Akıllı arama... (⌘K ile komut paleti)"
            onChange={(e) => {
              const query = e.target.value;
              trackSearch(query, 0);
              handleSearch(query);
            }}
            className="w-full rounded-lg border px-4 py-2"
          />

          {/* Command Palette Trigger Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCommandPaletteOpen}
            className="absolute top-1/2 right-2 h-6 w-6 -translate-y-1/2 transform p-0 opacity-60 hover:opacity-100"
            title="Komut Paleti (⌘K)"
          >
            <Command className="h-3 w-3" />
          </Button>
        </div>
      </motion.div>

      {/* Mobile Search & Command Buttons - Visible on small screens */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex items-center gap-1 sm:hidden"
      >
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCommandPaletteOpen}
          className="focus-corporate h-9 min-h-[44px] w-9 min-w-[44px] rounded-lg p-0 transition-all duration-200 hover:bg-slate-100/80"
          title="Komut Paleti"
        >
          <Command className="h-4 w-4 text-slate-700" />
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
          className="focus-corporate h-9 min-h-[44px] w-9 min-w-[44px] rounded-lg p-0 transition-all duration-200 hover:bg-slate-100/80"
          title="Arama"
        >
          <Search className="h-4 w-4 text-slate-700" />
        </Button>
      </motion.div>

      {/* Right Actions */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
        className="flex flex-shrink-0 items-center gap-1 sm:gap-2"
      >
        {/* Performance Indicators */}
        <PerformanceIndicator className="hidden lg:flex" />

        {/* Frontend Status */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1" title="Frontend Mode">
            <div className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
            <span className="text-xs text-green-600">Online</span>
          </div>

          {/* Status */}
          <div className="flex items-center gap-1" title="No Auth Required">
            <div className="h-2 w-2 rounded-full bg-green-500" />
            <span className="text-xs text-green-600">Pure</span>
          </div>
        </div>

        {/* Mobile Status */}
        <div className="sm:hidden">
          <div className="h-2 w-2 rounded-full bg-green-500" title="Online Mode" />
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
          className="focus-corporate h-9 min-h-[44px] w-9 min-w-[44px] rounded-lg p-0 transition-all duration-200 hover:bg-slate-100/80"
          title={`${preferences.theme === 'light' ? 'Karanlık' : 'Aydınlık'} Mod`}
        >
          {preferences.theme === 'light' ? (
            <Moon className="h-4 w-4 text-slate-700" />
          ) : (
            <Sun className="h-4 w-4 text-slate-700" />
          )}
        </Button>

        {/* Smart Notifications - Use modern system if provided, fallback to legacy */}
        {notificationComponent ?? (
          <ErrorBoundary type="store">
            <ErrorBoundary type="notification">
              <NotificationBell size="sm" />
            </ErrorBoundary>
          </ErrorBoundary>
        )}

        {/* User Profile Menu */}
        {user && (
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="focus-corporate h-9 w-9 rounded-lg p-0 transition-all duration-200 hover:bg-slate-100/80"
              >
                <User className="h-4 w-4 text-slate-700" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 border-slate-200/60 p-0 shadow-xl" align="end">
              <div className="border-b border-slate-200/60 bg-gradient-to-r from-slate-50 to-white p-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="from-primary flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br to-blue-700 shadow-lg">
                      <User className="h-5 w-5 text-white" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold text-slate-900">
                        {user?.name ?? user?.email?.split('@')[0] ?? 'Kullanıcı'}
                      </p>
                      <p className="truncate text-sm text-slate-600">{user?.email ?? ''}</p>
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
                  className="min-h-[44px] w-full justify-start gap-2 text-slate-700 hover:bg-slate-50"
                >
                  <User className="h-4 w-4" />
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
                  className="min-h-[44px] w-full justify-start gap-2 text-slate-700 hover:bg-slate-50"
                >
                  <Settings className="h-4 w-4" />
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
                    className="min-h-[44px] w-full justify-start gap-2 text-slate-700 hover:bg-slate-50"
                  >
                    <User className="h-4 w-4" />
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
                      await logout();
                    } catch (error) {
                      logger.error('Logout error:', error);
                    }
                  }}
                  className="min-h-[44px] w-full justify-start gap-2 text-red-600 hover:bg-red-50 hover:text-red-700"
                >
                  <LogOut className="h-4 w-4" />
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
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 pt-20 sm:hidden">
          <div className="mx-4 w-full max-w-md rounded-lg bg-white shadow-xl">
            <div className="p-4">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-medium">Akıllı Arama</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowEnhancedSearch(false);
                  }}
                  className="h-6 w-6 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <input
                type="text"
                placeholder="Ne arıyorsunuz?"
                onChange={(e) => {
                  const query = e.target.value;
                  trackSearch(query, 0, 'mobile-enhanced');
                  handleSearch(query);
                }}
                className="w-full rounded-lg border px-4 py-2"
              />
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
