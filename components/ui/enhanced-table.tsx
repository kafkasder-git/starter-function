/**
 * @fileoverview enhanced-table Module - Application module
 * 
 * @author Dernek Yönetim Sistemi Team
 * @version 1.0.0
 */

'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search,
  Filter,
  MoreVertical,
  Edit,
  Download,
  RefreshCw,
  CheckSquare,
  ArrowUpDown,
  Plus,
  Settings,
  X,
  Calendar,
  Phone,
  Mail,
  Hash,
  DollarSign,
  Zap,
  Save,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Columns,
  SortAsc,
  SortDesc,
  RotateCcw,
  FileText,
  BarChart3,
  AlertCircle,
} from 'lucide-react';

import { Button } from './button';
import { Input } from './input';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Badge } from './badge';
import { Checkbox } from './checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';
import { Popover, PopoverContent, PopoverTrigger } from './popover';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './dropdown-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './table';
import { Switch } from './switch';
import { Label } from './label';
import { Textarea } from './textarea';
import { cn } from './utils';

import { logger } from '../lib/logging/logger';
// Enhanced Table Types - Improved with TypeScript best practices
export type TableColumnType =
  | 'text'
  | 'number'
  | 'date'
  | 'badge'
  | 'currency'
  | 'phone'
  | 'email'
  | 'boolean'
  | 'custom';

export type TableAlignment = 'left' | 'center' | 'right';
export type TableAggregation = 'sum' | 'avg' | 'count' | 'min' | 'max';

/**
 * TableColumn Interface
 * 
 * @interface TableColumn
 */
export interface TableColumn<T = Record<string, unknown>> {
  readonly key: keyof T;
  readonly label: string;
  readonly type?: TableColumnType;
  readonly sortable?: boolean;
  readonly filterable?: boolean;
  readonly editable?: boolean;
  readonly width?: string;
  readonly minWidth?: string;
  readonly maxWidth?: string;
  readonly align?: TableAlignment;
  readonly render?: (value: T[keyof T], row: T, index: number) => React.ReactNode;
  readonly format?: (value: T[keyof T]) => string;
  readonly className?: string;
  readonly headerClassName?: string;
  readonly sticky?: boolean;
  readonly resizable?: boolean;
  readonly aggregation?: TableAggregation;
}

export type TableActionVariant = 'default' | 'destructive' | 'outline' | 'ghost';

/**
 * TableAction Interface
 * 
 * @interface TableAction
 */
export interface TableAction<T = Record<string, unknown>> {
  readonly label: string;
  readonly icon?: React.ReactNode;
  readonly onClick: (row: T, index: number) => void | Promise<void>;
  readonly variant?: TableActionVariant;
  readonly permission?: string;
  readonly condition?: (row: T) => boolean;
  readonly loading?: boolean;
}

export type BulkActionVariant = 'default' | 'destructive' | 'outline';

/**
 * BulkActionConfirmation Interface
 * 
 * @interface BulkActionConfirmation
 */
/**
 * BulkAction Interface
 * 
 * @interface BulkAction
 */
export interface BulkActionConfirmation {
  readonly title: string;
  readonly description: string;
}

export interface BulkAction<T = Record<string, unknown>> {
  readonly label: string;
  readonly icon?: React.ReactNode;
  readonly onClick: (
    selectedRows: readonly T[],
    selectedIndices: readonly number[],
  ) => Promise<void> | void;
  readonly variant?: BulkActionVariant;
  readonly permission?: string;
  readonly confirmation?: BulkActionConfirmation;
}

/**
 * TableFilter Interface
 * 
 * @interface TableFilter
 */
export interface TableFilter {
  key: string;
  label: string;
  type: 'text' | 'select' | 'date' | 'daterange' | 'number' | 'numberrange' | 'boolean';
  options?: { label: string; value: any }[];
  placeholder?: string;
  multiple?: boolean;
}

/**
 * SortConfig Interface
 * 
 * @interface SortConfig
 */
export interface SortConfig {
  key: string;
  direction: 'asc' | 'desc';
}

/**
 * PaginationConfig Interface
 * 
 * @interface PaginationConfig
 */
