/**
 * @fileoverview badge Module - Application module
 * 
 * @author Dernek Yönetim Sistemi Team
 * @version 1.0.0
 */

import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';
import { X } from 'lucide-react';

import { cn } from './utils';

const badgeVariants = cva(
  'inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary text-primary-foreground [a&]:hover:bg-primary/90',
        secondary:
          'border-transparent bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/90',
        destructive:
          'border-transparent bg-destructive text-white [a&]:hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60',
        outline: 'text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground',
        success: 'border-transparent bg-success text-success-foreground [a&]:hover:bg-success/90',
        warning: 'border-transparent bg-warning text-warning-foreground [a&]:hover:bg-warning/90',
        info: 'border-transparent bg-info text-info-foreground [a&]:hover:bg-info/90',
        dot: 'border-transparent bg-transparent text-foreground',
      },
      size: {
        default: 'px-2 py-0.5 text-xs',
        sm: 'px-1.5 py-0.5 text-xs',
        lg: 'px-3 py-1 text-sm',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

export interface BadgeProps
  extends React.ComponentProps<'span'>,
    VariantProps<typeof badgeVariants> {
  asChild?: boolean;
  removable?: boolean;
  onRemove?: () => void;
  icon?: React.ReactNode;
  dot?: boolean;
  animated?: boolean;
}

function Badge({
  className,
  variant,
  size,
  asChild = false,
  removable = false,
  onRemove,
  icon,
  dot = false,
  animated = false,
  children,
  ...props
}: BadgeProps) {
  const Comp = asChild ? Slot : 'span';
  const [isRemoving, setIsRemoving] = React.useState(false);

  const handleRemove = () => {
    if (onRemove) {
      setIsRemoving(true);
      setTimeout(() => {
        onRemove();
        setIsRemoving(false);
      }, 150);
    }
  };

  const isDotVariant = variant === 'dot' || dot;

  return (
    <Comp
      data-slot="badge"
      className={cn(
        badgeVariants({ variant, size }),
        animated && 'animate-scale-in',
        isRemoving && 'animate-scale-out opacity-0',
        isDotVariant && 'w-2 h-2 p-0 rounded-full',
        className
      )}
      {...props}
    >
      {!isDotVariant && icon && (
        <span className="flex items-center">{icon}</span>
      )}
      {!isDotVariant && children}
      {removable && !isDotVariant && (
        <button
          type="button"
          onClick={handleRemove}
          className="ml-1 hover:bg-black/10 dark:hover:bg-white/10 rounded-full p-0.5 transition-colors"
          aria-label="Remove badge"
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </Comp>
  );
}

// Memoized Badge for performance optimization
export const MemoizedBadge = React.memo(Badge, (prevProps, nextProps) => {
  return (
    prevProps.variant === nextProps.variant &&
    prevProps.size === nextProps.size &&
    prevProps.removable === nextProps.removable &&
    prevProps.animated === nextProps.animated &&
    prevProps.className === nextProps.className &&
    prevProps.children === nextProps.children
  );
});

export { Badge, badgeVariants };
