import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { hashPassword, generateToken } from '@/lib/auth';

export const dynamic = 'force-dynamic'; // No caching

export async function POST(req: NextRequest) {
  try {
    const { email, password, firstName, lastName, phone } = await req.json();

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create new user
    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        first_name: firstName || null,
        last_name: lastName || null,
        phone: phone || null,
        role: 'USER',
        is_admin: false
      }
    });

    // Create JWT token
    const token = generateToken({
      id: newUser.id,
      email: newUser.email,
      name: newUser.first_name ? `${newUser.first_name} ${newUser.last_name || ''}` : email,
      role: 'USER',
      is_admin: false
    });

    // Create response with user data (without password)
    const { password: _, ...userWithoutPassword } = newUser;
    
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
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Something went wrong during registration' },
      { status: 500 }
    );
  }
} 