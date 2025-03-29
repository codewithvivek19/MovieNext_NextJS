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
      // Try to find movie and theater to create a default showtime
      let movie = null;
      let theater = null;
      
      // Try to get a movie
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
      }
      
      // Try to get a theater
      const theaters = await prisma.theater.findMany({
        take: 1
      });
      
      if (theaters.length > 0) {
        theater = theaters[0];
      }
      
      // If we have both a movie and theater, create a default showtime
      if (movie && theater) {
        const defaultShowtime = {
          id: showtimeId,
          date: new Date(),
          time: "7:30 PM",
          movieId: movie.id,
          theaterId: theater.id,
          created_at: new Date(),
          updated_at: new Date(),
          movie: movie,
          theater: theater
        };
        
        // Format the date
        const formattedShowtime = {
          ...defaultShowtime,
          date: defaultShowtime.date.toISOString().split('T')[0]
        };
        
        return NextResponse.json({ 
          showtime: formattedShowtime,
          isDefault: true
        });
      } else {
        // We couldn't find movie or theater data, create fully default
        const defaultShowtime = {
          id: showtimeId,
          date: new Date(),
          time: "7:30 PM",
          movieId: 1,
          theaterId: 1,
          created_at: new Date(),
          updated_at: new Date(),
          movie: {
            id: 1,
            title: "Default Movie",
            poster: "/posters/default.jpg",
            duration: 120,
            language: "English"
          },
          theater: {
            id: 1,
            name: "Default Theater",
            location: "123 Main St, City",
            screens: 5,
            amenities: "Dolby Sound, 4K Projection"
          }
        };
        
        // Format the date
        const formattedShowtime = {
          ...defaultShowtime,
          date: defaultShowtime.date.toISOString().split('T')[0]
        };
        
        return NextResponse.json({ 
          showtime: formattedShowtime,
          isDefault: true
        });
      }
    }
    
    // Format the date
    const formattedShowtime = {
      ...showtime,
      date: showtime.date.toISOString().split('T')[0]
    };
    
    return NextResponse.json({ showtime: formattedShowtime });
  } catch (error) {
    console.error('Error fetching showtime:', error);
    
    // Return a default showtime as fallback
    const defaultShowtime = {
      id: parseInt(params.id),
      date: new Date(),
      time: "7:30 PM",
      movieId: 1,
      theaterId: 1,
      created_at: new Date(),
      updated_at: new Date(),
      movie: {
        id: 1,
        title: "Default Movie",
        poster: "/posters/default.jpg",
        duration: 120,
        language: "English"
      },
      theater: {
        id: 1,
        name: "Default Theater",
        location: "123 Main St, City",
        screens: 5,
        amenities: "Dolby Sound, 4K Projection"
      }
    };
    
    // Format the date
    const formattedShowtime = {
      ...defaultShowtime,
      date: defaultShowtime.date.toISOString().split('T')[0]
    };
    
    return NextResponse.json({ 
      showtime: formattedShowtime,
      isDefault: true,
      error: 'Failed to fetch showtime, using default'
    });
  }
} 