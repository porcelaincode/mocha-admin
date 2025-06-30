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
  Eye,
  Heart,
  MessageCircle,
  MapPin,
  TrendingUp,
  Clock,
  Zap,
  Ban,
  Download
} from "lucide-react";

// Mock matches data
const mockMatches = [
  {
    id: "1",
    user1: {
      id: "u1",
      name: "Sarah Johnson",
      age: 28,
      location: "New York, NY",
      avatar: "sarah"
    },
    user2: {
      id: "u2", 
      name: "Michael Chen",
      age: 32,
      location: "New York, NY",
      avatar: "michael"
    },
    matchedAt: "2024-03-15T10:30:00Z",
    lastActivity: "2024-03-15T14:22:00Z",
    messagesCount: 23,
    status: "active",
    compatibility: 85,
    mutualInterests: ["coffee", "hiking", "travel"]
  },
  {
    id: "2",
    user1: {
      id: "u3",
      name: "Emma Wilson", 
      age: 25,
      location: "Chicago, IL",
      avatar: "emma"
    },
    user2: {
      id: "u4",
      name: "James Rodriguez",
      age: 29,
      location: "Chicago, IL", 
      avatar: "james"
    },
    matchedAt: "2024-03-14T16:45:00Z",
    lastActivity: "2024-03-14T18:30:00Z",
    messagesCount: 12,
    status: "active",
    compatibility: 92,
    mutualInterests: ["art", "music", "yoga"]
  }
];

const getStatusBadge = (status: string) => {
  switch (status) {
    case "active":
      return <Badge className="bg-green-100 text-green-800">Active</Badge>;
    case "inactive":
      return <Badge className="bg-yellow-100 text-yellow-800">Inactive</Badge>;
    case "blocked":
      return <Badge className="bg-red-100 text-red-800">Blocked</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

const formatTimeAgo = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
  
  if (diffInHours < 1) return "Just now";
  if (diffInHours < 24) return `${diffInHours}h ago`;
  return `${Math.floor(diffInHours / 24)}d ago`;
};

export default function MatchesPage() {
  const [matches] = useState(mockMatches);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredMatches = matches.filter(match => {
    const searchMatch = match.user1.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       match.user2.name.toLowerCase().includes(searchTerm.toLowerCase());
    const statusMatch = statusFilter === "all" || match.status === statusFilter;
    return searchMatch && statusMatch;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Matches</h1>
          <p className="text-muted-foreground">
            View and manage all user matches on your platform
          </p>
        </div>
        <Button>
          <Download className="mr-2 h-4 w-4" />
          Export Matches
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Matches</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{matches.length.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">+15% from last month</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Matches</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {matches.filter(m => m.status === 'active').length}
            </div>
            <p className="text-xs text-muted-foreground">+8% from last month</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">With Messages</CardTitle>
            <MessageCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {matches.filter(m => m.messagesCount > 0).length}
            </div>
            <p className="text-xs text-muted-foreground">+22% from last month</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Compatibility</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(matches.reduce((acc, m) => acc + m.compatibility, 0) / matches.length)}%
            </div>
            <p className="text-xs text-muted-foreground">+3% from last month</p>
          </CardContent>
        </Card>
      </div>

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
                placeholder="Search matches..."
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
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="blocked">Blocked</SelectItem>
              </SelectContent>
            </Select>
            
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              More Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Matches Table */}
      <Card>
        <CardHeader>
          <CardTitle>Matches ({filteredMatches.length})</CardTitle>
          <CardDescription>
            All matches between users on your platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Users</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Compatibility</TableHead>
                <TableHead>Messages</TableHead>
                <TableHead>Matched</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMatches.map((match) => (
                <TableRow key={match.id}>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <div className="flex -space-x-2">
                        <Avatar className="border-2 border-background">
                          <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${match.user1.avatar}`} />
                          <AvatarFallback>{match.user1.name.split(' ').map((n: string) => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <Avatar className="border-2 border-background">
                          <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${match.user2.avatar}`} />
                          <AvatarFallback>{match.user2.name.split(' ').map((n: string) => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                      </div>
                      <div>
                        <div className="font-medium text-sm">
                          {match.user1.name} & {match.user2.name}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Ages {match.user1.age} & {match.user2.age}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <div className="text-sm">
                      <div className="flex items-center">
                        <MapPin className="h-3 w-3 mr-1 text-muted-foreground" />
                        {match.user1.location}
                      </div>
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    {getStatusBadge(match.status)}
                  </TableCell>
                  
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <div className="w-12 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full" 
                          style={{ width: `${match.compatibility}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium">{match.compatibility}%</span>
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <MessageCircle className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{match.messagesCount}</span>
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <div className="text-sm">
                      {formatTimeAgo(match.matchedAt)}
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Ban className="h-4 w-4" />
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