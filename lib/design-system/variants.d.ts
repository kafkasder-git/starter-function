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
import { type VariantProps } from 'class-variance-authority';
export declare const buttonVariants: (props?: ({
    variant?: "default" | "info" | "success" | "warning" | "destructive" | "secondary" | "link" | "outline" | "ghost" | null | undefined;
    size?: "default" | "xs" | "sm" | "lg" | "xl" | "icon" | null | undefined;
    loading?: boolean | null | undefined;
} & import("class-variance-authority/types").ClassProp) | undefined) => string;
export declare const inputVariants: (props?: ({
    variant?: "default" | "error" | "success" | "warning" | null | undefined;
    size?: "default" | "sm" | "lg" | null | undefined;
} & import("class-variance-authority/types").ClassProp) | undefined) => string;
export declare const cardVariants: (props?: ({
    variant?: "default" | "ghost" | "elevated" | "outlined" | null | undefined;
    padding?: "none" | "default" | "sm" | "lg" | "xl" | null | undefined;
    interactive?: boolean | null | undefined;
} & import("class-variance-authority/types").ClassProp) | undefined) => string;
export declare const badgeVariants: (props?: ({
    variant?: "default" | "info" | "success" | "warning" | "destructive" | "secondary" | "outline" | null | undefined;
    size?: "default" | "xs" | "sm" | "lg" | null | undefined;
} & import("class-variance-authority/types").ClassProp) | undefined) => string;
export declare const alertVariants: (props?: ({
    variant?: "default" | "info" | "success" | "warning" | "destructive" | null | undefined;
} & import("class-variance-authority/types").ClassProp) | undefined) => string;
export declare const toastVariants: (props?: ({
    variant?: "default" | "info" | "success" | "warning" | "destructive" | null | undefined;
} & import("class-variance-authority/types").ClassProp) | undefined) => string;
export declare const skeletonVariants: (props?: ({
    variant?: "default" | "input" | "card" | "button" | "text" | "avatar" | null | undefined;
    size?: "default" | "xs" | "sm" | "lg" | "xl" | null | undefined;
} & import("class-variance-authority/types").ClassProp) | undefined) => string;
export declare const spinnerVariants: (props?: ({
    size?: "default" | "xs" | "sm" | "lg" | "xl" | null | undefined;
    variant?: "default" | "primary" | "white" | null | undefined;
} & import("class-variance-authority/types").ClassProp) | undefined) => string;
export declare const formFieldVariants: (props?: ({
    variant?: "inline" | "default" | null | undefined;
} & import("class-variance-authority/types").ClassProp) | undefined) => string;
export declare const labelVariants: (props?: ({
    variant?: "default" | "error" | "success" | "warning" | null | undefined;
    required?: boolean | null | undefined;
} & import("class-variance-authority/types").ClassProp) | undefined) => string;
export declare const helperTextVariants: (props?: ({
    variant?: "default" | "error" | "success" | "warning" | null | undefined;
} & import("class-variance-authority/types").ClassProp) | undefined) => string;
export type ButtonVariants = VariantProps<typeof buttonVariants>;
export type InputVariants = VariantProps<typeof inputVariants>;
export type CardVariants = VariantProps<typeof cardVariants>;
export type BadgeVariants = VariantProps<typeof badgeVariants>;
export type AlertVariants = VariantProps<typeof alertVariants>;
export type ToastVariants = VariantProps<typeof toastVariants>;
export type SkeletonVariants = VariantProps<typeof skeletonVariants>;
export type SpinnerVariants = VariantProps<typeof spinnerVariants>;
export type FormFieldVariants = VariantProps<typeof formFieldVariants>;
export type LabelVariants = VariantProps<typeof labelVariants>;
export type HelperTextVariants = VariantProps<typeof helperTextVariants>;
export declare function cn(...classes: (string | undefined | null | false)[]): string;
//# sourceMappingURL=variants.d.ts.map