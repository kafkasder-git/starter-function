/**
 * @fileoverview BeneficiaryAidHistory Module - Application module
 * 
 * @author Dernek Yönetim Sistemi Team
 * @version 1.0.0
 */

import { Calendar, DollarSign, FileText, Gift, HandHeart, Heart, Package } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';

interface AidRecord {
  id: string;
  date: string;
  type: 'Nakdi' | 'Ayni' | 'Hizmet';
  category: string;
  amount?: number;
  description: string;
  status: 'Tamamlandı' | 'Beklemede' | 'İptal';
  approvedBy: string;
}

interface BeneficiaryAidHistoryProps {
  beneficiaryId: string;
  aidHistory?: AidRecord[];
}

/**
 * BeneficiaryAidHistory function
 * 
 * @param {Object} params - Function parameters
 * @returns {void} Nothing
 */
export function BeneficiaryAidHistory({
  beneficiaryId: _beneficiaryId,
  aidHistory = [],
}: BeneficiaryAidHistoryProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  // Fallback data if no aid history provided
  const fallbackAidHistory: AidRecord[] = [
    {
      id: '1',
      date: '2024-01-15',
      type: 'Nakdi',
      category: 'Gıda Yardımı',
      amount: 500,
      description: 'Aylık gıda desteği',
      status: 'Tamamlandı',
      approvedBy: 'Ahmet Yılmaz',
    },
    {
      id: '2',
      date: '2024-02-01',
      type: 'Ayni',
      category: 'Giyim Yardımı',
      description: 'Kış kıyafetleri paketi',
      status: 'Tamamlandı',
      approvedBy: 'Fatma Demir',
    },
    {
      id: '3',
      date: '2024-02-15',
      type: 'Hizmet',
      category: 'Sağlık Hizmeti',
      description: 'Hastane sevk işlemi',
      status: 'Beklemede',
      approvedBy: 'Dr. Mehmet Öz',
    },
  ];

  const records = aidHistory.length > 0 ? aidHistory : fallbackAidHistory;

  const filteredRecords = records.filter((record) => {
    const matchesSearch =
      record.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || record.type === filterType;
    const matchesStatus = filterStatus === 'all' || record.status === filterStatus;

    return matchesSearch && matchesType && matchesStatus;
  });

  const totalCashAid = records
    .filter((record) => record.type === 'Nakdi' && record.amount)
    .reduce((total, record) => total + (record.amount ?? 0), 0);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Nakdi':
        return <DollarSign className="w-4 h-4" />;
      case 'Ayni':
        return <Package className="w-4 h-4" />;
      case 'Hizmet':
        return <Heart className="w-4 h-4" />;
      default:
        return <Gift className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Tamamlandı':
        return 'default';
      case 'Beklemede':
        return 'secondary';
      case 'İptal':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      {/* Yardım Özeti */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <HandHeart className="w-8 h-8 mx-auto mb-2 text-primary" />
            <p className="text-2xl font-bold">{records.length}</p>
            <p className="text-sm text-gray-600">Toplam Yardım</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <DollarSign className="w-8 h-8 mx-auto mb-2 text-green-600" />
            <p className="text-2xl font-bold">{totalCashAid.toLocaleString('tr-TR')} ₺</p>
            <p className="text-sm text-gray-600">Nakdi Yardım</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Package className="w-8 h-8 mx-auto mb-2 text-blue-600" />
            <p className="text-2xl font-bold">{records.filter((r) => r.type === 'Ayni').length}</p>
            <p className="text-sm text-gray-600">Ayni Yardım</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Heart className="w-8 h-8 mx-auto mb-2 text-red-600" />
            <p className="text-2xl font-bold">
              {records.filter((r) => r.type === 'Hizmet').length}
            </p>
            <p className="text-sm text-gray-600">Hizmet Yardımı</p>
          </CardContent>
        </Card>
      </div>

      {/* Yardım Geçmişi */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Yardım Geçmişi
            </CardTitle>
            <div className="flex items-center gap-2">
              <Input
                placeholder="Yardım ara..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                }}
                className="w-48"
              />
              <select
                value={filterType}
                onChange={(e) => {
                  setFilterType(e.target.value);
                }}
                className="px-3 py-2 border rounded-md text-sm"
              >
                <option value="all">Tüm Türler</option>
                <option value="Nakdi">Nakdi</option>
                <option value="Ayni">Ayni</option>
                <option value="Hizmet">Hizmet</option>
              </select>
              <select
                value={filterStatus}
                onChange={(e) => {
                  setFilterStatus(e.target.value);
                }}
                className="px-3 py-2 border rounded-md text-sm"
              >
                <option value="all">Tüm Durumlar</option>
                <option value="Tamamlandı">Tamamlandı</option>
                <option value="Beklemede">Beklemede</option>
                <option value="İptal">İptal</option>
              </select>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {filteredRecords.length > 0 ? (
            <div className="space-y-3">
              {filteredRecords.map((record) => (
                <div
                  key={record.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-100 rounded-full">{getTypeIcon(record.type)}</div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium">{record.category}</h4>
                        <Badge variant="outline" className="text-xs">
                          {record.type}
                        </Badge>
                        <Badge variant={getStatusColor(record.status) as any} className="text-xs">
                          {record.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">{record.description}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(record.date).toLocaleDateString('tr-TR')}
                        </span>
                        <span>Onaylayan: {record.approvedBy}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    {record.amount && (
                      <p className="font-bold text-green-600">
                        {record.amount.toLocaleString('tr-TR')} ₺
                      </p>
                    )}
                    <Button variant="ghost" size="sm" className="mt-1">
                      <FileText className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <HandHeart className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>Yardım geçmişi bulunmuyor</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
