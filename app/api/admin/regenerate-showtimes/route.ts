import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { isAdminMiddleware } from '@/lib/auth';
import { generateAllShowtimes, generateShowtimesForMovie, generateShowtimesForTheater, generateShowtimesForMovieTheater } from '@/lib/utils/showtime-generator';

/**
 * POST: Regenerate showtimes
 * This endpoint can regenerate showtimes for:
 * 1. A specific movie (if movieId is provided)
 * 2. A specific theater (if theaterId is provided)
 * 3. All movies and theaters (if neither is provided)
 */
export async function OPTIONS(req: NextRequest) {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
}

export async function POST(req: NextRequest) {
  try {
    // Verify admin status
    const { isAdmin, error } = await isAdminMiddleware(req);
    
    if (!isAdmin) {
      return NextResponse.json({ error }, { status: 401 });
    }

    const data = await req.json();
    const { movieId, theaterId, days = 14 } = data;
    
    // Validate at least one ID is provided
    if (!movieId && !theaterId) {
      return NextResponse.json(
        { error: 'Either movieId or theaterId must be provided' },
        { status: 400 }
      );
    }

    // Status for the response
    let status = {
      success: false,
      message: '',
      details: {}
    };

    // Case 1: Both movie and theater IDs provided - regenerate for specific combination
    if (movieId && theaterId) {
      console.log(`Regenerating showtimes for movie ID ${movieId} and theater ID ${theaterId}`);
      
      // Verify that both movie and theater exist
      const movie = await prisma.movie.findUnique({ where: { id: movieId } });
      const theater = await prisma.theater.findUnique({ where: { id: theaterId } });
      
      if (!movie) {
        return NextResponse.json(
          { error: `Movie with ID ${movieId} not found` },
          { status: 404 }
        );
      }
      
      if (!theater) {
        return NextResponse.json(
          { error: `Theater with ID ${theaterId} not found` },
          { status: 404 }
        );
      }
      
      try {
        const result = await generateShowtimesForMovieTheater(movieId, theaterId, days);
        status.success = true;
        status.message = `Successfully regenerated showtimes for movie "${movie.title}" at theater "${theater.name}"`;
        status.details = { 
          movie: { id: movieId, title: movie.title },
          theater: { id: theaterId, name: theater.name },
          days: days,
          result
        };
      } catch (error) {
        return NextResponse.json(
          { 
            error: 'Failed to regenerate showtimes for movie-theater combination',
            message: error instanceof Error ? error.message : 'Unknown error'
          },
          { status: 500 }
        );
      }
    }
    // Case 2: Only movie ID provided - regenerate for all theaters
    else if (movieId) {
      console.log(`Regenerating showtimes for movie ID ${movieId} across all theaters`);
      
      const movie = await prisma.movie.findUnique({ where: { id: movieId } });
      
      if (!movie) {
        return NextResponse.json(
          { error: `Movie with ID ${movieId} not found` },
          { status: 404 }
        );
      }
      
      try {
        const result = await generateShowtimesForMovie(movieId, days);
        status.success = true;
        status.message = `Successfully regenerated showtimes for movie "${movie.title}" across all theaters`;
        status.details = { 
          movie: { id: movieId, title: movie.title }, 
          days: days,
          result
        };
      } catch (error) {
        return NextResponse.json(
          { 
            error: 'Failed to regenerate showtimes for movie',
            message: error instanceof Error ? error.message : 'Unknown error' 
          },
          { status: 500 }
        );
      }
    }
    // Case 3: Only theater ID provided - regenerate for all movies
    else if (theaterId) {
      console.log(`Regenerating showtimes for theater ID ${theaterId} for all movies`);
      
      const theater = await prisma.theater.findUnique({ where: { id: theaterId } });
      
      if (!theater) {
        return NextResponse.json(
          { error: `Theater with ID ${theaterId} not found` },
          { status: 404 }
        );
      }
      
      try {
        const result = await generateShowtimesForTheater(theaterId, days);
        status.success = true;
        status.message = `Successfully regenerated showtimes for theater "${theater.name}" with all movies`;
        status.details = { 
          theater: { id: theaterId, name: theater.name }, 
          days: days,
          result
        };
      } catch (error) {
        return NextResponse.json(
          { 
            error: 'Failed to regenerate showtimes for theater',
            message: error instanceof Error ? error.message : 'Unknown error'
          },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(status);
  } catch (error) {
    console.error('Error in regenerate-showtimes API:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error during showtime regeneration',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 