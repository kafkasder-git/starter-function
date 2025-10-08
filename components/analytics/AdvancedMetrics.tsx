/**
 * @fileoverview Advanced Metrics Dashboard Component
 * @description Real-time analytics and metrics visualization
 */

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface MetricData {
  label: string;
  value: number;
  change: number;
  trend: 'up' | 'down' | 'stable';
}

interface ChartData {
  name: string;
  value: number;
  [key: string]: string | number;
}

export function AdvancedMetrics() {
  const [metrics] = useState<MetricData[]>([
    { label: 'Toplam Bağış', value: 125430, change: 18, trend: 'up' },
    { label: 'Aktif Üye', value: 1234, change: 5, trend: 'up' },
    { label: 'Yardım Başvurusu', value: 42, change: -3, trend: 'down' },
    { label: 'Kampanya', value: 8, change: 0, trend: 'stable' },
  ]);

  const [donationTrend] = useState<ChartData[]>([
    { name: 'Oca', value: 12000 },
    { name: 'Şub', value: 15000 },
    { name: 'Mar', value: 18000 },
    { name: 'Nis', value: 16000 },
    { name: 'May', value: 22000 },
    { name: 'Haz', value: 25000 },
  ]);

  const [categoryData] = useState<ChartData[]>([
    { name: 'Nakit', value: 45000 },
    { name: 'Zekat', value: 35000 },
    { name: 'Fitre', value: 15000 },
    { name: 'Sadaka', value: 20000 },
    { name: 'Kurban', value: 10000 },
  ]);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return '↑';
      case 'down':
        return '↓';
      case 'stable':
        return '→';
      default:
        return '→';
    }
  };

  const getTrendColor = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      case 'stable':
        return 'text-gray-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric, index) => (
          <Card key={index}>
            <CardHeader className="pb-2">
              <CardDescription>{metric.label}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {metric.label.includes('Bağış') 
                  ? formatCurrency(metric.value)
                  : metric.value.toLocaleString('tr-TR')}
              </div>
              <div className={`text-sm flex items-center gap-1 mt-1 ${getTrendColor(metric.trend)}`}>
                <span>{getTrendIcon(metric.trend)}</span>
                <span>{Math.abs(metric.change)}%</span>
                <span className="text-gray-500">son aydan</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Donation Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Bağış Trendi</CardTitle>
            <CardDescription>Son 6 aylık bağış grafiği</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={donationTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip 
                  formatter={(value: number) => formatCurrency(value)}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#8884d8" 
                  strokeWidth={2}
                  name="Bağış"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Category Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Bağış Kategorileri</CardTitle>
            <CardDescription>Kategori bazlı dağılım</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Comparison */}
      <Card>
        <CardHeader>
          <CardTitle>Aylık Karşılaştırma</CardTitle>
          <CardDescription>Gelir ve gider karşılaştırması</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={[
                { name: 'Oca', gelir: 12000, gider: 8000 },
                { name: 'Şub', gelir: 15000, gider: 9000 },
                { name: 'Mar', gelir: 18000, gider: 11000 },
                { name: 'Nis', gelir: 16000, gider: 10000 },
                { name: 'May', gelir: 22000, gider: 13000 },
                { name: 'Haz', gelir: 25000, gider: 15000 },
              ]}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value: number) => formatCurrency(value)} />
              <Legend />
              <Bar dataKey="gelir" fill="#00C49F" name="Gelir" />
              <Bar dataKey="gider" fill="#FF8042" name="Gider" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Real-time Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Son Aktiviteler</CardTitle>
          <CardDescription>Gerçek zamanlı sistem aktiviteleri</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { time: '2 dakika önce', action: 'Yeni bağış kaydedildi', amount: '₺1,500', user: 'Ahmet Y.' },
              { time: '15 dakika önce', action: 'Üye eklendi', amount: null, user: 'Ayşe D.' },
              { time: '1 saat önce', action: 'Kampanya güncellendi', amount: null, user: 'Mehmet K.' },
              { time: '2 saat önce', action: 'Yardım başvurusu onaylandı', amount: null, user: 'Fatma Ş.' },
            ].map((activity, index) => (
              <div key={index} className="flex items-center justify-between border-b pb-3 last:border-0">
                <div className="flex-1">
                  <p className="font-medium">{activity.action}</p>
                  <p className="text-sm text-gray-500">{activity.time} • {activity.user}</p>
                </div>
                {activity.amount && (
                  <div className="text-lg font-semibold text-green-600">
                    {activity.amount}
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default AdvancedMetrics;
