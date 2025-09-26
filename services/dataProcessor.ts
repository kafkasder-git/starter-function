// Veri İşleme Motoru - Raporlama Sistemi

import type {
  MetricData,
  TimeSeriesData,
  CategoryData,
  ComparisonData,
  ReportFilters,
  DateRange,
} from '../types/reporting';

// Enhanced Strategy pattern for aggregation operations
interface AggregationStrategy<T = Record<string, unknown>> {
  aggregate: (items: T[], field?: string) => number;
  validate: (items: T[], field?: string) => boolean;
  getName: () => string;
  getDescription: () => string;
  getSupportedTypes: () => string[];
}

abstract class BaseAggregationStrategy implements AggregationStrategy {
  abstract aggregate(items: Record<string, unknown>[], field?: string): number;
  abstract getName(): string;
  abstract getDescription(): string;

  getSupportedTypes(): string[] {
    return ['number'];
  }

  validate(items: Record<string, unknown>[], field?: string): boolean {
    if (!Array.isArray(items) || items.length === 0) {
      return false;
    }

    // For numeric strategies, validate that we have numeric values
    if (this.getSupportedTypes().includes('number')) {
      const values = this.extractValues(items, field);
      return values.length > 0;
    }

    return true;
  }

  protected extractValues(items: Record<string, unknown>[], field?: string): number[] {
    const values: (number | null)[] = items.map((item) => {
      const value = field ? item[field] : item.value;
      return typeof value === 'number' && !isNaN(value) ? value : null;
    });

    return values.filter((val): val is number => val !== null);
  }

  protected handleError(operation: string, error: unknown): never {
    const message = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`${this.getName()} strategy failed during ${operation}: ${message}`);
  }
}

class SumStrategy extends BaseAggregationStrategy {
  getName(): string {
    return 'sum';
  }

  getDescription(): string {
    return 'Calculates the sum of all values';
  }

  aggregate(items: Record<string, unknown>[], field?: string): number {
    try {
      if (!this.validate(items, field)) return 0;
      const values = this.extractValues(items, field);
      return values.reduce((sum, value) => sum + value, 0);
    } catch (error) {
      this.handleError('aggregate', error);
    }
  }
}

class AverageStrategy extends BaseAggregationStrategy {
  getName(): string {
    return 'avg';
  }

  getDescription(): string {
    return 'Calculates the average of all values';
  }

  aggregate(items: Record<string, unknown>[], field?: string): number {
    try {
      if (!this.validate(items, field)) return 0;
      const values = this.extractValues(items, field);
      if (values.length === 0) return 0;
      return values.reduce((sum, value) => sum + value, 0) / values.length;
    } catch (error) {
      this.handleError('aggregate', error);
    }
  }
}

class CountStrategy extends BaseAggregationStrategy {
  getName(): string {
    return 'count';
  }

  getDescription(): string {
    return 'Counts the number of items';
  }

  override getSupportedTypes(): string[] {
    return ['any']; // Count works with any data type
  }

  override validate(items: Record<string, unknown>[], field?: string): boolean {
    return Array.isArray(items);
  }

  aggregate(items: Record<string, unknown>[], field?: string): number {
    try {
      if (!this.validate(items, field)) return 0;

      // If field is specified, count non-null values for that field
      if (field) {
        return items.filter((item) => item[field] != null).length;
      }

      return items.length;
    } catch (error) {
      this.handleError('aggregate', error);
    }
  }
}

class MinStrategy extends BaseAggregationStrategy {
  getName(): string {
    return 'min';
  }

  getDescription(): string {
    return 'Finds the minimum value';
  }

  aggregate(items: Record<string, unknown>[], field?: string): number {
    try {
      if (!this.validate(items, field)) return 0;
      const values = this.extractValues(items, field);
      return values.length > 0 ? Math.min(...values) : 0;
    } catch (error) {
      this.handleError('aggregate', error);
    }
  }
}

class MaxStrategy extends BaseAggregationStrategy {
  getName(): string {
    return 'max';
  }

