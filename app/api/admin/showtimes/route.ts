import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { isAdminMiddleware } from '@/lib/auth';

// GET: Get all showtimes
export async function GET(req: NextRequest) {
  try {
    // Verify admin status
    const { isAdmin, error } = await isAdminMiddleware(req);
    
    if (!isAdmin) {
      return NextResponse.json({ error }, { status: 401 });
    }
    
    // Get the query parameters
    const { searchParams } = new URL(req.url);
    const movieId = searchParams.get('movieId');
    const theaterId = searchParams.get('theaterId');
    const date = searchParams.get('date');
    
    // Build the where clause
    const where: any = {};
    
    if (movieId) {
      where.movieId = parseInt(movieId);
    }
    
    if (theaterId) {
      where.theaterId = parseInt(theaterId);
    }
    
    if (date) {
      // For date filtering, we want to find showtimes on that date
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);
      
      where.date = {
        gte: startDate,
        lte: endDate
      };
    }
    
    // Get all showtimes with related movie and theater info
    const showtimes = await prisma.showtime.findMany({
      where,
      include: {
        movie: true,
        theater: true
      },
      orderBy: [
        { date: 'asc' },
        { time: 'asc' }
      ]
    });
    
    return NextResponse.json({ showtimes });
  } catch (error) {
    console.error('Error fetching showtimes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch showtimes' },
      { status: 500 }
    );
  }
}

// POST: Create a new showtime
export async function POST(req: NextRequest) {
  try {
    // Verify admin status
    const { isAdmin, error } = await isAdminMiddleware(req);
    
    if (!isAdmin) {
      return NextResponse.json({ error }, { status: 401 });
    }
    
    // Get the data for the new showtime
    const data = await req.json();
    
    // Validate required fields
    if (!data.movieId || !data.theaterId || !data.date || !data.time || !data.price) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Format data for Prisma
    if (data.movieId) {
      data.movieId = parseInt(data.movieId);
    }
    
    if (data.theaterId) {
      data.theaterId = parseInt(data.theaterId);
    }
    
    if (data.date) {
      data.date = new Date(data.date);
    }
    
    if (data.price) {
      data.price = parseFloat(data.price);
    }
    
    // Initialize available seats based on theater capacity
    const theater = await prisma.theater.findUnique({
      where: { id: data.theaterId }
    });
    
    if (!theater) {
      return NextResponse.json(
        { error: 'Theater not found' },
        { status: 404 }
      );
    }
    
    data.available_seats = theater.seating_capacity;
    
    // Create the showtime
    const showtime = await prisma.showtime.create({
      data,
      include: {
        movie: true,
        theater: true
      }
    });
    
    return NextResponse.json({ showtime }, { status: 201 });
  } catch (error) {
    console.error('Error creating showtime:', error);
    return NextResponse.json(
      { error: 'Failed to create showtime' },
      { status: 500 }
    );
  }
}

// PATCH: Update a showtime
export async function PATCH(req: NextRequest) {
  // Verify admin token
  if (!verifyAdminToken(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    const { id, ...showtimeData } = await req.json();
    
    const { data, error } = await supabase
      .from('showtimes')
      .update(showtimeData)
      .eq('id', id)
      .select();
    
    if (error) throw error;
    
    return NextResponse.json({ data: data[0] });
  } catch (error) {
    console.error('Error updating showtime:', error);
    return NextResponse.json({ error: 'Failed to update showtime' }, { status: 500 });
  }
}

// DELETE: Delete a showtime
export async function DELETE(req: NextRequest) {
  // Verify admin token
  if (!verifyAdminToken(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Showtime ID is required' }, { status: 400 });
    }
    
    const { error } = await supabase
      .from('showtimes')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting showtime:', error);
    return NextResponse.json({ error: 'Failed to delete showtime' }, { status: 500 });
  }
} 