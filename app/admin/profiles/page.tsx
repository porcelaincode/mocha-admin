/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { 
  Search, 
  Eye, 
  Edit, 
  Shield, 
  Camera, 
  MapPin, 
  Heart,
  Users,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Image as ImageIcon,
  Loader2,
  RefreshCw
} from "lucide-react";
import Image from "next/image";
import { getUsers, getUserById, updateUser, getDashboardStats } from "@/lib/admin-services";

interface ProfileData {
  id: string;
  name: string;
  age: number;
  email: string;
  phoneNumber: string;
  location: string;
  bio: string;
  verified: boolean;
  interests: string[];
  lastSeen: string;
  createdAt: string;
  matches: number;
  profileViews: number;
  isOnline: boolean;
  photos?: any[];
  isAdultModeEnabled?: boolean;
  subscription?: string;
  isTestUser: boolean;
  isDummyUser: boolean;
}

interface ProfileStats {
  totalProfiles: number;
  verifiedProfiles: number;
  incompleteProfiles: number;
  flaggedProfiles: number;
  totalProfilesChange: number;
  verifiedProfilesChange: number;
  incompleteProfilesChange: number;
  flaggedProfilesChange: number;
}

export default function ProfilesPage() {
  const [profiles, setProfiles] = useState<ProfileData[]>([]);
  const [stats, setStats] = useState<ProfileStats>({
    totalProfiles: 0,
    verifiedProfiles: 0,
    incompleteProfiles: 0,
    flaggedProfiles: 0,
    totalProfilesChange: 0,
    verifiedProfilesChange: 0,
    incompleteProfilesChange: 0,
    flaggedProfilesChange: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [verificationFilter, setVerificationFilter] = useState("all");
  const [selectedProfile, setSelectedProfile] = useState<ProfileData | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchProfiles = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const filters = {
        search: searchTerm,
        verified: verificationFilter === "all" ? undefined : verificationFilter,
        userType: statusFilter === "all" ? undefined : statusFilter
      };

      // Fetch both profiles and dashboard stats in parallel
      const [result, dashboardStats] = await Promise.all([
        getUsers(page, 50, filters),
        getDashboardStats()
      ]);
      
      // Transform the data to match our ProfileData interface
      const transformedProfiles: ProfileData[] = result.users.map((user: any) => ({
        id: user.id,
        name: user.name,
        age: user.age,
        email: user.email,
        phoneNumber: user.phoneNumber,
        location: user.location,
        bio: user.bio,
        verified: user.verified,
        interests: user.interests || [],
        lastSeen: user.lastSeen,
        createdAt: user.createdAt,
        matches: user.matches,
        profileViews: user.profileViews,
        isOnline: user.isOnline,
        photos: [], // getUsers doesn't return photos array, so default to empty
        isAdultModeEnabled: false, // getUsers doesn't return this, so default to false
        subscription: user.subscription,
        isTestUser: user.isTestUser,
        isDummyUser: user.isDummyUser,
      }));
      
      setProfiles(transformedProfiles);
      setTotalPages(Math.ceil(result.total / 50));
      
      // Use real dashboard stats
      setStats({
        totalProfiles: dashboardStats.totalUsers,
        verifiedProfiles: dashboardStats.verifiedUsers,
        incompleteProfiles: Math.round(dashboardStats.totalUsers * 0.1), // Estimate 10% incomplete
        flaggedProfiles: transformedProfiles.filter(p => p.isTestUser || p.isDummyUser).length,
        totalProfilesChange: dashboardStats.changes.totalUsers,
        verifiedProfilesChange: dashboardStats.changes.verifiedUsers,
        incompleteProfilesChange: 0, // Would need historical data
        flaggedProfilesChange: 0, // Would need historical data
      });
      
    } catch (err) {
      console.error('Error fetching profiles:', err);
      setError('Failed to load profiles');
    } finally {
      setLoading(false);
    }
  };

  const fetchProfileDetails = async (profileId: string) => {
    try {
      setProfileLoading(true);
      const profile = await getUserById(profileId);
      setSelectedProfile(profile);
    } catch (err) {
      console.error('Error fetching profile details:', err);
      setError('Failed to load profile details');
    } finally {
      setProfileLoading(false);
    }
  };

  const handleProfileUpdate = async (profileId: string, updates: any) => {
    try {
      setUpdating(true);
      await updateUser(profileId, updates);
      
      // Refresh the profile data
      await fetchProfileDetails(profileId);
      await fetchProfiles();
      
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Failed to update profile');
    } finally {
      setUpdating(false);
    }
  };

  const calculateProfileCompletion = (profile: ProfileData): number => {
    const fields = [
      profile.name,
      profile.age,
      profile.bio,
      profile.location,
      profile.interests?.length > 0,
      (profile.photos?.length || 0) > 0
    ];
    
    const completedFields = fields.filter(Boolean).length;
    return Math.round((completedFields / fields.length) * 100);
  };

  useEffect(() => {
    fetchProfiles();
  }, [page, searchTerm, statusFilter, verificationFilter]);

  const filteredProfiles = profiles.filter(profile => {
    const matchesSearch = profile.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         profile.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || 
                         (statusFilter === "test" && profile.isTestUser) ||
                         (statusFilter === "dummy" && profile.isDummyUser) ||
                         (statusFilter === "active" && !profile.isTestUser && !profile.isDummyUser);
    const matchesVerification = verificationFilter === "all" || 
                               (verificationFilter === "verified" && profile.verified) ||
                               (verificationFilter === "unverified" && !profile.verified);
    
    return matchesSearch && matchesStatus && matchesVerification;
  });

  const getStatusBadge = (profile: ProfileData) => {
    if (profile.isTestUser) {
      return <Badge variant="outline" className="bg-blue-100 text-blue-800">Test User</Badge>;
    }
    if (profile.isDummyUser) {
      return <Badge variant="outline" className="bg-gray-100 text-gray-800">Dummy User</Badge>;
    }
    return <Badge variant="default" className="bg-green-100 text-green-800">Active</Badge>;
  };

  const getSubscriptionBadge = (subscription?: string) => {
    switch (subscription?.toLowerCase()) {
      case "basic":
        return <Badge variant="outline">Basic</Badge>;
      case "premium":
        return <Badge variant="default" className="bg-blue-100 text-blue-800">Premium</Badge>;
      case "platinum":
        return <Badge variant="default" className="bg-purple-100 text-purple-800">Platinum</Badge>;
      default:
        return <Badge variant="outline">Basic</Badge>;
    }
  };

  const formatLastSeen = (lastSeen: string) => {
    if (!lastSeen || lastSeen === 'Never') return 'Never';
    try {
      const date = new Date(lastSeen);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffMins < 60) return `${diffMins} minutes ago`;
      if (diffHours < 24) return `${diffHours} hours ago`;
      return `${diffDays} days ago`;
    } catch {
      return lastSeen;
    }
  };

  if (loading && profiles.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading profiles...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Profiles</h1>
          <p className="text-muted-foreground">
            Manage user profiles, photos, and verification status
          </p>
        </div>
        <Button onClick={fetchProfiles} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Profiles</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProfiles.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              +{stats.totalProfilesChange} from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Verified Profiles</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.verifiedProfiles.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {stats.totalProfiles > 0 ? Math.round((stats.verifiedProfiles / stats.totalProfiles) * 100) : 0}% verification rate
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Incomplete Profiles</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.incompleteProfiles.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              &lt;50% completion rate
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Test/Dummy Users</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.flaggedProfiles.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Development accounts
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Management</CardTitle>
          <CardDescription>
            Search and filter user profiles
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search profiles..."
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
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="test">Test Users</SelectItem>
                <SelectItem value="dummy">Dummy Users</SelectItem>
              </SelectContent>
            </Select>
            <Select value={verificationFilter} onValueChange={setVerificationFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Filter by verification" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Verification</SelectItem>
                <SelectItem value="verified">Verified</SelectItem>
                <SelectItem value="unverified">Unverified</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Profiles List */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredProfiles.map((profile) => {
          const profileCompletion = calculateProfileCompletion(profile);
          const primaryPhoto = profile.photos?.find(p => p.isDefault) || profile.photos?.[0];
          
          return (
            <Card key={profile.id} className="overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={primaryPhoto?.url} />
                      <AvatarFallback>{profile.name?.split(' ').map(n => n[0]).join('') || 'U'}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{profile.name || 'Unknown'}</h3>
                        {profile.verified && (
                          <CheckCircle className="h-4 w-4 text-blue-500" />
                        )}
                        {profile.isOnline && (
                          <div className="h-2 w-2 bg-green-500 rounded-full" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">Age {profile.age || 'N/A'}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <MapPin className="h-3 w-3 text-muted-foreground" />
                        <p className="text-xs text-muted-foreground">{profile.location || 'No location'}</p>
                      </div>
                    </div>
                  </div>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => fetchProfileDetails(profile.id)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>{profile.name || 'Unknown'}&apos;s Profile</DialogTitle>
                        <DialogDescription>
                          Detailed profile information and management options
                        </DialogDescription>
                      </DialogHeader>
                      
                      {profileLoading ? (
                        <div className="flex items-center justify-center py-8">
                          <Loader2 className="h-8 w-8 animate-spin" />
                        </div>
                      ) : selectedProfile ? (
                        <ProfileDetailsModal 
                          profile={selectedProfile}
                          onUpdate={handleProfileUpdate}
                          updating={updating}
                        />
                      ) : null}
                    </DialogContent>
                  </Dialog>
                </div>
                
                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Profile Completion</span>
                    <span className="text-sm text-muted-foreground">{profileCompletion}%</span>
                  </div>
                  <Progress value={profileCompletion} className="w-full" />
                </div>
                
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex gap-2">
                    {getStatusBadge(profile)}
                    {getSubscriptionBadge(profile.subscription)}
                    {profile.isAdultModeEnabled && (
                      <Badge variant="outline" className="bg-red-50 text-red-700">18+</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Heart className="h-3 w-3" />
                    <span>{profile.matches || 0}</span>
                  </div>
                </div>
                
                <div className="mt-2 text-xs text-muted-foreground">
                  Last seen: {formatLastSeen(profile.lastSeen)}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1 || loading}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages || loading}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}

// Separate component for profile details modal
function ProfileDetailsModal({ 
  profile, 
  onUpdate, 
  updating 
}: { 
  profile: ProfileData; 
  onUpdate: (id: string, updates: any) => Promise<void>;
  updating: boolean;
}) {
  const [editMode, setEditMode] = useState(false); /* eslint-disable-line @typescript-eslint/no-unused-vars */
  const [formData, setFormData] = useState(profile); /* eslint-disable-line @typescript-eslint/no-unused-vars */

  const handleSave = async () => {
    await onUpdate(profile.id, formData);
    setEditMode(false);
  };

  const profileCompletion = (() => {
    const fields = [
      profile.name,
      profile.age,
      profile.bio,
      profile.location,
      profile.interests?.length > 0,
      (profile.photos?.length || 0) > 0
    ];
    const completedFields = fields.filter(Boolean).length;
    return Math.round((completedFields / fields.length) * 100);
  })();

  return (
    <Tabs defaultValue="profile" className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="profile">Profile</TabsTrigger>
        <TabsTrigger value="photos">Photos</TabsTrigger>
        <TabsTrigger value="activity">Activity</TabsTrigger>
        <TabsTrigger value="actions">Actions</TabsTrigger>
      </TabsList>
      
      <TabsContent value="profile" className="space-y-4">
        <div className="grid gap-4 py-4">
          <div className="flex items-center space-x-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={profile.photos?.[0]?.url} />
              <AvatarFallback>{profile.name?.split(' ').map(n => n[0]).join('') || 'U'}</AvatarFallback>
            </Avatar>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-semibold">{profile.name || 'Unknown'}</h3>
                <Badge variant={profile.verified ? "default" : "secondary"}>
                  {profile.verified ? "Verified" : "Unverified"}
                </Badge>
                {profile.isTestUser && <Badge variant="outline">Test User</Badge>}
                {profile.isDummyUser && <Badge variant="outline">Dummy User</Badge>}
              </div>
              <p className="text-muted-foreground">{profile.email}</p>
              <p className="text-muted-foreground">{profile.phoneNumber}</p>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>Joined {new Date(profile.createdAt).toLocaleDateString()}</span>
                <span>Last seen {profile.lastSeen}</span>
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Profile Completion</label>
            <Progress value={profileCompletion} className="w-full" />
            <p className="text-xs text-muted-foreground">{profileCompletion}% complete</p>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Bio</label>
            <p className="text-sm text-muted-foreground">{profile.bio || 'No bio provided'}</p>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Location</label>
            <p className="text-sm text-muted-foreground">{profile.location || 'No location provided'}</p>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Interests</label>
            <div className="flex flex-wrap gap-2">
              {profile.interests?.map((interest, index) => (
                <Badge key={index} variant="secondary">{interest}</Badge>
              )) || <span className="text-sm text-muted-foreground">No interests added</span>}
            </div>
          </div>
        </div>
      </TabsContent>
      
      <TabsContent value="photos" className="space-y-4">
        <div className="grid gap-4 py-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">Profile Photos ({profile.photos?.length || 0})</h4>
            <Button variant="outline" size="sm">
              <Camera className="h-4 w-4 mr-2" />
              Manage Photos
            </Button>
          </div>
          {(profile.photos?.length || 0) > 0 ? (
            <div className="grid grid-cols-3 gap-4">
              {profile.photos?.map((photo, index) => (
                <div key={index} className="relative aspect-square">
                  <Image
                    src={photo.url} 
                    alt={`Photo ${index + 1}`}
                    fill
                    className="object-cover rounded-lg border"
                  />
                  {photo.isDefault && (
                    <Badge className="absolute top-2 left-2" variant="secondary">
                      Primary
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No photos uploaded</p>
          )}
        </div>
      </TabsContent>
      
      <TabsContent value="activity" className="space-y-4">
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{profile.matches || 0}</div>
              <div className="text-sm text-muted-foreground">Matches</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">N/A</div>
              <div className="text-sm text-muted-foreground">Messages</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{profile.profileViews || 0}</div>
              <div className="text-sm text-muted-foreground">Profile Views</div>
            </div>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-medium">Account Status</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Online Status</span>
                <span className={`text-${profile.isOnline ? 'green' : 'gray'}-600`}>
                  {profile.isOnline ? 'Online' : 'Offline'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Adult Mode</span>
                <span className="text-muted-foreground">
                  {profile.isAdultModeEnabled ? 'Enabled' : 'Disabled'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Account Type</span>
                <span className="text-muted-foreground">
                  {profile.isTestUser ? 'Test User' : profile.isDummyUser ? 'Dummy User' : 'Regular User'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </TabsContent>
      
      <TabsContent value="actions" className="space-y-4">
        <div className="grid gap-4 py-4">
          <div className="space-y-4">
            <h4 className="font-medium">Profile Actions</h4>
            <div className="space-y-2">
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => onUpdate(profile.id, { verified: !profile.verified })}
                disabled={updating}
              >
                <Shield className="h-4 w-4 mr-2" />
                {profile.verified ? "Remove Verification" : "Verify Profile"}
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Edit className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <ImageIcon className="h-4 w-4 mr-2" />
                Review Photos
              </Button>
              <Button 
                variant={profile.isTestUser || profile.isDummyUser ? "default" : "destructive"} 
                className="w-full justify-start"
                onClick={() => onUpdate(profile.id, { 
                  isTestUser: !profile.isTestUser,
                  isDummyUser: false 
                })}
                disabled={updating}
              >
                {profile.isTestUser || profile.isDummyUser ? (
                  <CheckCircle className="h-4 w-4 mr-2" />
                ) : (
                  <XCircle className="h-4 w-4 mr-2" />
                )}
                {profile.isTestUser || profile.isDummyUser ? "Activate Profile" : "Mark as Test User"}
              </Button>
            </div>
          </div>
        </div>
      </TabsContent>
    </Tabs>
  );
} 