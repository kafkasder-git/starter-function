import React, { useCallback, useEffect, useState, memo, useMemo, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Outlet, Navigate } from 'react-router-dom';

// Core System Imports
import { ErrorBoundary } from '../components/shared/ErrorBoundary';
import { NetworkStatus } from '../components/NetworkStatus';
import { ToastProvider } from '../components/ToastProvider';
import { useAuthStore } from '../stores/authStore';

// App Management Components
import { RouterNavigationProvider, useNavigation } from '../components/app/RouterNavigationManager';
import { publicRoutes, protectedRoutes } from './routes';
import { SkeletonLoader } from '../components/shared/LoadingSpinner';

// Layout Components
import { Header } from '../components/layouts/Header';
import { Sidebar } from '../components/layouts/Sidebar';
import { ProtectedRoute } from '../components/auth/ProtectedRoute';

// Performance Hooks
import { useGlobalShortcuts } from '../hooks/useKeyboard';
import { useUserPreferences } from '../hooks/useLocalStorage';

/**
 * Root Redirect Component
 * Redirects based on authentication status
 */
const RootRedirect = () => {
  const { isAuthenticated, isInitialized } = useAuthStore();
  
  // Wait for auth initialization to complete
  if (!isInitialized) {
    return <div>Loading...</div>;
  }
  
  return <Navigate to={isAuthenticated ? '/genel' : '/login'} replace />;
};

/**
 * Main Application Content Component
 */
const AppContent = memo(() => {
  const navigation = useNavigation();
  const { isLoading } = useAuthStore();

  const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;

  // Mobile sidebar state
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // User preferences for theme management
  const { preferences } = useUserPreferences();

  // Memoized theme configuration
  const themeConfig = useMemo(
    () => ({
      isDark: preferences.theme === 'dark',
      theme: preferences.theme || 'light',
    }),
    [preferences.theme],
  );

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
      addButton?.textContent &&
      (addButton.textContent.includes('Ekle') ||
        addButton.textContent.includes('Yeni') ||
        addButton.querySelector('svg'))
    ) {
      (addButton as HTMLElement).click();
    }
  }, []);

  // Quick action handler
  const handleQuickAction = useCallback(
    (actionId: string) => {
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
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary type="network">
      <ProtectedRoute requireAuth={true}>
        <div className="flex h-screen flex-col overflow-hidden bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100">
          {/* Network Status */}
          <div className="relative z-50">
            <NetworkStatus compact={true} />
          </div>

          {/* Header */}
          <div className="relative z-40 shadow-lg" data-testid="header" data-onboarding="header">
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
            />
          </div>

          {/* Main Layout */}
          <div className="relative flex flex-1 overflow-hidden">
            {/* Sidebar */}
            <div
              className="relative z-30 shadow-lg"
              data-testid="sidebar"
              data-onboarding="sidebar"
            >
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
              className="relative flex-1 bg-white/50 backdrop-blur-sm"
              data-onboarding="main-content"
            >
              <div className="scrollbar-thin h-full overflow-auto">
                <div
                  className="relative z-10 p-6"
                  data-testid="dashboard"
                  data-onboarding="dashboard"
                >
                  <Suspense fallback={<SkeletonLoader variant="dashboard" />}>
                    <Outlet />
                  </Suspense>
                </div>
              </div>
            </main>
          </div>

          {/* Offline indicator */}
          {!isOnline && (
            <div className="fixed top-4 right-4 z-50 rounded-lg bg-amber-500 px-3 py-2 text-sm text-white">
              📱 Çevrimdışı Modu
            </div>
          )}
        </div>
      </ProtectedRoute>
    </ErrorBoundary>
  );
});

/**
 * App with Router and Navigation Provider
 */
const AppWithNavigation = memo(() => {
  return (
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <RouterNavigationProvider>
        <Routes>
          {/* Root redirect */}
          <Route path="/" element={<RootRedirect />} />

          {/* Public routes */}
          {publicRoutes.map((route, index) => (
            <Route
              key={index}
              path={route.path}
              element={route.element}
            >
              {route.children?.map((childRoute, childIndex) => (
                <Route
                  key={childIndex}
                  path={childRoute.path}
                  index={childRoute.index}
                  element={childRoute.element}
                />
              ))}
            </Route>
          ))}

          {/* Protected routes */}
          <Route element={<AppContent />}>
            {protectedRoutes.map((route, index) => (
              <Route
                key={index}
                path={route.path}
                index={route.index}
                element={route.element}
              >
                {route.children?.map((childRoute, childIndex) => (
                  <Route
                    key={childIndex}
                    path={childRoute.path}
                    index={childRoute.index}
                    element={childRoute.element}
                  />
                ))}
              </Route>
            ))}
          </Route>
        </Routes>
        <ToastProvider />
      </RouterNavigationProvider>
    </BrowserRouter>
  );
});

/**
 * Application with Error Handling Wrapper
 */
function AppWithErrorHandling() {
  return (
    <ErrorBoundary>
      <AppWithNavigation />
    </ErrorBoundary>
  );
}

/**
 * Main Application Component
 */
function App() {
  const { initializeAuth, isInitialized } = useAuthStore();

  // Initialize Appwrite authentication on app start
  useEffect(() => {
    if (!isInitialized) {
      initializeAuth();
    }
  }, [initializeAuth, isInitialized]);

  // Show loading while initializing auth
  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Uygulama başlatılıyor...</p>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <AppWithErrorHandling />
    </ErrorBoundary>
  );
}

export default App;