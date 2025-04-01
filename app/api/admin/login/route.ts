import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { generateToken, verifyPassword } from '@/lib/auth';

export const dynamic = 'force-dynamic'; // No caching
export const maxDuration = 10; // Set max duration for route

export async function POST(req: NextRequest) {
  try {
    // Parse request body with error handling
    let body;
    try {
      body = await req.json();
    } catch (error) {
      console.error('Failed to parse request body:', error);
      return NextResponse.json(
        { error: 'Invalid request body format' },
        { status: 400 }
      );
    }

    const { email, password } = body;

    // Validate required fields
    if (!email || typeof email !== 'string' || !email.trim()) {
      return NextResponse.json(
        { error: 'Valid email is required' },
        { status: 400 }
      );
    }

    if (!password || typeof password !== 'string') {
      return NextResponse.json(
        { error: 'Password is required' },
        { status: 400 }
      );
    }

    const trimmedEmail = email.trim();

    // For demo purposes, allow admin@example.com/admin to login directly
    if (trimmedEmail === 'admin@example.com' && password === 'admin') {
      // Create a JWT token
      const token = generateToken({
        id: 1, // Demo admin ID
        email: trimmedEmail,
        name: 'Admin User',
        is_admin: true
      });

      // Return success response with token
      const response = NextResponse.json({
        success: true,
        user: {
          id: 1,
          email: trimmedEmail,
          name: 'Admin User',
          is_admin: true,
        },
        token,
      });

      // Set the token in a cookie as well
      response.cookies.set({
        name: 'adminToken',
        value: token,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24, // 1 day
        path: '/',
      });

      return response;
    }

    // Find the user with the provided email
    try {
      const user = await prisma.user.findUnique({
        where: { email: trimmedEmail },
      });

      if (!user) {
        return NextResponse.json(
          { error: 'Invalid email or password' },
          { status: 401 }
        );
      }

      // Check if user is an admin
      if (!user.is_admin) {
        return NextResponse.json(
          { error: 'Access denied. Not an admin user.' },
          { status: 403 }
        );
      }

      // Verify password using our enhanced method that handles both formats
      // The verifyPassword function now handles both bcrypt and crypto formats
      const isValidPassword = await verifyPassword(password, user.password);

      if (!isValidPassword) {
        return NextResponse.json(
          { error: 'Invalid email or password' },
          { status: 401 }
        );
      }

      // Create a JWT token
      const token = generateToken({
        id: user.id,
        email: user.email,
        name: user.first_name ? `${user.first_name} ${user.last_name || ''}` : trimmedEmail,
        is_admin: true
      });

      // Create response with user data (without password)
      const { password: _, ...userWithoutPassword } = user;
      
      const response = NextResponse.json({
        success: true,
        user: userWithoutPassword,
        token
      });

      // Set the token in a cookie as well
      response.cookies.set({
        name: 'adminToken',
        value: token,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24, // 1 day
        path: '/',
      });

      return response;
    } catch (dbError) {
      console.error('Database error:', dbError);
      return NextResponse.json(
        { error: 'Database error occurred. Please try again.' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Admin login error:', error);
    // Ensure we always return a proper JSON response, never HTML
    return NextResponse.json(
      { error: 'Something went wrong during login. Please try again.' },
      { status: 500 }
    );
  }
} 