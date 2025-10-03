/**
 * @fileoverview useDataExport Module - Application module
 * 
 * @author Dernek Yönetim Sistemi Team
 * @version 1.0.0
 */

import { useCallback, useRef, useState } from 'react';
import { toast } from 'sonner';
import { DATA_FORMATTERS, EXPORT_LIMITS, EXPORT_TEMPLATES, type ExportConfig, type ExportResult } from '../types/data';

// Specific types for different data structures
interface MemberData {
  name?: string;
  email?: string;
  phone?: string;
  membershipType?: string;
  status?: string;
  joinDate?: string | Date;
  totalDonations?: number;
  [key: string]: unknown;
}

interface DonationData {
  donorName?: string;
  amount?: number;
  type?: string;
  status?: string;
  date?: string | Date;
  paymentMethod?: string;
  campaign?: string;
  [key: string]: unknown;
}

interface AidData {
  applicantName?: string;
  aidType?: string;
  requestedAmount?: number;
  status?: string;
  urgency?: string;
  applicationDate?: string | Date;
  [key: string]: unknown;
}

// Union type for all exportable data
type ExportableData = MemberData | DonationData | AidData;

interface UseDataExportProps {
  onProgress?: (progress: number) => void;
  onComplete?: (result: ExportResult) => void;
  onError?: (error: string) => void;
}

/**
 * useDataExport function
 * 
 * @param {Object} params - Function parameters
 * @returns {void} Nothing
 */
