/**
 * @fileoverview BeneficiaryFinancial Module - Application module
 * 
 * @author Dernek Yönetim Sistemi Team
 * @version 1.0.0
 */

import { CreditCard, DollarSign, PiggyBank, TrendingDown, TrendingUp, Wallet } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Progress } from '../ui/progress';

interface BeneficiaryFinancialProps {
  beneficiary: {
    id: string;
    name: string;
    financialInfo?: {
      monthlyIncome?: number;
      monthlyExpenses?: number;
      assets?: number;
      debts?: number;
      bankAccount?: string;
      iban?: string;
    };
  };
  editMode: boolean;
  onUpdate: (field: string, value: string | number) => void;
}

/**
 * BeneficiaryFinancial function
 * 
 * @param {Object} params - Function parameters
 * @returns {void} Nothing
 */
export function BeneficiaryFinancial({
  beneficiary,
  editMode,
  onUpdate,
}: BeneficiaryFinancialProps) {
  const monthlyIncome = beneficiary?.monthlyIncome ?? 0;
  const monthlyExpenses = beneficiary?.monthlyExpenses ?? 0;
  const savings = beneficiary?.savings ?? 0;
  const debts = beneficiary?.debts ?? 0;

  const netIncome = monthlyIncome - monthlyExpenses;
  const financialHealth = netIncome > 0 ? 'positive' : netIncome === 0 ? 'neutral' : 'negative';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Mali Durum Özeti */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="w-5 h-5" />
            Mali Durum Özeti
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="text-center p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200 shadow-sm">
              <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mx-auto mb-4">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <p className="text-3xl font-bold text-green-700 mb-1">
                {monthlyIncome.toLocaleString('tr-TR')} ₺
              </p>
              <p className="text-sm font-medium text-green-600">Aylık Gelir</p>
            </div>

            <div className="text-center p-6 bg-gradient-to-br from-red-50 to-rose-50 rounded-xl border border-red-200 shadow-sm">
              <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mx-auto mb-4">
                <TrendingDown className="w-6 h-6 text-red-600" />
              </div>
              <p className="text-3xl font-bold text-red-700 mb-1">
                {monthlyExpenses.toLocaleString('tr-TR')} ₺
              </p>
              <p className="text-sm font-medium text-red-600">Aylık Gider</p>
            </div>
          </div>

          <div className="p-6 bg-gradient-to-r from-gray-50 to-blue-50 border border-gray-200 rounded-xl shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full">
                  <Wallet className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-900">Net Durum</h4>
                  <p className="text-sm text-gray-600">Gelir - Gider = Net</p>
                </div>
              </div>
              <Badge
                variant={
                  financialHealth === 'positive'
                    ? 'default'
                    : financialHealth === 'neutral'
                      ? 'secondary'
                      : 'destructive'
                }
                className={`px-4 py-2 text-sm font-medium ${
                  financialHealth === 'positive'
                    ? 'bg-green-100 text-green-700 border-green-200'
                    : financialHealth === 'neutral'
                      ? 'bg-yellow-100 text-yellow-700 border-yellow-200'
                      : 'bg-red-100 text-red-700 border-red-200'
                }`}
              >
                {netIncome.toLocaleString('tr-TR')} ₺
              </Badge>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Mali Durum</span>
                <span className={`font-medium ${
                  financialHealth === 'positive' ? 'text-green-600' :
                  financialHealth === 'neutral' ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {financialHealth === 'positive' ? 'Pozitif' :
                   financialHealth === 'neutral' ? 'Nötr' : 'Negatif'}
                </span>
              </div>
              <Progress
                value={Math.min(100, Math.max(0, (netIncome / monthlyIncome) * 100))}
                className="h-3 rounded-full"
              />
            </div>
          </div>

          {savings > 0 && (
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-xl shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full">
                  <PiggyBank className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <span className="font-semibold text-blue-900">Birikimler</span>
                  <p className="text-xs text-blue-600">Mevcut tasarruf</p>
                </div>
              </div>
              <span className="text-xl font-bold text-blue-700">{savings.toLocaleString('tr-TR')} ₺</span>
            </div>
          )}

          {debts > 0 && (
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-xl shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 bg-orange-100 rounded-full">
                  <CreditCard className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <span className="font-semibold text-orange-900">Borçlar</span>
                  <p className="text-xs text-orange-600">Mevcut borçlar</p>
                </div>
              </div>
              <span className="text-xl font-bold text-orange-700">{debts.toLocaleString('tr-TR')} ₺</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Gelir Detayları */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Gelir ve Gider Detayları
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="monthlyIncome">Aylık Gelir (₺)</Label>
            {editMode ? (
              <Input
                id="monthlyIncome"
                type="number"
                value={monthlyIncome}
                onChange={(e) => {
                  onUpdate('monthlyIncome', parseInt(e.target.value) || 0);
                }}
                placeholder="Aylık gelir"
                min="0"
              />
            ) : (
              <p className="p-2 text-sm">{monthlyIncome.toLocaleString('tr-TR')} ₺</p>
            )}
          </div>

          <div>
            <Label htmlFor="incomeSource">Gelir Kaynağı</Label>
            {editMode ? (
              <Input
                id="incomeSource"
                value={beneficiary?.incomeSource ?? ''}
                onChange={(e) => {
                  onUpdate('incomeSource', e.target.value);
                }}
                placeholder="Gelir kaynağı (maaş, emekli maaşı, vb.)"
              />
            ) : (
              <p className="p-2 text-sm">{beneficiary?.incomeSource ?? '-'}</p>
            )}
          </div>

          <div>
            <Label htmlFor="monthlyExpenses">Aylık Gider (₺)</Label>
            {editMode ? (
              <Input
                id="monthlyExpenses"
                type="number"
                value={monthlyExpenses}
                onChange={(e) => {
                  onUpdate('monthlyExpenses', parseInt(e.target.value) || 0);
                }}
                placeholder="Aylık gider"
                min="0"
              />
            ) : (
              <p className="p-2 text-sm">{monthlyExpenses.toLocaleString('tr-TR')} ₺</p>
            )}
          </div>

          {editMode && (
            <>
              <div>
                <Label htmlFor="savings">Birikimler (₺)</Label>
                <Input
                  id="savings"
                  type="number"
                  value={savings}
                  onChange={(e) => {
                    onUpdate('savings', parseInt(e.target.value) || 0);
                  }}
                  placeholder="Mevcut birikimler"
                  min="0"
                />
              </div>

              <div>
                <Label htmlFor="debts">Borçlar (₺)</Label>
                <Input
                  id="debts"
                  type="number"
                  value={debts}
                  onChange={(e) => {
                    onUpdate('debts', parseInt(e.target.value) || 0);
                  }}
                  placeholder="Mevcut borçlar"
                  min="0"
                />
              </div>
            </>
          )}

          {/* Mali Durum Değerlendirmesi */}
          <div className="mt-6 p-4 border rounded-lg">
            <h4 className="font-medium mb-2">Mali Durum Değerlendirmesi</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Gelir/Gider Oranı:</span>
                <Badge variant={financialHealth === 'positive' ? 'default' : 'destructive'}>
                  {monthlyExpenses > 0 ? (monthlyIncome / monthlyExpenses).toFixed(2) : '∞'}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span>Yardım İhtiyacı:</span>
                <Badge
                  variant={
                    netIncome < 0 ? 'destructive' : netIncome < 1000 ? 'secondary' : 'default'
                  }
                >
                  {netIncome < 0 ? 'Yüksek' : netIncome < 1000 ? 'Orta' : 'Düşük'}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span>Öncelik Seviyesi:</span>
                <Badge
                  variant={
                    netIncome < -1000 ? 'destructive' : netIncome < 0 ? 'secondary' : 'default'
                  }
                >
                  {netIncome < -1000 ? 'Acil' : netIncome < 0 ? 'Yüksek' : 'Normal'}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
