import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from './lib/auth';

export function middleware(request: NextRequest) {
  // Get the pathname from the request
  const path = request.nextUrl.pathname;
  
  // Public paths that don't require authentication
  const isPublicPath = 
    path === '/sign-in' || 
    path === '/sign-up' || 
    path === '/' || 
    path === '/admin/login' ||
    path.startsWith('/api/public') || 
    path.startsWith('/movies') ||
    path.startsWith('/api/auth') ||
    path.startsWith('/theaters');
    
  // Protected paths that require authentication
  const isProtectedUserPath = 
    path.startsWith('/booking') || 
    path === '/checkout' || 
    path === '/booking-confirmation' ||
    path === '/my-bookings' ||
    path === '/profile';
    
  // Admin-specific paths
  const isAdminPath = 
    (path.startsWith('/admin') && path !== '/admin/login') || 
    path.startsWith('/api/admin');
  
  // Get tokens from cookies
  const token = request.cookies.get('token')?.value;
  const adminToken = request.cookies.get('adminToken')?.value;
  
  // For API routes, except admin API routes, let the API handle authentication
  if (path.startsWith('/api/') && !path.startsWith('/api/admin')) {
    return NextResponse.next();
  }
  
  // Admin paths require admin token
  if (isAdminPath) {
    // If no admin token found, redirect to admin login
    if (!adminToken) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
    return NextResponse.next();
  }
  
  // For protected user paths, require user authentication
  if (isProtectedUserPath && !token) {
    return NextResponse.redirect(new URL('/sign-in', request.url));
  }
  
  // Public paths are always accessible
  return NextResponse.next();
}

// Run middleware on all routes except static files and other exceptions
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.png$).*)',
  ],
}; 