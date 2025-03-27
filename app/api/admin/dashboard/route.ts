import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { isAdminMiddleware } from '@/lib/auth';

// GET: Get dashboard stats and recent bookings
export async function GET(req: NextRequest) {
  try {
    // Verify admin status
    const { isAdmin, error } = await isAdminMiddleware(req);
    
    if (!isAdmin) {
      return NextResponse.json({ error }, { status: 401 });
    }
    
    // Count total movies
    const moviesCount = await prisma.movie.count();
    
    // Count total theaters
    const theatersCount = await prisma.theater.count();
    
    // Count total users
    const usersCount = await prisma.user.count();
    
    // Count total bookings
    const bookingsCount = await prisma.booking.count();
    
    // Calculate total revenue
    const bookings = await prisma.booking.findMany({
      select: {
        total_price: true,
      },
    });
    
    const totalRevenue = bookings.reduce((sum, booking) => sum + (booking.total_price || 0), 0);
    
    // Get recent bookings with user and movie details
    const recentBookings = await prisma.booking.findMany({
      take: 10,
      orderBy: {
        created_at: 'desc',
      },
      include: {
        user: {
          select: {
            first_name: true,
            last_name: true,
            email: true,
          },
        },
        showtime: {
          include: {
            movie: {
              select: {
                title: true,
              },
            },
            theater: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    // Format recent bookings for the frontend
    const formattedRecentBookings = recentBookings.map((booking) => ({
      id: booking.id,
      user: `${booking.user.first_name} ${booking.user.last_name}`,
      email: booking.user.email,
      movie: booking.showtime.movie.title,
      theater: booking.showtime.theater.name,
      date: booking.showtime.date,
      time: booking.showtime.time,
      seats: booking.seats,
      amount: booking.total_price,
      reference: booking.booking_reference,
      created_at: booking.created_at,
    }));
    
    return NextResponse.json({
      stats: {
        movies: moviesCount,
        theaters: theatersCount,
        users: usersCount,
        bookings: bookingsCount,
        revenue: totalRevenue,
      },
      recentBookings: formattedRecentBookings,
    });
  } catch (error) {
    console.error('Dashboard data error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
} 