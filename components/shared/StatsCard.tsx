"use client"

import { TrendingUp, TrendingDown, type LucideIcon } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Heading } from "@/components/ui/heading"
import { Text } from "@/components/ui/text"
import { cn } from "@/components/ui/utils"

interface StatsCardProps {
  title: string
  value: string | number
  change?: {
    value: number
    type: "increase" | "decrease"
    period?: string
  }
  icon?: LucideIcon
  color?: "default" | "blue" | "green" | "purple" | "orange" | "red"
  loading?: boolean
  onClick?: () => void
  className?: string
}

const colorVariants = {
  default: "text-neutral-600",
  blue: "text-info-600",
  green: "text-success-600",
  purple: "text-primary-600",
  orange: "text-warning-600",
  red: "text-error-600",
}

/**
 * StatsCard Component
 *
 * Displays a statistic with optional trend indicator.
 *
 * Icons:
 * - TrendingUp: Positive change (green)
 * - TrendingDown: Negative change (red)
 * - Custom icon via icon prop
 *
 * All icons use semantic color tokens for consistency.
 *
 * @example
 * // Example with custom icon
 * <StatsCard
 *   title="Total Users"
 *   value="1,234"
 *   icon={Users}
 *   color="blue"
 *   change={{ value: 12, type: 'increase', period: 'vs last month' }}
 * />
 */
export function StatsCard({
  title,
  value,
  change,
  icon: Icon,
  color = "default",
  loading = false,
  onClick,
  className,
}: StatsCardProps) {
  const handleClick = () => {
    if (onClick && !loading) {
      onClick();
    }
  };

  return (
    <Card
      className={cn(
        "transition-all duration-200 hover:shadow-md",
        onClick && !loading && "cursor-pointer hover:scale-[1.02]",
        className
      )}
      onClick={handleClick}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {Icon && (
          <Icon className={cn("h-4 w-4", colorVariants[color])} />
        )}
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-8 w-20 animate-pulse bg-muted rounded" />
        ) : (
          <Heading level={3} size="2xl" weight="bold" className="tabular-nums">
            {value}
          </Heading>
        )}
        {change && !loading && (
          <div className="flex items-center space-x-2 mt-1">
            {change.type === "increase" ? (
              <TrendingUp className="h-3 w-3 text-success-500" />
            ) : (
              <TrendingDown className="h-3 w-3 text-error-500" />
            )}
            <Text weight="semibold" color={change.type === "increase" ? "success" : "error"} size="xs">
              {change.value > 0 ? "+" : ""}{change.value}%
            </Text>
            {change.period && (
              <>
                <Text size="xs" color="muted">•</Text>
                <Text size="xs" color="muted">{change.period}</Text>
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Preset variations for common use cases
export function RevenueCard({
  value,
  change,
  loading = false,
  onClick
}: {
  value: string | number
  change?: { value: number; type: "increase" | "decrease"; period?: string }
  loading?: boolean
  onClick?: () => void
}) {
  return (
    <StatsCard
      title="Toplam Gelir"
      value={value}
      change={change}
      color="green"
      loading={loading}
      onClick={onClick}
    />
  )
}

export function UsersCard({
  value,
  change,
  loading = false,
  onClick
}: {
  value: string | number
  change?: { value: number; type: "increase" | "decrease"; period?: string }
  loading?: boolean
  onClick?: () => void
}) {
  return (
    <StatsCard
      title="Aktif Kullanıcılar"
      value={value}
      change={change}
      color="blue"
      loading={loading}
      onClick={onClick}
    />
  )
}

export function OrdersCard({
  value,
  change,
  loading = false,
  onClick
}: {
  value: string | number
  change?: { value: number; type: "increase" | "decrease"; period?: string }
  loading?: boolean
  onClick?: () => void
}) {
  return (
    <StatsCard
      title="Toplam Sipariş"
      value={value}
      change={change}
      color="purple"
      loading={loading}
      onClick={onClick}
    />
  )
}

export function PendingCard({
  value,
  change,
  loading = false,
  onClick
}: {
  value: string | number
  change?: { value: number; type: "increase" | "decrease"; period?: string }
  loading?: boolean
  onClick?: () => void
}) {
  return (
    <StatsCard
      title="Bekleyen İşlemler"
      value={value}
      change={change}
      color="orange"
      loading={loading}
      onClick={onClick}
    />
  )
}
