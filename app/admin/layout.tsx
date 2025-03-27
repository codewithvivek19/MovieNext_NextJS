'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { Film, ShieldCheck, Database, MapPin, Clock, Users, LogOut, Menu, X, TicketPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface NavItem {
  title: string;
  href: string;
  icon: React.ReactNode;
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // Navigation items for the admin sidebar
  const navItems: NavItem[] = [
    { title: 'Dashboard', href: '/admin', icon: <ShieldCheck size={18} /> },
    { title: 'Movies', href: '/admin/movies', icon: <Film size={18} /> },
    { title: 'Theaters', href: '/admin/theaters', icon: <MapPin size={18} /> },
    { title: 'Showtimes', href: '/admin/showtimes', icon: <Clock size={18} /> },
    { title: 'Bookings', href: '/admin/bookings', icon: <TicketPlus size={18} /> },
    { title: 'Users', href: '/admin/users', icon: <Users size={18} /> },
    { title: 'Database', href: '/admin/database', icon: <Database size={18} /> },
  ];

  // Prevent hydration errors
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // Skip for SSR or when not mounted
    if (!mounted) return;

    // Skip authentication check for the login page
    if (pathname === '/admin/login') {
      setLoading(false);
      return;
    }

    // Check if admin is logged in
    const adminToken = localStorage.getItem('adminToken');
    
    if (!adminToken) {
      // Not logged in, redirect to login page
      router.push('/admin/login');
    } else {
      // Validate the token by making a request to the admin dashboard API
      async function validateToken() {
        try {
          const response = await fetch('/api/admin/dashboard', {
            headers: {
              'Authorization': `Bearer ${adminToken}`
            }
          });
          
          if (!response.ok) {
            // Token invalid, redirect to login
            localStorage.removeItem('adminToken');
            router.push('/admin/login');
            return;
          }
          
          // Token valid, continue
          setIsAdminLoggedIn(true);
          setLoading(false);
        } catch (error) {
          console.error('Error validating admin token:', error);
          router.push('/admin/login');
        }
      }
      
      validateToken();
    }
  }, [pathname, router, mounted]);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    router.push('/admin/login');
  };

  // If not mounted yet (during SSR), return minimal layout to prevent hydration errors
  if (!mounted) {
    return <>{children}</>;
  }

  // If we're on the login page, just render the children without the admin layout
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  // Show loading state
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <ShieldCheck className="h-10 w-10 mx-auto mb-4 text-primary" />
          <p className="text-lg">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 z-10">
        <div className="flex flex-col flex-1 border-r bg-background">
          <div className="flex items-center h-16 px-4 border-b">
            <Link href="/admin" className="flex items-center gap-2 font-bold text-lg">
              <ShieldCheck size={20} className="text-primary" />
              Admin Panel
            </Link>
          </div>
          <div className="flex-1 flex flex-col overflow-y-auto pt-5 pb-4">
            <nav className="flex-1 px-3 space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center px-3 py-2 rounded-md ${
                    pathname === item.href
                      ? 'bg-accent text-accent-foreground'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  }`}
                >
                  <span className="mr-3">{item.icon}</span>
                  {item.title}
                </Link>
              ))}
            </nav>
          </div>
          <div className="p-4 border-t">
            <Button
              variant="outline"
              className="w-full flex items-center justify-center gap-2"
              onClick={handleLogout}
            >
              <LogOut size={16} />
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between h-16 px-4 border-b bg-background fixed top-0 left-0 right-0 z-20">
        <Link href="/admin" className="flex items-center gap-2 font-bold text-lg">
          <ShieldCheck size={20} className="text-primary" />
          Admin Panel
        </Link>
        <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </Button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-10 bg-background pt-16">
          <div className="flex flex-col h-full">
            <nav className="flex-1 px-4 pt-5 pb-4 space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center px-3 py-3 rounded-md ${
                    pathname === item.href
                      ? 'bg-accent text-accent-foreground'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span className="mr-3">{item.icon}</span>
                  {item.title}
                </Link>
              ))}
            </nav>
            <div className="p-4 border-t">
              <Button
                variant="outline"
                className="w-full flex items-center justify-center gap-2"
                onClick={handleLogout}
              >
                <LogOut size={16} />
                Logout
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex flex-col md:ml-64 flex-1">
        {/* Mobile padding */}
        <div className="md:hidden h-16"></div>
        
        {/* Page content */}
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
} 