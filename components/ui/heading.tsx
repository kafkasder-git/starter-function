/**
 * @fileoverview Heading Component - Semantic heading component with proper hierarchy
 * 
 * @author Kafkasder Yönetim Sistemi Team
 * @version 1.0.0
 */

import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { cn } from './utils';

const headingVariants = cva(
  'font-family-primary tracking-tight',
  {
    variants: {
      size: {
        xs: 'text-sm leading-5',
        sm: 'text-base leading-6',
        md: 'text-lg leading-7',
        lg: 'text-xl leading-7',
        xl: 'text-2xl leading-8',
        '2xl': 'text-3xl leading-9',
        '3xl': 'text-4xl leading-10',
        '4xl': 'text-5xl leading-none',
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
        neutral: 'text-neutral-700 dark:text-neutral-300',
      },
    },
    defaultVariants: {
      size: 'lg',
      weight: 'semibold',
      color: 'foreground',
    },
  },
);

export interface HeadingProps
  extends Omit<React.ComponentProps<'h1'>, 'color'>,
    VariantProps<typeof headingVariants> {
  level: 1 | 2 | 3 | 4 | 5 | 6;
  asChild?: boolean;
  balance?: boolean;
  pretty?: boolean;
}

const Heading = React.forwardRef<HTMLHeadingElement, HeadingProps>(
  ({ 
    className, 
    level,
    size, 
    weight, 
    color, 
    asChild,
    balance = false,
    pretty = false,
    children,
    ...props 
  }, ref) => {
    // Map semantic level to HTML element
    const Component = `h${level}` as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
    
    // Default size mapping based on level if no size is provided
    const defaultSize = size || (() => {
      switch (level) {
        case 1: return '3xl';
        case 2: return '2xl';
        case 3: return 'xl';
        case 4: return 'lg';
        case 5: return 'md';
        case 6: return 'sm';
        default: return 'lg';
      }
    })();

    return (
      <Component
        className={cn(
          headingVariants({ size: defaultSize, weight, color }),
          balance && 'text-balance',
          pretty && 'text-pretty',
          className
        )}
        ref={ref}
        {...props}
      >
        {children}
      </Component>
    );
  }
);
Heading.displayName = 'Heading';

export { Heading, headingVariants };