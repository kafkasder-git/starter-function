/**
 * @fileoverview button Module - Application module
 *
 * Base Button Component
 *
 * This is the foundational button component used throughout the application.
 * For buttons that need integrated loading, success, and error states,
 * use the LoadingButton component which extends this base Button.
 *
 * @see LoadingButton in components/ui/loading-button.tsx for stateful button implementation
 *
 * Features:
 * - Multiple variants (default, destructive, outline, secondary, ghost, link, success, warning, info)
 * - Size options (xs, sm, default, lg, xl, icon)
 * - Loading state with spinner
 * - Icon support (left and right)
 * - Ripple effect
 * - Haptic feedback
 * - Tooltip integration
 * - Badge indicator
 * - Full accessibility support
 *
 * Usage:
 * - Use Button for simple actions (navigation, toggles, simple clicks)
 * - Use LoadingButton for async operations that require visual feedback (form submissions, API calls)
 *
 * @author Dernek Yönetim Sistemi Team
 * @version 1.0.0
 */

import { Slot } from '@radix-ui/react-slot';
import type { VariantProps } from 'class-variance-authority';
import * as React from 'react';
import { Loader2 } from 'lucide-react';

import { cn } from './utils';
import { buttonVariants } from '@/lib/design-system/variants';
import { useHapticFeedback } from '../../hooks/useHapticFeedback';
import { Tooltip, TooltipTrigger, TooltipContent } from './tooltip';
import { Badge, type BadgeProps } from './badge';

// Ripple effect hook
const useRipple = () => {
  const [ripples, setRipples] = React.useState<{ id: number; x: number; y: number }[]>([]);

  const addRipple = React.useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    const button = event.currentTarget;
    const rect = button.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const id = Date.now();

    setRipples((prev) => [...prev, { id, x, y }]);

    // Remove ripple after animation
    setTimeout(() => {
      setRipples((prev) => prev.filter((ripple) => ripple.id !== id));
    }, 600);
  }, []);

  return { ripples, addRipple };
};

export interface ButtonProps
  extends React.ComponentProps<'button'>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
  loadingText?: string;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
  fullWidth?: boolean;
  ripple?: boolean;
  haptic?: 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error';
  tooltip?: string;
  badge?: string | number;
  ariaLabel?: string;
  badgeVariant?: BadgeProps['variant'];
  /** Ensure minimum touch target size for mobile accessibility (44x44px) */
  touchOptimized?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      loading = false,
      loadingText,
      iconLeft,
      iconRight,
      fullWidth = false,
      ripple = false,
      haptic,
      tooltip,
      badge,
      ariaLabel,
      disabled,
      children,
      badgeVariant,
      touchOptimized = false,
      onClick,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : 'button';
    const isDisabled = disabled || loading;
    const { ripples, addRipple } = useRipple();
    const { triggerHaptic } = useHapticFeedback();

    const hasTextContent = React.useMemo(() => {
      const inspectNode = (node: React.ReactNode): boolean => {
        if (typeof node === 'string' || typeof node === 'number') {
          return true;
        }
        if (React.isValidElement(node) && node.props?.children) {
          return React.Children.toArray(node.props.children).some(inspectNode);
        }
        return false;
      };

      return React.Children.toArray(children).some(inspectNode);
    }, [children]);

    // Determine if button is icon-only (no textual content)
    const isIconOnly = !hasTextContent;

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      if (ripple && !isDisabled) {
        addRipple(event);
      }
      if (haptic && !isDisabled) {
        triggerHaptic(haptic);
      }
      onClick?.(event);
    };

    const resolvedBadgeVariant =
      badgeVariant ?? (variant === 'destructive' ? 'destructive' : 'info');

    const buttonElement = (
      <Comp
        data-slot="button"
        className={cn(
          buttonVariants({ variant, size, loading }),
          fullWidth && 'w-full',
          loading && 'cursor-wait',
          ripple && 'relative overflow-hidden',
          badge && 'relative',
          // Touch-optimized: Ensure minimum 44x44px touch target on mobile
          touchOptimized && 'min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0',
          className
        )}
        ref={ref}
        disabled={isDisabled}
        aria-disabled={isDisabled}
        aria-busy={loading}
        aria-label={ariaLabel || (tooltip && isIconOnly ? tooltip : undefined)}
        onClick={handleClick}
        {...props}
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
        {!loading && iconLeft && (
          <span className="inline-flex" aria-hidden="true">
            {iconLeft}
          </span>
        )}
        <span className={cn(loading && iconLeft && 'sr-only')}>
          {loading ? loadingText || children : children}
        </span>
        {!loading && iconRight && (
          <span className="inline-flex" aria-hidden="true">
            {iconRight}
          </span>
        )}

        {/* Badge Indicator */}
        {badge && (
          <Badge
            variant={resolvedBadgeVariant}
            size="sm"
            className="absolute -top-1.5 -right-1.5 min-w-5 h-5 flex items-center justify-center px-1.5 rounded-full shadow-sm"
            aria-label={`${badge} notifications`}
          >
            {badge}
          </Badge>
        )}

        {/* Ripple Effect */}
        {ripple &&
          ripples.map((ripple) => (
            <span
              key={ripple.id}
              className="absolute pointer-events-none animate-ping bg-white/60"
              style={{
                left: ripple.x - 10,
                top: ripple.y - 10,
                width: 20,
                height: 20,
                borderRadius: '50%',
                transform: 'scale(0)',
                animation: 'ripple 0.6s linear',
              }}
            />
          ))}
      </Comp>
    );

    // Wrap with tooltip if provided
    if (tooltip) {
      return (
        <Tooltip>
          <TooltipTrigger asChild>{buttonElement}</TooltipTrigger>
          <TooltipContent>
            <p>{tooltip}</p>
          </TooltipContent>
        </Tooltip>
      );
    }

    return buttonElement;
  }
);
Button.displayName = 'Button';

// Memoized Button for performance optimization
export const MemoizedButton = React.memo(Button, (prevProps, nextProps) => {
  // Custom comparison for better performance
  return (
    prevProps.variant === nextProps.variant &&
    prevProps.size === nextProps.size &&
    prevProps.loading === nextProps.loading &&
    prevProps.disabled === nextProps.disabled &&
    prevProps.fullWidth === nextProps.fullWidth &&
    prevProps.className === nextProps.className &&
    prevProps.children === nextProps.children
  );
});

// eslint-disable-next-line react-refresh/only-export-components
export { Button, buttonVariants };
