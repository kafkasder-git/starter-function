/**
 * @fileoverview BeneficiariesPageEnhanced Module - Application module
 *
 * @author Dernek Yönetim Sistemi Team
 * @version 1.0.0
 */

import {
  AlertCircle,
  CheckCircle,
  Clock,
  Download,
  Loader2,
  Search,
  TrendingUp,
  UserPlus,
  Users,
} from 'lucide-react';
import { actionIcons } from '../../lib/design-system/icons';
import { formatDate } from '../../lib/utils/dateFormatter';
import React, { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
// Note: useSupabaseAuth removed as authentication is handled at app level
import { beneficiariesService } from '../../services/beneficiariesService';
import { useAuthStore } from '../../stores/authStore';
import type { Beneficiary } from '../../types/beneficiary';
import { PageLoading } from '../shared/LoadingSpinner';
// OCR Scanner removed
import { PageLayout } from '../layouts/PageLayout';
import { NewCategoryNotification } from '../notifications/NewCategoryNotification';
import { Badge } from '../ui/badge';
import { StatusBadge } from '../ui/status-badge';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Tooltip, TooltipTrigger, TooltipContent } from '../ui/tooltip';
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
import { ResponsiveTable, type ColumnDef } from '../ui/responsive-table';
import { EmptyState } from '../shared/EmptyState';

import { logger } from '../../lib/logging/logger';
// İhtiyaç sahipleri için display tipi
interface BeneficiaryDisplay extends Beneficiary {
  display_id?: number; // 1'den başlayan sıralı ID
  formatted_phone?: string;
  formatted_registration_date?: string;
  priority_level?: 'low' | 'medium' | 'high' | 'urgent';
  // Backward compatibility fields for display
  ad_soyad?: string;
  kimlik_no?: string;
  telefon_no?: string;
  sehri?: string;
  adres?: string;
  uyruk?: string;
  ulkesi?: string;
  yerlesimi?: string;
  mahalle?: string;
  kategori?: string;
  tur?: string;
  Kategori?: string;
  Tur?: string;
  Kimlik_No?: string;
  Telefon_No?: string;
  Uyruk?: string;
  Yerlesimi?: string;
  Mahalle?: string;
  Adres?: string;
}

// Status mapping removed - now using StatusBadge component

