import { NextRequest, NextResponse } from 'next/server';
import { verify, sign, Secret, SignOptions } from 'jsonwebtoken';
import bcrypt from 'bcrypt';

// Define the JWT token payload types
interface JWTAdminPayload {
  id: number | string;
  email: string;
  name?: string;
  is_admin: true;
  iat?: number;
  exp?: number;
}

interface JWTUserPayload {
  id: string;
  email: string;
  name?: string;
  role: string;
  is_admin: false;
  iat?: number;
  exp?: number;
}

type JWTPayload = JWTAdminPayload | JWTUserPayload;

// Get JWT secret from environment variables
const JWT_SECRET: Secret = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// JWT token generation
export function generateToken(payload: Omit<JWTPayload, 'iat' | 'exp'>, options?: SignOptions): string {
  const defaultOptions: SignOptions = {
    expiresIn: JWT_EXPIRES_IN
  };
  
  const signOptions = { ...defaultOptions, ...options };
  return sign(payload, JWT_SECRET, signOptions);
}

// JWT token verification
export function verifyToken(token: string): JWTPayload | null {
  try {
    const decoded = verify(token, JWT_SECRET);
    return typeof decoded === 'object' ? decoded as JWTPayload : null;
  } catch (error) {
    console.error('Token verification error:', error);
    return null;
  }
}

// Password hashing with bcrypt
export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 10);
}

// Password verification with bcrypt
export async function verifyPassword(inputPassword: string, hashedPassword: string): Promise<boolean> {
  return await bcrypt.compare(inputPassword, hashedPassword);
}

// For backward compatibility - fallback to simple hash if bcrypt fails
// This is only for transition and should be removed once all passwords are migrated
export function simpleHashPassword(password: string): string {
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  // Convert to hex string and ensure it's positive
  return Math.abs(hash).toString(16).padStart(8, '0');
}

// Fallback password verification
export function simpleVerifyPassword(password: string, hashedPassword: string): boolean {
  const hashedInput = simpleHashPassword(password);
  return hashedInput === hashedPassword;
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

// Middleware to protect user routes
export async function isAuthenticatedMiddleware(req: NextRequest) {
  try {
    // Check for token in Authorization header
    const authHeader = req.headers.get('authorization');
    let token: string | null = null;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else {
      // If not in header, try to get from cookie
      const cookieToken = req.cookies.get('token');
      token = cookieToken?.value || null;
    }
    
    if (!token) {
      return { 
        isAuthenticated: false, 
        error: 'Missing authentication token', 
        statusCode: 401 
      };
    }
    
    const decoded = verifyToken(token);
    
    if (!decoded) {
      return { 
        isAuthenticated: false, 
        error: 'Invalid token format', 
        statusCode: 401 
      };
    }
    
    return { 
      isAuthenticated: true, 
      userId: decoded.id,
      email: decoded.email,
      name: decoded.name,
      role: 'is_admin' in decoded && decoded.is_admin ? 'admin' : 'user'
    };
  } catch (error) {
    console.error('Auth middleware error:', error);
    return { 
      isAuthenticated: false, 
      error: 'Authentication error', 
      statusCode: 500 
    };
  }
} 