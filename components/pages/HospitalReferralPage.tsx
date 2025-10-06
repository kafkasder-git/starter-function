/**
 * @fileoverview HospitalReferralPage Module - Application module
 *
 * @author Dernek Yönetim Sistemi Team
 * @version 1.0.0
 */

import { useState } from 'react';
import { toast } from 'sonner';
import { PageLayout } from '../PageLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import {
  Stethoscope,
  Search,
  Plus,
  Eye,
  FileText,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  Activity,
  Hospital,
  Phone,
  Download,
} from 'lucide-react';

interface HospitalReferral {
  id: number;
  referralNumber: string;
  patientName: string;
  patientId: string;
  patientAge: number;
  patientGender: 'male' | 'female';
  patientPhone: string;
  medicalCondition: string;
  urgencyLevel: 'routine' | 'urgent' | 'emergency';
  referralDate: string;
  appointmentDate?: string;
  hospital: string;
  department: string;
  doctorName?: string;
  status: 'pending' | 'scheduled' | 'completed' | 'cancelled' | 'missed';
  referredBy: string;
  notes?: string;
  estimatedCost?: number;
  actualCost?: number;
  transportNeeded: boolean;
  followUpRequired: boolean;
}

const initialReferrals: HospitalReferral[] = [
  {
    id: 1,
    referralNumber: 'HSK-2024-001',
    patientName: 'Ayşe Yılmaz',
    patientId: '12345678901',
    patientAge: 45,
    patientGender: 'female',
    patientPhone: '0555 123 45 67',
    medicalCondition: 'Kalp rahatsızlığı kontrol muayenesi',
    urgencyLevel: 'urgent',
    referralDate: '2024-01-15',
    appointmentDate: '2024-01-18 14:30',
    hospital: 'Şişli Etfal Hastanesi',
    department: 'Kardiyoloji',
    doctorName: 'Dr. Mehmet Kardiyolog',
    status: 'scheduled',
    referredBy: 'Dr. Ali Aile Hekimi',
    notes: 'EKG ve kan tahlilleri ile birlikte',
    estimatedCost: 350,
    transportNeeded: true,
    followUpRequired: true,
  },
  {
    id: 2,
    referralNumber: 'HSK-2024-002',
    patientName: 'Mehmet Demir',
    patientId: '98765432109',
    patientAge: 38,
    patientGender: 'male',
    patientPhone: '0532 987 65 43',
    medicalCondition: 'Diz ağrısı ve hareket kısıtlılığı',
    urgencyLevel: 'routine',
    referralDate: '2024-01-14',
    appointmentDate: '2024-01-16 10:00',
    hospital: 'Fatih Sultan Mehmet Hastanesi',
    department: 'Ortopedi',
    doctorName: 'Dr. Fatma Ortopedist',
    status: 'completed',
    referredBy: 'Zeynep Fizyoterapist',
    notes: 'Fizik tedavi sonrası kontrol',
    estimatedCost: 280,
    actualCost: 280,
    transportNeeded: false,
    followUpRequired: true,
  },
  {
    id: 3,
    referralNumber: 'HSK-2024-003',
    patientName: 'Fatma Kaya',
    patientId: '11223344556',
    patientAge: 67,
    patientGender: 'female',
    patientPhone: '0545 123 98 76',
    medicalCondition: 'Göz katarakt ameliyatı',
    urgencyLevel: 'urgent',
    referralDate: '2024-01-13',
    appointmentDate: '2024-01-20 09:00',
    hospital: 'Beyoğlu Göz Hastanesi',
    department: 'Göz Hastalıkları',
    doctorName: 'Dr. Hasan Göz Doktoru',
    status: 'scheduled',
    referredBy: 'Dr. Zeynep Oftalmolog',
    notes: 'Sol göz katarakt ameliyatı planlandı',
    estimatedCost: 2500,
    transportNeeded: true,
    followUpRequired: true,
  },
  {
    id: 4,
    referralNumber: 'HSK-2024-004',
    patientName: 'Ali Özkan',
    patientId: '55667788990',
    patientAge: 22,
    patientGender: 'male',
    patientPhone: '0533 456 78 90',
    medicalCondition: 'Spor yaralanması kontrol',
    urgencyLevel: 'routine',
    referralDate: '2024-01-12',
    status: 'pending',
    hospital: 'Acıbadem Hastanesi',
    department: 'Spor Hekimliği',
    referredBy: 'Fizik Tedavi Merkezi',
    notes: 'Ayak bileği burkulmasi sonrası kontrol',
    estimatedCost: 200,
    transportNeeded: false,
    followUpRequired: false,
  },
  {
    id: 5,
    referralNumber: 'HSK-2024-005',
    patientName: 'Zeynep Arslan',
    patientId: '99887766554',
    patientAge: 55,
    patientGender: 'female',
    patientPhone: '0544 321 65 98',
    medicalCondition: 'Nöroloji konsültasyonu',
    urgencyLevel: 'emergency',
    referralDate: '2024-01-11',
    appointmentDate: '2024-01-15 16:00',
    hospital: 'İstanbul Üniversitesi Hastanesi',
    department: 'Nöroloji',
    doctorName: 'Prof. Dr. Ahmet Nöroloji',
    status: 'missed',
    referredBy: 'Dr. Ayşe Dahiliye',
    notes: 'Acil nöroloji konsültasyonu - randevuya gelemedi',
    estimatedCost: 450,
    transportNeeded: true,
    followUpRequired: true,
  },
];

