/**
 * @fileoverview CashAidVaultPage Module - Application module
 * 
 * @author Dernek Yönetim Sistemi Team
 * @version 1.0.0
 */

import {
  ArrowDownCircle,
  ArrowUpCircle,
  Banknote,
  Calendar,
  DollarSign,
  Eye,
  FileText,
  History,
  Plus,
  Search,
  Vault,
  Wallet,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { PageLayout } from '../layouts/PageLayout';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { ProtectedRoute } from '../auth/ProtectedRoute';
import { Permission } from '../../types/auth';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Textarea } from '../ui/textarea';

interface VaultTransaction {
  id: number;
  type: 'deposit' | 'withdrawal';
  amount: number;
  date: string;
  description: string;
  reference: string;
  operator: string;
  recipientName?: string;
  recipientId?: string;
  approvedBy: string;
  balance: number;
}
const initialTransactions: VaultTransaction[] = [];

/**
 * CashAidVaultPage function
 * 
 * @param {Object} params - Function parameters
 * @returns {void} Nothing
 */
export function CashAidVaultPage() {
  return (
    <ProtectedRoute requiredPermission={Permission.MANAGE_FINANCIAL}>
      <CashAidVaultPageContent />
    </ProtectedRoute>
  );
}

function CashAidVaultPageContent() {
  const [transactions, setTransactions] = useState<VaultTransaction[]>(initialTransactions);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [isNewTransactionOpen, setIsNewTransactionOpen] = useState(false);
  const [newTransaction, setNewTransaction] = useState({
    type: 'deposit' as 'deposit' | 'withdrawal',
    amount: '',
    description: '',
    recipientName: '',
    recipientId: '',
  });

  const currentBalance = transactions.length > 0 ? transactions[0].balance : 0;
  const todayTransactions = transactions.filter(
    (t) => new Date(t.date).toDateString() === new Date().toDateString(),
  );
  const todayDeposits = todayTransactions
    .filter((t) => t.type === 'deposit')
    .reduce((sum, t) => sum + t.amount, 0);
  const todayWithdrawals = todayTransactions
    .filter((t) => t.type === 'withdrawal')
    .reduce((sum, t) => sum + t.amount, 0);

  const filteredTransactions = transactions.filter((transaction) => {
    const matchesSearch =
      transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.operator.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.recipientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.recipientId?.includes(searchTerm);
    const matchesType = typeFilter === 'all' || transaction.type === typeFilter;

    return matchesSearch && matchesType;
  });

  const handleNewTransaction = () => {
    if (!newTransaction.amount || !newTransaction.description) {
      toast.error('Lütfen tüm alanları doldurun');
      return;
    }

    const amount = parseFloat(newTransaction.amount);
    if (amount <= 0) {
      toast.error('Geçerli bir tutar girin');
      return;
    }

    if (newTransaction.type === 'withdrawal' && amount > currentBalance) {
      toast.error('Yetersiz bakiye');
      return;
    }

    const newBalance =
      newTransaction.type === 'deposit' ? currentBalance + amount : currentBalance - amount;

    const transaction: VaultTransaction = {
      id: Date.now(),
      type: newTransaction.type,
      amount,
      date: new Date().toISOString().slice(0, 16).replace('T', ' '),
      description: newTransaction.description,
      reference: `VLT-2024-${String(transactions.length + 1).padStart(3, '0')}`,
      operator: 'Admin Yöneticisi',
      recipientName:
        newTransaction.type === 'withdrawal' ? newTransaction.recipientName : undefined,
      recipientId: newTransaction.type === 'withdrawal' ? newTransaction.recipientId : undefined,
      approvedBy: 'Sistem',
      balance: newBalance,
    };

    setTransactions((prev) => [
      transaction,
      ...prev.map((t) => ({
        ...t,
        balance: t.balance + (newTransaction.type === 'deposit' ? amount : -amount),
      })),
    ]);
    setNewTransaction({
      type: 'deposit',
      amount: '',
      description: '',
      recipientName: '',
      recipientId: '',
    });
    setIsNewTransactionOpen(false);
    toast.success(
      `${
        newTransaction.type === 'deposit' ? 'Para yatırma' : 'Para çekme'
      } işlemi başarıyla kaydedildi`,
    );
  };

  return (
    <PageLayout
      title="Nakdi Yardım Veznesi"
      subtitle="Nakdi yardım kasasını yönetin ve işlemleri takip edin"
      actions={
        <Dialog open={isNewTransactionOpen} onOpenChange={setIsNewTransactionOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Yeni İşlem
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Yeni Vezne İşlemi</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="transaction-type">İşlem Türü</Label>
                <Select
                  value={newTransaction.type}
                  onValueChange={(value: 'deposit' | 'withdrawal') => {
                    setNewTransaction((prev) => ({ ...prev, type: value }));
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="deposit">Para Yatırma</SelectItem>
                    <SelectItem value="withdrawal">Para Çekme</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">Tutar (TL)</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="0.00"
                  value={newTransaction.amount}
                  onChange={(e) => {
                    setNewTransaction((prev) => ({ ...prev, amount: e.target.value }));
                  }}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Açıklama</Label>
                <Textarea
                  id="description"
                  placeholder="İşlem açıklaması..."
                  value={newTransaction.description}
                  onChange={(e) => {
                    setNewTransaction((prev) => ({ ...prev, description: e.target.value }));
                  }}
                />
              </div>

              {newTransaction.type === 'withdrawal' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="recipient-name">Alıcı Adı</Label>
                    <Input
                      id="recipient-name"
                      placeholder="Yardım alan kişinin adı"
                      value={newTransaction.recipientName}
                      onChange={(e) => {
                        setNewTransaction((prev) => ({ ...prev, recipientName: e.target.value }));
                      }}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="recipient-id">TC Kimlik No</Label>
                    <Input
                      id="recipient-id"
                      placeholder="12345678901"
                      value={newTransaction.recipientId}
                      onChange={(e) => {
                        setNewTransaction((prev) => ({ ...prev, recipientId: e.target.value }));
                      }}
                    />
                  </div>
                </>
              )}

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsNewTransactionOpen(false);
                  }}
                >
                  İptal
                </Button>
                <Button onClick={handleNewTransaction}>İşlemi Kaydet</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      }
    >
      <div className="p-6 space-y-6">
        {/* Balance Overview */}
        <Card className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 mb-2">Güncel Kasa Bakiyesi</p>
                <p className="text-4xl font-bold">₺{currentBalance.toLocaleString('tr-TR')}</p>
              </div>
              <div className="p-3 bg-white/20 rounded-xl">
                <Vault className="w-8 h-8" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Daily Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <ArrowUpCircle className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Bugün Giren</p>
                  <p className="text-2xl font-bold text-green-600">
                    ₺{todayDeposits.toLocaleString('tr-TR')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <ArrowDownCircle className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Bugün Çıkan</p>
                  <p className="text-2xl font-bold text-red-600">
                    ₺{todayWithdrawals.toLocaleString('tr-TR')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <History className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Bugün İşlem</p>
                  <p className="text-2xl font-bold">{todayTransactions.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="İşlem açıklaması, referans no, operatör veya alıcı ile ara..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                    }}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="İşlem Türü" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tüm İşlemler</SelectItem>
                    <SelectItem value="deposit">Para Yatırma</SelectItem>
                    <SelectItem value="withdrawal">Para Çekme</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Transactions Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="w-5 h-5 text-blue-600" />
              İşlem Geçmişi ({filteredTransactions.length} işlem)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Referans</TableHead>
                    <TableHead>Tarih/Saat</TableHead>
                    <TableHead>İşlem Türü</TableHead>
                    <TableHead>Tutar</TableHead>
                    <TableHead>Açıklama</TableHead>
                    <TableHead>Alıcı/Kaynak</TableHead>
                    <TableHead>Operatör</TableHead>
                    <TableHead>Bakiye</TableHead>
                    <TableHead>İşlemler</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-gray-400" />
                          <span className="font-mono text-sm">{transaction.reference}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="text-sm">{transaction.date}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {transaction.type === 'deposit' ? (
                            <>
                              <ArrowUpCircle className="w-4 h-4 text-green-600" />
                              <Badge className="bg-green-100 text-green-800">Para Yatırma</Badge>
                            </>
                          ) : (
                            <>
                              <ArrowDownCircle className="w-4 h-4 text-red-600" />
                              <Badge className="bg-red-100 text-red-800">Para Çekme</Badge>
                            </>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Banknote className="w-4 h-4 text-gray-400" />
                          <span
                            className={`font-medium ${
                              transaction.type === 'deposit' ? 'text-green-600' : 'text-red-600'
                            }`}
                          >
                            {transaction.type === 'deposit' ? '+' : '-'}₺
                            {transaction.amount.toLocaleString('tr-TR')}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">{transaction.description}</span>
                      </TableCell>
                      <TableCell>
                        {transaction.recipientName ? (
                          <div>
                            <p className="font-medium text-sm">{transaction.recipientName}</p>
                            <p className="text-xs text-muted-foreground">
                              {transaction.recipientId}
                            </p>
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">{transaction.operator}</span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4 text-gray-400" />
                          <span className="font-medium">
                            ₺{transaction.balance.toLocaleString('tr-TR')}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <FileText className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
}
