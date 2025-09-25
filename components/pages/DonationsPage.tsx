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
        searchTerm: searchTerm.trim() || undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        donationType: donationTypeFilter !== 'all' ? donationTypeFilter : undefined,
        paymentMethod: paymentMethodFilter !== 'all' ? paymentMethodFilter : undefined,
      };

      const result = await donationsService.getDonations(currentPage, pageSize, filters);

      if (result.error) {
        console.error('❌ Error loading donations:', result.error);
        setDonations([]);
        toast.error('Bağışlar yüklenirken hata oluştu');
        return;
      }

      setDonations(result.data || []);
    } catch (error) {
      console.error('Error loading donations:', error);
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
      console.error('Error loading donation stats:', error);
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

    const statusInfo = statusMapping[status] || statusMapping.pending;

    return <Badge className={statusInfo.className}>{statusInfo.label}</Badge>;
  };

  const handleCreateDonation = async (values?: DonationFormData) => {
    const donationData = values || donationForm.values;

    try {
      setSaving(true);

      const result = await donationsService.createDonation({
        donor_name: donationData.donor_name.trim(),
        donor_email: donationData.donor_email?.trim() || undefined,
        donor_phone: donationData.donor_phone?.trim() || undefined,
        amount: donationData.amount,
        donation_type: donationData.donation_type as 'cash' | 'in_kind' | 'services' | 'other',
        category: donationData.category?.trim() || undefined,
        description: donationData.description?.trim() || undefined,
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
      console.error('Error creating donation:', error);
      toast.error(error instanceof Error ? error.message : 'Bağış kaydedilemedi');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateStatus = async (id: number, newStatus: Donation['status']) => {
    try {
      const result = await donationsService.updateDonation(id, { status: newStatus });

      if (result.error) {
        throw new Error(result.error);
      }

      toast.success('Bağış durumu güncellendi');
      await loadDonations();
      await loadStats();
    } catch (error) {
      console.error('Error updating donation status:', error);
      toast.error('Durum güncellenemedi');
    }
  };

  const handleDeleteDonation = async (id: number) => {
    if (!confirm('Bu bağışı silmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      const result = await donationsService.deleteDonation(id);

      if (result.error) {
        throw new Error(result.error);
      }

      toast.success('Bağış silindi');
      await loadDonations();
      await loadStats();
    } catch (error) {
      console.error('Error deleting donation:', error);
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
        <div className="flex gap-2 flex-wrap items-center justify-end w-full sm:w-auto p-2 sm:p-0">
          <Button
            variant="outline"
            size="sm"
            className="min-h-[44px] px-4 text-sm border-gray-300 hover:border-gray-400 order-2 sm:order-1"
          >
            <Download className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Dışa Aktar</span>
            <span className="sm:hidden">Dışa Aktar</span>
          </Button>
          <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
            <DialogTrigger asChild>
              <Button
                size="sm"
                className="min-h-[44px] px-6 py-3 corporate-gradient text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 order-1 sm:order-2 flex-shrink-0"
              >
                <Plus className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Yeni Bağış</span>
                <span className="sm:hidden">Yeni Bağış</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg max-w-[95vw] max-h-[90vh] overflow-y-auto professional-card">
              <DialogHeader className="pb-4">
                <DialogTitle className="flex items-center gap-2">
                  <Plus className="w-6 h-6 text-primary" />
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
                    className={`min-h-[44px] focus-corporate ${
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

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                      className={`min-h-[44px] focus-corporate ${
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
                      className={`min-h-[44px] focus-corporate ${
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
                    className={`min-h-[44px] focus-corporate ${
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

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="donation_type">Bağış Türü</Label>
                    <Select
                      value={donationForm.values.donation_type}
                      onValueChange={(value: string) => {
                        donationForm.handleChange('donation_type', value);
                      }}
                    >
                      <SelectTrigger className="min-h-[44px] focus-corporate">
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
                      <SelectTrigger className="min-h-[44px] focus-corporate">
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
                    className="min-h-[44px] focus-corporate"
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
                    className="min-h-[80px] focus-corporate"
                    disabled={saving}
                  />
                  {donationForm.touched.description && donationForm.errors.description && (
                    <p className="text-sm text-red-600">{donationForm.errors.description}</p>
                  )}
                </div>
              </form>

              <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t">
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
                  className="min-h-[44px] px-6 corporate-gradient shadow-md hover:shadow-lg"
                  disabled={saving || !donationForm.isValid}
                >
                  {saving ? (
                    <>
                      <Loader2 className="animate-spin h-4 w-4 mr-2" />
                      Kaydediliyor...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-2" />
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
      <div className="safe-area p-3 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
        {/* Enhanced Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          <Card className="professional-card micro-interaction">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xl sm:text-2xl text-green-600">
                    ₺{(stats.totalAmount || 0).toLocaleString()}
                  </div>
                  <p className="text-xs sm:text-sm text-gray-600">Toplam Bağış</p>
                </div>
                <DollarSign className="h-8 w-8 text-green-500 opacity-80" />
              </div>
            </CardContent>
          </Card>

          <Card className="professional-card micro-interaction">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xl sm:text-2xl text-blue-600">{stats.total || 0}</div>
                  <p className="text-xs sm:text-sm text-gray-600">Toplam İşlem</p>
                </div>
                <TrendingUp className="h-8 w-8 text-blue-500 opacity-80" />
              </div>
            </CardContent>
          </Card>

          <Card className="professional-card micro-interaction">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xl sm:text-2xl text-yellow-600">{stats.pending || 0}</div>
                  <p className="text-xs sm:text-sm text-gray-600">Bekleyen</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-500 opacity-80" />
              </div>
            </CardContent>
          </Card>

          <Card className="professional-card micro-interaction">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xl sm:text-2xl text-emerald-600">
                    ₺{(stats.averageAmount || 0).toLocaleString()}
                  </div>
                  <p className="text-xs sm:text-sm text-gray-600">Ortalama</p>
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
              <div className="space-y-3 sm:space-y-0 sm:flex sm:gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Bağışçı adı, e-posta veya referans ara..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                    }}
                    className="pl-10 min-h-[44px] text-base focus-corporate"
                    inputMode="search"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2 sm:gap-3 sm:flex sm:w-auto">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="min-h-[44px] text-base focus-corporate">
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
                    <SelectTrigger className="min-h-[44px] text-base focus-corporate">
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
                    <SelectTrigger className="min-h-[44px] text-base focus-corporate">
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
                      className="border border-gray-200 hover:shadow-md transition-shadow"
                    >
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1">
                            <h3 className="font-medium text-gray-900">{donation.donor_name}</h3>
                            <p className="text-sm text-gray-600">
                              {donation.category || donation.donation_type}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold text-green-600 text-lg">
                              ₺{donation.amount.toLocaleString()}
                            </div>
                            {getStatusBadge(donation.status)}
                          </div>
                        </div>

                        <div className="flex justify-between items-center text-sm text-gray-500">
                          <span>{donation.payment_method}</span>
                          <span>{new Date(donation.created_at).toLocaleDateString('tr-TR')}</span>
                        </div>

                        <div className="flex justify-end gap-2 mt-3">
                          {donation.status === 'pending' && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="min-h-[44px] min-w-[44px] p-2 text-green-600 hover:text-green-700"
                                onClick={() => handleUpdateStatus(donation.id, 'approved')}
                                aria-label="Onayla"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="min-h-[44px] min-w-[44px] p-2 text-red-600 hover:text-red-700"
                                onClick={() => handleUpdateStatus(donation.id, 'rejected')}
                                aria-label="Reddet"
                              >
                                <XCircle className="w-4 h-4" />
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
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center">
                  <Plus className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-gray-600 mb-2">Henüz bağış kaydı bulunmuyor</p>
                  <p className="text-sm text-gray-400">
                    Yeni bağış eklemek için "Yeni Bağış" butonunu kullanın
                  </p>
                </div>
              )}
            </div>

            {/* Desktop Table View */}
            <div className="hidden sm:block overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50/50">
                    <TableHead className="min-w-[150px] p-3 sm:p-4">Bağışçı</TableHead>
                    <TableHead className="min-w-[100px] p-3 sm:p-4">Miktar</TableHead>
                    <TableHead className="min-w-[100px] p-3 sm:p-4">Tarih</TableHead>
                    <TableHead className="min-w-[100px] p-3 sm:p-4">Durum</TableHead>
                    <TableHead className="hidden lg:table-cell min-w-[100px] p-3 sm:p-4">
                      Yöntem
                    </TableHead>
                    <TableHead className="hidden lg:table-cell min-w-[100px] p-3 sm:p-4">
                      Tür
                    </TableHead>
                    <TableHead className="min-w-[120px] p-3 sm:p-4 text-center">İşlemler</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell className="p-3 sm:p-4">
                          <div className="h-4 bg-gray-200 rounded w-32 animate-pulse" />
                        </TableCell>
                        <TableCell className="p-3 sm:p-4">
                          <div className="h-4 bg-gray-200 rounded w-20 animate-pulse" />
                        </TableCell>
                        <TableCell className="p-3 sm:p-4">
                          <div className="h-4 bg-gray-200 rounded w-24 animate-pulse" />
                        </TableCell>
                        <TableCell className="p-3 sm:p-4">
                          <div className="h-6 bg-gray-200 rounded w-20 animate-pulse" />
                        </TableCell>
                        <TableCell className="hidden lg:table-cell p-3 sm:p-4">
                          <div className="h-4 bg-gray-200 rounded w-24 animate-pulse" />
                        </TableCell>
                        <TableCell className="hidden lg:table-cell p-3 sm:p-4">
                          <div className="h-4 bg-gray-200 rounded w-16 animate-pulse" />
                        </TableCell>
                        <TableCell className="p-3 sm:p-4">
                          <div className="flex justify-center gap-2">
                            <div className="w-8 h-8 bg-gray-200 rounded animate-pulse" />
                            <div className="w-8 h-8 bg-gray-200 rounded animate-pulse" />
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : donations.length > 0 ? (
                    donations.map((donation) => (
                      <TableRow key={donation.id} className="hover:bg-gray-50/50 transition-colors">
                        <TableCell className="font-medium p-3 sm:p-4">
                          <div>
                            <div className="font-medium">{donation.donor_name}</div>
                            {donation.donor_email && (
                              <div className="text-sm text-gray-500">{donation.donor_email}</div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="font-semibold text-green-600 p-3 sm:p-4">
                          ₺{donation.amount.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-gray-500 p-3 sm:p-4">
                          {new Date(donation.created_at).toLocaleDateString('tr-TR')}
                        </TableCell>
                        <TableCell className="p-3 sm:p-4">
                          {getStatusBadge(donation.status)}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell text-gray-600 p-3 sm:p-4">
                          {donation.payment_method}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell text-gray-600 p-3 sm:p-4">
                          {donation.donation_type}
                        </TableCell>
                        <TableCell className="text-center p-3 sm:p-4">
                          <div className="flex items-center justify-center gap-2">
                            {donation.status === 'pending' && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
                                  onClick={() => handleUpdateStatus(donation.id, 'approved')}
                                  aria-label="Onayla"
                                >
                                  <CheckCircle className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                  onClick={() => handleUpdateStatus(donation.id, 'rejected')}
                                  aria-label="Reddet"
                                >
                                  <XCircle className="w-4 h-4" />
                                </Button>
                              </>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                              aria-label={`${donation.donor_name} bağışını görüntüle`}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                              onClick={() => handleDeleteDonation(donation.id)}
                              aria-label="Sil"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                        <Plus className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                        <p className="text-gray-600 mb-2">Henüz bağış kaydı bulunmuyor</p>
                        <p className="text-sm text-gray-400">
                          Yeni bağış eklemek için "Yeni Bağış" butonunu kullanın
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
