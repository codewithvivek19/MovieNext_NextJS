import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic'; // No caching

/**
 * GET: Public endpoint to fetch showtimes for a specific movie
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Must await params when using in dynamic API routes
    const id = await params.id;
    const movieId = parseInt(id);
    
    if (isNaN(movieId)) {
      return NextResponse.json(
        { error: 'Invalid movie ID' },
        { status: 400 }
      );
    }
    
    // Parse query parameters
    const url = new URL(req.url);
    const theaterId = url.searchParams.get('theaterId');
    const date = url.searchParams.get('date');
    
    // Build query
    const where: any = {
      movieId: movieId
    };
    
    if (theaterId) {
      where.theaterId = parseInt(theaterId);
    }
    
    if (date) {
      // Format date for querying
      const queryDate = new Date(date);
      queryDate.setUTCHours(0, 0, 0, 0);
      
      const nextDay = new Date(queryDate);
      nextDay.setDate(nextDay.getDate() + 1);
      
      where.date = {
        gte: queryDate,
        lt: nextDay
      };
    }
    
    // Get showtimes for this movie
    const showtimes = await prisma.showtime.findMany({
      where,
      include: {
        theater: true
      },
      orderBy: [
        { date: 'asc' },
        { time: 'asc' }
      ]
    });
    
    // Format the showtimes
    const formattedShowtimes = showtimes.map(showtime => ({
      ...showtime,
      date: showtime.date.toISOString().split('T')[0]
    }));
    
    return NextResponse.json({ 
      showtimes: formattedShowtimes,
      total: formattedShowtimes.length 
    });
  } catch (error) {
    console.error('Error fetching showtimes for movie:', error);
    return NextResponse.json(
      { error: 'Failed to fetch showtimes for movie' },
      { status: 500 }
    );
  }
} 