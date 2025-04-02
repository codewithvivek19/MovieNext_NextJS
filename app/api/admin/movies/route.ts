import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { isAdminMiddleware } from '@/lib/auth';
import { generateShowtimesForMovie } from '@/lib/utils/showtime-generator';

// GET: Get all movies
export async function GET(req: NextRequest) {
  try {
    // Verify admin status
    const { isAdmin, error } = await isAdminMiddleware(req);
    
    if (!isAdmin) {
      return NextResponse.json({ error }, { status: 401 });
    }
    
    // Get all movies
    const movies = await prisma.movie.findMany({
      orderBy: {
        title: 'asc'
      }
    });
    
    return NextResponse.json({ movies });
  } catch (error) {
    console.error('Error fetching movies:', error);
    return NextResponse.json(
      { error: 'Failed to fetch movies' },
      { status: 500 }
    );
  }
}

// POST: Create a new movie
export async function POST(req: NextRequest) {
  try {
    // Verify admin status
    const { isAdmin, error } = await isAdminMiddleware(req);
    
    if (!isAdmin) {
      return NextResponse.json({ error }, { status: 401 });
    }
    
    const data = await req.json();
    
    // Format data for Prisma
    if (typeof data.genres !== 'string') {
      data.genres = JSON.stringify(data.genres);
    }
    
    if (typeof data.cast !== 'string') {
      data.cast = JSON.stringify(data.cast);
    }
    
    // Create the movie
    const movie = await prisma.movie.create({
      data: {
        title: data.title,
        description: data.description,
        poster: data.poster,
        duration: data.duration,
        rating: data.rating,
        release_date: new Date(data.release_date),
        language: data.language,
        genres: data.genres,
        cast: data.cast
      }
    });
    
    // Generate showtimes for the new movie
    try {
      // Generate showtimes for the next 14 days across all theaters
      await generateShowtimesForMovie(movie.id, 14);
      console.log(`Generated showtimes for movie: ${movie.title} (ID: ${movie.id})`);
    } catch (showtimeError) {
      console.error('Error generating showtimes:', showtimeError);
      // Continue with response - don't fail the movie creation if showtimes fail
    }
    
    return NextResponse.json({ movie }, { status: 201 });
  } catch (error) {
    console.error('Error creating movie:', error);
    return NextResponse.json(
      { error: 'Failed to create movie' },
      { status: 500 }
    );
  }
}

// Dynamic route handlers for /:id
export async function PATCH(req: NextRequest) {
  try {
    // Verify admin status
    const { isAdmin, error } = await isAdminMiddleware(req);
    
    if (!isAdmin) {
      return NextResponse.json({ error }, { status: 401 });
    }
    
    // Get the movie ID from the URL
    const url = new URL(req.url);
    const id = url.pathname.split('/').pop();
    
    if (!id) {
      return NextResponse.json(
        { error: 'Movie ID is required' },
        { status: 400 }
      );
    }
    
    // Get the data to update
    const data = await req.json();
    
    // Format data for Prisma
    if (data.genres && typeof data.genres !== 'string') {
      data.genres = JSON.stringify(data.genres);
    }
    
    if (data.cast && typeof data.cast !== 'string') {
      data.cast = JSON.stringify(data.cast);
    }
    
    if (data.release_date) {
      data.release_date = new Date(data.release_date);
    }
    
    // Update the movie
    const movie = await prisma.movie.update({
      where: { id: parseInt(id) },
      data
    });
    
    return NextResponse.json({ movie });
  } catch (error) {
    console.error('Error updating movie:', error);
    return NextResponse.json(
      { error: 'Failed to update movie' },
      { status: 500 }
    );
  }
}

// DELETE: Delete a movie by ID
export async function DELETE(req: NextRequest) {
  try {
    // Verify admin status
    const { isAdmin, error } = await isAdminMiddleware(req);
    
    if (!isAdmin) {
      return NextResponse.json({ error }, { status: 401 });
    }
    
    // Get the movie ID from the URL
    const url = new URL(req.url);
    const id = url.pathname.split('/').pop();
    
    if (!id) {
      return NextResponse.json(
        { error: 'Movie ID is required' },
        { status: 400 }
      );
    }
    
    // Delete the movie
    await prisma.movie.delete({
      where: { id: parseInt(id) }
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting movie:', error);
    return NextResponse.json(
      { error: 'Failed to delete movie' },
      { status: 500 }
    );
  }
} 