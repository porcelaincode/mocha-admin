/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Save,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Heart,
  MessageCircle,
  Shield,
  Crown,
  Eye,
  Camera,
  Edit,
  Ban,
  CheckCircle,
  UserX,
  Loader2,
  Star,
  Coins,
  Image as ImageIcon,
  Video,
  Download,
  Trash2
} from "lucide-react";
import { getUserById, updateUser } from "@/lib/admin-services";

const subscriptionColors = {
  basic: "bg-gray-100 text-gray-800",
  premium: "bg-blue-100 text-blue-800",
  platinum: "bg-purple-100 text-purple-800"
};

export default function UserProfilePage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;
  
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState<any>({});

  useEffect(() => {
    if (userId) {
      fetchUser();
    }
  }, [userId]);

  const fetchUser = async () => {
    try {
      setLoading(true);
      const userData = await getUserById(userId);
      setUser(userData);
      setFormData(userData);
    } catch (error) {
      console.error('Error fetching user:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      // Prepare update data (exclude read-only fields)
      const updateData = {
        name: formData.name,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        age: formData.age,
        location: formData.location,
        bio: formData.bio,
        verified: formData.verified,
        interests: formData.interests,
        preferences: formData.preferences,
        isAdultModeEnabled: formData.isAdultModeEnabled,
        // Adult profile fields
        seductionStyle: formData.seductionStyle,
        flameLevel: formData.flameLevel,
        fantasyTrigger: formData.fantasyTrigger,
        powerPlayPreference: formData.powerPlayPreference,
        topTurnOn: formData.topTurnOn,
        kinkScore: formData.kinkScore,
        idealSetting: formData.idealSetting,
        encounterFrequency: formData.encounterFrequency,
        afterPassionUnwind: formData.afterPassionUnwind,
        spicyMediaComfort: formData.spicyMediaComfort,
        consentImportance: formData.consentImportance,
        midnightCraving: formData.midnightCraving,
        riskTolerance: formData.riskTolerance,
        distancePreference: formData.distancePreference,
        // Credits
        likesCredits: formData.likesCredits,
        notesCredits: formData.notesCredits,
        chatRequestCredits: formData.chatRequestCredits,
      };

      await updateUser(userId, updateData);
      await fetchUser(); // Refresh data
      setEditMode(false);
    } catch (error) {
      console.error('Error updating user:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      [field]: value
    }));
  };

  const PhotoGallery = ({ photos, title }: { photos: any[], title: string }) => (
    <div className="space-y-4">
      <h4 className="font-medium">{title} ({photos.length})</h4>
      {photos.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {photos.map((photo, index) => (
            <div key={photo.id || index} className="relative group">
              <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                <img
                  src={photo.url}
                  alt={photo.originalName || `Photo ${index + 1}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    console.error('Failed to load image:', photo.url);
                    (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/shapes/svg?seed=${photo.id}`;
                  }}
                />
              </div>
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                <div className="flex space-x-2">
                  <Button size="sm" variant="secondary" title="Download">
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="destructive" title="Delete">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              {photo.isDefault && (
                <Badge className="absolute top-2 left-2 bg-blue-500">Default</Badge>
              )}
              <div className="absolute bottom-2 right-2 flex space-x-1">
                <Badge variant="secondary" className="text-xs">
                  {photo.mediaType === 'video' ? <Video className="h-3 w-3" /> : <ImageIcon className="h-3 w-3" />}
                </Badge>
                {photo.size && (
                  <Badge variant="outline" className="text-xs">
                    {(photo.size / 1024 / 1024).toFixed(1)}MB
                  </Badge>
                )}
              </div>
              {photo.duration && (
                <Badge className="absolute top-2 right-2 bg-black/70 text-white text-xs">
                  {Math.floor(photo.duration / 60)}:{(photo.duration % 60).toString().padStart(2, '0')}
                </Badge>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          <Camera className="mx-auto h-12 w-12 mb-2" />
          <p>No {title.toLowerCase()} uploaded</p>
        </div>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading user profile...</span>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-8">
        <UserX className="mx-auto h-12 w-12 text-muted-foreground" />
        <h3 className="mt-2 text-lg font-semibold">User not found</h3>
        <Button onClick={() => router.back()} className="mt-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{user.name}</h1>
            <p className="text-muted-foreground">User Profile Management</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {editMode ? (
            <>
              <Button variant="outline" onClick={() => setEditMode(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                Save Changes
              </Button>
            </>
          ) : (
            <Button onClick={() => setEditMode(true)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit Profile
            </Button>
          )}
        </div>
      </div>

      {/* Profile Header Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start space-x-6">
            <Avatar className="h-24 w-24">
              <AvatarImage 
                src={user.profilePhotos?.[0]?.url || user.photos?.find((p: any) => p.isDefault)?.url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`} 
                alt={`${user.name}'s profile photo`}
              />
              <AvatarFallback className="text-lg">
                {user.name.split(' ').map((n: string) => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-4">
              <div className="flex items-center space-x-4">
                <div>
                  <h2 className="text-2xl font-bold">{user.name}</h2>
                  <p className="text-muted-foreground">{user.email}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${user.isOnline ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                  <span className="text-sm">{user.isOnline ? 'Online' : `Last seen ${user.lastSeen}`}</span>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                {user.verified && <Shield className="h-5 w-5 text-blue-500" />}
                <Badge className={subscriptionColors[user.subscription as keyof typeof subscriptionColors]}>
                  {user.subscription}
                </Badge>
                <Badge variant="outline">ID: {user.id}</Badge>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-pink-600">{user.matches}</div>
                  <div className="text-sm text-muted-foreground">Matches</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{user.messages}</div>
                  <div className="text-sm text-muted-foreground">Messages</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{user.profileViews}</div>
                  <div className="text-sm text-muted-foreground">Profile Views</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{user.likesReceived}</div>
                  <div className="text-sm text-muted-foreground">Likes Received</div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="photos">Photos</TabsTrigger>
          <TabsTrigger value="adult">Adult Profile</TabsTrigger>
          <TabsTrigger value="subscription">Subscription</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="actions">Actions</TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  {editMode ? (
                    <Input
                      id="name"
                      value={formData.name || ''}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                    />
                  ) : (
                    <p className="text-sm">{user.name || 'Not provided'}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  {editMode ? (
                    <Input
                      id="email"
                      type="email"
                      value={formData.email || ''}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                    />
                  ) : (
                    <p className="text-sm">{user.email || 'Not provided'}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  {editMode ? (
                    <Input
                      id="phone"
                      value={formData.phoneNumber || ''}
                      onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                    />
                  ) : (
                    <p className="text-sm">{user.phoneNumber || 'Not provided'}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="age">Age</Label>
                    {editMode ? (
                      <Input
                        id="age"
                        type="number"
                        value={formData.age || ''}
                        onChange={(e) => handleInputChange('age', parseInt(e.target.value))}
                      />
                    ) : (
                      <p className="text-sm">{user.age || 'Not provided'}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    {editMode ? (
                      <Input
                        id="location"
                        value={formData.location || ''}
                        onChange={(e) => handleInputChange('location', e.target.value)}
                      />
                    ) : (
                      <p className="text-sm">{user.location || 'Not provided'}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  {editMode ? (
                    <Textarea
                      id="bio"
                      rows={3}
                      value={formData.bio || ''}
                      onChange={(e) => handleInputChange('bio', e.target.value)}
                    />
                  ) : (
                    <p className="text-sm">{user.bio || 'No bio provided'}</p>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="verified"
                    checked={editMode ? formData.verified : user.verified}
                    onCheckedChange={(checked) => editMode && handleInputChange('verified', checked)}
                    disabled={!editMode}
                  />
                  <Label htmlFor="verified">Verified Account</Label>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Account Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Account Created</span>
                  <span className="text-sm text-muted-foreground">{user.createdAt}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Last Updated</span>
                  <span className="text-sm text-muted-foreground">{user.updatedAt}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Last Login</span>
                  <span className="text-sm text-muted-foreground">{user.lastLoginAt}</span>
                </div>

                <Separator />

                <div className="space-y-3">
                  <h4 className="font-medium">Credits</h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      {editMode ? (
                        <Input
                          type="number"
                          value={formData.likesCredits || 0}
                          onChange={(e) => handleInputChange('likesCredits', parseInt(e.target.value))}
                          className="text-center"
                        />
                      ) : (
                        <div className="text-lg font-bold text-pink-600">{user.likesCredits}</div>
                      )}
                      <div className="text-xs text-muted-foreground">Likes</div>
                    </div>
                    <div className="text-center">
                      {editMode ? (
                        <Input
                          type="number"
                          value={formData.notesCredits || 0}
                          onChange={(e) => handleInputChange('notesCredits', parseInt(e.target.value))}
                          className="text-center"
                        />
                      ) : (
                        <div className="text-lg font-bold text-blue-600">{user.notesCredits}</div>
                      )}
                      <div className="text-xs text-muted-foreground">Notes</div>
                    </div>
                    <div className="text-center">
                      {editMode ? (
                        <Input
                          type="number"
                          value={formData.chatRequestCredits || 0}
                          onChange={(e) => handleInputChange('chatRequestCredits', parseInt(e.target.value))}
                          className="text-center"
                        />
                      ) : (
                        <div className="text-lg font-bold text-green-600">{user.chatRequestCredits}</div>
                      )}
                      <div className="text-xs text-muted-foreground">Chat Requests</div>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-3">
                  <h4 className="font-medium">Interests</h4>
                  <div className="flex flex-wrap gap-2">
                    {user.interests && user.interests.length > 0 ? (
                      user.interests.map((interest: string, index: number) => (
                        <Badge key={index} variant="outline">
                          {interest}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-sm text-muted-foreground">No interests added</span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Photos Tab */}
        <TabsContent value="photos" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Camera className="mr-2 h-5 w-5" />
                  Profile Photos
                </CardTitle>
                <CardDescription>
                  Photos displayed on the user's dating profile
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PhotoGallery photos={user.profilePhotos} title="Profile Photos" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <ImageIcon className="mr-2 h-5 w-5" />
                  Onboarding Photos
                </CardTitle>
                <CardDescription>
                  Photos uploaded during the onboarding process
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PhotoGallery photos={user.onboardingPhotos} title="Onboarding Photos" />
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>All Photos ({user.photos.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <PhotoGallery photos={user.photos} title="All Photos" />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Adult Profile Tab */}
        <TabsContent value="adult" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Adult Mode Settings</CardTitle>
              <CardDescription>
                Adult content preferences and profile settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="adultMode"
                  checked={editMode ? formData.isAdultModeEnabled : user.isAdultModeEnabled}
                  onCheckedChange={(checked) => editMode && handleInputChange('isAdultModeEnabled', checked)}
                  disabled={!editMode}
                />
                <Label htmlFor="adultMode">Adult Mode Enabled</Label>
              </div>

              {(editMode ? formData.isAdultModeEnabled : user.isAdultModeEnabled) && (
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Seduction Style</Label>
                      {editMode ? (
                        <Select
                          value={formData.seductionStyle || ''}
                          onValueChange={(value) => handleInputChange('seductionStyle', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select style" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="playful_tease">Playful Tease</SelectItem>
                            <SelectItem value="mysterious_allure">Mysterious Allure</SelectItem>
                            <SelectItem value="dominant_edge">Dominant Edge</SelectItem>
                            <SelectItem value="sensual_whisper">Sensual Whisper</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <p className="text-sm">{user.seductionStyle || 'Not set'}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label>Flame Level</Label>
                      {editMode ? (
                        <Select
                          value={formData.flameLevel || ''}
                          onValueChange={(value) => handleInputChange('flameLevel', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select level" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="mild_spark">Mild Spark</SelectItem>
                            <SelectItem value="hot_blaze">Hot Blaze</SelectItem>
                            <SelectItem value="scorching_inferno">Scorching Inferno</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <p className="text-sm">{user.flameLevel || 'Not set'}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label>Fantasy Trigger</Label>
                      {editMode ? (
                        <Textarea
                          value={formData.fantasyTrigger || ''}
                          onChange={(e) => handleInputChange('fantasyTrigger', e.target.value)}
                          rows={2}
                        />
                      ) : (
                        <p className="text-sm">{user.fantasyTrigger || 'Not provided'}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label>Top Turn On</Label>
                      {editMode ? (
                        <Input
                          value={formData.topTurnOn || ''}
                          onChange={(e) => handleInputChange('topTurnOn', e.target.value)}
                        />
                      ) : (
                        <p className="text-sm">{user.topTurnOn || 'Not provided'}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label>Kink Score (0-10)</Label>
                      {editMode ? (
                        <Input
                          type="number"
                          min="0"
                          max="10"
                          value={formData.kinkScore || 0}
                          onChange={(e) => handleInputChange('kinkScore', parseInt(e.target.value))}
                        />
                      ) : (
                        <p className="text-sm">{user.kinkScore}/10</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Power Play Preference</Label>
                      {editMode ? (
                        <Select
                          value={formData.powerPlayPreference || ''}
                          onValueChange={(value) => handleInputChange('powerPlayPreference', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select preference" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="yes">Yes</SelectItem>
                            <SelectItem value="no">No</SelectItem>
                            <SelectItem value="maybe">Maybe</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <p className="text-sm">{user.powerPlayPreference || 'Not set'}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label>Risk Tolerance</Label>
                      {editMode ? (
                        <Select
                          value={formData.riskTolerance || ''}
                          onValueChange={(value) => handleInputChange('riskTolerance', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select tolerance" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <p className="text-sm">{user.riskTolerance || 'Not set'}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label>Spicy Media Comfort</Label>
                      {editMode ? (
                        <Select
                          value={formData.spicyMediaComfort || ''}
                          onValueChange={(value) => handleInputChange('spicyMediaComfort', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select comfort level" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="very">Very Comfortable</SelectItem>
                            <SelectItem value="somewhat">Somewhat Comfortable</SelectItem>
                            <SelectItem value="not_at_all">Not Comfortable</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <p className="text-sm">{user.spicyMediaComfort || 'Not set'}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label>Consent Importance (0-10)</Label>
                      {editMode ? (
                        <Input
                          type="number"
                          min="0"
                          max="10"
                          value={formData.consentImportance || 0}
                          onChange={(e) => handleInputChange('consentImportance', parseInt(e.target.value))}
                        />
                      ) : (
                        <p className="text-sm">{user.consentImportance}/10</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label>Midnight Craving</Label>
                      {editMode ? (
                        <Input
                          value={formData.midnightCraving || ''}
                          onChange={(e) => handleInputChange('midnightCraving', e.target.value)}
                        />
                      ) : (
                        <p className="text-sm">{user.midnightCraving || 'Not provided'}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Subscription Tab */}
        <TabsContent value="subscription" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Crown className="mr-2 h-5 w-5" />
                Subscription Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-medium">Current Plan</span>
                <Badge className={subscriptionColors[user.subscription as keyof typeof subscriptionColors]}>
                  {user.subscription}
                </Badge>
              </div>

              {user.subscriptionDetails && (
                <>
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Price</span>
                    <span>{user.subscriptionDetails.recurringPrice} {user.subscriptionDetails.currency}/month</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="font-medium">Renews At</span>
                    <span>{new Date(user.subscriptionDetails.renewsAt).toLocaleDateString()}</span>
                  </div>
                </>
              )}

              <Separator />

              <div className="space-y-2">
                <h4 className="font-medium">Plan Features</h4>
                <div className="space-y-2 text-sm">
                  {user.subscription === 'basic' && (
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                      <li>50 likes per day</li>
                      <li>Basic matching</li>
                      <li>Limited chat requests</li>
                    </ul>
                  )}
                  {user.subscription === 'premium' && (
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                      <li>Unlimited likes</li>
                      <li>See who liked you</li>
                      <li>Unlimited chat requests</li>
                      <li>Advanced filters</li>
                    </ul>
                  )}
                  {user.subscription === 'platinum' && (
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                      <li>All Premium features</li>
                      <li>Priority matching</li>
                      <li>Read receipts</li>
                      <li>Exclusive content access</li>
                    </ul>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Activity Tab */}
        <TabsContent value="activity" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Engagement Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Heart className="h-4 w-4 text-pink-500" />
                    <span className="text-sm">Likes Sent</span>
                  </div>
                  <span className="font-medium">{user.likesSent}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Heart className="h-4 w-4 text-red-500" />
                    <span className="text-sm">Likes Received</span>
                  </div>
                  <span className="font-medium">{user.likesReceived}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Star className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm">Super Likes</span>
                  </div>
                  <span className="font-medium">{user.superLikes}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Eye className="h-4 w-4 text-blue-500" />
                    <span className="text-sm">Profile Views</span>
                  </div>
                  <span className="font-medium">{user.profileViews}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <MessageCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Messages Sent</span>
                  </div>
                  <span className="font-medium">{user.messages}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Account Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${user.isOnline ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                  <span className="text-sm">
                    {user.isOnline ? 'Currently Online' : `Last seen ${user.lastSeen}`}
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  {user.verified ? (
                    <>
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm text-green-600">Verified Account</span>
                    </>
                  ) : (
                    <>
                      <UserX className="h-4 w-4 text-yellow-500" />
                      <span className="text-sm text-yellow-600">Unverified Account</span>
                    </>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <Badge variant="outline">Active</Badge>
                  <span className="text-sm text-muted-foreground">Account Status</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Actions Tab */}
        <TabsContent value="actions" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>User Actions</CardTitle>
                <CardDescription>
                  Actions you can perform on this user account
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <Mail className="mr-2 h-4 w-4" />
                  Send Message
                </Button>

                <Button variant="outline" className="w-full justify-start">
                  <Shield className="mr-2 h-4 w-4" />
                  {user.verified ? 'Remove Verification' : 'Verify User'}
                </Button>

                <Button variant="outline" className="w-full justify-start">
                  <Crown className="mr-2 h-4 w-4" />
                  Change Subscription
                </Button>

                <Button variant="outline" className="w-full justify-start">
                  <Coins className="mr-2 h-4 w-4" />
                  Add Credits
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Moderation Actions</CardTitle>
                <CardDescription>
                  Moderation and safety actions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start text-yellow-600">
                  <Ban className="mr-2 h-4 w-4" />
                  Suspend User
                </Button>

                <Button variant="outline" className="w-full justify-start text-red-600">
                  <UserX className="mr-2 h-4 w-4" />
                  Delete Account
                </Button>

                <Button variant="outline" className="w-full justify-start">
                  <Eye className="mr-2 h-4 w-4" />
                  View Reports
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
