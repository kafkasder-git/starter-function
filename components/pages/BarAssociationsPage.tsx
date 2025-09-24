import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import {
  Building,
  Search,
  Eye,
  Phone,
  Mail,
  MapPin,
  Plus,
  Users,
  Calendar,
  Award,
  Globe,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';

interface BarAssociation {
  id: number;
  name: string;
  city: string;
  address: string;
  phone: string;
  email: string;
  website?: string;
  president: string;
  memberCount: number;
  establishedYear: number;
  status: 'aktif' | 'pasif';
  cooperationAgreement: boolean;
  lastContact?: string;
  notes?: string;
  services: string[];
}

const mockBarAssociations: BarAssociation[] = [
  {
    id: 1,
    name: 'Ankara Barosu',
    city: 'Ankara',
    address: 'Adliye Sarayı, Çankaya/Ankara',
    phone: '0312 417 20 00',
    email: 'info@ankarabarosu.org.tr',
    website: 'www.ankarabarosu.org.tr',
    president: 'Av. Polat Balkan',
    memberCount: 25000,
    establishedYear: 1925,
    status: 'aktif',
    cooperationAgreement: true,
    lastContact: '2024-01-15',
    services: ['Hukuki Danışmanlık', 'Avukat Ataması', 'Eğitim Seminerleri'],
    notes: 'Düzenli işbirliği yapılan baro. Sosyal yardım konularında destek sağlıyor.',
  },
  {
    id: 2,
    name: 'İstanbul Barosu',
    city: 'İstanbul',
    address: 'Sultanahmet, Fatih/İstanbul',
    phone: '0212 528 50 50',
    email: 'bilgi@istanbulbarosu.org.tr',
    website: 'www.istanbulbarosu.org.tr',
    president: 'Av. Duralay Kural',
    memberCount: 45000,
    establishedYear: 1912,
    status: 'aktif',
    cooperationAgreement: false,
    lastContact: '2023-12-20',
    services: ['Hukuki Danışmanlık', 'Adli Yardım'],
  },
  {
    id: 3,
    name: 'İzmir Barosu',
    city: 'İzmir',
    address: 'Konak, İzmir',
    phone: '0232 441 81 81',
    email: 'info@izmirbarosu.org.tr',
    website: 'www.izmirbarosu.org.tr',
    president: 'Av. Özkan Yücel',
    memberCount: 18000,
    establishedYear: 1926,
    status: 'aktif',
    cooperationAgreement: true,
    lastContact: '2024-01-10',
    services: ['Avukat Ataması', 'Hukuki Eğitim'],
    notes: 'Sosyal projeler konusunda işbirliği yapılmak isteniyor.',
  },
];

export default function BarAssociationsPage() {
  const [barAssociations, setBarAssociations] = useState<BarAssociation[]>(mockBarAssociations);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAssociation, setSelectedAssociation] = useState<BarAssociation | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  const filteredAssociations = barAssociations.filter((association) => {
    const matchesSearch =
      searchTerm === '' ||
      association.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      association.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      association.president.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesTab =
      activeTab === 'all' ||
      (activeTab === 'cooperation' && association.cooperationAgreement) ||
      (activeTab === 'active' && association.status === 'aktif');

    return matchesSearch && matchesTab;
  });

  const getStatusBadge = (status: BarAssociation['status']) => {
    const config = {
      aktif: { label: 'Aktif', className: 'bg-green-50 text-green-700 border-green-200' },
      pasif: { label: 'Pasif', className: 'bg-gray-50 text-gray-700 border-gray-200' },
    };

    const { label, className } = config[status];
    return (
      <Badge variant="outline" className={`${className} text-xs px-2 py-1`}>
        {label}
      </Badge>
    );
  };

  const activeAssociations = barAssociations.filter((a) => a.status === 'aktif').length;
  const cooperationCount = barAssociations.filter((a) => a.cooperationAgreement).length;
  const totalMembers = barAssociations.reduce((sum, a) => sum + a.memberCount, 0);

  return (
    <div className="flex-1 space-y-4 p-4 sm:space-y-6 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-medium">Barolar ile İlişkiler</h1>
          <p className="text-muted-foreground mt-1">Baro işbirlikleri ve iletişim yönetimi</p>
        </div>
        <Button className="gap-2 w-full sm:w-auto">
          <Plus className="w-4 h-4" />
          Yeni Baro Ekle
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Toplam Baro</p>
                <p className="text-2xl font-medium">{barAssociations.length}</p>
              </div>
              <Building className="w-5 h-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Aktif Baro</p>
                <p className="text-2xl font-medium text-green-600">{activeAssociations}</p>
              </div>
              <Building className="w-5 h-5 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">İşbirliği</p>
                <p className="text-2xl font-medium text-blue-600">{cooperationCount}</p>
              </div>
              <Award className="w-5 h-5 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Toplam Üye</p>
                <p className="text-xl font-medium text-purple-600">
                  {totalMembers.toLocaleString()}
                </p>
              </div>
              <Users className="w-5 h-5 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Baro ara..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
            }}
            className="pl-10"
          />
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all">Tümü</TabsTrigger>
          <TabsTrigger value="cooperation">İşbirliği</TabsTrigger>
          <TabsTrigger value="active">Aktif</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-4">
          <div className="grid gap-4">
            {filteredAssociations.map((association) => (
              <Card key={association.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg font-medium">{association.name}</CardTitle>
                      <p className="text-muted-foreground mt-1">Başkan: {association.president}</p>
                      <div className="flex flex-wrap items-center gap-2 mt-2">
                        {getStatusBadge(association.status)}
                        {association.cooperationAgreement && (
                          <Badge className="bg-blue-50 text-blue-700 text-xs px-2 py-1 border-0">
                            İşbirliği Anlaşması
                          </Badge>
                        )}
                        <Badge variant="outline" className="text-xs">
                          {association.memberCount.toLocaleString()} üye
                        </Badge>
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
                            setSelectedAssociation(association);
                            setIsDetailOpen(true);
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <span className="truncate">{association.city}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <span className="truncate">{association.phone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <span className="truncate">{association.email}</span>
                    </div>
                    {association.website && (
                      <div className="flex items-center gap-2 text-sm">
                        <Globe className="w-4 h-4 text-muted-foreground" />
                        <span className="truncate">{association.website}</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Hizmetler</label>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {association.services.map((service, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {service}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <div className="text-sm font-medium text-blue-800">
                          {association.memberCount.toLocaleString()}
                        </div>
                        <div className="text-xs text-blue-600">Üye Sayısı</div>
                      </div>

                      <div className="text-center p-3 bg-green-50 rounded-lg">
                        <div className="text-sm font-medium text-green-800">
                          {association.establishedYear}
                        </div>
                        <div className="text-xs text-green-600">Kuruluş Yılı</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Association Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building className="w-5 h-5" />
              {selectedAssociation?.name}
            </DialogTitle>
          </DialogHeader>

          {selectedAssociation && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Başkan</label>
                    <p>{selectedAssociation.president}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Şehir</label>
                    <p>{selectedAssociation.city}</p>
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
                      Kuruluş Yılı
                    </label>
                    <p>{selectedAssociation.establishedYear}</p>
                  </div>
                  {selectedAssociation.lastContact && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Son İletişim
                      </label>
                      <p>{new Date(selectedAssociation.lastContact).toLocaleDateString('tr-TR')}</p>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Hizmetler</label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {selectedAssociation.services.map((service, index) => (
                    <Badge key={index} variant="secondary">
                      {service}
                    </Badge>
                  ))}
                </div>
              </div>

              {selectedAssociation.notes && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Notlar</label>
                  <p className="mt-1 text-sm bg-gray-50 p-3 rounded-lg">
                    {selectedAssociation.notes}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-lg font-medium text-blue-800">
                    {selectedAssociation.memberCount.toLocaleString()}
                  </div>
                  <div className="text-sm text-blue-600">Üye Sayısı</div>
                </div>

                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-lg font-medium text-green-800">
                    {selectedAssociation.cooperationAgreement ? 'Var' : 'Yok'}
                  </div>
                  <div className="text-sm text-green-600">İşbirliği Anlaşması</div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
