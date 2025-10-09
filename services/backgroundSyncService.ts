/**
 * @fileoverview backgroundSyncService Module - Application module
 * 
 * @author Dernek Yönetim Sistemi Team
 * @version 1.0.0
 */

import { logger } from '../lib/logging/logger';
/**
 * Background Sync Service
 * Handles offline data synchronization for PWA
 */

/**
 * SyncTask Interface
 * 
 * @interface SyncTask
 */
export interface SyncTask {
  id: string;
  type: 'CREATE' | 'UPDATE' | 'DELETE';
  entity: string;
  data: any;
  timestamp: number;
  retryCount: number;
  maxRetries: number;
  status: 'pending' | 'syncing' | 'completed' | 'failed';
}

/**
 * SyncOptions Interface
 * 
 * @interface SyncOptions
 */
export interface SyncOptions {
  maxRetries?: number;
  retryDelay?: number;
  batchSize?: number;
  priority?: 'low' | 'normal' | 'high';
}

/**
 * SyncResult Interface
 * 
 * @interface SyncResult
 */
export interface SyncResult {
  success: boolean;
  syncedTasks: SyncTask[];
  failedTasks: SyncTask[];
  errors: string[];
}

class BackgroundSyncService {
  private syncTasks = new Map<string, SyncTask>();
  private isOnline: boolean = navigator.onLine;
  private syncInProgress = false;
  private registration: ServiceWorkerRegistration | null = null;

  constructor() {
    this.initialize();
  }

