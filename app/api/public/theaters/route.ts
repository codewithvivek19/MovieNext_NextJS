import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic'; // No caching

/**
 * GET: Public endpoint to fetch all theaters
 */
export async function GET(req: NextRequest) {
  try {
    // Parse query parameters
    const url = new URL(req.url);
    const searchQuery = url.searchParams.get('search')?.toLowerCase() || '';
    
    // Build query
    const where = searchQuery
      ? {
          OR: [
            { name: { contains: searchQuery, mode: 'insensitive' } },
            { location: { contains: searchQuery, mode: 'insensitive' } },
          ],
        }
      : {};
    
    // Get all theaters from the database
    const theaters = await prisma.theater.findMany({
      where,
      orderBy: {
        name: 'asc'
      }
    });
    
    return NextResponse.json({ 
      theaters,
      total: theaters.length 
    });
  } catch (error) {
    console.error('Error fetching theaters:', error);
    return NextResponse.json(
      { error: 'Failed to fetch theaters' },
      { status: 500 }
    );
  }
} 