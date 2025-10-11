/**
 * @fileoverview AllAidListPage Module - Application module
 * 
 * @author Dernek Yönetim Sistemi Team
 * @version 1.0.0
 */

import { useState } from 'react';
import { PageLayout } from '../layouts/PageLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import {
  List,
  Search,
  Download,
  FileText,
  Calendar,
  Users,
  TrendingUp,
  HandHeart,
  Banknote,
  Gift,
  Heart,
  GraduationCap,
  Eye,
  Edit,
} from 'lucide-react';

interface AidRecord {
  id: number;
  recipientName: string;
  recipientId: string;
  aidType: string;
  category: string;
  amount: number;
  deliveryDate: string;
  status: 'delivered' | 'pending' | 'cancelled';
  deliveryMethod: string;
  approvedBy: string;
  description: string;
  documentNumber: string;
}

const initialAidRecords: AidRecord[] = [];

/**
 * AllAidListPage function
 * 
 * @param {Object} params - Function parameters
 * @returns {void} Nothing
 */
export function AllAidListPage() {
  const [aidRecords] = useState<AidRecord[]>(initialAidRecords);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [aidTypeFilter, setAidTypeFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState<string>('all');

  const getStatusBadge = (status: AidRecord['status']) => {
    const statusConfig = {
      delivered: { label: 'Teslim Edildi', color: 'bg-green-100 text-green-800' },
      pending: { label: 'Beklemede', color: 'bg-yellow-100 text-yellow-800' },
      cancelled: { label: 'İptal Edildi', color: 'bg-red-100 text-red-800' },
    };

    const config = statusConfig[status];
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  const getAidTypeIcon = (aidType: string) => {
    const icons = {
      'Nakdi Yardım': <Banknote className="w-4 h-4 text-green-600" />,
      'Ayni Yardım': <Gift className="w-4 h-4 text-blue-600" />,
      'Sağlık Yardımı': <Heart className="w-4 h-4 text-red-600" />,
      'Eğitim Yardımı': <GraduationCap className="w-4 h-4 text-purple-600" />,
    };
    return icons[aidType as keyof typeof icons] || <HandHeart className="w-4 h-4 text-gray-600" />;
  };

  const filteredRecords = aidRecords.filter((record) => {
    const matchesSearch =
      record.recipientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.recipientId.includes(searchTerm) ||
      record.documentNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || record.status === statusFilter;
    const matchesAidType = aidTypeFilter === 'all' || record.aidType === aidTypeFilter;

    return matchesSearch && matchesStatus && matchesAidType;
  });

  const stats = {
    total: aidRecords.length,
    delivered: aidRecords.filter((r) => r.status === 'delivered').length,
    pending: aidRecords.filter((r) => r.status === 'pending').length,
    totalAmount: aidRecords
      .filter((r) => r.status === 'delivered' && r.amount > 0)
      .reduce((sum, r) => sum + r.amount, 0),
    monthlyAmount: aidRecords
      .filter(
        (r) =>
          r.status === 'delivered' &&
          r.amount > 0 &&
          new Date(r.deliveryDate).getMonth() === new Date().getMonth(),
      )
      .reduce((sum, r) => sum + r.amount, 0),
  };

  const handleExport = () => {
    // Export functionality would be implemented here
  };

  return (
    <PageLayout
      title="Tüm Yardımlar Listesi"
      subtitle="İhtiyaç sahiplerine gerçekleştirilen tüm yardım işlemlerini görüntüleyin ve takip edin"
      actions={
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Dışa Aktar
          </Button>
          <Button variant="outline">
            <FileText className="w-4 h-4 mr-2" />
            Rapor Oluştur
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
                  <List className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Toplam Yardım</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Users className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Teslim Edildi</p>
                  <p className="text-2xl font-bold">{stats.delivered}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Toplam Tutar</p>
                  <p className="text-2xl font-bold">₺{stats.totalAmount.toLocaleString('tr-TR')}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Calendar className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Bu Ay</p>
                  <p className="text-2xl font-bold">
                    ₺{stats.monthlyAmount.toLocaleString('tr-TR')}
                  </p>
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
                    placeholder="İhtiyaç sahibinin adı, TC kimlik, belge no veya açıklama ile ara..."
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
                    <SelectItem value="delivered">Teslim Edildi</SelectItem>
                    <SelectItem value="pending">Beklemede</SelectItem>
                    <SelectItem value="cancelled">İptal Edildi</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={aidTypeFilter} onValueChange={setAidTypeFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Yardım Türü" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tüm Türler</SelectItem>
                    <SelectItem value="Nakdi Yardım">Nakdi Yardım</SelectItem>
                    <SelectItem value="Ayni Yardım">Ayni Yardım</SelectItem>
                    <SelectItem value="Sağlık Yardımı">Sağlık Yardımı</SelectItem>
                    <SelectItem value="Eğitim Yardımı">Eğitim Yardımı</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={dateRange} onValueChange={setDateRange}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Tarih Aralığı" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tüm Zamanlar</SelectItem>
                    <SelectItem value="today">Bugün</SelectItem>
                    <SelectItem value="week">Son 7 Gün</SelectItem>
                    <SelectItem value="month">Bu Ay</SelectItem>
                    <SelectItem value="quarter">Son 3 Ay</SelectItem>
                    <SelectItem value="year">Bu Yıl</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Aid Records Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HandHeart className="w-5 h-5 text-blue-600" />
              Yardım Kayıtları ({filteredRecords.length} kayıt)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Belge No</TableHead>
                    <TableHead>İhtiyaç Sahibi</TableHead>
                    <TableHead>Yardım Türü</TableHead>
                    <TableHead>Kategori</TableHead>
                    <TableHead>Tutar/Açıklama</TableHead>
                    <TableHead>Teslim Tarihi</TableHead>
                    <TableHead>Durum</TableHead>
                    <TableHead>Onaylayan</TableHead>
                    <TableHead>İşlemler</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRecords.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-gray-400" />
                          <span className="font-mono text-sm">{record.documentNumber}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{record.recipientName}</p>
                          <p className="text-sm text-muted-foreground">{record.recipientId}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getAidTypeIcon(record.aidType)}
                          <Badge variant="outline">{record.aidType}</Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">{record.category}</span>
                      </TableCell>
                      <TableCell>
                        {record.amount > 0 ? (
                          <div>
                            <p className="font-medium">₺{record.amount.toLocaleString('tr-TR')}</p>
                            <p className="text-sm text-muted-foreground">{record.deliveryMethod}</p>
                          </div>
                        ) : (
                          <div>
                            <p className="text-sm">{record.description}</p>
                            <p className="text-xs text-muted-foreground">{record.deliveryMethod}</p>
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          {new Date(record.deliveryDate).toLocaleDateString('tr-TR')}
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(record.status)}</TableCell>
                      <TableCell>
                        <span className="text-sm">{record.approvedBy}</span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Download className="w-4 h-4" />
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

export default AllAidListPage;
