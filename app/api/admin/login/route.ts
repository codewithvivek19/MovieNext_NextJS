import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { compare } from 'bcrypt';
import { sign } from 'jsonwebtoken';

export const dynamic = 'force-dynamic'; // No caching

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

    // For demo purposes, allow admin@example.com/admin to login directly
    if (email === 'admin@example.com' && password === 'admin') {
      // Create a JWT token
      const secret = process.env.JWT_SECRET || 'your-secret-key';
      const token = sign(
        {
          id: 1, // Demo admin ID
          email: email,
          name: 'Admin User',
          is_admin: true,
        },
        secret,
        { expiresIn: '1d' }
      );

      // Return success response with token
      const response = NextResponse.json({
        success: true,
        user: {
          id: 1,
          email: email,
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

    // Check password if using database authentication
    let isValidPassword = false;
    
    try {
      isValidPassword = await compare(password, user.password || '');
    } catch (e) {
      console.log('Password comparison error - likely no hashed password stored');
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
  } catch (error) {
    console.error('Admin login error:', error);
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
} 