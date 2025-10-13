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
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { useIsMobile } from '../../hooks/useTouchDevice';
import { db, collections } from '../../lib/database';
import { Query } from '../../lib/appwrite';
import { logger } from '../../lib/logging/logger';
import { MobileInfoCard, ResponsiveCardGrid } from '../shared/ResponsiveCard';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Progress } from '../ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { ProtectedRoute } from '../auth/ProtectedRoute';
import { Permission } from '../../types/auth';

interface Transaction {
  id: string;
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
  return (
    <ProtectedRoute requiredPermission={Permission.MANAGE_FINANCIAL}>
      <FinanceIncomePageContent />
    </ProtectedRoute>
  );
}

function FinanceIncomePageContent() {
  const isMobile = useIsMobile();
  const [selectedPeriod, setSelectedPeriod] = useState('thisMonth');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showTransactionDialog, setShowTransactionDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [, setLoading] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [formData, setFormData] = useState({
    type: 'income' as 'income' | 'expense',
    category: '',
    description: '',
    amount: 0,
    date: new Date().toISOString().split('T')[0],
    paymentMethod: 'bank' as Transaction['paymentMethod'],
  });

  // Load transactions on mount
  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    try {
      setLoading(true);
      const { data, error } = await db.list(collections.FINANCE_TRANSACTIONS, [
        // Assuming field mapping or direct field names
        // Filter by transaction_type: 'income'
        Query.equal('transaction_type', 'income'),
      ]);

      if (error) {
        logger.error('Error loading transactions:', error);
        toast.error('İşlemler yüklenirken hata oluştu');
        return;
      }

      // Map database documents to Transaction interface
      const mappedTransactions: Transaction[] = (data?.documents || []).map((doc: any) => ({
        id: doc.$id,
        type: doc.transaction_type === 'income' ? 'income' : 'expense',
        category: doc.category || '',
        description: doc.description || '',
        amount: doc.amount || 0,
        date: doc.date || doc.created_at?.split('T')[0] || '',
        paymentMethod: doc.payment_method || 'bank',
        status: doc.status || 'completed',
      }));

      setTransactions(mappedTransactions);
    } catch (error) {
      logger.error('Failed to load transactions:', error);
      toast.error('İşlemler yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const monthlyData: MonthlyData[] = useMemo(
    () => [
      // Example data - will be replaced with real API data
      { month: 'Temmuz', income: 58000, expense: 42000, balance: 16000 },
      { month: 'Ağustos', income: 49000, expense: 45000, balance: 4000 },
      { month: 'Eylül', income: 61000, expense: 39000, balance: 22000 },
      { month: 'Ekim', income: 63800, expense: 49000, balance: 14800 },
    ],
    []
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

      const result = await db.create(collections.FINANCE_TRANSACTIONS, {
        transaction_type: formData.type,
        amount: formData.amount,
        category: formData.category,
        description: formData.description,
        date: formData.date,
        payment_method: formData.paymentMethod,
        status: 'completed',
        created_at: new Date().toISOString(),
      });

      if (result.error) {
        logger.error('Error creating transaction:', result.error);
        toast.error('İşlem kaydedilirken hata oluştu');
        return;
      }

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

      // Reload transactions
      await loadTransactions();
    } catch (error) {
      logger.error('Failed to create transaction:', error);
      toast.error('İşlem kaydedilirken hata oluştu');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPaymentMethodIcon = (method: Transaction['paymentMethod']) => {
    switch (method) {
      case 'cash':
        return <Banknote className="h-4 w-4" />;
      case 'bank':
        return <Receipt className="h-4 w-4" />;
      case 'card':
        return <CreditCard className="h-4 w-4" />;
      default:
        return <Wallet className="h-4 w-4" />;
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
    <div className="safe-area min-h-full space-y-6 bg-slate-50/50 p-3 sm:p-6 lg:space-y-8 lg:p-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1 sm:space-y-2">
          <h1 className="flex items-center gap-3 text-2xl font-bold text-slate-800 sm:text-3xl">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 sm:h-10 sm:w-10">
              <Wallet className="h-5 w-5 text-white sm:h-6 sm:w-6" />
            </div>
            Gelir-Gider Yönetimi
          </h1>
          <p className="text-sm text-slate-600 sm:text-base">
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
            <BarChart3 className="mr-2 h-4 w-4" />
            Rapor
          </Button>
          <Button onClick={handleNewTransaction} size="sm">
            <Plus className="mr-2 h-4 w-4" />
            {isMobile ? 'Yeni' : 'Yeni İşlem'}
          </Button>
        </div>
      </div>

      {/* Financial Summary Cards */}
      <ResponsiveCardGrid cols={{ default: 2, sm: 4 }} gap="sm">
        <MobileInfoCard
          icon={<TrendingUp className="h-5 w-5" />}
          title="Toplam Gelir"
          value={`₺${currentStats.totalIncome.toLocaleString()}`}
          color="text-green-600"
        />
        <MobileInfoCard
          icon={<TrendingDown className="h-5 w-5" />}
          title="Toplam Gider"
          value={`₺${currentStats.totalExpense.toLocaleString()}`}
          color="text-red-600"
        />
        <MobileInfoCard
          icon={<Wallet className="h-5 w-5" />}
          title="Net Bakiye"
          value={`₺${currentStats.balance.toLocaleString()}`}
          color={currentStats.balance >= 0 ? 'text-green-600' : 'text-red-600'}
        />
        <MobileInfoCard
          icon={<Calendar className="h-5 w-5" />}
          title="Bekleyen Gelir"
          value={`₺${currentStats.pendingIncome.toLocaleString()}`}
          color="text-amber-600"
        />
      </ResponsiveCardGrid>

      {/* Charts and Analysis */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8">
        {/* Income Categories */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <TrendingUp className="h-5 w-5 text-green-600" />
              Gelir Kategorileri
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {incomeCategories.map((category) => {
              const percentage = Math.round((category.total / currentStats.totalIncome) * 100);
              return (
                <div key={category.category} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-slate-700">{category.category}</span>
                    <span className="font-semibold text-green-600">
                      ₺{category.total.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Progress value={percentage} className="h-2 flex-1" />
                    <span className="w-10 text-right text-xs text-slate-500">%{percentage}</span>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Expense Categories */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <TrendingDown className="h-5 w-5 text-red-600" />
              Gider Kategorileri
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {expenseCategories.map((category) => {
              const percentage = Math.round((category.total / currentStats.totalExpense) * 100);
              return (
                <div key={category.category} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-slate-700">{category.category}</span>
                    <span className="font-semibold text-red-600">
                      ₺{category.total.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Progress value={percentage} className="h-2 flex-1 [&>div]:bg-red-500" />
                    <span className="w-10 text-right text-xs text-slate-500">%{percentage}</span>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {/* Monthly Trend */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <BarChart3 className="h-5 w-5" />
            Aylık Trend
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <div className="space-y-4">
            {monthlyData.map((month) => (
              <div
                key={month.month}
                className="flex items-center justify-between rounded-lg bg-gray-50 p-4 transition-colors hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700"
              >
                <div className="flex-1">
                  <div className="mb-1 font-medium text-slate-900">{month.month}</div>
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
              </div>
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
            {transactions.slice(0, 8).map((transaction) => {
              const statusConfig = getStatusBadge(transaction.status);
              return (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between rounded-lg border border-gray-200 p-4 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                        transaction.type === 'income'
                          ? 'bg-green-100 text-green-600'
                          : 'bg-red-100 text-red-600'
                      }`}
                    >
                      {getPaymentMethodIcon(transaction.paymentMethod)}
                    </div>
                    <div>
                      <div className="font-medium text-slate-900">{transaction.description}</div>
                      <div className="flex items-center gap-2 text-sm text-slate-500">
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
                    <Badge variant={statusConfig.variant} className="mt-1 text-xs">
                      {statusConfig.label}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Transaction Dialog */}
      <Dialog open={showTransactionDialog} onOpenChange={setShowTransactionDialog}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Yeni Gelir/Gider İşlemi
            </DialogTitle>
            <DialogDescription>
              Yeni bir gelir veya gider işlemi kaydedin. Zorunlu alanları (*) doldurmanız
              gereklidir.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmitTransaction} className="space-y-4 py-4">
            {/* Transaction Type */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="type">
                  İşlem Türü <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.type}
                  onValueChange={(value: 'income' | 'expense') => {
                    setFormData({ ...formData, type: value });
                  }}
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
                  onChange={(e) => {
                    setFormData({ ...formData, date: e.target.value });
                  }}
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
                onChange={(e) => {
                  setFormData({ ...formData, category: e.target.value });
                }}
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
                onChange={(e) => {
                  setFormData({ ...formData, description: e.target.value });
                }}
                placeholder="İşlem detayları"
                rows={3}
                required
              />
            </div>

            {/* Amount and Payment Method */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="amount">
                  Tutar (TL) <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="amount"
                  type="number"
                  value={formData.amount || ''}
                  onChange={(e) => {
                    setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 });
                  }}
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
                  onValueChange={(value: Transaction['paymentMethod']) => {
                    setFormData({ ...formData, paymentMethod: value });
                  }}
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
            <div className="flex justify-end gap-2 border-t pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowTransactionDialog(false);
                }}
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

export default FinanceIncomePage;
