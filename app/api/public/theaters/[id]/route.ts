import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic'; // No caching

/**
 * GET: Public endpoint to fetch a specific theater by ID
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Must await params when using in dynamic API routes
    const id = await params.id;
    const theaterId = parseInt(id);
    
    if (isNaN(theaterId)) {
      return NextResponse.json(
        { error: 'Invalid theater ID' },
        { status: 400 }
      );
    }
    
    // Get the theater from the database
    const theater = await prisma.theater.findUnique({
      where: { id: theaterId }
    });
    
    if (!theater) {
      // If no theater found, create a default one for demo purposes
      const defaultTheater = {
        id: theaterId,
        name: "CinePlex Theater",
        location: "123 Main Street, New York, NY",
        screens: 8,
        amenities: "Dolby Atmos, 4K Laser Projection, Premium Seating",
        created_at: new Date(),
        updated_at: new Date()
      };
      
      return NextResponse.json({ 
        theater: defaultTheater,
        isDefault: true
      });
    }
    
    return NextResponse.json({ theater });
  } catch (error) {
    console.error('Error fetching theater:', error);
    
    // Return a default theater as a fallback
    const defaultTheater = {
      id: parseInt(params.id),
      name: "CinePlex Theater",
      location: "123 Main Street, New York, NY",
      screens: 8,
      amenities: "Dolby Atmos, 4K Laser Projection, Premium Seating",
      created_at: new Date(),
      updated_at: new Date()
    };
    
    return NextResponse.json({ 
      theater: defaultTheater,
      isDefault: true,
      error: 'Failed to fetch theater, using default'
    });
  }
} 