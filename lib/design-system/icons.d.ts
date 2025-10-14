/**
 * Centralized Icon Mapping Guide
 *
 * This module provides a single source of truth for icon usage across the application.
 * Using consistent icons improves UX, reduces cognitive load, and ensures visual coherence.
 *
 * MIGRATION GUIDE:
 * ----------------
 * Replace inconsistent icon usage:
 * - Edit/Edit2/Edit3 → Pencil (actionIcons.edit)
 * - Trash → Trash2 (actionIcons.delete)
 * - Check/CheckCircle → CheckCircle2 (statusIcons.success)
 * - X → XCircle (statusIcons.error) for status indicators
 * - AlertCircle → AlertTriangle (statusIcons.warning)
 *
 * ACCESSIBILITY REQUIREMENTS:
 * ---------------------------
 * Always pair icons with tooltips for accessibility:
 *
 * @example Icon-only button with sr-only text
 * <Button variant="ghost" size="icon">
 *   <Pencil className="h-4 w-4" />
 *   <span className="sr-only">Edit</span>
 * </Button>
 *
 * @example Icon-only button with Tooltip component
 * <Tooltip>
 *   <TooltipTrigger asChild>
 *     <Button variant="ghost" size="icon">
 *       <Pencil className="h-4 w-4" />
 *     </Button>
 *   </TooltipTrigger>
 *   <TooltipContent>Edit</TooltipContent>
 * </Tooltip>
 *
 * @example Status badge with icon and color
 * <StatusBadge status="success">Approved</StatusBadge>
 *
 * SEMANTIC COLOR PAIRING:
 * -----------------------
 * Status icons should be paired with semantic colors from design tokens:
 * - success → CheckCircle2 + success-500/600
 * - error → XCircle + error-500/600
 * - warning → AlertTriangle + warning-500/600
 * - info → Info + info-500/600
 * - pending → Clock + neutral-500/600
 *
 * @author Dernek Yönetim Sistemi Team
 * @version 1.0.0
 */
import { Pencil, Trash2, Eye, Plus, Save, X, Download, Upload, RefreshCw, Search, Filter, MoreHorizontal, CheckCircle2, XCircle, AlertTriangle, Info, Clock, Loader2, ArrowLeft, ArrowRight, ChevronUp, ChevronDown, Home, TrendingUp, TrendingDown, Calendar, User, Users, type LucideIcon } from 'lucide-react';
/**
 * Action Icons Mapping
 *
 * Icons for user actions and interactions.
 * Use these icons consistently across all action buttons.
 */
export declare const actionIcons: {
    readonly edit: import("react").ForwardRefExoticComponent<Omit<import("lucide-react").LucideProps, "ref"> & import("react").RefAttributes<SVGSVGElement>>;
    readonly delete: import("react").ForwardRefExoticComponent<Omit<import("lucide-react").LucideProps, "ref"> & import("react").RefAttributes<SVGSVGElement>>;
    readonly view: import("react").ForwardRefExoticComponent<Omit<import("lucide-react").LucideProps, "ref"> & import("react").RefAttributes<SVGSVGElement>>;
    readonly add: import("react").ForwardRefExoticComponent<Omit<import("lucide-react").LucideProps, "ref"> & import("react").RefAttributes<SVGSVGElement>>;
    readonly save: import("react").ForwardRefExoticComponent<Omit<import("lucide-react").LucideProps, "ref"> & import("react").RefAttributes<SVGSVGElement>>;
    readonly cancel: import("react").ForwardRefExoticComponent<Omit<import("lucide-react").LucideProps, "ref"> & import("react").RefAttributes<SVGSVGElement>>;
    readonly download: import("react").ForwardRefExoticComponent<Omit<import("lucide-react").LucideProps, "ref"> & import("react").RefAttributes<SVGSVGElement>>;
    readonly upload: import("react").ForwardRefExoticComponent<Omit<import("lucide-react").LucideProps, "ref"> & import("react").RefAttributes<SVGSVGElement>>;
    readonly refresh: import("react").ForwardRefExoticComponent<Omit<import("lucide-react").LucideProps, "ref"> & import("react").RefAttributes<SVGSVGElement>>;
    readonly search: import("react").ForwardRefExoticComponent<Omit<import("lucide-react").LucideProps, "ref"> & import("react").RefAttributes<SVGSVGElement>>;
    readonly filter: import("react").ForwardRefExoticComponent<Omit<import("lucide-react").LucideProps, "ref"> & import("react").RefAttributes<SVGSVGElement>>;
    readonly more: import("react").ForwardRefExoticComponent<Omit<import("lucide-react").LucideProps, "ref"> & import("react").RefAttributes<SVGSVGElement>>;
};
/**
 * Status Icons Mapping
 *
 * Icons for status indicators and feedback.
 * Always pair with semantic colors for accessibility.
 */
export declare const statusIcons: {
    readonly success: import("react").ForwardRefExoticComponent<Omit<import("lucide-react").LucideProps, "ref"> & import("react").RefAttributes<SVGSVGElement>>;
    readonly error: import("react").ForwardRefExoticComponent<Omit<import("lucide-react").LucideProps, "ref"> & import("react").RefAttributes<SVGSVGElement>>;
    readonly warning: import("react").ForwardRefExoticComponent<Omit<import("lucide-react").LucideProps, "ref"> & import("react").RefAttributes<SVGSVGElement>>;
    readonly info: import("react").ForwardRefExoticComponent<Omit<import("lucide-react").LucideProps, "ref"> & import("react").RefAttributes<SVGSVGElement>>;
    readonly pending: import("react").ForwardRefExoticComponent<Omit<import("lucide-react").LucideProps, "ref"> & import("react").RefAttributes<SVGSVGElement>>;
    readonly loading: import("react").ForwardRefExoticComponent<Omit<import("lucide-react").LucideProps, "ref"> & import("react").RefAttributes<SVGSVGElement>>;
};
/**
 * Navigation Icons Mapping
 *
 * Icons for navigation and directional indicators.
 */
