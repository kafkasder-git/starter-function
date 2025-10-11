/**
 * @fileoverview BeneficiaryDocuments Module - Application module
 *
 * @author Dernek Yönetim Sistemi Team
 * @version 1.0.0
 */

import {
  Camera,
  Download,
  Eye,
  File,
  FileSpreadsheet,
  FileText,
  Image as ImageIcon,
  Trash2,
  Upload,
} from 'lucide-react';
import { formatDate } from '../../lib/utils/dateFormatter';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Input } from '../ui/input';
import { fileStorageService, type FileUploadResult } from '../../services/fileStorageService';
import { beneficiariesService } from '../../services/beneficiariesService';
import { useAuthStore } from '../../stores/authStore';

// Extended document type that includes FileUploadResult properties
interface DocumentFile {
  id: string;
  name: string;
  type: string;
  url: string;
  uploadedAt?: Date;
  uploadDate?: Date;
  bucket?: string;
  path?: string;
  uploadedBy?: string;
  size?: number;
  success?: boolean;
}

interface BeneficiaryDocumentsProps {
  beneficiaryId: string;
  documents?: DocumentFile[];
  onDocumentUpload?: (files: File[]) => void;
  onDocumentDelete?: (documentId: string) => void;
}

/**
 * BeneficiaryDocuments function
 *
 * @param {Object} params - Function parameters
 * @returns {void} Nothing
 */
