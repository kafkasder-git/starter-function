/**
 * @fileoverview Storage Service
 * @description Comprehensive file storage service with Appwrite integration
 */

import { storage, ID } from '../appwrite';
import { logger } from '../logging/logger';
import { AppwriteException } from 'appwrite';

export interface FileUploadOptions {
  file: File;
  bucketId: string;
  fileId?: string;
  permissions?: string[];
  onProgress?: (progress: number) => void;
}

export interface FileListOptions {
  bucketId: string;
  queries?: string[];
  search?: string;
}

export interface FileListResult {
  files: StorageFile[];
  total: number;
}

export interface StorageFile {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
  $permissions: string[];
  name: string;
  signature: string;
  mimeType: string;
  sizeOriginal: number;
  chunksTotal: number;
  chunksUploaded: number;
  bucketId: string;
}

export interface StorageStats {
  totalFiles: number;
  totalSize: number;
  bucketCount: number;
  buckets: BucketInfo[];
}

export interface BucketInfo {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
  $permissions: string[];
  name: string;
  enabled: boolean;
  maximumFileSize: number;
  allowedFileExtensions: string[];
  compression: string;
  encryption: boolean;
  antivirus: boolean;
  fileSecurity: boolean;
}

export interface StorageResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Storage Service Class
 */
export class StorageService {
  private static instance: StorageService;
  private defaultBucketId: string;

  private constructor() {
    this.defaultBucketId = 'default'; // This should be configured based on your setup
  }

  static getInstance(): StorageService {
    if (!StorageService.instance) {
      StorageService.instance = new StorageService();
    }
    return StorageService.instance;
  }

  /**
   * Set default bucket ID
   */
  setDefaultBucket(bucketId: string): void {
    this.defaultBucketId = bucketId;
    logger.info('Default bucket set', { bucketId });
  }

  /**
   * Upload a single file
   */
  async uploadFile(options: FileUploadOptions): Promise<StorageResponse<StorageFile>> {
    try {
      const { file, bucketId, fileId, permissions, onProgress } = options;
      
      logger.info('Starting file upload', { 
        fileName: file.name, 
        fileSize: file.size, 
        bucketId,
        mimeType: file.type 
      });

      const uploadFileId = fileId || ID.unique();
      
      const result = await storage.createFile(
        bucketId,
        uploadFileId,
        file,
        permissions
      );

      logger.info('File upload successful', { 
        fileId: result.$id, 
        fileName: result.name,
        bucketId: result.bucketId 
      });

      return {
        success: true,
        data: result as StorageFile,
      };
    } catch (error: any) {
      logger.error('File upload failed', { 
        fileName: options.file.name, 
        bucketId: options.bucketId,
        error: error.message 
      });

      let errorMessage = 'Dosya yüklenemedi';

      if (error instanceof AppwriteException) {
        switch (error.type) {
          case 'storage_file_too_large':
            errorMessage = 'Dosya boyutu çok büyük';
            break;
          case 'storage_file_type_not_allowed':
            errorMessage = 'Bu dosya türü desteklenmiyor';
            break;
          case 'storage_bucket_not_found':
            errorMessage = 'Depolama alanı bulunamadı';
            break;
          case 'storage_quota_exceeded':
            errorMessage = 'Depolama kotası aşıldı';
            break;
          default:
            errorMessage = error.message || 'Dosya yüklenemedi';
        }
      }

      return { success: false, error: errorMessage };
    }
  }

  /**
   * Upload multiple files
   */
  async uploadFiles(
    files: File[], 
    bucketId: string, 
    permissions?: string[]
  ): Promise<StorageResponse<StorageFile[]>> {
    try {
      logger.info('Starting multiple file upload', { 
        fileCount: files.length, 
        bucketId 
      });

      const uploadPromises = files.map(file => 
        this.uploadFile({ file, bucketId, permissions })
      );

      const results = await Promise.all(uploadPromises);
      const successful = results.filter(result => result.success);
      const failed = results.filter(result => !result.success);

      if (failed.length > 0) {
        logger.warn('Some files failed to upload', { 
          successful: successful.length, 
          failed: failed.length 
        });
      }

      return {
        success: successful.length > 0,
        data: successful.map(result => result.data!).filter(Boolean),
        error: failed.length > 0 ? `${failed.length} dosya yüklenemedi` : undefined,
      };
    } catch (error: any) {
      logger.error('Multiple file upload failed', { 
        fileCount: files.length, 
        bucketId,
        error: error.message 
      });
      return { success: false, error: 'Dosyalar yüklenemedi' };
    }
  }

