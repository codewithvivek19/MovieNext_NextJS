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
    
    // If no showtimes found for the specified filters, generate default showtimes
    if (showtimes.length === 0 && movieId && date) {
      // Create default showtimes for this movie and date
      const defaultShowtimes = [];
      
      // Common movie showtimes
      const defaultTimes = [
        "09:30 AM", "10:30 AM", "12:00 PM", "12:45 PM", 
        "02:30 PM", "03:15 PM", "04:45 PM", "05:30 PM", 
        "07:00 PM", "08:15 PM", "09:30 PM", "10:45 PM"
      ];
      
      // Get theaters to create showtimes for
      const theaters = await prisma.theater.findMany({
        take: 3, // Limit to 3 theaters
        orderBy: {
          id: 'asc'
        }
      });
      
      // Get movie information
      const movie = await prisma.movie.findUnique({
        where: {
          id: parseInt(movieId)
        },
        select: {
          id: true,
          title: true,
          poster: true
        }
      });
      
      if (movie && theaters.length > 0) {
        const queryDate = new Date(date);
        
        // Generate 4 random times for each theater
        for (const theater of theaters) {
          const times = [];
          // Pick 4 random times from the default times
          for (let i = 0; i < 4; i++) {
            const randomIndex = Math.floor(Math.random() * defaultTimes.length);
            if (!times.includes(defaultTimes[randomIndex])) {
              times.push(defaultTimes[randomIndex]);
            }
          }
          
          // Sort times
          times.sort();
          
          // Create showtime objects
          for (const time of times) {
            defaultShowtimes.push({
              id: Math.floor(Math.random() * 10000) + 1000, // Fake ID
              date: queryDate.toISOString().split('T')[0],
              time: time,
              movieId: movie.id,
              theaterId: theater.id,
              movie: movie,
              theater: theater
            });
          }
        }
      }
      
      // Return the generated showtimes
      return NextResponse.json({ 
        showtimes: defaultShowtimes,
        total: defaultShowtimes.length,
        isGenerated: true
      });
    }
    
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