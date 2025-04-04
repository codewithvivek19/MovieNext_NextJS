import { NextRequest, NextResponse } from 'next/server';
import { isAdminMiddleware } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';
import { generateAllShowtimes } from '@/lib/utils/showtime-generator';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    // Verify admin status
    const { isAdmin, error } = await isAdminMiddleware(req);
    
    if (!isAdmin) {
      return NextResponse.json({ error }, { status: 401 });
    }
    
    console.log('Starting API showtime regeneration process');
    
    // Step 1: Count existing showtimes
    const existingCount = await prisma.showtime.count();
    console.log(`Found ${existingCount} existing showtimes`);
    
    // Step 2: Delete all existing showtimes
    console.log('Deleting all existing showtimes...');
    await prisma.showtime.deleteMany({});
    console.log('Successfully deleted all existing showtimes');
    
    // Step 3: Generate new fixed showtimes for all movie-theater combinations
    console.log('Generating new fixed showtimes for all movie-theater combinations...');
    const success = await generateAllShowtimes(14); // 14 days of showtimes
    
    // Step 4: Verify the new showtime count
    const newCount = await prisma.showtime.count();
    console.log(`Successfully created ${newCount} new showtimes with fixed format`);
    
    return NextResponse.json({
      success: true,
      message: 'Successfully regenerated all showtimes with fixed format',
      stats: {
        deleted: existingCount,
        created: newCount
      }
    });
  } catch (error) {
    console.error('Error regenerating showtimes:', error);
    return NextResponse.json(
      { 
        error: 'Failed to regenerate showtimes',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
} 