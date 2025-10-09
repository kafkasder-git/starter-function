/**
 * @fileoverview useDataImport Module - Application module
 * 
 * @author Dernek Yönetim Sistemi Team
 * @version 1.0.0
 */

import { useCallback, useRef, useState } from 'react';
import { toast } from 'sonner';
import { IMPORT_VALIDATION_RULES, type ImportConfig, type ImportError, type ImportResult, type ImportWarning } from '../types/data';

interface UseDataImportProps {
  onProgress?: (progress: number) => void;
  onComplete?: (result: ImportResult) => void;
  onError?: (error: string) => void;
  onValidationError?: (errors: ImportError[]) => void;
}

/**
 * useDataImport function
 * 
 * @param {Object} params - Function parameters
 * @returns {void} Nothing
 */
export function useDataImport({
  onProgress,
  onComplete,
  onError,
  onValidationError,
}: UseDataImportProps = {}) {
  const [isImporting, setIsImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [previewData, setPreviewData] = useState<unknown[]>([]);
  const [fieldMapping, setFieldMapping] = useState<Record<string, string>>({});
  const [validationErrors, setValidationErrors] = useState<ImportError[]>([]);
  const abortControllerRef = useRef<AbortController>();

  // Parse CSV file
  const parseCSV = useCallback((content: string, config: ImportConfig): any[] => {
    const lines = content.split('\n').filter((line) => line.trim());
    const delimiter = config.delimiter ?? ',';

    // Skip header rows if specified
    const dataLines = config.skipRows ? lines.slice(config.skipRows) : lines;

    const headers = dataLines[0]?.split(delimiter).map((h) => h.trim().replace(/"/g, ''));
    const rows = dataLines.slice(1);

    return rows.map((row, index) => {
      const values = parseCSVRow(row, delimiter);
      const item: any = { _rowNumber: index + 1 };

      headers?.forEach((header, i) => {
        if (values[i] !== undefined) {
          item[header] = values[i].trim();
        }
      });

      return item;
    });
  }, []);

  // Parse CSV row handling quoted values
  const parseCSVRow = (row: string, delimiter: string): string[] => {
    const values: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < row.length; i++) {
      const char = row[i];

      if (char === '"') {
        if (inQuotes && row[i + 1] === '"') {
          // Escaped quote
          current += '"';
          i++; // Skip next quote
        } else {
          // Toggle quote state
          inQuotes = !inQuotes;
        }
      } else if (char === delimiter && !inQuotes) {
        // End of field
        values.push(current);
        current = '';
      } else {
        current += char;
      }
    }

    // Add last field
    values.push(current);
    return values;
  };

  // Parse Excel file (simplified - in real app would use library like xlsx)
  const parseExcel = useCallback(
    async (file: File): Promise<any[]> => {
      // This is a simplified version - in production use xlsx library
      return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (e) => {
          try {
            // For testing purposes, treat as CSV
            const content = e.target?.result as string;
            const data = parseCSV(content, { format: 'csv', file });
            resolve(data);
          } catch (error) {
            reject(error);
          }
        };

        reader.onerror = () => {
          reject(new Error('Dosya okunamadı'));
        };
        reader.readAsText(file);
      });
    },
    [parseCSV],
  );

  // Parse JSON file
  const parseJSON = useCallback(async (file: File): Promise<any[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const json = JSON.parse(content);

          // Handle different JSON structures
          let data: any[];
          if (Array.isArray(json)) {
            data = json;
          } else if (json.data && Array.isArray(json.data)) {
            const { data: jsonData } = json;
            data = jsonData;
          } else {
            data = [json];
          }

          // Add row numbers
          data.forEach((item, index) => {
            item._rowNumber = index + 1;
          });

          resolve(data);
        } catch (error) {
          reject(new Error('Geçersiz JSON formatı'));
        }
      };

      reader.onerror = () => {
        reject(new Error('Dosya okunamadı'));
      };
      reader.readAsText(file);
    });
  }, []);

  // Validate imported data
  const validateData = useCallback(
    (data: any[], dataType: string): { errors: ImportError[]; warnings: ImportWarning[] } => {
      const errors: ImportError[] = [];
      const warnings: ImportWarning[] = [];
      const rules = IMPORT_VALIDATION_RULES[dataType as keyof typeof IMPORT_VALIDATION_RULES];

      if (!rules) {
        return { errors, warnings };
      }

      data.forEach((item, index) => {
        const rowNumber = item._rowNumber ?? index + 1;

        // Check required fields
        rules.required?.forEach((field) => {
          if (!item[field] ?? item[field].toString().trim() === '') {
            errors.push({
              row: rowNumber,
              field,
              value: item[field],
              message: `${field} alanı zorunludur`,
              code: 'REQUIRED_FIELD',
              severity: 'error',
            });
          }
        });

        // Check email format
        rules.email?.forEach((field) => {
          if (item[field] && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(item[field])) {
            errors.push({
              row: rowNumber,
              field,
              value: item[field],
              message: `${field} alanı geçerli bir e-posta adresi olmalıdır`,
              code: 'INVALID_EMAIL',
              severity: 'error',
            });
          }
        });

        // Check phone format
        rules.phone?.forEach((field) => {
          if (item[field] && !/^(\+90|0)?5[0-9]{9}$/.test(item[field].replace(/\D/g, ''))) {
            warnings.push({
              row: rowNumber,
              field,
              message: `${field} alanı geçerli bir telefon numarası formatında değil`,
              code: 'INVALID_PHONE',
            });
          }
        });

        // Check number format
        rules.number?.forEach((field) => {
          if (item[field] && isNaN(Number(item[field]))) {
            errors.push({
              row: rowNumber,
              field,
              value: item[field],
              message: `${field} alanı sayısal değer olmalıdır`,
              code: 'INVALID_NUMBER',
              severity: 'error',
            });
          }
        });

        // Check date format
        rules.date?.forEach((field) => {
          if (item[field] && isNaN(Date.parse(item[field]))) {
            errors.push({
              row: rowNumber,
              field,
              value: item[field],
              message: `${field} alanı geçerli bir tarih formatında olmalıdır`,
              code: 'INVALID_DATE',
              severity: 'error',
            });
          }
        });
      });

      // Check for duplicates
      rules.unique?.forEach((field) => {
        const values = new Map();
        data.forEach((item, index) => {
          const value = item[field];
          if (value) {
            if (values.has(value)) {
              const firstRow = values.get(value);
              errors.push({
                row: item._rowNumber ?? index + 1,
                field,
                value,
                message: `${field} alanı tekrar ediyor (ilk görülme: ${firstRow}. satır)`,
                code: 'DUPLICATE_VALUE',
                severity: 'error',
              });
            } else {
              values.set(value, item._rowNumber ?? index + 1);
            }
          }
        });
      });

      return { errors, warnings };
    },
    [],
  );

  // Preview file content
  const previewFile = useCallback(
    async (config: ImportConfig): Promise<any[]> => {
      try {
        let data: unknown[];

        switch (config.format) {
          case 'csv':
            const csvContent = await readFileAsText(config.file);
            data = parseCSV(csvContent, config);
            break;

          case 'excel':
            data = await parseExcel(config.file);
            break;

          case 'json':
            data = await parseJSON(config.file);
            break;

          default:
            throw new Error(`Desteklenmeyen format: ${config.format}`);
        }

        // Take only first 10 rows for preview
        const preview = data.slice(0, 10);
        setPreviewData(preview);

        // Auto-generate field mapping
        if (data.length > 0) {
          const mapping: Record<string, string> = {};
          Object.keys(data[0] as object).forEach((key) => {
            if (key !== '_rowNumber') {
              mapping[key] = key;
            }
          });
          setFieldMapping(mapping);
        }

        return preview;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Dosya önizleme hatası';
        onError?.(errorMessage);
        throw error;
      }
    },
    [parseCSV, parseExcel, parseJSON, onError],
  );

  // Read file as text
  const readFileAsText = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        resolve(e.target?.result as string);
      };
      reader.onerror = () => {
        reject(new Error('Dosya okunamadı'));
      };
      reader.readAsText(file, 'UTF-8');
    });
  };

  // Main import function
  const importData = useCallback(
    async (config: ImportConfig, dataType = 'member'): Promise<ImportResult> => {
      setIsImporting(true);
      setProgress(0);
      setValidationErrors([]);

      // Cancel previous import
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      abortControllerRef.current = new AbortController();

      try {
        // Parse file
        onProgress?.(10);
        setProgress(10);

        let data: Record<string, unknown>[];

        switch (config.format) {
          case 'csv':
            const csvContent = await readFileAsText(config.file);
            data = parseCSV(csvContent, config);
            break;

          case 'excel':
            data = await parseExcel(config.file);
            break;

          case 'json':
            data = await parseJSON(config.file);
            break;

          default:
            throw new Error(`Desteklenmeyen format: ${config.format}`);
        }

        onProgress?.(30);
        setProgress(30);

        // Apply field mapping if provided
        if (config.mapping) {
          data = data.map((item) => {
            const mapped: any = { _rowNumber: item._rowNumber };
            Object.entries(config.mapping!).forEach(([source, target]) => {
              if (item[source] !== undefined) {
                mapped[target] = item[source];
              }
            });
            return mapped;
          });
        }

        onProgress?.(50);
        setProgress(50);

        // Validate data if requested
        let errors: ImportError[] = [];
        let warnings: ImportWarning[] = [];

        if (config.validateData !== false) {
          const validation = validateData(data, dataType);
          const { errors: validationErrors, warnings: validationWarnings } = validation;
          errors = validationErrors;
          warnings = validationWarnings;
          setValidationErrors(errors);
          onValidationError?.(errors);
        }

        onProgress?.(70);
        setProgress(70);

        // Process data in batches
        const batchSize = config.batchSize ?? 100;
        let processedCount = 0;
        let successCount = 0;
        let errorCount = 0;
        const duplicates = 0;
        const skipped = errors.length;

        // Filter out rows with errors if validation is enabled
        const validData =
          config.validateData !== false
            ? data.filter((item) => !errors.some((error) => error.row === item._rowNumber))
            : data;

        // Simulate processing (in real app, this would be API calls)
        for (let i = 0; i < validData.length; i += batchSize) {
          const batch = validData.slice(i, i + batchSize);

          try {
            // Simulate API call
            await new Promise((resolve) => setTimeout(resolve, 100));

            processedCount += batch.length;
            successCount += batch.length;

            const progress = 70 + (processedCount / validData.length) * 25;
            onProgress?.(progress);
            setProgress(progress);
          } catch (error) {
            errorCount += batch.length;
          }

          // Check if cancelled
          if (abortControllerRef.current?.signal.aborted) {
            throw new Error('İçe aktarma iptal edildi');
          }
        }

        onProgress?.(100);
        setProgress(100);

        const result: ImportResult = {
          success: errorCount === 0,
          processedCount,
          successCount,
          errorCount,
          errors,
          warnings,
          duplicates,
          skipped,
          message: `${successCount} kayıt başarıyla içe aktarıldı`,
        };

        onComplete?.(result);
        toast.success(`${successCount} kayıt başarıyla içe aktarıldı`);

        return result;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'İçe aktarma sırasında hata oluştu';
        onError?.(errorMessage);
        toast.error(errorMessage);

        return {
          success: false,
          processedCount: 0,
          successCount: 0,
          errorCount: 0,
          errors: [],
          warnings: [],
          duplicates: 0,
          skipped: 0,
          message: errorMessage,
        };
      } finally {
        setIsImporting(false);
        setProgress(0);
      }
    },
    [
      parseCSV,
      parseExcel,
      parseJSON,
      validateData,
      onProgress,
      onComplete,
      onError,
      onValidationError,
    ],
  );

  // Cancel import
  const cancelImport = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setIsImporting(false);
    setProgress(0);
    toast.info('İçe aktarma iptal edildi');
  }, []);

  // Update field mapping
  const updateFieldMapping = useCallback((sourceField: string, targetField: string) => {
    setFieldMapping((prev) => ({
      ...prev,
      [sourceField]: targetField,
    }));
  }, []);

  // Reset import state
  const resetImport = useCallback(() => {
    setPreviewData([]);
    setFieldMapping({});
    setValidationErrors([]);
    setProgress(0);
  }, []);

  return {
    isImporting,
    progress,
    previewData,
    fieldMapping,
    validationErrors,

    // Main functions
    importData,
    previewFile,
    cancelImport,

    // Utility functions
    updateFieldMapping,
    resetImport,
    validateData,
  };
}
