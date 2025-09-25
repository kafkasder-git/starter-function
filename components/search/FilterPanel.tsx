import { useState } from 'react';
import { motion } from 'motion/react';
import {
  Filter,
  X,
  ChevronDown,
  RefreshCw,
} from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Switch } from '../ui/switch';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '../ui/sheet';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../ui/collapsible';
import { useSearchContext } from './SearchProvider';
import { useIsMobile } from '../../hooks/useTouchDevice';
import { cn } from '../ui/utils';
import type { FilterConfig, FilterValue } from '../../types/search';
import { DATE_RANGE_PRESETS } from '../../types/search';

interface FilterPanelProps {
  filters: FilterConfig[];
  className?: string;
  variant?: 'inline' | 'sidebar' | 'modal';
  showActiveCount?: boolean;
  collapsible?: boolean;
  title?: string;
}

export function FilterPanel({
  filters,
  className,
  variant = 'inline',
  showActiveCount = true,
  collapsible = false,
  title = 'Filtreler',
}: FilterPanelProps) {
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(!collapsible);
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set());

  const { searchState, addFilter, removeFilter, clearFilters, hasActiveFilters } =
    useSearchContext();

  const activeFilterCount = searchState.filters.length;

  // Get current filter value for a field
  const getFilterValue = (field: string): any => {
    const filter = searchState.filters.find((f) => f.field === field);
    return filter?.value;
  };

  // Handle filter change
  const handleFilterChange = (
    field: string,
    value: any,
    operator: FilterValue['operator'] = 'eq',
  ) => {
    if (value === undefined || value === null || value === '') {
      removeFilter(field);
    } else {
      addFilter({ field, value, operator });
    }
  };

  // Toggle section collapse
  const toggleSection = (sectionId: string) => {
    setCollapsedSections((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
  };

  // Render filter control based on type
  const renderFilterControl = (filter: FilterConfig) => {
    const currentValue = getFilterValue(filter.field);

    switch (filter.type) {
      case 'text':
        return (
          <div className="space-y-2">
            <Label htmlFor={filter.field} className="text-sm font-medium">
              {filter.label}
            </Label>
            <Input
              id={filter.field}
              value={currentValue || ''}
              onChange={(e) => {
                handleFilterChange(filter.field, e.target.value, 'contains');
              }}
              placeholder={filter.placeholder}
              className="h-9"
            />
          </div>
        );

      case 'select':
        return (
          <div className="space-y-2">
            <Label className="text-sm font-medium">{filter.label}</Label>
            <Select
              value={currentValue || ''}
              onValueChange={(value) => {
                handleFilterChange(filter.field, value);
              }}
            >
              <SelectTrigger className="h-9">
                <SelectValue placeholder={filter.placeholder || 'Seçin'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Tümü</SelectItem>
                {filter.options?.map((option) => (
                  <SelectItem key={String(option.value)} value={String(option.value)}>
                    <div className="flex items-center gap-2">
                      {option.color && (
                        <div className={`w-2 h-2 rounded-full bg-${option.color}-500`} />
                      )}
                      <span>{option.label}</span>
                      {option.count !== undefined && (
                        <Badge variant="secondary" className="text-xs ml-auto">
                          {option.count}
                        </Badge>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );

      case 'number':
        return (
          <div className="space-y-2">
            <Label className="text-sm font-medium">{filter.label}</Label>
            <div className="grid grid-cols-2 gap-2">
              <Input
                type="number"
                placeholder="Min"
                min={filter.min}
                max={filter.max}
                className="h-9"
                onChange={(e) => {
                  const {value} = e.target;
                  const maxValue = getFilterValue(filter.field)?.[1];
                  handleFilterChange(
                    filter.field,
                    [value ? Number(value) : undefined, maxValue],
                    'between',
                  );
                }}
              />
              <Input
                type="number"
                placeholder="Max"
                min={filter.min}
                max={filter.max}
                className="h-9"
                onChange={(e) => {
                  const {value} = e.target;
                  const minValue = getFilterValue(filter.field)?.[0];
                  handleFilterChange(
                    filter.field,
                    [minValue, value ? Number(value) : undefined],
                    'between',
                  );
                }}
              />
            </div>
          </div>
        );

      case 'date':
        return (
          <div className="space-y-2">
            <Label className="text-sm font-medium">{filter.label}</Label>
            <div className="space-y-2">
              <Select
                onValueChange={(preset) => {
                  if (preset === 'custom') return;
                  // Handle date preset logic here
                  const today = new Date();
                  let startDate: Date;
                  let endDate = today;

                  switch (preset) {
                    case 'today':
                      startDate = today;
                      break;
                    case 'yesterday':
                      startDate = new Date(today.getTime() - 24 * 60 * 60 * 1000);
                      endDate = startDate;
                      break;
                    case 'this_week':
                      startDate = new Date(today.getTime() - today.getDay() * 24 * 60 * 60 * 1000);
                      break;
                    case 'last_week':
                      const lastWeekStart = new Date(
                        today.getTime() - (today.getDay() + 7) * 24 * 60 * 60 * 1000,
                      );
                      startDate = lastWeekStart;
                      endDate = new Date(lastWeekStart.getTime() + 6 * 24 * 60 * 60 * 1000);
                      break;
                    case 'this_month':
                      startDate = new Date(today.getFullYear(), today.getMonth(), 1);
                      break;
                    case 'last_month':
                      startDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
                      endDate = new Date(today.getFullYear(), today.getMonth(), 0);
                      break;
                    case 'this_year':
                      startDate = new Date(today.getFullYear(), 0, 1);
                      break;
                    case 'last_7_days':
                      startDate = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
                      break;
                    case 'last_30_days':
                      startDate = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
                      break;
                    case 'last_90_days':
                      startDate = new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000);
                      break;
                    default:
                      return;
                  }

                  handleFilterChange(filter.field, [startDate, endDate], 'between');
                }}
              >
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Tarih aralığı seçin" />
                </SelectTrigger>
                <SelectContent>
                  {DATE_RANGE_PRESETS.map((preset) => (
                    <SelectItem key={preset.value} value={preset.value}>
                      {preset.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 'boolean':
        return (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">{filter.label}</Label>
              <Switch
                checked={currentValue === true}
                onCheckedChange={(checked) => {
                  handleFilterChange(filter.field, checked ? true : undefined);
                }}
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // Render active filters
  const renderActiveFilters = () => {
    if (!hasActiveFilters) return null;

    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium text-gray-700">Aktif Filtreler</Label>
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="h-6 px-2 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <RefreshCw className="w-3 h-3 mr-1" />
            Temizle
          </Button>
        </div>
        <div className="flex flex-wrap gap-1">
          {searchState.filters.map((filter, index) => {
            const config = filters.find((f) => f.field === filter.field);
            const label = config?.label || filter.field;

            return (
              <Badge
                key={`${filter.field}-${index}`}
                variant="secondary"
                className="text-xs bg-primary/10 text-primary hover:bg-primary/20"
              >
                <span className="truncate max-w-24">
                  {label}: {String(filter.value)}
                </span>
                <button
                  onClick={() => {
                    removeFilter(filter.field);
                  }}
                  className="ml-1 hover:bg-primary/20 rounded-full p-0.5"
                >
                  <X className="w-2 h-2" />
                </button>
              </Badge>
            );
          })}
        </div>
      </div>
    );
  };

  // Filter content
  const filterContent = (
    <div className="space-y-4">
      {renderActiveFilters()}

      <div className="space-y-4">
        {filters.map((filter) => (
          <motion.div
            key={filter.field}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="border-b border-gray-100 pb-4 last:border-b-0 last:pb-0"
          >
            {renderFilterControl(filter)}
          </motion.div>
        ))}
      </div>
    </div>
  );

  // Mobile modal variant
  if (variant === 'modal' || isMobile) {
    return (
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <Filter className="w-4 h-4" />
            <span className="hidden sm:inline">Filtreler</span>
            {showActiveCount && activeFilterCount > 0 && (
              <Badge variant="secondary" className="text-xs">
                {activeFilterCount}
              </Badge>
            )}
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-80 sm:w-96">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              {title}
            </SheetTitle>
            <SheetDescription>
              Arama sonuçlarını filtrelemek için aşağıdaki seçenekleri kullanın.
            </SheetDescription>
          </SheetHeader>
          <div className="mt-6">{filterContent}</div>
        </SheetContent>
      </Sheet>
    );
  }

  // Inline variant
  return (
    <div className={cn('bg-white rounded-lg border border-gray-200', className)}>
      {collapsible ? (
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full justify-between p-4 h-auto">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4" />
                <span className="font-medium">{title}</span>
                {showActiveCount && activeFilterCount > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    {activeFilterCount}
                  </Badge>
                )}
              </div>
              <ChevronDown className={cn('w-4 h-4 transition-transform', isOpen && 'rotate-180')} />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="px-4 pb-4">{filterContent}</CollapsibleContent>
        </Collapsible>
      ) : (
        <div className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-4 h-4" />
            <span className="font-medium">{title}</span>
            {showActiveCount && activeFilterCount > 0 && (
              <Badge variant="secondary" className="text-xs">
                {activeFilterCount}
              </Badge>
            )}
          </div>
          {filterContent}
        </div>
      )}
    </div>
  );
}
