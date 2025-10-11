/**
 * @fileoverview card Module - Application module
 * 
 * @author Dernek Yönetim Sistemi Team
 * @version 1.0.0
 */

import * as React from 'react';
import { Loader2 } from 'lucide-react';

import { cn } from './utils';

export interface CardProps extends React.ComponentProps<'div'> {
  variant?: 'default' | 'elevated' | 'bordered' | 'flat' | 'outlined' | 'compact';
  interactive?: boolean;
  loading?: boolean;
  hoverable?: boolean;
  clickable?: boolean;
  onClick?: () => void;
  status?: 'default' | 'success' | 'warning' | 'error' | 'info';
  skeleton?: boolean;
  badge?: string | number;
}

const cardVariants = {
  default: 'bg-card text-card-foreground border border-border',
  elevated: 'bg-card text-card-foreground shadow-elevation-2 hover:shadow-elevation-3',
  bordered: 'bg-card text-card-foreground border-2 border-border',
  flat: 'bg-card text-card-foreground',
  outlined: 'bg-card text-card-foreground border-2 border-dashed border-border',
  compact: 'bg-card text-card-foreground border border-border',
};

const statusStyles = {
  default: '',
  success: 'border-l-4 border-l-green-500',
  warning: 'border-l-4 border-l-yellow-500',
  error: 'border-l-4 border-l-red-500',
  info: 'border-l-4 border-l-blue-500',
};

export interface CardSkeletonProps extends React.ComponentProps<'div'> {
  variant?: 'default' | 'elevated' | 'bordered' | 'flat' | 'outlined' | 'compact';
  showHeader?: boolean;
  showFooter?: boolean;
  contentLines?: number;
}

function CardSkeleton({ 
  className,
  variant = 'default',
  showHeader = true,
  showFooter = false,
  contentLines = 3,
  ...props
}: CardSkeletonProps) {
  return (
    <div
      data-slot="card-skeleton"
      className={cn(
        'flex flex-col rounded-xl animate-pulse',
        variant === 'compact' ? 'gap-3 p-4' : 'gap-6',
        cardVariants[variant],
        className,
      )}
      {...props}
    >
      {showHeader && (
        <div className={cn('px-6 pt-6 space-y-2', variant === 'compact' && 'px-0 pt-0')}>
          <div className="h-5 bg-muted rounded w-3/4"></div>
          <div className="h-4 bg-muted rounded w-1/2"></div>
        </div>
      )}
      <div className={cn('px-6 space-y-3', variant === 'compact' && 'px-0')}>
        {Array.from({ length: contentLines }).map((_, i) => (
          <div 
            key={i} 
            className="h-4 bg-muted rounded" 
            style={{ width: `${Math.random() * 30 + 60}%` }}
          ></div>
        ))}
      </div>
      {showFooter && (
        <div className={cn('px-6 pb-6 flex gap-2', variant === 'compact' && 'px-0 pb-0')}>
          <div className="h-9 bg-muted rounded w-20"></div>
          <div className="h-9 bg-muted rounded w-20"></div>
        </div>
      )}
    </div>
  );
}

function Card({ 
  className, 
  variant = 'default',
  interactive = false,
  loading = false,
  hoverable = false,
  clickable = false,
  onClick,
  status = 'default',
  skeleton = false,
  badge,
  children,
  ...props 
}: CardProps) {
  const isClickable = clickable || Boolean(onClick);
  
  // If skeleton is true, render CardSkeleton instead
  if (skeleton) {
    return <CardSkeleton className={className} />;
  }
  
  return (
    <div
      data-slot="card"
      className={cn(
        'flex flex-col rounded-xl transition-all duration-200 ease-smooth relative',
        variant === 'compact' ? 'gap-3 p-4' : 'gap-6',
        cardVariants[variant],
        statusStyles[status],
        interactive && 'hover:shadow-elevation-2 hover:-translate-y-0.5 cursor-pointer',
        hoverable && 'hover:shadow-elevation-1 hover:-translate-y-0.5',
        isClickable && 'cursor-pointer hover:shadow-elevation-2 hover:-translate-y-0.5 active:translate-y-0 active:shadow-elevation-1',
        loading && 'overflow-hidden',
        className,
      )}
      onClick={onClick}
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      aria-label={isClickable ? props['aria-label'] : undefined}
      aria-describedby={isClickable ? props['aria-describedby'] : undefined}
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
          <span className="inline-flex items-center justify-center min-w-[1.5rem] h-6 px-2 text-xs font-semibold text-white bg-primary rounded-full">
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

function CardTitle({ className, ...props }: React.ComponentProps<'div'>) {
  return <h4 data-slot="card-title" className={cn('leading-none font-semibold', className)} {...props} />;
}

function CardDescription({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <p data-slot="card-description" className={cn('text-muted-foreground text-sm', className)} {...props} />
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
