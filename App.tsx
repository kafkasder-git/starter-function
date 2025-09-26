/**
 * @fileoverview Main Application Component
 * 
 * This is the root component of the Dernek Yönetim Sistemi (Association Management System).
 * It provides the main application structure with authentication, navigation, and core functionality.
 * 
 * Key Features:
 * - Supabase authentication integration
 * - Enhanced AI system integration
 * - Performance optimizations with React.memo and useMemo
 * - Global keyboard shortcuts
 * - UX analytics tracking
 * - Responsive design with mobile support
 * 
 * @author Dernek Yönetim Sistemi Team
 * @version 1.0.0
 */

import { useCallback, useEffect, useState, memo, useMemo } from 'react';

// Core System Imports
import { ErrorBoundary } from './components/ErrorBoundary';
import { ToastProvider } from './components/ToastProvider';
import { SupabaseAuthProvider, useSupabaseAuth } from './contexts/SupabaseAuthContext';

// AI System removed

// App Management Components
import NavigationProvider, { useNavigation } from './components/app/NavigationManager';
import PageRenderer from './components/app/PageRenderer';

// Layout Components
import { Header } from './components/Header';
import { SafeWrapper } from './components/SafeWrapper';
import { Sidebar } from './components/Sidebar';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { SmartNotificationCenter } from './components/notifications/SmartNotificationCenter';

// UX Components
// import { useUXAnalytics } from './components/ux/hooks/useUXAnalytics';

// Performance Hooks
import { useGlobalShortcuts } from './hooks/useKeyboard';
import { useUserPreferences } from './hooks/useLocalStorage';

/**
 * Main Application Content Component
 * 
 * This is the core application component that renders the main UI structure.
 * It handles authentication state, navigation, theme management, and user interactions.
 * 
 * @component
 * @returns {JSX.Element} The main application content with sidebar, header, and page renderer
 * 
 * @example
 * ```tsx
 * <AppContent />
 * ```
 */
const AppContent = memo(() => {
  // AI system removed
  // const { trackFeatureUse } = useUXAnalytics();
  const navigation = useNavigation();
  const { isLoading } = useSupabaseAuth();

  const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;

  // Mobile sidebar state
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // User preferences for theme management
  const { preferences } = useUserPreferences();

  // Memoized theme configuration
  const themeConfig = useMemo(() => ({
    isDark: preferences.theme === 'dark',
    theme: preferences.theme || 'light'
  }), [preferences.theme]);

  // Dark mode initialization
  useEffect(() => {
    document.documentElement.classList.toggle('dark', themeConfig.isDark);
  }, [themeConfig.isDark]);

  // Keyboard shortcut handlers
  const handleGlobalSearch = useCallback(() => {
    const searchInput = document.querySelector(
      'input[placeholder*="⌘K"], input[placeholder*="Ctrl+K"], input[placeholder*="Ara"]',
    );
    if (searchInput) {
      (searchInput as HTMLInputElement).focus();
      (searchInput as HTMLInputElement).select();
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
    );

    if (
      addButton &&
      ((addButton.textContent?.includes('Ekle')) ||
        (addButton.textContent?.includes('Yeni')) ||
        addButton.querySelector('svg'))
    ) {
      (addButton as HTMLElement).click();
    }
  }, []);

  // Quick action handler
  const handleQuickAction = useCallback(
    (actionId: string) => {
      // trackFeatureUse('quick-action', actionId, {
      //   source: 'header-actions',
      // });
      // AI tracking removed

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
    [navigation],
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
                      notifications={notificationState.notifications.map(notif => ({
                        ...notif,
                        actionable: notif.actionUrl ? true : false,
                        timestamp: (notif as any).createdAt || notif.created_at || new Date().toISOString(),
                        archived: false,
                        category: 'general',
                        priority: 'medium'
                      }))}
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
});

/**
 * App with Navigation Provider
 */
const AppWithNavigation = memo(({
  onNavigate,
}: {
  onNavigate: (module: string, page?: string, subPage?: string) => void;
}) => {
  const [currentModule, setCurrentModule] = useState('genel');
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [currentSubPage, setCurrentSubPage] = useState('');

  // Navigation handler
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
    <NavigationProvider
      initialModule={currentModule}
      initialPage={currentPage}
      initialSubPage={currentSubPage}
    >
      <AppContent />
      <ToastProvider />
    </NavigationProvider>
  );
});

/**
 * Application with Error Handling Wrapper
 * 
 * This component wraps the main application with error boundary and context providers.
 * It provides a centralized error handling mechanism and manages the application's
 * core context providers including authentication, notifications, and AI services.
 * 
 * @component
 * @returns {JSX.Element} The application wrapped with error handling and context providers
 */
function AppWithErrorHandling() {
  // Navigation handler
  const handleNavigation = useCallback(() => {
    // Navigation handled
  }, []);

  return (
    <ErrorBoundary>
      <SupabaseAuthProvider>
            <AppWithNavigation onNavigate={handleNavigation} />
      </SupabaseAuthProvider>
    </ErrorBoundary>
  );
}

/**
 * Main Application Component
 * 
 * This is the root component that initializes the entire application.
 * It serves as the entry point for the Dernek Yönetim Sistemi.
 * 
 * @component
 * @returns {JSX.Element} The complete application with all providers and error handling
 * 
 * @example
 * ```tsx
 * import App from './App';
 * 
 * ReactDOM.render(<App />, document.getElementById('root'));
 * ```
 */
function App() {
  return <AppWithErrorHandling />;
}

export default App;
