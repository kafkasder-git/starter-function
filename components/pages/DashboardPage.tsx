/**
 * @fileoverview Dashboard Page - Dernek Yönetim Sistemi Ana Sayfa
 * @description Genel dashboard ve istatistikler
 */

import { useEffect, useState, useCallback, memo } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { databaseService } from '@/services/databaseService';
import { messagingService } from '@/services/messagingService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Heading } from '@/components/ui/heading';
import { Text } from '@/components/ui/text';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Heart, 
  GraduationCap, 
  Calendar, 
  MessageSquare, 
  TrendingUp,
  Activity,
  Bell,
  Clock
} from 'lucide-react';

// Dashboard stats interface
interface DashboardStats {
  totalUsers: number;
  totalDonations: number;
  totalBeneficiaries: number;
  totalScholarships: number;
  totalEvents: number;
  totalMessages: number;
  recentDonations: any[];
  recentAidRequests: any[];
  recentMessages: any[];
}

const DashboardPage = memo(() => {
  const { user, logout } = useAuthStore();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Memoized dashboard data loading
  const loadDashboardData = useCallback(async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Paralel olarak tüm istatistikleri yükle
        const [
          usersStats,
          donationsStats,
          beneficiariesStats,
          scholarshipsStats,
          eventsStats,
          messagesStats,
          recentDonations,
          recentAidRequests,
          recentMessages,
        ] = await Promise.all([
          databaseService.getCollectionStats('users'),
          databaseService.getCollectionStats('donations'),
          databaseService.getCollectionStats('beneficiaries'),
          databaseService.getCollectionStats('scholarships'),
          databaseService.getCollectionStats('events'),
          databaseService.getCollectionStats('messages'),
          databaseService.listDonations(5, 0),
          databaseService.listAidRequests(5, 0),
          messagingService.getUserMessages(user?.id || '', 5),
        ]);

        setStats({
          totalUsers: usersStats.total,
          totalDonations: donationsStats.total,
          totalBeneficiaries: beneficiariesStats.total,
          totalScholarships: scholarshipsStats.total,
          totalEvents: eventsStats.total,
          totalMessages: messagesStats.total,
          recentDonations: recentDonations.documents,
          recentAidRequests: recentAidRequests.documents,
          recentMessages,
        });
      } catch (err) {
        console.error('Dashboard verileri yüklenemedi:', err);
        setError('Dashboard verileri yüklenemedi');
        // TODO: Toast notification sistemi entegrasyonu
      } finally {
        setIsLoading(false);
      }
  }, [user]);

  // Dashboard verilerini yükle
  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user, loadDashboardData]);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Dashboard yükleniyor...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-gray-50">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">Hata</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => { window.location.reload(); }} className="w-full">
              Tekrar Dene
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <Heading level={1} size="3xl" weight="bold" className="text-gray-900">
              Hoş Geldiniz, {user?.name || 'Kullanıcı'}!
            </Heading>
            <Text size="lg" color="neutral" className="mt-2">
              Dernek Yönetim Sistemi Dashboard&apos;u
            </Text>
          </div>
          <div className="flex items-center space-x-4">
            <Badge variant="secondary" className="flex items-center space-x-2">
              <Activity className="h-4 w-4" />
              <span>{user?.role || 'Kullanıcı'}</span>
            </Badge>
            <Button onClick={() => logout()} variant="outline">
              Çıkış Yap
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Kullanıcılar</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalUsers || 0}</div>
              <p className="text-xs text-muted-foreground">
                Toplam kayıtlı kullanıcı
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Bağışlar</CardTitle>
              <Heart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalDonations || 0}</div>
              <p className="text-xs text-muted-foreground">
                Toplam bağış sayısı
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">İhtiyaç Sahipleri</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalBeneficiaries || 0}</div>
              <p className="text-xs text-muted-foreground">
                Kayıtlı ihtiyaç sahibi
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Burslar</CardTitle>
              <GraduationCap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalScholarships || 0}</div>
              <p className="text-xs text-muted-foreground">
                Aktif burs sayısı
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Etkinlikler</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalEvents || 0}</div>
              <p className="text-xs text-muted-foreground">
                Planlanan etkinlik
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Mesajlar</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalMessages || 0}</div>
              <p className="text-xs text-muted-foreground">
                Gönderilen mesaj
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Donations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5" />
                <span>Son Bağışlar</span>
              </CardTitle>
              <CardDescription>
                En son yapılan bağışlar
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats?.recentDonations?.length > 0 ? (
                  stats.recentDonations.map((donation, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full" />
                        <div>
                          <p className="text-sm font-medium">{donation.donorName}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(donation.donationDate).toLocaleDateString('tr-TR')}
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline">
                        {donation.amount} {donation.currency}
                      </Badge>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Henüz bağış kaydı bulunmuyor
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recent Aid Requests */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bell className="h-5 w-5" />
                <span>Son Yardım Başvuruları</span>
              </CardTitle>
              <CardDescription>
                En son gelen yardım başvuruları
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats?.recentAidRequests?.length > 0 ? (
                  stats.recentAidRequests.map((request, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full" />
                        <div>
                          <p className="text-sm font-medium">
                            {request.requestType} Başvurusu
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(request.requestDate).toLocaleDateString('tr-TR')}
                          </p>
                        </div>
                      </div>
                      <Badge 
                        variant={request.status === 'onaylandı' ? 'default' : 'secondary'}
                      >
                        {request.status}
                      </Badge>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Henüz yardım başvurusu bulunmuyor
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="h-5 w-5" />
              <span>Hızlı İşlemler</span>
            </CardTitle>
            <CardDescription>
              Sık kullanılan işlemler için hızlı erişim
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button className="h-20 flex flex-col items-center justify-center space-y-2" variant="outline">
                <Heart className="h-6 w-6" />
                <span className="text-sm">Yeni Bağış</span>
              </Button>
              <Button className="h-20 flex flex-col items-center justify-center space-y-2" variant="outline">
                <Users className="h-6 w-6" />
                <span className="text-sm">İhtiyaç Sahibi</span>
              </Button>
              <Button className="h-20 flex flex-col items-center justify-center space-y-2" variant="outline">
                <Bell className="h-6 w-6" />
                <span className="text-sm">Yardım Başvurusu</span>
              </Button>
              <Button className="h-20 flex flex-col items-center justify-center space-y-2" variant="outline">
                <MessageSquare className="h-6 w-6" />
                <span className="text-sm">Mesaj Gönder</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* System Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5" />
              <span>Sistem Durumu</span>
            </CardTitle>
            <CardDescription>
              Sistem bileşenlerinin durumu
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-green-500 rounded-full" />
                <div>
                  <p className="text-sm font-medium">Veritabanı</p>
                  <p className="text-xs text-muted-foreground">Bağlantı aktif</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-green-500 rounded-full" />
                <div>
                  <p className="text-sm font-medium">Mesajlaşma</p>
                  <p className="text-xs text-muted-foreground">Servis aktif</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-green-500 rounded-full" />
                <div>
                  <p className="text-sm font-medium">Dosya Depolama</p>
                  <p className="text-xs text-muted-foreground">Depolama aktif</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
});

export default DashboardPage;