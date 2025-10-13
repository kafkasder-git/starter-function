/**
 * @fileoverview Storage Service
 * @description File storage service for Appwrite Storage operations
 */

import { storage } from '@/lib/appwrite';
import { logger } from '@/lib/logging/logger';
import type { Models } from 'appwrite';

export interface UploadFileOptions {
  file: File;
  bucketId: string;
  onProgress?: (progress: number) => void;
}

export interface UploadFileResult {
  fileId: string;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  fileType: string;
}

/**
 * Storage Service Class
 */
export class StorageService {
  private static instance: StorageService;

  public static getInstance(): StorageService {
    if (!StorageService.instance) {
      StorageService.instance = new StorageService();
    }
    return StorageService.instance;
  }

  private constructor() {
    logger.info('StorageService initialized');
  }

  /**
   * Upload file to Appwrite Storage
   */
  async uploadFile(
    options: UploadFileOptions
  ): Promise<{ data: UploadFileResult | null; error: any }> {
    try {
      const { file, bucketId, onProgress } = options;

      logger.info('Uploading file to storage', {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        bucketId,
      });

      if (!storage) {
        throw new Error('Storage service not initialized');
      }

      const result = await storage.createFile(
        bucketId,
        file.name,
        file,
        undefined, // permissions
        (progress) => {
          const progressPercent = (progress.loaded / progress.total) * 100;
          onProgress?.(progressPercent);
        }
      );

      if (!result) {
        throw new Error('Upload failed - no result returned');
      }

      // Build file URL
      const fileUrl = this.getFileUrl(bucketId, result.$id);

      const uploadResult: UploadFileResult = {
        fileId: result.$id,
        fileUrl,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
      };

      logger.info('File uploaded successfully', {
        fileId: result.$id,
        fileName: file.name,
      });

      return { data: uploadResult, error: null };
    } catch (error) {
      logger.error('Failed to upload file', error);
      return { data: null, error };
    }
  }

  /**
   * Get file URL
   */
  getFileUrl(bucketId: string, fileId: string): string {
    if (!storage) {
      throw new Error('Storage service not initialized');
    }

    try {
      return storage.getFileView(bucketId, fileId).toString();
    } catch (error) {
      logger.error('Failed to get file URL', { bucketId, fileId, error });
      throw error;
    }
  }

  /**
   * Get file download URL
   */
  getFileDownloadUrl(bucketId: string, fileId: string): string {
    if (!storage) {
      throw new Error('Storage service not initialized');
    }

    try {
      return storage.getFileDownload(bucketId, fileId).toString();
    } catch (error) {
      logger.error('Failed to get file download URL', { bucketId, fileId, error });
      throw error;
    }
  }

  /**
   * Delete file from storage
   */
  async deleteFile(bucketId: string, fileId: string): Promise<{ data: boolean; error: any }> {
    try {
      if (!storage) {
        throw new Error('Storage service not initialized');
      }

      await storage.deleteFile(bucketId, fileId);

      logger.info('File deleted successfully', { bucketId, fileId });

      return { data: true, error: null };
    } catch (error) {
      logger.error('Failed to delete file', { bucketId, fileId, error });
      return { data: false, error };
    }
  }

  /**
   * Get file metadata
   */
  async getFileMetadata(
    bucketId: string,
    fileId: string
  ): Promise<{ data: Models.File | null; error: any }> {
    try {
      if (!storage) {
        throw new Error('Storage service not initialized');
      }

      const file = await storage.getFile(bucketId, fileId);

      return { data: file, error: null };
    } catch (error) {
      logger.error('Failed to get file metadata', { bucketId, fileId, error });
      return { data: null, error };
    }
  }

  /**
   * List files in bucket
   */
  async listFiles(
    bucketId: string,
    queries?: string[]
  ): Promise<{ data: Models.FileList | null; error: any }> {
    try {
      if (!storage) {
        throw new Error('Storage service not initialized');
      }

      const files = await storage.listFiles(bucketId, queries);

      return { data: files, error: null };
    } catch (error) {
      logger.error('Failed to list files', { bucketId, error });
      return { data: null, error };
    }
  }

  /**
   * Create bucket (admin only)
   */
  async createBucket(
    bucketId: string,
    name: string,
    permissions: string[] = ['read', 'write']
  ): Promise<{ data: Models.Bucket | null; error: any }> {
    try {
      if (!storage) {
        throw new Error('Storage service not initialized');
      }

      const bucket = await storage.createBucket(
        bucketId,
        name,
        permissions,
        false, // fileSecurity
        true, // enabled
        undefined, // maximumFileSize
        undefined, // allowedFileExtensions
        undefined, // compression
        undefined, // encryption
        false // antivirus
      );

      logger.info('Bucket created successfully', { bucketId, name });

      return { data: bucket, error: null };
    } catch (error) {
      logger.error('Failed to create bucket', { bucketId, name, error });
      return { data: null, error };
    }
  }

  /**
   * Delete bucket (admin only)
   */
  async deleteBucket(bucketId: string): Promise<{ data: boolean; error: any }> {
    try {
      if (!storage) {
        throw new Error('Storage service not initialized');
      }

      await storage.deleteBucket(bucketId);

      logger.info('Bucket deleted successfully', { bucketId });

      return { data: true, error: null };
    } catch (error) {
      logger.error('Failed to delete bucket', { bucketId, error });
      return { data: false, error };
    }
  }
}

// Export singleton instance
export const storageService = StorageService.getInstance();
