import { useState } from 'react';
import { PageLayout } from '../PageLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import {
  Settings,
  Search,
  Plus,
  Eye,
  FileText,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  Wrench,
  Home,
  Car,
  Briefcase,
  GraduationCap,
  Download,
} from 'lucide-react';

interface ServiceTracking {
  id: number;
  serviceNumber: string;
  recipientName: string;
  recipientId: string;
  serviceType: string;
  serviceCategory: string;
  description: string;
  requestDate: string;
  scheduledDate?: string;
  completedDate?: string;
  status: 'requested' | 'approved' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignedTo?: string;
  serviceProvider?: string;
  estimatedCost: number;
  actualCost?: number;
  notes?: string;
  location: string;
}

const mockServices: ServiceTracking[] = [
  {
    id: 1,
    serviceNumber: 'HZT-2024-001',
    recipientName: 'Ayşe Yılmaz',
    recipientId: '12345678901',
    serviceType: 'Ev Onarımı',
    serviceCategory: 'Teknik Hizmet',
    description: 'Mutfak musluk tamiri ve boya işi',
    requestDate: '2024-01-15',
    scheduledDate: '2024-01-20',
    status: 'approved',
    priority: 'medium',
    assignedTo: 'Mehmet Usta',
    serviceProvider: 'Teknik Ekip',
    estimatedCost: 800,
    location: 'Atatürk Mah. Cumhuriyet Cad. No:45 Şişli/İSTANBUL',
    notes: 'Sabah saatlerinde müsait',
  },
  {
    id: 2,
    serviceNumber: 'HZT-2024-002',
    recipientName: 'Mehmet Demir',
    recipientId: '98765432109',
    serviceType: 'Ulaşım Hizmeti',
    serviceCategory: 'Sosyal Hizmet',
    description: 'Hastane randevusu için ulaşım desteği',
    requestDate: '2024-01-14',
    scheduledDate: '2024-01-16',
    completedDate: '2024-01-16',
    status: 'completed',
    priority: 'high',
    assignedTo: 'Ali Şoför',
    serviceProvider: 'Gönüllü Ekip',
    estimatedCost: 150,
    actualCost: 150,
    location: 'Fatih Mah. İstiklal Sok. No:12 Fatih/İSTANBUL',
    notes: 'Gidiş-dönüş sağlandı',
  },
  {
    id: 3,
    serviceNumber: 'HZT-2024-003',
    recipientName: 'Fatma Kaya',
    recipientId: '11223344556',
    serviceType: 'Danışmanlık',
    serviceCategory: 'Hukuki Destek',
    description: 'Miras hukuku konusunda danışmanlık',
    requestDate: '2024-01-13',
    scheduledDate: '2024-01-18',
    status: 'in_progress',
    priority: 'medium',
    assignedTo: 'Av. Zeynep Hukuk',
    serviceProvider: 'Hukuk Ofisi',
    estimatedCost: 500,
    location: 'Beşiktaş Mah. Spor Cad. No:78 Beşiktaş/İSTANBUL',
    notes: 'Evrak eksiklikleri tamamlanacak',
  },
  {
    id: 4,
    serviceNumber: 'HZT-2024-004',
    recipientName: 'Ali Özkan',
    recipientId: '55667788990',
    serviceType: 'Eğitim Desteği',
    serviceCategory: 'Eğitim Hizmeti',
    description: 'Üniversite hazırlık kursu kaydı',
    requestDate: '2024-01-12',
    status: 'requested',
    priority: 'low',
    estimatedCost: 1200,
    location: 'Kadıköy Mah. Bağdat Cad. No:234 Kadıköy/İSTANBUL',
    notes: 'Burs imkanları araştırılacak',
  },
  {
    id: 5,
    serviceNumber: 'HZT-2024-005',
    recipientName: 'Zeynep Arslan',
    recipientId: '99887766554',
    serviceType: 'Temizlik Hizmeti',
    serviceCategory: 'Ev Hizmeti',
    description: 'Yaşlı bakımı ve ev temizliği hizmeti',
    requestDate: '2024-01-11',
    scheduledDate: '2024-01-17',
    status: 'approved',
    priority: 'high',
    assignedTo: 'Hatice Temizlik',
    serviceProvider: 'Temizlik Ekibi',
    estimatedCost: 600,
    location: 'Üsküdar Mah. Çamlıca Yolu No:56 Üsküdar/İSTANBUL',
    notes: 'Haftada 2 gün hizmet verilecek',
  },
];

