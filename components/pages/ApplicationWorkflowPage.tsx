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

// Mock data with realistic partner information
const mockPartners: Partner[] = [
  {
    id: 1,
    name: 'Ankara Büyükşehir Belediyesi',
    type: 'kamu',
    category: 'isbirligi',
    contactPerson: 'Ahmet Özkan',
    phone: '0312 555 0101',
    email: 'sosyal.yardim@ankara.bel.tr',
    address: 'Çankaya, Ankara',
    status: 'aktif',
    rating: 5,
    totalContribution: 85000,
    lastContact: '2024-01-15',
    establishedDate: '1994-03-30',
    website: 'www.ankara.bel.tr',
    description: 'Sosyal yardım konularında işbirliği protokolü mevcut',
    tags: ['belediye', 'sosyal-yardim', 'protokol'],
  },
  {
    id: 2,
    name: 'Hayırsever Ailesi Vakfı',
    type: 'bagimsiz',
    category: 'bagisci',
    contactPerson: 'Fatma Demir',
    phone: '0532 555 0202',
    email: 'bagis@hayirsever.org.tr',
    address: 'Çankaya, Ankara',
    status: 'aktif',
    rating: 5,
    totalContribution: 150000,
    lastContact: '2024-01-20',
    establishedDate: '2010-06-15',
    website: 'www.hayirsever.org.tr',
    taxNumber: '1234567890',
    description: 'Düzenli nakdi ve ayni bağış desteği sağlayan vakıf',
    tags: ['vakif', 'bagis', 'nakit', 'ayni'],
  },
  {
    id: 3,
    name: 'ABC Gıda San. Tic. Ltd. Şti.',
    type: 'ozel',
    category: 'tedarikci',
    contactPerson: 'Mehmet Yılmaz',
    phone: '0312 555 0303',
    email: 'satis@abcgida.com',
    address: 'Ostim, Ankara',
    status: 'aktif',
    rating: 4,
    totalContribution: 45000,
    lastContact: '2024-01-18',
    establishedDate: '2008-09-12',
    website: 'www.abcgida.com',
    taxNumber: '9876543210',
    description: 'Gıda ürünleri tedarikçisi, uygun fiyatla kaliteli ürün',
    tags: ['tedarikci', 'gida', 'toptan'],
  },
  {
    id: 4,
    name: 'Teknoloji AŞ',
    type: 'ozel',
    category: 'sponsor',
    contactPerson: 'Zeynep Kaya',
    phone: '0216 555 0404',
    email: 'kurumsal@teknoloji.com',
    address: 'Ataşehir, İstanbul',
    status: 'aktif',
    rating: 4,
    totalContribution: 75000,
    lastContact: '2024-01-12',
    establishedDate: '2015-11-20',
    website: 'www.teknoloji.com',
    taxNumber: '5555666677',
    description: 'Dijital dönüşüm projelerinde sponsor desteği',
    tags: ['sponsor', 'teknoloji', 'dijital'],
  },
  {
    id: 5,
    name: 'Toplum Kalkınma Derneği',
    type: 'sivil',
    category: 'dernek',
    contactPerson: 'Hasan Çelik',
    phone: '0312 555 0505',
    email: 'info@toplumkalkinma.org',
    address: 'Kızılay, Ankara',
    status: 'aktif',
    rating: 4,
    totalContribution: 25000,
    lastContact: '2024-01-10',
    establishedDate: '2005-04-08',
    website: 'www.toplumkalkinma.org',
    description: 'Ortak sosyal projeler ve deneyim paylaşımı',
    tags: ['dernek', 'kalkinma', 'isbirligi'],
  },
];