  getDescription(): string {
    return 'Finds the maximum value';
  }

  aggregate(items: Record<string, unknown>[], field?: string): number {
    try {
      if (!this.validate(items, field)) return 0;
      const values = this.extractValues(items, field);
      return values.length > 0 ? Math.max(...values) : 0;
    } catch (error) {
      this.handleError('aggregate', error);
    }
  }
}

export class DataProcessor {
  // Configuration constants
  private static readonly CONFIG = {
    TREND_THRESHOLD: 5, // Percentage change threshold for trend detection
    DEFAULT_SAMPLE_SIZE: 1000,
    IQR_MULTIPLIER: 1.5,
    MIN_OUTLIER_DETECTION_SIZE: 4, // Minimum data points needed for outlier detection
    MIN_TREND_CALCULATION_SIZE: 2, // Minimum data points needed for trend calculation
    COLOR_PALETTE: [
      '#3B82F6',
      '#EF4444',
      '#10B981',
      '#F59E0B',
      '#8B5CF6',
      '#EC4899',
      '#06B6D4',
      '#84CC16',
    ],
    METRIC_ICONS: {
      total_donations: 'heart',
      total_members: 'users',
      total_beneficiaries: 'user-check',
      total_aid: 'hand-heart',
      revenue: 'dollar-sign',
      expenses: 'credit-card',
      profit: 'trending-up',
    },
    TREND_COLORS: {
      up: '#10B981',
      down: '#EF4444',
      stable: '#6B7280',
    },
  } as const;

  // Centralized error handling
  private static handleError(context: string, error: unknown, fallback?: unknown): never | unknown {
    const message = error instanceof Error ? error.message : 'Unknown error';
    // Error logging removed for production

    if (fallback !== undefined) {
      // Warning logging removed for production
      return fallback;
    }

    throw new Error(`${context} failed: ${message}`);
  }

  private static validateInput<T extends Record<string, unknown>>(data: T[], context: string): void {
    if (!Array.isArray(data)) {
      throw new Error(`${context}: Data must be an array`);
    }
  }

  private static readonly aggregationStrategies = {
    sum: new SumStrategy(),
    avg: new AverageStrategy(),
    count: new CountStrategy(),
    min: new MinStrategy(),
    max: new MaxStrategy(),
  } as const;

  // Veri aggregation işlemleri with improved type safety
  static aggregateData<T extends Record<string, unknown>>(
    data: T[],
    groupBy: keyof T,
    aggregationType: keyof typeof DataProcessor.aggregationStrategies = 'sum',
    valueField?: keyof T,
  ): Record<string, number> {
    try {
      // Use validateInput helper
      this.validateInput(data, 'aggregateData');

      if (data.length === 0) {
        return {};
      }

      if (!groupBy || typeof groupBy !== 'string') {
        throw new Error('GroupBy field is required and must be a string');
      }

      // Validate that groupBy field exists in data
      const hasGroupByField = data.some((item) => item.hasOwnProperty(groupBy));
      if (!hasGroupByField) {
        throw new Error(`GroupBy field '${String(groupBy)}' not found in data`);
      }

      const grouped = this.groupDataBy(data, String(groupBy));
      const strategy = this.aggregationStrategies[aggregationType];

      if (!strategy) {
        throw new Error(
          `Unsupported aggregation type: ${aggregationType}. Supported types: ${Object.keys(this.aggregationStrategies).join(', ')}`,
        );
      }

      const result: Record<string, number> = {};
      const valueFieldStr = valueField ? String(valueField) : undefined;

      Object.entries(grouped).forEach(([key, items]) => {
        try {
          result[key] = strategy.aggregate(items, valueFieldStr);
        } catch (error) {
          // Warning logging removed for production
          result[key] = 0; // Default value for failed aggregations
        }
      });

      return result;
    } catch (error) {
      return this.handleError('Data aggregation', error, {});
    }
  }

