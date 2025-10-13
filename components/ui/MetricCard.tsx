/**
 * @fileoverview MetricCard Module - Application module
 *
 * @author Dernek Yönetim Sistemi Team
 * @version 1.0.0
 */

import React, { memo } from 'react';
import { TrendingUp, TrendingDown, Activity } from 'lucide-react';
import { Card, CardContent } from './card';
import { Heading } from './heading';
import { Text } from './text';

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    type: 'increase' | 'decrease';
    period: string;
  };
  icon: React.ReactNode;
  color: 'blue' | 'green' | 'purple' | 'orange' | 'red';
  loading?: boolean;
  onClick?: () => void;
}

const colorClasses = {
  blue: {
    bg: 'bg-blue-600',
    light: 'bg-blue-50',
    text: 'text-blue-700',
    ring: 'ring-blue-500/20',
  },
  green: {
    bg: 'bg-green-600',
    light: 'bg-green-50',
    text: 'text-green-700',
    ring: 'ring-green-500/20',
  },
  purple: {
    bg: 'bg-purple-600',
    light: 'bg-purple-50',
    text: 'text-purple-700',
    ring: 'ring-purple-500/20',
  },
  orange: {
    bg: 'bg-orange-600',
    light: 'bg-orange-50',
    text: 'text-orange-700',
    ring: 'ring-orange-500/20',
  },
  red: {
    bg: 'bg-red-600',
    light: 'bg-red-50',
    text: 'text-red-700',
    ring: 'ring-red-500/20',
  },
};

/**
 * MetricCard function - Optimized with React.memo
 *
 * @param {Object} params - Function parameters
 * @returns {void} Nothing
 */
export const MetricCard = memo(({
  title,
  value,
  change,
  icon,
  color,
  loading,
  onClick,
}: MetricCardProps) => {
  const colors = colorClasses[color];

  const CardWrapper = onClick ? 'button' : 'div';

  return (
    <CardWrapper
      className={`w-full text-left ${onClick ? `cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 ${colors.ring} hover:scale-[1.02] hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-150` : ''}`}
      onClick={onClick}
    >
      <Card className="h-full border border-gray-200 shadow-md hover:shadow-lg transition-all duration-200 bg-white dark:border-gray-700 dark:bg-gray-900">
        <CardContent className="p-6">
          {loading ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="h-4 bg-gray-200 rounded w-20 animate-pulse" />
                <div className="w-10 h-10 bg-gray-200 rounded-lg animate-pulse" />
              </div>
              <div className="h-8 bg-gray-200 rounded w-16 animate-pulse" />
              <div className="h-4 bg-gray-200 rounded w-12 animate-pulse" />
            </div>
          ) : (
            <div className="space-y-4">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <Text variant="label" size="sm" color="neutral" className="leading-tight">{title}</Text>
                  <div className="flex items-baseline gap-2">
                    <Heading as="span" level={3} size="2xl" weight="bold" className="tabular-nums">
                      {value}
                    </Heading>
                  </div>
                </div>

                <div className={`p-3 rounded-xl ${colors.bg} shadow-lg hover:scale-110 transition-transform duration-150`}>
                  <div className="text-white">{icon}</div>
                </div>
              </div>

              {/* Change Indicator */}
              {change && (
                <div className="flex items-center gap-2">
                  <div
                    className={`flex items-center gap-1 px-2 py-1 rounded-full ${
                      change.type === 'increase'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {change.type === 'increase' ? (
                      <TrendingUp className="w-3 h-3" />
                    ) : (
                      <TrendingDown className="w-3 h-3" />
                    )}
                    <Text weight="semibold" size="xs">{Math.abs(change.value)}%</Text>
                  </div>
                  <Text size="xs" color="muted">{change.period}</Text>
                </div>
              )}

              {/* Activity Indicator */}
              <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                <Activity className="w-3 h-3 text-gray-400" />
                <Text size="xs" color="muted">
                  Güncellendi:{' '}
                  {new Date().toLocaleTimeString('tr-TR', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </CardWrapper>
  );
});

export default MetricCard;
