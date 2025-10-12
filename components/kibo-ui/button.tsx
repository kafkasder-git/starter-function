/**
 * @fileoverview Kibo UI Button Component
 * Modern, accessible button component with enhanced features
 * 
 * @author Kibo UI Team
 * @version 2.0.0
 */

import { Slot } from '@radix-ui/react-slot';
import type { VariantProps } from 'class-variance-authority';
import * as React from 'react';
import { Loader2 } from 'lucide-react';

import { cn } from '@/lib/utils';
import { buttonVariants } from '@/lib/design-system/variants';
import { useHapticFeedback } from '../../hooks/useHapticFeedback';
import { Tooltip, TooltipTrigger, TooltipContent } from './tooltip';
import { Badge } from './badge';

// Ripple effect hook
const useRipple = () => {
  const [ripples, setRipples] = React.useState<{ id: number; x: number; y: number }[]>([]);

  const addRipple = React.useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    const button = event.currentTarget;
    const rect = button.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const id = Date.now();

    setRipples(prev => [...prev, { id, x, y }]);

    // Remove ripple after animation
    setTimeout(() => {
      setRipples(prev => prev.filter(ripple => ripple.id !== id));
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
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({
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
    onClick,
    ...props
  }, ref) => {
    const Comp = asChild ? Slot : 'button';
    const isDisabled = disabled || loading;
    const { ripples, addRipple } = useRipple();
    const { triggerHaptic } = useHapticFeedback();

    // Determine if button is icon-only (no text children)
    const isIconOnly = !children || (typeof children !== 'string' && typeof children !== 'number');

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      if (ripple && !isDisabled) {
        addRipple(event);
      }
      if (haptic && !isDisabled) {
        triggerHaptic(haptic);
      }
      onClick?.(event);
    };

    const buttonElement = (
      <Comp
        data-slot="button"
        className={cn(
          buttonVariants({ variant, size, className }),
          fullWidth && 'w-full',
          loading && 'cursor-wait',
          ripple && 'relative overflow-hidden',
          badge && 'relative',
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
        {loading && (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        )}
        {!loading && iconLeft && (
          <span className="mr-1">{iconLeft}</span>
        )}
        {loading ? (loadingText || children) : children}
        {!loading && iconRight && (
          <span className="ml-1">{iconRight}</span>
        )}

        {/* Badge Indicator */}
        {badge && (
          <Badge
            variant="destructive"
            size="sm"
            className="absolute -top-1 -right-1 min-w-5 h-5 flex items-center justify-center px-1 rounded-full"
            aria-label={`${badge} notifications`}
          >
            {badge}
          </Badge>
        )}

        {/* Ripple Effect */}
        {ripple && ripples.map((ripple) => (
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
          <TooltipTrigger asChild>
            {buttonElement}
          </TooltipTrigger>
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