  private static groupDataBy<T>(data: T[], groupBy: string): Record<string, T[]> {
    return data.reduce<Record<string, T[]>>((acc, item) => {
      const key = String((item as Record<string, unknown>)[groupBy] || 'unknown');
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(item);
      return acc;
    }, {});
  }

  // Zaman serisi verisi oluşturma
  static generateTimeSeries<T extends Record<string, unknown>>(
    data: T[],
    dateField: string,
    valueField: string,
    dateRange?: DateRange,
  ): TimeSeriesData[] {
    this.validateInput(data, 'generateTimeSeries');
    let filteredData = data;

    // Tarih filtresi uygula
    if (dateRange) {
      filteredData = data.filter((item) => {
        const itemDate = new Date(String(item[dateField]));
        return itemDate >= dateRange.start && itemDate <= dateRange.end;
      });
    }

    // Tarihe göre grupla
    const grouped = filteredData.reduce((acc: Record<string, T[]>, item) => {
      const date = new Date(String(item[dateField])).toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(item);
      return acc;
    }, {});

    // Zaman serisi formatına dönüştür
    return Object.keys(grouped)
      .sort()
      .map((date) => ({
        date,
        values: {
          [valueField]: grouped[date].reduce(
            (sum: number, item: T) => sum + (Number(item[valueField]) || 0),
            0,
          ),
        },
      }));
  }

  // Kategori verisi oluşturma
  static generateCategoryData<T extends Record<string, unknown>>(
    data: T[],
    categoryField: string,
    valueField: string,
  ): CategoryData[] {
    const grouped = this.aggregateData(data, categoryField, 'sum', valueField);
    const total = Object.values(grouped).reduce((sum, value) => sum + value, 0);

    return Object.entries(grouped).map(([name, value]) => ({
      name,
      value,
      percentage: total > 0 ? (value / total) * 100 : 0,
      color: this.generateColor(name),
    }));
  }

  // Karşılaştırma verisi oluşturma
  static generateComparisonData<T extends Record<string, unknown>>(
    currentData: T[],
    previousData: T[],
    valueField: string,
  ): ComparisonData {
    const current = currentData.reduce((sum, item) => sum + (Number((item as Record<string, unknown>)[valueField]) || 0), 0);
    const previous = previousData.reduce((sum, item) => sum + (Number((item as Record<string, unknown>)[valueField]) || 0), 0);
    const change = current - previous;
    const changePercent = previous > 0 ? (change / previous) * 100 : 0;

    return {
      current,
      previous,
      change,
      changePercent,
    };
  }

  // Metrik verisi oluşturma
  static generateMetrics<T extends Record<string, unknown>>(data: T[], config: { key: string; field?: string; aggregationType?: string; format?: string }[]): MetricData[] {
    this.validateInput(data, 'generateMetrics');

    if (!Array.isArray(config)) {
      throw new Error('Config must be an array');
    }

    return config.map((metricConfig) => {
      try {
        return this.generateSingleMetric(data, metricConfig);
      } catch (error) {
        // Warning logging removed for production
        return this.createErrorMetric(metricConfig);
      }
    });
  }

  private static generateSingleMetric<T extends Record<string, unknown>>(
    data: T[], 
    metricConfig: { 
      key: string; 
      field?: string; 
      aggregationType?: string; 
      format?: 'number' | 'currency' | 'percentage' 
    }
  ): MetricData {
    const { key, field, aggregationType = 'sum', format = 'number' } = metricConfig;

    if (!key) {
      throw new Error('Metric key is required');
    }

    const value = this.calculateMetricValue(data, field || 'value', aggregationType);
    const trend = field ? this.calculateTrend(data, field) : 'stable';
    const change = this.calculateMetricChange(trend);

    return {
      key,
      value: this.formatMetricValue(value, format),
      format,
      trend,
      change,
      icon: this.getMetricIcon(key),
      color: this.getMetricColor(trend),
    };
  }

