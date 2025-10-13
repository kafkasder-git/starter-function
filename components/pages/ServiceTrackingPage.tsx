/**
 * @fileoverview ServiceTrackingPage Module - Application module
 *
 * @author Dernek Yönetim Sistemi Team
 * @version 1.0.0
 */

import { useState } from 'react';
import { PageLayout } from '@/components/layouts/PageLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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

// Service data - will be fetched from API in the future

const services: ServiceTracking[] = [];

/**
 * ServiceTrackingPage component
 */
export function ServiceTrackingPage() {
  const [servicesList] = useState<ServiceTracking[]>(services);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');

  const getStatusBadge = (status: ServiceTracking['status']) => {
    switch (status) {
      case 'requested':
        return <Badge className="bg-gray-100 text-gray-800">Talep Edildi</Badge>;
      case 'approved':
        return <Badge className="bg-blue-100 text-blue-800">Onaylandı</Badge>;
      case 'in_progress':
        return <Badge className="bg-yellow-100 text-yellow-800">Devam Ediyor</Badge>;
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Tamamlandı</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-800">İptal Edildi</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">Bilinmiyor</Badge>;
    }
  };

  const getPriorityBadge = (priority: ServiceTracking['priority']) => {
    switch (priority) {
      case 'low':
        return <Badge className="bg-gray-100 text-gray-800">Düşük</Badge>;
      case 'medium':
        return <Badge className="bg-blue-100 text-blue-800">Orta</Badge>;
      case 'high':
        return <Badge className="bg-orange-100 text-orange-800">Yüksek</Badge>;
      case 'urgent':
        return <Badge className="bg-red-100 text-red-800">Acil</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">Bilinmiyor</Badge>;
    }
  };

  const getServiceTypeIcon = (serviceType: string) => {
    switch (serviceType) {
      case 'Ev Onarımı':
        return <Home className="h-4 w-4 text-blue-600" />;
      case 'Ulaşım Hizmeti':
        return <Car className="h-4 w-4 text-green-600" />;
      case 'Danışmanlık':
        return <Briefcase className="h-4 w-4 text-purple-600" />;
      case 'Eğitim Desteği':
        return <GraduationCap className="h-4 w-4 text-orange-600" />;
      case 'Temizlik Hizmeti':
        return <Wrench className="h-4 w-4 text-teal-600" />;
      default:
        return <Settings className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusIcon = (status: ServiceTracking['status']) => {
    switch (status) {
      case 'requested':
        return <Clock className="h-4 w-4 text-gray-600" />;
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-blue-600" />;
      case 'in_progress':
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'cancelled':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const filteredServices = servicesList.filter((service) => {
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
    total: servicesList.length,
    requested: servicesList.filter((s) => s.status === 'requested').length,
    inProgress: servicesList.filter((s) => s.status === 'in_progress').length,
    completed: servicesList.filter((s) => s.status === 'completed').length,
    totalCost: servicesList
      .filter((s) => s.actualCost ?? s.estimatedCost)
      .reduce((sum, s) => sum + (s.actualCost ?? s.estimatedCost), 0),
  };

  return (
    <PageLayout
      title="Hizmet Takip İşlemleri"
      subtitle="İhtiyaç sahiplerine dernek olarak sağlanan hizmetleri takip edin ve yönetin"
      actions={
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Hizmet Raporu
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            İhtiyaç Sahibi İçin Yeni Hizmet
          </Button>
        </div>
      }
    >
      <div className="space-y-6 p-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-blue-100 p-2">
                  <Settings className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">Toplam Hizmet</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-yellow-100 p-2">
                  <AlertCircle className="h-5 w-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">Devam Eden</p>
                  <p className="text-2xl font-bold">{stats.inProgress}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-green-100 p-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">Tamamlanan</p>
                  <p className="text-2xl font-bold">{stats.completed}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-purple-100 p-2">
                  <FileText className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">Toplam Maliyet</p>
                  <p className="text-2xl font-bold">₺{stats.totalCost.toLocaleString('tr-TR')}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col gap-4 md:flex-row">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
                  <Input
                    placeholder="İhtiyaç sahibinin adı, TC kimlik, hizmet no veya açıklama ile ara..."
                    value={searchTerm}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
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
              <Settings className="h-5 w-5 text-blue-600" />
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
                          <FileText className="h-4 w-4 text-gray-400" />
                          <span className="font-mono text-sm">{service.serviceNumber}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{service.recipientName}</p>
                          <p className="text-muted-foreground text-sm">{service.recipientId}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getServiceTypeIcon(service.serviceType)}
                          <div>
                            <p className="text-sm font-medium">{service.serviceType}</p>
                            <p className="text-muted-foreground text-xs">
                              {service.serviceCategory}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="text-sm">{service.description}</p>
                          {service.notes && (
                            <p className="text-muted-foreground mt-1 text-xs">{service.notes}</p>
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
                            <p className="text-muted-foreground text-xs">
                              {service.serviceProvider}
                            </p>
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-sm">Atanmamış</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">
                            ₺{(service.actualCost ?? service.estimatedCost).toLocaleString('tr-TR')}
                          </p>
                          <p className="text-muted-foreground text-xs">
                            {service.actualCost ? 'Gerçek' : 'Tahmini'}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <FileText className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Calendar className="h-4 w-4" />
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
