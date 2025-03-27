import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic'; // No caching

/**
 * GET: Public endpoint to fetch a specific theater by ID
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Must await params when using in dynamic API routes
    const id = await params.id;
    const theaterId = parseInt(id);
    
    if (isNaN(theaterId)) {
      return NextResponse.json(
        { error: 'Invalid theater ID' },
        { status: 400 }
      );
    }
    
    // Get the theater from the database
    const theater = await prisma.theater.findUnique({
      where: { id: theaterId }
    });
    
    if (!theater) {
      return NextResponse.json(
        { error: 'Theater not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ theater });
  } catch (error) {
    console.error('Error fetching theater:', error);
    return NextResponse.json(
      { error: 'Failed to fetch theater' },
      { status: 500 }
    );
  }
} 