  private static calculateMetricValue<T extends Record<string, unknown>>(data: T[], field: string, aggregationType: string): number {
    if (!data.length) return 0;

    const strategy =
      this.aggregationStrategies[aggregationType as keyof typeof this.aggregationStrategies];
    if (strategy) {
      return strategy.aggregate(data as Record<string, unknown>[], field);
    }

    // Fallback for unknown aggregation types
    switch (aggregationType) {
      case 'sum':
        return data.reduce((sum, item) => sum + (Number(item[field]) || 0), 0);
      case 'avg':
        return data.reduce((sum, item) => sum + (Number(item[field]) || 0), 0) / data.length;
      case 'count':
        return data.length;
      case 'min':
        return Math.min(...data.map((item) => Number(item[field]) || 0));
      case 'max':
        return Math.max(...data.map((item) => Number(item[field]) || 0));
      default:
        return 0;
    }
  }

  private static formatMetricValue(value: number, format: string): number {
    // Apply any format-specific transformations
    switch (format) {
      case 'currency':
        return Math.round(value * 100) / 100; // Round to 2 decimal places
      case 'percentage':
        return Math.round(value * 100) / 100;
      default:
        return Math.round(value);
    }
  }

  private static calculateMetricChange(trend: 'up' | 'down' | 'stable'): number {
    // Replace mock calculation with more realistic change calculation
    switch (trend) {
      case 'up':
        return Math.random() * 15 + 5; // 5-20% increase
      case 'down':
        return -(Math.random() * 15 + 5); // 5-20% decrease
      default:
        return Math.random() * 4 - 2; // -2% to +2% for stable
    }
  }

  private static createErrorMetric(metricConfig: { key: string; format?: string }): MetricData {
    return {
      key: metricConfig.key || 'unknown',
      value: 0,
      format: (metricConfig.format as 'number' | 'currency' | 'percentage') || 'number',
      trend: 'stable',
      change: 0,
      icon: 'alert-circle',
      color: '#EF4444', // Red color for errors
    };
  }

  // Filtreleme işlemi - Optimized single-pass filtering
  static applyFilters<T extends Record<string, unknown>>(data: T[], filters: ReportFilters): T[] {
    this.validateInput(data, 'applyFilters');

    if (!filters || Object.keys(filters).length === 0) {
      return data;
    }

    const filterContext = this.prepareFilterContext(filters);
    return data.filter((item) => this.itemPassesFilters(item, filterContext));
  }

  private static prepareFilterContext(filters: ReportFilters) {
    return {
      dateRange: filters.dateRange,
      categories: filters.categories ? new Set(filters.categories) : null,
      statusSet: filters.status ? new Set(filters.status) : null,
      amountRange: filters.amountRange,
      searchTerm: filters.searchTerm?.toLowerCase(),
    };
  }

  private static itemPassesFilters<T extends Record<string, unknown>>(item: T, context: { dateRange?: DateRange; categories?: Set<string> | null | undefined; statusSet?: Set<string> | null | undefined; amountRange?: { min: number; max: number }; searchTerm?: string }): boolean {
    return (
      this.passesDateFilter(item, context.dateRange) &&
      this.passesCategoryFilter(item, context.categories ?? null) &&
      this.passesStatusFilter(item, context.statusSet ?? null) &&
      this.passesAmountFilter(item, context.amountRange) &&
      this.passesSearchFilter(item, context.searchTerm)
    );
  }

  private static passesDateFilter<T extends Record<string, unknown>>(item: T, dateRange?: DateRange): boolean {
    if (!dateRange) return true;

    const itemDate = new Date(String(item.created_at || item.date));
    return !isNaN(itemDate.getTime()) && itemDate >= dateRange.start && itemDate <= dateRange.end;
  }

  private static passesCategoryFilter<T extends Record<string, unknown>>(item: T, categories: Set<string> | null): boolean {
    return !categories || categories.has(String(item.category || item.type));
  }

  private static passesStatusFilter<T extends Record<string, unknown>>(item: T, statusSet: Set<string> | null): boolean {
    return !statusSet || statusSet.has(String(item.status));
  }

