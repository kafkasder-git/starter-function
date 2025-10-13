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
import { Heading } from '../ui/heading';
import { Text } from '../ui/text';
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
  const trackClick = (_category: string, _action: string): void => {
    // TODO: Implement analytics tracking
  };
  const trackSearch = (_query: string, ..._args: any[]): void => {
    // TODO: Implement search analytics
  };
  const trackFeatureUse = (_feature: string, _context?: string): void => {
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
    trackFeatureUse('theme-toggle');
  };

  const handleCommandPaletteOpen = () => {
    trackFeatureUse('command-palette-open');
    commandPalette.open();
  };

  return (
    <header className="relative z-50 flex h-16 items-center justify-between border-b border-neutral-200 bg-gradient-to-r from-white via-neutral-50 to-neutral-100 px-3 shadow-md backdrop-blur-sm dark:border-neutral-800 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-900 dark:bg-neutral-950 sm:px-6">
      {/* Logo and Title */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex flex-shrink-0 items-center gap-2 sm:gap-4"
      >
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-primary-500/20 bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 shadow-md sm:h-10 sm:w-10">
            <Building2 className="h-4 w-4 text-white drop-shadow-sm sm:h-5 sm:w-5" />
          </div>
          <div className="hidden md:block">
            <Heading level={1} size="lg" weight="bold" className="text-base tracking-tight text-neutral-900 sm:text-lg dark:text-neutral-100">
              Dernek Yönetim Sistemi
            </Heading>
            <Text size="xs" weight="medium" color="neutral" className="-mt-0.5 text-neutral-600 dark:text-neutral-400">Hayır İşleri Platformu</Text>
          </div>
          <div className="block md:hidden">
            <Heading level={1} size="sm" weight="bold" className="tracking-tight text-neutral-900 dark:text-neutral-100">Dernek</Heading>
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
          size="icon"
          className="text-neutral-700 hover:bg-neutral-100 dark:text-neutral-200 dark:hover:bg-neutral-800"
          onClick={onMobileMenuToggle}
          aria-label="Menü"
        >
          <Menu className="h-4 w-4" />
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
            className="w-full rounded-lg border border-neutral-200 bg-white px-4 py-2 text-neutral-900 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:placeholder-neutral-500"
          />

          {/* Command Palette Trigger Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCommandPaletteOpen}
            className="absolute top-1/2 right-2 h-6 w-6 -translate-y-1/2 transform p-0 text-neutral-600 opacity-80 hover:opacity-100 dark:text-neutral-300"
            title="Komut Paleti (⌘K)"
            aria-label="Komut paletini aç"
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
          className="focus-corporate h-9 min-h-[44px] w-9 min-w-[44px] rounded-lg p-0 text-neutral-700 transition-all duration-200 hover:bg-neutral-100 dark:text-neutral-200 dark:hover:bg-neutral-800"
          title="Komut Paleti"
          aria-label="Komut paletini aç"
        >
          <Command className="h-4 w-4" />
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
          className="focus-corporate h-9 min-h-[44px] w-9 min-w-[44px] rounded-lg p-0 text-neutral-700 transition-all duration-200 hover:bg-neutral-100 dark:text-neutral-200 dark:hover:bg-neutral-800"
          title="Arama"
          aria-label="Aramayı aç"
        >
          <Search className="h-4 w-4" />
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
            <div className="h-2 w-2 animate-pulse rounded-full bg-success-500" />
            <span className="text-xs text-success-600 dark:text-success-400">Online</span>
          </div>

          {/* Status */}
          <div className="flex items-center gap-1" title="No Auth Required">
            <div className="h-2 w-2 rounded-full bg-success-500" />
            <span className="text-xs text-success-600 dark:text-success-400">Pure</span>
          </div>
        </div>

        {/* Mobile Status */}
        <div className="sm:hidden">
          <div className="h-2 w-2 rounded-full bg-success-500" title="Online Mode" />
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
          className="focus-corporate h-9 min-h-[44px] w-9 min-w-[44px] rounded-lg p-0 text-neutral-700 transition-all duration-200 hover:bg-neutral-100 dark:text-neutral-200 dark:hover:bg-neutral-800"
          title={`${preferences.theme === 'light' ? 'Karanlık' : 'Aydınlık'} Mod`}
          aria-label={`${preferences.theme === 'light' ? 'Karanlık' : 'Aydınlık'} modu aç`}
        >
          {preferences.theme === 'light' ? (
            <Moon className="h-4 w-4" />
          ) : (
            <Sun className="h-4 w-4" />
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
                className="focus-corporate h-9 w-9 rounded-lg p-0 text-neutral-700 transition-all duration-200 hover:bg-neutral-100 dark:text-neutral-200 dark:hover:bg-neutral-800"
                aria-label="Profil menüsü"
              >
                <User className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 border border-neutral-200 p-0 shadow-xl dark:border-neutral-800 dark:bg-neutral-900" align="end">
              <div className="border-b border-neutral-200 bg-gradient-to-r from-neutral-50 to-white p-4 dark:border-neutral-800 dark:from-neutral-900 dark:to-neutral-900">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 shadow-md">
                      <User className="h-5 w-5 text-white" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold text-neutral-900 dark:text-neutral-100">
                        {user?.name ?? user?.email?.split('@')[0] ?? 'Kullanıcı'}
                      </p>
                      <p className="truncate text-sm text-neutral-600 dark:text-neutral-400">{user?.email ?? ''}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-neutral-500 dark:text-neutral-400">Rol:</span>
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
                  className="min-h-[44px] w-full justify-start gap-2 text-neutral-700 hover:bg-neutral-100 dark:text-neutral-200 dark:hover:bg-neutral-800"
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
                  className="min-h-[44px] w-full justify-start gap-2 text-neutral-700 hover:bg-neutral-100 dark:text-neutral-200 dark:hover:bg-neutral-800"
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
                    className="min-h-[44px] w-full justify-start gap-2 text-neutral-700 hover:bg-neutral-100 dark:text-neutral-200 dark:hover:bg-neutral-800"
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
                  className="min-h-[44px] w-full justify-start gap-2 text-error-600 hover:bg-error-50 hover:text-error-700 dark:text-error-400 dark:hover:bg-error-alpha-20"
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
          trackFeatureUse('command-palette-navigate');
          onNavigate?.(module, page);
        }}
        onQuickAction={(actionId) => {
          trackFeatureUse('command-palette-quick-action');
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
