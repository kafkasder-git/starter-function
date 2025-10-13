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
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { PageLayout } from '../layouts/PageLayout';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Textarea } from '../ui/textarea';
import { aidRequestsService } from '../../services/aidRequestsService';
import { logger } from '../../lib/logging/logger';
import type { AidRequest } from '../../types/database';

// Helper functions for mapping
const mapAidTypeToEnum = (aidType: string): AidRequest['aid_type'] => {
  const mapping: Record<string, AidRequest['aid_type']> = {
    'Nakdi Yardım': 'financial',
    'Ayni Yardım': 'other',
    'Sağlık Yardımı': 'medical',
    'Eğitim Yardımı': 'education',
  };
  return mapping[aidType] || 'other';
};

const mapUrgencyToEnum = (priority: string): AidRequest['urgency'] => {
  const mapping: Record<string, AidRequest['urgency']> = {
    low: 'low',
    medium: 'medium',
    high: 'high',
    urgent: 'critical',
  };
  return mapping[priority] || 'medium';
};

const mapStatusForDisplay = (status: AidRequest['status']): string => {
  const mapping: Record<AidRequest['status'], string> = {
    pending: 'pending',
    under_review: 'under-review',
    approved: 'approved',
    rejected: 'rejected',
    completed: 'completed',
  };
  return mapping[status] || status;
};

const mapUrgencyForDisplay = (urgency: AidRequest['urgency']): string => {
  const mapping: Record<AidRequest['urgency'], string> = {
    low: 'low',
    medium: 'medium',
    high: 'high',
    critical: 'urgent',
  };
  return mapping[urgency] || urgency;
};

/**
 * AidApplicationsPage function
 *
 * @param {Object} params - Function parameters
 * @returns {void} Nothing
 */
