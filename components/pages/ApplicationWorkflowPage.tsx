/**
 * @fileoverview ApplicationWorkflowPage Module - Application module
 *
 * @author Dernek Yönetim Sistemi Team
 * @version 1.0.0
 */

import {
  AlertCircle,
  Building2,
  Calendar,
  Eye,
  Mail,
  MapPin,
  Phone,
  Plus,
  Search,
  Star,
  Users,
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

interface Partner {
  id: number;
  name: string;
  type: 'bagimsiz' | 'kamu' | 'ozel' | 'sivil' | 'uluslararasi';
  category: 'bagisci' | 'tedarikci' | 'sponsor' | 'isbirligi' | 'dernek';
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  status: 'aktif' | 'pasif' | 'askida';
  rating: number;
  totalContribution: number;
  lastContact: string;
  establishedDate?: string;
  website?: string;
  taxNumber?: string;
  description?: string;
  tags: string[];
}

const partners: Partner[] = [];

/**
 * PartnerListPage function
 *
 * @param {Object} params - Function parameters
 * @returns {void} Nothing
 */
export default function PartnerListPage() {
  const [filteredPartners, setFilteredPartners] = useState<Partner[]>(partners);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  // Filtering logic
  useEffect(() => {
    let filtered = partners;

    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (partner) =>
          partner.name.toLowerCase().includes(searchLower) ||
          partner.contactPerson.toLowerCase().includes(searchLower) ||
          partner.phone.includes(searchTerm) ||
          partner.email.toLowerCase().includes(searchLower) ||
          partner.tags.some((tag) => tag.toLowerCase().includes(searchLower))
      );
    }

    // Type filter
    if (filterType !== 'all') {
      filtered = filtered.filter((partner) => partner.type === filterType);
    }

    // Category filter
    if (filterCategory !== 'all') {
      filtered = filtered.filter((partner) => partner.category === filterCategory);
    }

    // Status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter((partner) => partner.status === filterStatus);
    }

    // Tab filter
    if (activeTab === 'top') {
      filtered = filtered.filter((partner) => partner.rating >= 4);
    } else if (activeTab === 'active') {
      filtered = filtered.filter((partner) => partner.status === 'aktif');
    } else if (activeTab === 'donors') {
      filtered = filtered.filter((partner) => partner.category === 'bagisci');
    }

    setFilteredPartners(filtered);
  }, [searchTerm, filterType, filterCategory, filterStatus, activeTab]);

  const getStatusBadge = (status: Partner['status']) => {
    let label: string;
    let className: string;

    switch (status) {
      case 'aktif':
        label = 'Aktif';
        className = 'bg-green-50 text-green-700 border-green-200';
        break;
      case 'pasif':
        label = 'Pasif';
        className = 'bg-gray-50 text-gray-700 border-gray-200';
        break;
      case 'askida':
        label = 'Askıda';
        className = 'bg-yellow-50 text-yellow-700 border-yellow-200';
        break;
      default:
        label = 'Bilinmiyor';
        className = 'bg-gray-50 text-gray-700 border-gray-200';
    }

    return (
      <Badge variant="outline" className={`${className} px-2 py-1 text-xs`}>
        {label}
      </Badge>
    );
  };

  const getCategoryBadge = (category: Partner['category']) => {
    let label: string;
    let className: string;

    switch (category) {
      case 'bagisci':
        label = 'Bağışçı';
        className = 'bg-blue-50 text-blue-700';
        break;
      case 'tedarikci':
        label = 'Tedarikçi';
        className = 'bg-purple-50 text-purple-700';
        break;
      case 'sponsor':
        label = 'Sponsor';
        className = 'bg-orange-50 text-orange-700';
        break;
      case 'isbirligi':
        label = 'İşbirliği';
        className = 'bg-green-50 text-green-700';
        break;
      case 'dernek':
        label = 'Dernek';
        className = 'bg-indigo-50 text-indigo-700';
        break;
      default:
        label = 'Bilinmiyor';
        className = 'bg-gray-50 text-gray-700';
    }

    return <Badge className={`${className} border px-2 py-1 text-xs`}>{label}</Badge>;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleViewDetails = useCallback((partner: Partner) => {
    setSelectedPartner(partner);
    setIsDetailOpen(true);
  }, []);

  const clearFilters = useCallback(() => {
    setSearchTerm('');
    setFilterType('all');
    setFilterCategory('all');
    setFilterStatus('all');
    setActiveTab('all');
  }, []);

  return (
    <div className="flex-1 space-y-4 p-4 sm:space-y-6 sm:p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-medium">Partner Yönetimi</h1>
          <p className="text-muted-foreground mt-1">
            Tüm partner kuruluşlar ve işbirliği ilişkileri
          </p>
        </div>
        <Button className="w-full gap-2 sm:w-auto">
          <Plus className="h-4 w-4" />
          Yeni Partner
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Toplam</p>
                <p className="text-2xl font-medium">{partners.length}</p>
              </div>
              <Building2 className="text-muted-foreground h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Aktif</p>
                <p className="text-2xl font-medium text-green-600">
                  {partners.filter((p) => p.status === 'aktif').length}
                </p>
              </div>
              <Users className="h-5 w-5 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Bağışçı</p>
                <p className="text-2xl font-medium text-blue-600">
                  {partners.filter((p) => p.category === 'bagisci').length}
                </p>
              </div>
              <Star className="h-5 w-5 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Top Rated</p>
                <p className="text-2xl font-medium text-orange-600">
                  {partners.filter((p) => p.rating >= 4).length}
                </p>
              </div>
              <AlertCircle className="h-5 w-5 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform" />
          <Input
            placeholder="Partner ara..."
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
              <SelectValue placeholder="Tür" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tüm Türler</SelectItem>
              <SelectItem value="kamu">Kamu</SelectItem>
              <SelectItem value="ozel">Özel</SelectItem>
              <SelectItem value="sivil">Sivil Toplum</SelectItem>
              <SelectItem value="bagimsiz">Bağımsız</SelectItem>
              <SelectItem value="uluslararasi">Uluslararası</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-[130px] shrink-0">
              <SelectValue placeholder="Kategori" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tüm Kategoriler</SelectItem>
              <SelectItem value="bagisci">Bağışçı</SelectItem>
              <SelectItem value="tedarikci">Tedarikçi</SelectItem>
              <SelectItem value="sponsor">Sponsor</SelectItem>
              <SelectItem value="isbirligi">İşbirliği</SelectItem>
              <SelectItem value="dernek">Dernek</SelectItem>
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
              <SelectItem value="askida">Askıda</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">Tümü</TabsTrigger>
          <TabsTrigger value="active">Aktif</TabsTrigger>
          <TabsTrigger value="donors">Bağışçılar</TabsTrigger>
          <TabsTrigger value="top">En İyi</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-4">
          {filteredPartners.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Building2 className="text-muted-foreground mb-4 h-12 w-12" />
                <h3 className="mb-2 text-lg font-medium">Partner bulunamadı</h3>
                <p className="text-muted-foreground mb-4 text-center">
                  Arama kriterlerinize uygun partner bulunmuyor.
                </p>
                <Button onClick={clearFilters}>Filtreleri Temizle</Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {filteredPartners.map((partner) => (
                <Card key={partner.id} className="transition-shadow hover:shadow-md">
                  <CardHeader className="pb-3">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0 flex-1">
                        <CardTitle className="text-lg font-medium">{partner.name}</CardTitle>
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          {getStatusBadge(partner.status)}
                          {getCategoryBadge(partner.category)}
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3 fill-current text-yellow-500" />
                            <span className="text-muted-foreground text-xs">{partner.rating}</span>
                          </div>
                        </div>
                      </div>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => {
                              handleViewDetails(partner);
                            }}
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            Detayları Görüntüle
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>

                  <CardContent className="pt-0">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="text-muted-foreground h-4 w-4" />
                        <span className="truncate">{partner.phone}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="text-muted-foreground h-4 w-4" />
                        <span className="truncate">{partner.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="text-muted-foreground h-4 w-4" />
                        <span className="truncate">{partner.address}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="text-muted-foreground h-4 w-4" />
                        <span className="truncate">
                          Son İletişim: {new Date(partner.lastContact).toLocaleDateString('tr-TR')}
                        </span>
                      </div>
                    </div>

                    {partner.totalContribution > 0 && (
                      <div className="mt-4 rounded-lg bg-green-50 p-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-green-700">Toplam Katkı</span>
                          <span className="font-medium text-green-800">
                            {formatCurrency(partner.totalContribution)}
                          </span>
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

      {/* Partner Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              {selectedPartner?.name}
            </DialogTitle>
          </DialogHeader>

          {selectedPartner && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-3">
                  <div>
                    <label className="text-muted-foreground text-sm font-medium">
                      İletişim Kişisi
                    </label>
                    <p>{selectedPartner.contactPerson}</p>
                  </div>
                  <div>
                    <label className="text-muted-foreground text-sm font-medium">Telefon</label>
                    <p>{selectedPartner.phone}</p>
                  </div>
                  <div>
                    <label className="text-muted-foreground text-sm font-medium">E-posta</label>
                    <p>{selectedPartner.email}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-muted-foreground text-sm font-medium">Adres</label>
                    <p>{selectedPartner.address}</p>
                  </div>
                  {selectedPartner.website && (
                    <div>
                      <label className="text-muted-foreground text-sm font-medium">Website</label>
                      <p>{selectedPartner.website}</p>
                    </div>
                  )}
                  {selectedPartner.taxNumber && (
                    <div>
                      <label className="text-muted-foreground text-sm font-medium">Vergi No</label>
                      <p>{selectedPartner.taxNumber}</p>
                    </div>
                  )}
                </div>
              </div>

              {selectedPartner.description && (
                <div>
                  <label className="text-muted-foreground text-sm font-medium">Açıklama</label>
                  <p className="mt-1">{selectedPartner.description}</p>
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                {selectedPartner.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
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
