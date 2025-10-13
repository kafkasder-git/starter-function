/**
 * @fileoverview sonner Module - Enhanced toast notifications with semantic colors and actions
 *
 * @author Dernek Yönetim Sistemi Team
 * @version 1.0.0
 */

'use client';

import { useTheme } from 'next-themes';
import { toast, Toaster as Sonner } from 'sonner';
import { CheckCircle2, XCircle, AlertTriangle, Info } from 'lucide-react';
import { Button } from './button';
import * as React from 'react';

interface ToasterProps {
  theme?: 'light' | 'dark' | 'system';
}

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = 'system' } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps['theme']}
      className="toaster group"
      toastOptions={{
        duration: 4000,
        closeButton: true,
      }}
      style={
        {
          '--normal-bg': 'var(--popover)',
          '--normal-text': 'var(--popover-foreground)',
          '--normal-border': 'var(--border)',
          '--success-bg': 'hsl(var(--success-50))',
          '--success-border': 'hsl(var(--success-200))',
          '--success-text': 'hsl(var(--success-900))',
          '--error-bg': 'hsl(var(--error-50))',
          '--error-border': 'hsl(var(--error-200))',
          '--error-text': 'hsl(var(--error-900))',
          '--warning-bg': 'hsl(var(--warning-50))',
          '--warning-border': 'hsl(var(--warning-200))',
          '--warning-text': 'hsl(var(--warning-900))',
          '--info-bg': 'hsl(var(--info-50))',
          '--info-border': 'hsl(var(--info-200))',
          '--info-text': 'hsl(var(--info-900))',
        } as React.CSSProperties
      }
      {...props}
    />
  );
};

// Enhanced toast helper functions with semantic colors and actions
interface ToastAction {
  label: string;
  onClick: () => void;
}

interface EnhancedToastOptions {
  description?: string;
  action?: ToastAction;
  duration?: number;
}

/**
 * Enhanced Toast API
 *
 * Provides semantic color variants with icons and action button support.
 * Includes screen reader announcements for accessibility.
 *
 * Migration Guide:
 * - Replace `toast.success()` with `enhancedToast.success()` for enhanced styling
 * - Replace `toast.error()` with `enhancedToast.error()` for enhanced styling
 * - Add action buttons for undo/retry functionality
 *
 * @example
 * ```tsx
 * // Simple success toast
 * enhancedToast.success('Data saved successfully');
 *
 * // Error toast with retry action
 * enhancedToast.error('Failed to save', {
 *   action: { label: 'Retry', onClick: () => retrySubmit() }
 * });
 *
 * // Success toast with undo action
 * enhancedToast.success('Item deleted', {
 *   action: { label: 'Undo', onClick: () => undoDelete() }
 * });
 * ```
 */
export const enhancedToast = {
  success: (message: string, options?: EnhancedToastOptions) => {
    toast.success(
      <div role="status" aria-live="polite" aria-atomic="true" className="flex items-center gap-2">
        <CheckCircle2 className="h-5 w-5 text-success-600" aria-hidden="true" />
        <div className="flex-1">
          <span className="sr-only">Success: </span>
          <span>{message}</span>
          {options?.description && (
            <p className="text-sm text-success-700 mt-1">{options.description}</p>
          )}
        </div>
        {options?.action && (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              options.action!.onClick();
              toast.dismiss();
            }}
            aria-label={options.action.label}
            className="ml-2"
          >
            {options.action.label}
          </Button>
        )}
      </div>,
      {
        duration: options?.duration ?? 4000,
        style: {
          background: 'var(--success-bg)',
          border: '1px solid var(--success-border)',
          color: 'var(--success-text)',
        },
      }
    );
  },

  error: (message: string, options?: EnhancedToastOptions) => {
    toast.error(
      <div role="alert" aria-live="assertive" aria-atomic="true" className="flex items-center gap-2">
        <XCircle className="h-5 w-5 text-error-600" aria-hidden="true" />
        <div className="flex-1">
          <span className="sr-only">Error: </span>
          <span>{message}</span>
          {options?.description && (
            <p className="text-sm text-error-700 mt-1">{options.description}</p>
          )}
        </div>
        {options?.action && (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              options.action!.onClick();
              toast.dismiss();
            }}
            aria-label={options.action.label}
            className="ml-2"
          >
            {options.action.label}
          </Button>
        )}
      </div>,
      {
        duration: options?.duration ?? 4000,
        style: {
          background: 'var(--error-bg)',
          border: '1px solid var(--error-border)',
          color: 'var(--error-text)',
        },
      }
    );
  },

  warning: (message: string, options?: EnhancedToastOptions) => {
    toast.warning(
      <div role="status" aria-live="polite" aria-atomic="true" className="flex items-center gap-2">
        <AlertTriangle className="h-5 w-5 text-warning-600" aria-hidden="true" />
        <div className="flex-1">
          <span className="sr-only">Warning: </span>
          <span>{message}</span>
          {options?.description && (
            <p className="text-sm text-warning-700 mt-1">{options.description}</p>
          )}
        </div>
        {options?.action && (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              options.action!.onClick();
              toast.dismiss();
            }}
            aria-label={options.action.label}
            className="ml-2"
          >
            {options.action.label}
          </Button>
        )}
      </div>,
      {
        duration: options?.duration ?? 4000,
        style: {
          background: 'var(--warning-bg)',
          border: '1px solid var(--warning-border)',
          color: 'var(--warning-text)',
        },
      }
    );
  },

  info: (message: string, options?: EnhancedToastOptions) => {
    toast.info(
      <div role="status" aria-live="polite" aria-atomic="true" className="flex items-center gap-2">
        <Info className="h-5 w-5 text-info-600" aria-hidden="true" />
        <div className="flex-1">
          <span className="sr-only">Info: </span>
          <span>{message}</span>
          {options?.description && (
            <p className="text-sm text-info-700 mt-1">{options.description}</p>
          )}
        </div>
        {options?.action && (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              options.action!.onClick();
              toast.dismiss();
            }}
            aria-label={options.action.label}
            className="ml-2"
          >
            {options.action.label}
          </Button>
        )}
      </div>,
      {
        duration: options?.duration ?? 4000,
        style: {
          background: 'var(--info-bg)',
          border: '1px solid var(--info-border)',
          color: 'var(--info-text)',
        },
      }
    );
  },

  promise: <T,>(
    promise: Promise<T>,
    options: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: Error) => string);
    }
  ) => {
    return toast.promise(promise, {
      loading: (
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-neutral-300 border-t-neutral-600" />
          <span>{options.loading}</span>
        </div>
      ),
      success: (data) => (
        <div role="status" aria-live="polite" className="flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-success-600" />
          <span>{typeof options.success === 'function' ? options.success(data) : options.success}</span>
        </div>
      ),
      error: (error) => (
        <div role="alert" aria-live="assertive" className="flex items-center gap-2">
          <XCircle className="h-5 w-5 text-error-600" />
          <span>{typeof options.error === 'function' ? options.error(error) : options.error}</span>
        </div>
      ),
    });
  },
};

export { Toaster };
