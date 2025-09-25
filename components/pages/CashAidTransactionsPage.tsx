import { useState } from 'react';
import { PageLayout } from '../PageLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import {
  Banknote,
  Search,
  Plus,
  Eye,
  FileText,
  Calendar,
  TrendingUp,
  HandHeart,
  Download,
} from 'lucide-react';

interface CashTransaction {
  id: number;
  transactionNumber: string;
  recipientName: string;
  recipientId: string;
  amount: number;
  transactionDate: string;
  aidCategory: string;
  paymentMethod: 'cash' | 'bank_transfer' | 'check';
  status: 'completed' | 'pending' | 'cancelled';
  description: string;
  processedBy: string;
  approvedBy: string;
  documentPath?: string;
}

const mockTransactions: CashTransaction[] = [
  {
    id: 1,
    transactionNumber: 'NCT-2024-001',
    recipientName: 'Ayşe Yılmaz',
    recipientId: '12345678901',
    amount: 2500,
    transactionDate: '2024-01-15 14:30',
    aidCategory: 'Kira Yardımı',
    paymentMethod: 'bank_transfer',
    status: 'completed',
    description: 'Ocak ayı kira yardımı ödemesi',
    processedBy: 'Fatma Koordinatör',
    approvedBy: 'Mehmet Yönetici',
  },
  {
    id: 2,
    transactionNumber: 'NCT-2024-002',
    recipientName: 'Mehmet Demir',
    recipientId: '98765432109',
    amount: 1200,
    transactionDate: '2024-01-15 11:15',
    aidCategory: 'Fatura Yardımı',
    paymentMethod: 'cash',
    status: 'completed',
    description: 'Elektrik ve doğalgaz fatura ödemesi',
    processedBy: 'Hasan Mali Müşavir',
    approvedBy: 'Ayşe Muhasebe',
  },
  {
    id: 3,
    transactionNumber: 'NCT-2024-003',
    recipientName: 'Fatma Kaya',
    recipientId: '11223344556',
    amount: 3500,
    transactionDate: '2024-01-14 16:45',
    aidCategory: 'Sağlık Yardımı',
    paymentMethod: 'bank_transfer',
    status: 'pending',
    description: 'Ameliyat masrafları için yardım',
    processedBy: 'Zeynep Sosyal Hizmet',
    approvedBy: 'Dr. Ali Başhekim',
  },
  {
    id: 4,
    transactionNumber: 'NCT-2024-004',
    recipientName: 'Ali Özkan',
    recipientId: '55667788990',
    amount: 1500,
    transactionDate: '2024-01-14 09:20',
    aidCategory: 'Eğitim Yardımı',
    paymentMethod: 'check',
    status: 'completed',
    description: 'Üniversite harç ve kitap masrafları',
    processedBy: 'Elif Eğitim Sorumlusu',
    approvedBy: 'Mehmet Yönetici',
  },
];

export function CashAidTransactionsPage() {
  const [transactions, setTransactions] = useState<CashTransaction[]>(mockTransactions);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState<string>('all');

  const getStatusBadge = (status: CashTransaction['status']) => {
    const statusConfig = {
      completed: { label: 'Tamamlandı', color: 'bg-green-100 text-green-800' },
      pending: { label: 'Beklemede', color: 'bg-yellow-100 text-yellow-800' },
      cancelled: { label: 'İptal Edildi', color: 'bg-red-100 text-red-800' },
    };

    const config = statusConfig[status];
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  const getPaymentMethodBadge = (method: CashTransaction['paymentMethod']) => {
    const methodConfig = {
      cash: { label: 'Nakit', color: 'bg-blue-100 text-blue-800' },
      bank_transfer: { label: 'Havale', color: 'bg-purple-100 text-purple-800' },
      check: { label: 'Çek', color: 'bg-orange-100 text-orange-800' },
    };

    const config = methodConfig[method];
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  const filteredTransactions = transactions.filter((transaction) => {
    const matchesSearch =
      transaction.recipientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.recipientId.includes(searchTerm) ||
      transaction.transactionNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || transaction.status === statusFilter;
    const matchesPaymentMethod =
      paymentMethodFilter === 'all' || transaction.paymentMethod === paymentMethodFilter;

    return matchesSearch && matchesStatus && matchesPaymentMethod;
  });

  const stats = {
    total: transactions.length,
    completed: transactions.filter((t) => t.status === 'completed').length,
    pending: transactions.filter((t) => t.status === 'pending').length,
    totalAmount: transactions
      .filter((t) => t.status === 'completed')
      .reduce((sum, t) => sum + t.amount, 0),
    todayAmount: transactions
      .filter(
        (t) =>
          t.status === 'completed' &&
          new Date(t.transactionDate).toDateString() === new Date().toDateString(),
      )
      .reduce((sum, t) => sum + t.amount, 0),
  };

  return (
    <PageLayout
      title="Nakdi Yardım İşlemleri"
      subtitle="İhtiyaç sahiplerine gerçekleştirilen nakdi yardım işlemlerini görüntüleyin ve yönetin"
      actions={
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Rapor Al
          </Button>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            İhtiyaç Sahibi İçin Yeni İşlem
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
                  <FileText className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Toplam İşlem</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <HandHeart className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Tamamlanan</p>
                  <p className="text-2xl font-bold">{stats.completed}</p>
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
                  <p className="text-sm text-muted-foreground">Bugün Ödenen</p>
                  <p className="text-2xl font-bold">₺{stats.todayAmount.toLocaleString('tr-TR')}</p>
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
                    placeholder="İhtiyaç sahibinin adı, TC kimlik, işlem no veya açıklama ile ara..."
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
                    <SelectItem value="completed">Tamamlandı</SelectItem>
                    <SelectItem value="pending">Beklemede</SelectItem>
                    <SelectItem value="cancelled">İptal Edildi</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={paymentMethodFilter} onValueChange={setPaymentMethodFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Ödeme Yöntemi" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tüm Yöntemler</SelectItem>
                    <SelectItem value="cash">Nakit</SelectItem>
                    <SelectItem value="bank_transfer">Havale</SelectItem>
                    <SelectItem value="check">Çek</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Transactions Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Banknote className="w-5 h-5 text-blue-600" />
              Nakdi Yardım İşlemleri ({filteredTransactions.length} işlem)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>İşlem No</TableHead>
                    <TableHead>İhtiyaç Sahibi</TableHead>
                    <TableHead>Tutar</TableHead>
                    <TableHead>Kategori</TableHead>
                    <TableHead>Ödeme Yöntemi</TableHead>
                    <TableHead>İşlem Tarihi</TableHead>
                    <TableHead>Durum</TableHead>
                    <TableHead>İşleyen</TableHead>
                    <TableHead>İşlemler</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-gray-400" />
                          <span className="font-mono text-sm">{transaction.transactionNumber}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{transaction.recipientName}</p>
                          <p className="text-sm text-muted-foreground">{transaction.recipientId}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Banknote className="w-4 h-4 text-green-600" />
                          <span className="font-medium">
                            ₺{transaction.amount.toLocaleString('tr-TR')}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{transaction.aidCategory}</Badge>
                      </TableCell>
                      <TableCell>{getPaymentMethodBadge(transaction.paymentMethod)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="text-sm">
                            {new Date(transaction.transactionDate).toLocaleString('tr-TR')}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(transaction.status)}</TableCell>
                      <TableCell>
                        <div>
                          <p className="text-sm font-medium">{transaction.processedBy}</p>
                          <p className="text-xs text-muted-foreground">
                            Onay: {transaction.approvedBy}
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
