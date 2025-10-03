/**
 * @fileoverview AidApplicationsPage Module - Application module
 *
 * @author Dernek Yönetim Sistemi Team
 * @version 1.0.0
 */

import {
  AlertCircle,
  Calendar,
  CheckCircle,
  Clock,
  Edit,
  Eye,
  FileCheck,
  FileText,
  Plus,
  Search,
  XCircle,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { PageLayout } from '../PageLayout';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Textarea } from '../ui/textarea';

interface AidApplication {
  id: number;
  applicantName: string;
  applicantId: string;
  applicationDate: string;
  aidType: string;
  requestedAmount: number;
  status: 'pending' | 'approved' | 'rejected' | 'under-review';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  description: string;
  phone: string;
  address: string;
}

const mockApplications: AidApplication[] = [
  {
    id: 1,
    applicantName: 'Ayşe Yılmaz',
    applicantId: '12345678901',
    applicationDate: '2024-01-15',
    aidType: 'Nakdi Yardım',
    requestedAmount: 2500,
    status: 'pending',
    priority: 'high',
    description: 'Kira ve market ihtiyacı için nakdi yardım talebi',
    phone: '0555 123 45 67',
    address: 'Atatürk Mah. Cumhuriyet Cad. No:45 Şişli/İSTANBUL',
  },
  {
    id: 2,
    applicantName: 'Mehmet Demir',
    applicantId: '98765432109',
    applicationDate: '2024-01-14',
    aidType: 'Ayni Yardım',
    requestedAmount: 0,
    status: 'approved',
    priority: 'medium',
    description: 'Gıda kolisi ve temizlik malzemesi talebi',
    phone: '0532 987 65 43',
    address: 'Fatih Mah. İstiklal Sok. No:12 Fatih/İSTANBUL',
  },
  {
    id: 3,
    applicantName: 'Fatma Kaya',
    applicantId: '11223344556',
    applicationDate: '2024-01-13',
    aidType: 'Sağlık Yardımı',
    requestedAmount: 3500,
    status: 'under-review',
    priority: 'urgent',
    description: 'Ameliyat masrafları için yardım talebi',
    phone: '0545 123 98 76',
    address: 'Beşiktaş Mah. Spor Cad. No:78 Beşiktaş/İSTANBUL',
  },
  {
    id: 4,
    applicantName: 'Ali Özkan',
    applicantId: '55667788990',
    applicationDate: '2024-01-12',
    aidType: 'Eğitim Yardımı',
    requestedAmount: 1500,
    status: 'rejected',
    priority: 'low',
    description: 'Üniversite harç ve kitap masrafları',
    phone: '0533 456 78 90',
    address: 'Kadıköy Mah. Bağdat Cad. No:234 Kadıköy/İSTANBUL',
  },
  {
    id: 5,
    applicantName: 'Zeynep Arslan',
    applicantId: '99887766554',
    applicationDate: '2024-01-11',
    aidType: 'Nakdi Yardım',
    requestedAmount: 3000,
    status: 'approved',
    priority: 'high',
    description: 'Elektrik ve doğalgaz faturası borçları',
    phone: '0544 321 65 98',
    address: 'Üsküdar Mah. Çamlıca Yolu No:56 Üsküdar/İSTANBUL',
  },
];

/**
 * AidApplicationsPage function
 *
 * @param {Object} params - Function parameters
 * @returns {void} Nothing
 */
