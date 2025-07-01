"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertCircle, Eye, Trash2, Plus, RefreshCw, Users, ArrowLeftRight, Clock, CheckCircle, XCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import CreateSwipeModal from "@/components/create-swipe-modal";
import {
  getSwipes,
  getSwipeQueueForUser,
  generateSwipesForUser,
  deleteSwipe,
  updateSwipeStatus,
  getUsers,
  clearExpiredSwipes,
  getSwipeStats,
  getUsersWithLowSwipeQueues
} from "@/lib/admin-services";

interface Swipe {
  id: string;
  fromUserId: string;
  toUserId: string;
  action: 'like' | 'pass' | 'superlike';
  status: 'active' | 'expired' | 'revoked';
  note?: string;
  createdAt: string;
  fromUser?: {
    id: string;
    name: string;
    email: string;
    phoneNumber: string;
  };
  toUser?: {
    id: string;
    name: string;
    email: string;
    phoneNumber: string;
    age?: number;
    bio?: string;
    location?: string;
    verified?: boolean;
  };
}

interface User {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  age?: number;
  location?: string;
  verified?: boolean;
}

export default function SwipesPage() {
  const [swipes, setSwipes] = useState<Swipe[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Pagination and filters
  const [currentPage, setCurrentPage] = useState(1);
  const [totalSwipes, setTotalSwipes] = useState(0);
  const [filters, setFilters] = useState({
    search: "",
    userId: "all",
    action: "all",
    status: "all"
  });

  // User queue management
  const [selectedUserId, setSelectedUserId] = useState("");
  const [userQueue, setUserQueue] = useState<Swipe[]>([]);
  const [queueLoading, setQueueLoading] = useState(false);

  // Swipe generation
  const [generateUserId, setGenerateUserId] = useState("");
  const [generating, setGenerating] = useState(false);

  // Bulk actions
  const [selectedSwipes, setSelectedSwipes] = useState<string[]>([]);
  const [bulkActionLoading, setBulkActionLoading] = useState(false);
  const [bulkStatusValue, setBulkStatusValue] = useState("placeholder");

  // System maintenance
  const [swipeStats, setSwipeStats] = useState<any>(null);
  const [lowQueueUsers, setLowQueueUsers] = useState<any[]>([]);
  const [maintenanceLoading, setMaintenanceLoading] = useState(false);

  const itemsPerPage = 20;

  useEffect(() => {
    loadSwipes();
    loadUsers();
    loadSwipeStats();
  }, [currentPage, filters]);

  const loadSwipes = async () => {
    try {
      setLoading(true);
      const result = await getSwipes(currentPage, itemsPerPage, filters);
      
      if (result.error) {
        setError(result.error);
      } else {
        setSwipes(result.swipes);
        setTotalSwipes(result.total);
      }
    } catch (err) {
      setError("Failed to load swipes");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const result = await getUsers(1, 100); // Get first 100 users for dropdown
      setUsers(result.users);
    } catch (err) {
      console.error("Failed to load users:", err);
    }
  };

  const loadUserQueue = async (userId: string) => {
    if (!userId) return;
    
    try {
      setQueueLoading(true);
      const result = await getSwipeQueueForUser(userId);
      
      if (result.error) {
        setError(result.error);
      } else {
        setUserQueue(result.swipes);
      }
    } catch (err) {
      setError("Failed to load user queue");
      console.error(err);
    } finally {
      setQueueLoading(false);
    }
  };

  const handleGenerateSwipes = async () => {
    if (!generateUserId) {
      setError("Please select a user");
      return;
    }

    try {
      setGenerating(true);
      setError(null);
      setSuccess(null);
      
      const result = await generateSwipesForUser(generateUserId);
      
      if (result.success) {
        const created = 'created' in result ? result.created : 0;
        const remaining = 'remaining' in result ? result.remaining : 0;
        setSuccess(`Successfully generated ${created} swipes. ${remaining} slots remaining.`);
        loadSwipes(); // Refresh the main table
        if (selectedUserId === generateUserId) {
          loadUserQueue(generateUserId); // Refresh queue if viewing the same user
        }
      } else {
        setError(result.error || "Failed to generate swipes");
      }
    } catch (err) {
      setError("Failed to generate swipes");
      console.error(err);
    } finally {
      setGenerating(false);
    }
  };

  const handleDeleteSwipe = async (swipeId: string) => {
    if (!confirm("Are you sure you want to delete this swipe?")) return;

    try {
      const result = await deleteSwipe(swipeId);
      
      if (result.success) {
        setSuccess("Swipe deleted successfully");
        loadSwipes();
        if (selectedUserId) {
          loadUserQueue(selectedUserId);
        }
      } else {
        setError(result.error || "Failed to delete swipe");
      }
    } catch (err) {
      setError("Failed to delete swipe");
      console.error(err);
    }
  };

  const handleUpdateSwipeStatus = async (swipeId: string, status: 'active' | 'expired' | 'revoked') => {
    try {
      const result = await updateSwipeStatus(swipeId, status);
      
      if (result.success) {
        setSuccess(`Swipe status updated to ${status}`);
        loadSwipes();
        if (selectedUserId) {
          loadUserQueue(selectedUserId);
        }
      } else {
        setError(result.error || "Failed to update swipe status");
      }
    } catch (err) {
      setError("Failed to update swipe status");
      console.error(err);
    }
  };

  const handleBulkStatusUpdate = async (status: 'active' | 'expired' | 'revoked') => {
    if (selectedSwipes.length === 0) return;

    try {
      setBulkActionLoading(true);
      const promises = selectedSwipes.map(swipeId => updateSwipeStatus(swipeId, status));
      await Promise.all(promises);
      
      setSuccess(`Updated ${selectedSwipes.length} swipes to ${status}`);
      setSelectedSwipes([]);
      loadSwipes();
      if (selectedUserId) {
        loadUserQueue(selectedUserId);
      }
    } catch (err) {
      setError("Failed to update swipes");
      console.error(err);
    } finally {
      setBulkActionLoading(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedSwipes.length === 0) return;
    if (!confirm(`Are you sure you want to delete ${selectedSwipes.length} swipes?`)) return;

    try {
      setBulkActionLoading(true);
      const promises = selectedSwipes.map(swipeId => deleteSwipe(swipeId));
      await Promise.all(promises);
      
      setSuccess(`Deleted ${selectedSwipes.length} swipes`);
      setSelectedSwipes([]);
      loadSwipes();
      if (selectedUserId) {
        loadUserQueue(selectedUserId);
      }
    } catch (err) {
      setError("Failed to delete swipes");
      console.error(err);
    } finally {
      setBulkActionLoading(false);
    }
  };

  const loadSwipeStats = async () => {
    try {
      const stats = await getSwipeStats();
      setSwipeStats(stats);
    } catch (err) {
      console.error("Failed to load swipe stats:", err);
    }
  };

  const loadLowQueueUsers = async () => {
    try {
      setMaintenanceLoading(true);
      const result = await getUsersWithLowSwipeQueues(2);
      if (result.error) {
        setError(result.error);
      } else {
        setLowQueueUsers(result.users);
      }
    } catch (err) {
      setError("Failed to load users with low queue");
      console.error(err);
    } finally {
      setMaintenanceLoading(false);
    }
  };

  const handleClearExpiredSwipes = async () => {
    try {
      setMaintenanceLoading(true);
      const result = await clearExpiredSwipes();
      
      if (result.success) {
        const updated = 'updated' in result ? result.updated : 0;
        setSuccess(`Cleared ${updated} expired swipes`);
        loadSwipes();
        loadSwipeStats();
      } else {
        setError(result.error || "Failed to clear expired swipes");
      }
    } catch (err) {
      setError("Failed to clear expired swipes");
      console.error(err);
    } finally {
      setMaintenanceLoading(false);
    }
  };

  const handleSelectAllSwipes = () => {
    if (selectedSwipes.length === swipes.length) {
      setSelectedSwipes([]);
    } else {
      setSelectedSwipes(swipes.map(s => s.id));
    }
  };

  const getActionBadge = (action: string) => {
    switch (action) {
      case 'like':
        return <Badge variant="default" className="bg-green-100 text-green-800">Like</Badge>;
      case 'pass':
        return <Badge variant="secondary">Pass</Badge>;
      case 'superlike':
        return <Badge variant="default" className="bg-purple-100 text-purple-800">Super Like</Badge>;
      default:
        return <Badge variant="outline">{action}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default" className="bg-blue-100 text-blue-800">Active</Badge>;
      case 'expired':
        return <Badge variant="secondary">Expired</Badge>;
      case 'revoked':
        return <Badge variant="destructive">Revoked</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const totalPages = Math.ceil(totalSwipes / itemsPerPage);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Swipes Management</h1>
          <p className="text-muted-foreground">
            Monitor and manage user swipes, queues, and swipe generation
          </p>
        </div>
        <div className="flex gap-2">
          <CreateSwipeModal onSwipeCreated={() => {
            loadSwipes();
            if (selectedUserId) {
              loadUserQueue(selectedUserId);
            }
          }} />
          <Button onClick={loadSwipes} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">{success}</AlertDescription>
        </Alert>
      )}

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Swipes</CardTitle>
            <ArrowLeftRight className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{swipeStats?.totalSwipes?.toLocaleString() || totalSwipes.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Swipes</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {swipeStats?.activeSwipes?.toLocaleString() || swipes.filter(s => s.status === 'active').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Likes</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {swipeStats?.likes?.toLocaleString() || swipes.filter(s => s.action === 'like').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Super Likes</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {swipeStats?.superLikes?.toLocaleString() || swipes.filter(s => s.action === 'superlike').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">All Swipes</TabsTrigger>
          <TabsTrigger value="queue">User Queue</TabsTrigger>
          <TabsTrigger value="generate">Generate Swipes</TabsTrigger>
          <TabsTrigger value="maintenance">System Maintenance</TabsTrigger>
        </TabsList>

        {/* All Swipes Tab */}
        <TabsContent value="overview" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle>Filters</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-4">
                <div>
                  <Label htmlFor="search">Search</Label>
                  <Input
                    id="search"
                    placeholder="Search users..."
                    value={filters.search}
                    onChange={(e) => {
                      setFilters(prev => ({ ...prev, search: e.target.value }));
                      setCurrentPage(1);
                    }}
                  />
                </div>
                <div>
                  <Label htmlFor="user-filter">User</Label>
                  <Select
                    value={filters.userId}
                    onValueChange={(value) => {
                      setFilters(prev => ({ ...prev, userId: value }));
                      setCurrentPage(1);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All users" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All users</SelectItem>
                      {users.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.name || user.email || user.phoneNumber}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="action-filter">Action</Label>
                  <Select
                    value={filters.action}
                    onValueChange={(value) => {
                      setFilters(prev => ({ ...prev, action: value }));
                      setCurrentPage(1);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All actions" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All actions</SelectItem>
                      <SelectItem value="like">Like</SelectItem>
                      <SelectItem value="pass">Pass</SelectItem>
                      <SelectItem value="superlike">Super Like</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="status-filter">Status</Label>
                  <Select
                    value={filters.status}
                    onValueChange={(value) => {
                      setFilters(prev => ({ ...prev, status: value }));
                      setCurrentPage(1);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All statuses</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="expired">Expired</SelectItem>
                      <SelectItem value="revoked">Revoked</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bulk Actions */}
          {selectedSwipes.length > 0 && (
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    {selectedSwipes.length} swipe{selectedSwipes.length !== 1 ? 's' : ''} selected
                  </div>
                  <div className="flex gap-2">
                    <Select 
                      value={bulkStatusValue} 
                      onValueChange={(value) => {
                        if (value !== "placeholder") {
                          setBulkStatusValue(value);
                          handleBulkStatusUpdate(value as any);
                          setBulkStatusValue("placeholder"); // Reset after action
                        }
                      }}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder="Update Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="placeholder" disabled>Update Status</SelectItem>
                        <SelectItem value="active">Set Active</SelectItem>
                        <SelectItem value="expired">Set Expired</SelectItem>
                        <SelectItem value="revoked">Set Revoked</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={handleBulkDelete}
                      disabled={bulkActionLoading}
                    >
                      {bulkActionLoading ? (
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4 mr-2" />
                      )}
                      Delete Selected
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Swipes Table */}
          <Card>
            <CardHeader>
              <CardTitle>Swipes ({totalSwipes})</CardTitle>
              <CardDescription>
                All swipes in the system with filtering and management options
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-8">
                  <RefreshCw className="h-8 w-8 animate-spin" />
                </div>
              ) : (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">
                          <Checkbox
                            checked={selectedSwipes.length === swipes.length && swipes.length > 0}
                            onCheckedChange={handleSelectAllSwipes}
                          />
                        </TableHead>
                        <TableHead>From User</TableHead>
                        <TableHead>To User</TableHead>
                        <TableHead>Action</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {swipes.map((swipe) => (
                        <TableRow key={swipe.id}>
                          <TableCell>
                            <Checkbox
                              checked={selectedSwipes.includes(swipe.id)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setSelectedSwipes(prev => [...prev, swipe.id]);
                                } else {
                                  setSelectedSwipes(prev => prev.filter(id => id !== swipe.id));
                                }
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">
                                {swipe.fromUser?.name || "Unknown"}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {swipe.fromUser?.email || swipe.fromUser?.phoneNumber}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">
                                {swipe.toUser?.name || "Unknown"}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {swipe.toUser?.email || swipe.toUser?.phoneNumber}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{getActionBadge(swipe.action)}</TableCell>
                          <TableCell>{getStatusBadge(swipe.status)}</TableCell>
                          <TableCell>
                            {new Date(swipe.createdAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Select
                                value={swipe.status}
                                onValueChange={(value) => 
                                  handleUpdateSwipeStatus(swipe.id, value as any)
                                }
                              >
                                <SelectTrigger className="w-24">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="active">Active</SelectItem>
                                  <SelectItem value="expired">Expired</SelectItem>
                                  <SelectItem value="revoked">Revoked</SelectItem>
                                </SelectContent>
                              </Select>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteSwipe(swipe.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex justify-between items-center mt-4">
                      <div className="text-sm text-muted-foreground">
                        Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                        {Math.min(currentPage * itemsPerPage, totalSwipes)} of{" "}
                        {totalSwipes} swipes
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                          disabled={currentPage === 1}
                        >
                          Previous
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                          disabled={currentPage === totalPages}
                        >
                          Next
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* User Queue Tab */}
        <TabsContent value="queue" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Swipe Queue</CardTitle>
              <CardDescription>
                View and manage the swipe queue for a specific user (max 5 swipes)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="user-select">Select User</Label>
                <Select
                  value={selectedUserId}
                  onValueChange={(value) => {
                    setSelectedUserId(value);
                    loadUserQueue(value);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a user to view their queue" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.name || user.email || user.phoneNumber}
                        {user.verified && " ✓"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedUserId && (
                <>
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-muted-foreground">
                      Queue: {userQueue.length}/5 swipes
                    </div>
                    <div className="flex gap-2">
                      {userQueue.length > 0 && (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={async () => {
                            if (!confirm(`Clear all ${userQueue.length} swipes for this user?`)) return;
                            try {
                              const promises = userQueue.map(swipe => deleteSwipe(swipe.id));
                              await Promise.all(promises);
                              setSuccess(`Cleared all swipes for user`);
                              loadUserQueue(selectedUserId);
                              loadSwipes();
                            } catch (err) {
                              setError("Failed to clear swipes");
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Clear All
                        </Button>
                      )}
                      <Button
                        onClick={() => loadUserQueue(selectedUserId)}
                        variant="outline"
                        size="sm"
                        disabled={queueLoading}
                      >
                        <RefreshCw className={`h-4 w-4 mr-2 ${queueLoading ? 'animate-spin' : ''}`} />
                        Refresh
                      </Button>
                    </div>
                  </div>

                  {queueLoading ? (
                    <div className="flex justify-center py-8">
                      <RefreshCw className="h-8 w-8 animate-spin" />
                    </div>
                  ) : userQueue.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No active swipes in queue for this user
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Target User</TableHead>
                          <TableHead>Action</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Created</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {userQueue.map((swipe) => (
                          <TableRow key={swipe.id}>
                            <TableCell>
                              <div>
                                <div className="font-medium">
                                  {swipe.toUser?.name || "Unknown"}
                                  {swipe.toUser?.verified && (
                                    <Badge variant="outline" className="ml-2">Verified</Badge>
                                  )}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {swipe.toUser?.age && `Age: ${swipe.toUser.age} • `}
                                  {swipe.toUser?.location}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>{getActionBadge(swipe.action)}</TableCell>
                            <TableCell>{getStatusBadge(swipe.status)}</TableCell>
                            <TableCell>
                              {new Date(swipe.createdAt).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Select
                                  value={swipe.status}
                                  onValueChange={(value) => 
                                    handleUpdateSwipeStatus(swipe.id, value as any)
                                  }
                                >
                                  <SelectTrigger className="w-24">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="active">Active</SelectItem>
                                    <SelectItem value="expired">Expired</SelectItem>
                                    <SelectItem value="revoked">Revoked</SelectItem>
                                  </SelectContent>
                                </Select>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDeleteSwipe(swipe.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Generate Swipes Tab */}
        <TabsContent value="generate" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Generate Swipes</CardTitle>
              <CardDescription>
                Automatically generate compatible swipes for a user based on their preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="generate-user">Select User</Label>
                <Select
                  value={generateUserId}
                  onValueChange={setGenerateUserId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a user to generate swipes for" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.name || user.email || user.phoneNumber}
                        {user.verified && " ✓"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  This will generate up to 5 swipes for the selected user based on their preferences, 
                  age range, and compatibility scoring. Existing active swipes will be considered 
                  to avoid exceeding the 5 swipe limit.
                </AlertDescription>
              </Alert>

              <Button
                onClick={handleGenerateSwipes}
                disabled={!generateUserId || generating}
                className="w-full"
              >
                {generating ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Generating Swipes...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Generate Swipes
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* System Maintenance Tab */}
        <TabsContent value="maintenance" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* System Stats */}
            <Card>
              <CardHeader>
                <CardTitle>System Statistics</CardTitle>
                <CardDescription>
                  Overview of swipe system performance and metrics
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {swipeStats && (
                  <div className="grid gap-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Total Swipes:</span>
                      <span className="font-medium">{swipeStats.totalSwipes.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Active Swipes:</span>
                      <span className="font-medium text-blue-600">{swipeStats.activeSwipes.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Expired Swipes:</span>
                      <span className="font-medium text-orange-600">{swipeStats.expiredSwipes.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Revoked Swipes:</span>
                      <span className="font-medium text-red-600">{swipeStats.revokedSwipes.toLocaleString()}</span>
                    </div>
                    <div className="border-t pt-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Likes:</span>
                        <span className="font-medium text-green-600">{swipeStats.likes.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Passes:</span>
                        <span className="font-medium text-gray-600">{swipeStats.passes.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Super Likes:</span>
                        <span className="font-medium text-purple-600">{swipeStats.superLikes.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                )}
                <Button
                  onClick={loadSwipeStats}
                  variant="outline"
                  className="w-full"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh Stats
                </Button>
              </CardContent>
            </Card>

            {/* Maintenance Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Maintenance Actions</CardTitle>
                <CardDescription>
                  System cleanup and maintenance operations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Clear Expired Swipes</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Remove swipes that are older than 24 hours and mark them as expired.
                  </p>
                  <Button
                    onClick={handleClearExpiredSwipes}
                    disabled={maintenanceLoading}
                    variant="outline"
                    className="w-full"
                  >
                    {maintenanceLoading ? (
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Clock className="h-4 w-4 mr-2" />
                    )}
                    Clear Expired Swipes
                  </Button>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Users with Low Swipe Queues</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Find users with less than 2 active swipes in their queue.
                  </p>
                  <Button
                    onClick={loadLowQueueUsers}
                    disabled={maintenanceLoading}
                    variant="outline"
                    className="w-full"
                  >
                    {maintenanceLoading ? (
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Users className="h-4 w-4 mr-2" />
                    )}
                    Find Low Queue Users
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Low Queue Users */}
          {lowQueueUsers.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Users with Low Swipe Queues ({lowQueueUsers.length})</CardTitle>
                <CardDescription>
                  Users who have less than 2 active swipes and may need queue refill
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Active Swipes</TableHead>
                      <TableHead>Verified</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {lowQueueUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {user.name || "Unknown"}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {user.email || user.phoneNumber}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={user.activeSwipes === 0 ? "destructive" : "secondary"}>
                            {user.activeSwipes}/5
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {user.verified ? (
                            <Badge variant="outline">Verified</Badge>
                          ) : (
                            <Badge variant="secondary">Not Verified</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {new Date(user.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            onClick={async () => {
                              const result = await generateSwipesForUser(user.id);
                              if (result.success) {
                                const created = 'created' in result ? result.created : 0;
                                setSuccess(`Generated ${created} swipes for ${user.name || 'user'}`);
                                loadLowQueueUsers(); // Refresh the list
                              } else {
                                setError(result.error || "Failed to generate swipes");
                              }
                            }}
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Generate Swipes
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
} 