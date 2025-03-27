import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { isAdminMiddleware } from '@/lib/auth';

// GET: Get a single showtime by ID
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify admin status
    const { isAdmin, error } = await isAdminMiddleware(req);
    
    if (!isAdmin) {
      return NextResponse.json({ error }, { status: 401 });
    }
    
    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid showtime ID' },
        { status: 400 }
      );
    }
    
    // Get the showtime
    const showtime = await prisma.showtime.findUnique({
      where: { id },
      include: {
        movie: true,
        theater: true,
        bookings: {
          include: {
            user: true
          }
        }
      }
    });
    
    if (!showtime) {
      return NextResponse.json(
        { error: 'Showtime not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ showtime });
  } catch (error) {
    console.error('Error fetching showtime:', error);
    return NextResponse.json(
      { error: 'Failed to fetch showtime' },
      { status: 500 }
    );
  }
}

// PATCH: Update a showtime by ID
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify admin status
    const { isAdmin, error } = await isAdminMiddleware(req);
    
    if (!isAdmin) {
      return NextResponse.json({ error }, { status: 401 });
    }
    
    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid showtime ID' },
        { status: 400 }
      );
    }
    
    // Get the data to update
    const data = await req.json();
    
    // Format data for Prisma
    if (data.date) {
      data.date = new Date(data.date);
    }
    
    if (data.price) {
      data.price = parseFloat(data.price);
    }
    
    if (data.available_seats) {
      data.available_seats = parseInt(data.available_seats);
    }
    
    // Check if theater is being changed
    if (data.theaterId) {
      data.theaterId = parseInt(data.theaterId);
      
      // If theater is changing, we should reset available seats
      const theater = await prisma.theater.findUnique({
        where: { id: data.theaterId }
      });
      
      if (!theater) {
        return NextResponse.json(
          { error: 'Theater not found' },
          { status: 404 }
        );
      }
      
      // Get current bookings count
      const currentShowtime = await prisma.showtime.findUnique({
        where: { id },
        include: {
          _count: {
            select: { bookings: true }
          }
        }
      });
      
      if (!currentShowtime) {
        return NextResponse.json(
          { error: 'Showtime not found' },
          { status: 404 }
        );
      }
      
      // Calculate new available seats
      const bookedSeats = currentShowtime._count.bookings;
      data.available_seats = theater.seating_capacity - bookedSeats;
    }
    
    if (data.movieId) {
      data.movieId = parseInt(data.movieId);
    }
    
    // Update the showtime
    const showtime = await prisma.showtime.update({
      where: { id },
      data,
      include: {
        movie: true,
        theater: true
      }
    });
    
    return NextResponse.json({ showtime });
  } catch (error) {
    console.error('Error updating showtime:', error);
    return NextResponse.json(
      { error: 'Failed to update showtime' },
      { status: 500 }
    );
  }
}

// DELETE: Delete a showtime by ID
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify admin status
    const { isAdmin, error } = await isAdminMiddleware(req);
    
    if (!isAdmin) {
      return NextResponse.json({ error }, { status: 401 });
    }
    
    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid showtime ID' },
        { status: 400 }
      );
    }
    
    // Check if showtime has bookings
    const bookingCount = await prisma.booking.count({
      where: { showtimeId: id }
    });
    
    if (bookingCount > 0) {
      return NextResponse.json(
        { error: 'Cannot delete showtime with existing bookings' },
        { status: 400 }
      );
    }
    
    // Delete the showtime
    await prisma.showtime.delete({
      where: { id }
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting showtime:', error);
    return NextResponse.json(
      { error: 'Failed to delete showtime' },
      { status: 500 }
    );
  }
} 