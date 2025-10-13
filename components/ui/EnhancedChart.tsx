/**
 * @fileoverview EnhancedChart Module - Application module
 *
 * @author Dernek Yönetim Sistemi Team
 * @version 1.0.0
 */

import { BarChart3, AlertCircle } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Skeleton } from './skeleton';
import { Badge } from './badge';
import { Button } from './button';
import { useAdvancedMobile } from '../../hooks/useAdvancedMobile';

interface ChartData {
  name: string;
  value: number;
  color?: string;
}

interface EnhancedChartProps {
  data: ChartData[];
  title: string;
  description?: string;
  loading?: boolean;
  error?: string;
  type?: 'bar' | 'line' | 'pie' | 'area';
  height?: string;
  ariaLabel?: string;
  className?: string;
  onDataPointClick?: (data: ChartData) => void;
  emptyState?: React.ReactNode;
}

export function EnhancedChart({
  data,
  title,
  description,
  loading = false,
  error,
  type = 'bar',
  height = '300px',
  ariaLabel,
  className = '',
  onDataPointClick,
  emptyState
}: EnhancedChartProps) {
  const { isMobile } = useAdvancedMobile();
  const [selectedDataPoint, setSelectedDataPoint] = useState<ChartData | null>(null);

  const fallbackColors = useMemo(
    () => [
      'hsl(var(--primary-500))',
      'hsl(var(--info-500))',
      'hsl(var(--success-500))',
      'hsl(var(--warning-500))',
      'hsl(var(--neutral-500))',
    ],
    [],
  );

  const resolveColor = (input: string | undefined, index: number) => {
    if (!input || input.trim().length === 0) {
      return fallbackColors[index % fallbackColors.length]!;
    }

    const value = input.trim();
    if (value.startsWith('#') || value.startsWith('rgb') || value.startsWith('hsl(')) {
      return value;
    }

    if (value.startsWith('--')) {
      return `hsl(var(${value}))`;
    }

    const [token, shade = '500'] = value.split('-');
    const semanticTokens = new Set(['primary', 'success', 'info', 'warning', 'error', 'neutral']);
    if (semanticTokens.has(token)) {
      return `hsl(var(--${token}-${shade}))`;
    }

    return fallbackColors[index % fallbackColors.length]!;
  };

  // Loading skeleton
  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            {title}
          </CardTitle>
          {description && (
            <p className="text-sm text-neutral-600 dark:text-neutral-400">{description}</p>
          )}
        </CardHeader>
        <CardContent>
          <div style={{ height }} className="relative">
            <Skeleton className="w-full h-full rounded" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-neutral-600 dark:text-neutral-300">
                <BarChart3 className="mx-auto mb-2 h-8 w-8 text-neutral-400" />
                <p className="text-sm">Grafik yükleniyor...</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (error) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-error-500" />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div style={{ height }} className="flex items-center justify-center">
            <div className="text-center">
              <AlertCircle className="mx-auto mb-4 h-12 w-12 text-error-400" />
              <p className="mb-4 text-error-600 dark:text-error-400">{error}</p>
              <Button variant="outline" size="sm">
                Tekrar Dene
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Empty state
  if (!data || data.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            {title}
          </CardTitle>
          {description && (
            <p className="text-sm text-neutral-600 dark:text-neutral-400">{description}</p>
          )}
        </CardHeader>
        <CardContent>
          <div style={{ height }} className="flex items-center justify-center">
            {emptyState || (
              <div className="text-center text-neutral-600 dark:text-neutral-400">
                <BarChart3 className="mx-auto mb-4 h-12 w-12 text-neutral-400" />
                <p className="mb-4">Grafik verisi bulunamadı</p>
                <Button variant="outline" size="sm">
                  Veri Ekle
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calculate responsive height
  const responsiveHeight = isMobile ? '250px' : height;
  const maxValue = Math.max(...data.map(d => d.value));
  const totalValue = data.reduce((sum, d) => sum + d.value, 0);

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          {title}
        </CardTitle>
        {description && (
          <p className="text-sm text-neutral-600 dark:text-neutral-400">{description}</p>
        )}
      </CardHeader>
      <CardContent>
        <div 
          style={{ height: responsiveHeight }} 
          className="relative"
          role="img"
          aria-label={ariaLabel || `${title} grafiği`}
        >
          {/* Simple Bar Chart Implementation */}
          <div className="h-full flex items-end justify-between gap-1 p-4">
            {data.map((item, index) => {
              const percentage = (item.value / maxValue) * 100;
              const isSelected = selectedDataPoint?.name === item.name;
              
              return (
                <div
                  key={index}
                  className="flex-1 flex flex-col items-center group cursor-pointer"
                  onClick={() => {
                    setSelectedDataPoint(isSelected ? null : item);
                    onDataPointClick?.(item);
                  }}
                  role="button"
                  tabIndex={0}
                  aria-label={`${item.name}: ${item.value}`}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      setSelectedDataPoint(isSelected ? null : item);
                      onDataPointClick?.(item);
                    }
                  }}
                >
                  {/* Bar */}
                  <div
                    className={`w-full rounded-t transition-all duration-200 ${
                      isSelected ? 'ring-2 ring-primary-500' : ''
                    } group-hover:opacity-80`}
                    style={{
                      height: `${Math.max(percentage, 5)}%`,
                      backgroundColor: resolveColor(item.color, index),
                    }}
                  />
                  
                  {/* Value */}
                  <div className="mt-1 text-center text-xs text-neutral-600 dark:text-neutral-300">
                    {item.value}
                  </div>
                  
                  {/* Label */}
                  <div className="mt-1 w-full truncate text-center text-xs text-neutral-500 dark:text-neutral-400">
                    {item.name}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Selected data point info */}
          {selectedDataPoint && (
            <div className="absolute right-4 top-4 rounded-lg border border-neutral-200 bg-white p-3 shadow-lg dark:border-neutral-700 dark:bg-neutral-900">
              <div className="flex items-center gap-2 mb-2">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: resolveColor(selectedDataPoint.color, data.indexOf(selectedDataPoint)) }}
                />
                <span className="font-medium text-neutral-900 dark:text-neutral-100">{selectedDataPoint.name}</span>
              </div>
              <div className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">
                {selectedDataPoint.value}
              </div>
              <div className="text-sm text-neutral-500 dark:text-neutral-300">
                {((selectedDataPoint.value / totalValue) * 100).toFixed(1)}%
              </div>
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="mt-4 flex flex-wrap gap-2">
          {data.map((item, index) => (
            <Badge
              key={index}
              variant="outline"
              className="flex items-center gap-1 text-neutral-700 dark:text-neutral-200"
            >
              <div 
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: resolveColor(item.color, index) }}
              />
              {item.name}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Hook for chart data management
export function useChartData<T extends ChartData>(
  initialData: T[] = [],
  loading = false
) {
  const [data, setData] = useState<T[]>(initialData);
  const [isLoading, setIsLoading] = useState(loading);

  const updateData = (newData: T[]) => {
    setData(newData);
  };

  const addDataPoint = (dataPoint: T) => {
    setData(prev => [...prev, dataPoint]);
  };

  const removeDataPoint = (index: number) => {
    setData(prev => prev.filter((_, i) => i !== index));
  };

  return {
    data,
    isLoading,
    updateData,
    addDataPoint,
    removeDataPoint,
    setIsLoading
  };
}
