/**
 * @fileoverview DataTable Module - Application module
 * 
 * @author Dernek Yönetim Sistemi Team
 * @version 1.0.0
 */

import type { ReactNode } from 'react';
import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ChevronUp,
  ChevronDown,
  MoreHorizontal,
  Filter,
  Search,
  RefreshCw,
} from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Button } from '../ui/button';
import { Checkbox } from '../ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Input } from '../ui/input';
import { Skeleton } from '../ui/skeleton';
import { useSearchContext } from './SearchProvider';
import { usePagination } from '../../hooks/usePagination';
import { useIsMobile } from '../../hooks/useTouchDevice';
import { cn } from '../ui/utils';

/**
 * ColumnDef Interface
 * 
 * @interface ColumnDef
 */
export interface ColumnDef<T = any> {
  id: string;
  header: string;
  accessorKey?: string;
  cell?: (value: any, row: T, index: number) => ReactNode;
  sortable?: boolean;
  filterable?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
  className?: string;
}

interface DataTableProps<T = any> {
  columns: ColumnDef<T>[];
  data?: T[];
  loading?: boolean;
  selectable?: boolean;
  onRowClick?: (row: T, index: number) => void;
  onRowSelect?: (selectedRows: T[]) => void;
  actions?: {
    label: string;
    icon?: ReactNode;
    onClick: (row: T, index: number) => void;
    variant?: 'default' | 'destructive' | 'outline';
    show?: (row: T) => boolean;
  }[];
  className?: string;
  showPagination?: boolean;
  showSearch?: boolean;
  showFilters?: boolean;
  rowsPerPage?: number;
  emptyMessage?: string;
  stickyHeader?: boolean;
  compact?: boolean;
}

/**
 * DataTable function
 * 
 * @param {Object} params - Function parameters
 * @returns {void} Nothing
 */
