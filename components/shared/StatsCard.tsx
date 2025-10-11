"use client"

import * as React from "react"
import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

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
  default: "text-gray-600",
  blue: "text-blue-600",
  green: "text-green-600", 
  purple: "text-purple-600",
  orange: "text-orange-600",
  red: "text-red-600",
}

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
      onClick()
    }
  }

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
        <div className="text-2xl font-bold">
          {loading ? (
            <div className="h-8 w-20 animate-pulse bg-muted rounded" />
          ) : (
            value
          )}
        </div>
        {change && !loading && (
          <div className="flex items-center space-x-2 text-xs text-muted-foreground mt-1">
            {change.type === "increase" ? (
              <TrendingUp className="h-3 w-3 text-green-500" />
            ) : (
              <TrendingDown className="h-3 w-3 text-red-500" />
            )}
            <span className={cn(
              change.type === "increase" ? "text-green-500" : "text-red-500"
            )}>
              {change.value > 0 ? "+" : ""}{change.value}%
            </span>
            {change.period && (
              <>
                <span>•</span>
                <span>{change.period}</span>
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
