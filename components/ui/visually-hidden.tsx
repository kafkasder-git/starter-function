/**
 * @fileoverview visually-hidden Module - Application module
 * 
 * @author Dernek Yönetim Sistemi Team
 * @version 1.0.0
 */

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
/**
 * VisuallyHidden function
 * 
 * @param {Object} params - Function parameters
 * @returns {void} Nothing
 */
export function VisuallyHidden({ children, className }: VisuallyHiddenProps) {
  return <span className={cn('sr-only', className)}>{children}</span>;
}

export default VisuallyHidden;