export function ServiceTrackingPage() {
  const [services, setServices] = useState<ServiceTracking[]>(mockServices);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');

  const getStatusBadge = (status: ServiceTracking['status']) => {
    const statusConfig = {
      requested: { label: 'Talep Edildi', color: 'bg-gray-100 text-gray-800' },
      approved: { label: 'Onaylandı', color: 'bg-blue-100 text-blue-800' },
      in_progress: { label: 'Devam Ediyor', color: 'bg-yellow-100 text-yellow-800' },
      completed: { label: 'Tamamlandı', color: 'bg-green-100 text-green-800' },
      cancelled: { label: 'İptal Edildi', color: 'bg-red-100 text-red-800' },
    };

    const config = statusConfig[status];
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  const getPriorityBadge = (priority: ServiceTracking['priority']) => {
    const priorityConfig = {
      low: { label: 'Düşük', color: 'bg-gray-100 text-gray-800' },
      medium: { label: 'Orta', color: 'bg-blue-100 text-blue-800' },
      high: { label: 'Yüksek', color: 'bg-orange-100 text-orange-800' },
      urgent: { label: 'Acil', color: 'bg-red-100 text-red-800' },
    };

    const config = priorityConfig[priority];
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  const getServiceTypeIcon = (serviceType: string) => {
    const icons = {
      'Ev Onarımı': <Home className="w-4 h-4 text-blue-600" />,
      'Ulaşım Hizmeti': <Car className="w-4 h-4 text-green-600" />,
      Danışmanlık: <Briefcase className="w-4 h-4 text-purple-600" />,
      'Eğitim Desteği': <GraduationCap className="w-4 h-4 text-orange-600" />,
      'Temizlik Hizmeti': <Wrench className="w-4 h-4 text-teal-600" />,
    };
    return (
      icons[serviceType as keyof typeof icons] || <Settings className="w-4 h-4 text-gray-600" />
    );
  };

  const getStatusIcon = (status: ServiceTracking['status']) => {
    const icons = {
      requested: <Clock className="w-4 h-4 text-gray-600" />,
      approved: <CheckCircle className="w-4 h-4 text-blue-600" />,
      in_progress: <AlertCircle className="w-4 h-4 text-yellow-600" />,
      completed: <CheckCircle className="w-4 h-4 text-green-600" />,
      cancelled: <AlertCircle className="w-4 h-4 text-red-600" />,
    };
    return icons[status];
  };

  const filteredServices = services.filter((service) => {
    const matchesSearch =
      service.recipientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.recipientId.includes(searchTerm) ||
      service.serviceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || service.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || service.serviceCategory === categoryFilter;
    const matchesPriority = priorityFilter === 'all' || service.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesCategory && matchesPriority;
  });

  const stats = {
    total: services.length,
    requested: services.filter((s) => s.status === 'requested').length,
    inProgress: services.filter((s) => s.status === 'in_progress').length,
    completed: services.filter((s) => s.status === 'completed').length,
    totalCost: services
      .filter((s) => s.actualCost || s.estimatedCost)
      .reduce((sum, s) => sum + (s.actualCost || s.estimatedCost), 0),
  };

  return (
    <PageLayout
      title="Hizmet Takip İşlemleri"
      subtitle="İhtiyaç sahiplerine dernek olarak sağlanan hizmetleri takip edin ve yönetin"
      actions={
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Hizmet Raporu
          </Button>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            İhtiyaç Sahibi İçin Yeni Hizmet
          </Button>
        </div>
      }
    >
      <div className="p-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Settings className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Toplam Hizmet</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Devam Eden</p>
                  <p className="text-2xl font-bold">{stats.inProgress}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Tamamlanan</p>
                  <p className="text-2xl font-bold">{stats.completed}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <FileText className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Toplam Maliyet</p>
                  <p className="text-2xl font-bold">₺{stats.totalCost.toLocaleString('tr-TR')}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="İhtiyaç sahibinin adı, TC kimlik, hizmet no veya açıklama ile ara..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                    }}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Durum" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tüm Durumlar</SelectItem>
                    <SelectItem value="requested">Talep Edildi</SelectItem>
                    <SelectItem value="approved">Onaylandı</SelectItem>
                    <SelectItem value="in_progress">Devam Ediyor</SelectItem>
                    <SelectItem value="completed">Tamamlandı</SelectItem>
                    <SelectItem value="cancelled">İptal Edildi</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Kategori" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tüm Kategoriler</SelectItem>
                    <SelectItem value="Teknik Hizmet">Teknik Hizmet</SelectItem>
                    <SelectItem value="Sosyal Hizmet">Sosyal Hizmet</SelectItem>
                    <SelectItem value="Hukuki Destek">Hukuki Destek</SelectItem>
                    <SelectItem value="Eğitim Hizmeti">Eğitim Hizmeti</SelectItem>
                    <SelectItem value="Ev Hizmeti">Ev Hizmeti</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Öncelik" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tüm Öncelikler</SelectItem>
                    <SelectItem value="urgent">Acil</SelectItem>
                    <SelectItem value="high">Yüksek</SelectItem>
                    <SelectItem value="medium">Orta</SelectItem>
                    <SelectItem value="low">Düşük</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Services Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-blue-600" />
              Hizmet Takip Listesi ({filteredServices.length} hizmet)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Hizmet No</TableHead>
                    <TableHead>İhtiyaç Sahibi</TableHead>
                    <TableHead>Hizmet Türü</TableHead>
                    <TableHead>Açıklama</TableHead>
                    <TableHead>Öncelik</TableHead>
                    <TableHead>Durum</TableHead>
                    <TableHead>Sorumlu</TableHead>
                    <TableHead>Maliyet</TableHead>
                    <TableHead>İşlemler</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredServices.map((service) => (
                    <TableRow key={service.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-gray-400" />
                          <span className="font-mono text-sm">{service.serviceNumber}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{service.recipientName}</p>
                          <p className="text-sm text-muted-foreground">{service.recipientId}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getServiceTypeIcon(service.serviceType)}
                          <div>
                            <p className="font-medium text-sm">{service.serviceType}</p>
                            <p className="text-xs text-muted-foreground">
                              {service.serviceCategory}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="text-sm">{service.description}</p>
                          {service.notes && (
                            <p className="text-xs text-muted-foreground mt-1">{service.notes}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{getPriorityBadge(service.priority)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(service.status)}
                          {getStatusBadge(service.status)}
                        </div>
                      </TableCell>
                      <TableCell>
                        {service.assignedTo ? (
                          <div>
                            <p className="text-sm font-medium">{service.assignedTo}</p>
                            <p className="text-xs text-muted-foreground">
                              {service.serviceProvider}
                            </p>
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">Atanmamış</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">
                            ₺{(service.actualCost || service.estimatedCost).toLocaleString('tr-TR')}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {service.actualCost ? 'Gerçek' : 'Tahmini'}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <FileText className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Calendar className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
}
