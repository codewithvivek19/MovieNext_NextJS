import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { isAuthenticatedMiddleware } from '@/lib/auth';
import { v4 as uuidv4 } from 'uuid';
import { FIXED_SHOWTIMES, generateShowtimeId } from '@/app/constants/showtimes';

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
      showtimeData,
      seats,
      totalPrice,
      paymentMethod
    } = await req.json();

    // Validate required fields
    if (!seats || !totalPrice) {
      return NextResponse.json(
        { error: 'Seats and total price are required' },
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

    // Handle showtime - either find existing or create on-the-fly
    let showtime;
    let showtimeIdToUse = showtimeId;

    // If showtimeData is provided, we'll use it to find or create the showtime
    if (showtimeData) {
      const { movieId, theaterId, date, time, format, price } = showtimeData;
      
      if (!movieId || !theaterId || !date || !time) {
        return NextResponse.json(
          { error: 'Incomplete showtime data provided', code: 'INVALID_SHOWTIME_DATA' },
          { status: 400 }
        );
      }

      // First verify that the movie and theater exist
      const movie = await prisma.movie.findUnique({
        where: { id: parseInt(movieId) }
      });

      const theater = await prisma.theater.findUnique({
        where: { id: parseInt(theaterId) }
      });

      if (!movie) {
        return NextResponse.json(
          { error: 'The selected movie does not exist', code: 'MOVIE_NOT_FOUND' },
          { status: 404 }
        );
      }

      if (!theater) {
        return NextResponse.json(
          { error: 'The selected theater does not exist', code: 'THEATER_NOT_FOUND' },
          { status: 404 }
        );
      }

      // Generate deterministic ID if not provided
      if (!showtimeIdToUse) {
        showtimeIdToUse = generateShowtimeId(movieId, theaterId, date, time);
      }

      // Try to find an existing showtime first
      const existingShowtime = await prisma.showtime.findFirst({
        where: {
          OR: [
            { id: parseInt(showtimeIdToUse) },
            {
              movieId: parseInt(movieId),
              theaterId: parseInt(theaterId),
              date: new Date(date),
              time
            }
          ]
        }
      });

      if (existingShowtime) {
        showtime = existingShowtime;
        showtimeIdToUse = existingShowtime.id;
      } else {
        // No existing showtime, create one
        // Find the matching fixed showtime format
        const fixedShowtime = FIXED_SHOWTIMES.find(st => st.time === time);
        const formatToUse = format || (fixedShowtime ? fixedShowtime.format : 'standard');
        const priceToUse = price || (fixedShowtime ? fixedShowtime.price : 150);
        
        try {
          showtime = await prisma.showtime.create({
            data: {
              id: parseInt(showtimeIdToUse),
              movieId: parseInt(movieId),
              theaterId: parseInt(theaterId),
              date: new Date(date),
              time: time,
              format: formatToUse,
              price: priceToUse,
              available_seats: theater.seating_capacity - seats.length
            }
          });
        } catch (createError) {
          console.error('Error creating showtime:', createError);
          // If showtime already exists (race condition), try to fetch it again
          showtime = await prisma.showtime.findUnique({
            where: { id: parseInt(showtimeIdToUse) }
          });
          
          if (!showtime) {
            return NextResponse.json(
              { error: 'Failed to create showtime', code: 'SHOWTIME_CREATE_ERROR' },
              { status: 500 }
            );
          }
        }
      }
    } else if (showtimeIdToUse) {
      // If only showtimeId is provided, try to find the showtime
      showtime = await prisma.showtime.findUnique({
        where: { id: parseInt(showtimeIdToUse) },
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
    } else {
      // Neither showtimeId nor showtime data provided
      return NextResponse.json(
        { error: 'Either showtime ID or showtime data must be provided', code: 'MISSING_SHOWTIME_INFO' },
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
            connect: { id: parseInt(showtimeIdToUse) }
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
        where: { id: parseInt(showtimeIdToUse) },
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