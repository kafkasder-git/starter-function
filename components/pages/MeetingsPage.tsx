/**
 * @fileoverview MeetingsPage Module - Toplantılar sayfası
 *
 * @author Dernek Yönetim Sistemi Team
 * @version 1.0.0
 */

import { Calendar, Clock, MapPin, Users, Plus, Video } from 'lucide-react';
import { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';

interface Meeting {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  attendees: number;
  type: 'in_person' | 'online' | 'hybrid';
  status: 'scheduled' | 'ongoing' | 'completed' | 'cancelled';
}

export function MeetingsPage() {
  const [meetings] = useState<Meeting[]>([
    {
      id: '1',
      title: 'Yönetim Kurulu Toplantısı',
      description: 'Aylık yönetim kurulu değerlendirme toplantısı',
      date: '2024-01-15',
      time: '14:00',
      location: 'Dernek Merkezi',
      attendees: 8,
      type: 'in_person',
      status: 'scheduled',
    },
    {
      id: '2',
      title: 'Bağışçı Bilgilendirme',
      description: 'Yıllık bağışçı bilgilendirme toplantısı',
      date: '2024-01-20',
      time: '10:00',
      location: 'Online',
      attendees: 25,
      type: 'online',
      status: 'scheduled',
    },
    {
      id: '3',
      title: 'Gönüllü Koordinasyon',
      description: 'Gönüllü koordinasyon ve planlama toplantısı',
      date: '2024-01-10',
      time: '16:00',
      location: 'Dernek Merkezi',
      attendees: 12,
      type: 'in_person',
      status: 'completed',
    },
  ]);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'online':
        return <Video className="h-4 w-4 text-blue-600" />;
      case 'in_person':
        return <MapPin className="h-4 w-4 text-green-600" />;
      case 'hybrid':
        return <Users className="h-4 w-4 text-purple-600" />;
      default:
        return <Calendar className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'ongoing':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Toplantılar</h1>
          <p className="text-gray-600">Toplantıları planlayın ve yönetin</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Yeni Toplantı
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Calendar className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Toplam Toplantı</p>
                <p className="text-xl font-bold">{meetings.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Clock className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Planlanan</p>
                <p className="text-xl font-bold">{meetings.filter(m => m.status === 'scheduled').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Users className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Toplam Katılımcı</p>
                <p className="text-xl font-bold">{meetings.reduce((sum, m) => sum + m.attendees, 0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Video className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Online Toplantı</p>
                <p className="text-xl font-bold">{meetings.filter(m => m.type === 'online').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Meetings List */}
      <Card>
        <CardHeader>
          <CardTitle>Toplantı Listesi</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {meetings.map((meeting) => (
            <div key={meeting.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {getTypeIcon(meeting.type)}
                    <h3 className="font-semibold">{meeting.title}</h3>
                    <Badge className={getStatusColor(meeting.status)}>
                      {meeting.status === 'scheduled' ? 'Planlandı' : 
                       meeting.status === 'ongoing' ? 'Devam Ediyor' :
                       meeting.status === 'completed' ? 'Tamamlandı' : 'İptal'}
                    </Badge>
                  </div>
                  <p className="text-gray-600 mb-2">{meeting.description}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {meeting.date}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {meeting.time}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {meeting.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {meeting.attendees} katılımcı
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    Düzenle
                  </Button>
                  <Button size="sm">
                    Katıl
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

export default MeetingsPage;
