/**
 * @fileoverview RecentActivity Module - Application module
 * 
 * @author Dernek Yönetim Sistemi Team
 * @version 1.0.0
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import { Heart, Users, HelpingHand, Calendar, MoreHorizontal } from 'lucide-react';
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
            timestamp: new Date().toLocaleString('tr-TR'),
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
      donation: 'text-red-600 bg-red-50',
      member: 'text-blue-600 bg-blue-50',
      aid: 'text-purple-600 bg-purple-50',
      event: 'text-green-600 bg-green-50',
    };
    return type in colors ? colors[type] : colors.donation;
  };

  const getStatusBadge = (status?: Activity['status']) => {
    if (!status) return null;

    const variants = {
      success: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      failed: 'bg-red-100 text-red-800',
      completed: 'bg-green-100 text-green-800',
    };

    const labels = {
      success: 'Tamamlandı',
      pending: 'Beklemede',
      failed: 'Başarısız',
      completed: 'Tamamlandı',
    };

    return (
      <Badge className={status in variants ? variants[status as keyof typeof variants] : variants.completed} variant="secondary">
        {status in labels ? labels[status as keyof typeof labels] : labels.completed}
      </Badge>
    );
  };

  return (
    <Card className="shadow-md border-0">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-lg">Son Aktiviteler</CardTitle>
        <Button variant="ghost" size="sm">
          <MoreHorizontal className="w-4 h-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-3 lg:space-y-4 max-h-96 overflow-y-auto scrollbar-thin px-6 py-6">
        {activities.length > 0 ? (
          activities.map((activity) => (
            <div
              key={activity.id}
              className="flex items-start gap-4 p-4 hover:bg-slate-50/80 rounded-xl transition-all duration-200 border border-transparent hover:border-slate-200/60 cursor-pointer group"
            >
              <div
                className={`p-2.5 rounded-xl shadow-sm ${getActivityColor(activity.type)} group-hover:scale-105 transition-transform duration-200 border border-white/20`}
              >
                {getActivityIcon(activity.type)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1.5">
                  <h4 className="font-semibold text-sm text-slate-900 truncate tracking-tight">
                    {activity.title}
                  </h4>
                  {activity.amount && (
                    <span className="text-sm font-bold text-emerald-700 bg-emerald-50/80 px-2 py-1 rounded-lg border border-emerald-200/60">
                      ₺{activity.amount.toLocaleString()}
                    </span>
                  )}
                </div>

                <p className="text-sm text-slate-600 mb-2.5 font-medium">{activity.description}</p>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500 font-medium">{activity.timestamp}</span>
                  {getStatusBadge(activity.status)}
                </div>
              </div>

              {activity.user && (
                <Avatar className="w-9 h-9 border-2 border-white shadow-sm group-hover:scale-105 transition-transform duration-200">
                  <AvatarImage src="" alt={activity.user} />
                  <AvatarFallback className="bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200/60">
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
          <div className="text-center py-8 text-gray-500">
            <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-400" />
            <p className="text-sm">Henüz aktivite bulunmuyor</p>
            <p className="text-xs text-gray-400 mt-1">Yeni işlemler burada görünecek</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
