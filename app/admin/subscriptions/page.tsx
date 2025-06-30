"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Search,
  Filter,
  Eye,
  CreditCard,
  Crown,
  DollarSign,
  TrendingUp,
  Calendar,
  Users,
  Download,
  RefreshCw,
  Ban,
  CheckCircle,
  XCircle
} from "lucide-react";

// Mock subscription data
const mockSubscriptions = [
  {
    id: "sub_1",
    user: {
      name: "Sarah Johnson",
      email: "sarah.j@email.com",
      avatar: "sarah"
    },
    plan: "premium",
    status: "active",
    price: 19.99,
    startDate: "2024-01-15T00:00:00Z",
    renewsAt: "2024-04-15T00:00:00Z",
    billingCycle: "monthly"
  },
  {
    id: "sub_2",
    user: {
      name: "Michael Chen",
      email: "m.chen@email.com",
      avatar: "michael"
    },
    plan: "platinum",
    status: "active",
    price: 39.99,
    startDate: "2024-02-01T00:00:00Z",
    renewsAt: "2024-05-01T00:00:00Z",
    billingCycle: "quarterly"
  }
];

const mockProducts = [
  {
    id: "prod_1",
    name: "Premium Plan",
    description: "Enhanced features for better matches",
    price: 19.99,
    currency: "USD",
    type: "subscription",
    features: ["Unlimited likes", "See who likes you", "Boost profile", "Advanced filters"]
  },
  {
    id: "prod_2", 
    name: "Platinum Plan",
    description: "Premium features plus exclusive benefits",
    price: 39.99,
    currency: "USD",
    type: "subscription",
    features: ["All Premium features", "Priority support", "Exclusive events", "VIP badge"]
  },
  {
    id: "prod_3",
    name: "Super Boost",
    description: "One-time profile boost",
    price: 4.99,
    currency: "USD",
    type: "one_time",
    features: ["24h profile boost", "10x more visibility"]
  }
];

const planColors = {
  basic: "bg-gray-100 text-gray-800",
  premium: "bg-blue-100 text-blue-800",
  platinum: "bg-purple-100 text-purple-800"
};

const statusColors = {
  active: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
  past_due: "bg-yellow-100 text-yellow-800"
};