export interface PaginationConfig {
  page: number;
  pageSize: number;
  total: number;
  showSizeChanger?: boolean;
  pageSizeOptions?: number[];
}

interface EnhancedTableProps<T = any> {
  data: T[];
  columns: TableColumn<T>[];
  title?: string;
  description?: string;
  searchable?: boolean;
  sortable?: boolean;
  filterable?: boolean;
  selectable?: boolean;
  editable?: boolean;
  exportable?: boolean;
  actions?: TableAction<T>[];
  bulkActions?: BulkAction<T>[];
  filters?: TableFilter[];
  pagination?: PaginationConfig;
  loading?: boolean;
  refreshing?: boolean;
  error?: string;
  emptyState?: {
    title: string;
    description: string;
    icon?: React.ReactNode;
    action?: {
      label: string;
      onClick: () => void;
    };
  };
  onRowClick?: (row: T, index: number) => void;
  onRowEdit?: (row: T, index: number, changes: Partial<T>) => Promise<void> | void;
  onRefresh?: () => void;
  onExport?: (data: T[], format: 'csv' | 'xlsx' | 'pdf') => void;
  onPaginationChange?: (page: number, pageSize: number) => void;
  onSortChange?: (sort: SortConfig | null) => void;
  onFilterChange?: (filters: Record<string, any>) => void;
  className?: string;
  tableClassName?: string;
  density?: 'compact' | 'normal' | 'comfortable';
  striped?: boolean;
  bordered?: boolean;
  hoverable?: boolean;
  showFooter?: boolean;
}

const columnTypeIcons = {
  text: FileText,
  number: Hash,
  date: Calendar,
  badge: Zap,
  currency: DollarSign,
  phone: Phone,
  email: Mail,
  boolean: CheckSquare,
  custom: Settings,
};

// Enhanced Table Component
/**
 * EnhancedTable function
 * 
 * @param {Object} params - Function parameters
 * @returns {void} Nothing
 */