export function AidApplicationsPage() {
  const [applications, setApplications] = useState<AidApplication[]>(mockApplications);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [aidTypeFilter, setAidTypeFilter] = useState<string>('all');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    applicantName: '',
    applicantId: '',
    phone: '',
    address: '',
    aidType: 'Nakdi Yardım',
    requestedAmount: 0,
    priority: 'medium' as AidApplication['priority'],
    description: '',
  });

  const getStatusBadge = (status: AidApplication['status']) => {
    const statusConfig = {
      pending: { label: 'Beklemede', color: 'bg-yellow-100 text-yellow-800' },
      approved: { label: 'Onaylandı', color: 'bg-green-100 text-green-800' },
      rejected: { label: 'Reddedildi', color: 'bg-red-100 text-red-800' },
      'under-review': { label: 'İncelemede', color: 'bg-blue-100 text-blue-800' },
    };

    const config = statusConfig[status];
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  const getPriorityBadge = (priority: AidApplication['priority']) => {
    const priorityConfig = {
      low: { label: 'Düşük', color: 'bg-gray-100 text-gray-800' },
      medium: { label: 'Orta', color: 'bg-blue-100 text-blue-800' },
      high: { label: 'Yüksek', color: 'bg-orange-100 text-orange-800' },
      urgent: { label: 'Acil', color: 'bg-red-100 text-red-800' },
    };

    const config = priorityConfig[priority];
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  const filteredApplications = applications.filter((app) => {
    const matchesSearch =
      app.applicantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.applicantId.includes(searchTerm) ||
      app.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || app.priority === priorityFilter;
    const matchesAidType = aidTypeFilter === 'all' || app.aidType === aidTypeFilter;

    return matchesSearch && matchesStatus && matchesPriority && matchesAidType;
  });

  const handleApprove = (id: number) => {
    setApplications((prev) =>
      prev.map((app) => (app.id === id ? { ...app, status: 'approved' as const } : app)),
    );
    toast.success('Başvuru onaylandı');
  };

  const handleReject = (id: number) => {
    setApplications((prev) =>
      prev.map((app) => (app.id === id ? { ...app, status: 'rejected' as const } : app)),
    );
    toast.success('Başvuru reddedildi');
  };

  const handleCreateApplication = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.applicantName || !formData.applicantId || !formData.phone) {
      toast.error('Lütfen zorunlu alanları doldurun');
      return;
    }

    try {
      setIsSubmitting(true);

      // TODO: Integrate with actual API
      // const result = await aidApplicationsService.createApplication(formData);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Add to local state for demonstration
      const newApplication: AidApplication = {
        id: Math.max(...applications.map((a) => a.id), 0) + 1,
        ...formData,
        applicationDate: new Date().toISOString().split('T')[0],
        status: 'pending',
      };

      setApplications((prev) => [newApplication, ...prev]);

      toast.success('Başvuru başarıyla oluşturuldu!');
      setShowCreateDialog(false);

      // Reset form
      setFormData({
        applicantName: '',
        applicantId: '',
        phone: '',
        address: '',
        aidType: 'Nakdi Yardım',
        requestedAmount: 0,
        priority: 'medium',
        description: '',
      });
    } catch (error) {
      toast.error('Başvuru oluşturulurken hata oluştu');
    } finally {
      setIsSubmitting(false);
    }
  };

  const stats = {
    total: applications.length,
    pending: applications.filter((a) => a.status === 'pending').length,
    approved: applications.filter((a) => a.status === 'approved').length,
    rejected: applications.filter((a) => a.status === 'rejected').length,
  };

  return (
    <PageLayout
      title="Yardım Başvuruları"
      subtitle="İhtiyaç sahipleri adına oluşturulan başvuruları değerlendirin ve yönetin"
      actions={
        <div className="flex gap-2 flex-wrap items-center justify-end w-full sm:w-auto p-2 sm:p-0">
          <Button
            className="min-h-[44px] px-6 py-3 shadow-lg border-0 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-offset-2 transition-all duration-200 hover:scale-105 relative z-20 flex-shrink-0"
            style={{
              backgroundColor: '#1e3a8a',
              color: '#ffffff',
              border: 'none',
              boxShadow: '0 4px 12px rgba(30, 58, 138, 0.4)',
              minWidth: '180px',
            }}
            onClick={() => setShowCreateDialog(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            <span className="hidden lg:inline">İhtiyaç Sahibi Adına Başvuru Oluştur</span>
            <span className="lg:hidden">Yeni Başvuru</span>
          </Button>
        </div>
      }
    >
      <div className="safe-area p-3 sm:p-6 space-y-4 sm:space-y-6">
        {/* Mobile-Optimized Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <Card className="border-0 shadow-md hover:shadow-lg transition-all duration-300 micro-interaction">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <FileText className="w-4 h-4 text-blue-600" />
                </div>
                <div className="text-right">
                  <div className="text-xl sm:text-2xl font-bold text-blue-600">{stats.total}</div>
                </div>
              </div>
              <p className="text-sm font-medium text-gray-600">Toplam Başvuru</p>
              <p className="text-xs text-gray-500 mt-1">Bu ay toplam</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md hover:shadow-lg transition-all duration-300 micro-interaction">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                  <Clock className="w-4 h-4 text-yellow-600" />
                </div>
                <div className="text-right">
                  <div className="text-xl sm:text-2xl font-bold text-yellow-600">
                    {stats.pending}
                  </div>
                </div>
              </div>
              <p className="text-sm font-medium text-gray-600">Beklemede</p>
              <p className="text-xs text-gray-500 mt-1">Değerlendirme aşamasında</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md hover:shadow-lg transition-all duration-300 micro-interaction">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                </div>
                <div className="text-right">
                  <div className="text-xl sm:text-2xl font-bold text-green-600">
                    {stats.approved}
                  </div>
                </div>
              </div>
              <p className="text-sm font-medium text-gray-600">Onaylanan</p>
              <p className="text-xs text-gray-500 mt-1">
                Onay oranı: %{Math.round((stats.approved / stats.total) * 100) || 0}
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md hover:shadow-lg transition-all duration-300 micro-interaction">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                  <XCircle className="w-4 h-4 text-red-600" />
                </div>
                <div className="text-right">
                  <div className="text-xl sm:text-2xl font-bold text-red-600">{stats.rejected}</div>
                </div>
              </div>
              <p className="text-sm font-medium text-gray-600">Reddedilen</p>
              <p className="text-xs text-gray-500 mt-1">
                Red oranı: %{Math.round((stats.rejected / stats.total) * 100) || 0}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Mobile-Optimized Filters */}
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 sm:p-6">
            <div className="space-y-4">
              {/* Search Input */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="İhtiyaç sahibinin adı, TC kimlik no veya başvuru açıklaması ile ara..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                  }}
                  className="pl-10 min-h-[44px] text-base"
                  inputMode="search"
                />
              </div>

              {/* Mobile Filter Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="min-h-[44px] text-base">
                    <SelectValue placeholder="Tüm Durumlar" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tüm Durumlar</SelectItem>
                    <SelectItem value="pending">Beklemede</SelectItem>
                    <SelectItem value="approved">Onaylandı</SelectItem>
                    <SelectItem value="rejected">Reddedildi</SelectItem>
                    <SelectItem value="under-review">İncelemede</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                  <SelectTrigger className="min-h-[44px] text-base">
                    <SelectValue placeholder="Tüm Öncelikler" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tüm Öncelikler</SelectItem>
                    <SelectItem value="urgent">Acil</SelectItem>
                    <SelectItem value="high">Yüksek</SelectItem>
                    <SelectItem value="medium">Orta</SelectItem>
                    <SelectItem value="low">Düşük</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={aidTypeFilter} onValueChange={setAidTypeFilter}>
                  <SelectTrigger className="min-h-[44px] text-base">
                    <SelectValue placeholder="Tüm Türler" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tüm Türler</SelectItem>
                    <SelectItem value="Nakdi Yardım">Nakdi Yardım</SelectItem>
                    <SelectItem value="Ayni Yardım">Ayni Yardım</SelectItem>
                    <SelectItem value="Sağlık Yardımı">Sağlık Yardımı</SelectItem>
                    <SelectItem value="Eğitim Yardımı">Eğitim Yardımı</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Mobile-Optimized Applications List */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <FileCheck className="w-5 h-5 text-blue-600" />
              Başvuru Listesi ({filteredApplications.length} başvuru)
            </CardTitle>
          </CardHeader>

          <CardContent className="p-0">
            {/* Mobile Card View */}
            <div className="block sm:hidden">
              {filteredApplications.length > 0 ? (
                <div className="space-y-3 p-4">
                  {filteredApplications.map((application) => (
                    <Card
                      key={application.id}
                      className="border border-gray-200 hover:shadow-md transition-shadow"
                    >
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1">
                            <h3 className="font-medium text-gray-900">
                              {application.applicantName}
                            </h3>
                            <p className="text-sm text-gray-600">{application.applicantId}</p>
                            <p className="text-xs text-gray-500 mt-1">{application.description}</p>
                          </div>
                          <div className="text-right">{getPriorityBadge(application.priority)}</div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 mb-3 text-sm">
                          <div>
                            <span className="text-gray-500">Tür:</span>
                            <p className="font-medium">{application.aidType}</p>
                          </div>
                          <div>
                            <span className="text-gray-500">Tutar:</span>
                            <p className="font-medium">
                              {application.requestedAmount > 0
                                ? `₺${application.requestedAmount.toLocaleString('tr-TR')}`
                                : 'Ayni Yardım'}
                            </p>
                          </div>
                          <div>
                            <span className="text-gray-500">Tarih:</span>
                            <p className="font-medium">
                              {new Date(application.applicationDate).toLocaleDateString('tr-TR')}
                            </p>
                          </div>
                          <div>
                            <span className="text-gray-500">Durum:</span>
                            <div className="mt-1">{getStatusBadge(application.status)}</div>
                          </div>
                        </div>

                        <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="min-h-[44px] min-w-[44px] p-2 hover:bg-blue-50 hover:text-blue-600"
                              aria-label={`${application.applicantName} başvurusunu görüntüle`}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="min-h-[44px] min-w-[44px] p-2 hover:bg-gray-50"
                              aria-label={`${application.applicantName} başvurusunu düzenle`}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                          </div>

                          {application.status === 'pending' && (
                            <div className="flex gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  handleApprove(application.id);
                                }}
                                className="min-h-[44px] min-w-[44px] p-2 text-green-600 hover:text-green-700 hover:bg-green-50"
                                aria-label={`${application.applicantName} başvurusunu onayla`}
                              >
                                <CheckCircle className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  handleReject(application.id);
                                }}
                                className="min-h-[44px] min-w-[44px] p-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                                aria-label={`${application.applicantName} başvurusunu reddet`}
                              >
                                <XCircle className="w-4 h-4" />
                              </Button>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center">
                  <AlertCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-gray-600 mb-2">Başvuru bulunamadı</p>
                  <p className="text-sm text-gray-400">
                    Arama kriterlerinize uygun başvuru bulunmuyor
                  </p>
                </div>
              )}
            </div>

            {/* Desktop Table View */}
            <div className="hidden sm:block overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50/50">
                    <TableHead className="min-w-[200px] p-3 sm:p-4">İhtiyaç Sahibi</TableHead>
                    <TableHead className="min-w-[120px] p-3 sm:p-4">Başvuru Tarihi</TableHead>
                    <TableHead className="min-w-[140px] p-3 sm:p-4">Yardım Türü</TableHead>
                    <TableHead className="min-w-[120px] p-3 sm:p-4">Talep Edilen</TableHead>
                    <TableHead className="min-w-[100px] p-3 sm:p-4">Öncelik</TableHead>
                    <TableHead className="min-w-[120px] p-3 sm:p-4">Durum</TableHead>
                    <TableHead className="min-w-[180px] p-3 sm:p-4 text-center">İşlemler</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredApplications.map((application) => (
                    <TableRow
                      key={application.id}
                      className="hover:bg-gray-50/50 transition-colors"
                    >
                      <TableCell className="p-3 sm:p-4">
                        <div>
                          <p className="font-medium">{application.applicantName}</p>
                          <p className="text-sm text-muted-foreground">{application.applicantId}</p>
                        </div>
                      </TableCell>
                      <TableCell className="p-3 sm:p-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="text-sm">
                            {new Date(application.applicationDate).toLocaleDateString('tr-TR')}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="p-3 sm:p-4">
                        <Badge variant="outline">{application.aidType}</Badge>
                      </TableCell>
                      <TableCell className="p-3 sm:p-4">
                        <span className="font-medium">
                          {application.requestedAmount > 0
                            ? `₺${application.requestedAmount.toLocaleString('tr-TR')}`
                            : 'Ayni Yardım'}
                        </span>
                      </TableCell>
                      <TableCell className="p-3 sm:p-4">
                        {getPriorityBadge(application.priority)}
                      </TableCell>
                      <TableCell className="p-3 sm:p-4">
                        {getStatusBadge(application.status)}
                      </TableCell>
                      <TableCell className="p-3 sm:p-4">
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-600"
                            aria-label={`${application.applicantName} başvurusunu görüntüle`}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 hover:bg-gray-50"
                            aria-label={`${application.applicantName} başvurusunu düzenle`}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          {application.status === 'pending' && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  handleApprove(application.id);
                                }}
                                className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
                                aria-label={`${application.applicantName} başvurusunu onayla`}
                              >
                                <CheckCircle className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  handleReject(application.id);
                                }}
                                className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                aria-label={`${application.applicantName} başvurusunu reddet`}
                              >
                                <XCircle className="w-4 h-4" />
                              </Button>
                            </>
                          )}
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

      {/* Create Application Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Yeni Yardım Başvurusu
            </DialogTitle>
            <DialogDescription>
              İhtiyaç sahibi adına başvuru oluşturun. Zorunlu alanları (*) doldurmanız gereklidir.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateApplication} className="space-y-4 py-4">
            {/* Applicant Name and ID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="applicantName">
                  Başvuran Adı <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="applicantName"
                  value={formData.applicantName}
                  onChange={(e) => setFormData({ ...formData, applicantName: e.target.value })}
                  placeholder="İhtiyaç sahibinin tam adı"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="applicantId">
                  T.C. Kimlik No <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="applicantId"
                  value={formData.applicantId}
                  onChange={(e) => setFormData({ ...formData, applicantId: e.target.value })}
                  placeholder="11 haneli kimlik numarası"
                  required
                  maxLength={11}
                />
              </div>
            </div>

            {/* Contact Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">
                  Telefon <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="05XX XXX XX XX"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="priority">Öncelik</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value: AidApplication['priority']) =>
                    setFormData({ ...formData, priority: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Öncelik seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Düşük</SelectItem>
                    <SelectItem value="medium">Orta</SelectItem>
                    <SelectItem value="high">Yüksek</SelectItem>
                    <SelectItem value="urgent">Acil</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Address */}
            <div className="space-y-2">
              <Label htmlFor="address">Adres</Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Açık adres"
                rows={2}
              />
            </div>

            {/* Aid Type and Amount */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="aidType">Yardım Türü</Label>
                <Select
                  value={formData.aidType}
                  onValueChange={(value) => setFormData({ ...formData, aidType: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Tür seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Nakdi Yardım">Nakdi Yardım</SelectItem>
                    <SelectItem value="Ayni Yardım">Ayni Yardım</SelectItem>
                    <SelectItem value="Sağlık Yardımı">Sağlık Yardımı</SelectItem>
                    <SelectItem value="Eğitim Yardımı">Eğitim Yardımı</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="requestedAmount">Talep Edilen Miktar (TL)</Label>
                <Input
                  id="requestedAmount"
                  type="number"
                  value={formData.requestedAmount || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, requestedAmount: parseFloat(e.target.value) || 0 })
                  }
                  placeholder="0"
                  min="0"
                />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Açıklama</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Yardım talebinin detayları"
                rows={3}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowCreateDialog(false)}
                disabled={isSubmitting}
              >
                İptal
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Kaydediliyor...' : 'Başvuru Oluştur'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </PageLayout>
  );
}
