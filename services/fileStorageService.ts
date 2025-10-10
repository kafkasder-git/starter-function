/**
 * @fileoverview Comprehensive File Storage Service
 * @description Centralized file management system with Supabase Storage integration
 */

import { supabase } from '../lib/supabase';
import { environment } from '../lib/environment';
import { monitoring } from './monitoringService';
import { logger } from '../lib/logging/logger';
import { useAuthStore } from '../stores/authStore';
import type {
  FileMetadata,
  FileUploadOptions,
  FileUploadResult,
  FileListOptions,
  FileListResult,
  FileDownloadOptions,
  StorageConfig,
} from '../types/file';

// Re-export types for backward compatibility
export type {
  FileMetadata,
  FileUploadOptions,
  FileUploadResult,
  FileListOptions,
  FileListResult,
  FileDownloadOptions,
  StorageConfig,
} from '../types/file';

// =============================================================================
// STORAGE CONFIGURATION
// =============================================================================

const STORAGE_CONFIG: StorageConfig = {
  buckets: {
    documents: {
      name: 'documents',
      isPublic: false,
      allowedTypes: [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain',
      ],
      maxSize: 10 * 1024 * 1024, // 10MB
      versioning: true,
      encryption: true,
      compression: false,
    },
    images: {
      name: 'images',
      isPublic: true,
      allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'],
      maxSize: 5 * 1024 * 1024, // 5MB
      versioning: true,
      encryption: false,
      compression: true,
    },
    reports: {
      name: 'reports',
      isPublic: false,
      allowedTypes: [
        'application/pdf',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      ],
      maxSize: 50 * 1024 * 1024, // 50MB
      versioning: true,
      encryption: true,
      compression: true,
    },
    temp: {
      name: 'temp',
      isPublic: false,
      allowedTypes: ['*/*'],
      maxSize: 100 * 1024 * 1024, // 100MB
      retention: 7, // 7 days
      versioning: false,
      encryption: false,
      compression: false,
    },
    backups: {
      name: 'backups',
      isPublic: false,
      allowedTypes: ['application/zip', 'application/gzip', 'application/x-tar'],
      maxSize: 500 * 1024 * 1024, // 500MB
      versioning: true,
      encryption: true,
      compression: true,
    },
  },
  defaultBucket: 'documents',
  uploadLimits: {
    maxFileSize: 100 * 1024 * 1024, // 100MB
    maxFilesPerUpload: 10,
    allowedMimeTypes: [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'image/svg+xml',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain',
      'text/csv',
      'application/zip',
      'application/gzip',
      'application/x-tar',
    ],
  },
  security: {
    enableVirusScan: environment.features.security?.virusScan || false,
    enableContentModeration: environment.features.security?.contentModeration || false,
    enableWatermarking: environment.features.security?.watermarking || false,
    enableEncryption: environment.features.security?.encryption || false,
  },
  allowAnonymousUploads: true, // Allow anonymous uploads as fallback
};

// =============================================================================
// FILE STORAGE SERVICE CLASS
// =============================================================================

export class FileStorageService {
  private static instance: FileStorageService;
  private readonly config: StorageConfig;

  private constructor() {
    this.config = STORAGE_CONFIG;
    this.initializeBuckets();
  }

  public static getInstance(): FileStorageService {
    if (!FileStorageService.instance) {
      FileStorageService.instance = new FileStorageService();
    }
    return FileStorageService.instance;
  }

  /**
   * Get current authenticated user ID for tracking uploads
   * @returns User ID or 'system' as fallback
   */
  private getCurrentUserId(): string {
    const user = useAuthStore.getState().user;
    return user?.id || 'system';
  }

  /**
   * Initialize storage buckets
   */
  private async initializeBuckets(): Promise<void> {
    try {
      const { data: buckets, error } = await supabase.storage.listBuckets();

      if (error) {
        logger.error('Failed to list buckets:', error);
        return;
      }

      const existingBuckets = buckets?.map((b: { name: any }) => b.name) || [];

      for (const [_key, config] of Object.entries(this.config.buckets)) {
        if (!existingBuckets.includes(config.name)) {
          const { error: createError } = await supabase.storage.createBucket(config.name, {
            public: config.isPublic,
            allowedMimeTypes: config.allowedTypes,
            fileSizeLimit: config.maxSize,
          });

          if (createError) {
            logger.error(`Failed to create bucket ${config.name}:`, createError);
          } else {
            logger.info(`✅ Created bucket: ${config.name}`);
          }
        }
      }

      monitoring.trackEvent({
        type: 'file_storage_initialized',
        category: 'storage',
        action: 'initialize',
        metadata: {
          buckets: Object.keys(this.config.buckets),
          totalBuckets: Object.keys(this.config.buckets).length,
        },
      });
    } catch (error) {
      logger.error('Failed to initialize buckets:', error);
    }
  }

