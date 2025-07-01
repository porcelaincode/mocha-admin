/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */

"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import {
  Search,
  Eye,
  Heart,
  MessageCircle,
  TrendingUp,
  Zap,
  Ban,
  Download,
  Loader2
} from "lucide-react";
import { getMatches } from "@/lib/admin-services";

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
  if (!dateString) return "Never";
  
  const date = new Date(dateString);
  const now = new Date();
  const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
  
  if (diffInHours < 1) return "Just now";
  if (diffInHours < 24) return `${diffInHours}h ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) return `${diffInDays}d ago`;
  return date.toLocaleDateString();
};

export default function MatchesPage() {
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [totalMatches, setTotalMatches] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchMatches();
  }, [searchTerm, statusFilter, currentPage]);

  const fetchMatches = async () => {
    try {
      setLoading(true);
      const result = await getMatches(currentPage, 50, {
        search: searchTerm || undefined,
        status: statusFilter !== "all" ? statusFilter : undefined,
      });
      
      setMatches(result.matches);
      setTotalMatches(result.total);
    } catch (error) {
      console.error('Error fetching matches:', error);
      setMatches([]);
      setTotalMatches(0);
    } finally {
      setLoading(false);
    }
  };

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
            <div className="text-2xl font-bold">{totalMatches.toLocaleString()}</div>
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
              {matches.length > 0 ? Math.round(matches.reduce((acc, m) => acc + m.compatibility, 0) / matches.length) : 0}%
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
          </div>
        </CardContent>
      </Card>

      {/* Matches Table */}
      <Card>
        <CardHeader>
          <CardTitle>Matches ({totalMatches.toLocaleString()})</CardTitle>
          <CardDescription>
            All matches created on your platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="ml-2">Loading matches...</span>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Match</TableHead>
                  <TableHead>Users</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Messages</TableHead>
                  <TableHead>Compatibility</TableHead>
                  <TableHead>Matched</TableHead>
                  <TableHead>Last Activity</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {matches.map((match) => (
                  <TableRow key={match.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center space-x-2">
                        <Heart className="h-4 w-4 text-red-500" />
                        <span className="text-sm font-mono">{match.id.slice(0, 8)}</span>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="flex items-center space-x-3">
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
                            {match.user1.age}, {match.user1.location} • {match.user2.age}, {match.user2.location}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      {getStatusBadge(match.status)}
                    </TableCell>
                    
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <MessageCircle className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{match.messagesCount}</span>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <div className="w-full bg-gray-200 rounded-full h-2 max-w-[60px]">
                          <div 
                            className="bg-green-600 h-2 rounded-full" 
                            style={{ width: `${match.compatibility}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium">{match.compatibility}%</span>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="text-sm">
                        {formatTimeAgo(match.matchedAt)}
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="text-sm text-muted-foreground">
                        {formatTimeAgo(match.lastActivity)}
                      </div>
                    </TableCell>
                    
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end space-x-2">
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
          )}
          
          {matches.length === 0 && !loading && (
            <div className="text-center py-8">
              <Heart className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-2 text-sm font-semibold">No matches found</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {searchTerm || statusFilter !== "all"
                  ? "Try adjusting your filters"
                  : "No matches have been made yet"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 