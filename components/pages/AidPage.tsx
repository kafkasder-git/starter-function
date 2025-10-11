/**
 * @fileoverview AidPage Module - Application module
 *
 * @author Dernek Yönetim Sistemi Team
 * @version 1.0.0
 */

import { useState, useEffect } from 'react';
import { PageLayout } from '../layouts/PageLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import {
  Search,
  Plus,
  Download,
  Eye,
  Edit,
  HelpingHand,
  Clock,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { PageLoading } from '../shared/LoadingSpinner';
import { logger } from '../../lib/logging/logger';
import { aidRequestsService } from '../../services/aidRequestsService';
import { exportService } from '../../services/exportService';
import type { AidRequest as ServiceAidRequest } from '../../types/database';

interface AidRequest {
  id: number;
  applicant: string;
  phone: string;
  email: string;
  requestType: 'Acil Yardım' | 'Gıda' | 'Barınma' | 'Sağlık' | 'Eğitim' | 'Maddi';
  status: 'Yeni' | 'İnceleniyor' | 'Onaylandı' | 'Reddedildi' | 'Tamamlandı';
  priority: 'Düşük' | 'Orta' | 'Yüksek' | 'Acil';
  amount?: number;
  description: string;
  submitDate: string;
  assignedTo?: string;
}

// Helper functions to map between local AidRequest and service AidRequest
const mapServiceToLocal = (serviceRequest: ServiceAidRequest): AidRequest => ({
  id: parseInt(serviceRequest.id || '0'),
  applicant: serviceRequest.applicant_name || '',
  phone: serviceRequest.applicant_phone || '',
  email: serviceRequest.applicant_email || '',
  requestType: mapAidTypeToLocal(serviceRequest.aid_type),
  status: mapStatusToLocal(serviceRequest.status),
  priority: mapUrgencyToLocal(serviceRequest.urgency),
  amount: serviceRequest.requested_amount || 0,
  description: serviceRequest.description || '',
  submitDate: serviceRequest.created_at || '',
  assignedTo: serviceRequest.assigned_to || undefined,
});

const mapLocalToService = (localRequest: Partial<AidRequest>): Partial<ServiceAidRequest> => ({
  applicant_name: localRequest.applicant,
  applicant_phone: localRequest.phone,
  applicant_email: localRequest.email,
  aid_type: mapAidTypeToService(localRequest.requestType),
  status: mapStatusToService(localRequest.status),
  urgency: mapUrgencyToService(localRequest.priority),
  requested_amount: localRequest.amount,
  description: localRequest.description,
});

// Type mapping helpers
const mapAidTypeToLocal = (type: ServiceAidRequest['aid_type']): AidRequest['requestType'] => {
  const mapping: Record<ServiceAidRequest['aid_type'], AidRequest['requestType']> = {
    'financial': 'Maddi',
    'medical': 'Sağlık',
    'education': 'Eğitim',
    'housing': 'Barınma',
    'food': 'Gıda',
    'other': 'Acil Yardım'
  };
  return mapping[type] || 'Maddi';
};

const mapStatusToLocal = (status: ServiceAidRequest['status']): AidRequest['status'] => {
  const mapping: Record<ServiceAidRequest['status'], AidRequest['status']> = {
    'pending': 'Yeni',
    'under_review': 'İnceleniyor',
    'approved': 'Onaylandı',
    'rejected': 'Reddedildi',
    'completed': 'Tamamlandı'
  };
  return mapping[status] || 'Yeni';
};

const mapUrgencyToLocal = (urgency: ServiceAidRequest['urgency']): AidRequest['priority'] => {
  const mapping: Record<ServiceAidRequest['urgency'], AidRequest['priority']> = {
    'low': 'Düşük',
    'medium': 'Orta',
    'high': 'Yüksek',
    'critical': 'Acil'
  };
  return mapping[urgency] || 'Orta';
};

const mapAidTypeToService = (type?: AidRequest['requestType']): ServiceAidRequest['aid_type'] => {
  const mapping: Record<AidRequest['requestType'], ServiceAidRequest['aid_type']> = {
    'Maddi': 'financial',
    'Sağlık': 'medical',
    'Eğitim': 'education',
    'Barınma': 'housing',
    'Gıda': 'food',
    'Acil Yardım': 'other'
  };
  return mapping[type || 'Maddi'] || 'financial';
};

const mapStatusToService = (status?: AidRequest['status']): ServiceAidRequest['status'] => {
  const mapping: Record<AidRequest['status'], ServiceAidRequest['status']> = {
    'Yeni': 'pending',
    'İnceleniyor': 'under_review',
    'Onaylandı': 'approved',
    'Reddedildi': 'rejected',
    'Tamamlandı': 'completed'
  };
  return mapping[status || 'Yeni'] || 'pending';
};

