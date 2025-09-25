import { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import {
  BarChart,
  TrendingUp,
  FileText,
  Calendar,
  DollarSign,
  Users,
  Download,
} from 'lucide-react';

export default function LegalReportsPage() {
  const [activeTab, setActiveTab] = useState('overview');

  const stats = {
    totalCases: 45,
    activeCases: 18,
    wonCases: 12,
    totalCosts: 125000,
    avgDuration: 8,
    successRate: 73,
  };

  return (
    <div className="flex-1 space-y-4 p-4 sm:space-y-6 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-medium">Hukuki Raporlar</h1>
          <p className="text-muted-foreground mt-1">Hukuki süreçler analizi ve raporlama</p>
        </div>
        <Button className="gap-2 w-full sm:w-auto">
          <Download className="w-4 h-4" />
          Rapor İndir
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Toplam Dava</p>
                <p className="text-2xl font-medium">{stats.totalCases}</p>
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
                <p className="text-2xl font-medium text-blue-600">{stats.activeCases}</p>
              </div>
              <TrendingUp className="w-5 h-5 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Kazanılan</p>
                <p className="text-2xl font-medium text-green-600">{stats.wonCases}</p>
              </div>
              <BarChart className="w-5 h-5 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Başarı %</p>
                <p className="text-2xl font-medium text-purple-600">{stats.successRate}</p>
              </div>
              <Users className="w-5 h-5 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Toplam Maliyet</p>
                <p className="text-lg font-medium text-red-600">
                  ₺{stats.totalCosts.toLocaleString()}
                </p>
              </div>
              <DollarSign className="w-5 h-5 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Ort. Süre</p>
                <p className="text-2xl font-medium text-orange-600">{stats.avgDuration}</p>
                <p className="text-xs text-orange-600">ay</p>
              </div>
              <Calendar className="w-5 h-5 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Genel</TabsTrigger>
          <TabsTrigger value="cases">Davalar</TabsTrigger>
          <TabsTrigger value="lawyers">Avukatlar</TabsTrigger>
          <TabsTrigger value="costs">Maliyetler</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Aylık Dava Dağılımı</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center text-muted-foreground py-12">
                  Grafik verileri yükleniyor...
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Dava Türleri</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">İş Hukuku</span>
                      <Badge>15 dava</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Aile Hukuku</span>
                      <Badge>12 dava</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Ceza Hukuku</span>
                      <Badge>8 dava</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Medeni Hukuk</span>
                      <Badge>6 dava</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">İdare Hukuku</span>
                      <Badge>4 dava</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Dava Sonuçları</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Kazanılan</span>
                      <Badge className="bg-green-50 text-green-700">12 dava</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Devam Eden</span>
                      <Badge className="bg-blue-50 text-blue-700">18 dava</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Uzlaşma</span>
                      <Badge className="bg-yellow-50 text-yellow-700">8 dava</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Kaybedilen</span>
                      <Badge className="bg-red-50 text-red-700">4 dava</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Askıda</span>
                      <Badge className="bg-gray-50 text-gray-700">3 dava</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="cases" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Dava Detayları Raporu</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center text-muted-foreground py-12">
                Detaylı dava raporları hazırlanıyor...
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="lawyers" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Avukat Performans Raporu</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center text-muted-foreground py-12">
                Avukat performans verileri analiz ediliyor...
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="costs" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Maliyet Analizi</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center text-muted-foreground py-12">
                Maliyet raporları hazırlanıyor...
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
