import { useEffect, useState, useCallback } from "react"
import { Link } from "react-router"
import {
  Users,
  Gift,
  Star,
  Megaphone,
  Plus,
  ArrowRight,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { supabase } from "@/lib/supabase"

interface DashboardStats {
  totalCustomers: number
  activeRewards: number
  pointsIssuedThisMonth: number
  campaignsSentThisMonth: number
}

interface RecentActivity {
  id: string
  type: "earn" | "redeem" | "adjust"
  amount: number
  description: string | null
  created_at: string
  customer_name: string
}

interface TopCustomer {
  id: string
  name: string
  points_balance: number
  total_visits: number
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const [topCustomers, setTopCustomers] = useState<TopCustomer[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchDashboard = useCallback(async () => {
    setIsLoading(true)

    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

    const [customersRes, rewardsRes, pointsRes, campaignsRes, activityRes, topRes] =
      await Promise.all([
        supabase.from("customers").select("*", { count: "exact", head: true }),
        supabase.from("rewards").select("*", { count: "exact", head: true }).eq("is_active", true),
        supabase
          .from("points_transactions")
          .select("amount")
          .eq("type", "earn")
          .gte("created_at", startOfMonth),
        supabase
          .from("campaigns")
          .select("*", { count: "exact", head: true })
          .eq("status", "sent")
          .gte("sent_at", startOfMonth),
        supabase
          .from("points_transactions")
          .select("id, type, amount, description, created_at, customers(name)")
          .order("created_at", { ascending: false })
          .limit(10),
        supabase
          .from("customers")
          .select("id, name, points_balance, total_visits")
          .order("points_balance", { ascending: false })
          .limit(5),
      ])

    const pointsThisMonth =
      pointsRes.data?.reduce((sum, tx) => sum + (tx.amount || 0), 0) ?? 0

    setStats({
      totalCustomers: customersRes.count ?? 0,
      activeRewards: rewardsRes.count ?? 0,
      pointsIssuedThisMonth: pointsThisMonth,
      campaignsSentThisMonth: campaignsRes.count ?? 0,
    })

    setRecentActivity(
      (activityRes.data ?? []).map((item: Record<string, unknown>) => ({
        id: item.id as string,
        type: item.type as "earn" | "redeem" | "adjust",
        amount: item.amount as number,
        description: item.description as string | null,
        created_at: item.created_at as string,
        customer_name:
          (item.customers as Record<string, unknown>)?.name as string ?? "Unknown",
      }))
    )

    setTopCustomers((topRes.data as TopCustomer[]) ?? [])
    setIsLoading(false)
  }, [])

  useEffect(() => {
    fetchDashboard()
  }, [fetchDashboard])

  function timeAgo(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 60) return `${mins}m ago`
    const hours = Math.floor(mins / 60)
    if (hours < 24) return `${hours}h ago`
    const days = Math.floor(hours / 24)
    return `${days}d ago`
  }

  const statCards = [
    {
      label: "Total Customers",
      value: stats?.totalCustomers ?? 0,
      icon: Users,
      color: "bg-blue-100 text-blue-700",
    },
    {
      label: "Active Rewards",
      value: stats?.activeRewards ?? 0,
      icon: Gift,
      color: "bg-purple-100 text-purple-700",
    },
    {
      label: "Points Issued (Month)",
      value: stats?.pointsIssuedThisMonth ?? 0,
      icon: Star,
      color: "bg-primary/10 text-primary",
    },
    {
      label: "Campaigns Sent (Month)",
      value: stats?.campaignsSentThisMonth ?? 0,
      icon: Megaphone,
      color: "bg-green-100 text-green-700",
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Overview of your nail store loyalty program.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) =>
          isLoading ? (
            <Skeleton key={stat.label} className="h-24" />
          ) : (
            <Card key={stat.label}>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-full ${stat.color}`}>
                    <stat.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        )}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-3 flex-wrap">
          <Button asChild>
            <Link to="/customers/new">
              <Plus className="h-4 w-4 mr-2" />
              Add Customer
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/campaigns/new">
              <Megaphone className="h-4 w-4 mr-2" />
              New Campaign
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/rewards">
              <Gift className="h-4 w-4 mr-2" />
              Manage Rewards
            </Link>
          </Button>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Activity</CardTitle>
            <Button asChild variant="ghost" size="sm">
              <Link to="/customers">
                View all <ArrowRight className="h-3 w-3 ml-1" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-10" />
                ))}
              </div>
            ) : recentActivity.length === 0 ? (
              <p className="text-center py-8 text-sm text-muted-foreground">
                No activity yet.
              </p>
            ) : (
              <div className="space-y-3">
                {recentActivity.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-center justify-between text-sm"
                  >
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="secondary"
                        className={
                          activity.type === "earn"
                            ? "bg-green-100 text-green-800"
                            : activity.type === "redeem"
                            ? "bg-red-100 text-red-800"
                            : "bg-blue-100 text-blue-800"
                        }
                      >
                        {activity.type}
                      </Badge>
                      <span className="font-medium">{activity.customer_name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        className={
                          activity.amount >= 0
                            ? "text-green-600 font-medium"
                            : "text-red-600 font-medium"
                        }
                      >
                        {activity.amount >= 0 ? "+" : ""}
                        {activity.amount} pts
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {timeAgo(activity.created_at)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Customers */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Top Customers</CardTitle>
            <Button asChild variant="ghost" size="sm">
              <Link to="/customers">
                View all <ArrowRight className="h-3 w-3 ml-1" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-10" />
                ))}
              </div>
            ) : topCustomers.length === 0 ? (
              <p className="text-center py-8 text-sm text-muted-foreground">
                No customers yet.
              </p>
            ) : (
              <div className="space-y-3">
                {topCustomers.map((customer, i) => (
                  <Link
                    key={customer.id}
                    to={`/customers/${customer.id}`}
                    className="flex items-center justify-between text-sm hover:bg-muted/50 rounded p-2 -mx-2 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-xs font-medium">
                        {i + 1}
                      </span>
                      <span className="font-medium">{customer.name}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-semibold text-primary">
                        {customer.points_balance} pts
                      </span>
                      <span className="text-xs text-muted-foreground ml-2">
                        {customer.total_visits} visits
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
