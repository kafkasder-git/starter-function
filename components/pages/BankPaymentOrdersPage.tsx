/**
 * @fileoverview BankPaymentOrdersPage Module - Application module
 * 
 * @author Dernek Yönetim Sistemi Team
 * @version 1.0.0
 */

import {
  Building2,
  Calendar,
  CheckCircle,
  Clock,
  CreditCard,
  Download,
  Eye,
  FileText,
  Plus,
  Search,
  Send,
  XCircle,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { PageLayout } from '../layouts/PageLayout';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { ProtectedRoute } from '../auth/ProtectedRoute';
import { Permission } from '../../types/auth';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Textarea } from '../ui/textarea';

interface PaymentOrder {
  id: number;
  orderNumber: string;
  recipientName: string;
  recipientId: string;
  recipientIban: string;
  recipientBank: string;
  amount: number;
  description: string;
  aidType: string;
  createdDate: string;
  scheduledDate: string;
  status: 'pending' | 'first_approved' | 'fully_approved' | 'sent' | 'completed' | 'failed' | 'cancelled';
  createdBy: string;
  firstApprovedBy?: string;
  firstApprovedDate?: string;
  secondApprovedBy?: string;
  secondApprovedDate?: string;
  transactionId?: string;
  failureReason?: string;
  requiresDualApproval: boolean;
}

const initialPaymentOrders: PaymentOrder[] = [];

/**
 * BankPaymentOrdersPage function
 * 
 * @param {Object} params - Function parameters
 * @returns {void} Nothing
 */
export function BankPaymentOrdersPage() {
  return (
    <ProtectedRoute requiredPermission={Permission.MANAGE_FINANCIAL}>
      <BankPaymentOrdersPageContent />
    </ProtectedRoute>
  );
}

