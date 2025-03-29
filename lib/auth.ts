import { NextRequest, NextResponse } from 'next/server';
import { verify } from 'jsonwebtoken';

// Define the JWT token payload type
interface JWTPayload {
  id: number | string; // Allow both number and string for ID
  email: string;
  name?: string;
  is_admin: boolean;
  iat?: number;
  exp?: number;
}

// JWT token verification
export function verifyToken(token: string): JWTPayload | null {
  try {
    const secret = process.env.JWT_SECRET || 'your-secret-key';
    const decoded = verify(token, secret);
    return typeof decoded === 'object' ? decoded as JWTPayload : null;
  } catch (error) {
    console.error('Token verification error:', error);
    return null;
  }
}

// Middleware to protect admin routes
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
      return { 
        isAdmin: false, 
        error: 'Missing authentication token', 
        statusCode: 401 
      };
    }
    
    const decoded = verifyToken(token);
    
    if (!decoded) {
      return { 
        isAdmin: false, 
        error: 'Invalid token format', 
        statusCode: 401 
      };
    }
    
    if (!decoded.is_admin) {
      return { 
        isAdmin: false, 
        error: 'Insufficient permissions', 
        statusCode: 403 
      };
    }
    
    return { 
      isAdmin: true, 
      userId: decoded.id,
      email: decoded.email,
      name: decoded.name
    };
  } catch (error) {
    console.error('Auth middleware error:', error);
    return { 
      isAdmin: false, 
      error: 'Authentication error', 
      statusCode: 500 
    };
  }
} 