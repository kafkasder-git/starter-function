/**
 * @fileoverview InKindAidTransactionsPage Module - Application module
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
  Gift,
  Search,
  Plus,
  Eye,
  FileText,
  Calendar,
  Package,
  Shirt,
  Utensils,
  Home,
  BookOpen,
  Heart,
  Download,
} from 'lucide-react';

interface InKindTransaction {
  id: number;
  transactionNumber: string;
  recipientName: string;
  recipientId: string;
  itemCategory: string;
  itemDescription: string;
  quantity: number;
  unit: string;
  estimatedValue: number;
  deliveryDate: string;
  deliveryMethod: 'pickup' | 'delivery' | 'voucher';
  status: 'delivered' | 'prepared' | 'cancelled';
  processedBy: string;
  approvedBy: string;
  storageLocation?: string;
  notes?: string;
}

const initialTransactions: InKindTransaction[] = [
  {
    id: 1,
    transactionNumber: 'AYT-2024-001',
    recipientName: 'Ayşe Yılmaz',
    recipientId: '12345678901',
    itemCategory: 'Gıda',
    itemDescription: 'Gıda kolisi (15 parça temel gıda)',
    quantity: 1,
    unit: 'Koli',
    estimatedValue: 350,
    deliveryDate: '2024-01-15 14:30',
    deliveryMethod: 'delivery',
    status: 'delivered',
    processedBy: 'Fatma Koordinatör',
    approvedBy: 'Mehmet Yönetici',
    storageLocation: 'Depo A-15',
    notes: 'Ailede 4 kişi var',
  },
  {
    id: 2,
    transactionNumber: 'AYT-2024-002',
    recipientName: 'Mehmet Demir',
    recipientId: '98765432109',
    itemCategory: 'Giyim',
    itemDescription: 'Kış kıyafetleri seti (çocuk)',
    quantity: 3,
    unit: 'Takım',
    estimatedValue: 450,
    deliveryDate: '2024-01-15 11:15',
    deliveryMethod: 'pickup',
    status: 'delivered',
    processedBy: 'Zeynep Sosyal Hizmet',
    approvedBy: 'Ayşe Muhasebe',
    storageLocation: 'Depo B-08',
    notes: '3 çocuk için farklı boylar',
  },
  {
    id: 3,
    transactionNumber: 'AYT-2024-003',
    recipientName: 'Fatma Kaya',
    recipientId: '11223344556',
    itemCategory: 'Ev Eşyası',
    itemDescription: 'Temizlik malzemesi paketi',
    quantity: 2,
    unit: 'Paket',
    estimatedValue: 180,
    deliveryDate: '2024-01-14 16:45',
    deliveryMethod: 'voucher',
    status: 'prepared',
    processedBy: 'Hasan Depo Sorumlusu',
    approvedBy: 'Fatma Koordinatör',
    storageLocation: 'Depo C-12',
    notes: 'Market voucher olarak verilecek',
  },
  {
    id: 4,
    transactionNumber: 'AYT-2024-004',
    recipientName: 'Ali Özkan',
    recipientId: '55667788990',
    itemCategory: 'Eğitim',
    itemDescription: 'Okul malzemesi seti',
    quantity: 1,
    unit: 'Set',
    estimatedValue: 275,
    deliveryDate: '2024-01-14 09:20',
    deliveryMethod: 'pickup',
    status: 'delivered',
    processedBy: 'Elif Eğitim Sorumlusu',
    approvedBy: 'Mehmet Yönetici',
    storageLocation: 'Depo D-05',
    notes: 'Lise öğrencisi için',
  },
  {
    id: 5,
    transactionNumber: 'AYT-2024-005',
    recipientName: 'Zeynep Arslan',
    recipientId: '99887766554',
    itemCategory: 'Sağlık',
    itemDescription: 'Medikal malzeme paketi',
    quantity: 1,
    unit: 'Paket',
    estimatedValue: 320,
    deliveryDate: '2024-01-13 13:00',
    deliveryMethod: 'delivery',
    status: 'cancelled',
    processedBy: 'Dr. Ali Başhekim',
    approvedBy: 'Zeynep Sosyal Hizmet',
    notes: 'İptal - başka yerden temin edildi',
  },
];

/**
 * InKindAidTransactionsPage function
 *
 * @param {Object} params - Function parameters
 * @returns {void} Nothing
 */
