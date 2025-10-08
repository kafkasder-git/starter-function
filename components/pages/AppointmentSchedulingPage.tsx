/**
 * @fileoverview AppointmentSchedulingPage Module - Application module
 *
 * @author Dernek Yönetim Sistemi Team
 * @version 1.0.0
 */

import {
  AlertCircle,
  Calendar,
  CalendarDays,
  CheckCircle,
  Clock,
  Eye,
  MapPin,
  Phone,
  Plus,
  Search,
  User,
} from 'lucide-react';
import React, { useCallback, useState } from 'react';
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

interface Appointment {
  id: number;
  beneficiaryName: string;
  beneficiaryPhone: string;
  beneficiaryEmail?: string;
  appointmentType: 'görüşme' | 'belge-teslim' | 'değerlendirme' | 'takip' | 'danışmanlık';
  date: string;
  time: string;
  duration: number; // in minutes
  status: 'beklemede' | 'onaylandı' | 'tamamlandı' | 'iptal' | 'ertelendi';
  assignedStaff: string;
  location: string;
  notes?: string;
  priority: 'düşük' | 'normal' | 'yüksek' | 'acil';
  reminderSent: boolean;
  createdAt: string;
}

const appointments: Appointment[] = [];

/**
 * AppointmentSchedulingPage function
 *
 * @param {Object} params - Function parameters
 * @returns {void} Nothing
 */
