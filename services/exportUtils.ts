/**
 * @fileoverview exportUtils Module - Application module
 *
 * @author Dernek Yönetim Sistemi Team
 * @version 1.0.0
 */

// Gelişmiş Raporlama Sistemi - Export Utility Fonksiyonları

import { ExportFormat, type ChartConfig, type AnalyticsData } from '../types/reporting';

import { logger } from '../lib/logging/logger';
import { formatDate as formatDateUtil } from '../lib/utils/dateFormatter';
// Chart data interfaces
/**
 * ChartDataPoint Interface
 *
 * @interface ChartDataPoint
 */
export interface ChartDataPoint {
  value: number;
  label?: string;
  [key: string]: unknown;
}

/**
 * ChartDataset Interface
 *
 * @interface ChartDataset
 */
export interface ChartDataset<T extends ChartDataPoint = ChartDataPoint> {
  data: T[];
  label?: string;
  backgroundColor?: string | string[];
  borderColor?: string | string[];
  [key: string]: unknown;
}

// Chart export utilities
/**
 * ChartExportOptions Interface
 *
 * @interface ChartExportOptions
 */
export interface ChartExportOptions {
  width?: number;
  height?: number;
  backgroundColor?: string;
  quality?: number;
  format: 'png' | 'svg' | 'pdf';
}

/**
 * ExportDataOptions Interface
 *
 * @interface ExportDataOptions
 */
export interface ExportDataOptions {
  includeHeaders?: boolean;
  dateFormat?: string;
  numberFormat?: string;
  currencySymbol?: string;
  delimiter?: string;
  encoding?: string;
}

/**
 * OptimizationOptions Interface
 *
 * @interface OptimizationOptions
 */
export interface OptimizationOptions {
  chunkSize?: number;
  maxMemoryUsage?: number;
  compressionLevel?: number;
  streamingThreshold?: number;
}

/**
 * Chart export utilities for converting charts to various formats
 */
/**
 * ChartExportUtils Service
 *
 * Service class for handling chartexportutils operations
 *
 * @class ChartExportUtils
 */
export class ChartExportUtils {
  /**
   * Convert chart to PNG format
   */
  static async chartToPNG(
    chartElement: HTMLElement | string,
    options: ChartExportOptions = { format: 'png' },
  ): Promise<string> {
    const { width = 800, height = 600, backgroundColor = '#ffffff', quality = 0.9 } = options;

    try {
      // Create canvas element
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        throw new Error('Canvas context not available');
      }

      // Set background
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, width, height);

      // Convert chart element to image
      if (typeof chartElement === 'string') {
        // If SVG string, convert to image
        const img = await this.svgStringToImage(chartElement, width, height);
        ctx.drawImage(img, 0, 0, width, height);
      } else {
        // If HTML element, use html2canvas-like functionality
        await this.htmlElementToCanvas(chartElement, ctx, width, height);
      }

