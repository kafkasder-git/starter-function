/**
 * @fileoverview skeleton Module - Application module
 *
 * Skeleton loading component that uses skeletonVariants from the design system.
 * Includes shimmer animation for better visual feedback during loading states.
 *
 * The shimmer animation is automatically applied via skeletonVariants using the
 * `before:animate-shimmer` class, which creates a subtle shine effect that moves
 * across the skeleton element.
 *
 * Available Variants:
 * - default: Standard skeleton with base height
 * - text: Text line skeleton (h-4)
 * - avatar: Circular avatar skeleton
 * - button: Button-sized skeleton (h-9)
 * - card: Card-sized skeleton (h-32)
 * - input: Input field skeleton (h-9)
 *
 * Size Options:
 * - xs: Extra small (h-3)
 * - sm: Small (h-4)
 * - default: Default (h-5)
 * - lg: Large (h-6)
 * - xl: Extra large (h-8)
 *
 * @example
 * ```tsx
 * // Text skeleton
 * <Skeleton variant="text" className="w-full" />
 *
 * // Avatar skeleton
 * <Skeleton variant="avatar" className="w-12 h-12" />
 *
 * // Custom size skeleton
 * <Skeleton size="lg" className="w-64" />
 * ```
 *
 * @author Dernek Yönetim Sistemi Team
 * @version 1.0.0
 */

import * as React from 'react';
import type { VariantProps } from 'class-variance-authority';
import { cn } from './utils';
import { skeletonVariants } from '@/lib/design-system/variants';

export interface SkeletonProps
  extends React.ComponentProps<'div'>,
    VariantProps<typeof skeletonVariants> {}

function Skeleton({ className, variant = 'default', size, ...props }: SkeletonProps) {
  return (
    <div
      data-slot="skeleton"
      className={cn(skeletonVariants({ variant, size }), className)}
      aria-busy="true"
      aria-live="polite"
      {...props}
    />
  );
}

export { Skeleton };
