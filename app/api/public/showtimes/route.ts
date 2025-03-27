import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic'; // No caching

/**
 * GET: Public endpoint to fetch all showtimes
 */
export async function GET(req: NextRequest) {
  try {
    // Parse query parameters
    const url = new URL(req.url);
    const movieId = url.searchParams.get('movieId');
    const theaterId = url.searchParams.get('theaterId');
    const date = url.searchParams.get('date');
    
    // Build query
    const where: any = {};
    
    if (movieId) {
      where.movieId = parseInt(movieId);
    }
    
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
    
    // Get all showtimes from the database
    const showtimes = await prisma.showtime.findMany({
      where,
      include: {
        movie: {
          select: {
            id: true,
            title: true,
            poster: true
          }
        },
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
    console.error('Error fetching showtimes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch showtimes' },
      { status: 500 }
    );
  }
} 