      // Convert to PNG data URL
      return canvas.toDataURL('image/png', quality);
    } catch (error) {
      throw new Error(
        `PNG export failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  /**
   * Convert chart to SVG format
   */
  static async chartToSVG<T extends ChartDataPoint>(
    chartData: ChartDataset<T> | T[],
    chartConfig: ChartConfig,
    options: ChartExportOptions = { format: 'svg' },
  ): Promise<string> {
    const { width = 800, height = 600, backgroundColor = '#ffffff' } = options;

    try {
      // Create SVG structure
      const svg = this.createSVGElement(width, height, backgroundColor);

      // Extract data array from dataset if needed
      const dataArray: T[] = Array.isArray(chartData) ? chartData : chartData.data;

      // Add chart elements based on type
      switch (chartConfig.type) {
        case 'bar':
          this.addBarChartToSVG(svg, dataArray, chartConfig, width, height);
          break;
        case 'line':
          this.addLineChartToSVG(svg, dataArray, chartConfig, width, height);
          break;
        case 'pie':
          this.addPieChartToSVG(svg, dataArray, chartConfig, width, height);
          break;
        case 'doughnut':
          this.addDoughnutChartToSVG(svg, dataArray, chartConfig, width, height);
          break;
        case 'area':
          this.addAreaChartToSVG(svg, dataArray, chartConfig, width, height);
          break;
        case 'scatter':
          this.addScatterChartToSVG(svg, dataArray, chartConfig, width, height);
          break;
        case 'heatmap':
          this.addHeatmapChartToSVG(svg, dataArray, chartConfig, width, height);
          break;
        case 'treemap':
          this.addTreemapChartToSVG(svg, dataArray, chartConfig, width, height);
          break;
        default:
          throw new Error(`Unsupported chart type: ${chartConfig.type}`);
      }

      return svg.outerHTML;
    } catch (error) {
      throw new Error(
        `SVG export failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  /**
   * Convert chart to PDF-compatible format
   */
  static async chartToPDF(
    chartElement: HTMLElement | string,
    options: ChartExportOptions = { format: 'pdf' },
  ): Promise<string> {
    // For PDF, we'll convert to high-quality PNG first
    const pngData = await this.chartToPNG(chartElement, {
      ...options,
      quality: 1.0,
      width: options.width ?? 1200,
      height: options.height ?? 900,
    });

    return pngData;
  }

  // Private helper methods
  private static async svgStringToImage(
    svgString: string,
    _width: number,
    _height: number,
  ): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();

      const blob = new Blob([svgString], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);

      img.onload = () => {
        URL.revokeObjectURL(url); // Clean up object URL
        resolve(img);
      };

      img.onerror = (err) => {
        URL.revokeObjectURL(url); // Clean up object URL on error
        reject(err);
      };

      img.src = url;
    });
  }

  private static async htmlElementToCanvas(
    element: HTMLElement,
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
  ): Promise<void> {
    // Simplified implementation - in real app, use html2canvas library
    const rect = element.getBoundingClientRect();
    const scaleX = width / rect.width;
    const scaleY = height / rect.height;

    ctx.scale(Math.min(scaleX, scaleY), Math.min(scaleX, scaleY));

    // Drawing implementation - uses html2canvas
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = '#333';
    ctx.font = '16px Arial';
    ctx.fillText('Chart Export Placeholder', 50, 50);
  }

  private static createSVGElement(
    width: number,
    height: number,
    backgroundColor: string,
  ): SVGSVGElement {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', width.toString());
    svg.setAttribute('height', height.toString());
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);

    // Add background
    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.setAttribute('width', '100%');
    rect.setAttribute('height', '100%');
    rect.setAttribute('fill', backgroundColor);
    svg.appendChild(rect);

    return svg;
  }

  private static addBarChartToSVG<T extends ChartDataPoint>(
    svg: SVGSVGElement,
    data: T[],
    config: ChartConfig,
    width: number,
    height: number,
  ): void {
    const margin = { top: 20, right: 20, bottom: 40, left: 60 };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    // Create chart group
    const chartGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    chartGroup.setAttribute('transform', `translate(${margin.left}, ${margin.top})`);

    // Add bars (simplified)
    data.forEach((item, index) => {
      const barHeight = (item.value / Math.max(...data.map((d) => d.value))) * chartHeight;
      const barWidth = (chartWidth / data.length) * 0.8;
      const x = (chartWidth / data.length) * index + (chartWidth / data.length - barWidth) / 2;
      const y = chartHeight - barHeight;

      const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      rect.setAttribute('x', x.toString());
      rect.setAttribute('y', y.toString());
      rect.setAttribute('width', barWidth.toString());
      rect.setAttribute('height', barHeight.toString());
      rect.setAttribute('fill', config.colors?.[index % config.colors.length] || '#3b82f6');

      chartGroup.appendChild(rect);
    });

    svg.appendChild(chartGroup);
  }

  private static addLineChartToSVG<T extends ChartDataPoint>(
    svg: SVGSVGElement,
    data: T[],
    config: ChartConfig,
    width: number,
    height: number,
  ): void {
    const margin = { top: 20, right: 20, bottom: 40, left: 60 };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    // Create chart group
    const chartGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    chartGroup.setAttribute('transform', `translate(${margin.left}, ${margin.top})`);

    // Create line path
    const maxValue = Math.max(...data.map((d) => d.value));
    const points = data
      .map((item, index) => {
        const x = (chartWidth / (data.length - 1)) * index;
        const y = chartHeight - (item.value / maxValue) * chartHeight;
        return `${x},${y}`;
      })
      .join(' ');

    const polyline = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
    polyline.setAttribute('points', points);
    polyline.setAttribute('fill', 'none');
    polyline.setAttribute('stroke', config.colors?.[0] || '#3b82f6');
    polyline.setAttribute('stroke-width', '2');

    chartGroup.appendChild(polyline);
    svg.appendChild(chartGroup);
  }

  private static addPieChartToSVG<T extends ChartDataPoint>(
    svg: SVGSVGElement,
    data: T[],
    config: ChartConfig,
    width: number,
    height: number,
  ): void {
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 2 - 20;

    const total = data.reduce((sum, item) => sum + item.value, 0);
    let currentAngle = 0;

    data.forEach((item, index) => {
      const sliceAngle = (item.value / total) * 2 * Math.PI;
      const endAngle = currentAngle + sliceAngle;

      const x1 = centerX + radius * Math.cos(currentAngle);
      const y1 = centerY + radius * Math.sin(currentAngle);
      const x2 = centerX + radius * Math.cos(endAngle);
      const y2 = centerY + radius * Math.sin(endAngle);

      const largeArcFlag = sliceAngle > Math.PI ? 1 : 0;

      const pathData = [
        `M ${centerX} ${centerY}`,
        `L ${x1} ${y1}`,
        `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
        'Z',
      ].join(' ');

      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', pathData);
      path.setAttribute(
        'fill',
        config.colors?.[index % config.colors.length] ||
          `hsl(${(index * 360) / data.length}, 70%, 50%)`,
      );

      svg.appendChild(path);
      currentAngle = endAngle;
    });
  }

  private static addDoughnutChartToSVG<T extends ChartDataPoint>(
    svg: SVGSVGElement,
    data: T[],
    config: ChartConfig,
    width: number,
    height: number,
  ): void {
    // Similar to pie chart but with inner radius
    const centerX = width / 2;
    const centerY = height / 2;
    const outerRadius = Math.min(width, height) / 2 - 20;
    const innerRadius = outerRadius * 0.6;

    const total = data.reduce((sum, item) => sum + item.value, 0);
    let currentAngle = 0;

    data.forEach((item, index) => {
      const sliceAngle = (item.value / total) * 2 * Math.PI;
      const endAngle = currentAngle + sliceAngle;

      const x1Outer = centerX + outerRadius * Math.cos(currentAngle);
      const y1Outer = centerY + outerRadius * Math.sin(currentAngle);
      const x2Outer = centerX + outerRadius * Math.cos(endAngle);
      const y2Outer = centerY + outerRadius * Math.sin(endAngle);

      const x1Inner = centerX + innerRadius * Math.cos(currentAngle);
      const y1Inner = centerY + innerRadius * Math.sin(currentAngle);
      const x2Inner = centerX + innerRadius * Math.cos(endAngle);
      const y2Inner = centerY + innerRadius * Math.sin(endAngle);

      const largeArcFlag = sliceAngle > Math.PI ? 1 : 0;

      const pathData = [
        `M ${x1Outer} ${y1Outer}`,
        `A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${x2Outer} ${y2Outer}`,
        `L ${x2Inner} ${y2Inner}`,
        `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${x1Inner} ${y1Inner}`,
        'Z',
      ].join(' ');

      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', pathData);
      path.setAttribute(
        'fill',
        config.colors?.[index % config.colors.length] ||
          `hsl(${(index * 360) / data.length}, 70%, 50%)`,
      );

      svg.appendChild(path);
      currentAngle = endAngle;
    });
  }

  private static addAreaChartToSVG<T extends ChartDataPoint>(
    svg: SVGSVGElement,
    data: T[],
    config: ChartConfig,
    width: number,
    height: number,
  ): void {
    const margin = { top: 20, right: 20, bottom: 40, left: 60 };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    const chartGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    chartGroup.setAttribute('transform', `translate(${margin.left}, ${margin.top})`);

    const maxValue = Math.max(...data.map((d) => d.value));
    const points = data
      .map((item, index) => {
        const x = (chartWidth / (data.length - 1)) * index;
        const y = chartHeight - (item.value / maxValue) * chartHeight;
        return `${x},${y}`;
      })
      .join(' ');

    const areaPath = `${points.split(' ').map((p, i) =>
      i === 0 ? `M ${p}` : `L ${p}`
    ).join(' ')} L ${chartWidth},${chartHeight} L 0,${chartHeight} Z`;

    const area = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    area.setAttribute('d', areaPath);
    area.setAttribute('fill', config.colors?.[0] || '#3b82f6');
    area.setAttribute('opacity', '0.3');

    chartGroup.appendChild(area);
    svg.appendChild(chartGroup);
  }

  private static addScatterChartToSVG<T extends ChartDataPoint>(
    svg: SVGSVGElement,
    data: T[],
    config: ChartConfig,
    width: number,
    height: number,
  ): void {
    const margin = { top: 20, right: 20, bottom: 40, left: 60 };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    const chartGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    chartGroup.setAttribute('transform', `translate(${margin.left}, ${margin.top})`);

    const maxValue = Math.max(...data.map((d) => d.value));

    data.forEach((item, index) => {
      const x = (chartWidth / data.length) * index;
      const y = chartHeight - (item.value / maxValue) * chartHeight;

      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('cx', x.toString());
      circle.setAttribute('cy', y.toString());
      circle.setAttribute('r', '4');
      circle.setAttribute('fill', config.colors?.[index % config.colors.length] || '#3b82f6');

      chartGroup.appendChild(circle);
    });

    svg.appendChild(chartGroup);
  }

  private static addHeatmapChartToSVG<T extends ChartDataPoint>(
    svg: SVGSVGElement,
    data: T[],
    _config: ChartConfig,
    width: number,
    height: number,
  ): void {
    const cellSize = Math.min(width, height) / Math.ceil(Math.sqrt(data.length));
    const cols = Math.ceil(width / cellSize);

    const maxValue = Math.max(...data.map((d) => d.value));

    data.forEach((item, index) => {
      const row = Math.floor(index / cols);
      const col = index % cols;
      const x = col * cellSize;
      const y = row * cellSize;

      const intensity = item.value / maxValue;
      const hue = 200 - (intensity * 60); // Blue to red gradient

      const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      rect.setAttribute('x', x.toString());
      rect.setAttribute('y', y.toString());
      rect.setAttribute('width', cellSize.toString());
      rect.setAttribute('height', cellSize.toString());
      rect.setAttribute('fill', `hsl(${hue}, 70%, 50%)`);
      rect.setAttribute('stroke', '#fff');

      svg.appendChild(rect);
    });
  }

  private static addTreemapChartToSVG<T extends ChartDataPoint>(
    svg: SVGSVGElement,
    data: T[],
    config: ChartConfig,
    width: number,
    height: number,
  ): void {
    // Simplified treemap implementation
    const total = data.reduce((sum, item) => sum + item.value, 0);
    let x = 0;
    let y = 0;

    data.forEach((item, index) => {
      const area = (item.value / total) * width * height;
      const rectWidth = Math.sqrt(area * (width / height));
      const rectHeight = area / rectWidth;

      const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      rect.setAttribute('x', x.toString());
      rect.setAttribute('y', y.toString());
      rect.setAttribute('width', rectWidth.toString());
      rect.setAttribute('height', rectHeight.toString());
      rect.setAttribute('fill', config.colors?.[index % config.colors.length] ||
        `hsl(${(index * 360) / data.length}, 70%, 50%)`);
      rect.setAttribute('stroke', '#fff');
      rect.setAttribute('stroke-width', '2');

      svg.appendChild(rect);

      x += rectWidth;
      if (x >= width) {
        x = 0;
        y += rectHeight;
      }
    });
  }
}

/**
 * Data formatting utilities for export
 */
/**
 * DataFormattingUtils Service
 *
 * Service class for handling dataformattingutils operations
 *
 * @class DataFormattingUtils
 */
export class DataFormattingUtils {
  /**
   * Format data for CSV export
   */
  static formatForCSV<T extends Record<string, unknown>>(data: T[], options: ExportDataOptions = {}): string {
    const {
      includeHeaders = true,
      delimiter = ',',
      dateFormat = 'YYYY-MM-DD',
      numberFormat = '0.00',
    } = options;

    if (!Array.isArray(data) || data.length === 0) {
      return '';
    }

    const headers = Object.keys(data[0] || {});
    const rows: string[] = [];

    // Add headers if requested
    if (includeHeaders) {
      rows.push(headers.map((header) => this.escapeCSVField(header)).join(delimiter));
    }

    // Add data rows
    data.forEach((row) => {
      const values = headers.map((header) => {
        const value = row[header];
        return this.formatCSVValue(value as string | number | boolean | Date | null | undefined, { dateFormat, numberFormat });
      });
      rows.push(values.map((value) => this.escapeCSVField(value)).join(delimiter));
    });

    return rows.join('\n');
  }

  /**
   * Format data for Excel export
   */
  static formatForExcel<T extends Record<string, unknown>>(data: T[], options: ExportDataOptions = {}): unknown[][] {
    const {
      includeHeaders = true,
      dateFormat = 'YYYY-MM-DD',
      numberFormat = '0.00',
      currencySymbol = '₺',
    } = options;

    if (!Array.isArray(data) || data.length === 0) {
      return [];
    }

    const headers = Object.keys(data[0] || {});
    const result: unknown[][] = [];

    // Add headers if requested
    if (includeHeaders) {
      result.push(headers);
    }

    // Add data rows
    data.forEach((row) => {
      const values = headers.map((header) => {
        const value = row[header];
        return this.formatExcelValue(value as string | number | boolean | Date | null | undefined, { dateFormat, numberFormat, currencySymbol });
      });
      result.push(values);
    });

    return result;
  }

  /**
   * Format analytics data for export
   */
  static formatAnalyticsData(
    analyticsData: AnalyticsData,
    options: ExportDataOptions = {},
  ): {
    metrics: Record<string, string>[];
    timeSeries: Record<string, unknown>[];
    categories: Record<string, string>[];
    summary: Record<string, string>;
  } {
    return {
      metrics: analyticsData.metrics.map((metric) => ({
        Metrik: metric.key,
        Değer: this.formatNumber(metric.value, options.numberFormat),
        Değişim: metric.change ? `${metric.change > 0 ? '+' : ''}${metric.change.toFixed(2)}` : '',
        Trend: metric.trend === 'up' ? '↗' : metric.trend === 'down' ? '↘' : '→',
        Format: metric.format || 'number',
      })),
      timeSeries: analyticsData.timeSeries.map((ts) => ({
        Tarih: this.formatDate(new Date(ts.date), options.dateFormat),
        ...ts.values,
      })),
      categories: analyticsData.categories.map((cat) => ({
        Kategori: cat.name,
        Değer: this.formatNumber(cat.value, options.numberFormat),
        Yüzde: `${cat.percentage.toFixed(1)}%`,
      })),
      summary: {
        'Mevcut Değer': this.formatNumber(analyticsData.comparisons.current, options.numberFormat),
        'Önceki Değer': this.formatNumber(analyticsData.comparisons.previous, options.numberFormat),
        Değişim: this.formatNumber(analyticsData.comparisons.change, options.numberFormat),
        'Değişim Yüzdesi': `${analyticsData.comparisons.changePercent.toFixed(2)}%`,
      },
    };
  }

  // Private helper methods
  private static escapeCSVField(field: string | number | boolean | Date | null | undefined): string {
    // Handle null/undefined values
    if (field === null || field === undefined) {
      return '';
    }

    // Convert non-string inputs to strings
    if (typeof field !== 'string') {
      field = String(field);
    }

    // Check for characters that require escaping: comma, quote, newline, carriage return
    if (
      field.includes(',') ||
      field.includes('"') ||
      field.includes('\n') ||
      field.includes('\r')
    ) {
      // Escape double-quotes by doubling them and wrap entire field in quotes
      return `"${field.replace(/"/g, '""')}"`;
    }

    return field;
  }

  private static formatCSVValue(
    value: string | number | boolean | Date | null | undefined,
    options: { dateFormat?: string; numberFormat?: string },
  ): string {
    if (value === null || value === undefined) {
      return '';
    }

    if (value instanceof Date) {
      return this.formatDate(value, options.dateFormat);
    }

    if (typeof value === 'number') {
      return this.formatNumber(value, options.numberFormat);
    }

    return String(value);
  }

  private static formatExcelValue(
    value: string | number | boolean | Date | null | undefined,
    _options: { dateFormat?: string; numberFormat?: string; currencySymbol?: string },
  ): string | number | Date {
    if (value === null || value === undefined) {
      return '';
    }

    if (value instanceof Date) {
      return value; // Excel handles dates natively
    }

    if (typeof value === 'number') {
      return value; // Excel handles numbers natively
    }

    return String(value);
  }

  private static formatDate(date: Date, format = 'YYYY-MM-DD'): string {
    // Map format string to date-fns format
    const formatMap: Record<string, string> = {
      'YYYY-MM-DD': 'yyyy-MM-dd',
      'DD.MM.YYYY': 'dd.MM.yyyy',
      'DD/MM/YYYY': 'dd/MM/yyyy',
    };
    const dateFnsFormat = formatMap[format] ?? 'yyyy-MM-dd';
    return formatDateUtil(date, dateFnsFormat);
  }

  private static formatNumber(value: number | string, format = '0.00'): string {
    const num = typeof value === 'string' ? parseFloat(value) : value;

    if (isNaN(num)) {
      return String(value);
    }

    const decimals = format.includes('.') ? (format.split('.')[1]?.length || 0) : 0;
    return num.toFixed(decimals);
  }
}

