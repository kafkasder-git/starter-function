import { useCallback, useRef, useState } from 'react';
import { toast } from 'sonner';
import type { BulkError, BulkOperation } from '../types/data';

interface UseBulkOperationsProps {
  onProgress?: (operation: BulkOperation) => void;
  onComplete?: (operation: BulkOperation) => void;
  onError?: (operation: BulkOperation, error: string) => void;
}

export function useBulkOperations({
  onProgress,
  onComplete,
  onError,
}: UseBulkOperationsProps = {}) {
  const [activeOperations, setActiveOperations] = useState<Map<string, BulkOperation>>(new Map());
  const abortControllersRef = useRef<Map<string, AbortController>>(new Map());

  // Create a new bulk operation
  const createOperation = useCallback(
    (type: BulkOperation['type'], totalItems: number): BulkOperation => {
      const id = `${type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      const operation: BulkOperation = {
        id,
        type,
        status: 'pending',
        progress: 0,
        totalItems,
        processedItems: 0,
        successItems: 0,
        errorItems: 0,
        startTime: new Date(),
        errors: [],
      };

      setActiveOperations((prev) => new Map(prev).set(id, operation));
      return operation;
    },
    [],
  );

  // Update operation status
  const updateOperation = useCallback(
    (id: string, updates: Partial<BulkOperation>) => {
      setActiveOperations((prev) => {
        const newMap = new Map(prev);
        const operation = newMap.get(id);
        if (operation) {
          const updated = { ...operation, ...updates };
          newMap.set(id, updated);
          onProgress?.(updated);

          if (updated.status === 'completed' || updated.status === 'failed') {
            onComplete?.(updated);
          }
        }
        return newMap;
      });
    },
    [onProgress, onComplete],
  );

  // Bulk update operation
  const bulkUpdate = useCallback(
    async (
      items: any[],
      updateData: Record<string, any>,
      options: {
        batchSize?: number;
        delay?: number;
        onItemUpdate?: (item: any, result: any) => void;
        validate?: (item: any) => string | null;
      } = {},
    ): Promise<BulkOperation> => {
      const operation = createOperation('update', items.length);
      const { batchSize = 50, delay = 100, onItemUpdate, validate } = options;

      // Create abort controller
      const abortController = new AbortController();
      abortControllersRef.current.set(operation.id, abortController);

      updateOperation(operation.id, { status: 'running' });

      try {
        for (let i = 0; i < items.length; i += batchSize) {
          // Check if operation was cancelled
          if (abortController.signal.aborted) {
            updateOperation(operation.id, {
              status: 'cancelled',
              endTime: new Date(),
            });
            return operation;
          }

          const batch = items.slice(i, i + batchSize);
          const batchPromises = batch.map(async (item, batchIndex) => {
            const itemIndex = i + batchIndex;

            try {
              // Validate item if validator provided
              if (validate) {
                const validationError = validate(item);
                if (validationError) {
                  const error: BulkError = {
                    itemId: item.id || itemIndex,
                    message: validationError,
                    code: 'VALIDATION_ERROR',
                    data: item,
                  };

                  updateOperation(operation.id, {
                    errorItems: (activeOperations.get(operation.id)?.errorItems || 0) + 1,
                    errors: [...(activeOperations.get(operation.id)?.errors || []), error],
                  });
                  return;
                }
              }

              // Simulate API call (replace with actual API call)
              await new Promise((resolve) => setTimeout(resolve, 50));

              // Apply updates (in real app, this would be an API call)
              const updatedItem = { ...item, ...updateData, updatedAt: new Date() };

              onItemUpdate?.(item, updatedItem);

              updateOperation(operation.id, {
                processedItems: (activeOperations.get(operation.id)?.processedItems || 0) + 1,
                successItems: (activeOperations.get(operation.id)?.successItems || 0) + 1,
                progress: Math.round(((itemIndex + 1) / items.length) * 100),
              });
            } catch (error) {
              const bulkError: BulkError = {
                itemId: item.id || itemIndex,
                message: error instanceof Error ? error.message : 'Bilinmeyen hata',
                code: 'UPDATE_ERROR',
                data: item,
              };

              updateOperation(operation.id, {
                processedItems: (activeOperations.get(operation.id)?.processedItems || 0) + 1,
                errorItems: (activeOperations.get(operation.id)?.errorItems || 0) + 1,
                errors: [...(activeOperations.get(operation.id)?.errors || []), bulkError],
              });
            }
          });

          await Promise.all(batchPromises);

          // Add delay between batches
          if (delay > 0 && i + batchSize < items.length) {
            await new Promise((resolve) => setTimeout(resolve, delay));
          }
        }

        updateOperation(operation.id, {
          status: 'completed',
          endTime: new Date(),
          progress: 100,
        });

        const currentOperation = activeOperations.get(operation.id);
        const successCount = currentOperation?.successItems || 0;
        const errorCount = currentOperation?.errorItems || 0;

        if (errorCount === 0) {
          toast.success(`${successCount} kayıt başarıyla güncellendi`);
        } else {
          toast.warning(`${successCount} kayıt güncellendi, ${errorCount} kayıtta hata oluştu`);
        }
      } catch (error) {
        updateOperation(operation.id, {
          status: 'failed',
          endTime: new Date(),
        });

        const errorMessage = error instanceof Error ? error.message : 'Toplu güncelleme hatası';
        onError?.(activeOperations.get(operation.id)!, errorMessage);
        toast.error(errorMessage);
      } finally {
        abortControllersRef.current.delete(operation.id);
      }

      return activeOperations.get(operation.id)!;
    },
    [createOperation, updateOperation, activeOperations, onError],
  );

  // Bulk delete operation
  const bulkDelete = useCallback(
    async (
      items: any[],
      options: {
        softDelete?: boolean;
        batchSize?: number;
        delay?: number;
        onItemDelete?: (item: any) => void;
        confirmDelete?: (item: any) => boolean;
      } = {},
    ): Promise<BulkOperation> => {
      const operation = createOperation('delete', items.length);
      const {
        softDelete = true,
        batchSize = 50,
        delay = 100,
        onItemDelete,
        confirmDelete,
      } = options;

      const abortController = new AbortController();
      abortControllersRef.current.set(operation.id, abortController);

      updateOperation(operation.id, { status: 'running' });

      try {
        for (let i = 0; i < items.length; i += batchSize) {
          if (abortController.signal.aborted) {
            updateOperation(operation.id, {
              status: 'cancelled',
              endTime: new Date(),
            });
            return operation;
          }

          const batch = items.slice(i, i + batchSize);
          const batchPromises = batch.map(async (item, batchIndex) => {
            const itemIndex = i + batchIndex;

            try {
              // Confirm deletion if required
              if (confirmDelete && !confirmDelete(item)) {
                updateOperation(operation.id, {
                  processedItems: (activeOperations.get(operation.id)?.processedItems || 0) + 1,
                });
                return;
              }

              // Simulate API call
              await new Promise((resolve) => setTimeout(resolve, 50));

              if (softDelete) {
                // Soft delete (mark as deleted)
                item.deletedAt = new Date();
                item.status = 'deleted';
              } else {
                // Hard delete (remove from array/database)
                onItemDelete?.(item);
              }

              updateOperation(operation.id, {
                processedItems: (activeOperations.get(operation.id)?.processedItems || 0) + 1,
                successItems: (activeOperations.get(operation.id)?.successItems || 0) + 1,
                progress: Math.round(((itemIndex + 1) / items.length) * 100),
              });
            } catch (error) {
              const bulkError: BulkError = {
                itemId: item.id || itemIndex,
                message: error instanceof Error ? error.message : 'Silme hatası',
                code: 'DELETE_ERROR',
                data: item,
              };

              updateOperation(operation.id, {
                processedItems: (activeOperations.get(operation.id)?.processedItems || 0) + 1,
                errorItems: (activeOperations.get(operation.id)?.errorItems || 0) + 1,
                errors: [...(activeOperations.get(operation.id)?.errors || []), bulkError],
              });
            }
          });

          await Promise.all(batchPromises);

          if (delay > 0 && i + batchSize < items.length) {
            await new Promise((resolve) => setTimeout(resolve, delay));
          }
        }

        updateOperation(operation.id, {
          status: 'completed',
          endTime: new Date(),
          progress: 100,
        });

        const currentOperation = activeOperations.get(operation.id);
        const successCount = currentOperation?.successItems || 0;

        toast.success(`${successCount} kayıt başarıyla silindi`);
      } catch (error) {
        updateOperation(operation.id, {
          status: 'failed',
          endTime: new Date(),
        });

        const errorMessage = error instanceof Error ? error.message : 'Toplu silme hatası';
        onError?.(activeOperations.get(operation.id)!, errorMessage);
        toast.error(errorMessage);
      } finally {
        abortControllersRef.current.delete(operation.id);
      }

      return activeOperations.get(operation.id)!;
    },
    [createOperation, updateOperation, activeOperations, onError],
  );

  // Cancel operation
  const cancelOperation = useCallback(
    (operationId: string) => {
      const abortController = abortControllersRef.current.get(operationId);
      if (abortController) {
        abortController.abort();
        abortControllersRef.current.delete(operationId);
      }

      updateOperation(operationId, {
        status: 'cancelled',
        endTime: new Date(),
      });

      toast.info('İşlem iptal edildi');
    },
    [updateOperation],
  );

  // Get operation by ID
  const getOperation = useCallback(
    (operationId: string): BulkOperation | undefined => {
      return activeOperations.get(operationId);
    },
    [activeOperations],
  );

  // Get all operations
  const getAllOperations = useCallback((): BulkOperation[] => {
    return Array.from(activeOperations.values()).sort(
      (a, b) => b.startTime.getTime() - a.startTime.getTime(),
    );
  }, [activeOperations]);

  // Get active operations
  const getActiveOperations = useCallback((): BulkOperation[] => {
    return Array.from(activeOperations.values()).filter(
      (op) => op.status === 'pending' || op.status === 'running',
    );
  }, [activeOperations]);

  // Clear completed operations
  const clearCompletedOperations = useCallback(() => {
    setActiveOperations((prev) => {
      const newMap = new Map();
      prev.forEach((operation, id) => {
        if (operation.status === 'pending' || operation.status === 'running') {
          newMap.set(id, operation);
        }
      });
      return newMap;
    });
  }, []);

  // Get operation statistics
  const getOperationStats = useCallback(() => {
    const operations = Array.from(activeOperations.values());

    return {
      total: operations.length,
      pending: operations.filter((op) => op.status === 'pending').length,
      running: operations.filter((op) => op.status === 'running').length,
      completed: operations.filter((op) => op.status === 'completed').length,
      failed: operations.filter((op) => op.status === 'failed').length,
      cancelled: operations.filter((op) => op.status === 'cancelled').length,
    };
  }, [activeOperations]);

  return {
    activeOperations: Array.from(activeOperations.values()),

    // Main operations
    bulkUpdate,
    bulkDelete,

    // Operation management
    cancelOperation,
    getOperation,
    getAllOperations,
    getActiveOperations,
    clearCompletedOperations,

    // Statistics
    getOperationStats,
  };
}
