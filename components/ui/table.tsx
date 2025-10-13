/**
 * @fileoverview table Module - Base table primitives for building flexible, accessible data tables
 *
 * @author Dernek Yönetim Sistemi Team
 * @version 1.0.0
 *
 * ## Table Usage Guide
 *
 * This module provides base table primitives rather than wrapper components.
 * This approach provides maximum flexibility for different use cases while maintaining consistency.
 *
 * ### Common Patterns
 *
 * #### 1. Loading State Pattern
 * ```tsx
 * <TableBody>
 *   {loading ? (
 *     Array.from({ length: 5 }).map((_, i) => (
 *       <TableRow key={i}>
 *         <TableCell><Skeleton className="h-4 w-32" /></TableCell>
 *         <TableCell><Skeleton className="h-4 w-20" /></TableCell>
 *       </TableRow>
 *     ))
 *   ) : (
 *     // Actual data rows
 *   )}
 * </TableBody>
 * ```
 *
 * #### 2. Empty State Pattern
 * ```tsx
 * <TableBody>
 *   {data.length === 0 && (
 *     <TableRow>
 *       <TableCell colSpan={7} className="py-8 text-center text-gray-500">
 *         <Icon className="mx-auto mb-4 h-12 w-12 text-gray-300" />
 *         <p className="mb-2 text-gray-600">No data found</p>
 *         <p className="text-sm text-gray-400">Description text</p>
 *       </TableCell>
 *     </TableRow>
 *   )}
 * </TableBody>
 * ```
 *
 * #### 3. Responsive Columns Pattern
 * Hide columns on smaller screens:
 * ```tsx
 * <TableHead className="hidden lg:table-cell">Desktop Only</TableHead>
 * <TableCell className="hidden lg:table-cell">{data}</TableCell>
 * ```
 * Show on specific breakpoints: `hidden sm:table-cell`, `hidden md:table-cell`
 *
 * #### 4. Action Buttons Pattern
 * Icon-only buttons in the last column:
 * ```tsx
 * <TableCell className="text-center">
 *   <div className="flex items-center justify-center gap-2">
 *     <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={handleEdit}>
 *       <Edit className="h-4 w-4" />
 *     </Button>
 *     <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={handleDelete}>
 *       <Trash2 className="h-4 w-4" />
 *     </Button>
 *   </div>
 * </TableCell>
 * ```
 *
 * #### 5. Status Badge Pattern
 * Render status indicators:
 * ```tsx
 * <TableCell>
 *   <Badge variant={status === 'active' ? 'default' : 'secondary'}>
 *     {status}
 *   </Badge>
 * </TableCell>
 * ```
 *
 * #### 6. Row Click Handlers
 * ```tsx
 * <TableRow
 *   className="cursor-pointer hover:bg-gray-50"
 *   onClick={() => navigate(`/detail/${id}`)}
 * >
 * ```
 *
 * ### Security
 * TableCell automatically sanitizes string children to prevent XSS attacks.
 *
 * ### Accessibility
 * Built-in ARIA attributes: role="table", aria-label, aria-busy for loading states.
 *
 * For more detailed examples, see: docs/components/TABLE_USAGE_GUIDE.md
 */

'use client';

import * as React from 'react';
import { Loader2 } from 'lucide-react';

import { cn } from './utils';
import { sanitizeUserInput } from '../../lib/security/sanitization';

export interface TableProps extends React.ComponentProps<'table'> {
  stickyHeader?: boolean;
  loading?: boolean;
  emptyState?: React.ReactNode;
  striped?: boolean;
  hoverable?: boolean;
  sortable?: boolean;
  filterable?: boolean;
  onSort?: (column: string, direction: 'asc' | 'desc') => void;
  onFilter?: (filters: Record<string, any>) => void;
}

