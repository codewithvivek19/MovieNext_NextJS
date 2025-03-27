import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { isAdminMiddleware } from '@/lib/auth';

export const dynamic = 'force-dynamic'; // No caching

/**
 * GET: Admin endpoint to fetch all users
 */
export async function GET(req: NextRequest) {
  try {
    // Verify admin status
    const adminResult = await isAdminMiddleware(req);
    if (!adminResult.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse query parameters
    const url = new URL(req.url);
    const search = url.searchParams.get('search') || '';
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;
    
    // Build query
    const where = search 
      ? {
          OR: [
            { email: { contains: search, mode: 'insensitive' } },
            { first_name: { contains: search, mode: 'insensitive' } },
            { last_name: { contains: search, mode: 'insensitive' } }
          ]
        } 
      : {};
    
    // Get total count
    const total = await prisma.user.count({ where });
    
    // Get users with pagination
    const users = await prisma.user.findMany({
      where,
      orderBy: { created_at: 'desc' },
      skip: offset,
      take: limit,
      include: {
        _count: {
          select: { bookings: true }
        }
      }
    });
    
    return NextResponse.json({
      users,
      meta: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
} 