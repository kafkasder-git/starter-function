import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Truck, DollarSign, CheckCircle, Star, Plus } from 'lucide-react';

const mockSuppliers = [
  {
    id: 1,
    name: 'ABC Gıda San. Tic. Ltd. Şti.',
    category: 'Gıda',
    contactPerson: 'Mehmet Yılmaz',
    status: 'Aktif',
    rating: 4.5,
    totalOrders: 45,
    totalAmount: 125000,
  },
  {
    id: 2,
    name: 'Tekstil Dünyası A.Ş.',
    category: 'Giyim',
    contactPerson: 'Fatma Demir',
    status: 'Aktif',
    rating: 4.2,
    totalOrders: 28,
    totalAmount: 85000,
  },
];

export function PartnerSuppliersPage() {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const totalAmount = mockSuppliers.reduce((sum, supplier) => sum + supplier.totalAmount, 0);
  const activeSuppliers = mockSuppliers.filter((s) => s.status === 'Aktif').length;
  const topSuppliers = mockSuppliers.filter((s) => s.rating >= 4.5).length;

  return (
    <div className="flex-1 space-y-4 p-4 sm:space-y-6 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-medium">Tedarikçiler</h1>
          <p className="text-muted-foreground mt-1">Tedarikçi yönetimi ve satın alma ilişkileri</p>
        </div>
        <Button className="gap-2 w-full sm:w-auto">
          <Plus className="w-4 h-4" />
          Yeni Tedarikçi
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Toplam Harcama</p>
                <p className="text-xl font-medium text-green-600">{formatCurrency(totalAmount)}</p>
              </div>
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Aktif Tedarikçi</p>
                <p className="text-2xl font-medium text-blue-600">{activeSuppliers}</p>
              </div>
              <CheckCircle className="w-5 h-5 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Toplam Tedarikçi</p>
                <p className="text-2xl font-medium">{mockSuppliers.length}</p>
              </div>
              <Truck className="w-5 h-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">En İyi</p>
                <p className="text-2xl font-medium text-orange-600">{topSuppliers}</p>
              </div>
              <Star className="w-5 h-5 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Suppliers List */}
      <div className="grid gap-4">
        {mockSuppliers.map((supplier) => (
          <Card key={supplier.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-lg font-medium">{supplier.name}</CardTitle>
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <Badge
                      variant="outline"
                      className="bg-green-50 text-green-700 border-green-200 text-xs px-2 py-1"
                    >
                      {supplier.status}
                    </Badge>
                    <Badge className="bg-green-50 text-green-700 text-xs px-2 py-1 border-0">
                      {supplier.category}
                    </Badge>
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 text-yellow-500 fill-current" />
                      <span className="text-xs font-medium text-green-600">{supplier.rating}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent className="pt-0">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-sm font-medium text-green-800">
                    {formatCurrency(supplier.totalAmount)}
                  </div>
                  <div className="text-xs text-green-600">Toplam Tutar</div>
                </div>

                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-sm font-medium text-blue-800">{supplier.totalOrders}</div>
                  <div className="text-xs text-blue-600">Sipariş Sayısı</div>
                </div>

                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <div className="text-sm font-medium text-purple-800">
                    {supplier.contactPerson}
                  </div>
                  <div className="text-xs text-purple-600">İletişim Kişisi</div>
                </div>

                <div className="text-center p-3 bg-orange-50 rounded-lg">
                  <div className="text-sm font-medium text-orange-800">{supplier.rating}</div>
                  <div className="text-xs text-orange-600">Değerlendirme</div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
