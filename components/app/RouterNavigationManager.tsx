/**
 * @fileoverview RouterNavigationManager - React Router integrated navigation
 * @description Bridges the old NavigationManager with React Router v6
 * @version 2.0.0
 */

import React, { createContext, useCallback, useContext, useEffect, useMemo, startTransition } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { useUserPreferences } from '../../hooks/useLocalStorage';
import monitoringService from '../../services/monitoringService';
import { moduleToRoute, routeToModule } from '../../src/routes';
import { logger } from '../../lib/logging/logger';

/**
 * NavigationState Interface
 */
export interface NavigationState {
  activeModule: string;
  currentPage: string;
  currentSubPage: string;
  loading: boolean;
  selectedBeneficiaryId: string | null;
}

/**
 * NavigationActions Interface
 */
export interface NavigationActions {
  setActiveModule: (moduleId: string) => void;
  setCurrentPage: (page: string) => void;
  setCurrentSubPage: (subPage: string) => void;
  setLoading: (isLoading: boolean) => void;
  setSelectedBeneficiaryId: (id: string | null) => void;
  navigateToBeneficiaryDetail: (beneficiaryId: string | number) => void;
  backToBeneficiariesList: () => void;
  subPageChange: (href: string) => void;
  moduleChange: (moduleId: string) => void;
  navigateToProfile: () => void;
  navigateToSettings: () => void;
  backToMain: () => void;
  navigateToUserManagement: () => void;
}

interface NavigationContextType extends NavigationState, NavigationActions {}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

/**
 * useNavigation hook
 */
export function useNavigation() {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within a RouterNavigationProvider');
  }
  return context;
}

interface RouterNavigationProviderProps {
  children: React.ReactNode;
}

/**
 * RouterNavigationProvider - Integrates React Router with legacy navigation
 */
export function RouterNavigationProvider({ children }: RouterNavigationProviderProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();
  const { preferences, updatePreference } = useUserPreferences();

  // Derive state from current route
  const navigationState = useMemo<NavigationState>(() => {
    const { pathname } = location;
    const pathParts = pathname.split('/').filter(Boolean);
    
    // Determine active module from path
    let activeModule = 'genel';
    let currentPage = 'list';
    let currentSubPage = '';
    let selectedBeneficiaryId: string | null = null;

    if (pathParts.length > 0) {
      const firstPart = `/${pathParts[0]}`;
      activeModule = routeToModule[firstPart] ?? pathParts[0] ?? 'genel';
      
      if (pathParts.length > 1) {
        currentSubPage = `/${pathParts.slice(0, 2).join('/')}`;
        
        // Check for detail pages (e.g., /yardim/ihtiyac-sahipleri/123)
        if (pathParts.length > 2 && params.id) {
          currentPage = 'detail';
          selectedBeneficiaryId = params.id;
        }
      }
    }

    return {
      activeModule,
      currentPage,
      currentSubPage,
      loading: false,
      selectedBeneficiaryId,
    };
  }, [location.pathname, params.id]);

  // Sync with preferences
  useEffect(() => {
    if (navigationState.activeModule !== preferences.lastModule) {
      updatePreference('lastModule', navigationState.activeModule);
    }
  }, [navigationState.activeModule, preferences.lastModule, updatePreference]);

  // Navigation actions
  const setActiveModule = useCallback(
    (moduleId: string) => {
      const route = moduleToRoute[moduleId] ?? `/${moduleId}`;
      startTransition(() => {
        navigate(route);
      });
      monitoringService.trackFeatureUsage('navigation', 'module_change', { moduleId });
    },
    [navigate],
  );

  const setCurrentPage = useCallback(
    (page: string) => {
      // This is handled by route navigation
      logger.debug('setCurrentPage called with:', page);
    },
    [],
  );

  const setCurrentSubPage = useCallback(
    (subPage: string) => {
      startTransition(() => {
        navigate(subPage);
      });
    },
    [navigate],
  );

  const setLoading = useCallback((isLoading: boolean) => {
    // Loading state can be managed via React Router's navigation state
    logger.debug('setLoading called with:', isLoading);
  }, []);

  const setSelectedBeneficiaryId = useCallback(
    (id: string | null) => {
      if (id) {
        startTransition(() => {
          navigate(`/yardim/ihtiyac-sahipleri/${id}`);
        });
      }
    },
    [navigate],
  );

  const navigateToBeneficiaryDetail = useCallback(
    (beneficiaryId: string | number) => {
      const id = typeof beneficiaryId === 'number' ? beneficiaryId.toString() : beneficiaryId;
      startTransition(() => {
        navigate(`/yardim/ihtiyac-sahipleri/${id}`);
      });
    },
    [navigate],
  );

  const backToBeneficiariesList = useCallback(() => {
    startTransition(() => {
      navigate('/yardim/ihtiyac-sahipleri');
    });
  }, [navigate]);

  const subPageChange = useCallback(
    (href: string) => {
      startTransition(() => {
        navigate(href);
      });
    },
    [navigate],
  );

  const moduleChange = useCallback(
    (moduleId: string) => {
      setActiveModule(moduleId);
    },
    [setActiveModule],
  );

  const navigateToProfile = useCallback(() => {
    startTransition(() => {
      navigate('/profile');
    });
  }, [navigate]);

  const navigateToSettings = useCallback(() => {
    startTransition(() => {
      navigate('/settings');
    });
  }, [navigate]);

  const backToMain = useCallback(() => {
    startTransition(() => {
      navigate('/genel');
    });
  }, [navigate]);

  const navigateToUserManagement = useCallback(() => {
    startTransition(() => {
      navigate('/user-management');
    });
  }, [navigate]);

  // Memoized context value
  const contextValue = useMemo(
    () => ({
      // State
      ...navigationState,

      // Basic actions
      setActiveModule,
      setCurrentPage,
      setCurrentSubPage,
      setLoading,
      setSelectedBeneficiaryId,

      // Complex actions
      navigateToBeneficiaryDetail,
      backToBeneficiariesList,
      subPageChange,
      moduleChange,
      navigateToProfile,
      navigateToSettings,
      backToMain,
      navigateToUserManagement,
    }),
    [
      navigationState,
      setActiveModule,
      setCurrentPage,
      setCurrentSubPage,
      setLoading,
      setSelectedBeneficiaryId,
      navigateToBeneficiaryDetail,
      backToBeneficiariesList,
      subPageChange,
      moduleChange,
      navigateToProfile,
      navigateToSettings,
      backToMain,
      navigateToUserManagement,
    ],
  );

  return <NavigationContext.Provider value={contextValue}>{children}</NavigationContext.Provider>;
}

export default RouterNavigationProvider;