const getStatusBadge = (status: string) => {
  return <Badge className={statusColors[status as keyof typeof statusColors] || "bg-gray-100 text-gray-800"}>
    {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
  </Badge>;
};

const getPlanBadge = (plan: string) => {
  return <Badge className={planColors[plan as keyof typeof planColors] || "bg-gray-100 text-gray-800"}>
    {plan.charAt(0).toUpperCase() + plan.slice(1)}
  </Badge>;
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString();
};

const getDaysUntilRenewal = (renewsAt: string) => {
  const now = new Date();
  const renewalDate = new Date(renewsAt);
  const diffTime = renewalDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

export default function SubscriptionsPage() {
  const [activeTab, setActiveTab] = useState("subscriptions");
  const [subscriptions] = useState(mockSubscriptions);
  const [products] = useState(mockProducts);
  const [searchTerm, setSearchTerm] = useState("");
  const [planFilter, setPlanFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredSubscriptions = subscriptions.filter(sub => {
    const searchMatch = sub.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       sub.user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const planMatch = planFilter === "all" || sub.plan === planFilter;
    const statusMatch = statusFilter === "all" || sub.status === statusFilter;
    
    return searchMatch && planMatch && statusMatch;
  });

  const totalRevenue = subscriptions
    .filter(sub => sub.status === 'active')
    .reduce((acc, sub) => acc + sub.price, 0);

  const SubscriptionDetailDialog = ({ subscription }: { subscription: any }) => (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <Eye className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Subscription Details</DialogTitle>
          <DialogDescription>
            Manage {subscription.user.name}'s subscription
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <Avatar>
              <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${subscription.user.avatar}`} />
              <AvatarFallback>{subscription.user.name.split(' ').map((n: string) => n[0]).join('')}</AvatarFallback>
            </Avatar>
            <div>
              <h4 className="font-medium">{subscription.user.name}</h4>
              <p className="text-sm text-muted-foreground">{subscription.user.email}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h5 className="font-medium mb-1">Plan</h5>
              {getPlanBadge(subscription.plan)}
            </div>
            <div>
              <h5 className="font-medium mb-1">Status</h5>
              {getStatusBadge(subscription.status)}
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h5 className="font-medium mb-1">Price</h5>
              <p className="text-sm">${subscription.price}/{subscription.billingCycle}</p>
            </div>
            <div>
              <h5 className="font-medium mb-1">Next Renewal</h5>
              <p className="text-sm">{formatDate(subscription.renewsAt)}</p>
            </div>
          </div>
          
          <div>
            <h5 className="font-medium mb-1">Payment Method</h5>
            <p className="text-sm text-muted-foreground">
              •••• {subscription.paymentMethod.split('_')[2]}
            </p>
          </div>
          
          <div className="flex space-x-2">
            <Button variant="outline" className="flex-1">
              <RefreshCw className="mr-2 h-4 w-4" />
              Change Plan
            </Button>
            <Button variant="destructive" className="flex-1">
              <Ban className="mr-2 h-4 w-4" />
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Subscriptions</h1>
          <p className="text-muted-foreground">
            Manage user subscriptions and revenue
          </p>
        </div>
        <Button>
          <Download className="mr-2 h-4 w-4" />
          Export Data
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">+23% from last month</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {subscriptions.filter(s => s.status === 'active').length}
            </div>
            <p className="text-xs text-muted-foreground">+15% from last month</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12.5%</div>
            <p className="text-xs text-muted-foreground">+2.1% from last month</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Churn Rate</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3.2%</div>
            <p className="text-xs text-muted-foreground">-1.5% from last month</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="subscriptions" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle>Filters</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search subscriptions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>
                
                <Select value={planFilter} onValueChange={setPlanFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Plan" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Plans</SelectItem>
                    <SelectItem value="basic">Basic</SelectItem>
                    <SelectItem value="premium">Premium</SelectItem>
                    <SelectItem value="platinum">Platinum</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                    <SelectItem value="past_due">Past Due</SelectItem>
                  </SelectContent>
                </Select>
                
                <Button variant="outline">
                  <Filter className="mr-2 h-4 w-4" />
                  More Filters
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Subscriptions Table */}
          <Card>
            <CardHeader>
              <CardTitle>Subscriptions ({filteredSubscriptions.length})</CardTitle>
              <CardDescription>
                All user subscriptions and their details
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Started</TableHead>
                    <TableHead>Renews</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSubscriptions.map((subscription) => (
                    <TableRow key={subscription.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <Avatar>
                            <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${subscription.user.avatar}`} />
                            <AvatarFallback>{subscription.user.name.split(' ').map((n: string) => n[0]).join('')}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{subscription.user.name}</div>
                            <div className="text-sm text-muted-foreground">{subscription.user.email}</div>
                          </div>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        {getPlanBadge(subscription.plan)}
                      </TableCell>
                      
                      <TableCell>
                        {getStatusBadge(subscription.status)}
                      </TableCell>
                      
                      <TableCell>
                        <div className="font-medium">
                          ${subscription.price}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          /{subscription.billingCycle}
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="text-sm">
                          {formatDate(subscription.startDate)}
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="text-sm">
                          {formatDate(subscription.renewsAt)}
                        </div>
                        {subscription.status === 'active' && (
                          <div className="text-xs text-muted-foreground">
                            {getDaysUntilRenewal(subscription.renewsAt)} days
                          </div>
                        )}
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <SubscriptionDetailDialog subscription={subscription} />
                          <Button variant="ghost" size="sm">
                            <RefreshCw className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="products" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Products & Plans</CardTitle>
              <CardDescription>
                Manage subscription plans and one-time products
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {products.map((product) => (
                  <Card key={product.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{product.name}</CardTitle>
                        <Crown className="h-5 w-5 text-yellow-500" />
                      </div>
                      <CardDescription>{product.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="text-2xl font-bold">
                          ${product.price}
                          {product.type === 'subscription' && <span className="text-sm font-normal">/month</span>}
                        </div>
                        
                        <div className="space-y-2">
                          {product.features.map((feature, index) => (
                            <div key={index} className="flex items-center space-x-2 text-sm">
                              <CheckCircle className="h-4 w-4 text-green-500" />
                              <span>{feature}</span>
                            </div>
                          ))}
                        </div>
                        
                        <Button variant="outline" className="w-full">
                          Edit Product
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Plan Distribution</CardTitle>
                <CardDescription>Current subscription breakdown</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Basic Plan</span>
                    <span>33%</span>
                  </div>
                  <Progress value={33} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Premium Plan</span>
                    <span>50%</span>
                  </div>
                  <Progress value={50} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Platinum Plan</span>
                    <span>17%</span>
                  </div>
                  <Progress value={17} className="h-2" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Revenue Trends</CardTitle>
                <CardDescription>Monthly revenue growth</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>January</span>
                    <span>$2,340</span>
                  </div>
                  <Progress value={70} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>February</span>
                    <span>$2,890</span>
                  </div>
                  <Progress value={85} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>March</span>
                    <span>$3,120</span>
                  </div>
                  <Progress value={95} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
} 