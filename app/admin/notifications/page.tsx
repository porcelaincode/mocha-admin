/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  Bell, 
  Search, 
  Eye, 
  Send, 
  Plus,
  Users,
  Mail,
  Smartphone,
  Clock,
  Loader2
} from 'lucide-react';
import { getNotifications } from '@/lib/admin-services';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  status: string;
  recipients: string;
  sentAt: string;
  createdAt: string;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalNotifications, setTotalNotifications] = useState(0);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newNotification, setNewNotification] = useState({
    type: 'system',
    title: '',
    message: '',
    recipients: 'all_users'
  });
  const [stats, setStats] = useState({
    totalNotifications: 0,
    sentToday: 0,
    pendingNotifications: 0,
    totalRecipients: 0
  });

  const notificationsPerPage = 20;

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const filters = {
        search: searchTerm || undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        type: typeFilter !== 'all' ? typeFilter : undefined
      };

      const result = await getNotifications(currentPage, notificationsPerPage, filters);
      setNotifications(result.notifications);
      setTotalNotifications(result.total);

      // Calculate stats
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const sentToday = result.notifications.filter(n => 
        new Date(n.sentAt) >= today
      ).length;

      setStats({
        totalNotifications: result.total,
        sentToday,
        pendingNotifications: result.notifications.filter(n => n.status === 'pending').length,
        totalRecipients: result.notifications.reduce((sum, n) => 
          sum + (n.recipients === 'all_users' ? 1000 : 100), 0) // Mock calculation
      });
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, notificationsPerPage, searchTerm, statusFilter, typeFilter]);


  useEffect(() => {
    fetchNotifications();
  }, [currentPage, searchTerm, statusFilter, typeFilter, fetchNotifications]);


  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleStatusFilter = (value: string) => {
    setStatusFilter(value);
    setCurrentPage(1);
  };

  const handleTypeFilter = (value: string) => {
    setTypeFilter(value);
    setCurrentPage(1);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      sent: "default",
      pending: "secondary",
      failed: "destructive",
      scheduled: "outline"
    };
    return <Badge variant={variants[status] || "default"}>{status}</Badge>;
  };

  const getTypeBadge = (type: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      system: "default",
      promotional: "secondary",
      security: "destructive",
      update: "outline"
    };
    return <Badge variant={variants[type] || "default"}>{type}</Badge>;
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'email':
        return <Mail className="h-4 w-4" />;
      case 'push':
        return <Smartphone className="h-4 w-4" />;
      case 'in_app':
        return <Bell className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const handleCreateNotification = async () => {
    try {
      // In a real implementation, you would call an API to create the notification
      console.log('Creating notification:', newNotification);
      
      // Add to local state (mock)
      const mockNotification: Notification = {
        id: Date.now().toString(),
        ...newNotification,
        status: 'pending',
        sentAt: new Date().toISOString(),
        createdAt: new Date().toISOString()
      };
      
      setNotifications([mockNotification, ...notifications]);
      setNewNotification({
        type: 'system',
        title: '',
        message: '',
        recipients: 'all_users'
      });
      setShowCreateDialog(false);
    } catch (error) {
      console.error('Error creating notification:', error);
    }
  };

  const totalPages = Math.ceil(totalNotifications / notificationsPerPage);

  if (loading && notifications.length === 0) {
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
          <p className="text-muted-foreground">
            Manage system notifications and user communications
          </p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Notification
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Notification</DialogTitle>
              <DialogDescription>
                Send a notification to users across the platform
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="type">Notification Type</Label>
                  <Select value={newNotification.type} onValueChange={(value) => 
                    setNewNotification({...newNotification, type: value})
                  }>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="system">System</SelectItem>
                      <SelectItem value="promotional">Promotional</SelectItem>
                      <SelectItem value="security">Security</SelectItem>
                      <SelectItem value="update">Update</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="recipients">Recipients</Label>
                  <Select value={newNotification.recipients} onValueChange={(value) => 
                    setNewNotification({...newNotification, recipients: value})
                  }>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all_users">All Users</SelectItem>
                      <SelectItem value="premium_users">Premium Users</SelectItem>
                      <SelectItem value="active_users">Active Users</SelectItem>
                      <SelectItem value="new_users">New Users</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  placeholder="Notification title..."
                  value={newNotification.title}
                  onChange={(e) => setNewNotification({...newNotification, title: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  placeholder="Notification message..."
                  value={newNotification.message}
                  onChange={(e) => setNewNotification({...newNotification, message: e.target.value})}
                  rows={4}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateNotification}>
                  <Send className="mr-2 h-4 w-4" />
                  Send Notification
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Notifications</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalNotifications.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">All time notifications</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sent Today</CardTitle>
            <Send className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.sentToday}</div>
            <p className="text-xs text-muted-foreground">Notifications sent today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingNotifications}</div>
            <p className="text-xs text-muted-foreground">Awaiting delivery</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Recipients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalRecipients.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Users reached</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filter Notifications</CardTitle>
          <CardDescription>Search and filter notifications by various criteria</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search notifications..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={handleStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="sent">Sent</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={handleTypeFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="system">System</SelectItem>
                <SelectItem value="promotional">Promotional</SelectItem>
                <SelectItem value="security">Security</SelectItem>
                <SelectItem value="update">Update</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Notifications Table */}
      <Card>
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
          <CardDescription>
            Showing {notifications.length} of {totalNotifications} notifications
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Recipients</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Sent Date</TableHead>
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
                ) : notifications.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      No notifications found
                    </TableCell>
                  </TableRow>
                ) : (
                  notifications.map((notification) => (
                    <TableRow key={notification.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{notification.title}</div>
                          <div className="text-sm text-muted-foreground truncate max-w-xs">
                            {notification.message}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{getTypeBadge(notification.type)}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {notification.recipients.replace('_', ' ')}
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(notification.status)}</TableCell>
                      <TableCell className="text-sm">
                        {formatDate(notification.sentAt)}
                      </TableCell>
                      <TableCell>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => setSelectedNotification(notification)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Notification Details</DialogTitle>
                              <DialogDescription>
                                Full notification information and delivery status
                              </DialogDescription>
                            </DialogHeader>
                            {selectedNotification && (
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <h4 className="font-semibold mb-2">Type</h4>
                                    {getTypeBadge(selectedNotification.type)}
                                  </div>
                                  <div>
                                    <h4 className="font-semibold mb-2">Status</h4>
                                    {getStatusBadge(selectedNotification.status)}
                                  </div>
                                </div>
                                <div>
                                  <h4 className="font-semibold mb-2">Title</h4>
                                  <p>{selectedNotification.title}</p>
                                </div>
                                <div>
                                  <h4 className="font-semibold mb-2">Message</h4>
                                  <div className="p-3 bg-muted rounded-md">
                                    {selectedNotification.message}
                                  </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <h4 className="font-semibold mb-2">Recipients</h4>
                                    <p>{selectedNotification.recipients.replace('_', ' ')}</p>
                                  </div>
                                  <div>
                                    <h4 className="font-semibold mb-2">Sent Date</h4>
                                    <p className="text-sm">{formatDate(selectedNotification.sentAt)}</p>
                                  </div>
                                </div>
                                <div className="flex space-x-2 pt-4">
                                  <Button variant="outline" size="sm">
                                    View Analytics
                                  </Button>
                                  <Button variant="outline" size="sm">
                                    Resend
                                  </Button>
                                </div>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
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
    </div>
  );
} 