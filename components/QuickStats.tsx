/**
 * @fileoverview QuickStats Module - Application module
 *
 * @author Dernek Yönetim Sistemi Team
 * @version 1.0.0
 */

import { TrendingUp, TrendingDown } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { Heading } from './ui/heading';
import { Text } from './ui/text';

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
              <Heading level={3} size="sm" weight="medium" color="neutral" className="truncate">{title}</Heading>
              <div
                className={`p-2 rounded-lg ${color} group-hover:scale-110 transition-transform duration-200`}
              >
                {icon}
              </div>
            </div>
            <Heading level={4} size="2xl" weight="bold" className="tabular-nums mb-1">{formatValue(value)}</Heading>
            {change && (
              <div className="flex items-center text-sm">
                {changeType === 'increase' ? (
                  <TrendingUp className="w-4 h-4 text-success-500 mr-1" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-error-500 mr-1" />
                )}
                <Text size="xs" weight="semibold" color={changeType === 'increase' ? 'success' : 'error'}>
                  {change}
                </Text>
                <Text size="xs" color="muted" className="ml-1">bu ay</Text>
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
