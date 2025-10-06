/**
 * @fileoverview CaseManagementPage Module - Application module
 * 
 * @author Dernek Yönetim Sistemi Team
 * @version 1.0.0
 */

import {
  Building2,
  Calendar,
  DollarSign,
  Eye,
  Heart,
  Mail,
  MapPin,
  Phone,
  Plus,
  Search,
  Star,
  TrendingUp,
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

interface DonorInstitution {
  id: number;
  name: string;
  type: 'kamu' | 'ozel' | 'vakif' | 'dernek' | 'uluslararasi';
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  status: 'aktif' | 'pasif' | 'beklemede';
  totalDonations: number;
  lastDonationDate: string;
  donationCount: number;
  averageDonation: number;
  preferredTypes: string[];
  rating: number;
  establishedDate?: string;
  website?: string;
  taxNumber?: string;
  description?: string;
  tags: string[];
}

// Real data will be fetched from API

/**
 * PartnerDonorsPage function
 * 
 * @param {Object} params - Function parameters
 * @returns {void} Nothing
 */
export default function PartnerDonorsPage() {
  const [donors, setDonors] = useState<DonorInstitution[]>([]);
  const [filteredDonors, setFilteredDonors] = useState<DonorInstitution[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedDonor, setSelectedDonor] = useState<DonorInstitution | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  // Filtering logic
  useEffect(() => {
    let filtered = donors;

    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (donor) =>
          donor.name.toLowerCase().includes(searchLower) ||
          donor.contactPerson.toLowerCase().includes(searchLower) ||
          donor.phone.includes(searchTerm) ||
          donor.email.toLowerCase().includes(searchLower) ||
          donor.tags.some((tag) => tag.toLowerCase().includes(searchLower)),
      );
    }

    // Type filter
    if (filterType !== 'all') {
      filtered = filtered.filter((donor) => donor.type === filterType);
    }

    // Status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter((donor) => donor.status === filterStatus);
    }

    // Tab filter
    if (activeTab === 'top') {
      filtered = filtered.filter((donor) => donor.rating >= 4);
    } else if (activeTab === 'active') {
      filtered = filtered.filter((donor) => donor.status === 'aktif');
    } else if (activeTab === 'large') {
      filtered = filtered.filter((donor) => donor.totalDonations >= 500000);
    }

    setFilteredDonors(filtered);
  }, [donors, searchTerm, filterType, filterStatus, activeTab]);

  const getStatusBadge = (status: DonorInstitution['status']) => {
    const config = {
      aktif: { label: 'Aktif', className: 'bg-green-50 text-green-700 border-green-200' },
      pasif: { label: 'Pasif', className: 'bg-gray-50 text-gray-700 border-gray-200' },
      beklemede: {
        label: 'Beklemede',
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

  const getTypeBadge = (type: DonorInstitution['type']) => {
    const config = {
      kamu: { label: 'Kamu', className: 'bg-blue-50 text-blue-700' },
      ozel: { label: 'Özel', className: 'bg-purple-50 text-purple-700' },
      vakif: { label: 'Vakıf', className: 'bg-green-50 text-green-700' },
      dernek: { label: 'Dernek', className: 'bg-orange-50 text-orange-700' },
      uluslararasi: { label: 'Uluslararası', className: 'bg-indigo-50 text-indigo-700' },
    };

    const { label, className } = config[type];
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

  const handleViewDetails = useCallback((donor: DonorInstitution) => {
    setSelectedDonor(donor);
    setIsDetailOpen(true);
  }, []);

  const clearFilters = useCallback(() => {
    setSearchTerm('');
    setFilterType('all');
    setFilterStatus('all');
    setActiveTab('all');
  }, []);

  const totalDonations = donors.reduce((sum, donor) => sum + donor.totalDonations, 0);
  const activeDonors = donors.filter((d) => d.status === 'aktif').length;
  const topDonors = donors.filter((d) => d.rating >= 4).length;

  return (
    <div className="flex-1 space-y-4 p-4 sm:space-y-6 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-medium">Bağışçı Kurumlar</h1>
          <p className="text-muted-foreground mt-1">Kurumsal bağışçı yönetimi ve ilişki takibi</p>
        </div>
        <Button className="gap-2 w-full sm:w-auto">
          <Plus className="w-4 h-4" />
          Yeni Bağışçı
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Toplam Bağış</p>
                <p className="text-xl font-medium text-green-600">
                  {formatCurrency(totalDonations)}
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
                <p className="text-sm text-muted-foreground">Aktif Bağışçı</p>
                <p className="text-2xl font-medium text-blue-600">{activeDonors}</p>
              </div>
              <Heart className="w-5 h-5 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Toplam Kurum</p>
                <p className="text-2xl font-medium">{donors.length}</p>
              </div>
              <Building2 className="w-5 h-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">En İyi</p>
                <p className="text-2xl font-medium text-orange-600">{topDonors}</p>
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
            placeholder="Bağışçı kurum ara..."
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
              <SelectItem value="vakif">Vakıf</SelectItem>
              <SelectItem value="dernek">Dernek</SelectItem>
              <SelectItem value="uluslararasi">Uluslararası</SelectItem>
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
              <SelectItem value="beklemede">Beklemede</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">Tümü</TabsTrigger>
          <TabsTrigger value="active">Aktif</TabsTrigger>
          <TabsTrigger value="large">Büyük Bağışçı</TabsTrigger>
          <TabsTrigger value="top">En İyi</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-4">
          {filteredDonors.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Heart className="w-12 h-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Bağışçı bulunamadı</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Arama kriterlerinize uygun bağışçı kurumu bulunmuyor.
                </p>
                <Button onClick={clearFilters}>Filtreleri Temizle</Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {filteredDonors.map((donor) => (
                <Card key={donor.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg font-medium">{donor.name}</CardTitle>
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                          {getStatusBadge(donor.status)}
                          {getTypeBadge(donor.type)}
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 text-yellow-500 fill-current" />
                            <span className="text-xs text-muted-foreground">{donor.rating}</span>
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
                              handleViewDetails(donor);
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
                        <span className="truncate">{donor.phone}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="w-4 h-4 text-muted-foreground" />
                        <span className="truncate">{donor.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <span className="truncate">{donor.address}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <div className="text-center p-3 bg-green-50 rounded-lg">
                        <div className="flex items-center justify-center mb-1">
                          <DollarSign className="w-4 h-4 text-green-600" />
                        </div>
                        <div className="text-sm font-medium text-green-800">
                          {formatCurrency(donor.totalDonations)}
                        </div>
                        <div className="text-xs text-green-600">Toplam Bağış</div>
                      </div>

                      <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <div className="flex items-center justify-center mb-1">
                          <TrendingUp className="w-4 h-4 text-blue-600" />
                        </div>
                        <div className="text-sm font-medium text-blue-800">
                          {donor.donationCount}
                        </div>
                        <div className="text-xs text-blue-600">Bağış Sayısı</div>
                      </div>

                      <div className="text-center p-3 bg-purple-50 rounded-lg">
                        <div className="flex items-center justify-center mb-1">
                          <Heart className="w-4 h-4 text-purple-600" />
                        </div>
                        <div className="text-sm font-medium text-purple-800">
                          {formatCurrency(donor.averageDonation)}
                        </div>
                        <div className="text-xs text-purple-600">Ortalama</div>
                      </div>

                      <div className="text-center p-3 bg-orange-50 rounded-lg">
                        <div className="flex items-center justify-center mb-1">
                          <Calendar className="w-4 h-4 text-orange-600" />
                        </div>
                        <div className="text-sm font-medium text-orange-800">
                          {new Date(donor.lastDonationDate).toLocaleDateString('tr-TR')}
                        </div>
                        <div className="text-xs text-orange-600">Son Bağış</div>
                      </div>
                    </div>

                    {donor.preferredTypes.length > 0 && (
                      <div className="mt-4">
                        <p className="text-sm text-muted-foreground mb-2">Tercih Edilen Alanlar:</p>
                        <div className="flex flex-wrap gap-1">
                          {donor.preferredTypes.map((type, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {type}
                            </Badge>
                          ))}
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

      {/* Donor Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Heart className="w-5 h-5" />
              {selectedDonor?.name}
            </DialogTitle>
          </DialogHeader>

          {selectedDonor && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      İletişim Kişisi
                    </label>
                    <p>{selectedDonor.contactPerson}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Telefon</label>
                    <p>{selectedDonor.phone}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">E-posta</label>
                    <p>{selectedDonor.email}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Adres</label>
                    <p>{selectedDonor.address}</p>
                  </div>
                  {selectedDonor.website && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Website</label>
                      <p>{selectedDonor.website}</p>
                    </div>
                  )}
                  {selectedDonor.taxNumber && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Vergi No</label>
                      <p>{selectedDonor.taxNumber}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-lg font-bold text-green-800">
                    {formatCurrency(selectedDonor.totalDonations)}
                  </div>
                  <div className="text-sm text-green-600">Toplam Bağış</div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-lg font-bold text-blue-800">
                    {selectedDonor.donationCount}
                  </div>
                  <div className="text-sm text-blue-600">Bağış Sayısı</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-lg font-bold text-purple-800">
                    {formatCurrency(selectedDonor.averageDonation)}
                  </div>
                  <div className="text-sm text-purple-600">Ortalama Bağış</div>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <div className="text-lg font-bold text-orange-800">{selectedDonor.rating}</div>
                  <div className="text-sm text-orange-600">Değerlendirme</div>
                </div>
              </div>

              {selectedDonor.description && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Açıklama</label>
                  <p className="mt-1">{selectedDonor.description}</p>
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                {selectedDonor.tags.map((tag, index) => (
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
