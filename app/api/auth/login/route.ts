import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyPassword, generateToken } from '@/lib/auth';

export const dynamic = 'force-dynamic'; // No caching

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Find the user with the provided email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Verify password (non-async function now)
    const isValidPassword = verifyPassword(password, user.password);

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

    // Create JWT token
    const token = generateToken({
      id: user.id,
      email: user.email,
      name: user.first_name ? `${user.first_name} ${user.last_name || ''}` : email,
      role: user.role,
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
    return NextResponse.json(
      { error: 'Something went wrong during login' },
      { status: 500 }
    );
  }
} 