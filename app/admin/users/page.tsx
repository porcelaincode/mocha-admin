/* eslint-disable @typescript-eslint/no-explicit-any */

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
  Download
} from "lucide-react";

// Mock user data - replace with real data from your database
const mockUsers = [
  {
    id: "1",
    name: "Sarah Johnson",
    email: "sarah.j@email.com",
    phoneNumber: "+1234567890",
    age: 28,
    location: "New York, NY",
    verified: true,
    isOnline: true,
    lastSeen: "2 min ago",
    createdAt: "2024-01-15",
    subscription: "premium",
    matches: 45,
    messages: 234,
    profileViews: 1200,
    photos: 6,
    bio: "Love hiking and coffee ☕",
    interests: ["hiking", "coffee", "travel"],
    status: "active"
  },
  {
    id: "2",
    name: "Michael Chen",
    email: "m.chen@email.com",
    phoneNumber: "+1234567891",
    age: 32,
    location: "Los Angeles, CA",
    verified: false,
    isOnline: false,
    lastSeen: "1 hour ago",
    createdAt: "2024-01-10",
    subscription: "basic",
    matches: 12,
    messages: 89,
    profileViews: 456,
    photos: 4,
    bio: "Tech enthusiast and foodie",
    interests: ["tech", "food", "gaming"],
    status: "active"
  },
  {
    id: "3",
    name: "Emma Wilson",
    email: "emma.w@email.com",
    phoneNumber: "+1234567892",
    age: 25,
    location: "Chicago, IL",
    verified: true,
    isOnline: true,
    lastSeen: "just now",
    createdAt: "2024-02-01",
    subscription: "platinum",
    matches: 78,
    messages: 456,
    profileViews: 2100,
    photos: 8,
    bio: "Artist and yoga instructor 🧘‍♀️",
    interests: ["art", "yoga", "music"],
    status: "suspended"
  },
  // Add more mock users as needed
];

const subscriptionColors = {
  basic: "bg-gray-100 text-gray-800",
  premium: "bg-blue-100 text-blue-800",
  platinum: "bg-purple-100 text-purple-800"
};

export default function UsersPage() {
  const [users] = useState(mockUsers);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [subscriptionFilter, setSubscriptionFilter] = useState("all");
  const [verificationFilter, setVerificationFilter] = useState("all");

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || user.status === statusFilter;
    const matchesSubscription = subscriptionFilter === "all" || user.subscription === subscriptionFilter;
    const matchesVerification = verificationFilter === "all" || 
                               (verificationFilter === "verified" && user.verified) ||
                               (verificationFilter === "unverified" && !user.verified);
    
    return matchesSearch && matchesStatus && matchesSubscription && matchesVerification;
  });

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
              <p className="text-sm text-muted-foreground">{user.bio}</p>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Interests</h4>
              <div className="flex flex-wrap gap-1">
                {user.interests.map((interest: string) => (
                  <Badge key={interest} variant="outline" className="text-xs">
                    {interest}
                  </Badge>
                ))}
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
                <h4 className="font-medium mb-2">Profile Completion</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Photos ({user.photos}/10)</span>
                    <span>{(user.photos / 10 * 100).toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${user.photos / 10 * 100}%` }}
                    ></div>
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
                  {user.subscription.charAt(0).toUpperCase() + user.subscription.slice(1)}
                </Badge>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Usage Stats</h4>
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardContent className="p-3">
                      <div className="text-2xl font-bold">{user.matches}</div>
                      <p className="text-xs text-muted-foreground">Total Matches</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-3">
                      <div className="text-2xl font-bold">{user.messages}</div>
                      <p className="text-xs text-muted-foreground">Messages Sent</p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="actions" className="space-y-4">
            <div className="space-y-2">
              <Button variant="outline" className="w-full justify-start">
                <Mail className="mr-2 h-4 w-4" />
                Send Message
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <CheckCircle className="mr-2 h-4 w-4" />
                Verify User
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Crown className="mr-2 h-4 w-4" />
                Upgrade Subscription
              </Button>
              <Button variant="destructive" className="w-full justify-start">
                <Ban className="mr-2 h-4 w-4" />
                Suspend User
              </Button>
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
        <Button>
          <Download className="mr-2 h-4 w-4" />
          Export Users
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length.toLocaleString()}</div>
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
              {users.filter(u => u.status === 'active').length}
            </div>
            <p className="text-xs text-muted-foreground">+8% from last month</p>
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
            <p className="text-xs text-muted-foreground">+15% from last month</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Suspended</CardTitle>
            <UserX className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {users.filter(u => u.status === 'suspended').length}
            </div>
            <p className="text-xs text-muted-foreground">-5% from last month</p>
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
            
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              More Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Users ({filteredUsers.length})</CardTitle>
          <CardDescription>
            A list of all users in your system with their details and status.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Subscription</TableHead>
                <TableHead>Activity</TableHead>
                <TableHead>Stats</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`} />
                        <AvatarFallback>{user.name.split(' ').map((n: string) => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium flex items-center gap-2">
                          {user.name}
                          {user.verified && <Shield className="h-3 w-3 text-blue-500" />}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Age {user.age} • {user.location}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <div className="text-sm">
                      <div>{user.email}</div>
                      <div className="text-muted-foreground">{user.phoneNumber}</div>
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <div className="space-y-1">
                      {getStatusBadge(user.status)}
                      <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                        <div className={`w-2 h-2 rounded-full ${user.isOnline ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                        <span>{user.isOnline ? 'Online' : user.lastSeen}</span>
                      </div>
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <Badge className={subscriptionColors[user.subscription as keyof typeof subscriptionColors]}>
                      {user.subscription}
                    </Badge>
                  </TableCell>
                  
                  <TableCell>
                    <div className="text-sm">
                      <div>Joined {user.createdAt}</div>
                      <div className="text-muted-foreground">{user.photos} photos</div>
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <div className="text-sm">
                      <div>{user.matches} matches</div>
                      <div className="text-muted-foreground">{user.messages} messages</div>
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <UserDetailDialog user={user} />
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
} 