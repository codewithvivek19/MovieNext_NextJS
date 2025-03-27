import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { parseJson } from '@/lib/utils';

export const dynamic = 'force-dynamic'; // No caching for API routes

/**
 * GET: Public endpoint to fetch all movies
 */
export async function GET(req: NextRequest) {
  try {
    // Parse query parameters
    const url = new URL(req.url);
    const searchQuery = url.searchParams.get('search')?.toLowerCase() || '';
    
    // Build query
    const where = searchQuery
      ? {
          OR: [
            { title: { contains: searchQuery, mode: 'insensitive' } },
            { language: { contains: searchQuery, mode: 'insensitive' } },
          ],
        }
      : {};
    
    // Get all movies from the database
    const movies = await prisma.movie.findMany({
      where,
      orderBy: {
        title: 'asc'
      }
    });
    
    // Process the movies to parse JSON fields
    const processedMovies = movies.map(movie => ({
      ...movie,
      genres: parseJson<string[]>(movie.genres, []),
      cast: parseJson<Array<{name: string, role: string}>>(movie.cast, []),
      release_date: movie.release_date.toISOString().split('T')[0],
    }));
    
    return NextResponse.json({ 
      movies: processedMovies,
      total: processedMovies.length 
    });
  } catch (error) {
    console.error('Error fetching movies:', error);
    return NextResponse.json(
      { error: 'Failed to fetch movies' },
      { status: 500 }
    );
  }
} 