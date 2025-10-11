/**
 * @fileoverview Backup and Recovery Service
 * @description Complete backup and recovery system for Appwrite database
 */

import { databases, DATABASE_ID, ID, Query } from '../lib/appwrite';
import { collections, db, queryHelpers } from '../lib/database';
import { logger } from '../lib/logging/logger';

// Backup types
export interface BackupData {
  id: string;
  name: string;
  description?: string;
  timestamp: string;
  collections: Record<string, any[]>;
  metadata: {
    totalDocuments: number;
    totalCollections: number;
    version: string;
    appVersion: string;
  };
}

export interface BackupOptions {
  collections?: string[];
  includeMetadata?: boolean;
  compress?: boolean;
  encrypt?: boolean;
  password?: string;
}

export interface RestoreOptions {
  collections?: string[];
  overwriteExisting?: boolean;
  validateData?: boolean;
  createMissingCollections?: boolean;
}

class BackupService {
  private readonly BACKUP_COLLECTION = 'backups';
  private readonly APP_VERSION = '1.0.0';

  /**
   * Create a full database backup
   */
  async createBackup(options: BackupOptions = {}): Promise<{ data: BackupData | null; error: Error | null }> {
    try {
      logger.info('Starting database backup...');
      
      const {
        collections: targetCollections = Object.values(collections),
        includeMetadata = true,
        compress = false,
        encrypt = false,
        password
      } = options;

      const backupId = ID.unique();
      const timestamp = new Date().toISOString();
      const backupName = `backup_${timestamp.split('T')[0]}_${backupId.slice(0, 8)}`;

      const backupData: BackupData = {
        id: backupId,
        name: backupName,
        description: `Full database backup created on ${timestamp}`,
        timestamp,
        collections: {},
        metadata: {
          totalDocuments: 0,
          totalCollections: 0,
          version: '1.0.0',
          appVersion: this.APP_VERSION,
        }
      };

      // Backup each collection
      for (const collectionId of targetCollections) {
        try {
          logger.info(`Backing up collection: ${collectionId}`);
          
          const { data: documents, error } = await this.backupCollection(collectionId);
          
          if (error) {
            logger.error(`Error backing up collection ${collectionId}:`, error);
            continue;
          }

          backupData.collections[collectionId] = documents || [];
          backupData.metadata.totalDocuments += documents?.length || 0;
          backupData.metadata.totalCollections++;

        } catch (error) {
          logger.error(`Error backing up collection ${collectionId}:`, error);
        }
      }

      // Store backup metadata
      if (includeMetadata) {
        await this.storeBackupMetadata(backupData);
      }

      logger.info(`Backup completed: ${backupName}`);
      logger.info(`Total documents: ${backupData.metadata.totalDocuments}`);
      logger.info(`Total collections: ${backupData.metadata.totalCollections}`);

      return { data: backupData, error: null };
    } catch (error) {
      logger.error('Error creating backup:', error);
      return { data: null, error: error as Error };
    }
  }

  /**
   * Backup a specific collection
   */
  private async backupCollection(collectionId: string): Promise<{ data: any[] | null; error: Error | null }> {
    try {
      const documents: any[] = [];
      let offset = 0;
      const limit = 100;

      while (true) {
        const result = await db.list(
          collectionId,
          [
            queryHelpers.offset(offset),
            queryHelpers.limit(limit),
            queryHelpers.orderAsc('$createdAt')
          ]
        );

        if (result.error) {
          logger.error(`Error listing documents from ${collectionId}:`, result.error);
          return { data: null, error: result.error };
        }

        const batch = result.data?.documents || [];
        documents.push(...batch);

        if (batch.length < limit) {
          break;
        }

        offset += limit;
      }

      logger.info(`Backed up ${documents.length} documents from ${collectionId}`);
      return { data: documents, error: null };
    } catch (error) {
      logger.error(`Error backing up collection ${collectionId}:`, error);
      return { data: null, error: error as Error };
    }
  }

  /**
   * Store backup metadata in database
   */
  private async storeBackupMetadata(backupData: BackupData): Promise<{ error: Error | null }> {
    try {
      const metadata = {
        backup_id: backupData.id,
        name: backupData.name,
        description: backupData.description,
        timestamp: backupData.timestamp,
        total_documents: backupData.metadata.totalDocuments,
        total_collections: backupData.metadata.totalCollections,
        version: backupData.metadata.version,
        app_version: backupData.metadata.appVersion,
        collections: Object.keys(backupData.collections),
        created_at: new Date().toISOString(),
      };

      await db.create(
        this.BACKUP_COLLECTION,
        metadata,
        ID.unique()
      );

      return { error: null };
    } catch (error) {
      logger.error('Error storing backup metadata:', error);
      return { error: error as Error };
    }
  }

