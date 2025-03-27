import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic'; // No caching

/**
 * GET: Public endpoint to fetch a specific showtime by ID
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Must await params when using in dynamic API routes
    const id = await params.id;
    const showtimeId = parseInt(id);
    
    if (isNaN(showtimeId)) {
      return NextResponse.json(
        { error: 'Invalid showtime ID' },
        { status: 400 }
      );
    }
    
    // Get the showtime from the database
    const showtime = await prisma.showtime.findUnique({
      where: { id: showtimeId },
      include: {
        movie: {
          select: {
            id: true,
            title: true,
            poster: true,
            duration: true,
            language: true
          }
        },
        theater: true
      }
    });
    
    if (!showtime) {
      return NextResponse.json(
        { error: 'Showtime not found' },
        { status: 404 }
      );
    }
    
    // Format the date
    const formattedShowtime = {
      ...showtime,
      date: showtime.date.toISOString().split('T')[0]
    };
    
    return NextResponse.json({ showtime: formattedShowtime });
  } catch (error) {
    console.error('Error fetching showtime:', error);
    return NextResponse.json(
      { error: 'Failed to fetch showtime' },
      { status: 500 }
    );
  }
} 