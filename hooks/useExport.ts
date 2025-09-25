/**
 * @fileoverview useExport Module - Application module
 * 
 * @author Dernek Yönetim Sistemi Team
 * @version 1.0.0
 */

// Gelişmiş Raporlama Sistemi - Export Hook

import { useState, useCallback } from 'react';
import type { ExportConfig, ReportResponse } from '../types/reporting';
import { ExportFormat } from '../types/reporting';
import type { ExportResult, ExportProgress } from '../services/exportService';
import { exportService } from '../services/exportService';

interface UseExportOptions {
  onSuccess?: (result: ExportResult) => void;
  onError?: (error: string) => void;
  onProgress?: (progress: ExportProgress) => void;
}

interface UseExportReturn {
  exportData: (data: ReportResponse, config: ExportConfig) => Promise<void>;
  exportBatch: (exports: { data: ReportResponse; config: ExportConfig }[]) => Promise<void>;
  isExporting: boolean;
  progress: ExportProgress | null;
  lastResult: ExportResult | null;
  error: string | null;
  clearError: () => void;
  cancelExport: () => void;
}

export const useExport = (options: UseExportOptions = {}): UseExportReturn => {
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState<ExportProgress | null>(null);
  const [lastResult, setLastResult] = useState<ExportResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [abortController, setAbortController] = useState<AbortController | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const cancelExport = useCallback(() => {
    if (abortController) {
      abortController.abort();
      setAbortController(null);
      setIsExporting(false);
      setProgress(null);
    }
  }, [abortController]);

  const handleProgress = useCallback(
    (progressData: ExportProgress) => {
      setProgress(progressData);
      options.onProgress?.(progressData);
    },
    [options],
  );

  const exportData = useCallback(
    async (data: ReportResponse, config: ExportConfig): Promise<void> => {
      if (isExporting) {
        throw new Error('Export already in progress');
      }

      setIsExporting(true);
      setError(null);
      setProgress(null);
      setLastResult(null);

      // Create abort controller for cancellation
      const controller = new AbortController();
      setAbortController(controller);

      try {
        const result = await exportService.exportReport(data, config, handleProgress);

        if (controller.signal.aborted) {
          return;
        }

        setLastResult(result);

        if (result.success) {
          options.onSuccess?.(result);
        } else {
          const errorMessage = result.error ?? 'Export failed';
          setError(errorMessage);
          options.onError?.(errorMessage);
        }
      } catch (err) {
        if (controller.signal.aborted) {
          return;
        }

        const errorMessage = err instanceof Error ? err.message : 'Unknown export error';
        setError(errorMessage);
        options.onError?.(errorMessage);
      } finally {
        if (!controller.signal.aborted) {
          setIsExporting(false);
          setProgress(null);
          setAbortController(null);
        }
      }
    },
    [isExporting, handleProgress, options],
  );

  const exportBatch = useCallback(
    async (exports: { data: ReportResponse; config: ExportConfig }[]): Promise<void> => {
      if (isExporting) {
        throw new Error('Export already in progress');
      }

      setIsExporting(true);
      setError(null);
      setProgress(null);
      setLastResult(null);

      const controller = new AbortController();
      setAbortController(controller);

      try {
        const results = await exportService.exportBatch(exports, (overall, current) => {
          if (controller.signal.aborted) return;

          handleProgress({
            stage: 'processing',
            progress: overall,
            message: current,
          });
        });

        if (controller.signal.aborted) {
          return;
        }

        // Check if all exports were successful
        const failedExports = results.filter((r) => !r.success);

        if (failedExports.length === 0) {
          // All successful
          const newResult = {
            success: true,
            format: ExportFormat.PDF, // Default format for batch
            metadata: {
              recordCount: results.length,
              processingTime: 0,
            },
          };
          setLastResult(newResult);
          options.onSuccess?.(newResult);
        } else {
          // Some failed
          const errorMessage = `${failedExports.length} of ${results.length} exports failed`;
          setError(errorMessage);
          options.onError?.(errorMessage);
        }
      } catch (err) {
        if (controller.signal.aborted) {
          return;
        }

        const errorMessage = err instanceof Error ? err.message : 'Batch export failed';
        setError(errorMessage);
        options.onError?.(errorMessage);
      } finally {
        if (!controller.signal.aborted) {
          setIsExporting(false);
          setProgress(null);
          setAbortController(null);
        }
      }
    },
    [isExporting, handleProgress, options, lastResult],
  );

  return {
    exportData,
    exportBatch,
    isExporting,
    progress,
    lastResult,
    error,
    clearError,
    cancelExport,
  };
};

