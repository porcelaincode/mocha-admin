"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Users,
  Heart,
  MessageCircle,
  TrendingUp,
  TrendingDown,
  UserPlus,
  Activity,
  DollarSign,
  Shield
} from "lucide-react";
import { getDashboardStats, getRecentActivity, getTopLocations, getAnalytics } from "@/lib/admin-services";

interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  newUsersToday: number;
  totalMatches: number;
  messagesExchanged: number;
  revenue: number;
  verifiedUsers: number;
  conversionRate: number;
  changes: {
    totalUsers: number;
    activeUsers: number;
    newUsers: number;
    totalMatches: number;
    messagesExchanged: number;
    revenue: number;
    verifiedUsers: number;
    conversionRate: number;
  };
}

interface RecentActivity {
  id: string;
  type: string;
  message: string;
  time: string;
  user: string;
  timestamp: Date;
}

interface TopLocation {
  city: string;
  users: number;
  percentage: number;
}

interface Analytics {
  subscriptions: {
    basic: { count: number; percentage: number };
    premium: { count: number; percentage: number };
    platinum: { count: number; percentage: number };
  };
}

function StatCard({ title, value, change, icon: Icon, trend }: {
  title: string;
  value: string | number;
  change?: string;
  icon: React.ComponentType<{ className?: string }>;
  trend?: "up" | "down";
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{typeof value === 'number' ? value.toLocaleString() : value}</div>
        {change && (
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            {trend === "up" ? (
              <TrendingUp className="h-3 w-3 text-green-500" />
            ) : (
              <TrendingDown className="h-3 w-3 text-red-500" />
            )}
            <span className={trend === "up" ? "text-green-500" : "text-red-500"}>
              {change}
            </span>
            from last month
          </p>
        )}
      </CardContent>
    </Card>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    activeUsers: 0,
    newUsersToday: 0,
    totalMatches: 0,
    messagesExchanged: 0,
    revenue: 0,
    verifiedUsers: 0,
    conversionRate: 0,
    changes: {
      totalUsers: 0,
      activeUsers: 0,
      newUsers: 0,
      totalMatches: 0,
      messagesExchanged: 0,
      revenue: 0,
      verifiedUsers: 0,
      conversionRate: 0
    }
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [topLocations, setTopLocations] = useState<TopLocation[]>([]);
  const [analytics, setAnalytics] = useState<Analytics>({
    subscriptions: {
      basic: { count: 0, percentage: 0 },
      premium: { count: 0, percentage: 0 },
      platinum: { count: 0, percentage: 0 }
    }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const [dashboardStats, activityData, locationData, analyticsData] = await Promise.all([
          getDashboardStats(),
          getRecentActivity(),
          getTopLocations(),
          getAnalytics()
        ]);
        
        setStats(dashboardStats);
        setRecentActivity(activityData);
        setTopLocations(locationData);
        setAnalytics(analyticsData);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Loading dashboard data...</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="space-y-0 pb-2">
                <div className="h-4 bg-muted rounded animate-pulse"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded animate-pulse mb-2"></div>
                <div className="h-3 bg-muted rounded animate-pulse w-2/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back! Here&apos;s what&apos;s happening with your dating app.
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Users"
          value={stats.totalUsers}
          change={`${stats.changes.totalUsers >= 0 ? '+' : ''}${stats.changes.totalUsers.toFixed(1)}%`}
          icon={Users}
          trend={stats.changes.totalUsers >= 0 ? "up" : "down"}
        />
        <StatCard
          title="Active Users"
          value={stats.activeUsers}
          change={`${stats.changes.activeUsers >= 0 ? '+' : ''}${stats.changes.activeUsers.toFixed(1)}%`}
          icon={Activity}
          trend={stats.changes.activeUsers >= 0 ? "up" : "down"}
        />
        <StatCard
          title="Total Matches"
          value={stats.totalMatches}
          change={`${stats.changes.totalMatches >= 0 ? '+' : ''}${stats.changes.totalMatches.toFixed(1)}%`}
          icon={Heart}
          trend={stats.changes.totalMatches >= 0 ? "up" : "down"}
        />
        <StatCard
          title="Revenue"
          value={`$${stats.revenue}`}
          change={`${stats.changes.revenue >= 0 ? '+' : ''}${stats.changes.revenue.toFixed(1)}%`}
          icon={DollarSign}
          trend={stats.changes.revenue >= 0 ? "up" : "down"}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="New Users This Month"
          value={stats.newUsersToday}
          change={`${stats.changes.newUsers >= 0 ? '+' : ''}${stats.changes.newUsers.toFixed(1)}%`}
          icon={UserPlus}
          trend={stats.changes.newUsers >= 0 ? "up" : "down"}
        />
        <StatCard
          title="Messages Sent"
          value={stats.messagesExchanged}
          change={`${stats.changes.messagesExchanged >= 0 ? '+' : ''}${stats.changes.messagesExchanged.toFixed(1)}%`}
          icon={MessageCircle}
          trend={stats.changes.messagesExchanged >= 0 ? "up" : "down"}
        />
        <StatCard
          title="Verified Users"
          value={stats.verifiedUsers}
          change={`${stats.changes.verifiedUsers >= 0 ? '+' : ''}${stats.changes.verifiedUsers.toFixed(1)}%`}
          icon={Shield}
          trend={stats.changes.verifiedUsers >= 0 ? "up" : "down"}
        />
        <StatCard
          title="Conversion Rate"
          value={`${stats.conversionRate.toFixed(1)}%`}
          change={`${stats.changes.conversionRate >= 0 ? '+' : ''}${stats.changes.conversionRate.toFixed(1)}%`}
          icon={TrendingUp}
          trend={stats.changes.conversionRate >= 0 ? "up" : "down"}
        />
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="activity">Recent Activity</TabsTrigger>
          <TabsTrigger value="locations">Top Locations</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>User Growth</CardTitle>
                <CardDescription>Monthly active users over time</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Total Users</span>
                    <span>{stats.totalUsers.toLocaleString()}</span>
                  </div>
                  <Progress value={100} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Active Users</span>
                    <span>{stats.activeUsers.toLocaleString()}</span>
                  </div>
                  <Progress value={stats.totalUsers ? (stats.activeUsers / stats.totalUsers) * 100 : 0} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Verified Users</span>
                    <span>{stats.verifiedUsers.toLocaleString()}</span>
                  </div>
                  <Progress value={stats.totalUsers ? (stats.verifiedUsers / stats.totalUsers) * 100 : 0} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Subscription Distribution</CardTitle>
                <CardDescription>Current subscription tiers</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      Basic ({analytics.subscriptions.basic.count} users)
                    </span>
                    <span>{Math.round(analytics.subscriptions.basic.percentage)}%</span>
                  </div>
                  <Progress value={analytics.subscriptions.basic.percentage} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      Premium ({analytics.subscriptions.premium.count} users)
                    </span>
                    <span>{Math.round(analytics.subscriptions.premium.percentage)}%</span>
                  </div>
                  <Progress value={analytics.subscriptions.premium.percentage} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                      Platinum ({analytics.subscriptions.platinum.count} users)
                    </span>
                    <span>{Math.round(analytics.subscriptions.platinum.percentage)}%</span>
                  </div>
                  <Progress value={analytics.subscriptions.platinum.percentage} className="h-2" />
                </div>
                {analytics.subscriptions.basic.count === 0 && analytics.subscriptions.premium.count === 0 && analytics.subscriptions.platinum.count === 0 && (
                  <p className="text-sm text-muted-foreground mt-4">
                    No active subscriptions yet. Data will appear as users subscribe to plans.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest activities across your platform</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.length > 0 ? (
                  recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-center space-x-4">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {activity.message}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {activity.user} • {activity.time}
                        </p>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {activity.type.replace("_", " ")}
                      </Badge>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No recent activity in the last 24 hours.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="locations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Top Locations</CardTitle>
              <CardDescription>Cities with the most active users</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topLocations.some(location => location.users > 0) ? (
                  topLocations.map((location, index) => (
                    <div key={location.city} className={`flex items-center space-x-4 ${location.users === 0 ? 'opacity-50' : ''}`}>
                      <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center text-sm font-medium">
                        {index + 1}
                      </div>
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {location.city}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {location.users.toLocaleString()} users
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{location.percentage}%</p>
                        <Progress value={location.percentage} className="h-2 w-16" />
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Location data will be available once users start adding location information to their profiles.
                    </p>
                    {topLocations.map((location, index) => (
                      <div key={location.city} className="flex items-center space-x-4 opacity-50">
                        <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center text-sm font-medium">
                          {index + 1}
                        </div>
                        <div className="flex-1 space-y-1">
                          <p className="text-sm font-medium leading-none">
                            {location.city}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {location.users.toLocaleString()} users
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">{location.percentage}%</p>
                          <Progress value={location.percentage} className="h-2 w-16" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 