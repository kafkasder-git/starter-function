/**
 * Accessibility Utilities
 *
 * Comprehensive accessibility utilities for focus management, keyboard navigation,
 * screen reader support, and WCAG compliance.
 */

import * as React from 'react';
import { useEffect, useCallback, useRef, useState } from 'react';
import { accessibilityTokens } from './tokens';
import { logger } from '../logging/logger';

// ============================================================================
// Focus Trap Utilities
// ============================================================================

export interface FocusTrapOptions {
  initialFocus?: HTMLElement | null;
  returnFocus?: boolean;
  escapeDeactivates?: boolean;
}

/**
 * Focus trap hook for modals and dialogs
 * Traps keyboard focus within a container element
 */
export function useFocusTrap(
  containerRef: React.RefObject<HTMLElement>,
  isActive: boolean,
  options: FocusTrapOptions = {}
) {
  const { initialFocus, returnFocus = true, escapeDeactivates = true } = options;
  const previousActiveElement = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    // Store the element that had focus before the trap activated
    previousActiveElement.current = document.activeElement as HTMLElement;

    const container = containerRef.current;
    const focusableElements = getFocusableElements(container);

    if (focusableElements.length === 0) {
      logger.warn('Focus trap activated but no focusable elements found');
      return;
    }

    // Focus the initial element or the first focusable element
    const elementToFocus = initialFocus || focusableElements[0];
    elementToFocus?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      // Handle Escape key
      if (event.key === 'Escape' && escapeDeactivates) {
        // Let the consuming component handle the escape
        return;
      }

      // Handle Tab key
      if (event.key === 'Tab') {
        trapFocus(event, container);
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);

      // Restore focus to the previous element
      if (returnFocus && previousActiveElement.current) {
        previousActiveElement.current.focus();
      }
    };
  }, [isActive, containerRef, initialFocus, returnFocus, escapeDeactivates]);
}

// ============================================================================
// Focus Management Utilities
// ============================================================================

/**
 * Get all focusable elements within a container
 */
export function getFocusableElements(container: HTMLElement): HTMLElement[] {
  const selector = [
    'button:not([disabled])',
    '[href]',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"]):not([disabled])',
    '[contenteditable="true"]',
  ].join(', ');

  return Array.from(container.querySelectorAll<HTMLElement>(selector)).filter((element) =>
    isFocusable(element)
  );
}

/**
 * Get the first focusable element within a container
 */
export function getFirstFocusableElement(container: HTMLElement): HTMLElement | null {
  const elements = getFocusableElements(container);
  return elements[0] || null;
}

/**
 * Get the last focusable element within a container
 */
export function getLastFocusableElement(container: HTMLElement): HTMLElement | null {
  const elements = getFocusableElements(container);
  return elements[elements.length - 1] || null;
}

/**
 * Check if an element is focusable
 */
export function isFocusable(element: HTMLElement): boolean {
  // Check if element is visible
  if (element.offsetParent === null) return false;

  // Check if element has display: none or visibility: hidden
  const style = window.getComputedStyle(element);
  if (style.display === 'none' || style.visibility === 'hidden') return false;

  // Check if element is disabled
  if (element.hasAttribute('disabled')) return false;

  // Check tabindex
  const tabindex = element.getAttribute('tabindex');
  if (tabindex === '-1') return false;

  return true;
}

/**
 * Trap focus within a container when Tab is pressed
 */
export function trapFocus(event: KeyboardEvent, container: HTMLElement): void {
  const focusableElements = getFocusableElements(container);

  if (focusableElements.length === 0) return;

  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];

  if (event.shiftKey) {
    // Shift + Tab: moving backwards
    if (document.activeElement === firstElement) {
      event.preventDefault();
      lastElement?.focus();
    }
  } else {
    // Tab: moving forwards
    if (document.activeElement === lastElement) {
      event.preventDefault();
      firstElement?.focus();
    }
  }
}

// ============================================================================
// Focus Ring Utilities
// ============================================================================

/**
 * Get focus ring classes based on design tokens
 */
export function getFocusRingClasses(): string {
  return 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2';
}

/**
 * Get focus ring styles for inline usage
 */
export function getFocusRingStyles(): React.CSSProperties {
  return {
    outline: 'none',
  };
}

// ============================================================================
// Keyboard Navigation Utilities
// ============================================================================

export interface KeyboardNavOptions {
  orientation?: 'horizontal' | 'vertical' | 'both';
  loop?: boolean;
  onSelect?: (item: any) => void;
}

/**
 * Keyboard navigation hook for lists and grids
 */
export function useKeyboardNavigation(items: any[], options: KeyboardNavOptions = {}) {
  const { orientation = 'vertical', loop = true, onSelect } = options;
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      const { key } = event;

      // Handle Arrow keys
      if (
        (orientation === 'vertical' || orientation === 'both') &&
        (key === 'ArrowDown' || key === 'ArrowUp')
      ) {
        event.preventDefault();
        const direction = key === 'ArrowDown' ? 1 : -1;
        let newIndex = currentIndex + direction;

        if (loop) {
          newIndex = (newIndex + items.length) % items.length;
        } else {
          newIndex = Math.max(0, Math.min(items.length - 1, newIndex));
        }

        setCurrentIndex(newIndex);
      }

      if (
        (orientation === 'horizontal' || orientation === 'both') &&
        (key === 'ArrowRight' || key === 'ArrowLeft')
      ) {
        event.preventDefault();
        const direction = key === 'ArrowRight' ? 1 : -1;
        let newIndex = currentIndex + direction;

        if (loop) {
          newIndex = (newIndex + items.length) % items.length;
        } else {
          newIndex = Math.max(0, Math.min(items.length - 1, newIndex));
        }

        setCurrentIndex(newIndex);
      }

      // Handle Home/End keys
      if (key === 'Home') {
        event.preventDefault();
        setCurrentIndex(0);
      }

      if (key === 'End') {
        event.preventDefault();
        setCurrentIndex(items.length - 1);
      }

      // Handle Enter/Space for selection
      if (key === 'Enter' || key === ' ') {
        event.preventDefault();
        onSelect?.(items[currentIndex]);
      }
    },
    [currentIndex, items, orientation, loop, onSelect]
  );

  return {
    currentIndex,
    setCurrentIndex,
    handleKeyDown,
  };
}

