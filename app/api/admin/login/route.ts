import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { compare } from 'bcrypt';
import { sign } from 'jsonwebtoken';

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const { email, password } = data;

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

    // Check if user is an admin
    if (!user.is_admin) {
      return NextResponse.json(
        { error: 'Access denied. Not an admin user.' },
        { status: 403 }
      );
    }

    // For testing/demo purposes only - in production, always use hashed passwords
    // This allows 'admin' as the password for the demo
    let isValidPassword = false;
    
    // For demo purposes, we allow the literal 'admin' password
    if (password === 'admin') {
      isValidPassword = true;
    } else {
      // In case we have a real hashed password in the database in the future
      try {
        isValidPassword = await compare(password, user.password || '');
      } catch (e) {
        console.log('Password comparison error - likely no hashed password stored');
      }
    }

    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Create a JWT token
    const secret = process.env.JWT_SECRET || 'your-secret-key';
    const token = sign(
      {
        id: user.id,
        email: user.email,
        name: user.first_name ? `${user.first_name} ${user.last_name || ''}` : email,
        is_admin: user.is_admin,
      },
      secret,
      { expiresIn: '1d' }
    );

    // Set HTTP-only cookie with the token
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.first_name ? `${user.first_name} ${user.last_name || ''}` : email,
        is_admin: user.is_admin,
      },
      token,
    });
    
    // Set the token in a cookie as well (belt and suspenders approach)
    response.cookies.set({
      name: 'adminToken',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24, // 1 day
      path: '/',
    });
    
    return response;
  } catch (error) {
    console.error('Admin login error:', error);
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
} 