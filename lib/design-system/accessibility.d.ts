/**
 * Accessibility Utilities
 *
 * Comprehensive accessibility utilities for focus management, keyboard navigation,
 * screen reader support, and WCAG compliance.
 */
import * as React from 'react';
import { accessibilityTokens } from './tokens';
export interface FocusTrapOptions {
    initialFocus?: HTMLElement | null;
    returnFocus?: boolean;
    escapeDeactivates?: boolean;
}
/**
 * Focus trap hook for modals and dialogs
 * Traps keyboard focus within a container element
 */
export declare function useFocusTrap(containerRef: React.RefObject<HTMLElement>, isActive: boolean, options?: FocusTrapOptions): void;
/**
 * Get all focusable elements within a container
 */
export declare function getFocusableElements(container: HTMLElement): HTMLElement[];
/**
 * Get the first focusable element within a container
 */
export declare function getFirstFocusableElement(container: HTMLElement): HTMLElement | null;
/**
 * Get the last focusable element within a container
 */
export declare function getLastFocusableElement(container: HTMLElement): HTMLElement | null;
/**
 * Check if an element is focusable
 */
export declare function isFocusable(element: HTMLElement): boolean;
/**
 * Trap focus within a container when Tab is pressed
 */
export declare function trapFocus(event: KeyboardEvent, container: HTMLElement): void;
/**
 * Get focus ring classes based on design tokens
 */
export declare function getFocusRingClasses(): string;
/**
 * Get focus ring styles for inline usage
 */
export declare function getFocusRingStyles(): React.CSSProperties;
export interface KeyboardNavOptions {
    orientation?: 'horizontal' | 'vertical' | 'both';
    loop?: boolean;
    onSelect?: (item: any) => void;
}
/**
 * Keyboard navigation hook for lists and grids
 */
export declare function useKeyboardNavigation(items: any[], options?: KeyboardNavOptions): {
    currentIndex: number;
    setCurrentIndex: React.Dispatch<React.SetStateAction<number>>;
    handleKeyDown: (event: React.KeyboardEvent) => void;
};
/**
 * Announce a message to screen readers using an aria-live region
 */
export declare function announceToScreenReader(message: string, priority?: 'polite' | 'assertive'): void;
/**
 * VisuallyHidden component - renders content only for screen readers
 */
export declare function VisuallyHidden({ children }: {
    children: React.ReactNode;
}): JSX.Element;
/**
 * Get touch target classes based on design tokens
 */
export declare function getTouchTargetClasses(size?: 'minimum' | 'comfortable'): string;
/**
 * Ensure an element meets minimum touch target size
 */
export declare function ensureTouchTarget(element: HTMLElement): void;
/**
 * Generate descriptive aria-label from context and value
 */
export declare function generateAriaLabel(context: string, value?: string | number): string;
/**
 * Get aria-invalid value based on error state
 */
export declare function getAriaInvalid(error?: boolean | string): boolean | undefined;
/**
 * Combine multiple IDs for aria-describedby
 */
export declare function getAriaDescribedBy(...ids: (string | undefined)[]): string | undefined;
/**
 * Calculate WCAG contrast ratio between two colors
 */
export declare function getContrastRatio(color1: string, color2: string): number;
/**
 * Check if contrast ratio meets WCAG AA standards
 */
export declare function meetsWCAGAA(ratio: number, isLargeText?: boolean): boolean;
/**
 * Check color contrast and return WCAG compliance level
 */
export declare function checkColorContrast(foreground: string, background: string): {
    ratio: number;
    passes: boolean;
    level: 'AA' | 'AAA' | 'fail';
};
export { accessibilityTokens };
//# sourceMappingURL=accessibility.d.ts.map