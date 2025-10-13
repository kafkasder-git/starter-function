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
// import { aidRequestsService } from '../../services/aidRequestsService';
// import { logger } from '../../lib/logging/logger';

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

        // TODO: Replace with actual service call
        // const response = await activitiesService.getRecentActivities();
        // setActivities(response.data);

        // Mock data for demonstration
        const mockActivities: Activity[] = [
          {
            id: '1',
            type: 'aid',
            title: 'Yeni Yardım Başvurusu',
            description: 'Ahmet Yılmaz tarafından maddi yardım talebi yapıldı.',
            timestamp: new Date().toISOString(),
            user: 'Ahmet Yılmaz',
            status: 'pending',
          },
          {
            id: '2',
            type: 'donation',
            title: 'Bağış Kaydı',
            description: 'ABC Şirketi tarafından 5.000₺ bağış yapıldı.',
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            user: 'Muhasebe Ekibi',
            amount: 5000,
            status: 'success',
          },
          {
            id: '3',
            type: 'member',
            title: 'Yeni Üye Kaydı',
            description: 'Elif Öztürk sisteme üye olarak eklendi.',
            timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
            user: 'İnsan Kaynakları',
            status: 'success',
          },
        ];

        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setActivities(mockActivities);
      } catch (err) {
        setError('Aktiviteler yüklenirken bir hata oluştu.');
        console.error('RecentActivity fetch error:', err);
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
