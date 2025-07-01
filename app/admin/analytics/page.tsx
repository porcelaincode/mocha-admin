/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";

import { useEffect, useState } from "react";
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
  Download,
  Loader2
} from "lucide-react";
import { getAnalytics } from "@/lib/admin-services";

interface AnalyticsData {
  userGrowth: any[];
  engagement: {
    dailyActiveUsers: number;
    weeklyActiveUsers: number;
    monthlyActiveUsers: number;
    averageSessionTime: string;
    messagesPerDay: number;
    matchesPerDay: number;
    profileViews: number;
  };
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

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    userGrowth: [],
    engagement: {
      dailyActiveUsers: 0,
      weeklyActiveUsers: 0,
      monthlyActiveUsers: 0,
      averageSessionTime: "0m 0s",
      messagesPerDay: 0,
      matchesPerDay: 0,
      profileViews: 0
    },
    subscriptions: {
      basic: { count: 0, percentage: 0 },
      premium: { count: 0, percentage: 0 },
      platinum: { count: 0, percentage: 0 }
    }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const data = await getAnalytics();
      setAnalytics(data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
            <p className="text-muted-foreground">Loading analytics data...</p>
          </div>
        </div>
        <div className="flex items-center justify-center p-12">
          <Loader2 className="h-12 w-12 animate-spin" />
        </div>
      </div>
    );
  }

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
          value={analytics.engagement.dailyActiveUsers}
          change="+12.5%"
          icon={Users}
          trend="up"
        />
        <StatCard
          title="Monthly Revenue"
          value={`$0`} // Would need revenue calculation
          change="+23.5%"
          icon={DollarSign}
          trend="up"
        />
        <StatCard
          title="Matches Per Day"
          value={analytics.engagement.matchesPerDay}
          change="+15.3%"
          icon={Heart}
          trend="up"
        />
        <StatCard
          title="Messages Per Day"
          value={analytics.engagement.messagesPerDay}
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
                {analytics.userGrowth.length > 0 ? (
                  analytics.userGrowth.map((data, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>{data.month || `Month ${index + 1}`}</span>
                        <span>{(data.users || 0).toLocaleString()} users</span>
                      </div>
                      <Progress value={(data.users || 0) / Math.max(...analytics.userGrowth.map(d => d.users || 0), 1) * 100} className="h-2" />
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>Growth: +{(data.growth || 0).toFixed(1)}%</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4">
                    <p className="text-sm text-muted-foreground">No user growth data available yet</p>
                  </div>
                )}
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
                    <div className="text-2xl font-bold">{analytics.engagement.dailyActiveUsers.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">Daily Active</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{analytics.engagement.weeklyActiveUsers.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">Weekly Active</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Session Time</span>
                    <span>{analytics.engagement.averageSessionTime}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Profile Views</span>
                    <span>{analytics.engagement.profileViews.toLocaleString()}</span>
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
                <CardTitle>User Activity</CardTitle>
                <CardDescription>Active users across different time periods</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Daily Active Users</span>
                    <span>{analytics.engagement.dailyActiveUsers.toLocaleString()}</span>
                  </div>
                  <Progress value={100} className="h-2" />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Weekly Active Users</span>
                    <span>{analytics.engagement.weeklyActiveUsers.toLocaleString()}</span>
                  </div>
                  <Progress 
                    value={analytics.engagement.dailyActiveUsers > 0 ? 
                      (analytics.engagement.weeklyActiveUsers / analytics.engagement.dailyActiveUsers) * 100 : 0} 
                    className="h-2" 
                  />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Monthly Active Users</span>
                    <span>{analytics.engagement.monthlyActiveUsers.toLocaleString()}</span>
                  </div>
                  <Progress 
                    value={analytics.engagement.dailyActiveUsers > 0 ? 
                      (analytics.engagement.monthlyActiveUsers / analytics.engagement.dailyActiveUsers) * 100 : 0} 
                    className="h-2" 
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Subscription Distribution</CardTitle>
                <CardDescription>Current subscription plan breakdown</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                      Basic
                    </span>
                    <span>{analytics.subscriptions.basic.count} ({analytics.subscriptions.basic.percentage.toFixed(1)}%)</span>
                  </div>
                  <Progress value={analytics.subscriptions.basic.percentage} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      Premium
                    </span>
                    <span>{analytics.subscriptions.premium.count} ({analytics.subscriptions.premium.percentage.toFixed(1)}%)</span>
                  </div>
                  <Progress value={analytics.subscriptions.premium.percentage} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                      Platinum
                    </span>
                    <span>{analytics.subscriptions.platinum.count} ({analytics.subscriptions.platinum.percentage.toFixed(1)}%)</span>
                  </div>
                  <Progress value={analytics.subscriptions.platinum.percentage} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="engagement" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Daily Activity</CardTitle>
                <CardDescription>Messages and matches created today</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold">{analytics.engagement.messagesPerDay.toLocaleString()}</div>
                  <p className="text-sm text-muted-foreground">Messages sent today</p>
                </div>
                
                <div className="text-center">
                  <div className="text-3xl font-bold">{analytics.engagement.matchesPerDay.toLocaleString()}</div>
                  <p className="text-sm text-muted-foreground">Matches made today</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>User Engagement</CardTitle>
                <CardDescription>Average session and activity metrics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Average Session Time</span>
                    <span>{analytics.engagement.averageSessionTime}</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Profile Views</span>
                    <span>{analytics.engagement.profileViews.toLocaleString()}</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Daily Retention</span>
                    <span>
                      {analytics.engagement.weeklyActiveUsers > 0 && analytics.engagement.dailyActiveUsers > 0
                        ? ((analytics.engagement.dailyActiveUsers / analytics.engagement.weeklyActiveUsers) * 100).toFixed(1)
                        : 0}%
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Overview</CardTitle>
                <CardDescription>Current revenue metrics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold">$0.00</div>
                  <p className="text-sm text-muted-foreground">Monthly Recurring Revenue</p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Active Subscriptions</span>
                    <span>{analytics.subscriptions.basic.count + analytics.subscriptions.premium.count + analytics.subscriptions.platinum.count}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Conversion Rate</span>
                    <span>0.0%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Revenue by Plan</CardTitle>
                <CardDescription>Revenue breakdown by subscription tier</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Basic Plan</span>
                    <span>$0.00</span>
                  </div>
                  <Progress value={0} className="h-2" />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Premium Plan</span>
                    <span>$0.00</span>
                  </div>
                  <Progress value={0} className="h-2" />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Platinum Plan</span>
                    <span>$0.00</span>
                  </div>
                  <Progress value={0} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
} 