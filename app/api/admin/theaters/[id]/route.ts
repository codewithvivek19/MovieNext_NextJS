import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { isAdminMiddleware } from '@/lib/auth';

// GET: Get a single theater by ID
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
        { error: 'Invalid theater ID' },
        { status: 400 }
      );
    }
    
    // Get the theater with its showtimes
    const theater = await prisma.theater.findUnique({
      where: { id },
      include: {
        showtimes: {
          include: {
            movie: true
          }
        }
      }
    });
    
    if (!theater) {
      return NextResponse.json(
        { error: 'Theater not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ theater });
  } catch (error) {
    console.error('Error fetching theater:', error);
    return NextResponse.json(
      { error: 'Failed to fetch theater' },
      { status: 500 }
    );
  }
}

// PATCH: Update a theater by ID
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
        { error: 'Invalid theater ID' },
        { status: 400 }
      );
    }
    
    // Get the data to update
    const data = await req.json();
    
    // Format data for Prisma
    if (data.seating_capacity) {
      data.seating_capacity = parseInt(data.seating_capacity);
    }
    
    // Update the theater
    const theater = await prisma.theater.update({
      where: { id },
      data
    });
    
    return NextResponse.json({ theater });
  } catch (error) {
    console.error('Error updating theater:', error);
    return NextResponse.json(
      { error: 'Failed to update theater' },
      { status: 500 }
    );
  }
}

// DELETE: Delete a theater by ID
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
        { error: 'Invalid theater ID' },
        { status: 400 }
      );
    }
    
    // Check if theater has showtimes
    const showtimeCount = await prisma.showtime.count({
      where: { theaterId: id }
    });
    
    if (showtimeCount > 0) {
      return NextResponse.json(
        { error: 'Cannot delete theater with existing showtimes' },
        { status: 400 }
      );
    }
    
    // Delete the theater
    await prisma.theater.delete({
      where: { id }
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting theater:', error);
    return NextResponse.json(
      { error: 'Failed to delete theater' },
      { status: 500 }
    );
  }
} 