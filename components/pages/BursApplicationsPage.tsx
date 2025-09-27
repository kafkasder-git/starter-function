/**
 * @fileoverview BursApplicationsPage Module - Application module
 * 
 * @author Dernek Yönetim Sistemi Team
 * @version 1.0.0
 */

import { AlertCircle, Check, Clock, Download, Eye, FileText, Plus, Search, X } from 'lucide-react';
import { motion } from 'motion/react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { useIsMobile } from '../../hooks/useTouchDevice';
import { MobileInfoCard, ResponsiveCardGrid } from '../ResponsiveCard';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
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

  const applications: Application[] = useMemo(
    () => [
      {
        id: 1,
        applicantName: 'Zeynep Çelik',
        email: 'zeynep@email.com',
        phone: '0532 111 2222',
        school: 'İstanbul Teknik Üniversitesi',
        program: 'Bilgisayar Mühendisliği',
        grade: '2. Sınıf',
        requestedAmount: 1500,
        familyIncome: 8000,
        gpa: 3.67,
        status: 'pending',
        applicationDate: '2024-10-15',
        documents: {
          transcript: true,
          incomeProof: true,
          recommendation: false,
          essay: true,
        },
        priority: 'high',
      },
      {
        id: 2,
        applicantName: 'Ali Vural',
        email: 'ali@email.com',
        phone: '0533 333 4444',
        school: 'Ankara Üniversitesi',
        program: 'Hukuk',
        grade: '4. Sınıf',
        requestedAmount: 2000,
        familyIncome: 5500,
        gpa: 3.21,
        status: 'interview',
        applicationDate: '2024-10-12',
        documents: {
          transcript: true,
          incomeProof: true,
          recommendation: true,
          essay: true,
        },
        priority: 'medium',
      },
      {
        id: 3,
        applicantName: 'Selin Kocaman',
        email: 'selin@email.com',
        phone: '0534 555 6666',
        school: 'Ege Üniversitesi',
        program: 'Tıp',
        grade: '3. Sınıf',
        requestedAmount: 2500,
        familyIncome: 6200,
        gpa: 3.89,
        status: 'approved',
        applicationDate: '2024-10-08',
        documents: {
          transcript: true,
          incomeProof: true,
          recommendation: true,
          essay: true,
        },
        priority: 'high',
      },
      {
        id: 4,
        applicantName: 'Emre Şahin',
        email: 'emre@email.com',
        phone: '0535 777 8888',
        school: 'Gazi Üniversitesi',
        program: 'Makine Mühendisliği',
        grade: '1. Sınıf',
        requestedAmount: 1200,
        familyIncome: 9500,
        gpa: 2.98,
        status: 'rejected',
        applicationDate: '2024-10-05',
        documents: {
          transcript: true,
          incomeProof: false,
          recommendation: false,
          essay: true,
        },
        priority: 'low',
      },
      {
        id: 5,
        applicantName: 'Büşra Özdemir',
        email: 'busra@email.com',
        phone: '0536 999 0000',
        school: 'Marmara Üniversitesi',
        program: 'İktisat',
        grade: '2. Sınıf',
        requestedAmount: 1800,
        familyIncome: 4800,
        gpa: 3.45,
        status: 'pending',
        applicationDate: '2024-10-18',
        documents: {
          transcript: true,
          incomeProof: true,
          recommendation: true,
          essay: false,
        },
        priority: 'medium',
      },
    ],
    [],
  );

  // Calculate statistics
  const stats: ApplicationStats = useMemo(() => {
    const total = applications.length;
    const pending = applications.filter((a) => a.status === 'pending').length;
    const approved = applications.filter((a) => a.status === 'approved').length;
    const rejected = applications.filter((a) => a.status === 'rejected').length;
    const interview = applications.filter((a) => a.status === 'interview').length;

    return { total, pending, approved, rejected, interview };
  }, [applications]);

  // Filter applications
  const filteredApplications = useMemo(() => {
    return applications.filter((application) => {
      const matchesSearch =
        application.applicantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        application.school.toLowerCase().includes(searchQuery.toLowerCase()) ||
        application.program.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === 'all' || application.status === statusFilter;
      const matchesPriority = priorityFilter === 'all' || application.priority === priorityFilter;

      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [applications, searchQuery, statusFilter, priorityFilter]);

  const getStatusBadge = (status: Application['status']) => {
    const statusConfig = {
      pending: {
        label: 'Beklemede',
        variant: 'outline' as const,
        icon: <Clock className="w-3 h-3" />,
      },
      approved: {
        label: 'Onaylandı',
        variant: 'default' as const,
        icon: <Check className="w-3 h-3" />,
      },
      rejected: {
        label: 'Reddedildi',
        variant: 'destructive' as const,
        icon: <X className="w-3 h-3" />,
      },
      interview: {
        label: 'Görüşme',
        variant: 'secondary' as const,
        icon: <AlertCircle className="w-3 h-3" />,
      },
    };

    return statusConfig[status] ?? statusConfig.pending;
  };

  const getPriorityBadge = (priority: Application['priority']) => {
    const priorityConfig = {
      high: { label: 'Yüksek', color: 'text-red-600', bg: 'bg-red-100' },
      medium: { label: 'Orta', color: 'text-amber-600', bg: 'bg-amber-100' },
      low: { label: 'Düşük', color: 'text-green-600', bg: 'bg-green-100' },
    };

    return priorityConfig[priority] ?? priorityConfig.medium;
  };

  const getDocumentProgress = (documents: Application['documents']) => {
    const totalDocs = Object.keys(documents).length;
    const completedDocs = Object.values(documents).filter(Boolean).length;
    const percentage = Math.round((completedDocs / totalDocs) * 100);

    return { completed: completedDocs, total: totalDocs, percentage };
  };

  const handleViewApplication = (applicationId: number) => {
    toast.success(`Başvuru detayları açılıyor: ${applicationId}`);
  };

  const handleApproveApplication = (applicationId: number) => {
    toast.success(`Başvuru onaylanıyor: ${applicationId}`);
  };

  const handleRejectApplication = (applicationId: number) => {
    toast.error(`Başvuru reddediliyor: ${applicationId}`);
  };

  const handleNewApplication = () => {
    toast.success('Yeni başvuru formu açılıyor...');
  };

  const handleBulkExport = () => {
    toast.success('Başvurular Excel formatında dışa aktarılıyor...');
  };

  return (
    <div className="p-3 sm:p-6 lg:p-8 space-y-6 lg:space-y-8 bg-slate-50/50 min-h-full safe-area">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1 sm:space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 flex items-center gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center">
              <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            Burs Başvuruları
          </h1>
          <p className="text-sm sm:text-base text-slate-600">
            Öğrenciler adına oluşturulan burs başvurularını inceleyin ve değerlendirin
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button onClick={handleBulkExport} variant="outline" size="sm" className="hidden sm:flex">
            <Download className="w-4 h-4 mr-2" />
            Dışa Aktar
          </Button>
          <Button onClick={handleNewApplication} size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Öğrenci Adına Başvuru Oluştur
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <ResponsiveCardGrid cols={{ default: 2, sm: 5 }} gap="sm">
        <MobileInfoCard
          icon={<FileText className="w-5 h-5" />}
          title="Toplam Başvuru"
          value={stats.total.toString()}
          color="text-blue-600"
        />
        <MobileInfoCard
          icon={<Clock className="w-5 h-5" />}
          title="Beklemede"
          value={stats.pending.toString()}
          color="text-amber-600"
        />
        <MobileInfoCard
          icon={<AlertCircle className="w-5 h-5" />}
          title="Görüşme"
          value={stats.interview.toString()}
          color="text-purple-600"
        />
        <MobileInfoCard
          icon={<Check className="w-5 h-5" />}
          title="Onaylandı"
          value={stats.approved.toString()}
          color="text-green-600"
        />
        <MobileInfoCard
          icon={<X className="w-5 h-5" />}
          title="Reddedildi"
          value={stats.rejected.toString()}
          color="text-red-600"
        />
      </ResponsiveCardGrid>

      {/* Filters */}
      <Card>
        <CardContent className="p-4 sm:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="sm:col-span-2 lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Başvuran, okul veya program ara..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                  }}
                  className="pl-10"
                />
              </div>
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Durum Filtresi" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Durumlar</SelectItem>
                <SelectItem value="pending">Beklemede</SelectItem>
                <SelectItem value="interview">Görüşme</SelectItem>
                <SelectItem value="approved">Onaylandı</SelectItem>
                <SelectItem value="rejected">Reddedildi</SelectItem>
              </SelectContent>
            </Select>

            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Öncelik Filtresi" />
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
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center justify-between">
            <span>Başvuru Listesi</span>
            <Badge variant="secondary" className="text-xs">
              {filteredApplications.length} başvuru
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 sm:p-6 sm:pt-0">
          {isMobile ? (
            <div className="space-y-4 p-4">
              {filteredApplications.map((application, index) => {
                const statusConfig = getStatusBadge(application.status);
                const priorityConfig = getPriorityBadge(application.priority);
                const docProgress = getDocumentProgress(application.documents);

                return (
                  <motion.div
                    key={application.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-white border border-slate-200 rounded-lg p-4 space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-slate-900">
                          {application.applicantName}
                        </h3>
                        <p className="text-sm text-slate-600">{application.program}</p>
                        <p className="text-xs text-slate-500">{application.school}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <Badge variant={statusConfig.variant} className="text-xs">
                          {statusConfig.icon}
                          <span className="ml-1">{statusConfig.label}</span>
                        </Badge>
                        <span
                          className={`text-xs px-2 py-1 rounded ${priorityConfig.bg} ${priorityConfig.color}`}
                        >
                          {priorityConfig.label}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-slate-500">Burs:</span>
                        <span className="ml-1 font-semibold text-green-600">
                          ₺{application.requestedAmount.toLocaleString()}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500">GPA:</span>
                        <span className="ml-1 font-semibold">{application.gpa.toFixed(2)}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">Aile Geliri:</span>
                        <span className="ml-1">₺{application.familyIncome.toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">Belgeler:</span>
                        <span className="ml-1">
                          {docProgress.completed}/{docProgress.total}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          handleViewApplication(application.id);
                        }}
                        className="flex-1 text-xs"
                      >
                        <Eye className="w-3 h-3 mr-1" />
                        Detay
                      </Button>
                      {application.status === 'pending' && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => {
                              handleApproveApplication(application.id);
                            }}
                            className="text-xs"
                          >
                            <Check className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => {
                              handleRejectApplication(application.id);
                            }}
                            className="text-xs"
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-3 px-4 font-medium text-slate-700">Başvuran</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-700">Okul/Program</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-700">Burs Miktarı</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-700">GPA</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-700">Belgeler</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-700">Öncelik</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-700">Durum</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-700">İşlemler</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredApplications.map((application, index) => {
                    const statusConfig = getStatusBadge(application.status);
                    const priorityConfig = getPriorityBadge(application.priority);
                    const docProgress = getDocumentProgress(application.documents);

                    return (
                      <motion.tr
                        key={application.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                      >
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <Avatar className="w-10 h-10">
                              <AvatarFallback className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white">
                                {application.applicantName
                                  .split(' ')
                                  .map((n) => n[0])
                                  .join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium text-slate-900">
                                {application.applicantName}
                              </div>
                              <div className="text-sm text-slate-500">{application.grade}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div>
                            <div className="font-medium text-slate-900">{application.program}</div>
                            <div className="text-sm text-slate-500">{application.school}</div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <span className="font-semibold text-green-600">
                            ₺{application.requestedAmount.toLocaleString()}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <span
                            className={`font-medium ${
                              application.gpa >= 3.5
                                ? 'text-green-600'
                                : application.gpa >= 3.0
                                  ? 'text-amber-600'
                                  : 'text-red-600'
                            }`}
                          >
                            {application.gpa.toFixed(2)}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            <div className="w-12 h-2 bg-slate-200 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-green-500 transition-all duration-300"
                                data-progress-width={`${docProgress.percentage}%`}
                              />
                            </div>
                            <span className="text-sm text-slate-600">
                              {docProgress.completed}/{docProgress.total}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <span
                            className={`text-xs px-2 py-1 rounded font-medium ${priorityConfig.bg} ${priorityConfig.color}`}
                          >
                            {priorityConfig.label}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <Badge variant={statusConfig.variant} className="text-xs">
                            {statusConfig.icon}
                            <span className="ml-1">{statusConfig.label}</span>
                          </Badge>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                handleViewApplication(application.id);
                              }}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            {application.status === 'pending' && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    handleApproveApplication(application.id);
                                  }}
                                  className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                >
                                  <Check className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    handleRejectApplication(application.id);
                                  }}
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              </>
                            )}
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
