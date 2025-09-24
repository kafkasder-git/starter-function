import {
  AlertCircle,
  Camera,
  CheckCircle,
  Clock,
  Download,
  Loader2,
  Scan,
  Search,
  TrendingUp,
  UserPlus,
  Users,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useSupabaseAuth } from '../../contexts/SupabaseAuthContext';
import {
  ihtiyacSahipleriService,
  type IhtiyacSahibi,
} from '../../services/ihtiyacSahipleriService';
import { PageLoading } from '../LoadingSpinner';
import { OCRScanner } from '../OCRScanner';
import { PageLayout } from '../PageLayout';
import { NewCategoryNotification } from '../notifications/NewCategoryNotification';
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

// İhtiyaç sahipleri için display tipi
interface IhtiyacSahibiDisplay extends IhtiyacSahibi {
  display_id?: number; // 1'den başlayan sıralı ID
  formatted_phone?: string;
  formatted_registration_date?: string;
  status?: 'active' | 'passive' | 'suspended' | 'under_evaluation';
  priority_level?: 'low' | 'medium' | 'high';
}

// Status mapping for beneficiaries
const statusMapping = {
  active: {
    label: 'Aktif',
    key: 'active',
    className: 'bg-green-100 text-green-800 border-green-200',
  },
  inactive: {
    label: 'Pasif',
    key: 'inactive',
    className: 'bg-red-100 text-red-800 border-red-200',
  },
  passive: { label: 'Pasif', key: 'passive', className: 'bg-red-100 text-red-800 border-red-200' },
  suspended: {
    label: 'Askıda',
    key: 'suspended',
    className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  },
  under_evaluation: {
    label: 'Değerlendirmede',
    key: 'under_evaluation',
    className: 'bg-orange-100 text-orange-800 border-orange-200',
  },
  archived: {
    label: 'Arşivlendi',
    key: 'archived',
    className: 'bg-gray-100 text-gray-800 border-gray-200',
  },
} as const;

// Category mapping for beneficiaries - Yeni yapı
const categoryMapping = {
  gıda: { label: 'Gıda Yardımı', icon: '🍽️', color: 'bg-orange-100 text-orange-800' },
  nakdi: { label: 'Nakdi Yardım', icon: '💰', color: 'bg-green-100 text-green-800' },
  eğitim: { label: 'Eğitim Desteği', icon: '📚', color: 'bg-blue-100 text-blue-800' },
  sağlık: { label: 'Sağlık Yardımı', icon: '🏥', color: 'bg-red-100 text-red-800' },
  barınma: { label: 'Barınma Desteği', icon: '🏠', color: 'bg-purple-100 text-purple-800' },
  giyim: { label: 'Giyim Yardımı', icon: '👕', color: 'bg-pink-100 text-pink-800' },
  diğer: { label: 'Diğer Yardım', icon: '📦', color: 'bg-gray-100 text-gray-800' },
} as const;

// Aid type mapping
const aidTypeMapping = {
  'tek seferlik': { label: 'Tek Seferlik', icon: '⚡' },
  'aylık paket': { label: 'Aylık Paket', icon: '📦' },
  'acil yardım': { label: 'Acil Yardım', icon: '🚨' },
  'sürekli destek': { label: 'Sürekli Destek', icon: '🔄' },
  'proje bazlı': { label: 'Proje Bazlı', icon: '📋' },
} as const;

interface BeneficiariesPageProps {
  onNavigateToDetail?: (beneficiaryId: string) => void;
}

