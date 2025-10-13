/**
 * @fileoverview StatusBadge Component
 *
 * Accessible status indicator that combines icon + color + text.
 * Uses semantic colors and icons from the design system for consistency.
 *
 * This component ensures status is conveyed through multiple channels:
 * - Visual: Color from semantic tokens (WCAG AA compliant)
 * - Visual: Icon representing status type
 * - Text: Label describing status
 * - Semantic: aria-label for screen readers
 *
 * @example Basic usage
 * <StatusBadge status="success">Approved</StatusBadge>
 *
 * @example Icon only (still accessible)
 * <StatusBadge status="error" />
 *
 * @example Without icon (not recommended)
 * <StatusBadge status="warning" showIcon={false}>Pending Review</StatusBadge>
 *
 * @example Custom size
 * <StatusBadge status="info" size="lg">New</StatusBadge>
 *
 * @example Animated entrance
 * <StatusBadge status="success" animated>Completed</StatusBadge>
 *
 * @author Dernek Yönetim Sistemi Team
 * @version 1.0.0
 */

import * as React from 'react';
import { CheckCircle2, XCircle, AlertTriangle, Info, Clock } from 'lucide-react';
import { Badge, type BadgeProps } from './badge';
import { cn } from './utils';

/**
 * Status type union
 * Represents all possible status states
 */
export type Status = 'success' | 'error' | 'warning' | 'info' | 'pending';

/**
 * StatusBadge Props
 */
export interface StatusBadgeProps extends Omit<BadgeProps, 'variant'> {
  /**
   * Status type - determines icon and color variant
   */
  status: Status;

  /**
   * Optional status text
   */
  children?: React.ReactNode;

  /**
   * Whether to show the status icon
   * @default true
   */
  showIcon?: boolean;

  /**
   * Badge size
   * @default 'default'
   */
  size?: 'xs' | 'sm' | 'default' | 'lg';

  /**
   * Additional CSS classes
   */
  className?: string;

  /**
   * Enable entrance animation
   * @default false
   */
  animated?: boolean;
}

/**
 * Status Configuration
 * Maps status types to badge variants, icons, and labels
 */
const statusConfig = {
  success: {
    variant: 'success' as const,
    icon: CheckCircle2,
    label: 'Success',
  },
  error: {
    variant: 'destructive' as const,
    icon: XCircle,
    label: 'Error',
  },
  warning: {
    variant: 'warning' as const,
    icon: AlertTriangle,
    label: 'Warning',
  },
  info: {
    variant: 'info' as const,
    icon: Info,
    label: 'Information',
  },
  pending: {
    variant: 'secondary' as const,
    icon: Clock,
    label: 'Pending',
  },
} as const;

/**
 * Icon Size Mapping
 * Maps badge sizes to icon sizes
 */
const iconSizeClasses = {
  xs: 'h-3 w-3',
  sm: 'h-3.5 w-3.5',
  default: 'h-4 w-4',
  lg: 'h-4.5 w-4.5',
} as const;

/**
 * StatusBadge Component
 *
 * Accessible status indicator combining icon, color, and text.
 * Always use this component for status displays instead of plain Badge
 * to ensure consistency and accessibility.
 */
export function StatusBadge({
  status,
  children,
  showIcon = true,
  size = 'default',
  className,
  animated = false,
  ...props
}: StatusBadgeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;
  const iconSize = iconSizeClasses[size];

  // Create accessible label combining status type and text
  const ariaLabel = children ? `${config.label}: ${children}` : config.label;

  return (
    <Badge
      variant={config.variant}
      size={size}
      animated={animated}
      className={cn('inline-flex items-center gap-1', className)}
      aria-label={ariaLabel}
      {...props}
    >
      {showIcon && <Icon className={iconSize} aria-hidden="true" />}
      {children}
    </Badge>
  );
}

/**
 * Memoized StatusBadge for performance optimization
 */
export const MemoizedStatusBadge = React.memo(StatusBadge, (prevProps, nextProps) => {
  return (
    prevProps.status === nextProps.status &&
    prevProps.size === nextProps.size &&
    prevProps.showIcon === nextProps.showIcon &&
    prevProps.animated === nextProps.animated &&
    prevProps.className === nextProps.className &&
    prevProps.children === nextProps.children
  );
});

/**
 * Status Badge Variants for specific use cases
 */

/**
 * Approval Status Badge
 * Common statuses for approval workflows
 */
export function ApprovalStatusBadge({
  status,
  ...props
}: Omit<StatusBadgeProps, 'status'> & {
  status: 'approved' | 'pending' | 'rejected';
}) {
  const statusMap = {
    approved: 'success' as const,
    pending: 'pending' as const,
    rejected: 'error' as const,
  };

  return <StatusBadge status={statusMap[status]} {...props} />;
}

/**
 * Priority Badge
 * Visual indicator for priority levels using status colors
 */
export function PriorityBadge({
  priority,
  ...props
}: Omit<StatusBadgeProps, 'status'> & {
  priority: 'high' | 'medium' | 'low';
}) {
  const priorityMap = {
    high: 'error' as const, // Red for urgency
    medium: 'warning' as const, // Yellow for attention
    low: 'info' as const, // Blue for low priority
  };

  return <StatusBadge status={priorityMap[priority]} {...props} />;
}

// Export all components
export { Badge };