export declare const navigationIcons: {
    readonly back: import("react").ForwardRefExoticComponent<Omit<import("lucide-react").LucideProps, "ref"> & import("react").RefAttributes<SVGSVGElement>>;
    readonly forward: import("react").ForwardRefExoticComponent<Omit<import("lucide-react").LucideProps, "ref"> & import("react").RefAttributes<SVGSVGElement>>;
    readonly up: import("react").ForwardRefExoticComponent<Omit<import("lucide-react").LucideProps, "ref"> & import("react").RefAttributes<SVGSVGElement>>;
    readonly down: import("react").ForwardRefExoticComponent<Omit<import("lucide-react").LucideProps, "ref"> & import("react").RefAttributes<SVGSVGElement>>;
    readonly home: import("react").ForwardRefExoticComponent<Omit<import("lucide-react").LucideProps, "ref"> & import("react").RefAttributes<SVGSVGElement>>;
};
/**
 * Data Icons Mapping
 *
 * Icons for data visualization and display.
 */
export declare const dataIcons: {
    readonly trendUp: import("react").ForwardRefExoticComponent<Omit<import("lucide-react").LucideProps, "ref"> & import("react").RefAttributes<SVGSVGElement>>;
    readonly trendDown: import("react").ForwardRefExoticComponent<Omit<import("lucide-react").LucideProps, "ref"> & import("react").RefAttributes<SVGSVGElement>>;
    readonly calendar: import("react").ForwardRefExoticComponent<Omit<import("lucide-react").LucideProps, "ref"> & import("react").RefAttributes<SVGSVGElement>>;
    readonly user: import("react").ForwardRefExoticComponent<Omit<import("lucide-react").LucideProps, "ref"> & import("react").RefAttributes<SVGSVGElement>>;
    readonly users: import("react").ForwardRefExoticComponent<Omit<import("lucide-react").LucideProps, "ref"> & import("react").RefAttributes<SVGSVGElement>>;
};
/**
 * TypeScript Types
 */
export type ActionIconKey = keyof typeof actionIcons;
export type StatusIconKey = keyof typeof statusIcons;
export type NavigationIconKey = keyof typeof navigationIcons;
export type DataIconKey = keyof typeof dataIcons;
/**
 * Icon Mapping Interface
 *
 * Type-safe interface for icon mappings.
 */
export interface IconMapping {
    action: typeof actionIcons;
    status: typeof statusIcons;
    navigation: typeof navigationIcons;
    data: typeof dataIcons;
}
/**
 * Get Action Icon
 *
 * Type-safe helper to retrieve action icons.
 *
 * @param action - The action type
 * @returns The corresponding Lucide icon component
 *
 * @example
 * const EditIcon = getActionIcon('edit');
 * <EditIcon className="h-4 w-4" />
 */
export declare function getActionIcon(action: ActionIconKey): LucideIcon;
/**
 * Get Status Icon
 *
 * Type-safe helper to retrieve status icons.
 *
 * @param status - The status type
 * @returns The corresponding Lucide icon component
 *
 * @example
 * const SuccessIcon = getStatusIcon('success');
 * <SuccessIcon className="h-4 w-4 text-success-600" />
 */
export declare function getStatusIcon(status: StatusIconKey): LucideIcon;
/**
 * Get Icon with Tooltip
 *
 * Helper to pair icon with tooltip text for accessibility.
 *
 * @param icon - The Lucide icon component
 * @param tooltip - The tooltip text
 * @returns Object with icon and tooltip
 *
 * @example
 * const { icon: EditIcon, tooltip } = getIconWithTooltip(actionIcons.edit, 'Edit item');
 * <Tooltip>
 *   <TooltipTrigger asChild>
 *     <Button variant="ghost" size="icon">
 *       <EditIcon className="h-4 w-4" />
 *     </Button>
 *   </TooltipTrigger>
 *   <TooltipContent>{tooltip}</TooltipContent>
 * </Tooltip>
 */
export declare function getIconWithTooltip(icon: LucideIcon, tooltip: string): {
    icon: LucideIcon;
    tooltip: string;
};
/**
 * Icon Size Classes
 *
 * Consistent icon sizing classes for different contexts.
 */
export declare const iconSizeClasses: {
    readonly xs: "h-3 w-3";
    readonly sm: "h-3.5 w-3.5";
    readonly default: "h-4 w-4";
    readonly lg: "h-4.5 w-4.5";
    readonly xl: "h-5 w-5";
    readonly '2xl': "h-6 w-6";
};
export type IconSize = keyof typeof iconSizeClasses;
/**
 * Get Icon Size Class
 *
 * Helper to get consistent icon size classes.
 *
 * @param size - The icon size
 * @returns The corresponding Tailwind CSS classes
 *
 * @example
 * <Pencil className={getIconSizeClass('default')} />
 */
export declare function getIconSizeClass(size?: IconSize): string;
export declare const icons: IconMapping;
export { Pencil, Trash2, Eye, Plus, Save, X, Download, Upload, RefreshCw, Search, Filter, MoreHorizontal, CheckCircle2, XCircle, AlertTriangle, Info, Clock, Loader2, ArrowLeft, ArrowRight, ChevronUp, ChevronDown, Home, TrendingUp, TrendingDown, Calendar, User, Users, type LucideIcon, };
//# sourceMappingURL=icons.d.ts.map