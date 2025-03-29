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
    const date = url.searchParams.get('date');
    const theaterId = url.searchParams.get('theaterId');
    
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
    
    // Get showtimes from the database
    const showtimes = await prisma.showtime.findMany({
      where,
      include: {
        theater: true
      },
      orderBy: [
        { date: 'asc' },
        { theaterId: 'asc' },
        { time: 'asc' }
      ]
    });
    
    // If no showtimes found, generate default ones for this movie
    if (showtimes.length === 0 && date) {
      // Get the movie information
      const movie = await prisma.movie.findUnique({
        where: { id: movieId },
        select: {
          id: true,
          title: true,
          poster: true
        }
      });
      
      if (!movie) {
        return NextResponse.json(
          { error: 'Movie not found' },
          { status: 404 }
        );
      }
      
      // Get all theaters or the specific theater if theaterId is provided
      const whereTheater = theaterId ? { id: parseInt(theaterId) } : {};
      const theaters = await prisma.theater.findMany({
        where: whereTheater
      });
      
      if (theaters.length === 0) {
        return NextResponse.json(
          { error: 'No theaters found' },
          { status: 404 }
        );
      }
      
      // Common showtimes
      const defaultTimes = [
        "09:30 AM", "10:30 AM", "12:00 PM", "12:45 PM", 
        "02:30 PM", "03:15 PM", "04:45 PM", "05:30 PM", 
        "07:00 PM", "08:15 PM", "09:30 PM", "10:45 PM"
      ];
      
      // Create default showtimes
      const defaultShowtimes = [];
      const queryDate = new Date(date);
      
      for (const theater of theaters) {
        // Generate 4-6 random times for this theater
        const times = [];
        const numTimes = Math.floor(Math.random() * 3) + 4; // 4-6 times
        
        for (let i = 0; i < numTimes; i++) {
          const randomIndex = Math.floor(Math.random() * defaultTimes.length);
          if (!times.includes(defaultTimes[randomIndex])) {
            times.push(defaultTimes[randomIndex]);
          }
        }
        
        // Sort times
        times.sort();
        
        // Create showtime objects
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
            movieId: movie.id,
            theaterId: theater.id,
            price: price,
            format: format,
            available_seats: theater.seating_capacity || 100,
            movie: movie,
            theater: theater
          });
        }
      }
      
      // Format the showtimes
      const formattedShowtimes = defaultShowtimes.map(showtime => ({
        ...showtime,
        date: showtime.date
      }));
      
      return NextResponse.json({ 
        showtimes: formattedShowtimes,
        total: formattedShowtimes.length,
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
    console.error('Error fetching showtimes for movie:', error);
    return NextResponse.json(
      { error: 'Failed to fetch showtimes for movie' },
      { status: 500 }
    );
  }
} 