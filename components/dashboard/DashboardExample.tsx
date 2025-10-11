"use client"

import * as React from "react"
import { TrendingUp, TrendingDown, Users, DollarSign, Activity, Calendar } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"

// Mock data for the dashboard
const stats = [
  {
    title: "Total Revenue",
    value: "$45,231.89",
    change: "+20.1%",
    trend: "up",
    icon: DollarSign,
    description: "from last month"
  },
  {
    title: "Active Users",
    value: "2,350",
    change: "+15.3%",
    trend: "up",
    icon: Users,
    description: "from last month"
  },
  {
    title: "Conversion Rate",
    value: "3.2%",
    change: "-2.4%",
    trend: "down",
    icon: Activity,
    description: "from last month"
  },
  {
    title: "Total Orders",
    value: "1,234",
    change: "+8.7%",
    trend: "up",
    icon: Calendar,
    description: "from last month"
  }
]

const recentOrders = [
  { id: "ORD-001", customer: "John Doe", amount: "$299.00", status: "completed", date: "2024-01-15" },
  { id: "ORD-002", customer: "Jane Smith", amount: "$149.50", status: "pending", date: "2024-01-14" },
  { id: "ORD-003", customer: "Bob Johnson", amount: "$89.99", status: "completed", date: "2024-01-13" },
  { id: "ORD-004", customer: "Alice Brown", amount: "$199.00", status: "processing", date: "2024-01-12" },
]

export function DashboardExample() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <div className="flex items-center space-x-2">
          <Button>Download</Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                {stat.trend === "up" ? (
                  <TrendingUp className="h-3 w-3 text-green-500" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-red-500" />
                )}
                <span className={stat.trend === "up" ? "text-green-500" : "text-red-500"}>
                  {stat.change}
                </span>
                <span>{stat.description}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Revenue Chart Card */}
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Overview</CardTitle>
            <CardDescription>
              Revenue overview for the last 12 months
            </CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none">Total Revenue</p>
                  <p className="text-sm text-muted-foreground">$45,231.89</p>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline">+20.1%</Badge>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>This month</span>
                  <span>$12,234.00</span>
                </div>
                <Progress value={75} className="h-2" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Last month</span>
                  <span>$10,189.00</span>
                </div>
                <Progress value={60} className="h-2" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Target</span>
                  <span>$50,000.00</span>
                </div>
                <Progress value={90} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Orders */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
            <CardDescription>
              Latest orders from your customers
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">{order.id}</p>
                    <p className="text-sm text-muted-foreground">{order.customer}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge 
                      variant={
                        order.status === "completed" ? "default" : 
                        order.status === "pending" ? "secondary" : "outline"
                      }
                    >
                      {order.status}
                    </Badge>
                    <span className="text-sm font-medium">{order.amount}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Activity Feed */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>
            Latest updates and notifications
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium">New order received</p>
                <p className="text-sm text-muted-foreground">
                  Order #ORD-005 from Sarah Wilson for $299.00
                </p>
              </div>
              <span className="text-xs text-muted-foreground">2 minutes ago</span>
            </div>
            <Separator />
            <div className="flex items-center space-x-4">
              <div className="w-2 h-2 bg-blue-500 rounded-full" />
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium">Payment processed</p>
                <p className="text-sm text-muted-foreground">
                  Payment of $149.50 for order #ORD-002 has been processed
                </p>
              </div>
              <span className="text-xs text-muted-foreground">1 hour ago</span>
            </div>
            <Separator />
            <div className="flex items-center space-x-4">
              <div className="w-2 h-2 bg-yellow-500 rounded-full" />
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium">Inventory update</p>
                <p className="text-sm text-muted-foreground">
                  Low stock alert for Product XYZ - only 5 units remaining
                </p>
              </div>
              <span className="text-xs text-muted-foreground">3 hours ago</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
