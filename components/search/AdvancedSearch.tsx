import {
  Download,
  Filter,
  Grid,
  List,
  RefreshCw,
  Search,
  SortAsc,
  SortDesc,
  X,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import React, { useEffect, useMemo, useState } from 'react';
import { useAdvancedMobile } from '../../hooks/useAdvancedMobile';
import { useDebounce } from '../../hooks/useDebounce';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

export interface SearchFilter {
  key: string;
  label: string;
  type: 'text' | 'select' | 'date' | 'dateRange' | 'multiSelect' | 'number';
  options?: { value: string; label: string }[];
  placeholder?: string;
}

export interface SortOption {
  key: string;
  label: string;
  direction?: 'asc' | 'desc';
}

interface AdvancedSearchProps {
  placeholder?: string;
  filters?: SearchFilter[];
  sortOptions?: SortOption[];
  onSearch: (
    query: string,
    filters: Record<string, string | number | boolean>,
    sort?: SortOption,
  ) => void;
  onExport?: () => void;
  onRefresh?: () => void;
  loading?: boolean;
  resultCount?: number;
  showViewToggle?: boolean;
  viewMode?: 'grid' | 'list';
  onViewModeChange?: (mode: 'grid' | 'list') => void;
  className?: string;
}

export function AdvancedSearch({
  placeholder = 'Ara...',
  filters = [],
  sortOptions = [],
  onSearch,
  onExport,
  onRefresh,
  loading = false,
  resultCount,
  showViewToggle = true,
  viewMode = 'list',
  onViewModeChange,
  className = '',
}: AdvancedSearchProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState<Record<string, string | number | boolean>>({});
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption | null>(null);

  const { deviceInfo, triggerHapticFeedback } = useAdvancedMobile();
  const debouncedQuery = useDebounce(searchQuery, 300);

  // Trigger search when query or filters change
  useEffect(() => {
    onSearch(debouncedQuery, activeFilters, sortBy || undefined);
  }, [debouncedQuery, activeFilters, sortBy, onSearch]);

  // Get active filter count
  const activeFilterCount = useMemo(() => {
    return Object.values(activeFilters).filter(
      (value) =>
        value !== '' &&
        value !== null &&
        value !== undefined &&
        (Array.isArray(value) ? value.length > 0 : true),
    ).length;
  }, [activeFilters]);

  const handleFilterChange = (filterKey: string, value: any) => {
    setActiveFilters((prev) => ({
      ...prev,
      [filterKey]: value,
    }));

    if (deviceInfo.isMobile) {
      triggerHapticFeedback('light');
    }
  };

  const clearFilter = (filterKey: string) => {
    setActiveFilters((prev) => {
      const newFilters = { ...prev };
      delete newFilters[filterKey];
      return newFilters;
    });

    if (deviceInfo.isMobile) {
      triggerHapticFeedback('light');
    }
  };

  const clearAllFilters = () => {
    setActiveFilters({});
    setSearchQuery('');
    setSortBy(null);

    if (deviceInfo.isMobile) {
      triggerHapticFeedback('medium');
    }
  };

  const renderFilter = (filter: SearchFilter) => {
    const value = activeFilters[filter.key];

    switch (filter.type) {
      case 'select':
        return (
          <Select
            value={value || ''}
            onValueChange={(newValue) => {
              handleFilterChange(filter.key, newValue);
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder={filter.placeholder || `${filter.label} seçin`} />
            </SelectTrigger>
            <SelectContent>
              {filter.options?.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case 'multiSelect':
        return (
          <div className="space-y-2">
            <div className="text-sm font-medium text-gray-700">{filter.label}</div>
            <div className="grid grid-cols-2 gap-2">
              {filter.options?.map((option) => {
                const isSelected = Array.isArray(value) && value.includes(option.value);
                return (
                  <Button
                    key={option.value}
                    variant={isSelected ? 'default' : 'outline'}
                    size="sm"
                    className="justify-start text-left h-auto py-2 px-3"
                    onClick={() => {
                      const currentValues = Array.isArray(value) ? value : [];
                      const newValues = isSelected
                        ? currentValues.filter((v) => v !== option.value)
                        : [...currentValues, option.value];
                      handleFilterChange(filter.key, newValues);
                    }}
                  >
                    <div className="truncate">{option.label}</div>
                  </Button>
                );
              })}
            </div>
          </div>
        );

      case 'date':
        return (
          <Input
            type="date"
            value={value || ''}
            onChange={(e) => {
              handleFilterChange(filter.key, e.target.value);
            }}
            placeholder={filter.placeholder}
            className="w-full"
          />
        );

      case 'dateRange':
        return (
          <div className="space-y-2">
            <div className="text-sm font-medium text-gray-700">{filter.label}</div>
            <div className="grid grid-cols-2 gap-2">
              <Input
                type="date"
                value={value?.from || ''}
                onChange={(e) => {
                  handleFilterChange(filter.key, { ...value, from: e.target.value });
                }}
                placeholder="Başlangıç"
              />
              <Input
                type="date"
                value={value?.to || ''}
                onChange={(e) => {
                  handleFilterChange(filter.key, { ...value, to: e.target.value });
                }}
                placeholder="Bitiş"
              />
            </div>
          </div>
        );

      case 'number':
        return (
          <Input
            type="number"
            value={value || ''}
            onChange={(e) => {
              handleFilterChange(filter.key, e.target.value);
            }}
            placeholder={filter.placeholder}
            className="w-full"
          />
        );

      default: // text
        return (
          <Input
            type="text"
            value={value || ''}
            onChange={(e) => {
              handleFilterChange(filter.key, e.target.value);
            }}
            placeholder={filter.placeholder || `${filter.label} girin`}
            className="w-full"
          />
        );
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Main Search Bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            type="text"
            placeholder={placeholder}
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
            }}
            className="pl-10 pr-4 h-11 text-base border-gray-300 focus:border-blue-500 focus:ring-blue-500/20"
          />
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery('');
              }}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filter Toggle */}
        {filters.length > 0 && (
          <Popover open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={`h-11 px-3 border-gray-300 ${
                  activeFilterCount > 0 ? 'bg-blue-50 border-blue-300' : ''
                }`}
              >
                <Filter className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Filtrele</span>
                {activeFilterCount > 0 && (
                  <Badge variant="secondary" className="ml-2 px-1.5 py-0.5 text-xs">
                    {activeFilterCount}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="end">
              <div className="p-4 border-b">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-gray-900">Filtreler</h4>
                  {activeFilterCount > 0 && (
                    <Button variant="ghost" size="sm" onClick={clearAllFilters} className="text-xs">
                      Temizle
                    </Button>
                  )}
                </div>
              </div>
              <div className="p-4 max-h-96 overflow-y-auto space-y-4">
                {filters.map((filter) => (
                  <div key={filter.key} className="space-y-2">
                    {filter.type !== 'multiSelect' && (
                      <label className="text-sm font-medium text-gray-700">{filter.label}</label>
                    )}
                    {renderFilter(filter)}
                  </div>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        )}

        {/* Sort Options */}
        {sortOptions.length > 0 && (
          <Select
            value={sortBy ? `${sortBy.key}-${sortBy.direction}` : ''}
            onValueChange={(value) => {
              if (!value) {
                setSortBy(null);
                return;
              }
              const [key, direction] = value.split('-');
              const option = sortOptions.find((opt) => opt.key === key);
              if (option) {
                setSortBy({ ...option, direction: direction as 'asc' | 'desc' });
              }
            }}
          >
            <SelectTrigger className="w-32 sm:w-40 h-11">
              <SelectValue placeholder="Sırala" />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map((option) => (
                <React.Fragment key={option.key}>
                  <SelectItem value={`${option.key}-asc`}>
                    <span className="flex items-center gap-2">
                      <SortAsc className="w-3 h-3" />
                      {option.label} ↑
                    </span>
                  </SelectItem>
                  <SelectItem value={`${option.key}-desc`}>
                    <span className="flex items-center gap-2">
                      <SortDesc className="w-3 h-3" />
                      {option.label} ↓
                    </span>
                  </SelectItem>
                </React.Fragment>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Active Filters & Results Bar */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          <AnimatePresence>
            {Object.entries(activeFilters).map(([key, value]) => {
              if (!value || (Array.isArray(value) && value.length === 0)) return null;

              const filter = filters.find((f) => f.key === key);
              if (!filter) return null;

              let displayValue = value;
              if (Array.isArray(value)) {
                displayValue = value.length > 1 ? `${value.length} seçili` : value[0];
              } else if (typeof value === 'object' && value.from && value.to) {
                displayValue = `${value.from} - ${value.to}`;
              }

              return (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.2 }}
                >
                  <Badge variant="secondary" className="gap-1 py-1 px-2">
                    <span className="text-xs">
                      {filter.label}: {displayValue}
                    </span>
                    <button
                      onClick={() => {
                        clearFilter(key);
                      }}
                      className="ml-1 hover:bg-gray-300 rounded-full p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {sortBy && (
            <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}>
              <Badge variant="outline" className="gap-1 py-1 px-2">
                <span className="text-xs">
                  {sortBy.label} {sortBy.direction === 'asc' ? '↑' : '↓'}
                </span>
                <button
                  onClick={() => {
                    setSortBy(null);
                  }}
                  className="ml-1 hover:bg-gray-200 rounded-full p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            </motion.div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Result Count */}
          {typeof resultCount === 'number' && (
            <span className="text-sm text-gray-600">{resultCount} sonuç</span>
          )}

          {/* Action Buttons */}
          <div className="flex items-center gap-1">
            {onRefresh && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onRefresh}
                disabled={loading}
                className="h-8 w-8 p-0"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </Button>
            )}

            {onExport && (
              <Button variant="ghost" size="sm" onClick={onExport} className="h-8 w-8 p-0">
                <Download className="w-4 h-4" />
              </Button>
            )}

            {/* View Toggle */}
            {showViewToggle && onViewModeChange && (
              <div className="flex border rounded-md">
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => {
                    onViewModeChange('list');
                  }}
                  className="h-8 w-8 p-0 rounded-r-none"
                >
                  <List className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => {
                    onViewModeChange('grid');
                  }}
                  className="h-8 w-8 p-0 rounded-l-none"
                >
                  <Grid className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdvancedSearch;
