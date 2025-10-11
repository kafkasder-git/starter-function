/**
 * @fileoverview card Module - Application module
 *
 * @author Dernek Yönetim Sistemi Team
 * @version 1.0.0
 */

import * as React from 'react';
import { Loader2 } from 'lucide-react';

import { cn } from './utils';
import { cardVariants } from '@/lib/design-system/variants';
import { Heading } from './heading';
import { Text } from './text';

export interface CardProps extends React.ComponentProps<'div'> {
  variant?: 'default' | 'elevated' | 'outlined' | 'ghost';
  density?: 'default' | 'compact';
  interactive?: boolean;
  loading?: boolean;
  hoverable?: boolean;
  clickable?: boolean;
  onClick?: () => void;
  status?: 'default' | 'success' | 'warning' | 'error' | 'info';
  skeleton?: boolean;
  badge?: string | number;
  pressed?: boolean;
}

const statusStyles = {
  default: '',
  success: 'border-l-4 border-l-success-500',
  warning: 'border-l-4 border-l-warning-500',
  error: 'border-l-4 border-l-error-500',
  info: 'border-l-4 border-l-info-500',
};

export interface CardSkeletonProps extends React.ComponentProps<'div'> {
  variant?: 'default' | 'elevated' | 'outlined' | 'ghost';
  density?: 'default' | 'compact';
  showHeader?: boolean;
  showFooter?: boolean;
  contentLines?: number;
}

function CardSkeleton({
  className,
  variant = 'default',
  density = 'default',
  showHeader = true,
  showFooter = false,
  contentLines = 3,
  ...props
}: CardSkeletonProps) {
  return (
    <div
      data-slot="card-skeleton"
      className={cn(
        'flex flex-col animate-pulse',
        density === 'compact' ? 'gap-3' : 'gap-6',
        cardVariants({ variant }),
        className,
      )}
      aria-busy="true"
      aria-label="Loading content"
      {...props}
    >
      {showHeader && (
        <div className={cn('px-6 pt-6 space-y-2', density === 'compact' && 'px-0 pt-0')}>
          <div className="h-5 bg-muted rounded w-3/4" />
          <div className="h-4 bg-muted rounded w-1/2" />
        </div>
      )}
      <div className={cn('px-6 space-y-3', density === 'compact' && 'px-0')}>
        {Array.from({ length: contentLines }).map((_, i) => (
          <div
            key={i}
            className="h-4 bg-muted rounded"
            style={{ width: `${Math.random() * 30 + 60}%` }}
          />
        ))}
      </div>
      {showFooter && (
        <div className={cn('px-6 pb-6 flex gap-2', density === 'compact' && 'px-0 pb-0')}>
          <div className="h-9 bg-muted rounded w-20" />
          <div className="h-9 bg-muted rounded w-20" />
        </div>
      )}
    </div>
  );
}

function Card({
  className,
  variant = 'default',
  density = 'default',
  interactive = false,
  loading = false,
  hoverable = false,
  clickable = false,
  onClick,
  status = 'default',
  skeleton = false,
  badge,
  pressed,
  children,
  ...props
}: CardProps) {
  const isClickable = clickable || Boolean(onClick);

  // If skeleton is true, render CardSkeleton instead
  if (skeleton) {
    return <CardSkeleton className={className} variant={variant} density={density} />;
  }

  return (
    <div
      data-slot="card"
      className={cn(
        'flex flex-col transition-all duration-200 ease-smooth relative',
        density === 'compact' ? 'gap-3' : 'gap-6',
        cardVariants({ variant, interactive }),
        statusStyles[status],
        interactive && 'hover:shadow-elevation-2 hover:-translate-y-0.5 cursor-pointer',
        hoverable && 'hover:shadow-elevation-1 hover:-translate-y-0.5',
        isClickable && 'cursor-pointer hover:shadow-elevation-2 hover:-translate-y-0.5 active:translate-y-0 active:shadow-elevation-1 min-h-[44px]',
        loading && 'overflow-hidden',
        className,
      )}
      onClick={onClick}
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      aria-label={isClickable ? props['aria-label'] : undefined}
      aria-describedby={isClickable ? props['aria-describedby'] : undefined}
      aria-pressed={isClickable && pressed !== undefined ? pressed : undefined}
      onKeyDown={isClickable ? (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick?.();
        }
      } : undefined}
      {...props}
    >
      {loading && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-10">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      )}
      {badge !== undefined && (
        <div className="absolute -top-2 -right-2 z-20">
          <span className="inline-flex items-center justify-center min-w-[1.5rem] h-6 px-2 text-xs font-semibold text-white bg-primary-500 rounded-full">
            {badge}
          </span>
        </div>
      )}
      {children}
    </div>
  );
}

function CardHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        '@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6 pt-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6',
        className,
      )}
      {...props}
    />
  );
}

interface CardTitleProps extends Omit<React.HTMLAttributes<HTMLHeadingElement>, 'color'> {
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
}

function CardTitle({ className, level, size, children, ...props }: CardTitleProps) {
  return (
    <Heading
      level={level ?? 4}
      size={size}
      weight="semibold"
      data-slot="card-title"
      className={cn('leading-none', className)}
      {...(props as any)}
    >
      {children}
    </Heading>
  );
}

interface CardDescriptionProps extends Omit<React.HTMLAttributes<HTMLParagraphElement>, 'color'> {
  variant?: 'caption' | 'body';
  size?: 'xs' | 'sm' | 'md';
}

function CardDescription({ className, variant, size, children, ...props }: CardDescriptionProps) {
  return (
    <Text
      as="p"
      variant={variant ?? 'caption'}
      color="muted"
      size={size ?? 'sm'}
      data-slot="card-description"
      className={className}
      {...(props as any)}
    >
      {children}
    </Text>
  );
}

function CardAction({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-action"
      className={cn('col-start-2 row-span-2 row-start-1 self-start justify-self-end', className)}
      {...props}
    />
  );
}

function CardContent({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-content"
      className={cn('px-6 [&:last-child]:pb-6', className)}
      {...props}
    />
  );
}

function CardFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-footer"
      className={cn('flex items-center px-6 pb-6 [.border-t]:pt-6', className)}
      {...props}
    />
  );
}

// Memoized Card for performance optimization
export const MemoizedCard = React.memo(Card, (prevProps, nextProps) => {
  return (
    prevProps.variant === nextProps.variant &&
    prevProps.density === nextProps.density &&
    prevProps.interactive === nextProps.interactive &&
    prevProps.loading === nextProps.loading &&
    prevProps.hoverable === nextProps.hoverable &&
    prevProps.clickable === nextProps.clickable &&
    prevProps.status === nextProps.status &&
    prevProps.skeleton === nextProps.skeleton &&
    prevProps.badge === nextProps.badge &&
    prevProps.className === nextProps.className &&
    prevProps.children === nextProps.children
  );
});

export { Card, CardHeader, CardFooter, CardTitle, CardAction, CardDescription, CardContent, CardSkeleton };