  /**
   * List files in a bucket
   */
  async listFiles(options: FileListOptions): Promise<StorageResponse<FileListResult>> {
    try {
      const { bucketId, queries = [], search } = options;
      
      logger.info('Listing files', { bucketId, search });

      let allQueries = [...queries];
      if (search) {
        allQueries.push(`search("name", "${search}")`);
      }

      const result = await storage.listFiles(bucketId, allQueries);

      logger.info('Files listed successfully', { 
        bucketId, 
        fileCount: result.files.length,
        total: result.total 
      });

      return {
        success: true,
        data: {
          files: result.files as StorageFile[],
          total: result.total,
        },
      };
    } catch (error: any) {
      logger.error('Failed to list files', { 
        bucketId: options.bucketId,
        error: error.message 
      });
      return { success: false, error: 'Dosyalar listelenemedi' };
    }
  }

  /**
   * Get file information
   */
  async getFileInfo(bucketId: string, fileId: string): Promise<StorageResponse<StorageFile>> {
    try {
      logger.info('Getting file info', { bucketId, fileId });

      const result = await storage.getFile(bucketId, fileId);

      logger.info('File info retrieved successfully', { 
        bucketId, 
        fileId, 
        fileName: result.name 
      });

      return {
        success: true,
        data: result as StorageFile,
      };
    } catch (error: any) {
      logger.error('Failed to get file info', { 
        bucketId, 
        fileId,
        error: error.message 
      });
      return { success: false, error: 'Dosya bilgileri alınamadı' };
    }
  }

  /**
   * Download file
   */
  async downloadFile(bucketId: string, fileId: string): Promise<StorageResponse<Blob>> {
    try {
      logger.info('Downloading file', { bucketId, fileId });

      const result = await storage.getFileDownload(bucketId, fileId);

      logger.info('File download successful', { bucketId, fileId });

      return {
        success: true,
        data: result,
      };
    } catch (error: any) {
      logger.error('File download failed', { 
        bucketId, 
        fileId,
        error: error.message 
      });
      return { success: false, error: 'Dosya indirilemedi' };
    }
  }

  /**
   * Get file URL for viewing
   */
  getFileUrl(bucketId: string, fileId: string): string {
    try {
      const url = storage.getFileView(bucketId, fileId);
      logger.info('File URL generated', { bucketId, fileId });
      return url.toString();
    } catch (error: any) {
      logger.error('Failed to generate file URL', { 
        bucketId, 
        fileId,
        error: error.message 
      });
      return '';
    }
  }

  /**
   * Get file preview URL
   */
  getFilePreviewUrl(
    bucketId: string, 
    fileId: string, 
    width?: number, 
    height?: number,
    quality?: number
  ): string {
    try {
      const url = storage.getFilePreview(
        bucketId, 
        fileId, 
        width, 
        height, 
        undefined, 
        quality
      );
      logger.info('File preview URL generated', { 
        bucketId, 
        fileId, 
        width, 
        height, 
        quality 
      });
      return url.toString();
    } catch (error: any) {
      logger.error('Failed to generate file preview URL', { 
        bucketId, 
        fileId,
        error: error.message 
      });
      return '';
    }
  }

  /**
   * Delete file
   */
  async deleteFile(bucketId: string, fileId: string): Promise<StorageResponse<void>> {
    try {
      logger.info('Deleting file', { bucketId, fileId });

      await storage.deleteFile(bucketId, fileId);

      logger.info('File deleted successfully', { bucketId, fileId });

      return { success: true };
    } catch (error: any) {
      logger.error('File deletion failed', { 
        bucketId, 
        fileId,
        error: error.message 
      });
      return { success: false, error: 'Dosya silinemedi' };
    }
  }

  /**
   * Copy file
   */
  async copyFile(
    sourceBucketId: string, 
    sourceFileId: string, 
    targetBucketId: string, 
    targetFileId?: string
  ): Promise<StorageResponse<StorageFile>> {
    try {
      logger.info('Copying file', { 
        sourceBucketId, 
        sourceFileId, 
        targetBucketId, 
        targetFileId 
      });

      // First download the source file
      const downloadResult = await this.downloadFile(sourceBucketId, sourceFileId);
      if (!downloadResult.success || !downloadResult.data) {
        return { success: false, error: 'Kaynak dosya indirilemedi' };
      }

      // Get source file info to preserve metadata
      const sourceInfoResult = await this.getFileInfo(sourceBucketId, sourceFileId);
      if (!sourceInfoResult.success || !sourceInfoResult.data) {
        return { success: false, error: 'Kaynak dosya bilgileri alınamadı' };
      }

      const sourceFile = sourceInfoResult.data;
      const newFileId = targetFileId || ID.unique();

      // Create a new File object from the blob
      const file = new File([downloadResult.data], sourceFile.name, {
        type: sourceFile.mimeType,
      });

      // Upload to target bucket
      const uploadResult = await this.uploadFile({
        file,
        bucketId: targetBucketId,
        fileId: newFileId,
        permissions: sourceFile.$permissions,
      });

      if (uploadResult.success) {
        logger.info('File copied successfully', { 
          sourceBucketId, 
          sourceFileId, 
          targetBucketId, 
          newFileId 
        });
      }

      return uploadResult;
    } catch (error: any) {
      logger.error('File copy failed', { 
        sourceBucketId, 
        sourceFileId, 
        targetBucketId,
        error: error.message 
      });
      return { success: false, error: 'Dosya kopyalanamadı' };
    }
  }

