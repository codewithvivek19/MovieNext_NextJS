import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { parseJson } from '@/lib/utils';

export const dynamic = 'force-dynamic'; // No caching

/**
 * GET: Public endpoint to fetch a movie by ID
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid movie ID' },
        { status: 400 }
      );
    }
    
    // Get the movie from the database
    const movie = await prisma.movie.findUnique({
      where: { id },
      include: {
        showtimes: {
          include: {
            theater: true
          }
        }
      }
    });
    
    if (!movie) {
      return NextResponse.json(
        { error: 'Movie not found' },
        { status: 404 }
      );
    }
    
    // Process the movie to parse JSON fields
    const processedMovie = {
      ...movie,
      genres: parseJson<string[]>(movie.genres, []),
      cast: parseJson<Array<{name: string, role: string}>>(movie.cast, []),
      release_date: movie.release_date.toISOString().split('T')[0],
      showtimes: movie.showtimes.map(showtime => ({
        ...showtime,
        time: showtime.time,
        date: showtime.date.toISOString().split('T')[0],
      }))
    };
    
    return NextResponse.json({ movie: processedMovie });
  } catch (error) {
    console.error('Error fetching movie:', error);
    return NextResponse.json(
      { error: 'Failed to fetch movie' },
      { status: 500 }
    );
  }
} 