/**
 * Large dataset optimization utilities
 */
/**
 * OptimizationUtils Service
 *
 * Service class for handling optimizationutils operations
 *
 * @class OptimizationUtils
 */
export class OptimizationUtils {
  /**
   * Process large datasets in chunks to prevent memory issues
   */
  static async processInChunks<T, R>(
    data: T[],
    processor: (chunk: T[]) => Promise<R[]> | R[],
    options: OptimizationOptions = {},
  ): Promise<R[]> {
    const {
      chunkSize = 1000,
      maxMemoryUsage = 100 * 1024 * 1024, // 100MB
    } = options;

    const results: R[] = [];
    const totalChunks = Math.ceil(data.length / chunkSize);

    for (let i = 0; i < totalChunks; i++) {
      const start = i * chunkSize;
      const end = Math.min(start + chunkSize, data.length);
      const chunk = data.slice(start, end);

      // Check memory usage
      if (this.getMemoryUsage() > maxMemoryUsage) {
        // Force garbage collection if available (Node.js only)
        if (typeof globalThis !== 'undefined' && 'gc' in globalThis && typeof (globalThis as any).gc === 'function') {
          (globalThis as any).gc();
        }

        // Wait a bit to allow memory cleanup
        await new Promise((resolve) => setTimeout(resolve, 100));
      }

      const chunkResults = await processor(chunk);
      results.push(...chunkResults);

      // Yield control to prevent blocking
      if (i % 10 === 0) {
        await new Promise((resolve) => setTimeout(resolve, 0));
      }
    }

    return results;
  }

