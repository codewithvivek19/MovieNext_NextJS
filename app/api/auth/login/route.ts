import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { generateToken, verifyPassword } from '@/lib/auth';

export const dynamic = 'force-dynamic'; // No caching

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

    // Find the user with the provided email
    const user = await prisma.user.findUnique({
      where: { email: trimmedEmail },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Verify the password using our enhanced method that handles both formats
    const isValidPassword = await verifyPassword(password, user.password);

    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Check if user is an admin (admin should use admin login)
    if (user.is_admin) {
      return NextResponse.json(
        { error: 'Admin users should use the admin login page' },
        { status: 403 }
      );
    }

    // Create a JWT token
    const token = generateToken({
      id: user.id,
      email: user.email,
      name: user.first_name ? `${user.first_name} ${user.last_name || ''}` : trimmedEmail,
      role: user.role || 'USER',
      is_admin: false
    });

    // Create response with user data (without password)
    const { password: _, ...userWithoutPassword } = user;
    
    const response = NextResponse.json({
      success: true,
      user: userWithoutPassword,
      token
    });

    // Set HTTP-only cookie with the token
    response.cookies.set({
      name: 'token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace available');
    
    // Provide more specific error messages based on error type
    if (error instanceof Error) {
      if (error.message.includes('Prisma')) {
        return NextResponse.json(
          { error: 'Database error during login. Please try again later.' },
          { status: 500 }
        );
      }
    }
    
    return NextResponse.json(
      { error: 'Something went wrong during login. Please try again.' },
      { status: 500 }
    );
  }
} 