/**
 * @fileoverview InteractiveChart Module - Application module
 *
 * @author Dernek Yönetim Sistemi Team
 * @version 1.0.0
 */

import React, { useState, useMemo, memo, useCallback } from 'react';
// Optimized selective imports from recharts
import {
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Badge } from './badge';
import { Button } from './button';
import {
  BarChart3,
  LineChart as LineChartIcon,
  PieChart as PieChartIcon,
  TrendingUp,
  Download,
  Maximize2,
} from 'lucide-react';

/**
 * ChartDataPoint Interface
 *
 * @interface ChartDataPoint
 */
export interface ChartDataPoint {
  name: string;
  value: number;
  category?: string;
  date?: string;
  [key: string]: any;
}

interface InteractiveChartProps {
  title: string;
  description?: string;
  data: ChartDataPoint[];
  type?: 'line' | 'area' | 'bar' | 'pie';
  height?: number;
  color?: string;
  showControls?: boolean;
  showExport?: boolean;
  className?: string;
  loading?: boolean;
}

const COLORS = {
  primary: '#2563eb',
  secondary: '#10b981',
  accent: '#f59e0b',
  danger: '#ef4444',
  purple: '#8b5cf6',
};

const PIE_COLORS = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

const CustomTooltip = memo(({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div className="bg-white p-4 rounded-lg shadow-xl border border-gray-200/50 backdrop-blur-sm">
        <p className="font-semibold text-gray-900 mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-sm text-gray-600">
              {entry.name}: <span className="font-medium text-gray-900">{entry.value}</span>
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
});

/**
 * InteractiveChart function - Optimized with React.memo
 *
 * @param {Object} params - Function parameters
 * @returns {void} Nothing
 */
export const InteractiveChart = memo(({
  title,
  description,
  data,
  type = 'line',
  height = 300,
  color = COLORS.primary,
  showControls = true,
  showExport = true,
  className = '',
  loading = false,
}: InteractiveChartProps) => {
  const [activeType, setActiveType] = useState(type);
  const [isExpanded, setIsExpanded] = useState(false);

  const chartTypes = useMemo(() => [
    { key: 'line', icon: LineChartIcon, label: 'Çizgi' },
    { key: 'area', icon: BarChart3, label: 'Alan' },
    { key: 'bar', icon: BarChart3, label: 'Çubuk' },
    { key: 'pie', icon: PieChartIcon, label: 'Pasta' },
  ], []);

  const processedData = useMemo(() => {
    if (!data || data.length === 0) return [];

    return data.map((item) => ({
      ...item,
      value: typeof item.value === 'number' ? item.value : 0,
    }));
  }, [data]);

  const handleTypeChange = useCallback((newType: string) => {
    setActiveType(newType as any);
  }, []);

  const handleToggleExpanded = useCallback(() => {
    setIsExpanded(prev => !prev);
  }, []);

  const renderChart = useMemo(() => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="animate-pulse space-y-4 w-full">
            <div className="h-4 bg-gray-200 rounded w-3/4" />
            <div className="space-y-2">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="h-3 bg-gray-200 rounded"
                  style={{ width: `${60 + Math.random() * 40}%` }}
                />
              ))}
            </div>
          </div>
        </div>
      );
    }

    const chartProps = {
      data: processedData,
      margin: { top: 20, right: 30, left: 20, bottom: 20 },
    };

    switch (activeType) {
      case 'area':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart {...chartProps}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" stroke="#666" />
              <YAxis stroke="#666" />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="value"
                stroke={color}
                fill={color}
                fillOpacity={0.3}
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        );

      case 'bar':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart {...chartProps}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" stroke="#666" />
              <YAxis stroke="#666" />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" fill={color} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        );

      case 'pie':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={processedData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}`}
              >
                {processedData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        );

      default: // line
        return (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart {...chartProps}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" stroke="#666" />
              <YAxis stroke="#666" />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="value"
                stroke={color}
                strokeWidth={2}
                dot={{ fill: color, strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: color, strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        );
    }
  }, [loading, processedData, activeType, color]);

  // Handle empty data state
  if (!loading && !processedData.length) {
    return (
      <Card className={`border border-gray-200 shadow-md ${className}`}>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
              {description && <p className="text-sm text-gray-600 mt-1">{description}</p>}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 text-gray-500">
            <div className="text-center">
              <BarChart3 className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p className="text-sm">Görüntülenecek veri yok</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const handleExport = () => {
    // Export implementation
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      `Ad,Değer\n${processedData.map((row) => `${row.name},${row.value}`).join('\n')}`;

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${title.toLowerCase().replace(/\s+/g, '_')}_data.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className={`w-full ${className}`}>
      <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                {title}
                <TrendingUp className="w-4 h-4 text-emerald-500" />
              </CardTitle>
              {description && <p className="text-sm text-gray-600">{description}</p>}
            </div>

            <div className="flex items-center gap-2">
              {showExport && (
                <Button variant="outline" size="sm" onClick={handleExport} className="h-8 px-3">
                  <Download className="w-3 h-3 mr-1" />
                  Dışa Aktar
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={handleToggleExpanded}
                className="h-8 px-3"
              >
                <Maximize2 className="w-3 h-3" />
              </Button>
            </div>
          </div>

          {showControls && (
            <div className="flex items-center gap-2 pt-3">
              {chartTypes.map(({ key, icon: Icon, label }) => (
                <Badge
                  key={key}
                  variant={activeType === key ? 'default' : 'outline'}
                  className={`cursor-pointer transition-all duration-200 hover:scale-105 ${
                    activeType === key ? 'bg-primary text-white' : 'hover:bg-gray-50'
                  }`}
                  onClick={() => { handleTypeChange(key); }}
                >
                  <Icon className="w-3 h-3 mr-1" />
                  {label}
                </Badge>
              ))}
            </div>
          )}
        </CardHeader>

        <CardContent className="pt-0">
          <div
            className="transition-all duration-300"
            style={{ height: isExpanded ? height * 1.5 : height }}
          >
            {renderChart}
          </div>
        </CardContent>
      </Card>
    </div>
  );
});

export default InteractiveChart;
