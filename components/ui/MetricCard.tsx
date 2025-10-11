/**
 * @fileoverview MetricCard Module - Application module
 *
 * @author Dernek Yönetim Sistemi Team
 * @version 1.0.0
 */

import React from 'react';
import { motion } from 'motion/react';
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
    bg: 'bg-info-600',
    light: 'bg-info-50',
    text: 'text-info-700',
    ring: 'ring-info-500/20',
  },
  green: {
    bg: 'bg-success-600',
    light: 'bg-success-50',
    text: 'text-success-700',
    ring: 'ring-success-500/20',
  },
  purple: {
    bg: 'bg-primary-600',
    light: 'bg-primary-50',
    text: 'text-primary-700',
    ring: 'ring-primary-500/20',
  },
  orange: {
    bg: 'bg-warning-600',
    light: 'bg-warning-50',
    text: 'text-warning-700',
    ring: 'ring-warning-500/20',
  },
  red: {
    bg: 'bg-error-600',
    light: 'bg-error-50',
    text: 'text-error-700',
    ring: 'ring-error-500/20',
  },
};

/**
 * MetricCard function
 *
 * @param {Object} params - Function parameters
 * @returns {void} Nothing
 */
export function MetricCard({
  title,
  value,
  change,
  icon,
  color,
  loading,
  onClick,
}: MetricCardProps) {
  const colors = colorClasses[color];

  const CardWrapper = onClick ? motion.button : motion.div;

  return (
    <CardWrapper
      className={`w-full text-left ${onClick ? `cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 ${  colors.ring}` : ''}`}
      onClick={onClick}
      whileHover={onClick ? { scale: 1.02, y: -2 } : undefined}
      whileTap={onClick ? { scale: 0.98 } : undefined}
      transition={{ duration: 0.15 }}
    >
      <Card className="h-full border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white/80 backdrop-blur-sm">
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
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                    >
                      <Heading as="span" level={3} size="2xl" weight="bold" className="tabular-nums">
                        {value}
                      </Heading>
                    </motion.div>
                  </div>
                </div>

                <motion.div
                  className={`p-3 rounded-xl ${colors.bg} shadow-lg`}
                  whileHover={{ scale: 1.1 }}
                  transition={{ duration: 0.15 }}
                >
                  <div className="text-white">{icon}</div>
                </motion.div>
              </div>

              {/* Change Indicator */}
              {change && (
                <motion.div
                  className="flex items-center gap-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <div
                    className={`flex items-center gap-1 px-2 py-1 rounded-full ${
                      change.type === 'increase'
                        ? 'bg-success-100 text-success-700'
                        : 'bg-error-100 text-error-700'
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
                </motion.div>
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
}

export default MetricCard;
