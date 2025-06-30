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
  Image as ImageIcon
} from "lucide-react";
import Image from "next/image";

// Mock data for user profiles
const mockProfiles = [
  {
    id: "1",
    name: "Emma Thompson",
    age: 28,
    email: "emma.thompson@email.com",
    avatar: "/api/placeholder/40/40",
    location: "New York, NY",
    bio: "Adventure seeker, coffee lover, and dog mom. Looking for someone to explore the city with!",
    photos: ["/api/placeholder/100/100", "/api/placeholder/100/100", "/api/placeholder/100/100"],
    verified: true,
    profileCompletion: 95,
    interests: ["Travel", "Photography", "Hiking", "Coffee"],
    lastActive: "2 hours ago",
    joinDate: "2024-01-15",
    matches: 45,
    likes: 234,
    views: 1250,
    subscription: "Premium",
    adultMode: false,
    status: "active"
  },
  {
    id: "2",
    name: "Marcus Johnson",
    age: 32,
    email: "marcus.j@email.com",
    avatar: "/api/placeholder/40/40",
    location: "Los Angeles, CA",
    bio: "Fitness enthusiast and entrepreneur. Let's grab a healthy smoothie!",
    photos: ["/api/placeholder/100/100", "/api/placeholder/100/100"],
    verified: false,
    profileCompletion: 78,
    interests: ["Fitness", "Business", "Travel", "Music"],
    lastActive: "1 day ago",
    joinDate: "2024-02-20",
    matches: 28,
    likes: 156,
    views: 890,
    subscription: "Basic",
    adultMode: true,
    status: "active"
  },
  {
    id: "3",
    name: "Sofia Rodriguez",
    age: 26,
    email: "sofia.r@email.com",
    avatar: "/api/placeholder/40/40",
    location: "Miami, FL",
    bio: "Artist and dancer. Life is too short not to dance!",
    photos: ["/api/placeholder/100/100"],
    verified: true,
    profileCompletion: 65,
    interests: ["Art", "Dancing", "Music", "Food"],
    lastActive: "5 minutes ago",
    joinDate: "2024-03-10",
    matches: 67,
    likes: 312,
    views: 1580,
    subscription: "Platinum",
    adultMode: false,
    status: "flagged"
  }
];

