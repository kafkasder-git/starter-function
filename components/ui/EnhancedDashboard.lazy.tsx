/**
 * @fileoverview Lazy-loaded EnhancedDashboard
 * Bundle optimization: Split large dashboard into lazy-loaded chunks
 */

import { lazy, Suspense } from 'react';
import { Skeleton } from './skeleton';

// Lazy load the main dashboard component
const EnhancedDashboardComponent = lazy(() => 
  import('./EnhancedDashboard').then(module => ({ default: module.EnhancedDashboard }))
);

// Loading fallback
const DashboardSkeleton = () => (
  <div className="space-y-6 p-6">
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {[...Array(4)].map((_, i) => (
        <Skeleton key={i} className="h-32 w-full" />
      ))}
    </div>
    <div className="grid gap-4 md:grid-cols-2">
      {[...Array(2)].map((_, i) => (
        <Skeleton key={i} className="h-64 w-full" />
      ))}
    </div>
  </div>
);

// Lazy-loaded wrapper component
export const EnhancedDashboard = () => (
  <Suspense fallback={<DashboardSkeleton />}>
    <EnhancedDashboardComponent />
  </Suspense>
);

export default EnhancedDashboard;

