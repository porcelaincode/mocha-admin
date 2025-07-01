"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Image, 
  Video, 
  Search, 
  Eye, 
  Download, 
  Trash2, 
  AlertTriangle, 
  CheckCircle,
  HardDrive,
  Loader2
} from 'lucide-react';
import { getPhotos } from '@/lib/admin-services';

interface Photo {
  id: string;
  url: string;
  s3Key: string;
  originalName: string;
  mimeType: string;
  size: number;
  mediaType: string;
  duration?: number;
  order: number;
  isDefault: boolean;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    verified: boolean;
  };
}

export default function MediaPage() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [mediaTypeFilter, setMediaTypeFilter] = useState('all');
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPhotos, setTotalPhotos] = useState(0);
  const [stats, setStats] = useState({
    totalPhotos: 0,
    totalVideos: 0,
    totalSize: 0,
    flaggedMedia: 0
  });

  const photosPerPage = 20;

  useEffect(() => {
    fetchPhotos();
  }, [currentPage, searchTerm, mediaTypeFilter]);

  const fetchPhotos = async () => {
    setLoading(true);
    try {
      const filters = {
        search: searchTerm || undefined,
        mediaType: mediaTypeFilter !== 'all' ? mediaTypeFilter : undefined
      };

      const result = await getPhotos(currentPage, photosPerPage, filters);
      setPhotos(result.photos);
      setTotalPhotos(result.total);

      // Calculate stats
      const totalPhotosCount = result.photos.filter(p => p.mediaType === 'image').length;
      const totalVideosCount = result.photos.filter(p => p.mediaType === 'video').length;
      const totalSize = result.photos.reduce((sum, photo) => sum + photo.size, 0);

      setStats({
        totalPhotos: totalPhotosCount,
        totalVideos: totalVideosCount,
        totalSize,
        flaggedMedia: 0 // Would need a flagged field in the schema
      });
    } catch (error) {
      console.error('Error fetching photos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleMediaTypeFilter = (value: string) => {
    setMediaTypeFilter(value);
    setCurrentPage(1);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getMediaTypeBadge = (type: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      image: "default",
      video: "secondary",
      audio: "outline"
    };
    return <Badge variant={variants[type] || "default"}>{type}</Badge>;
  };

  const getMediaIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Video className="h-4 w-4" />;
      case 'image':
      default:
        return <Image className="h-4 w-4" />;
    }
  };

  const totalPages = Math.ceil(totalPhotos / photosPerPage);

  if (loading && photos.length === 0) {
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
        <h1 className="text-3xl font-bold tracking-tight">Media Management</h1>
        <p className="text-muted-foreground">
          Manage and moderate user photos and videos
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Photos</CardTitle>
            <Image className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPhotos.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">User uploaded images</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Videos</CardTitle>
            <Video className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalVideos}</div>
            <p className="text-xs text-muted-foreground">User uploaded videos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Storage Used</CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatFileSize(stats.totalSize)}</div>
            <p className="text-xs text-muted-foreground">Total storage used</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Flagged Media</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.flaggedMedia}</div>
            <p className="text-xs text-muted-foreground">Requiring review</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filter Media</CardTitle>
          <CardDescription>Search and filter media by various criteria</CardDescription>
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
            <Select value={mediaTypeFilter} onValueChange={handleMediaTypeFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Media Types</SelectItem>
                <SelectItem value="image">Images</SelectItem>
                <SelectItem value="video">Videos</SelectItem>
                <SelectItem value="audio">Audio</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Media Grid */}
      <Card>
        <CardHeader>
          <CardTitle>Media Files</CardTitle>
          <CardDescription>
            Showing {photos.length} of {totalPhotos} media files
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : photos.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No media files found</p>
            </div>
          ) : (
            <>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {photos.map((photo) => (
                  <Card key={photo.id} className="overflow-hidden">
                    <div className="aspect-square relative">
                      {photo.mediaType === 'image' ? (
                        <img
                          src={photo.url}
                          alt={photo.originalName}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = '/placeholder-image.jpg';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full bg-muted flex items-center justify-center">
                          {getMediaIcon(photo.mediaType)}
                          <span className="ml-2 text-sm">{photo.mediaType}</span>
                        </div>
                      )}
                      {photo.isDefault && (
                        <Badge className="absolute top-2 left-2" variant="secondary">
                          Default
                        </Badge>
                      )}
                      <div className="absolute top-2 right-2">
                        {getMediaTypeBadge(photo.mediaType)}
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold text-sm truncate">
                            {photo.originalName}
                          </h4>
                          <div className="flex items-center space-x-1">
                            {photo.user.verified && (
                              <CheckCircle className="h-3 w-3 text-green-500" />
                            )}
                          </div>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          <p>{photo.user.name}</p>
                          <p>{formatFileSize(photo.size)}</p>
                          <p>{formatDate(photo.createdAt)}</p>
                        </div>
                        <div className="flex space-x-1 pt-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => setSelectedPhoto(photo)}
                              >
                                <Eye className="h-3 w-3" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-4xl">
                              <DialogHeader>
                                <DialogTitle>Media Details</DialogTitle>
                                <DialogDescription>
                                  Full media information and moderation options
                                </DialogDescription>
                              </DialogHeader>
                              {selectedPhoto && (
                                <div className="space-y-4">
                                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    <div>
                                      {selectedPhoto.mediaType === 'image' ? (
                                        <img
                                          src={selectedPhoto.url}
                                          alt={selectedPhoto.originalName}
                                          className="w-full rounded-lg object-cover max-h-96"
                                        />
                                      ) : (
                                        <div className="w-full h-64 bg-muted rounded-lg flex items-center justify-center">
                                          {getMediaIcon(selectedPhoto.mediaType)}
                                          <span className="ml-2">{selectedPhoto.mediaType}</span>
                                        </div>
                                      )}
                                    </div>
                                    <div className="space-y-4">
                                      <div>
                                        <h4 className="font-semibold mb-2">File Information</h4>
                                        <div className="space-y-1 text-sm">
                                          <p><span className="font-medium">Name:</span> {selectedPhoto.originalName}</p>
                                          <p><span className="font-medium">Type:</span> {selectedPhoto.mimeType}</p>
                                          <p><span className="font-medium">Size:</span> {formatFileSize(selectedPhoto.size)}</p>
                                          <p><span className="font-medium">Uploaded:</span> {formatDate(selectedPhoto.createdAt)}</p>
                                          {selectedPhoto.duration && (
                                            <p><span className="font-medium">Duration:</span> {selectedPhoto.duration}s</p>
                                          )}
                                        </div>
                                      </div>
                                      <div>
                                        <h4 className="font-semibold mb-2">User Information</h4>
                                        <div className="space-y-1 text-sm">
                                          <p><span className="font-medium">Name:</span> {selectedPhoto.user.name}</p>
                                          <p><span className="font-medium">Email:</span> {selectedPhoto.user.email}</p>
                                          <p><span className="font-medium">Verified:</span> {selectedPhoto.user.verified ? 'Yes' : 'No'}</p>
                                        </div>
                                      </div>
                                      <div className="flex space-x-2 pt-4">
                                        <Button variant="outline" size="sm">
                                          <Download className="h-4 w-4 mr-2" />
                                          Download
                                        </Button>
                                        <Button variant="outline" size="sm">
                                          Flag Media
                                        </Button>
                                        <Button variant="destructive" size="sm">
                                          <Trash2 className="h-4 w-4 mr-2" />
                                          Delete
                                        </Button>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>
                          <Button variant="outline" size="sm">
                            <Download className="h-3 w-3" />
                          </Button>
                          <Button variant="destructive" size="sm">
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between space-x-2 py-4 mt-6">
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
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 