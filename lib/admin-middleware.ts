import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';

/**
 * Middleware to protect admin routes
 * This is a wrapper around the isAdminMiddleware function from auth.ts
 */
export async function isAdminMiddleware(req: NextRequest) {
  try {
    // Check for token in Authorization header
    const authHeader = req.headers.get('authorization');
    let token: string | null = null;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else {
      // If not in header, try to get from cookie
      const cookieToken = req.cookies.get('adminToken');
      token = cookieToken?.value || null;
    }
    
    if (!token) {
      return NextResponse.json({ 
        error: 'Missing authentication token'
      }, { status: 401 });
    }
    
    const decoded = verifyToken(token);
    
    if (!decoded) {
      return NextResponse.json({ 
        error: 'Invalid token format'
      }, { status: 401 });
    }
    
    if (!decoded.is_admin) {
      return NextResponse.json({ 
        error: 'Insufficient permissions'
      }, { status: 403 });
    }
    
    return null; // No error, proceed with request
  } catch (error) {
    console.error('Auth middleware error:', error);
    return NextResponse.json({ 
      error: 'Authentication error'
    }, { status: 500 });
  }
}

/**
 * Verify if a user has admin privileges
 * @param req The NextRequest object
 * @returns An object with the admin status and user information
 */
export async function verifyAdminAccess(req: NextRequest) {
  const { isAdmin, userId, email, name, error } = await authIsAdmin(req);
  
  if (!isAdmin) {
    return { 
      authorized: false, 
      error: error || 'Admin access required',
      userId: null,
      email: null
    };
  }
  
  return {
    authorized: true,
    userId,
    email,
    name
  };
} 