export default function ProfilesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [verificationFilter, setVerificationFilter] = useState("all");

  const filteredProfiles = mockProfiles.filter(profile => {
    const matchesSearch = profile.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         profile.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || profile.status === statusFilter;
    const matchesVerification = verificationFilter === "all" || 
                               (verificationFilter === "verified" && profile.verified) ||
                               (verificationFilter === "unverified" && !profile.verified);
    
    return matchesSearch && matchesStatus && matchesVerification;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge variant="default" className="bg-green-100 text-green-800">Active</Badge>;
      case "flagged":
        return <Badge variant="destructive">Flagged</Badge>;
      case "suspended":
        return <Badge variant="secondary">Suspended</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getSubscriptionBadge = (subscription: string) => {
    switch (subscription) {
      case "Basic":
        return <Badge variant="outline">Basic</Badge>;
      case "Premium":
        return <Badge variant="default" className="bg-blue-100 text-blue-800">Premium</Badge>;
      case "Platinum":
        return <Badge variant="default" className="bg-purple-100 text-purple-800">Platinum</Badge>;
      default:
        return <Badge variant="outline">{subscription}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Profiles</h1>
        <p className="text-muted-foreground">
          Manage user profiles, photos, and verification status
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Profiles</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12,453</div>
            <p className="text-xs text-muted-foreground">
              +180 from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Verified Profiles</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8,921</div>
            <p className="text-xs text-muted-foreground">
              71.6% verification rate
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Incomplete Profiles</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,234</div>
            <p className="text-xs text-muted-foreground">
              &lt;50% completion rate
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Flagged Profiles</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">89</div>
            <p className="text-xs text-muted-foreground">
              Needs review
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
                <SelectItem value="flagged">Flagged</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
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
        {filteredProfiles.map((profile) => (
          <Card key={profile.id} className="overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={profile.avatar} />
                    <AvatarFallback>{profile.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{profile.name}</h3>
                      {profile.verified && (
                        <CheckCircle className="h-4 w-4 text-blue-500" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">Age {profile.age}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <MapPin className="h-3 w-3 text-muted-foreground" />
                      <p className="text-xs text-muted-foreground">{profile.location}</p>
                    </div>
                  </div>
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>{profile.name}&apos;s Profile</DialogTitle>
                      <DialogDescription>
                        Detailed profile information and management options
                      </DialogDescription>
                    </DialogHeader>
                    
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
                              <AvatarImage src={profile.avatar} />
                              <AvatarFallback>{profile.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                            </Avatar>
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <h3 className="text-xl font-semibold">{profile.name}</h3>
                                {getStatusBadge(profile.status)}
                                {getSubscriptionBadge(profile.subscription)}
                              </div>
                              <p className="text-muted-foreground">{profile.email}</p>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <span>Joined {profile.joinDate}</span>
                                <span>Last active {profile.lastActive}</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Profile Completion</label>
                            <Progress value={profile.profileCompletion} className="w-full" />
                            <p className="text-xs text-muted-foreground">{profile.profileCompletion}% complete</p>
                          </div>
                          
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Bio</label>
                            <p className="text-sm text-muted-foreground">{profile.bio}</p>
                          </div>
                          
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Interests</label>
                            <div className="flex flex-wrap gap-2">
                              {profile.interests.map((interest, index) => (
                                <Badge key={index} variant="secondary">{interest}</Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </TabsContent>
                      
                      <TabsContent value="photos" className="space-y-4">
                        <div className="grid gap-4 py-4">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium">Profile Photos ({profile.photos.length})</h4>
                            <Button variant="outline" size="sm">
                              <Camera className="h-4 w-4 mr-2" />
                              Manage Photos
                            </Button>
                          </div>
                          <div className="grid grid-cols-3 gap-4">
                            {profile.photos.map((photo, index) => (
                              <div key={index} className="relative aspect-square">
                                <Image
                                  src={photo} 
                                  alt={`Photo ${index + 1}`}
                                  className="w-full h-full object-cover rounded-lg border"
                                />
                                {index === 0 && (
                                  <Badge className="absolute top-2 left-2" variant="secondary">
                                    Primary
                                  </Badge>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      </TabsContent>
                      
                      <TabsContent value="activity" className="space-y-4">
                        <div className="grid gap-4 py-4">
                          <div className="grid grid-cols-3 gap-4">
                            <div className="text-center">
                              <div className="text-2xl font-bold text-blue-600">{profile.matches}</div>
                              <div className="text-sm text-muted-foreground">Matches</div>
                            </div>
                            <div className="text-center">
                              <div className="text-2xl font-bold text-green-600">{profile.likes}</div>
                              <div className="text-sm text-muted-foreground">Likes Given</div>
                            </div>
                            <div className="text-center">
                              <div className="text-2xl font-bold text-purple-600">{profile.views}</div>
                              <div className="text-sm text-muted-foreground">Profile Views</div>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <h4 className="font-medium">Recent Activity</h4>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span>Last login</span>
                                <span className="text-muted-foreground">{profile.lastActive}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Profile updated</span>
                                <span className="text-muted-foreground">3 days ago</span>
                              </div>
                              <div className="flex justify-between">
                                <span>New photo added</span>
                                <span className="text-muted-foreground">1 week ago</span>
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
                              <Button variant="outline" className="w-full justify-start">
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
                              {profile.status === "active" ? (
                                <Button variant="destructive" className="w-full justify-start">
                                  <XCircle className="h-4 w-4 mr-2" />
                                  Suspend Profile
                                </Button>
                              ) : (
                                <Button variant="default" className="w-full justify-start">
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Activate Profile
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </DialogContent>
                </Dialog>
              </div>
              
              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Profile Completion</span>
                  <span className="text-sm text-muted-foreground">{profile.profileCompletion}%</span>
                </div>
                <Progress value={profile.profileCompletion} className="w-full" />
              </div>
              
              <div className="mt-4 flex items-center justify-between">
                <div className="flex gap-2">
                  {getStatusBadge(profile.status)}
                  {getSubscriptionBadge(profile.subscription)}
                  {profile.adultMode && (
                    <Badge variant="outline" className="bg-red-50 text-red-700">18+</Badge>
                  )}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Heart className="h-3 w-3" />
                  <span>{profile.matches}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
} 