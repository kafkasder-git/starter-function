/**
 * @fileoverview MeetingsPage Module - Application module
 * 
 * @author Dernek Yönetim Sistemi Team
 * @version 1.0.0
 */

import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import {
  AlertCircle,
  Calendar,
  Calendar as CalendarIcon,
  CheckCircle,
  ClipboardList,
  Clock,
  Copy,
  Download,
  Edit,
  Eye,
  ListTodo,
  MapPin,
  MoreVertical,
  Phone,
  Plus,
  Search,
  Share2,
  Target,
  Trash2,
  User,
  UserCheck,
  Users,
  Video,
  XCircle,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Separator } from '../ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Textarea } from '../ui/textarea';

interface Meeting {
  id: number;
  title: string;
  description: string;
  date: string;
  time: string;
  duration: number; // dakika
  type: 'physical' | 'online' | 'hybrid';
  location?: string;
  meetingLink?: string;
  organizer: string;
  participants: Participant[];
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  agenda: string[];
  attachments: string[];
  tasks: Task[]; // Toplantıya bağlı görevler
  attendanceRecorded: boolean; // Yoklama alındı mı?
  createdAt: string;
  updatedAt: string;
}

interface Participant {
  id: number;
  name: string;
  email: string;
  role: string;
  status: 'invited' | 'accepted' | 'declined' | 'tentative';
  avatar?: string;
  attended?: boolean; // Toplantıya katıldı mı?
  tasks?: Task[]; // Atanan görevler
}

interface Task {
  id: number;
  meetingId: number;
  assignedToId: number;
  assignedToName: string;
  assignedBy: string;
  title: string;
  description: string;
  dueDate: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in-progress' | 'completed' | 'overdue';
  notes?: string;
  attachments?: string[];
  completedAt?: string;
  completedNotes?: string;
  createdAt: string;
  updatedAt: string;
}

// Mock data
const mockTasks: Task[] = [
  {
    id: 1,
    meetingId: 1,
    assignedToId: 2,
    assignedToName: 'Ayşe Kaya',
    assignedBy: 'Ahmet Yılmaz',
    title: 'Bütçe Raporunu Hazırla',
    description: 'Bir sonraki toplantı için detaylı bütçe raporu hazırlanacak',
    dueDate: '2024-01-22',
    priority: 'high',
    status: 'in-progress',
    createdAt: '2024-01-15',
    updatedAt: '2024-01-16',
  },
  {
    id: 2,
    meetingId: 1,
    assignedToId: 3,
    assignedToName: 'Fatma Özkan',
    assignedBy: 'Ahmet Yılmaz',
    title: 'Gönüllü Koordinasyonu',
    description: 'Yeni gönüllü adaylarla görüşme planlaması yapılacak',
    dueDate: '2024-01-20',
    priority: 'medium',
    status: 'pending',
    createdAt: '2024-01-15',
    updatedAt: '2024-01-15',
  },
];

