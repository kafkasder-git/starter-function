/**
 * @fileoverview InventoryManagementPage Module - Application module
 *
 * @author Dernek Yönetim Sistemi Team
 * @version 1.0.0
 */

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
import { partnersService } from '../../services/partnersService';
import { logger } from '../../lib/logging/logger';
import { toast } from '../ui/toast'; // Assuming toast is imported from UI library

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

// Mapping function to convert Partner to AssociationPartner
const mapPartnerToAssociationPartner = (partner: any): AssociationPartner => {
  return {
    id: partner.id,
    name: partner.name,
    type: partner.partner_type as AssociationPartner['type'], // Assuming types match
    focusArea: 'genel' as AssociationPartner['focusArea'], // Default, as not in Partner
    location: partner.city || '',
    contactPerson: partner.contact_person || '',
    position: '', // Not in Partner
    phone: partner.phone || '',
    email: partner.email || '',
    address: partner.address || '',
    status: partner.status === 'active' ? 'aktif' : partner.status === 'inactive' ? 'pasif' : 'işbirliği-arayışı',
    collaborationType: 'network' as AssociationPartner['collaborationType'], // Default
    establishedDate: partner.relationship_start,
    memberCount: undefined, // Not in Partner
    budget: undefined, // Not in Partner
    lastCollaboration: partner.last_contact_date,
    rating: partner.rating || 0,
    website: partner.website,
    socialMedia: partner.social_media,
    description: partner.notes,
    specialties: partner.services_provided || [],
    sharedProjects: [], // Not in Partner
    tags: [], // Not in Partner
  };
};

/**
 * PartnerAssociationsPage function
 *
 * @param {Object} params - Function parameters
 * @returns {void} Nothing
 */