  /**
   * Get storage statistics
   */
  async getStorageStats(): Promise<StorageResponse<StorageStats>> {
    try {
      logger.info('Getting storage statistics');

      // List all buckets
      const bucketsResult = await storage.listBuckets();
      const buckets = bucketsResult.buckets as BucketInfo[];

      let totalFiles = 0;
      let totalSize = 0;

      // Get file count and size for each bucket
      for (const bucket of buckets) {
        try {
          const filesResult = await this.listFiles({ bucketId: bucket.$id });
          if (filesResult.success && filesResult.data) {
            totalFiles += filesResult.data.total;
            // Note: Appwrite doesn't provide total size directly, 
            // you might need to calculate this differently
          }
        } catch (error) {
          logger.warn('Failed to get stats for bucket', { 
            bucketId: bucket.$id, 
            error: (error as Error).message 
          });
        }
      }

      const stats: StorageStats = {
        totalFiles,
        totalSize,
        bucketCount: buckets.length,
        buckets,
      };

      logger.info('Storage statistics retrieved', { 
        totalFiles, 
        bucketCount: buckets.length 
      });

      return { success: true, data: stats };
    } catch (error: any) {
      logger.error('Failed to get storage statistics', { error: error.message });
      return { success: false, error: 'Depolama istatistikleri alınamadı' };
    }
  }

  /**
   * Test storage connection
   */
  async testStorage(): Promise<StorageResponse<boolean>> {
    try {
      logger.info('Testing storage connection');

      // Try to list buckets
      await storage.listBuckets();

      logger.info('Storage connection test successful');
      return { success: true, data: true };
    } catch (error: any) {
      logger.error('Storage connection test failed', { error: error.message });
      return { success: false, error: 'Depolama bağlantısı test edilemedi' };
    }
  }

  /**
   * Create bucket (if you have admin permissions)
   */
  async createBucket(
    name: string,
    options: {
      enabled?: boolean;
      maximumFileSize?: number;
      allowedFileExtensions?: string[];
      compression?: string;
      encryption?: boolean;
      antivirus?: boolean;
      fileSecurity?: boolean;
    } = {}
  ): Promise<StorageResponse<BucketInfo>> {
    try {
      logger.info('Creating bucket', { name, options });

      const bucketId = ID.unique();
      const result = await storage.createBucket(
        bucketId,
        name,
        options.enabled,
        options.maximumFileSize,
        options.allowedFileExtensions,
        options.compression,
        options.encryption,
        options.antivirus,
        options.fileSecurity
      );

      logger.info('Bucket created successfully', { bucketId, name });

      return {
        success: true,
        data: result as BucketInfo,
      };
    } catch (error: any) {
      logger.error('Bucket creation failed', { name, error: error.message });
      return { success: false, error: 'Depolama alanı oluşturulamadı' };
    }
  }

  /**
   * Delete bucket (if you have admin permissions)
   */
  async deleteBucket(bucketId: string): Promise<StorageResponse<void>> {
    try {
      logger.info('Deleting bucket', { bucketId });

      await storage.deleteBucket(bucketId);

      logger.info('Bucket deleted successfully', { bucketId });

      return { success: true };
    } catch (error: any) {
      logger.error('Bucket deletion failed', { bucketId, error: error.message });
      return { success: false, error: 'Depolama alanı silinemedi' };
    }
  }
}

// Export singleton instance
export const storageService = StorageService.getInstance();

// Export convenience functions
export const uploadFile = (options: FileUploadOptions) => 
  storageService.uploadFile(options);

export const uploadFiles = (files: File[], bucketId: string, permissions?: string[]) => 
  storageService.uploadFiles(files, bucketId, permissions);

export const listFiles = (options: FileListOptions) => 
  storageService.listFiles(options);

export const getFileInfo = (bucketId: string, fileId: string) => 
  storageService.getFileInfo(bucketId, fileId);

export const downloadFile = (bucketId: string, fileId: string) => 
  storageService.downloadFile(bucketId, fileId);

export const getFileUrl = (bucketId: string, fileId: string) => 
  storageService.getFileUrl(bucketId, fileId);

export const deleteFile = (bucketId: string, fileId: string) => 
  storageService.deleteFile(bucketId, fileId);

export const copyFile = (
  sourceBucketId: string, 
  sourceFileId: string, 
  targetBucketId: string, 
  targetFileId?: string
) => storageService.copyFile(sourceBucketId, sourceFileId, targetBucketId, targetFileId);

export const getStorageStats = () => storageService.getStorageStats();

export const testFileStorage = () => storageService.testStorage();

export default storageService;
