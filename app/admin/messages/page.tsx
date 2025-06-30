"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search,
  Filter,
  Eye,
  MessageCircle,
  Flag,
  Ban,
  Download,
  Send,
  AlertTriangle,
  CheckCircle,
  XCircle
} from "lucide-react";

// Mock conversations data
const mockConversations = [
  {
    id: "1",
    participants: [
      { id: "u1", name: "Sarah Johnson", avatar: "sarah" },
      { id: "u2", name: "Michael Chen", avatar: "michael" }
    ],
    lastMessage: {
      id: "m1",
      content: "Hey! How was your weekend?",
      senderId: "u1",
      timestamp: "2024-03-15T14:22:00Z",
      type: "text",
      status: "read"
    },
    messageCount: 23,
    createdAt: "2024-03-15T10:30:00Z",
    status: "active",
    flagged: false
  },
  {
    id: "2",
    participants: [
      { id: "u3", name: "Emma Wilson", avatar: "emma" },
      { id: "u4", name: "James Rodriguez", avatar: "james" }
    ],
    lastMessage: {
      id: "m2",
      content: "Would love to meet up for coffee sometime!",
      senderId: "u4",
      timestamp: "2024-03-14T18:30:00Z",
      type: "text",
      status: "delivered"
    },
    messageCount: 12,
    createdAt: "2024-03-14T16:45:00Z",
    status: "active",
    flagged: true
  }
];

const mockMessages = [
  {
    id: "m1",
    conversationId: "1",
    senderId: "u1",
    senderName: "Sarah Johnson",
    content: "Hey! How was your weekend?",
    timestamp: "2024-03-15T14:22:00Z",
    type: "text",
    status: "read"
  },
  {
    id: "m2",
    conversationId: "1",
    senderId: "u2",
    senderName: "Michael Chen",
    content: "It was great! Went hiking in Central Park. How about yours?",
    timestamp: "2024-03-15T14:25:00Z",
    type: "text",
    status: "read"
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

const getMessageStatusIcon = (status: string) => {
  switch (status) {
    case "sent":
      return <CheckCircle className="h-3 w-3 text-gray-400" />;
    case "delivered":
      return <CheckCircle className="h-3 w-3 text-blue-400" />;
    case "read":
      return <CheckCircle className="h-3 w-3 text-green-400" />;
    default:
      return <XCircle className="h-3 w-3 text-red-400" />;
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

export default function MessagesPage() {
  const [activeTab, setActiveTab] = useState("conversations");
  const [conversations] = useState(mockConversations);
  const [messages] = useState(mockMessages);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredConversations = conversations.filter(conv => {
    const searchMatch = conv.participants.some(p => 
      p.name.toLowerCase().includes(searchTerm.toLowerCase())
    ) || conv.lastMessage.content.toLowerCase().includes(searchTerm.toLowerCase());
    
    const statusMatch = statusFilter === "all" || conv.status === statusFilter;
    
    return searchMatch && statusMatch;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Messages</h1>
          <p className="text-muted-foreground">
            Monitor and manage conversations between users
          </p>
        </div>
        <Button>
          <Download className="mr-2 h-4 w-4" />
          Export Messages
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Conversations</CardTitle>
            <MessageCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{conversations.length.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">+18% from last month</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Conversations</CardTitle>
            <MessageCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {conversations.filter(c => c.status === 'active').length}
            </div>
            <p className="text-xs text-muted-foreground">+22% from last month</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Flagged</CardTitle>
            <Flag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {conversations.filter(c => c.flagged).length}
            </div>
            <p className="text-xs text-muted-foreground">-12% from last month</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Messages</CardTitle>
            <Send className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(conversations.reduce((acc, c) => acc + c.messageCount, 0) / conversations.length)}
            </div>
            <p className="text-xs text-muted-foreground">+5% from last month</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="conversations">Conversations</TabsTrigger>
          <TabsTrigger value="messages">All Messages</TabsTrigger>
          <TabsTrigger value="flagged">Flagged Content</TabsTrigger>
        </TabsList>

        <TabsContent value="conversations" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle>Filters</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search conversations..."
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

          {/* Conversations Table */}
          <Card>
            <CardHeader>
              <CardTitle>Conversations ({filteredConversations.length})</CardTitle>
              <CardDescription>
                All conversations between matched users
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Participants</TableHead>
                    <TableHead>Last Message</TableHead>
                    <TableHead>Messages</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Started</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredConversations.map((conversation) => (
                    <TableRow key={conversation.id}>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <div className="flex -space-x-2">
                            {conversation.participants.map((participant) => (
                              <Avatar key={participant.id} className="border-2 border-background">
                                <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${participant.avatar}`} />
                                <AvatarFallback>{participant.name.split(' ').map((n: string) => n[0]).join('')}</AvatarFallback>
                              </Avatar>
                            ))}
                          </div>
                          <div>
                            <div className="font-medium text-sm flex items-center gap-2">
                              {conversation.participants.map(p => p.name).join(' & ')}
                              {conversation.flagged && <Flag className="h-3 w-3 text-red-500" />}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="max-w-xs">
                          <p className="text-sm truncate">{conversation.lastMessage.content}</p>
                          <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                            {getMessageStatusIcon(conversation.lastMessage.status)}
                            <span>{formatTimeAgo(conversation.lastMessage.timestamp)}</span>
                          </div>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <MessageCircle className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{conversation.messageCount}</span>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        {getStatusBadge(conversation.status)}
                      </TableCell>
                      
                      <TableCell>
                        <div className="text-sm">
                          {formatTimeAgo(conversation.createdAt)}
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Flag className="h-4 w-4" />
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
        </TabsContent>

        <TabsContent value="messages" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>All Messages</CardTitle>
              <CardDescription>
                Individual messages across all conversations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {messages.map((message) => (
                  <div key={message.id} className="flex items-start space-x-3 p-4 rounded-lg border">
                    <Avatar>
                      <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${message.senderName}`} />
                      <AvatarFallback>{message.senderName.split(' ').map((n: string) => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{message.senderName}</span>
                        <span className="text-sm text-muted-foreground">
                          {formatTimeAgo(message.timestamp)}
                        </span>
                        {getMessageStatusIcon(message.status)}
                      </div>
                      <p className="text-sm">{message.content}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm">
                        <Flag className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Ban className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="flagged" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Flagged Content</CardTitle>
              <CardDescription>
                Messages and conversations that have been flagged for review
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No Flagged Content</h3>
                <p className="text-muted-foreground">
                  All conversations are currently clean. Flagged content will appear here.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 