export function EnhancedTable<T extends Record<string, any> = any>({
  data,
  columns,
  title,
  description,
  searchable = true,
  sortable = true,
  filterable = true,
  selectable = false,
  editable = false,
  exportable = false,
  actions = [],
  bulkActions = [],
  filters = [],
  pagination,
  loading = false,
  refreshing = false,
  error,
  emptyState,
  onRowClick,
  onRowEdit,
  onRefresh,
  onExport,
  onPaginationChange,
  onSortChange,
  onFilterChange,
  className,
  tableClassName,
  density = 'normal',
  striped = true,
  bordered = false,
  hoverable = true,
  showFooter: _showFooter = false,
}: EnhancedTableProps<T>) {
  // State Management
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
  const [activeFilters, setActiveFilters] = useState<Record<string, any>>({});
  const [showFilters, setShowFilters] = useState(false);
  const [showColumnSettings, setShowColumnSettings] = useState(false);
  const [columnVisibility, setColumnVisibility] = useState<Record<string, boolean>>(
    columns.reduce((acc, col) => ({ ...acc, [col.key as string]: true }), {}),
  );
  const [_columnWidths, _setColumnWidths] = useState<Record<string, number>>({});
  const [editingCell, setEditingCell] = useState<{ rowIndex: number; columnKey: string } | null>(
    null,
  );
  const [editingValue, setEditingValue] = useState<any>('');
  const [bulkActionLoading, setBulkActionLoading] = useState<string | null>(null);

  const tableRef = useRef<HTMLDivElement>(null);

  // Density styles
  const densityClasses = {
    compact: 'py-1 px-2 text-sm',
    normal: 'py-3 px-4',
    comfortable: 'py-4 px-6 text-base',
  };

  // Data Processing
  const processedData = useMemo(() => {
    let filtered = [...data];

    // Search filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      filtered = filtered.filter((row) =>
        columns.some((col) => {
          const value = row[col.key as string];
          if (value == null) return false;
          return String(value).toLowerCase().includes(term);
        }),
      );
    }

    // Advanced filters
    Object.entries(activeFilters).forEach(([key, value]) => {
      if (value != null && value !== '') {
        const column = columns.find((col) => col.key === key);
        if (column) {
          filtered = filtered.filter((row) => {
            const rowValue = row[key];

            switch (column.type) {
              case 'date':
                if (Array.isArray(value)) {
                  const [start, end] = value;
                  const date = new Date(rowValue);
                  return date >= new Date(start) && date <= new Date(end);
                }
                return new Date(rowValue).toDateString() === new Date(value).toDateString();
              case 'number':
              case 'currency':
                if (Array.isArray(value)) {
                  const [min, max] = value;
                  const num = Number(rowValue);
                  return num >= min && num <= max;
                }
                return Number(rowValue) === Number(value);
              case 'boolean':
                return Boolean(rowValue) === Boolean(value);
              case 'badge':
                return Array.isArray(value)
                  ? value.includes(String(rowValue))
                  : String(rowValue).toLowerCase() === String(value).toLowerCase();
              case 'text':
              case 'custom':
              case 'email':
              case 'phone':
              default:
                return String(rowValue).toLowerCase().includes(String(value).toLowerCase());
            }
          });
        }
      }
    });

    // Sorting
    if (sortConfig) {
      filtered.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];

        if (aValue === bValue) return 0;

        const column = columns.find((col) => col.key === sortConfig.key);

        if (column?.type === 'number' || column?.type === 'currency') {
          const comparison = Number(aValue ?? 0) - Number(bValue ?? 0);
          return sortConfig.direction === 'asc' ? comparison : -comparison;
        }

        if (column?.type === 'date') {
          const comparison = new Date(aValue ?? 0).getTime() - new Date(bValue ?? 0).getTime();
          return sortConfig.direction === 'asc' ? comparison : -comparison;
        }

        const comparison = String(aValue ?? '').localeCompare(String(bValue ?? ''), 'tr-TR');
        return sortConfig.direction === 'asc' ? comparison : -comparison;
      });
    }

    return filtered;
  }, [data, searchTerm, activeFilters, sortConfig, columns]);

  // Pagination
  const paginatedData = useMemo(() => {
    if (!pagination) return processedData;

    const start = (pagination.page - 1) * pagination.pageSize;
    const end = start + pagination.pageSize;
    return processedData.slice(start, end);
  }, [processedData, pagination]);

  // Event Handlers
  const handleSort = useCallback(
    (columnKey: string) => {
      if (!sortable) return;

      const newSortConfig: SortConfig | null = (() => {
        if (sortConfig?.key === columnKey) {
          return sortConfig.direction === 'asc' ? { key: columnKey, direction: 'desc' } : null;
        }
        return { key: columnKey, direction: 'asc' };
      })();

      setSortConfig(newSortConfig);
      onSortChange?.(newSortConfig);
    },
    [sortable, sortConfig, onSortChange],
  );

  const handleSelectRow = useCallback((index: number, checked: boolean) => {
    setSelectedRows((prev) => {
      const newSet = new Set(prev);
      if (checked) {
        newSet.add(index);
      } else {
        newSet.delete(index);
      }
      return newSet;
    });
  }, []);

  const handleSelectAll = useCallback(
    (checked: boolean) => {
      if (checked) {
        setSelectedRows(new Set(paginatedData.map((_, index) => index)));
      } else {
        setSelectedRows(new Set());
      }
    },
    [paginatedData],
  );

  const handleBulkAction = useCallback(
    async (action: BulkAction<T>) => {
      try {
        setBulkActionLoading(action.label);
        const selectedData = Array.from(selectedRows).map((index) => paginatedData[index]);
        const selectedIndices = Array.from(selectedRows);

        await action.onClick(selectedData, selectedIndices);
        setSelectedRows(new Set());
      } catch (error) {
        logger.error('Bulk action failed:', error);
      } finally {
        setBulkActionLoading(null);
      }
    },
    [selectedRows, paginatedData],
  );

  const handleCellEdit = useCallback(
    async (rowIndex: number, columnKey: string, value: any) => {
      if (!onRowEdit) return;

      try {
        const row = paginatedData[rowIndex];
        await onRowEdit(row, rowIndex, { [columnKey]: value });
        setEditingCell(null);
      } catch (error) {
        logger.error('Cell edit failed:', error);
      }
    },
    [paginatedData, onRowEdit],
  );

  const startEditing = useCallback((rowIndex: number, columnKey: string, currentValue: any) => {
    setEditingCell({ rowIndex, columnKey });
    setEditingValue(currentValue);
  }, []);

  const cancelEditing = useCallback(() => {
    setEditingCell(null);
    setEditingValue('');
  }, []);

  // Cell Value Formatting
  const formatCellValue = useCallback(
    (column: TableColumn<T>, value: any, row: T, index: number) => {
      if (column.render) {
        return column.render(value, row, index);
      }

      if (column.format) {
        return column.format(value);
      }

      switch (column.type) {
        case 'currency':
          return `₺${Number(value ?? 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}`;
        case 'date':
          return value ? new Date(value).toLocaleDateString('tr-TR') : '-';
        case 'phone':
          return value ? value.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3') : '-';
        case 'email':
          return value ? (
            <a href={`mailto:${value}`} className="text-blue-600 hover:underline">
              {value}
            </a>
          ) : (
            '-'
          );
        case 'boolean':
          return value ? (
            <Badge variant="default" className="text-xs">
              Evet
            </Badge>
          ) : (
            <Badge variant="secondary" className="text-xs">
              Hayır
            </Badge>
          );
        case 'badge':
          const badgeVariant = getBadgeVariant(value);
          return (
            <Badge variant={badgeVariant} className="text-xs">
              {value}
            </Badge>
          );
        case 'number':
        case 'text':
        case 'custom':
        default:
          return value ?? '-';
      }
    },
    [],
  );

  const getBadgeVariant = (value: string): 'default' | 'destructive' | 'outline' | 'secondary' => {
    const lowerValue = String(value).toLowerCase();
    if (
      lowerValue.includes('aktif') ||
      lowerValue.includes('onaylandı') ||
      lowerValue.includes('başarılı')
    )
      return 'default';
    if (lowerValue.includes('bekleyen') || lowerValue.includes('pending')) return 'secondary';
    if (
      lowerValue.includes('reddedildi') ||
      lowerValue.includes('iptal') ||
      lowerValue.includes('hata')
    )
      return 'destructive';
    return 'outline';
  };

  // Export functionality
  const handleExport = useCallback(
    (format: 'csv' | 'xlsx' | 'pdf') => {
      if (onExport) {
        onExport(processedData, format);
      } else {
        // Default CSV export
        if (format === 'csv') {
          const headers = columns
            .filter((col) => columnVisibility[col.key as string])
            .map((col) => col.label);
          const csvContent = [
            headers.join(','),
            ...processedData.map((row) =>
              columns
                .filter((col) => columnVisibility[col.key as string])
                .map((col) => {
                  const value = row[col.key as string];
                  return `"${String(value ?? '').replace(/"/g, '""')}"`;
                })
                .join(','),
            ),
          ].join('\n');

          const blob = new Blob([csvContent], { type: 'text/csv' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${title ?? 'data'}.csv`;
          a.click();
          URL.revokeObjectURL(url);
        }
      }
    },
    [processedData, columns, columnVisibility, title, onExport],
  );

  // Filter change handler
  useEffect(() => {
    onFilterChange?.(activeFilters);
  }, [activeFilters, onFilterChange]);

  // Render cell content with editing support
  const renderCell = useCallback(
    (column: TableColumn<T>, value: any, row: T, rowIndex: number) => {
      const isEditing = editingCell?.rowIndex === rowIndex && editingCell?.columnKey === column.key;

      if (isEditing && column.editable) {
        return (
          <div className="flex items-center gap-1">
            {column.type === 'boolean' ? (
              <Switch checked={editingValue} onCheckedChange={setEditingValue} autoFocus />
            ) : column.type === 'textarea' ? (
              <Textarea
                value={editingValue}
                onChange={(e) => {
                  setEditingValue(e.target.value);
                }}
                className="min-h-[60px]"
                autoFocus
              />
            ) : (
              <Input
                type={column.type === 'number' || column.type === 'currency' ? 'number' : 'text'}
                value={editingValue}
                onChange={(e) => {
                  setEditingValue(e.target.value);
                }}
                className="w-full"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleCellEdit(rowIndex, column.key as string, editingValue);
                  } else if (e.key === 'Escape') {
                    cancelEditing();
                  }
                }}
              />
            )}
            <div className="flex gap-1">
              <Button
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0"
                onClick={() => handleCellEdit(rowIndex, column.key as string, editingValue)}
              >
                <Save className="w-3 h-3" />
              </Button>
              <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={cancelEditing}>
                <X className="w-3 h-3" />
              </Button>
            </div>
          </div>
        );
      }

      return (
        <div
          className={cn(
            'flex items-center gap-2',
            column.editable && editable && 'cursor-pointer hover:bg-gray-50 rounded px-1',
          )}
          onClick={() => {
            if (column.editable && editable) {
              startEditing(rowIndex, column.key as string, value);
            }
          }}
        >
          {formatCellValue(column, value, row, rowIndex)}
          {column.editable && editable && (
            <Edit className="w-3 h-3 text-gray-400 opacity-0 group-hover:opacity-100" />
          )}
        </div>
      );
    },
    [
      editingCell,
      editingValue,
      editable,
      formatCellValue,
      handleCellEdit,
      cancelEditing,
      startEditing,
    ],
  );

  if (loading) {
    return (
      <Card className={cn('w-full shadow-lg border-0 bg-white/80 backdrop-blur-sm', className)}>
        <CardHeader>
          <div className="animate-pulse space-y-3">
            <div className="h-6 bg-gray-200 rounded w-1/4" />
            <div className="h-4 bg-gray-200 rounded w-1/2" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-200 rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={cn('w-full shadow-lg border-0 bg-white/80 backdrop-blur-sm', className)}>
        <CardContent className="p-8 text-center">
          <div className="text-red-500 mb-4">
            <AlertCircle className="w-12 h-12 mx-auto mb-2" />
            <h3 className="text-lg font-medium">Veri Yüklenemiyor</h3>
            <p className="text-sm text-gray-600">{error}</p>
          </div>
          {onRefresh && (
            <Button onClick={onRefresh} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Tekrar Dene
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn('w-full shadow-lg border-0 bg-white/80 backdrop-blur-sm', className)}>
      <CardHeader className="pb-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            {title && (
              <CardTitle className="text-xl font-semibold text-gray-900">{title}</CardTitle>
            )}
            {description && <p className="text-sm text-gray-600 mt-1">{description}</p>}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Density Control */}
            <Select
              value={density}
              onValueChange={(_value: 'compact' | 'normal' | 'comfortable') => {}}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="compact">Sıkışık</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="comfortable">Rahat</SelectItem>
              </SelectContent>
            </Select>

            {/* Column Settings */}
            <Popover open={showColumnSettings} onOpenChange={setShowColumnSettings}>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm">
                  <Columns className="w-4 h-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64">
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Sütun Görünürlüğü</h4>
                  {columns.map((column) => (
                    <div key={column.key as string} className="flex items-center space-x-2">
                      <Checkbox
                        id={column.key as string}
                        checked={columnVisibility[column.key as string]}
                        onCheckedChange={(checked) => {
                          setColumnVisibility((prev) => ({
                            ...prev,
                            [column.key as string]: checked as boolean,
                          }));
                        }}
                      />
                      <Label htmlFor={column.key as string} className="text-sm">
                        {column.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </PopoverContent>
            </Popover>

            {/* Export */}
            {exportable && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem
                    onClick={() => {
                      handleExport('csv');
                    }}
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    CSV olarak İndir
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => {
                      handleExport('xlsx');
                    }}
                  >
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Excel olarak İndir
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* Refresh */}
            {onRefresh && (
              <Button variant="outline" size="sm" onClick={onRefresh} disabled={refreshing}>
                <RefreshCw className={cn('w-4 h-4', refreshing && 'animate-spin')} />
              </Button>
            )}
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col lg:flex-row gap-3 mt-4">
          {searchable && (
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Tabloda ara..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                }}
                className="pl-10"
              />
            </div>
          )}

          {filterable && filters.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setShowFilters(!showFilters);
              }}
              className="gap-2"
            >
              <Filter className="w-4 h-4" />
              Filtreler
              {Object.values(activeFilters).some((v) => v != null && v !== '') && (
                <Badge variant="destructive" className="ml-1 px-1 py-0 text-xs">
                  {Object.values(activeFilters).filter((v) => v != null && v !== '').length}
                </Badge>
              )}
            </Button>
          )}
        </div>

        {/* Filter Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="border-t border-gray-200 pt-4 mt-4"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {filters.map((filter) => (
                  <div key={filter.key}>
                    <Label className="block text-sm font-medium text-gray-700 mb-1">
                      {filter.label}
                    </Label>
                    {filter.type === 'select' ? (
                      <Select
                        value={activeFilters[filter.key] || ''}
                        onValueChange={(value) => {
                          setActiveFilters((prev) => ({ ...prev, [filter.key]: value }));
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={filter.placeholder} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">Tümü</SelectItem>
                          {filter.options?.map((option) => (
                            <SelectItem key={option.value} value={String(option.value)}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input
                        type={
                          filter.type === 'date'
                            ? 'date'
                            : filter.type === 'number'
                              ? 'number'
                              : 'text'
                        }
                        placeholder={filter.placeholder}
                        value={activeFilters[filter.key] || ''}
                        onChange={(e) => {
                          setActiveFilters((prev) => ({ ...prev, [filter.key]: e.target.value }));
                        }}
                      />
                    )}
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-2 mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setActiveFilters({});
                  }}
                >
                  <RotateCcw className="w-4 h-4 mr-1" />
                  Temizle
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setShowFilters(false);
                  }}
                >
                  Kapat
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bulk Actions */}
        {selectable && selectedRows.size > 0 && bulkActions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-4"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-blue-900">
                {selectedRows.size} öğe seçildi
              </span>
              <div className="flex items-center gap-2">
                {bulkActions.map((action, idx) => (
                  <Button
                    key={idx}
                    variant={action.variant ?? 'outline'}
                    size="sm"
                    onClick={() => handleBulkAction(action)}
                    disabled={bulkActionLoading === action.label}
                    className="gap-2"
                  >
                    {bulkActionLoading === action.label ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      action.icon
                    )}
                    {action.label}
                  </Button>
                ))}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedRows(new Set());
                  }}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </CardHeader>

      <CardContent className="px-0 pb-0">
        {processedData.length === 0 ? (
          <div className="text-center py-12">
            <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              {emptyState?.icon || <Search className="w-8 h-8 text-gray-400" />}
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {emptyState?.title ?? 'Veri bulunamadı'}
            </h3>
            <p className="text-gray-600 mb-4">
              {emptyState?.description ?? 'Aradığınız kriterlere uygun veri bulunamadı.'}
            </p>
            {emptyState?.action && (
              <Button onClick={emptyState.action.onClick} className="gap-2">
                <Plus className="w-4 h-4" />
                {emptyState.action.label}
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {/* Table */}
            <div className="overflow-x-auto" ref={tableRef}>
              <Table
                className={cn(
                  'min-w-full',
                  striped && 'table-striped',
                  bordered && 'border',
                  tableClassName,
                )}
              >
                <TableHeader>
                  <TableRow className="bg-gray-50 hover:bg-gray-50">
                    {selectable && (
                      <TableHead className={cn('w-12', densityClasses[density])}>
                        <Checkbox
                          checked={
                            paginatedData.length > 0 && selectedRows.size === paginatedData.length
                          }
                          onCheckedChange={handleSelectAll}
                        />
                      </TableHead>
                    )}
                    {columns
                      .filter((col) => columnVisibility[col.key as string])
                      .map((column) => {
                        const Icon = columnTypeIcons[column.type ?? 'text'];
                        const isSorted = sortConfig?.key === column.key;

                        return (
                          <TableHead
                            key={column.key as string}
                            className={cn(
                              densityClasses[density],
                              'font-medium text-gray-700 uppercase tracking-wider text-xs',
                              column.sortable &&
                                sortable &&
                                'cursor-pointer hover:bg-gray-100 select-none',
                              column.align === 'center' && 'text-center',
                              column.align === 'right' && 'text-right',
                              column.headerClassName,
                            )}
                            style={{
                              width: column.width,
                              minWidth: column.minWidth,
                              maxWidth: column.maxWidth,
                            }}
                            onClick={() => column.sortable && handleSort(column.key as string)}
                          >
                            <div className="flex items-center gap-2">
                              <Icon className="w-4 h-4" />
                              <span>{column.label}</span>
                              {column.sortable && sortable && (
                                <div className="flex flex-col">
                                  {isSorted ? (
                                    sortConfig?.direction === 'asc' ? (
                                      <SortAsc className="w-3 h-3" />
                                    ) : (
                                      <SortDesc className="w-3 h-3" />
                                    )
                                  ) : (
                                    <ArrowUpDown className="w-3 h-3 text-gray-400" />
                                  )}
                                </div>
                              )}
                            </div>
                          </TableHead>
                        );
                      })}
                    {actions.length > 0 && (
                      <TableHead className={cn('w-16 text-right', densityClasses[density])}>
                        <span className="sr-only">İşlemler</span>
                      </TableHead>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <AnimatePresence>
                    {paginatedData.map((row, index) => (
                      <motion.tr
                        key={row.id ?? index}
                        component={TableRow}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ delay: index * 0.02 }}
                        className={cn(
                          'group transition-colors',
                          hoverable && 'hover:bg-gray-50',
                          onRowClick && 'cursor-pointer',
                          selectedRows.has(index) && 'bg-blue-50',
                        )}
                        onClick={() => onRowClick?.(row, index)}
                      >
                        {selectable && (
                          <TableCell className={densityClasses[density]}>
                            <Checkbox
                              checked={selectedRows.has(index)}
                              onCheckedChange={(checked) => {
                                handleSelectRow(index, checked as boolean);
                              }}
                              onClick={(e) => {
                                e.stopPropagation();
                              }}
                            />
                          </TableCell>
                        )}
                        {columns
                          .filter((col) => columnVisibility[col.key as string])
                          .map((column) => (
                            <TableCell
                              key={column.key as string}
                              className={cn(
                                densityClasses[density],
                                'text-gray-900',
                                column.align === 'center' && 'text-center',
                                column.align === 'right' && 'text-right',
                                column.className,
                              )}
                            >
                              {renderCell(column, row[column.key as string], row, index)}
                            </TableCell>
                          ))}
                        {actions.length > 0 && (
                          <TableCell className={cn('text-right', densityClasses[density])}>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                  }}
                                >
                                  <MoreVertical className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                {actions.map((action, idx) => (
                                  <DropdownMenuItem
                                    key={idx}
                                    onClick={() => action.onClick(row, index)}
                                    className="flex items-center gap-2"
                                    disabled={action.condition && !action.condition(row)}
                                  >
                                    {action.icon}
                                    {action.label}
                                  </DropdownMenuItem>
                                ))}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        )}
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {pagination && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span>
                    Toplam {pagination.total} kayıttan{' '}
                    {(pagination.page - 1) * pagination.pageSize + 1}-
                    {Math.min(pagination.page * pagination.pageSize, pagination.total)} arası
                    gösteriliyor
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {pagination.showSizeChanger && (
                    <Select
                      value={String(pagination.pageSize)}
                      onValueChange={(value) => onPaginationChange?.(1, Number(value))}
                    >
                      <SelectTrigger className="w-20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {(pagination.pageSizeOptions || [10, 25, 50, 100]).map((size) => (
                          <SelectItem key={size} value={String(size)}>
                            {size}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}

                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onPaginationChange?.(1, pagination.pageSize)}
                      disabled={pagination.page === 1}
                    >
                      <ChevronsLeft className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onPaginationChange?.(pagination.page - 1, pagination.pageSize)}
                      disabled={pagination.page === 1}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <span className="px-3 py-1 text-sm">
                      {pagination.page} / {Math.ceil(pagination.total / pagination.pageSize)}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onPaginationChange?.(pagination.page + 1, pagination.pageSize)}
                      disabled={
                        pagination.page >= Math.ceil(pagination.total / pagination.pageSize)
                      }
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        onPaginationChange?.(
                          Math.ceil(pagination.total / pagination.pageSize),
                          pagination.pageSize,
                        )
                      }
                      disabled={
                        pagination.page >= Math.ceil(pagination.total / pagination.pageSize)
                      }
                    >
                      <ChevronsRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Export component with unique name to avoid conflicts
export { EnhancedTable as EnhancedDataTable };
