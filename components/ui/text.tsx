/**
 * @fileoverview Text Component - Semantic text component with consistent styling
 *
 * @author Kafkasder Yönetim Sistemi Team
 * @version 1.0.0
 */

import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { cn } from './utils';

const textVariants = cva('font-family-primary', {
  variants: {
    variant: {
      body: 'text-foreground',
      caption: 'text-muted-foreground',
      label: 'text-foreground font-medium',
      code: 'font-mono bg-muted px-1.5 py-0.5 rounded text-sm',
      kbd: 'font-mono bg-muted border border-border px-1.5 py-0.5 rounded text-xs shadow-sm',
    },
    size: {
      xs: 'text-xs leading-4',
      sm: 'text-sm leading-5',
      md: 'text-base leading-6',
      lg: 'text-lg leading-7',
      xl: 'text-xl leading-7',
    },
    weight: {
      normal: 'font-normal',
      medium: 'font-medium',
      semibold: 'font-semibold',
      bold: 'font-bold',
    },
    color: {
      foreground: 'text-foreground',
      muted: 'text-muted-foreground',
      primary: 'text-primary',
      success: 'text-success',
      warning: 'text-warning',
      error: 'text-error',
      neutral: 'text-neutral-600 dark:text-neutral-400',
    },
  },
  defaultVariants: {
    variant: 'body',
    size: 'md',
    weight: 'normal',
    color: 'foreground',
  },
});

export interface TextProps
  extends Omit<React.ComponentProps<'span'>, 'color'>,
    VariantProps<typeof textVariants> {
  asChild?: boolean;
  as?: 'span' | 'p' | 'div' | 'label' | 'code' | 'kbd';
  truncate?: boolean;
  balance?: boolean;
  pretty?: boolean;
}

const Text = React.forwardRef<HTMLSpanElement, TextProps>(
  (
    {
      className,
      variant,
      size,
      weight,
      color,
      as = 'span',
      truncate = false,
      balance = false,
      pretty = false,
      children,
      ...props
    },
    ref
  ) => {
    // Determine the component to render
    let Component: React.ElementType = as;

    // Override component based on variant
    if (variant === 'code') {
      Component = 'code';
    } else if (variant === 'kbd') {
      Component = 'kbd';
    } else if (variant === 'label') {
      Component = 'label';
    }

    return (
      <Component
        className={cn(
          textVariants({ variant, size, weight, color }),
          truncate && 'truncate',
          balance && 'text-balance',
          pretty && 'text-pretty',
          className
        )}
        ref={Component === 'span' ? ref : undefined}
        {...props}
      >
        {children}
      </Component>
    );
  }
);
Text.displayName = 'Text';

export { Text, textVariants };