  /**
   * Restore database from backup
   */
  async restoreBackup(backupData: BackupData, options: RestoreOptions = {}): Promise<{ error: Error | null }> {
    try {
      logger.info(`Starting restore from backup: ${backupData.name}`);
      
      const {
        collections: targetCollections = Object.keys(backupData.collections),
        overwriteExisting = false,
        validateData = true,
        createMissingCollections = true
      } = options;

      let restoredDocuments = 0;
      let restoredCollections = 0;

      // Restore each collection
      for (const collectionId of targetCollections) {
        if (!backupData.collections[collectionId]) {
          logger.warn(`Collection ${collectionId} not found in backup`);
          continue;
        }

        try {
          logger.info(`Restoring collection: ${collectionId}`);
          
          const { error } = await this.restoreCollection(
            collectionId,
            backupData.collections[collectionId],
            { overwriteExisting, validateData }
          );

          if (error) {
            logger.error(`Error restoring collection ${collectionId}:`, error);
            continue;
          }

          restoredDocuments += backupData.collections[collectionId].length;
          restoredCollections++;

        } catch (error) {
          logger.error(`Error restoring collection ${collectionId}:`, error);
        }
      }

      logger.info(`Restore completed: ${restoredCollections} collections, ${restoredDocuments} documents`);
      return { error: null };
    } catch (error) {
      logger.error('Error restoring backup:', error);
      return { error: error as Error };
    }
  }

  /**
   * Restore a specific collection
   */
  private async restoreCollection(
    collectionId: string,
    documents: any[],
    options: { overwriteExisting: boolean; validateData: boolean }
  ): Promise<{ error: Error | null }> {
    try {
      const { overwriteExisting, validateData } = options;

      for (const doc of documents) {
        try {
          // Validate document data if requested
          if (validateData) {
            const isValid = await this.validateDocument(doc);
            if (!isValid) {
              logger.warn(`Invalid document skipped: ${doc.$id}`);
              continue;
            }
          }

          // Check if document already exists
          if (!overwriteExisting) {
            const existing = await db.get(collectionId, doc.$id);
            if (existing.data) {
              logger.info(`Document already exists, skipping: ${doc.$id}`);
              continue;
            }
          }

          // Remove Appwrite metadata for restoration
          const { $id, $createdAt, $updatedAt, $permissions, ...docData } = doc;

          // Create document
          const result = await db.create(
            collectionId,
            docData,
            $id
          );

          if (result.error) {
            logger.error(`Error creating document ${$id}:`, result.error);
            continue;
          }

        } catch (error) {
          logger.error(`Error processing document ${doc.$id}:`, error);
        }
      }

      return { error: null };
    } catch (error) {
      logger.error(`Error restoring collection ${collectionId}:`, error);
      return { error: error as Error };
    }
  }

  /**
   * Validate document data
   */
  private async validateDocument(doc: any): Promise<boolean> {
    try {
      // Basic validation
      if (!doc || typeof doc !== 'object') {
        return false;
      }

      // Check required fields
      if (!doc.$id || !doc.$createdAt) {
        return false;
      }

      // Check data types
      if (typeof doc.$id !== 'string' || typeof doc.$createdAt !== 'string') {
        return false;
      }

      return true;
    } catch (error) {
      logger.error('Error validating document:', error);
      return false;
    }
  }

  /**
   * List all backups
   */
  async listBackups(): Promise<{ data: any[] | null; error: Error | null }> {
    try {
      const result = await db.list(
        this.BACKUP_COLLECTION,
        [
          queryHelpers.orderDesc('timestamp'),
          queryHelpers.limit(50)
        ]
      );

      if (result.error) {
        logger.error('Error listing backups:', result.error);
        return { data: null, error: result.error };
      }

      return { data: result.data?.documents || [], error: null };
    } catch (error) {
      logger.error('Error listing backups:', error);
      return { data: null, error: error as Error };
    }
  }

  /**
   * Get backup by ID
   */
  async getBackup(backupId: string): Promise<{ data: any | null; error: Error | null }> {
    try {
      const result = await db.list(
        this.BACKUP_COLLECTION,
        [queryHelpers.equal('backup_id', backupId)]
      );

      if (result.error) {
        logger.error(`Error getting backup ${backupId}:`, result.error);
        return { data: null, error: result.error };
      }

      const backup = result.data?.documents?.[0] || null;
      return { data: backup, error: null };
    } catch (error) {
      logger.error(`Error getting backup ${backupId}:`, error);
      return { data: null, error: error as Error };
    }
  }

  /**
   * Delete backup
   */
  async deleteBackup(backupId: string): Promise<{ error: Error | null }> {
    try {
      const result = await db.list(
        this.BACKUP_COLLECTION,
        [queryHelpers.equal('backup_id', backupId)]
      );

      if (result.error) {
        logger.error(`Error finding backup ${backupId}:`, result.error);
        return { error: result.error };
      }

      const backup = result.data?.documents?.[0];
      if (!backup) {
        return { error: new Error('Backup not found') };
      }

      const deleteResult = await db.delete(this.BACKUP_COLLECTION, backup.$id);
      
      if (deleteResult.error) {
        logger.error(`Error deleting backup ${backupId}:`, deleteResult.error);
        return { error: deleteResult.error };
      }

      logger.info(`Backup deleted: ${backupId}`);
      return { error: null };
    } catch (error) {
      logger.error(`Error deleting backup ${backupId}:`, error);
      return { error: error as Error };
    }
  }

