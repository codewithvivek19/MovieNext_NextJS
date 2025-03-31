import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticatedMiddleware } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function PUT(req: NextRequest) {
  try {
    // Check authentication
    const auth = await isAuthenticatedMiddleware(req);
    if (!auth.isAuthenticated) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: auth.statusCode || 401 }
      );
    }

    // Get request body
    const body = await req.json();
    const { firstName, lastName } = body;

    // Update user profile
    const updatedUser = await prisma.user.update({
      where: { id: auth.userId },
      data: {
        first_name: firstName,
        last_name: lastName,
      },
      select: {
        id: true,
        email: true,
        first_name: true,
        last_name: true,
        role: true,
        is_admin: true,
      },
    });

    return NextResponse.json({
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.first_name ? `${updatedUser.first_name} ${updatedUser.last_name || ''}` : updatedUser.email,
        firstName: updatedUser.first_name,
        lastName: updatedUser.last_name,
        role: updatedUser.role,
        isAdmin: updatedUser.is_admin,
      },
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
} 