export default function PartnerListPage() {
  const [partners, setPartners] = useState<Partner[]>(mockPartners);
  const [filteredPartners, setFilteredPartners] = useState<Partner[]>(mockPartners);
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
          partner.tags.some((tag) => tag.toLowerCase().includes(searchLower)),
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
  }, [partners, searchTerm, filterType, filterCategory, filterStatus, activeTab]);

  const getStatusBadge = (status: Partner['status']) => {
    const config = {
      aktif: { label: 'Aktif', className: 'bg-green-50 text-green-700 border-green-200' },
      pasif: { label: 'Pasif', className: 'bg-gray-50 text-gray-700 border-gray-200' },
      askida: { label: 'Askıda', className: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
    };

    const { label, className } = config[status];
    return (
      <Badge variant="outline" className={`${className} text-xs px-2 py-1`}>
        {label}
      </Badge>
    );
  };

  const getCategoryBadge = (category: Partner['category']) => {
    const config = {
      bagisci: { label: 'Bağışçı', className: 'bg-blue-50 text-blue-700' },
      tedarikci: { label: 'Tedarikçi', className: 'bg-purple-50 text-purple-700' },
      sponsor: { label: 'Sponsor', className: 'bg-orange-50 text-orange-700' },
      isbirligi: { label: 'İşbirliği', className: 'bg-green-50 text-green-700' },
      dernek: { label: 'Dernek', className: 'bg-indigo-50 text-indigo-700' },
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-medium">Partner Yönetimi</h1>
          <p className="text-muted-foreground mt-1">
            Tüm partner kuruluşlar ve işbirliği ilişkileri
          </p>
        </div>
        <Button className="gap-2 w-full sm:w-auto">
          <Plus className="w-4 h-4" />
          Yeni Partner
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Toplam</p>
                <p className="text-2xl font-medium">{partners.length}</p>
              </div>
              <Building2 className="w-5 h-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Aktif</p>
                <p className="text-2xl font-medium text-green-600">
                  {partners.filter((p) => p.status === 'aktif').length}
                </p>
              </div>
              <Users className="w-5 h-5 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Bağışçı</p>
                <p className="text-2xl font-medium text-blue-600">
                  {partners.filter((p) => p.category === 'bagisci').length}
                </p>
              </div>
              <Star className="w-5 h-5 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Top Rated</p>
                <p className="text-2xl font-medium text-orange-600">
                  {partners.filter((p) => p.rating >= 4).length}
                </p>
              </div>
              <AlertCircle className="w-5 h-5 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
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
                <Building2 className="w-12 h-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Partner bulunamadı</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Arama kriterlerinize uygun partner bulunmuyor.
                </p>
                <Button onClick={clearFilters}>Filtreleri Temizle</Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {filteredPartners.map((partner) => (
                <Card key={partner.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg font-medium">{partner.name}</CardTitle>
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                          {getStatusBadge(partner.status)}
                          {getCategoryBadge(partner.category)}
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 text-yellow-500 fill-current" />
                            <span className="text-xs text-muted-foreground">{partner.rating}</span>
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
                              handleViewDetails(partner);
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
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="w-4 h-4 text-muted-foreground" />
                        <span className="truncate">{partner.phone}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="w-4 h-4 text-muted-foreground" />
                        <span className="truncate">{partner.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <span className="truncate">{partner.address}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span className="truncate">
                          Son İletişim: {new Date(partner.lastContact).toLocaleDateString('tr-TR')}
                        </span>
                      </div>
                    </div>

                    {partner.totalContribution > 0 && (
                      <div className="mt-4 p-3 bg-green-50 rounded-lg">
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
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              {selectedPartner?.name}
            </DialogTitle>
          </DialogHeader>

          {selectedPartner && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      İletişim Kişisi
                    </label>
                    <p>{selectedPartner.contactPerson}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Telefon</label>
                    <p>{selectedPartner.phone}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">E-posta</label>
                    <p>{selectedPartner.email}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Adres</label>
                    <p>{selectedPartner.address}</p>
                  </div>
                  {selectedPartner.website && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Website</label>
                      <p>{selectedPartner.website}</p>
                    </div>
                  )}
                  {selectedPartner.taxNumber && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Vergi No</label>
                      <p>{selectedPartner.taxNumber}</p>
                    </div>
                  )}
                </div>
              </div>

              {selectedPartner.description && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Açıklama</label>
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
