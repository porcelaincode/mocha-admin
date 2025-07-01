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
import { 
  AlertTriangle, 
  Search, 
  Eye, 
  CheckCircle, 
  XCircle, 
  Clock,
  Shield,
  Ban,
  Flag,
  Loader2
} from 'lucide-react';
import { getReports } from '@/lib/admin-services';

interface Report {
  id: string;
  type: string;
  status: string;
  reportedUser: {
    id: string;
    name: string;
    email: string;
  };
  reportingUser: {
    id: string;
    name: string;
    email: string;
  };
  reason: string;
  description: string;
  createdAt: string;
  reviewedAt: string | null;
  reviewedBy: string | null;
}

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalReports, setTotalReports] = useState(0);
  const [actionNote, setActionNote] = useState('');
  const [stats, setStats] = useState({
    totalReports: 0,
    pendingReports: 0,
    resolvedReports: 0,
    flaggedUsers: 0
  });

  const reportsPerPage = 20;

  const fetchReports = useCallback(async () => {
    setLoading(true);
    try {
      const filters = {
        search: searchTerm || undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        type: typeFilter !== 'all' ? typeFilter : undefined
      };

      const result = await getReports(currentPage, reportsPerPage, filters);
      setReports(result.reports);
      setTotalReports(result.total);

      // Calculate stats from the current data
      // Note: In a real implementation, you'd want to get these from separate API calls
      setStats({
        totalReports: result.total,
        pendingReports: result.reports.filter(r => r.status === 'pending').length,
        resolvedReports: result.reports.filter(r => r.status === 'resolved').length,
        flaggedUsers: new Set(result.reports.map(r => r.reportedUser.id)).size
      });
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, reportsPerPage, searchTerm, statusFilter, typeFilter]);


  useEffect(() => {
    fetchReports();
  }, [currentPage, searchTerm, statusFilter, typeFilter, fetchReports]);


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
      pending: "destructive",
      investigating: "secondary",
      resolved: "default",
      dismissed: "outline"
    };
    return <Badge variant={variants[status] || "default"}>{status}</Badge>;
  };

  const getTypeBadge = (type: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      inappropriate_content: "destructive",
      harassment: "destructive",
      spam: "secondary",
      fake_profile: "outline",
      underage: "destructive",
      other: "default"
    };
    return <Badge variant={variants[type] || "default"}>{type.replace('_', ' ')}</Badge>;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const handleReportAction = async (reportId: string, action: 'resolve' | 'dismiss' | 'investigate') => {
    try {
      // In a real implementation, you would call an API to update the report status
      console.log(`${action} report ${reportId} with note: ${actionNote}`);
      
      // Update local state
      setReports(reports.map(report => 
        report.id === reportId 
          ? { ...report, status: action === 'resolve' ? 'resolved' : action === 'dismiss' ? 'dismissed' : 'investigating' }
          : report
      ));
      
      setActionNote('');
      setSelectedReport(null);
    } catch (error) {
      console.error('Error updating report:', error);
    }
  };

  const totalPages = Math.ceil(totalReports / reportsPerPage);

  if (loading && reports.length === 0) {
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
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Reports & Moderation</h1>
        <p className="text-muted-foreground">
          Review and manage user reports and content moderation
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
            <div className="text-2xl font-bold">{stats.totalReports.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">All time reports</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Reports</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingReports}</div>
            <p className="text-xs text-muted-foreground">Awaiting review</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolved Reports</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.resolvedReports}</div>
            <p className="text-xs text-muted-foreground">Successfully handled</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Flagged Users</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.flaggedUsers}</div>
            <p className="text-xs text-muted-foreground">Users with reports</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filter Reports</CardTitle>
          <CardDescription>Search and filter reports by various criteria</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by user name or email..."
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
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="investigating">Investigating</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="dismissed">Dismissed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={handleTypeFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="inappropriate_content">Inappropriate Content</SelectItem>
                <SelectItem value="harassment">Harassment</SelectItem>
                <SelectItem value="spam">Spam</SelectItem>
                <SelectItem value="fake_profile">Fake Profile</SelectItem>
                <SelectItem value="underage">Underage</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Reports Table */}
      <Card>
        <CardHeader>
          <CardTitle>Reports</CardTitle>
          <CardDescription>
            Showing {reports.length} of {totalReports} reports
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Reported User</TableHead>
                  <TableHead>Reported By</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Reason</TableHead>
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
                ) : reports.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      No reports found
                    </TableCell>
                  </TableRow>
                ) : (
                  reports.map((report) => (
                    <TableRow key={report.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{report.reportedUser.name}</div>
                          <div className="text-sm text-muted-foreground">{report.reportedUser.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{report.reportingUser.name}</div>
                          <div className="text-sm text-muted-foreground">{report.reportingUser.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>{getTypeBadge(report.type)}</TableCell>
                      <TableCell className="max-w-xs">
                        <div className="truncate">{report.reason}</div>
                      </TableCell>
                      <TableCell>{getStatusBadge(report.status)}</TableCell>
                      <TableCell className="text-sm">
                        {formatDate(report.createdAt)}
                      </TableCell>
                      <TableCell>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => setSelectedReport(report)}
                            >
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
                            {selectedReport && (
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <h4 className="font-semibold mb-2">Reported User</h4>
                                    <p>{selectedReport.reportedUser.name}</p>
                                    <p className="text-sm text-muted-foreground">{selectedReport.reportedUser.email}</p>
                                  </div>
                                  <div>
                                    <h4 className="font-semibold mb-2">Reported By</h4>
                                    <p>{selectedReport.reportingUser.name}</p>
                                    <p className="text-sm text-muted-foreground">{selectedReport.reportingUser.email}</p>
                                  </div>
                                </div>
                                <div>
                                  <h4 className="font-semibold mb-2">Report Type</h4>
                                  {getTypeBadge(selectedReport.type)}
                                </div>
                                <div>
                                  <h4 className="font-semibold mb-2">Reason</h4>
                                  <p>{selectedReport.reason}</p>
                                </div>
                                <div>
                                  <h4 className="font-semibold mb-2">Description</h4>
                                  <div className="p-3 bg-muted rounded-md">
                                    {selectedReport.description}
                                  </div>
                                </div>
                                <div className="flex space-x-4">
                                  <div>
                                    <h4 className="font-semibold mb-1">Status</h4>
                                    {getStatusBadge(selectedReport.status)}
                                  </div>
                                  <div>
                                    <h4 className="font-semibold mb-1">Date</h4>
                                    <p className="text-sm">{formatDate(selectedReport.createdAt)}</p>
                                  </div>
                                </div>
                                
                                {selectedReport.status === 'pending' && (
                                  <div className="space-y-4 pt-4 border-t">
                                    <div>
                                      <label className="font-semibold mb-2 block">Action Note (Optional)</label>
                                      <Textarea
                                        placeholder="Add a note about your decision..."
                                        value={actionNote}
                                        onChange={(e) => setActionNote(e.target.value)}
                                        rows={3}
                                      />
                                    </div>
                                    <div className="flex space-x-2">
                                      <Button 
                                        variant="default" 
                                        size="sm"
                                        onClick={() => handleReportAction(selectedReport.id, 'resolve')}
                                      >
                                        <CheckCircle className="h-4 w-4 mr-2" />
                                        Resolve
                                      </Button>
                                      <Button 
                                        variant="outline" 
                                        size="sm"
                                        onClick={() => handleReportAction(selectedReport.id, 'investigate')}
                                      >
                                        <AlertTriangle className="h-4 w-4 mr-2" />
                                        Investigate
                                      </Button>
                                      <Button 
                                        variant="secondary" 
                                        size="sm"
                                        onClick={() => handleReportAction(selectedReport.id, 'dismiss')}
                                      >
                                        <XCircle className="h-4 w-4 mr-2" />
                                        Dismiss
                                      </Button>
                                      <Button variant="destructive" size="sm">
                                        <Ban className="h-4 w-4 mr-2" />
                                        Ban User
                                      </Button>
                                    </div>
                                  </div>
                                )}
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