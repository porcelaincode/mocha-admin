"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Plus, RefreshCw } from "lucide-react";
import { getUsers, createSwipesForUser } from "@/lib/admin-services";

interface User {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  age?: number;
  location?: string;
  verified?: boolean;
}

interface CreateSwipeModalProps {
  onSwipeCreated: () => void;
}

export default function CreateSwipeModal({ onSwipeCreated }: CreateSwipeModalProps) {
  const [open, setOpen] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form state
  const [fromUserId, setFromUserId] = useState("");
  const [selectedTargetUsers, setSelectedTargetUsers] = useState<string[]>([]);
  const [tempTargetUser, setTempTargetUser] = useState("");

  useEffect(() => {
    if (open) {
      loadUsers();
    }
  }, [open]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const result = await getUsers(1, 200); // Get more users for selection
      setUsers(result.users);
    } catch (err) {
      setError("Failed to load users");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTargetUser = () => {
    if (tempTargetUser && !selectedTargetUsers.includes(tempTargetUser) && tempTargetUser !== fromUserId) {
      setSelectedTargetUsers(prev => [...prev, tempTargetUser]);
      setTempTargetUser("");
    }
  };

  const handleRemoveTargetUser = (userId: string) => {
    setSelectedTargetUsers(prev => prev.filter(id => id !== userId));
  };

  const handleCreateSwipes = async () => {
    if (!fromUserId) {
      setError("Please select a user to create swipes for");
      return;
    }

    if (selectedTargetUsers.length === 0) {
      setError("Please select at least one target user");
      return;
    }

    try {
      setCreating(true);
      setError(null);
      
      const result = await createSwipesForUser(fromUserId, selectedTargetUsers);
      
      if (result.success) {
        // const created = 'created' in result ? result.created : selectedTargetUsers.length;
        setOpen(false);
        onSwipeCreated();
        // Reset form
        setFromUserId("");
        setSelectedTargetUsers([]);
        setTempTargetUser("");
      } else {
        setError(result.error || "Failed to create swipes");
      }
    } catch (err) {
      setError("Failed to create swipes");
      console.error(err);
    } finally {
      setCreating(false);
    }
  };

  const getUserDisplayName = (user: User) => {
    return user.name || user.email || user.phoneNumber;
  };

  const availableTargetUsers = users.filter(user => 
    user.id !== fromUserId && !selectedTargetUsers.includes(user.id)
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Create Swipes
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create Swipes Manually</DialogTitle>
          <DialogDescription>
            Manually create swipes for a user by selecting target users. Maximum 5 active swipes per user.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* From User Selection */}
          <div>
            <Label htmlFor="from-user">User to create swipes for</Label>
            <Select value={fromUserId} onValueChange={setFromUserId}>
              <SelectTrigger>
                <SelectValue placeholder="Select user" />
              </SelectTrigger>
              <SelectContent>
                                 {loading ? (
                   <SelectItem value="loading" disabled>Loading users...</SelectItem>
                 ) : (
                  users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {getUserDisplayName(user)}
                      {user.verified && " ✓"}
                      {user.age && ` (${user.age})`}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Target Users Selection */}
          <div>
            <Label>Target Users (who will appear in swipe queue)</Label>
            <div className="space-y-2">
              <div className="flex gap-2">
                <Select 
                  value={tempTargetUser} 
                  onValueChange={setTempTargetUser}
                  disabled={!fromUserId}
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Select target user to add" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableTargetUsers.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {getUserDisplayName(user)}
                        {user.verified && " ✓"}
                        {user.age && ` (${user.age})`}
                        {user.location && ` - ${user.location}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button 
                  onClick={handleAddTargetUser}
                  disabled={!tempTargetUser}
                  variant="outline"
                >
                  Add
                </Button>
              </div>

              {/* Selected Target Users */}
              {selectedTargetUsers.length > 0 && (
                <div className="border rounded-lg p-3 space-y-2">
                  <div className="text-sm font-medium">
                    Selected Target Users ({selectedTargetUsers.length}/5)
                  </div>
                  <div className="space-y-1">
                    {selectedTargetUsers.map((userId) => {
                      const user = users.find(u => u.id === userId);
                      return (
                        <div key={userId} className="flex justify-between items-center p-2 bg-muted rounded">
                          <div>
                            <div className="font-medium">
                              {user ? getUserDisplayName(user) : "Unknown User"}
                              {user?.verified && " ✓"}
                            </div>
                            {user?.age && user?.location && (
                              <div className="text-sm text-muted-foreground">
                                Age: {user.age} • {user.location}
                              </div>
                            )}
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRemoveTargetUser(userId)}
                          >
                            Remove
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {selectedTargetUsers.length >= 5 && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Maximum of 5 swipes can be created per user. Remove some target users if you want to add different ones.
              </AlertDescription>
            </Alert>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleCreateSwipes}
              disabled={!fromUserId || selectedTargetUsers.length === 0 || creating}
            >
              {creating ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Create {selectedTargetUsers.length} Swipe{selectedTargetUsers.length !== 1 ? 's' : ''}
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 