/**
 * @fileoverview PartnersPage Module - Partnerler sayfası
 *
 * @author Dernek Yönetim Sistemi Team
 * @version 1.0.0
 */

import { Building2, Globe, Mail, Phone, Plus, Search, Users } from 'lucide-react';
import { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

interface Partner {
  id: string;
  name: string;
  type: 'donor' | 'government' | 'supplier' | 'sponsor' | 'association';
  contactPerson: string;
  email: string;
  phone: string;
  website: string;
  address: string;
  status: 'active' | 'inactive' | 'pending';
  partnershipDate: string;
  description: string;
}

export function PartnersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const [partners] = useState<Partner[]>([
    {
      id: '1',
      name: 'ABC Bağış Kurumu',
      type: 'donor',
      contactPerson: 'Ahmet Yılmaz',
      email: 'ahmet@abc.org',
      phone: '+90 212 555 0101',
      website: 'www.abc.org',
      address: 'İstanbul, Türkiye',
      status: 'active',
      partnershipDate: '2023-01-15',
      description: 'Yıllık bağış desteği sağlayan kurum',
    },
    {
      id: '2',
      name: 'Devlet Sosyal Yardım Kurumu',
      type: 'government',
      contactPerson: 'Fatma Demir',
      email: 'fatma@devlet.gov.tr',
      phone: '+90 312 555 0202',
      website: 'www.sosyalyardim.gov.tr',
      address: 'Ankara, Türkiye',
      status: 'active',
      partnershipDate: '2022-06-01',
      description: 'Resmi sosyal yardım programları',
    },
    {
      id: '3',
      name: 'XYZ Gıda Tedarikçisi',
      type: 'supplier',
      contactPerson: 'Mehmet Kaya',
      email: 'mehmet@xyz.com',
      phone: '+90 216 555 0303',
      website: 'www.xyz.com',
      address: 'İzmir, Türkiye',
      status: 'active',
      partnershipDate: '2023-03-10',
      description: 'Gıda ürünleri tedarikçisi',
    },
    {
      id: '4',
      name: 'Sponsor Şirket A.Ş.',
      type: 'sponsor',
      contactPerson: 'Ayşe Özkan',
      email: 'ayse@sponsor.com',
      phone: '+90 232 555 0404',
      website: 'www.sponsor.com',
      address: 'Bursa, Türkiye',
      status: 'pending',
      partnershipDate: '2024-01-01',
      description: 'Etkinlik sponsorluğu',
    },
    {
      id: '5',
      name: 'Diğer Dernek Federasyonu',
      type: 'association',
      contactPerson: 'Ali Çelik',
      email: 'ali@dernekfed.org',
      phone: '+90 242 555 0505',
      website: 'www.dernekfed.org',
      address: 'Antalya, Türkiye',
      status: 'active',
      partnershipDate: '2022-09-15',
      description: 'Dernekler arası iş birliği',
    },
  ]);

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'donor':
        return 'Bağışçı Kurum';
      case 'government':
        return 'Devlet Kurumu';
      case 'supplier':
        return 'Tedarikçi';
      case 'sponsor':
        return 'Sponsor Kuruluş';
      case 'association':
        return 'Diğer Dernek';
      default:
        return 'Bilinmeyen';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'donor':
        return 'bg-blue-100 text-blue-800';
      case 'government':
        return 'bg-green-100 text-green-800';
      case 'supplier':
        return 'bg-orange-100 text-orange-800';
      case 'sponsor':
        return 'bg-purple-100 text-purple-800';
      case 'association':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredPartners = partners.filter(partner => {
    const matchesSearch = partner.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         partner.contactPerson.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         partner.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'all' || partner.type === typeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Partnerler</h1>
          <p className="text-gray-600">İş ortaklarınızı yönetin ve takip edin</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Yeni Partner
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Building2 className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Toplam Partner</p>
                <p className="text-xl font-bold">{partners.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Building2 className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Bağışçı Kurumlar</p>
                <p className="text-xl font-bold">{partners.filter(p => p.type === 'donor').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Building2 className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Devlet Kurumları</p>
                <p className="text-xl font-bold">{partners.filter(p => p.type === 'government').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Building2 className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Tedarikçiler</p>
                <p className="text-xl font-bold">{partners.filter(p => p.type === 'supplier').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Building2 className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Sponsor Kuruluşlar</p>
                <p className="text-xl font-bold">{partners.filter(p => p.type === 'sponsor').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Partner ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Tür seçin" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Türler</SelectItem>
                <SelectItem value="donor">Bağışçı Kurumlar</SelectItem>
                <SelectItem value="government">Devlet Kurumları</SelectItem>
                <SelectItem value="supplier">Tedarikçiler</SelectItem>
                <SelectItem value="sponsor">Sponsor Kuruluşlar</SelectItem>
                <SelectItem value="association">Diğer Dernekler</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Partners List */}
      <Card>
        <CardHeader>
          <CardTitle>Partner Listesi ({filteredPartners.length} partner)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {filteredPartners.map((partner) => (
            <div key={partner.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-lg">{partner.name}</h3>
                    <Badge className={getTypeColor(partner.type)}>
                      {getTypeLabel(partner.type)}
                    </Badge>
                    <Badge className={getStatusColor(partner.status)}>
                      {partner.status === 'active' ? 'Aktif' : 
                       partner.status === 'inactive' ? 'Pasif' : 'Beklemede'}
                    </Badge>
                  </div>
                  <p className="text-gray-600 mb-3">{partner.description}</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-gray-500" />
                        <span className="font-medium">İletişim:</span>
                        <span>{partner.contactPerson}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-gray-500" />
                        <span>{partner.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-gray-500" />
                        <span>{partner.phone}</span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4 text-gray-500" />
                        <span>{partner.website}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-gray-500" />
                        <span>{partner.address}</span>
                      </div>
                      <div className="text-gray-500">
                        Ortaklık: {partner.partnershipDate}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    Düzenle
                  </Button>
                  <Button size="sm">
                    Detaylar
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

export default PartnersPage;