const mockMeetings: Meeting[] = [
  {
    id: 1,
    title: 'Yönetim Kurulu Toplantısı',
    description: 'Aylık yönetim kurulu toplantısı - bütçe görüşmeleri ve stratejik kararlar',
    date: '2024-01-15',
    time: '14:00',
    duration: 120,
    type: 'physical',
    location: 'Yönetim Kurulu Salonu',
    organizer: 'Ahmet Yılmaz',
    participants: [
      {
        id: 1,
        name: 'Mehmet Demir',
        email: 'mehmet@dernek.org',
        role: 'Başkan',
        status: 'accepted',
        attended: true,
      },
      {
        id: 2,
        name: 'Ayşe Kaya',
        email: 'ayse@dernek.org',
        role: 'Başkan Yardımcısı',
        status: 'accepted',
        attended: true,
      },
      {
        id: 3,
        name: 'Fatma Özkan',
        email: 'fatma@dernek.org',
        role: 'Sayman',
        status: 'accepted',
        attended: false,
      },
    ],
    status: 'completed',
    agenda: ['Geçen ay değerlendirmesi', 'Bütçe görüşmeleri', 'Yeni projeler', 'Diğer konular'],
    attachments: ['yonetim-kurulu-rapor.pdf', 'butce-raporu.xlsx'],
    tasks: mockTasks.filter((task) => task.meetingId === 1),
    attendanceRecorded: true,
    createdAt: '2024-01-10',
    updatedAt: '2024-01-15',
  },
  {
    id: 2,
    title: 'Proje Koordinasyon Toplantısı',
    description: 'Eğitim projesi ilerleyişi ve koordinasyon toplantısı',
    date: '2024-01-18',
    time: '10:00',
    duration: 90,
    type: 'online',
    meetingLink: 'https://meet.google.com/abc-def-ghi',
    organizer: 'Zeynep Aktaş',
    participants: [
      {
        id: 4,
        name: 'Ali Şahin',
        email: 'ali@dernek.org',
        role: 'Proje Koordinatörü',
        status: 'accepted',
        attended: true,
      },
      {
        id: 5,
        name: 'Elif Güneş',
        email: 'elif@dernek.org',
        role: 'Eğitim Uzmanı',
        status: 'accepted',
        attended: true,
      },
      {
        id: 6,
        name: 'Hasan Çelik',
        email: 'hasan@dernek.org',
        role: 'Gönüllü Koordinatörü',
        status: 'declined',
        attended: false,
      },
    ],
    status: 'completed',
    agenda: ['Proje durumu', 'Eğitim programları', 'Gönüllü katılımı', 'Sonraki adımlar'],
    attachments: ['proje-raporu.pdf'],
    tasks: [],
    attendanceRecorded: true,
    createdAt: '2024-01-15',
    updatedAt: '2024-01-18',
  },
  {
    id: 3,
    title: 'Gönüllü Orientasyon Toplantısı',
    description: 'Yeni gönüllüler için tanışma ve bilgilendirme toplantısı',
    date: '2024-01-20',
    time: '15:30',
    duration: 60,
    type: 'hybrid',
    location: 'Konferans Salonu',
    meetingLink: 'https://zoom.us/j/123456789',
    organizer: 'Emre Koç',
    participants: [
      {
        id: 7,
        name: 'Seda Arslan',
        email: 'seda@gmail.com',
        role: 'Yeni Gönüllü',
        status: 'accepted',
      },
      {
        id: 8,
        name: 'Can Yıldız',
        email: 'can@gmail.com',
        role: 'Yeni Gönüllü',
        status: 'accepted',
      },
    ],
    status: 'scheduled',
    agenda: ['Dernek tanıtımı', 'Gönüllü faaliyetleri', 'Süreçler ve prosedürler'],
    attachments: ['gonullu-kilavuzu.pdf'],
    tasks: [],
    attendanceRecorded: false,
    createdAt: '2024-01-18',
    updatedAt: '2024-01-19',
  },
];

const mockParticipants = [
  { id: 1, name: 'Mehmet Demir', email: 'mehmet@dernek.org', role: 'Başkan' },
  { id: 2, name: 'Ayşe Kaya', email: 'ayse@dernek.org', role: 'Başkan Yardımcısı' },
  { id: 3, name: 'Fatma Özkan', email: 'fatma@dernek.org', role: 'Sayman' },
  { id: 4, name: 'Ali Şahin', email: 'ali@dernek.org', role: 'Proje Koordinatörü' },
  { id: 5, name: 'Elif Güneş', email: 'elif@dernek.org', role: 'Eğitim Uzmanı' },
];

