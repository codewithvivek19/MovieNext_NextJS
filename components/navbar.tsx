'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Film, Menu, X, User, LogOut, Settings, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { UserButton, SignedIn, SignedOut, useUser, useClerk, useAuth } from '@clerk/nextjs';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const pathname = usePathname();
  const { isLoaded, user } = useUser();
  const { signOut } = useClerk();
  const { isSignedIn } = useAuth();

  useEffect(() => {
    // Check if admin is logged in from localStorage
    const adminToken = localStorage.getItem('adminToken');
    setIsAdminLoggedIn(adminToken === 'admin-token');
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleSignOut = async () => {
    await signOut();
  };

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Movies', href: '/movies' },
    { name: 'Theaters', href: '/theaters' },
  ];

  // Add Admin link for all users - the admin page itself will handle access control
  navLinks.push({ name: 'Admin', href: '/admin/login', icon: <ShieldCheck size={16} className="mr-1" /> });

  return (
    <nav className="bg-background py-4 border-b">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2">
          <Film size={24} className="text-primary" />
          <span className="font-bold text-xl">MovieTix</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-6">
          <div className="flex items-center gap-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-1 py-2 hover:text-primary transition-colors flex items-center ${
                  pathname === link.href ? 'text-primary font-medium' : 'text-muted-foreground'
                }`}
              >
                {link.icon && link.icon}
                {link.name}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <SignedIn>
              <div className="flex items-center gap-3">
                <Link href="/bookings">
                  <Button variant="ghost" size="sm">My Bookings</Button>
                </Link>
                <UserButton afterSignOutUrl="/" />
              </div>
            </SignedIn>
            <SignedOut>
              <div className="flex items-center gap-3">
                <Link href="/sign-in">
                  <Button variant="ghost" size="sm">
                    Sign In
                  </Button>
                </Link>
                <Link href="/sign-up">
                  <Button size="sm">Sign Up</Button>
                </Link>
              </div>
            </SignedOut>
          </div>
        </div>

        {/* Mobile Menu Button */}
        <button className="md:hidden" onClick={toggleMenu}>
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden pt-2 pb-4 px-4 space-y-4 border-t">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`block py-2 flex items-center ${
                pathname === link.href ? 'text-primary font-medium' : 'text-muted-foreground'
              }`}
              onClick={toggleMenu}
            >
              {link.icon && link.icon}
              {link.name}
            </Link>
          ))}

          <div className="pt-4 border-t">
            <SignedIn>
              <div className="space-y-3">
                <div className="font-medium flex items-center justify-between">
                  <span>Account</span>
                  <UserButton afterSignOutUrl="/" />
                </div>
                <Link href="/bookings" className="block py-2 text-muted-foreground" onClick={toggleMenu}>
                  My Bookings
                </Link>
                <Button
                  variant="ghost"
                  className="w-full justify-start p-0 h-auto font-normal text-destructive"
                  onClick={() => {
                    signOut();
                    toggleMenu();
                  }}
                >
                  <LogOut size={16} className="mr-2" />
                  Sign Out
                </Button>
              </div>
            </SignedIn>
            <SignedOut>
              <div className="flex flex-col gap-3">
                <Link href="/sign-in" onClick={toggleMenu}>
                  <Button variant="outline" className="w-full">Sign In</Button>
                </Link>
                <Link href="/sign-up" onClick={toggleMenu}>
                  <Button className="w-full">Sign Up</Button>
                </Link>
              </div>
            </SignedOut>
          </div>
        </div>
      )}
    </nav>
  );
} 