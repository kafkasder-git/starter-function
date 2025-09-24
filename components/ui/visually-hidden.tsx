import React from 'react';
import { cn } from './utils';

interface VisuallyHiddenProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * VisuallyHidden - Screen reader accessible but visually hidden content
 * Used for accessibility compliance with DialogTitle and DialogDescription
 */
export function VisuallyHidden({ children, className }: VisuallyHiddenProps) {
  return <span className={cn('sr-only', className)}>{children}</span>;
}

export default VisuallyHidden;
