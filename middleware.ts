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
    path.startsWith('/api/public') || 
    path.startsWith('/movies') ||
    path.match(/^\/api\/((?!admin).)*$/); // API routes that don't include /admin/
    
  // Check if admin path
  const isAdminPath = path.includes('/admin') || path.startsWith('/api/admin');
  
  // Protected paths that require authentication (but not admin)
  const isProtectedPath = 
    path.startsWith('/booking') || 
    path === '/checkout' || 
    path === '/booking-confirmation' ||
    path === '/my-bookings' ||
    path === '/profile';
    
  // Get token from cookies
  const token = request.cookies.get('token')?.value;
  const adminToken = request.cookies.get('adminToken')?.value;
  
  // Admin paths require adminToken
  if (isAdminPath) {
    // If no admin token, redirect to admin login
    if (!adminToken) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
    
    // Verify admin token (we'll allow the API to handle verification for API routes)
    if (!path.startsWith('/api/admin')) {
      const tokenData = verifyToken(adminToken);
      if (!tokenData || !tokenData.is_admin) {
        // Clear invalid token and redirect to login
        const response = NextResponse.redirect(new URL('/admin/login', request.url));
        response.cookies.delete('adminToken');
        return response;
      }
    }
    
    return NextResponse.next();
  }
  
  // For all public paths, allow access
  if (isPublicPath) {
    return NextResponse.next();
  }
  
  // For protected non-admin paths, require user authentication
  if (isProtectedPath) {
    // If no token, redirect to sign in
    if (!token) {
      return NextResponse.redirect(new URL('/sign-in', request.url));
    }
    
    // For non-API routes, verify the token
    if (!path.startsWith('/api/')) {
      const tokenData = verifyToken(token);
      if (!tokenData) {
        // Clear invalid token and redirect to login
        const response = NextResponse.redirect(new URL('/sign-in', request.url));
        response.cookies.delete('token');
        return response;
      }
    }
  }
  
  // If none of the above conditions trigger a redirect, continue to the requested page
  return NextResponse.next();
}

// Run middleware on all routes except static files and other exceptions
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.png$).*)',
  ],
}; 