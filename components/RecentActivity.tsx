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

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        // Mock data for now since service is not available
        const mockActivities: Activity[] = [
          {
            id: '1',
            type: 'aid',
            title: 'Yeni Yardım Başvurusu',
            description: 'Ahmet Yılmaz tarafından maddi yardım talebi yapıldı.',
            timestamp: new Date().toISOString(),
            user: 'Ahmet Yılmaz',
            status: 'pending'
          }
        ];
        setActivities(mockActivities);
      } catch {
        // Error handling - could be logged to a service
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
      donation: 'text-error-600 bg-error-50',
      member: 'text-info-600 bg-info-50',
      aid: 'text-primary-600 bg-primary-50',
      event: 'text-success-600 bg-success-50',
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
    return <Text as="span" size="xs" color="muted">{relativeTime}</Text>;
  };

  return (
    <Card className="shadow-md border-0">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle>Son Aktiviteler</CardTitle>
        <Button variant="ghost" size="sm">
          <MoreHorizontal className="w-4 h-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-3 lg:space-y-4 max-h-96 overflow-y-auto scrollbar-thin px-6 py-6">
        {activities.length > 0 ? (
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
                  <Heading level={4} size="sm" weight="semibold" className="truncate tracking-tight">
                    {activity.title}
                  </Heading>
                  {activity.amount && (
                    <span className="text-sm font-bold text-success-700 bg-success-50/80 px-2 py-1 rounded-lg border border-success-200/60">
                      ₺{activity.amount.toLocaleString()}
                    </span>
                  )}
                </div>

                <Text size="xs" color="neutral" className="mb-2.5 line-clamp-2">{activity.description}</Text>

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
            <p className="text-sm">Henüz aktivite bulunmuyor</p>
            <p className="text-xs text-neutral-400 mt-1">Yeni işlemler burada görünecek</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
