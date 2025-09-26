/**
 * @fileoverview QuickStats Module - Application module
 * 
 * @author Dernek Yönetim Sistemi Team
 * @version 1.0.0
 */

import { TrendingUp, TrendingDown } from 'lucide-react';
import { Card, CardContent } from './ui/card';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'increase' | 'decrease';
  icon: React.ReactNode;
  color: string;
  format?: 'currency' | 'number' | 'percentage';
}

/**
 * StatCard function
 * 
 * @param {Object} params - Function parameters
 * @returns {void} Nothing
 */
export function StatCard({
  title,
  value,
  change,
  changeType,
  icon,
  color,
  format = 'number',
}: StatCardProps) {
  const formatValue = (val: string | number) => {
    if (typeof val === 'string') return val;

    switch (format) {
      case 'currency':
        return `₺${val.toLocaleString()}`;
      case 'percentage':
        return `%${val}`;
      case 'number':
      default:
        return val.toLocaleString();
    }
  };

  return (
    <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-0 shadow-md overflow-hidden group">
      <CardContent className="p-0">
        <div className="flex items-center">
          <div className="p-4 flex-1">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600 truncate">{title}</h3>
              <div
                className={`p-2 rounded-lg ${color} group-hover:scale-110 transition-transform duration-200`}
              >
                {icon}
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">{formatValue(value)}</div>
            {change && (
              <div className="flex items-center text-sm">
                {changeType === 'increase' ? (
                  <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
                )}
                <span className={changeType === 'increase' ? 'text-green-600' : 'text-red-600'}>
                  {change}
                </span>
                <span className="text-gray-500 ml-1">bu ay</span>
              </div>
            )}
          </div>
          <div
            className={`w-1 h-full ${color.replace('bg-gradient-to-br', 'bg-gradient-to-b')} opacity-60`}
          />
        </div>
      </CardContent>
    </Card>
  );
}
