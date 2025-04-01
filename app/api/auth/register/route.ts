import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { hashPassword, generateToken } from '@/lib/auth';

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

    const { email, password, firstName, lastName, phone } = body;

    // Validate required fields
    if (!email || typeof email !== 'string' || !email.trim()) {
      return NextResponse.json(
        { error: 'Valid email is required' },
        { status: 400 }
      );
    }

    if (!password || typeof password !== 'string' || password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    const trimmedEmail = email.trim();

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: trimmedEmail }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // Hash password - Note: hashPassword is now async
    const hashedPassword = await hashPassword(password);

    // Create new user with validated data
    const newUser = await prisma.user.create({
      data: {
        email: trimmedEmail,
        password: hashedPassword,
        first_name: firstName && typeof firstName === 'string' ? firstName.trim() : null,
        last_name: lastName && typeof lastName === 'string' ? lastName.trim() : null,
        phone: phone && typeof phone === 'string' ? phone.trim() : null,
        role: 'USER',
        is_admin: false
      }
    });

    // Create JWT token
    const token = generateToken({
      id: newUser.id,
      email: newUser.email,
      name: newUser.first_name ? `${newUser.first_name} ${newUser.last_name || ''}` : trimmedEmail,
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
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace available');
    
    // Provide more specific error messages based on error type
    if (error instanceof Error) {
      if (error.message.includes('Prisma')) {
        return NextResponse.json(
          { error: 'Database error during registration. Please try again later.' },
          { status: 500 }
        );
      }
    }
    
    return NextResponse.json(
      { error: 'Something went wrong during registration. Please try again.' },
      { status: 500 }
    );
  }
} 