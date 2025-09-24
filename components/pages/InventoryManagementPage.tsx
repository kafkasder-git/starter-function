import {
  Award,
  Building2,
  Calendar,
  Eye,
  Heart,
  Mail,
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

interface AssociationPartner {
  id: number;
  name: string;
  type: 'dernek' | 'vakıf' | 'platform' | 'federasyon' | 'birlik';
  focusArea:
    | 'sosyal-yardım'
    | 'eğitim'
    | 'sağlık'
    | 'çevre'
    | 'kadın'
    | 'gençlik'
    | 'yaşlı'
    | 'engelli'
    | 'genel';
  location: string;
  contactPerson: string;
  position: string;
  phone: string;
  email: string;
  address: string;
  status: 'aktif' | 'pasif' | 'işbirliği-arayışı';
  collaborationType:
    | 'proje-ortaklığı'
    | 'kaynak-paylaşımı'
    | 'deneyim-paylaşımı'
    | 'ortak-etkinlik'
    | 'network';
  establishedDate: string;
  memberCount?: number;
  budget?: number;
  lastCollaboration?: string;
  rating: number;
  website?: string;
  socialMedia?: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
  };
  description?: string;
  specialties: string[];
  sharedProjects: {
    name: string;
    year: string;
    status: 'tamamlandı' | 'devam-ediyor' | 'planlanıyor';
  }[];
  tags: string[];
}

