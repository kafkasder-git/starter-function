/**
 * @fileoverview InKindAidTransactionsPage Module - Application module
 *
 * @author Dernek Yönetim Sistemi Team
 * @version 1.0.0
 */

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { PageLayout } from '../layouts/PageLayout';
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
import { db, collections, queryHelpers } from '../../lib/database';
import { logger } from '../../lib/logging/logger';

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

/**
 * InKindAidTransactionsPage function
 *
 * @param {Object} params - Function parameters
 * @returns {void} Nothing
 */
export function InKindAidTransactionsPage() {
  const [transactions, setTransactions] = useState<InKindTransaction[]>([]);
  const [loading, setLoading] = useState(true);
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

  const loadTransactions = async () => {
    try {
      setLoading(true);
      const { data, error } = await db.list(collections.FINANCE_TRANSACTIONS, [
        queryHelpers.equal('transaction_type', 'in_kind'),
        queryHelpers.orderDesc('created_at'),
      ]);

      if (error) {
        logger.error('Error loading in-kind transactions:', error);
        toast.error('İşlemler yüklenirken hata oluştu');
        return;
      }

      // Map database records to InKindTransaction interface
      const mappedTransactions: InKindTransaction[] = (data?.documents || []).map((doc: any) => ({
        id: doc.$id,
        transactionNumber: doc.transaction_number || `AYT-${new Date(doc.created_at).getFullYear()}-${doc.$id.slice(-3)}`,
        recipientName: doc.recipient_name || '',
        recipientId: doc.recipient_id || '',
        itemCategory: doc.item_category || 'Gıda',
        itemDescription: doc.item_description || '',
        quantity: doc.quantity || 1,
        unit: doc.unit || 'Koli',
        estimatedValue: doc.amount || 0,
        deliveryDate: doc.delivery_date || doc.created_at,
        deliveryMethod: doc.delivery_method || 'delivery',
        status: doc.status || 'prepared',
        processedBy: doc.processed_by || 'Sistem Kullanıcısı',
        approvedBy: doc.approved_by || 'Bekliyor',
        storageLocation: doc.storage_location || '',
        notes: doc.notes || '',
      }));

      setTransactions(mappedTransactions);
    } catch (error) {
      logger.error('Failed to load transactions:', error);
      toast.error('İşlemler yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTransactions();
  }, []);

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

      const transactionData = {
        transaction_type: 'in_kind',
        recipient_name: formData.recipientName,
        recipient_id: formData.recipientId,
        item_category: formData.itemCategory,
        item_description: formData.itemDescription,
        quantity: formData.quantity,
        unit: formData.unit,
        amount: formData.estimatedValue,
        delivery_date: formData.deliveryDate,
        delivery_method: formData.deliveryMethod,
        status: 'prepared',
        processed_by: 'Sistem Kullanıcısı',
        approved_by: 'Bekliyor',
        storage_location: formData.storageLocation,
        notes: formData.notes,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { error } = await db.create(collections.FINANCE_TRANSACTIONS, transactionData);

      if (error) {
        logger.error('Error creating in-kind transaction:', error);
        toast.error('Teslimat kaydı oluşturulurken hata oluştu');
        return;
      }

      // Reload transactions to reflect the new entry
      await loadTransactions();

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
    } catch (error) {
      logger.error('Failed to create delivery:', error);
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
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-muted-foreground">Yükleniyor...</div>
              </div>
            ) : (
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
            )}
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