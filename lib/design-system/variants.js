/**
 * Component Variant System
 *
 * Centralized variant definitions using Class Variance Authority (CVA) patterns.
 * These variants ensure consistent styling across all components.
 *
 * All focus rings follow design system tokens:
 * - Width: 2px (ring-2)
 * - Offset: 2px (ring-offset-2)
 * - Color: Semantic color at 500 shade
 * - Trigger: focus-visible (keyboard only)
 *
 * Key Variant Collections:
 * - buttonVariants: Used by Button and LoadingButton components
 * - toastVariants: Used by enhanced toast system in sonner.tsx
 * - skeletonVariants: Used by Skeleton component with shimmer animation
 * - spinnerVariants: Used by LoadingSpinner component
 *
 * Toast Variants (used by enhanced toast system):
 * - success: Green theme (success-50 bg, success-200 border, success-900 text)
 * - destructive: Red theme (error-50 bg, error-200 border, error-900 text)
 * - warning: Yellow theme (warning-50 bg, warning-200 border, warning-900 text)
 * - info: Blue theme (info-50 bg, info-200 border, info-900 text)
 *
 * All semantic colors ensure proper contrast ratios for WCAG AA compliance.
 */
import { cva } from 'class-variance-authority';
// Button Variants
export const buttonVariants = cva(
// Base styles applied to all button variants with consistent touch targets
[
    'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium',
    'min-h-[44px] transition-all duration-200',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
    'disabled:pointer-events-none disabled:opacity-50',
    'active:scale-[0.98]',
], {
    variants: {
        variant: {
            default: [
                'bg-primary-500 text-white shadow-sm hover:bg-primary-600',
                'focus-visible:ring-primary-500/20',
            ],
            destructive: [
                'bg-error-500 text-white shadow-sm hover:bg-error-600',
                'focus-visible:ring-error-500/20',
            ],
            outline: [
                'border border-neutral-200 bg-white shadow-sm hover:bg-neutral-50 hover:text-neutral-900',
                'focus-visible:ring-primary-500/20',
            ],
            secondary: [
                'bg-neutral-100 text-neutral-900 shadow-sm hover:bg-neutral-200',
                'focus-visible:ring-neutral-500/20',
            ],
            ghost: ['hover:bg-neutral-100 hover:text-neutral-900', 'focus-visible:ring-neutral-500/20'],
            link: [
                'text-primary-500 underline-offset-4 hover:underline',
                'focus-visible:ring-primary-500/20 min-h-0',
            ],
            success: [
                'bg-success-500 text-white shadow-sm hover:bg-success-600',
                'focus-visible:ring-success-500/20',
            ],
            warning: [
                'bg-warning-500 text-white shadow-sm hover:bg-warning-600',
                'focus-visible:ring-warning-500/20',
            ],
            info: [
                'bg-info-500 text-white shadow-sm hover:bg-info-600',
                'focus-visible:ring-info-500/20',
            ],
        },
        size: {
            xs: 'h-8 min-h-[32px] px-2.5 text-xs',
            sm: 'h-9 min-h-[36px] px-3 text-xs',
            default: 'h-10 px-4',
            lg: 'h-11 px-6 text-base',
            xl: 'h-12 px-8 text-lg',
            icon: 'h-10 w-10 min-h-[40px] min-w-[40px] p-0',
        },
        loading: {
            true: 'cursor-not-allowed opacity-70',
            false: '',
        },
    },
    compoundVariants: [
        {
            variant: 'ghost',
            size: 'icon',
            class: 'hover:bg-neutral-100',
        },
        {
            variant: 'outline',
            size: 'icon',
            class: 'border-neutral-200',
        },
    ],
    defaultVariants: {
        variant: 'default',
        size: 'default',
        loading: false,
    },
});
// Input Variants
export const inputVariants = cva([
    'flex w-full rounded-md border bg-white px-3 py-1 text-sm shadow-sm transition-colors',
    'file:border-0 file:bg-transparent file:text-sm file:font-medium',
    'placeholder:text-neutral-500',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
    'disabled:cursor-not-allowed disabled:opacity-50',
], {
    variants: {
        variant: {
            default: ['border-neutral-200 focus-visible:ring-primary-500', 'hover:border-neutral-300'],
            error: [
                'border-error-300 bg-error-50 focus-visible:ring-error-500',
                'placeholder:text-error-400',
            ],
            success: [
                'border-success-300 bg-success-50 focus-visible:ring-success-500',
                'placeholder:text-success-400',
            ],
            warning: [
                'border-warning-300 bg-warning-50 focus-visible:ring-warning-500',
                'placeholder:text-warning-400',
            ],
        },
        size: {
            sm: 'h-8 px-2 text-xs',
            default: 'h-9 px-3',
            lg: 'h-10 px-4 text-base',
        },
    },
    defaultVariants: {
        variant: 'default',
        size: 'default',
    },
});
// Card Variants
export const cardVariants = cva(['rounded-lg border bg-white text-neutral-950 shadow-sm', 'transition-shadow duration-200'], {
    variants: {
        variant: {
            default: 'border-neutral-200',
            elevated: 'border-neutral-200 shadow-md hover:shadow-lg',
            outlined: 'border-2 border-neutral-200 shadow-none',
            ghost: 'border-transparent shadow-none bg-transparent',
        },
        padding: {
            none: 'p-0',
            sm: 'p-3',
            default: 'p-4',
            lg: 'p-6',
            xl: 'p-8',
        },
        interactive: {
            true: 'cursor-pointer hover:shadow-md transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2',
            false: '',
        },
    },
    defaultVariants: {
        variant: 'default',
        padding: 'default',
        interactive: false,
    },
});
// Badge Variants
export const badgeVariants = cva([
    'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold',
    'transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
], {
    variants: {
        variant: {
            default: 'border-transparent bg-primary-500 text-white hover:bg-primary-600',
            secondary: 'border-transparent bg-neutral-100 text-neutral-900 hover:bg-neutral-200',
            destructive: 'border-transparent bg-error-500 text-white hover:bg-error-600',
            outline: 'border-neutral-200 text-neutral-950 hover:bg-neutral-100',
            success: 'border-transparent bg-success-500 text-white hover:bg-success-600',
            warning: 'border-transparent bg-warning-500 text-white hover:bg-warning-600',
            info: 'border-transparent bg-info-500 text-white hover:bg-info-600',
        },
        size: {
            xs: 'px-1.5 py-0.5 text-xs',
            sm: 'px-2 py-0.5 text-xs',
            default: 'px-2.5 py-0.5 text-xs',
            lg: 'px-3 py-1 text-sm',
        },
    },
    defaultVariants: {
        variant: 'default',
        size: 'default',
    },
});
// Alert Variants
export const alertVariants = cva([
    'relative w-full rounded-lg border px-4 py-3 text-sm',
    '[&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-neutral-950',
    '[&>svg~*]:pl-7',
], {
    variants: {
        variant: {
            default: 'bg-white text-neutral-950 border-neutral-200',
            destructive: 'border-error-200 bg-error-50 text-error-900 [&>svg]:text-error-600',
            success: 'border-success-200 bg-success-50 text-success-900 [&>svg]:text-success-600',
            warning: 'border-warning-200 bg-warning-50 text-warning-900 [&>svg]:text-warning-600',
            info: 'border-info-200 bg-info-50 text-info-900 [&>svg]:text-info-600',
        },
    },
    defaultVariants: {
        variant: 'default',
    },
});
// Toast Variants
export const toastVariants = cva([
    'group pointer-events-auto relative flex w-full items-center justify-between space-x-2 overflow-hidden rounded-md border p-4 pr-6 shadow-lg transition-all',
    'data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full data-[state=open]:sm:slide-in-from-bottom-full',
], {
    variants: {
        variant: {
            default: 'border-neutral-200 bg-white text-neutral-950',
            destructive: 'destructive border-error-200 bg-error-50 text-error-900',
            success: 'border-success-200 bg-success-50 text-success-900',
            warning: 'border-warning-200 bg-warning-50 text-warning-900',
            info: 'border-info-200 bg-info-50 text-info-900',
        },
    },
    defaultVariants: {
        variant: 'default',
    },
});
// Skeleton Variants
export const skeletonVariants = cva([
    'animate-pulse rounded-md bg-neutral-100',
    'relative overflow-hidden',
    'before:absolute before:inset-0 before:-translate-x-full before:animate-shimmer before:bg-gradient-to-r before:from-transparent before:via-white/60 before:to-transparent',
], {
    variants: {
        variant: {
            default: 'bg-neutral-100',
            text: 'h-4 bg-neutral-100',
            avatar: 'rounded-full bg-neutral-100',
            button: 'h-9 bg-neutral-100',
            card: 'h-32 bg-neutral-100',
            input: 'h-9 bg-neutral-100',
        },
        size: {
            xs: 'h-3',
            sm: 'h-4',
            default: 'h-5',
            lg: 'h-6',
            xl: 'h-8',
        },
    },
    defaultVariants: {
        variant: 'default',
        size: 'default',
    },
});
// Loading Spinner Variants
export const spinnerVariants = cva(['animate-spin rounded-full border-2 border-current border-t-transparent'], {
    variants: {
        size: {
            xs: 'h-3 w-3',
            sm: 'h-4 w-4',
            default: 'h-5 w-5',
            lg: 'h-6 w-6',
            xl: 'h-8 w-8',
        },
        variant: {
            default: 'text-neutral-500',
            primary: 'text-primary-500',
            white: 'text-white',
        },
    },
    defaultVariants: {
        size: 'default',
        variant: 'default',
    },
});
// Form Field Variants
export const formFieldVariants = cva(['space-y-2'], {
    variants: {
        variant: {
            default: '',
            inline: 'flex items-center space-y-0 space-x-3',
        },
    },
    defaultVariants: {
        variant: 'default',
    },
});
// Label Variants
export const labelVariants = cva(['text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'], {
    variants: {
        variant: {
            default: 'text-neutral-950',
            error: 'text-error-600',
            success: 'text-success-600',
            warning: 'text-warning-600',
        },
        required: {
            true: 'after:content-["*"] after:ml-0.5 after:text-error-500',
            false: '',
        },
    },
    defaultVariants: {
        variant: 'default',
        required: false,
    },
});
// Helper Text Variants
export const helperTextVariants = cva(['text-xs leading-tight'], {
    variants: {
        variant: {
            default: 'text-neutral-600',
            error: 'text-error-600',
            success: 'text-success-600',
            warning: 'text-warning-600',
        },
    },
    defaultVariants: {
        variant: 'default',
    },
});
// Utility function to merge variant classes with custom classes
export function cn(...classes) {
    return classes.filter(Boolean).join(' ');
}
