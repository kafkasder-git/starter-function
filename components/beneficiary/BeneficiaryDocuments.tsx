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
import { useState } from 'react';
import { toast } from 'sonner';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Input } from '../ui/input';

interface BeneficiaryDocumentsProps {
  beneficiaryId: string;
  documents?: Array<{
    id: string;
    name: string;
    type: string;
    url: string;
    uploadedAt: Date;
  }>;
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
  documents = [],
  onDocumentUpload,
  onDocumentDelete,
}: BeneficiaryDocumentsProps) {
  const [isDocumentModalOpen, setIsDocumentModalOpen] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<any[]>(documents);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFileType, setSelectedFileType] = useState('all');
  const [previewFile, setPreviewFile] = useState<any>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Simulate upload progress
      for (let i = 0; i <= 100; i += 10) {
        setUploadProgress(i);
        await new Promise((resolve) => setTimeout(resolve, 100));
      }

      // Create file objects
      const newFiles = files.map((file, index) => ({
        id: Date.now() + index,
        name: file.name,
        size: file.size,
        type: file.type,
        uploadDate: new Date(),
        url: URL.createObjectURL(file),
      }));

      setUploadedFiles((prev) => [...prev, ...newFiles]);
      onDocumentUpload?.(files);

      toast.success(`${files.length} dosya başarıyla yüklendi!`);
    } catch {
      toast.error('Dosya yükleme hatası!');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDeleteFile = async (fileId: string) => {
    try {
      setUploadedFiles((prev) => prev.filter((file) => file.id !== fileId));
      onDocumentDelete?.(fileId);
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
            >
              <Upload className="w-4 h-4 mr-2" />
              Belge Yükle
            </Button>
          </CardTitle>
        </CardHeader>

        <CardContent>
          {uploadedFiles.length > 0 ? (
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
                          {(file.size / 1024).toFixed(1)} KB
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {new Date(file.uploadDate).toLocaleDateString('tr-TR')}
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
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleDeleteFile(file.id)}
                      className="hover:bg-red-50 text-red-600 hover:text-red-700 p-2 rounded-lg transition-all duration-200"
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
                  <Button asChild className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium shadow-sm hover:shadow-md transition-all duration-200">
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
                />

                <Button variant="outline" className="px-6 py-3 text-gray-700 border-gray-300 hover:bg-gray-50 rounded-lg font-medium transition-all duration-200">
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
                          {(file.size / 1024).toFixed(1)} KB •{' '}
                          {new Date(file.uploadDate).toLocaleDateString('tr-TR')}
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
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Download className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDeleteFile(file.id)}>
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
                  <Button className="mt-2">
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
