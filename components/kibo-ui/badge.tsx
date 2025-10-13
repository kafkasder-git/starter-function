/**
 * @fileoverview Kibo UI Badge Component
 * Modern, accessible badge component
 * 
 * @author Kibo UI Team
 * @version 2.0.0
 */

import { Slot } from '@radix-ui/react-slot';
import type { VariantProps } from 'class-variance-authority';
import * as React from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { badgeVariants } from '@/lib/design-system/variants';

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

  const isDotVariant = dot;

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
