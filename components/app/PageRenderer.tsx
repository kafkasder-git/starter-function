/**
 * @fileoverview PageRenderer Module - Application module
 * 
 * @author Dernek Yönetim Sistemi Team
 * @version 1.0.0
 */

import React, { lazy, Suspense, useMemo } from 'react';
import { SkeletonLoader } from '../shared/LoadingSpinner';
import { getRouteConfig } from './AppNavigation';
import { useNavigation } from './NavigationManager';

// Lazy load large components for better performance
const BeneficiaryDetailPageComprehensive = lazy(
  () => import('../pages/BeneficiaryDetailPageComprehensive'),
);

// Demo components removed

// MeetingsPage removed

// AI Assistant page removed

interface PageRendererProps {
  onQuickAction?: (actionId: string) => void;
}

/**
 * PageRenderer function
 * 
 * @param {Object} params - Function parameters
 * @returns {void} Nothing
 */
export function PageRenderer({ onQuickAction }: PageRendererProps) {
  const {
    activeModule,
    currentPage,
    currentSubPage,
    selectedBeneficiaryId,
    navigateToBeneficiaryDetail,
    backToBeneficiariesList,
    moduleChange,
  } = useNavigation();

  const renderCurrentPage = useMemo(() => {
    const getSkeletonFallback = (variant: 'detail' | 'table' | 'form' | 'dashboard') => (
      <SkeletonLoader variant={variant} />
    );

    const renderPageWithTransition = (
      PageComponent: React.ComponentType<any>,
      props: any = {},
      skeletonVariant: 'detail' | 'table' | 'form' | 'dashboard' = 'detail',
    ) => (
      <Suspense fallback={getSkeletonFallback(skeletonVariant)}>
        <PageComponent {...props} />
      </Suspense>
    );

    // Special pages first (system pages)
    const specialPages = {
      profile: { variant: 'detail' as const },
      settings: { variant: 'detail' as const },
      'user-management': { variant: 'table' as const },
      'modern-showcase': { variant: 'dashboard' as const },
      'form-table-showcase': { variant: 'dashboard' as const },
    };

    if (specialPages[currentPage as keyof typeof specialPages]) {
      const routeConfig = getRouteConfig(currentPage);
      const { variant } = specialPages[currentPage as keyof typeof specialPages];
      return renderPageWithTransition(routeConfig.component, routeConfig.props || {}, variant);
    }

    // Aid management module with detail page handling
    if (activeModule === 'yardim') {
      if (currentPage === 'detail' && selectedBeneficiaryId) {
        return renderPageWithTransition(
          BeneficiaryDetailPageComprehensive,
          {
            beneficiaryId: selectedBeneficiaryId,
            onBack: backToBeneficiariesList,
          },
          'detail',
        );
      }
    }

    // Get route configuration based on current state
    const routeConfig = getRouteConfig(activeModule, currentSubPage);

    // Prepare props based on the current route
    let componentProps = { ...routeConfig.props };

    // Add special props for specific components
    if (activeModule === 'genel') {
      componentProps = {
        ...componentProps,
        onNavigate: moduleChange,
        onQuickAction,
      };
    } else if (
      activeModule === 'yardim' &&
      (currentSubPage === '/yardim/ihtiyac-sahipleri' || !currentSubPage)
    ) {
      // Beneficiaries page - both default and explicit route
      componentProps = {
        ...componentProps,
        onNavigateToDetail: navigateToBeneficiaryDetail,
      };
    }

    return renderPageWithTransition(
      routeConfig.component,
      componentProps,
      routeConfig.skeletonVariant ?? 'detail',
    );
  }, [
    currentPage,
    currentSubPage,
    activeModule,
    selectedBeneficiaryId,
    navigateToBeneficiaryDetail,
    backToBeneficiariesList,
    moduleChange,
    onQuickAction,
  ]);

  return <>{renderCurrentPage}</>;
}

export default PageRenderer;
