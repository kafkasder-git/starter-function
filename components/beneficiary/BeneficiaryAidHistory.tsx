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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="shadow-sm border-0 bg-gradient-to-br from-blue-50 to-indigo-50">
          <CardContent className="p-6 text-center">
            <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mx-auto mb-4">
              <HandHeart className="w-6 h-6 text-blue-600" />
            </div>
            <p className="text-3xl font-bold text-blue-700 mb-1">{records.length}</p>
            <p className="text-sm font-medium text-blue-600">Toplam Yardım</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-0 bg-gradient-to-br from-green-50 to-emerald-50">
          <CardContent className="p-6 text-center">
            <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mx-auto mb-4">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <p className="text-3xl font-bold text-green-700 mb-1">{totalCashAid.toLocaleString('tr-TR')} ₺</p>
            <p className="text-sm font-medium text-green-600">Nakdi Yardım</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-0 bg-gradient-to-br from-purple-50 to-violet-50">
          <CardContent className="p-6 text-center">
            <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-full mx-auto mb-4">
              <Package className="w-6 h-6 text-purple-600" />
            </div>
            <p className="text-3xl font-bold text-purple-700 mb-1">{records.filter((r) => r.type === 'Ayni').length}</p>
            <p className="text-sm font-medium text-purple-600">Ayni Yardım</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-0 bg-gradient-to-br from-red-50 to-rose-50">
          <CardContent className="p-6 text-center">
            <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mx-auto mb-4">
              <Heart className="w-6 h-6 text-red-600" />
            </div>
            <p className="text-3xl font-bold text-red-700 mb-1">
              {records.filter((r) => r.type === 'Hizmet').length}
            </p>
            <p className="text-sm font-medium text-red-600">Hizmet Yardımı</p>
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
            <div className="space-y-4">
              {filteredRecords.map((record) => (
                <div
                  key={record.id}
                  className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-200"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full">
                      {getTypeIcon(record.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-semibold text-gray-900 text-lg">{record.category}</h4>
                        <Badge 
                          variant="outline" 
                          className="text-xs font-medium px-2 py-1 bg-blue-50 text-blue-700 border-blue-200"
                        >
                          {record.type}
                        </Badge>
                        <Badge 
                          variant={getStatusColor(record.status) as any} 
                          className={`text-xs font-medium px-2 py-1 ${
                            record.status === 'Tamamlandı' 
                              ? 'bg-green-100 text-green-700 border-green-200'
                              : record.status === 'Beklemede'
                                ? 'bg-yellow-100 text-yellow-700 border-yellow-200'
                                : 'bg-red-100 text-red-700 border-red-200'
                          }`}
                        >
                          {record.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{record.description}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
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
                      <div className="mb-2">
                        <p className="text-xl font-bold text-green-600">
                          {record.amount.toLocaleString('tr-TR')} ₺
                        </p>
                      </div>
                    )}
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="hover:bg-blue-50 text-blue-600 hover:text-blue-700 p-2 rounded-lg transition-all duration-200"
                    >
                      <FileText className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4">
                <HandHeart className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Yardım geçmişi bulunmuyor</h3>
              <p className="text-gray-500">Bu ihtiyaç sahibi için henüz yardım kaydı oluşturulmamış</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