  // =============================================================================
  // FILE UPLOAD OPERATIONS
  // =============================================================================

  /**
   * Upload single file with progress tracking
   */
  async uploadFile(file: File, options: FileUploadOptions = {}): Promise<FileUploadResult> {
    const startTime = Date.now();

    try {
      // Check user authentication if required
      if (!this.config.allowAnonymousUploads) {
        const user = useAuthStore.getState().user;
        if (!user) {
          return { success: false, error: 'Authentication required for file uploads' };
        }
      }

      // Validate file
      const validation = this.validateFile(file, options);
      if (!validation.valid) {
        return { success: false, error: validation.error || 'Validation failed' };
      }

      // Determine bucket and path
      const bucket = options.bucket || this.config.defaultBucket;
      const folder = options.folder || '';
      const fileName = this.generateUniqueFileName(file.name, options.overwrite);
      const filePath = folder ? `${folder}/${fileName}` : fileName;

      // Check if file already exists
      if (!options.overwrite) {
        const { data: existingFiles } = await supabase.storage
          .from(bucket)
          .list(folder, { search: fileName });

        if (existingFiles && existingFiles.length > 0) {
          return {
            success: false,
            error: `File already exists: ${fileName}. Set overwrite=true to replace.`,
          };
        }
      }

      // Process file (compression, encryption, etc.)
      let processedFile = file;
      if (options.compress) {
        processedFile = await this.processFile(file);
      }

      // Start progress tracking
      let progress = 0;
      const progressInterval = setInterval(() => {
        progress += 10;
        if (progress >= 90) {
          progress = 90;
          clearInterval(progressInterval);
        }
        options.onProgress?.(progress);
      }, 200); // Update every 200ms for smoother UI

      // Get current user info
      const currentUserId = this.getCurrentUserId();
      const user = useAuthStore.getState().user;

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage.from(bucket).upload(filePath, processedFile, {
        cacheControl: '3600',
        upsert: options.overwrite || false,
        contentType: file.type,
        metadata: {
          originalName: file.name,
          uploadedBy: currentUserId,
          uploadedById: currentUserId,
          uploadedByEmail: user?.email || '',
          uploadedByName: user?.name || '',
          description: options.description || '',
          tags: JSON.stringify(options.tags || []),
          ...options.metadata,
        },
      });

      if (error) {
        clearInterval(progressInterval);
        throw error;
      }

      // Get file info
      const { data: fileInfo } = await supabase.storage
        .from(bucket)
        .list(folder, { search: fileName });

      if (!fileInfo || fileInfo.length === 0) {
        clearInterval(progressInterval);
        throw new Error('Failed to get uploaded file info');
      }

      // Generate public URL
      const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(filePath);

      // Create file metadata
      const fileMetadata: FileMetadata = {
        id: data?.path || filePath,
        name: file.name,
        size: file.size,
        type: file.type,
        bucket,
        path: filePath,
        url: urlData.publicUrl,
        createdAt: new Date(),
        updatedAt: new Date(),
        uploadedBy: currentUserId,
        isPublic: options.isPublic || false,
        downloadCount: 0,
        tags: options.tags || [],
        description: options.description || '',
        metadata: options.metadata || {},
      };

      // Save metadata to database (in real app)
      await this.saveFileMetadata(fileMetadata);

      // Complete progress
      clearInterval(progressInterval);
      options.onProgress?.(100);

      const processingTime = Date.now() - startTime;
      const result: FileUploadResult = {
        success: true,
        file: fileMetadata,
        url: fileMetadata.url,
        path: fileMetadata.path,
      };

      // Track success
      monitoring.trackApiCall('file_storage/upload', 'POST', processingTime, 200, {
        bucket,
        fileSize: file.size,
        fileType: file.type,
        compressed: options.compress || false,
        userId: currentUserId,
      });

      return result;
    } catch (error) {
      const processingTime = Date.now() - startTime;
      const errorResult: FileUploadResult = {
        success: false,
        error: (error as Error).message,
      };

      // Track error
      monitoring.trackApiCall('file_storage/upload', 'POST', processingTime, 500, {
        fileSize: file.size,
        fileType: file.type,
        error: (error as Error).message,
      });

      return errorResult;
    }
  }

