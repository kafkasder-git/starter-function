import {
  Award,
  DollarSign,
  Eye,
  Mail,
  MapPin,
  Phone,
  Plus,
  Search,
  Star,
  Target,
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
import { Progress } from '../ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';

interface SponsorOrganization {
  id: number;
  name: string;
  type: 'kurumsal' | 'bireysel' | 'vakif' | 'kamu' | 'uluslararasi';
  sponsorshipType: 'etkinlik' | 'proje' | 'sürekli' | 'kampanya' | 'altyapi';
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  status: 'aktif' | 'pasif' | 'müzakere';
  totalSponsorship: number;
  currentProjects: number;
  completedProjects: number;
  lastSponsorshipDate: string;
  contractStart?: string;
  contractEnd?: string;
  sponsorshipAreas: string[];
  rating: number;
  website?: string;
  taxNumber?: string;
  description?: string;
  logo?: string;
  tags: string[];
}

// Mock sponsor data
const mockSponsors: SponsorOrganization[] = [
  {
    id: 1,
    name: 'Teknoloji Holding A.Ş.',
    type: 'kurumsal',
    sponsorshipType: 'sürekli',
    contactPerson: 'Zeynep Kaya',
    phone: '0212 555 0101',
    email: 'kurumsal@teknolojiholding.com',
    address: 'Levent, İstanbul',
    status: 'aktif',
    totalSponsorship: 450000,
    currentProjects: 3,
    completedProjects: 12,
    lastSponsorshipDate: '2024-01-15',
    contractStart: '2024-01-01',
    contractEnd: '2024-12-31',
    sponsorshipAreas: ['teknoloji', 'eğitim', 'dijital-dönüşüm', 'gençlik'],
    rating: 5,
    website: 'www.teknolojiholding.com',
    taxNumber: '1234567890',
    description: 'Teknoloji ve dijital dönüşüm projelerinde ana sponsor',
    tags: ['teknoloji', 'dijital', 'sürekli', 'stratejik'],
  },
  {
    id: 2,
    name: 'Ankara Belediyesi',
    type: 'kamu',
    sponsorshipType: 'etkinlik',
    contactPerson: 'Mehmet Özkan',
    phone: '0312 555 0202',
    email: 'etkinlik@ankara.bel.tr',
    address: 'Çankaya, Ankara',
    status: 'aktif',
    totalSponsorship: 285000,
    currentProjects: 2,
    completedProjects: 8,
    lastSponsorshipDate: '2024-01-20',
    contractStart: '2024-01-01',
    contractEnd: '2024-06-30',
    sponsorshipAreas: ['kültür', 'sanat', 'spor', 'gençlik'],
    rating: 4,
    website: 'www.ankara.bel.tr',
    description: 'Kültürel etkinlik ve sosyal projeler sponsoru',
    tags: ['belediye', 'etkinlik', 'kültür', 'yerel'],
  },
  {
    id: 3,
    name: 'Hayırsever İş Adamı Vakfı',
    type: 'vakif',
    sponsorshipType: 'proje',
    contactPerson: 'Fatma Demir',
    phone: '0532 555 0303',
    email: 'proje@hayirsever.org.tr',
    address: 'Kızılay, Ankara',
    status: 'aktif',
    totalSponsorship: 380000,
    currentProjects: 4,
    completedProjects: 15,
    lastSponsorshipDate: '2024-01-18',
    contractStart: '2023-07-01',
    contractEnd: '2025-06-30',
    sponsorshipAreas: ['eğitim', 'sağlık', 'sosyal-yardım', 'çevre'],
    rating: 5,
    website: 'www.hayirsever.org.tr',
    taxNumber: '9876543210',
    description: 'Sosyal sorumluluk projelerinde uzun vadeli partner',
    tags: ['vakıf', 'sosyal', 'uzun-vadeli', 'güvenilir'],
  },
  {
    id: 4,
    name: 'Global Şirket Ltd.',
    type: 'kurumsal',
    sponsorshipType: 'kampanya',
    contactPerson: 'Ahmet Çelik',
    phone: '0216 555 0404',
    email: 'sponsor@globalshirket.com',
    address: 'Ataşehir, İstanbul',
    status: 'müzakere',
    totalSponsorship: 125000,
    currentProjects: 1,
    completedProjects: 3,
    lastSponsorshipDate: '2024-01-10',
    sponsorshipAreas: ['çevre', 'sürdürülebilirlik', 'inovasyon'],
    rating: 4,
    website: 'www.globalshirket.com',
    taxNumber: '5555666677',
    description: 'Çevre ve sürdürülebilirlik odaklı kampanya sponsoru',
    tags: ['kurumsal', 'çevre', 'yeni', 'potansiyel'],
  },
  {
    id: 5,
    name: 'European Foundation',
    type: 'uluslararasi',
    sponsorshipType: 'altyapi',
    contactPerson: 'Sarah Johnson',
    phone: '+90 312 555 0505',
    email: 'turkey@europeanfoundation.org',
    address: 'Çankaya, Ankara',
    status: 'aktif',
    totalSponsorship: 650000,
    currentProjects: 2,
    completedProjects: 6,
    lastSponsorshipDate: '2024-01-12',
    contractStart: '2023-01-01',
    contractEnd: '2025-12-31',
    sponsorshipAreas: ['altyapı', 'kapasite-geliştirme', 'teknoloji', 'eğitim'],
    rating: 5,
    website: 'www.europeanfoundation.org',
    description: 'Uluslararası altyapı ve kapasite geliştirme fonu',
    tags: ['uluslararası', 'altyapı', 'büyük-bütçe', 'uzun-vadeli'],
  },
];

export default function PartnerSponsorsPage() {
  const [sponsors] = useState<SponsorOrganization[]>(mockSponsors);
  const [filteredSponsors, setFilteredSponsors] = useState<SponsorOrganization[]>(mockSponsors);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterSponsorshipType, setFilterSponsorshipType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedSponsor, setSelectedSponsor] = useState<SponsorOrganization | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  // Filtering logic
  useEffect(() => {
    let filtered = sponsors;

    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (sponsor) =>
          sponsor.name.toLowerCase().includes(searchLower) ||
          sponsor.contactPerson.toLowerCase().includes(searchLower) ||
          sponsor.phone.includes(searchTerm) ||
          sponsor.email.toLowerCase().includes(searchLower) ||
          sponsor.sponsorshipAreas.some((area) => area.toLowerCase().includes(searchLower)) ||
          sponsor.tags.some((tag) => tag.toLowerCase().includes(searchLower)),
      );
    }

    // Type filter
    if (filterType !== 'all') {
      filtered = filtered.filter((sponsor) => sponsor.type === filterType);
    }

    // Sponsorship type filter
    if (filterSponsorshipType !== 'all') {
      filtered = filtered.filter((sponsor) => sponsor.sponsorshipType === filterSponsorshipType);
    }

    // Status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter((sponsor) => sponsor.status === filterStatus);
    }

    // Tab filter
    if (activeTab === 'major') {
      filtered = filtered.filter((sponsor) => sponsor.totalSponsorship >= 300000);
    } else if (activeTab === 'active') {
      filtered = filtered.filter((sponsor) => sponsor.status === 'aktif');
    } else if (activeTab === 'long-term') {
      filtered = filtered.filter(
        (sponsor) => sponsor.sponsorshipType === 'sürekli' || sponsor.sponsorshipType === 'altyapi',
      );
    }

    setFilteredSponsors(filtered);
  }, [sponsors, searchTerm, filterType, filterSponsorshipType, filterStatus, activeTab]);

  const getStatusBadge = (status: SponsorOrganization['status']) => {
    const config = {
      aktif: { label: 'Aktif', className: 'bg-green-50 text-green-700 border-green-200' },
      pasif: { label: 'Pasif', className: 'bg-gray-50 text-gray-700 border-gray-200' },
      müzakere: { label: 'Müzakere', className: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
    };

    const { label, className } = config[status];
    return (
      <Badge variant="outline" className={`${className} text-xs px-2 py-1`}>
        {label}
      </Badge>
    );
  };

  const getTypeBadge = (type: SponsorOrganization['type']) => {
    const config = {
      kurumsal: { label: 'Kurumsal', className: 'bg-blue-50 text-blue-700' },
      bireysel: { label: 'Bireysel', className: 'bg-green-50 text-green-700' },
      vakif: { label: 'Vakıf', className: 'bg-purple-50 text-purple-700' },
      kamu: { label: 'Kamu', className: 'bg-orange-50 text-orange-700' },
      uluslararasi: { label: 'Uluslararası', className: 'bg-indigo-50 text-indigo-700' },
    };

    const { label, className } = config[type];
    return <Badge className={`${className} text-xs px-2 py-1 border-0`}>{label}</Badge>;
  };

  const getSponsorshipTypeBadge = (type: SponsorOrganization['sponsorshipType']) => {
    const config = {
      etkinlik: { label: 'Etkinlik', className: 'bg-cyan-50 text-cyan-700' },
      proje: { label: 'Proje', className: 'bg-blue-50 text-blue-700' },
      sürekli: { label: 'Sürekli', className: 'bg-green-50 text-green-700' },
      kampanya: { label: 'Kampanya', className: 'bg-orange-50 text-orange-700' },
      altyapi: { label: 'Altyapı', className: 'bg-purple-50 text-purple-700' },
    };

    const { label, className } = config[type];
    return (
      <Badge variant="outline" className={`${className} text-xs px-2 py-1`}>
        {label}
      </Badge>
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleViewDetails = useCallback((sponsor: SponsorOrganization) => {
    setSelectedSponsor(sponsor);
    setIsDetailOpen(true);
  }, []);

  const clearFilters = useCallback(() => {
    setSearchTerm('');
    setFilterType('all');
    setFilterSponsorshipType('all');
    setFilterStatus('all');
    setActiveTab('all');
  }, []);

  const totalSponsorship = sponsors.reduce((sum, sponsor) => sum + sponsor.totalSponsorship, 0);
  const activeSponsors = sponsors.filter((s) => s.status === 'aktif').length;
  const majorSponsors = sponsors.filter((s) => s.totalSponsorship >= 300000).length;
  const totalProjects = sponsors.reduce((sum, sponsor) => sum + sponsor.currentProjects, 0);

  return (
    <div className="flex-1 space-y-4 p-4 sm:space-y-6 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-medium">Sponsor Kuruluşlar</h1>
          <p className="text-muted-foreground mt-1">
            Sponsorluk ilişkileri ve proje destekleri yönetimi
          </p>
        </div>
        <Button className="gap-2 w-full sm:w-auto">
          <Plus className="w-4 h-4" />
          Yeni Sponsor
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Toplam Sponsorluk</p>
                <p className="text-xl font-medium text-green-600">
                  {formatCurrency(totalSponsorship)}
                </p>
              </div>
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Aktif Sponsor</p>
                <p className="text-2xl font-medium text-blue-600">{activeSponsors}</p>
              </div>
              <Award className="w-5 h-5 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Büyük Sponsor</p>
                <p className="text-2xl font-medium text-purple-600">{majorSponsors}</p>
              </div>
              <Star className="w-5 h-5 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Aktif Proje</p>
                <p className="text-2xl font-medium text-orange-600">{totalProjects}</p>
              </div>
              <Target className="w-5 h-5 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Sponsor ara..."
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
              <SelectItem value="kurumsal">Kurumsal</SelectItem>
              <SelectItem value="bireysel">Bireysel</SelectItem>
              <SelectItem value="vakif">Vakıf</SelectItem>
              <SelectItem value="kamu">Kamu</SelectItem>
              <SelectItem value="uluslararasi">Uluslararası</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterSponsorshipType} onValueChange={setFilterSponsorshipType}>
            <SelectTrigger className="w-[130px] shrink-0">
              <SelectValue placeholder="Sponsorluk" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tüm Sponsorluklar</SelectItem>
              <SelectItem value="etkinlik">Etkinlik</SelectItem>
              <SelectItem value="proje">Proje</SelectItem>
              <SelectItem value="sürekli">Sürekli</SelectItem>
              <SelectItem value="kampanya">Kampanya</SelectItem>
              <SelectItem value="altyapi">Altyapı</SelectItem>
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
              <SelectItem value="müzakere">Müzakere</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">Tümü</TabsTrigger>
          <TabsTrigger value="active">Aktif</TabsTrigger>
          <TabsTrigger value="major">Büyük Sponsor</TabsTrigger>
          <TabsTrigger value="long-term">Uzun Vadeli</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-4">
          {filteredSponsors.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Award className="w-12 h-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Sponsor bulunamadı</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Arama kriterlerinize uygun sponsor kuruluş bulunmuyor.
                </p>
                <Button onClick={clearFilters}>Filtreleri Temizle</Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {filteredSponsors.map((sponsor) => (
                <Card key={sponsor.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg font-medium">{sponsor.name}</CardTitle>
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                          {getStatusBadge(sponsor.status)}
                          {getTypeBadge(sponsor.type)}
                          {getSponsorshipTypeBadge(sponsor.sponsorshipType)}
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 text-yellow-500 fill-current" />
                            <span className="text-xs text-muted-foreground">{sponsor.rating}</span>
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
                              handleViewDetails(sponsor);
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
                        <span className="truncate">{sponsor.phone}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="w-4 h-4 text-muted-foreground" />
                        <span className="truncate">{sponsor.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <span className="truncate">{sponsor.address}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                      <div className="text-center p-3 bg-green-50 rounded-lg">
                        <div className="text-sm font-medium text-green-800">
                          {formatCurrency(sponsor.totalSponsorship)}
                        </div>
                        <div className="text-xs text-green-600">Toplam Sponsorluk</div>
                      </div>

                      <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <div className="text-sm font-medium text-blue-800">
                          {sponsor.currentProjects}
                        </div>
                        <div className="text-xs text-blue-600">Aktif Proje</div>
                      </div>

                      <div className="text-center p-3 bg-purple-50 rounded-lg">
                        <div className="text-sm font-medium text-purple-800">
                          {sponsor.completedProjects}
                        </div>
                        <div className="text-xs text-purple-600">Tamamlanan</div>
                      </div>

                      <div className="text-center p-3 bg-orange-50 rounded-lg">
                        <div className="text-sm font-medium text-orange-800">
                          {new Date(sponsor.lastSponsorshipDate).toLocaleDateString('tr-TR')}
                        </div>
                        <div className="text-xs text-orange-600">Son Sponsorluk</div>
                      </div>
                    </div>

                    {sponsor.contractStart && sponsor.contractEnd && (
                      <div className="mb-4">
                        <div className="flex justify-between text-sm mb-2">
                          <span>Sözleşme Süresi</span>
                          <span>
                            {new Date(sponsor.contractStart).toLocaleDateString('tr-TR')} -{' '}
                            {new Date(sponsor.contractEnd).toLocaleDateString('tr-TR')}
                          </span>
                        </div>
                        <Progress value={75} className="h-2" />
                      </div>
                    )}

                    {sponsor.sponsorshipAreas.length > 0 && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-2">Sponsorluk Alanları:</p>
                        <div className="flex flex-wrap gap-1">
                          {sponsor.sponsorshipAreas.slice(0, 4).map((area, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {area}
                            </Badge>
                          ))}
                          {sponsor.sponsorshipAreas.length > 4 && (
                            <Badge variant="secondary" className="text-xs">
                              +{sponsor.sponsorshipAreas.length - 4} daha
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

      {/* Sponsor Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Award className="w-5 h-5" />
              {selectedSponsor?.name}
            </DialogTitle>
          </DialogHeader>

          {selectedSponsor && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      İletişim Kişisi
                    </label>
                    <p>{selectedSponsor.contactPerson}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Telefon</label>
                    <p>{selectedSponsor.phone}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">E-posta</label>
                    <p>{selectedSponsor.email}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Adres</label>
                    <p>{selectedSponsor.address}</p>
                  </div>
                  {selectedSponsor.website && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Website</label>
                      <p>{selectedSponsor.website}</p>
                    </div>
                  )}
                  {selectedSponsor.taxNumber && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Vergi No</label>
                      <p>{selectedSponsor.taxNumber}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-lg font-bold text-green-800">
                    {formatCurrency(selectedSponsor.totalSponsorship)}
                  </div>
                  <div className="text-sm text-green-600">Toplam Sponsorluk</div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-lg font-bold text-blue-800">
                    {selectedSponsor.currentProjects}
                  </div>
                  <div className="text-sm text-blue-600">Aktif Proje</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-lg font-bold text-purple-800">
                    {selectedSponsor.completedProjects}
                  </div>
                  <div className="text-sm text-purple-600">Tamamlanan</div>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <div className="text-lg font-bold text-orange-800">{selectedSponsor.rating}</div>
                  <div className="text-sm text-orange-600">Değerlendirme</div>
                </div>
              </div>

              {selectedSponsor.description && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Açıklama</label>
                  <p className="mt-1">{selectedSponsor.description}</p>
                </div>
              )}

              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Sponsorluk Alanları
                </label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedSponsor.sponsorshipAreas.map((area, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {area}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {selectedSponsor.tags.map((tag, index) => (
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
