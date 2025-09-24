import { CreditCard, DollarSign, PiggyBank, TrendingDown, TrendingUp, Wallet } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Progress } from '../ui/progress';

interface BeneficiaryFinancialProps {
  beneficiary: any;
  editMode: boolean;
  onUpdate: (field: string, value: any) => void;
}

export function BeneficiaryFinancial({
  beneficiary,
  editMode,
  onUpdate,
}: BeneficiaryFinancialProps) {
  const monthlyIncome = beneficiary?.monthlyIncome || 0;
  const monthlyExpenses = beneficiary?.monthlyExpenses || 0;
  const savings = beneficiary?.savings || 0;
  const debts = beneficiary?.debts || 0;

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

        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <TrendingUp className="w-8 h-8 mx-auto mb-2 text-green-600" />
              <p className="text-2xl font-bold text-green-600">
                {monthlyIncome.toLocaleString('tr-TR')} ₺
              </p>
              <p className="text-sm text-gray-600">Aylık Gelir</p>
            </div>

            <div className="text-center p-4 bg-red-50 rounded-lg">
              <TrendingDown className="w-8 h-8 mx-auto mb-2 text-red-600" />
              <p className="text-2xl font-bold text-red-600">
                {monthlyExpenses.toLocaleString('tr-TR')} ₺
              </p>
              <p className="text-sm text-gray-600">Aylık Gider</p>
            </div>
          </div>

          <div className="p-4 border rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Net Durum</span>
              <Badge
                variant={
                  financialHealth === 'positive'
                    ? 'default'
                    : financialHealth === 'neutral'
                      ? 'secondary'
                      : 'destructive'
                }
              >
                {netIncome.toLocaleString('tr-TR')} ₺
              </Badge>
            </div>
            <Progress
              value={Math.min(100, Math.max(0, (netIncome / monthlyIncome) * 100))}
              className="h-2"
            />
          </div>

          {savings > 0 && (
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2">
                <PiggyBank className="w-5 h-5 text-blue-600" />
                <span className="font-medium">Birikimler</span>
              </div>
              <span className="font-bold text-blue-600">{savings.toLocaleString('tr-TR')} ₺</span>
            </div>
          )}

          {debts > 0 && (
            <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-orange-600" />
                <span className="font-medium">Borçlar</span>
              </div>
              <span className="font-bold text-orange-600">{debts.toLocaleString('tr-TR')} ₺</span>
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
                value={beneficiary?.incomeSource || ''}
                onChange={(e) => {
                  onUpdate('incomeSource', e.target.value);
                }}
                placeholder="Gelir kaynağı (maaş, emekli maaşı, vb.)"
              />
            ) : (
              <p className="p-2 text-sm">{beneficiary?.incomeSource || '-'}</p>
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
