/**
 * @fileoverview Document Upload Component - Secure file upload with validation
 * 
 * @author Dernek Yönetim Sistemi Team
 * @version 1.0.0
 */

import { useState, useRef } from 'react';
import { Upload, X, FileText, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Progress } from '../ui/progress';
import { toast } from 'sonner';
import type { FileUploadOptions } from '../../services/fileStorageService';
import { fileStorageService } from '../../services/fileStorageService';

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  uploadedAt: Date;
  status: 'uploading' | 'success' | 'error';
  progress: number;
  url: string;
  errorMessage?: string;
  bucket: string;
  path: string;
  metadata?: Record<string, any>;
}

interface DocumentUploadProps {
  maxFiles?: number;
  maxSizePerFile?: number; // in MB
  allowedTypes?: string[];
  onUploadComplete?: (files: UploadedFile[]) => void;
  category?: string;
}

const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/jpg',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
];

const MIME_TYPE_LABELS: Record<string, string> = {
  'application/pdf': 'PDF',
  'image/jpeg': 'JPEG Image',
  'image/png': 'PNG Image',
  'image/jpg': 'JPG Image',
  'application/msword': 'Word Document',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'Word Document',
  'application/vnd.ms-excel': 'Excel Spreadsheet',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'Excel Spreadsheet',
};

/**
 * DocumentUpload Component
 * 
 * Provides secure file upload functionality with:
 * - MIME type validation
 * - File size validation
 * - Virus scanning placeholder
 * - Progress tracking
 * - Multiple file support
 */