// ============================================================================
// Screen Reader Utilities
// ============================================================================

/**
 * Announce a message to screen readers using an aria-live region
 */
export function announceToScreenReader(
  message: string,
  priority: 'polite' | 'assertive' = 'polite'
): void {
  const announcement = document.createElement('div');
  announcement.setAttribute('role', 'status');
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = message;

  document.body.appendChild(announcement);

  // Remove after announcement
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
}

/**
 * VisuallyHidden component - renders content only for screen readers
 */
export function VisuallyHidden({ children }: { children: React.ReactNode }): JSX.Element {
  return React.createElement(
    'span',
    {
      style: {
        position: 'absolute',
        width: '1px',
        height: '1px',
        padding: '0',
        margin: '-1px',
        overflow: 'hidden',
        clip: 'rect(0, 0, 0, 0)',
        whiteSpace: 'nowrap',
        border: '0',
      },
    },
    children
  );
}

// ============================================================================
// Touch Target Utilities
// ============================================================================

/**
 * Get touch target classes based on design tokens
 */
export function getTouchTargetClasses(size: 'minimum' | 'comfortable' = 'minimum'): string {
  const targetSize =
    size === 'minimum'
      ? accessibilityTokens.touchTarget.minimum
      : accessibilityTokens.touchTarget.comfortable;

  return `min-h-[${targetSize}] min-w-[${targetSize}]`;
}

/**
 * Ensure an element meets minimum touch target size
 */
export function ensureTouchTarget(element: HTMLElement): void {
  const minSize = accessibilityTokens.touchTarget.minimum;
  element.style.minHeight = minSize;
  element.style.minWidth = minSize;
}

// ============================================================================
// ARIA Utilities
// ============================================================================

/**
 * Generate descriptive aria-label from context and value
 */
export function generateAriaLabel(context: string, value?: string | number): string {
  return value ? `${context}: ${value}` : context;
}

/**
 * Get aria-invalid value based on error state
 */
export function getAriaInvalid(error?: boolean | string): boolean | undefined {
  if (typeof error === 'string') return error.length > 0;
  return error;
}

/**
 * Combine multiple IDs for aria-describedby
 */
export function getAriaDescribedBy(...ids: (string | undefined)[]): string | undefined {
  const validIds = ids.filter((id): id is string => Boolean(id));
  return validIds.length > 0 ? validIds.join(' ') : undefined;
}

// ============================================================================
// Color Contrast Utilities
// ============================================================================

/**
 * Parse color string to RGB values
 */
function parseColor(color: string): [number, number, number] | null {
  // Handle hex colors
  if (color.startsWith('#')) {
    const hex = color.slice(1);
    if (hex.length === 3) {
      const r = parseInt(hex.charAt(0) + hex.charAt(0), 16);
      const g = parseInt(hex.charAt(1) + hex.charAt(1), 16);
      const b = parseInt(hex.charAt(2) + hex.charAt(2), 16);
      return [r, g, b];
    }
    if (hex.length === 6) {
      const r = parseInt(hex.slice(0, 2), 16);
      const g = parseInt(hex.slice(2, 4), 16);
      const b = parseInt(hex.slice(4, 6), 16);
      return [r, g, b];
    }
  }

  // Handle rgb/rgba
  const rgbMatch = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (rgbMatch && rgbMatch[1] && rgbMatch[2] && rgbMatch[3]) {
    const r = parseInt(rgbMatch[1], 10);
    const g = parseInt(rgbMatch[2], 10);
    const b = parseInt(rgbMatch[3], 10);
    return [r, g, b];
  }

  return null;
}

/**
 * Calculate relative luminance of a color
 */
function getRelativeLuminance(r: number, g: number, b: number): number {
  const toLinear = (c: number): number => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };

  const rs = toLinear(r);
  const gs = toLinear(g);
  const bs = toLinear(b);

  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Calculate WCAG contrast ratio between two colors
 */
export function getContrastRatio(color1: string, color2: string): number {
  const rgb1 = parseColor(color1);
  const rgb2 = parseColor(color2);

  if (!rgb1 || !rgb2) {
    logger.warn('Invalid color format for contrast ratio calculation');
    return 0;
  }

  const l1 = getRelativeLuminance(...rgb1);
  const l2 = getRelativeLuminance(...rgb2);

  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);

  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Check if contrast ratio meets WCAG AA standards
 */
export function meetsWCAGAA(ratio: number, isLargeText: boolean = false): boolean {
  const requiredRatio = isLargeText ? 3 : 4.5;
  return ratio >= requiredRatio;
}

/**
 * Check color contrast and return WCAG compliance level
 */
export function checkColorContrast(
  foreground: string,
  background: string
): { ratio: number; passes: boolean; level: 'AA' | 'AAA' | 'fail' } {
  const ratio = getContrastRatio(foreground, background);

  if (ratio >= 7) {
    return { ratio, passes: true, level: 'AAA' };
  }

  if (ratio >= 4.5) {
    return { ratio, passes: true, level: 'AA' };
  }

  return { ratio, passes: false, level: 'fail' };
}

// ============================================================================
// Export all utilities
// ============================================================================

export { accessibilityTokens };
