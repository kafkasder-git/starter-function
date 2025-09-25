import { useState } from 'react';
import { PageLayout } from '../PageLayout';
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
import { PageLoading } from '../LoadingSpinner';

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

// TODO: Load from API
const mockAidRequests: AidRequest[] = [];

export function AidPage() {
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [aidRequests] = useState<AidRequest[]>(mockAidRequests);

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

  return (
    <PageLayout
      title="Yardım Talepleri"
      subtitle="Gelen yardım taleplerini değerlendirin ve yönetin"
      actions={
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Dışa Aktar
          </Button>
          <Button size="sm">
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
                    <TableCell className="text-gray-600">{request.assignedTo || '-'}</TableCell>
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
