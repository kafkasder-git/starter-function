import { useState } from 'react';
import { PageLayout } from '../PageLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import {
  Stethoscope,
  Search,
  Plus,
  Eye,
  FileText,
  Calendar,
  User,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  Heart,
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

const mockReferrals: HospitalReferral[] = [
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

export function HospitalReferralPage() {
  const [referrals, setReferrals] = useState<HospitalReferral[]>(mockReferrals);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [urgencyFilter, setUrgencyFilter] = useState<string>('all');

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
      pending: <Clock className="w-4 h-4 text-yellow-600" />,
      scheduled: <Calendar className="w-4 h-4 text-blue-600" />,
      completed: <CheckCircle className="w-4 h-4 text-green-600" />,
      cancelled: <XCircle className="w-4 h-4 text-red-600" />,
      missed: <AlertCircle className="w-4 h-4 text-orange-600" />,
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
      .filter((r) => r.actualCost || r.estimatedCost)
      .reduce((sum, r) => sum + (r.actualCost || r.estimatedCost || 0), 0),
  };

  return (
    <PageLayout
      title="Hastane Sevk İşlemleri"
      subtitle="İhtiyaç sahipleri için hastane sevk işlemlerini takip edin ve yönetin"
      actions={
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Sevk Raporu
          </Button>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            İhtiyaç Sahibi İçin Yeni Sevk
          </Button>
        </div>
      }
    >
      <div className="p-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Hospital className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Toplam</p>
                  <p className="text-xl font-bold">{stats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Clock className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Bekliyor</p>
                  <p className="text-xl font-bold">{stats.pending}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Calendar className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Randevulu</p>
                  <p className="text-xl font-bold">{stats.scheduled}</p>
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
                  <p className="text-xs text-muted-foreground">Tamamlandı</p>
                  <p className="text-xl font-bold">{stats.completed}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Acil</p>
                  <p className="text-xl font-bold">{stats.emergency}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Activity className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Maliyet</p>
                  <p className="text-lg font-bold">₺{stats.totalCost.toLocaleString('tr-TR')}</p>
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
              <Stethoscope className="w-5 h-5 text-blue-600" />
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
                          <FileText className="w-4 h-4 text-gray-400" />
                          <span className="font-mono text-sm">{referral.referralNumber}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{referral.patientName}</p>
                          <p className="text-sm text-muted-foreground">
                            {referral.patientGender === 'male' ? 'E' : 'K'}, {referral.patientAge}{' '}
                            yaş
                          </p>
                          <div className="flex items-center gap-1 mt-1">
                            <Phone className="w-3 h-3 text-gray-400" />
                            <span className="text-xs text-muted-foreground">
                              {referral.patientPhone}
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="text-sm font-medium">{referral.medicalCondition}</p>
                          {referral.notes && (
                            <p className="text-xs text-muted-foreground mt-1">{referral.notes}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-sm">{referral.hospital}</p>
                          <p className="text-sm text-muted-foreground">{referral.department}</p>
                          {referral.doctorName && (
                            <p className="text-xs text-muted-foreground">{referral.doctorName}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {referral.appointmentDate ? (
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-blue-400" />
                            <div>
                              <p className="text-sm font-medium">
                                {new Date(referral.appointmentDate).toLocaleDateString('tr-TR')}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(referral.appointmentDate).toLocaleTimeString('tr-TR', {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </p>
                            </div>
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">Randevu alınacak</span>
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
                            {(referral.actualCost || referral.estimatedCost || 0).toLocaleString(
                              'tr-TR',
                            )}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {referral.actualCost ? 'Gerçek' : 'Tahmini'}
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
