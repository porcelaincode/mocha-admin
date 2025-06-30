"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Search, 
  Flag, 
  Eye, 
  Check, 
  X,
  AlertTriangle,
  User,
  MessageSquare,
  Image as ImageIcon,
  Shield
} from "lucide-react";

const mockReports = [
  {
    id: "1",
    reporterId: "user1",
    reporterName: "Alice Johnson",
    reporterAvatar: "/api/placeholder/40/40",
    reportedUserId: "user2",
    reportedUserName: "Bob Smith",
    reportedUserAvatar: "/api/placeholder/40/40",
    type: "inappropriate_content",
    category: "profile",
    reason: "Inappropriate photos",
    description: "User has uploaded explicit content that violates community guidelines",
    status: "pending",
    createdAt: "2024-01-20",
    priority: "high"
  },
  {
    id: "2",
    reporterId: "user3",
    reporterName: "Carol Davis",
    reporterAvatar: "/api/placeholder/40/40",
    reportedUserId: "user4",
    reportedUserName: "David Wilson",
    reportedUserAvatar: "/api/placeholder/40/40",
    type: "harassment",
    category: "message",
    reason: "Abusive messages",
    description: "User sent threatening and abusive messages",
    status: "investigating",
    createdAt: "2024-01-18",
    priority: "high"
  },
  {
    id: "3",
    reporterId: "user5",
    reporterName: "Eve Brown",
    reporterAvatar: "/api/placeholder/40/40",
    reportedUserId: "user6",
    reportedUserName: "Frank Miller",
    reportedUserAvatar: "/api/placeholder/40/40",
    type: "fake_profile",
    category: "profile",
    reason: "Fake identity",
    description: "Profile appears to be using stolen photos",
    status: "resolved",
    createdAt: "2024-01-15",
    priority: "medium"
  }
];

export default function ReportsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  const filteredReports = mockReports.filter(report => {
    const matchesSearch = report.reportedUserName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.reporterName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || report.status === statusFilter;
    const matchesType = typeFilter === "all" || report.type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="default" className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case "investigating":
        return <Badge variant="default" className="bg-blue-100 text-blue-800">Investigating</Badge>;
      case "resolved":
        return <Badge variant="default" className="bg-green-100 text-green-800">Resolved</Badge>;
      case "dismissed":
        return <Badge variant="secondary">Dismissed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "high":
        return <Badge variant="destructive">High</Badge>;
      case "medium":
        return <Badge variant="default" className="bg-orange-100 text-orange-800">Medium</Badge>;
      case "low":
        return <Badge variant="outline">Low</Badge>;
      default:
        return <Badge variant="outline">{priority}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
        <p className="text-muted-foreground">
          Manage user reports and content violations
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reports</CardTitle>
            <Flag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,234</div>
            <p className="text-xs text-muted-foreground">+89 this week</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">156</div>
            <p className="text-xs text-muted-foreground">Needs attention</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Priority</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">23</div>
            <p className="text-xs text-muted-foreground">Urgent cases</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolved Today</CardTitle>
            <Check className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">45</div>
            <p className="text-xs text-muted-foreground">Cases closed</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Report Management</CardTitle>
          <CardDescription>Review and resolve user reports</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search reports..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="investigating">Investigating</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="dismissed">Dismissed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="inappropriate_content">Inappropriate Content</SelectItem>
                <SelectItem value="harassment">Harassment</SelectItem>
                <SelectItem value="fake_profile">Fake Profile</SelectItem>
                <SelectItem value="spam">Spam</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Reports List */}
      <div className="space-y-4">
        {filteredReports.map((report) => (
          <Card key={report.id}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-4 flex-1">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={report.reporterAvatar} />
                        <AvatarFallback>{report.reporterName[0]}</AvatarFallback>
                      </Avatar>
                      <span className="text-sm text-muted-foreground">
                        {report.reporterName} reported
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={report.reportedUserAvatar} />
                        <AvatarFallback>{report.reportedUserName[0]}</AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{report.reportedUserName}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">{report.type.replace('_', ' ')}</Badge>
                      <Badge variant="outline">{report.category}</Badge>
                      {getStatusBadge(report.status)}
                      {getPriorityBadge(report.priority)}
                    </div>
                    <div>
                      <p className="font-medium">{report.reason}</p>
                      <p className="text-sm text-muted-foreground">{report.description}</p>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Reported on {report.createdAt}
                    </p>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Report Details</DialogTitle>
                        <DialogDescription>
                          Review and take action on this report
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="font-medium">Reporter</label>
                            <div className="flex items-center space-x-2 mt-1">
                              <Avatar className="h-6 w-6">
                                <AvatarImage src={report.reporterAvatar} />
                                <AvatarFallback>{report.reporterName[0]}</AvatarFallback>
                              </Avatar>
                              <span className="text-sm">{report.reporterName}</span>
                            </div>
                          </div>
                          <div>
                            <label className="font-medium">Reported User</label>
                            <div className="flex items-center space-x-2 mt-1">
                              <Avatar className="h-6 w-6">
                                <AvatarImage src={report.reportedUserAvatar} />
                                <AvatarFallback>{report.reportedUserName[0]}</AvatarFallback>
                              </Avatar>
                              <span className="text-sm">{report.reportedUserName}</span>
                            </div>
                          </div>
                        </div>
                        <div>
                          <label className="font-medium">Report Details</label>
                          <div className="mt-2 space-y-2">
                            <p><strong>Type:</strong> {report.type.replace('_', ' ')}</p>
                            <p><strong>Category:</strong> {report.category}</p>
                            <p><strong>Reason:</strong> {report.reason}</p>
                            <p><strong>Description:</strong> {report.description}</p>
                            <p><strong>Priority:</strong> {report.priority}</p>
                            <p><strong>Date:</strong> {report.createdAt}</p>
                          </div>
                        </div>
                        {report.status === "pending" && (
                          <div className="flex gap-2">
                            <Button variant="default" className="flex-1">
                              <Check className="h-4 w-4 mr-2" />
                              Take Action
                            </Button>
                            <Button variant="outline" className="flex-1">
                              <X className="h-4 w-4 mr-2" />
                              Dismiss
                            </Button>
                          </div>
                        )}
                      </div>
                    </DialogContent>
                  </Dialog>
                  {report.status === "pending" && (
                    <>
                      <Button variant="default" size="sm">
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <X className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
} 