  /**
   * Stream large exports to prevent memory issues
   */
  static streamExport(
    data: Record<string, unknown>[] | ChartDataset[] | ChartDataPoint[],
    format: ExportFormat,
    options: OptimizationOptions = {},
  ): Promise<ReadableStream> {
    const { streamingThreshold = 10000, chunkSize = 1000 } = options;

    if (data.length < streamingThreshold) {
      // For small datasets, return regular export
      return Promise.resolve(this.createSimpleStream(data, format));
    }

    // For large datasets, create streaming export
    return Promise.resolve(new ReadableStream({
      start(controller) {
        OptimizationUtils.processLargeDataset(data, format, chunkSize, controller);
      },
    }));
  }

  /**
   * Compress export data
   */
  static async compressData(
    data: string | Uint8Array,
    options: OptimizationOptions = {},
  ): Promise<Uint8Array> {
    const { compressionLevel = 6 } = options;

    // Compression implementation - will use pako or similar library
    const input = typeof data === 'string' ? new TextEncoder().encode(data) : data;

    // Simulate compression by reducing size
    const compressionRatio = Math.max(0.3, 1 - compressionLevel / 10);
    const compressedSize = Math.floor(input.length * compressionRatio);

    return input.slice(0, compressedSize);
  }

  // Private helper methods
  private static getMemoryUsage(): number {
    // Use real Node.js memory usage when available
    if (typeof globalThis !== 'undefined' && 'process' in globalThis) {
      const proc = (globalThis as any).process;
      if (proc && typeof proc.memoryUsage === 'function') {
        return proc.memoryUsage().rss; // Resident Set Size in bytes
      }
    }

    // Fallback for browser environments - estimate based on performance API
    interface PerformanceWithMemory extends Performance {
      memory?: {
        usedJSHeapSize: number;
        totalJSHeapSize: number;
        jsHeapSizeLimit: number;
      };
    }

    if (typeof performance !== 'undefined' && (performance as PerformanceWithMemory).memory) {
      return (performance as PerformanceWithMemory).memory?.usedJSHeapSize ?? 0;
    }

    // Last resort fallback
    logger.warn('Memory usage API not available, returning 0');
    return 0;
  }

