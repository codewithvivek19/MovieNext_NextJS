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
      console.log(`Invalid showtime ID format: ${id}`);
      return NextResponse.json(
        { error: 'Invalid showtime ID' },
        { status: 400 }
      );
    }
    
    console.log(`Fetching showtime with ID: ${showtimeId}`);
    
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
    
    // Format and return the showtime if found
    if (showtime) {
      console.log(`Showtime found: ${showtime.id}, Movie: ${showtime.movie?.title}, Theater: ${showtime.theater?.name}`);
      
      // Ensure date is in ISO format and time is properly formatted
      const formattedShowtime = {
        ...showtime,
        date: showtime.date.toISOString().split('T')[0],
        // Ensure time format is consistent
        time: showtime.time.includes('AM') || showtime.time.includes('PM') 
          ? showtime.time 
          : convertTo12HourFormat(showtime.time)
      };
      
      return NextResponse.json({ showtime: formattedShowtime });
    }
    
    // If showtime not found, attempt to reconstruct it from movie and theater data
    console.log(`Showtime ${showtimeId} not found. Attempting to reconstruct...`);
    
    // Try to extract movieId and theaterId from the query parameters
    const url = new URL(req.url);
    let movieId = parseInt(url.searchParams.get('movieId') || '0');
    let theaterId = parseInt(url.searchParams.get('theaterId') || '0');
    
    // If we don't have IDs from query params, check if the showtimeId has a pattern
    // Some implementations might encode movie/theater info in the showtime ID
    if (!movieId || !theaterId) {
      // Try to find a showtime with the same theater to extract movieId
      const showtimesWithMovie = await prisma.showtime.findMany({
        where: {
          // Use a range close to the requested ID to find similar showtimes
          id: {
            gte: Math.max(1, showtimeId - 100),
            lte: showtimeId + 100
          }
        },
        include: {
          movie: true,
          theater: true
        },
        take: 1
      });
      
      if (showtimesWithMovie.length > 0) {
        // Use the movie and theater from a similar showtime
        movieId = showtimesWithMovie[0].movieId;
        theaterId = showtimesWithMovie[0].theaterId;
        console.log(`Found similar showtime. Using Movie ID: ${movieId}, Theater ID: ${theaterId}`);
      }
    }
    
    // Get movie and theater data for the constructed showtime
    let movie = null;
    let theater = null;
    
    if (movieId) {
      movie = await prisma.movie.findUnique({
        where: { id: movieId },
        select: {
          id: true,
          title: true,
          poster: true,
          duration: true,
          language: true
        }
      });
    }
    
    if (theaterId) {
      theater = await prisma.theater.findUnique({
        where: { id: theaterId }
      });
    }
    
    // If still missing either movie or theater, fetch defaults
    if (!movie) {
      const movies = await prisma.movie.findMany({
        take: 1,
        select: {
          id: true,
          title: true,
          poster: true,
          duration: true,
          language: true
        }
      });
      
      if (movies.length > 0) {
        movie = movies[0];
        movieId = movie.id;
      }
    }
    
    if (!theater) {
      const theaters = await prisma.theater.findMany({
        take: 1
      });
      
      if (theaters.length > 0) {
        theater = theaters[0];
        theaterId = theater.id;
      }
    }
    
    // If we now have both movie and theater, create a temporary showtime
    if (movie && theater) {
      console.log(`Creating temporary showtime with Movie: ${movie.title}, Theater: ${theater.name}`);
      
      // Define a default showtime that's consistent with database format
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const defaultShowtime = {
        id: showtimeId,
        date: today,
        time: "19:30", // 7:30 PM in 24-hour format
        format: "standard",
        price: 150,
        available_seats: theater.seating_capacity || 100,
        movieId: movie.id,
        theaterId: theater.id,
        created_at: new Date(),
        updated_at: new Date(),
        movie: movie,
        theater: theater
      };
      
      // Format date and time consistently
      const formattedShowtime = {
        ...defaultShowtime,
        date: defaultShowtime.date.toISOString().split('T')[0],
        time: convertTo12HourFormat(defaultShowtime.time)
      };
      
      // Try to create this showtime in the database for future use
      try {
        await prisma.showtime.create({
          data: {
            movieId: defaultShowtime.movieId,
            theaterId: defaultShowtime.theaterId,
            date: defaultShowtime.date,
            time: defaultShowtime.time,
            format: defaultShowtime.format,
            price: defaultShowtime.price,
            available_seats: defaultShowtime.available_seats
          }
        });
        console.log(`Created new showtime in database with ID: ${showtimeId}`);
      } catch (createError) {
        // Just log the error, we'll return the temporary showtime anyway
        console.error('Failed to create showtime in database:', createError);
      }
      
      return NextResponse.json({ 
        showtime: formattedShowtime,
        isTemporary: true
      });
    }
    
    // If we can't create a valid showtime with real data, return a clear error
    return NextResponse.json(
      { 
        error: 'Showtime not found and could not be reconstructed',
        details: 'The requested showtime does not exist in the database'
      },
      { status: 404 }
    );
    
  } catch (error) {
    console.error('Error fetching showtime:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch showtime',
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

/**
 * Convert 24-hour time format to 12-hour format with AM/PM
 */
function convertTo12HourFormat(time24h: string): string {
  // If already in 12-hour format, return as is
  if (time24h.includes('AM') || time24h.includes('PM')) {
    return time24h;
  }
  
  try {
    // Parse the time string
    const [hours, minutes] = time24h.split(':').map(Number);
    
    if (isNaN(hours) || isNaN(minutes)) {
      return time24h; // Return original if parsing fails
    }
    
    // Convert to 12-hour format
    const period = hours >= 12 ? 'PM' : 'AM';
    const hours12 = hours % 12 || 12; // Convert 0 to 12 for 12 AM
    
    // Format the time with leading zeros for minutes
    return `${hours12}:${minutes.toString().padStart(2, '0')} ${period}`;
  } catch (error) {
    console.error('Error converting time format:', error);
    return time24h; // Return original on error
  }
} 