// Specialized hooks for different data types
export const useFinancialExport = (options: UseExportOptions = {}) => {
  const baseExport = useExport(options);

  const exportFinancialData = useCallback(
    async (financialData: any, format: ExportFormat = ExportFormat.PDF, filename?: string) => {
      const config: ExportConfig = {
        format,
        filename: filename || `mali_rapor_${new Date().toISOString().split('T')[0]}.${format}`,
        includeCharts: true,
        includeData: true,
        template: 'financial',
        options: {
          pageSize: 'A4',
          orientation: 'portrait',
          margins: { top: 20, right: 20, bottom: 20, left: 20 },
        },
      };

      const reportResponse: ReportResponse = {
        data: financialData,
        metadata: {
          total_records: 1,
          page: 1,
          page_size: 1,
          execution_time: 0,
          generated_at: new Date(),
        },
      };

      await baseExport.exportData(reportResponse, config);
    },
    [baseExport],
  );

  return {
    ...baseExport,
    exportFinancialData,
  };
};

export const useDonationExport = (options: UseExportOptions = {}) => {
  const baseExport = useExport(options);

  const exportDonationData = useCallback(
    async (donationData: any, format: ExportFormat = ExportFormat.EXCEL, filename?: string) => {
      const config: ExportConfig = {
        format,
        filename: filename || `bagis_analizi_${new Date().toISOString().split('T')[0]}.${format}`,
        includeCharts: true,
        includeData: true,
        template: 'donation',
        options: {
          pageSize: 'A4',
          orientation: 'landscape',
          margins: { top: 15, right: 15, bottom: 15, left: 15 },
        },
      };

      const reportResponse: ReportResponse = {
        data: donationData,
        metadata: {
          total_records: Array.isArray(donationData) ? donationData.length : 1,
          page: 1,
          page_size: 1000,
          execution_time: 0,
          generated_at: new Date(),
        },
      };

      await baseExport.exportData(reportResponse, config);
    },
    [baseExport],
  );

  return {
    ...baseExport,
    exportDonationData,
  };
};

export const useChartExport = (options: UseExportOptions = {}) => {
  const baseExport = useExport(options);

  const exportChart = useCallback(
    async (
      chartElement: HTMLElement,
      format: ExportFormat = ExportFormat.PNG,
      filename?: string,
      chartOptions?: {
        width?: number;
        height?: number;
        backgroundColor?: string;
        quality?: number;
      },
    ) => {
      const config: ExportConfig = {
        format,
        filename: filename || `grafik_${new Date().toISOString().split('T')[0]}.${format}`,
        includeCharts: true,
        includeData: false,
        options: {
          ...chartOptions,
          pageSize: 'A4',
          orientation: 'landscape',
        },
      };

      // Convert chart element to data
      const chartData = {
        element: chartElement,
        type: 'chart',
        timestamp: new Date(),
      };

      const reportResponse: ReportResponse = {
        data: chartData,
        metadata: {
          total_records: 1,
          page: 1,
          page_size: 1,
          execution_time: 0,
          generated_at: new Date(),
        },
      };

      await baseExport.exportData(reportResponse, config);
    },
    [baseExport],
  );

  return {
    ...baseExport,
    exportChart,
  };
};

// Static export templates - moved from useState to module constant
export const TEMPLATES = [
  { id: 'default', name: 'Varsayılan Şablon', description: 'Standart rapor formatı' },
  { id: 'executive', name: 'Yönetici Özeti', description: 'Özet bilgiler ve grafikler' },
  { id: 'detailed', name: 'Detaylı Rapor', description: 'Tüm veriler ve analizler' },
  { id: 'presentation', name: 'Sunum Formatı', description: 'Görsel ağırlıklı format' },
  { id: 'financial', name: 'Mali Rapor', description: 'Mali veriler için özelleştirilmiş' },
  { id: 'donation', name: 'Bağış Raporu', description: 'Bağış analizleri için özelleştirilmiş' },
] as const;

// Utility hook for export templates
export const useExportTemplates = () => {
  const getTemplate = useCallback((id: string) => {
    return TEMPLATES.find((t) => t.id === id);
  }, []);

  return {
    templates: TEMPLATES,
    getTemplate,
  };
};

export default useExport;
