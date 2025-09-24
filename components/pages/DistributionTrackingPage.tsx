import {
  AlertTriangle,
  Calendar,
  CheckCircle,
  Clock,
  Eye,
  FileText,
  Mail,
  Phone,
  Plus,
  Search,
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
import { Progress } from '../ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';

interface Agreement {
  id: number;
  title: string;
  type: 'mou' | 'protokol' | 'sözleşme' | 'anlaşma' | 'işbirliği';
  partnerName: string;
  partnerType: 'kamu' | 'özel' | 'vakıf' | 'dernek' | 'uluslararası';
  contactPerson: string;
  phone: string;
  email: string;
  startDate: string;
  endDate: string;
  status: 'aktif' | 'süresi-dolmuş' | 'yenileme-bekliyor' | 'iptal' | 'taslak';
  renewalStatus: 'otomatik' | 'manuel' | 'değerlendirme' | 'yenilenmeyecek';
  scope: string[];
  objectives: string[];
  keyPerformanceIndicators: string[];
  responsiblePerson: string;
  budget?: number;
  description?: string;
  documents: {
    name: string;
    type: string;
    uploadDate: string;
  }[];
  milestones: {
    title: string;
    deadline: string;
    status: 'tamamlandı' | 'devam-ediyor' | 'gecikmiş' | 'planlanmış';
    description: string;
  }[];
  tags: string[];
}

// Mock agreement data
const mockAgreements: Agreement[] = [
  {
    id: 1,
    title: 'Sosyal Yardım İşbirliği Protokolü',
    type: 'protokol',
    partnerName: 'Ankara Büyükşehir Belediyesi',
    partnerType: 'kamu',
    contactPerson: 'Ahmet Özkan',
    phone: '0312 555 0101',
    email: 'sosyal.yardim@ankara.bel.tr',
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    status: 'aktif',
    renewalStatus: 'manuel',
    scope: ['sosyal-yardım', 'koordinasyon', 'veri-paylaşımı'],
    objectives: [
      'Sosyal yardım hizmetlerinde koordinasyon sağlama',
      'Mükerrer yardımları önleme',
      'Etkin kaynak kullanımı',
    ],
    keyPerformanceIndicators: [
      '500+ aile koordineli yardım',
      '%30 mükerrer azalma',
      'Aylık koordinasyon toplantıları',
    ],
    responsiblePerson: 'Fatma Demir',
    budget: 150000,
    description: 'Belediye ile sosyal yardım konularında işbirliği protokolü',
    documents: [
      { name: 'Protokol Metni', type: 'PDF', uploadDate: '2024-01-01' },
      { name: 'Ek Protokol', type: 'PDF', uploadDate: '2024-06-15' },
    ],
    milestones: [
      {
        title: 'Protokol İmzalama',
        deadline: '2024-01-01',
        status: 'tamamlandı',
        description: 'Protokol taraflar arasında imzalandı',
      },
      {
        title: 'Sistem Entegrasyonu',
        deadline: '2024-03-01',
        status: 'tamamlandı',
        description: 'Veri paylaşım sistemi kuruldu',
      },
      {
        title: '6 Aylık Değerlendirme',
        deadline: '2024-07-01',
        status: 'tamamlandı',
        description: 'Ara değerlendirme toplantısı yapıldı',
      },
      {
        title: 'Yıl Sonu Değerlendirme',
        deadline: '2024-12-15',
        status: 'planlanmış',
        description: 'Yıllık performans değerlendirmesi',
      },
    ],
    tags: ['sosyal-yardım', 'belediye', 'koordinasyon'],
  },
  {
    id: 2,
    title: 'Eğitim Desteği İşbirliği Anlaşması',
    type: 'anlaşma',
    partnerName: 'Milli Eğitim İl Müdürlüğü',
    partnerType: 'kamu',
    contactPerson: 'Zeynep Kaya',
    phone: '0312 555 0202',
    email: 'ankara@meb.gov.tr',
    startDate: '2023-09-01',
    endDate: '2025-08-31',
    status: 'aktif',
    renewalStatus: 'otomatik',
    scope: ['eğitim-desteği', 'burs', 'materyal-yardımı'],
    objectives: [
      'Eğitimde fırsat eşitliği sağlama',
      'Maddi yetersizlik nedeniyle eğitimden kopma önleme',
      'Eğitim materyali desteği',
    ],
    keyPerformanceIndicators: [
      '200+ öğrenci burs desteği',
      '50+ okula materyal yardımı',
      '%95 öğrenci devam oranı',
    ],
    responsiblePerson: 'Mehmet Yılmaz',
    budget: 250000,
    description: 'Milli Eğitim ile eğitim alanında kapsamlı işbirliği',
    documents: [
      { name: 'İşbirliği Anlaşması', type: 'PDF', uploadDate: '2023-09-01' },
      { name: 'Ek Protokol 1', type: 'PDF', uploadDate: '2024-01-15' },
    ],
    milestones: [
      {
        title: 'Anlaşma İmzalama',
        deadline: '2023-09-01',
        status: 'tamamlandı',
        description: 'İşbirliği anlaşması imzalandı',
      },
      {
        title: 'Burs Sistemi Kurulumu',
        deadline: '2023-10-01',
        status: 'tamamlandı',
        description: 'Burs başvuru ve değerlendirme sistemi',
      },
      {
        title: '2024 Yılı Değerlendirme',
        deadline: '2024-06-30',
        status: 'devam-ediyor',
        description: 'Yıllık performans değerlendirmesi',
      },
    ],
    tags: ['eğitim', 'burs', 'meb'],
  },
  {
    id: 3,
    title: 'Uluslararası Proje İşbirliği MOU',
    type: 'mou',
    partnerName: 'European Development Fund',
    partnerType: 'uluslararası',
    contactPerson: 'Sarah Johnson',
    phone: '+90 312 555 0303',
    email: 'turkey@edf.org',
    startDate: '2024-01-01',
    endDate: '2026-12-31',
    status: 'aktif',
    renewalStatus: 'değerlendirme',
    scope: ['kapasite-geliştirme', 'teknoloji-transferi', 'proje-yönetimi'],
    objectives: [
      'Kurumsal kapasite geliştirme',
      'Teknoloji ve bilgi transferi',
      'Uluslararası standartlarda proje yönetimi',
    ],
    keyPerformanceIndicators: [
      '10+ personel eğitimi',
      '3 teknoloji projesi',
      'ISO kalite standardı',
    ],
    responsiblePerson: 'Hasan Çelik',
    budget: 450000,
    description: 'Avrupa Kalkınma Fonu ile uzun vadeli işbirliği',
    documents: [
      { name: 'MOU Belgesi', type: 'PDF', uploadDate: '2024-01-01' },
      { name: 'Proje Teklifi', type: 'PDF', uploadDate: '2024-02-01' },
    ],
    milestones: [
      {
        title: 'MOU İmzalama',
        deadline: '2024-01-01',
        status: 'tamamlandı',
        description: 'Mutabakat zaptı imzalandı',
      },
      {
        title: 'Proje Başlangıcı',
        deadline: '2024-03-01',
        status: 'tamamlandı',
        description: 'İlk proje faaliyetleri başladı',
      },
      {
        title: 'Ara Değerlendirme',
        deadline: '2024-09-01',
        status: 'devam-ediyor',
        description: '6 aylık ilerleme değerlendirmesi',
      },
    ],
    tags: ['uluslararası', 'ab', 'kapasite', 'teknoloji'],
  },
  {
    id: 4,
    title: 'Sağlık Hizmetleri Koordinasyon Sözleşmesi',
    type: 'sözleşme',
    partnerName: 'Sağlık Bakanlığı İl Müdürlüğü',
    partnerType: 'kamu',
    contactPerson: 'Dr. Ayşe Demir',
    phone: '0312 555 0404',
    email: 'ankara@saglik.gov.tr',
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    status: 'yenileme-bekliyor',
    renewalStatus: 'manuel',
    scope: ['sağlık-hizmetleri', 'sevk-sistemi', 'acil-müdahale'],
    objectives: [
      'Sağlık hizmetlerine erişim kolaylaştırma',
      'Sevk sisteminin etkinleştirilmesi',
      'Acil durumlarda hızlı müdahale',
    ],
    keyPerformanceIndicators: ['300+ hasta sevki', '%90 başarılı tedavi', '24 saat acil erişim'],
    responsiblePerson: 'Selma Özkan',
    description: 'Sağlık alanında koordinasyon ve hizmet sözleşmesi',
    documents: [{ name: 'Hizmet Sözleşmesi', type: 'PDF', uploadDate: '2024-01-01' }],
    milestones: [
      {
        title: 'Sözleşme İmzalama',
        deadline: '2024-01-01',
        status: 'tamamlandı',
        description: 'Hizmet sözleşmesi imzalandı',
      },
      {
        title: 'Sistem Entegrasyonu',
        deadline: '2024-02-01',
        status: 'tamamlandı',
        description: 'Sevk sistemi entegrasyonu',
      },
      {
        title: 'Yenileme Görüşmeleri',
        deadline: '2024-11-01',
        status: 'planlanmış',
        description: 'Sözleşme yenileme görüşmeleri',
      },
    ],
    tags: ['sağlık', 'sevk', 'acil'],
  },
];

export default function PartnerAgreementsPage() {
  const [agreements, setAgreements] = useState<Agreement[]>(mockAgreements);
  const [filteredAgreements, setFilteredAgreements] = useState<Agreement[]>(mockAgreements);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPartnerType, setFilterPartnerType] = useState<string>('all');
  const [selectedAgreement, setSelectedAgreement] = useState<Agreement | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  // Filtering logic
  useEffect(() => {
    let filtered = agreements;

    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (agreement) =>
          agreement.title.toLowerCase().includes(searchLower) ||
          agreement.partnerName.toLowerCase().includes(searchLower) ||
          agreement.contactPerson.toLowerCase().includes(searchLower) ||
          agreement.scope.some((scope) => scope.toLowerCase().includes(searchLower)) ||
          agreement.tags.some((tag) => tag.toLowerCase().includes(searchLower)),
      );
    }

    // Type filter
    if (filterType !== 'all') {
      filtered = filtered.filter((agreement) => agreement.type === filterType);
    }

    // Status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter((agreement) => agreement.status === filterStatus);
    }

    // Partner type filter
    if (filterPartnerType !== 'all') {
      filtered = filtered.filter((agreement) => agreement.partnerType === filterPartnerType);
    }

    // Tab filter
    if (activeTab === 'active') {
      filtered = filtered.filter((agreement) => agreement.status === 'aktif');
    } else if (activeTab === 'expiring') {
      filtered = filtered.filter((agreement) => {
        const endDate = new Date(agreement.endDate);
        const now = new Date();
        const monthsUntilExpiry = (endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 30);
        return monthsUntilExpiry <= 3 && monthsUntilExpiry > 0;
      });
    } else if (activeTab === 'renewal') {
      filtered = filtered.filter((agreement) => agreement.status === 'yenileme-bekliyor');
    }

    setFilteredAgreements(filtered);
  }, [agreements, searchTerm, filterType, filterStatus, filterPartnerType, activeTab]);

  const getStatusBadge = (status: Agreement['status']) => {
    const config = {
      aktif: { label: 'Aktif', className: 'bg-green-50 text-green-700 border-green-200' },
      'süresi-dolmuş': {
        label: 'Süresi Dolmuş',
        className: 'bg-red-50 text-red-700 border-red-200',
      },
      'yenileme-bekliyor': {
        label: 'Yenileme Bekliyor',
        className: 'bg-yellow-50 text-yellow-700 border-yellow-200',
      },
      iptal: { label: 'İptal', className: 'bg-gray-50 text-gray-700 border-gray-200' },
      taslak: { label: 'Taslak', className: 'bg-blue-50 text-blue-700 border-blue-200' },
    };

    const { label, className } = config[status];
    return (
      <Badge variant="outline" className={`${className} text-xs px-2 py-1`}>
        {label}
      </Badge>
    );
  };

  const getTypeBadge = (type: Agreement['type']) => {
    const config = {
      mou: { label: 'MOU', className: 'bg-purple-50 text-purple-700' },
      protokol: { label: 'Protokol', className: 'bg-blue-50 text-blue-700' },
      sözleşme: { label: 'Sözleşme', className: 'bg-green-50 text-green-700' },
      anlaşma: { label: 'Anlaşma', className: 'bg-orange-50 text-orange-700' },
      işbirliği: { label: 'İşbirliği', className: 'bg-indigo-50 text-indigo-700' },
    };

    const { label, className } = config[type];
    return <Badge className={`${className} text-xs px-2 py-1 border-0`}>{label}</Badge>;
  };

  const getRemainingTime = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    const diff = end.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

    if (days < 0) return `${Math.abs(days)} gün geçti`;
    if (days === 0) return 'Bugün bitiyor';
    if (days === 1) return 'Yarın bitiyor';
    if (days <= 30) return `${days} gün kaldı`;

    const months = Math.ceil(days / 30);
    return `${months} ay kaldı`;
  };

  const getMilestoneProgress = (milestones: Agreement['milestones']) => {
    const completed = milestones.filter((m) => m.status === 'tamamlandı').length;
    return Math.round((completed / milestones.length) * 100);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleViewDetails = useCallback((agreement: Agreement) => {
    setSelectedAgreement(agreement);
    setIsDetailOpen(true);
  }, []);

  const clearFilters = useCallback(() => {
    setSearchTerm('');
    setFilterType('all');
    setFilterStatus('all');
    setFilterPartnerType('all');
    setActiveTab('all');
  }, []);

  const activeAgreements = agreements.filter((a) => a.status === 'aktif').length;
  const expiringAgreements = agreements.filter((a) => {
    const endDate = new Date(a.endDate);
    const now = new Date();
    const monthsUntilExpiry = (endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 30);
    return monthsUntilExpiry <= 3 && monthsUntilExpiry > 0;
  }).length;
  const renewalAgreements = agreements.filter((a) => a.status === 'yenileme-bekliyor').length;

  return (
    <div className="flex-1 space-y-4 p-4 sm:space-y-6 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-medium">İş Birliği Anlaşmaları</h1>
          <p className="text-muted-foreground mt-1">Protokol, sözleşme ve anlaşma yönetimi</p>
        </div>
        <Button className="gap-2 w-full sm:w-auto">
          <Plus className="w-4 h-4" />
          Yeni Anlaşma
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Toplam Anlaşma</p>
                <p className="text-2xl font-medium">{agreements.length}</p>
              </div>
              <FileText className="w-5 h-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Aktif</p>
                <p className="text-2xl font-medium text-green-600">{activeAgreements}</p>
              </div>
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Süresi Yaklaşan</p>
                <p className="text-2xl font-medium text-orange-600">{expiringAgreements}</p>
              </div>
              <Clock className="w-5 h-5 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Yenileme</p>
                <p className="text-2xl font-medium text-blue-600">{renewalAgreements}</p>
              </div>
              <AlertTriangle className="w-5 h-5 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Anlaşma ara..."
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
              <SelectItem value="mou">MOU</SelectItem>
              <SelectItem value="protokol">Protokol</SelectItem>
              <SelectItem value="sözleşme">Sözleşme</SelectItem>
              <SelectItem value="anlaşma">Anlaşma</SelectItem>
              <SelectItem value="işbirliği">İşbirliği</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[140px] shrink-0">
              <SelectValue placeholder="Durum" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tüm Durumlar</SelectItem>
              <SelectItem value="aktif">Aktif</SelectItem>
              <SelectItem value="süresi-dolmuş">Süresi Dolmuş</SelectItem>
              <SelectItem value="yenileme-bekliyor">Yenileme Bekliyor</SelectItem>
              <SelectItem value="iptal">İptal</SelectItem>
              <SelectItem value="taslak">Taslak</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterPartnerType} onValueChange={setFilterPartnerType}>
            <SelectTrigger className="w-[130px] shrink-0">
              <SelectValue placeholder="Partner" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tüm Partnerler</SelectItem>
              <SelectItem value="kamu">Kamu</SelectItem>
              <SelectItem value="özel">Özel</SelectItem>
              <SelectItem value="vakıf">Vakıf</SelectItem>
              <SelectItem value="dernek">Dernek</SelectItem>
              <SelectItem value="uluslararası">Uluslararası</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">Tümü</TabsTrigger>
          <TabsTrigger value="active">Aktif</TabsTrigger>
          <TabsTrigger value="expiring">Süresi Yaklaşan</TabsTrigger>
          <TabsTrigger value="renewal">Yenileme</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-4">
          {filteredAgreements.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FileText className="w-12 h-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Anlaşma bulunamadı</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Arama kriterlerinize uygun anlaşma bulunmuyor.
                </p>
                <Button onClick={clearFilters}>Filtreleri Temizle</Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {filteredAgreements.map((agreement) => (
                <Card key={agreement.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg font-medium">{agreement.title}</CardTitle>
                        <p className="text-muted-foreground mt-1">{agreement.partnerName}</p>
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                          {getStatusBadge(agreement.status)}
                          {getTypeBadge(agreement.type)}
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
                              handleViewDetails(agreement);
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
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span className="truncate">
                          {new Date(agreement.startDate).toLocaleDateString('tr-TR')} -{' '}
                          {new Date(agreement.endDate).toLocaleDateString('tr-TR')}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span className="truncate">{getRemainingTime(agreement.endDate)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Users className="w-4 h-4 text-muted-foreground" />
                        <span className="truncate">{agreement.responsiblePerson}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="w-4 h-4 text-muted-foreground" />
                        <span className="truncate">{agreement.phone}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="w-4 h-4 text-muted-foreground" />
                        <span className="truncate">{agreement.email}</span>
                      </div>
                    </div>

                    {agreement.milestones.length > 0 && (
                      <div className="mb-4">
                        <div className="flex justify-between text-sm mb-2">
                          <span>İlerleme</span>
                          <span>{getMilestoneProgress(agreement.milestones)}%</span>
                        </div>
                        <Progress
                          value={getMilestoneProgress(agreement.milestones)}
                          className="h-2"
                        />
                      </div>
                    )}

                    {agreement.budget && (
                      <div className="mb-4 p-3 bg-green-50 rounded-lg">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-green-700">Bütçe</span>
                          <span className="font-medium text-green-800">
                            {formatCurrency(agreement.budget)}
                          </span>
                        </div>
                      </div>
                    )}

                    {agreement.scope.length > 0 && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-2">Kapsam:</p>
                        <div className="flex flex-wrap gap-1">
                          {agreement.scope.slice(0, 3).map((scope, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {scope}
                            </Badge>
                          ))}
                          {agreement.scope.length > 3 && (
                            <Badge variant="secondary" className="text-xs">
                              +{agreement.scope.length - 3} daha
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

      {/* Agreement Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              {selectedAgreement?.title}
            </DialogTitle>
          </DialogHeader>

          {selectedAgreement && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Partner</label>
                    <p>{selectedAgreement.partnerName}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      İletişim Kişisi
                    </label>
                    <p>{selectedAgreement.contactPerson}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Sorumlu Kişi
                    </label>
                    <p>{selectedAgreement.responsiblePerson}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Başlangıç</label>
                    <p>{new Date(selectedAgreement.startDate).toLocaleDateString('tr-TR')}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Bitiş</label>
                    <p>{new Date(selectedAgreement.endDate).toLocaleDateString('tr-TR')}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Yenileme</label>
                    <p>{selectedAgreement.renewalStatus}</p>
                  </div>
                </div>
              </div>

              {selectedAgreement.description && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Açıklama</label>
                  <p className="mt-1">{selectedAgreement.description}</p>
                </div>
              )}

              <div>
                <label className="text-sm font-medium text-muted-foreground">Hedefler</label>
                <ul className="mt-2 space-y-1">
                  {selectedAgreement.objectives.map((objective, index) => (
                    <li key={index} className="text-sm">
                      • {objective}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Aşamalar</label>
                <div className="mt-2 space-y-2">
                  {selectedAgreement.milestones.map((milestone, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <p className="font-medium">{milestone.title}</p>
                        <p className="text-sm text-muted-foreground">{milestone.description}</p>
                      </div>
                      <div className="text-right">
                        <Badge
                          variant={
                            milestone.status === 'tamamlandı'
                              ? 'default'
                              : milestone.status === 'devam-ediyor'
                                ? 'secondary'
                                : milestone.status === 'gecikmiş'
                                  ? 'destructive'
                                  : 'outline'
                          }
                          className="text-xs"
                        >
                          {milestone.status}
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(milestone.deadline).toLocaleDateString('tr-TR')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {selectedAgreement.tags.map((tag, index) => (
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
