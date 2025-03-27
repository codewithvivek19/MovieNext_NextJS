'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Loader2 } from 'lucide-react';

export default function ProfilePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateMessage, setUpdateMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  // Redirect if not logged in
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // Load user data
  useEffect(() => {
    if (user?.user_metadata?.full_name) {
      setFullName(user.user_metadata.full_name);
    }
  }, [user]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    setUpdateMessage(null);

    try {
      const { error } = await fetch('/api/update-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fullName }),
      }).then(res => res.json());

      if (error) {
        throw new Error(error);
      }

      setUpdateMessage({
        type: 'success',
        text: 'Your profile has been updated successfully!'
      });
    } catch (error: any) {
      setUpdateMessage({
        type: 'error',
        text: error.message || 'Failed to update profile. Please try again.'
      });
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 flex justify-center items-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16 max-w-3xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Your Profile</CardTitle>
          <CardDescription>
            View and edit your profile information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpdateProfile} className="space-y-6">
            {updateMessage && (
              <div className={`p-3 rounded-md flex items-center gap-2 text-sm ${
                updateMessage.type === 'success' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-destructive/15 text-destructive'
              }`}>
                <AlertCircle size={16} />
                <p>{updateMessage.text}</p>
              </div>
            )}
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  value={user?.email || ''} 
                  disabled 
                  className="mt-1"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Your email cannot be changed
                </p>
              </div>
              
              <div>
                <Label htmlFor="fullName">Full Name</Label>
                <Input 
                  id="fullName" 
                  value={fullName} 
                  onChange={(e) => setFullName(e.target.value)}
                  className="mt-1"
                  disabled={isUpdating}
                />
              </div>
            </div>
            
            <Button type="submit" disabled={isUpdating}>
              {isUpdating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                'Update Profile'
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="border-t pt-6">
          <div className="w-full space-y-2">
            <h3 className="text-lg font-medium">Account Settings</h3>
            <div className="flex flex-col gap-4">
              <Button variant="outline" size="sm" className="justify-start">
                Change Password
              </Button>
              <Button variant="destructive" size="sm" className="justify-start">
                Delete Account
              </Button>
            </div>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
} 