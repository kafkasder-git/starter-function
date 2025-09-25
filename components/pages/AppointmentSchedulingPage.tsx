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

// Mock appointment data
const mockAppointments: Appointment[] = [
  {
    id: 1,
    beneficiaryName: 'Ayşe Yılmaz',
    beneficiaryPhone: '0532 555 0101',
    beneficiaryEmail: 'ayse.yilmaz@email.com',
    appointmentType: 'görüşme',
    date: '2024-02-15',
    time: '09:00',
    duration: 30,
    status: 'onaylandı',
    assignedStaff: 'Mehmet Demir',
    location: 'Ofis A - Oda 101',
    notes: 'Sosyal yardım başvurusu değerlendirmesi',
    priority: 'normal',
    reminderSent: true,
    createdAt: '2024-02-10',
  },
  {
    id: 2,
    beneficiaryName: 'Hasan Kaya',
    beneficiaryPhone: '0533 555 0202',
    appointmentType: 'belge-teslim',
    date: '2024-02-15',
    time: '10:30',
    duration: 15,
    status: 'beklemede',
    assignedStaff: 'Fatma Özkan',
    location: 'Ofis B - Oda 205',
    notes: 'Yardım belgesi teslimi',
    priority: 'düşük',
    reminderSent: false,
    createdAt: '2024-02-12',
  },
  {
    id: 3,
    beneficiaryName: 'Zeynep Çelik',
    beneficiaryPhone: '0534 555 0303',
    beneficiaryEmail: 'zeynep.celik@email.com',
    appointmentType: 'değerlendirme',
    date: '2024-02-16',
    time: '14:00',
    duration: 45,
    status: 'onaylandı',
    assignedStaff: 'Ali Yıldız',
    location: 'Ofis A - Oda 102',
    notes: 'Aile durumu değerlendirmesi ve ihtiyaç analizi',
    priority: 'yüksek',
    reminderSent: true,
    createdAt: '2024-02-08',
  },
  {
    id: 4,
    beneficiaryName: 'Mahmut Şahin',
    beneficiaryPhone: '0535 555 0404',
    appointmentType: 'takip',
    date: '2024-02-17',
    time: '11:15',
    duration: 20,
    status: 'tamamlandı',
    assignedStaff: 'Ayşe Kara',
    location: 'Ofis C - Oda 301',
    notes: 'Yardım sonrası takip görüşmesi',
    priority: 'normal',
    reminderSent: true,
    createdAt: '2024-02-05',
  },
  {
    id: 5,
    beneficiaryName: 'Emine Yıldırım',
    beneficiaryPhone: '0536 555 0505',
    appointmentType: 'danışmanlık',
    date: '2024-02-18',
    time: '15:30',
    duration: 60,
    status: 'ertelendi',
    assignedStaff: 'Osman Demir',
    location: 'Ofis A - Oda 103',
    notes: 'Hukuki danışmanlık - acil durum',
    priority: 'acil',
    reminderSent: false,
    createdAt: '2024-02-13',
  },
];

/**
 * AppointmentSchedulingPage function
 * 
 * @param {Object} params - Function parameters
 * @returns {void} Nothing
 */