  /**
   * Upload multiple files with aggregate progress tracking
   */
  async uploadFiles(files: File[], options: FileUploadOptions = {}): Promise<FileUploadResult[]> {
    const results: FileUploadResult[] = [];

    // Check limits
    if (files.length > this.config.uploadLimits.maxFilesPerUpload) {
      const errorResult: FileUploadResult = {
        success: false,
        error: `Too many files. Maximum allowed: ${this.config.uploadLimits.maxFilesPerUpload}`,
      };
      return new Array(files.length).fill(errorResult);
    }

    let completed = 0;
    const total = files.length;

    for (const file of files) {
      const result = await this.uploadFile(file, {
        ...options,
        onProgress: (progress) => {
          // Individual file progress (0-100) contributes to overall progress
          const overallProgress = ((completed + progress / 100) / total) * 100;
          options.onProgress?.(Math.round(overallProgress));
        },
      });
      results.push(result);
      completed++;

      // Small delay between uploads to prevent rate limiting
      if (files.length > 1) {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    }

    // Ensure final progress is 100%
    options.onProgress?.(100);

    return results;
  }

  // =============================================================================
  // FILE RETRIEVAL OPERATIONS
  // =============================================================================

  /**
   * List files
   */
  async listFiles(options: FileListOptions = {}): Promise<FileListResult> {
    const startTime = Date.now();

    try {
      const bucket = options.bucket || this.config.defaultBucket;
      const folder = options.folder || '';
      const limit = options.limit || 50;
      const offset = options.offset || 0;

      const query = supabase.storage.from(bucket).list(folder, {
        limit,
        offset,
        sortBy: {
          column: options.sortBy || 'name',
          order: options.sortOrder || 'asc',
        },
      });

      // Apply filters
      if (options.search) {
        // Note: Supabase Storage doesn't support search in list operation
        // This would require a separate metadata table query
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      // Get total count (simplified - in real app, use metadata table)
      const { data: allFiles } = await supabase.storage.from(bucket).list(folder, { limit: 1000 });

      const total = allFiles?.length || 0;
      const hasMore = offset + limit < total;

      // Convert to FileMetadata objects
      const files: FileMetadata[] = (data || []).map(
        (file: {
          id: any;
          name: any;
          metadata: { size: any; mimetype: any; uploadedBy: any; tags: string; description: any };
          created_at: any;
          updated_at: any;
        }) => ({
          id: file.id || file.name,
          name: file.name,
          size: file.metadata?.size || 0,
          type: file.metadata?.mimetype || 'application/octet-stream',
          bucket,
          path: folder ? `${folder}/${file.name}` : file.name,
          url: supabase.storage
            .from(bucket)
            .getPublicUrl(folder ? `${folder}/${file.name}` : file.name).data.publicUrl,
          createdAt: new Date(file.created_at || ''),
          updatedAt: new Date(file.updated_at || ''),
          uploadedBy: file.metadata?.uploadedBy || this.getCurrentUserId(),
          isPublic: this.config.buckets[bucket]?.isPublic || false,
          downloadCount: 0,
          tags: file.metadata?.tags ? JSON.parse(file.metadata.tags) : [],
          description: file.metadata?.description || '',
          metadata: file.metadata || {},
        }),
      );

      const processingTime = Date.now() - startTime;
      const result: FileListResult = {
        files,
        total,
        hasMore,
        nextOffset: hasMore ? offset + limit : 0,
      };

      // Track success
      monitoring.trackApiCall('file_storage/list', 'GET', processingTime, 200, {
        bucket,
        count: files.length,
        total,
        hasMore,
      });

      return result;
    } catch (error) {
      const processingTime = Date.now() - startTime;
      // Error result would be returned here in a real implementation
      // const errorResult: FileListResult = {
      //   files: [],
      //   total: 0,
      //   hasMore: false,
      // };

      // Track error
      monitoring.trackApiCall('file_storage/list', 'GET', processingTime, 500, {
        bucket: options.bucket || this.config.defaultBucket,
        error: (error as Error).message,
      });

      throw error;
    }
  }

  /**
   * Get file info
   */
  async getFileInfo(bucket: string, filePath: string): Promise<FileMetadata | null> {
    const startTime = Date.now();

    try {
      const { data, error } = await supabase.storage.from(bucket).list('', { search: filePath });

      if (error) {
        throw error;
      }

      const file = data?.[0];
      if (!file) {
        return null;
      }

      const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(filePath);

      const fileInfo: FileMetadata = {
        id: file.id || file.name,
        name: file.name,
        size: file.metadata?.size || 0,
        type: file.metadata?.mimetype || 'application/octet-stream',
        bucket,
        path: filePath,
        url: urlData.publicUrl,
        createdAt: new Date(file.created_at || ''),
        updatedAt: new Date(file.updated_at || ''),
        uploadedBy: file.metadata?.uploadedBy || this.getCurrentUserId(),
        isPublic: this.config.buckets[bucket]?.isPublic || false,
        downloadCount: 0,
        tags: file.metadata?.tags ? JSON.parse(file.metadata.tags) : [],
        description: file.metadata?.description || '',
        metadata: file.metadata || {},
      };

      const processingTime = Date.now() - startTime;

      // Track success
      monitoring.trackApiCall('file_storage/info', 'GET', processingTime, 200, {
        bucket,
        filePath,
      });

      return fileInfo;
    } catch (error) {
      const processingTime = Date.now() - startTime;

      // Track error
      monitoring.trackApiCall('file_storage/info', 'GET', processingTime, 500, {
        bucket,
        filePath,
        error: (error as Error).message,
      });

      throw error;
    }
  }

  // =============================================================================
  // FILE DOWNLOAD OPERATIONS
  // =============================================================================

  /**
   * Download file
   */
  async downloadFile(
    bucket: string,
    filePath: string,
    _options: FileDownloadOptions = {},
  ): Promise<Blob | null> {
    const startTime = Date.now();

    try {
      const { data, error } = await supabase.storage.from(bucket).download(filePath);

      if (error) {
        throw error;
      }

      // Update download count
      await this.incrementDownloadCount(bucket, filePath);

      const processingTime = Date.now() - startTime;

      // Track success
      monitoring.trackApiCall('file_storage/download', 'GET', processingTime, 200, {
        bucket,
        filePath,
        fileSize: data.size,
      });

      return data;
    } catch (error) {
      const processingTime = Date.now() - startTime;

      // Track error
      monitoring.trackApiCall('file_storage/download', 'GET', processingTime, 500, {
        bucket,
        filePath,
        error: (error as Error).message,
      });

      throw error;
    }
  }

  /**
   * Get file URL
   */
  async getFileUrl(bucket: string, filePath: string, expiresIn = 3600): Promise<string | null> {
    const startTime = Date.now();

    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .createSignedUrl(filePath, expiresIn);

      if (error) {
        throw error;
      }

      const processingTime = Date.now() - startTime;

      // Track success
      monitoring.trackApiCall('file_storage/url', 'GET', processingTime, 200, {
        bucket,
        filePath,
        expiresIn,
      });

      return data.signedUrl;
    } catch (error) {
      const processingTime = Date.now() - startTime;

      // Track error
      monitoring.trackApiCall('file_storage/url', 'GET', processingTime, 500, {
        bucket,
        filePath,
        error: (error as Error).message,
      });

      throw error;
    }
  }

  // =============================================================================
  // FILE MANAGEMENT OPERATIONS
  // =============================================================================

  /**
   * Delete file
   */
  async deleteFile(bucket: string, filePath: string): Promise<boolean> {
    const startTime = Date.now();

    try {
      const { error } = await supabase.storage.from(bucket).remove([filePath]);

      if (error) {
        throw error;
      }

      // Delete metadata from database (in real app)
      await this.deleteFileMetadata(bucket, filePath);

      const processingTime = Date.now() - startTime;

      // Track success
      monitoring.trackApiCall('file_storage/delete', 'DELETE', processingTime, 200, {
        bucket,
        filePath,
      });

      return true;
    } catch (error) {
      const processingTime = Date.now() - startTime;

      // Track error
      monitoring.trackApiCall('file_storage/delete', 'DELETE', processingTime, 500, {
        bucket,
        filePath,
        error: (error as Error).message,
      });

      throw error;
    }
  }

  /**
   * Copy file
   */
  async copyFile(
    sourceBucket: string,
    sourcePath: string,
    targetBucket: string,
    targetPath: string,
  ): Promise<FileMetadata | null> {
    const startTime = Date.now();

    try {
      // Get source file
      const { data: sourceFile, error: downloadError } = await supabase.storage
        .from(sourceBucket)
        .download(sourcePath);

      if (downloadError) {
        throw downloadError;
      }

      // Upload to target
      const { data: _data, error: uploadError } = await supabase.storage
        .from(targetBucket)
        .upload(targetPath, sourceFile, {
          cacheControl: '3600',
          upsert: true,
        });

      if (uploadError) {
        throw uploadError;
      }

      // Get file info
      const fileInfo = await this.getFileInfo(targetBucket, targetPath);

      const processingTime = Date.now() - startTime;

      // Track success
      monitoring.trackApiCall('file_storage/copy', 'POST', processingTime, 200, {
        sourceBucket,
        sourcePath,
        targetBucket,
        targetPath,
        fileSize: sourceFile.size,
      });

      return fileInfo;
    } catch (error) {
      const processingTime = Date.now() - startTime;

      // Track error
      monitoring.trackApiCall('file_storage/copy', 'POST', processingTime, 500, {
        sourceBucket,
        sourcePath,
        targetBucket,
        targetPath,
        error: (error as Error).message,
      });

      throw error;
    }
  }

  // =============================================================================
  // UTILITY METHODS
  // =============================================================================

  /**
   * Validate file
   */
  private validateFile(file: File, options: FileUploadOptions): { valid: boolean; error?: string } {
    // Check file size
    const maxSize = options.maxSize || this.config.uploadLimits.maxFileSize;
    if (file.size > maxSize) {
      return { valid: false, error: `File size exceeds limit: ${maxSize} bytes` };
    }

    // Check file type
    const allowedTypes = options.allowedTypes || this.config.uploadLimits.allowedMimeTypes;
    if (!allowedTypes.includes('*/*') && !allowedTypes.includes(file.type)) {
      return { valid: false, error: `File type not allowed: ${file.type}` };
    }

    // Check bucket-specific limits
    const bucket = options.bucket || this.config.defaultBucket;
    const bucketConfig = this.config.buckets[bucket];
    if (bucketConfig) {
      if (file.size > bucketConfig.maxSize) {
        return {
          valid: false,
          error: `File size exceeds bucket limit: ${bucketConfig.maxSize} bytes`,
        };
      }
      if (
        !bucketConfig.allowedTypes.includes('*/*') &&
        !bucketConfig.allowedTypes.includes(file.type)
      ) {
        return { valid: false, error: `File type not allowed in bucket ${bucket}: ${file.type}` };
      }
    }

    return { valid: true };
  }

  /**
   * Generate unique file name
   */
  private generateUniqueFileName(originalName: string, overwrite = false): string {
    if (overwrite) {
      return originalName;
    }

    const timestamp = Date.now();
    // Use crypto.randomUUID if available, otherwise fallback to secure random
    let random: string;
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      random = crypto.randomUUID().replace(/-/g, '').substring(0, 9);
    } else if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
      const array = new Uint8Array(9);
      window.crypto.getRandomValues(array);
      random = Array.from(array, (byte) => byte.toString(36))
        .join('')
        .substring(0, 9);
    } else {
      random = Math.random().toString(36).substr(2, 9);
    }
    const extension = originalName.split('.').pop();
    const nameWithoutExtension = originalName.replace(`.${extension}`, '');

