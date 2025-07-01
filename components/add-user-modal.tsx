"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  UserPlus,
  Upload,
  X,
  Plus,
  Loader2,
  CheckCircle,
  AlertCircle,
  Image,
  User,
  Heart,
  Settings
} from "lucide-react";
import { s3Service } from "@/lib/s3";

interface UserFormData {
  // Basic Info
  name: string;
  email: string;
  phoneNumber: string;
  age: string;
  bio: string;
  location: string;
  latitude: string;
  longitude: string;
  verified: boolean;
  interests: string[];
  
  // Meta fields
  isTestUser: boolean;
  isDummyUser: boolean;
  
  // Adult Profile Fields
  seductionStyle: string;
  flameLevel: string;
  fantasyTrigger: string;
  powerPlayPreference: string;
  topTurnOn: string;
  kinkScore: string;
  idealSetting: string;
  encounterFrequency: string;
  afterPassionUnwind: string;
  spicyMediaComfort: string;
  consentImportance: string;
  midnightCraving: string;
  riskTolerance: string;
  distancePreference: string;
}

interface PhotoUpload {
  file: File;
  preview: string;
  uploading: boolean;
  uploaded: boolean;
  url?: string;
  s3Key?: string;
  error?: string;
}

interface AddUserModalProps {
  onUserAdded?: () => void;
}

