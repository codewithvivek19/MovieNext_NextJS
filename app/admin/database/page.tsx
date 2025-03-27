'use client';

import { useState } from 'react';
import { AlertCircle, Database, RefreshCw, Film, Theater, Calendar, Check, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

type ActionType = 'reset' | 'sync-movies' | 'sync-theaters' | 'sync-showtimes' | 'sync-all';
type ActionStatus = 'idle' | 'loading' | 'success' | 'error';

interface ActionState {
  status: ActionStatus;
  message: string | null;
}

export default function DatabasePage() {
  const [actions, setActions] = useState<Record<ActionType, ActionState>>({
    'reset': { status: 'idle', message: null },
    'sync-movies': { status: 'idle', message: null },
    'sync-theaters': { status: 'idle', message: null },
    'sync-showtimes': { status: 'idle', message: null },
    'sync-all': { status: 'idle', message: null },
  });

  const isAnyActionLoading = Object.values(actions).some(action => action.status === 'loading');

  const handleAction = async (action: ActionType) => {
    // Update the action state to loading
    setActions(prev => ({
      ...prev,
      [action]: { status: 'loading', message: null }
    }));

    try {
      // Call the API to perform the action
      const response = await fetch('/api/sync-database', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer admin-token'
        },
        body: JSON.stringify({ action }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to perform action');
      }

      // Update the action state to success
      setActions(prev => ({
        ...prev,
        [action]: { status: 'success', message: data.message || 'Operation completed successfully' }
      }));

      // If this was a sync-all action, also mark other actions as successful
      if (action === 'sync-all') {
        setActions(prev => ({
          ...prev,
          'reset': { status: 'success', message: 'Database reset as part of sync-all' },
          'sync-movies': { status: 'success', message: 'Movies synced as part of sync-all' },
          'sync-theaters': { status: 'success', message: 'Theaters synced as part of sync-all' },
          'sync-showtimes': { status: 'success', message: 'Showtimes synced as part of sync-all' },
        }));
      }
    } catch (error: any) {
      console.error(`Error performing ${action} action:`, error);
      
      // Update the action state to error
      setActions(prev => ({
        ...prev,
        [action]: { status: 'error', message: error.message || 'An error occurred' }
      }));
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Database Management</h1>
        <p className="text-muted-foreground mt-1">
          Reset and synchronize data in your database
        </p>
      </div>

      <Alert variant="warning">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Warning</AlertTitle>
        <AlertDescription>
          These actions will modify your database. The reset action will delete all data. Make sure you have backups if needed.
        </AlertDescription>
      </Alert>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Database Reset
            </CardTitle>
            <CardDescription>
              Clear all data from the database
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              This action will delete all movies, theaters, showtimes, and bookings from your database.
              User accounts will be preserved. This is useful when you want to start fresh.
            </p>
          </CardContent>
          <CardFooter className="flex justify-between items-center">
            <div>
              {actions.reset.status === 'success' && (
                <div className="flex items-center gap-1 text-sm text-green-600">
                  <Check className="h-4 w-4" />
                  <span>Reset successful</span>
                </div>
              )}
              {actions.reset.status === 'error' && (
                <div className="flex items-center gap-1 text-sm text-destructive">
                  <X className="h-4 w-4" />
                  <span>{actions.reset.message || 'Failed to reset'}</span>
                </div>
              )}
            </div>
            <Button 
              variant="destructive" 
              onClick={() => handleAction('reset')}
              disabled={isAnyActionLoading}
            >
              {actions.reset.status === 'loading' ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Resetting...
                </>
              ) : (
                <>Reset Database</>
              )}
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5" />
              Full Sync
            </CardTitle>
            <CardDescription>
              Reset and sync all sample data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              This action will reset the database and populate it with sample movies, theaters, and showtimes.
              This is the recommended way to set up your database for testing.
            </p>
          </CardContent>
          <CardFooter className="flex justify-between items-center">
            <div>
              {actions['sync-all'].status === 'success' && (
                <div className="flex items-center gap-1 text-sm text-green-600">
                  <Check className="h-4 w-4" />
                  <span>Sync completed</span>
                </div>
              )}
              {actions['sync-all'].status === 'error' && (
                <div className="flex items-center gap-1 text-sm text-destructive">
                  <X className="h-4 w-4" />
                  <span>{actions['sync-all'].message || 'Sync failed'}</span>
                </div>
              )}
            </div>
            <Button 
              variant="default" 
              onClick={() => handleAction('sync-all')}
              disabled={isAnyActionLoading}
            >
              {actions['sync-all'].status === 'loading' ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Syncing...
                </>
              ) : (
                <>Sync All Data</>
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>

      <h2 className="text-xl font-semibold mt-8">Individual Entity Sync</h2>
      <p className="text-sm text-muted-foreground">
        Sync individual data entities without resetting the entire database
      </p>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Film className="h-5 w-5" />
              Sync Movies
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Update movie data with sample movies
            </p>
          </CardContent>
          <CardFooter className="flex justify-between items-center">
            <div>
              {actions['sync-movies'].status === 'success' && (
                <div className="flex items-center gap-1 text-xs text-green-600">
                  <Check className="h-3 w-3" />
                  <span>Done</span>
                </div>
              )}
              {actions['sync-movies'].status === 'error' && (
                <div className="flex items-center gap-1 text-xs text-destructive">
                  <X className="h-3 w-3" />
                  <span>Failed</span>
                </div>
              )}
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleAction('sync-movies')}
              disabled={isAnyActionLoading}
            >
              {actions['sync-movies'].status === 'loading' ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>Sync</>
              )}
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Theater className="h-5 w-5" />
              Sync Theaters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Update theater data with sample theaters
            </p>
          </CardContent>
          <CardFooter className="flex justify-between items-center">
            <div>
              {actions['sync-theaters'].status === 'success' && (
                <div className="flex items-center gap-1 text-xs text-green-600">
                  <Check className="h-3 w-3" />
                  <span>Done</span>
                </div>
              )}
              {actions['sync-theaters'].status === 'error' && (
                <div className="flex items-center gap-1 text-xs text-destructive">
                  <X className="h-3 w-3" />
                  <span>Failed</span>
                </div>
              )}
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleAction('sync-theaters')}
              disabled={isAnyActionLoading}
            >
              {actions['sync-theaters'].status === 'loading' ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>Sync</>
              )}
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Calendar className="h-5 w-5" />
              Sync Showtimes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Generate and update showtimes data
            </p>
          </CardContent>
          <CardFooter className="flex justify-between items-center">
            <div>
              {actions['sync-showtimes'].status === 'success' && (
                <div className="flex items-center gap-1 text-xs text-green-600">
                  <Check className="h-3 w-3" />
                  <span>Done</span>
                </div>
              )}
              {actions['sync-showtimes'].status === 'error' && (
                <div className="flex items-center gap-1 text-xs text-destructive">
                  <X className="h-3 w-3" />
                  <span>Failed</span>
                </div>
              )}
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleAction('sync-showtimes')}
              disabled={isAnyActionLoading}
            >
              {actions['sync-showtimes'].status === 'loading' ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>Sync</>
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
} 