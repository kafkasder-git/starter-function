/**
 * @fileoverview ResponsiveTable Module - Application module
 *
 * @author Dernek Yönetim Sistemi Team
 * @version 1.0.0
 */

import { Eye, MoreHorizontal } from 'lucide-react';
import { useState } from 'react';
import { Badge } from './badge';
import { Button } from './button';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './table';
import { useAdvancedMobile } from '../../hooks/useAdvancedMobile';

interface ResponsiveTableProps<T = any> {
  data: T[];
  columns: Array<{
    key: string;
    label: string;
    render?: (value: any, row: T) => React.ReactNode;
    mobileLabel?: string;
    mobilePriority?: number; // 1 = highest priority
  }>;
  actions?: Array<{
    label: string;
    onClick: (row: T) => void;
    icon?: React.ReactNode;
    variant?: 'default' | 'destructive' | 'outline';
  }>;
  onRowClick?: (row: T) => void;
  loading?: boolean;
  emptyState?: React.ReactNode;
  className?: string;
  breakpoint?: 'sm' | 'md' | 'lg';
}

export function ResponsiveTable<T = any>({
  data,
  columns,
  actions = [],
  onRowClick,
  loading = false,
  emptyState,
  className = '',
  breakpoint = 'md'
}: ResponsiveTableProps<T>) {
  const { isMobile } = useAdvancedMobile();
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const toggleRowExpansion = (rowId: string) => {
    setExpandedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(rowId)) {
        newSet.delete(rowId);
      } else {
        newSet.add(rowId);
      }
      return newSet;
    });
  };

  // Sort columns by mobile priority
  const sortedColumns = [...columns].sort((a, b) => 
    (a.mobilePriority || 999) - (b.mobilePriority || 999)
  );

  // Get primary columns for mobile (top 3 priority)
  const primaryColumns = sortedColumns.slice(0, 3);
  const secondaryColumns = sortedColumns.slice(3);

  if (loading) {
    return (
      <div className={`space-y-4 ${className}`}>
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (data.length === 0) {
    return emptyState || (
      <Card className={className}>
        <CardContent className="p-8 text-center">
          <p className="text-gray-500">Veri bulunamadı</p>
        </CardContent>
      </Card>
    );
  }

  // Desktop Table View
  if (!isMobile) {
    return (
      <div className={`overflow-x-auto ${className}`}>
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead key={column.key}>
                  {column.label}
                </TableHead>
              ))}
              {actions.length > 0 && (
                <TableHead className="w-16">İşlemler</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row, index) => (
              <TableRow 
                key={index}
                className={onRowClick ? 'cursor-pointer hover:bg-gray-50' : ''}
                onClick={() => onRowClick?.(row)}
              >
                {columns.map((column) => (
                  <TableCell key={column.key}>
                    {column.render 
                      ? column.render((row as any)[column.key], row)
                      : (row as any)[column.key]
                    }
                  </TableCell>
                ))}
                {actions.length > 0 && (
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {actions.map((action, actionIndex) => (
                        <Button
                          key={actionIndex}
                          variant={action.variant || 'ghost'}
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            action.onClick(row);
                          }}
                          className="h-8 w-8 p-0"
                        >
                          {action.icon || <MoreHorizontal className="h-4 w-4" />}
                        </Button>
                      ))}
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  // Mobile Card View
  return (
    <div className={`space-y-3 ${className}`}>
      {data.map((row, index) => {
        const rowId = `row-${index}`;
        const isExpanded = expandedRows.has(rowId);
        
        return (
          <Card key={index} className="overflow-hidden">
            <CardHeader 
              className="pb-3 cursor-pointer"
              onClick={() => onRowClick?.(row)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  {/* Primary columns */}
                  {primaryColumns.map((column) => (
                    <div key={column.key} className="mb-1 last:mb-0">
                      <span className="text-xs text-gray-500 font-medium">
                        {column.mobileLabel || column.label}:
                      </span>
                      <div className="text-sm text-gray-900">
                        {column.render 
                          ? column.render((row as any)[column.key], row)
                          : (row as any)[column.key]
                        }
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Actions */}
                {actions.length > 0 && (
                  <div className="flex items-center gap-1 ml-2">
                    {actions.slice(0, 2).map((action, actionIndex) => (
                      <Button
                        key={actionIndex}
                        variant={action.variant || 'ghost'}
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          action.onClick(row);
                        }}
                        className="h-8 w-8 p-0"
                      >
                        {action.icon || <MoreHorizontal className="h-4 w-4" />}
                      </Button>
                    ))}
                    
                    {/* Expand button if there are more columns */}
                    {secondaryColumns.length > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleRowExpansion(rowId);
                        }}
                        className="h-8 w-8 p-0"
                      >
                        <Eye className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </CardHeader>

            {/* Expanded content */}
            {isExpanded && secondaryColumns.length > 0 && (
              <CardContent className="pt-0 border-t bg-gray-50/50">
                <div className="space-y-2">
                  {secondaryColumns.map((column) => (
                    <div key={column.key} className="flex justify-between">
                      <span className="text-xs text-gray-500 font-medium">
                        {column.mobileLabel || column.label}:
                      </span>
                      <div className="text-sm text-gray-900 text-right">
                        {column.render 
                          ? column.render((row as any)[column.key], row)
                          : (row as any)[column.key]
                        }
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            )}
          </Card>
        );
      })}
    </div>
  );
}