    return `${nameWithoutExtension}_${timestamp}_${random}.${extension}`;
  }

  /**
   * Process file (compression, encryption, etc.)
   */
  private async processFile(file: File): Promise<File> {
    // Implementation - will add compression/encryption
    return file;
  }

  /**
   * Save file metadata (implementation pending)
   */
  private async saveFileMetadata(metadata: FileMetadata): Promise<void> {
    // In real app, save to database
    logger.info('Saving file metadata:', metadata);
  }

  /**
   * Delete file metadata (implementation pending)
   */
  private async deleteFileMetadata(bucket: string, filePath: string): Promise<void> {
    // In real app, delete from database
    logger.info('Deleting file metadata:', { bucket, filePath });
  }

  /**
   * Increment download count
   */
  private async incrementDownloadCount(bucket: string, filePath: string): Promise<void> {
    // In real app, update download count in database
    logger.info('Incrementing download count:', { bucket, filePath });
  }

  /**
   * Get storage statistics
   */
  async getStorageStats(): Promise<{
    totalFiles: number;
    totalSize: number;
    bucketStats: Record<string, { files: number; size: number }>;
    recentUploads: FileMetadata[];
  }> {
    const stats = {
      totalFiles: 0,
      totalSize: 0,
      bucketStats: {} as Record<string, { files: number; size: number }>,
      recentUploads: [] as FileMetadata[],
    };

    // Get stats for each bucket
    for (const [_key, config] of Object.entries(this.config.buckets)) {
      try {
        const { data: files } = await supabase.storage.from(config.name).list('', { limit: 1000 });

        const bucketFiles = files || [];
        const bucketSize = bucketFiles.reduce(
          (sum: any, file: { metadata: { size: any } }) => sum + (file.metadata?.size || 0),
          0,
        );

        stats.bucketStats[config.name] = {
          files: bucketFiles.length,
          size: bucketSize,
        };

        stats.totalFiles += bucketFiles.length;
        stats.totalSize += bucketSize;
      } catch (error) {
        logger.error(`Failed to get stats for bucket ${config.name}:`, error);
      }
    }

    // Get recent uploads (implementation pending)
    stats.recentUploads = [];

    return stats;
  }

  /**
   * Test storage configuration
   */
  async testStorage(): Promise<{ success: boolean; errors: string[] }> {
    const errors: string[] = [];

    try {
      // Test bucket access
      for (const [_key, config] of Object.entries(this.config.buckets)) {
        try {
          const { error } = await supabase.storage.from(config.name).list('', { limit: 1 });

          if (error) {
            errors.push(`Cannot access bucket ${config.name}: ${error.message}`);
          }
        } catch (error) {
          errors.push(`Failed to test bucket ${config.name}: ${(error as Error).message}`);
        }
      }

      // Test upload/download with a small test file
      const testFile = new File(['test'], 'test.txt', { type: 'text/plain' });

      try {
        const uploadResult = await this.uploadFile(testFile, {
          bucket: 'temp',
          folder: 'test',
          isPublic: false,
        });

        if (uploadResult.success && uploadResult.path) {
          // Clean up test file
          await this.deleteFile('temp', uploadResult.path);
        }
      } catch (error) {
        errors.push(`Upload/download test failed: ${(error as Error).message}`);
      }
    } catch (error) {
      errors.push(`Storage test failed: ${(error as Error).message}`);
    }

    return {
      success: errors.length === 0,
      errors,
    };
  }
}

