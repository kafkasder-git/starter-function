/**
 * @fileoverview alert Module - Application module
 *
 * @author Dernek Yönetim Sistemi Team
 * @version 1.0.0
 */

import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';
import { X, AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react';

import { cn } from './utils';

const alertVariants = cva(
  'relative w-full rounded-lg border px-4 py-3 text-sm grid has-[>svg]:grid-cols-[calc(var(--spacing)*4)_1fr] grid-cols-[0_1fr] has-[>svg]:gap-x-3 gap-y-0.5 items-start [&>svg]:size-4 [&>svg]:translate-y-0.5 [&>svg]:text-current transition-all duration-200',
  {
    variants: {
      variant: {
        default: 'bg-card text-card-foreground border-border',
        destructive:
          'text-destructive bg-destructive/10 border-destructive/20 [&>svg]:text-destructive *:data-[slot=alert-description]:text-destructive/90',
        success:
          'text-success bg-success/10 border-success/20 [&>svg]:text-success *:data-[slot=alert-description]:text-success/90',
        warning:
          'text-warning bg-warning/10 border-warning/20 [&>svg]:text-warning *:data-[slot=alert-description]:text-warning/90',
        info:
          'text-info bg-info/10 border-info/20 [&>svg]:text-info *:data-[slot=alert-description]:text-info/90',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

/**
 * Alert Component Icon Mapping
 *
 * Icons are chosen for page-level alert messages:
 * - AlertCircle: General alerts and destructive messages (contextual error indication)
 * - CheckCircle: Success messages (close to CheckCircle2 from StatusBadge)
 * - AlertTriangle: Warning messages (matches icon mapping guide)
 * - Info: Informational messages (matches icon mapping guide)
 *
 * Note: Alert uses AlertCircle for errors (page-level context) while StatusBadge
 * uses XCircle for inline status indicators. This differentiation helps distinguish
 * between page-level alerts and inline status displays.
 */
const alertIcons = {
  default: AlertCircle,
  destructive: AlertCircle,
  success: CheckCircle,
  warning: AlertTriangle,
  info: Info,
};

export interface AlertProps extends React.ComponentProps<'div'>, VariantProps<typeof alertVariants> {
  dismissible?: boolean;
  onDismiss?: () => void;
  showIcon?: boolean;
  actions?: React.ReactNode;
  animated?: boolean;
}

function Alert({
  className,
  variant,
  dismissible = false,
  onDismiss,
  showIcon = true,
  actions,
  animated = true,
  children,
  ...props
}: AlertProps) {
  const [isDismissed, setIsDismissed] = React.useState(false);
  const [isDismissing, setIsDismissing] = React.useState(false);

  const handleDismiss = () => {
    if (onDismiss) {
      setIsDismissing(true);
      setTimeout(() => {
        setIsDismissed(true);
        onDismiss();
        setIsDismissing(false);
      }, 200);
    }
  };

  if (isDismissed) return null;

  const IconComponent = alertIcons[variant || 'default'];

  return (
    <div
      data-slot="alert"
      role="alert"
      aria-live="polite"
      aria-atomic="true"
      className={cn(
        alertVariants({ variant }),
        animated && 'animate-slide-in',
        isDismissing && 'animate-slide-out opacity-0',
        dismissible && 'pr-10',
        className
      )}
      {...props}
    >
      {showIcon && <IconComponent className="mt-0.5" />}

      <div className="col-start-2 flex-1">
        {children}
      </div>

      {dismissible && (
        <button
          type="button"
          onClick={handleDismiss}
          className="absolute right-3 top-3 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Dismiss alert"
        >
          <X className="h-4 w-4" />
        </button>
      )}

      {actions && (
        <div className="col-start-2 mt-2 flex gap-2">
          {actions}
        </div>
      )}
    </div>
  );
}

function AlertTitle({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="alert-title"
      className={cn('line-clamp-1 min-h-4 font-medium tracking-tight', className)}
      {...props}
    />
  );
}

function AlertDescription({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="alert-description"
      className={cn(
        'grid justify-items-start gap-1 text-sm [&_p]:leading-relaxed mt-1',
        className,
      )}
      {...props}
    />
  );
}

export { Alert, AlertDescription, AlertTitle };
