'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Film, Menu, X, User, LogOut, Settings, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isLoggedIn, isAdmin, user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleSignOut = () => {
    logout();
  };

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Movies', href: '/movies' },
    { name: 'Theaters', href: '/theaters' },
  ];

  // Add Admin link if user is admin, otherwise link to admin login
  if (isAdmin) {
    navLinks.push({ 
      name: 'Admin Dashboard', 
      href: '/admin', 
      icon: <ShieldCheck size={16} className="mr-1" /> 
    });
  } else {
    navLinks.push({ 
      name: 'Admin', 
      href: '/admin/login', 
      icon: <ShieldCheck size={16} className="mr-1" /> 
    });
  }

  return (
    <nav className="bg-background py-4 border-b">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2">
          <Film size={24} className="text-primary" />
          <span className="font-bold text-xl">MovieNext</span>
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
            {isLoggedIn ? (
              <div className="flex items-center gap-3">
                <Link href="/my-bookings">
                  <Button variant="ghost" size="sm">My Bookings</Button>
                </Link>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-full">
                      <User className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>
                      {user?.name || user?.email || 'My Account'}
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/my-bookings">My Bookings</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/profile">Profile</Link>
                    </DropdownMenuItem>
                    {isAdmin && (
                      <DropdownMenuItem asChild>
                        <Link href="/admin">Admin Dashboard</Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-destructive" onClick={handleSignOut}>
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
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
            )}
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
            {isLoggedIn ? (
              <div className="space-y-3">
                <div className="font-medium flex items-center justify-between">
                  <span>{user?.name || user?.email || 'Account'}</span>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <User className="h-5 w-5" />
                  </Button>
                </div>
                <Link href="/my-bookings" className="block py-2 text-muted-foreground" onClick={toggleMenu}>
                  My Bookings
                </Link>
                {isAdmin && (
                  <Link href="/admin" className="block py-2 text-muted-foreground" onClick={toggleMenu}>
                    Admin Dashboard
                  </Link>
                )}
                <Button
                  variant="ghost"
                  className="w-full justify-start p-0 h-auto font-normal text-destructive"
                  onClick={() => {
                    handleSignOut();
                    toggleMenu();
                  }}
                >
                  <LogOut size={16} className="mr-2" />
                  Sign Out
                </Button>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <Link href="/sign-in" onClick={toggleMenu}>
                  <Button variant="outline" className="w-full">Sign In</Button>
                </Link>
                <Link href="/sign-up" onClick={toggleMenu}>
                  <Button className="w-full">Sign Up</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
} 