// Supabase integration enabled - deployment blocker removed

import { useCallback, useEffect, useState } from 'react';

// Core System Imports
import { ErrorBoundary } from './components/ErrorBoundary';
import { ToastProvider } from './components/ToastProvider';
import { SupabaseAuthProvider, useSupabaseAuth } from './contexts/SupabaseAuthContext';

// Enhanced AI System
import { EnhancedAIProvider, useAI } from './components/ai/EnhancedAIProvider';

// App Management Components
import AppInitializer from './components/app/AppInitializer';
import NavigationProvider, { useNavigation } from './components/app/NavigationManager';
import NotificationManager, { NotificationProvider } from './components/app/NotificationManager';
import PageRenderer from './components/app/PageRenderer';

// Layout Components
import { Header } from './components/Header';
import { SafeWrapper } from './components/SafeWrapper';
import { Sidebar } from './components/Sidebar';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { SmartNotificationCenter } from './components/notifications/SmartNotificationCenter';

// UX Components
import { useUXAnalytics } from './components/ux/hooks/useUXAnalytics';

// Performance Hooks
import { useGlobalShortcuts } from './hooks/useKeyboard';
import { useUserPreferences } from './hooks/useLocalStorage';

/**
 * DERNEK YÖNETİM SİSTEMİ - Main Application Content
 *
 * Frontend Application - Desktop-only design
 * Modern, responsive corporate admin panel
 */
function AppContent() {
  const { trackAIUsage: trackUsage } = useAI();
  const { trackFeatureUse } = useUXAnalytics();
  const navigation = useNavigation();
  const { isLoading } = useSupabaseAuth();

  const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;

  // Mobile sidebar state
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // User preferences for theme management
  const { preferences } = useUserPreferences();

  // Dark mode initialization
  useEffect(() => {
    const savedTheme = preferences.theme || 'light';
    document.documentElement.classList.toggle('dark', savedTheme === 'dark');
  }, [preferences.theme]);

  // Keyboard shortcut handlers
  const handleGlobalSearch = useCallback(() => {
    const searchInput = document.querySelector(
      'input[placeholder*="⌘K"], input[placeholder*="Ctrl+K"], input[placeholder*="Ara"]',
    )!;
    if (searchInput) {
      searchInput.focus();
      searchInput.select();
    }
  }, []);

  const handleRefresh = useCallback(() => {
    if (navigation.loading) return;
    navigation.setLoading(true);
    setTimeout(() => {
      navigation.setLoading(false);
    }, 150);
  }, [navigation]);

  const handleNewItem = useCallback(() => {
    const addButton = document.querySelector(
      'button[aria-label*="Ekle"], button[title*="Ekle"], button[class*="add"], button[class*="new"]',
    )!;

    if (
      addButton &&
      (addButton.textContent?.includes('Ekle') ||
        addButton.textContent?.includes('Yeni') ||
        addButton.querySelector('svg'))
    ) {
      addButton.click();
    }
  }, []);

  // Quick action handler with AI integration
  const handleQuickAction = useCallback(
    (actionId: string) => {
      trackFeatureUse('quick-action', actionId, {
        source: 'header-actions',
      });
      trackUsage('quick_action', actionId);

      const actionMap = {
        'new-beneficiary': {
          module: 'yardim',
          subPage: '/yardim/ihtiyac-sahipleri',
        },
        'new-aid-application': {
          module: 'yardim',
          subPage: '/yardim/basvurular',
        },
        'new-donation': {
          module: 'bagis',
          subPage: '/bagis/liste',
        },
        'new-member': { module: 'uye', subPage: '/uye/yeni' },
        'record-donation': {
          module: 'bagis',
          subPage: '/bagis/liste',
        },
        'expense-entry': {
          module: 'fon',
          subPage: '/fon/gelir-gider',
        },
      };

      const action = actionMap[actionId as keyof typeof actionMap];
      if (action) {
        navigation.setActiveModule(action.module);
        navigation.setCurrentSubPage(action.subPage);
      }
    },
    [navigation, trackFeatureUse, trackUsage],
  );

  // Initialize keyboard shortcuts
  useGlobalShortcuts({
    onSearch: handleGlobalSearch,
    onRefresh: handleRefresh,
    onNewItem: handleNewItem,
  });

  // Use the authentication state for conditional rendering
  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <ProtectedRoute requireAuth={true}>
      <div className="h-screen flex flex-col bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 overflow-hidden">
        {/* Header */}
        <div className="shadow-lg relative z-40" data-testid="header" data-onboarding="header">
          <NotificationManager>
            {(notificationState, notificationActions) => (
              <Header
                onNavigateToProfile={navigation.navigateToProfile}
                onNavigateToSettings={navigation.navigateToSettings}
                onNavigateToUserManagement={navigation.navigateToUserManagement}
                onNavigate={navigation.moduleChange}
                onQuickAction={handleQuickAction}
                currentModule={navigation.activeModule}
                onMobileMenuToggle={() => {
                  setIsMobileSidebarOpen(!isMobileSidebarOpen);
                }}
                notificationComponent={
                  <SafeWrapper componentName="SmartNotificationCenter">
                    <SmartNotificationCenter
                      notifications={notificationState.notifications}
                      onMarkAsRead={notificationActions.markAsRead}
                      onMarkAllAsRead={notificationActions.markAllAsRead}
                      onArchive={notificationActions.archive}
                      onDelete={notificationActions.delete}
                      onAction={notificationActions.handleAction}
                    />
                  </SafeWrapper>
                }
              />
            )}
          </NotificationManager>
        </div>

        {/* Main Layout */}
        <div className="flex-1 flex overflow-hidden relative">
          {/* Sidebar */}
          <div className="shadow-lg relative z-30" data-testid="sidebar" data-onboarding="sidebar">
            <Sidebar
              activeModule={navigation.activeModule}
              onModuleChange={navigation.moduleChange}
              onSubPageChange={navigation.subPageChange}
              onNavigateToProfile={navigation.navigateToProfile}
              onNavigateToSettings={navigation.navigateToSettings}
              onNavigateToUserManagement={navigation.navigateToUserManagement}
              isMobileOpen={isMobileSidebarOpen}
              onMobileToggle={() => {
                setIsMobileSidebarOpen(!isMobileSidebarOpen);
              }}
            />
          </div>

          {/* Main Content */}
          <main
            className="flex-1 relative bg-white/50 backdrop-blur-sm"
            data-onboarding="main-content"
          >
            <div className="h-full overflow-auto scrollbar-thin">
              <div
                className="relative z-10 p-6"
                data-testid="dashboard"
                data-onboarding="dashboard"
              >
                <PageRenderer onQuickAction={handleQuickAction} />
              </div>
            </div>
          </main>
        </div>

        {/* Offline indicator */}
        {!isOnline && (
          <div className="fixed top-4 right-4 bg-amber-500 text-white px-3 py-2 rounded-lg text-sm z-50">
            📱 Çevrimdışı Modu
          </div>
        )}

        {/* Notification Center */}
        {/* NotificationCenter removed - using SmartNotificationCenter in Header */}
      </div>
    </ProtectedRoute>
  );
}

