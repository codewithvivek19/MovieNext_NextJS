import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import prisma from '@/lib/prisma';
import { isAdminMiddleware } from '@/lib/auth';

// Helper function to verify admin token
const verifyAdminToken = (req: NextRequest) => {
  const authHeader = req.headers.get('Authorization');
  return authHeader && authHeader === 'Bearer admin-token';
};

// GET: Get all bookings with related details
export async function GET(req: NextRequest) {
  try {
    // Verify admin status
    const adminResult = await isAdminMiddleware(req);
    if (!adminResult.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse query parameters
    const url = new URL(req.url);
    const search = url.searchParams.get('search') || '';
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;
    
    // Build query for search
    const where = search 
      ? {
          OR: [
            { booking_reference: { contains: search } },
            { user: { email: { contains: search, mode: 'insensitive' } } },
            { showtime: { 
                movie: { title: { contains: search, mode: 'insensitive' } } 
              } 
            },
            { showtime: { 
                theater: { name: { contains: search, mode: 'insensitive' } } 
              } 
            }
          ]
        } 
      : {};
    
    // Get total count
    const total = await prisma.booking.count({ where });
    
    // Get bookings with detailed information
    const bookings = await prisma.booking.findMany({
      where,
      orderBy: { created_at: 'desc' },
      skip: offset,
      take: limit,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            first_name: true,
            last_name: true
          }
        },
        showtime: {
          include: {
            movie: {
              select: {
                id: true,
                title: true,
                poster: true
              }
            },
            theater: {
              select: {
                id: true,
                name: true,
                location: true
              }
            }
          }
        }
      }
    });
    
    // Format the bookings for response
    const formattedBookings = bookings.map(booking => ({
      id: booking.id,
      reference: booking.booking_reference,
      user: {
        id: booking.user.id,
        email: booking.user.email,
        name: `${booking.user.first_name || ''} ${booking.user.last_name || ''}`.trim()
      },
      movie: {
        id: booking.showtime.movie.id,
        title: booking.showtime.movie.title,
        poster: booking.showtime.movie.poster
      },
      theater: {
        id: booking.showtime.theater.id,
        name: booking.showtime.theater.name,
        location: booking.showtime.theater.location
      },
      seats: JSON.parse(booking.seats),
      date: booking.showtime.date.toISOString().split('T')[0],
      time: booking.showtime.time,
      format: booking.showtime.format,
      amount: booking.total_price,
      created_at: booking.created_at
    }));
    
    return NextResponse.json({
      bookings: formattedBookings,
      meta: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bookings' },
      { status: 500 }
    );
  }
}

// POST: Create a new booking
export async function POST(req: NextRequest) {
  // Verify admin token
  if (!verifyAdminToken(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    const bookingData = await req.json();
    
    const { data, error } = await supabase
      .from('bookings')
      .insert([bookingData])
      .select();
    
    if (error) throw error;
    
    return NextResponse.json({ data: data[0] });
  } catch (error) {
    console.error('Error creating booking:', error);
    return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 });
  }
}

// PATCH: Update a booking
export async function PATCH(req: NextRequest) {
  // Verify admin token
  if (!verifyAdminToken(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    const { id, ...bookingData } = await req.json();
    
    const { data, error } = await supabase
      .from('bookings')
      .update(bookingData)
      .eq('id', id)
      .select();
    
    if (error) throw error;
    
    return NextResponse.json({ data: data[0] });
  } catch (error) {
    console.error('Error updating booking:', error);
    return NextResponse.json({ error: 'Failed to update booking' }, { status: 500 });
  }
}

// DELETE: Delete a booking
export async function DELETE(req: NextRequest) {
  // Verify admin token
  if (!verifyAdminToken(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Booking ID is required' }, { status: 400 });
    }
    
    const { error } = await supabase
      .from('bookings')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting booking:', error);
    return NextResponse.json({ error: 'Failed to delete booking' }, { status: 500 });
  }
} 