export default function AddUserModal({ onUserAdded }: AddUserModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentInterest, setCurrentInterest] = useState("");
  const [photos, setPhotos] = useState<PhotoUpload[]>([]);

  const [formData, setFormData] = useState<UserFormData>({
    name: "",
    email: "",
    phoneNumber: "",
    age: "",
    bio: "",
    location: "",
    latitude: "",
    longitude: "",
    verified: false,
    interests: [],
    isTestUser: false,
    isDummyUser: false,
    seductionStyle: "",
    flameLevel: "",
    fantasyTrigger: "",
    powerPlayPreference: "maybe",
    topTurnOn: "",
    kinkScore: "0",
    idealSetting: "",
    encounterFrequency: "",
    afterPassionUnwind: "",
    spicyMediaComfort: "",
    consentImportance: "0",
    midnightCraving: "",
    riskTolerance: "",
    distancePreference: ""
  });

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      phoneNumber: "",
      age: "",
      bio: "",
      location: "",
      latitude: "",
      longitude: "",
      verified: false,
      interests: [],
      isTestUser: false,
      isDummyUser: false,
      seductionStyle: "",
      flameLevel: "",
      fantasyTrigger: "",
      powerPlayPreference: "maybe",
      topTurnOn: "",
      kinkScore: "0",
      idealSetting: "",
      encounterFrequency: "",
      afterPassionUnwind: "",
      spicyMediaComfort: "",
      consentImportance: "0",
      midnightCraving: "",
      riskTolerance: "",
      distancePreference: ""
    });
    setPhotos([]);
    setCurrentInterest("");
    setError(null);
    setSuccess(false);
  };

  const handleInputChange = (field: keyof UserFormData, value: string | boolean | string[]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addInterest = () => {
    if (currentInterest.trim() && !formData.interests.includes(currentInterest.trim())) {
      handleInputChange('interests', [...formData.interests, currentInterest.trim()]);
      setCurrentInterest("");
    }
  };

  const removeInterest = (interest: string) => {
    handleInputChange('interests', formData.interests.filter(i => i !== interest));
  };

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    files.forEach(file => {
      // Validate file
      const validation = s3Service.validateMediaFile({
        mimetype: file.type,
        size: file.size
      });

      if (!validation.valid || validation.mediaType !== 'image') {
        setError(validation.error || 'Invalid file type');
        return;
      }

      if (photos.length >= 3) {
        setError('Maximum 3 photos allowed');
        return;
      }

      const preview = URL.createObjectURL(file);
      const newPhoto: PhotoUpload = {
        file,
        preview,
        uploading: false,
        uploaded: false
      };

      setPhotos(prev => [...prev, newPhoto]);
    });

    // Reset input
    event.target.value = '';
  };

  const removePhoto = (index: number) => {
    setPhotos(prev => {
      const newPhotos = [...prev];
      URL.revokeObjectURL(newPhotos[index].preview);
      newPhotos.splice(index, 1);
      return newPhotos;
    });
  };

  const uploadPhotos = async (userId: string): Promise<{ url: string; s3Key: string; originalName: string }[]> => {
    const uploadedPhotos: { url: string; s3Key: string; originalName: string }[] = [];

    for (let i = 0; i < photos.length; i++) {
      const photo = photos[i];
      
      try {
        // Update photo state to uploading
        setPhotos(prev => prev.map((p, idx) => 
          idx === i ? { ...p, uploading: true } : p
        ));

        // Convert file to buffer
        const arrayBuffer = await photo.file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Generate S3 key
        const s3Key = s3Service.generatePhotoKey(`manual_upload_${Date.now()}`, photo.file.name, userId);

        // Upload to S3
        const uploadResult = await s3Service.uploadFile(
          s3Key,
          buffer,
          photo.file.type,
          {
            userId,
            photoIndex: (i + 1).toString(),
            uploadType: 'manual_upload',
            originalName: photo.file.name
          }
        );

        if (!uploadResult.success) {
          throw new Error(uploadResult.error || 'Upload failed');
        }

        // Update photo state to uploaded
        setPhotos(prev => prev.map((p, idx) => 
          idx === i ? { 
            ...p, 
            uploading: false, 
            uploaded: true, 
            url: uploadResult.url,
            s3Key 
          } : p
        ));

        uploadedPhotos.push({
          url: uploadResult.url!,
          s3Key,
          originalName: photo.file.name
        });

      } catch (error) {
        console.error(`Failed to upload photo ${i + 1}:`, error);
        
        // Update photo state with error
        setPhotos(prev => prev.map((p, idx) => 
          idx === i ? { 
            ...p, 
            uploading: false, 
            error: error instanceof Error ? error.message : 'Upload failed'
          } : p
        ));
      }
    }

    return uploadedPhotos;
  };

  const handleSubmit = async () => {
    if (!formData.phoneNumber.trim()) {
      setError('Phone number is required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // First upload photos to S3 and get URLs
      let photoUrls: { url: string; order: number }[] = [];
      if (photos.length > 0) {
        const uploadedPhotos = await uploadPhotos('temp_user_id'); // Temporary ID for upload
        photoUrls = uploadedPhotos.map((photo, index) => ({
          url: photo.url,
          order: index + 1
        }));
      }

      // Create user using the existing bulk upload service
      const userData = {
        name: formData.name || undefined,
        email: formData.email || undefined,
        phoneNumber: formData.phoneNumber,
        age: formData.age ? parseInt(formData.age) : undefined,
        bio: formData.bio || undefined,
        location: formData.location || undefined,
        latitude: formData.latitude ? parseFloat(formData.latitude) : undefined,
        longitude: formData.longitude ? parseFloat(formData.longitude) : undefined,
        verified: formData.verified,
        interests: formData.interests,
        isTestUser: formData.isTestUser,
        isDummyUser: formData.isDummyUser,
        seductionStyle: formData.seductionStyle || undefined,
        flameLevel: formData.flameLevel || undefined,
        fantasyTrigger: formData.fantasyTrigger || undefined,
        powerPlayPreference: formData.powerPlayPreference || 'maybe',
        topTurnOn: formData.topTurnOn || undefined,
        kinkScore: formData.kinkScore ? parseInt(formData.kinkScore) : 0,
        idealSetting: formData.idealSetting || undefined,
        encounterFrequency: formData.encounterFrequency || undefined,
        afterPassionUnwind: formData.afterPassionUnwind || undefined,
        spicyMediaComfort: formData.spicyMediaComfort || undefined,
        consentImportance: formData.consentImportance ? parseInt(formData.consentImportance) : 0,
        midnightCraving: formData.midnightCraving || undefined,
        riskTolerance: formData.riskTolerance || undefined,
        distancePreference: formData.distancePreference || undefined,
        photos: photoUrls
      };

      // Use the existing bulk upload function for consistency
      const { bulkUploadUsers } = await import('@/lib/admin-services');
      const result = await bulkUploadUsers([userData]);

      if (!result.success || result.createdUsers.length === 0) {
        throw new Error(result.errors[0]?.error || 'Failed to create user');
      }

      setSuccess(true);
      onUserAdded?.();
      
      setTimeout(() => {
        setIsOpen(false);
        resetForm();
      }, 2000);

    } catch (error) {
      console.error('Error creating user:', error);
      setError(error instanceof Error ? error.message : 'Failed to create user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      setIsOpen(open);
      if (!open) resetForm();
    }}>
      <DialogTrigger asChild>
        <Button>
          <UserPlus className="mr-2 h-4 w-4" />
          Add User
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Add New User
          </DialogTitle>
          <DialogDescription>
            Create a new user with complete profile information and photos
          </DialogDescription>
        </DialogHeader>

        {success ? (
          <div className="py-8">
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                User created successfully! The modal will close automatically.
              </AlertDescription>
            </Alert>
          </div>
        ) : (
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="adult">Adult Profile</TabsTrigger>
              <TabsTrigger value="photos">Photos</TabsTrigger>
              <TabsTrigger value="preferences">Preferences</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="John Doe"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="john@example.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    value={formData.phoneNumber}
                    onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                    placeholder="+1234567890"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="age">Age</Label>
                  <Input
                    id="age"
                    type="number"
                    min="18"
                    max="99"
                    value={formData.age}
                    onChange={(e) => handleInputChange('age', e.target.value)}
                    placeholder="25"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  placeholder="New York, NY"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="latitude">Latitude</Label>
                  <Input
                    id="latitude"
                    type="number"
                    step="any"
                    value={formData.latitude}
                    onChange={(e) => handleInputChange('latitude', e.target.value)}
                    placeholder="40.7128"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="longitude">Longitude</Label>
                  <Input
                    id="longitude"
                    type="number"
                    step="any"
                    value={formData.longitude}
                    onChange={(e) => handleInputChange('longitude', e.target.value)}
                    placeholder="-74.0060"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  placeholder="Tell us about yourself..."
                  rows={3}
                />
              </div>

              <div className="space-y-4">
                <Label>Interests</Label>
                <div className="flex gap-2">
                  <Input
                    value={currentInterest}
                    onChange={(e) => setCurrentInterest(e.target.value)}
                    placeholder="Add an interest"
                    onKeyPress={(e) => e.key === 'Enter' && addInterest()}
                  />
                  <Button type="button" onClick={addInterest} size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.interests.map((interest, index) => (
                    <Badge key={index} variant="secondary" className="cursor-pointer">
                      {interest}
                      <X 
                        className="h-3 w-3 ml-1" 
                        onClick={() => removeInterest(interest)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="verified"
                    checked={formData.verified}
                    onCheckedChange={(checked) => handleInputChange('verified', checked)}
                  />
                  <Label htmlFor="verified">Verified User</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="isTestUser"
                    checked={formData.isTestUser}
                    onCheckedChange={(checked) => handleInputChange('isTestUser', checked)}
                  />
                  <Label htmlFor="isTestUser">Test User</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="isDummyUser"
                    checked={formData.isDummyUser}
                    onCheckedChange={(checked) => handleInputChange('isDummyUser', checked)}
                  />
                  <Label htmlFor="isDummyUser">Dummy User</Label>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="adult" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="seductionStyle">Seduction Style</Label>
                  <Select value={formData.seductionStyle} onValueChange={(value) => handleInputChange('seductionStyle', value)}>
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
                </div>
                <div className="space-y-2">
                  <Label htmlFor="flameLevel">Flame Level</Label>
                  <Select value={formData.flameLevel} onValueChange={(value) => handleInputChange('flameLevel', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mild_spark">Mild Spark</SelectItem>
                      <SelectItem value="hot_blaze">Hot Blaze</SelectItem>
                      <SelectItem value="scorching_inferno">Scorching Inferno</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="powerPlay">Power Play Preference</Label>
                  <Select value={formData.powerPlayPreference} onValueChange={(value) => handleInputChange('powerPlayPreference', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="yes">Yes</SelectItem>
                      <SelectItem value="no">No</SelectItem>
                      <SelectItem value="maybe">Maybe</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="riskTolerance">Risk Tolerance</Label>
                  <Select value={formData.riskTolerance} onValueChange={(value) => handleInputChange('riskTolerance', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select tolerance" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="kinkScore">Kink Score (0-10)</Label>
                  <Input
                    id="kinkScore"
                    type="number"
                    min="0"
                    max="10"
                    value={formData.kinkScore}
                    onChange={(e) => handleInputChange('kinkScore', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="consentImportance">Consent Importance (0-10)</Label>
                  <Input
                    id="consentImportance"
                    type="number"
                    min="0"
                    max="10"
                    value={formData.consentImportance}
                    onChange={(e) => handleInputChange('consentImportance', e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="fantasyTrigger">Fantasy Trigger</Label>
                <Input
                  id="fantasyTrigger"
                  value={formData.fantasyTrigger}
                  onChange={(e) => handleInputChange('fantasyTrigger', e.target.value)}
                  placeholder="What triggers your fantasy?"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="topTurnOn">Top Turn On</Label>
                <Input
                  id="topTurnOn"
                  value={formData.topTurnOn}
                  onChange={(e) => handleInputChange('topTurnOn', e.target.value)}
                  placeholder="What turns you on most?"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="idealSetting">Ideal Setting</Label>
                <Input
                  id="idealSetting"
                  value={formData.idealSetting}
                  onChange={(e) => handleInputChange('idealSetting', e.target.value)}
                  placeholder="Describe your ideal setting"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="midnightCraving">Midnight Craving</Label>
                <Input
                  id="midnightCraving"
                  value={formData.midnightCraving}
                  onChange={(e) => handleInputChange('midnightCraving', e.target.value)}
                  placeholder="What do you crave at midnight?"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="afterPassionUnwind">After Passion Unwind</Label>
                <Input
                  id="afterPassionUnwind"
                  value={formData.afterPassionUnwind}
                  onChange={(e) => handleInputChange('afterPassionUnwind', e.target.value)}
                  placeholder="How do you unwind after passion?"
                />
              </div>
            </TabsContent>

            <TabsContent value="photos" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Image className="h-4 w-4" />
                    Photo Upload
                  </CardTitle>
                  <CardDescription>
                    Upload up to 3 photos. Images will be automatically uploaded to S3 and served via CloudFront CDN.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handlePhotoUpload}
                      className="hidden"
                      id="photo-upload"
                    />
                    <label htmlFor="photo-upload">
                      <Button variant="outline" asChild disabled={photos.length >= 3}>
                        <span>
                          <Upload className="mr-2 h-4 w-4" />
                          Upload Photos
                        </span>
                      </Button>
                    </label>
                    <span className="text-sm text-muted-foreground">
                      {photos.length}/3 photos uploaded
                    </span>
                  </div>

                  {photos.length > 0 && (
                    <div className="grid grid-cols-3 gap-4">
                      {photos.map((photo, index) => (
                        <div key={index} className="relative">
                          <img
                            src={photo.preview}
                            alt={`Photo ${index + 1}`}
                            className="w-full h-32 object-cover rounded-lg border"
                          />
                          <Button
                            variant="destructive"
                            size="sm"
                            className="absolute top-1 right-1"
                            onClick={() => removePhoto(index)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                          {photo.uploading && (
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
                              <Loader2 className="h-6 w-6 text-white animate-spin" />
                            </div>
                          )}
                          {photo.uploaded && (
                            <div className="absolute bottom-1 right-1">
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            </div>
                          )}
                          {photo.error && (
                            <div className="absolute bottom-1 left-1">
                              <AlertCircle className="h-4 w-4 text-red-500" />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="preferences" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="encounterFrequency">Encounter Frequency</Label>
                  <Select value={formData.encounterFrequency} onValueChange={(value) => handleInputChange('encounterFrequency', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="sporadically">Sporadically</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="spicyMediaComfort">Spicy Media Comfort</Label>
                  <Select value={formData.spicyMediaComfort} onValueChange={(value) => handleInputChange('spicyMediaComfort', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select comfort level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="very">Very Comfortable</SelectItem>
                      <SelectItem value="somewhat">Somewhat Comfortable</SelectItem>
                      <SelectItem value="not_at_all">Not At All</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="distancePreference">Distance Preference</Label>
                <Select value={formData.distancePreference} onValueChange={(value) => handleInputChange('distancePreference', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select preference" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="local">Local</SelectItem>
                    <SelectItem value="long_distance">Long Distance</SelectItem>
                    <SelectItem value="both">Both</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </TabsContent>
          </Tabs>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {!success && (
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={loading || !formData.phoneNumber.trim()}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating User...
                </>
              ) : (
                <>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Create User
                </>
              )}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
} 