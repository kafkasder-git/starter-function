/**
 * Background Sync Hook
 * React hook for managing offline data synchronization
 */

import { useCallback, useEffect, useState } from 'react';
import type { SyncOptions, SyncResult, SyncTask } from '../services/backgroundSyncService';
import { backgroundSyncService } from '../services/backgroundSyncService';

export interface UseBackgroundSyncReturn {
  isOnline: boolean;
  isSyncAvailable: boolean;
  isSyncInProgress: boolean;
  syncStats: {
    total: number;
    pending: number;
    completed: number;
    failed: number;
    syncing: number;
  };
  pendingTasks: SyncTask[];
  failedTasks: SyncTask[];
  addSyncTask: (
    entity: string,
    type: SyncTask['type'],
    data: any,
    options?: SyncOptions,
  ) => Promise<string>;
  syncNow: () => Promise<SyncResult>;
  retryFailedTasks: () => Promise<SyncResult>;
  clearCompletedTasks: () => void;
  clearAllTasks: () => void;
  removeSyncTask: (taskId: string) => boolean;
}

export const useBackgroundSync = (): UseBackgroundSyncReturn => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSyncInProgress, setIsSyncInProgress] = useState(false);
  const [syncStats, setSyncStats] = useState(backgroundSyncService.getSyncStats());
  const [pendingTasks, setPendingTasks] = useState<SyncTask[]>([]);
  const [failedTasks, setFailedTasks] = useState<SyncTask[]>([]);

  // Update sync stats and tasks
  const updateSyncState = useCallback(() => {
    setSyncStats(backgroundSyncService.getSyncStats());
    setPendingTasks(backgroundSyncService.getPendingSyncTasks());
    setFailedTasks(backgroundSyncService.getFailedSyncTasks());
    setIsSyncInProgress(backgroundSyncService.isSyncInProgress());
  }, []);

  // Initialize and set up event listeners
  useEffect(() => {
    // Initial state update
    updateSyncState();

    // Online/offline event listeners
    const handleOnline = () => {
      setIsOnline(true);
      updateSyncState();
    };

    const handleOffline = () => {
      setIsOnline(false);
      updateSyncState();
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Periodic sync state update
    const interval = setInterval(updateSyncState, 1000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, [updateSyncState]);

  // Add sync task
  const addSyncTask = useCallback(
    async (
      entity: string,
      type: SyncTask['type'],
      data: any,
      options?: SyncOptions,
    ): Promise<string> => {
      const taskId = await backgroundSyncService.addSyncTask(entity, type, data, options);
      updateSyncState();
      return taskId;
    },
    [updateSyncState],
  );

  // Manual sync
  const syncNow = useCallback(async (): Promise<SyncResult> => {
    const result = await backgroundSyncService.syncPendingTasks();
    updateSyncState();
    return result;
  }, [updateSyncState]);

  // Retry failed tasks
  const retryFailedTasks = useCallback(async (): Promise<SyncResult> => {
    const result = await backgroundSyncService.retryFailedTasks();
    updateSyncState();
    return result;
  }, [updateSyncState]);

  // Clear completed tasks
  const clearCompletedTasks = useCallback(() => {
    backgroundSyncService.clearCompletedTasks();
    updateSyncState();
  }, [updateSyncState]);

  // Clear all tasks
  const clearAllTasks = useCallback(() => {
    backgroundSyncService.clearAllTasks();
    updateSyncState();
  }, [updateSyncState]);

  // Remove specific sync task
  const removeSyncTask = useCallback(
    (taskId: string): boolean => {
      const result = backgroundSyncService.removeSyncTask(taskId);
      updateSyncState();
      return result;
    },
    [updateSyncState],
  );

  return {
    isOnline,
    isSyncAvailable: backgroundSyncService.isSyncAvailable(),
    isSyncInProgress,
    syncStats,
    pendingTasks,
    failedTasks,
    addSyncTask,
    syncNow,
    retryFailedTasks,
    clearCompletedTasks,
    clearAllTasks,
    removeSyncTask,
  };
};

export default useBackgroundSync;