export function DocumentUpload({
  maxFiles = 5,
  maxSizePerFile = 10, // 10 MB default
  allowedTypes = ALLOWED_MIME_TYPES,
  onUploadComplete,
  category = 'general',
}: DocumentUploadProps) {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    // MIME type validation
    if (!allowedTypes.includes(file.type)) {
      return `Desteklenmeyen dosya tipi: ${file.type}. İzin verilen: ${allowedTypes.map(t => MIME_TYPE_LABELS[t] || t).join(', ')}`;
    }

    // File size validation
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > maxSizePerFile) {
      return `Dosya boyutu çok büyük (${fileSizeMB.toFixed(2)} MB). Maksimum: ${maxSizePerFile} MB`;
    }

    // File name validation
    if (file.name.length > 255) {
      return 'Dosya adı çok uzun (maksimum 255 karakter)';
    }

    return null;
  };

  const simulateVirusScan = async (_file: File): Promise<boolean> => {
    // Placeholder for virus scanning
    // In real implementation, integrate with ClamAV or similar service
    await new Promise((resolve) => setTimeout(resolve, 500));
    
    return true; // Always pass for now
  };

  const uploadFile = async (file: File): Promise<UploadedFile> => {
    const uploadedFile: UploadedFile = {
      id: crypto.randomUUID(),
      name: file.name,
      size: file.size,
      type: file.type,
      uploadedAt: new Date(),
      status: 'uploading',
      progress: 0,
      url: '',
      bucket: '',
      path: '',
    };

    setFiles((prev) => [...prev, uploadedFile]);

    try {
      // Virus scan
      const isClean = await simulateVirusScan(file);
      if (!isClean) {
        throw new Error('Dosyada virüs tespit edildi');
      }

      // Get current user
      const {user} = useAuthStore.getState();
      const uploadedBy = user?.id || 'system';

      // Determine bucket and folder
      const bucket = 'documents';
      const folder = category;

      // Prepare upload options
      const options: FileUploadOptions = {
        bucket,
        folder,
        isPublic: false,
        metadata: { originalName: file.name, uploadedBy },
        tags: [],
        description: '',
      };

      // Start progress simulation in parallel (faster intervals for responsiveness)
      const progressPromise = (async () => {
        for (let progress = 0; progress <= 100; progress += 10) {
          await new Promise((resolve) => setTimeout(resolve, 50));
          setFiles((prev) =>
            prev.map((f) =>
              f.id === uploadedFile.id ? { ...f, progress } : f,
            ),
          );
        }
      })();

      // Perform real upload
      const result = await fileStorageService.uploadFile(file, options);

      // Ensure progress completes
      await progressPromise;

      if (!result.success) {
        throw new Error(result.error || 'Upload failed');
      }

      // Create final file from result metadata
      const finalFile: UploadedFile = {
        id: result.file!.id,
        name: result.file!.name,
        size: result.file!.size,
        type: result.file!.type,
        uploadedAt: new Date(),
        status: 'success',
        progress: 100,
        url: result.file!.url,
        bucket: result.file!.bucket,
        path: result.file!.path,
        metadata: result.file!.metadata,
      };

      setFiles((prev) =>
        prev.map((f) => (f.id === uploadedFile.id ? finalFile : f)),
      );

      return finalFile;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      const failedFile: UploadedFile = {
        ...uploadedFile,
        status: 'error',
        errorMessage,
      };

      setFiles((prev) =>
        prev.map((f) => (f.id === uploadedFile.id ? failedFile : f)),
      );

      throw error;
    }
  };

  const handleFileSelect = async (selectedFiles: FileList | null) => {
    if (!selectedFiles) return;

    const filesToUpload = Array.from(selectedFiles);

    // Check max files limit
    if (files.length + filesToUpload.length > maxFiles) {
      toast.error(`Maksimum ${maxFiles} dosya yüklenebilir`);
      return;
    }

    // Validate and upload files
    const successfulUploads: UploadedFile[] = [];
    for (const file of filesToUpload) {
      const validationError = validateFile(file);
      if (validationError) {
        toast.error(validationError);
        continue;
      }

      try {
        const uploaded = await uploadFile(file);
        successfulUploads.push(uploaded);
        toast.success(`${file.name} başarıyla yüklendi`);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Upload failed';
        toast.error(`${file.name} yüklenirken hata: ${errorMessage}`);
      }
    }

    // Notify parent component with successful uploads
    if (successfulUploads.length > 0 && onUploadComplete) {
      onUploadComplete(successfulUploads);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center transition-all
          ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={allowedTypes.join(',')}
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
        />
        
        <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
        
        <p className="text-gray-700 font-medium mb-2">
          Dosyaları buraya sürükleyin veya tıklayın
        </p>
        
        <p className="text-sm text-gray-500 mb-4">
          Maksimum {maxFiles} dosya, dosya başına max {maxSizePerFile} MB
        </p>
        
        <Button
          type="button"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
        >
          Dosya Seç
        </Button>
        
        <p className="text-xs text-gray-400 mt-4">
          İzin verilen formatlar: {allowedTypes.map(t => MIME_TYPE_LABELS[t] || t).join(', ')}
        </p>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-700">Yüklenen Dosyalar ({files.length})</h3>
          {files.map((file) => (
            <Card key={file.id} className="p-4">
              <div className="flex items-center gap-3">
                {/* Status Icon */}
                <div className="flex-shrink-0">
                  {file.status === 'uploading' && <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />}
                  {file.status === 'success' && <CheckCircle className="w-5 h-5 text-green-500" />}
                  {file.status === 'error' && <AlertCircle className="w-5 h-5 text-red-500" />}
                </div>

                {/* File Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-gray-400" />
                      <span className="text-sm font-medium text-gray-900 truncate">
                        {file.name}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500">
                      {formatFileSize(file.size)}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  {file.status === 'uploading' && (
                    <Progress value={file.progress} className="h-1" />
                  )}

                  {/* Error Message */}
                  {file.status === 'error' && (
                    <p className="text-xs text-red-600 mt-1">{file.errorMessage}</p>
                  )}

                  {/* Success Info */}
                  {file.status === 'success' && (
                    <p className="text-xs text-green-600 mt-1">
                      Başarıyla yüklendi • {file.uploadedAt.toLocaleTimeString('tr-TR')}
                    </p>
                  )}
                </div>

                {/* Remove Button */}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => { removeFile(file.id); }}
                  className="flex-shrink-0"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export default DocumentUpload;

