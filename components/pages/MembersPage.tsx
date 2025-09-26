/**
 * @fileoverview MembersPage Module - Application module
 * 
 * @author Dernek Yönetim Sistemi Team
 * @version 1.0.0
 */

import {
  Clock,
  Download,
  Edit,
  Eye,
  Filter,
  Plus,
  Trash2,
  UserCheck,
  UserPlus,
  UserX,
  Users,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { membersService, type Member } from '../../services/membersService';
import { PageLoading } from '../LoadingSpinner';
import { PageLayout } from '../PageLayout';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { DesktopActionButtons, DesktopFilters, DesktopStatsCard } from '../ui/desktop-table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';

import { logger } from '../../lib/logging/logger';
// Status and membership type mappings for Turkish display
const statusMapping = {
  active: 'Aktif',
  inactive: 'Pasif',
  suspended: 'Askıda',
} as const;

const membershipTypeMapping = {
  standard: 'Standart',
  premium: 'Premium',
  corporate: 'Kurumsal',
  student: 'Öğrenci',
  senior: 'Emekli',
} as const;

/**
 * MembersPage function
 * 
 * @param {Object} params - Function parameters
 * @returns {void} Nothing
 */
export function MembersPage() {
  // User authentication handled by AuthContext
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [members, setMembers] = useState<Member[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    suspended: 0,
  });

  // Load members data
  const loadMembers = useCallback(async () => {
    try {
      setLoading(true);

      const filters = {
        membershipStatus: statusFilter !== 'all' ? statusFilter : undefined,
        membershipType: typeFilter !== 'all' ? typeFilter : undefined,
        searchTerm: searchTerm.trim() ?? undefined,
      };

      const result = await membersService.getMembers(currentPage, pageSize, filters);

      if (result.error) {
        logger.error('❌ Error loading members:', result.error);
        setMembers([]);
        setTotalCount(0);
        toast.error('Üyeler yüklenirken hata oluştu');
        return;
      }

      setMembers(result.data || []);
      setTotalCount(result.count ?? 0);
    } catch (error) {
      logger.error('Error loading members:', error);
      toast.error('Üyeler yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, statusFilter, typeFilter, searchTerm]);

  // Load stats
  const loadStats = useCallback(async () => {
    try {
      const result = await membersService.getMemberStats();
      if (result.data) {
        setStats({
          total: result.data.total,
          active: result.data.active,
          inactive: result.data.inactive,
          suspended: result.data.suspended,
        });
      }
    } catch (error) {
      logger.error('Error loading stats:', error);
    }
  }, []);

  // Load cities for filter

  // Initial load
  useEffect(() => {
    loadMembers();
    loadStats();
  }, [loadMembers, loadStats]);

  // Reload on filter changes with debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setCurrentPage(1); // Reset to first page on filter change
      loadMembers();
    }, 300);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [searchTerm, statusFilter, typeFilter]);

  const getStatusBadge = (status: string) => {
    const displayStatus = statusMapping[status as keyof typeof statusMapping] || status;
    const variants = {
      Aktif: 'bg-green-100 text-green-800 hover:bg-green-100',
      Pasif: 'bg-gray-100 text-gray-800 hover:bg-gray-100',
      Askıda: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100',
    };

    return <Badge className={variants[displayStatus]}>{displayStatus}</Badge>;
  };

  const getTypeBadge = (type: string) => {
    const displayType = membershipTypeMapping[type as keyof typeof membershipTypeMapping] || type;
    const variants = {
      Standart: 'bg-blue-100 text-blue-800',
      Premium: 'bg-purple-100 text-purple-800',
      Kurumsal: 'bg-orange-100 text-orange-800',
      Öğrenci: 'bg-emerald-100 text-emerald-800',
      Emekli: 'bg-indigo-100 text-indigo-800',
    };

    return (
      <Badge variant="secondary" className={variants[displayType]}>
        {displayType}
      </Badge>
    );
  };

  if (loading && members.length === 0) {
    return <PageLoading />;
  }

  return (
    <PageLayout
      title="Üye Yönetimi"
      subtitle="Dernek üyelerini görüntüleyin ve yönetin"
      actions={
        <DesktopActionButtons
          primaryAction={{
            label: 'Yeni Üye Ekle',
            icon: <Plus className="w-4 h-4" />,
            onClick: () => {},
          }}
          secondaryActions={[
            {
              label: 'Dışa Aktar',
              icon: <Download className="w-4 h-4" />,
              onClick: () => {},
              variant: 'outline',
            },
          ]}
        />
      }
    >
      <div className="p-6 space-y-6">
        {/* Desktop Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <DesktopStatsCard
            title="Toplam Üye"
            value={stats.total}
            subtitle="Kayıtlı üye sayısı"
            icon={<Users className="w-4 h-4" />}
            color="blue"
            trend={{ value: '+%12 bu ay', positive: true }}
          />

          <DesktopStatsCard
            title="Aktif Üye"
            value={stats.active}
            subtitle="Aktif durumda"
            icon={<UserCheck className="w-4 h-4" />}
            color="green"
            trend={{
              value: `%${Math.round((stats.active / stats.total) * 100) || 0} aktif`,
              positive: true,
            }}
          />

          <DesktopStatsCard
            title="Pasif Üye"
            value={stats.inactive}
            subtitle="Pasif durumda"
            icon={<UserX className="w-4 h-4" />}
            color="gray"
            trend={{
              value: `%${Math.round((stats.inactive / stats.total) * 100) || 0} pasif`,
              positive: false,
            }}
          />

          <DesktopStatsCard
            title="Askıda"
            value={stats.suspended}
            subtitle="Askıya alınmış"
            icon={<Clock className="w-4 h-4" />}
            color="yellow"
            trend={{
              value: stats.suspended > 0 ? 'Dikkat gerekli' : 'Temiz durum',
              positive: stats.suspended === 0,
            }}
          />
        </div>

        {/* Mobile-Optimized Filters */}
        <DesktopFilters
          searchValue={searchTerm}
          onSearchChange={setSearchTerm}
          searchPlaceholder="Dernek üyesi ara..."
        >
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="min-h-[44px] text-base">
              <SelectValue placeholder="Tüm Durumlar" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tüm Durumlar</SelectItem>
              <SelectItem value="active">Aktif</SelectItem>
              <SelectItem value="inactive">Pasif</SelectItem>
              <SelectItem value="suspended">Askıda</SelectItem>
            </SelectContent>
          </Select>

          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="min-h-[44px] text-base">
              <SelectValue placeholder="Tüm Üyelik Tipleri" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tüm Tipler</SelectItem>
              <SelectItem value="standard">Standart</SelectItem>
              <SelectItem value="premium">Premium</SelectItem>
              <SelectItem value="corporate">Kurumsal</SelectItem>
              <SelectItem value="student">Öğrenci</SelectItem>
              <SelectItem value="senior">Emekli</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" className="min-h-[44px] px-4 text-base">
            <Filter className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Gelişmiş Filtre</span>
            <span className="sm:hidden">Filtre</span>
          </Button>
        </DesktopFilters>

        {/* Mobile-Optimized Members List */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg sm:text-xl">
              Üye Listesi ({(members || []).length} üye)
            </CardTitle>
          </CardHeader>

          <CardContent className="p-0">
            {/* Mobile Card View for small screens */}
            <div className="block sm:hidden">
              {loading ? (
                <div className="space-y-3 p-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Card key={i} className="border border-gray-200">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-12 h-12 bg-gray-200 rounded-full animate-pulse" />
                          <div className="flex-1 space-y-2">
                            <div className="h-4 bg-gray-200 rounded w-32 animate-pulse" />
                            <div className="h-3 bg-gray-200 rounded w-24 animate-pulse" />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="h-4 bg-gray-200 rounded w-40 animate-pulse" />
                          <div className="h-4 bg-gray-200 rounded w-28 animate-pulse" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : members.length > 0 ? (
                <div className="space-y-3 p-4">
                  {members.map((member) => (
                    <Card
                      key={member.id}
                      className="border border-gray-200 hover:shadow-md transition-shadow"
                    >
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex items-center gap-3 flex-1">
                            <Avatar className="w-12 h-12">
                              <AvatarFallback className="bg-corporate text-white text-sm font-medium">
                                {member.name
                                  .split(' ')
                                  .map((n) => n[0])
                                  .join('')
                                  .slice(0, 2)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-medium text-gray-900 truncate">{member.name}</h3>
                              <p className="text-sm text-gray-600 truncate">{member.email}</p>
                              <p className="text-xs text-gray-500">
                                {member.phone ?? 'Telefon yok'}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            {getStatusBadge(member.membership_status)}
                            <div className="mt-1">{getTypeBadge(member.membership_type)}</div>
                          </div>
                        </div>

                        <div className="flex justify-between items-center text-sm text-gray-500 mb-3">
                          <span>{member.city ?? 'Şehir belirtilmemiş'}</span>
                          <span>{new Date(member.join_date).toLocaleDateString('tr-TR')}</span>
                        </div>

                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="min-h-[44px] min-w-[44px] p-2 text-blue-600 hover:text-blue-700"
                            onClick={() => {}}
                            aria-label="Görüntüle"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="min-h-[44px] min-w-[44px] p-2 text-red-600 hover:text-red-700"
                            onClick={() => {}}
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
                  <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-gray-600 mb-2">Henüz üye kaydı bulunmuyor</p>
                  <p className="text-sm text-gray-400">
                    Yeni üye eklemek için "Yeni Üye" butonunu kullanın
                  </p>
                </div>
              )}
            </div>

            {/* Desktop Table View */}
            <div className="hidden sm:block overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50/50">
                    <TableHead className="min-w-[200px] p-4">Üye</TableHead>
                    <TableHead className="min-w-[180px] p-4">E-posta</TableHead>
                    <TableHead className="min-w-[120px] p-4">Telefon</TableHead>
                    <TableHead className="min-w-[120px] p-4">Üyelik Tipi</TableHead>
                    <TableHead className="min-w-[100px] p-4">Durum</TableHead>
                    <TableHead className="min-w-[120px] p-4">Katılım Tarihi</TableHead>
                    <TableHead className="min-w-[120px] p-4 text-center">İşlemler</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse" />
                            <div className="space-y-2">
                              <div className="h-4 bg-gray-200 rounded w-32 animate-pulse" />
                              <div className="h-3 bg-gray-200 rounded w-24 animate-pulse" />
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="p-4">
                          <div className="h-4 bg-gray-200 rounded w-40 animate-pulse" />
                        </TableCell>
                        <TableCell className="p-4">
                          <div className="h-4 bg-gray-200 rounded w-28 animate-pulse" />
                        </TableCell>
                        <TableCell className="p-4">
                          <div className="h-6 bg-gray-200 rounded w-20 animate-pulse" />
                        </TableCell>
                        <TableCell className="p-4">
                          <div className="h-6 bg-gray-200 rounded w-16 animate-pulse" />
                        </TableCell>
                        <TableCell className="p-4">
                          <div className="h-4 bg-gray-200 rounded w-24 animate-pulse" />
                        </TableCell>
                        <TableCell className="p-4">
                          <div className="flex justify-center gap-2">
                            <div className="w-8 h-8 bg-gray-200 rounded animate-pulse" />
                            <div className="w-8 h-8 bg-gray-200 rounded animate-pulse" />
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (members || []).length > 0 ? (
                    (members || []).map((member) => (
                      <TableRow key={member.id} className="hover:bg-gray-50/50 transition-colors">
                        <TableCell className="p-4">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={member.avatar_url ?? ''} />
                              <AvatarFallback className="bg-blue-100 text-blue-600">
                                {(member.name ?? 'U').charAt(0)}
                                {(member.name ?? '').split(' ')[1]?.charAt(0) || 'N'}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0 flex-1">
                              <div className="font-medium truncate">
                                {member.name ?? 'Bilinmeyen Üye'}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="p-4 text-sm">{member.email ?? '-'}</TableCell>
                        <TableCell className="p-4 text-sm">{member.phone ?? '-'}</TableCell>
                        <TableCell className="p-4">
                          {getTypeBadge(member.membership_type)}
                        </TableCell>
                        <TableCell className="p-4">
                          {getStatusBadge(member.membership_status)}
                        </TableCell>
                        <TableCell className="p-4 text-sm text-gray-500">
                          {member.join_date
                            ? new Date(member.join_date).toLocaleDateString('tr-TR')
                            : '-'}
                        </TableCell>
                        <TableCell className="p-4">
                          <div className="flex items-center justify-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-600"
                              aria-label={`${member.name} detaylarını görüntüle`}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 hover:bg-green-50 hover:text-green-600"
                              aria-label={`${member.name} bilgilerini düzenle`}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="p-8 text-center">
                        <UserPlus className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                        <p className="text-gray-600 mb-2">
                            {(searchTerm || statusFilter !== 'all' || typeFilter !== 'all')
                              ? 'Arama kriterlerinize uygun üye bulunamadı.'
                              : 'Henüz hiç üye kaydı yok.'}
                        </p>
                        <Button className="gap-2">
                          <Plus className="h-4 w-4" />
                          İlk Üyeyi Ekle
                        </Button>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Desktop Pagination */}
        {totalCount > pageSize && (
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between gap-4">
                <div className="text-sm text-gray-500">
                  {totalCount} kayıttan {(currentPage - 1) * pageSize + 1}-
                  {Math.min(currentPage * pageSize, totalCount)} arası gösteriliyor
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setCurrentPage((prev) => Math.max(1, prev - 1));
                    }}
                      disabled={currentPage === 1 || loading}
                    className="px-4"
                  >
                    Önceki
                  </Button>
                  <span className="px-3 py-2 text-sm border rounded flex items-center bg-gray-50">
                    {currentPage} / {Math.ceil(totalCount / pageSize)}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setCurrentPage((prev) => prev + 1);
                    }}
                    disabled={currentPage >= Math.ceil(totalCount / pageSize) || loading}
                    className="px-4"
                  >
                    Sonraki
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </PageLayout>
  );
}
