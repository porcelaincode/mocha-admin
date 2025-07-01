/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/no-unescaped-entities */

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
  Flag,
  Download,
  CheckCircle,
  MessageSquare,
  TrendingUp,
  Users,
  Loader2,
  BarChart3,
  Activity,
  Trash2,
  UserX
} from "lucide-react";
import { 
  getMessages, 
  getConversations, 
  getConversationById, 
  getMessageAnalytics,
  getTopConversations,
  searchMessages,
  flagMessage,
  deleteMessage,
  deactivateConversation
} from "@/lib/admin-services";

interface Message {
  id: string;
  content: string;
  messageType: string;
  status: string;
  createdAt: string;
  updatedAt?: string;
  replyToId?: string;
  sender: {
    id: string;
    name: string;
    email: string;
  };
  conversation: {
    id: string;
    participants: string[];
  };
}

interface Conversation {
  id: string;
  matchId: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  participants: Array<{
    id: string;
    name: string;
    email: string;
    verified: boolean;
  }>;
  messageCount: number;
  lastMessage?: {
    content: string;
    type: string;
    createdAt: string;
  } | null;
  lastActivity: string;
}

interface MessageAnalytics {
  overview: {
    totalMessages: number;
    todayMessages: number;
    weekMessages: number;
    monthMessages: number;
    activeConversations: number;
    totalConversations: number;
    averageLength: number;
  };
  changes: {
    dailyChange: number;
    monthlyChange: number;
  };
  distribution: {
    types: Record<string, number>;
    statuses: Record<string, number>;
    hourly: Array<{ hour: number; count: number }>;
  };
}

