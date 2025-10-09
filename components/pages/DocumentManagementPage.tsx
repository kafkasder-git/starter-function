/**
 * @fileoverview DocumentManagementPage Module - Application module
 *
 * @author Dernek Yönetim Sistemi Team
 * @version 1.0.0
 */

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
import { partnersService, type SponsorOrganization as ServiceSponsorOrganization } from '../../services/partnersService';
import { logger } from '../../lib/logging/logger';
import { LoadingSpinner } from '../LoadingSpinner';
import { toast } from 'sonner';
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

// Use ServiceSponsorOrganization type from the service
type SponsorOrganization = ServiceSponsorOrganization;

/**
 * PartnerSponsorsPage function
 *
 * @param {Object} params - Function parameters
 * @returns {void} Nothing
 */
export default function PartnerSponsorsPage() {
  const [sponsors, setSponsors] = useState<SponsorOrganization[]>([]);
  const [loading, setLoading] = useState(true);
  const [, setTotalCount] = useState(0);
  const [currentPage] = useState(1);
  const pageSize = 10;
  
  const [filteredSponsors, setFilteredSponsors] = useState<SponsorOrganization[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterSponsorshipType, setFilterSponsorshipType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedSponsor, setSelectedSponsor] = useState<SponsorOrganization | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  const loadSponsors = useCallback(async () => {
    setLoading(true);
    try {
      const result = await partnersService.getSponsors(currentPage, pageSize);
      if (result.error) {
        toast.error(result.error);
        logger.error('Error loading sponsors', result.error);
      } else if (result.data) {
        setSponsors(result.data);
        setTotalCount(result.count || 0);
      }
    } catch (error) {
      toast.error('Sponsorlar yüklenirken beklenmeyen bir hata oluştu');
      logger.error('Unexpected error loading sponsors', error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize]);

  useEffect(() => {
    loadSponsors();
  }, [loadSponsors]);

  useEffect(() => {
    loadSponsors();
  }, [currentPage, loadSponsors]);

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

    // Sponsorship type filter - removed since field doesn't exist in service
    // TODO: Add sponsorship type field to partners table if needed

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
      // TODO: Add sponsorship type field to partners table for proper filtering
      // For now, filter by contract duration
      filtered = filtered.filter(
        (sponsor) => sponsor.contractStart && sponsor.contractEnd,
      );
    }

    setFilteredSponsors(filtered);
  }, [sponsors, searchTerm, filterType, filterSponsorshipType, filterStatus, activeTab]);

  const getStatusBadge = (status: SponsorOrganization['status']) => {
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
      case 'müzakere':
        label = 'Müzakere';
        className = 'bg-yellow-50 text-yellow-700 border-yellow-200';
        break;
      default:
        label = 'Bilinmeyen';
        className = 'bg-gray-50 text-gray-700 border-gray-200';
    }

    return (
      <Badge variant="outline" className={`${className} px-2 py-1 text-xs`}>
        {label}
      </Badge>
    );
  };

  const getTypeBadge = (type: SponsorOrganization['type']) => {
    let label: string;
    let className: string;

    switch (type) {
      case 'kurumsal':
        label = 'Kurumsal';
        className = 'bg-blue-50 text-blue-700';
        break;
      case 'bireysel':
        label = 'Bireysel';
        className = 'bg-green-50 text-green-700';
        break;
      case 'vakif':
        label = 'Vakıf';
        className = 'bg-purple-50 text-purple-700';
        break;
      case 'kamu':
        label = 'Kamu';
        className = 'bg-orange-50 text-orange-700';
        break;
      case 'uluslararasi':
        label = 'Uluslararası';
        className = 'bg-indigo-50 text-indigo-700';
        break;
      default:
        label = 'Bilinmeyen';
        className = 'bg-gray-50 text-gray-700';
    }

    return <Badge className={`${className} border-0 px-2 py-1 text-xs`}>{label}</Badge>;
  };

  // Removed getSponsorshipTypeBadge since sponsorshipType field doesn't exist in service
  // TODO: Add sponsorship type field to partners table if needed

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
  const activeSponsors = sponsors.filter((s) => s.status === 'Aktif').length;
  const majorSponsors = sponsors.filter((s) => s.totalSponsorship >= 300000).length;
  const totalProjects = sponsors.reduce((sum, sponsor) => sum + sponsor.currentProjects, 0);

  if (loading && sponsors.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <div className="flex-1 space-y-4 p-4 sm:space-y-6 sm:p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-medium">Sponsor Kuruluşlar</h1>
          <p className="text-muted-foreground mt-1">
            Sponsorluk ilişkileri ve proje destekleri yönetimi
          </p>
        </div>
        <Button className="w-full gap-2 sm:w-auto">
          <Plus className="h-4 w-4" />
          Yeni Sponsor
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Toplam Sponsorluk</p>
                <p className="text-xl font-medium text-green-600">
                  {formatCurrency(totalSponsorship)}
                </p>
              </div>
              <DollarSign className="h-5 w-5 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Aktif Sponsor</p>
                <p className="text-2xl font-medium text-blue-600">{activeSponsors}</p>
              </div>
              <Award className="h-5 w-5 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Büyük Sponsor</p>
                <p className="text-2xl font-medium text-purple-600">{majorSponsors}</p>
              </div>
              <Star className="h-5 w-5 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Aktif Proje</p>
                <p className="text-2xl font-medium text-orange-600">{totalProjects}</p>
              </div>
              <Target className="h-5 w-5 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform" />
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
                <Award className="text-muted-foreground mb-4 h-12 w-12" />
                <h3 className="mb-2 text-lg font-medium">Sponsor bulunamadı</h3>
                <p className="text-muted-foreground mb-4 text-center">
                  Arama kriterlerinize uygun sponsor kuruluş bulunmuyor.
                </p>
                <Button onClick={clearFilters}>Filtreleri Temizle</Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {filteredSponsors.map((sponsor) => (
                <Card key={sponsor.id} className="transition-shadow hover:shadow-md">
                  <CardHeader className="pb-3">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0 flex-1">
                        <CardTitle className="text-lg font-medium">{sponsor.name}</CardTitle>
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          {getStatusBadge(sponsor.status)}
                          {getTypeBadge(sponsor.type)}
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3 fill-current text-yellow-500" />
                            <span className="text-muted-foreground text-xs">{sponsor.rating}</span>
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
                              handleViewDetails(sponsor);
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
                        <span className="truncate">{sponsor.phone}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="text-muted-foreground h-4 w-4" />
                        <span className="truncate">{sponsor.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="text-muted-foreground h-4 w-4" />
                        <span className="truncate">{sponsor.address}</span>
                      </div>
                    </div>

                    <div className="mb-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
                      <div className="rounded-lg bg-green-50 p-3 text-center">
                        <div className="text-sm font-medium text-green-800">
                          {formatCurrency(sponsor.totalSponsorship)}
                        </div>
                        <div className="text-xs text-green-600">Toplam Sponsorluk</div>
                      </div>

                      <div className="rounded-lg bg-blue-50 p-3 text-center">
                        <div className="text-sm font-medium text-blue-800">
                          {sponsor.currentProjects}
                        </div>
                        <div className="text-xs text-blue-600">Aktif Proje</div>
                      </div>

                      <div className="rounded-lg bg-purple-50 p-3 text-center">
                        <div className="text-sm font-medium text-purple-800">
                          {sponsor.completedProjects}
                        </div>
                        <div className="text-xs text-purple-600">Tamamlanan</div>
                      </div>

                      <div className="rounded-lg bg-orange-50 p-3 text-center">
                        <div className="text-sm font-medium text-orange-800">
                          {new Date(sponsor.lastSponsorshipDate).toLocaleDateString('tr-TR')}
                        </div>
                        <div className="text-xs text-orange-600">Son Sponsorluk</div>
                      </div>
                    </div>

                    {sponsor.contractStart && sponsor.contractEnd && (
                      <div className="mb-4">
                        <div className="mb-2 flex justify-between text-sm">
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
                        <p className="text-muted-foreground mb-2 text-sm">Sponsorluk Alanları:</p>
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
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              {selectedSponsor?.name}
            </DialogTitle>
          </DialogHeader>

          {selectedSponsor && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-3">
                  <div>
                    <label className="text-muted-foreground text-sm font-medium">
                      İletişim Kişisi
                    </label>
                    <p>{selectedSponsor.contactPerson}</p>
                  </div>
                  <div>
                    <label className="text-muted-foreground text-sm font-medium">Telefon</label>
                    <p>{selectedSponsor.phone}</p>
                  </div>
                  <div>
                    <label className="text-muted-foreground text-sm font-medium">E-posta</label>
                    <p>{selectedSponsor.email}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-muted-foreground text-sm font-medium">Adres</label>
                    <p>{selectedSponsor.address}</p>
                  </div>
                  {selectedSponsor.website && (
                    <div>
                      <label className="text-muted-foreground text-sm font-medium">Website</label>
                      <p>{selectedSponsor.website}</p>
                    </div>
                  )}
                  {selectedSponsor.taxNumber && (
                    <div>
                      <label className="text-muted-foreground text-sm font-medium">Vergi No</label>
                      <p>{selectedSponsor.taxNumber}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <div className="rounded-lg bg-green-50 p-4 text-center">
                  <div className="text-lg font-bold text-green-800">
                    {formatCurrency(selectedSponsor.totalSponsorship)}
                  </div>
                  <div className="text-sm text-green-600">Toplam Sponsorluk</div>
                </div>
                <div className="rounded-lg bg-blue-50 p-4 text-center">
                  <div className="text-lg font-bold text-blue-800">
                    {selectedSponsor.currentProjects}
                  </div>
                  <div className="text-sm text-blue-600">Aktif Proje</div>
                </div>
                <div className="rounded-lg bg-purple-50 p-4 text-center">
                  <div className="text-lg font-bold text-purple-800">
                    {selectedSponsor.completedProjects}
                  </div>
                  <div className="text-sm text-purple-600">Tamamlanan</div>
                </div>
                <div className="rounded-lg bg-orange-50 p-4 text-center">
                  <div className="text-lg font-bold text-orange-800">{selectedSponsor.rating}</div>
                  <div className="text-sm text-orange-600">Değerlendirme</div>
                </div>
              </div>

              {selectedSponsor.description && (
                <div>
                  <label className="text-muted-foreground text-sm font-medium">Açıklama</label>
                  <p className="mt-1">{selectedSponsor.description}</p>
                </div>
              )}

              <div>
                <label className="text-muted-foreground text-sm font-medium">
                  Sponsorluk Alanları
                </label>
                <div className="mt-2 flex flex-wrap gap-2">
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