export function BeneficiariesPageEnhanced({ onNavigateToDetail }: BeneficiariesPageProps) {
  // Get authenticated user
  const { user, isAuthenticated } = useSupabaseAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [cityFilter, setCityFilter] = useState('all');
  const [beneficiaries, setBeneficiaries] = useState<IhtiyacSahibiDisplay[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showOCRScanner, setShowOCRScanner] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    passive: 0,
    suspended: 0,
    underEvaluation: 0,
    totalAidAmount: 0,
    bakimYukumluCount: 0,
  });
  const [newBeneficiary, setNewBeneficiary] = useState<{
    ad_soyad: string;
    kimlik_no: string;
    telefon_no: string;
    sehri: string;
    uyruk: string;
    ulkesi: string;
    adres: string;
    kategori: string;
    tur: string;
    iban: string;
  }>({
    ad_soyad: '',
    kimlik_no: '',
    telefon_no: '',
    sehri: '',
    uyruk: '',
    ulkesi: '',
    adres: '',
    kategori: '',
    tur: '',
    iban: '',
  });

  // Load beneficiaries data with enhanced error handling
  const loadBeneficiaries = useCallback(async () => {
    try {
      setLoading(true);

      const filters = {
        status: statusFilter !== 'all' ? statusFilter : undefined,
        city: cityFilter !== 'all' ? cityFilter : undefined,
        // Note: category filter removed as it's not in the database schema
        searchTerm: searchTerm.trim() || undefined,
      };

      const result = await ihtiyacSahipleriService.getIhtiyacSahipleri(currentPage, pageSize, {
        searchTerm: filters.searchTerm,
        sehir: filters.city,
      });

      if (result.error) {
        console.error('❌ Service returned error:', result.error);
        setBeneficiaries([]);
        setTotalCount(0);
        return;
      }

      // Transform data to include display fields
      const transformedData = (result.data || []).map((item: IhtiyacSahibi, index: number) => ({
        ...item,
        // Migration sonrası gerçek ID'ler 1'den başlayacak, display_id gerekli değil
        display_id: item.id, // Gerçek ID'yi kullan
        formatted_phone: item.telefon_no || item.Telefon_No || '',
        formatted_registration_date: item.kayit_tarihi || item.Kayit_Tarihi || '',
        status: 'active' as const, // Default status
        priority_level: 'medium' as const, // Default priority
      }));

      setBeneficiaries(transformedData);
      setTotalCount(result.count || 0);
    } catch (error) {
      console.error('Error loading beneficiaries:', error);
      setBeneficiaries([]);
      setTotalCount(0);

      if (error instanceof Error) {
        const errorMessage = error.message || 'Database hatası';

        if (error.message.includes('JWT expired')) {
          toast.error('Oturum süresi doldu. Lütfen bekleyin, sayfa yenileniyor...', {
            duration: 3000,
          });
        } else if (error.message.includes('does not exist') || !error.message) {
          toast.info('Database henüz hazırlanıyor', {
            description: 'Tablolar oluşturulduğunda veriler görünecektir',
            duration: 4000,
          });
        } else if (error.message.includes('permission denied')) {
          toast.error('Bu işlem için yetkiniz bulunmuyor', {
            duration: 4000,
          });
        } else {
          toast.error('İhtiyaç sahipleri yüklenirken hata oluştu', {
            description: errorMessage,
            duration: 5000,
          });
        }
      }
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, statusFilter, cityFilter, searchTerm]);

  // Load stats with enhanced calculation for new category
  const loadStats = useCallback(async () => {
    try {
      const result = await ihtiyacSahipleriService.getIstatistikler();

      if (result.data) {
        // Calculate stats based on ihtiyac_sahipleri data
        const bakimYukumluCount = Object.entries(result.data.turler)
          .filter(
            ([key]) =>
              key.toLowerCase().includes('bakmakla') || key.toLowerCase().includes('yükümlü'),
          )
          .reduce((sum, [, count]) => sum + count, 0);

        setStats({
          total: result.data.toplam || 0,
          active: result.data.toplam || 0, // Assume all are active for now
          passive: 0,
          suspended: 0,
          underEvaluation: 0,
          totalAidAmount: 0, // This data is not available in ihtiyac_sahipleri table
          bakimYukumluCount,
        });
      } else if (result.error) {
        console.error('Error fetching ihtiyac_sahipleri stats:', result.error);

        setStats({
          total: 0,
          active: 0,
          passive: 0,
          suspended: 0,
          underEvaluation: 0,
          totalAidAmount: 0,
          bakimYukumluCount: 0,
        });
      }
    } catch (error) {
      console.error('Stats loading failed:', error);

      setStats({
        total: 0,
        active: 0,
        passive: 0,
        suspended: 0,
        underEvaluation: 0,
        totalAidAmount: 0,
        bakimYukumluCount: 0,
      });
    }
  }, [beneficiaries]);

  // Load cities for filter
  const loadCities = useCallback(async () => {
    try {
      const result = await ihtiyacSahipleriService.getSehirler();
      if (result.data) {
        setCities(result.data);
      }
    } catch (error) {
      // Error loading cities - handle gracefully
    }
  }, []);

  // Test Supabase connection first
  useEffect(() => {
    const testConnection = async () => {
      const result = await ihtiyacSahipleriService.testConnection();
      console.log('🔗 Connection test result:', result);
    };
    testConnection();
  }, []);

  // Initial load
  useEffect(() => {
    loadBeneficiaries();
    loadCities();
  }, [loadBeneficiaries, loadCities]);

  // Load stats after beneficiaries are loaded
  useEffect(() => {
    if (beneficiaries.length > 0) {
      loadStats();
    }
  }, [beneficiaries, loadStats]);

  // Reload on filter changes with debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setCurrentPage(1);
      loadBeneficiaries();
    }, 300);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [searchTerm, statusFilter, cityFilter, loadBeneficiaries]);

  const getStatusBadge = (status: string) => {
    const statusInfo =
      statusMapping[status as keyof typeof statusMapping] || statusMapping.inactive;
    return <Badge className={statusInfo.className}>{statusInfo.label}</Badge>;
  };

  const getCategoryBadge = (category: string) => {
    const categoryInfo = categoryMapping[category as keyof typeof categoryMapping];
    const categoryLabel = categoryInfo?.label || category;
    const isNewCategory = category === 'Bakmakla Yükümlü Olunan Kişi';

    return (
      <Badge
        variant={isNewCategory ? 'default' : 'outline'}
        className={
          isNewCategory
            ? 'bg-purple-100 text-purple-800 border-purple-200'
            : categoryInfo?.color || ''
        }
      >
        {categoryInfo?.icon && `${categoryInfo.icon} `}
        {categoryLabel}
      </Badge>
    );
  };

  const handleCreateBeneficiary = async () => {
    // Authentication check
    if (!isAuthenticated || !user?.id) {
      toast.error('Lütfen önce giriş yapın');
      return;
    }

    // Form validation
    if (!newBeneficiary.ad_soyad.trim()) {
      toast.error('Ad soyad zorunludur');
      return;
    }

    try {
      setSaving(true);

      const ihtiyacSahibiData = {
        ad_soyad: newBeneficiary.ad_soyad.trim(),
        kimlik_no: newBeneficiary.kimlik_no.trim() || null,
        telefon_no: newBeneficiary.telefon_no.trim() || null,
        sehri: newBeneficiary.sehri?.trim() || null,
        uyruk: newBeneficiary.uyruk?.trim() || null,
        ulkesi: newBeneficiary.ulkesi?.trim() || null,
        adres: newBeneficiary.adres.trim() || null,
        kategori: newBeneficiary.kategori?.trim() || null,
        tur: newBeneficiary.tur?.trim() || null,
        iban: newBeneficiary.iban?.trim() || null,
      };

      const { data, error } = await ihtiyacSahipleriService.createIhtiyacSahibi(ihtiyacSahibiData);

      if (error || !data) {
        throw new Error(error || 'Kayıt oluşturulamadı');
      }

      toast.success(`${data.ad_soyad} başarıyla kaydedildi!`, {
        description: 'Liste yenileniyor...',
        duration: 2000,
      });

      // Close modal first
      setShowCreateModal(false);

      // Reset form
      setNewBeneficiary({
        ad_soyad: '',
        kimlik_no: '',
        telefon_no: '',
        sehri: '',
        uyruk: '',
        ulkesi: '',
        adres: '',
        kategori: '',
        tur: '',
        iban: '',
      });

      // Navigate to detail page immediately after successful save
      if (onNavigateToDetail && data.id) {
        onNavigateToDetail(String(data.id));
      }

      // Reload data in background
      await loadBeneficiaries();
      await loadStats();
    } catch (error) {
      console.error('❌ Error creating beneficiary:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'Kayıt sırasında bir hata oluştu';
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  // Handle OCR Scanner Result
  const handleOCRResult = (ocrData: any) => {
    setNewBeneficiary((prev) => ({
      ...prev,
      ad_soyad:
        ocrData.name && ocrData.surname ? `${ocrData.name} ${ocrData.surname}` : prev.ad_soyad,
      kimlik_no: ocrData.idNumber || prev.kimlik_no,
    }));

    toast.success('Belge bilgileri forma aktarıldı!', {
      description: 'Lütfen bilgileri kontrol edin ve gerekirse düzeltin.',
    });
  };

  if (loading && beneficiaries.length === 0) {
    return <PageLoading />;
  }

  return (
    <>
      <PageLayout
        title="İhtiyaç Sahipleri"
        subtitle="Dernek yardımlarından faydalanan kişileri yönetin"
        className="min-h-screen"
        actions={
          <div className="flex gap-3 flex-wrap items-center justify-end w-full sm:w-auto p-2 sm:p-0">
            {/* Export Button */}
            <Button
              variant="outline"
              size="sm"
              className="min-h-[44px] px-4 border-gray-300 hover:border-gray-400 order-2 sm:order-1 professional-card hover:shadow-md transition-shadow"
            >
              <Download className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Dışa Aktar</span>
              <span className="sm:hidden">Dışa Aktar</span>
            </Button>

            {/* Primary Add Button - Enhanced */}
            <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
              <DialogTrigger asChild>
                <Button
                  size="sm"
                  className="min-h-[44px] px-6 py-3 corporate-gradient text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 order-1 sm:order-2 flex-shrink-0 micro-interaction"
                  type="button"
                  data-testid="new-beneficiary-btn"
                  aria-label="Yeni İhtiyaç Sahibi Ekle"
                >
                  <UserPlus className="w-5 h-5 mr-2 flex-shrink-0" />
                  <span className="hidden sm:inline whitespace-nowrap">
                    Yeni İhtiyaç Sahibi Ekle
                  </span>
                  <span className="sm:hidden">Yeni Ekle</span>
                </Button>
              </DialogTrigger>
              <DialogContent
                className="sm:max-w-lg max-w-[95vw] max-h-[90vh] overflow-y-auto professional-card"
                aria-describedby="dialog-description"
              >
                <DialogHeader className="pb-4">
                  <DialogTitle className="flex items-center gap-2">
                    <UserPlus className="w-6 h-6 text-primary" />
                    Yeni İhtiyaç Sahibi Kaydı
                  </DialogTitle>
                  <DialogDescription id="dialog-description" className="text-muted-foreground mt-1">
                    İhtiyaç sahibi kişinin bilgilerini dernek çalışanı olarak sisteme kaydedin. Tüm
                    zorunlu alanları (*) doldurmanız gereklidir.
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="ad_soyad">Ad Soyad *</Label>
                    <Input
                      id="ad_soyad"
                      value={newBeneficiary.ad_soyad}
                      onChange={(e) => {
                        setNewBeneficiary({ ...newBeneficiary, ad_soyad: e.target.value });
                      }}
                      placeholder="İhtiyaç sahibinin tam adını giriniz"
                      className="min-h-[44px] focus-corporate"
                      disabled={saving}
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="kimlik_no">Kimlik No</Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setShowOCRScanner(true);
                        }}
                        className="h-8 px-3 gap-1 hover:bg-primary/5 hover:text-primary hover:border-primary/30 transition-colors"
                        disabled={saving}
                      >
                        <Camera className="w-3 h-3" />
                        <span className="hidden sm:inline">Kamera ile Tara</span>
                        <span className="sm:hidden">Tara</span>
                      </Button>
                    </div>
                    <Input
                      id="kimlik_no"
                      value={newBeneficiary.kimlik_no}
                      onChange={(e) => {
                        setNewBeneficiary({ ...newBeneficiary, kimlik_no: e.target.value });
                      }}
                      placeholder="Kimlik numarası (TC, Pasaport vb.)"
                      className="min-h-[44px] focus-corporate"
                      disabled={saving}
                    />
                    <p className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Scan className="w-3 h-3" />
                      İhtiyaç sahibinin kimlik kartını tarayarak bilgileri otomatik
                      doldurabilirsiniz
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="telefon_no">Telefon</Label>
                    <Input
                      id="telefon_no"
                      type="tel"
                      value={newBeneficiary.telefon_no}
                      onChange={(e) => {
                        setNewBeneficiary({ ...newBeneficiary, telefon_no: e.target.value });
                      }}
                      placeholder="İhtiyaç sahibinin telefon numarası"
                      className="min-h-[44px] focus-corporate"
                      inputMode="tel"
                      disabled={saving}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="sehri">Şehir</Label>
                      <Input
                        id="sehri"
                        value={newBeneficiary.sehri}
                        onChange={(e) => {
                          setNewBeneficiary({ ...newBeneficiary, sehri: e.target.value });
                        }}
                        placeholder="İhtiyaç sahibinin yaşadığı şehir"
                        className="min-h-[44px] focus-corporate"
                        disabled={saving}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="uyruk">Uyruk</Label>
                      <Input
                        id="uyruk"
                        value={newBeneficiary.uyruk}
                        onChange={(e) => {
                          setNewBeneficiary({ ...newBeneficiary, uyruk: e.target.value });
                        }}
                        placeholder="Uyruğu (ör: Türkiye, Suriye)"
                        className="min-h-[44px] focus-corporate"
                        disabled={saving}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="adres">Adres</Label>
                    <Input
                      id="adres"
                      value={newBeneficiary.adres}
                      onChange={(e) => {
                        setNewBeneficiary({ ...newBeneficiary, adres: e.target.value });
                      }}
                      placeholder="İhtiyaç sahibinin adresi"
                      className="min-h-[44px] focus-corporate"
                      disabled={saving}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="kategori">Kategori</Label>
                      <Input
                        id="kategori"
                        value={newBeneficiary.kategori}
                        onChange={(e) => {
                          setNewBeneficiary({ ...newBeneficiary, kategori: e.target.value });
                        }}
                        placeholder="Yardım kategorisi"
                        className="min-h-[44px] focus-corporate"
                        disabled={saving}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="tur">Tür</Label>
                      <Input
                        id="tur"
                        value={newBeneficiary.tur}
                        onChange={(e) => {
                          setNewBeneficiary({ ...newBeneficiary, tur: e.target.value });
                        }}
                        placeholder="İhtiyaç sahibi türü"
                        className="min-h-[44px] focus-corporate"
                        disabled={saving}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="iban">IBAN</Label>
                    <Input
                      id="iban"
                      value={newBeneficiary.iban}
                      onChange={(e) => {
                        setNewBeneficiary({ ...newBeneficiary, iban: e.target.value });
                      }}
                      placeholder="Banka IBAN numarası (isteğe bağlı)"
                      className="min-h-[44px] focus-corporate"
                      disabled={saving}
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowCreateModal(false);
                    }}
                    className="min-h-[44px] px-6"
                    disabled={saving}
                  >
                    İptal
                  </Button>
                  <Button
                    onClick={handleCreateBeneficiary}
                    className="min-h-[44px] px-6 corporate-gradient shadow-md hover:shadow-lg"
                    disabled={saving}
                  >
                    {saving ? (
                      <>
                        <Loader2 className="animate-spin h-4 w-4 mr-2" />
                        Kaydediliyor...
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4 mr-2" />
                        Kaydet ve Devam Et
                      </>
                    )}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        }
      >
        <div className="p-3 sm:p-6 space-y-4 sm:space-y-6">
          {/* Enhanced Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 sm:gap-4">
            <Card className="professional-card micro-interaction">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xl sm:text-2xl text-blue-600">{stats.total || 0}</div>
                    <p className="text-xs sm:text-sm text-gray-600">Toplam Kayıt</p>
                  </div>
                  <Users className="h-8 w-8 text-blue-500 opacity-80" />
                </div>
              </CardContent>
            </Card>
            <Card className="professional-card micro-interaction">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xl sm:text-2xl text-green-600">{stats.active || 0}</div>
                    <p className="text-xs sm:text-sm text-gray-600">Aktif</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-500 opacity-80" />
                </div>
              </CardContent>
            </Card>
            <Card className="professional-card micro-interaction">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xl sm:text-2xl text-orange-600">
                      {stats.underEvaluation || 0}
                    </div>
                    <p className="text-xs sm:text-sm text-gray-600">Değerlendirmede</p>
                  </div>
                  <Clock className="h-8 w-8 text-orange-500 opacity-80" />
                </div>
              </CardContent>
            </Card>
            <Card className="professional-card micro-interaction">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xl sm:text-2xl text-purple-600">
                      {stats.bakimYukumluCount || 0}
                    </div>
                    <p className="text-xs sm:text-sm text-gray-600">Bakmakla Yükümlü</p>
                  </div>
                  <AlertCircle className="h-8 w-8 text-purple-500 opacity-80" />
                </div>
              </CardContent>
            </Card>
            <Card className="professional-card micro-interaction">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-lg sm:text-2xl text-emerald-600">
                      ₺{(stats.totalAidAmount || 0).toLocaleString()}
                    </div>
                    <p className="text-xs sm:text-sm text-gray-600">Toplam Yardım</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-emerald-500 opacity-80" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Table Card with Enhanced Design */}
          <Card className="professional-card">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                İhtiyaç Sahibi Listesi
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Enhanced Filters with Category Filter */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Ad, soyad veya TC kimlik no ile ara..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                    }}
                    className="pl-10 min-h-[44px] focus-corporate"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2 sm:gap-3 sm:flex">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="min-w-[120px] min-h-[44px] focus-corporate">
                      <SelectValue placeholder="Tüm Durumlar" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tüm Durumlar</SelectItem>
                      <SelectItem value="active">Aktif</SelectItem>
                      <SelectItem value="passive">Pasif</SelectItem>
                      <SelectItem value="suspended">Askıda</SelectItem>
                      <SelectItem value="under_evaluation">Değerlendirmede</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={cityFilter} onValueChange={setCityFilter}>
                    <SelectTrigger className="min-w-[120px] min-h-[44px] focus-corporate">
                      <SelectValue placeholder="Tüm Şehirler" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tüm Şehirler</SelectItem>
                      {cities.map((city) => (
                        <SelectItem key={city} value={city}>
                          {city}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Enhanced Table - Original Structure Preserved */}
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50/50">
                      <TableHead className="min-w-[60px] font-medium text-center">#</TableHead>
                      <TableHead className="min-w-[120px] font-medium">Tür</TableHead>
                      <TableHead className="min-w-[150px] font-medium">İsim</TableHead>
                      <TableHead className="min-w-[140px] font-medium">Kategori</TableHead>
                      <TableHead className="min-w-[60px] font-medium text-center">Yaş</TableHead>
                      <TableHead className="min-w-[80px] font-medium">Uyruk</TableHead>
                      <TableHead className="min-w-[120px] font-medium">Kimlik No</TableHead>
                      <TableHead className="min-w-[120px] font-medium">Cep Telefonu</TableHead>
                      <TableHead className="min-w-[80px] font-medium">Ülke</TableHead>
                      <TableHead className="min-w-[140px] font-medium">Şehir</TableHead>
                      <TableHead className="min-w-[100px] font-medium">Yerleşim</TableHead>
                      <TableHead className="min-w-[200px] font-medium">Adres</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {beneficiaries.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={12} className="text-center py-8 text-gray-500">
                          <UserPlus className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                          <p>Henüz hiç ihtiyaç sahibi kaydı yok.</p>
                          <p className="text-sm text-gray-400 mt-1">
                            İlk kayıt için "Yeni İhtiyaç Sahibi Ekle" butonunu kullanın
                          </p>
                        </TableCell>
                      </TableRow>
                    ) : (
                      beneficiaries.map((beneficiary, index) => (
                        <TableRow
                          key={beneficiary.id}
                          className="hover:bg-blue-50/30 transition-colors cursor-pointer border-b border-gray-100"
                          onClick={() => onNavigateToDetail?.(String(beneficiary.id))}
                        >
                          <TableCell className="py-3 text-center">
                            <div className="flex items-center justify-center">
                              <span className="text-sm font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded-full min-w-[32px]">
                                {beneficiary.display_id}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="py-3">
                            <div className="flex items-center gap-2">
                              <Search className="w-3 h-3 text-gray-400" />
                              <span
                                className="truncate max-w-[100px]"
                                title={beneficiary.tur || beneficiary.Tur || 'İhtiyaç Sahibi'}
                              >
                                {beneficiary.tur || beneficiary.Tur || 'İhtiyaç Sahibi'}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="py-3">
                            <div className="flex flex-col">
                              <span className="font-medium text-gray-900">
                                {beneficiary.ad_soyad}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="py-3">
                            {getCategoryBadge(
                              beneficiary.kategori || beneficiary.Kategori || 'Genel',
                            )}
                          </TableCell>
                          <TableCell className="py-3 text-center">-</TableCell>
                          <TableCell className="py-3">
                            {beneficiary.uyruk || beneficiary.Uyruk || 'TR'}
                          </TableCell>
                          <TableCell className="py-3 font-mono">
                            {beneficiary.kimlik_no || beneficiary.Kimlik_No || '-'}
                          </TableCell>
                          <TableCell className="py-3">
                            {beneficiary.formatted_phone ? (
                              <span className="text-blue-600">{beneficiary.formatted_phone}</span>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </TableCell>
                          <TableCell className="py-3">{beneficiary.ulkesi || 'Türkiye'}</TableCell>
                          <TableCell className="py-3">
                            <span
                              className="truncate max-w-[120px]"
                              title={beneficiary.sehri || undefined}
                            >
                              {beneficiary.sehri || '-'}
                            </span>
                          </TableCell>
                          <TableCell className="py-3">
                            {beneficiary.yerlesimi || beneficiary.Yerlesimi || '-'}
                          </TableCell>
                          <TableCell className="py-3">
                            <span
                              className="truncate max-w-[180px]"
                              title={beneficiary.adres || beneficiary.Adres || undefined}
                            >
                              {beneficiary.adres || beneficiary.Adres || '-'}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* OCR Scanner Modal - Fixed accessibility */}
        <OCRScanner
          isOpen={showOCRScanner}
          onClose={() => {
            setShowOCRScanner(false);
          }}
          onResult={handleOCRResult}
        />
      </PageLayout>

      {/* New Category Notification */}
      <NewCategoryNotification />

      {/* OCR Scanner Modal */}
      {showOCRScanner && (
        <Dialog open={showOCRScanner} onOpenChange={setShowOCRScanner}>
          <DialogContent className="sm:max-w-md max-w-[95vw] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Camera className="w-5 h-5 text-primary" />
                Kimlik Kartı Tara
              </DialogTitle>
              <DialogDescription>
                Kimlik kartının ön yüzünü kameraya tutarak bilgileri otomatik olarak doldurun.
              </DialogDescription>
            </DialogHeader>
            <OCRScanner
              isOpen={true}
              onResult={handleOCRResult}
              onClose={() => {
                setShowOCRScanner(false);
              }}
            />
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}

export default BeneficiariesPageEnhanced;
