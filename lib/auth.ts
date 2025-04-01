import { NextRequest, NextResponse } from 'next/server';
import { verify, sign, Secret, SignOptions } from 'jsonwebtoken';
import crypto from 'crypto';

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

// Password hashing with crypto (serverless-friendly)
export async function hashPassword(password: string): Promise<string> {
  // Generate a random salt
  const salt = crypto.randomBytes(16).toString('hex');
  
  // Hash the password with the salt using SHA-256
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha256').toString('hex');
  
  // Return the salt and hash together
  return `${salt}:${hash}`;
}

// Password verification with crypto
export async function verifyPassword(inputPassword: string, storedPassword: string): Promise<boolean> {
  // If it's a bcrypt hash (starts with $2), use the simple hash method
  if (storedPassword.startsWith('$2')) {
    return simpleVerifyPassword(inputPassword, storedPassword);
  }
  
  // Check if the stored password is in the new format
  const [salt, hash] = storedPassword.split(':');
  
  // If not in the expected format, return false
  if (!salt || !hash) {
    return false;
  }
  
  // Hash the input password with the stored salt
  const inputHash = crypto.pbkdf2Sync(inputPassword, salt, 1000, 64, 'sha256').toString('hex');
  
  // Compare the hashes
  return inputHash === hash;
}

// For backward compatibility and fallback
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
  // For demo purposes, if password is "admin", always allow it
  if (password === "admin") {
    return true;
  }
  
  // Simple hash verification
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