export const MeetingsPage = () => {
  const [meetings, setMeetings] = useState<Meeting[]>(mockMeetings);
  const [filteredMeetings, setFilteredMeetings] = useState<Meeting[]>(mockMeetings);
  const [tasks, setTasks] = useState<Task[]>(mockTasks);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const [isNewMeetingOpen, setIsNewMeetingOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isTaskAssignOpen, setIsTaskAssignOpen] = useState(false);
  const [isAttendanceOpen, setIsAttendanceOpen] = useState(false);
  const [selectedParticipant, setSelectedParticipant] = useState<Participant | null>(null);
  const [activeTab, setActiveTab] = useState('upcoming');

  // Form states
  const [newMeeting, setNewMeeting] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    duration: 60,
    type: 'physical' as Meeting['type'],
    location: '',
    meetingLink: '',
    agenda: [''],
    participants: [] as number[],
  });

  // Task assignment form
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    dueDate: '',
    priority: 'medium' as Task['priority'],
  });

  useEffect(() => {
    let filtered = meetings;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (meeting) =>
          meeting.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          meeting.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          meeting.organizer.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    // Status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter((meeting) => meeting.status === filterStatus);
    }

    // Type filter
    if (filterType !== 'all') {
      filtered = filtered.filter((meeting) => meeting.type === filterType);
    }

    // Tab filter
    const now = new Date();
    const today = format(now, 'yyyy-MM-dd');

    if (activeTab === 'upcoming') {
      filtered = filtered.filter(
        (meeting) => meeting.status === 'scheduled' && meeting.date >= today,
      );
    } else if (activeTab === 'past') {
      filtered = filtered.filter(
        (meeting) => meeting.status === 'completed' || meeting.date < today,
      );
    } else if (activeTab === 'today') {
      filtered = filtered.filter((meeting) => meeting.date === today);
    }

    setFilteredMeetings(filtered);
  }, [meetings, searchTerm, filterStatus, filterType, activeTab]);

  const getStatusBadge = (status: Meeting['status']) => {
    const variants = {
      scheduled: { variant: 'default' as const, icon: Clock, color: 'text-blue-600' },
      'in-progress': { variant: 'default' as const, icon: AlertCircle, color: 'text-orange-600' },
      completed: { variant: 'secondary' as const, icon: CheckCircle, color: 'text-green-600' },
      cancelled: { variant: 'destructive' as const, icon: XCircle, color: 'text-red-600' },
    };

    const config = variants[status];
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className="w-3 h-3" />
        {status === 'scheduled' && 'Planlandı'}
        {status === 'in-progress' && 'Devam Ediyor'}
        {status === 'completed' && 'Tamamlandı'}
        {status === 'cancelled' && 'İptal Edildi'}
      </Badge>
    );
  };

  const getTypeBadge = (type: Meeting['type']) => {
    const variants = {
      physical: { icon: MapPin, label: 'Fiziksel', color: 'bg-blue-50 text-blue-700' },
      online: { icon: Video, label: 'Online', color: 'bg-green-50 text-green-700' },
      hybrid: { icon: Phone, label: 'Hibrit', color: 'bg-purple-50 text-purple-700' },
    };

    const config = variants[type];
    const Icon = config.icon;

    return (
      <Badge variant="outline" className={`gap-1 ${config.color}`}>
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    );
  };

  const handleCreateMeeting = () => {
    if (!newMeeting.title || !newMeeting.date || !newMeeting.time) {
      toast.error('Lütfen gerekli alanları doldurun');
      return;
    }

    const meeting: Meeting = {
      id: meetings.length + 1,
      title: newMeeting.title,
      description: newMeeting.description,
      date: newMeeting.date,
      time: newMeeting.time,
      duration: newMeeting.duration,
      type: newMeeting.type,
      location: newMeeting.location,
      meetingLink: newMeeting.meetingLink,
      organizer: 'Murat Yılmaz', // Current user
      participants: mockParticipants
        .filter((p) => newMeeting.participants.includes(p.id))
        .map((p) => ({
          ...p,
          status: 'invited' as const,
        })),
      status: 'scheduled',
      agenda: newMeeting.agenda.filter((item) => item.trim() !== ''),
      attachments: [],
      tasks: [],
      attendanceRecorded: false,
      createdAt: format(new Date(), 'yyyy-MM-dd'),
      updatedAt: format(new Date(), 'yyyy-MM-dd'),
    };

    setMeetings([meeting, ...meetings]);
    setIsNewMeetingOpen(false);
    setNewMeeting({
      title: '',
      description: '',
      date: '',
      time: '',
      duration: 60,
      type: 'physical',
      location: '',
      meetingLink: '',
      agenda: [''],
      participants: [],
    });
    toast.success('Toplantı başarıyla oluşturuldu');
  };

  const handleDeleteMeeting = (meetingId: number) => {
    setMeetings(meetings.filter((m) => m.id !== meetingId));
    toast.success('Toplantı silindi');
  };

  const handleCopyMeetingLink = (meeting: Meeting) => {
    if (meeting.meetingLink) {
      navigator.clipboard.writeText(meeting.meetingLink);
      toast.success('Toplantı linki kopyalandı');
    }
  };

  const addAgendaItem = () => {
    setNewMeeting((prev) => ({
      ...prev,
      agenda: [...prev.agenda, ''],
    }));
  };

  const updateAgendaItem = (index: number, value: string) => {
    setNewMeeting((prev) => ({
      ...prev,
      agenda: prev.agenda.map((item, i) => (i === index ? value : item)),
    }));
  };

  const removeAgendaItem = (index: number) => {
    setNewMeeting((prev) => ({
      ...prev,
      agenda: prev.agenda.filter((_, i) => i !== index),
    }));
  };

  // Task Management Functions
  const handleAssignTask = () => {
    if (!selectedMeeting || !selectedParticipant || !newTask.title || !newTask.dueDate) {
      toast.error('Lütfen gerekli alanları doldurun');
      return;
    }

    const task: Task = {
      id: tasks.length + 1,
      meetingId: selectedMeeting.id,
      assignedToId: selectedParticipant.id,
      assignedToName: selectedParticipant.name,
      assignedBy: 'Murat Yılmaz', // Current user
      title: newTask.title,
      description: newTask.description,
      dueDate: newTask.dueDate,
      priority: newTask.priority,
      status: 'pending',
      createdAt: format(new Date(), 'yyyy-MM-dd'),
      updatedAt: format(new Date(), 'yyyy-MM-dd'),
    };

    setTasks([...tasks, task]);

    // Update meeting with new task
    setMeetings((prev) =>
      prev.map((meeting) =>
        meeting.id === selectedMeeting.id
          ? { ...meeting, tasks: [...meeting.tasks, task] }
          : meeting,
      ),
    );

    setIsTaskAssignOpen(false);
    setSelectedParticipant(null);
    setNewTask({
      title: '',
      description: '',
      dueDate: '',
      priority: 'medium',
    });

    toast.success(`Görev ${selectedParticipant.name} kişisine atandı`);
  };

  const handleAttendanceRecord = (meetingId: number, participantId: number, attended: boolean) => {
    setMeetings((prev) =>
      prev.map((meeting) =>
        meeting.id === meetingId
          ? {
              ...meeting,
              participants: meeting.participants.map((p) =>
                p.id === participantId ? { ...p, attended } : p,
              ),
            }
          : meeting,
      ),
    );
  };

  const handleMarkAttendanceRecorded = (meetingId: number) => {
    setMeetings((prev) =>
      prev.map((meeting) =>
        meeting.id === meetingId ? { ...meeting, attendanceRecorded: true } : meeting,
      ),
    );
    setIsAttendanceOpen(false);
    toast.success('Yoklama kaydedildi');
  };

  const getTaskStats = (meeting: Meeting) => {
    const totalTasks = meeting.tasks.length;
    const completedTasks = meeting.tasks.filter((task) => task.status === 'completed').length;
    const percentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    return { totalTasks, completedTasks, percentage };
  };

  const getAttendanceStats = (meeting: Meeting) => {
    const totalParticipants = meeting.participants.length;
    const attendedCount = meeting.participants.filter((p) => p.attended === true).length;
    const percentage =
      totalParticipants > 0 ? Math.round((attendedCount / totalParticipants) * 100) : 0;

    return { totalParticipants, attendedCount, percentage };
  };

  return (
    <div className="flex-1 space-y-3 p-3 sm:space-y-6 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl">Toplantılar</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Dernek toplantılarını yönetin ve takip edin
          </p>
        </div>

        <Dialog open={isNewMeetingOpen} onOpenChange={setIsNewMeetingOpen}>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto gap-2">
              <Plus className="w-4 h-4" />
              Yeni Toplantı
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Yeni Toplantı Oluştur</DialogTitle>
              <DialogDescription>
                Yeni bir toplantı planlayın ve katılımcıları davet edin
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Toplantı Başlığı *</Label>
                  <Input
                    id="title"
                    placeholder="Toplantı başlığını girin"
                    value={newMeeting.title}
                    onChange={(e) => {
                      setNewMeeting((prev) => ({ ...prev, title: e.target.value }));
                    }}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type">Toplantı Türü</Label>
                  <Select
                    value={newMeeting.type}
                    onValueChange={(value: Meeting['type']) => {
                      setNewMeeting((prev) => ({ ...prev, type: value }));
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="physical">Fiziksel</SelectItem>
                      <SelectItem value="online">Online</SelectItem>
                      <SelectItem value="hybrid">Hibrit</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Açıklama</Label>
                <Textarea
                  id="description"
                  placeholder="Toplantı açıklamasını girin"
                  value={newMeeting.description}
                  onChange={(e) => {
                    setNewMeeting((prev) => ({ ...prev, description: e.target.value }));
                  }}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Tarih *</Label>
                  <Input
                    id="date"
                    type="date"
                    value={newMeeting.date}
                    onChange={(e) => {
                      setNewMeeting((prev) => ({ ...prev, date: e.target.value }));
                    }}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="time">Saat *</Label>
                  <Input
                    id="time"
                    type="time"
                    value={newMeeting.time}
                    onChange={(e) => {
                      setNewMeeting((prev) => ({ ...prev, time: e.target.value }));
                    }}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="duration">Süre (dk)</Label>
                  <Input
                    id="duration"
                    type="number"
                    min="15"
                    step="15"
                    value={newMeeting.duration}
                    onChange={(e) => {
                      setNewMeeting((prev) => ({
                        ...prev,
                        duration: parseInt(e.target.value) || 60,
                      }));
                    }}
                  />
                </div>
              </div>

              {newMeeting.type !== 'online' && (
                <div className="space-y-2">
                  <Label htmlFor="location">Konum</Label>
                  <Input
                    id="location"
                    placeholder="Toplantı konumu"
                    value={newMeeting.location}
                    onChange={(e) => {
                      setNewMeeting((prev) => ({ ...prev, location: e.target.value }));
                    }}
                  />
                </div>
              )}

              {newMeeting.type !== 'physical' && (
                <div className="space-y-2">
                  <Label htmlFor="meetingLink">Toplantı Linki</Label>
                  <Input
                    id="meetingLink"
                    placeholder="https://..."
                    value={newMeeting.meetingLink}
                    onChange={(e) => {
                      setNewMeeting((prev) => ({ ...prev, meetingLink: e.target.value }));
                    }}
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label>Gündem</Label>
                {newMeeting.agenda.map((item, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      placeholder={`Gündem maddesi ${index + 1}`}
                      value={item}
                      onChange={(e) => {
                        updateAgendaItem(index, e.target.value);
                      }}
                    />
                    {newMeeting.agenda.length > 1 && (
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => {
                          removeAgendaItem(index);
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addAgendaItem}
                  className="w-full sm:w-auto"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Gündem Maddesi Ekle
                </Button>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button onClick={handleCreateMeeting} className="flex-1">
                  Toplantı Oluştur
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsNewMeetingOpen(false);
                  }}
                  className="flex-1 sm:flex-none"
                >
                  İptal
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Toplantı ara..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
            }}
            className="pl-10"
          />
        </div>

        <div className="flex gap-2">
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[130px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tüm Durumlar</SelectItem>
              <SelectItem value="scheduled">Planlandı</SelectItem>
              <SelectItem value="in-progress">Devam Ediyor</SelectItem>
              <SelectItem value="completed">Tamamlandı</SelectItem>
              <SelectItem value="cancelled">İptal Edildi</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tüm Türler</SelectItem>
              <SelectItem value="physical">Fiziksel</SelectItem>
              <SelectItem value="online">Online</SelectItem>
              <SelectItem value="hybrid">Hibrit</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">Tümü</TabsTrigger>
          <TabsTrigger value="today">Bugün</TabsTrigger>
          <TabsTrigger value="upcoming">Yaklaşan</TabsTrigger>
          <TabsTrigger value="past">Geçmiş</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4 mt-4">
          {filteredMeetings.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <CalendarIcon className="w-12 h-12 text-muted-foreground mb-4" />
                <h3 className="text-lg mb-2">Toplantı bulunamadı</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Arama kriterlerinize uygun toplantı bulunmuyor.
                </p>
                <Button
                  onClick={() => {
                    setSearchTerm('');
                    setFilterStatus('all');
                    setFilterType('all');
                  }}
                >
                  Filtreleri Temizle
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {filteredMeetings.map((meeting) => (
                <Card
                  key={meeting.id}
                  className="professional-card hover:shadow-lg transition-all duration-200"
                >
                  <CardHeader className="pb-3">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start gap-3">
                          <div className="flex-1 min-w-0">
                            <CardTitle className="text-lg leading-tight">{meeting.title}</CardTitle>
                            <CardDescription className="mt-1 line-clamp-2">
                              {meeting.description}
                            </CardDescription>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 mt-3">
                          {getStatusBadge(meeting.status)}
                          {getTypeBadge(meeting.type)}
                        </div>
                      </div>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedMeeting(meeting);
                              setIsDetailOpen(true);
                            }}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            Detayları Görüntüle
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="w-4 h-4 mr-2" />
                            Düzenle
                          </DropdownMenuItem>
                          {meeting.type === 'physical' && meeting.status === 'completed' && (
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedMeeting(meeting);
                                setIsAttendanceOpen(true);
                              }}
                            >
                              <UserCheck className="w-4 h-4 mr-2" />
                              Yoklama {meeting.attendanceRecorded ? 'Görüntüle' : 'Al'}
                            </DropdownMenuItem>
                          )}
                          {meeting.status === 'completed' && (
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedMeeting(meeting);
                                setIsTaskAssignOpen(true);
                              }}
                            >
                              <ListTodo className="w-4 h-4 mr-2" />
                              Görev Ata
                            </DropdownMenuItem>
                          )}
                          {meeting.meetingLink && (
                            <DropdownMenuItem
                              onClick={() => {
                                handleCopyMeetingLink(meeting);
                              }}
                            >
                              <Copy className="w-4 h-4 mr-2" />
                              Linki Kopyala
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem>
                            <Share2 className="w-4 h-4 mr-2" />
                            Paylaş
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => {
                              handleDeleteMeeting(meeting.id);
                            }}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Sil
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>

                  <CardContent className="pt-0">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span>{format(new Date(meeting.date), 'dd MMM yyyy', { locale: tr })}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span>
                          {meeting.time} ({meeting.duration} dk)
                        </span>
                      </div>

                      {meeting.location && (
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-muted-foreground" />
                          <span className="truncate">{meeting.location}</span>
                        </div>
                      )}

                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-muted-foreground" />
                        <span>{meeting.participants.length} katılımcı</span>
                      </div>
                    </div>

                    {meeting.participants.length > 0 && (
                      <div className="flex items-center gap-2 mt-4">
                        <span className="text-sm text-muted-foreground">Katılımcılar:</span>
                        <div className="flex -space-x-2">
                          {meeting.participants.slice(0, 3).map((participant) => (
                            <Avatar
                              key={participant.id}
                              className="w-6 h-6 border-2 border-background"
                            >
                              <AvatarImage src={participant.avatar} />
                              <AvatarFallback className="text-xs">
                                {participant.name
                                  .split(' ')
                                  .map((n) => n[0])
                                  .join('')}
                              </AvatarFallback>
                            </Avatar>
                          ))}
                          {meeting.participants.length > 3 && (
                            <div className="w-6 h-6 rounded-full bg-muted border-2 border-background flex items-center justify-center text-xs">
                              +{meeting.participants.length - 3}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Stats for completed meetings */}
                    {meeting.status === 'completed' && (
                      <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-border">
                        {meeting.type === 'physical' && meeting.attendanceRecorded && (
                          <div className="flex items-center gap-2 text-sm">
                            <UserCheck className="w-4 h-4 text-green-600" />
                            <span className="text-muted-foreground">Katılım:</span>
                            <Badge variant="secondary" className="bg-green-50 text-green-700">
                              {getAttendanceStats(meeting).attendedCount}/
                              {getAttendanceStats(meeting).totalParticipants}(
                              {getAttendanceStats(meeting).percentage}%)
                            </Badge>
                          </div>
                        )}

                        {meeting.tasks.length > 0 && (
                          <div className="flex items-center gap-2 text-sm">
                            <ListTodo className="w-4 h-4 text-blue-600" />
                            <span className="text-muted-foreground">Görevler:</span>
                            <Badge variant="secondary" className="bg-blue-50 text-blue-700">
                              {getTaskStats(meeting).completedTasks}/
                              {getTaskStats(meeting).totalTasks}({getTaskStats(meeting).percentage}
                              %)
                            </Badge>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Meeting Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedMeeting && (
            <>
              <DialogHeader>
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                  <div>
                    <DialogTitle className="text-xl">{selectedMeeting.title}</DialogTitle>
                    <DialogDescription className="mt-1">
                      {selectedMeeting.description}
                    </DialogDescription>
                  </div>
                  <div className="flex gap-2">
                    {getStatusBadge(selectedMeeting.status)}
                    {getTypeBadge(selectedMeeting.type)}
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-6">
                {/* Meeting Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span>
                        {format(new Date(selectedMeeting.date), 'dd MMMM yyyy EEEE', {
                          locale: tr,
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span>
                        {selectedMeeting.time} - {selectedMeeting.duration} dakika
                      </span>
                    </div>
                    {selectedMeeting.location && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <span>{selectedMeeting.location}</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <span>Organizatör: {selectedMeeting.organizer}</span>
                    </div>
                    {selectedMeeting.meetingLink && (
                      <div className="flex items-center gap-2">
                        <Video className="w-4 h-4 text-muted-foreground" />
                        <a
                          href={selectedMeeting.meetingLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline truncate"
                        >
                          Toplantıya Katıl
                        </a>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => {
                            handleCopyMeetingLink(selectedMeeting);
                          }}
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                <Separator />

                {/* Participants */}
                <div>
                  <h3 className="text-lg mb-3">
                    Katılımcılar ({selectedMeeting.participants.length})
                  </h3>
                  <div className="grid gap-3">
                    {selectedMeeting.participants.map((participant) => (
                      <div
                        key={participant.id}
                        className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={participant.avatar} />
                            <AvatarFallback>
                              {participant.name
                                .split(' ')
                                .map((n) => n[0])
                                .join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="text-sm">{participant.name}</div>
                            <div className="text-xs text-muted-foreground">{participant.role}</div>
                          </div>
                        </div>
                        <Badge
                          variant={
                            participant.status === 'accepted'
                              ? 'default'
                              : participant.status === 'declined'
                                ? 'destructive'
                                : 'secondary'
                          }
                        >
                          {participant.status === 'accepted' && 'Kabul Etti'}
                          {participant.status === 'declined' && 'Reddetti'}
                          {participant.status === 'tentative' && 'Belirsiz'}
                          {participant.status === 'invited' && 'Davet Edildi'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Agenda */}
                {selectedMeeting.agenda.length > 0 && (
                  <>
                    <Separator />
                    <div>
                      <h3 className="text-lg mb-3">Gündem</h3>
                      <div className="space-y-2">
                        {selectedMeeting.agenda.map((item, index) => (
                          <div
                            key={index}
                            className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg"
                          >
                            <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs shrink-0 mt-0.5">
                              {index + 1}
                            </div>
                            <span className="text-sm">{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {/* Attachments */}
                {selectedMeeting.attachments.length > 0 && (
                  <>
                    <Separator />
                    <div>
                      <h3 className="text-lg mb-3">Ekler</h3>
                      <div className="space-y-2">
                        {selectedMeeting.attachments.map((attachment, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                          >
                            <span className="text-sm">{attachment}</span>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Download className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Task Assignment Dialog */}
      <Dialog open={isTaskAssignOpen} onOpenChange={setIsTaskAssignOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Görev Ata</DialogTitle>
            <DialogDescription>
              {selectedMeeting?.title} toplantısı için görev atayın
            </DialogDescription>
          </DialogHeader>

          {selectedMeeting && (
            <div className="space-y-4">
              {/* Participant Selection */}
              <div className="space-y-2">
                <Label>Katılımcı Seç</Label>
                <div className="grid gap-2">
                  {selectedMeeting.participants
                    .filter((p) => p.attended === true)
                    .map((participant) => (
                      <div
                        key={participant.id}
                        className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                          selectedParticipant?.id === participant.id
                            ? 'border-primary bg-primary/10'
                            : 'border-border hover:bg-muted/50'
                        }`}
                        onClick={() => {
                          setSelectedParticipant(participant);
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={participant.avatar} />
                            <AvatarFallback className="text-xs">
                              {participant.name
                                .split(' ')
                                .map((n) => n[0])
                                .join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="text-sm">{participant.name}</div>
                            <div className="text-xs text-muted-foreground">{participant.role}</div>
                          </div>
                          {selectedParticipant?.id === participant.id && (
                            <CheckCircle className="w-4 h-4 text-primary ml-auto" />
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {selectedParticipant && (
                <>
                  <Separator />

                  {/* Task Form */}
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="task-title">Görev Başlığı *</Label>
                      <Input
                        id="task-title"
                        placeholder="Görev başlığını girin"
                        value={newTask.title}
                        onChange={(e) => {
                          setNewTask((prev) => ({ ...prev, title: e.target.value }));
                        }}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="task-description">Açıklama</Label>
                      <Textarea
                        id="task-description"
                        placeholder="Görev detaylarını açıklayın"
                        value={newTask.description}
                        onChange={(e) => {
                          setNewTask((prev) => ({ ...prev, description: e.target.value }));
                        }}
                        rows={3}
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="task-due-date">Son Tarih *</Label>
                        <Input
                          id="task-due-date"
                          type="date"
                          value={newTask.dueDate}
                          onChange={(e) => {
                            setNewTask((prev) => ({ ...prev, dueDate: e.target.value }));
                          }}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="task-priority">Öncelik</Label>
                        <Select
                          value={newTask.priority}
                          onValueChange={(value: Task['priority']) => {
                            setNewTask((prev) => ({ ...prev, priority: value }));
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">Düşük</SelectItem>
                            <SelectItem value="medium">Orta</SelectItem>
                            <SelectItem value="high">Yüksek</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 pt-4">
                    <Button onClick={handleAssignTask} className="flex-1">
                      <Target className="w-4 h-4 mr-2" />
                      Görevi Ata
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsTaskAssignOpen(false);
                      }}
                      className="flex-1 sm:flex-none"
                    >
                      İptal
                    </Button>
                  </div>
                </>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Attendance Dialog */}
      <Dialog open={isAttendanceOpen} onOpenChange={setIsAttendanceOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Yoklama Yönetimi</DialogTitle>
            <DialogDescription>
              {selectedMeeting?.title} toplantısı katılım durumunu yönetin
            </DialogDescription>
          </DialogHeader>

          {selectedMeeting && (
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground">
                Toplantı: {format(new Date(selectedMeeting.date), 'dd MMMM yyyy', { locale: tr })} -{' '}
                {selectedMeeting.time}
              </div>

              <div className="space-y-3">
                {selectedMeeting.participants.map((participant) => (
                  <div
                    key={participant.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={participant.avatar} />
                        <AvatarFallback className="text-xs">
                          {participant.name
                            .split(' ')
                            .map((n) => n[0])
                            .join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="text-sm">{participant.name}</div>
                        <div className="text-xs text-muted-foreground">{participant.role}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant={participant.attended === true ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => {
                          handleAttendanceRecord(selectedMeeting.id, participant.id, true);
                        }}
                        disabled={selectedMeeting.attendanceRecorded}
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Katıldı
                      </Button>
                      <Button
                        variant={participant.attended === false ? 'destructive' : 'outline'}
                        size="sm"
                        onClick={() => {
                          handleAttendanceRecord(selectedMeeting.id, participant.id, false);
                        }}
                        disabled={selectedMeeting.attendanceRecorded}
                      >
                        <XCircle className="w-4 h-4 mr-1" />
                        Katılmadı
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {selectedMeeting.attendanceRecorded ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-green-700">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-sm">Yoklama kaydedilmiş</span>
                  </div>
                  <div className="text-xs text-green-600 mt-1">
                    Katılım: {getAttendanceStats(selectedMeeting).attendedCount}/
                    {getAttendanceStats(selectedMeeting).totalParticipants}(
                    {getAttendanceStats(selectedMeeting).percentage}%)
                  </div>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <Button
                    onClick={() => {
                      handleMarkAttendanceRecorded(selectedMeeting.id);
                    }}
                    className="flex-1"
                  >
                    <ClipboardList className="w-4 h-4 mr-2" />
                    Yoklamayı Kaydet
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsAttendanceOpen(false);
                    }}
                    className="flex-1 sm:flex-none"
                  >
                    İptal
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
