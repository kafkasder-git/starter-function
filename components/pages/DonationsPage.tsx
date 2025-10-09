/**
 * @fileoverview DonationsPage Module - Application module
 *
 * @author Dernek Yönetim Sistemi Team
 * @version 1.0.0
 */

import {
  CheckCircle,
  Clock,
  DollarSign,
  Download,
  Eye,
  Loader2,
  Plus,
  Search,
  Trash2,
  TrendingUp,
  XCircle,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useFormValidation } from '../../hooks/useFormValidation';
import { VALIDATION_SCHEMAS } from '../../lib/validation';
import {
  donationsService,
  type Donation,
  type DonationsFilters,
} from '../../services/donationsService';
import { PageLoading } from '../LoadingSpinner';
import { PageLayout } from '../PageLayout';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Textarea } from '../ui/textarea';

import { logger } from '../../lib/logging/logger';
interface DonationFormData {
  donor_name: string;
  donor_phone: string;
  donor_email: string;
  amount: number;
  donation_type: string;
  payment_method: string;
  category: string;
  description: string;
}

/**
 * DonationsPage function
 *
 * @param {Object} params - Function parameters
 * @returns {void} Nothing
 */
export function DonationsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [donationTypeFilter, setDonationTypeFilter] = useState('all');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState('all');
  const [donations, setDonations] = useState<Donation[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    totalAmount: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    averageAmount: 0,
  });
  // Form validation
  const donationForm = useFormValidation({
    schema: VALIDATION_SCHEMAS.donation,
    initialValues: {
      donor_name: '',
      donor_email: '',
      donor_phone: '',
      amount: 0,
      donation_type: 'cash',
      category: '',
      description: '',
      payment_method: 'bank_transfer',
    },
    onSubmit: async (values) => {
      await handleCreateDonation(values);
    },
  });

  // Load donations data
  const loadDonations = useCallback(async () => {
    try {
      setLoading(true);

      const filters: DonationsFilters = {
        ...(searchTerm.trim() && { searchTerm: searchTerm.trim() }),
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(donationTypeFilter !== 'all' && { donationType: donationTypeFilter }),
        ...(paymentMethodFilter !== 'all' && { paymentMethod: paymentMethodFilter }),
      };

      const result = await donationsService.getDonations(currentPage, pageSize, filters);

      if (result.error) {
        logger.error('❌ Error loading donations:', result.error);
        setDonations([]);
        toast.error('Bağışlar yüklenirken hata oluştu');
        return;
      }

      setDonations(result.data ?? []);
    } catch (error) {
      logger.error('Error loading donations:', error);
      setDonations([]);
      toast.error('Bağışlar yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, searchTerm, statusFilter, donationTypeFilter, paymentMethodFilter]);

  // Load statistics
  const loadStats = useCallback(async () => {
    try {
      const result = await donationsService.getDonationStats();

      if (result.data) {
        setStats({
          total: result.data.total,
          totalAmount: result.data.totalAmount,
          pending: result.data.pending,
          approved: result.data.approved,
          rejected: result.data.rejected,
          averageAmount: result.data.averageAmount,
        });
      }
    } catch (error) {
      logger.error('Error loading donation stats:', error);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadDonations();
    loadStats();
  }, [loadDonations, loadStats]);

  // Reload on filter changes with debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setCurrentPage(1);
      loadDonations();
    }, 300);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [searchTerm, statusFilter, donationTypeFilter, paymentMethodFilter, loadDonations]);

  const getStatusBadge = (status: Donation['status']) => {
    const statusMapping = {
      pending: {
        label: 'Beklemede',
        className: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100',
      },
      approved: { label: 'Onaylandı', className: 'bg-green-100 text-green-800 hover:bg-green-100' },
      rejected: { label: 'Reddedildi', className: 'bg-red-100 text-red-800 hover:bg-red-100' },
      processing: { label: 'İşleniyor', className: 'bg-blue-100 text-blue-800 hover:bg-blue-100' },
      completed: {
        label: 'Tamamlandı',
        className: 'bg-green-100 text-green-800 hover:bg-green-100',
      },
    };

    const statusInfo = statusMapping[status] ?? statusMapping.pending;

    return <Badge className={statusInfo.className}>{statusInfo.label}</Badge>;
  };

  const handleCreateDonation = async (values?: DonationFormData) => {
    const donationData = values ?? donationForm.values;

    try {
      setSaving(true);

      const result = await donationsService.createDonation({
        donor_name: donationData.donor_name.trim(),
        donor_email: donationData.donor_email?.trim() ?? undefined,
        donor_phone: donationData.donor_phone?.trim() ?? undefined,
        amount: donationData.amount,
        donation_type: donationData.donation_type as 'cash' | 'in_kind' | 'services' | 'other',
        category: donationData.category?.trim() ?? undefined,
        description: donationData.description?.trim() ?? undefined,
        payment_method: donationData.payment_method as
          | 'bank_transfer'
          | 'credit_card'
          | 'cash'
          | 'check'
          | 'online'
          | 'other',
        status: 'pending',
      });

      if (result.error) {
        throw new Error(result.error);
      }

      toast.success('Bağış başarıyla kaydedildi!');

      // Reset form
      donationForm.reset();
      setShowCreateModal(false);

      // Reload data
      await loadDonations();
      await loadStats();
    } catch (error) {
      logger.error('Error creating donation:', error);
      toast.error(error instanceof Error ? error.message : 'Bağış kaydedilemedi');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: Donation['status']) => {
    try {
      const result = await donationsService.updateDonation(parseInt(id), { status: newStatus });

      if (result.error) {
        throw new Error(result.error);
      }

      toast.success('Bağış durumu güncellendi');
      await loadDonations();
      await loadStats();
    } catch (error) {
      logger.error('Error updating donation status:', error);
      toast.error('Durum güncellenemedi');
    }
  };

  const handleDeleteDonation = async (id: string) => {
    if (!confirm('Bu bağışı silmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      const result = await donationsService.deleteDonation(parseInt(id));

      if (result.error) {
        throw new Error(result.error);
      }

      toast.success('Bağış silindi');
      await loadDonations();
      await loadStats();
    } catch (error) {
      logger.error('Error deleting donation:', error);
      toast.error('Bağış silinemedi');
    }
  };

  if (loading && donations.length === 0) {
    return <PageLoading />;
  }

  return (
    <PageLayout
      title="Bağış Yönetimi"
      subtitle="Tüm bağışları görüntüleyin ve yönetin"
      actions={
        <div className="flex w-full flex-wrap items-center justify-end gap-2 p-2 sm:w-auto sm:p-0">
          <Button
            variant="outline"
            size="sm"
            className="order-2 min-h-[44px] border-gray-300 px-4 text-sm hover:border-gray-400 sm:order-1"
            onClick={async () => {
              try {
                const exportFilters: DonationsFilters = {
                  ...(searchTerm.trim() && { searchTerm: searchTerm.trim() }),
                  ...(statusFilter !== 'all' && { status: statusFilter }),
                  ...(donationTypeFilter !== 'all' && { donationType: donationTypeFilter }),
                  ...(paymentMethodFilter !== 'all' && { paymentMethod: paymentMethodFilter }),
                };
                const result = await donationsService.exportDonations(exportFilters);
                if (result.data) {
                  // Convert to CSV
                  const headers = [
                    'Bağışçı',
                    'E-posta',
                    'Telefon',
                    'Miktar',
                    'Tür',
                    'Ödeme Yöntemi',
                    'Durum',
                    'Tarih',
                  ];
                  const csvData = result.data.map((d) => [
                    d.donor_name,
                    d.donor_email ?? '',
                    d.donor_phone ?? '',
                    d.amount,
                    d.donation_type,
                    d.payment_method,
                    d.status,
                    new Date(d.created_at).toLocaleDateString('tr-TR'),
                  ]);

                  const csv = [headers, ...csvData].map((row) => row.join(',')).join('\n');
                  const blob = new Blob([`\ufeff${csv}`], { type: 'text/csv;charset=utf-8;' });
                  const link = document.createElement('a');
                  link.href = URL.createObjectURL(blob);
                  link.download = `bagislar_${new Date().toISOString().split('T')[0]}.csv`;
                  link.click();
                  toast.success('Bağışlar Excel formatında dışa aktarıldı');
                } else {
                  toast.error('Dışa aktarma başarısız');
                }
              } catch (error) {
                logger.error('Export error:', error);
                toast.error('Dışa aktarma sırasında hata oluştu');
              }
            }}
          >
            <Download className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Dışa Aktar</span>
            <span className="sm:hidden">Dışa Aktar</span>
          </Button>
          <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
            <DialogTrigger asChild>
              <Button
                size="sm"
                className="corporate-gradient order-1 min-h-[44px] flex-shrink-0 border-0 px-6 py-3 text-white shadow-lg transition-all duration-300 hover:shadow-xl sm:order-2"
              >
                <Plus className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Yeni Bağış</span>
                <span className="sm:hidden">Yeni Bağış</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="professional-card max-h-[90vh] max-w-[95vw] overflow-y-auto sm:max-w-lg">
              <DialogHeader className="pb-4">
                <DialogTitle className="flex items-center gap-2">
                  <Plus className="text-primary h-6 w-6" />
                  Yeni Bağış Kaydı
                </DialogTitle>
                <DialogDescription className="text-muted-foreground mt-1">
                  Bağış bilgilerini doldurun. Zorunlu alanları (*) doldurmanız gereklidir.
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={donationForm.handleSubmit} className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="donor_name">Bağışçı Adı *</Label>
                  <Input
                    id="donor_name"
                    value={donationForm.values.donor_name}
                    onChange={(e) => {
                      donationForm.handleChange('donor_name', e.target.value);
                    }}
                    onBlur={() => {
                      donationForm.handleBlur('donor_name');
                    }}
                    placeholder="Bağışçının tam adını giriniz"
                    className={`focus-corporate min-h-[44px] ${
                      donationForm.touched.donor_name && donationForm.errors.donor_name
                        ? 'border-red-500 focus:border-red-500'
                        : ''
                    }`}
                    disabled={saving}
                  />
                  {donationForm.touched.donor_name && donationForm.errors.donor_name && (
                    <p className="text-sm text-red-600">{donationForm.errors.donor_name}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="donor_email">E-posta</Label>
                    <Input
                      id="donor_email"
                      type="email"
                      value={donationForm.values.donor_email}
                      onChange={(e) => {
                        donationForm.handleChange('donor_email', e.target.value);
                      }}
                      onBlur={() => {
                        donationForm.handleBlur('donor_email');
                      }}
                      placeholder="bağışçı@email.com"
                      className={`focus-corporate min-h-[44px] ${
                        donationForm.touched.donor_email && donationForm.errors.donor_email
                          ? 'border-red-500 focus:border-red-500'
                          : ''
                      }`}
                      disabled={saving}
                    />
                    {donationForm.touched.donor_email && donationForm.errors.donor_email && (
                      <p className="text-sm text-red-600">{donationForm.errors.donor_email}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="donor_phone">Telefon</Label>
                    <Input
                      id="donor_phone"
                      type="tel"
                      value={donationForm.values.donor_phone}
                      onChange={(e) => {
                        donationForm.handleChange('donor_phone', e.target.value);
                      }}
                      onBlur={() => {
                        donationForm.handleBlur('donor_phone');
                      }}
                      placeholder="0555 123 45 67"
                      className={`focus-corporate min-h-[44px] ${
                        donationForm.touched.donor_phone && donationForm.errors.donor_phone
                          ? 'border-red-500 focus:border-red-500'
                          : ''
                      }`}
                      disabled={saving}
                    />
                    {donationForm.touched.donor_phone && donationForm.errors.donor_phone && (
                      <p className="text-sm text-red-600">{donationForm.errors.donor_phone}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="amount">Miktar (TL) *</Label>
                  <Input
                    id="amount"
                    type="number"
                    value={donationForm.values.amount}
                    onChange={(e) => {
                      donationForm.handleChange('amount', e.target.value);
                    }}
                    onBlur={() => {
                      donationForm.handleBlur('amount');
                    }}
                    placeholder="0.00"
                    className={`focus-corporate min-h-[44px] ${
                      donationForm.touched.amount && donationForm.errors.amount
                        ? 'border-red-500 focus:border-red-500'
                        : ''
                    }`}
                    disabled={saving}
                    min="0"
                    step="0.01"
                  />
                  {donationForm.touched.amount && donationForm.errors.amount && (
                    <p className="text-sm text-red-600">{donationForm.errors.amount}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="donation_type">Bağış Türü</Label>
                    <Select
                      value={donationForm.values.donation_type}
                      onValueChange={(value: string) => {
                        donationForm.handleChange('donation_type', value);
                      }}
                    >
                      <SelectTrigger className="focus-corporate min-h-[44px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cash">Nakdi</SelectItem>
                        <SelectItem value="in_kind">Ayni</SelectItem>
                        <SelectItem value="services">Hizmet</SelectItem>
                        <SelectItem value="other">Diğer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="payment_method">Ödeme Yöntemi</Label>
                    <Select
                      value={donationForm.values.payment_method}
                      onValueChange={(value: string) => {
                        donationForm.handleChange('payment_method', value);
                      }}
                    >
                      <SelectTrigger className="focus-corporate min-h-[44px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bank_transfer">Banka Havalesi</SelectItem>
                        <SelectItem value="credit_card">Kredi Kartı</SelectItem>
                        <SelectItem value="cash">Nakit</SelectItem>
                        <SelectItem value="check">Çek</SelectItem>
                        <SelectItem value="online">Online</SelectItem>
                        <SelectItem value="other">Diğer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Kategori</Label>
                  <Input
                    id="category"
                    value={donationForm.values.category}
                    onChange={(e) => {
                      donationForm.handleChange('category', e.target.value);
                    }}
                    onBlur={() => {
                      donationForm.handleBlur('category');
                    }}
                    placeholder="Bağış kategorisi (örn: Eğitim, Sağlık)"
                    className="focus-corporate min-h-[44px]"
                    disabled={saving}
                  />
                  {donationForm.touched.category && donationForm.errors.category && (
                    <p className="text-sm text-red-600">{donationForm.errors.category}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Açıklama</Label>
                  <Textarea
                    id="description"
                    value={donationForm.values.description}
                    onChange={(e) => {
                      donationForm.handleChange('description', e.target.value);
                    }}
                    onBlur={() => {
                      donationForm.handleBlur('description');
                    }}
                    placeholder="Bağış hakkında ek bilgiler..."
                    className="focus-corporate min-h-[80px]"
                    disabled={saving}
                  />
                  {donationForm.touched.description && donationForm.errors.description && (
                    <p className="text-sm text-red-600">{donationForm.errors.description}</p>
                  )}
                </div>
              </form>

              <div className="flex flex-col justify-end gap-3 border-t pt-6 sm:flex-row">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowCreateModal(false);
                    donationForm.reset();
                  }}
                  className="min-h-[44px] px-6"
                  disabled={saving}
                >
                  İptal
                </Button>
                <Button
                  onClick={() => {
                    if (donationForm.isValid) {
                      handleCreateDonation(donationForm.values);
                    }
                  }}
                  className="corporate-gradient min-h-[44px] px-6 shadow-md hover:shadow-lg"
                  disabled={saving || !donationForm.isValid}
                >
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Kaydediliyor...
                    </>
                  ) : (
                    <>
                      <Plus className="mr-2 h-4 w-4" />
                      Kaydet
                    </>
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      }
    >
      <div className="safe-area space-y-4 p-3 sm:space-y-6 sm:p-6 lg:p-8">
        {/* Enhanced Summary Cards */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
          <Card className="professional-card micro-interaction">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xl text-green-600 sm:text-2xl">
                    ₺{(stats.totalAmount ?? 0).toLocaleString()}
                  </div>
                  <p className="text-xs text-gray-600 sm:text-sm">Toplam Bağış</p>
                </div>
                <DollarSign className="h-8 w-8 text-green-500 opacity-80" />
              </div>
            </CardContent>
          </Card>

          <Card className="professional-card micro-interaction">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xl text-blue-600 sm:text-2xl">{stats.total ?? 0}</div>
                  <p className="text-xs text-gray-600 sm:text-sm">Toplam İşlem</p>
                </div>
                <TrendingUp className="h-8 w-8 text-blue-500 opacity-80" />
              </div>
            </CardContent>
          </Card>

          <Card className="professional-card micro-interaction">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xl text-yellow-600 sm:text-2xl">{stats.pending ?? 0}</div>
                  <p className="text-xs text-gray-600 sm:text-sm">Bekleyen</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-500 opacity-80" />
              </div>
            </CardContent>
          </Card>

          <Card className="professional-card micro-interaction">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xl text-emerald-600 sm:text-2xl">
                    ₺{(stats.averageAmount ?? 0).toLocaleString()}
                  </div>
                  <p className="text-xs text-gray-600 sm:text-sm">Ortalama</p>
                </div>
                <CheckCircle className="h-8 w-8 text-emerald-500 opacity-80" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Mobile-Optimized Filters and Table */}
        <Card className="border-0 shadow-md">
          <CardHeader className="pb-4">
            <div className="space-y-4">
              <CardTitle className="text-lg sm:text-xl">Bağış Listesi</CardTitle>

              {/* Enhanced Filters */}
              <div className="space-y-3 sm:flex sm:gap-4 sm:space-y-0">
                <div className="relative flex-1">
                  <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
                  <Input
                    placeholder="Bağışçı adı, e-posta veya referans ara..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                    }}
                    className="focus-corporate min-h-[44px] pl-10 text-base"
                    inputMode="search"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2 sm:flex sm:w-auto sm:gap-3">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="focus-corporate min-h-[44px] text-base">
                      <SelectValue placeholder="Tüm Durumlar" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tüm Durumlar</SelectItem>
                      <SelectItem value="pending">Beklemede</SelectItem>
                      <SelectItem value="approved">Onaylandı</SelectItem>
                      <SelectItem value="rejected">Reddedildi</SelectItem>
                      <SelectItem value="processing">İşleniyor</SelectItem>
                      <SelectItem value="completed">Tamamlandı</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={donationTypeFilter} onValueChange={setDonationTypeFilter}>
                    <SelectTrigger className="focus-corporate min-h-[44px] text-base">
                      <SelectValue placeholder="Tüm Türler" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tüm Türler</SelectItem>
                      <SelectItem value="cash">Nakdi</SelectItem>
                      <SelectItem value="in_kind">Ayni</SelectItem>
                      <SelectItem value="services">Hizmet</SelectItem>
                      <SelectItem value="other">Diğer</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={paymentMethodFilter} onValueChange={setPaymentMethodFilter}>
                    <SelectTrigger className="focus-corporate min-h-[44px] text-base">
                      <SelectValue placeholder="Tüm Ödeme Yöntemleri" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tüm Ödeme Yöntemleri</SelectItem>
                      <SelectItem value="bank_transfer">Banka Havalesi</SelectItem>
                      <SelectItem value="credit_card">Kredi Kartı</SelectItem>
                      <SelectItem value="cash">Nakit</SelectItem>
                      <SelectItem value="check">Çek</SelectItem>
                      <SelectItem value="online">Online</SelectItem>
                      <SelectItem value="other">Diğer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {/* Mobile Card View for small screens */}
            <div className="block sm:hidden">
              {donations.length > 0 ? (
                <div className="space-y-3 p-4">
                  {donations.map((donation) => (
                    <Card
                      key={donation.id}
                      className="border border-gray-200 transition-shadow hover:shadow-md"
                    >
                      <CardContent className="p-4">
                        <div className="mb-3 flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-medium text-gray-900">{donation.donor_name}</h3>
                            <p className="text-sm text-gray-600">
                              {donation.category ?? donation.donation_type}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-semibold text-green-600">
                              ₺{donation.amount.toLocaleString()}
                            </div>
                            {getStatusBadge(donation.status)}
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <span>{donation.payment_method}</span>
                          <span>{new Date(donation.created_at).toLocaleDateString('tr-TR')}</span>
                        </div>

                        <div className="mt-3 flex justify-end gap-2">
                          {donation.status === 'pending' && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="min-h-[44px] min-w-[44px] p-2 text-green-600 hover:text-green-700"
                                onClick={() => handleUpdateStatus(donation.id, 'approved')}
                                aria-label="Onayla"
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="min-h-[44px] min-w-[44px] p-2 text-red-600 hover:text-red-700"
                                onClick={() => handleUpdateStatus(donation.id, 'rejected')}
                                aria-label="Reddet"
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="min-h-[44px] min-w-[44px] p-2 text-red-600 hover:text-red-700"
                            onClick={() => handleDeleteDonation(donation.id)}
                            aria-label="Sil"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center">
                  <Plus className="mx-auto mb-4 h-12 w-12 text-gray-300" />
                  <p className="mb-2 text-gray-600">Henüz bağış kaydı bulunmuyor</p>
                  <p className="text-sm text-gray-400">
                    Yeni bağış eklemek için &quot;Yeni Bağış&quot; butonunu kullanın
                  </p>
                </div>
              )}
            </div>

            {/* Desktop Table View */}
            <div className="hidden overflow-x-auto sm:block">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50/50">
                    <TableHead className="min-w-[150px] p-3 sm:p-4">Bağışçı</TableHead>
                    <TableHead className="min-w-[100px] p-3 sm:p-4">Miktar</TableHead>
                    <TableHead className="min-w-[100px] p-3 sm:p-4">Tarih</TableHead>
                    <TableHead className="min-w-[100px] p-3 sm:p-4">Durum</TableHead>
                    <TableHead className="hidden min-w-[100px] p-3 sm:p-4 lg:table-cell">
                      Yöntem
                    </TableHead>
                    <TableHead className="hidden min-w-[100px] p-3 sm:p-4 lg:table-cell">
                      Tür
                    </TableHead>
                    <TableHead className="min-w-[120px] p-3 text-center sm:p-4">İşlemler</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell className="p-3 sm:p-4">
                          <div className="h-4 w-32 animate-pulse rounded bg-gray-200" />
                        </TableCell>
                        <TableCell className="p-3 sm:p-4">
                          <div className="h-4 w-20 animate-pulse rounded bg-gray-200" />
                        </TableCell>
                        <TableCell className="p-3 sm:p-4">
                          <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
                        </TableCell>
                        <TableCell className="p-3 sm:p-4">
                          <div className="h-6 w-20 animate-pulse rounded bg-gray-200" />
                        </TableCell>
                        <TableCell className="hidden p-3 sm:p-4 lg:table-cell">
                          <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
                        </TableCell>
                        <TableCell className="hidden p-3 sm:p-4 lg:table-cell">
                          <div className="h-4 w-16 animate-pulse rounded bg-gray-200" />
                        </TableCell>
                        <TableCell className="p-3 sm:p-4">
                          <div className="flex justify-center gap-2">
                            <div className="h-8 w-8 animate-pulse rounded bg-gray-200" />
                            <div className="h-8 w-8 animate-pulse rounded bg-gray-200" />
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : donations.length > 0 ? (
                    donations.map((donation) => (
                      <TableRow key={donation.id} className="transition-colors hover:bg-gray-50/50">
                        <TableCell className="p-3 font-medium sm:p-4">
                          <div>
                            <div className="font-medium">{donation.donor_name}</div>
                            {donation.donor_email && (
                              <div className="text-sm text-gray-500">{donation.donor_email}</div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="p-3 font-semibold text-green-600 sm:p-4">
                          ₺{donation.amount.toLocaleString()}
                        </TableCell>
                        <TableCell className="p-3 text-gray-500 sm:p-4">
                          {new Date(donation.created_at).toLocaleDateString('tr-TR')}
                        </TableCell>
                        <TableCell className="p-3 sm:p-4">
                          {getStatusBadge(donation.status)}
                        </TableCell>
                        <TableCell className="hidden p-3 text-gray-600 sm:p-4 lg:table-cell">
                          {donation.payment_method}
                        </TableCell>
                        <TableCell className="hidden p-3 text-gray-600 sm:p-4 lg:table-cell">
                          {donation.donation_type}
                        </TableCell>
                        <TableCell className="p-3 text-center sm:p-4">
                          <div className="flex items-center justify-center gap-2">
                            {donation.status === 'pending' && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0 text-green-600 hover:bg-green-50 hover:text-green-700"
                                  onClick={() => handleUpdateStatus(donation.id, 'approved')}
                                  aria-label="Onayla"
                                >
                                  <CheckCircle className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0 text-red-600 hover:bg-red-50 hover:text-red-700"
                                  onClick={() => handleUpdateStatus(donation.id, 'rejected')}
                                  aria-label="Reddet"
                                >
                                  <XCircle className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-blue-600 hover:bg-blue-50 hover:text-blue-700"
                              aria-label={`${donation.donor_name} bağışını görüntüle`}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-red-600 hover:bg-red-50 hover:text-red-700"
                              onClick={() => handleDeleteDonation(donation.id)}
                              aria-label="Sil"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="py-8 text-center text-gray-500">
                        <Plus className="mx-auto mb-4 h-12 w-12 text-gray-300" />
                        <p className="mb-2 text-gray-600">Henüz bağış kaydı bulunmuyor</p>
                        <p className="text-sm text-gray-400">
                          Yeni bağış eklemek için &quot;Yeni Bağış&quot; butonunu kullanın
                        </p>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
}
