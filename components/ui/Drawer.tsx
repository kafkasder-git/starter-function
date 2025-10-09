/**
 * @fileoverview Drawer Module - Application module
 *
 * @author Dernek Yönetim Sistemi Team
 * @version 1.0.0
 */

import { X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Button } from './button';
import { useFocusTrap } from './SkipLinks';

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  side?: 'left' | 'right' | 'top' | 'bottom';
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  className?: string;
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
}

const DRAWER_SIZES = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  full: 'max-w-full'
};

const DRAWER_POSITIONS = {
  left: 'left-0 top-0 h-full',
  right: 'right-0 top-0 h-full',
  top: 'top-0 left-0 w-full',
  bottom: 'bottom-0 left-0 w-full'
};

export function Drawer({
  isOpen,
  onClose,
  title,
  children,
  side = 'right',
  size = 'md',
  className = '',
  closeOnOverlayClick = true,
  closeOnEscape = true
}: DrawerProps) {
  const drawerRef = useRef<HTMLDivElement>(null);
  
  // Focus trap for accessibility
  useFocusTrap(isOpen);

  // Handle escape key
  useEffect(() => {
    if (!isOpen || !closeOnEscape) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, closeOnEscape, onClose]);

  // Handle overlay click
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (closeOnOverlayClick && e.target === e.currentTarget) {
      onClose();
    }
  };

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const positionClasses = DRAWER_POSITIONS[side];
  const sizeClasses = DRAWER_SIZES[size];

  return (
    <div className="fixed inset-0 z-50">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleOverlayClick}
        aria-hidden="true"
      />
      
      {/* Drawer */}
      <div
        ref={drawerRef}
        className={`
          absolute ${positionClasses} ${sizeClasses}
          bg-white shadow-xl
          ${side === 'left' || side === 'right' ? 'w-full' : 'h-full'}
          ${className}
        `}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'drawer-title' : undefined}
      >
        {/* Header */}
        {title && (
          <div className="flex items-center justify-between p-4 border-b">
            <h2 id="drawer-title" className="text-lg font-semibold text-gray-900">
              {title}
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
              aria-label="Kapat"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
}

// Bottom Sheet variant for mobile
export function BottomSheet({
  isOpen,
  onClose,
  title,
  children,
  className = ''
}: Omit<DrawerProps, 'side' | 'size'>) {
  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      side="bottom"
      size="full"
      className={`rounded-t-xl ${className}`}
    >
      {children}
    </Drawer>
  );
}

// Hook for drawer state management
export function useDrawer(initialOpen = false) {
  const [isOpen, setIsOpen] = useState(initialOpen);

  const openDrawer = () => setIsOpen(true);
  const closeDrawer = () => setIsOpen(false);
  const toggleDrawer = () => setIsOpen(prev => !prev);

  return {
    isOpen,
    openDrawer,
    closeDrawer,
    toggleDrawer
  };
}
