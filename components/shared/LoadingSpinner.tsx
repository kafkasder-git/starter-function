/**
 * @fileoverview LoadingSpinner Module - Application module
 *
 * Reference implementation for loading states using design system variants.
 * This component consistently uses `spinnerVariants` from the design system.
 * All loading states in the application should use these components or the skeletonVariants.
 *
 * @example
 * ```tsx
 * // Simple loading spinner
 * <LoadingSpinner size="lg" />
 *
 * // Full page loading with branding
 * <PageLoading />
 * ```
 *
 * @author Dernek Yönetim Sistemi Team
 * @version 1.0.0
 */

import { Heart, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../ui/utils';
import { spinnerVariants } from '@/lib/design-system/variants';

interface LoadingSpinnerProps {
  className?: string;
  size?: 'xs' | 'sm' | 'default' | 'lg' | 'xl';
}

/**
 * LoadingSpinner function
 *
 * @param {Object} params - Function parameters
 * @returns {void} Nothing
 */
export function LoadingSpinner({ className, size = 'default' }: LoadingSpinnerProps) {
  return <Loader2 className={cn(spinnerVariants({ variant: 'primary', size }), className)} />;
}

/**
 * PageLoading function
 *
 * @param {Object} params - Function parameters
 * @returns {void} Nothing
 */
export function PageLoading() {
  return (
    <div className="flex items-center justify-center min-h-[400px] bg-gradient-to-br from-neutral-50/50 to-info-50/30">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center gap-6"
      >
        <div className="relative">
          <div className="w-16 h-16 bg-gradient-to-br from-info-500 to-info-600 rounded-2xl flex items-center justify-center shadow-lg">
            <Heart className="w-8 h-8 text-white" />
          </div>
          <Loader2
            className={cn(
              'absolute -bottom-2 -right-2 bg-white rounded-full p-1 shadow-md',
              spinnerVariants({ variant: 'primary', size: 'lg' })
            )}
          />
        </div>
        <div className="text-center space-y-2">
          <p className="text-neutral-700 font-medium">Yükleniyor...</p>
          <p className="text-neutral-500 text-sm">Lütfen bekleyiniz</p>
        </div>
      </motion.div>
    </div>
  );
}

// Export SkeletonLoader from this file to consolidate loading components
export { SkeletonLoader } from './SkeletonLoader';
