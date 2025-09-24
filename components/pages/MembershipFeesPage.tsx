import { AlertTriangle, CheckCircle, CreditCard, Plus, Search } from 'lucide-react';
import { motion } from 'motion/react';
import { useState } from 'react';
import { toast } from 'sonner';
import { useIsMobile } from '../../hooks/useTouchDevice';
import { MobileInfoCard, ResponsiveCardGrid } from '../ResponsiveCard';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

interface Member {
  id: number;
  name: string;
  email: string;
  phone: string;
  membershipType: 'regular' | 'premium' | 'student';
  feeAmount: number;
  lastPayment: string;
  status: 'paid' | 'overdue' | 'pending';
  monthsOwed: number;
}

export function MembershipFeesPage() {
  const isMobile = useIsMobile();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const members: Member[] = [
    {
      id: 1,
      name: 'Ahmet Yılmaz',
      email: 'ahmet@email.com',
      phone: '0532 123 4567',
      membershipType: 'regular',
      feeAmount: 50,
      lastPayment: '2024-10-01',
      status: 'paid',
      monthsOwed: 0,
    },
    {
      id: 2,
      name: 'Ayşe Kaya',
      email: 'ayse@email.com',
      phone: '0533 987 6543',
      membershipType: 'premium',
      feeAmount: 100,
      lastPayment: '2024-08-15',
      status: 'overdue',
      monthsOwed: 2,
    },
    {
      id: 3,
      name: 'Mehmet Demir',
      email: 'mehmet@email.com',
      phone: '0534 555 1234',
      membershipType: 'student',
      feeAmount: 25,
      lastPayment: '2024-09-30',
      status: 'paid',
      monthsOwed: 0,
    },
  ];

  const stats = {
    totalMembers: members.length,
    paidMembers: members.filter((m) => m.status === 'paid').length,
    overdueMembers: members.filter((m) => m.status === 'overdue').length,
    totalRevenue: members
      .filter((m) => m.status === 'paid')
      .reduce((sum, m) => sum + m.feeAmount, 0),
  };

  const getStatusBadge = (status: Member['status']) => {
    const configs = {
      paid: {
        label: 'Ödedi',
        variant: 'default' as const,
        icon: <CheckCircle className="w-3 h-3" />,
      },
      overdue: {
        label: 'Gecikmiş',
        variant: 'destructive' as const,
        icon: <AlertTriangle className="w-3 h-3" />,
      },
      pending: {
        label: 'Beklemede',
        variant: 'secondary' as const,
        icon: <AlertTriangle className="w-3 h-3" />,
      },
    };
    return configs[status];
  };

  const handleNewPayment = () => {
    toast.success('Yeni ödeme kayıt formu açılıyor...');
  };

  const handleSendReminder = (memberId: number) => {
    toast.success(`Hatırlatma mesajı gönderiliyor: ${memberId}`);
  };

  return (
    <div className="p-3 sm:p-6 lg:p-8 space-y-6 bg-slate-50/50 min-h-full safe-area">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1 sm:space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 flex items-center gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-green-600 to-emerald-700 rounded-xl flex items-center justify-center">
              <CreditCard className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            Aidat Takibi
          </h1>
          <p className="text-sm sm:text-base text-slate-600">
            Üye aidatlarını takip edin ve yönetin
          </p>
        </div>
        <Button onClick={handleNewPayment} size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Yeni Ödeme
        </Button>
      </div>

      <ResponsiveCardGrid cols={{ default: 2, sm: 4 }} gap="sm">
        <MobileInfoCard
          icon={<CreditCard className="w-5 h-5" />}
          title="Toplam Üye"
          value={stats.totalMembers.toString()}
          color="text-blue-600"
        />
        <MobileInfoCard
          icon={<CheckCircle className="w-5 h-5" />}
          title="Ödeyen"
          value={stats.paidMembers.toString()}
          color="text-green-600"
        />
        <MobileInfoCard
          icon={<AlertTriangle className="w-5 h-5" />}
          title="Geciken"
          value={stats.overdueMembers.toString()}
          color="text-red-600"
        />
        <MobileInfoCard
          icon={<CreditCard className="w-5 h-5" />}
          title="Toplam Gelir"
          value={`₺${stats.totalRevenue.toLocaleString()}`}
          color="text-green-600"
        />
      </ResponsiveCardGrid>

      <Card>
        <CardContent className="p-4 sm:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Üye ara..."
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
                <SelectItem value="all">Tümü</SelectItem>
                <SelectItem value="paid">Ödedi</SelectItem>
                <SelectItem value="overdue">Gecikmiş</SelectItem>
                <SelectItem value="pending">Beklemede</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Üye Listesi</CardTitle>
        </CardHeader>
        <CardContent className="p-0 sm:p-6 sm:pt-0">
          <div className="space-y-3 p-4 sm:p-0">
            {members.map((member, index) => {
              const statusConfig = getStatusBadge(member.status);
              return (
                <motion.div
                  key={member.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <div>
                    <div className="font-medium text-slate-900">{member.name}</div>
                    <div className="text-sm text-slate-600">
                      {member.membershipType === 'regular'
                        ? 'Normal Üye'
                        : member.membershipType === 'premium'
                          ? 'Premium Üye'
                          : 'Öğrenci Üye'}{' '}
                      • ₺{member.feeAmount}/ay
                    </div>
                    {member.monthsOwed > 0 && (
                      <div className="text-xs text-red-600 mt-1">
                        {member.monthsOwed} ay borcu var
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={statusConfig.variant}>
                      {statusConfig.icon}
                      <span className="ml-1">{statusConfig.label}</span>
                    </Badge>
                    {member.status === 'overdue' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          handleSendReminder(member.id);
                        }}
                      >
                        Hatırlat
                      </Button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
