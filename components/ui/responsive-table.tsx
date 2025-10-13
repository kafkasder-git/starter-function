/**
 * @fileoverview responsive-table Module - Unified responsive table component
 *
 * @author Dernek Yönetim Sistemi Team
 * @version 1.0.0
 *
 * Comprehensive responsive table component that automatically switches between
 * desktop table and mobile card views at 768px breakpoint.
 */

import * as React from 'react';
import { useIsMobile } from './use-mobile';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from './table';
import { Card, CardContent } from './card';
import { Skeleton } from './skeleton';
import { cn } from './utils';

// Column definition interface
export interface ColumnDef<T> {
  /** Data key or identifier */
  key: keyof T | string;
  /** Column header text */
  title: string;
  /** Custom cell renderer */
  render?: (value: any, row: T, index: number) => React.ReactNode;
  /** Enable sorting for this column */
  sortable?: boolean;
  /** Label for mobile key-value display (defaults to title) */
  mobileLabel?: string;
  /** Hide this field in mobile view */
  hideOnMobile?: boolean;
  /** Column width for desktop */
  width?: string;
}

// Props interface
export interface ResponsiveTableProps<T> {
  /** Array of row data */
  data: T[];
  /** Column definitions */
  columns: ColumnDef<T>[];
  /** Loading state */
  loading?: boolean;
  /** Custom empty state component */
  emptyState?: React.ReactNode;
  /** Row click handler */
  onRowClick?: (row: T) => void;
  /** Custom mobile card renderer */
  mobileCardRenderer?: (row: T, index: number) => React.ReactNode;
  /** Enable sticky header for desktop (default: true) */
  stickyHeader?: boolean;
  /** Additional CSS classes */
  className?: string;
}

/**
 * ResponsiveTable - Unified responsive table component
 * Automatically switches between desktop table and mobile card views at 768px breakpoint
 */
export function ResponsiveTable<T extends Record<string, any>>({
  data,
  columns,
  loading = false,
  emptyState,
  onRowClick,
  mobileCardRenderer,
  stickyHeader = true,
  className,
}: ResponsiveTableProps<T>) {
  const isMobile = useIsMobile();

  // Desktop Table View (>= 768px)
  if (!isMobile) {
    return (
      <div className={cn('overflow-x-auto', className)}>
        <Table stickyHeader={stickyHeader} loading={loading}>
          <TableHeader>
            <TableRow className="bg-gray-50/50">
              {columns.map((column, index) => (
                <TableHead
                  key={`header-${String(column.key)}-${index}`}
                  className="font-medium"
                  style={column.width ? { width: column.width } : undefined}
                >
                  {column.title}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              // Loading skeleton rows
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={`skeleton-${i}`}>
                  {columns.map((column, colIndex) => (
                    <TableCell key={`skeleton-cell-${i}-${colIndex}`}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : data.length === 0 ? (
              // Empty state
              <TableRow>
                <TableCell colSpan={columns.length} className="py-8 text-center">
                  {emptyState || (
                    <div className="text-gray-500">
                      <p>Kayıt bulunamadı</p>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ) : (
              // Data rows
              data.map((row, rowIndex) => (
                <TableRow
                  key={`row-${rowIndex}`}
                  className={cn(
                    'transition-colors',
                    onRowClick && 'cursor-pointer hover:bg-neutral-50'
                  )}
                  onClick={() => onRowClick?.(row)}
                >
                  {columns.map((column, colIndex) => {
                    const value = row[column.key as keyof T];
                    return (
                      <TableCell key={`cell-${rowIndex}-${colIndex}`}>
                        {column.render
                          ? column.render(value, row, rowIndex)
                          : value !== null && value !== undefined
                            ? String(value)
                            : '-'}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    );
  }

  // Mobile Card View (< 768px)
  return (
    <div className={cn('space-y-3', className)}>
      {loading ? (
        // Loading skeleton cards
        Array.from({ length: 3 }).map((_, i) => (
          <Card key={`skeleton-card-${i}`} className="p-4">
            <div className="space-y-3">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
            </div>
          </Card>
        ))
      ) : data.length === 0 ? (
        // Empty state
        <div className="py-12 text-center">
          {emptyState || (
            <div className="text-gray-500">
              <p>Kayıt bulunamadı</p>
            </div>
          )}
        </div>
      ) : (
        // Data cards
        data.map((row, index) => {
          // Use custom renderer if provided
          if (mobileCardRenderer) {
            return <div key={`mobile-card-${index}`}>{mobileCardRenderer(row, index)}</div>;
          }

          // Default card layout
          return (
            <Card
              key={`mobile-card-${index}`}
              className={cn('transition-shadow', onRowClick && 'cursor-pointer hover:shadow-md')}
              onClick={() => onRowClick?.(row)}
            >
              <CardContent className="p-4 min-h-[44px]">
                <div className="space-y-2">
                  {columns
                    .filter((column) => !column.hideOnMobile)
                    .map((column, colIndex) => {
                      const value = row[column.key as keyof T];
                      const label = column.mobileLabel || column.title;

                      return (
                        <div
                          key={`mobile-field-${index}-${colIndex}`}
                          className="flex items-start justify-between"
                        >
                          <span className="text-sm text-gray-600">{label}:</span>
                          <span className="text-sm font-medium text-right">
                            {column.render
                              ? column.render(value, row, index)
                              : value !== null && value !== undefined
                                ? String(value)
                                : '-'}
                          </span>
                        </div>
                      );
                    })}
                </div>
              </CardContent>
            </Card>
          );
        })
      )}
    </div>
  );
}

// Export type for external use
export type { ResponsiveTableProps, ColumnDef };
