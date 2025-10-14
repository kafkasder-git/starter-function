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
import { 
// Action Icons
Pencil, Trash2, Eye, Plus, Save, X, Download, Upload, RefreshCw, Search, Filter, MoreHorizontal, 
// Status Icons
CheckCircle2, XCircle, AlertTriangle, Info, Clock, Loader2, 
// Navigation Icons
ArrowLeft, ArrowRight, ChevronUp, ChevronDown, Home, 
// Data Icons
TrendingUp, TrendingDown, Calendar, User, Users, } from 'lucide-react';
/**
 * Action Icons Mapping
 *
 * Icons for user actions and interactions.
 * Use these icons consistently across all action buttons.
 */
export const actionIcons = {
    edit: Pencil,
    delete: Trash2,
    view: Eye,
    add: Plus,
    save: Save,
    cancel: X,
    download: Download,
    upload: Upload,
    refresh: RefreshCw,
    search: Search,
    filter: Filter,
    more: MoreHorizontal,
};
/**
 * Status Icons Mapping
 *
 * Icons for status indicators and feedback.
 * Always pair with semantic colors for accessibility.
 */
export const statusIcons = {
    success: CheckCircle2,
    error: XCircle,
    warning: AlertTriangle,
    info: Info,
    pending: Clock,
    loading: Loader2,
};
/**
 * Navigation Icons Mapping
 *
 * Icons for navigation and directional indicators.
 */
export const navigationIcons = {
    back: ArrowLeft,
    forward: ArrowRight,
    up: ChevronUp,
    down: ChevronDown,
    home: Home,
};
/**
 * Data Icons Mapping
 *
 * Icons for data visualization and display.
 */
export const dataIcons = {
    trendUp: TrendingUp,
    trendDown: TrendingDown,
    calendar: Calendar,
    user: User,
    users: Users,
};
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
export function getActionIcon(action) {
    return actionIcons[action];
}
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
export function getStatusIcon(status) {
    return statusIcons[status];
}
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
export function getIconWithTooltip(icon, tooltip) {
    return { icon, tooltip };
}
/**
 * Icon Size Classes
 *
 * Consistent icon sizing classes for different contexts.
 */
export const iconSizeClasses = {
    xs: 'h-3 w-3',
    sm: 'h-3.5 w-3.5',
    default: 'h-4 w-4',
    lg: 'h-4.5 w-4.5',
    xl: 'h-5 w-5',
    '2xl': 'h-6 w-6',
};
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
export function getIconSizeClass(size = 'default') {
    return iconSizeClasses[size];
}
// Export all icon collections for direct import
export const icons = {
    action: actionIcons,
    status: statusIcons,
    navigation: navigationIcons,
    data: dataIcons,
};
// Export individual icon components for convenience
export { 
// Action Icons
Pencil, Trash2, Eye, Plus, Save, X, Download, Upload, RefreshCw, Search, Filter, MoreHorizontal, 
// Status Icons
CheckCircle2, XCircle, AlertTriangle, Info, Clock, Loader2, 
// Navigation Icons
ArrowLeft, ArrowRight, ChevronUp, ChevronDown, Home, 
// Data Icons
TrendingUp, TrendingDown, Calendar, User, Users, };