// Mock association data
const mockAssociations: AssociationPartner[] = [
  {
    id: 1,
    name: 'Toplum Kalkınma Derneği',
    type: 'dernek',
    focusArea: 'sosyal-yardım',
    location: 'Ankara',
    contactPerson: 'Hasan Çelik',
    position: 'Başkan',
    phone: '0312 555 0101',
    email: 'info@toplumkalkinma.org',
    address: 'Kızılay, Ankara',
    status: 'aktif',
    collaborationType: 'proje-ortaklığı',
    establishedDate: '2005-04-08',
    memberCount: 150,
    budget: 250000,
    lastCollaboration: '2024-01-15',
    rating: 4,
    website: 'www.toplumkalkinma.org',
    socialMedia: {
      facebook: 'toplumkalkinma',
      twitter: 'toplumkalkinma',
    },
    description: 'Sosyal kalkınma ve toplumsal dayanışma alanında faaliyet gösteren dernek',
    specialties: ['sosyal-yardım', 'mikro-kredi', 'mesleki-eğitim', 'kadın-girişimciliği'],
    sharedProjects: [
      { name: 'Kadın Girişimcilik Projesi', year: '2023', status: 'tamamlandı' },
      { name: 'Gençlik Eğitim Programı', year: '2024', status: 'devam-ediyor' },
    ],
    tags: ['sosyal-kalkınma', 'girişimcilik', 'kadın', 'eğitim'],
  },
  {
    id: 2,
    name: 'Çocuk Eğitimi Vakfı',
    type: 'vakıf',
    focusArea: 'eğitim',
    location: 'İstanbul',
    contactPerson: 'Dr. Fatma Demir',
    position: 'Genel Müdür',
    phone: '0212 555 0202',
    email: 'info@cocu keğitimi.org',
    address: 'Beşiktaş, İstanbul',
    status: 'aktif',
    collaborationType: 'kaynak-paylaşımı',
    establishedDate: '1998-09-15',
    memberCount: 85,
    budget: 450000,
    lastCollaboration: '2024-01-20',
    rating: 5,
    website: 'www.cocukegitimi.org',
    socialMedia: {
      facebook: 'cocukegitimivakfi',
      instagram: 'cocukegitimi',
    },
    description: 'Çocuk eğitimi ve gelişimi alanında uzmanlaşmış vakıf',
    specialties: ['okul-öncesi', 'özel-eğitim', 'materyal-geliştirme', 'öğretmen-eğitimi'],
    sharedProjects: [
      { name: 'Eğitim Materyali Paylaşımı', year: '2023', status: 'tamamlandı' },
      { name: 'Öğretmen Değişim Programı', year: '2024', status: 'devam-ediyor' },
      { name: 'Yaz Okulu Projesi', year: '2024', status: 'planlanıyor' },
    ],
    tags: ['çocuk', 'eğitim', 'okul-öncesi', 'özel-eğitim'],
  },
  {
    id: 3,
    name: 'Yaşlı Bakım Derneği',
    type: 'dernek',
    focusArea: 'yaşlı',
    location: 'İzmir',
    contactPerson: 'Mehmet Özkan',
    position: 'Koordinatör',
    phone: '0232 555 0303',
    email: 'koordinasyon@yaslibakım.org',
    address: 'Konak, İzmir',
    status: 'aktif',
    collaborationType: 'deneyim-paylaşımı',
    establishedDate: '2010-11-22',
    memberCount: 65,
    budget: 180000,
    lastCollaboration: '2024-01-18',
    rating: 4,
    website: 'www.yaslibakim.org',
    description: 'Yaşlı bakım hizmetleri ve yaşlı hakları alanında çalışan dernek',
    specialties: ['evde-bakım', 'sosyal-aktivite', 'sağlık-takibi', 'aile-danışmanlığı'],
    sharedProjects: [
      { name: 'Yaşlı Bakım Eğitimi', year: '2023', status: 'tamamlandı' },
      { name: 'Gönüllü Eğitim Programı', year: '2024', status: 'devam-ediyor' },
    ],
    tags: ['yaşlı', 'bakım', 'sağlık', 'gönüllülük'],
  },
  {
    id: 4,
    name: 'Gençlik ve Spor Platformu',
    type: 'platform',
    focusArea: 'gençlik',
    location: 'Antalya',
    contactPerson: 'Zeynep Kaya',
    position: 'Platform Sözcüsü',
    phone: '0242 555 0404',
    email: 'iletisim@genclikplatformu.org',
    address: 'Muratpaşa, Antalya',
    status: 'işbirliği-arayışı',
    collaborationType: 'ortak-etkinlik',
    establishedDate: '2015-06-10',
    memberCount: 200,
    budget: 120000,
    rating: 4,
    website: 'www.genclikplatformu.org',
    socialMedia: {
      instagram: 'genclikplatformu',
      twitter: 'genclikplatform',
    },
    description: 'Gençlik ve spor etkinlikleri organize eden platform',
    specialties: ['spor-etkinlikleri', 'gençlik-kampları', 'liderlik-eğitimi', 'sosyal-sorumluluk'],
    sharedProjects: [{ name: 'Gençlik Liderleri Kampı', year: '2024', status: 'planlanıyor' }],
    tags: ['gençlik', 'spor', 'liderlik', 'etkinlik'],
  },
  {
    id: 5,
    name: 'Çevre Koruma Birliği',
    type: 'birlik',
    focusArea: 'çevre',
    location: 'Bursa',
    contactPerson: 'Dr. Ahmet Yılmaz',
    position: 'Başkan',
    phone: '0224 555 0505',
    email: 'baskan@cevrekoruma.org',
    address: 'Nilüfer, Bursa',
    status: 'aktif',
    collaborationType: 'network',
    establishedDate: '2008-03-14',
    memberCount: 300,
    budget: 350000,
    lastCollaboration: '2024-01-12',
    rating: 5,
    website: 'www.cevrekoruma.org',
    socialMedia: {
      facebook: 'cevrekorumabirligi',
      instagram: 'cevrekoruma',
      twitter: 'cevrekoruma',
    },
    description: 'Çevre koruma ve sürdürülebilirlik konularında faaliyet gösteren birlik',
    specialties: ['geri-dönüşüm', 'çevre-eğitimi', 'doğa-koruma', 'sürdürülebilirlik'],
    sharedProjects: [
      { name: 'Geri Dönüşüm Kampanyası', year: '2023', status: 'tamamlandı' },
      { name: 'Çevre Bilinci Eğitimi', year: '2024', status: 'devam-ediyor' },
      { name: 'Yeşil Şehir Projesi', year: '2024', status: 'planlanıyor' },
    ],
    tags: ['çevre', 'sürdürülebilirlik', 'eğitim', 'geri-dönüşüm'],
  },
];

