/**
 * @fileoverview LazyComponents Module - Application module
 *
 * @author Dernek Yönetim Sistemi Team
 * @version 1.0.0
 */

import React, { lazy, Suspense } from 'react';
import { SkeletonLoader } from './LoadingSpinner';
// 🚀 LAZY LOADING OPTIMIZATION
// Heavy components için performance optimization

// Large Pages - Lazy loaded
// Demo component removed

export const BeneficiaryDetailPageComprehensive = lazy(() =>
  import('./pages/BeneficiaryDetailPageComprehensive').then((m) => ({
    default: m.BeneficiaryDetailPageComprehensive,
  })),
);

// SecurityManagementPage ve UserManagementPage kaldırıldı - eksik dosyalar
// MeetingsPage kaldırıldı - dosya mevcut değil

// Analytics Components - Removed (components deleted)
// Workflow Components - Removed (components deleted)

// Chart Components - Heavy rendering
export const InteractiveChart = lazy(() =>
  import('./ui/InteractiveChart').then((m) => ({ default: m.InteractiveChart })),
);

// Beneficiary Components - Core components only
// BeneficiaryOptimized removed - unused component

// Heavy Pages - Additional lazy loading

// AI Assistant page removed

export const UserManagementPageReal = lazy(() =>
  import('./pages/UserManagementPageReal').then((m) => ({ default: m.UserManagementPageReal })),
);

// Yeni eklenen sayfalar - performans optimizasyonu
export const DonationsPage = lazy(() =>
  import('./pages/DonationsPage').then((m) => ({ default: m.DonationsPage })),
);

// MembersPage kaldırıldı - dosya mevcut değil

export const BeneficiariesPageEnhanced = lazy(() =>
  import('./pages/BeneficiariesPageEnhanced').then((m) => ({
    default: m.BeneficiariesPageEnhanced,
  })),
);

export const FinanceIncomePage = lazy(() =>
  import('./pages/FinanceIncomePage').then((m) => ({ default: m.FinanceIncomePage })),
);

export const EventsPage = lazy(() =>
  import('./pages/EventsPage').then((m) => ({ default: m.EventsPage })),
);

// TasksPage kaldırıldı - dosya mevcut değil

// New PWA Components - Lazy load for better initial performance
export const PushNotificationManager = lazy(() =>
  import('./notifications/PushNotificationManager').then((m) => ({ default: m.default })),
);

export const BackgroundSyncManager = lazy(() =>
  import('./sync/BackgroundSyncManager').then((m) => ({ default: m.default })),
);

// Native features demo removed

// Analytics Components - Removed (components deleted)
// Reporting Components - Removed (components deleted)

// Wrapper component with loading fallback
interface LazyWrapperProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  className?: string;
}

export const LazyWrapper = ({
  children,
  fallback = <SkeletonLoader variant="dashboard" />,
  className,
}: LazyWrapperProps) => (
  <div className={className}>
    <Suspense fallback={fallback}>{children}</Suspense>
  </div>
);

// Specific wrappers for different component types
export const LazyPageWrapper = ({ children }: { children: React.ReactNode }) => (
  <LazyWrapper fallback={<SkeletonLoader variant="dashboard" />}>{children}</LazyWrapper>
);

export const LazyCardWrapper = ({ children }: { children: React.ReactNode }) => (
  <LazyWrapper fallback={<SkeletonLoader variant="cards" />}>{children}</LazyWrapper>
);

export const LazyDashboardWrapper = ({ children }: { children: React.ReactNode }) => (
  <LazyWrapper fallback={<SkeletonLoader variant="dashboard" />}>{children}</LazyWrapper>
);

export const LazyTableWrapper = ({ children }: { children: React.ReactNode }) => (
  <LazyWrapper fallback={<SkeletonLoader variant="table" />}>{children}</LazyWrapper>
);

// Performance optimized chart wrapper
export const LazyChartWrapper = ({
  children,
  height = 300,
}: {
  children: React.ReactNode;
  height?: number;
}) => {
  // Map height to appropriate CSS class
  const getHeightClass = (h: number) => {
    if (h <= 200) return 'lazy-chart-wrapper-sm';
    if (h <= 300) return 'lazy-chart-wrapper-md';
    if (h <= 400) return 'lazy-chart-wrapper-lg';
    return 'lazy-chart-wrapper-xl';
  };

  const heightClass = getHeightClass(height);

  return (
    <div className={heightClass}>
      <Suspense
        fallback={
          <div className={`animate-pulse bg-gray-200 rounded-lg ${heightClass}`}>
            <div className="flex items-center justify-center h-full">
              <div className="text-gray-400">Grafik yükleniyor...</div>
            </div>
          </div>
        }
      >
        {children}
      </Suspense>
    </div>
  );
};