const mapUrgencyToService = (priority?: AidRequest['priority']): ServiceAidRequest['urgency'] => {
  const mapping: Record<AidRequest['priority'], ServiceAidRequest['urgency']> = {
    'Düşük': 'low',
    'Orta': 'medium',
    'Yüksek': 'high',
    'Acil': 'critical'
  };
  return mapping[priority || 'Orta'] || 'medium';
};

/**
 * AidPage function
 *
 * @param {Object} params - Function parameters
 * @returns {void} Nothing
 */
export function AidPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [aidRequests, setAidRequests] = useState<AidRequest[]>([]);
  const [showNewRequestDialog, setShowNewRequestDialog] = useState(false);

  // Load aid requests on mount
  useEffect(() => {
    const loadAidRequests = async () => {
      try {
        setLoading(true);
        const response = await aidRequestsService.getAidRequests(1, 100); // Load first page with large limit
        if (!response.data) {
          setError('Failed to load aid requests');
          logger.error('Failed to load aid requests: No data');
        } else {
          const mappedRequests = response.data.map(mapServiceToLocal);
          setAidRequests(mappedRequests);
        }
      } catch (err) {
        setError('Failed to load aid requests');
        logger.error('Error loading aid requests:', err);
      } finally {
        setLoading(false);
      }
    };
    loadAidRequests();
  }, []);

  const handleNewRequest = async (newRequestData: Partial<AidRequest>) => {
    try {
      const serviceData = mapLocalToService(newRequestData);
      const response = await aidRequestsService.createAidRequest(serviceData as any); // Cast for simplicity; ensure types align
      if (!response.data) {
        logger.error('Failed to create aid request: No data returned');
        setError('Failed to create aid request');
      } else {
        const newRequest = mapServiceToLocal(response.data);
        setAidRequests((prev) => [newRequest, ...prev]);
        setShowNewRequestDialog(false);
      }
    } catch (err) {
      logger.error('Error creating aid request:', err);
      setError('Failed to create aid request');
    }
  };

  const handleExport = async () => {
    try {
      logger.info('Exporting aid requests');
      const response = await aidRequestsService.getAidRequests(1, 1000); // Fetch all for export
      if (!response.data) {
        logger.error('Failed to fetch data for export: No data');
        setError('Failed to fetch data for export');
        return;
      }
      const dataToExport = response.data.map(mapServiceToLocal);
      const exportResult = await exportService.exportReport(
        { data: dataToExport, metadata: { total_records: dataToExport.length, page: 1, page_size: 1000, execution_time: 0, generated_at: new Date() } },
        { format: 'csv', filename: 'aid_requests_export.csv' }
      );
      if (exportResult.success && exportResult.downloadUrl) {
        window.open(exportResult.downloadUrl, '_blank');
      } else {
        logger.error('Export failed:', exportResult.error);
        setError(exportResult.error || 'Export failed');
      }
    } catch (err) {
      logger.error('Error during export:', err);
      setError('Export failed');
    }
  };

  const filteredRequests = aidRequests.filter((request) => {
    const matchesSearch =
      request.applicant.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || request.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const getStatusBadge = (status: AidRequest['status']) => {
    const variants = {
      Yeni: 'bg-blue-100 text-blue-800 hover:bg-blue-100',
      İnceleniyor: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100',
      Onaylandı: 'bg-green-100 text-green-800 hover:bg-green-100',
      Reddedildi: 'bg-red-100 text-red-800 hover:bg-red-100',
      Tamamlandı: 'bg-purple-100 text-purple-800 hover:bg-purple-100',
    };

    const icons = {
      Yeni: <HelpingHand className="w-3 h-3 mr-1" />,
      İnceleniyor: <Clock className="w-3 h-3 mr-1" />,
      Onaylandı: <CheckCircle className="w-3 h-3 mr-1" />,
      Reddedildi: <XCircle className="w-3 h-3 mr-1" />,
      Tamamlandı: <CheckCircle className="w-3 h-3 mr-1" />,
    };

    return (
      <Badge className={`${variants[status]} flex items-center`}>
        {icons[status]}
        {status}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: AidRequest['priority']) => {
    const variants = {
      Düşük: 'bg-gray-100 text-gray-800',
      Orta: 'bg-blue-100 text-blue-800',
      Yüksek: 'bg-orange-100 text-orange-800',
      Acil: 'bg-red-100 text-red-800',
    };

    return (
      <Badge variant="secondary" className={variants[priority]}>
        {priority}
      </Badge>
    );
  };

  const getRequestTypeBadge = (type: AidRequest['requestType']) => {
    const variants = {
      'Acil Yardım': 'bg-red-50 text-red-700 border-red-200',
      Gıda: 'bg-green-50 text-green-700 border-green-200',
      Barınma: 'bg-blue-50 text-blue-700 border-blue-200',
      Sağlık: 'bg-purple-50 text-purple-700 border-purple-200',
      Eğitim: 'bg-yellow-50 text-yellow-700 border-yellow-200',
      Maddi: 'bg-gray-50 text-gray-700 border-gray-200',
    };

    return (
      <Badge variant="outline" className={variants[type]}>
        {type}
      </Badge>
    );
  };

  if (loading) {
    return <PageLoading />;
  }

  if (error) {
    return (
      <PageLayout title="Yardım Talepleri" subtitle="Hata oluştu">
        <div className="p-6 text-center text-red-600">{error}</div>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title="Yardım Talepleri"
      subtitle="Gelen yardım taleplerini değerlendirin ve yönetin"
      actions={
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Dışa Aktar
          </Button>
          <Button size="sm" onClick={() => handleNewRequest({})}>
            <Plus className="w-4 h-4 mr-2" />
            Yeni Talep
          </Button>
        </div>
      }
    >
      <div className="p-6 space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card className="border-0 shadow-md">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-600">{aidRequests.length}</div>
              <p className="text-sm text-gray-600">Toplam Talep</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-md">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-orange-600">
                {aidRequests.filter((r) => r.status === 'Yeni').length}
              </div>
              <p className="text-sm text-gray-600">Yeni</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-md">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-yellow-600">
                {aidRequests.filter((r) => r.status === 'İnceleniyor').length}
              </div>
              <p className="text-sm text-gray-600">İnceleniyor</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-md">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-red-600">
                {aidRequests.filter((r) => r.priority === 'Acil').length}
              </div>
              <p className="text-sm text-gray-600">Acil</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-md">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">
                {aidRequests.filter((r) => r.status === 'Tamamlandı').length}
              </div>
              <p className="text-sm text-gray-600">Tamamlandı</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="border-0 shadow-md">
          <CardHeader>
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <CardTitle>Yardım Talep Listesi</CardTitle>
              <div className="flex gap-2 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-64">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Talep ara..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                    }}
                    className="pl-10"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Durum" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tüm Durumlar</SelectItem>
                    <SelectItem value="Yeni">Yeni</SelectItem>
                    <SelectItem value="İnceleniyor">İnceleniyor</SelectItem>
                    <SelectItem value="Onaylandı">Onaylandı</SelectItem>
                    <SelectItem value="Reddedildi">Reddedildi</SelectItem>
                    <SelectItem value="Tamamlandı">Tamamlandı</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Öncelik" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tüm Öncelikler</SelectItem>
                    <SelectItem value="Acil">Acil</SelectItem>
                    <SelectItem value="Yüksek">Yüksek</SelectItem>
                    <SelectItem value="Orta">Orta</SelectItem>
                    <SelectItem value="Düşük">Düşük</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Başvuran</TableHead>
                  <TableHead>Talep Türü</TableHead>
                  <TableHead>Öncelik</TableHead>
                  <TableHead>Durum</TableHead>
                  <TableHead>Miktar</TableHead>
                  <TableHead>Tarih</TableHead>
                  <TableHead>Sorumlu</TableHead>
                  <TableHead className="text-right">İşlemler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRequests.map((request) => (
                  <TableRow key={request.id} className="hover:bg-gray-50">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src="" alt={request.applicant} />
                          <AvatarFallback className="bg-blue-100 text-blue-800">
                            {request.applicant
                              .split(' ')
                              .map((n) => n[0])
                              .join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{request.applicant}</div>
                          <div className="text-sm text-gray-500">{request.phone}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{getRequestTypeBadge(request.requestType)}</TableCell>
                    <TableCell>{getPriorityBadge(request.priority)}</TableCell>
                    <TableCell>{getStatusBadge(request.status)}</TableCell>
                    <TableCell className="font-semibold text-green-600">
                      {request.amount ? `₺${request.amount.toLocaleString()}` : '-'}
                    </TableCell>
                    <TableCell className="text-gray-500">
                      {new Date(request.submitDate).toLocaleDateString('tr-TR')}
                    </TableCell>
                    <TableCell className="text-gray-600">{request.assignedTo ?? '-'}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-1 justify-end">
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
}
