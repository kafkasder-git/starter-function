/**
 * @fileoverview MembershipFeesPage Module - Application module
 *
 * @author Dernek Yönetim Sistemi Team
 * @version 1.0.0
 */

import { AlertTriangle, CheckCircle, CreditCard, Plus, Search } from 'lucide-react';
import { motion } from 'motion/react';
import { useState } from 'react';
import { toast } from 'sonner';
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

/**
 * MembershipFeesPage function
 *
 * @param {Object} params - Function parameters
 * @returns {void} Nothing
 */
export function MembershipFeesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const members: Member[] = [];

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
        icon: <CheckCircle className="h-3 w-3" />,
      },
      overdue: {
        label: 'Gecikmiş',
        variant: 'destructive' as const,
        icon: <AlertTriangle className="h-3 w-3" />,
      },
      pending: {
        label: 'Beklemede',
        variant: 'secondary' as const,
        icon: <AlertTriangle className="h-3 w-3" />,
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
    <div className="safe-area min-h-full space-y-6 bg-slate-50/50 p-3 sm:p-6 lg:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1 sm:space-y-2">
          <h1 className="flex items-center gap-3 text-2xl font-bold text-slate-800 sm:text-3xl">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-green-600 to-emerald-700 sm:h-10 sm:w-10">
              <CreditCard className="h-5 w-5 text-white sm:h-6 sm:w-6" />
            </div>
            Aidat Takibi
          </h1>
          <p className="text-sm text-slate-600 sm:text-base">
            Üye aidatlarını takip edin ve yönetin
          </p>
        </div>
        <Button onClick={handleNewPayment} size="sm">
          <Plus className="mr-2 h-4 w-4" />
          Yeni Ödeme
        </Button>
      </div>

      <ResponsiveCardGrid cols={{ default: 2, sm: 4 }} gap="sm">
        <MobileInfoCard
          icon={<CreditCard className="h-5 w-5" />}
          title="Toplam Üye"
          value={stats.totalMembers.toString()}
          color="text-blue-600"
        />
        <MobileInfoCard
          icon={<CheckCircle className="h-5 w-5" />}
          title="Ödeyen"
          value={stats.paidMembers.toString()}
          color="text-green-600"
        />
        <MobileInfoCard
          icon={<AlertTriangle className="h-5 w-5" />}
          title="Geciken"
          value={stats.overdueMembers.toString()}
          color="text-red-600"
        />
        <MobileInfoCard
          icon={<CreditCard className="h-5 w-5" />}
          title="Toplam Gelir"
          value={`₺${stats.totalRevenue.toLocaleString()}`}
          color="text-green-600"
        />
      </ResponsiveCardGrid>

      <Card>
        <CardContent className="p-4 sm:p-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="sm:col-span-2">
              <div className="relative">
                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
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
                  className="flex items-center justify-between rounded-lg border border-slate-200 p-4 transition-colors hover:bg-slate-50"
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
                      <div className="mt-1 text-xs text-red-600">
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