export function InKindAidTransactionsPage() {
  const [transactions, setTransactions] = useState<InKindTransaction[]>(initialTransactions);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [showDeliveryDialog, setShowDeliveryDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    recipientName: '',
    recipientId: '',
    itemCategory: 'Gıda',
    itemDescription: '',
    quantity: 1,
    unit: 'Koli',
    estimatedValue: 0,
    deliveryDate: new Date().toISOString().split('T')[0],
    deliveryMethod: 'delivery' as InKindTransaction['deliveryMethod'],
    storageLocation: '',
    notes: '',
  });

  const getStatusBadge = (status: InKindTransaction['status']) => {
    const statusConfig = {
      delivered: { label: 'Teslim Edildi', color: 'bg-green-100 text-green-800' },
      prepared: { label: 'Hazırlandı', color: 'bg-blue-100 text-blue-800' },
      cancelled: { label: 'İptal Edildi', color: 'bg-red-100 text-red-800' },
    };

    const config = statusConfig[status];
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  const getDeliveryMethodBadge = (method: InKindTransaction['deliveryMethod']) => {
    const methodConfig = {
      pickup: { label: 'Teslim Alındı', color: 'bg-purple-100 text-purple-800' },
      delivery: { label: 'Kurye', color: 'bg-orange-100 text-orange-800' },
      voucher: { label: 'Voucher', color: 'bg-blue-100 text-blue-800' },
    };

    const config = methodConfig[method];
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  const getCategoryIcon = (category: string) => {
    const icons = {
      Gıda: <Utensils className="h-4 w-4 text-green-600" />,
      Giyim: <Shirt className="h-4 w-4 text-blue-600" />,
      'Ev Eşyası': <Home className="h-4 w-4 text-orange-600" />,
      Eğitim: <BookOpen className="h-4 w-4 text-purple-600" />,
      Sağlık: <Heart className="h-4 w-4 text-red-600" />,
    };
    return icons[category as keyof typeof icons] || <Package className="h-4 w-4 text-gray-600" />;
  };

  const filteredTransactions = transactions.filter((transaction) => {
    const matchesSearch =
      transaction.recipientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.recipientId.includes(searchTerm) ||
      transaction.transactionNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.itemDescription.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || transaction.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || transaction.itemCategory === categoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  const stats = {
    total: transactions.length,
    delivered: transactions.filter((t) => t.status === 'delivered').length,
    prepared: transactions.filter((t) => t.status === 'prepared').length,
    totalValue: transactions
      .filter((t) => t.status === 'delivered')
      .reduce((sum, t) => sum + t.estimatedValue, 0),
    todayDeliveries: transactions.filter(
      (t) =>
        t.status === 'delivered' &&
        new Date(t.deliveryDate).toDateString() === new Date().toDateString(),
    ).length,
  };

  const handleExportReport = () => {
    toast.success('Envanter raporu hazırlanıyor...');
  };

  const handleCreateDelivery = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.recipientName || !formData.recipientId || !formData.itemDescription) {
      toast.error('Lütfen zorunlu alanları doldurun');
      return;
    }

    try {
      setIsSubmitting(true);

      // TODO: Integrate with actual API
      // const result = await inKindAidService.createDelivery(formData);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Add to local state for demonstration
      const newTransaction: InKindTransaction = {
        id: Math.max(...transactions.map((t) => t.id), 0) + 1,
        transactionNumber: `AYT-${new Date().getFullYear()}-${String(transactions.length + 1).padStart(3, '0')}`,
        ...formData,
        deliveryDate: `${formData.deliveryDate} ${new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}`,
        status: 'prepared',
        processedBy: 'Sistem Kullanıcısı',
        approvedBy: 'Bekliyor',
      };

      setTransactions((prev) => [newTransaction, ...prev]);

      toast.success('Teslimat kaydı başarıyla oluşturuldu!');
      setShowDeliveryDialog(false);

      // Reset form
      setFormData({
        recipientName: '',
        recipientId: '',
        itemCategory: 'Gıda',
        itemDescription: '',
        quantity: 1,
        unit: 'Koli',
        estimatedValue: 0,
        deliveryDate: new Date().toISOString().split('T')[0],
        deliveryMethod: 'delivery',
        storageLocation: '',
        notes: '',
      });
    } catch {
      toast.error('Teslimat kaydı oluşturulurken hata oluştu');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageLayout
      title="Ayni Yardım İşlemleri"
      subtitle="İhtiyaç sahiplerine gerçekleştirilen ayni yardım teslimatlarını görüntüleyin ve yönetin"
      actions={
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportReport}>
            <Download className="mr-2 h-4 w-4" />
            Envanter Raporu
          </Button>
          <Button
            onClick={() => {
              setShowDeliveryDialog(true);
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            İhtiyaç Sahibi İçin Yeni Teslimat
          </Button>
        </div>
      }
    >
      <div className="space-y-6 p-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-blue-100 p-2">
                  <Package className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">Toplam İşlem</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-green-100 p-2">
                  <Gift className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">Teslim Edildi</p>
                  <p className="text-2xl font-bold">{stats.delivered}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-purple-100 p-2">
                  <FileText className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">Toplam Değer</p>
                  <p className="text-2xl font-bold">₺{stats.totalValue.toLocaleString('tr-TR')}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-orange-100 p-2">
                  <Calendar className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">Bugün Teslim</p>
                  <p className="text-2xl font-bold">{stats.todayDeliveries}</p>
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
                    placeholder="İhtiyaç sahibinin adı, TC kimlik, işlem no veya ürün açıklaması ile ara..."
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
                    <SelectItem value="prepared">Hazırlandı</SelectItem>
                    <SelectItem value="cancelled">İptal Edildi</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Kategori" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tüm Kategoriler</SelectItem>
                    <SelectItem value="Gıda">Gıda</SelectItem>
                    <SelectItem value="Giyim">Giyim</SelectItem>
                    <SelectItem value="Ev Eşyası">Ev Eşyası</SelectItem>
                    <SelectItem value="Eğitim">Eğitim</SelectItem>
                    <SelectItem value="Sağlık">Sağlık</SelectItem>
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
              <Gift className="h-5 w-5 text-blue-600" />
              Ayni Yardım İşlemleri ({filteredTransactions.length} işlem)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>İşlem No</TableHead>
                    <TableHead>İhtiyaç Sahibi</TableHead>
                    <TableHead>Kategori</TableHead>
                    <TableHead>Ürün/Açıklama</TableHead>
                    <TableHead>Miktar</TableHead>
                    <TableHead>Değer</TableHead>
                    <TableHead>Teslimat</TableHead>
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
                          <FileText className="h-4 w-4 text-gray-400" />
                          <span className="font-mono text-sm">{transaction.transactionNumber}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{transaction.recipientName}</p>
                          <p className="text-muted-foreground text-sm">{transaction.recipientId}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getCategoryIcon(transaction.itemCategory)}
                          <Badge variant="outline">{transaction.itemCategory}</Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="text-sm font-medium">{transaction.itemDescription}</p>
                          {transaction.notes && (
                            <p className="text-muted-foreground text-xs">{transaction.notes}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-center">
                          <p className="font-medium">{transaction.quantity}</p>
                          <p className="text-muted-foreground text-xs">{transaction.unit}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">
                          ₺{transaction.estimatedValue.toLocaleString('tr-TR')}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div>
                          {getDeliveryMethodBadge(transaction.deliveryMethod)}
                          <p className="text-muted-foreground mt-1 text-xs">
                            {new Date(transaction.deliveryDate).toLocaleDateString('tr-TR')}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(transaction.status)}</TableCell>
                      <TableCell>
                        <div>
                          <p className="text-sm font-medium">{transaction.processedBy}</p>
                          <p className="text-muted-foreground text-xs">
                            Onay: {transaction.approvedBy}
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
                            <Download className="h-4 w-4" />
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

      {/* Delivery Dialog */}
      <Dialog open={showDeliveryDialog} onOpenChange={setShowDeliveryDialog}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Gift className="h-5 w-5" />
              Yeni Ayni Yardım Teslimatı
            </DialogTitle>
            <DialogDescription>
              İhtiyaç sahibi için yeni teslimat kaydı oluşturun. Zorunlu alanları (*) doldurmanız
              gereklidir.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateDelivery} className="space-y-4 py-4">
            {/* Recipient Info */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="recipientName">
                  Alıcı Adı <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="recipientName"
                  value={formData.recipientName}
                  onChange={(e) => {
                    setFormData({ ...formData, recipientName: e.target.value });
                  }}
                  placeholder="İhtiyaç sahibinin adı"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="recipientId">
                  T.C. Kimlik No <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="recipientId"
                  value={formData.recipientId}
                  onChange={(e) => {
                    setFormData({ ...formData, recipientId: e.target.value });
                  }}
                  placeholder="11 haneli kimlik numarası"
                  required
                  maxLength={11}
                />
              </div>
            </div>

            {/* Item Info */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="itemCategory">Kategori</Label>
                <Select
                  value={formData.itemCategory}
                  onValueChange={(value) => {
                    setFormData({ ...formData, itemCategory: value });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Kategori seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Gıda">Gıda</SelectItem>
                    <SelectItem value="Giyim">Giyim</SelectItem>
                    <SelectItem value="Ev Eşyası">Ev Eşyası</SelectItem>
                    <SelectItem value="Eğitim">Eğitim</SelectItem>
                    <SelectItem value="Sağlık">Sağlık</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="deliveryMethod">Teslimat Yöntemi</Label>
                <Select
                  value={formData.deliveryMethod}
                  onValueChange={(value: InKindTransaction['deliveryMethod']) => {
                    setFormData({ ...formData, deliveryMethod: value });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Yöntem seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="delivery">Kurye</SelectItem>
                    <SelectItem value="pickup">Teslim Alındı</SelectItem>
                    <SelectItem value="voucher">Voucher</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Item Description */}
            <div className="space-y-2">
              <Label htmlFor="itemDescription">
                Yardım Açıklaması <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="itemDescription"
                value={formData.itemDescription}
                onChange={(e) => {
                  setFormData({ ...formData, itemDescription: e.target.value });
                }}
                placeholder="Teslim edilen yardımın detaylı açıklaması"
                rows={2}
                required
              />
            </div>

            {/* Quantity and Value */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="quantity">Miktar</Label>
                <Input
                  id="quantity"
                  type="number"
                  value={formData.quantity || ''}
                  onChange={(e) => {
                    setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 });
                  }}
                  placeholder="1"
                  min="1"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="unit">Birim</Label>
                <Input
                  id="unit"
                  value={formData.unit}
                  onChange={(e) => {
                    setFormData({ ...formData, unit: e.target.value });
                  }}
                  placeholder="Koli, Paket, vb."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="estimatedValue">Tahmini Değer (TL)</Label>
                <Input
                  id="estimatedValue"
                  type="number"
                  value={formData.estimatedValue || ''}
                  onChange={(e) => {
                    setFormData({ ...formData, estimatedValue: parseFloat(e.target.value) || 0 });
                  }}
                  placeholder="0"
                  min="0"
                />
              </div>
            </div>

            {/* Date and Location */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="deliveryDate">Teslimat Tarihi</Label>
                <Input
                  id="deliveryDate"
                  type="date"
                  value={formData.deliveryDate}
                  onChange={(e) => {
                    setFormData({ ...formData, deliveryDate: e.target.value });
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="storageLocation">Depo Lokasyonu</Label>
                <Input
                  id="storageLocation"
                  value={formData.storageLocation}
                  onChange={(e) => {
                    setFormData({ ...formData, storageLocation: e.target.value });
                  }}
                  placeholder="Örn: Depo A-15"
                />
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
                placeholder="Ek notlar ve özel durumlar"
                rows={2}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-2 border-t pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowDeliveryDialog(false);
                }}
                disabled={isSubmitting}
              >
                İptal
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Kaydediliyor...' : 'Teslimat Oluştur'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </PageLayout>
  );
}
