"use client";

import { useState, useEffect } from "react";
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
  Eye,
  Crown,
  DollarSign,
  TrendingUp,
  Users,
  Download,
  RefreshCw,
  Ban,
  CheckCircle,
  Loader2,
  Trash2,
} from "lucide-react";
import { 
  getSubscriptions, 
  getProducts, 
  deleteProduct, 
  updateProduct,
  getRevenueAnalytics,
  getPurchases
} from "@/lib/admin-services";
import { CreateProductModal } from "@/components/create-product-modal";

const planColors = {
  basic: "bg-gray-100 text-gray-800",
  premium: "bg-blue-100 text-blue-800",
  platinum: "bg-purple-100 text-purple-800"
};

const statusColors = {
  active: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
  past_due: "bg-yellow-100 text-yellow-800",
  expired: "bg-red-100 text-red-800"
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
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleDateString();
};

const getDaysUntilRenewal = (renewsAt: string) => {
  if (!renewsAt) return 0;
  const now = new Date();
  const renewalDate = new Date(renewsAt);
  const diffTime = renewalDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

export default function SubscriptionsPage() {
  const [activeTab, setActiveTab] = useState("subscriptions");
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [purchases, setPurchases] = useState<any[]>([]);
  const [revenueData, setRevenueData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [planFilter, setPlanFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [productStatusFilter, setProductStatusFilter] = useState("all");
  const [totalSubscriptions, setTotalSubscriptions] = useState(0);
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalPurchases, setTotalPurchases] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, [activeTab, searchTerm, planFilter, statusFilter, productStatusFilter, currentPage]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      if (activeTab === "subscriptions") {
        const result = await getSubscriptions(currentPage, 50, {
          search: searchTerm || undefined,
          plan: planFilter !== "all" ? planFilter : undefined,
          status: statusFilter !== "all" ? statusFilter : undefined,
        });
        setSubscriptions(result.subscriptions);
        setTotalSubscriptions(result.total);
      } else if (activeTab === "products") {
        const result = await getProducts(currentPage, 50, {
          search: searchTerm || undefined,
          status: productStatusFilter !== "all" ? productStatusFilter : undefined,
        });
        setProducts(result.products);
        setTotalProducts(result.total);
      } else if (activeTab === "analytics") {
        const [revenueResult, purchasesResult] = await Promise.all([
          getRevenueAnalytics('month'),
          getPurchases(1, 100)
        ]);
        setRevenueData(revenueResult);
        setPurchases(purchasesResult.purchases);
        setTotalPurchases(purchasesResult.total);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm("Are you sure you want to deactivate this product? It will be soft deleted and can be reactivated later.")) {
      return;
    }

    setDeleteLoading(productId);
    try {
      const result = await deleteProduct(productId, false); // Soft delete
      if (result.success) {
        fetchData(); // Refresh the data
      } else {
        alert(result.error || "Failed to delete product");
      }
    } catch (error) {
      alert("An error occurred while deleting the product");
    } finally {
      setDeleteLoading(null);
    }
  };

  const handleToggleProductStatus = async (productId: string, currentStatus: boolean) => {
    setDeleteLoading(productId);
    try {
      const result = await updateProduct(productId, {
        isActive: !currentStatus
      });
      if (result.success) {
        fetchData(); // Refresh the data
      } else {
        alert("Failed to update product status");
      }
    } catch (error) {
      alert("An error occurred while updating the product");
    } finally {
      setDeleteLoading(null);
    }
  };

  const totalRevenue = revenueData?.current?.totalRevenue || 0;
  const activeSubscriptionsCount = subscriptions.filter(s => s.status === 'active').length;
  const churnRate = totalSubscriptions > 0 ? ((subscriptions.filter(s => s.status === 'cancelled' || s.status === 'expired').length / totalSubscriptions) * 100) : 0;

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
            Manage {subscription.user.name}&apos;s subscription
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
          
          <div className="flex space-x-2">
            <Button variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Renew
            </Button>
            <Button variant="outline" size="sm">
              <Ban className="h-4 w-4 mr-2" />
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
          <h1 className="text-3xl font-bold tracking-tight">Subscriptions & Products</h1>
          <p className="text-muted-foreground">
            Manage user subscriptions, products, and billing
          </p>
        </div>
        <div className="flex gap-2">
          {activeTab === "products" && (
            <CreateProductModal onProductCreated={fetchData} />
          )}
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export Data
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Subscriptions</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSubscriptions.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {revenueData?.growth?.subscriptionCount > 0 ? '+' : ''}{revenueData?.growth?.subscriptionCount?.toFixed(1) || 0}% from last month
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeSubscriptionsCount}</div>
            <p className="text-xs text-muted-foreground">
              {((activeSubscriptionsCount / Math.max(totalSubscriptions, 1)) * 100).toFixed(1)}% of total
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              {revenueData?.growth?.totalRevenue > 0 ? '+' : ''}{revenueData?.growth?.totalRevenue?.toFixed(1) || 0}% from last month
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Churn Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{churnRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Target: &lt;5%</p>
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
                    <SelectItem value="expired">Expired</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Subscriptions Table */}
          <Card>
            <CardHeader>
              <CardTitle>Subscriptions ({totalSubscriptions.toLocaleString()})</CardTitle>
              <CardDescription>
                All user subscriptions and their current status
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center p-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                  <span className="ml-2">Loading subscriptions...</span>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Plan</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Next Renewal</TableHead>
                      <TableHead>Days Left</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {subscriptions.map((subscription) => (
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
                          <div className="font-medium">${subscription.price}</div>
                          <div className="text-sm text-muted-foreground">per {subscription.billingCycle}</div>
                        </TableCell>
                        
                        <TableCell>
                          <div className="text-sm">
                            {formatDate(subscription.renewsAt)}
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <div className="text-sm">
                            {subscription.status === 'active' ? (
                              subscription.daysUntilRenewal > 0 ? (
                                <span className="text-green-600">
                                  {subscription.daysUntilRenewal} days
                                </span>
                              ) : (
                                <span className="text-red-600">Overdue</span>
                              )
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </div>
                        </TableCell>
                        
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end space-x-2">
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
              )}
              
              {subscriptions.length === 0 && !loading && (
                <div className="text-center py-8">
                  <Crown className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-2 text-sm font-semibold">No subscriptions found</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {searchTerm || planFilter !== "all" || statusFilter !== "all"
                      ? "Try adjusting your filters"
                      : "No subscriptions have been created yet"}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="products" className="space-y-4">
          {/* Product Filters */}
          <Card>
            <CardHeader>
              <CardTitle>Filters</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>
                
                <Select value={productStatusFilter} onValueChange={setProductStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Products</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Products Grid */}
          <Card>
            <CardHeader>
              <CardTitle>Products ({totalProducts.toLocaleString()})</CardTitle>
              <CardDescription>Manage subscription plans and one-time purchases</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center p-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                  <span className="ml-2">Loading products...</span>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {products.map((product) => (
                    <Card key={product.id} className={!product.isActive ? "opacity-60" : ""}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">{product.name}</CardTitle>
                          <div className="flex items-center gap-2">
                            <Badge variant={product.type === 'subscription' ? 'default' : 'secondary'}>
                              {product.type}
                            </Badge>
                            <Badge variant={product.isActive ? 'default' : 'destructive'}>
                              {product.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                          </div>
                        </div>
                        <CardDescription>{product.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold mb-4">
                          ${product.price}
                          {product.type === 'subscription' && <span className="text-sm font-normal text-muted-foreground">/month</span>}
                        </div>
                        
                        {product.credits > 0 && (
                          <div className="mb-4">
                            <Badge variant="outline">{product.credits} credits</Badge>
                          </div>
                        )}
                        
                        {product.features && product.features.length > 0 && (
                          <ul className="space-y-2 mb-4">
                            {product.features.slice(0, 3).map((feature: string, index: number) => (
                              <li key={index} className="flex items-center text-sm">
                                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                                {feature}
                              </li>
                            ))}
                            {product.features.length > 3 && (
                              <li className="text-sm text-muted-foreground">
                                +{product.features.length - 3} more features
                              </li>
                            )}
                          </ul>
                        )}
                        
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="flex-1"
                            onClick={() => handleToggleProductStatus(product.id, product.isActive)}
                            disabled={deleteLoading === product.id}
                          >
                            {deleteLoading === product.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : product.isActive ? (
                              <>
                                <Ban className="h-4 w-4 mr-1" />
                                Deactivate
                              </>
                            ) : (
                              <>
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Activate
                              </>
                            )}
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleDeleteProduct(product.id)}
                            disabled={deleteLoading === product.id}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
              
              {products.length === 0 && !loading && (
                <div className="text-center py-8">
                  <Crown className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-2 text-sm font-semibold">No products found</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {searchTerm || productStatusFilter !== "all"
                      ? "Try adjusting your filters"
                      : "No products have been created yet"}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Plan Distribution</CardTitle>
                <CardDescription>Current subscription plan breakdown</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {['basic', 'premium', 'platinum'].map((plan) => {
                  const count = subscriptions.filter(s => s.plan === plan && s.status === 'active').length;
                  const percentage = totalSubscriptions > 0 ? (count / totalSubscriptions) * 100 : 0;
                  
                  return (
                    <div key={plan} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-2">
                          {getPlanBadge(plan)}
                          {plan.charAt(0).toUpperCase() + plan.slice(1)}
                        </span>
                        <span>{count} ({percentage.toFixed(1)}%)</span>
                      </div>
                      <Progress value={percentage} className="h-2" />
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Revenue Breakdown</CardTitle>
                <CardDescription>Monthly revenue by type</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Subscription Revenue</span>
                    <span>${revenueData?.current?.subscriptionRevenue?.toFixed(2) || '0.00'}</span>
                  </div>
                  <Progress 
                    value={totalRevenue > 0 ? (revenueData?.current?.subscriptionRevenue / totalRevenue) * 100 : 0} 
                    className="h-2" 
                  />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>One-time Purchases</span>
                    <span>${revenueData?.current?.purchaseRevenue?.toFixed(2) || '0.00'}</span>
                  </div>
                  <Progress 
                    value={totalRevenue > 0 ? (revenueData?.current?.purchaseRevenue / totalRevenue) * 100 : 0} 
                    className="h-2" 
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Purchases */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Purchases ({totalPurchases})</CardTitle>
              <CardDescription>Latest one-time purchases and boosts</CardDescription>
            </CardHeader>
            <CardContent>
              {purchases.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Product</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {purchases.slice(0, 10).map((purchase) => (
                      <TableRow key={purchase.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{purchase.user.name}</div>
                            <div className="text-sm text-muted-foreground">{purchase.user.email}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{purchase.product.name}</div>
                            <Badge variant="secondary" className="text-xs">
                              {purchase.product.type}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">${purchase.amount}</div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">{formatDate(purchase.createdAt)}</div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8">
                  <DollarSign className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-2 text-sm font-semibold">No purchases found</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    No one-time purchases have been made yet
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 