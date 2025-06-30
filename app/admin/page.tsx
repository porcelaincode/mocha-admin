"use client";

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

// Mock data - replace with real data from your database
const stats = {
  totalUsers: 12453,
  activeUsers: 8921,
  newUsersToday: 127,
  totalMatches: 45678,
  messagesExchanged: 234567,
  revenue: 15420,
  conversionRate: 12.5,
  verifiedUsers: 7832,
};

const recentActivity = [
  { id: 1, type: "user_signup", message: "New user registered", time: "2 min ago", user: "Sarah M." },
  { id: 2, type: "match", message: "New match created", time: "5 min ago", user: "Alex & Jordan" },
  { id: 3, type: "subscription", message: "Premium subscription", time: "12 min ago", user: "Mike R." },
  { id: 4, type: "report", message: "Profile reported", time: "18 min ago", user: "Anonymous" },
  { id: 5, type: "message", message: "1000+ messages sent", time: "25 min ago", user: "System" },
];

const topLocations = [
  { city: "New York", users: 2341, percentage: 18.8 },
  { city: "Los Angeles", users: 1876, percentage: 15.1 },
  { city: "Chicago", users: 1234, percentage: 9.9 },
  { city: "Houston", users: 987, percentage: 7.9 },
  { city: "Phoenix", users: 765, percentage: 6.1 },
];

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
        <div className="text-2xl font-bold">{value.toLocaleString()}</div>
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
          change="+12.5%"
          icon={Users}
          trend="up"
        />
        <StatCard
          title="Active Users"
          value={stats.activeUsers}
          change="+8.2%"
          icon={Activity}
          trend="up"
        />
        <StatCard
          title="Total Matches"
          value={stats.totalMatches}
          change="+15.3%"
          icon={Heart}
          trend="up"
        />
        <StatCard
          title="Revenue"
          value={`$${stats.revenue}`}
          change="+23.1%"
          icon={DollarSign}
          trend="up"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="New Users Today"
          value={stats.newUsersToday}
          change="+5.2%"
          icon={UserPlus}
          trend="up"
        />
        <StatCard
          title="Messages Sent"
          value={stats.messagesExchanged}
          change="+18.7%"
          icon={MessageCircle}
          trend="up"
        />
        <StatCard
          title="Verified Users"
          value={stats.verifiedUsers}
          change="+9.4%"
          icon={Shield}
          trend="up"
        />
        <StatCard
          title="Conversion Rate"
          value={`${stats.conversionRate}%`}
          change="-2.1%"
          icon={TrendingUp}
          trend="down"
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
                    <span>January</span>
                    <span>8,234</span>
                  </div>
                  <Progress value={82} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>February</span>
                    <span>9,156</span>
                  </div>
                  <Progress value={91} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>March</span>
                    <span>8,921</span>
                  </div>
                  <Progress value={89} className="h-2" />
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
                      Basic
                    </span>
                    <span>65%</span>
                  </div>
                  <Progress value={65} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      Premium
                    </span>
                    <span>28%</span>
                  </div>
                  <Progress value={28} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                      Platinum
                    </span>
                    <span>7%</span>
                  </div>
                  <Progress value={7} className="h-2" />
                </div>
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
                {recentActivity.map((activity) => (
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
                ))}
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
                {topLocations.map((location, index) => (
                  <div key={location.city} className="flex items-center space-x-4">
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
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 