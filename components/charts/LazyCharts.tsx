/**
 * @fileoverview LazyCharts Module - Application module
 *
 * @author Dernek Yönetim Sistemi Team
 * @version 1.0.0
 */

import React, { lazy, Suspense } from 'react';
import { SkeletonLoader } from '../shared/LoadingSpinner';

// Lazy load chart components to reduce initial bundle size
const InteractiveChart = lazy(() =>
  import('../ui/InteractiveChart').then((module) => ({
    default: module.InteractiveChart,
  }))
);

const AreaChart = lazy(() =>
  import('recharts').then((module) => ({
    default: module.AreaChart,
  }))
);

const LineChart = lazy(() =>
  import('recharts').then((module) => ({
    default: module.LineChart,
  }))
);

const BarChart = lazy(() =>
  import('recharts').then((module) => ({
    default: module.BarChart,
  }))
);

const PieChart = lazy(() =>
  import('recharts').then((module) => ({
    default: module.PieChart,
  }))
);

// Chart wrapper with loading fallback
interface LazyChartWrapperProps {
  children: React.ReactNode;
  height?: number;
}

export const LazyChartWrapper = ({ children, height = 300 }: LazyChartWrapperProps) => (
  <Suspense fallback={<SkeletonLoader variant="dashboard" />}>
    <div style={{ height }}>{children}</div>
  </Suspense>
);

// Optimized chart components
export const LazyInteractiveChart = (props: any) => (
  <LazyChartWrapper>
    <InteractiveChart {...props} />
  </LazyChartWrapper>
);

export const LazyAreaChart = (props: any) => (
  <LazyChartWrapper>
    <AreaChart {...props} />
  </LazyChartWrapper>
);

export const LazyLineChart = (props: any) => (
  <LazyChartWrapper>
    <LineChart {...props} />
  </LazyChartWrapper>
);

export const LazyBarChart = (props: any) => (
  <LazyChartWrapper>
    <BarChart {...props} />
  </LazyChartWrapper>
);

export const LazyPieChart = (props: any) => (
  <LazyChartWrapper>
    <PieChart {...props} />
  </LazyChartWrapper>
);

// Chart performance optimization hook
export const useChartOptimization = (data: any[]) => {
  const optimizedData = React.useMemo(() => {
    // Limit data points for performance
    if (data.length > 100) {
      const step = Math.ceil(data.length / 100);
      return data.filter((_, index) => index % step === 0);
    }
    return data;
  }, [data]);

  return optimizedData;
};
