import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic'; // No caching

export async function GET(req: NextRequest) {
  try {
    // Check for token in cookies
    const token = req.cookies.get('token')?.value;
    const adminToken = req.cookies.get('adminToken')?.value;

    // Use the appropriate token
    const activeToken = adminToken || token;

    if (!activeToken) {
      return NextResponse.json({ 
        authenticated: false, 
        message: 'Not authenticated' 
      }, { status: 401 });
    }

    // Verify the token
    const tokenData = verifyToken(activeToken);
    if (!tokenData) {
      return NextResponse.json({ 
        authenticated: false, 
        message: 'Invalid token' 
      }, { status: 401 });
    }

    // Find the user in the database
    const user = await prisma.user.findUnique({
      where: { id: tokenData.id.toString() },
      select: {
        id: true,
        email: true,
        first_name: true,
        last_name: true,
        role: true,
        is_admin: true,
        created_at: true,
        updated_at: true
      }
    });

    if (!user) {
      return NextResponse.json({ 
        authenticated: false, 
        message: 'User not found' 
      }, { status: 404 });
    }

    // Return user data
    return NextResponse.json({
      authenticated: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.first_name ? `${user.first_name} ${user.last_name || ''}` : user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
        isAdmin: user.is_admin,
        createdAt: user.created_at,
        updatedAt: user.updated_at
      }
    });
  } catch (error) {
    console.error('Error getting user info:', error);
    return NextResponse.json({ 
      authenticated: false, 
      message: 'Internal server error' 
    }, { status: 500 });
  }
} 