/**
 * App with Navigation Provider
 */
function AppWithNavigation({
  onNavigate,
}: {
  onNavigate: (module: string, page?: string, subPage?: string) => void;
}) {
  const [currentModule, setCurrentModule] = useState('genel');
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [currentSubPage, setCurrentSubPage] = useState('');

  // Enhanced navigation handler that syncs with AI
  const handleNavigate = useCallback(
    (module: string, page?: string, subPage?: string) => {
      setCurrentModule(module);
      if (page) setCurrentPage(page);
      if (subPage !== undefined) setCurrentSubPage(subPage);
      onNavigate(module, page, subPage);
    },
    [onNavigate],
  );

  return (
    <EnhancedAIProvider
      onNavigate={handleNavigate}
      currentModule={currentModule}
      currentPage={currentPage}
      currentSubPage={currentSubPage}
    >
      <NavigationProvider
        initialModule={currentModule}
        initialPage={currentPage}
        initialSubPage={currentSubPage}
      >
        <AppContent />
      </NavigationProvider>
      <ToastProvider />
    </EnhancedAIProvider>
  );
}

/**
 * Error Handler Component
 */
function AppWithErrorHandling() {
  // AI-integrated navigation handler
  const handleAINavigation = useCallback((module: string, page?: string, subPage?: string) => {
    // This will be passed to the AI provider to handle navigation requests
    console.log('AI Navigation Request:', {
      module,
      page,
      subPage,
    });
  }, []);

  return (
    <ErrorBoundary>
      <SupabaseAuthProvider>
        <NotificationProvider>
          <AppInitializer>
            <AppWithNavigation onNavigate={handleAINavigation} />
          </AppInitializer>
        </NotificationProvider>
      </SupabaseAuthProvider>
    </ErrorBoundary>
  );
}

/**
 * Main App Component
 */
function App() {
  return <AppWithErrorHandling />;
}

export default App;