export function BeneficiaryDocuments({
  beneficiaryId,
  onDocumentUpload,
  onDocumentDelete,
}: BeneficiaryDocumentsProps) {
  const [isDocumentModalOpen, setIsDocumentModalOpen] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<DocumentFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFileType, setSelectedFileType] = useState('all');
  const [previewFile, setPreviewFile] = useState<DocumentFile | null>(null);
  const [isLoadingDocuments, setIsLoadingDocuments] = useState(false);

  useEffect(() => {
    const fetchDocuments = async () => {
      setIsLoadingDocuments(true);
      try {
        const response = await beneficiariesService.getById(beneficiaryId);
        if (response.data?.supporting_documents) {
          const docs = response.data.supporting_documents.map((url: string, index: number) => {
            // Parse URL to extract bucket, path, name, etc.
            // Assuming URL format: https://cloud.appwrite.io/v1/storage/buckets/bucketId/files/fileId/view
            const urlParts = url.split('/');
            const bucket = urlParts[urlParts.length - 2];
            const path = urlParts.slice(-2).join('/');
            const name = path.split('/').pop() ?? 'Unknown';
            const type = name.split('.').pop() ?? 'application/octet-stream'; // Rough guess
            return {
              id: `${beneficiaryId}-${index}`,
              name,
              type,
              url,
              uploadedAt: new Date(), // Placeholder, as we don't have upload date
              bucket,
              path,
              uploadedBy: 'system', // Placeholder
            };
          });
          setUploadedFiles(docs);
        }
      } catch {
        toast.error('Belgeler yüklenirken hata oluştu');
      } finally {
        setIsLoadingDocuments(false);
      }
    };

    if (beneficiaryId) {
      fetchDocuments();
    }
  }, [beneficiaryId]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    if (files.length === 0) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Get Current User
      const {user} = useAuthStore.getState();

      // Prepare Upload Options
      const options = {
        bucket: 'documents',
        folder: `beneficiaries/${beneficiaryId}`,
        isPublic: false,
        metadata: { beneficiaryId },
      };

      // Upload Files to Storage
      const results: FileUploadResult[] = await fileStorageService.uploadFiles(files, options);

      // Track Progress: Keep existing progress simulation
      for (let i = 0; i <= 100; i += 10) {
        setUploadProgress(i);
        await new Promise((resolve) => setTimeout(resolve, 50));
      }

      // Process Results
      const successfulUploads = results.filter(result => result.success);
      const newDocumentUrls = successfulUploads.map(result => result.url ?? '').filter(url => url);
      const newFiles = successfulUploads.map((result, index) => ({
        id: result.file?.id ?? `${Date.now()}-${index}`,
        name: result.file?.name ?? files[index]?.name ?? 'unknown',
        size: result.file?.size ?? files[index]?.size ?? 0,
        type: result.file?.type ?? files[index]?.type ?? 'application/octet-stream',
        url: result.file?.url ?? '',
        uploadDate: new Date(),
        bucket: result.file?.bucket ?? 'documents',
        path: result.file?.path ?? '',
        uploadedBy: user?.id ?? 'system',
      }));

      // Update Database
      if (newDocumentUrls.length > 0) {
        await beneficiariesService.addSupportingDocuments(beneficiaryId, newDocumentUrls);
      }

      // Update Local State
      setUploadedFiles((prev) => [...prev, ...newFiles]);

      // Call Parent Callback
      onDocumentUpload?.(files);

      // Show Success Toast
      toast.success(`${successfulUploads.length} dosya başarıyla yüklendi!`);
    } catch {
      toast.error('Dosya yükleme hatası!');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDeleteFile = async (fileId: string) => {
    try {
      // Find Document
      const document = uploadedFiles.find(file => file.id === fileId);
      if (!document || !document.bucket || !document.path) return;

      // Delete from Storage
      await fileStorageService.deleteFile(document.bucket, document.path);

      // Update Database
      await beneficiariesService.removeSupportingDocument(beneficiaryId, document.url);

      // Update Local State
      setUploadedFiles((prev) => prev.filter((file) => file.id !== fileId));

      // Call Parent Callback
      onDocumentDelete?.(fileId);

      // Show Success Toast
      toast.success('Dosya silindi!');
    } catch {
      toast.error('Dosya silme hatası!');
    }
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return <ImageIcon className="w-4 h-4" />;
    if (fileType.includes('spreadsheet') || fileType.includes('excel'))
      return <FileSpreadsheet className="w-4 h-4" />;
    if (fileType.includes('pdf') || fileType.includes('text'))
      return <FileText className="w-4 h-4" />;
    return <File className="w-4 h-4" />;
  };

  const filteredFiles = uploadedFiles.filter((file) => {
    const matchesSearch = file.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedFileType === 'all' || file.type.includes(selectedFileType);
    return matchesSearch && matchesType;
  });

  const handleDownload = async (bucket: string, path: string) => {
    try {
      const blob = await fileStorageService.downloadFile(bucket, path);
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = path.split('/').pop() || 'download';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      toast.error('İndirme hatası!');
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Belgeler
            </span>
            <Button
              size="sm"
              onClick={() => {
                setIsDocumentModalOpen(true);
              }}
              disabled={isLoadingDocuments || isUploading}
            >
              <Upload className="w-4 h-4 mr-2" />
              Belge Yükle
            </Button>
          </CardTitle>
        </CardHeader>

        <CardContent>
          {isLoadingDocuments ? (
            <div className="space-y-3">
              {/* Skeleton loaders */}
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-xl animate-pulse">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-lg" />
                    <div>
                      <div className="w-32 h-4 bg-gray-200 rounded mb-2" />
                      <div className="w-24 h-3 bg-gray-200 rounded" />
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-8 h-8 bg-gray-200 rounded" />
                    <div className="w-8 h-8 bg-gray-200 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : uploadedFiles.length > 0 ? (
            <div className="space-y-3">
              {uploadedFiles.slice(0, 3).map((file) => (
                <div key={file.id} className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100 transition-colors duration-200">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-lg">
                      {getFileIcon(file.type)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{file.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs font-medium px-2 py-1 bg-blue-50 text-blue-700 border-blue-200">
                          {file.size ? (file.size / 1024).toFixed(1) : '0'} KB
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {file.uploadDate ? formatDate(file.uploadDate) : 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setPreviewFile(file);
                      }}
                      className="hover:bg-blue-50 text-blue-600 hover:text-blue-700 p-2 rounded-lg transition-all duration-200"
                      disabled={isUploading}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteFile(file.id)}
                      className="hover:bg-red-50 text-red-600 hover:text-red-700 p-2 rounded-lg transition-all duration-200"
                      disabled={isUploading}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}

              {uploadedFiles.length > 3 && (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full py-3 text-gray-700 border-gray-300 hover:bg-gray-50 rounded-lg font-medium transition-all duration-200"
                  onClick={() => {
                    setIsDocumentModalOpen(true);
                  }}
                  disabled={isLoadingDocuments || isUploading}
                >
                  +{uploadedFiles.length - 3} belge daha görüntüle
                </Button>
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4">
                <FileText className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Henüz belge yüklenmemiş</h3>
              <p className="text-gray-500 mb-4">İhtiyaç sahibi ile ilgili belgeleri yükleyin</p>
              <Button
                variant="outline"
                size="sm"
                className="px-6 py-3 text-blue-700 border-blue-300 hover:bg-blue-50 rounded-lg font-medium transition-all duration-200"
                onClick={() => {
                  setIsDocumentModalOpen(true);
                }}
                disabled={isLoadingDocuments || isUploading}
              >
                <Upload className="w-4 h-4 mr-2" />
                İlk belgeyi yükle
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Document Upload Modal */}
      <Dialog open={isDocumentModalOpen} onOpenChange={setIsDocumentModalOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Belge Yönetimi</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Upload Area */}
            <div className="border-2 border-dashed border-blue-300 rounded-xl p-8 text-center bg-gradient-to-br from-blue-50 to-indigo-50">
              <div className="flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mx-auto mb-6">
                <Upload className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Belge Yükle</h3>
              <p className="text-lg text-gray-600 mb-2">Dosyaları buraya sürükleyin</p>
              <p className="text-sm text-gray-500 mb-6">veya bilgisayarınızdan seçin</p>

              <div className="flex justify-center gap-3">
                <label htmlFor="file-upload">
                  <Button asChild className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium shadow-sm hover:shadow-md transition-all duration-200" disabled={isUploading}>
                    <span>
                      <FileText className="w-4 h-4 mr-2" />
                      Dosya Seç
                    </span>
                  </Button>
                </label>
                <input
                  id="file-upload"
                  type="file"
                  multiple
                  className="hidden"
                  onChange={handleFileUpload}
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.xlsx,.xls"
                  disabled={isUploading}
                />

                <Button variant="outline" className="px-6 py-3 text-gray-700 border-gray-300 hover:bg-gray-50 rounded-lg font-medium transition-all duration-200" disabled={isUploading}>
                  <Camera className="w-4 h-4 mr-2" />
                  Fotoğraf Çek
                </Button>
              </div>

              {isUploading && (
                <div className="mt-4">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <p className="text-sm text-gray-600 mt-1">Yükleniyor... {uploadProgress}%</p>
                </div>
              )}
            </div>

            {/* Search and Filter */}
            <div className="flex gap-2">
              <div className="flex-1">
                <Input
                  placeholder="Belge ara..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                  }}
                  className="w-full"
                />
              </div>
              <select
                value={selectedFileType}
                onChange={(e) => {
                  setSelectedFileType(e.target.value);
                }}
                className="px-3 py-2 border rounded-md"
              >
                <option value="all">Tüm Dosyalar</option>
                <option value="image">Resimler</option>
                <option value="pdf">PDF</option>
                <option value="document">Dokümanlar</option>
                <option value="spreadsheet">Excel</option>
              </select>
            </div>

            {/* File List */}
            <div className="max-h-60 overflow-y-auto">
              <div className="grid grid-cols-1 gap-2">
                {filteredFiles.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center justify-between p-3 border rounded hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-3">
                      {getFileIcon(file.type)}
                      <div>
                        <p className="text-sm font-medium">{file.name}</p>
                        <p className="text-xs text-gray-500">
                          {file.size ? (file.size / 1024).toFixed(1) : '0'} KB •{' '}
                          {file.uploadDate ? formatDate(file.uploadDate) : 'N/A'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setPreviewFile(file);
                        }}
                        disabled={isUploading}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => file.bucket && file.path && handleDownload(file.bucket, file.path)}
                        disabled={isUploading || !file.bucket || !file.path}
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDeleteFile(file.id)} disabled={isUploading}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsDocumentModalOpen(false);
              }}
            >
              Kapat
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* File Preview Modal */}
      {previewFile && (
        <Dialog
          open={Boolean(previewFile)}
          onOpenChange={() => {
            setPreviewFile(null);
          }}
        >
          <DialogContent className="max-w-4xl max-h-[80vh]">
            <DialogHeader>
              <DialogTitle>{previewFile.name}</DialogTitle>
            </DialogHeader>

            <div className="flex-1 overflow-auto">
              {previewFile.type.startsWith('image/') ? (
                <img src={previewFile.url} alt={previewFile.name} className="max-w-full h-auto" />
              ) : (
                <div className="text-center py-8">
                  <FileText className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                  <p>Bu dosya türü önizlenemez</p>
                  <Button
                    className="mt-2"
                    onClick={() => previewFile.bucket && previewFile.path && handleDownload(previewFile.bucket, previewFile.path)}
                    disabled={!previewFile.bucket || !previewFile.path}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    İndir
                  </Button>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