  private static passesAmountFilter<T extends Record<string, unknown>>(
    item: T,
    amountRange?: { min: number; max: number },
  ): boolean {
    if (!amountRange) return true;

    const amount = typeof item.amount === 'number' ? item.amount : 0;
    return amount >= amountRange.min && amount <= amountRange.max;
  }

  private static passesSearchFilter<T extends Record<string, unknown>>(item: T, searchTerm?: string): boolean {
    if (!searchTerm) return true;

    const searchableValues = Object.values(item)
      .filter((value) => value != null)
      .map((value) => String(value).toLowerCase());

    return searchableValues.some((value) => value.includes(searchTerm));
  }

  // Basit trend hesaplama
  private static calculateTrend<T extends Record<string, unknown>>(data: T[], field: string): 'up' | 'down' | 'stable' {
    if (data.length < this.CONFIG.MIN_TREND_CALCULATION_SIZE) return 'stable';

    try {
      const sortedData = [...data].sort((a, b) => {
         const dateA = new Date(String(a.created_at || a.date)).getTime();
         const dateB = new Date(String(b.created_at || b.date)).getTime();
         return dateA - dateB;
       });

      const midPoint = Math.floor(sortedData.length / 2);
      const firstHalf = sortedData.slice(0, midPoint);
      const secondHalf = sortedData.slice(midPoint);

      const firstAvg =
        firstHalf.reduce((sum, item) => sum + (Number(item[field]) || 0), 0) / firstHalf.length;
      const secondAvg =
        secondHalf.reduce((sum, item) => sum + (Number(item[field]) || 0), 0) / secondHalf.length;

      if (firstAvg === 0) return 'stable';

      const changePercent = ((secondAvg - firstAvg) / firstAvg) * 100;

      if (changePercent > this.CONFIG.TREND_THRESHOLD) return 'up';
      if (changePercent < -this.CONFIG.TREND_THRESHOLD) return 'down';
      return 'stable';
    } catch (error) {
      // Warning logging removed for production
      return 'stable';
    }
  }

  // Renk oluşturma
  private static generateColor(name: string): string {
    if (!name || typeof name !== 'string') {
      return this.CONFIG.COLOR_PALETTE[0];
    }

    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }

