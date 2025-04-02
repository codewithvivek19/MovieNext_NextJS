import { NextRequest, NextResponse } from 'next/server';
import { isAdminMiddleware } from '@/lib/admin-middleware';
import { prisma } from '@/lib/prisma';
import { generateShowtimesForMovie, generateShowtimesForTheater } from '@/lib/utils/showtime-generator';

export async function POST(req: NextRequest) {
  try {
    // Verify admin status
    const { isAdmin, error } = await isAdminMiddleware(req);
    
    if (!isAdmin) {
      return NextResponse.json({ error }, { status: 401 });
    }

    // Get movies that have no showtimes
    const moviesWithNoShowtimes = await prisma.movie.findMany({
      where: {
        NOT: {
          showtimes: {
            some: {}
          }
        }
      }
    });

    console.log(`Found ${moviesWithNoShowtimes.length} movies with no showtimes`);

    // Get theaters that have no showtimes
    const theatersWithNoShowtimes = await prisma.theater.findMany({
      where: {
        NOT: {
          showtimes: {
            some: {}
          }
        }
      }
    });

    console.log(`Found ${theatersWithNoShowtimes.length} theaters with no showtimes`);

    // Results to track successes and failures
    const results = {
      movies_fixed: 0,
      movies_failed: 0,
      movie_errors: [],
      theaters_fixed: 0,
      theaters_failed: 0,
      theater_errors: []
    };

    // Fix movies with no showtimes
    for (const movie of moviesWithNoShowtimes) {
      try {
        console.log(`Generating showtimes for movie: "${movie.title}" (ID: ${movie.id})`);
        await generateShowtimesForMovie(movie.id, 14);
        results.movies_fixed++;
        console.log(`Successfully generated showtimes for movie: "${movie.title}" (ID: ${movie.id})`);
      } catch (error) {
        console.error(`Failed to generate showtimes for movie: "${movie.title}" (ID: ${movie.id})`, error);
        results.movies_failed++;
        results.movie_errors.push({
          movie_id: movie.id,
          movie_title: movie.title,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    // Fix theaters with no showtimes
    for (const theater of theatersWithNoShowtimes) {
      try {
        console.log(`Generating showtimes for theater: "${theater.name}" (ID: ${theater.id})`);
        await generateShowtimesForTheater(theater.id, 14);
        results.theaters_fixed++;
        console.log(`Successfully generated showtimes for theater: "${theater.name}" (ID: ${theater.id})`);
      } catch (error) {
        console.error(`Failed to generate showtimes for theater: "${theater.name}" (ID: ${theater.id})`, error);
        results.theaters_failed++;
        results.theater_errors.push({
          theater_id: theater.id,
          theater_name: theater.name,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    // Get current showtime count
    const showtimeCount = await prisma.showtime.count();

    return NextResponse.json({
      success: true,
      message: `Fixed missing showtimes for ${results.movies_fixed} movies and ${results.theaters_fixed} theaters`,
      total_showtimes: showtimeCount,
      details: results
    });
  } catch (error) {
    console.error('Error fixing showtimes:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fix showtimes',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 