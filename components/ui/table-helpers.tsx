/**
 * @fileoverview table-helpers Module - Optional helper components for common table patterns
 *
 * @author Dernek Yönetim Sistemi Team
 * @version 1.0.0
 *
 * ## Usage Philosophy
 *
 * These helpers are OPTIONAL utilities that reduce boilerplate for common table patterns.
 * Pages can continue using manual patterns if they need custom behavior.
 * Import from `components/ui/table-helpers` only when needed.
 *
 * ## Available Helpers
 *
 * - `TableLoadingSkeleton` - Render skeleton rows for loading states
 * - `TableEmptyState` - Render centered empty state message
 * - `TableActionButtons` - Render action buttons with consistent styling
 */

'use client';

import * as React from 'react';
import { TableRow, TableCell } from './table';
import { Skeleton } from './skeleton';
import { Button } from './button';

/**
 * TableLoadingSkeleton - Render skeleton rows for loading states
 *
 * @example
 * ```tsx
 * <TableBody>
 *   {loading ? (
 *     <TableLoadingSkeleton rows={5} columns={7} />
 *   ) : (
 *     data.map(item => <TableRow key={item.id}>...</TableRow>)
 *   )}
 * </TableBody>
 * ```
 */
export interface TableLoadingSkeletonProps {
  /** Number of skeleton rows to render */
  rows?: number;
  /** Number of columns per row */
  columns: number;
  /** Custom skeleton widths for each column */
  columnWidths?: string[];
  /** Custom cell className */
  cellClassName?: string;
}

export function TableLoadingSkeleton({
  rows = 5,
  columns,
  columnWidths,
  cellClassName = 'p-3 sm:p-4',
}: TableLoadingSkeletonProps) {
  return (
    <>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <TableRow key={rowIndex}>
          {Array.from({ length: columns }).map((_, colIndex) => (
            <TableCell key={colIndex} className={cellClassName}>
              <Skeleton className={columnWidths?.[colIndex] || 'h-4 w-24'} />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  );
}

/**
 * TableEmptyState - Render centered empty state message
 *
 * @example
 * ```tsx
 * <TableBody>
 *   {data.length === 0 && (
 *     <TableEmptyState
 *       icon={<Plus className="h-12 w-12" />}
 *       title="No data found"
 *       description="Add new items to get started"
 *       colSpan={7}
 *     />
 *   )}
 * </TableBody>
 * ```
 */
export interface TableEmptyStateProps {
  /** Icon to display (optional) */
  icon?: React.ReactNode;
  /** Main title text */
  title: string;
  /** Secondary description text (optional) */
  description?: string;
  /** Action button or element (optional) */
  action?: React.ReactNode;
  /** Number of columns to span */
  colSpan: number;
  /** Custom className for the container */
  className?: string;
}

export function TableEmptyState({
  icon,
  title,
  description,
  action,
  colSpan,
  className,
}: TableEmptyStateProps) {
  return (
    <TableRow>
      <TableCell colSpan={colSpan} className={`py-8 text-center text-gray-500 ${className || ''}`}>
        {icon && <div className="mx-auto mb-4 text-gray-300">{icon}</div>}
        <p className="mb-2 text-gray-600">{title}</p>
        {description && <p className="text-sm text-gray-400">{description}</p>}
        {action && <div className="mt-4">{action}</div>}
      </TableCell>
    </TableRow>
  );
}

/**
 * TableActionButtons - Render action buttons with consistent styling
 *
 * @example
 * ```tsx
 * <TableCell className="text-center">
 *   <TableActionButtons
 *     actions={[
 *       {
 *         icon: <Eye className="h-4 w-4" />,
 *         onClick: () => handleView(row.id),
 *         label: 'View',
 *         variant: 'default',
 *       },
 *       {
 *         icon: <Edit className="h-4 w-4" />,
 *         onClick: () => handleEdit(row.id),
 *         label: 'Edit',
 *         variant: 'default',
 *         show: canEdit,
 *       },
 *       {
 *         icon: <Trash2 className="h-4 w-4" />,
 *         onClick: () => handleDelete(row.id),
 *         label: 'Delete',
 *         variant: 'destructive',
 *       },
 *     ]}
 *     row={row}
 *   />
 * </TableCell>
 * ```
 */
export interface TableActionButton {
  /** Icon element to display */
  icon: React.ReactNode;
  /** Click handler */
  onClick: (row?: any) => void;
  /** Accessible label for screen readers */
  label: string;
  /** Button variant (optional, defaults to 'ghost') */
  variant?: 'default' | 'ghost' | 'destructive' | 'outline' | 'secondary' | 'link';
  /** Whether to show this action (optional, defaults to true) */
  show?: boolean;
  /** Custom button className (optional) */
  className?: string;
}

export interface TableActionButtonsProps {
  /** Array of action configurations */
  actions: TableActionButton[];
  /** Row data passed to onClick handlers */
  row?: any;
  /** Container className (optional) */
  containerClassName?: string;
}

export function TableActionButtons({
  actions,
  row,
  containerClassName = 'flex items-center justify-center gap-2',
}: TableActionButtonsProps) {
  return (
    <div className={containerClassName}>
      {actions.map((action, index) => {
        // Skip if show is explicitly false
        if (action.show === false) return null;

        return (
          <Button
            key={index}
            variant={action.variant || 'ghost'}
            size="sm"
            className={action.className || 'h-8 w-8 p-0'}
            onClick={() => {
              action.onClick(row);
            }}
            aria-label={action.label}
          >
            {action.icon}
          </Button>
        );
      })}
    </div>
  );
}
