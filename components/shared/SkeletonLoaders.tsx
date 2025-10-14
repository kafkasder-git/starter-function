/**
 * @fileoverview SkeletonLoaders Component - Loading state components
 *
 * @author Dernek Yönetim Sistemi Team
 * @version 1.0.0
 */

import React, { memo } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { cn } from '@/lib/utils';

/**
 * Table skeleton loader
 */
export const TableSkeleton = memo(function TableSkeleton({ 
  rows = 5, 
  columns = 4,
  className 
}: { 
  rows?: number;
  columns?: number;
  className?: string;
}) {
  return (
    <div className={cn('space-y-4', className)}>
      {/* Header skeleton */}
      <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} variant="text" className="h-4" />
        ))}
      </div>
      
      {/* Rows skeleton */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton key={colIndex} variant="text" className="h-4" />
          ))}
        </div>
      ))}
    </div>
  );
});

/**
 * Card list skeleton loader
 */
export const CardListSkeleton = memo(function CardListSkeleton({ 
  count = 3,
  className 
}: { 
  count?: number;
  className?: string;
}) {
  return (
    <div className={cn('grid gap-4', className)}>
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i}>
          <CardHeader>
            <Skeleton variant="text" className="h-6 w-3/4" />
            <Skeleton variant="text" className="h-4 w-1/2" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Skeleton variant="text" className="h-4 w-full" />
              <Skeleton variant="text" className="h-4 w-5/6" />
              <Skeleton variant="text" className="h-4 w-4/6" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
});

/**
 * Dashboard stats skeleton
 */
export const DashboardStatsSkeleton = memo(function DashboardStatsSkeleton({ 
  className 
}: { 
  className?: string;
}) {
  return (
    <div className={cn('grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6', className)}>
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i}>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <Skeleton variant="avatar" className="w-12 h-12" />
              <div className="space-y-2 flex-1">
                <Skeleton variant="text" className="h-4 w-20" />
                <Skeleton variant="text" className="h-6 w-16" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
});

/**
 * Beneficiary list skeleton
 */
export const BeneficiaryListSkeleton = memo(function BeneficiaryListSkeleton({ 
  count = 5,
  className 
}: { 
  count?: number;
  className?: string;
}) {
  return (
    <div className={cn('space-y-4', className)}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center space-x-4 p-4 border rounded-lg">
          <Skeleton variant="avatar" className="w-12 h-12" />
          <div className="flex-1 space-y-2">
            <Skeleton variant="text" className="h-5 w-48" />
            <Skeleton variant="text" className="h-4 w-32" />
          </div>
          <div className="space-y-2">
            <Skeleton variant="text" className="h-4 w-20" />
            <Skeleton variant="button" className="h-8 w-24" />
          </div>
        </div>
      ))}
    </div>
  );
});

/**
 * Donation list skeleton
 */
export const DonationListSkeleton = memo(function DonationListSkeleton({ 
  count = 5,
  className 
}: { 
  count?: number;
  className?: string;
}) {
  return (
    <div className={cn('space-y-4', className)}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
          <div className="space-y-2">
            <Skeleton variant="text" className="h-5 w-40" />
            <Skeleton variant="text" className="h-4 w-28" />
          </div>
          <div className="text-right space-y-2">
            <Skeleton variant="text" className="h-6 w-24" />
            <Skeleton variant="text" className="h-4 w-16" />
          </div>
        </div>
      ))}
    </div>
  );
});

/**
 * Message list skeleton
 */
export const MessageListSkeleton = memo(function MessageListSkeleton({ 
  count = 4,
  className 
}: { 
  count?: number;
  className?: string;
}) {
  return (
    <div className={cn('space-y-4', className)}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex space-x-3 p-4 border rounded-lg">
          <Skeleton variant="avatar" className="w-10 h-10" />
          <div className="flex-1 space-y-2">
            <div className="flex items-center space-x-2">
              <Skeleton variant="text" className="h-4 w-24" />
              <Skeleton variant="text" className="h-4 w-16" />
            </div>
            <Skeleton variant="text" className="h-4 w-full" />
            <Skeleton variant="text" className="h-4 w-3/4" />
          </div>
        </div>
      ))}
    </div>
  );
});

