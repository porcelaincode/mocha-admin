/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  Ban,
  CheckCircle,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Heart,
  MessageCircle,
  Shield,
  Crown,
  Users,
  UserX,
  Download,
  Loader2,
  Edit,
  AlertCircle
} from "lucide-react";
import { getUsers, deleteUser } from "@/lib/admin-services";
import BulkUploadModal from "@/components/bulk-upload-modal";
import AddUserModal from "@/components/add-user-modal";
import EditUserModal from "@/components/edit-user-modal";

const subscriptionColors = {
  basic: "bg-gray-100 text-gray-800",
  premium: "bg-blue-100 text-blue-800",
  platinum: "bg-purple-100 text-purple-800"
};

export default function UsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [subscriptionFilter, setSubscriptionFilter] = useState("all");
  const [verificationFilter, setVerificationFilter] = useState("all");
  const [userTypeFilter, setUserTypeFilter] = useState("all");
  const [totalUsers, setTotalUsers] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [userToDelete, setUserToDelete] = useState<any>(null);

  useEffect(() => {
    fetchUsers();
  }, [searchTerm, statusFilter, subscriptionFilter, verificationFilter, userTypeFilter, currentPage]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const result = await getUsers(currentPage, 50, {
        search: searchTerm || undefined,
        status: statusFilter !== "all" ? statusFilter : undefined,
        subscription: subscriptionFilter !== "all" ? subscriptionFilter : undefined,
        verified: verificationFilter !== "all" ? verificationFilter : undefined,
        userType: userTypeFilter !== "all" ? userTypeFilter : undefined,
      });
      
      setUsers(result.users);
      setTotalUsers(result.total);
    } catch (error) {
      console.error('Error fetching users:', error);
      setUsers([]);
      setTotalUsers(0);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case "suspended":
        return <Badge className="bg-red-100 text-red-800">Suspended</Badge>;
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const navigateToUserProfile = (userId: string) => {
    router.push(`/admin/users/${userId}`);
  };

  const handleDeleteUser = async (userId: string) => {
    setDeletingUserId(userId);
    try {
      await deleteUser(userId);
      await fetchUsers(); // Refresh the list
      setShowDeleteDialog(false);
      setUserToDelete(null);
    } catch (error) {
      console.error('Error deleting user:', error);
      // You could add a toast notification here
    } finally {
      setDeletingUserId(null);
    }
  };

  const confirmDeleteUser = (user: any) => {
    setUserToDelete(user);
    setShowDeleteDialog(true);
  };

  const UserDetailDialog = ({ user }: { user: any }) => (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <Eye className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>User Details</DialogTitle>
          <DialogDescription>Complete profile information for {user.name}</DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
            <TabsTrigger value="subscription">Subscription</TabsTrigger>
            <TabsTrigger value="actions">Actions</TabsTrigger>
          </TabsList>
          
          <TabsContent value="profile" className="space-y-4">
            <div className="flex items-start space-x-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`} />
                <AvatarFallback>{user.name.split(' ').map((n: string) => n[0]).join('')}</AvatarFallback>
              </Avatar>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">{user.name}</h3>
                <div className="flex items-center space-x-2">
                  {user.verified && <Shield className="h-4 w-4 text-blue-500" />}
                  {getStatusBadge(user.status)}
                  <Badge className={subscriptionColors[user.subscription as keyof typeof subscriptionColors]}>
                    {user.subscription}
                  </Badge>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{user.email}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{user.phoneNumber}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{user.location}</span>
                </div>
                {(user.latitude || user.longitude) && (
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      {user.latitude && user.longitude 
                        ? `${user.latitude}, ${user.longitude}` 
                        : `Lat: ${user.latitude || 'N/A'}, Lng: ${user.longitude || 'N/A'}`}
                    </span>
                  </div>
                )}
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Age {user.age}</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Heart className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{user.matches} matches</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MessageCircle className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{user.messages} messages</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Eye className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{user.profileViews} profile views</span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Bio</h4>
              <p className="text-sm text-muted-foreground">{user.bio || 'No bio provided'}</p>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Interests</h4>
              <div className="flex flex-wrap gap-1">
                {user.interests && user.interests.length > 0 ? (
                  user.interests.map((interest: string, index: number) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {interest}
                    </Badge>
                  ))
                ) : (
                  <span className="text-sm text-muted-foreground">No interests added</span>
                )}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="activity" className="space-y-4">
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Online Status</h4>
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${user.isOnline ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                  <span className="text-sm">
                    {user.isOnline ? 'Online now' : `Last seen ${user.lastSeen}`}
                  </span>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Account Created</h4>
                <p className="text-sm text-muted-foreground">{user.createdAt}</p>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Profile Stats</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Photos uploaded</span>
                    <span>{user.photos}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Profile views</span>
                    <span>{user.profileViews}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Matches</span>
                    <span>{user.matches}</span>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="subscription" className="space-y-4">
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Current Plan</h4>
                <Badge className={subscriptionColors[user.subscription as keyof typeof subscriptionColors]}>
                  {user.subscription}
                </Badge>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Account Status</h4>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    {user.verified ? (
                      <>
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm text-green-600">Verified Account</span>
                      </>
                    ) : (
                      <>
                        <UserX className="h-4 w-4 text-yellow-500" />
                        <span className="text-sm text-yellow-600">Unverified Account</span>
                      </>
                    )}
                  </div>
                  {user.isTestUser && (
                    <div className="flex items-center space-x-2">
                      <Shield className="h-4 w-4 text-orange-500" />
                      <span className="text-sm text-orange-600">Test User</span>
                    </div>
                  )}
                  {user.isDummyUser && (
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4 text-purple-500" />
                      <span className="text-sm text-purple-600">Dummy User</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="actions" className="space-y-4">
            <div className="space-y-4">
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">
                  <Mail className="h-4 w-4 mr-2" />
                  Send Message
                </Button>
                <Button variant="outline" size="sm">
                  <Ban className="h-4 w-4 mr-2" />
                  Suspend User
                </Button>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium">Admin Actions</h4>
                <div className="flex flex-col space-y-2">
                  <Button variant="ghost" size="sm" className="justify-start">
                    <Shield className="h-4 w-4 mr-2" />
                    {user.verified ? 'Remove Verification' : 'Verify User'}
                  </Button>
                  <Button variant="ghost" size="sm" className="justify-start">
                    <Crown className="h-4 w-4 mr-2" />
                    Change Subscription
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="justify-start text-red-600"
                    onClick={() => confirmDeleteUser(user)}
                  >
                    <UserX className="h-4 w-4 mr-2" />
                    Delete Account
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Users</h1>
          <p className="text-muted-foreground">
            Manage and monitor all users on your platform
          </p>
        </div>
        <div className="flex gap-2">
          <AddUserModal onUserAdded={() => fetchUsers()} />
          <BulkUploadModal onUploadComplete={() => fetchUsers()} />
          <Button>
            <Download className="mr-2 h-4 w-4" />
            Export Users
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">+12% from last month</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {users.filter(u => u.isOnline).length}
            </div>
            <p className="text-xs text-muted-foreground">Currently online</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Verified Users</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {users.filter(u => u.verified).length}
            </div>
            <p className="text-xs text-muted-foreground">
              {totalUsers > 0 ? Math.round((users.filter(u => u.verified).length / totalUsers) * 100) : 0}% verified
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Premium Users</CardTitle>
            <Crown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {users.filter(u => u.subscription !== 'basic').length}
            </div>
            <p className="text-xs text-muted-foreground">
              {totalUsers > 0 ? Math.round((users.filter(u => u.subscription !== 'basic').length / totalUsers) * 100) : 0}% premium
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Test Users</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {users.filter(u => u.isTestUser).length}
            </div>
            <p className="text-xs text-muted-foreground">
              {totalUsers > 0 ? Math.round((users.filter(u => u.isTestUser).length / totalUsers) * 100) : 0}% test users
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Dummy Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {users.filter(u => u.isDummyUser).length}
            </div>
            <p className="text-xs text-muted-foreground">
              {totalUsers > 0 ? Math.round((users.filter(u => u.isDummyUser).length / totalUsers) * 100) : 0}% dummy users
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={subscriptionFilter} onValueChange={setSubscriptionFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Subscription" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Plans</SelectItem>
                <SelectItem value="basic">Basic</SelectItem>
                <SelectItem value="premium">Premium</SelectItem>
                <SelectItem value="platinum">Platinum</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={verificationFilter} onValueChange={setVerificationFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Verification" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Users</SelectItem>
                <SelectItem value="verified">Verified</SelectItem>
                <SelectItem value="unverified">Unverified</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={userTypeFilter} onValueChange={setUserTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="User Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="regular">Regular Users</SelectItem>
                <SelectItem value="test">Test Users</SelectItem>
                <SelectItem value="dummy">Dummy Users</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Users ({totalUsers.toLocaleString()})</CardTitle>
          <CardDescription>
            A list of all users in your dating app
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="ml-2">Loading users...</span>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Subscription</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead>Activity</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center space-x-3">
                        <Avatar>
                          <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`} />
                          <AvatarFallback>{user.name.split(' ').map((n: string) => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium flex items-center gap-2">
                            <button 
                              onClick={() => navigateToUserProfile(user.id)}
                              className="text-left hover:text-blue-600 transition-colors"
                            >
                              {user.name}
                            </button>
                            {user.verified && <Shield className="h-3 w-3 text-blue-500" />}
                            {user.isTestUser && <Badge variant="outline" className="text-xs bg-orange-50 text-orange-600">Test</Badge>}
                            {user.isDummyUser && <Badge variant="outline" className="text-xs bg-purple-50 text-purple-600">Dummy</Badge>}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {user.age} years • {user.location}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="text-sm">{user.email}</div>
                        <div className="text-sm text-muted-foreground">{user.phoneNumber}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <div className={`w-2 h-2 rounded-full ${user.isOnline ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                        {getStatusBadge(user.status)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={subscriptionColors[user.subscription as keyof typeof subscriptionColors]}>
                        {user.subscription}
                      </Badge>
                    </TableCell>
                    <TableCell>{user.createdAt}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {user.isOnline ? 'Online' : user.lastSeen}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => navigateToUserProfile(user.id)}
                          title="View Full Profile"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <UserDetailDialog user={user} />
                        <EditUserModal 
                          userId={user.id} 
                          onUserUpdated={() => fetchUsers()}
                        >
                          <Button variant="ghost" size="sm" title="Edit User">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </EditUserModal>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          title="Delete User"
                          onClick={() => confirmDeleteUser(user)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <UserX className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
          
          {users.length === 0 && !loading && (
            <div className="text-center py-8">
              <Users className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-2 text-sm font-semibold">No users found</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {searchTerm || statusFilter !== "all" || subscriptionFilter !== "all" || verificationFilter !== "all" || userTypeFilter !== "all"
                  ? "Try adjusting your filters"
                  : "No users have signed up yet"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete User Account</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this user account? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          {userToDelete && (
            <div className="py-4">
              <div className="flex items-center space-x-4 p-4 border rounded-lg bg-muted/50">
                <Avatar>
                  <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${userToDelete.name}`} />
                  <AvatarFallback>{userToDelete.name.split(' ').map((n: string) => n[0]).join('')}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium flex items-center gap-2">
                    {userToDelete.name}
                    {userToDelete.verified && <Shield className="h-3 w-3 text-blue-500" />}
                    {userToDelete.isTestUser && <Badge variant="outline" className="text-xs bg-orange-50 text-orange-600">Test</Badge>}
                    {userToDelete.isDummyUser && <Badge variant="outline" className="text-xs bg-purple-50 text-purple-600">Dummy</Badge>}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {userToDelete.email} • {userToDelete.phoneNumber}
                  </div>
                </div>
              </div>
              
              <div className="mt-4 p-4 border border-red-200 rounded-lg bg-red-50">
                <div className="flex items-start space-x-2">
                  <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-red-800">This will permanently delete:</h4>
                    <ul className="text-sm text-red-700 mt-1 space-y-1">
                      <li>• User profile and all personal data</li>
                      <li>• All uploaded photos and media</li>
                      <li>• Chat messages and conversations</li>
                      <li>• Matches and swipe history</li>
                      <li>• Subscription and payment data</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div className="flex justify-end space-x-2">
            <Button 
              variant="outline" 
              onClick={() => setShowDeleteDialog(false)}
              disabled={deletingUserId !== null}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => userToDelete && handleDeleteUser(userToDelete.id)}
              disabled={deletingUserId !== null}
            >
              {deletingUserId === userToDelete?.id ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <UserX className="mr-2 h-4 w-4" />
                  Delete User
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 