"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Eye, 
  CheckCircle, 
  XCircle,
  Bot,
} from "lucide-react";

export default function ModerationPage() {
  const [autoModeration, setAutoModeration] = useState(true);
  const [adultContentFilter, setAdultContentFilter] = useState(true);
  const [spamDetection, setSpamDetection] = useState(true);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Moderation</h1>
        <p className="text-muted-foreground">
          Content moderation tools and automated filtering
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Auto-Moderated</CardTitle>
            <Bot className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2,345</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Manual Reviews</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">456</div>
            <p className="text-xs text-muted-foreground">Pending</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Content Blocked</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">789</div>
            <p className="text-xs text-muted-foreground">Today</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Accuracy Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">94.2%</div>
            <p className="text-xs text-muted-foreground">AI accuracy</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="settings" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="queue">Review Queue</TabsTrigger>
          <TabsTrigger value="filters">Content Filters</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>
        
        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Moderation Settings</CardTitle>
              <CardDescription>Configure automated moderation rules</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <label className="text-sm font-medium">Auto-Moderation</label>
                  <p className="text-sm text-muted-foreground">
                    Automatically review and moderate content using AI
                  </p>
                </div>
                <Switch 
                  checked={autoModeration} 
                  onCheckedChange={setAutoModeration}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <label className="text-sm font-medium">Adult Content Filter</label>
                  <p className="text-sm text-muted-foreground">
                    Detect and flag adult/NSFW content
                  </p>
                </div>
                <Switch 
                  checked={adultContentFilter} 
                  onCheckedChange={setAdultContentFilter}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <label className="text-sm font-medium">Spam Detection</label>
                  <p className="text-sm text-muted-foreground">
                    Automatically detect and remove spam content
                  </p>
                </div>
                <Switch 
                  checked={spamDetection} 
                  onCheckedChange={setSpamDetection}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="queue" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Review Queue</CardTitle>
              <CardDescription>Content pending manual review</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[1, 2, 3].map((item) => (
                  <div key={item} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-muted rounded"></div>
                      <div>
                        <p className="font-medium">Profile Photo Review</p>
                        <p className="text-sm text-muted-foreground">Flagged by AI for review</p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="default" size="sm">
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                      <Button variant="destructive" size="sm">
                        <XCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="filters" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Image Filters</CardTitle>
                <CardDescription>AI-powered image content detection</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Adult Content</span>
                    <Badge variant="default" className="bg-green-100 text-green-800">Active</Badge>
                  </div>
                  <Progress value={95} className="w-full" />
                  <p className="text-xs text-muted-foreground">95% accuracy</p>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Violence Detection</span>
                    <Badge variant="default" className="bg-green-100 text-green-800">Active</Badge>
                  </div>
                  <Progress value={88} className="w-full" />
                  <p className="text-xs text-muted-foreground">88% accuracy</p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Text Filters</CardTitle>
                <CardDescription>Natural language processing filters</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Harassment Detection</span>
                    <Badge variant="default" className="bg-green-100 text-green-800">Active</Badge>
                  </div>
                  <Progress value={92} className="w-full" />
                  <p className="text-xs text-muted-foreground">92% accuracy</p>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Spam Detection</span>
                    <Badge variant="default" className="bg-green-100 text-green-800">Active</Badge>
                  </div>
                  <Progress value={97} className="w-full" />
                  <p className="text-xs text-muted-foreground">97% accuracy</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Moderation Metrics</CardTitle>
                <CardDescription>Performance over the last 30 days</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Total Content Reviewed</span>
                  <span className="font-bold">15,432</span>
                </div>
                <div className="flex justify-between">
                  <span>Auto-Approved</span>
                  <span className="font-bold text-green-600">12,345 (80%)</span>
                </div>
                <div className="flex justify-between">
                  <span>Auto-Rejected</span>
                  <span className="font-bold text-red-600">1,234 (8%)</span>
                </div>
                <div className="flex justify-between">
                  <span>Manual Review</span>
                  <span className="font-bold text-blue-600">1,853 (12%)</span>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Top Violation Types</CardTitle>
                <CardDescription>Most common content violations</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Inappropriate Images</span>
                    <span className="font-bold">45%</span>
                  </div>
                  <Progress value={45} className="w-full" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Spam Messages</span>
                    <span className="font-bold">28%</span>
                  </div>
                  <Progress value={28} className="w-full" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Harassment</span>
                    <span className="font-bold">18%</span>
                  </div>
                  <Progress value={18} className="w-full" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Fake Profiles</span>
                    <span className="font-bold">9%</span>
                  </div>
                  <Progress value={9} className="w-full" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
} 