/**
 * HospitalReferralPage function
 *
 * @param {Object} params - Function parameters
 * @returns {void} Nothing
 */
export function HospitalReferralPage() {
  const [referrals, setReferrals] = useState<HospitalReferral[]>(initialReferrals);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [urgencyFilter, setUrgencyFilter] = useState<string>('all');
  const [showReferralDialog, setShowReferralDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    patientName: '',
    patientId: '',
    patientAge: 0,
    patientGender: 'male' as 'male' | 'female',
    patientPhone: '',
    medicalCondition: '',
    urgencyLevel: 'routine' as HospitalReferral['urgencyLevel'],
    hospital: '',
    department: '',
    referredBy: '',
    notes: '',
    transportNeeded: false,
    estimatedCost: 0,
  });

  const getStatusBadge = (status: HospitalReferral['status']) => {
    const statusConfig = {
      pending: { label: 'Bekliyor', color: 'bg-yellow-100 text-yellow-800' },
      scheduled: { label: 'Randevu Alındı', color: 'bg-blue-100 text-blue-800' },
      completed: { label: 'Tamamlandı', color: 'bg-green-100 text-green-800' },
      cancelled: { label: 'İptal Edildi', color: 'bg-red-100 text-red-800' },
      missed: { label: 'Gitmedi', color: 'bg-orange-100 text-orange-800' },
    };

    const config = statusConfig[status];
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  const getUrgencyBadge = (urgency: HospitalReferral['urgencyLevel']) => {
    const urgencyConfig = {
      routine: { label: 'Rutin', color: 'bg-gray-100 text-gray-800' },
      urgent: { label: 'Acil', color: 'bg-orange-100 text-orange-800' },
      emergency: { label: 'Çok Acil', color: 'bg-red-100 text-red-800' },
    };

    const config = urgencyConfig[urgency];
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  const getStatusIcon = (status: HospitalReferral['status']) => {
    const icons = {
      pending: <Clock className="h-4 w-4 text-yellow-600" />,
      scheduled: <Calendar className="h-4 w-4 text-blue-600" />,
      completed: <CheckCircle className="h-4 w-4 text-green-600" />,
      cancelled: <XCircle className="h-4 w-4 text-red-600" />,
      missed: <AlertCircle className="h-4 w-4 text-orange-600" />,
    };
    return icons[status];
  };

  const filteredReferrals = referrals.filter((referral) => {
    const matchesSearch =
      referral.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      referral.patientId.includes(searchTerm) ||
      referral.referralNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      referral.medicalCondition.toLowerCase().includes(searchTerm.toLowerCase()) ||
      referral.hospital.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || referral.status === statusFilter;
    const matchesUrgency = urgencyFilter === 'all' || referral.urgencyLevel === urgencyFilter;

    return matchesSearch && matchesStatus && matchesUrgency;
  });

  const stats = {
    total: referrals.length,
    pending: referrals.filter((r) => r.status === 'pending').length,
    scheduled: referrals.filter((r) => r.status === 'scheduled').length,
    completed: referrals.filter((r) => r.status === 'completed').length,
    emergency: referrals.filter((r) => r.urgencyLevel === 'emergency').length,
    totalCost: referrals
      .filter((r) => r.actualCost ?? r.estimatedCost)
      .reduce((sum, r) => sum + (r.actualCost ?? r.estimatedCost ?? 0), 0),
  };

  const handleCreateReferral = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.patientName ||
      !formData.patientId ||
      !formData.medicalCondition ||
      !formData.hospital
    ) {
      toast.error('Lütfen zorunlu alanları doldurun');
      return;
    }

    try {
      setIsSubmitting(true);

      // TODO: Integrate with actual API
      // const result = await hospitalReferralService.createReferral(formData);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Add to local state for demonstration
      const newReferral: HospitalReferral = {
        id: Math.max(...referrals.map((r) => r.id), 0) + 1,
        referralNumber: `HSK-${new Date().getFullYear()}-${String(referrals.length + 1).padStart(3, '0')}`,
        ...formData,
        referralDate: new Date().toISOString().split('T')[0],
        status: 'pending',
        followUpRequired: formData.urgencyLevel !== 'routine',
      };

      setReferrals((prev) => [newReferral, ...prev]);

      toast.success('Hastane sevki başarıyla oluşturuldu!');
      setShowReferralDialog(false);

      // Reset form
      setFormData({
        patientName: '',
        patientId: '',
        patientAge: 0,
        patientGender: 'male',
        patientPhone: '',
        medicalCondition: '',
        urgencyLevel: 'routine',
        hospital: '',
        department: '',
        referredBy: '',
        notes: '',
        transportNeeded: false,
        estimatedCost: 0,
      });
    } catch {
      toast.error('Sevk oluşturulurken hata oluştu');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageLayout
      title="Hastane Sevk İşlemleri"
      subtitle="İhtiyaç sahipleri için hastane sevk işlemlerini takip edin ve yönetin"
      actions={
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Sevk Raporu
          </Button>
          <Button
            onClick={() => {
              setShowReferralDialog(true);
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            İhtiyaç Sahibi İçin Yeni Sevk
          </Button>
        </div>
      }
    >
      <div className="space-y-6 p-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-blue-100 p-2">
                  <Hospital className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Toplam</p>
                  <p className="text-xl font-bold">{stats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-yellow-100 p-2">
                  <Clock className="h-5 w-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Bekliyor</p>
                  <p className="text-xl font-bold">{stats.pending}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-blue-100 p-2">
                  <Calendar className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Randevulu</p>
                  <p className="text-xl font-bold">{stats.scheduled}</p>
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
                  <p className="text-muted-foreground text-xs">Tamamlandı</p>
                  <p className="text-xl font-bold">{stats.completed}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-red-100 p-2">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Acil</p>
                  <p className="text-xl font-bold">{stats.emergency}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-purple-100 p-2">
                  <Activity className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Maliyet</p>
                  <p className="text-lg font-bold">₺{stats.totalCost.toLocaleString('tr-TR')}</p>
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
                    placeholder="İhtiyaç sahibinin adı, TC kimlik, sevk no, hastalık veya hastane ile ara..."
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
                    <SelectItem value="pending">Bekliyor</SelectItem>
                    <SelectItem value="scheduled">Randevulu</SelectItem>
                    <SelectItem value="completed">Tamamlandı</SelectItem>
                    <SelectItem value="cancelled">İptal Edildi</SelectItem>
                    <SelectItem value="missed">Gitmedi</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={urgencyFilter} onValueChange={setUrgencyFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Aciliyet" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tüm Öncelikler</SelectItem>
                    <SelectItem value="emergency">Çok Acil</SelectItem>
                    <SelectItem value="urgent">Acil</SelectItem>
                    <SelectItem value="routine">Rutin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Referrals Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Stethoscope className="h-5 w-5 text-blue-600" />
              Hastane Sevk Listesi ({filteredReferrals.length} sevk)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Sevk No</TableHead>
                    <TableHead>İhtiyaç Sahibi Bilgileri</TableHead>
                    <TableHead>Hastalık/Durum</TableHead>
                    <TableHead>Hastane/Bölüm</TableHead>
                    <TableHead>Randevu</TableHead>
                    <TableHead>Aciliyet</TableHead>
                    <TableHead>Durum</TableHead>
                    <TableHead>Maliyet</TableHead>
                    <TableHead>İşlemler</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredReferrals.map((referral) => (
                    <TableRow key={referral.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-gray-400" />
                          <span className="font-mono text-sm">{referral.referralNumber}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{referral.patientName}</p>
                          <p className="text-muted-foreground text-sm">
                            {referral.patientGender === 'male' ? 'E' : 'K'}, {referral.patientAge}{' '}
                            yaş
                          </p>
                          <div className="mt-1 flex items-center gap-1">
                            <Phone className="h-3 w-3 text-gray-400" />
                            <span className="text-muted-foreground text-xs">
                              {referral.patientPhone}
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="text-sm font-medium">{referral.medicalCondition}</p>
                          {referral.notes && (
                            <p className="text-muted-foreground mt-1 text-xs">{referral.notes}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="text-sm font-medium">{referral.hospital}</p>
                          <p className="text-muted-foreground text-sm">{referral.department}</p>
                          {referral.doctorName && (
                            <p className="text-muted-foreground text-xs">{referral.doctorName}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {referral.appointmentDate ? (
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-blue-400" />
                            <div>
                              <p className="text-sm font-medium">
                                {new Date(referral.appointmentDate).toLocaleDateString('tr-TR')}
                              </p>
                              <p className="text-muted-foreground text-xs">
                                {new Date(referral.appointmentDate).toLocaleTimeString('tr-TR', {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </p>
                            </div>
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-sm">Randevu alınacak</span>
                        )}
                      </TableCell>
                      <TableCell>{getUrgencyBadge(referral.urgencyLevel)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(referral.status)}
                          {getStatusBadge(referral.status)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">
                            ₺
                            {(referral.actualCost ?? referral.estimatedCost ?? 0).toLocaleString(
                              'tr-TR',
                            )}
                          </p>
                          <p className="text-muted-foreground text-xs">
                            {referral.actualCost ? 'Gerçek' : 'Tahmini'}
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

      {/* Hospital Referral Dialog */}
      <Dialog open={showReferralDialog} onOpenChange={setShowReferralDialog}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Stethoscope className="h-5 w-5" />
              Yeni Hastane Sevki
            </DialogTitle>
            <DialogDescription>
              İhtiyaç sahibi için yeni hastane sevki oluşturun. Zorunlu alanları (*) doldurmanız
              gereklidir.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateReferral} className="space-y-4 py-4">
            {/* Patient Info */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="patientName">
                  Hasta Adı <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="patientName"
                  value={formData.patientName}
                  onChange={(e) => {
                    setFormData({ ...formData, patientName: e.target.value });
                  }}
                  placeholder="Hastanın tam adı"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="patientId">
                  T.C. Kimlik No <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="patientId"
                  value={formData.patientId}
                  onChange={(e) => {
                    setFormData({ ...formData, patientId: e.target.value });
                  }}
                  placeholder="11 haneli kimlik numarası"
                  required
                  maxLength={11}
                />
              </div>
            </div>

            {/* Patient Details */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="patientAge">Yaş</Label>
                <Input
                  id="patientAge"
                  type="number"
                  value={formData.patientAge || ''}
                  onChange={(e) => {
                    setFormData({ ...formData, patientAge: parseInt(e.target.value) || 0 });
                  }}
                  placeholder="0"
                  min="0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="patientGender">Cinsiyet</Label>
                <Select
                  value={formData.patientGender}
                  onValueChange={(value: 'male' | 'female') => {
                    setFormData({ ...formData, patientGender: value });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Erkek</SelectItem>
                    <SelectItem value="female">Kadın</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="patientPhone">Telefon</Label>
                <Input
                  id="patientPhone"
                  type="tel"
                  value={formData.patientPhone}
                  onChange={(e) => {
                    setFormData({ ...formData, patientPhone: e.target.value });
                  }}
                  placeholder="05XX XXX XX XX"
                />
              </div>
            </div>

            {/* Medical Condition */}
            <div className="space-y-2">
              <Label htmlFor="medicalCondition">
                Tıbbi Durum <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="medicalCondition"
                value={formData.medicalCondition}
                onChange={(e) => {
                  setFormData({ ...formData, medicalCondition: e.target.value });
                }}
                placeholder="Hastanın tıbbi durumu ve şikayetleri"
                rows={2}
                required
              />
            </div>

            {/* Hospital Details */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="hospital">
                  Hastane <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="hospital"
                  value={formData.hospital}
                  onChange={(e) => {
                    setFormData({ ...formData, hospital: e.target.value });
                  }}
                  placeholder="Hastane adı"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="department">Bölüm</Label>
                <Input
                  id="department"
                  value={formData.department}
                  onChange={(e) => {
                    setFormData({ ...formData, department: e.target.value });
                  }}
                  placeholder="Örn: Kardiyoloji"
                />
              </div>
            </div>

            {/* Urgency and Referred By */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="urgencyLevel">Aciliyet</Label>
                <Select
                  value={formData.urgencyLevel}
                  onValueChange={(value: HospitalReferral['urgencyLevel']) => {
                    setFormData({ ...formData, urgencyLevel: value });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="routine">Rutin</SelectItem>
                    <SelectItem value="urgent">Acil</SelectItem>
                    <SelectItem value="emergency">Çok Acil</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="referredBy">Sevk Eden</Label>
                <Input
                  id="referredBy"
                  value={formData.referredBy}
                  onChange={(e) => {
                    setFormData({ ...formData, referredBy: e.target.value });
                  }}
                  placeholder="Doktor veya kurum adı"
                />
              </div>
            </div>

            {/* Transport and Cost */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="estimatedCost">Tahmini Maliyet (TL)</Label>
                <Input
                  id="estimatedCost"
                  type="number"
                  value={formData.estimatedCost || ''}
                  onChange={(e) => {
                    setFormData({ ...formData, estimatedCost: parseFloat(e.target.value) || 0 });
                  }}
                  placeholder="0"
                  min="0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="transportNeeded" className="flex items-center gap-2">
                  <input
                    id="transportNeeded"
                    type="checkbox"
                    checked={formData.transportNeeded}
                    onChange={(e) => {
                      setFormData({ ...formData, transportNeeded: e.target.checked });
                    }}
                    className="h-4 w-4"
                  />
                  Ulaşım Gerekli
                </Label>
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notlar</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => {
                  setFormData({ ...formData, notes: e.target.value });
                }}
                placeholder="Ek bilgiler ve notlar"
                rows={2}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-2 border-t pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowReferralDialog(false);
                }}
                disabled={isSubmitting}
              >
                İptal
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Oluşturuluyor...' : 'Sevk Oluştur'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </PageLayout>
  );
}