export function AppointmentSchedulingPage() {
  const [appointments, setAppointments] = useState<Appointment[]>(mockAppointments);
  const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>(mockAppointments);
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
  }, [appointments, searchTerm, filterStatus, filterType, filterDate, activeTab]);

  const getStatusBadge = (status: Appointment['status']) => {
    const config = {
      beklemede: {
        label: 'Beklemede',
        className: 'bg-yellow-50 text-yellow-700 border-yellow-200',
      },
      onaylandı: { label: 'Onaylandı', className: 'bg-blue-50 text-blue-700 border-blue-200' },
      tamamlandı: { label: 'Tamamlandı', className: 'bg-green-50 text-green-700 border-green-200' },
      iptal: { label: 'İptal', className: 'bg-red-50 text-red-700 border-red-200' },
      ertelendi: {
        label: 'Ertelendi',
        className: 'bg-orange-50 text-orange-700 border-orange-200',
      },
    };

    const { label, className } = config[status];
    return (
      <Badge variant="outline" className={`${className} text-xs px-2 py-1`}>
        {label}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: Appointment['priority']) => {
    const config = {
      düşük: { label: 'Düşük', className: 'bg-gray-50 text-gray-700' },
      normal: { label: 'Normal', className: 'bg-blue-50 text-blue-700' },
      yüksek: { label: 'Yüksek', className: 'bg-orange-50 text-orange-700' },
      acil: { label: 'Acil', className: 'bg-red-50 text-red-700' },
    };

    const { label, className } = config[priority];
    return <Badge className={`${className} text-xs px-2 py-1 border-0`}>{label}</Badge>;
  };

  const getTypeBadge = (type: Appointment['appointmentType']) => {
    const config = {
      görüşme: { label: 'Görüşme', className: 'bg-blue-50 text-blue-700' },
      'belge-teslim': { label: 'Belge Teslim', className: 'bg-green-50 text-green-700' },
      değerlendirme: { label: 'Değerlendirme', className: 'bg-purple-50 text-purple-700' },
      takip: { label: 'Takip', className: 'bg-orange-50 text-orange-700' },
      danışmanlık: { label: 'Danışmanlık', className: 'bg-indigo-50 text-indigo-700' },
    };

    const { label, className } = config[type];
    return <Badge className={`${className} text-xs px-2 py-1 border-0`}>{label}</Badge>;
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-medium">Randevu Planlama</h1>
          <p className="text-muted-foreground mt-1">
            Yararlanıcı randevularını planlayın ve yönetin
          </p>
        </div>
        <Button className="gap-2 w-full sm:w-auto">
          <Plus className="w-4 h-4" />
          Yeni Randevu
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Bugün</p>
                <p className="text-2xl font-medium">{todayAppointments}</p>
              </div>
              <CalendarDays className="w-5 h-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Beklemede</p>
                <p className="text-2xl font-medium text-yellow-600">{pendingAppointments}</p>
              </div>
              <AlertCircle className="w-5 h-5 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Onaylandı</p>
                <p className="text-2xl font-medium text-blue-600">{confirmedAppointments}</p>
              </div>
              <CheckCircle className="w-5 h-5 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Tamamlandı</p>
                <p className="text-2xl font-medium text-green-600">{completedAppointments}</p>
              </div>
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
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
                <Calendar className="w-12 h-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Randevu bulunamadı</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Arama kriterlerinize uygun randevu bulunmuyor.
                </p>
                <Button onClick={clearFilters}>Filtreleri Temizle</Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {filteredAppointments.map((appointment) => (
                <Card key={appointment.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg font-medium">
                          {appointment.beneficiaryName}
                        </CardTitle>
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                          {getStatusBadge(appointment.status)}
                          {getTypeBadge(appointment.appointmentType)}
                          {getPriorityBadge(appointment.priority)}
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
                              handleViewDetails(appointment);
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
                        <span>{new Date(appointment.date).toLocaleDateString('tr-TR')}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span>
                          {appointment.time} ({appointment.duration} dk)
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="w-4 h-4 text-muted-foreground" />
                        <span className="truncate">{appointment.beneficiaryPhone}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="flex items-center gap-2 text-sm">
                        <User className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">{appointment.assignedStaff}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <span className="truncate">{appointment.location}</span>
                      </div>
                    </div>

                    {appointment.notes && (
                      <div className="mt-4">
                        <p className="text-sm text-muted-foreground">{appointment.notes}</p>
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
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Randevu Detayları
            </DialogTitle>
          </DialogHeader>

          {selectedAppointment && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Yararlanıcı</label>
                    <p className="font-medium">{selectedAppointment.beneficiaryName}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Telefon</label>
                    <p>{selectedAppointment.beneficiaryPhone}</p>
                  </div>
                  {selectedAppointment.beneficiaryEmail && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">E-posta</label>
                      <p>{selectedAppointment.beneficiaryEmail}</p>
                    </div>
                  )}
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Randevu Türü
                    </label>
                    <div className="mt-1">{getTypeBadge(selectedAppointment.appointmentType)}</div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Tarih & Saat
                    </label>
                    <p>
                      {new Date(selectedAppointment.date).toLocaleDateString('tr-TR')} -{' '}
                      {selectedAppointment.time}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Süre</label>
                    <p>{selectedAppointment.duration} dakika</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Durum</label>
                    <div className="mt-1">{getStatusBadge(selectedAppointment.status)}</div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Öncelik</label>
                    <div className="mt-1">{getPriorityBadge(selectedAppointment.priority)}</div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Sorumlu Personel
                  </label>
                  <p>{selectedAppointment.assignedStaff}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Konum</label>
                  <p>{selectedAppointment.location}</p>
                </div>
              </div>

              {selectedAppointment.notes && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Notlar</label>
                  <p className="mt-1">{selectedAppointment.notes}</p>
                </div>
              )}

              <div className="flex items-center justify-between pt-4 border-t">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Oluşturulma:{' '}
                    {new Date(selectedAppointment.createdAt).toLocaleDateString('tr-TR')}
                  </p>
                  <p className="text-sm text-muted-foreground">
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