export function AidApplicationsPage() {
  const [applications, setApplications] = useState<AidRequest[]>([]);
  const [_isLoading, _setIsLoading] = useState(true);
  const [_error, _setError] = useState<string | null>(null);
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
    priority: 'medium' as AidRequest['urgency'],
    description: '',
  });

  // Load applications on mount
  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    try {
      setLoading(true);
      const result = await aidRequestsService.getAidRequests(1, 100); // Load first 100 for now
      if (!result.data) {
        console.error('Failed to load aid applications: No data');
        toast.error('Başvurular yüklenirken hata oluştu');
      } else {
        setApplications(result.data as any);
      }
    } catch (error) {
      console.error('Error loading applications:', error);
      toast.error('Başvurular yüklenirken hata oluştu');
    } finally {
      // setLoading(false);
    }
  };

  const getStatusBadge = (status: AidRequest['status']) => {
    const displayStatus = mapStatusForDisplay(status);
    const statusConfig = {
      pending: { label: 'Beklemede', color: 'bg-yellow-100 text-yellow-800' },
      approved: { label: 'Onaylandı', color: 'bg-green-100 text-green-800' },
      rejected: { label: 'Reddedildi', color: 'bg-red-100 text-red-800' },
      'under-review': { label: 'İncelemede', color: 'bg-blue-100 text-blue-800' },
      completed: { label: 'Tamamlandı', color: 'bg-purple-100 text-purple-800' },
    };

    const config = statusConfig[displayStatus as keyof typeof statusConfig];
    return (
      <Badge className={config?.color || 'bg-gray-100 text-gray-800'}>
        {config?.label || displayStatus}
      </Badge>
    );
  };

  const getPriorityBadge = (urgency: AidRequest['urgency']) => {
    const displayPriority = mapUrgencyForDisplay(urgency);
    const priorityConfig = {
      low: { label: 'Düşük', color: 'bg-gray-100 text-gray-800' },
      medium: { label: 'Orta', color: 'bg-blue-100 text-blue-800' },
      high: { label: 'Yüksek', color: 'bg-orange-100 text-orange-800' },
      urgent: { label: 'Acil', color: 'bg-red-100 text-red-800' },
    };

    const config = priorityConfig[displayPriority as keyof typeof priorityConfig];
    return (
      <Badge className={config?.color || 'bg-gray-100 text-gray-800'}>
        {config?.label || displayPriority}
      </Badge>
    );
  };

  const filteredApplications = applications.filter((app) => {
    const matchesSearch =
      app.applicant_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.id.includes(searchTerm) ||
      app.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === 'all' || mapStatusForDisplay(app.status) === statusFilter;
    const matchesPriority =
      priorityFilter === 'all' || mapUrgencyForDisplay(app.urgency) === priorityFilter;
    const matchesAidType =
      aidTypeFilter === 'all' || app.aid_type === mapAidTypeToEnum(aidTypeFilter);

    return matchesSearch && matchesStatus && matchesPriority && matchesAidType;
  });

  const handleApprove = async (id: string) => {
    try {
      const result = await aidRequestsService.approveAidRequest(
        id,
        applications.find((app) => app.id === id)?.requested_amount || 0,
        'current-user-id'
      ); // Replace with actual user ID
      if (result.error) {
        logger.error('Failed to approve application:', result.error);
        toast.error('Başvuru onaylanırken hata oluştu');
      } else {
        toast.success('Başvuru onaylandı');
        loadApplications(); // Reload to get updated data
      }
    } catch (error) {
      logger.error('Error approving application:', error);
      toast.error('Başvuru onaylanırken hata oluştu');
    }
  };

  const handleReject = async (id: string) => {
    try {
      const result = await aidRequestsService.rejectAidRequest(id, 'current-user-id'); // Replace with actual user ID
      if (result.error) {
        logger.error('Failed to reject application:', result.error);
        toast.error('Başvuru reddedilirken hata oluştu');
      } else {
        toast.success('Başvuru reddedildi');
        loadApplications(); // Reload to get updated data
      }
    } catch (error) {
      logger.error('Error rejecting application:', error);
      toast.error('Başvuru reddedilirken hata oluştu');
    }
  };

  const handleCreateApplication = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.applicantName || !formData.applicantId || !formData.phone) {
      toast.error('Lütfen zorunlu alanları doldurun');
      return;
    }

    try {
      setIsSubmitting(true);

      const result = await aidRequestsService.createAidRequest({
        applicant_name: formData.applicantName,
        applicant_phone: formData.phone,
        applicant_address: formData.address,
        aid_type: mapAidTypeToEnum(formData.aidType),
        requested_amount: formData.requestedAmount || null,
        urgency: mapUrgencyToEnum(formData.priority),
        description: formData.description,
        reason: formData.description, // Using description as reason for now
      });

      if (result.error) {
        logger.error('Failed to create application:', result.error);
        toast.error('Başvuru oluşturulurken hata oluştu');
      } else {
        toast.success('Başvuru başarıyla oluşturuldu!');
        setShowCreateDialog(false);
        loadApplications(); // Reload to get updated data

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
      }
    } catch (error) {
      logger.error('Error creating application:', error);
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
        <div className="flex w-full flex-wrap items-center justify-end gap-2 p-2 sm:w-auto sm:p-0">
          <Button
            variant="default"
            className="min-h-[44px] min-w-[44px]"
            onClick={() => {
              setShowCreateDialog(true);
            }}
          >
            <Plus className="h-4 w-4" />
            <span className="hidden lg:inline">İhtiyaç Sahibi Adına Başvuru Oluştur</span>
            <span className="lg:hidden">Yeni Başvuru</span>
          </Button>
        </div>
      }
    >
      <div className="safe-area space-y-6 p-6">
        {/* Mobile-Optimized Stats Cards */}
        <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
          <Card className="micro-interaction border border-gray-200 shadow-md transition-all duration-200 hover:shadow-lg dark:border-gray-700 dark:bg-gray-900">
            <CardContent className="p-4 sm:p-6">
              <div className="mb-2 flex items-center justify-between">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
                  <FileText className="h-4 w-4 text-blue-600" />
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-blue-600 sm:text-xl lg:text-2xl">
                    {stats.total}
                  </div>
                </div>
              </div>
              <p className="text-sm font-medium text-gray-600">Toplam Başvuru</p>
              <p className="mt-1 text-xs text-gray-500">Bu ay toplam</p>
            </CardContent>
          </Card>

          <Card className="micro-interaction border border-gray-200 shadow-md transition-all duration-200 hover:shadow-lg dark:border-gray-700 dark:bg-gray-900">
            <CardContent className="p-4 sm:p-6">
              <div className="mb-2 flex items-center justify-between">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-yellow-100">
                  <Clock className="h-4 w-4 text-yellow-600" />
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-yellow-600 sm:text-xl lg:text-2xl">
                    {stats.pending}
                  </div>
                </div>
              </div>
              <p className="text-sm font-medium text-gray-600">Beklemede</p>
              <p className="mt-1 text-xs text-gray-500">Değerlendirme aşamasında</p>
            </CardContent>
          </Card>

          <Card className="micro-interaction border border-gray-200 shadow-md transition-all duration-200 hover:shadow-lg dark:border-gray-700 dark:bg-gray-900">
            <CardContent className="p-4 sm:p-6">
              <div className="mb-2 flex items-center justify-between">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-green-600 sm:text-xl lg:text-2xl">
                    {stats.approved}
                  </div>
                </div>
              </div>
              <p className="text-sm font-medium text-gray-600">Onaylanan</p>
              <p className="mt-1 text-xs text-gray-500">
                Onay oranı: %{Math.round((stats.approved / stats.total) * 100) || 0}
              </p>
            </CardContent>
          </Card>

          <Card className="micro-interaction border border-gray-200 shadow-md transition-all duration-200 hover:shadow-lg dark:border-gray-700 dark:bg-gray-900">
            <CardContent className="p-4 sm:p-6">
              <div className="mb-2 flex items-center justify-between">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100">
                  <XCircle className="h-4 w-4 text-red-600" />
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-red-600 sm:text-xl lg:text-2xl">
                    {stats.rejected}
                  </div>
                </div>
              </div>
              <p className="text-sm font-medium text-gray-600">Reddedilen</p>
              <p className="mt-1 text-xs text-gray-500">
                Red oranı: %{Math.round((stats.rejected / stats.total) * 100) || 0}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Mobile-Optimized Filters */}
        <Card className="border border-gray-200 shadow-md dark:border-gray-700 dark:bg-gray-900">
          <CardContent className="p-4 sm:p-6">
            <div className="space-y-4">
              {/* Search Input */}
              <div className="relative">
                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
                <Input
                  placeholder="İhtiyaç sahibinin adı, TC kimlik no veya başvuru açıklaması ile ara..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                  }}
                  className="min-h-[44px] pl-10 text-sm sm:text-base"
                  inputMode="search"
                />
              </div>

              {/* Mobile Filter Grid */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="min-h-[44px] text-sm sm:text-base">
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
                  <SelectTrigger className="min-h-[44px] text-sm sm:text-base">
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
                  <SelectTrigger className="min-h-[44px] text-sm sm:text-base">
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
        <Card className="border border-gray-200 shadow-md dark:border-gray-700 dark:bg-gray-900">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <FileCheck className="h-5 w-5 text-blue-600" />
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
                      className="border border-gray-200 transition-shadow hover:shadow-md"
                    >
                      <CardContent className="p-4">
                        <div className="mb-3 flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-medium text-gray-900">
                              {application.applicant_name}
                            </h3>
                            <p className="text-sm text-gray-600">{application.id}</p>
                            <p className="mt-1 text-xs text-gray-500">{application.description}</p>
                          </div>
                          <div className="text-right">{getPriorityBadge(application.urgency)}</div>
                        </div>

                        <div className="mb-3 grid grid-cols-2 gap-3 text-sm">
                          <div>
                            <span className="text-gray-500">Tür:</span>
                            <p className="font-medium">{application.aid_type}</p>
                          </div>
                          <div>
                            <span className="text-gray-500">Tutar:</span>
                            <p className="font-medium">
                              {application.requested_amount && application.requested_amount > 0
                                ? `₺${application.requested_amount.toLocaleString('tr-TR')}`
                                : 'Ayni Yardım'}
                            </p>
                          </div>
                          <div>
                            <span className="text-gray-500">Tarih:</span>
                            <p className="font-medium">
                              {new Date(application.created_at).toLocaleDateString('tr-TR')}
                            </p>
                          </div>
                          <div>
                            <span className="text-gray-500">Durum:</span>
                            <div className="mt-1">{getStatusBadge(application.status)}</div>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center justify-between border-t border-gray-100 pt-3 gap-2">
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="min-h-[44px] min-w-[44px] p-2 hover:bg-blue-50 hover:text-blue-600"
                              aria-label={`${application.applicant_name} başvurusunu görüntüle`}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="min-h-[44px] min-w-[44px] p-2 hover:bg-gray-50"
                              aria-label={`${application.applicant_name} başvurusunu düzenle`}
                            >
                              <Edit className="h-4 w-4" />
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
                                className="min-h-[44px] min-w-[44px] p-2 text-green-600 hover:bg-green-50 hover:text-green-700"
                                aria-label={`${application.applicant_name} başvurusunu onayla`}
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  handleReject(application.id);
                                }}
                                className="min-h-[44px] min-w-[44px] p-2 text-red-600 hover:bg-red-50 hover:text-red-700"
                                aria-label={`${application.applicant_name} başvurusunu reddet`}
                              >
                                <XCircle className="h-4 w-4" />
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
                  <AlertCircle className="mx-auto mb-4 h-12 w-12 text-gray-300" />
                  <p className="mb-2 text-gray-600">Başvuru bulunamadı</p>
                  <p className="text-sm text-gray-400">
                    Arama kriterlerinize uygun başvuru bulunmuyor
                  </p>
                </div>
              )}
            </div>

            {/* Desktop Table View */}
            <div className="hidden overflow-x-auto sm:block">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50/50">
                    <TableHead className="min-w-[200px] p-3 sm:p-4">İhtiyaç Sahibi</TableHead>
                    <TableHead className="min-w-[120px] p-3 sm:p-4">Başvuru Tarihi</TableHead>
                    <TableHead className="min-w-[140px] p-3 sm:p-4">Yardım Türü</TableHead>
                    <TableHead className="min-w-[120px] p-3 sm:p-4">Talep Edilen</TableHead>
                    <TableHead className="min-w-[100px] p-3 sm:p-4">Öncelik</TableHead>
                    <TableHead className="min-w-[120px] p-3 sm:p-4">Durum</TableHead>
                    <TableHead className="min-w-[180px] p-3 text-center sm:p-4">İşlemler</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredApplications.map((application) => (
                    <TableRow
                      key={application.id}
                      className="transition-colors hover:bg-gray-50/50"
                    >
                      <TableCell className="p-3 sm:p-4">
                        <div>
                          <p className="font-medium">{application.applicant_name}</p>
                          <p className="text-muted-foreground text-sm">{application.id}</p>
                        </div>
                      </TableCell>
                      <TableCell className="p-3 sm:p-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span className="text-sm">
                            {new Date(application.created_at).toLocaleDateString('tr-TR')}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="p-3 sm:p-4">
                        <Badge variant="outline">{application.aid_type}</Badge>
                      </TableCell>
                      <TableCell className="p-3 sm:p-4">
                        <span className="font-medium">
                          {application.requested_amount && application.requested_amount > 0
                            ? `₺${application.requested_amount.toLocaleString('tr-TR')}`
                            : 'Ayni Yardım'}
                        </span>
                      </TableCell>
                      <TableCell className="p-3 sm:p-4">
                        {getPriorityBadge(application.urgency)}
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
                            aria-label={`${application.applicant_name} başvurusunu görüntüle`}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 hover:bg-gray-50"
                            aria-label={`${application.applicant_name} başvurusunu düzenle`}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          {application.status === 'pending' && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  handleApprove(application.id);
                                }}
                                className="h-8 w-8 p-0 text-green-600 hover:bg-green-50 hover:text-green-700"
                                aria-label={`${application.applicant_name} başvurusunu onayla`}
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  handleReject(application.id);
                                }}
                                className="h-8 w-8 p-0 text-red-600 hover:bg-red-50 hover:text-red-700"
                                aria-label={`${application.applicant_name} başvurusunu reddet`}
                              >
                                <XCircle className="h-4 w-4" />
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
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Yeni Yardım Başvurusu
            </DialogTitle>
            <DialogDescription>
              İhtiyaç sahibi adına başvuru oluşturun. Zorunlu alanları (*) doldurmanız gereklidir.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateApplication} className="space-y-4 py-4">
            {/* Applicant Name and ID */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="applicantName">
                  Başvuran Adı <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="applicantName"
                  value={formData.applicantName}
                  onChange={(e) => {
                    setFormData({ ...formData, applicantName: e.target.value });
                  }}
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
                  onChange={(e) => {
                    setFormData({ ...formData, applicantId: e.target.value });
                  }}
                  placeholder="11 haneli kimlik numarası"
                  required
                  maxLength={11}
                />
              </div>
            </div>

            {/* Contact Info */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="phone">
                  Telefon <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => {
                    setFormData({ ...formData, phone: e.target.value });
                  }}
                  placeholder="05XX XXX XX XX"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="priority">Öncelik</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value: string) => {
                    setFormData({ ...formData, priority: value as AidRequest['urgency'] });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Öncelik seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Düşük</SelectItem>
                    <SelectItem value="medium">Orta</SelectItem>
                    <SelectItem value="high">Yüksek</SelectItem>
                    <SelectItem value="critical">Acil</SelectItem>
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
                onChange={(e) => {
                  setFormData({ ...formData, address: e.target.value });
                }}
                placeholder="Açık adres"
                rows={2}
              />
            </div>

            {/* Aid Type and Amount */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="aidType">Yardım Türü</Label>
                <Select
                  value={formData.aidType}
                  onValueChange={(value) => {
                    setFormData({ ...formData, aidType: value });
                  }}
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
                  onChange={(e) => {
                    setFormData({ ...formData, requestedAmount: parseFloat(e.target.value) || 0 });
                  }}
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
                onChange={(e) => {
                  setFormData({ ...formData, description: e.target.value });
                }}
                placeholder="Yardım talebinin detayları"
                rows={3}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-2 border-t pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowCreateDialog(false);
                }}
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

export default AidApplicationsPage;