export default function MessagesPage() {
  const [activeTab, setActiveTab] = useState("overview");
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<any>(null);
  const [analytics, setAnalytics] = useState<MessageAnalytics | null>(null);
  const [topConversations, setTopConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [conversationFilter, setConversationFilter] = useState("all");
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalMessages, setTotalMessages] = useState(0);
  const [totalConversations, setTotalConversations] = useState(0);
  const [searchResults, setSearchResults] = useState<Message[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const messagesPerPage = 20;

  useEffect(() => {
    if (activeTab === "messages") {
      fetchMessages();
    } else if (activeTab === "conversations") {
      fetchConversations();
    } else if (activeTab === "overview") {
      fetchAnalytics();
      fetchTopConversations();
    }
  }, [activeTab, currentPage, searchTerm, statusFilter, typeFilter, conversationFilter]);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const filters: any = {};
      if (searchTerm) filters.search = searchTerm;
      if (statusFilter !== "all") filters.status = statusFilter;
      if (typeFilter !== "all") filters.messageType = typeFilter;

      const result = await getMessages(currentPage, messagesPerPage, filters);
      setMessages(result.messages);
      setTotalMessages(result.total);
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchConversations = async () => {
    setLoading(true);
    try {
      const filters: any = {};
      if (searchTerm) filters.search = searchTerm;
      if (conversationFilter === "active") filters.active = true;
      if (conversationFilter === "inactive") filters.active = false;

      const result = await getConversations(currentPage, messagesPerPage, filters);
      setConversations(result.conversations);
      setTotalConversations(result.total);
    } catch (error) {
      console.error("Error fetching conversations:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const analyticsData = await getMessageAnalytics();
      setAnalytics(analyticsData);
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTopConversations = async () => {
    try {
      const topConvs = await getTopConversations(5);
      setTopConversations(topConvs);
    } catch (error) {
      console.error("Error fetching top conversations:", error);
    }
  };

  const handleSearch = async (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
    
    if (value.length > 2) {
      setIsSearching(true);
      try {
        const results = await searchMessages(value, 50);
        setSearchResults(results);
      } catch (error) {
        console.error("Error searching messages:", error);
      } finally {
        setIsSearching(false);
      }
    } else {
      setSearchResults([]);
    }
  };

  const handleViewConversation = async (conversationId: string) => {
    try {
      const conversation = await getConversationById(conversationId);
      setSelectedConversation(conversation);
    } catch (error) {
      console.error("Error fetching conversation:", error);
    }
  };

  const handleFlagMessage = async (messageId: string, flagged: boolean) => {
    try {
      await flagMessage(messageId, flagged);
      // Refresh current view
      if (activeTab === "messages") {
        fetchMessages();
      } else if (selectedConversation) {
        handleViewConversation(selectedConversation.id);
      }
    } catch (error) {
      console.error("Error flagging message:", error);
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    if (!confirm("Are you sure you want to delete this message?")) return;
    
    try {
      await deleteMessage(messageId);
      // Refresh current view
      if (activeTab === "messages") {
        fetchMessages();
      } else if (selectedConversation) {
        handleViewConversation(selectedConversation.id);
      }
    } catch (error) {
      console.error("Error deleting message:", error);
    }
  };

  const handleDeactivateConversation = async (conversationId: string) => {
    if (!confirm("Are you sure you want to deactivate this conversation?")) return;
    
    try {
      await deactivateConversation(conversationId);
      fetchConversations();
    } catch (error) {
      console.error("Error deactivating conversation:", error);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      sent: "default",
      delivered: "secondary",
      read: "default",
      flagged: "destructive",
      deleted: "outline"
    };
    const colors: Record<string, string> = {
      sent: "text-blue-600",
      delivered: "text-green-600", 
      read: "text-gray-600",
      flagged: "text-red-600",
      deleted: "text-gray-400"
    };
    return <Badge variant={variants[status] || "default"} className={colors[status]}>{status}</Badge>;
  };

  const getTypeBadge = (type: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      text: "default",
      image: "secondary",
      video: "outline",
      audio: "destructive",
      gif: "secondary",
      emoji: "outline",
      location: "destructive"
    };
    return <Badge variant={variants[type] || "default"}>{type}</Badge>;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString();
  };

  const totalPages = Math.ceil((activeTab === "messages" ? totalMessages : totalConversations) / messagesPerPage);

  if (loading && !analytics && messages.length === 0 && conversations.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Messages & Conversations</h1>
          <p className="text-muted-foreground">
            Monitor conversations, analyze messaging patterns, and manage content
          </p>
        </div>
        <Button>
          <Download className="mr-2 h-4 w-4" />
          Export Data
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="conversations">Conversations</TabsTrigger>
          <TabsTrigger value="messages">All Messages</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {analytics && (
            <>
              {/* Overview Stats */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Messages</CardTitle>
                    <MessageSquare className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{analytics.overview.totalMessages.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">All time messages</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Today's Messages</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{analytics.overview.todayMessages}</div>
                    <p className="text-xs text-muted-foreground">
                      {analytics.changes.dailyChange > 0 ? '+' : ''}{analytics.changes.dailyChange.toFixed(1)}% from yesterday
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Active Conversations</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{analytics.overview.activeConversations}</div>
                    <p className="text-xs text-muted-foreground">Currently active chats</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Average Length</CardTitle>
                    <BarChart3 className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{analytics.overview.averageLength}</div>
                    <p className="text-xs text-muted-foreground">Characters per message</p>
                  </CardContent>
                </Card>
              </div>

              {/* Message Types Distribution */}
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Message Types</CardTitle>
                    <CardDescription>Distribution of message types this month</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {Object.keys(analytics.distribution.types).length === 0 ? (
                      <div className="text-center py-6">
                        <MessageSquare className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">No message types data available</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {Object.entries(analytics.distribution.types).map(([type, count]) => {
                          const percentage = analytics.overview.monthMessages > 0 
                            ? (count / analytics.overview.monthMessages * 100).toFixed(1)
                            : '0';
                          return (
                            <div key={type} className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                {getTypeBadge(type)}
                                <span className="text-sm">{type}</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Progress value={parseFloat(percentage)} className="w-20" />
                                <span className="text-sm font-medium">{count}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Top Conversations</CardTitle>
                    <CardDescription>Most active conversations by message count</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {topConversations.length === 0 ? (
                      <div className="text-center py-6">
                        <Users className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">No active conversations yet</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {topConversations.map((conv, index) => (
                          <div key={conv.id} className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                                {index + 1}
                              </div>
                              <span className="text-sm">{conv.participants.join(' & ')}</span>
                            </div>
                            <div className="text-sm font-medium">{conv.messageCount} messages</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Hourly Activity */}
              <Card>
                <CardHeader>
                  <CardTitle>Today's Activity</CardTitle>
                  <CardDescription>Message volume by hour</CardDescription>
                </CardHeader>
                <CardContent>
                  {analytics.overview.todayMessages === 0 ? (
                    <div className="text-center py-8">
                      <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">No Activity Today</h3>
                      <p className="text-muted-foreground">
                        No messages have been sent today. Activity will appear here when users start messaging.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-12 gap-1">
                      {analytics.distribution.hourly.map(({ hour, count }) => {
                        const maxCount = Math.max(...analytics.distribution.hourly.map(h => h.count));
                        const height = maxCount > 0 ? Math.max(4, (count / maxCount) * 40) : 4;
                        return (
                          <div key={hour} className="text-center">
                            <div 
                              className="bg-primary/20 rounded-sm mb-1" 
                              style={{ height: `${height}px` }}
                              title={`${hour}:00 - ${count} messages`}
                            />
                            <div className="text-xs text-muted-foreground">{hour}</div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        <TabsContent value="conversations" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle>Filter Conversations</CardTitle>
              <CardDescription>Search and filter conversations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search conversations..."
                      value={searchTerm}
                      onChange={(e) => handleSearch(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                </div>
                <Select value={conversationFilter} onValueChange={setConversationFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Conversations</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Conversations Table */}
          <Card>
            <CardHeader>
              <CardTitle>Conversations</CardTitle>
              <CardDescription>
                Showing {conversations.length} of {totalConversations} conversations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Participants</TableHead>
                      <TableHead>Messages</TableHead>
                      <TableHead>Last Message</TableHead>
                      <TableHead>Last Activity</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                          <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                        </TableCell>
                      </TableRow>
                    ) : conversations.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                          No conversations found
                        </TableCell>
                      </TableRow>
                    ) : (
                      conversations.map((conversation) => (
                        <TableRow key={conversation.id}>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <div>
                                <div className="font-medium">
                                  {conversation.participants.map(p => p.name).join(' & ')}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {conversation.participants.map(p => p.verified ? '✓' : '').join(' ')}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">{conversation.messageCount}</Badge>
                          </TableCell>
                          <TableCell className="max-w-xs">
                            {conversation.lastMessage ? (
                              <div>
                                <div className="truncate text-sm">
                                  {conversation.lastMessage.content.length > 30 
                                    ? `${conversation.lastMessage.content.substring(0, 30)}...` 
                                    : conversation.lastMessage.content
                                  }
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {getTypeBadge(conversation.lastMessage.type)}
                                </div>
                              </div>
                            ) : (
                              <span className="text-muted-foreground">No messages</span>
                            )}
                          </TableCell>
                          <TableCell className="text-sm">
                            {formatDate(conversation.lastActivity)}
                          </TableCell>
                          <TableCell>
                            <Badge variant={conversation.active ? "default" : "outline"}>
                              {conversation.active ? "Active" : "Inactive"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleViewConversation(conversation.id)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              {conversation.active && (
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => handleDeactivateConversation(conversation.id)}
                                >
                                  <UserX className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between space-x-2 py-4">
                  <div className="text-sm text-muted-foreground">
                    Page {currentPage} of {totalPages}
                  </div>
                  <div className="space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="messages" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle>Filter Messages</CardTitle>
              <CardDescription>Search and filter messages by various criteria</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search messages..."
                      value={searchTerm}
                      onChange={(e) => handleSearch(e.target.value)}
                      className="pl-8"
                    />
                    {isSearching && <Loader2 className="absolute right-2 top-2.5 h-4 w-4 animate-spin" />}
                  </div>
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="sent">Sent</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                    <SelectItem value="read">Read</SelectItem>
                    <SelectItem value="flagged">Flagged</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="text">Text</SelectItem>
                    <SelectItem value="image">Image</SelectItem>
                    <SelectItem value="video">Video</SelectItem>
                    <SelectItem value="audio">Audio</SelectItem>
                    <SelectItem value="gif">GIF</SelectItem>
                    <SelectItem value="emoji">Emoji</SelectItem>
                    <SelectItem value="location">Location</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Search Results</CardTitle>
                <CardDescription>
                  Found {searchResults.length} messages matching "{searchTerm}"
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {searchResults.map((message) => (
                    <div key={message.id} className="flex items-start space-x-3 p-4 rounded-lg border">
                      <Avatar>
                        <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${message.sender.name}`} />
                        <AvatarFallback>{message.sender.name.split(' ').map((n: string) => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">{message.sender.name}</span>
                          <span className="text-sm text-muted-foreground">
                            {formatDate(message.createdAt)}
                          </span>
                          {getStatusBadge(message.status)}
                          {getTypeBadge(message.messageType)}
                        </div>
                        <p className="text-sm">{message.content}</p>
                        <p className="text-xs text-muted-foreground">
                          Conversation: {message.conversation.participants.join(' & ')}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleFlagMessage(message.id, message.status !== 'flagged')}
                        >
                          <Flag className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDeleteMessage(message.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Messages Table */}
          <Card>
            <CardHeader>
              <CardTitle>All Messages</CardTitle>
              <CardDescription>
                Showing {messages.length} of {totalMessages} messages
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Sender</TableHead>
                      <TableHead>Content</TableHead>
                      <TableHead>Conversation</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8">
                          <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                        </TableCell>
                      </TableRow>
                    ) : messages.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8">
                          No messages found
                        </TableCell>
                      </TableRow>
                    ) : (
                      messages.map((message) => (
                        <TableRow key={message.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{message.sender.name}</div>
                              <div className="text-sm text-muted-foreground">{message.sender.email}</div>
                            </div>
                          </TableCell>
                          <TableCell className="max-w-xs">
                            <div className="truncate">
                              {message.content.length > 50 
                                ? `${message.content.substring(0, 50)}...` 
                                : message.content
                              }
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              {message.conversation.participants.join(' & ')}
                            </div>
                          </TableCell>
                          <TableCell>{getTypeBadge(message.messageType)}</TableCell>
                          <TableCell>{getStatusBadge(message.status)}</TableCell>
                          <TableCell className="text-sm">
                            {formatDate(message.createdAt)}
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => setSelectedMessage(message)}
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-2xl">
                                  <DialogHeader>
                                    <DialogTitle>Message Details</DialogTitle>
                                    <DialogDescription>
                                      Full message content and metadata
                                    </DialogDescription>
                                  </DialogHeader>
                                  {selectedMessage && (
                                    <div className="space-y-4">
                                      <div className="grid grid-cols-2 gap-4">
                                        <div>
                                          <h4 className="font-semibold mb-2">Sender</h4>
                                          <p>{selectedMessage.sender.name}</p>
                                          <p className="text-sm text-muted-foreground">{selectedMessage.sender.email}</p>
                                        </div>
                                        <div>
                                          <h4 className="font-semibold mb-2">Conversation</h4>
                                          <p>{selectedMessage.conversation.participants.join(' & ')}</p>
                                        </div>
                                      </div>
                                      <div>
                                        <h4 className="font-semibold mb-2">Content</h4>
                                        <div className="p-3 bg-muted rounded-md">
                                          {selectedMessage.content}
                                        </div>
                                      </div>
                                      <div className="flex space-x-4">
                                        <div>
                                          <h4 className="font-semibold mb-1">Type</h4>
                                          {getTypeBadge(selectedMessage.messageType)}
                                        </div>
                                        <div>
                                          <h4 className="font-semibold mb-1">Status</h4>
                                          {getStatusBadge(selectedMessage.status)}
                                        </div>
                                        <div>
                                          <h4 className="font-semibold mb-1">Date</h4>
                                          <p className="text-sm">{formatDate(selectedMessage.createdAt)}</p>
                                        </div>
                                      </div>
                                      <div className="flex space-x-2 pt-4">
                                        <Button 
                                          variant="outline" 
                                          size="sm"
                                          onClick={() => handleFlagMessage(selectedMessage.id, selectedMessage.status !== 'flagged')}
                                        >
                                          {selectedMessage.status === 'flagged' ? 'Unflag' : 'Flag'} Message
                                        </Button>
                                        <Button 
                                          variant="destructive" 
                                          size="sm"
                                          onClick={() => handleDeleteMessage(selectedMessage.id)}
                                        >
                                          Delete Message
                                        </Button>
                                      </div>
                                    </div>
                                  )}
                                </DialogContent>
                              </Dialog>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleFlagMessage(message.id, message.status !== 'flagged')}
                              >
                                <Flag className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleDeleteMessage(message.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between space-x-2 py-4">
                  <div className="text-sm text-muted-foreground">
                    Page {currentPage} of {totalPages}
                  </div>
                  <div className="space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          {analytics && (
            <>
              {/* Detailed Analytics */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                  <CardHeader>
                    <CardTitle>Weekly Trend</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{analytics.overview.weekMessages}</div>
                    <p className="text-sm text-muted-foreground">Messages this week</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Monthly Trend</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{analytics.overview.monthMessages}</div>
                    <p className="text-sm text-muted-foreground">
                      {analytics.changes.monthlyChange > 0 ? '+' : ''}{analytics.changes.monthlyChange.toFixed(1)}% from last month
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Total Conversations</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{analytics.overview.totalConversations}</div>
                    <p className="text-sm text-muted-foreground">All conversations</p>
                  </CardContent>
                </Card>
              </div>

              {/* Status Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Message Status Distribution</CardTitle>
                  <CardDescription>Current month message statuses</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {Object.entries(analytics.distribution.statuses).map(([status, count]) => (
                      <div key={status} className="text-center">
                        <div className="text-2xl font-bold">{count}</div>
                        {getStatusBadge(status)}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>
      </Tabs>

      {/* Conversation Detail Modal */}
      {selectedConversation && (
        <Dialog open={!!selectedConversation} onOpenChange={() => setSelectedConversation(null)}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Conversation Details</DialogTitle>
              <DialogDescription>
                {selectedConversation.participants.map((p: any) => p.name).join(' & ')}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Participants</h4>
                  {selectedConversation.participants.map((participant: any) => (
                    <div key={participant.id} className="flex items-center space-x-2">
                      <span>{participant.name}</span>
                      {participant.verified && <CheckCircle className="h-4 w-4 text-green-500" />}
                    </div>
                  ))}
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Details</h4>
                  <p className="text-sm">Messages: {selectedConversation.messages.length}</p>
                  <p className="text-sm">Created: {formatDate(selectedConversation.createdAt)}</p>
                  <p className="text-sm">Last Activity: {formatDate(selectedConversation.updatedAt)}</p>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Messages</h4>
                <div className="max-h-96 overflow-y-auto space-y-2 border rounded-lg p-4">
                  {selectedConversation.messages.map((message: any) => (
                    <div key={message.id} className="flex items-start space-x-2 p-2 rounded border-l-2 border-l-primary/20">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-medium text-sm">{message.sender.name}</span>
                          <span className="text-xs text-muted-foreground">{formatTime(message.createdAt)}</span>
                          {getTypeBadge(message.messageType)}
                          {getStatusBadge(message.status)}
                        </div>
                        <p className="text-sm">{message.content}</p>
                      </div>
                      <div className="flex space-x-1">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleFlagMessage(message.id, message.status !== 'flagged')}
                        >
                          <Flag className="h-3 w-3" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDeleteMessage(message.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
} 