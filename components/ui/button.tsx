/**
 * @fileoverview button Module - Application module
 * 
 * @author Dernek Yönetim Sistemi Team
 * @version 1.0.0
 */

import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';
import { Loader2 } from 'lucide-react';

import { cn } from './utils';
import { useHapticFeedback } from '../../hooks/useHapticFeedback';

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

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90 active:bg-primary/95',
        destructive:
          'bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60 active:bg-destructive/95',
        outline:
          'border bg-background text-foreground hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50 active:bg-accent/80',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80 active:bg-secondary/70',
        ghost: 'hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50 active:bg-accent/80',
        link: 'text-primary underline-offset-4 hover:underline active:text-primary/80',
        success: 'bg-success text-success-foreground hover:bg-success/90 active:bg-success/95',
        warning: 'bg-warning text-warning-foreground hover:bg-warning/90 active:bg-warning/95',
      },
      size: {
        default: 'h-9 px-4 py-2 gap-2 has-[>svg]:px-3',
        sm: 'h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5',
        lg: 'h-10 rounded-md gap-2.5 px-6 has-[>svg]:px-4',
        xl: 'h-12 rounded-lg gap-3 px-8 text-base has-[>svg]:px-6',
        icon: 'size-9 rounded-md p-0',
        'icon-sm': 'size-8 rounded-md p-0',
        'icon-lg': 'size-10 rounded-md p-0',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

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
    disabled,
    children,
    onClick,
    ...props 
  }, ref) => {
    const Comp = asChild ? Slot : 'button';
    const isDisabled = disabled || loading;
    const { ripples, addRipple } = useRipple();
    const { triggerHaptic } = useHapticFeedback();

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      if (ripple && !isDisabled) {
        addRipple(event);
      }
      if (haptic && !isDisabled) {
        triggerHaptic(haptic);
      }
      onClick?.(event);
    };

    return (
      <Comp
        data-slot="button"
        className={cn(
          buttonVariants({ variant, size, className }),
          fullWidth && 'w-full',
          loading && 'cursor-wait',
          ripple && 'relative overflow-hidden',
          className
        )}
        ref={ref}
        disabled={isDisabled}
        aria-disabled={isDisabled}
        aria-busy={loading}
        aria-label={loading ? `${children} - Loading` : undefined}
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
        
        {/* Ripple Effect */}
        {ripple && ripples.map((ripple) => (
          <span
            key={ripple.id}
            className="absolute pointer-events-none animate-ping"
            style={{
              left: ripple.x - 10,
              top: ripple.y - 10,
              width: 20,
              height: 20,
              borderRadius: '50%',
              backgroundColor: 'rgba(255, 255, 255, 0.6)',
              transform: 'scale(0)',
              animation: 'ripple 0.6s linear',
            }}
          />
        ))}
      </Comp>
    );
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

export { Button, buttonVariants };