export default function PartnerAssociationsPage() {
  const [associationsList, setAssociationsList] = useState<AssociationPartner[]>([]);
  const [filteredAssociations, setFilteredAssociations] = useState<AssociationPartner[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterFocusArea, setFilterFocusArea] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedAssociation, setSelectedAssociation] = useState<AssociationPartner | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [loading, setLoading] = useState(true);

  // Load associations data
  useEffect(() => {
    const loadAssociations = async () => {
      setLoading(true);
      try {
        const response = await partnersService.getPartners(1, 100); // Fetch first page with large limit
        if (response.error) {
          logger.error('Error fetching partners:', response.error);
          toast.error('Dernekler yüklenirken hata oluştu');
          setAssociationsList([]);
        } else {
          const mappedAssociations = response.data?.map(mapPartnerToAssociationPartner) || [];
          setAssociationsList(mappedAssociations);
        }
      } catch (error) {
        logger.error('Error loading associations:', error);
        toast.error('Dernekler yüklenirken hata oluştu');
        setAssociationsList([]);
      } finally {
        setLoading(false);
      }
    };
    loadAssociations();
  }, []);

  // Filtering logic
  useEffect(() => {
    let filtered = associationsList;

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
  }, [associationsList, searchTerm, filterType, filterFocusArea, filterStatus, activeTab]);

  const getStatusBadge = (status: AssociationPartner['status']) => {
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
      case 'işbirliği-arayışı':
        label = 'İşbirliği Arayışı';
        className = 'bg-blue-50 text-blue-700 border-blue-200';
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

  const getTypeBadge = (type: AssociationPartner['type']) => {
    let label: string;
    let className: string;

    switch (type) {
      case 'dernek':
        label = 'Dernek';
        className = 'bg-blue-50 text-blue-700';
        break;
      case 'vakıf':
        label = 'Vakıf';
        className = 'bg-purple-50 text-purple-700';
        break;
      case 'platform':
        label = 'Platform';
        className = 'bg-green-50 text-green-700';
        break;
      case 'federasyon':
        label = 'Federasyon';
        className = 'bg-orange-50 text-orange-700';
        break;
      case 'birlik':
        label = 'Birlik';
        className = 'bg-indigo-50 text-indigo-700';
        break;
      default:
        label = 'Bilinmiyor';
        className = 'bg-gray-50 text-gray-700';
    }

    return <Badge className={`${className} border-0 px-2 py-1 text-xs`}>{label}</Badge>;
  };

  const getFocusAreaBadge = (area: AssociationPartner['focusArea']) => {
    let label: string;
    let className: string;

    switch (area) {
      case 'sosyal-yardım':
        label = 'Sosyal Yardım';
        className = 'bg-red-50 text-red-700';
        break;
      case 'eğitim':
        label = 'Eğitim';
        className = 'bg-blue-50 text-blue-700';
        break;
      case 'sağlık':
        label = 'Sağlık';
        className = 'bg-green-50 text-green-700';
        break;
      case 'çevre':
        label = 'Çevre';
        className = 'bg-emerald-50 text-emerald-700';
        break;
      case 'kadın':
        label = 'Kadın';
        className = 'bg-pink-50 text-pink-700';
        break;
      case 'gençlik':
        label = 'Gençlik';
        className = 'bg-orange-50 text-orange-700';
        break;
      case 'yaşlı':
        label = 'Yaşlı';
        className = 'bg-purple-50 text-purple-700';
        break;
      case 'engelli':
        label = 'Engelli';
        className = 'bg-cyan-50 text-cyan-700';
        break;
      case 'genel':
        label = 'Genel';
        className = 'bg-gray-50 text-gray-700';
        break;
      default:
        label = 'Bilinmiyor';
        className = 'bg-gray-50 text-gray-700';
    }

    return (
      <Badge variant="outline" className={`${className} px-2 py-1 text-xs`}>
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

  const activeAssociations = associationsList.filter((a) => a.status === 'aktif').length;
  const totalMembers = associationsList.reduce((sum, a) => sum + (a.memberCount ?? 0), 0);
  const collaborativeAssociations = associationsList.filter(
    (a) => a.sharedProjects.length > 0,
  ).length;
  const largeAssociations = associationsList.filter(
    (a) => a.memberCount && a.memberCount >= 100,
  ).length;

  if (loading) {
    return (
      <div className="flex-1 space-y-4 p-4 sm:space-y-6 sm:p-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600" />
            <p className="text-muted-foreground">Dernekler yükleniyor...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-4 sm:space-y-6 sm:p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-medium">Diğer Dernekler</h1>
          <p className="text-muted-foreground mt-1">Dernek ağı ve işbirliği ilişkileri</p>
        </div>
        <Button className="w-full gap-2 sm:w-auto">
          <Plus className="h-4 w-4" />
          Yeni Dernek Ekle
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Aktif Dernek</p>
                <p className="text-2xl font-medium text-green-600">{activeAssociations}</p>
              </div>
              <Building2 className="h-5 w-5 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Toplam Üye</p>
                <p className="text-2xl font-medium text-blue-600">
                  {totalMembers.toLocaleString()}
                </p>
              </div>
              <Users className="h-5 w-5 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">İşbirlikçi</p>
                <p className="text-2xl font-medium text-purple-600">{collaborativeAssociations}</p>
              </div>
              <Heart className="h-5 w-5 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Büyük Dernek</p>
                <p className="text-2xl font-medium text-orange-600">{largeAssociations}</p>
              </div>
              <Award className="h-5 w-5 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform" />
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
                <Building2 className="text-muted-foreground mb-4 h-12 w-12" />
                <h3 className="mb-2 text-lg font-medium">Dernek bulunamadı</h3>
                <p className="text-muted-foreground mb-4 text-center">
                  Arama kriterlerinize uygun dernek bulunmuyor.
                </p>
                <Button onClick={clearFilters}>Filtreleri Temizle</Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {filteredAssociations.map((association) => (
                <Card key={association.id} className="transition-shadow hover:shadow-md">
                  <CardHeader className="pb-3">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0 flex-1">
                        <CardTitle className="text-lg font-medium">{association.name}</CardTitle>
                        <p className="text-muted-foreground mt-1">
                          {association.location} • {association.position}:{' '}
                          {association.contactPerson}
                        </p>
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          {getStatusBadge(association.status)}
                          {getTypeBadge(association.type)}
                          {getFocusAreaBadge(association.focusArea)}
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3 fill-current text-yellow-500" />
                            <span className="text-muted-foreground text-xs">
                              {association.rating}
                            </span>
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
                              handleViewDetails(association);
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
                    <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="text-muted-foreground h-4 w-4" />
                        <span className="truncate">{association.phone}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="text-muted-foreground h-4 w-4" />
                        <span className="truncate">{association.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="text-muted-foreground h-4 w-4" />
                        <span className="truncate">
                          Kuruluş: {new Date(association.establishedDate).getFullYear()}
                        </span>
                      </div>
                    </div>

                    <div className="mb-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
                      {association.memberCount && (
                        <div className="rounded-lg bg-blue-50 p-3 text-center">
                          <div className="text-sm font-medium text-blue-800">
                            {association.memberCount}
                          </div>
                          <div className="text-xs text-blue-600">Üye Sayısı</div>
                        </div>
                      )}

                      {association.budget && (
                        <div className="rounded-lg bg-green-50 p-3 text-center">
                          <div className="text-sm font-medium text-green-800">
                            {formatCurrency(association.budget)}
                          </div>
                          <div className="text-xs text-green-600">Bütçe</div>
                        </div>
                      )}

                      <div className="rounded-lg bg-purple-50 p-3 text-center">
                        <div className="text-sm font-medium text-purple-800">
                          {association.sharedProjects.length}
                        </div>
                        <div className="text-xs text-purple-600">Ortak Proje</div>
                      </div>
                    </div>

                    {association.specialties.length > 0 && (
                      <div>
                        <p className="text-muted-foreground mb-2 text-sm">Uzmanlık Alanları:</p>
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
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              {selectedAssociation?.name}
            </DialogTitle>
          </DialogHeader>

          {selectedAssociation && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-3">
                  <div>
                    <label className="text-muted-foreground text-sm font-medium">
                      İletişim Kişisi
                    </label>
                    <p>{selectedAssociation.contactPerson}</p>
                    <p className="text-muted-foreground text-sm">{selectedAssociation.position}</p>
                  </div>
                  <div>
                    <label className="text-muted-foreground text-sm font-medium">Telefon</label>
                    <p>{selectedAssociation.phone}</p>
                  </div>
                  <div>
                    <label className="text-muted-foreground text-sm font-medium">E-posta</label>
                    <p>{selectedAssociation.email}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-muted-foreground text-sm font-medium">Adres</label>
                    <p>{selectedAssociation.address}</p>
                  </div>
                  {selectedAssociation.website && (
                    <div>
                      <label className="text-muted-foreground text-sm font-medium">Website</label>
                      <p>{selectedAssociation.website}</p>
                    </div>
                  )}
                  <div>
                    <label className="text-muted-foreground text-sm font-medium">
                      Kuruluş Tarihi
                    </label>
                    <p>
                      {new Date(selectedAssociation.establishedDate).toLocaleDateString('tr-TR')}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                {selectedAssociation.memberCount && (
                  <div className="rounded-lg bg-blue-50 p-4 text-center">
                    <div className="text-lg font-bold text-blue-800">
                      {selectedAssociation.memberCount}
                    </div>
                    <div className="text-sm text-blue-600">Üye Sayısı</div>
                  </div>
                )}
                {selectedAssociation.budget && (
                  <div className="rounded-lg bg-green-50 p-4 text-center">
                    <div className="text-lg font-bold text-green-800">
                      {formatCurrency(selectedAssociation.budget)}
                    </div>
                    <div className="text-sm text-green-600">Yıllık Bütçe</div>
                  </div>
                )}
                <div className="rounded-lg bg-purple-50 p-4 text-center">
                  <div className="text-lg font-bold text-purple-800">
                    {selectedAssociation.sharedProjects.length}
                  </div>
                  <div className="text-sm text-purple-600">Ortak Proje</div>
                </div>
              </div>

              {selectedAssociation.description && (
                <div>
                  <label className="text-muted-foreground text-sm font-medium">Açıklama</label>
                  <p className="mt-1">{selectedAssociation.description}</p>
                </div>
              )}

              <div>
                <label className="text-muted-foreground text-sm font-medium">
                  Uzmanlık Alanları
                </label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {selectedAssociation.specialties.map((specialty, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {specialty}
                    </Badge>
                  ))}
                </div>
              </div>

              {selectedAssociation.sharedProjects.length > 0 && (
                <div>
                  <label className="text-muted-foreground text-sm font-medium">
                    Ortak Projeler
                  </label>
                  <div className="mt-2 space-y-2">
                    {selectedAssociation.sharedProjects.map((project, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between rounded-lg bg-gray-50 p-3"
                      >
                        <div>
                          <p className="font-medium">{project.name}</p>
                          <p className="text-muted-foreground text-sm">{project.year}</p>
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