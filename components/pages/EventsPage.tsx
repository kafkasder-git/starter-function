/**
 * @fileoverview EventsPage Module - Application module
 *
 * @author Dernek Yönetim Sistemi Team
 * @version 1.0.0
 */

import { Calendar, Clock, Filter, MapPin, Plus, Users } from 'lucide-react';
import { motion } from 'motion/react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { DesktopActionButtons, DesktopStatsCard } from '../ui/desktop-table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';

interface Event {
  id: number;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  attendees: number;
  maxAttendees?: number;
  type: 'meeting' | 'charity' | 'education' | 'social';
  status: 'upcoming' | 'ongoing' | 'completed';
}

/**
 * EventsPage function
 *
 * @param {Object} params - Function parameters
 * @returns {void} Nothing
 */
export function EventsPage() {
  // const [viewType, setViewType] = useState('list');
  const [filterType, setFilterType] = useState('all');
  const [showEventDialog, setShowEventDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    max_attendees: 0,
    type: 'meeting' as Event['type'],
  });

  const events: Event[] = [
    {
      id: 1,
      title: 'Aylık Yönetim Toplantısı',
      description: 'Kasım ayı yönetim kurulu toplantısı',
      date: '2024-11-15',
      time: '14:00',
      location: 'Dernek Merkezi',
      attendees: 12,
      maxAttendees: 15,
      type: 'meeting',
      status: 'upcoming',
    },
    {
      id: 2,
      title: 'Hayır Bazaarı',
      description: 'Yardım toplama amaçlı hayır bazaarı',
      date: '2024-11-20',
      time: '10:00',
      location: 'Merkez Park',
      attendees: 45,
      maxAttendees: 100,
      type: 'charity',
      status: 'upcoming',
    },
    {
      id: 3,
      title: 'Eğitim Semineri',
      description: 'Gençler için kişisel gelişim semineri',
      date: '2024-11-25',
      time: '19:00',
      location: 'Konferans Salonu',
      attendees: 28,
      maxAttendees: 50,
      type: 'education',
      status: 'upcoming',
    },
  ];

  const getEventTypeBadge = (type: Event['type']) => {
    const mapping = {
      meeting: { label: 'Toplantı', variant: 'info' as const },
      charity: { label: 'Hayır İşi', variant: 'success' as const },
      education: { label: 'Eğitim', variant: 'default' as const },
      social: { label: 'Sosyal', variant: 'warning' as const },
    };
    const config = mapping[type];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const handleNewEvent = () => {
    setShowEventDialog(true);
  };

  const handleSubmitEvent = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.date || !formData.time || !formData.location) {
      toast.error('Etkinlik adı, tarih, saat ve lokasyon alanları zorunludur');
      return;
    }

    try {
      setIsSubmitting(true);

      // TODO: Integrate with actual API
      // const result = await eventsService.createEvent(formData);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast.success('Etkinlik başarıyla oluşturuldu!');
      setShowEventDialog(false);

      // Reset form
      setFormData({
        title: '',
        description: '',
        date: '',
        time: '',
        location: '',
        max_attendees: 0,
        type: 'meeting',
      });
    } catch {
      toast.error('Etkinlik oluşturulurken hata oluştu');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleViewEvent = (eventId: number) => {
    toast.success(`Etkinlik detayları açılıyor: ${eventId}`);
  };

  return (
    <div className="min-h-full space-y-6 bg-slate-50/50 p-8">
      {/* Desktop Header */}
      <div className="flex flex-col space-y-4">
        <div className="space-y-2">
          <h1 className="flex items-center gap-3 text-3xl font-bold text-slate-800">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-slate-600 to-gray-700">
              <Calendar className="h-6 w-6 text-white" />
            </div>
            Etkinlik Takvimi
          </h1>
          <p className="text-slate-600">Dernek etkinliklerini planlayın ve takip edin</p>
        </div>

        {/* Desktop Actions and Filters */}
        <div className="flex items-center justify-between gap-4">
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-48">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tüm Etkinlikler</SelectItem>
              <SelectItem value="meeting">Toplantılar</SelectItem>
              <SelectItem value="charity">Hayır İşleri</SelectItem>
              <SelectItem value="education">Eğitimler</SelectItem>
            </SelectContent>
          </Select>

          <DesktopActionButtons
            primaryAction={{
              label: 'Yeni Etkinlik Ekle',
              icon: <Plus className="h-4 w-4" />,
              onClick: handleNewEvent,
            }}
          />
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <DesktopStatsCard
          title="Toplam Etkinlik"
          value={events.length}
          subtitle="Bu ay toplam"
          icon={<Calendar className="h-4 w-4" />}
          color="blue"
        />

        <DesktopStatsCard
          title="Yaklaşan"
          value={events.filter((e) => e.status === 'upcoming').length}
          subtitle="Bu hafta"
          icon={<Clock className="h-4 w-4" />}
          color="yellow"
        />

        <DesktopStatsCard
          title="Toplam Katılımcı"
          value={events.reduce((sum, e) => sum + e.attendees, 0)}
          subtitle="Tüm etkinlikler"
          icon={<Users className="h-4 w-4" />}
          color="green"
        />

        <DesktopStatsCard
          title="Doluluk Oranı"
          value={`%${
            Math.round(
              (events.reduce((sum, e) => sum + e.attendees, 0) /
                events.reduce((sum, e) => sum + (e.maxAttendees ?? 0), 1)) *
                100,
            ) || 0
          }`}
          subtitle="Ortalama"
          icon={<MapPin className="h-4 w-4" />}
          color="purple"
        />
      </div>

      {/* Desktop Event Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {events.map((event, index) => (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card
              className="cursor-pointer border-0 shadow-md transition-all duration-200 hover:shadow-lg"
              onClick={() => {
                handleViewEvent(event.id);
              }}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-3">
                  <CardTitle className="flex-1 pr-2 text-lg sm:text-xl">{event.title}</CardTitle>
                  <div className="flex-shrink-0">
                    {getEventTypeBadge(event.type)}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm leading-relaxed text-slate-600">{event.description}</p>

                {/* Mobile-Optimized Event Details */}
                <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
                  <div className="flex items-center gap-3 text-slate-600">
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-100">
                      <Calendar className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium">
                        {new Date(event.date).toLocaleDateString('tr-TR')}
                      </p>
                      <p className="text-xs text-slate-500">Tarih</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-slate-600">
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-green-100">
                      <Clock className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium">{event.time}</p>
                      <p className="text-xs text-slate-500">Saat</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-slate-600 sm:col-span-2">
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-purple-100">
                      <MapPin className="h-4 w-4 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-medium">{event.location}</p>
                      <p className="text-xs text-slate-500">Konum</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-slate-600 sm:col-span-2">
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-orange-100">
                      <Users className="h-4 w-4 text-orange-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">
                        {event.attendees} katılımcı
                        {event.maxAttendees && (
                          <span className="text-slate-500"> / {event.maxAttendees} maksimum</span>
                        )}
                      </p>
                      <p className="text-xs text-slate-500">Katılım</p>
                    </div>
                  </div>
                </div>

                {/* Mobile-Optimized Progress Bar */}
                {event.maxAttendees && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-slate-600">
                      <span>Doluluk Oranı</span>
                      <span>{Math.round((event.attendees / event.maxAttendees) * 100)}%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-200">
                      <div
                        className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-300"
                        style={{
                          width: `${Math.min((event.attendees / event.maxAttendees) * 100, 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* Mobile Action Button */}
                <Button
                  variant="outline"
                  className="mt-4 min-h-[44px] w-full border-blue-200 hover:border-blue-300 hover:bg-blue-50"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleViewEvent(event.id);
                  }}
                >
                  Detayları Görüntüle
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="py-12 text-center"
      >
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-600 to-gray-700 shadow-lg">
          <span className="text-2xl text-white">📅</span>
        </div>
        <h2 className="mb-2 text-xl font-semibold text-slate-800">Etkinlik Yönetimi</h2>
        <p className="mb-4 text-slate-600">
          Gelişmiş takvim özellikleri yakında kullanılabilir olacak.
        </p>
        <Badge variant="secondary">Geliştiriliyor</Badge>
      </motion.div>

      {/* Event Creation Dialog */}
      <Dialog open={showEventDialog} onOpenChange={setShowEventDialog}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Yeni Etkinlik Oluştur
            </DialogTitle>
            <DialogDescription>
              Etkinlik detaylarını doldurun. Zorunlu alanları (*) doldurmanız gereklidir.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmitEvent} className="space-y-4 py-4">
            {/* Event Title */}
            <div className="space-y-2">
              <Label htmlFor="title">
                Etkinlik Adı <span className="text-red-500">*</span>
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => {
                  setFormData({ ...formData, title: e.target.value });
                }}
                placeholder="Aylık yönetim toplantısı"
                required
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Açıklama</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => {
                  setFormData({ ...formData, description: e.target.value });
                }}
                placeholder="Etkinlik hakkında detaylı bilgi"
                rows={3}
              />
            </div>

            {/* Date and Time */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="date">
                  Tarih <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => {
                    setFormData({ ...formData, date: e.target.value });
                  }}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="time">
                  Saat <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="time"
                  type="time"
                  value={formData.time}
                  onChange={(e) => {
                    setFormData({ ...formData, time: e.target.value });
                  }}
                  required
                />
              </div>
            </div>

            {/* Location */}
            <div className="space-y-2">
              <Label htmlFor="location">
                Lokasyon <span className="text-red-500">*</span>
              </Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => {
                  setFormData({ ...formData, location: e.target.value });
                }}
                placeholder="Dernek merkezi, konferans salonu, vb."
                required
              />
            </div>

            {/* Type and Max Attendees */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="type">Etkinlik Türü</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value: Event['type']) => {
                    setFormData({ ...formData, type: value });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Tür seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="meeting">Toplantı</SelectItem>
                    <SelectItem value="charity">Hayır İşleri</SelectItem>
                    <SelectItem value="education">Eğitim</SelectItem>
                    <SelectItem value="social">Sosyal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="max_attendees">Maksimum Katılımcı</Label>
                <Input
                  id="max_attendees"
                  type="number"
                  value={formData.max_attendees || ''}
                  onChange={(e) => {
                    setFormData({ ...formData, max_attendees: parseInt(e.target.value) || 0 });
                  }}
                  placeholder="50"
                  min="0"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-2 border-t pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowEventDialog(false);
                }}
                disabled={isSubmitting}
              >
                İptal
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Oluşturuluyor...' : 'Etkinlik Oluştur'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