export function DataTable<T = any>({
  columns,
  data = [],
  loading = false,
  selectable = false,
  onRowClick,
  onRowSelect,
  actions = [],
  className,
  showPagination = true,
  showSearch = true,
  showFilters = false,
  rowsPerPage = 20,
  emptyMessage = 'Veri bulunamadı',
  stickyHeader = true,
  compact = false,
}: DataTableProps<T>) {
  const isMobile = useIsMobile();
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
  const [quickFilter, setQuickFilter] = useState('');

  const { searchState, setSort, hasResults, isEmpty } = useSearchContext();

  // Filter data based on quick filter
  const filteredData = useMemo(() => {
    if (!quickFilter.trim()) return data;

    return data.filter((row) => {
      return columns.some((column) => {
        if (!column.filterable) return false;

        const value = column.accessorKey ? (row as any)[column.accessorKey] : null;
        if (value == null) return false;

        return String(value).toLowerCase().includes(quickFilter.toLowerCase());
      });
    });
  }, [data, quickFilter, columns]);

  // Pagination
  const pagination = usePagination({
    totalItems: filteredData.length,
    itemsPerPage: rowsPerPage,
    onPageChange: (page) => {
      setSelectedRows(new Set()); // Clear selection on page change
    },
  });

  const paginatedData = pagination.getPageItems(filteredData);

  // Handle sorting
  const handleSort = (columnId: string) => {
    const column = columns.find((col) => col.id === columnId);
    if (!column?.sortable) return;

    const newDirection =
      searchState.sort.field === columnId && searchState.sort.direction === 'asc' ? 'desc' : 'asc';

    setSort({ field: columnId, direction: newDirection });
  };

  // Handle row selection
  const handleRowSelect = (index: number, checked: boolean) => {
    const newSelected = new Set(selectedRows);

    if (checked) {
      newSelected.add(index);
    } else {
      newSelected.delete(index);
    }

    setSelectedRows(newSelected);

    const selectedData = Array.from(newSelected).map((i) => paginatedData[i]);
    onRowSelect?.(selectedData);
  };

  // Handle select all
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIndices = new Set(paginatedData.map((_, index) => index));
      setSelectedRows(allIndices);
      onRowSelect?.(paginatedData);
    } else {
      setSelectedRows(new Set());
      onRowSelect?.([]);
    }
  };

  // Check if all rows are selected
  const isAllSelected = paginatedData.length > 0 && selectedRows.size === paginatedData.length;
  const isIndeterminate = selectedRows.size > 0 && selectedRows.size < paginatedData.length;

  // Render cell content
  const renderCell = (column: ColumnDef<T>, row: T, rowIndex: number) => {
    const value = column.accessorKey ? row[column.accessorKey as keyof T] : null;

    if (column.cell) {
      return column.cell(value, row, rowIndex);
    }

    if (value == null) {
      return <span className="text-gray-400">—</span>;
    }

    return String(value);
  };

  // Loading skeleton
  if (loading) {
    return (
      <div className="space-y-4">
        {showSearch && (
          <div className="flex gap-2">
            <Skeleton className="h-10 flex-1" />
            <Skeleton className="h-10 w-20" />
          </div>
        )}
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                {selectable && (
                  <TableHead className="w-12">
                    <Skeleton className="h-4 w-4" />
                  </TableHead>
                )}
                {columns.map((column) => (
                  <TableHead key={column.id}>
                    <Skeleton className="h-4 w-full max-w-32" />
                  </TableHead>
                ))}
                {actions.length > 0 && (
                  <TableHead className="w-16">
                    <Skeleton className="h-4 w-8" />
                  </TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index}>
                  {selectable && (
                    <TableCell>
                      <Skeleton className="h-4 w-4" />
                    </TableCell>
                  )}
                  {columns.map((column) => (
                    <TableCell key={column.id}>
                      <Skeleton className="h-4 w-full max-w-40" />
                    </TableCell>
                  ))}
                  {actions.length > 0 && (
                    <TableCell>
                      <Skeleton className="h-4 w-8" />
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Search and filters */}
      {(showSearch ?? showFilters) && (
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
          {showSearch && (
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Tabloda ara..."
                value={quickFilter}
                onChange={(e) => {
                  setQuickFilter(e.target.value);
                }}
                className="pl-9"
              />
            </div>
          )}

          <div className="flex gap-2">
            {showFilters && (
              <Button variant="outline" size="sm">
                <Filter className="w-4 h-4 mr-2" />
                Filtrele
              </Button>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                pagination.resetToFirstPage();
              }}
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Selection info */}
      {selectable && selectedRows.size > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-primary/10 border border-primary/20 rounded-lg p-3 flex items-center justify-between"
        >
          <span className="text-sm font-medium text-primary">{selectedRows.size} öğe seçildi</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              handleSelectAll(false);
            }}
            className="text-primary hover:text-primary/80"
          >
            Seçimi Temizle
          </Button>
        </motion.div>
      )}

      {/* Table */}
      <div className="border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className={cn(stickyHeader && 'sticky top-0 z-10 bg-white')}>
              <TableRow className="bg-gray-50/80">
                {selectable && (
                  <TableHead className="w-12">
                    <Checkbox
                      checked={isAllSelected}
                      onCheckedChange={handleSelectAll}
                      aria-label="Tümünü seç"
                    />
                  </TableHead>
                )}

                {columns.map((column) => (
                  <TableHead
                    key={column.id}
                    className={cn(
                      'font-semibold text-gray-700',
                      column.width && `w-${column.width}`,
                      column.align === 'center' && 'text-center',
                      column.align === 'right' && 'text-right',
                      column.sortable && 'cursor-pointer hover:bg-gray-100 transition-colors',
                      column.className,
                    )}
                    style={{ width: column.width }}
                    onClick={() => column.sortable && handleSort(column.id)}
                  >
                    <div className="flex items-center gap-1">
                      <span>{column.header}</span>
                      {column.sortable && (
                        <div className="flex flex-col">
                          <ChevronUp
                            className={cn(
                              'w-3 h-3 -mb-1',
                              searchState.sort.field === column.id &&
                                searchState.sort.direction === 'asc'
                                ? 'text-primary'
                                : 'text-gray-300',
                            )}
                          />
                          <ChevronDown
                            className={cn(
                              'w-3 h-3',
                              searchState.sort.field === column.id &&
                                searchState.sort.direction === 'desc'
                                ? 'text-primary'
                                : 'text-gray-300',
                            )}
                          />
                        </div>
                      )}
                    </div>
                  </TableHead>
                ))}

                {actions.length > 0 && <TableHead className="w-16 text-center">İşlemler</TableHead>}
              </TableRow>
            </TableHeader>

            <TableBody>
              <AnimatePresence mode="wait">
                {paginatedData.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length + (selectable ? 1 : 0) + (actions.length > 0 ? 1 : 0)}
                      className="text-center py-12 text-gray-500"
                    >
                      <div className="flex flex-col items-center gap-2">
                        <Search className="w-8 h-8 opacity-50" />
                        <p>{emptyMessage}</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedData.map((row, index) => (
                    <motion.tr
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.02 }}
                      className={cn(
                        'hover:bg-gray-50/80 transition-colors',
                        onRowClick && 'cursor-pointer',
                        selectedRows.has(index) && 'bg-primary/5 border-primary/20',
                        compact ? 'h-10' : 'h-12',
                      )}
                      onClick={() => onRowClick?.(row, index)}
                    >
                      {selectable && (
                        <TableCell>
                          <Checkbox
                            checked={selectedRows.has(index)}
                            onCheckedChange={(checked) => {
                              handleRowSelect(index, Boolean(checked));
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                            }}
                            aria-label={`Satır ${index + 1}'i seç`}
                          />
                        </TableCell>
                      )}

                      {columns.map((column) => (
                        <TableCell
                          key={column.id}
                          className={cn(
                            column.align === 'center' && 'text-center',
                            column.align === 'right' && 'text-right',
                            column.className,
                            compact && 'py-2',
                          )}
                        >
                          {renderCell(column, row, index)}
                        </TableCell>
                      ))}

                      {actions.length > 0 && (
                        <TableCell className="text-center">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="w-8 h-8 p-0"
                                onClick={(e) => {
                                  e.stopPropagation();
                                }}
                              >
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {actions
                                .filter((action) => !action.show ?? action.show(row))
                                .map((action, actionIndex) => (
                                  <DropdownMenuItem
                                    key={actionIndex}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      action.onClick(row, index);
                                    }}
                                    className={cn(
                                      action.variant === 'destructive' &&
                                        'text-red-600 focus:text-red-600',
                                    )}
                                  >
                                    {action.icon && <span className="mr-2">{action.icon}</span>}
                                    {action.label}
                                  </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      )}
                    </motion.tr>
                  ))
                )}
              </AnimatePresence>
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination */}
      {showPagination && paginatedData.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-sm">
          <div className="text-gray-600">
            {isMobile ? pagination.getMobilePaginationInfo() : pagination.getPaginationInfo()}
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={pagination.goToPreviousPage}
              disabled={!pagination.hasPreviousPage}
            >
              Önceki
            </Button>

            {!isMobile &&
              pagination.pageNumbers.map((pageNum, index) => (
                <Button
                  key={index}
                  variant={pageNum === pagination.currentPage ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => typeof pageNum === 'number' && pagination.goToPage(pageNum)}
                  disabled={typeof pageNum === 'string'}
                  className="w-8"
                >
                  {pageNum}
                </Button>
              ))}

            <Button
              variant="outline"
              size="sm"
              onClick={pagination.goToNextPage}
              disabled={!pagination.hasNextPage}
            >
              Sonraki
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
