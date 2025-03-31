import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticatedMiddleware } from '@/lib/auth';
import { verifyPassword, hashPassword } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function POST(req: NextRequest) {
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
    const { currentPassword, newPassword } = body;

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: auth.userId },
      select: { password: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Verify current password
    if (!verifyPassword(currentPassword, user.password)) {
      return NextResponse.json(
        { error: 'Current password is incorrect' },
        { status: 400 }
      );
    }

    // Hash new password
    const hashedPassword = hashPassword(newPassword);

    // Update password
    await prisma.user.update({
      where: { id: auth.userId },
      data: { password: hashedPassword },
    });

    return NextResponse.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Error changing password:', error);
    return NextResponse.json(
      { error: 'Failed to change password' },
      { status: 500 }
    );
  }
} 