// Category mapping for beneficiaries - Corporate colors
const categoryMapping = {
  gıda: { label: 'Gıda Yardımı', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  nakdi: { label: 'Nakdi Yardım', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  eğitim: { label: 'Eğitim Desteği', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  sağlık: { label: 'Sağlık Yardımı', color: 'bg-cyan-50 text-cyan-700 border-cyan-200' },
  barınma: { label: 'Barınma Desteği', color: 'bg-slate-50 text-slate-700 border-slate-200' },
  giyim: { label: 'Giyim Yardımı', color: 'bg-slate-50 text-slate-700 border-slate-200' },
  diğer: { label: 'Diğer Yardım', color: 'bg-gray-50 text-gray-700 border-gray-200' },
} as const;

// Aid type mapping removed - not used in current implementation

interface BeneficiariesPageProps {
  onNavigateToDetail?: (beneficiaryId: string) => void;
}

/**
 * BeneficiariesPageEnhanced function
 *
 * @param {Object} params - Function parameters
 * @returns {void} Nothing
 */
export function BeneficiariesPageEnhanced({ onNavigateToDetail }: BeneficiariesPageProps) {
  // Get authentication state
  const { isAuthenticated, user } = useAuthStore();

  // Note: Authentication is handled at the app level, no need to check here
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  // Note: statusFilter removed as status field doesn't exist in database
  const [cityFilter, setCityFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name-asc');
  const [beneficiaries, setBeneficiaries] = useState<BeneficiaryDisplay[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [showCreateModal, setShowCreateModal] = useState(false);
  // OCR Scanner removed
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
        // Note: status filter removed as status field doesn't exist in database
        city: cityFilter !== 'all' ? cityFilter : undefined,
        // Note: category filter removed as it's not in the database schema
        searchTerm: searchTerm.trim() ?? undefined,
      };

      const result = await beneficiariesService.getBeneficiaries(currentPage, pageSize, {
        searchTerm: filters.searchTerm,
        sehir: filters.city,
        sortBy,
      });

      if (result.error) {
        logger.error('❌ Service returned error:', result.error);
        setBeneficiaries([]);
        setTotalCount(0);
        return;
      }

      // Transform data to include display fields with proper fallbacks
      const transformedData = (result.data || []).map((item: Beneficiary) => ({
        ...item,
        // Migration sonrası gerçek ID'ler 1'den başlayacak, display_id gerekli değil
        display_id: item.id, // Gerçek ID'yi kullan

        // Phone formatting - English field names from mapping
        formatted_phone: item.phone ?? 'Telefon bilgisi yok',

        // Registration date with proper formatting - English field names
        formatted_registration_date:
          item.application_date ?? item.created_at ?? new Date().toISOString().split('T')[0],

        // Note: Beneficiary already has full_name, name, surname from mapping
        // Keep ad_soyad for backward compatibility in display
        ad_soyad: item.full_name ?? 'Ad Soyad bilgisi yok',

        // Identity number - Use English field name
        kimlik_no: item.identity_number ?? 'TC No bilgisi yok',

        // City - Use English field name
        sehri: item.city ?? 'Şehir bilgisi yok',

        // Address - Use English field name
        adres: item.address ?? 'Adres bilgisi yok',

        // Category and type - Use mapped English field names
        kategori: item.description ?? 'Kategori belirtilmemiş',
        tur: item.notes ?? 'Tür belirtilmemiş',

        // IBAN with fallback
        iban: item.iban ?? 'IBAN bilgisi yok',

        // Nationality and country
        uyruk: item.nationality ?? 'Belirtilmemiş',
        ulkesi: item.country ?? 'Türkiye',

        // Status and priority with defaults
        status: (item.status as any) ?? ('active' as const),
        priority_level: item.priority ?? ('medium' as const),
      }));

      setBeneficiaries(transformedData);
      setTotalCount(result.total ?? 0);
    } catch (error) {
      logger.error('Error loading beneficiaries:', error);
      setBeneficiaries([]);
      setTotalCount(0);

      if (error instanceof Error) {
        const errorMessage = error.message ?? 'Database hatası';

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
  }, [currentPage, pageSize, cityFilter, searchTerm, sortBy]);

  // Load stats computed from already loaded beneficiaries to avoid extra network calls
  const loadStats = useCallback(async () => {
    try {
      const data = Array.isArray(beneficiaries) ? beneficiaries : [];

      const bakimYukumluCount = data
        .map((item) => (item.tur || '').toString())
        .filter(
          (key) => key.toLowerCase().includes('bakmakla') || key.toLowerCase().includes('yükümlü'),
        ).length;

      setStats({
        total: data.length,
        active: data.length, // Varsayılan: hepsi aktif
        passive: 0,
        suspended: 0,
        underEvaluation: 0,
        totalAidAmount: 0, // Bu veri tabloda yok
        bakimYukumluCount,
      });
    } catch (error) {
      logger.error('Stats loading failed:', error);
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
      const result = await beneficiariesService.getCities();
      if (result.data) {
        setCities(result.data);
      }
    } catch {
      // Error loading cities - handle gracefully
    }
  }, []);

  // Test Appwrite connection first
  useEffect(() => {
    const testConnection = async () => {
      const result = await beneficiariesService.testConnection();
      logger.info('🔗 Connection test result:', result);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [beneficiaries.length]);

  // Reload on filter changes with debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setCurrentPage(1);
      loadBeneficiaries();
    }, 300);

    return () => {
      clearTimeout(timeoutId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, cityFilter, sortBy]);

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, 'success' | 'error' | 'warning' | 'info' | 'pending'> = {
      active: 'success',
      inactive: 'error',
      passive: 'error',
      suspended: 'warning',
      under_evaluation: 'info',
      archived: 'pending',
    };

    const statusLabels: Record<string, string> = {
      active: 'Aktif',
      inactive: 'Pasif',
      passive: 'Pasif',
      suspended: 'Askıda',
      under_evaluation: 'Değerlendirmede',
      archived: 'Arşivlendi',
    };

    const statusType = statusMap[status] || 'pending';
    const statusLabel = statusLabels[status] || status;

    return <StatusBadge status={statusType}>{statusLabel}</StatusBadge>;
  };

  const getCategoryBadge = (category: string) => {
    const categoryInfo = categoryMapping[category as keyof typeof categoryMapping];
    const categoryLabel = categoryInfo?.label ?? category;
    const isNewCategory = category === 'Bakmakla Yükümlü Olunan Kişi';

    return (
      <Badge
        variant={isNewCategory ? 'default' : 'outline'}
        className={
          isNewCategory
            ? 'border-purple-200 bg-purple-100 text-purple-800'
            : (categoryInfo?.color ?? '')
        }
      >
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
        kimlik_no: newBeneficiary.kimlik_no.trim() ?? null,
        telefon_no: newBeneficiary.telefon_no.trim() ?? null,
        sehri: newBeneficiary.sehri?.trim() ?? null,
        uyruk: newBeneficiary.uyruk?.trim() ?? null,
        ulkesi: newBeneficiary.ulkesi?.trim() ?? null,
        adres: newBeneficiary.adres.trim() ?? null,
        kategori: newBeneficiary.kategori?.trim() ?? null,
        tur: newBeneficiary.tur?.trim() ?? null,
        iban: newBeneficiary.iban?.trim() ?? null,
      };

      const { data, error } = await beneficiariesService.create(ihtiyacSahibiData as any);

      if (error || !data) {
        throw new Error(error ?? 'Kayıt oluşturulamadı');
      }

      toast.success(`${data.full_name || newBeneficiary.ad_soyad} başarıyla kaydedildi!`, {
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
      logger.error('❌ Error creating beneficiary:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'Kayıt sırasında bir hata oluştu';
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  // Export function
  const handleExport = async () => {
    try {
      // Create CSV data
      const headers = [
        'Ad Soyad',
        'Kimlik No',
        'Telefon',
        'Şehir',
        'Uyruk',
        'Ülke',
        'Adres',
        'Kategori',
        'Tür',
        'IBAN',
        'Durum',
        'Kayıt Tarihi',
      ];

      const csvData = beneficiaries.map((beneficiary) => [
        beneficiary.ad_soyad,
        beneficiary.kimlik_no,
        beneficiary.telefon_no,
        beneficiary.sehri,
        beneficiary.uyruk,
        beneficiary.ulkesi,
        beneficiary.adres,
        beneficiary.kategori,
        beneficiary.tur,
        beneficiary.iban,
        beneficiary.status,
        formatDate(beneficiary.created_at),
      ]);

      const csv = [headers, ...csvData].map((row) => row.join(',')).join('\n');
      const blob = new Blob([`\ufeff${csv}`], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `beneficiaries_${new Date().toISOString().split('T')[0]}.csv`;
      link.click();

      toast.success('Veriler başarıyla dışa aktarıldı');
    } catch {
      toast.error('Dışa aktarma sırasında bir hata oluştu');
    }
  };

  // Delete function
  const handleDelete = async (beneficiaryId: string) => {
    if (!confirm('Bu kaydı silmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      const result = await beneficiariesService.delete(beneficiaryId);

      if (result.error) {
        throw new Error(result.error);
      }

      toast.success('Kayıt silindi');
      await loadBeneficiaries();
      await loadStats();
    } catch (error) {
      logger.error('Error deleting beneficiary:', error);
      toast.error('Kayıt silinemedi');
    }
  };

  // OCR Scanner removed

  // Column definitions for ResponsiveTable
  const beneficiaryColumns: ColumnDef<BeneficiaryDisplay>[] = [
    {
      key: 'index',
      title: '#',
      width: '60px',
      render: (_: any, __: BeneficiaryDisplay, index: number) => (
        <span className="text-sm font-medium text-gray-600">
          {index + 1 + (currentPage - 1) * pageSize}
        </span>
      ),
      hideOnMobile: true,
    },
    {
      key: 'ad_soyad',
      title: 'İsim',
      mobileLabel: 'İsim',
      render: (_: any, row: BeneficiaryDisplay) => (
        <div>
          <div className="font-medium text-gray-900">{row.ad_soyad}</div>
          <div className="mt-0.5 text-xs text-gray-500">{row.uyruk ?? 'TR'}</div>
        </div>
      ),
    },
    {
      key: 'kategori',
      title: 'Kategori',
      mobileLabel: 'Kategori',
      render: (value: string) => getCategoryBadge(value ?? 'Genel'),
    },
    {
      key: 'telefon',
      title: 'Telefon',
      mobileLabel: 'Telefon',
      render: (_: any, row: BeneficiaryDisplay) => (
        <span className="text-blue-600">
          {row.formatted_phone !== 'Telefon bilgisi yok' ? (
            row.formatted_phone
          ) : (
            <span className="text-gray-400">-</span>
          )}
        </span>
      ),
    },
    {
      key: 'sehri',
      title: 'Şehir',
      mobileLabel: 'Şehir',
    },
    {
      key: 'tc_kimlik_no',
      title: 'Kimlik No',
      mobileLabel: 'Kimlik No',
      hideOnMobile: true,
      render: (_: any, row: BeneficiaryDisplay) => (
        <span className="font-mono text-xs">
          {row.kimlik_no !== 'TC No bilgisi yok' ? (
            row.kimlik_no
          ) : (
            <span className="text-gray-400">-</span>
          )}
        </span>
      ),
    },
    {
      key: 'actions',
      title: 'İşlemler',
      mobileLabel: 'İşlemler',
      hideOnMobile: true,
      render: (_: any, row: BeneficiaryDisplay) => {
        const ViewIcon = actionIcons.view;
        const DeleteIcon = actionIcons.delete;

        return (
          <div className="flex items-center justify-center gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    onNavigateToDetail?.(String(row.id));
                  }}
                  aria-label={`View ${row.ad_soyad} details`}
                >
                  <ViewIcon className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Detayları Görüntüle</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-red-600 hover:bg-red-50 hover:text-red-700"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(String(row.id));
                  }}
                  aria-label={`Delete ${row.ad_soyad}`}
                >
                  <DeleteIcon className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Sil</TooltipContent>
            </Tooltip>
          </div>
        );
      },
    },
  ];

  // Custom mobile card renderer
  const renderBeneficiaryMobileCard = (row: BeneficiaryDisplay, index: number) => (
    <Card
      key={row.id}
      className="cursor-pointer transition-shadow hover:shadow-md"
      onClick={() => onNavigateToDetail?.(String(row.id))}
    >
      <CardContent className="p-4">
        <div className="mb-3 flex items-start justify-between">
          <div className="flex-1">
            <div className="mb-1 text-base font-semibold">{row.ad_soyad}</div>
            <div className="text-sm text-gray-600">
              #{index + 1 + (currentPage - 1) * pageSize}
            </div>
          </div>
          {getCategoryBadge(row.kategori ?? 'Genel')}
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Telefon:</span>
            <span className="font-medium">{row.formatted_phone}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Şehir:</span>
            <span className="font-medium">{row.sehri}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Tür:</span>
            <span className="font-medium">{row.tur ?? 'Belirtilmemiş'}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Durum:</span>
            {getStatusBadge((row.status as any) ?? 'active')}
          </div>
        </div>

        <div className="mt-4 flex gap-2 border-t pt-3">
          <Button
            size="sm"
            variant="outline"
            className="flex-1 min-h-[44px]"
            onClick={(e) => {
              e.stopPropagation();
              onNavigateToDetail?.(String(row.id));
            }}
            aria-label={`View ${row.ad_soyad} details`}
          >
            Detay
          </Button>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="sm"
                variant="destructive"
                className="min-h-[44px]"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(String(row.id));
                }}
                aria-label={`Delete ${row.ad_soyad}`}
              >
                {React.createElement(actionIcons.delete, { className: 'h-4 w-4' })}
              </Button>
            </TooltipTrigger>
            <TooltipContent>Sil</TooltipContent>
          </Tooltip>
        </div>
      </CardContent>
    </Card>
  );

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
          <div className="flex w-full flex-wrap items-center justify-end gap-3 p-2 sm:w-auto sm:p-0">
            {/* Export Button */}
            <Button
              variant="outline"
              size="sm"
              className="professional-card order-2 min-h-[44px] min-w-[44px] border-gray-300 px-3 transition-shadow hover:border-gray-400 hover:shadow-md sm:order-1 sm:px-4"
              onClick={handleExport}
            >
              <Download className="mr-1 h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Dışa Aktar</span>
              <span className="sm:hidden">Dışa Aktar</span>
            </Button>

            {/* Primary Add Button - Enhanced */}
            <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
              <DialogTrigger asChild>
                <Button
                  size="sm"
                  className="corporate-gradient micro-interaction order-1 min-h-[44px] min-w-[44px] flex-shrink-0 border-0 px-3 py-3 text-white shadow-lg transition-all duration-300 hover:shadow-xl sm:order-2 sm:px-6"
                  type="button"
                  data-testid="new-beneficiary-btn"
                  aria-label="Yeni İhtiyaç Sahibi Ekle"
                >
                  <UserPlus className="mr-1 h-4 w-4 flex-shrink-0 sm:mr-2" />
                  <span className="hidden whitespace-nowrap sm:inline">
                    Yeni İhtiyaç Sahibi Ekle
                  </span>
                  <span className="sm:hidden">Yeni Ekle</span>
                </Button>
              </DialogTrigger>
              <DialogContent
                className="professional-card max-h-[90vh] max-w-[95vw] overflow-y-auto sm:max-w-lg"
                aria-describedby="dialog-description"
              >
                <DialogHeader className="pb-4">
                  <DialogTitle className="flex items-center gap-2">
                    <UserPlus className="text-primary h-6 w-6" />
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
                      className="focus-corporate min-h-[44px]"
                      disabled={saving}
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="kimlik_no">Kimlik No</Label>
                      {/* OCR Scanner removed */}
                    </div>
                    <Input
                      id="kimlik_no"
                      value={newBeneficiary.kimlik_no}
                      onChange={(e) => {
                        setNewBeneficiary({ ...newBeneficiary, kimlik_no: e.target.value });
                      }}
                      placeholder="Kimlik numarası (TC, Pasaport vb.)"
                      className="focus-corporate min-h-[44px]"
                      disabled={saving}
                    />
                    {/* OCR Scanner help text removed */}
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
                      className="focus-corporate min-h-[44px]"
                      inputMode="tel"
                      disabled={saving}
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="sehri">Şehir</Label>
                      <Input
                        id="sehri"
                        value={newBeneficiary.sehri}
                        onChange={(e) => {
                          setNewBeneficiary({ ...newBeneficiary, sehri: e.target.value });
                        }}
                        placeholder="İhtiyaç sahibinin yaşadığı şehir"
                        className="focus-corporate min-h-[44px]"
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
                        className="focus-corporate min-h-[44px]"
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
                      className="focus-corporate min-h-[44px]"
                      disabled={saving}
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="kategori">Kategori</Label>
                      <Input
                        id="kategori"
                        value={newBeneficiary.kategori}
                        onChange={(e) => {
                          setNewBeneficiary({ ...newBeneficiary, kategori: e.target.value });
                        }}
                        placeholder="Yardım kategorisi"
                        className="focus-corporate min-h-[44px]"
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
                        className="focus-corporate min-h-[44px]"
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
                      className="focus-corporate min-h-[44px]"
                      disabled={saving}
                    />
                  </div>
                </div>

                <div className="flex flex-col justify-end gap-3 border-t pt-6 sm:flex-row">
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
                    className="corporate-gradient min-h-[44px] px-6 shadow-md hover:shadow-lg"
                    disabled={saving}
                  >
                    {saving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Kaydediliyor...
                      </>
                    ) : (
                      <>
                        <UserPlus className="mr-2 h-4 w-4" />
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
        <div className="space-y-4 p-3 sm:space-y-6 sm:p-6">
          {/* Enhanced Summary Cards */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-5">
            <Card className="professional-card micro-interaction">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xl text-blue-600 sm:text-2xl">{stats.total ?? 0}</div>
                    <p className="text-xs text-gray-600 sm:text-sm">Toplam Kayıt</p>
                  </div>
                  <Users className="h-8 w-8 text-blue-500 opacity-80" />
                </div>
              </CardContent>
            </Card>
            <Card className="professional-card micro-interaction">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xl text-green-600 sm:text-2xl">{stats.active ?? 0}</div>
                    <p className="text-xs text-gray-600 sm:text-sm">Aktif</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-500 opacity-80" />
                </div>
              </CardContent>
            </Card>
            <Card className="professional-card micro-interaction">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xl text-orange-600 sm:text-2xl">
                      {stats.underEvaluation ?? 0}
                    </div>
                    <p className="text-xs text-gray-600 sm:text-sm">Değerlendirmede</p>
                  </div>
                  <Clock className="h-8 w-8 text-orange-500 opacity-80" />
                </div>
              </CardContent>
            </Card>
            <Card className="professional-card micro-interaction">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xl text-purple-600 sm:text-2xl">
                      {stats.bakimYukumluCount ?? 0}
                    </div>
                    <p className="text-xs text-gray-600 sm:text-sm">Bakmakla Yükümlü</p>
                  </div>
                  <AlertCircle className="h-8 w-8 text-purple-500 opacity-80" />
                </div>
              </CardContent>
            </Card>
            <Card className="professional-card micro-interaction">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-lg text-emerald-600 sm:text-2xl">
                      ₺{(stats.totalAidAmount ?? 0).toLocaleString()}
                    </div>
                    <p className="text-xs text-gray-600 sm:text-sm">Toplam Yardım</p>
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
                <Users className="text-primary h-5 w-5" />
                İhtiyaç Sahibi Listesi
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Enhanced Filters with Category Filter */}
              <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:gap-4">
                <div className="relative flex-1">
                  <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
                  <Input
                    placeholder="Ad, soyad veya TC kimlik no ile ara..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                    }}
                    className="focus-corporate min-h-[44px] pl-10 text-sm sm:text-base"
                  />
                </div>
                <div className="grid grid-cols-1 gap-2 sm:flex sm:gap-3">
                  {/* Status filter removed as status field doesn't exist in database */}
                  <Select value={cityFilter} onValueChange={setCityFilter}>
                    <SelectTrigger className="focus-corporate min-h-[44px] min-w-[120px] text-sm sm:text-base">
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
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="focus-corporate min-h-[44px] min-w-[140px] text-sm sm:text-base">
                      <SelectValue placeholder="Sıralama" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="name-asc">Ad (A-Z)</SelectItem>
                      <SelectItem value="name-desc">Ad (Z-A)</SelectItem>
                      <SelectItem value="date-newest">En Yeni</SelectItem>
                      <SelectItem value="date-oldest">En Eski</SelectItem>
                      <SelectItem value="city-asc">Şehir (A-Z)</SelectItem>
                      <SelectItem value="category-asc">Kategori (A-Z)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Responsive Table - Automatically switches between mobile cards and desktop table */}
              <ResponsiveTable<BeneficiaryDisplay>
                data={beneficiaries}
                columns={beneficiaryColumns}
                loading={loading}
                onRowClick={(row) => onNavigateToDetail?.(String(row.id))}
                mobileCardRenderer={renderBeneficiaryMobileCard}
                stickyHeader={true}
                emptyState={
                  <EmptyState
                    title="Henüz hiç ihtiyaç sahibi kaydı yok."
                    description='İlk kayıt için "Yeni İhtiyaç Sahibi Ekle" butonunu kullanın'
                  />
                }
              />
            </CardContent>
          </Card>
        </div>

        {/* OCR Scanner removed */}
      </PageLayout>

      {/* New Category Notification */}
      <NewCategoryNotification />

      {/* OCR Scanner Modal removed */}
    </>
  );
}

export default BeneficiariesPageEnhanced;
