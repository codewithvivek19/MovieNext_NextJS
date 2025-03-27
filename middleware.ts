import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from './lib/auth';

// Define public paths that don't require authentication
const publicPaths = [
  '/',
  '/movies',
  '/movies/:path*',
  '/theaters',
  '/theaters/:path*',
  '/api/public/:path*',
  '/sign-in',
  '/sign-up',
  '/reset-password',
  '/admin/login',
];

// Middleware function to check authentication
export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  
  // Check if path starts with /admin
  if (path.startsWith('/admin') && !publicPaths.some(p => {
    // Convert pattern with :path* to regex for matching
    if (p.includes(':path*')) {
      const regexStr = '^' + p.replace(':path*', '.*') + '$';
      const regex = new RegExp(regexStr);
      return regex.test(path);
    }
    return p === path;
  })) {
    // Admin routes need JWT authentication
    const authHeader = req.headers.get('authorization');
    const cookies = req.cookies;
    const token = authHeader?.split(' ')[1] || cookies.get('adminToken')?.value;
    
    if (!token) {
      // Redirect to login if no token
      return NextResponse.redirect(new URL('/admin/login', req.url));
    }
    
    // Optional: verify token here
    // For now, we'll skip this and let the API routes handle verification
  }
  
  return NextResponse.next();
}

export const config = {
  // Only run middleware on the following paths
  matcher: [
    '/admin/:path*',
    '/profile/:path*',
    '/bookings/:path*',
    '/checkout/:path*',
  ],
}; 