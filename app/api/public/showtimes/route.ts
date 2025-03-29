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
    if ((showtimes.length === 0 && movieId && date) || 
        (showtimes.length === 0 && date)) {
      // Create default showtimes for this date
      const defaultShowtimes = [];
      
      // Common movie showtimes
      const defaultTimes = [
        "09:30 AM", "10:30 AM", "12:00 PM", "12:45 PM", 
        "02:30 PM", "03:15 PM", "04:45 PM", "05:30 PM", 
        "07:00 PM", "08:15 PM", "09:30 PM", "10:45 PM"
      ];
      
      // Get theaters to create showtimes for
      const theaters = await prisma.theater.findMany({
        orderBy: {
          id: 'asc'
        }
      });
      
      // Get movie information if movieId is provided
      let movie = null;
      if (movieId) {
        movie = await prisma.movie.findUnique({
          where: {
            id: parseInt(movieId)
          },
          select: {
            id: true,
            title: true,
            poster: true
          }
        });
      } else {
        // If no movie ID, get all movies to create diverse showtimes
        const movies = await prisma.movie.findMany({
          select: {
            id: true,
            title: true,
            poster: true
          }
        });
        
        // If movies exist, pick the first one or a random one
        if (movies.length > 0) {
          movie = movies[0]; // Default to first movie
        }
      }
      
      if ((movie || !movieId) && theaters.length > 0) {
        const queryDate = new Date(date);
        
        // For each theater, generate showtimes
        for (const theater of theaters) {
          // If no specific movie was requested, generate showtimes for all movies
          const moviesToUse = !movieId ? await prisma.movie.findMany({
            select: {
              id: true,
              title: true,
              poster: true
            }
          }) : [movie];
          
          for (const movieToUse of moviesToUse) {
            if (!movieToUse) continue;
            
            const times = [];
            // Pick 4-6 times for this movie and theater
            const numTimes = Math.floor(Math.random() * 3) + 4; // 4-6 times
            
            for (let i = 0; i < numTimes; i++) {
              const randomIndex = Math.floor(Math.random() * defaultTimes.length);
              if (!times.includes(defaultTimes[randomIndex])) {
                times.push(defaultTimes[randomIndex]);
              }
            }
            
            // Sort times
            times.sort();
            
            // Create showtime objects with appropriate pricing
            for (const time of times) {
              // Random price between 150 and 350
              const price = Math.floor(Math.random() * 200) + 150;
              
              // Determine format based on time of day
              let format = 'standard';
              const hour = parseInt(time.split(':')[0]);
              const isPM = time.includes('PM');
              
              if (isPM && hour >= 7) {
                format = 'premium';
              } else if (isPM && hour >= 2 && hour < 7) {
                format = 'imax';
              }
              
              defaultShowtimes.push({
                id: Math.floor(Math.random() * 10000) + 1000, // Fake ID
                date: queryDate.toISOString().split('T')[0],
                time: time,
                movieId: movieToUse.id,
                theaterId: theater.id,
                price: price,
                format: format,
                available_seats: theater.seating_capacity || 100,
                movie: movieToUse,
                theater: theater
              });
            }
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