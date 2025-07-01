"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { 
  Shield,
  Globe,
  Users,
  Save,
  Bell,
  CreditCard
} from "lucide-react";

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    // General Settings
    siteName: 'Dating App',
    siteDescription: 'Find your perfect match',
    maintenanceMode: false,
    registrationEnabled: true,
    emailVerificationRequired: true,
    
    // Security Settings
    passwordMinLength: 8,
    twoFactorEnabled: false,
    sessionTimeout: 24,
    maxLoginAttempts: 5,
    
    // Matching Settings
    maxDistance: 100,
    ageRangeMin: 18,
    ageRangeMax: 80,
    autoMatchEnabled: true,
    
    // Notification Settings
    emailNotifications: true,
    pushNotifications: true,
    marketingEmails: false,
    
    // Payment Settings
    stripePublicKey: '',
    stripeSecretKey: '',
    subscriptionPrices: {
      basic: 9.99,
      premium: 19.99,
      platinum: 29.99
    },
    
    // Content Moderation
    autoModerationEnabled: true,
    profanityFilterEnabled: true,
    imageAnalysisEnabled: true,
    manualApprovalRequired: false
  });

  /* eslint-disable @typescript-eslint/no-explicit-any */
  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  /* eslint-disable @typescript-eslint/no-explicit-any */
  const handleNestedSettingChange = (parent: string, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent as keyof typeof prev] as object,
        [key]: value
      }
    }));
  };

  const handleSaveSettings = async () => {
    try {
      // In a real implementation, you would call an API to save settings
      console.log('Saving settings:', settings);
      // Show success message
    } catch (error) {
      console.error('Error saving settings:', error);
      // Show error message
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Configure platform settings and preferences
        </p>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="matching">Matching</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="moderation">Moderation</TabsTrigger>
        </TabsList>
        
        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Globe className="mr-2 h-5 w-5" />
                Site Configuration
              </CardTitle>
              <CardDescription>
                Basic site settings and configuration
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Site Name</label>
                  <Input
                    value={settings.siteName}
                    onChange={(e) => handleSettingChange('siteName', e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Site Description</label>
                  <Input
                    value={settings.siteDescription}
                    onChange={(e) => handleSettingChange('siteDescription', e.target.value)}
                  />
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <label className="text-sm font-medium">Maintenance Mode</label>
                    <p className="text-sm text-muted-foreground">
                      Enable maintenance mode to prevent user access
                    </p>
                  </div>
                  <Switch 
                    checked={settings.maintenanceMode} 
                    onCheckedChange={(checked) => handleSettingChange('maintenanceMode', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <label className="text-sm font-medium">Registration Enabled</label>
                    <p className="text-sm text-muted-foreground">
                      Allow new users to register
                    </p>
                  </div>
                  <Switch 
                    checked={settings.registrationEnabled} 
                    onCheckedChange={(checked) => handleSettingChange('registrationEnabled', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <label className="text-sm font-medium">Email Verification Required</label>
                    <p className="text-sm text-muted-foreground">
                      Require email verification for new accounts
                    </p>
                  </div>
                  <Switch 
                    checked={settings.emailVerificationRequired} 
                    onCheckedChange={(checked) => handleSettingChange('emailVerificationRequired', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="mr-2 h-5 w-5" />
                Security Configuration
              </CardTitle>
              <CardDescription>
                Security and authentication settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Minimum Password Length</label>
                  <Input
                    type="number"
                    value={settings.passwordMinLength}
                    onChange={(e) => handleSettingChange('passwordMinLength', parseInt(e.target.value))}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Session Timeout (hours)</label>
                  <Input
                    type="number"
                    value={settings.sessionTimeout}
                    onChange={(e) => handleSettingChange('sessionTimeout', parseInt(e.target.value))}
                  />
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium">Max Login Attempts</label>
                <Input
                  type="number"
                  value={settings.maxLoginAttempts}
                  onChange={(e) => handleSettingChange('maxLoginAttempts', parseInt(e.target.value))}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <label className="text-sm font-medium">Two-Factor Authentication</label>
                  <p className="text-sm text-muted-foreground">
                    Enable two-factor authentication for admin accounts
                  </p>
                </div>
                <Switch
                  checked={settings.twoFactorEnabled}
                  onCheckedChange={(checked) => handleSettingChange('twoFactorEnabled', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="matching" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="mr-2 h-5 w-5" />
                Matching Algorithm
              </CardTitle>
              <CardDescription>
                Configure matching preferences and algorithms
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium">Max Distance (km)</label>
                  <Input
                    type="number"
                    value={settings.maxDistance}
                    onChange={(e) => handleSettingChange('maxDistance', parseInt(e.target.value))}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Min Age</label>
                  <Input
                    type="number"
                    value={settings.ageRangeMin}
                    onChange={(e) => handleSettingChange('ageRangeMin', parseInt(e.target.value))}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Max Age</label>
                  <Input
                    type="number"
                    value={settings.ageRangeMax}
                    onChange={(e) => handleSettingChange('ageRangeMax', parseInt(e.target.value))}
                  />
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <label className="text-sm font-medium">Auto-Match Enabled</label>
                  <p className="text-sm text-muted-foreground">
                    Automatically create matches based on preferences
                  </p>
                </div>
                <Switch
                  checked={settings.autoMatchEnabled}
                  onCheckedChange={(checked) => handleSettingChange('autoMatchEnabled', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bell className="mr-2 h-5 w-5" />
                Notification Configuration
              </CardTitle>
              <CardDescription>
                Configure notification settings and preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <label className="text-sm font-medium">Email Notifications</label>
                    <p className="text-sm text-muted-foreground">
                      Enable email notifications for users
                    </p>
                  </div>
                  <Switch
                    checked={settings.emailNotifications}
                    onCheckedChange={(checked) => handleSettingChange('emailNotifications', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <label className="text-sm font-medium">Push Notifications</label>
                    <p className="text-sm text-muted-foreground">
                      Enable push notifications for mobile apps
                    </p>
                  </div>
                  <Switch
                    checked={settings.pushNotifications}
                    onCheckedChange={(checked) => handleSettingChange('pushNotifications', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <label className="text-sm font-medium">Marketing Emails</label>
                    <p className="text-sm text-muted-foreground">
                      Enable marketing and promotional emails
                    </p>
                  </div>
                  <Switch
                    checked={settings.marketingEmails}
                    onCheckedChange={(checked) => handleSettingChange('marketingEmails', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="payments" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CreditCard className="mr-2 h-5 w-5" />
                Payment Configuration
              </CardTitle>
              <CardDescription>
                Configure payment processing and subscription pricing
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Stripe Public Key</label>
                  <Input
                    type="password"
                    value={settings.stripePublicKey}
                    onChange={(e) => handleSettingChange('stripePublicKey', e.target.value)}
                    placeholder="pk_test_..."
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Stripe Secret Key</label>
                  <Input
                    type="password"
                    value={settings.stripeSecretKey}
                    onChange={(e) => handleSettingChange('stripeSecretKey', e.target.value)}
                    placeholder="sk_test_..."
                  />
                </div>
              </div>
              
              <div>
                <label className="text-base font-medium">Subscription Pricing</label>
                <p className="text-sm text-muted-foreground mb-4">
                  Configure monthly subscription prices for each plan
                </p>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium">Basic Plan ($)</label>
                    <Input
                      type="number"
                      step="0.01"
                      value={settings.subscriptionPrices.basic}
                      onChange={(e) => handleNestedSettingChange('subscriptionPrices', 'basic', parseFloat(e.target.value))}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Premium Plan ($)</label>
                    <Input
                      type="number"
                      step="0.01"
                      value={settings.subscriptionPrices.premium}
                      onChange={(e) => handleNestedSettingChange('subscriptionPrices', 'premium', parseFloat(e.target.value))}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Platinum Plan ($)</label>
                    <Input
                      type="number"
                      step="0.01"
                      value={settings.subscriptionPrices.platinum}
                      onChange={(e) => handleNestedSettingChange('subscriptionPrices', 'platinum', parseFloat(e.target.value))}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="moderation" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="mr-2 h-5 w-5" />
                Content Moderation
              </CardTitle>
              <CardDescription>
                Configure content moderation and safety features
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <label className="text-sm font-medium">Auto Moderation</label>
                    <p className="text-sm text-muted-foreground">
                      Automatically moderate content using AI
                    </p>
                  </div>
                  <Switch
                    checked={settings.autoModerationEnabled}
                    onCheckedChange={(checked) => handleSettingChange('autoModerationEnabled', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <label className="text-sm font-medium">Profanity Filter</label>
                    <p className="text-sm text-muted-foreground">
                      Filter out inappropriate language in messages
                    </p>
                  </div>
                  <Switch
                    checked={settings.profanityFilterEnabled}
                    onCheckedChange={(checked) => handleSettingChange('profanityFilterEnabled', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <label className="text-sm font-medium">Image Analysis</label>
                    <p className="text-sm text-muted-foreground">
                      Analyze uploaded images for inappropriate content
                    </p>
                  </div>
                  <Switch
                    checked={settings.imageAnalysisEnabled}
                    onCheckedChange={(checked) => handleSettingChange('imageAnalysisEnabled', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <label className="text-sm font-medium">Manual Approval Required</label>
                    <p className="text-sm text-muted-foreground">
                      Require manual approval for all uploaded content
                    </p>
                  </div>
                  <Switch
                    checked={settings.manualApprovalRequired}
                    onCheckedChange={(checked) => handleSettingChange('manualApprovalRequired', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Button onClick={handleSaveSettings}>
        <Save className="mr-2 h-4 w-4" />
        Save All Changes
      </Button>
    </div>
  );
} 