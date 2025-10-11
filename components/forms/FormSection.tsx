/**
 * @fileoverview FormSection Component - Groups related form fields with visual separation
 * 
 * @author Dernek Yönetim Sistemi Team
 * @version 1.0.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { cn } from '../ui/utils';
import { Button } from '../ui/button';

export interface FormSectionProps {
  /** Section title */
  title: string;
  /** Optional description text */
  description?: string;
  /** Whether the section can be collapsed */
  collapsible?: boolean;
  /** Default open state for collapsible sections */
  defaultOpen?: boolean;
  /** Icon to display next to the title */
  icon?: React.ReactNode;
  /** Child form fields */
  children: React.ReactNode;
  /** Additional CSS classes */
  className?: string;
  /** Additional CSS classes for the header */
  headerClassName?: string;
  /** Additional CSS classes for the content */
  contentClassName?: string;
  /** Callback when section is expanded/collapsed */
  onToggle?: (isOpen: boolean) => void;
  /** Whether the section is required (shows asterisk) */
  required?: boolean;
  /** Whether the section is disabled */
  disabled?: boolean;
}

export const FormSection = React.forwardRef<HTMLDivElement, FormSectionProps>(
  ({
    title,
    description,
    collapsible = false,
    defaultOpen = true,
    icon,
    children,
    className,
    headerClassName,
    contentClassName,
    onToggle,
    required = false,
    disabled = false,
    ...props
  }, ref) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    const handleToggle = () => {
      if (disabled) return;
      
      const newState = !isOpen;
      setIsOpen(newState);
      onToggle?.(newState);
    };

    const sectionId = React.useId();
    const contentId = `${sectionId}-content`;
    const headerId = `${sectionId}-header`;

    return (
      <div
        ref={ref}
        className={cn(
          'space-y-4 border border-border rounded-lg bg-card',
          disabled && 'opacity-60 pointer-events-none',
          className
        )}
        {...props}
      >
        {/* Header */}
        <div
          id={headerId}
          className={cn(
            'flex items-center justify-between p-4 border-b border-border',
            !isOpen && collapsible && 'border-b-0',
            headerClassName
          )}
        >
          <div className="flex items-center gap-3 flex-1">
            {/* Icon */}
            {icon && (
              <div className="flex-shrink-0 text-muted-foreground">
                {icon}
              </div>
            )}
            
            {/* Title and Description */}
            <div className="flex-1 min-w-0">
              <h3 
                className={cn(
                  'text-lg font-semibold text-foreground',
                  required && "after:content-['*'] after:text-destructive after:ml-1"
                )}
              >
                {title}
              </h3>
              {description && (
                <p className="text-sm text-muted-foreground mt-1">
                  {description}
                </p>
              )}
            </div>
          </div>

          {/* Collapse Toggle */}
          {collapsible && (
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={handleToggle}
              disabled={disabled}
              aria-expanded={isOpen}
              aria-controls={contentId}
              aria-label={`${isOpen ? 'Collapse' : 'Expand'} ${title} section`}
              className="flex-shrink-0 ml-2"
            >
              <motion.div
                animate={{ rotate: isOpen ? 0 : -90 }}
                transition={{ duration: 0.2, ease: 'easeInOut' }}
              >
                <ChevronDown className="h-4 w-4" />
              </motion.div>
            </Button>
          )}
        </div>

        {/* Content */}
        <AnimatePresence initial={false}>
          {(isOpen || !collapsible) && (
            <motion.div
              id={contentId}
              initial={collapsible ? { height: 0, opacity: 0 } : false}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ 
                duration: 0.3, 
                ease: 'easeInOut',
                opacity: { duration: 0.2 }
              }}
              style={{ overflow: 'hidden' }}
              role="region"
              aria-labelledby={headerId}
            >
              <div className={cn('p-4 pt-0 space-y-4', contentClassName)}>
                {children}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }
);

FormSection.displayName = 'FormSection';