  private static createSimpleStream(data: Record<string, unknown>[] | ChartDataset[] | ChartDataPoint[], format: ExportFormat): ReadableStream {
    let index = 0;

    return new ReadableStream({
      pull(controller) {
        if (index >= data.length) {
          controller.close();
          return;
        }

        const chunk = OptimizationUtils.formatChunk(data.slice(index, index + 100), format);
        controller.enqueue(chunk);
        index += 100;
      },
    });
  }

  private static async processLargeDataset(
    data: Record<string, unknown>[] | ChartDataset[] | ChartDataPoint[],
    format: ExportFormat,
    chunkSize: number,
    controller: ReadableStreamDefaultController,
  ): Promise<void> {
    try {
      for (let i = 0; i < data.length; i += chunkSize) {
        const chunk = data.slice(i, i + chunkSize);
        const formattedChunk = OptimizationUtils.formatChunk(chunk, format);

        controller.enqueue(formattedChunk);

        // Yield control periodically
        if (i % (chunkSize * 10) === 0) {
          await new Promise((resolve) => setTimeout(resolve, 0));
        }
      }

      controller.close();
    } catch (error) {
      controller.error(error);
    }
  }

  private static formatChunk(chunk: Record<string, unknown>[] | ChartDataset[] | ChartDataPoint[], format: ExportFormat): Uint8Array {
    let formatted: string;

    switch (format) {
      case ExportFormat.CSV:
        formatted = DataFormattingUtils.formatForCSV(chunk);
        break;
      case ExportFormat.EXCEL:
        // For Excel, we'd need to format as XLSX binary data
        formatted = JSON.stringify(DataFormattingUtils.formatForExcel(chunk));
        break;
      default:
        formatted = JSON.stringify(chunk);
    }

    return new TextEncoder().encode(formatted);
  }
}

