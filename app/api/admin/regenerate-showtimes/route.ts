import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { isAdminMiddleware } from '@/lib/auth';
import { generateAllShowtimes, generateShowtimesForMovie, generateShowtimesForTheater } from '@/lib/utils/showtime-generator';

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
    
    // Get the parameters
    const data = await req.json();
    const { movieId, theaterId, daysToGenerate = 14 } = data;
    
    // Option 1: Regenerate for a specific movie
    if (movieId && !theaterId) {
      const movie = await prisma.movie.findUnique({
        where: { id: parseInt(movieId) }
      });
      
      if (!movie) {
        return NextResponse.json({ error: 'Movie not found' }, { status: 404 });
      }
      
      // Clear existing showtimes for this movie
      await prisma.showtime.deleteMany({
        where: { movieId: parseInt(movieId) }
      });
      
      // Generate new showtimes
      await generateShowtimesForMovie(parseInt(movieId), daysToGenerate);
      
      return NextResponse.json({
        success: true,
        message: `Showtimes regenerated for movie: ${movie.title}`
      });
    }
    
    // Option 2: Regenerate for a specific theater
    if (theaterId && !movieId) {
      const theater = await prisma.theater.findUnique({
        where: { id: parseInt(theaterId) }
      });
      
      if (!theater) {
        return NextResponse.json({ error: 'Theater not found' }, { status: 404 });
      }
      
      // Clear existing showtimes for this theater
      await prisma.showtime.deleteMany({
        where: { theaterId: parseInt(theaterId) }
      });
      
      // Generate new showtimes
      await generateShowtimesForTheater(parseInt(theaterId), daysToGenerate);
      
      return NextResponse.json({
        success: true,
        message: `Showtimes regenerated for theater: ${theater.name}`
      });
    }
    
    // Option 3: Regenerate for a specific movie and theater
    if (movieId && theaterId) {
      const movie = await prisma.movie.findUnique({
        where: { id: parseInt(movieId) }
      });
      
      const theater = await prisma.theater.findUnique({
        where: { id: parseInt(theaterId) }
      });
      
      if (!movie) {
        return NextResponse.json({ error: 'Movie not found' }, { status: 404 });
      }
      
      if (!theater) {
        return NextResponse.json({ error: 'Theater not found' }, { status: 404 });
      }
      
      // Clear existing showtimes for this movie-theater combination
      await prisma.showtime.deleteMany({
        where: {
          movieId: parseInt(movieId),
          theaterId: parseInt(theaterId)
        }
      });
      
      // Generate new showtimes for just this combination
      await prisma.$transaction(async (prisma) => {
        const formats = [
          { format: 'standard', price: 150 },
          { format: 'premium', price: 180 },
          { format: 'imax', price: 200 },
          { format: 'vip', price: 220 }
        ];
        
        const times = ['10:00 AM', '1:30 PM', '5:00 PM', '8:30 PM', '10:30 PM'];
        const showtimesToCreate = [];
        
        // Create dates for the specified number of days
        for (let i = 0; i < daysToGenerate; i++) {
          const date = new Date();
          date.setDate(date.getDate() + i);
          
          // Choose 2-3 times for each day
          const numShowtimes = 2 + Math.floor(Math.random() * 2);
          const shuffledTimes = [...times].sort(() => 0.5 - Math.random());
          const selectedTimes = shuffledTimes.slice(0, numShowtimes);
          
          for (const time of selectedTimes) {
            const formatIndex = Math.floor(Math.random() * formats.length);
            const { format, price } = formats[formatIndex];
            
            showtimesToCreate.push({
              movieId: parseInt(movieId),
              theaterId: parseInt(theaterId),
              date,
              time,
              format,
              price,
              available_seats: theater.seating_capacity
            });
          }
        }
        
        if (showtimesToCreate.length > 0) {
          await prisma.showtime.createMany({
            data: showtimesToCreate
          });
        }
      });
      
      return NextResponse.json({
        success: true,
        message: `Showtimes regenerated for ${movie.title} at ${theater.name}`
      });
    }
    
    // Option 4: Regenerate for all movies and theaters
    // First clear all existing showtimes
    await prisma.showtime.deleteMany({});
    
    // Then generate new ones
    await generateAllShowtimes(daysToGenerate);
    
    return NextResponse.json({
      success: true,
      message: 'All showtimes regenerated successfully'
    });
  } catch (error) {
    console.error('Error regenerating showtimes:', error);
    return NextResponse.json(
      { error: 'Failed to regenerate showtimes' },
      { status: 500 }
    );
  }
} 