function BankPaymentOrdersPageContent() {
  const [paymentOrders, setPaymentOrders] = useState<PaymentOrder[]>(initialPaymentOrders);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isNewOrderOpen, setIsNewOrderOpen] = useState(false);
  const [newOrder, setNewOrder] = useState({
    recipientName: '',
    recipientId: '',
    recipientIban: '',
    recipientBank: '',
    amount: '',
    description: '',
    aidType: '',
    scheduledDate: '',
  });

  const getStatusBadge = (status: PaymentOrder['status']) => {
    const statusConfig = {
      pending: { label: 'Bekliyor', color: 'bg-yellow-100 text-yellow-800' },
      first_approved: { label: '1. Onay', color: 'bg-orange-100 text-orange-800' },
      fully_approved: { label: 'Tam Onaylı', color: 'bg-blue-100 text-blue-800' },
      sent: { label: 'Gönderildi', color: 'bg-purple-100 text-purple-800' },
      completed: { label: 'Tamamlandı', color: 'bg-green-100 text-green-800' },
      failed: { label: 'Başarısız', color: 'bg-red-100 text-red-800' },
      cancelled: { label: 'İptal Edildi', color: 'bg-gray-100 text-gray-800' },
    };

    const config = statusConfig[status];
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  const getStatusIcon = (status: PaymentOrder['status']) => {
    const icons = {
      pending: <Clock className="w-4 h-4 text-yellow-600" />,
      first_approved: <CheckCircle className="w-4 h-4 text-orange-600" />,
      fully_approved: <CheckCircle className="w-4 h-4 text-blue-600" />,
      sent: <Send className="w-4 h-4 text-purple-600" />,
      completed: <CheckCircle className="w-4 h-4 text-green-600" />,
      failed: <XCircle className="w-4 h-4 text-red-600" />,
      cancelled: <XCircle className="w-4 h-4 text-gray-600" />,
    };
    return icons[status];
  };

  const filteredOrders = paymentOrders.filter((order) => {
    const matchesSearch =
      order.recipientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.recipientId.includes(searchTerm) ||
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: paymentOrders.length,
    pending: paymentOrders.filter((o) => o.status === 'pending').length,
    firstApproved: paymentOrders.filter((o) => o.status === 'first_approved').length,
    fullyApproved: paymentOrders.filter((o) => o.status === 'fully_approved').length,
    sent: paymentOrders.filter((o) => o.status === 'sent').length,
    completed: paymentOrders.filter((o) => o.status === 'completed').length,
    failed: paymentOrders.filter((o) => o.status === 'failed').length,
    totalAmount: paymentOrders
      .filter((o) => ['completed', 'sent'].includes(o.status))
      .reduce((sum, o) => sum + o.amount, 0),
  };

  const handleCreateOrder = () => {
    if (
      !newOrder.recipientName ||
      !newOrder.recipientId ||
      !newOrder.recipientIban ||
      !newOrder.amount ||
      !newOrder.description ||
      !newOrder.scheduledDate
    ) {
      toast.error('Lütfen tüm alanları doldurun');
      return;
    }

    const amount = parseFloat(newOrder.amount);
    if (amount <= 0) {
      toast.error('Geçerli bir tutar girin');
      return;
    }

    const requiresDualApproval = amount >= 5000; // 5000 TL ve üzeri çift onay gerektirir

    const order: PaymentOrder = {
      id: Date.now(),
      orderNumber: `BPO-2024-${String(paymentOrders.length + 1).padStart(3, '0')}`,
      recipientName: newOrder.recipientName,
      recipientId: newOrder.recipientId,
      recipientIban: newOrder.recipientIban,
      recipientBank: newOrder.recipientBank ?? 'Belirtilmemiş',
      amount,
      description: newOrder.description,
      aidType: newOrder.aidType ?? 'Nakdi Yardım',
      createdDate: new Date().toISOString().slice(0, 16).replace('T', ' '),
      scheduledDate: newOrder.scheduledDate,
      status: 'pending',
      createdBy: 'Admin Yöneticisi',
      requiresDualApproval,
    };

    setPaymentOrders((prev) => [order, ...prev]);
    setNewOrder({
      recipientName: '',
      recipientId: '',
      recipientIban: '',
      recipientBank: '',
      amount: '',
      description: '',
      aidType: '',
      scheduledDate: '',
    });
    setIsNewOrderOpen(false);
    toast.success('Ödeme emri başarıyla oluşturuldu');
  };

  const handleFirstApprove = (id: number) => {
    setPaymentOrders((prev) =>
      prev.map((order) =>
        order.id === id
          ? {
              ...order,
              status: 'first_approved' as const,
              firstApprovedBy: 'Manager 1',
              firstApprovedDate: new Date().toISOString(),
            }
          : order,
      ),
    );
    toast.success('İlk onay tamamlandı. İkinci onay bekleniyor.');
  };

  const handleSecondApprove = (id: number) => {
    setPaymentOrders((prev) =>
      prev.map((order) =>
        order.id === id
          ? {
              ...order,
              status: 'fully_approved' as const,
              secondApprovedBy: 'Manager 2',
              secondApprovedDate: new Date().toISOString(),
            }
          : order,
      ),
    );
    toast.success('İkinci onay tamamlandı. Ödeme emri göndermeye hazır.');
  };

  const handleApprove = (id: number) => {
    const order = paymentOrders.find((o) => o.id === id);
    if (!order) return;

    if (order.requiresDualApproval) {
      if (order.status === 'pending') {
        handleFirstApprove(id);
      } else if (order.status === 'first_approved') {
        handleSecondApprove(id);
      }
    } else {
      // Single approval for amounts < 5000 TL
      setPaymentOrders((prev) =>
        prev.map((o) =>
          o.id === id
            ? {
                ...o,
                status: 'fully_approved' as const,
                firstApprovedBy: 'Manager',
                firstApprovedDate: new Date().toISOString(),
              }
            : o,
        ),
      );
      toast.success('Ödeme emri onaylandı');
    }
  };

  const handleSend = (id: number) => {
    const order = paymentOrders.find((o) => o.id === id);
    if (!order) return;

    if (order.status !== 'fully_approved') {
      toast.error('Sadece tam onaylı ödeme emirleri gönderilebilir');
      return;
    }

    setPaymentOrders((prev) =>
      prev.map((o) =>
        o.id === id
          ? {
              ...o,
              status: 'sent' as const,
              transactionId: `TXN${Date.now()}`,
            }
          : o,
      ),
    );
    toast.success('Ödeme emri bankaya gönderildi');
  };

  return (
    <PageLayout
      title="Banka Ödeme Emirleri"
      subtitle="İhtiyaç sahiplerine banka havalesi ile yapılacak yardım ödemelerini yönetin"
      actions={
        <Dialog open={isNewOrderOpen} onOpenChange={setIsNewOrderOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              İhtiyaç Sahibi İçin Yeni Ödeme Emri
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg" aria-describedby="payment-order-description">
            <DialogHeader>
              <DialogTitle>Yeni Ödeme Emri Oluştur</DialogTitle>
              <p id="payment-order-description" className="text-sm text-muted-foreground">
                İhtiyaç sahibi için yeni ödeme emri oluşturun. Zorunlu alanları (*) doldurmanız gereklidir.
              </p>
            </DialogHeader>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="recipient-name">Alıcı Adı</Label>
                  <Input
                    id="recipient-name"
                    placeholder="Ad Soyad"
                    value={newOrder.recipientName}
                    onChange={(e) => {
                      setNewOrder((prev) => ({ ...prev, recipientName: e.target.value }));
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="recipient-id">TC Kimlik No</Label>
                  <Input
                    id="recipient-id"
                    placeholder="12345678901"
                    value={newOrder.recipientId}
                    onChange={(e) => {
                      setNewOrder((prev) => ({ ...prev, recipientId: e.target.value }));
                    }}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="recipient-iban">IBAN</Label>
                <Input
                  id="recipient-iban"
                  placeholder="TR000000000000000000000000"
                  value={newOrder.recipientIban}
                  onChange={(e) => {
                    setNewOrder((prev) => ({ ...prev, recipientIban: e.target.value }));
                  }}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="recipient-bank">Banka Adı</Label>
                <Input
                  id="recipient-bank"
                  placeholder="Banka adı (opsiyonel)"
                  value={newOrder.recipientBank}
                  onChange={(e) => {
                    setNewOrder((prev) => ({ ...prev, recipientBank: e.target.value }));
                  }}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Tutar (TL)</Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="0.00"
                    value={newOrder.amount}
                    onChange={(e) => {
                      setNewOrder((prev) => ({ ...prev, amount: e.target.value }));
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="scheduled-date">Ödeme Tarihi</Label>
                  <Input
                    id="scheduled-date"
                    type="date"
                    value={newOrder.scheduledDate}
                    onChange={(e) => {
                      setNewOrder((prev) => ({ ...prev, scheduledDate: e.target.value }));
                    }}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="aid-type">Yardım Türü</Label>
                <Select
                  value={newOrder.aidType}
                  onValueChange={(value) => {
                    setNewOrder((prev) => ({ ...prev, aidType: value }));
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Yardım türü seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Kira Yardımı">Kira Yardımı</SelectItem>
                    <SelectItem value="Fatura Yardımı">Fatura Yardımı</SelectItem>
                    <SelectItem value="Sağlık Yardımı">Sağlık Yardımı</SelectItem>
                    <SelectItem value="Eğitim Yardımı">Eğitim Yardımı</SelectItem>
                    <SelectItem value="Nakdi Yardım">Nakdi Yardım</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Açıklama</Label>
                <Textarea
                  id="description"
                  placeholder="Ödeme açıklaması..."
                  value={newOrder.description}
                  onChange={(e) => {
                    setNewOrder((prev) => ({ ...prev, description: e.target.value }));
                  }}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsNewOrderOpen(false);
                  }}
                >
                  İptal
                </Button>
                <Button onClick={handleCreateOrder}>Ödeme Emri Oluştur</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      }
    >
      <div className="p-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FileText className="w-5 h-5 text-blue-600" />
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
                  <CheckCircle className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Onaylı</p>
                  <p className="text-xl font-bold">{stats.firstApproved + stats.fullyApproved}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Send className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Gönderildi</p>
                  <p className="text-xl font-bold">{stats.sent}</p>
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
                <div className="p-2 bg-orange-100 rounded-lg">
                  <CreditCard className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Toplam Tutar</p>
                  <p className="text-lg font-bold">₺{stats.totalAmount.toLocaleString('tr-TR')}</p>
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
                    placeholder="İhtiyaç sahibinin adı, TC kimlik, emir no veya açıklama ile ara..."
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
                    <SelectItem value="approved">Onaylandı</SelectItem>
                    <SelectItem value="sent">Gönderildi</SelectItem>
                    <SelectItem value="completed">Tamamlandı</SelectItem>
                    <SelectItem value="failed">Başarısız</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Orders Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-blue-600" />
              Ödeme Emirleri ({filteredOrders.length} emir)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Emir No</TableHead>
                    <TableHead>İhtiyaç Sahibi Bilgileri</TableHead>
                    <TableHead>Banka/IBAN</TableHead>
                    <TableHead>Tutar</TableHead>
                    <TableHead>Ödeme Tarihi</TableHead>
                    <TableHead>Durum</TableHead>
                    <TableHead>Oluşturan</TableHead>
                    <TableHead>İşlemler</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-gray-400" />
                          <span className="font-mono text-sm">{order.orderNumber}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{order.recipientName}</p>
                          <p className="text-sm text-muted-foreground">{order.recipientId}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="text-sm font-medium">{order.recipientBank}</p>
                          <p className="text-xs text-muted-foreground font-mono">
                            {order.recipientIban.slice(0, 8)}...{order.recipientIban.slice(-4)}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">₺{order.amount.toLocaleString('tr-TR')}</p>
                          <p className="text-xs text-muted-foreground">{order.aidType}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          {new Date(order.scheduledDate).toLocaleDateString('tr-TR')}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(order.status)}
                          {getStatusBadge(order.status)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">{order.createdBy}</span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                          {order.status === 'pending' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                handleApprove(order.id);
                              }}
                              className="text-blue-600 hover:text-blue-700"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </Button>
                          )}
                          {(order.status === 'first_approved' || order.status === 'fully_approved') && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                handleSend(order.id);
                              }}
                              className="text-purple-600 hover:text-purple-700"
                            >
                              <Send className="w-4 h-4" />
                            </Button>
                          )}
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
