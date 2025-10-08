/**
 * @fileoverview BursApplicationsPage Module - Application module
 *
 * @author Dernek Yönetim Sistemi Team
 * @version 1.0.0
 */

import { AlertCircle, Check, Clock, Download, Eye, FileText, Plus, X } from 'lucide-react';
import { motion } from 'motion/react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { useIsMobile } from '../../hooks/useTouchDevice';
import { MobileInfoCard, ResponsiveCardGrid } from '../ResponsiveCard';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

interface Application {
  id: number;
  applicantName: string;
  email: string;
  phone: string;
  school: string;
  program: string;
  grade: string;
  requestedAmount: number;
  familyIncome: number;
  gpa: number;
  status: 'pending' | 'approved' | 'rejected' | 'interview';
  applicationDate: string;
  documents: {
    transcript: boolean;
    incomeProof: boolean;
    recommendation: boolean;
    essay: boolean;
  };
  priority: 'high' | 'medium' | 'low';
}

interface ApplicationStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  interview: number;
}

/**
 * BursApplicationsPage function
 *
 * @param {Object} params - Function parameters
 * @returns {void} Nothing
 */
export function BursApplicationsPage() {
  const isMobile = useIsMobile();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [showApplicationDialog, setShowApplicationDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    applicantName: '',
    email: '',
    phone: '',
    school: '',
    program: '',
    grade: '',
    requestedAmount: 0,
    familyIncome: 0,
    gpa: 0,
  });

  const applications: Application[] = useMemo(() => [], []);

  // Calculate statistics
  const stats: ApplicationStats = useMemo(() => {
    const total = applications.length;
    const pending = applications.filter((app) => app.status === 'pending').length;
    const approved = applications.filter((app) => app.status === 'approved').length;
    const rejected = applications.filter((app) => app.status === 'rejected').length;
    const interview = applications.filter((app) => app.status === 'interview').length;

    return { total, pending, approved, rejected, interview };
  }, [applications]);

  // Filter applications
  const filteredApplications = useMemo(() => {
    return applications.filter((app) => {
      const matchesSearch =
        app.applicantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.school.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.program.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
      const matchesPriority = priorityFilter === 'all' || app.priority === priorityFilter;

      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [applications, searchQuery, statusFilter, priorityFilter]);

  const handleSubmitApplication = async () => {
    setIsSubmitting(true);
    try {
      // TODO: Implement application submission
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success('Başvuru başarıyla gönderildi');
      setShowApplicationDialog(false);
      setFormData({
        applicantName: '',
        email: '',
        phone: '',
        school: '',
        program: '',
        grade: '',
        requestedAmount: 0,
        familyIncome: 0,
        gpa: 0,
      });
    } catch {
      toast.error('Başvuru gönderilirken hata oluştu');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: 'Beklemede', variant: 'secondary' as const, icon: Clock },
      approved: { label: 'Onaylandı', variant: 'default' as const, icon: Check },
      rejected: { label: 'Reddedildi', variant: 'destructive' as const, icon: X },
      interview: { label: 'Mülakat', variant: 'outline' as const, icon: AlertCircle },
    };

    const config = statusConfig[status as keyof typeof statusConfig];
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const priorityConfig = {
      high: { label: 'Yüksek', variant: 'destructive' as const },
      medium: { label: 'Orta', variant: 'secondary' as const },
      low: { label: 'Düşük', variant: 'outline' as const },
    };

    const config = priorityConfig[priority as keyof typeof priorityConfig];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (isMobile) {
    return (
      <div className="space-y-4 p-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Burs Başvuruları</h1>
          <Button
            onClick={() => {
              setShowApplicationDialog(true);
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            Yeni Başvuru
          </Button>
        </div>

        {/* Stats Cards */}
        <ResponsiveCardGrid>
          <MobileInfoCard
            title="Toplam Başvuru"
            value={stats.total.toString()}
            icon={FileText}
            color="blue"
          />
          <MobileInfoCard
            title="Beklemede"
            value={stats.pending.toString()}
            icon={Clock}
            color="yellow"
          />
          <MobileInfoCard
            title="Onaylandı"
            value={stats.approved.toString()}
            icon={Check}
            color="green"
          />
          <MobileInfoCard
            title="Reddedildi"
            value={stats.rejected.toString()}
            icon={X}
            color="red"
          />
        </ResponsiveCardGrid>

        {/* Filters */}
        <Card>
          <CardContent className="space-y-3 p-4">
            <Input
              placeholder="Başvuru ara..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
              }}
            />
            <div className="grid grid-cols-2 gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Durum" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tüm Durumlar</SelectItem>
                  <SelectItem value="pending">Beklemede</SelectItem>
                  <SelectItem value="approved">Onaylandı</SelectItem>
                  <SelectItem value="rejected">Reddedildi</SelectItem>
                  <SelectItem value="interview">Mülakat</SelectItem>
                </SelectContent>
              </Select>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Öncelik" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tüm Öncelikler</SelectItem>
                  <SelectItem value="high">Yüksek</SelectItem>
                  <SelectItem value="medium">Orta</SelectItem>
                  <SelectItem value="low">Düşük</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Applications List */}
        <div className="space-y-3">
          {filteredApplications.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <FileText className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                <h3 className="mb-2 text-lg font-medium text-gray-900">Henüz başvuru yok</h3>
                <p className="mb-4 text-gray-500">İlk burs başvurusunu ekleyerek başlayın</p>
                <Button
                  onClick={() => {
                    setShowApplicationDialog(true);
                  }}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Yeni Başvuru Ekle
                </Button>
              </CardContent>
            </Card>
          ) : (
            filteredApplications.map((application) => (
              <motion.div
                key={application.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card>
                  <CardContent className="p-4">
                    <div className="mb-3 flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <Avatar>
                          <AvatarFallback>{application.applicantName.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-medium">{application.applicantName}</h3>
                          <p className="text-sm text-gray-500">{application.school}</p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end space-y-1">
                        {getStatusBadge(application.status)}
                        {getPriorityBadge(application.priority)}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-gray-500">Program:</span>
                        <p className="font-medium">{application.program}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Sınıf:</span>
                        <p className="font-medium">{application.grade}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Talep Edilen:</span>
                        <p className="font-medium">
                          ₺{application.requestedAmount.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-500">GPA:</span>
                        <p className="font-medium">{application.gpa}</p>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center justify-between border-t pt-3">
                      <span className="text-xs text-gray-500">
                        {new Date(application.applicationDate).toLocaleDateString('tr-TR')}
                      </span>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Burs Başvuruları</h1>
          <p className="text-gray-600">Burs başvurularını yönetin ve değerlendirin</p>
        </div>
        <Button
          onClick={() => {
            setShowApplicationDialog(true);
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          Yeni Başvuru
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Toplam Başvuru</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Beklemede</p>
                <p className="text-2xl font-bold">{stats.pending}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Check className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Onaylandı</p>
                <p className="text-2xl font-bold">{stats.approved}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <X className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Reddedildi</p>
                <p className="text-2xl font-bold">{stats.rejected}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <AlertCircle className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Mülakat</p>
                <p className="text-2xl font-bold">{stats.interview}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="flex-1">
              <Input
                placeholder="Başvuru ara..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                }}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Durum" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Durumlar</SelectItem>
                <SelectItem value="pending">Beklemede</SelectItem>
                <SelectItem value="approved">Onaylandı</SelectItem>
                <SelectItem value="rejected">Reddedildi</SelectItem>
                <SelectItem value="interview">Mülakat</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Öncelik" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Öncelikler</SelectItem>
                <SelectItem value="high">Yüksek</SelectItem>
                <SelectItem value="medium">Orta</SelectItem>
                <SelectItem value="low">Düşük</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Applications Table */}
      <Card>
        <CardHeader>
          <CardTitle>Başvuru Listesi</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredApplications.length === 0 ? (
            <div className="py-8 text-center">
              <FileText className="mx-auto mb-4 h-12 w-12 text-gray-400" />
              <h3 className="mb-2 text-lg font-medium text-gray-900">Henüz başvuru yok</h3>
              <p className="mb-4 text-gray-500">İlk burs başvurusunu ekleyerek başlayın</p>
              <Button
                onClick={() => {
                  setShowApplicationDialog(true);
                }}
              >
                <Plus className="mr-2 h-4 w-4" />
                Yeni Başvuru Ekle
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="p-4 text-left">Başvuran</th>
                    <th className="p-4 text-left">Okul/Program</th>
                    <th className="p-4 text-left">Talep Edilen</th>
                    <th className="p-4 text-left">GPA</th>
                    <th className="p-4 text-left">Durum</th>
                    <th className="p-4 text-left">Öncelik</th>
                    <th className="p-4 text-left">Tarih</th>
                    <th className="p-4 text-left">İşlemler</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredApplications.map((application) => (
                    <motion.tr
                      key={application.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                      className="border-b hover:bg-gray-50"
                    >
                      <td className="p-4">
                        <div className="flex items-center space-x-3">
                          <Avatar>
                            <AvatarFallback>{application.applicantName.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{application.applicantName}</p>
                            <p className="text-sm text-gray-500">{application.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div>
                          <p className="font-medium">{application.school}</p>
                          <p className="text-sm text-gray-500">{application.program}</p>
                        </div>
                      </td>
                      <td className="p-4">
                        <p className="font-medium">
                          ₺{application.requestedAmount.toLocaleString()}
                        </p>
                        <p className="text-sm text-gray-500">
                          Aile Geliri: ₺{application.familyIncome.toLocaleString()}
                        </p>
                      </td>
                      <td className="p-4">
                        <p className="font-medium">{application.gpa}</p>
                      </td>
                      <td className="p-4">{getStatusBadge(application.status)}</td>
                      <td className="p-4">{getPriorityBadge(application.priority)}</td>
                      <td className="p-4">
                        <p className="text-sm">
                          {new Date(application.applicationDate).toLocaleDateString('tr-TR')}
                        </p>
                      </td>
                      <td className="p-4">
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Application Dialog */}
      <Dialog open={showApplicationDialog} onOpenChange={setShowApplicationDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Yeni Burs Başvurusu</DialogTitle>
            <DialogDescription>Burs başvurusu için gerekli bilgileri doldurun</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="applicantName">Başvuran Adı</Label>
                <Input
                  id="applicantName"
                  value={formData.applicantName}
                  onChange={(e) => {
                    setFormData({ ...formData, applicantName: e.target.value });
                  }}
                />
              </div>
              <div>
                <Label htmlFor="email">E-posta</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => {
                    setFormData({ ...formData, email: e.target.value });
                  }}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phone">Telefon</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => {
                    setFormData({ ...formData, phone: e.target.value });
                  }}
                />
              </div>
              <div>
                <Label htmlFor="school">Okul</Label>
                <Input
                  id="school"
                  value={formData.school}
                  onChange={(e) => {
                    setFormData({ ...formData, school: e.target.value });
                  }}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="program">Program</Label>
                <Input
                  id="program"
                  value={formData.program}
                  onChange={(e) => {
                    setFormData({ ...formData, program: e.target.value });
                  }}
                />
              </div>
              <div>
                <Label htmlFor="grade">Sınıf</Label>
                <Input
                  id="grade"
                  value={formData.grade}
                  onChange={(e) => {
                    setFormData({ ...formData, grade: e.target.value });
                  }}
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="requestedAmount">Talep Edilen Miktar</Label>
                <Input
                  id="requestedAmount"
                  type="number"
                  value={formData.requestedAmount}
                  onChange={(e) => {
                    setFormData({ ...formData, requestedAmount: Number(e.target.value) });
                  }}
                />
              </div>
              <div>
                <Label htmlFor="familyIncome">Aile Geliri</Label>
                <Input
                  id="familyIncome"
                  type="number"
                  value={formData.familyIncome}
                  onChange={(e) => {
                    setFormData({ ...formData, familyIncome: Number(e.target.value) });
                  }}
                />
              </div>
              <div>
                <Label htmlFor="gpa">GPA</Label>
                <Input
                  id="gpa"
                  type="number"
                  step="0.01"
                  value={formData.gpa}
                  onChange={(e) => {
                    setFormData({ ...formData, gpa: Number(e.target.value) });
                  }}
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowApplicationDialog(false);
                }}
              >
                İptal
              </Button>
              <Button onClick={handleSubmitApplication} disabled={isSubmitting}>
                {isSubmitting ? 'Gönderiliyor...' : 'Başvuru Gönder'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
