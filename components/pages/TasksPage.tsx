/**
 * @fileoverview TasksPage Module - Application module
 * 
 * @author Dernek Yönetim Sistemi Team
 * @version 1.0.0
 */

import {
  CheckCircle,
  DollarSign,
  Eye,
  Mail,
  MapPin,
  Phone,
  Plus,
  Search,
  Star,
  Truck,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';

interface Supplier {
  id: number;
  name: string;
  category:
    | 'gida'
    | 'giyim'
    | 'yakit'
    | 'kirtasiye'
    | 'temizlik'
    | 'teknoloji'
    | 'medikal'
    | 'diğer';
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  status: 'aktif' | 'pasif' | 'değerlendirme';
  rating: number;
  totalOrders: number;
  totalAmount: number;
  lastOrderDate: string;
  deliveryRating: number;
  qualityRating: number;
  priceRating: number;
  paymentTerms: string;
  deliveryTime: string;
  minimumOrder?: number;
  taxNumber?: string;
  website?: string;
  description?: string;
  products: string[];
  tags: string[];
}

// Mock data kaldırıldı - gerçek veriler API'den gelecek

/**
 * PartnerSuppliersPage function
 * 
 * @param {Object} params - Function parameters
 * @returns {void} Nothing
 */
export default function PartnerSuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [filteredSuppliers, setFilteredSuppliers] = useState<Supplier[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  // Filtering logic
  useEffect(() => {
    let filtered = suppliers;

    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (supplier) =>
          supplier.name.toLowerCase().includes(searchLower) ||
          supplier.contactPerson.toLowerCase().includes(searchLower) ||
          supplier.phone.includes(searchTerm) ||
          supplier.email.toLowerCase().includes(searchLower) ||
          supplier.products.some((product) => product.toLowerCase().includes(searchLower)) ||
          supplier.tags.some((tag) => tag.toLowerCase().includes(searchLower)),
      );
    }

    // Category filter
    if (filterCategory !== 'all') {
      filtered = filtered.filter((supplier) => supplier.category === filterCategory);
    }

    // Status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter((supplier) => supplier.status === filterStatus);
    }

    // Tab filter
    if (activeTab === 'top') {
      filtered = filtered.filter((supplier) => supplier.rating >= 4.5);
    } else if (activeTab === 'active') {
      filtered = filtered.filter((supplier) => supplier.status === 'aktif');
    } else if (activeTab === 'frequent') {
      filtered = filtered.filter((supplier) => supplier.totalOrders >= 20);
    }

    setFilteredSuppliers(filtered);
  }, [suppliers, searchTerm, filterCategory, filterStatus, activeTab]);

  const getStatusBadge = (status: Supplier['status']) => {
    const config = {
      aktif: { label: 'Aktif', className: 'bg-green-50 text-green-700 border-green-200' },
      pasif: { label: 'Pasif', className: 'bg-gray-50 text-gray-700 border-gray-200' },
      değerlendirme: {
        label: 'Değerlendirme',
        className: 'bg-yellow-50 text-yellow-700 border-yellow-200',
      },
    };

    const { label, className } = config[status];
    return (
      <Badge variant="outline" className={`${className} text-xs px-2 py-1`}>
        {label}
      </Badge>
    );
  };

  const getCategoryBadge = (category: Supplier['category']) => {
    const config = {
      gida: { label: 'Gıda', className: 'bg-green-50 text-green-700' },
      giyim: { label: 'Giyim', className: 'bg-blue-50 text-blue-700' },
      yakit: { label: 'Yakıt', className: 'bg-red-50 text-red-700' },
      kirtasiye: { label: 'Kırtasiye', className: 'bg-purple-50 text-purple-700' },
      temizlik: { label: 'Temizlik', className: 'bg-cyan-50 text-cyan-700' },
      teknoloji: { label: 'Teknoloji', className: 'bg-indigo-50 text-indigo-700' },
      medikal: { label: 'Medikal', className: 'bg-pink-50 text-pink-700' },
      diğer: { label: 'Diğer', className: 'bg-gray-50 text-gray-700' },
    };

    const { label, className } = config[category];
    return <Badge className={`${className} text-xs px-2 py-1 border-0`}>{label}</Badge>;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return 'text-green-600';
    if (rating >= 4.0) return 'text-blue-600';
    if (rating >= 3.5) return 'text-orange-600';
    return 'text-red-600';
  };

  const handleViewDetails = useCallback((supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setIsDetailOpen(true);
  }, []);

  const clearFilters = useCallback(() => {
    setSearchTerm('');
    setFilterCategory('all');
    setFilterStatus('all');
    setActiveTab('all');
  }, []);

  const totalAmount = suppliers.reduce((sum, supplier) => sum + supplier.totalAmount, 0);
  const activeSuppliers = suppliers.filter((s) => s.status === 'aktif').length;
  const topSuppliers = suppliers.filter((s) => s.rating >= 4.5).length;

  return (
    <div className="flex-1 space-y-4 p-4 sm:space-y-6 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-medium">Tedarikçiler</h1>
          <p className="text-muted-foreground mt-1">Tedarikçi yönetimi ve satın alma ilişkileri</p>
        </div>
        <Button className="gap-2 w-full sm:w-auto">
          <Plus className="w-4 h-4" />
          Yeni Tedarikçi
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Toplam Harcama</p>
                <p className="text-xl font-medium text-green-600">{formatCurrency(totalAmount)}</p>
              </div>
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Aktif Tedarikçi</p>
                <p className="text-2xl font-medium text-blue-600">{activeSuppliers}</p>
              </div>
              <CheckCircle className="w-5 h-5 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Toplam Tedarikçi</p>
                <p className="text-2xl font-medium">{suppliers.length}</p>
              </div>
              <Truck className="w-5 h-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">En İyi</p>
                <p className="text-2xl font-medium text-orange-600">{topSuppliers}</p>
              </div>
              <Star className="w-5 h-5 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Tedarikçi ara..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
            }}
            className="pl-10"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto">
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-[130px] shrink-0">
              <SelectValue placeholder="Kategori" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tüm Kategoriler</SelectItem>
              <SelectItem value="gida">Gıda</SelectItem>
              <SelectItem value="giyim">Giyim</SelectItem>
              <SelectItem value="yakit">Yakıt</SelectItem>
              <SelectItem value="kirtasiye">Kırtasiye</SelectItem>
              <SelectItem value="temizlik">Temizlik</SelectItem>
              <SelectItem value="teknoloji">Teknoloji</SelectItem>
              <SelectItem value="medikal">Medikal</SelectItem>
              <SelectItem value="diğer">Diğer</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[120px] shrink-0">
              <SelectValue placeholder="Durum" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tüm Durumlar</SelectItem>
              <SelectItem value="aktif">Aktif</SelectItem>
              <SelectItem value="pasif">Pasif</SelectItem>
              <SelectItem value="değerlendirme">Değerlendirme</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">Tümü</TabsTrigger>
          <TabsTrigger value="active">Aktif</TabsTrigger>
          <TabsTrigger value="frequent">Sık Kullanılan</TabsTrigger>
          <TabsTrigger value="top">En İyi</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-4">
          {filteredSuppliers.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Truck className="w-12 h-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Tedarikçi bulunamadı</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Arama kriterlerinize uygun tedarikçi bulunmuyor.
                </p>
                <Button onClick={clearFilters}>Filtreleri Temizle</Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {filteredSuppliers.map((supplier) => (
                <Card key={supplier.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg font-medium">{supplier.name}</CardTitle>
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                          {getStatusBadge(supplier.status)}
                          {getCategoryBadge(supplier.category)}
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 text-yellow-500 fill-current" />
                            <span
                              className={`text-xs font-medium ${getRatingColor(supplier.rating)}`}
                            >
                              {supplier.rating}
                            </span>
                          </div>
                        </div>
                      </div>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => {
                              handleViewDetails(supplier);
                            }}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            Detayları Görüntüle
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>

                  <CardContent className="pt-0">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="w-4 h-4 text-muted-foreground" />
                        <span className="truncate">{supplier.phone}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="w-4 h-4 text-muted-foreground" />
                        <span className="truncate">{supplier.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <span className="truncate">{supplier.address}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                      <div className="text-center p-3 bg-green-50 rounded-lg">
                        <div className="text-sm font-medium text-green-800">
                          {formatCurrency(supplier.totalAmount)}
                        </div>
                        <div className="text-xs text-green-600">Toplam Tutar</div>
                      </div>

                      <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <div className="text-sm font-medium text-blue-800">
                          {supplier.totalOrders}
                        </div>
                        <div className="text-xs text-blue-600">Sipariş Sayısı</div>
                      </div>

                      <div className="text-center p-3 bg-purple-50 rounded-lg">
                        <div className="text-sm font-medium text-purple-800">
                          {supplier.deliveryTime}
                        </div>
                        <div className="text-xs text-purple-600">Teslimat Süresi</div>
                      </div>

                      <div className="text-center p-3 bg-orange-50 rounded-lg">
                        <div className="text-sm font-medium text-orange-800">
                          {new Date(supplier.lastOrderDate).toLocaleDateString('tr-TR')}
                        </div>
                        <div className="text-xs text-orange-600">Son Sipariş</div>
                      </div>
                    </div>

                    {supplier.products.length > 0 && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-2">Ürünler:</p>
                        <div className="flex flex-wrap gap-1">
                          {supplier.products.slice(0, 5).map((product, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {product}
                            </Badge>
                          ))}
                          {supplier.products.length > 5 && (
                            <Badge variant="secondary" className="text-xs">
                              +{supplier.products.length - 5} daha
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Supplier Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Truck className="w-5 h-5" />
              {selectedSupplier?.name}
            </DialogTitle>
          </DialogHeader>

          {selectedSupplier && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      İletişim Kişisi
                    </label>
                    <p>{selectedSupplier.contactPerson}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Telefon</label>
                    <p>{selectedSupplier.phone}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">E-posta</label>
                    <p>{selectedSupplier.email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Ödeme Koşulları
                    </label>
                    <p>{selectedSupplier.paymentTerms}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Adres</label>
                    <p>{selectedSupplier.address}</p>
                  </div>
                  {selectedSupplier.website && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Website</label>
                      <p>{selectedSupplier.website}</p>
                    </div>
                  )}
                  {selectedSupplier.taxNumber && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Vergi No</label>
                      <p>{selectedSupplier.taxNumber}</p>
                    </div>
                  )}
                  {selectedSupplier.minimumOrder && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Minimum Sipariş
                      </label>
                      <p>{formatCurrency(selectedSupplier.minimumOrder)}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-lg font-bold text-green-800">
                    {selectedSupplier.qualityRating}
                  </div>
                  <div className="text-sm text-green-600">Kalite</div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-lg font-bold text-blue-800">
                    {selectedSupplier.deliveryRating}
                  </div>
                  <div className="text-sm text-blue-600">Teslimat</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-lg font-bold text-purple-800">
                    {selectedSupplier.priceRating}
                  </div>
                  <div className="text-sm text-purple-600">Fiyat</div>
                </div>
              </div>

              {selectedSupplier.description && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Açıklama</label>
                  <p className="mt-1">{selectedSupplier.description}</p>
                </div>
              )}

              <div>
                <label className="text-sm font-medium text-muted-foreground">Ürünler</label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedSupplier.products.map((product, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {product}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {selectedSupplier.tags.map((tag, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
