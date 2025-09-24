import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './table';

interface DesktopTableProps<T> {
  data: T[];
  columns: {
    key: string;
    label: string;
    render?: (item: T) => React.ReactNode;
    className?: string;
  }[];
  onRowClick?: (item: T) => void;
  emptyState?: {
    icon?: React.ReactNode;
    title: string;
    description?: string;
    action?: React.ReactNode;
  };
  className?: string;
}

export function DesktopTable<T extends { id: string | number }>({
  data,
  columns,
  onRowClick,
  emptyState,
  className,
}: DesktopTableProps<T>) {
  if (data.length === 0 && emptyState) {
    return (
      <div className="p-8 text-center">
        {emptyState.icon && <div className="flex justify-center mb-4">{emptyState.icon}</div>}
        <h3 className="text-lg font-medium text-gray-900 mb-2">{emptyState.title}</h3>
        {emptyState.description && <p className="text-gray-500 mb-4">{emptyState.description}</p>}
        {emptyState.action}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table className={className}>
        <TableHeader>
          <TableRow className="bg-gray-50/50">
            {columns.map((column) => (
              <TableHead key={column.key} className={`p-4 ${column.className || ''}`}>
                {column.label}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item) => (
            <TableRow
              key={item.id}
              className="hover:bg-gray-50/50 transition-colors cursor-pointer"
              onClick={() => onRowClick?.(item)}
            >
              {columns.map((column) => (
                <TableCell key={column.key} className={`p-4 ${column.className || ''}`}>
                  {column.render ? column.render(item) : (item as any)[column.key]}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

// Desktop-optimized filter components
import { Card, CardContent } from './card';
import { Input } from './input';
import { Search } from 'lucide-react';

interface DesktopFiltersProps {
  children: React.ReactNode;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  className?: string;
}

export function DesktopFilters({
  children,
  searchValue,
  onSearchChange,
  searchPlaceholder = 'Ara...',
  className,
}: DesktopFiltersProps) {
  return (
    <Card className={`border-0 shadow-sm ${className || ''}`}>
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Search Input */}
          {onSearchChange && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="search"
                placeholder={searchPlaceholder}
                value={searchValue || ''}
                onChange={(e) => {
                  onSearchChange(e.target.value);
                }}
                className="w-full pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          )}

          {/* Filter Controls */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">{children}</div>
        </div>
      </CardContent>
    </Card>
  );
}

// Desktop-optimized action buttons
import { Button } from './button';

interface DesktopActionButtonsProps {
  primaryAction?: {
    label: string;
    icon?: React.ReactNode;
    onClick: () => void;
    loading?: boolean;
  };
  secondaryActions?: {
    label: string;
    icon?: React.ReactNode;
    onClick: () => void;
    variant?: 'outline' | 'ghost';
  }[];
  className?: string;
}

export function DesktopActionButtons({
  primaryAction,
  secondaryActions,
  className,
}: DesktopActionButtonsProps) {
  return (
    <div className={`flex gap-3 items-center justify-end ${className || ''}`}>
      {/* Secondary Actions */}
      {secondaryActions?.map((action, index) => (
        <Button
          key={index}
          variant={action.variant || 'outline'}
          size="default"
          className="px-4 py-2 border-gray-300 hover:border-gray-400"
          onClick={action.onClick}
        >
          {action.icon && <span className="mr-2">{action.icon}</span>}
          {action.label}
        </Button>
      ))}

      {/* Primary Action */}
      {primaryAction && (
        <Button
          size="default"
          className="px-6 py-2 shadow-lg font-medium focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-offset-2 transition-all duration-200"
          style={{
            backgroundColor: '#1e3a8a',
            color: '#ffffff',
            border: 'none',
            boxShadow: '0 4px 12px rgba(30, 58, 138, 0.4)',
          }}
          onClick={primaryAction.onClick}
          disabled={primaryAction.loading}
        >
          {primaryAction.loading ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
          ) : (
            primaryAction.icon && <span className="mr-2">{primaryAction.icon}</span>
          )}
          {primaryAction.label}
        </Button>
      )}
    </div>
  );
}

// Desktop-optimized stats cards
interface DesktopStatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'gray';
  trend?: {
    value: string;
    positive?: boolean;
  };
}

export function DesktopStatsCard({
  title,
  value,
  subtitle,
  icon,
  color = 'blue',
  trend,
}: DesktopStatsCardProps) {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    yellow: 'bg-yellow-100 text-yellow-600',
    red: 'bg-red-100 text-red-600',
    purple: 'bg-purple-100 text-purple-600',
    gray: 'bg-gray-100 text-gray-600',
  };

  return (
    <Card className="border-0 shadow-md hover:shadow-lg transition-all duration-300">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-3">
          <div className="text-3xl font-bold text-gray-900">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </div>
          {icon && (
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center ${colorClasses[color]}`}
            >
              {icon}
            </div>
          )}
        </div>
        <p className="font-medium text-gray-600">{title}</p>
        <div className="flex items-center justify-between mt-2">
          {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
          {trend && (
            <p
              className={`text-sm font-medium ${trend.positive ? 'text-green-600' : 'text-red-600'}`}
            >
              {trend.positive ? '+' : ''}
              {trend.value}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
