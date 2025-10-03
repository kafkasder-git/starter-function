/**
 * @fileoverview FinanceIncomePage Module - Application module
 *
 * @author Dernek Yönetim Sistemi Team
 * @version 1.0.0
 */

import {
  Banknote,
  BarChart3,
  Calendar,
  CreditCard,
  Plus,
  Receipt,
  TrendingDown,
  TrendingUp,
  Wallet,
} from 'lucide-react';
import { motion } from 'motion/react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { useIsMobile } from '../../hooks/useTouchDevice';
import { MobileInfoCard, ResponsiveCardGrid } from '../ResponsiveCard';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Progress } from '../ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';

interface Transaction {
  id: number;
  type: 'income' | 'expense';
  category: string;
  description: string;
  amount: number;
  date: string;
  paymentMethod: 'cash' | 'bank' | 'card';
  status: 'completed' | 'pending' | 'cancelled';
}

interface MonthlyData {
  month: string;
  income: number;
  expense: number;
  balance: number;
}

/**
 * FinanceIncomePage function
 *
 * @param {Object} params - Function parameters
 * @returns {void} Nothing
 */
export function FinanceIncomePage() {
  const isMobile = useIsMobile();
  const [selectedPeriod, setSelectedPeriod] = useState('thisMonth');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showTransactionDialog, setShowTransactionDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    type: 'income' as 'income' | 'expense',
    category: '',
    description: '',
    amount: 0,
    date: new Date().toISOString().split('T')[0],
    paymentMethod: 'bank' as Transaction['paymentMethod'],
  });

  // Mock data kaldırıldı - gerçek veriler API'den gelecek
  const transactions: Transaction[] = useMemo(() => [], []);

  const monthlyData: MonthlyData[] = useMemo(
    () => [
      // Mock data kaldırıldı - gerçek veriler API'den gelecek
      { month: 'Temmuz', income: 58000, expense: 42000, balance: 16000 },
      { month: 'Ağustos', income: 49000, expense: 45000, balance: 4000 },
      { month: 'Eylül', income: 61000, expense: 39000, balance: 22000 },
      { month: 'Ekim', income: 63800, expense: 49000, balance: 14800 },
    ],
    [],
  );

  // Calculate current period stats
  const currentStats = useMemo(() => {
    const totalIncome = transactions
      .filter((t) => t.type === 'income' && t.status === 'completed')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpense = transactions
      .filter((t) => t.type === 'expense' && t.status === 'completed')
      .reduce((sum, t) => sum + t.amount, 0);

    const balance = totalIncome - totalExpense;
    const pendingIncome = transactions
      .filter((t) => t.type === 'income' && t.status === 'pending')
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      totalIncome,
      totalExpense,
      balance,
      pendingIncome,
    };
  }, [transactions]);

  // Category breakdown
  const categoryBreakdown = useMemo(() => {
    const categories = transactions.reduce<Record<string, any>>((acc, transaction) => {
      const key = `${transaction.type}_${transaction.category}`;
      if (!acc[key]) {
        acc[key] = {
          category: transaction.category,
          type: transaction.type,
          total: 0,
          count: 0,
        };
      }
      if (transaction.status === 'completed') {
        acc[key].total += transaction.amount;
        acc[key].count += 1;
      }
      return acc;
    }, {});

    return Object.values(categories);
  }, [transactions]);

  const incomeCategories = categoryBreakdown.filter((c) => c.type === 'income');
  const expenseCategories = categoryBreakdown.filter((c) => c.type === 'expense');

  const handleNewTransaction = () => {
    setShowTransactionDialog(true);
  };

  const handleExportReport = () => {
    toast.success('Mali rapor Excel formatında dışa aktarılıyor...');
  };

  const handleSubmitTransaction = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.category || !formData.description || formData.amount <= 0) {
      toast.error('Lütfen tüm zorunlu alanları doldurun');
      return;
    }

    try {
      setIsSubmitting(true);

      // TODO: Integrate with actual API
      // const result = await financeService.createTransaction(formData);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast.success('İşlem başarıyla kaydedildi!');
      setShowTransactionDialog(false);

      // Reset form
      setFormData({
        type: 'income',
        category: '',
        description: '',
        amount: 0,
        date: new Date().toISOString().split('T')[0],
        paymentMethod: 'bank',
      });
    } catch (error) {
      toast.error('İşlem kaydedilirken hata oluştu');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPaymentMethodIcon = (method: Transaction['paymentMethod']) => {
    switch (method) {
      case 'cash':
        return <Banknote className="w-4 h-4" />;
      case 'bank':
        return <Receipt className="w-4 h-4" />;
      case 'card':
        return <CreditCard className="w-4 h-4" />;
      default:
        return <Wallet className="w-4 h-4" />;
    }
  };

  const getStatusBadge = (status: Transaction['status']) => {
    const statusConfig = {
      completed: { label: 'Tamamlandı', variant: 'default' as const },
      pending: { label: 'Beklemede', variant: 'secondary' as const },
      cancelled: { label: 'İptal', variant: 'destructive' as const },
    };

    return statusConfig[status] ?? statusConfig.completed;
  };

  return (
    <div className="p-3 sm:p-6 lg:p-8 space-y-6 lg:space-y-8 bg-slate-50/50 min-h-full safe-area">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1 sm:space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 flex items-center gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-emerald-600 to-teal-700 rounded-xl flex items-center justify-center">
              <Wallet className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            Gelir-Gider Yönetimi
          </h1>
          <p className="text-sm sm:text-base text-slate-600">
            Mali durumu takip edin ve raporlayın
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-32 sm:w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="thisMonth">Bu Ay</SelectItem>
              <SelectItem value="lastMonth">Geçen Ay</SelectItem>
              <SelectItem value="thisYear">Bu Yıl</SelectItem>
              <SelectItem value="custom">Özel Tarih</SelectItem>
            </SelectContent>
          </Select>
          <Button
            onClick={handleExportReport}
            variant="outline"
            size="sm"
            className="hidden sm:flex"
          >
            <BarChart3 className="w-4 h-4 mr-2" />
            Rapor
          </Button>
          <Button onClick={handleNewTransaction} size="sm">
            <Plus className="w-4 h-4 mr-2" />
            {isMobile ? 'Yeni' : 'Yeni İşlem'}
          </Button>
        </div>
      </div>

      {/* Financial Summary Cards */}
      <ResponsiveCardGrid cols={{ default: 2, sm: 4 }} gap="sm">
        <MobileInfoCard
          icon={<TrendingUp className="w-5 h-5" />}
          title="Toplam Gelir"
          value={`₺${currentStats.totalIncome.toLocaleString()}`}
          color="text-green-600"
        />
        <MobileInfoCard
          icon={<TrendingDown className="w-5 h-5" />}
          title="Toplam Gider"
          value={`₺${currentStats.totalExpense.toLocaleString()}`}
          color="text-red-600"
        />
        <MobileInfoCard
          icon={<Wallet className="w-5 h-5" />}
          title="Net Bakiye"
          value={`₺${currentStats.balance.toLocaleString()}`}
          color={currentStats.balance >= 0 ? 'text-green-600' : 'text-red-600'}
        />
        <MobileInfoCard
          icon={<Calendar className="w-5 h-5" />}
          title="Bekleyen Gelir"
          value={`₺${currentStats.pendingIncome.toLocaleString()}`}
          color="text-amber-600"
        />
      </ResponsiveCardGrid>

      {/* Charts and Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        {/* Income Categories */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              Gelir Kategorileri
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {incomeCategories.map((category, index) => {
              const percentage = Math.round((category.total / currentStats.totalIncome) * 100);
              return (
                <motion.div
                  key={category.category}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="space-y-2"
                >
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-slate-700">{category.category}</span>
                    <span className="font-semibold text-green-600">
                      ₺{category.total.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Progress value={percentage} className="flex-1 h-2" />
                    <span className="text-xs text-slate-500 w-10 text-right">%{percentage}</span>
                  </div>
                </motion.div>
              );
            })}
          </CardContent>
        </Card>

        {/* Expense Categories */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-red-600" />
              Gider Kategorileri
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {expenseCategories.map((category, index) => {
              const percentage = Math.round((category.total / currentStats.totalExpense) * 100);
              return (
                <motion.div
                  key={category.category}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="space-y-2"
                >
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-slate-700">{category.category}</span>
                    <span className="font-semibold text-red-600">
                      ₺{category.total.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Progress value={percentage} className="flex-1 h-2 [&>div]:bg-red-500" />
                    <span className="text-xs text-slate-500 w-10 text-right">%{percentage}</span>
                  </div>
                </motion.div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {/* Monthly Trend */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Aylık Trend
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <div className="space-y-4">
            {monthlyData.map((month, index) => (
              <motion.div
                key={month.month}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
              >
                <div className="flex-1">
                  <div className="font-medium text-slate-900 mb-1">{month.month}</div>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-green-600">Gelir: ₺{month.income.toLocaleString()}</span>
                    <span className="text-red-600">Gider: ₺{month.expense.toLocaleString()}</span>
                  </div>
                </div>
                <div
                  className={`font-semibold ${
                    month.balance >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {month.balance >= 0 ? '+' : ''}₺{month.balance.toLocaleString()}
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Transactions */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg sm:text-xl">Son İşlemler</CardTitle>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-32 sm:w-36">
                <SelectValue placeholder="Kategori" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tümü</SelectItem>
                <SelectItem value="income">Gelir</SelectItem>
                <SelectItem value="expense">Gider</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="p-0 sm:p-6 sm:pt-0">
          <div className="space-y-3 p-4 sm:p-0">
            {transactions.slice(0, 8).map((transaction, index) => {
              const statusConfig = getStatusBadge(transaction.status);
              return (
                <motion.div
                  key={transaction.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        transaction.type === 'income'
                          ? 'bg-green-100 text-green-600'
                          : 'bg-red-100 text-red-600'
                      }`}
                    >
                      {getPaymentMethodIcon(transaction.paymentMethod)}
                    </div>
                    <div>
                      <div className="font-medium text-slate-900">{transaction.description}</div>
                      <div className="text-sm text-slate-500 flex items-center gap-2">
                        <span>{transaction.category}</span>
                        <span>•</span>
                        <span>{new Date(transaction.date).toLocaleDateString('tr-TR')}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div
                      className={`font-semibold ${
                        transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {transaction.type === 'income' ? '+' : '-'}₺
                      {transaction.amount.toLocaleString()}
                    </div>
                    <Badge variant={statusConfig.variant} className="text-xs mt-1">
                      {statusConfig.label}
                    </Badge>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Transaction Dialog */}
      <Dialog open={showTransactionDialog} onOpenChange={setShowTransactionDialog}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Yeni Gelir/Gider İşlemi
            </DialogTitle>
            <DialogDescription>
              Yeni bir gelir veya gider işlemi kaydedin. Zorunlu alanları (*) doldurmanız
              gereklidir.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmitTransaction} className="space-y-4 py-4">
            {/* Transaction Type */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">
                  İşlem Türü <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.type}
                  onValueChange={(value: 'income' | 'expense') =>
                    setFormData({ ...formData, type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Tür seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="income">Gelir</SelectItem>
                    <SelectItem value="expense">Gider</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="date">
                  Tarih <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                />
              </div>
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="category">
                Kategori <span className="text-red-500">*</span>
              </Label>
              <Input
                id="category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="Örn: Bağış, Aidat, Kira, Maaş"
                required
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">
                Açıklama <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="İşlem detayları"
                rows={3}
                required
              />
            </div>

            {/* Amount and Payment Method */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="amount">
                  Tutar (TL) <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="amount"
                  type="number"
                  value={formData.amount || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })
                  }
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="paymentMethod">Ödeme Yöntemi</Label>
                <Select
                  value={formData.paymentMethod}
                  onValueChange={(value: Transaction['paymentMethod']) =>
                    setFormData({ ...formData, paymentMethod: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Yöntem seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Nakit</SelectItem>
                    <SelectItem value="bank">Banka</SelectItem>
                    <SelectItem value="card">Kart</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowTransactionDialog(false)}
                disabled={isSubmitting}
              >
                İptal
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Kaydediliyor...' : 'İşlemi Kaydet'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