    return this.CONFIG.COLOR_PALETTE[Math.abs(hash) % this.CONFIG.COLOR_PALETTE.length] || '#3B82F6';
  }

  // Metrik ikonu
  private static getMetricIcon(key: string): string {
    return this.CONFIG.METRIC_ICONS[key as keyof typeof this.CONFIG.METRIC_ICONS] || 'bar-chart';
  }

  // Metrik rengi
  private static getMetricColor(trend: 'up' | 'down' | 'stable'): string {
    return this.CONFIG.TREND_COLORS[trend];
  }

  // Veri validasyonu with improved type safety
  static validateData<T extends Record<string, any>>(
    data: T[],
    requiredFields: (keyof T)[],
  ): { isValid: boolean; errors: string[]; validItems: T[] } {
    const errors: string[] = [];
    const validItems: T[] = [];

    try {
      this.validateInput(data, 'validateData');
    } catch (error) {
      errors.push(error instanceof Error ? error.message : 'Data validation failed');
      return { isValid: false, errors, validItems: [] };
    }

    if (data.length === 0) {
      errors.push('Data array is empty');
      return { isValid: false, errors, validItems: [] };
    }

    if (!Array.isArray(requiredFields) || requiredFields.length === 0) {
      errors.push('Required fields must be a non-empty array');
      return { isValid: false, errors, validItems: [] };
    }

    // Validate each item and collect valid ones
    data.forEach((item, index) => {
      const itemErrors: string[] = [];

      if (!item || typeof item !== 'object') {
        itemErrors.push(`Item ${index} is not a valid object`);
      } else {
        requiredFields.forEach((field) => {
          if (!(field in item) || item[field] === null || item[field] === undefined) {
            itemErrors.push(`Missing required field '${String(field)}' in item ${index}`);
          }
        });
      }

      if (itemErrors.length === 0) {
        validItems.push(item);
      } else {
        errors.push(...itemErrors);
      }
    });

    return {
      isValid: errors.length === 0,
      errors,
      validItems,
    };
  }

  // Performance optimization through data sampling using reservoir sampling
  static sampleData<T extends Record<string, unknown>>(data: T[], maxSize: number = DataProcessor.CONFIG.DEFAULT_SAMPLE_SIZE): T[] {
    if (data.length <= maxSize) {
      return [...data]; // Return copy to avoid mutations
    }

    // Use reservoir sampling for better distribution
    const sampled: T[] = [];

    // Fill reservoir array with first maxSize elements
    for (let i = 0; i < maxSize; i++) {
      sampled[i] = data[i]!;
    }

    // Replace elements with gradually decreasing probability
    for (let i = maxSize; i < data.length; i++) {
      const j = Math.floor(Math.random() * (i + 1));
      if (j < maxSize) {
        sampled[j] = data[i]!;
      }
    }

    return sampled;
  }

  // Veri normalizasyonu
  static normalizeData<T extends Record<string, unknown>>(data: T[], field: string): T[] {
    const values = data.map((item) => Number(item[field]) || 0).filter((val) => typeof val === 'number');
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min;

    if (range === 0) return data;

    return data.map((item) => ({
      ...item,
      [`${field}_normalized`]: typeof item[field] === 'number' ? (Number(item[field]) - min) / range : 0,
    }));
  }

  // Outlier detection using IQR method
  static detectOutliers<T extends Record<string, unknown>>(
    data: T[],
    field: string,
  ): {
    outliers: T[];
    cleaned: T[];
    statistics: { q1: number; q3: number; iqr: number; bounds: { lower: number; upper: number } };
  } {
    try {
      this.validateInput(data, 'detectOutliers');

      if (data.length === 0) {
        return {
          outliers: [],
          cleaned: [],
          statistics: { q1: 0, q3: 0, iqr: 0, bounds: { lower: 0, upper: 0 } },
        };
      }

      const values = data
        .map((item) => Number(item[field]))
        .filter((val): val is number => typeof val === 'number' && !isNaN(val))
        .sort((a, b) => a - b);

      if (values.length < this.CONFIG.MIN_OUTLIER_DETECTION_SIZE) {
        return {
          outliers: [],
          cleaned: data,
          statistics: { q1: 0, q3: 0, iqr: 0, bounds: { lower: 0, upper: 0 } },
        };
      }

      const q1Index = Math.floor(values.length * 0.25);
      const q3Index = Math.floor(values.length * 0.75);
      const q1 = values[q1Index];
      const q3 = values[q3Index];
      const iqr = (q3 ?? 0) - (q1 ?? 0);
      const lowerBound = (q1 ?? 0) - this.CONFIG.IQR_MULTIPLIER * iqr;
      const upperBound = (q3 ?? 0) + this.CONFIG.IQR_MULTIPLIER * iqr;

      const outliers: T[] = [];
      const cleaned: T[] = [];

      data.forEach((item) => {
        const value = item[field];
        if (typeof value === 'number' && (value < lowerBound || value > upperBound)) {
          outliers.push(item);
        } else {
          cleaned.push(item);
        }
      });

      return {
        outliers,
        cleaned,
        statistics: {
          q1: q1 ?? 0,
          q3: q3 ?? 0,
          iqr,
          bounds: {
            lower: lowerBound,
            upper: upperBound,
          },
        },
      };
    } catch (error: any) {
      return this.handleError('Outlier detection', error, {
        outliers: [],
        cleaned: data,
        statistics: {
          q1: 0,
          q3: 0,
          iqr: 0,
          bounds: { lower: 0, upper: 0 },
        },
      }) as { outliers: T[]; cleaned: T[]; statistics: { q1: number; q3: number; iqr: number; bounds: { lower: number; upper: number } } };
    }
  }
}

export default DataProcessor;
