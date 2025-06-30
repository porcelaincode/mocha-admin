"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Search, 
  Filter, 
  Eye, 
  Download, 
  Trash2, 
  Flag, 
  Check, 
  X,
  Image as ImageIcon,
  Video,
  Calendar,
  User,
  AlertTriangle,
  Shield,
  Play,
  Pause,
  Volume2,
  VolumeX
} from "lucide-react";

// Mock data for media content
const mockMedia = [
  {
    id: "1",
    userId: "user1",
    userName: "Emma Thompson",
    userAvatar: "/api/placeholder/40/40",
    type: "image",
    url: "/api/placeholder/300/400",
    thumbnail: "/api/placeholder/150/200",
    uploadDate: "2024-01-15",
    status: "approved",
    size: "2.3 MB",
    dimensions: "1080x1440",
    reports: 0,
    isProfile: true,
    adultContent: false
  },
  {
    id: "2",
    userId: "user2",
    userName: "Marcus Johnson",
    userAvatar: "/api/placeholder/40/40",
    type: "video",
    url: "/api/placeholder/300/400",
    thumbnail: "/api/placeholder/150/200",
    uploadDate: "2024-01-20",
    status: "pending",
    size: "15.7 MB",
    duration: "0:23",
    reports: 0,
    isProfile: false,
    adultContent: false
  },
  {
    id: "3",
    userId: "user3",
    userName: "Sofia Rodriguez",
    userAvatar: "/api/placeholder/40/40",
    type: "image",
    url: "/api/placeholder/300/400",
    thumbnail: "/api/placeholder/150/200",
    uploadDate: "2024-01-18",
    status: "flagged",
    size: "1.8 MB",
    dimensions: "720x960",
    reports: 3,
    isProfile: true,
    adultContent: true
  },
  {
    id: "4",
    userId: "user1",
    userName: "Emma Thompson",
    userAvatar: "/api/placeholder/40/40",
    type: "image",
    url: "/api/placeholder/300/400",
    thumbnail: "/api/placeholder/150/200",
    uploadDate: "2024-01-22",
    status: "rejected",
    size: "3.1 MB",
    dimensions: "1080x1350",
    reports: 1,
    isProfile: false,
    adultContent: false
  }
];