export default function PartnerAssociationsPage() {
  const [associations, setAssociations] = useState<AssociationPartner[]>(mockAssociations);
  const [filteredAssociations, setFilteredAssociations] =
    useState<AssociationPartner[]>(mockAssociations);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterFocusArea, setFilterFocusArea] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedAssociation, setSelectedAssociation] = useState<AssociationPartner | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  // Filtering logic
  useEffect(() => {
    let filtered = associations;

    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (association) =>
          association.name.toLowerCase().includes(searchLower) ||
          association.contactPerson.toLowerCase().includes(searchLower) ||
          association.location.toLowerCase().includes(searchLower) ||
          association.specialties.some((specialty) =>
            specialty.toLowerCase().includes(searchLower),
          ) ||
          association.tags.some((tag) => tag.toLowerCase().includes(searchLower)),
      );
    }

    // Type filter
    if (filterType !== 'all') {
      filtered = filtered.filter((association) => association.type === filterType);
    }

    // Focus area filter
    if (filterFocusArea !== 'all') {
      filtered = filtered.filter((association) => association.focusArea === filterFocusArea);
    }

    // Status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter((association) => association.status === filterStatus);
    }

    // Tab filter
    if (activeTab === 'active') {
      filtered = filtered.filter((association) => association.status === 'aktif');
    } else if (activeTab === 'large') {
      filtered = filtered.filter(
        (association) => association.memberCount && association.memberCount >= 100,
      );
    } else if (activeTab === 'collaborative') {
      filtered = filtered.filter((association) => association.sharedProjects.length > 0);
    }

    setFilteredAssociations(filtered);
  }, [associations, searchTerm, filterType, filterFocusArea, filterStatus, activeTab]);

  const getStatusBadge = (status: AssociationPartner['status']) => {
    const config = {
      aktif: { label: 'Aktif', className: 'bg-green-50 text-green-700 border-green-200' },
      pasif: { label: 'Pasif', className: 'bg-gray-50 text-gray-700 border-gray-200' },
      'işbirliği-arayışı': {
        label: 'İşbirliği Arayışı',
        className: 'bg-blue-50 text-blue-700 border-blue-200',
      },
    };

    const { label, className } = config[status];
    return (
      <Badge variant="outline" className={`${className} text-xs px-2 py-1`}>
        {label}
      </Badge>
    );
  };

  const getTypeBadge = (type: AssociationPartner['type']) => {
    const config = {
      dernek: { label: 'Dernek', className: 'bg-blue-50 text-blue-700' },
      vakıf: { label: 'Vakıf', className: 'bg-purple-50 text-purple-700' },
      platform: { label: 'Platform', className: 'bg-green-50 text-green-700' },
      federasyon: { label: 'Federasyon', className: 'bg-orange-50 text-orange-700' },
      birlik: { label: 'Birlik', className: 'bg-indigo-50 text-indigo-700' },
    };

    const { label, className } = config[type];
    return <Badge className={`${className} text-xs px-2 py-1 border-0`}>{label}</Badge>;
  };

  const getFocusAreaBadge = (area: AssociationPartner['focusArea']) => {
    const config = {
      'sosyal-yardım': { label: 'Sosyal Yardım', className: 'bg-red-50 text-red-700' },
      eğitim: { label: 'Eğitim', className: 'bg-blue-50 text-blue-700' },
      sağlık: { label: 'Sağlık', className: 'bg-green-50 text-green-700' },
      çevre: { label: 'Çevre', className: 'bg-emerald-50 text-emerald-700' },
      kadın: { label: 'Kadın', className: 'bg-pink-50 text-pink-700' },
      gençlik: { label: 'Gençlik', className: 'bg-orange-50 text-orange-700' },
      yaşlı: { label: 'Yaşlı', className: 'bg-purple-50 text-purple-700' },
      engelli: { label: 'Engelli', className: 'bg-cyan-50 text-cyan-700' },
      genel: { label: 'Genel', className: 'bg-gray-50 text-gray-700' },
    };

    const { label, className } = config[area];
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

  const handleViewDetails = useCallback((association: AssociationPartner) => {
    setSelectedAssociation(association);
    setIsDetailOpen(true);
  }, []);

  const clearFilters = useCallback(() => {
    setSearchTerm('');
    setFilterType('all');
    setFilterFocusArea('all');
    setFilterStatus('all');
    setActiveTab('all');
  }, []);

  const activeAssociations = associations.filter((a) => a.status === 'aktif').length;
  const totalMembers = associations.reduce((sum, a) => sum + (a.memberCount || 0), 0);
  const collaborativeAssociations = associations.filter((a) => a.sharedProjects.length > 0).length;
  const largeAssociations = associations.filter(
    (a) => a.memberCount && a.memberCount >= 100,
  ).length;

  return (
    <div className="flex-1 space-y-4 p-4 sm:space-y-6 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-medium">Diğer Dernekler</h1>
          <p className="text-muted-foreground mt-1">Dernek ağı ve işbirliği ilişkileri</p>
        </div>
        <Button className="gap-2 w-full sm:w-auto">
          <Plus className="w-4 h-4" />
          Yeni Dernek Ekle
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Aktif Dernek</p>
                <p className="text-2xl font-medium text-green-600">{activeAssociations}</p>
              </div>
              <Building2 className="w-5 h-5 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Toplam Üye</p>
                <p className="text-2xl font-medium text-blue-600">
                  {totalMembers.toLocaleString()}
                </p>
              </div>
              <Users className="w-5 h-5 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">İşbirlikçi</p>
                <p className="text-2xl font-medium text-purple-600">{collaborativeAssociations}</p>
              </div>
              <Heart className="w-5 h-5 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Büyük Dernek</p>
                <p className="text-2xl font-medium text-orange-600">{largeAssociations}</p>
              </div>
              <Award className="w-5 h-5 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Dernek ara..."
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
              <SelectItem value="dernek">Dernek</SelectItem>
              <SelectItem value="vakıf">Vakıf</SelectItem>
              <SelectItem value="platform">Platform</SelectItem>
              <SelectItem value="federasyon">Federasyon</SelectItem>
              <SelectItem value="birlik">Birlik</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterFocusArea} onValueChange={setFilterFocusArea}>
            <SelectTrigger className="w-[130px] shrink-0">
              <SelectValue placeholder="Alan" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tüm Alanlar</SelectItem>
              <SelectItem value="sosyal-yardım">Sosyal Yardım</SelectItem>
              <SelectItem value="eğitim">Eğitim</SelectItem>
              <SelectItem value="sağlık">Sağlık</SelectItem>
              <SelectItem value="çevre">Çevre</SelectItem>
              <SelectItem value="kadın">Kadın</SelectItem>
              <SelectItem value="gençlik">Gençlik</SelectItem>
              <SelectItem value="yaşlı">Yaşlı</SelectItem>
              <SelectItem value="engelli">Engelli</SelectItem>
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
              <SelectItem value="işbirliği-arayışı">İşbirliği Arayışı</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">Tümü</TabsTrigger>
          <TabsTrigger value="active">Aktif</TabsTrigger>
          <TabsTrigger value="large">Büyük</TabsTrigger>
          <TabsTrigger value="collaborative">İşbirlikçi</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-4">
          {filteredAssociations.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Building2 className="w-12 h-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Dernek bulunamadı</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Arama kriterlerinize uygun dernek bulunmuyor.
                </p>
                <Button onClick={clearFilters}>Filtreleri Temizle</Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {filteredAssociations.map((association) => (
                <Card key={association.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg font-medium">{association.name}</CardTitle>
                        <p className="text-muted-foreground mt-1">
                          {association.location} • {association.position}:{' '}
                          {association.contactPerson}
                        </p>
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                          {getStatusBadge(association.status)}
                          {getTypeBadge(association.type)}
                          {getFocusAreaBadge(association.focusArea)}
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 text-yellow-500 fill-current" />
                            <span className="text-xs text-muted-foreground">
                              {association.rating}
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
                              handleViewDetails(association);
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
                        <span className="truncate">{association.phone}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="w-4 h-4 text-muted-foreground" />
                        <span className="truncate">{association.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span className="truncate">
                          Kuruluş: {new Date(association.establishedDate).getFullYear()}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
                      {association.memberCount && (
                        <div className="text-center p-3 bg-blue-50 rounded-lg">
                          <div className="text-sm font-medium text-blue-800">
                            {association.memberCount}
                          </div>
                          <div className="text-xs text-blue-600">Üye Sayısı</div>
                        </div>
                      )}

                      {association.budget && (
                        <div className="text-center p-3 bg-green-50 rounded-lg">
                          <div className="text-sm font-medium text-green-800">
                            {formatCurrency(association.budget)}
                          </div>
                          <div className="text-xs text-green-600">Bütçe</div>
                        </div>
                      )}

                      <div className="text-center p-3 bg-purple-50 rounded-lg">
                        <div className="text-sm font-medium text-purple-800">
                          {association.sharedProjects.length}
                        </div>
                        <div className="text-xs text-purple-600">Ortak Proje</div>
                      </div>
                    </div>

                    {association.specialties.length > 0 && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-2">Uzmanlık Alanları:</p>
                        <div className="flex flex-wrap gap-1">
                          {association.specialties.slice(0, 3).map((specialty, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {specialty}
                            </Badge>
                          ))}
                          {association.specialties.length > 3 && (
                            <Badge variant="secondary" className="text-xs">
                              +{association.specialties.length - 3} daha
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

      {/* Association Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              {selectedAssociation?.name}
            </DialogTitle>
          </DialogHeader>

          {selectedAssociation && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      İletişim Kişisi
                    </label>
                    <p>{selectedAssociation.contactPerson}</p>
                    <p className="text-sm text-muted-foreground">{selectedAssociation.position}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Telefon</label>
                    <p>{selectedAssociation.phone}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">E-posta</label>
                    <p>{selectedAssociation.email}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Adres</label>
                    <p>{selectedAssociation.address}</p>
                  </div>
                  {selectedAssociation.website && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Website</label>
                      <p>{selectedAssociation.website}</p>
                    </div>
                  )}
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Kuruluş Tarihi
                    </label>
                    <p>
                      {new Date(selectedAssociation.establishedDate).toLocaleDateString('tr-TR')}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {selectedAssociation.memberCount && (
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-lg font-bold text-blue-800">
                      {selectedAssociation.memberCount}
                    </div>
                    <div className="text-sm text-blue-600">Üye Sayısı</div>
                  </div>
                )}
                {selectedAssociation.budget && (
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-lg font-bold text-green-800">
                      {formatCurrency(selectedAssociation.budget)}
                    </div>
                    <div className="text-sm text-green-600">Yıllık Bütçe</div>
                  </div>
                )}
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-lg font-bold text-purple-800">
                    {selectedAssociation.sharedProjects.length}
                  </div>
                  <div className="text-sm text-purple-600">Ortak Proje</div>
                </div>
              </div>

              {selectedAssociation.description && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Açıklama</label>
                  <p className="mt-1">{selectedAssociation.description}</p>
                </div>
              )}

              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Uzmanlık Alanları
                </label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedAssociation.specialties.map((specialty, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {specialty}
                    </Badge>
                  ))}
                </div>
              </div>

              {selectedAssociation.sharedProjects.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Ortak Projeler
                  </label>
                  <div className="mt-2 space-y-2">
                    {selectedAssociation.sharedProjects.map((project, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div>
                          <p className="font-medium">{project.name}</p>
                          <p className="text-sm text-muted-foreground">{project.year}</p>
                        </div>
                        <Badge
                          variant={
                            project.status === 'tamamlandı'
                              ? 'default'
                              : project.status === 'devam-ediyor'
                                ? 'secondary'
                                : 'outline'
                          }
                          className="text-xs"
                        >
                          {project.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                {selectedAssociation.tags.map((tag, index) => (
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