function Table({
  className,
  stickyHeader = false,
  loading = false,
  children,
  ...props
}: TableProps) {
  return (
    <div data-slot="table-container" className="scrollbar-thin relative w-full overflow-x-auto">
      <table
        data-slot="table"
        className={cn('w-full caption-bottom text-sm', stickyHeader && 'sticky-header', className)}
        role="table"
        aria-label={props['aria-label'] || 'Data table'}
        aria-busy={loading}
        {...props}
      >
        {children}
      </table>

      {loading && (
        <div className="bg-background/80 absolute inset-0 z-10 flex items-center justify-center backdrop-blur-sm">
          <div className="text-muted-foreground flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Yükleniyor...</span>
          </div>
        </div>
      )}
    </div>
  );
}

function TableHeader({ className, ...props }: React.ComponentProps<'thead'>) {
  return (
    <thead
      data-slot="table-header"
      className={cn(
        '[&_tr]:border-b',
        'bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10 backdrop-blur',
        className
      )}
      {...props}
    />
  );
}

function TableBody({ className, ...props }: React.ComponentProps<'tbody'>) {
  return (
    <tbody
      data-slot="table-body"
      className={cn('[&_tr:last-child]:border-none', className)}
      {...props}
    />
  );
}

function TableFooter({ className, ...props }: React.ComponentProps<'tfoot'>) {
  return (
    <tfoot
      data-slot="table-footer"
      className={cn('bg-muted/50 border-t font-medium [&>tr]:last:border-b-0', className)}
      {...props}
    />
  );
}

export interface TableRowProps extends React.ComponentProps<'tr'> {
  selected?: boolean;
  selectable?: boolean;
  onRowSelect?: (selected: boolean) => void;
}

function TableRow({
  className,
  selected = false,
  selectable = false,
  onRowSelect,
  ...props
}: TableRowProps) {
  return (
    <tr
      data-slot="table-row"
      className={cn(
        'border-b transition-colors',
        'hover:bg-muted/50',
        selected && 'bg-muted',
        selectable && 'cursor-pointer',
        className
      )}
      onClick={selectable ? () => onRowSelect?.(!selected) : undefined}
      role="row"
      aria-selected={selectable ? selected : undefined}
      tabIndex={selectable ? 0 : undefined}
      onKeyDown={
        selectable
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onRowSelect?.(!selected);
              }
            }
          : undefined
      }
      {...props}
    />
  );
}

function TableHead({ className, ...props }: React.ComponentProps<'th'>) {
  return (
    <th
      data-slot="table-head"
      className={cn(
        'text-foreground h-10 px-2 text-left align-middle font-medium whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]',
        className
      )}
      {...props}
    />
  );
}

export interface TableCellProps extends React.ComponentProps<'td'> {
  truncate?: boolean;
  maxWidth?: string;
}

function TableCell({ className, children, truncate = false, maxWidth, ...props }: TableCellProps) {
  // Sanitize children if it's a string to prevent XSS
  const sanitizedChildren = React.useMemo(() => {
    if (typeof children === 'string') {
      return sanitizeUserInput(children);
    }
    return children;
  }, [children]);

  return (
    <td
      data-slot="table-cell"
      className={cn(
        'p-2 align-middle [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]',
        truncate ? 'truncate' : 'whitespace-nowrap',
        className
      )}
      style={maxWidth ? { maxWidth } : undefined}
      title={truncate && typeof children === 'string' ? children : undefined}
      {...props}
    >
      {sanitizedChildren}
    </td>
  );
}

function TableCaption({ className, ...props }: React.ComponentProps<'caption'>) {
  return (
    <caption
      data-slot="table-caption"
      className={cn('text-muted-foreground mt-4 text-sm', className)}
      {...props}
    />
  );
}

// Empty State Component
function TableEmptyState({ children, className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="table-empty"
      className={cn('flex flex-col items-center justify-center py-12 text-center', className)}
      {...props}
    >
      {children}
    </div>
  );
}

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
  TableEmptyState,
};
