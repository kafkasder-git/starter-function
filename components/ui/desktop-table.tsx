/**
 * @fileoverview Desktop Table Helper Components
 *
 * @author Dernek Yönetim Sistemi Team
 * @version 1.0.0
 */

import type { ReactNode } from 'react';
import { Button } from './button';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { cn } from './utils';

interface ActionButton {
  label: string;
  icon?: ReactNode;
  onClick: () => void;
  variant?: 'default' | 'outline' | 'ghost' | 'secondary' | 'destructive';
  disabled?: boolean;
}

interface DesktopActionButtonsProps {
  primaryAction?: ActionButton;
  secondaryActions?: ActionButton[];
  className?: string;
}

/**
 * DesktopActionButtons - Renders action buttons for desktop view
 */
export function DesktopActionButtons({
  primaryAction,
  secondaryActions,
  className,
}: DesktopActionButtonsProps) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      {primaryAction && (
        <Button
          onClick={primaryAction.onClick}
          variant={primaryAction.variant ?? 'default'}
          disabled={primaryAction.disabled}
          className="flex items-center gap-2"
        >
          {primaryAction.icon}
          {primaryAction.label}
        </Button>
      )}
      {secondaryActions?.map((action, index) => (
        <Button
          key={index}
          onClick={action.onClick}
          variant={action.variant ?? 'outline'}
          disabled={action.disabled}
          className="flex items-center gap-2"
        >
          {action.icon}
          {action.label}
        </Button>
      ))}
    </div>
  );
}

interface DesktopStatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: ReactNode;
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'gray';
  className?: string;
}

/**
 * DesktopStatsCard - Renders a statistics card
 */
export function DesktopStatsCard({
  title,
  value,
  subtitle,
  icon,
  color = 'blue',
  className,
}: DesktopStatsCardProps) {
  const colorClasses = {
    blue: 'text-blue-600 bg-blue-50',
    green: 'text-green-600 bg-green-50',
    yellow: 'text-yellow-600 bg-yellow-50',
    red: 'text-red-600 bg-red-50',
    purple: 'text-purple-600 bg-purple-50',
    gray: 'text-gray-600 bg-gray-50',
  };

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon && <div className={cn('rounded-lg p-2', colorClasses[color])}>{icon}</div>}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {subtitle && <p className="text-muted-foreground mt-1 text-xs">{subtitle}</p>}
      </CardContent>
    </Card>
  );
}