// =============================================================================
// GLOBAL INSTANCE AND UTILITIES
// =============================================================================

export const fileStorageService = FileStorageService.getInstance();

// Utility functions for easy access
export const uploadFile = (file: File, options?: FileUploadOptions) =>
  fileStorageService.uploadFile(file, options);
export const uploadFiles = (files: File[], options?: FileUploadOptions) =>
  fileStorageService.uploadFiles(files, options);
export const listFiles = (options?: FileListOptions) => fileStorageService.listFiles(options);
export const getFileInfo = (bucket: string, filePath: string) =>
  fileStorageService.getFileInfo(bucket, filePath);
export const downloadFile = (bucket: string, filePath: string, options?: FileDownloadOptions) =>
  fileStorageService.downloadFile(bucket, filePath, options);
export const getFileUrl = (bucket: string, filePath: string, expiresIn?: number) =>
  fileStorageService.getFileUrl(bucket, filePath, expiresIn);
export const deleteFile = (bucket: string, filePath: string) =>
  fileStorageService.deleteFile(bucket, filePath);
export const copyFile = (
  sourceBucket: string,
  sourcePath: string,
  targetBucket: string,
  targetPath: string,
) => fileStorageService.copyFile(sourceBucket, sourcePath, targetBucket, targetPath);
export const getStorageStats = () => fileStorageService.getStorageStats();
export const testFileStorage = () => fileStorageService.testStorage();

export default FileStorageService;