  /**
   * Export backup to file
   */
  async exportBackup(backupData: BackupData, format: 'json' | 'csv' = 'json'): Promise<{ data: string | null; error: Error | null }> {
    try {
      if (format === 'json') {
        const jsonData = JSON.stringify(backupData, null, 2);
        return { data: jsonData, error: null };
      } else if (format === 'csv') {
        const csvData = this.convertToCSV(backupData);
        return { data: csvData, error: null };
      }

      return { data: null, error: new Error('Unsupported format') };
    } catch (error) {
      logger.error('Error exporting backup:', error);
      return { data: null, error: error as Error };
    }
  }

  /**
   * Convert backup data to CSV format
   */
  private convertToCSV(backupData: BackupData): string {
    const lines: string[] = [];
    
    // Add metadata
    lines.push('Collection,Document ID,Created At,Updated At,Data');
    
    // Add documents
    for (const [collectionId, documents] of Object.entries(backupData.collections)) {
      for (const doc of documents) {
        const data = JSON.stringify(doc).replace(/"/g, '""');
        lines.push(`"${collectionId}","${doc.$id}","${doc.$createdAt}","${doc.$updatedAt}","${data}"`);
      }
    }
    
    return lines.join('\n');
  }

  /**
   * Import backup from file
   */
  async importBackup(fileContent: string, format: 'json' | 'csv' = 'json'): Promise<{ data: BackupData | null; error: Error | null }> {
    try {
      if (format === 'json') {
        const backupData = JSON.parse(fileContent) as BackupData;
        return { data: backupData, error: null };
      } else if (format === 'csv') {
        const backupData = this.parseFromCSV(fileContent);
        return { data: backupData, error: null };
      }

      return { data: null, error: new Error('Unsupported format') };
    } catch (error) {
      logger.error('Error importing backup:', error);
      return { data: null, error: error as Error };
    }
  }

  /**
   * Parse backup data from CSV format
   */
  private parseFromCSV(csvContent: string): BackupData {
    const lines = csvContent.split('\n');
    const collections: Record<string, any[]> = {};
    
    // Skip header line
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      const [collectionId, docId, createdAt, updatedAt, data] = line.split('","').map(s => s.replace(/"/g, ''));
      
      if (!collections[collectionId]) {
        collections[collectionId] = [];
      }
      
      try {
        const doc = JSON.parse(data);
        collections[collectionId].push(doc);
      } catch (error) {
        logger.error('Error parsing document data:', error);
      }
    }
    
    return {
      id: ID.unique(),
      name: `imported_backup_${new Date().toISOString()}`,
      timestamp: new Date().toISOString(),
      collections,
      metadata: {
        totalDocuments: Object.values(collections).reduce((sum, docs) => sum + docs.length, 0),
        totalCollections: Object.keys(collections).length,
        version: '1.0.0',
        appVersion: this.APP_VERSION,
      }
    };
  }

  /**
   * Schedule automatic backups
   */
  async scheduleBackup(cronExpression: string): Promise<{ error: Error | null }> {
    try {
      // This would integrate with a cron service or scheduled function
      logger.info(`Scheduled backup with cron: ${cronExpression}`);
      
      // Store schedule in database
      await db.create(
        'backup_schedules',
        {
          cron_expression: cronExpression,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        ID.unique()
      );

      return { error: null };
    } catch (error) {
      logger.error('Error scheduling backup:', error);
      return { error: error as Error };
    }
  }

  /**
   * Get backup statistics
   */
  async getBackupStats(): Promise<{ data: any | null; error: Error | null }> {
    try {
      const result = await db.list(
        this.BACKUP_COLLECTION,
        [queryHelpers.limit(1)]
      );

      if (result.error) {
        logger.error('Error getting backup stats:', result.error);
        return { data: null, error: result.error };
      }

      const stats = {
        totalBackups: result.data?.total || 0,
        lastBackup: null as any,
        totalDocuments: 0,
        totalCollections: 0,
      };

      // Get last backup details
      if (stats.totalBackups > 0) {
        const lastBackupResult = await db.list(
          this.BACKUP_COLLECTION,
          [
            queryHelpers.orderDesc('timestamp'),
            queryHelpers.limit(1)
          ]
        );

        if (lastBackupResult.data?.documents?.[0]) {
          stats.lastBackup = lastBackupResult.data.documents[0];
          stats.totalDocuments = lastBackupResult.data.documents[0].total_documents || 0;
          stats.totalCollections = lastBackupResult.data.documents[0].total_collections || 0;
        }
      }

      return { data: stats, error: null };
    } catch (error) {
      logger.error('Error getting backup stats:', error);
      return { data: null, error: error as Error };
    }
  }
}

// Export singleton instance
export const backupService = new BackupService();
export default backupService;
