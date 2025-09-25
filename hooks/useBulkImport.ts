/**
 * @fileoverview useBulkImport Module - Application module
 * 
 * @author Dernek Yönetim Sistemi Team
 * @version 1.0.0
 */

// 📊 BULK DATA IMPORT HOOK
// High-performance bulk data import with progress tracking and error handling

import { useState, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import { z } from 'zod';

/**
 * BulkImportProgress Interface
 * 
 * @interface BulkImportProgress
 */
export interface BulkImportProgress {
  readonly total: number;
  readonly processed: number;
  readonly successful: number;
  readonly failed: number;
  readonly percentage: number;
  readonly currentBatch: number;
  readonly totalBatches: number;
  readonly estimatedTimeRemaining: number;
  readonly processingSpeed: number; // records per second
}

/**
 * BulkImportError Interface
 * 
 * @interface BulkImportError
 */
export interface BulkImportError {
  readonly rowIndex: number;
  readonly rowData: Record<string, unknown>;
  readonly error: string;
  readonly field?: string;
}

/**
 * BulkImportResult Interface
 * 
 * @interface BulkImportResult
 */
export interface BulkImportResult<T> {
  readonly successful: T[];
  readonly failed: BulkImportError[];
  readonly summary: {
    readonly total: number;
    readonly successful: number;
    readonly failed: number;
    readonly duration: number;
    readonly averageSpeed: number;
  };
}

/**
 * BulkImportOptions Interface
 * 
 * @interface BulkImportOptions
 */
export interface BulkImportOptions {
  readonly batchSize?: number;
  readonly delayBetweenBatches?: number;
  readonly maxRetries?: number;
  readonly validateBeforeImport?: boolean;
  readonly rollbackOnError?: boolean;
  readonly skipDuplicates?: boolean;
}

const DEFAULT_OPTIONS: Required<BulkImportOptions> = {
  batchSize: 50, // Process 50 records at a time
  delayBetweenBatches: 100, // 100ms delay between batches
  maxRetries: 3,
  validateBeforeImport: true,
  rollbackOnError: false,
  skipDuplicates: true,
};

/**
 * High-performance bulk import hook with comprehensive error handling
 * Supports batch processing, progress tracking, and rollback mechanisms
 */
/**
 * useBulkImport function
 * 
 * @param {Object} params - Function parameters
 * @returns {void} Nothing
 */
export function useBulkImport<T extends Record<string, unknown>>(
  schema: z.ZodSchema<T>,
  importFunction: (batch: T[]) => Promise<T[]>,
  options: BulkImportOptions = {},
) {
  const [isImporting, setIsImporting] = useState(false);
  const [progress, setProgress] = useState<BulkImportProgress>({
    total: 0,
    processed: 0,
    successful: 0,
    failed: 0,
    percentage: 0,
    currentBatch: 0,
    totalBatches: 0,
    estimatedTimeRemaining: 0,
    processingSpeed: 0,
  });

  const [errors, setErrors] = useState<BulkImportError[]>([]);
  const [importedData, setImportedData] = useState<T[]>([]);

  // Performance tracking
  const startTimeRef = useRef<number>(0);
  const processedCountRef = useRef<number>(0);
  const abortControllerRef = useRef<AbortController | null>(null);

  const finalOptions = { ...DEFAULT_OPTIONS, ...options };

  /**
   * Validate data before import
   */
  const validateData = useCallback(
    (data: unknown[]): { valid: T[]; errors: BulkImportError[] } => {
      const validData: T[] = [];
      const validationErrors: BulkImportError[] = [];

      data.forEach((item, index) => {
        try {
          const validatedItem = schema.parse(item);
          validData.push(validatedItem);
        } catch (error) {
          if (error instanceof z.ZodError) {
            const errorMessage = error.issues
              .map((e: any) => `${e.path.join('.')}: ${e.message}`)
              .join(', ');
            validationErrors.push({
              rowIndex: index + 1,
              rowData: item as Record<string, unknown>,
              error: errorMessage,
              field: error.issues[0]?.path.join('.'),
            });
          } else {
            validationErrors.push({
              rowIndex: index + 1,
              rowData: item as Record<string, unknown>,
              error: 'Bilinmeyen doğrulama hatası',
            });
          }
        }
      });

      return { valid: validData, errors: validationErrors };
    },
    [schema],
  );

  /**
   * Process data in batches with progress tracking
   */
  const processBatches = useCallback(
    async (validData: T[]): Promise<BulkImportResult<T>> => {
      const totalBatches = Math.ceil(validData.length / finalOptions.batchSize);
      const successful: T[] = [];
      const processingErrors: BulkImportError[] = [];

      startTimeRef.current = performance.now();
      processedCountRef.current = 0;

      for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
        // Check if import was cancelled
        if (abortControllerRef.current?.signal.aborted) {
          throw new Error('Import cancelled by user');
        }

        const startIndex = batchIndex * finalOptions.batchSize;
        const endIndex = Math.min(startIndex + finalOptions.batchSize, validData.length);
        const batch = validData.slice(startIndex, endIndex);

        let retryCount = 0;
        let batchSuccess = false;

        while (!batchSuccess && retryCount < finalOptions.maxRetries) {
          try {
            const batchResult = await importFunction(batch);
            successful.push(...batchResult);
            batchSuccess = true;
          } catch (error) {
            retryCount++;

            if (retryCount >= finalOptions.maxRetries) {
              // Add all batch items as failed
              batch.forEach((item, itemIndex) => {
                processingErrors.push({
                  rowIndex: startIndex + itemIndex + 1,
                  rowData: item,
                  error: error instanceof Error ? error.message : 'Batch processing failed',
                });
              });
            } else {
              // Wait before retry
              await new Promise((resolve) => setTimeout(resolve, 1000 * retryCount));
            }
          }
        }

        processedCountRef.current += batch.length;

        // Update progress
        const elapsed = performance.now() - startTimeRef.current;
        const processingSpeed = processedCountRef.current / (elapsed / 1000);
        const remaining = validData.length - processedCountRef.current;
        const estimatedTimeRemaining = remaining / processingSpeed;

        setProgress({
          total: validData.length,
          processed: processedCountRef.current,
          successful: successful.length,
          failed: processingErrors.length,
          percentage: (processedCountRef.current / validData.length) * 100,
          currentBatch: batchIndex + 1,
          totalBatches,
          estimatedTimeRemaining,
          processingSpeed,
        });

        // Delay between batches to prevent overwhelming the system
        if (batchIndex < totalBatches - 1) {
          await new Promise((resolve) => setTimeout(resolve, finalOptions.delayBetweenBatches));
        }
      }

      const endTime = performance.now();
      const totalDuration = (endTime - startTimeRef.current) / 1000;

      return {
        successful,
        failed: processingErrors,
        summary: {
          total: validData.length,
          successful: successful.length,
          failed: processingErrors.length,
          duration: totalDuration,
          averageSpeed: validData.length / totalDuration,
        },
      };
    },
    [finalOptions, importFunction],
  );

  /**
   * Remove duplicates based on a key field
   */
  const removeDuplicates = useCallback(
    (data: T[], keyField: keyof T): T[] => {
      if (!finalOptions.skipDuplicates) return data;

      const seen = new Set();
      return data.filter((item) => {
        const key = item[keyField];
        if (seen.has(key)) {
          return false;
        }
        seen.add(key);
        return true;
      });
    },
    [finalOptions.skipDuplicates],
  );

  /**
   * Main import function
   */
  const startImport = useCallback(
    async (data: unknown[], duplicateKeyField?: keyof T): Promise<BulkImportResult<T>> => {
      if (isImporting) {
        throw new Error('Import already in progress');
      }

      setIsImporting(true);
      setErrors([]);
      setImportedData([]);
      setProgress({
        total: 0,
        processed: 0,
        successful: 0,
        failed: 0,
        percentage: 0,
        currentBatch: 0,
        totalBatches: 0,
        estimatedTimeRemaining: 0,
        processingSpeed: 0,
      });

      // Create abort controller for cancellation
      abortControllerRef.current = new AbortController();

      try {
        // Step 1: Validate data
        toast.info('Veriler doğrulanıyor...', { duration: 2000 });
        const { valid: validData, errors: validationErrors } = validateData(data);

        if (validationErrors.length > 0) {
          setErrors(validationErrors);

          if (validData.length === 0) {
            throw new Error(
              `Tüm veriler geçersiz. ${validationErrors.length} doğrulama hatası bulundu.`,
            );
          }

          toast.warning(
            `${validationErrors.length} geçersiz kayıt atlandı. ${validData.length} kayıt işlenecek.`,
            { duration: 4000 },
          );
        }

        // Step 2: Remove duplicates if specified
        let processData = validData;
        if (duplicateKeyField) {
          const beforeCount = processData.length;
          processData = removeDuplicates(processData, duplicateKeyField);
          const removedCount = beforeCount - processData.length;

          if (removedCount > 0) {
            toast.info(`${removedCount} tekrarlayan kayıt kaldırıldı.`, { duration: 3000 });
          }
        }

        if (processData.length === 0) {
          throw new Error('İşlenecek geçerli veri bulunamadı.');
        }

        // Step 3: Process in batches
        toast.info(`${processData.length} kayıt işleniyor...`, { duration: 3000 });
        const result = await processBatches(processData);

        setImportedData(result.successful);
        setErrors((prev) => [...prev, ...result.failed]);

        // Success notification
        if (result.failed.length === 0) {
          toast.success(
            `✅ Tüm kayıtlar başarıyla içe aktarıldı! (${result.successful.length} kayıt, ${result.summary.duration.toFixed(1)}s)`,
            { duration: 5000 },
          );
        } else {
          toast.warning(
            `⚠️ ${result.successful.length} kayıt başarılı, ${result.failed.length} kayıt başarısız`,
            { duration: 5000 },
          );
        }

        return result;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Bilinmeyen hata oluştu';
        toast.error(`❌ İçe aktarma başarısız: ${errorMessage}`, { duration: 5000 });
        throw error;
      } finally {
        setIsImporting(false);
        abortControllerRef.current = null;
      }
    },
    [isImporting, validateData, removeDuplicates, processBatches],
  );

  /**
   * Cancel ongoing import
   */
  const cancelImport = useCallback(() => {
    if (abortControllerRef.current && !abortControllerRef.current.signal.aborted) {
      abortControllerRef.current.abort();
      toast.info('İçe aktarma iptal edildi', { duration: 3000 });
    }
  }, []);

  /**
   * Clear import results
   */
  const clearResults = useCallback(() => {
    setErrors([]);
    setImportedData([]);
    setProgress({
      total: 0,
      processed: 0,
      successful: 0,
      failed: 0,
      percentage: 0,
      currentBatch: 0,
      totalBatches: 0,
      estimatedTimeRemaining: 0,
      processingSpeed: 0,
    });
  }, []);

  /**
   * Export errors to CSV for review
   */
  const exportErrors = useCallback(() => {
    if (errors.length === 0) return;

    const csvContent = [
      'Satır,Hata,Alan,Veri',
      ...errors.map((error) =>
        [
          error.rowIndex,
          error.error.replace(/,/g, ';'),
          error.field ?? '',
          JSON.stringify(error.rowData).replace(/,/g, ';'),
        ].join(','),
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `import-errors-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success('Hatalar CSV dosyasına aktarıldı', { duration: 3000 });
  }, [errors]);

  return {
    // State
    isImporting,
    progress,
    errors,
    importedData,

    // Actions
    startImport,
    cancelImport,
    clearResults,
    exportErrors,

    // Utilities
    hasErrors: errors.length > 0,
    hasData: importedData.length > 0,
    canCancel: isImporting && abortControllerRef.current !== null,
  };
}

export default useBulkImport;
