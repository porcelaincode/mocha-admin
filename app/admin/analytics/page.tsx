"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Users,
  Heart,
  MessageCircle,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Download
} from "lucide-react";

// Mock analytics data
const analyticsData = {
  userGrowth: [
    { month: "Jan", users: 1250, growth: 12.5 },
    { month: "Feb", users: 1580, growth: 26.4 },
    { month: "Mar", users: 1920, growth: 21.5 },
    { month: "Apr", users: 2340, growth: 21.9 },
    { month: "May", users: 2890, growth: 23.5 },
    { month: "Jun", users: 3450, growth: 19.4 }
  ],
  demographics: {
    ageGroups: [
      { range: "18-24", percentage: 28, count: 965 },
      { range: "25-34", percentage: 42, count: 1449 },
      { range: "35-44", percentage: 20, count: 690 },
      { range: "45+", percentage: 10, count: 346 }
    ],
    locations: [
      { city: "New York", users: 892, percentage: 25.9 },
      { city: "Los Angeles", users: 654, percentage: 19.0 },
      { city: "Chicago", users: 432, percentage: 12.5 },
      { city: "Houston", users: 321, percentage: 9.3 },
      { city: "Phoenix", users: 234, percentage: 6.8 }
    ]
  },
  engagement: {
    dailyActiveUsers: 2340,
    weeklyActiveUsers: 5670,
    monthlyActiveUsers: 12450,
    averageSessionTime: "12m 34s",
    messagesPerDay: 15678,
    matchesPerDay: 456,
    profileViews: 23456
  },
  revenue: {
    monthly: 45670,
    growth: 23.5,
    subscriptions: {
      basic: { count: 1250, revenue: 12450 },
      premium: { count: 890, revenue: 17780 },
      platinum: { count: 340, revenue: 13600 }
    }
  }
};

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

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground">
            Insights and metrics for your dating app
          </p>
        </div>
        <Button>
          <Download className="mr-2 h-4 w-4" />
          Export Report
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Daily Active Users"
          value={analyticsData.engagement.dailyActiveUsers}
          change="+12.5%"
          icon={Users}
          trend="up"
        />
        <StatCard
          title="Monthly Revenue"
          value={`$${analyticsData.revenue.monthly.toLocaleString()}`}
          change="+23.5%"
          icon={DollarSign}
          trend="up"
        />
        <StatCard
          title="Matches Per Day"
          value={analyticsData.engagement.matchesPerDay}
          change="+15.3%"
          icon={Heart}
          trend="up"
        />
        <StatCard
          title="Messages Per Day"
          value={analyticsData.engagement.messagesPerDay}
          change="+18.7%"
          icon={MessageCircle}
          trend="up"
        />
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="engagement">Engagement</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>User Growth</CardTitle>
                <CardDescription>Monthly user acquisition over time</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {analyticsData.userGrowth.map((data) => (
                  <div key={data.month} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>{data.month}</span>
                      <span>{data.users.toLocaleString()} users</span>
                    </div>
                    <Progress value={(data.users / 3500) * 100} className="h-2" />
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Growth: +{data.growth}%</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Engagement Metrics</CardTitle>
                <CardDescription>User activity and engagement</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold">{analyticsData.engagement.dailyActiveUsers.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">Daily Active</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{analyticsData.engagement.weeklyActiveUsers.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">Weekly Active</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Session Time</span>
                    <span>{analyticsData.engagement.averageSessionTime}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Profile Views</span>
                    <span>{analyticsData.engagement.profileViews.toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Age Demographics</CardTitle>
                <CardDescription>User distribution by age groups</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {analyticsData.demographics.ageGroups.map((group) => (
                  <div key={group.range} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>{group.range} years</span>
                      <span>{group.percentage}% ({group.count} users)</span>
                    </div>
                    <Progress value={group.percentage} className="h-2" />
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Locations</CardTitle>
                <CardDescription>Cities with most users</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {analyticsData.demographics.locations.map((location, index) => (
                  <div key={location.city} className="flex items-center space-x-4">
                    <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{location.city}</p>
                      <p className="text-xs text-muted-foreground">
                        {location.users.toLocaleString()} users ({location.percentage}%)
                      </p>
                    </div>
                    <Progress value={location.percentage} className="h-2 w-16" />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="engagement" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Daily Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analyticsData.engagement.dailyActiveUsers.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">Active users today</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Messages Sent</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analyticsData.engagement.messagesPerDay.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">Messages today</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>New Matches</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analyticsData.engagement.matchesPerDay}</div>
                <p className="text-xs text-muted-foreground">Matches today</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>User Activity Patterns</CardTitle>
              <CardDescription>When users are most active</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Morning (6AM - 12PM)</span>
                    <span>25%</span>
                  </div>
                  <Progress value={25} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Afternoon (12PM - 6PM)</span>
                    <span>35%</span>
                  </div>
                  <Progress value={35} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Evening (6PM - 12AM)</span>
                    <span>40%</span>
                  </div>
                  <Progress value={40} className="h-2" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader>
                <CardTitle>Monthly Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${analyticsData.revenue.monthly.toLocaleString()}</div>
                <p className="text-xs text-green-600">+{analyticsData.revenue.growth}% from last month</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Basic Plan</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analyticsData.revenue.subscriptions.basic.count}</div>
                <p className="text-xs text-muted-foreground">
                  ${analyticsData.revenue.subscriptions.basic.revenue.toLocaleString()} revenue
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Premium Plan</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analyticsData.revenue.subscriptions.premium.count}</div>
                <p className="text-xs text-muted-foreground">
                  ${analyticsData.revenue.subscriptions.premium.revenue.toLocaleString()} revenue
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Platinum Plan</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analyticsData.revenue.subscriptions.platinum.count}</div>
                <p className="text-xs text-muted-foreground">
                  ${analyticsData.revenue.subscriptions.platinum.revenue.toLocaleString()} revenue
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Revenue Breakdown</CardTitle>
              <CardDescription>Revenue by subscription plan</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                    Basic Plan
                  </span>
                  <span>${analyticsData.revenue.subscriptions.basic.revenue.toLocaleString()}</span>
                </div>
                <Progress value={28} className="h-2" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    Premium Plan
                  </span>
                  <span>${analyticsData.revenue.subscriptions.premium.revenue.toLocaleString()}</span>
                </div>
                <Progress value={41} className="h-2" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                    Platinum Plan
                  </span>
                  <span>${analyticsData.revenue.subscriptions.platinum.revenue.toLocaleString()}</span>
                </div>
                <Progress value={31} className="h-2" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 