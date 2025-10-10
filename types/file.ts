/**
 * @fileoverview File Storage Types
 * @description Type definitions for file storage and management operations
 *
 * @author Dernek Yönetim Sistemi Team
 * @version 1.0.0
 */

// =============================================================================
// FILE METADATA
// =============================================================================

/**
 * File metadata containing comprehensive information about stored files
 * @property uploadedBy - ID of the authenticated user who uploaded the file, or 'system' for anonymous/system uploads
 */
export interface FileMetadata {
  id: string;
  name: string;
  size: number;
  type: string;
  bucket: string;
  path: string;
  url: string;
  createdAt: Date;
  updatedAt: Date;
  uploadedBy: string;
  tags?: string[];
  description?: string;
  isPublic: boolean;
  downloadCount: number;
  lastDownloaded?: Date;
  checksum?: string;
  version?: number;
  metadata?: Record<string, any>;
}

// =============================================================================
// UPLOAD OPERATIONS
// =============================================================================

/**
 * Options for file upload operations
 */
export interface FileUploadOptions {
  bucket?: string;
  folder?: string;
  isPublic?: boolean;
  overwrite?: boolean;
  metadata?: Record<string, any>;
  tags?: string[];
  description?: string;
  maxSize?: number; // bytes
  allowedTypes?: string[];
  generateThumbnail?: boolean;
  compress?: boolean;
  onProgress?: (progress: number) => void;
}

/**
 * Result of file upload operation
 */
export interface FileUploadResult {
  success: boolean;
  file?: FileMetadata;
  error?: string;
  url?: string;
  path?: string;
}

// =============================================================================
// LIST AND SEARCH OPERATIONS
// =============================================================================

/**
 * Options for listing files
 */
export interface FileListOptions {
  bucket?: string;
  folder?: string;
  limit?: number;
  offset?: number;
  sortBy?: 'name' | 'size' | 'createdAt' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
  search?: string;
  tags?: string[];
  type?: string;
  uploadedBy?: string;
}

/**
 * Result of file list operation
 */
export interface FileListResult {
  files: FileMetadata[];
  total: number;
  hasMore: boolean;
  nextOffset?: number;
}

// =============================================================================
// DOWNLOAD OPERATIONS
// =============================================================================

/**
 * Options for file download
 */
export interface FileDownloadOptions {
  download?: boolean;
  filename?: string;
  disposition?: 'inline' | 'attachment';
}

// =============================================================================
// STORAGE CONFIGURATION
// =============================================================================

/**
 * Bucket configuration
 */
export interface BucketConfig {
  name: string;
  isPublic: boolean;
  allowedTypes: string[];
  maxSize: number; // bytes
  retention?: number; // days
  versioning: boolean;
  encryption: boolean;
  compression: boolean;
}

/**
 * Storage configuration
 */
export interface StorageConfig {
  buckets: Record<string, BucketConfig>;
  defaultBucket: string;
  uploadLimits: {
    maxFileSize: number; // bytes
    maxFilesPerUpload: number;
    allowedMimeTypes: string[];
  };
  security: {
    enableVirusScan: boolean;
    enableContentModeration: boolean;
    enableWatermarking: boolean;
    enableEncryption: boolean;
  };
  allowAnonymousUploads?: boolean;
}

// =============================================================================
// STORAGE STATS
// =============================================================================

/**
 * Storage statistics
 */
export interface StorageStats {
  totalFiles: number;
  totalSize: number;
  bucketStats: Record<
    string,
    {
      fileCount: number;
      totalSize: number;
      averageSize: number;
    }
  >;
  typeDistribution: Record<string, number>;
  recentUploads: FileMetadata[];
}
