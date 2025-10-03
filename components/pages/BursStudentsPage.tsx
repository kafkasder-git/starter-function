/**
 * @fileoverview BursStudentsPage Module - Application module
 * 
 * @author Dernek Yönetim Sistemi Team
 * @version 1.0.0
 */

import {
  Award,
  BookOpen,
  Calendar,
  Eye,
  FileText,
  GraduationCap,
  Plus,
  Search,
  TrendingUp,
} from 'lucide-react';
import { motion } from 'motion/react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { useIsMobile } from '../../hooks/useTouchDevice';
import { MobileInfoCard, ResponsiveCardGrid, TouchActionCard } from '../ResponsiveCard';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';

interface Student {
  id: number;
  name: string;
  email: string;
  phone: string;
  school: string;
  grade: string;
  program: string;
  scholarshipAmount: number;
  status: 'active' | 'graduated' | 'dropped' | 'suspended';
  startDate: string;
  gpa: number;
  avatar?: string;
}

interface StudentStats {
  total: number;
  active: number;
  graduated: number;
  totalAmount: number;
}

/**
 * BursStudentsPage function
 * 
 * @param {Object} params - Function parameters
 * @returns {void} Nothing
 */
export function BursStudentsPage() {
  const isMobile = useIsMobile();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [programFilter, setProgramFilter] = useState<string>('all');
  const [showApplicationDialog, setShowApplicationDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    student_name: '',
    email: '',
    phone: '',
    school: '',
    grade: '',
    program: '',
    scholarship_amount: 0,
    gpa: 0,
    notes: '',
  });

  const students: Student[] = useMemo(
    () => [
      {
        id: 1,
        name: 'Ahmet Yılmaz',
        email: 'ahmet@email.com',
        phone: '0532 123 4567',
        school: 'İstanbul Üniversitesi',
        grade: '3. Sınıf',
        program: 'Bilgisayar Mühendisliği',
        scholarshipAmount: 1500,
        status: 'active',
        startDate: '2023-09-15',
        gpa: 3.45,
      },
      {
        id: 2,
        name: 'Ayşe Kaya',
        email: 'ayse@email.com',
        phone: '0533 987 6543',
        school: 'Boğaziçi Üniversitesi',
        grade: '4. Sınıf',
        program: 'İktisat',
        scholarshipAmount: 2000,
        status: 'active',
        startDate: '2022-09-12',
        gpa: 3.78,
      },
      {
        id: 3,
        name: 'Mehmet Demir',
        email: 'mehmet@email.com',
        phone: '0534 555 1234',
        school: 'ODTÜ',
        grade: 'Mezun',
        program: 'Makine Mühendisliği',
        scholarshipAmount: 1800,
        status: 'graduated',
        startDate: '2020-09-14',
        gpa: 3.12,
      },
      {
        id: 4,
        name: 'Fatma Özkan',
        email: 'fatma@email.com',
        phone: '0535 777 8899',
        school: 'Hacettepe Üniversitesi',
        grade: '2. Sınıf',
        program: 'Tıp',
        scholarshipAmount: 2500,
        status: 'active',
        startDate: '2024-09-16',
        gpa: 3.89,
      },
      {
        id: 5,
        name: 'Can Polat',
        email: 'can@email.com',
        phone: '0536 111 2233',
        school: 'İTÜ',
        grade: '1. Sınıf',
        program: 'Elektrik Mühendisliği',
        scholarshipAmount: 1200,
        status: 'active',
        startDate: '2024-09-20',
        gpa: 3.25,
      },
    ],
    [],
  );

  // Calculate statistics
  const stats: StudentStats = useMemo(() => {
    const total = students.length;
    const active = students.filter((s) => s.status === 'active').length;
    const graduated = students.filter((s) => s.status === 'graduated').length;
    const totalAmount = students
      .filter((s) => s.status === 'active')
      .reduce((sum, s) => sum + s.scholarshipAmount, 0);

    return { total, active, graduated, totalAmount };
  }, [students]);

  // Filter students
  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      const matchesSearch =
        student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.school.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.program.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === 'all' || student.status === statusFilter;
      const matchesProgram = programFilter === 'all' || student.program === programFilter;

      return matchesSearch && matchesStatus && matchesProgram;
    });
  }, [students, searchQuery, statusFilter, programFilter]);

  const getStatusBadge = (status: Student['status']) => {
    const statusConfig = {
      active: { label: 'Aktif', variant: 'default' as const, color: 'bg-green-500' },
      graduated: { label: 'Mezun', variant: 'secondary' as const, color: 'bg-blue-500' },
      dropped: { label: 'Bırakmış', variant: 'destructive' as const, color: 'bg-gray-500' },
      suspended: { label: 'Askıda', variant: 'outline' as const, color: 'bg-yellow-500' },
    };

    return statusConfig[status] ?? statusConfig.active;
  };

  const handleViewStudent = (studentId: number) => {
    toast.success(`Öğrenci detayları açılıyor: ${studentId}`);
  };

  const handleNewStudent = () => {
    setShowApplicationDialog(true);
  };

  const handleSubmitApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.student_name || !formData.email || !formData.school) {
      toast.error('Öğrenci adı, e-posta ve okul alanları zorunludur');
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // TODO: Integrate with actual API
      // const result = await scholarshipService.createApplication(formData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('Burs başvurusu başarıyla oluşturuldu!');
      setShowApplicationDialog(false);
      
      // Reset form
      setFormData({
        student_name: '',
        email: '',
        phone: '',
        school: '',
        grade: '',
        program: '',
        scholarship_amount: 0,
        gpa: 0,
        notes: '',
      });
      
    } catch (error) {
      toast.error('Başvuru oluşturulurken hata oluştu');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBulkAction = () => {
    toast.success('Toplu işlem menüsü açılıyor...');
  };

  const programs = [...new Set(students.map((s) => s.program))];

  return (
    <div className="p-3 sm:p-6 lg:p-8 space-y-6 lg:space-y-8 bg-slate-50/50 min-h-full safe-area">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1 sm:space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 flex items-center gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-amber-600 to-orange-700 rounded-xl flex items-center justify-center">
              <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            Burs Öğrencileri
          </h1>
          <p className="text-sm sm:text-base text-slate-600">
            Burslu öğrencileri yönetin ve takip edin
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button onClick={handleBulkAction} variant="outline" size="sm" className="hidden sm:flex">
            <FileText className="w-4 h-4 mr-2" />
            Raporlar
          </Button>
          <Button onClick={handleNewStudent} size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Yeni Öğrenci
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <ResponsiveCardGrid cols={{ default: 2, sm: 4 }} gap="sm">
        <MobileInfoCard
          icon={<BookOpen className="w-5 h-5" />}
          title="Toplam Öğrenci"
          value={stats.total.toString()}
          color="text-blue-600"
        />
        <MobileInfoCard
          icon={<Award className="w-5 h-5" />}
          title="Aktif Öğrenci"
          value={stats.active.toString()}
          color="text-green-600"
        />
        <MobileInfoCard
          icon={<TrendingUp className="w-5 h-5" />}
          title="Mezun Sayısı"
          value={stats.graduated.toString()}
          color="text-purple-600"
        />
        <MobileInfoCard
          icon={<Calendar className="w-5 h-5" />}
          title="Aylık Toplam"
          value={`₺${stats.totalAmount.toLocaleString()}`}
          color="text-amber-600"
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
                  placeholder="Burslu öğrenci, okul veya program ara..."
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
                <SelectItem value="active">Aktif</SelectItem>
                <SelectItem value="graduated">Mezun</SelectItem>
                <SelectItem value="dropped">Bırakmış</SelectItem>
                <SelectItem value="suspended">Askıda</SelectItem>
              </SelectContent>
            </Select>

            <Select value={programFilter} onValueChange={setProgramFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Program Filtresi" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Programlar</SelectItem>
                {programs.map((program) => (
                  <SelectItem key={program} value={program}>
                    {program}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Students List */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center justify-between">
            <span>Öğrenci Listesi</span>
            <Badge variant="secondary" className="text-xs">
              {filteredStudents.length} öğrenci
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 sm:p-6 sm:pt-0">
          {isMobile ? (
            <div className="space-y-3 p-4">
              {filteredStudents.map((student, index) => (
                <motion.div
                  key={student.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <TouchActionCard
                    icon={<GraduationCap className="w-5 h-5" />}
                    title={student.name}
                    description={`${student.program} • ${student.school}`}
                    onClick={() => {
                      handleViewStudent(student.id);
                    }}
                    variant="secondary"
                  />
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-3 px-4 font-medium text-slate-700">Öğrenci</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-700">Okul</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-700">Program</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-700">Burs</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-700">GPA</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-700">Durum</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-700">İşlemler</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((student, index) => {
                    const statusConfig = getStatusBadge(student.status);
                    return (
                      <motion.tr
                        key={student.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                      >
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <Avatar className="w-10 h-10">
                              <AvatarImage src={student.avatar} />
                              <AvatarFallback className="bg-gradient-to-br from-amber-600 to-orange-700 text-white">
                                {student.name
                                  .split(' ')
                                  .map((n) => n[0])
                                  .join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium text-slate-900">{student.name}</div>
                              <div className="text-sm text-slate-500">{student.grade}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-slate-700">{student.school}</td>
                        <td className="py-4 px-4 text-slate-700">{student.program}</td>
                        <td className="py-4 px-4">
                          <span className="font-semibold text-green-600">
                            ₺{student.scholarshipAmount.toLocaleString()}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <span
                            className={`font-medium ${
                              student.gpa >= 3.5
                                ? 'text-green-600'
                                : student.gpa >= 3.0
                                  ? 'text-amber-600'
                                  : 'text-red-600'
                            }`}
                          >
                            {student.gpa.toFixed(2)}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>
                        </td>
                        <td className="py-4 px-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              handleViewStudent(student.id);
                            }}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
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

      {/* Application Dialog */}
      <Dialog open={showApplicationDialog} onOpenChange={setShowApplicationDialog}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <GraduationCap className="w-5 h-5" />
              Yeni Burs Başvurusu
            </DialogTitle>
            <DialogDescription>
              Öğrenci bilgilerini doldurun ve burs başvurusunu oluşturun.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmitApplication} className="space-y-4 py-4">
            {/* Student Name */}
            <div className="space-y-2">
              <Label htmlFor="student_name">
                Öğrenci Adı <span className="text-red-500">*</span>
              </Label>
              <Input
                id="student_name"
                value={formData.student_name}
                onChange={(e) => setFormData({ ...formData, student_name: e.target.value })}
                placeholder="Öğrencinin tam adı"
                required
              />
            </div>

            {/* Contact Information */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">
                  E-posta <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="ogrenci@email.com"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Telefon</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="05XX XXX XX XX"
                />
              </div>
            </div>

            {/* School Information */}
            <div className="space-y-2">
              <Label htmlFor="school">
                Okul <span className="text-red-500">*</span>
              </Label>
              <Input
                id="school"
                value={formData.school}
                onChange={(e) => setFormData({ ...formData, school: e.target.value })}
                placeholder="Üniversite veya okul adı"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="grade">Sınıf</Label>
                <Input
                  id="grade"
                  value={formData.grade}
                  onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                  placeholder="Örn: 3. Sınıf"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="program">Bölüm</Label>
                <Input
                  id="program"
                  value={formData.program}
                  onChange={(e) => setFormData({ ...formData, program: e.target.value })}
                  placeholder="Örn: Bilgisayar Mühendisliği"
                />
              </div>
            </div>

            {/* Scholarship Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="scholarship_amount">Burs Tutarı (TL)</Label>
                <Input
                  id="scholarship_amount"
                  type="number"
                  value={formData.scholarship_amount || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, scholarship_amount: parseFloat(e.target.value) || 0 })
                  }
                  placeholder="1500"
                  min="0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gpa">Not Ortalaması (GPA)</Label>
                <Input
                  id="gpa"
                  type="number"
                  step="0.01"
                  value={formData.gpa || ''}
                  onChange={(e) => setFormData({ ...formData, gpa: parseFloat(e.target.value) || 0 })}
                  placeholder="3.45"
                  min="0"
                  max="4"
                />
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notlar</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Ek bilgiler ve notlar"
                rows={3}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowApplicationDialog(false)}
                disabled={isSubmitting}
              >
                İptal
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Kaydediliyor...' : 'Başvuru Oluştur'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
