import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { isAuthenticatedMiddleware } from '@/lib/auth';
import { v4 as uuidv4 } from 'uuid';

export const dynamic = 'force-dynamic'; // No caching

export async function POST(req: NextRequest) {
  try {
    // Verify user authentication
    const { isAuthenticated, userId, error } = await isAuthenticatedMiddleware(req);
    
    if (!isAuthenticated || !userId) {
      return NextResponse.json({ error: error || 'Authentication required' }, { status: 401 });
    }

    // Parse request body
    const {
      showtimeId,
      seats,
      totalPrice,
      paymentMethod
    } = await req.json();

    // Validate required fields
    if (!showtimeId || !seats || !totalPrice) {
      return NextResponse.json(
        { error: 'Showtime, seats, and total price are required' },
        { status: 400 }
      );
    }

    // Verify that seats is an array
    if (!Array.isArray(seats) || seats.length === 0) {
      return NextResponse.json(
        { error: 'Seats must be a non-empty array' },
        { status: 400 }
      );
    }

    // Verify that the showtime exists before trying to book
    const showtime = await prisma.showtime.findUnique({
      where: { id: parseInt(showtimeId) },
      include: {
        movie: true,
        theater: true
      }
    });

    if (!showtime) {
      return NextResponse.json(
        { error: 'The selected showtime does not exist', code: 'SHOWTIME_NOT_FOUND' },
        { status: 404 }
      );
    }

    // Verify that the movie and theater exist in the showtime
    if (!showtime.movie || !showtime.theater) {
      return NextResponse.json(
        { error: 'The showtime has incomplete data (missing movie or theater)', code: 'INVALID_SHOWTIME_DATA' },
        { status: 400 }
      );
    }

    // Generate a unique booking reference
    const bookingReference = uuidv4().substring(0, 8).toUpperCase();

    // Create the booking in the database
    try {
      const booking = await prisma.booking.create({
        data: {
          user: {
            connect: { id: userId }
          },
          showtime: {
            connect: { id: parseInt(showtimeId) }
          },
          seats: JSON.stringify(seats),
          total_price: totalPrice,
          booking_reference: bookingReference,
          payment_method: paymentMethod || 'card',
          status: 'CONFIRMED'
        },
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
              movie: true,
              theater: true
            }
          }
        }
      });

      // Update available seats for the showtime
      await prisma.showtime.update({
        where: { id: parseInt(showtimeId) },
        data: {
          available_seats: Math.max(0, showtime.available_seats - seats.length)
        }
      });

      // Return the created booking
      return NextResponse.json({ 
        success: true, 
        booking 
      });
    } catch (dbError) {
      console.error('Database error creating booking:', dbError);
      return NextResponse.json(
        { error: 'Failed to create booking in database', code: 'DB_ERROR' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error creating booking:', error);
    return NextResponse.json(
      { error: 'Failed to process booking', code: 'PROCESSING_ERROR' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    // Verify user authentication
    const { isAuthenticated, userId, isAdmin, error } = await isAuthenticatedMiddleware(req);
    
    if (!isAuthenticated || !userId) {
      return NextResponse.json({ error: error || 'Authentication required' }, { status: 401 });
    }

    // Parse query parameters
    const url = new URL(req.url);
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const offset = parseInt(url.searchParams.get('offset') || '0');
    
    // Construct query - admins can see all bookings, regular users only see their own
    const where = isAdmin ? {} : { userId };

    // Get total count
    const totalCount = await prisma.booking.count({ where });

    // Get bookings with pagination
    const bookings = await prisma.booking.findMany({
      where,
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
      },
      orderBy: {
        created_at: 'desc'
      },
      take: limit,
      skip: offset
    });

    // Return bookings with pagination info
    return NextResponse.json({
      bookings,
      pagination: {
        total: totalCount,
        offset,
        limit,
        hasMore: offset + limit < totalCount
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