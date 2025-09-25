import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { FileText, CheckCircle, Clock, AlertTriangle, Plus } from 'lucide-react';

const mockAgreements = [
  {
    id: 1,
    title: 'Sosyal Yardım İşbirliği Protokolü',
    type: 'Protokol',
    partnerName: 'Ankara Büyükşehir Belediyesi',
    partnerType: 'Kamu',
    status: 'Aktif',
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    progress: 75,
  },
  {
    id: 2,
    title: 'Eğitim Desteği İşbirliği Anlaşması',
    type: 'Anlaşma',
    partnerName: 'Milli Eğitim İl Müdürlüğü',
    partnerType: 'Kamu',
    status: 'Aktif',
    startDate: '2023-09-01',
    endDate: '2025-08-31',
    progress: 60,
  },
  {
    id: 3,
    title: 'Uluslararası Proje İşbirliği MOU',
    type: 'MOU',
    partnerName: 'European Development Fund',
    partnerType: 'Uluslararası',
    status: 'Aktif',
    startDate: '2024-01-01',
    endDate: '2026-12-31',
    progress: 45,
  },
];

export function PartnerAgreementsPage() {
  const activeAgreements = mockAgreements.filter((a) => a.status === 'Aktif').length;

  const expiringAgreements = mockAgreements.filter((a) => {
    const endDate = new Date(a.endDate);
    const now = new Date();
    const monthsUntilExpiry = (endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 30);
    return monthsUntilExpiry <= 3 && monthsUntilExpiry > 0;
  }).length;

  const getStatusBadge = (status: string) => {
    const config = {
      Aktif: { label: 'Aktif', className: 'bg-green-50 text-green-700 border-green-200' },
      'Süresi Dolmuş': {
        label: 'Süresi Dolmuş',
        className: 'bg-red-50 text-red-700 border-red-200',
      },
      'Yenileme Bekliyor': {
        label: 'Yenileme Bekliyor',
        className: 'bg-yellow-50 text-yellow-700 border-yellow-200',
      },
    };

    const { label, className } = config[status as keyof typeof config] || config.Aktif;
    return (
      <Badge variant="outline" className={`${className} text-xs px-2 py-1`}>
        {label}
      </Badge>
    );
  };

  const getTypeBadge = (type: string) => {
    const config = {
      MOU: { label: 'MOU', className: 'bg-purple-50 text-purple-700' },
      Protokol: { label: 'Protokol', className: 'bg-blue-50 text-blue-700' },
      Sözleşme: { label: 'Sözleşme', className: 'bg-green-50 text-green-700' },
      Anlaşma: { label: 'Anlaşma', className: 'bg-orange-50 text-orange-700' },
    };

    const { label, className } = config[type as keyof typeof config] || config['Anlaşma'];
    return <Badge className={`${className} text-xs px-2 py-1 border-0`}>{label}</Badge>;
  };

  const getRemainingTime = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    const diff = end.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

    if (days < 0) return `${Math.abs(days)} gün geçti`;
    if (days === 0) return 'Bugün bitiyor';
    if (days === 1) return 'Yarın bitiyor';
    if (days <= 30) return `${days} gün kaldı`;

    const months = Math.ceil(days / 30);
    return `${months} ay kaldı`;
  };

  return (
    <div className="flex-1 space-y-4 p-4 sm:space-y-6 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-medium">İş Birliği Anlaşmaları</h1>
          <p className="text-muted-foreground mt-1">Protokol, sözleşme ve anlaşma yönetimi</p>
        </div>
        <Button className="gap-2 w-full sm:w-auto">
          <Plus className="w-4 h-4" />
          Yeni Anlaşma
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Toplam Anlaşma</p>
                <p className="text-2xl font-medium">{mockAgreements.length}</p>
              </div>
              <FileText className="w-5 h-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Aktif</p>
                <p className="text-2xl font-medium text-green-600">{activeAgreements}</p>
              </div>
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Süresi Yaklaşan</p>
                <p className="text-2xl font-medium text-orange-600">{expiringAgreements}</p>
              </div>
              <Clock className="w-5 h-5 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Yenileme</p>
                <p className="text-2xl font-medium text-blue-600">1</p>
              </div>
              <AlertTriangle className="w-5 h-5 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Agreements List */}
      <div className="grid gap-4">
        {mockAgreements.map((agreement) => (
          <Card key={agreement.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-lg font-medium">{agreement.title}</CardTitle>
                  <p className="text-muted-foreground mt-1">{agreement.partnerName}</p>
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    {getStatusBadge(agreement.status)}
                    {getTypeBadge(agreement.type)}
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent className="pt-0">
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="text-sm">
                    <span className="text-muted-foreground">Başlangıç:</span>{' '}
                    {new Date(agreement.startDate).toLocaleDateString('tr-TR')}
                  </div>
                  <div className="text-sm">
                    <span className="text-muted-foreground">Bitiş:</span>{' '}
                    {new Date(agreement.endDate).toLocaleDateString('tr-TR')}
                  </div>
                  <div className="text-sm">
                    <span className="text-muted-foreground">Kalan Süre:</span>{' '}
                    {getRemainingTime(agreement.endDate)}
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>İlerleme</span>
                    <span>{agreement.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${agreement.progress}%` }}
                     />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