export function useDataExport({ onProgress, onComplete, onError }: UseDataExportProps = {}) {
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Generate CSV content
  const generateCSV = useCallback((data: ExportableData[], config: ExportConfig): string => {
    const fields = config.fields ?? Object.keys(data[0] || {});
    const headers = config.customHeaders ?? EXPORT_TEMPLATES.member.headers;

    // Create header row
    const headerRow = fields.map((field) =>
      config.includeHeaders !== false ? (headers as Record<string, string>)[field] || field : field,
    );

    // Create data rows
    const dataRows = data.map((item) =>
      fields.map((field) => {
        let value = getNestedValue(item, field);

        // Format value based on type
        if (value instanceof Date) {
          value = DATA_FORMATTERS.date(value, 'short');
        } else if (typeof value === 'number' && field.includes('amount')) {
          value = DATA_FORMATTERS.currency(value);
        } else if (typeof value === 'boolean') {
          value = DATA_FORMATTERS.boolean(value);
        }

        // Escape CSV special characters
        const stringValue = String(value ?? '');
        if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
          return `"${stringValue.replace(/"/g, '""')}"`;
        }
        return stringValue;
      }),
    );

    // Combine header and data
    const allRows = config.includeHeaders !== false ? [headerRow, ...dataRows] : dataRows;
    return allRows.map((row) => row.join(',')).join('\n');
  }, []);

  // Generate Excel content (simplified - in real app would use library like xlsx)
  const generateExcel = useCallback(
    (data: ExportableData[], config: ExportConfig): Blob => {
      // This is a simplified version - in production use xlsx library
      const csvContent = generateCSV(data, config);
      const blob = new Blob([csvContent], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      return blob;
    },
    [generateCSV],
  );

  // Generate PDF content (simplified - in real app would use library like jsPDF)
  const generatePDF = useCallback(
    async (data: ExportableData[], config: ExportConfig): Promise<Blob> => {
      // This is a simplified version - in production use jsPDF or similar
      const content = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>${config.filename ?? 'Export'}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f5f5f5; font-weight: bold; }
          .header { text-align: center; margin-bottom: 20px; }
          .footer { margin-top: 20px; text-align: center; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${config.filename ?? 'Veri Raporu'}</h1>
          <p>Oluşturulma Tarihi: ${DATA_FORMATTERS.date(new Date())}</p>
        </div>

        <table>
          <thead>
            <tr>
              ${(config.fields ?? Object.keys(data[0] || {}))
                .map((field) => `<th>${config.customHeaders?.[field] || field}</th>`)
                .join('')}
            </tr>
          </thead>
          <tbody>
            ${data
              .map(
                (item) => `
              <tr>
                ${(config.fields ?? Object.keys(item))
                  .map((field) => {
                    let value = getNestedValue(item, field);
                    if (value instanceof Date) {
                      value = DATA_FORMATTERS.date(value);
                    } else if (typeof value === 'number' && field.includes('amount')) {
                      value = DATA_FORMATTERS.currency(value);
                    }
                    return `<td>${value ?? ''}</td>`;
                  })
                  .join('')}
              </tr>
            `,
              )
              .join('')}
          </tbody>
        </table>

        <div class="footer">
          <p>Toplam ${data.length} kayıt • ${new Date().toLocaleString('tr-TR')}</p>
        </div>
      </body>
      </html>
    `;

      return new Blob([content], { type: 'text/html' });
    },
    [],
  );

  // Generate JSON content
  const generateJSON = useCallback((data: ExportableData[], config: ExportConfig): string => {
    const filteredData = config.fields
      ? data.map((item) => {
          const filtered: ExportableData = {};
          config.fields!.forEach((field) => {
            filtered[field] = getNestedValue(item, field);
          });
          return filtered;
        })
      : data;

    return JSON.stringify(
      {
        exportInfo: {
          timestamp: new Date().toISOString(),
          recordCount: data.length,
          fields: config.fields ?? Object.keys(data[0] || {}),
          filters: config.filters,
        },
        data: filteredData,
      },
      null,
      2,
    );
  }, []);

  // Helper function to get nested object values
  const getNestedValue = (obj: Record<string, unknown>, path: string): unknown => {
    return path.split('.').reduce((current: unknown, key: string) => {
      return (current as Record<string, unknown>)?.[key];
    }, obj);
  };

  // Validate export configuration
  const validateConfig = useCallback((data: ExportableData[], config: ExportConfig): string[] => {
    const errors: string[] = [];

    if (!data ?? data.length === 0) {
      errors.push('Dışa aktarılacak veri bulunamadı');
    }

    if (data.length > EXPORT_LIMITS[config.format]) {
      errors.push(
        `${config.format.toUpperCase()} formatı için maksimum ${
          EXPORT_LIMITS[config.format]
        } kayıt destekleniyor`,
      );
    }

    if (config.fields && config.fields.length === 0) {
      errors.push('En az bir alan seçilmelidir');
    }

    if (config.dateRange && config.dateRange.start > config.dateRange.end) {
      errors.push('Başlangıç tarihi bitiş tarihinden büyük olamaz');
    }

    return errors;
  }, []);

  // Main export function
  const exportData = useCallback(
    async (data: ExportableData[], config: ExportConfig): Promise<ExportResult> => {
      // Validate configuration
      const validationErrors = validateConfig(data, config);
      if (validationErrors.length > 0) {
        const error = validationErrors.join(', ');
        onError?.(error);
        return {
          success: false,
          filename: '',
          size: 0,
          recordCount: 0,
          error,
        };
      }

      setIsExporting(true);
      setProgress(0);

      // Cancel previous export
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      abortControllerRef.current = new AbortController();

      try {
        // Apply date range filter if specified
        let filteredData = data;
        if (config.dateRange) {
          filteredData = data.filter((item) => {
            const dateValue =
              (item as Record<string, unknown>).date ||
              (item as Record<string, unknown>).createdAt ||
              (item as Record<string, unknown>).timestamp;
            const itemDate = new Date(dateValue as string | number | Date);
            return itemDate >= config.dateRange!.start && itemDate <= config.dateRange!.end;
          });
        }

        // Generate filename if not provided
        const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
        const filename = config.filename || `export-${timestamp}.${config.format}`;

        // Update progress
        onProgress?.(25);
        setProgress(25);

        let blob: Blob;
        let content: string;

        // Generate content based on format
        switch (config.format) {
          case 'csv':
            content = generateCSV(filteredData, config);
            blob = new Blob([`\ufeff${  content}`], { type: 'text/csv;charset=utf-8;' });
            break;

          case 'excel':
            blob = generateExcel(filteredData, config);
            break;

          case 'pdf':
            blob = await generatePDF(filteredData, config);
            break;

          case 'json':
            content = generateJSON(filteredData, config);
            blob = new Blob([content], { type: 'application/json' });
            break;

          default:
            throw new Error(`Desteklenmeyen format: ${config.format}`);
        }

        // Update progress
        onProgress?.(75);
        setProgress(75);

        // Create download link
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        // Update progress
        onProgress?.(100);
        setProgress(100);

        const result: ExportResult = {
          success: true,
          filename,
          downloadUrl: url,
          size: blob.size,
          recordCount: filteredData.length,
          message: `${filteredData.length} kayıt başarıyla dışa aktarıldı`,
        };

        onComplete?.(result);
        toast.success(`${config.format.toUpperCase()} dosyası başarıyla indirildi`);

        return result;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Dışa aktarma sırasında hata oluştu';
        onError?.(errorMessage);
        toast.error(errorMessage);

        return {
          success: false,
          filename: '',
          size: 0,
          recordCount: 0,
          error: errorMessage,
        };
      } finally {
        setIsExporting(false);
        setProgress(0);
      }
    },
    [
      validateConfig,
      generateCSV,
      generateExcel,
      generatePDF,
      generateJSON,
      onProgress,
      onComplete,
      onError,
    ],
  );

  // Cancel export
  const cancelExport = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setIsExporting(false);
    setProgress(0);
    toast.info('Dışa aktarma iptal edildi');
  }, []);

  // Quick export functions
  const exportAsCSV = useCallback(
    (data: ExportableData[], config: Partial<ExportConfig> = {}) => {
      return exportData(data, { ...config, format: 'csv' });
    },
    [exportData],
  );

  const exportAsExcel = useCallback(
    (data: ExportableData[], config: Partial<ExportConfig> = {}) => {
      return exportData(data, { ...config, format: 'excel' });
    },
    [exportData],
  );

  const exportAsPDF = useCallback(
    (data: ExportableData[], config: Partial<ExportConfig> = {}) => {
      return exportData(data, { ...config, format: 'pdf' });
    },
    [exportData],
  );

  const exportAsJSON = useCallback(
    (data: ExportableData[], config: Partial<ExportConfig> = {}) => {
      return exportData(data, { ...config, format: 'json' });
    },
    [exportData],
  );

  return {
    isExporting,
    progress,
    exportData,
    cancelExport,

    // Quick export methods
    exportAsCSV,
    exportAsExcel,
    exportAsPDF,
    exportAsJSON,

    // Utility methods
    validateConfig,
    generateCSV,
  };
}