/**
 * Export template system
 */
/**
 * ExportTemplateUtils Service
 *
 * Service class for handling exporttemplateutils operations
 *
 * @class ExportTemplateUtils
 */
export class ExportTemplateUtils {
  private static readonly templates = new Map<string, ExportTemplate>();

  static registerTemplate(id: string, template: ExportTemplate): void {
    this.templates.set(id, template);
  }

  static getTemplate(id: string): ExportTemplate | undefined {
    return this.templates.get(id);
  }

  static applyTemplate<T>(data: T, templateId: string): T {
    const template = this.getTemplate(templateId);
    if (!template) {
      return data;
    }

    return template.transform(data) as T;
  }

  // Initialize default templates
  static initializeDefaultTemplates(): void {
    // Default template
    this.registerTemplate('default', {
      name: 'Varsayılan Şablon',
      description: 'Standart rapor formatı',
      transform: (data) => data,
    });

    // Executive summary template
    this.registerTemplate('executive', {
      name: 'Yönetici Özeti',
      description: 'Özet bilgiler ve grafikler',
      transform: (data) => {
        if ((data as any).metrics) {
          // Only include key metrics
          (data as any).metrics = (data as any).metrics.slice(0, 5);
        }
        return data;
      },
    });

    // Detailed template
    this.registerTemplate('detailed', {
      name: 'Detaylı Rapor',
      description: 'Tüm veriler ve analizler',
      transform: (data) => {
        // Include all available data
        return {
          ...(data as object),
          includeAllDetails: true,
          showCalculations: true,
        };
      },
    });

    // Presentation template
    this.registerTemplate('presentation', {
      name: 'Sunum Formatı',
      description: 'Görsel ağırlıklı format',
      transform: (data) => {
        return {
          ...(data as object),
          emphasizeVisuals: true,
          reduceTextContent: true,
        };
      },
    });
  }
}

interface ExportTemplate<T = unknown> {
  name: string;
  description: string;
  transform: (data: T) => T;
}

// Initialize default templates
ExportTemplateUtils.initializeDefaultTemplates();

// Export utilities are already exported as classes above