/**
 * Form skeleton
 */
export const FormSkeleton = memo(function FormSkeleton({ 
  fields = 5,
  className 
}: { 
  fields?: number;
  className?: string;
}) {
  return (
    <Card className={className}>
      <CardHeader>
        <Skeleton variant="text" className="h-8 w-48" />
        <Skeleton variant="text" className="h-4 w-96" />
      </CardHeader>
      <CardContent className="space-y-6">
        {Array.from({ length: fields }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton variant="text" className="h-4 w-24" />
            <Skeleton variant="input" className="w-full" />
          </div>
        ))}
        <div className="flex space-x-4 pt-4">
          <Skeleton variant="button" className="h-10 w-24" />
          <Skeleton variant="button" className="h-10 w-20" />
        </div>
      </CardContent>
    </Card>
  );
});

/**
 * Chart skeleton
 */
export const ChartSkeleton = memo(function ChartSkeleton({ 
  height = 300,
  className 
}: { 
  height?: number;
  className?: string;
}) {
  return (
    <Card className={className}>
      <CardHeader>
        <Skeleton variant="text" className="h-6 w-48" />
        <Skeleton variant="text" className="h-4 w-32" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Skeleton variant="text" className="h-4 w-full" />
          <Skeleton variant="text" className="h-4 w-5/6" />
          <Skeleton variant="text" className="h-4 w-4/6" />
          <Skeleton variant="text" className="h-4 w-3/6" />
          <Skeleton variant="text" className="h-4 w-2/6" />
          <div 
            className="bg-gray-100 rounded flex items-end space-x-2 p-4"
            style={{ height }}
          >
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton 
                key={i} 
                className="w-8 bg-gray-200" 
                style={{ height: Math.random() * (height - 40) + 20 }}
              />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

/**
 * Page skeleton - Full page loading state
 */
export const PageSkeleton = memo(function PageSkeleton({ 
  className 
}: { 
  className?: string;
}) {
  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="space-y-2">
        <Skeleton variant="text" className="h-8 w-64" />
        <Skeleton variant="text" className="h-4 w-96" />
      </div>
      
      {/* Stats */}
      <DashboardStatsSkeleton />
      
      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CardListSkeleton count={3} />
        <CardListSkeleton count={2} />
      </div>
    </div>
  );
});

/**
 * Modal skeleton
 */
export const ModalSkeleton = memo(function ModalSkeleton({ 
  className 
}: { 
  className?: string;
}) {
  return (
    <div className={cn('space-y-6', className)}>
      <div className="space-y-2">
        <Skeleton variant="text" className="h-6 w-48" />
        <Skeleton variant="text" className="h-4 w-64" />
      </div>
      
      <FormSkeleton fields={4} />
    </div>
  );
});

// Hook for skeleton loading states
export function useSkeletonLoading(isLoading: boolean, delay = 300) {
  const [showSkeleton, setShowSkeleton] = React.useState(false);

  React.useEffect(() => {
    if (isLoading) {
      const timer = setTimeout(() => setShowSkeleton(true), delay);
      return () => clearTimeout(timer);
    } else {
      setShowSkeleton(false);
    }
  }, [isLoading, delay]);

  return showSkeleton;
}

export default {
  TableSkeleton,
  CardListSkeleton,
  DashboardStatsSkeleton,
  BeneficiaryListSkeleton,
  DonationListSkeleton,
  MessageListSkeleton,
  FormSkeleton,
  ChartSkeleton,
  PageSkeleton,
  ModalSkeleton,
  useSkeletonLoading
};
