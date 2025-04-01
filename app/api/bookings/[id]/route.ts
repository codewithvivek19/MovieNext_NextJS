import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { isAuthenticatedMiddleware } from '@/lib/auth';

export const dynamic = 'force-dynamic'; // No caching

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify user authentication
    const { isAuthenticated, userId, error } = await isAuthenticatedMiddleware(req);
    
    if (!isAuthenticated || !userId) {
      return NextResponse.json({ error: error || 'Authentication required' }, { status: 401 });
    }

    // Extract booking ID from params
    const { id } = params;
    
    if (!id) {
      return NextResponse.json(
        { error: 'Booking ID is required' },
        { status: 400 }
      );
    }

    // First try to find by booking_reference (string)
    let booking = await prisma.booking.findFirst({
      where: {
        booking_reference: id,
        userId: userId
      },
      include: {
        showtime: {
          include: {
            movie: true,
            theater: true
          }
        }
      }
    });

    // If not found, try by numeric ID (if applicable)
    if (!booking && !isNaN(Number(id))) {
      booking = await prisma.booking.findFirst({
        where: {
          id: Number(id),
          userId: userId
        },
        include: {
          showtime: {
            include: {
              movie: true,
              theater: true
            }
          }
        }
      });
    }

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    // Return the booking details
    return NextResponse.json({ 
      booking
    });
  } catch (error) {
    console.error('Error fetching booking by ID:', error);
    return NextResponse.json(
      { error: 'Failed to fetch booking details' },
      { status: 500 }
    );
  }
} 