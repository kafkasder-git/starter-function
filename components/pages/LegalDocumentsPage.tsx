/**
 * @fileoverview LegalDocumentsPage Module - Application module
 *
 * @author Dernek Yönetim Sistemi Team
 * @version 1.0.0
 */

import {
  Calendar,
  Download,
  Eye,
  FileText,
  Filter,
  Plus,
  Search,
  Upload,
  User,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Textarea } from '../ui/textarea';

interface LegalDocument {
  id: number;
  name: string;
  type: 'sozlesme' | 'dilekce' | 'karar' | 'tutanak' | 'rapor' | 'diger';
  category: 'medeni' | 'ceza' | 'is' | 'idare' | 'ticaret' | 'aile';
  relatedCase?: string;
  uploadDate: string;
  uploadedBy: string;
  size: string;
  status: 'onaylandi' | 'bekliyor' | 'reddedildi';
  description?: string;
}

// Mock data kaldırıldı - gerçek veriler API'den gelecek

/**
 * LegalDocumentsPage function
 *
 * @param {Object} params - Function parameters
 * @returns {void} Nothing
 */
export function LegalDocumentsPage() {
  const [documents, setDocuments] = useState<LegalDocument[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [activeTab, setActiveTab] = useState('all');
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: 'sozlesme' as LegalDocument['type'],
    category: 'medeni' as LegalDocument['category'],
    relatedCase: '',
    description: '',
  });

  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch =
      searchTerm === '' ||
      doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.uploadedBy.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.relatedCase?.includes(searchTerm);

    const matchesType = filterType === 'all' || doc.type === filterType;
    const matchesCategory = filterCategory === 'all' || doc.category === filterCategory;

    const matchesTab =
      activeTab === 'all' ||
      (activeTab === 'approved' && doc.status === 'onaylandi') ||
      (activeTab === 'pending' && doc.status === 'bekliyor');

    return matchesSearch && matchesType && matchesCategory && matchesTab;
  });

  const getStatusBadge = (status: LegalDocument['status']) => {
    const config = {
      onaylandi: { label: 'Onaylandı', className: 'bg-green-50 text-green-700 border-green-200' },
      bekliyor: { label: 'Bekliyor', className: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
      reddedildi: { label: 'Reddedildi', className: 'bg-red-50 text-red-700 border-red-200' },
    };

    const { label, className } = config[status];
    return (
      <Badge variant="outline" className={`${className} text-xs px-2 py-1`}>
        {label}
      </Badge>
    );
  };

  const getTypeBadge = (type: LegalDocument['type']) => {
    const config = {
      sozlesme: { label: 'Sözleşme', className: 'bg-blue-50 text-blue-700' },
      dilekce: { label: 'Dilekçe', className: 'bg-purple-50 text-purple-700' },
      karar: { label: 'Karar', className: 'bg-green-50 text-green-700' },
      tutanak: { label: 'Tutanak', className: 'bg-orange-50 text-orange-700' },
      rapor: { label: 'Rapor', className: 'bg-indigo-50 text-indigo-700' },
      diger: { label: 'Diğer', className: 'bg-gray-50 text-gray-700' },
    };

    const { label, className } = config[type];
    return <Badge className={`${className} text-xs px-2 py-1 border-0`}>{label}</Badge>;
  };

  const approvedDocs = documents.filter((d) => d.status === 'onaylandi').length;
  const pendingDocs = documents.filter((d) => d.status === 'bekliyor').length;

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.type || !formData.category) {
      toast.error('Lütfen zorunlu alanları doldurun');
      return;
    }

    try {
      setIsSubmitting(true);

      // TODO: Integrate with actual API
      // const result = await legalDocumentsService.uploadDocument(formData);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast.success('Belge başarıyla yüklendi!');
      setShowUploadDialog(false);

      // Reset form
      setFormData({
        name: '',
        type: 'sozlesme',
        category: 'medeni',
        relatedCase: '',
        description: '',
      });
    } catch (error) {
      toast.error('Belge yüklenirken hata oluştu');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-1 space-y-4 p-4 sm:space-y-6 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-medium">Hukuki Belgeler</h1>
          <p className="text-muted-foreground mt-1">Hukuki belge yönetimi ve arşiv sistemi</p>
        </div>
        <Button className="gap-2 w-full sm:w-auto" onClick={() => setShowUploadDialog(true)}>
          <Upload className="w-4 h-4" />
          Belge Yükle
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Toplam Belge</p>
                <p className="text-2xl font-medium">{documents.length}</p>
              </div>
              <FileText className="w-5 h-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Onaylanan</p>
                <p className="text-2xl font-medium text-green-600">{approvedDocs}</p>
              </div>
              <Eye className="w-5 h-5 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Bekleyen</p>
                <p className="text-2xl font-medium text-yellow-600">{pendingDocs}</p>
              </div>
              <Filter className="w-5 h-5 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Bu Ay</p>
                <p className="text-2xl font-medium text-blue-600">3</p>
              </div>
              <Plus className="w-5 h-5 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Belge ara..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
            }}
            className="pl-10"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto">
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-[130px] shrink-0">
              <SelectValue placeholder="Belge Türü" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tüm Türler</SelectItem>
              <SelectItem value="sozlesme">Sözleşme</SelectItem>
              <SelectItem value="dilekce">Dilekçe</SelectItem>
              <SelectItem value="karar">Karar</SelectItem>
              <SelectItem value="tutanak">Tutanak</SelectItem>
              <SelectItem value="rapor">Rapor</SelectItem>
              <SelectItem value="diger">Diğer</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-[120px] shrink-0">
              <SelectValue placeholder="Kategori" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tüm Kategoriler</SelectItem>
              <SelectItem value="medeni">Medeni</SelectItem>
              <SelectItem value="ceza">Ceza</SelectItem>
              <SelectItem value="is">İş</SelectItem>
              <SelectItem value="idare">İdare</SelectItem>
              <SelectItem value="ticaret">Ticaret</SelectItem>
              <SelectItem value="aile">Aile</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all">Tümü</TabsTrigger>
          <TabsTrigger value="approved">Onaylanmış</TabsTrigger>
          <TabsTrigger value="pending">Bekleyen</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-4">
          <div className="grid gap-4">
            {filteredDocuments.map((document) => (
              <Card key={document.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg font-medium">{document.name}</CardTitle>
                      {document.relatedCase && (
                        <p className="text-muted-foreground mt-1">
                          Dava No: {document.relatedCase}
                        </p>
                      )}
                      <div className="flex flex-wrap items-center gap-2 mt-2">
                        {getStatusBadge(document.status)}
                        {getTypeBadge(document.type)}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="pt-0">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-3">
                    <div className="flex items-center gap-2 text-sm">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <span className="truncate">{document.uploadedBy}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span className="truncate">
                        {new Date(document.uploadDate).toLocaleDateString('tr-TR')}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <FileText className="w-4 h-4 text-muted-foreground" />
                      <span className="truncate">{document.size}</span>
                    </div>
                  </div>

                  {document.description && (
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-700">{document.description}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Upload Dialog */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5" />
              Belge Yükle
            </DialogTitle>
            <DialogDescription>
              Hukuki belge bilgilerini doldurun. Zorunlu alanları (*) doldurmanız gereklidir.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleUpload} className="space-y-4 py-4">
            {/* Document Name */}
            <div className="space-y-2">
              <Label htmlFor="name">
                Belge Adı <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Örn: İdare Mahkemesi Dilekçesi"
                required
              />
            </div>

            {/* Type and Category */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">
                  Belge Türü <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.type}
                  onValueChange={(value: LegalDocument['type']) =>
                    setFormData({ ...formData, type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Tür seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sozlesme">Sözleşme</SelectItem>
                    <SelectItem value="dilekce">Dilekçe</SelectItem>
                    <SelectItem value="karar">Karar</SelectItem>
                    <SelectItem value="tutanak">Tutanak</SelectItem>
                    <SelectItem value="rapor">Rapor</SelectItem>
                    <SelectItem value="diger">Diğer</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">
                  Kategori <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.category}
                  onValueChange={(value: LegalDocument['category']) =>
                    setFormData({ ...formData, category: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Kategori seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="medeni">Medeni</SelectItem>
                    <SelectItem value="ceza">Ceza</SelectItem>
                    <SelectItem value="is">İş</SelectItem>
                    <SelectItem value="idare">İdare</SelectItem>
                    <SelectItem value="ticaret">Ticaret</SelectItem>
                    <SelectItem value="aile">Aile</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Related Case */}
            <div className="space-y-2">
              <Label htmlFor="relatedCase">İlgili Dava Numarası</Label>
              <Input
                id="relatedCase"
                value={formData.relatedCase}
                onChange={(e) => setFormData({ ...formData, relatedCase: e.target.value })}
                placeholder="Örn: 2024/123"
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Açıklama</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Belge hakkında ek bilgiler"
                rows={3}
              />
            </div>

            {/* File Upload Input */}
            <div className="space-y-2">
              <Label htmlFor="file">Dosya Seç</Label>
              <Input id="file" type="file" accept=".pdf,.doc,.docx" className="cursor-pointer" />
              <p className="text-xs text-muted-foreground">
                Desteklenen formatlar: PDF, DOC, DOCX (Maks. 10MB)
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowUploadDialog(false)}
                disabled={isSubmitting}
              >
                İptal
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Yükleniyor...' : 'Belge Yükle'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Default export
export default LegalDocumentsPage;
