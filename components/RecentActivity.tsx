/**
 * @fileoverview RecentActivity Module - Application module
 *
 * @author Dernek Yönetim Sistemi Team
 * @version 1.0.0
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
// import { Badge } from './ui/badge';
import { StatusBadge } from './ui/status-badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import { Heading } from './ui/heading';
import { Text } from './ui/text';
import { Heart, Users, HelpingHand, Calendar, MoreHorizontal } from 'lucide-react';
import { useRelativeTime } from '../hooks/useRelativeTime';
import { beneficiariesService } from '../services/beneficiariesService';
import { donationsService } from '../services/donationsService';
import { membersService } from '../services/membersService';
import { aidRequestsService } from '../services/aidRequestsService';
import { logger } from '../lib/logging/logger';

interface Activity {
  id: string;
  type: 'donation' | 'member' | 'aid' | 'event';
  title: string;
  description: string;
  timestamp: string;
  user?: string;
  amount?: number;
  status?: 'success' | 'pending' | 'failed';
}

/**
 * RecentActivity function
 *
 * @param {Object} params - Function parameters
 * @returns {void} Nothing
 */
export function RecentActivity() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setLoading(true);
        setError(null);

        logger.info('Fetching recent activities from services...');

        // Fetch recent data from all services
        const [beneficiariesResult, donationsResult, membersResult, aidRequestsResult] = await Promise.all([
          beneficiariesService.getBeneficiaries({ page: 1, limit: 5 }),
          donationsService.getDonations({ page: 1, limit: 5 }),
          membersService.getMembers({ page: 1, limit: 5 }),
          aidRequestsService.getAidRequests({ page: 1, limit: 5 })
        ]);

        const activities: Activity[] = [];

        // Process beneficiaries as activities
        if (beneficiariesResult.data) {
          beneficiariesResult.data.forEach((beneficiary, index) => {
            activities.push({
              id: `beneficiary-${beneficiary.id}`,
              type: 'aid',
              title: 'İhtiyaç Sahibi Kaydı',
              description: `${beneficiary.name} sisteme ihtiyaç sahibi olarak eklendi.`,
              timestamp: beneficiary.created_at || new Date().toISOString(),
              user: beneficiary.name,
              status: beneficiary.status === 'active' ? 'success' : 'pending',
            });
          });
        }

        // Process donations as activities
        if (donationsResult.data) {
          donationsResult.data.forEach((donation, index) => {
            activities.push({
              id: `donation-${donation.id}`,
              type: 'donation',
              title: 'Bağış Kaydı',
              description: `${donation.donor_name} tarafından ${donation.amount}₺ bağış yapıldı.`,
              timestamp: donation.donation_date || new Date().toISOString(),
              user: donation.donor_name,
              amount: donation.amount,
              status: donation.status === 'completed' ? 'success' : 
                     donation.status === 'pending' ? 'pending' : 'failed',
            });
          });
        }

        // Process members as activities
        if (membersResult.data) {
          membersResult.data.forEach((member, index) => {
            activities.push({
              id: `member-${member.id}`,
              type: 'member',
              title: 'Üye Kaydı',
              description: `${member.name} sisteme üye olarak eklendi.`,
              timestamp: member.joined_date || new Date().toISOString(),
              user: member.name,
              status: member.status === 'active' ? 'success' : 'pending',
            });
          });
        }

        // Process aid requests as activities
        if (aidRequestsResult.data) {
          aidRequestsResult.data.forEach((request, index) => {
            activities.push({
              id: `aid-request-${request.id}`,
              type: 'aid',
              title: 'Yardım Başvurusu',
              description: `${request.applicant_name} tarafından ${request.aid_type} yardım talebi yapıldı.`,
              timestamp: request.application_date || new Date().toISOString(),
              user: request.applicant_name,
              amount: request.requested_amount,
              status: request.status === 'approved' ? 'success' : 
                     request.status === 'pending' ? 'pending' : 'failed',
            });
          });
        }

        // Sort activities by timestamp (most recent first)
        activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

        // Take only the most recent 10 activities
        const recentActivities = activities.slice(0, 10);

        logger.info('Recent activities fetched successfully', { count: recentActivities.length });
        setActivities(recentActivities);

        // If no activities found, show some mock data as fallback
        if (recentActivities.length === 0) {
          const mockActivities: Activity[] = [
            {
              id: 'mock-1',
              type: 'aid',
              title: 'Yeni Yardım Başvurusu',
              description: 'Sistem henüz aktivite kaydı bulunamadı. Veriler yüklenirken bu örnek gösterilmektedir.',
              timestamp: new Date().toISOString(),
              user: 'Sistem',
              status: 'pending',
            },
            {
              id: 'mock-2',
              type: 'donation',
              title: 'Bağış Kaydı',
              description: 'İlk bağış kaydınız burada görünecek.',
              timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
              user: 'Muhasebe Ekibi',
              amount: 0,
              status: 'success',
            },
          ];
          setActivities(mockActivities);
        }

      } catch (err) {
        logger.error('Failed to fetch recent activities:', err);
        setError('Aktiviteler yüklenirken bir hata oluştu.');
        
        // Show fallback mock data on error
        const fallbackActivities: Activity[] = [
          {
            id: 'error-1',
            type: 'aid',
            title: 'Veri Yükleme Hatası',
            description: 'Aktiviteler yüklenirken hata oluştu. Lütfen sayfayı yenileyin.',
            timestamp: new Date().toISOString(),
            user: 'Sistem',
            status: 'failed',
          },
        ];
        setActivities(fallbackActivities);
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, []);

  const getActivityIcon = (type: Activity['type']) => {
    const icons: Record<Activity['type'], React.ReactNode> = {
      donation: <Heart className="w-4 h-4" />,
      member: <Users className="w-4 h-4" />,
      aid: <HelpingHand className="w-4 h-4" />,
      event: <Calendar className="w-4 h-4" />,
    };
    return type in icons ? icons[type] : icons.donation;
  };

  const getActivityColor = (type: Activity['type']) => {
    const colors: Record<Activity['type'], string> = {
      donation: 'text-red-600 bg-red-50',
      member: 'text-blue-600 bg-blue-50',
      aid: 'text-purple-600 bg-purple-50',
      event: 'text-green-600 bg-green-50',
    };
    return type in colors ? colors[type] : colors.donation;
  };

  const getStatusBadge = (status?: Activity['status']) => {
    if (!status) return null;

    const statusMap: Record<string, 'success' | 'error' | 'warning' | 'info' | 'pending'> = {
      success: 'success',
      pending: 'pending',
      failed: 'error',
    };

    const labels: Record<string, string> = {
      success: 'Tamamlandı',
      pending: 'Beklemede',
      failed: 'Başarısız',
    };

    const statusType = statusMap[status] || 'pending';
    const label = labels[status] || status;

    return <StatusBadge status={statusType}>{label}</StatusBadge>;
  };

  const RelativeTime = ({ timestamp }: { timestamp: string }) => {
    const relativeTime = useRelativeTime(timestamp);
    return (
      <Text as="span" size="xs" color="muted">
        {relativeTime}
      </Text>
    );
  };

  const handleRetry = () => {
    setError(null);
    setLoading(true);
    // Re-trigger the effect by updating a dependency
    window.location.reload();
  };

  return (
    <Card className="shadow-md border border-gray-200 dark:border-gray-700 dark:bg-gray-900">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle>Son Aktiviteler</CardTitle>
        <Button variant="ghost" size="sm">
          <MoreHorizontal className="w-4 h-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-3 lg:space-y-4 max-h-96 overflow-y-auto scrollbar-thin px-6 py-6">
        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-start gap-4 p-4">
                <div className="w-10 h-10 bg-gray-200 rounded-lg animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse" />
                  <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <div className="text-red-500 mb-4">
              <Calendar className="w-12 h-12 mx-auto mb-3" />
              <p className="text-sm font-medium">{error}</p>
            </div>
            <Button variant="outline" size="sm" onClick={handleRetry}>
              Tekrar Dene
            </Button>
          </div>
        ) : activities.length > 0 ? (
          activities.map((activity) => (
            <div
              key={activity.id}
              className="flex items-start gap-4 p-4 hover:bg-neutral-50/80 rounded-xl transition-all duration-200 border border-transparent hover:border-neutral-200/60 cursor-pointer group"
            >
              <div
                className={`p-2.5 rounded-xl shadow-sm ${getActivityColor(activity.type)} group-hover:scale-105 transition-transform duration-200 border border-white/20`}
              >
                {getActivityIcon(activity.type)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1.5">
                  <Heading
                    level={4}
                    size="sm"
                    weight="semibold"
                    className="truncate tracking-tight"
                  >
                    {activity.title}
                  </Heading>
                  {activity.amount && (
                    <span className="text-sm font-bold text-green-700 bg-green-50/80 px-2 py-1 rounded-lg border border-green-200/60">
                      ₺{activity.amount.toLocaleString()}
                    </span>
                  )}
                </div>

                <Text size="xs" color="neutral" className="mb-2.5 line-clamp-2">
                  {activity.description}
                </Text>

                <div className="flex items-center justify-between">
                  <RelativeTime timestamp={activity.timestamp} />
                  {getStatusBadge(activity.status)}
                </div>
              </div>

              {activity.user && (
                <Avatar className="w-9 h-9 border-2 border-white shadow-sm group-hover:scale-105 transition-transform duration-200">
                  <AvatarImage src="" alt={activity.user} />
                  <AvatarFallback className="bg-neutral-100 text-neutral-700 text-xs font-semibold border border-neutral-200/60">
                    {activity.user
                      .split(' ')
                      .map((n: string) => n[0])
                      .join('')}
                  </AvatarFallback>
                </Avatar>
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-neutral-500">
            <Calendar className="w-12 h-12 mx-auto mb-3 text-neutral-400" />
            <p className="text-sm font-medium">Henüz aktivite bulunmuyor</p>
            <p className="text-xs text-neutral-400 mt-1">Yeni işlemler burada görünecek</p>
            <Button variant="outline" size="sm" className="mt-4">
              Aktiviteleri Yenile
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