  /**
   * Initialize background sync service
   */
  private async initialize(): Promise<void> {
    try {
      // Load existing sync tasks from localStorage
      this.loadSyncTasks();

      // Listen for online/offline events
      window.addEventListener('online', this.handleOnline.bind(this));
      window.addEventListener('offline', this.handleOffline.bind(this));

      // Get service worker registration for background sync
      if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
        this.registration = await navigator.serviceWorker.ready;
        logger.info('Background sync service initialized');
      } else {
        logger.warn('Background sync not supported');
      }

      // Initial sync if online
      if (this.isOnline) {
        await this.syncPendingTasks();
      }
    } catch (error) {
      logger.error('Failed to initialize background sync service:', error);
    }
  }

  /**
   * Add task to sync queue
   */
  async addSyncTask(
    entity: string,
    type: SyncTask['type'],
    data: any,
    options: SyncOptions = {},
  ): Promise<string> {
    const taskId = `${entity}_${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const task: SyncTask = {
      id: taskId,
      type,
      entity,
      data,
      timestamp: Date.now(),
      retryCount: 0,
      maxRetries: options.maxRetries ?? 3,
      status: 'pending',
    };

    this.syncTasks.set(taskId, task);
    this.saveSyncTasks();

    logger.info(`Sync task added: ${taskId}`, task);

    // Try immediate sync if online
    if (this.isOnline && !this.syncInProgress) {
      await this.syncPendingTasks();
    } else if (this.registration) {
      // Register background sync
      try {
        await this.registration.sync.register('background-sync');
      } catch (error) {
        logger.error('Failed to register background sync:', error);
      }
    }

    return taskId;
  }

  /**
   * Remove sync task
   */
  removeSyncTask(taskId: string): boolean {
    const removed = this.syncTasks.delete(taskId);
    if (removed) {
      this.saveSyncTasks();
    }
    return removed;
  }

  /**
   * Get all sync tasks
   */
  getSyncTasks(): SyncTask[] {
    return Array.from(this.syncTasks.values());
  }

  /**
   * Get pending sync tasks
   */
  getPendingSyncTasks(): SyncTask[] {
    return this.getSyncTasks().filter((task) => task.status === 'pending');
  }

  /**
   * Get failed sync tasks
   */
  getFailedSyncTasks(): SyncTask[] {
    return this.getSyncTasks().filter((task) => task.status === 'failed');
  }

  /**
   * Retry failed tasks
   */
  async retryFailedTasks(): Promise<SyncResult> {
    const failedTasks = this.getFailedSyncTasks();

    // Reset failed tasks to pending
    failedTasks.forEach((task) => {
      task.status = 'pending';
      task.retryCount = 0;
    });

    this.saveSyncTasks();

    return await this.syncPendingTasks();
  }

  /**
   * Clear all sync tasks
   */
  clearAllTasks(): void {
    this.syncTasks.clear();
    this.saveSyncTasks();
  }

  /**
   * Clear completed tasks
   */
  clearCompletedTasks(): void {
    const pendingTasks = new Map();

    this.syncTasks.forEach((task, id) => {
      if (task.status !== 'completed') {
        pendingTasks.set(id, task);
      }
    });

    this.syncTasks = pendingTasks;
    this.saveSyncTasks();
  }

  /**
   * Sync pending tasks
   */
  async syncPendingTasks(): Promise<SyncResult> {
    if (!this.isOnline ?? this.syncInProgress) {
      return {
        success: false,
        syncedTasks: [],
        failedTasks: [],
        errors: ['Sync already in progress or offline'],
      };
    }

    this.syncInProgress = true;
    const syncedTasks: SyncTask[] = [];
    const failedTasks: SyncTask[] = [];
    const errors: string[] = [];

    try {
      const pendingTasks = this.getPendingSyncTasks();
      logger.info(`Starting sync of ${pendingTasks.length} tasks`);

      // Group tasks by entity for batch processing
      const tasksByEntity = this.groupTasksByEntity(pendingTasks);

      for (const [entity, tasks] of tasksByEntity) {
        try {
          const result = await this.syncEntityTasks(entity, tasks);
          syncedTasks.push(...result.synced);
          failedTasks.push(...result.failed);
          errors.push(...result.errors);
        } catch (error) {
          const errorMessage = `Failed to sync ${entity}: ${error instanceof Error ? error.message : 'Unknown error'}`;
          errors.push(errorMessage);
          logger.error(errorMessage);

          // Mark all tasks as failed
          tasks.forEach((task) => {
            task.status = 'failed';
            task.retryCount++;
            failedTasks.push(task);
          });
        }
      }

      // Clean up completed tasks
      syncedTasks.forEach((task) => {
        this.syncTasks.delete(task.id);
      });

      this.saveSyncTasks();

      const result: SyncResult = {
        success: errors.length === 0,
        syncedTasks,
        failedTasks,
        errors,
      };

      logger.info('Sync completed:', result);
      return result;
    } catch (error) {
      const errorMessage = `Sync process failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
      errors.push(errorMessage);
      logger.error(errorMessage);

      return {
        success: false,
        syncedTasks,
        failedTasks,
        errors,
      };
    } finally {
      this.syncInProgress = false;
    }
  }

  /**
   * Group tasks by entity for batch processing
   */
  private groupTasksByEntity(tasks: SyncTask[]): Map<string, SyncTask[]> {
    const grouped = new Map<string, SyncTask[]>();

    tasks.forEach((task) => {
      if (!grouped.has(task.entity)) {
        grouped.set(task.entity, []);
      }
      grouped.get(task.entity)!.push(task);
    });

    return grouped;
  }

  /**
   * Sync tasks for a specific entity
   */
  private async syncEntityTasks(
    entity: string,
    tasks: SyncTask[],
  ): Promise<{
    synced: SyncTask[];
    failed: SyncTask[];
    errors: string[];
  }> {
    const synced: SyncTask[] = [];
    const failed: SyncTask[] = [];
    const errors: string[] = [];

    // Sort tasks by timestamp to maintain order
    tasks.sort((a, b) => a.timestamp - b.timestamp);

    for (const task of tasks) {
      try {
        task.status = 'syncing';

        // Simulate API call based on entity and type
        const success = await this.performSyncOperation(task);

        if (success) {
          task.status = 'completed';
          synced.push(task);
          logger.info(`Task synced successfully: ${task.id}`);
        } else {
          throw new Error('Sync operation returned false');
        }
      } catch (error) {
        task.retryCount++;

        if (task.retryCount >= task.maxRetries) {
          task.status = 'failed';
          failed.push(task);
          const errorMessage = `Task failed after ${task.maxRetries} retries: ${task.id}`;
          errors.push(errorMessage);
          logger.error(errorMessage);
        } else {
          task.status = 'pending';
          const errorMessage = `Task retry ${task.retryCount}/${task.maxRetries}: ${task.id}`;
          errors.push(errorMessage);
          logger.warn(errorMessage);
        }
      }
    }

    return { synced, failed, errors };
  }

  /**
   * Perform actual sync operation (implementation pending)
   */
  private async performSyncOperation(task: SyncTask): Promise<boolean> {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 100 + Math.random() * 500));

    // API calls based on entity
    switch (task.entity) {
      case 'beneficiaries':
        return this.syncBeneficiary(task);
      case 'donations':
        return this.syncDonation(task);
      case 'members':
        return this.syncMember(task);
      case 'activities':
        return this.syncActivity(task);
      default:
        logger.warn(`Unknown entity type for sync: ${task.entity}`);
        return false;
    }
  }

  /**
   * Sync beneficiary data (implementation pending)
   */
  private async syncBeneficiary(task: SyncTask): Promise<boolean> {
    logger.info(`Syncing beneficiary ${task.type}:`, task.data);

    // Simulate success/failure (90% success rate)
    return Math.random() > 0.1;
  }

  /**
   * Sync donation data (implementation pending)
   */
  private async syncDonation(task: SyncTask): Promise<boolean> {
    logger.info(`Syncing donation ${task.type}:`, task.data);

    // Simulate success/failure (95% success rate)
    return Math.random() > 0.05;
  }

  /**
   * Sync member data (implementation pending)
   */
  private async syncMember(task: SyncTask): Promise<boolean> {
    logger.info(`Syncing member ${task.type}:`, task.data);

    // Simulate success/failure (85% success rate)
    return Math.random() > 0.15;
  }

  /**
   * Sync activity data (implementation pending)
   */
  private async syncActivity(task: SyncTask): Promise<boolean> {
    logger.info(`Syncing activity ${task.type}:`, task.data);

    // Simulate success/failure (98% success rate)
    return Math.random() > 0.02;
  }

  /**
   * Handle online event
   */
  private async handleOnline(): Promise<void> {
    logger.info('Device came online - starting sync');
    this.isOnline = true;

    // Start syncing pending tasks
    await this.syncPendingTasks();
  }

  /**
   * Handle offline event
   */
  private handleOffline(): void {
    logger.info('Device went offline');
    this.isOnline = false;
  }

  /**
   * Save sync tasks to localStorage
   */
  private saveSyncTasks(): void {
    try {
      const tasks = Array.from(this.syncTasks.values());
      localStorage.setItem('backgroundSyncTasks', JSON.stringify(tasks));
    } catch (error) {
      logger.error('Failed to save sync tasks:', error);
    }
  }

  /**
   * Load sync tasks from localStorage
   */
  private loadSyncTasks(): void {
    try {
      const stored = localStorage.getItem('backgroundSyncTasks');
      if (stored) {
        const tasks: SyncTask[] = JSON.parse(stored);
        this.syncTasks.clear();

        tasks.forEach((task) => {
          // Reset syncing tasks to pending on app restart
          if (task.status === 'syncing') {
            task.status = 'pending';
          }
          this.syncTasks.set(task.id, task);
        });

        logger.info(`Loaded ${tasks.length} sync tasks from storage`);
      }
    } catch (error) {
      logger.error('Failed to load sync tasks:', error);
    }
  }

  /**
   * Get sync statistics
   */
  getSyncStats(): {
    total: number;
    pending: number;
    completed: number;
    failed: number;
    syncing: number;
  } {
    const tasks = this.getSyncTasks();

    return {
      total: tasks.length,
      pending: tasks.filter((t) => t.status === 'pending').length,
      completed: tasks.filter((t) => t.status === 'completed').length,
      failed: tasks.filter((t) => t.status === 'failed').length,
      syncing: tasks.filter((t) => t.status === 'syncing').length,
    };
  }

  /**
   * Check if sync is available
   */
  isSyncAvailable(): boolean {
    return 'serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype;
  }

  /**
   * Check if device is online
   */
  isDeviceOnline(): boolean {
    return this.isOnline;
  }

  /**
   * Check if sync is in progress
   */
  isSyncInProgress(): boolean {
    return this.syncInProgress;
  }
}

// Export singleton instance
export const backgroundSyncService = new BackgroundSyncService();
export default backgroundSyncService;