export function AppointmentSchedulingPage() {
  const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>(appointments);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterDate, setFilterDate] = useState<string>('all');
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('today');

  // Filter appointments based on search and filters
  React.useEffect(() => {
    let filtered = appointments;

    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (appointment) =>
          appointment.beneficiaryName.toLowerCase().includes(searchLower) ||
          appointment.beneficiaryPhone.includes(searchTerm) ||
          appointment.assignedStaff.toLowerCase().includes(searchLower) ||
          appointment.location.toLowerCase().includes(searchLower),
      );
    }

    // Status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter((appointment) => appointment.status === filterStatus);
    }

    // Type filter
    if (filterType !== 'all') {
      filtered = filtered.filter((appointment) => appointment.appointmentType === filterType);
    }

    // Date filter
    if (filterDate !== 'all') {
      const today = new Date().toISOString().split('T')[0];
      const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      switch (filterDate) {
        case 'today':
          filtered = filtered.filter((appointment) => appointment.date === today);
          break;
        case 'tomorrow':
          filtered = filtered.filter((appointment) => appointment.date === tomorrow);
          break;
        case 'week':
          const weekFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split('T')[0];
          filtered = filtered.filter(
            (appointment) => appointment.date >= today && appointment.date <= weekFromNow,
          );
          break;
      }
    }

    // Tab filter
    const today = new Date().toISOString().split('T')[0];
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    switch (activeTab) {
      case 'today':
        filtered = filtered.filter((appointment) => appointment.date === today);
        break;
      case 'tomorrow':
        filtered = filtered.filter((appointment) => appointment.date === tomorrow);
        break;
      case 'pending':
        filtered = filtered.filter((appointment) => appointment.status === 'beklemede');
        break;
      case 'confirmed':
        filtered = filtered.filter((appointment) => appointment.status === 'onaylandı');
        break;
    }

    setFilteredAppointments(filtered);
  }, [searchTerm, filterStatus, filterType, filterDate, activeTab]);

  const getStatusBadge = (status: Appointment['status']) => {
    switch (status) {
      case 'beklemede':
        return (
          <Badge
            variant="outline"
            className="border-yellow-200 bg-yellow-50 px-2 py-1 text-xs text-yellow-700"
          >
            Beklemede
          </Badge>
        );
      case 'onaylandı':
        return (
          <Badge
            variant="outline"
            className="border-blue-200 bg-blue-50 px-2 py-1 text-xs text-blue-700"
          >
            Onaylandı
          </Badge>
        );
      case 'tamamlandı':
        return (
          <Badge
            variant="outline"
            className="border-green-200 bg-green-50 px-2 py-1 text-xs text-green-700"
          >
            Tamamlandı
          </Badge>
        );
      case 'iptal':
        return (
          <Badge
            variant="outline"
            className="border-red-200 bg-red-50 px-2 py-1 text-xs text-red-700"
          >
            İptal
          </Badge>
        );
      case 'ertelendi':
        return (
          <Badge
            variant="outline"
            className="border-orange-200 bg-orange-50 px-2 py-1 text-xs text-orange-700"
          >
            Ertelendi
          </Badge>
        );
      default:
        return (
          <Badge
            variant="outline"
            className="border-gray-200 bg-gray-50 px-2 py-1 text-xs text-gray-700"
          >
            Bilinmiyor
          </Badge>
        );
    }
  };

  const getPriorityBadge = (priority: Appointment['priority']) => {
    switch (priority) {
      case 'düşük':
        return <Badge className="border-0 bg-gray-50 px-2 py-1 text-xs text-gray-700">Düşük</Badge>;
      case 'normal':
        return (
          <Badge className="border-0 bg-blue-50 px-2 py-1 text-xs text-blue-700">Normal</Badge>
        );
      case 'yüksek':
        return (
          <Badge className="border-0 bg-orange-50 px-2 py-1 text-xs text-orange-700">Yüksek</Badge>
        );
      case 'acil':
        return <Badge className="border-0 bg-red-50 px-2 py-1 text-xs text-red-700">Acil</Badge>;
      default:
        return (
          <Badge className="border-0 bg-gray-50 px-2 py-1 text-xs text-gray-700">Bilinmiyor</Badge>
        );
    }
  };

  const getTypeBadge = (type: Appointment['appointmentType']) => {
    switch (type) {
      case 'görüşme':
        return (
          <Badge className="border-0 bg-blue-50 px-2 py-1 text-xs text-blue-700">Görüşme</Badge>
        );
      case 'belge-teslim':
        return (
          <Badge className="border-0 bg-green-50 px-2 py-1 text-xs text-green-700">
            Belge Teslim
          </Badge>
        );
      case 'değerlendirme':
        return (
          <Badge className="border-0 bg-purple-50 px-2 py-1 text-xs text-purple-700">
            Değerlendirme
          </Badge>
        );
      case 'takip':
        return (
          <Badge className="border-0 bg-orange-50 px-2 py-1 text-xs text-orange-700">Takip</Badge>
        );
      case 'danışmanlık':
        return (
          <Badge className="border-0 bg-indigo-50 px-2 py-1 text-xs text-indigo-700">
            Danışmanlık
          </Badge>
        );
      default:
        return (
          <Badge className="border-0 bg-gray-50 px-2 py-1 text-xs text-gray-700">Bilinmiyor</Badge>
        );
    }
  };

  const handleViewDetails = useCallback((appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setIsDetailOpen(true);
  }, []);

  const clearFilters = useCallback(() => {
    setSearchTerm('');
    setFilterStatus('all');
    setFilterType('all');
    setFilterDate('all');
  }, []);

  // Stats calculations
  const todayAppointments = appointments.filter(
    (a) => a.date === new Date().toISOString().split('T')[0],
  ).length;
  const pendingAppointments = appointments.filter((a) => a.status === 'beklemede').length;
  const confirmedAppointments = appointments.filter((a) => a.status === 'onaylandı').length;
  const completedAppointments = appointments.filter((a) => a.status === 'tamamlandı').length;

  return (
    <div className="flex-1 space-y-4 p-4 sm:space-y-6 sm:p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-medium">Randevu Planlama</h1>
          <p className="text-muted-foreground mt-1">
            Yararlanıcı randevularını planlayın ve yönetin
          </p>
        </div>
        <Button className="w-full gap-2 sm:w-auto">
          <Plus className="h-4 w-4" />
          Yeni Randevu
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Bugün</p>
                <p className="text-2xl font-medium">{todayAppointments}</p>
              </div>
              <CalendarDays className="text-muted-foreground h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Beklemede</p>
                <p className="text-2xl font-medium text-yellow-600">{pendingAppointments}</p>
              </div>
              <AlertCircle className="h-5 w-5 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Onaylandı</p>
                <p className="text-2xl font-medium text-blue-600">{confirmedAppointments}</p>
              </div>
              <CheckCircle className="h-5 w-5 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Tamamlandı</p>
                <p className="text-2xl font-medium text-green-600">{completedAppointments}</p>
              </div>
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform" />
          <Input
            placeholder="Randevu ara..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
            }}
            className="pl-10"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto">
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[130px] shrink-0">
              <SelectValue placeholder="Durum" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tüm Durumlar</SelectItem>
              <SelectItem value="beklemede">Beklemede</SelectItem>
              <SelectItem value="onaylandı">Onaylandı</SelectItem>
              <SelectItem value="tamamlandı">Tamamlandı</SelectItem>
              <SelectItem value="iptal">İptal</SelectItem>
              <SelectItem value="ertelendi">Ertelendi</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-[140px] shrink-0">
              <SelectValue placeholder="Tür" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tüm Türler</SelectItem>
              <SelectItem value="görüşme">Görüşme</SelectItem>
              <SelectItem value="belge-teslim">Belge Teslim</SelectItem>
              <SelectItem value="değerlendirme">Değerlendirme</SelectItem>
              <SelectItem value="takip">Takip</SelectItem>
              <SelectItem value="danışmanlık">Danışmanlık</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterDate} onValueChange={setFilterDate}>
            <SelectTrigger className="w-[120px] shrink-0">
              <SelectValue placeholder="Tarih" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tüm Tarihler</SelectItem>
              <SelectItem value="today">Bugün</SelectItem>
              <SelectItem value="tomorrow">Yarın</SelectItem>
              <SelectItem value="week">Bu Hafta</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="today">Bugün</TabsTrigger>
          <TabsTrigger value="tomorrow">Yarın</TabsTrigger>
          <TabsTrigger value="pending">Beklemede</TabsTrigger>
          <TabsTrigger value="confirmed">Onaylandı</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-4">
          {filteredAppointments.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Calendar className="text-muted-foreground mb-4 h-12 w-12" />
                <h3 className="mb-2 text-lg font-medium">Randevu bulunamadı</h3>
                <p className="text-muted-foreground mb-4 text-center">
                  Arama kriterlerinize uygun randevu bulunmuyor.
                </p>
                <Button onClick={clearFilters}>Filtreleri Temizle</Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {filteredAppointments.map((appointment) => (
                <Card key={appointment.id} className="transition-shadow hover:shadow-md">
                  <CardHeader className="pb-3">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0 flex-1">
                        <CardTitle className="text-lg font-medium">
                          {appointment.beneficiaryName}
                        </CardTitle>
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          {getStatusBadge(appointment.status)}
                          {getTypeBadge(appointment.appointmentType)}
                          {getPriorityBadge(appointment.priority)}
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
                              handleViewDetails(appointment);
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
                        <Calendar className="text-muted-foreground h-4 w-4" />
                        <span>{new Date(appointment.date).toLocaleDateString('tr-TR')}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="text-muted-foreground h-4 w-4" />
                        <span>
                          {appointment.time} ({appointment.duration} dk)
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="text-muted-foreground h-4 w-4" />
                        <span className="truncate">{appointment.beneficiaryPhone}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div className="flex items-center gap-2 text-sm">
                        <User className="text-muted-foreground h-4 w-4" />
                        <span className="font-medium">{appointment.assignedStaff}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="text-muted-foreground h-4 w-4" />
                        <span className="truncate">{appointment.location}</span>
                      </div>
                    </div>

                    {appointment.notes && (
                      <div className="mt-4">
                        <p className="text-muted-foreground text-sm">{appointment.notes}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Appointment Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Randevu Detayları
            </DialogTitle>
          </DialogHeader>

          {selectedAppointment && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-3">
                  <div>
                    <label className="text-muted-foreground text-sm font-medium">Yararlanıcı</label>
                    <p className="font-medium">{selectedAppointment.beneficiaryName}</p>
                  </div>
                  <div>
                    <label className="text-muted-foreground text-sm font-medium">Telefon</label>
                    <p>{selectedAppointment.beneficiaryPhone}</p>
                  </div>
                  {selectedAppointment.beneficiaryEmail && (
                    <div>
                      <label className="text-muted-foreground text-sm font-medium">E-posta</label>
                      <p>{selectedAppointment.beneficiaryEmail}</p>
                    </div>
                  )}
                  <div>
                    <label className="text-muted-foreground text-sm font-medium">
                      Randevu Türü
                    </label>
                    <div className="mt-1">{getTypeBadge(selectedAppointment.appointmentType)}</div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-muted-foreground text-sm font-medium">
                      Tarih & Saat
                    </label>
                    <p>
                      {new Date(selectedAppointment.date).toLocaleDateString('tr-TR')} -{' '}
                      {selectedAppointment.time}
                    </p>
                  </div>
                  <div>
                    <label className="text-muted-foreground text-sm font-medium">Süre</label>
                    <p>{selectedAppointment.duration} dakika</p>
                  </div>
                  <div>
                    <label className="text-muted-foreground text-sm font-medium">Durum</label>
                    <div className="mt-1">{getStatusBadge(selectedAppointment.status)}</div>
                  </div>
                  <div>
                    <label className="text-muted-foreground text-sm font-medium">Öncelik</label>
                    <div className="mt-1">{getPriorityBadge(selectedAppointment.priority)}</div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-muted-foreground text-sm font-medium">
                    Sorumlu Personel
                  </label>
                  <p>{selectedAppointment.assignedStaff}</p>
                </div>
                <div>
                  <label className="text-muted-foreground text-sm font-medium">Konum</label>
                  <p>{selectedAppointment.location}</p>
                </div>
              </div>

              {selectedAppointment.notes && (
                <div>
                  <label className="text-muted-foreground text-sm font-medium">Notlar</label>
                  <p className="mt-1">{selectedAppointment.notes}</p>
                </div>
              )}

              <div className="flex items-center justify-between border-t pt-4">
                <div>
                  <p className="text-muted-foreground text-sm">
                    Oluşturulma:{' '}
                    {new Date(selectedAppointment.createdAt).toLocaleDateString('tr-TR')}
                  </p>
                  <p className="text-muted-foreground text-sm">
                    Hatırlatma: {selectedAppointment.reminderSent ? 'Gönderildi' : 'Gönderilmedi'}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    Düzenle
                  </Button>
                  <Button size="sm">Hatırlatma Gönder</Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default AppointmentSchedulingPage;
