'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Film, MapPin, Clock, Users, CreditCard, Activity, RotateCw, Package, Database, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

type RecentBooking = {
  id: number;
  user: string;
  email: string;
  movie: string;
  theater: string;
  date: string;
  time: string;
  seats: string;
  amount: number;
  reference: string;
  created_at: string;
};

type DashboardStats = {
  movies: number;
  theaters: number;
  users: number;
  bookings: number;
  revenue: number;
};

export default function AdminDashboard() {
  const router = useRouter();
  
  const [stats, setStats] = useState<DashboardStats>({
    movies: 0,
    theaters: 0,
    users: 0,
    bookings: 0,
    revenue: 0
  });
  const [recentBookings, setRecentBookings] = useState<RecentBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [needsSetup, setNeedsSetup] = useState(false);
  const [setupLoading, setSetupLoading] = useState(false);
  
  useEffect(() => {
    // Check if admin is logged in
    const adminToken = localStorage.getItem('adminToken');
    if (!adminToken) {
      router.push('/admin/login');
      return;
    }
    
    setIsAdmin(true);
    fetchDashboardData();
  }, [router]);
  
  const fetchDashboardData = async () => {
    setLoading(true);
    
    try {
      const adminToken = localStorage.getItem('adminToken');
      const response = await fetch('/api/admin/dashboard', {
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      });
      
      if (response.status === 500) {
        // Check if it's a database initialization error
        const errorData = await response.json();
        if (errorData.error && errorData.error.includes('does not exist')) {
          setNeedsSetup(true);
          setLoading(false);
          return;
        }
      }
      
      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data');
      }
      
      const result = await response.json();
      setStats(result.stats);
      setRecentBookings(result.recentBookings);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Check if it might be a database initialization issue
      setNeedsSetup(true);
    } finally {
      setLoading(false);
    }
  };
  
  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    router.push('/admin/login');
  };
  
  const initializeDatabase = async () => {
    setSetupLoading(true);
    try {
      const adminToken = localStorage.getItem('adminToken');
      const response = await fetch('/api/sync-database', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify({ action: 'sync-all' })
      });
      
      if (!response.ok) {
        throw new Error('Failed to initialize database');
      }
      
      setNeedsSetup(false);
      // Refetch dashboard data
      await fetchDashboardData();
    } catch (error) {
      console.error('Error initializing database:', error);
      alert('Failed to initialize database. Please try again.');
    } finally {
      setSetupLoading(false);
    }
  };
  
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="flex items-center space-x-2">
          <RotateCw className="h-5 w-5 animate-spin" />
          <span>Loading...</span>
        </div>
      </div>
    );
  }
  
  if (!isAdmin) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-center text-red-500">Access Denied</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p>Only administrators can access this page.</p>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button onClick={() => router.push('/')}>Go to Home</Button>
          </CardFooter>
        </Card>
      </div>
    );
  }
  
  if (needsSetup) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-center">Database Setup Required</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <div className="flex justify-center mb-4">
              <Database className="h-16 w-16 text-primary opacity-80" />
            </div>
            <p className="mb-4">Your database tables need to be created before you can use the admin dashboard.</p>
            <p className="text-sm text-muted-foreground mb-6">
              This will create the necessary tables and populate them with sample data.
            </p>
            <Button 
              onClick={initializeDatabase} 
              disabled={setupLoading}
              className="w-full"
            >
              {setupLoading ? (
                <>
                  <RotateCw className="mr-2 h-4 w-4 animate-spin" />
                  Initializing Database...
                </>
              ) : (
                <>Initialize Database</>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
          <Button variant="ghost" onClick={() => router.push('/')}>Back to Site</Button>
        </div>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Movies</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Film className="mr-2 h-4 w-4 text-blue-500" />
              <span className="text-2xl font-bold">{stats.movies}</span>
            </div>
          </CardContent>
          <CardFooter className="pt-0">
            <Link href="/admin/movies" passHref>
              <Button variant="ghost" className="w-full text-xs">Manage Movies</Button>
            </Link>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Theaters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <MapPin className="mr-2 h-4 w-4 text-purple-500" />
              <span className="text-2xl font-bold">{stats.theaters}</span>
            </div>
          </CardContent>
          <CardFooter className="pt-0">
            <Link href="/admin/theaters" passHref>
              <Button variant="ghost" className="w-full text-xs">Manage Theaters</Button>
            </Link>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Showtimes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Clock className="mr-2 h-4 w-4 text-green-500" />
              <span className="text-2xl font-bold">—</span>
            </div>
          </CardContent>
          <CardFooter className="pt-0">
            <Link href="/admin/showtimes" passHref>
              <Button variant="ghost" className="w-full text-xs">Manage Showtimes</Button>
            </Link>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Users className="mr-2 h-4 w-4 text-yellow-500" />
              <span className="text-2xl font-bold">{stats.users}</span>
            </div>
          </CardContent>
          <CardFooter className="pt-0">
            <Link href="/admin/users" passHref>
              <Button variant="ghost" className="w-full text-xs">View Users</Button>
            </Link>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <CreditCard className="mr-2 h-4 w-4 text-red-500" />
              <span className="text-2xl font-bold">₹{stats.revenue.toLocaleString()}</span>
            </div>
          </CardContent>
          <CardFooter className="pt-0">
            <Link href="/admin/bookings" passHref>
              <Button variant="ghost" className="w-full text-xs">View Bookings</Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle className="text-xl">Recent Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            {recentBookings.length === 0 ? (
              <p className="text-center text-muted-foreground py-6">No recent bookings</p>
            ) : (
              <div className="space-y-5">
                {recentBookings.map((booking) => (
                  <div key={booking.id} className="flex justify-between pb-4 border-b">
                    <div>
                      <h4 className="font-medium">Booking #{booking.id}</h4>
                      <p className="text-sm text-muted-foreground">{booking.movie} at {booking.theater}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(booking.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">₹{booking.amount}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Link href="/admin/movies" passHref>
              <Button className="w-full justify-start" variant="outline">
                <Film className="mr-2 h-4 w-4" />
                Manage Movies
              </Button>
            </Link>
            
            <Link href="/admin/theaters" passHref>
              <Button className="w-full justify-start" variant="outline">
                <MapPin className="mr-2 h-4 w-4" />
                Manage Theaters
              </Button>
            </Link>
            
            <Link href="/admin/showtimes" passHref>
              <Button className="w-full justify-start" variant="outline">
                <Clock className="mr-2 h-4 w-4" />
                Manage Showtimes
              </Button>
            </Link>
            
            <Link href="/admin/database" passHref>
              <Button className="w-full justify-start" variant="outline">
                <Database className="mr-2 h-4 w-4" />
                Sync Database
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 