export default function MediaPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [selectedMedia, setSelectedMedia] = useState(null);

  const filteredMedia = mockMedia.filter(media => {
    const matchesSearch = media.userName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || media.status === statusFilter;
    const matchesType = typeFilter === "all" || media.type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge variant="default" className="bg-green-100 text-green-800">Approved</Badge>;
      case "pending":
        return <Badge variant="default" className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case "flagged":
        return <Badge variant="destructive">Flagged</Badge>;
      case "rejected":
        return <Badge variant="secondary">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleApprove = (mediaId: string) => {
    console.log("Approving media:", mediaId);
    // Implement approval logic
  };

  const handleReject = (mediaId: string) => {
    console.log("Rejecting media:", mediaId);
    // Implement rejection logic
  };

  const handleDelete = (mediaId: string) => {
    console.log("Deleting media:", mediaId);
    // Implement deletion logic
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Media Management</h1>
        <p className="text-muted-foreground">
          Review and moderate user photos and videos
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Media</CardTitle>
            <ImageIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">45,678</div>
            <p className="text-xs text-muted-foreground">
              +2,345 this month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">234</div>
            <p className="text-xs text-muted-foreground">
              Needs moderation
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Flagged Content</CardTitle>
            <Flag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">89</div>
            <p className="text-xs text-muted-foreground">
              User reports
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Adult Content</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,567</div>
            <p className="text-xs text-muted-foreground">
              18+ verified
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Media Content</CardTitle>
          <CardDescription>
            Review, approve, or reject user media content
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by user name..."
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
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="flagged">Flagged</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="image">Images</SelectItem>
                <SelectItem value="video">Videos</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="grid" className="w-full">
        <TabsList>
          <TabsTrigger value="grid">Grid View</TabsTrigger>
          <TabsTrigger value="list">List View</TabsTrigger>
        </TabsList>
        
        <TabsContent value="grid" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredMedia.map((media) => (
              <Card key={media.id} className="overflow-hidden">
                <div className="relative aspect-[3/4] bg-muted">
                  <img 
                    src={media.thumbnail} 
                    alt="Media content"
                    className="w-full h-full object-cover"
                  />
                  {media.type === "video" && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="bg-black/50 rounded-full p-3">
                        <Play className="h-6 w-6 text-white" />
                      </div>
                    </div>
                  )}
                  <div className="absolute top-2 left-2 flex gap-2">
                    {getStatusBadge(media.status)}
                    {media.adultContent && (
                      <Badge variant="destructive" className="text-xs">18+</Badge>
                    )}
                    {media.isProfile && (
                      <Badge variant="outline" className="text-xs bg-white">Profile</Badge>
                    )}
                  </div>
                  {media.reports > 0 && (
                    <div className="absolute top-2 right-2">
                      <Badge variant="destructive" className="text-xs">
                        <Flag className="h-3 w-3 mr-1" />
                        {media.reports}
                      </Badge>
                    </div>
                  )}
                </div>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={media.userAvatar} />
                      <AvatarFallback>{media.userName[0]}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium">{media.userName}</span>
                  </div>
                  <div className="text-xs text-muted-foreground space-y-1">
                    <div className="flex justify-between">
                      <span>{media.type === "image" ? "Image" : "Video"}</span>
                      <span>{media.size}</span>
                    </div>
                    {media.type === "image" && (
                      <div className="flex justify-between">
                        <span>Dimensions</span>
                        <span>{media.dimensions}</span>
                      </div>
                    )}
                    {media.type === "video" && (
                      <div className="flex justify-between">
                        <span>Duration</span>
                        <span>{media.duration}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>Uploaded</span>
                      <span>{media.uploadDate}</span>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" className="flex-1">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Media Review</DialogTitle>
                          <DialogDescription>
                            Review media content for approval
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="aspect-[3/4] bg-muted rounded-lg overflow-hidden">
                            <img 
                              src={media.url} 
                              alt="Media content"
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <label className="font-medium">User</label>
                              <p className="text-muted-foreground">{media.userName}</p>
                            </div>
                            <div>
                              <label className="font-medium">Type</label>
                              <p className="text-muted-foreground">{media.type}</p>
                            </div>
                            <div>
                              <label className="font-medium">Size</label>
                              <p className="text-muted-foreground">{media.size}</p>
                            </div>
                            <div>
                              <label className="font-medium">Upload Date</label>
                              <p className="text-muted-foreground">{media.uploadDate}</p>
                            </div>
                            <div>
                              <label className="font-medium">Status</label>
                              <div className="mt-1">{getStatusBadge(media.status)}</div>
                            </div>
                            <div>
                              <label className="font-medium">Reports</label>
                              <p className="text-muted-foreground">{media.reports} reports</p>
                            </div>
                          </div>
                          {media.status === "pending" && (
                            <div className="flex gap-2">
                              <Button 
                                variant="default"
                                className="flex-1"
                                onClick={() => handleApprove(media.id)}
                              >
                                <Check className="h-4 w-4 mr-2" />
                                Approve
                              </Button>
                              <Button 
                                variant="destructive"
                                className="flex-1"
                                onClick={() => handleReject(media.id)}
                              >
                                <X className="h-4 w-4 mr-2" />
                                Reject
                              </Button>
                            </div>
                          )}
                          <div className="flex gap-2">
                            <Button variant="outline" className="flex-1">
                              <Download className="h-4 w-4 mr-2" />
                              Download
                            </Button>
                            <Button variant="outline" className="flex-1" onClick={() => handleDelete(media.id)}>
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                    {media.status === "pending" && (
                      <>
                        <Button 
                          variant="default" 
                          size="sm"
                          onClick={() => handleApprove(media.id)}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => handleReject(media.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="list" className="space-y-4">
          <Card>
            <CardContent className="p-0">
              <div className="divide-y">
                {filteredMedia.map((media) => (
                  <div key={media.id} className="p-4 flex items-center space-x-4">
                    <div className="relative w-16 h-20 bg-muted rounded overflow-hidden flex-shrink-0">
                      <img 
                        src={media.thumbnail} 
                        alt="Media content"
                        className="w-full h-full object-cover"
                      />
                      {media.type === "video" && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="bg-black/50 rounded-full p-1">
                            <Play className="h-3 w-3 text-white" />
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={media.userAvatar} />
                          <AvatarFallback>{media.userName[0]}</AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{media.userName}</span>
                        {media.isProfile && (
                          <Badge variant="outline" className="text-xs">Profile</Badge>
                        )}
                        {media.adultContent && (
                          <Badge variant="destructive" className="text-xs">18+</Badge>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {media.type === "image" ? "Image" : "Video"} • {media.size} • {media.uploadDate}
                        {media.reports > 0 && (
                          <span className="text-red-600 ml-2">
                            • {media.reports} reports
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {getStatusBadge(media.status)}
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Media Review</DialogTitle>
                            <DialogDescription>
                              Review media content for approval
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="aspect-[3/4] bg-muted rounded-lg overflow-hidden">
                              <img 
                                src={media.url} 
                                alt="Media content"
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <label className="font-medium">User</label>
                                <p className="text-muted-foreground">{media.userName}</p>
                              </div>
                              <div>
                                <label className="font-medium">Type</label>
                                <p className="text-muted-foreground">{media.type}</p>
                              </div>
                              <div>
                                <label className="font-medium">Size</label>
                                <p className="text-muted-foreground">{media.size}</p>
                              </div>
                              <div>
                                <label className="font-medium">Upload Date</label>
                                <p className="text-muted-foreground">{media.uploadDate}</p>
                              </div>
                            </div>
                            {media.status === "pending" && (
                              <div className="flex gap-2">
                                <Button 
                                  variant="default"
                                  className="flex-1"
                                  onClick={() => handleApprove(media.id)}
                                >
                                  <Check className="h-4 w-4 mr-2" />
                                  Approve
                                </Button>
                                <Button 
                                  variant="destructive"
                                  className="flex-1"
                                  onClick={() => handleReject(media.id)}
                                >
                                  <X className="h-4 w-4 mr-2" />
                                  Reject
                                </Button>
                              </div>
                            )}
                          </div>
                        </DialogContent>
                      </Dialog>
                      {media.status === "pending" && (
                        <>
                          <Button 
                            variant="default" 
                            size="sm"
                            onClick={() => handleApprove(media.id)}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => handleReject(media.id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 