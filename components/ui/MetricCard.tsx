import React from 'react';
import { motion } from 'motion/react';
import { TrendingUp, TrendingDown, Activity } from 'lucide-react';
import { Card, CardContent } from './card';

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
    bg: 'bg-emerald-600',
    light: 'bg-emerald-50',
    text: 'text-emerald-700',
    ring: 'ring-emerald-500/20',
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
                  <p className="text-sm font-medium text-gray-600 leading-tight">{title}</p>
                  <div className="flex items-baseline gap-2">
                    <motion.span
                      className="text-2xl font-bold text-gray-900"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                    >
                      {value}
                    </motion.span>
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
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {change.type === 'increase' ? (
                      <TrendingUp className="w-3 h-3" />
                    ) : (
                      <TrendingDown className="w-3 h-3" />
                    )}
                    <span className="text-xs font-semibold">{Math.abs(change.value)}%</span>
                  </div>
                  <span className="text-xs text-gray-500">{change.period}</span>
                </motion.div>
              )}

              {/* Activity Indicator */}
              <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                <Activity className="w-3 h-3 text-gray-400" />
                <span className="text-xs text-gray-500">
                  Güncellendi:{' '}
                  {new Date().toLocaleTimeString('tr-TR', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </CardWrapper>
  );
}

export default MetricCard;
