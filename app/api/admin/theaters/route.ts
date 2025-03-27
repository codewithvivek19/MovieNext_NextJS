import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { isAdminMiddleware } from '@/lib/auth';

// GET: Get all theaters
export async function GET(req: NextRequest) {
  try {
    // Verify admin status
    const { isAdmin, error } = await isAdminMiddleware(req);
    
    if (!isAdmin) {
      return NextResponse.json({ error }, { status: 401 });
    }
    
    // Get all theaters
    const theaters = await prisma.theater.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { showtimes: true }
        }
      }
    });
    
    return NextResponse.json({ theaters });
  } catch (error) {
    console.error('Error fetching theaters:', error);
    return NextResponse.json(
      { error: 'Failed to fetch theaters' },
      { status: 500 }
    );
  }
}

// POST: Create a new theater
export async function POST(req: NextRequest) {
  try {
    // Verify admin status
    const { isAdmin, error } = await isAdminMiddleware(req);
    
    if (!isAdmin) {
      return NextResponse.json({ error }, { status: 401 });
    }
    
    // Get the data for the new theater
    const data = await req.json();
    
    // Validate required fields
    if (!data.name || !data.location || !data.seating_capacity) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Format data for Prisma
    if (data.seating_capacity) {
      data.seating_capacity = parseInt(data.seating_capacity);
    }
    
    // Create the theater
    const theater = await prisma.theater.create({
      data
    });
    
    return NextResponse.json({ theater }, { status: 201 });
  } catch (error) {
    console.error('Error creating theater:', error);
    return NextResponse.json(
      { error: 'Failed to create theater' },
      { status: 500 }
    );
  }
}

// PATCH: Update theaters (batch update not supported in this endpoint)
export async function PATCH(req: NextRequest) {
  return NextResponse.json(
    { error: 'To update a theater, use the /api/admin/theaters/[id] endpoint' },
    { status: 400 }
  );
}

// DELETE: Delete theaters (batch delete not supported in this endpoint)
export async function DELETE(req: NextRequest) {
  return NextResponse.json(
    { error: 'To delete a theater, use the /api/admin/theaters/[id] endpoint' },
    { status: 400 }
  );
} 