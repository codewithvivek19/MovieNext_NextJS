import { NextRequest, NextResponse } from 'next/server';
import { isAdminMiddleware } from '@/lib/auth';
import { generateAllShowtimes } from '@/lib/utils/showtime-generator';

/**
 * POST: Run a script to generate showtimes for all movies and theaters
 * This is mostly useful for initial data setup or recovery
 */
export async function POST(req: NextRequest) {
  try {
    // Verify admin status
    const { isAdmin, error } = await isAdminMiddleware(req);
    
    if (!isAdmin) {
      return NextResponse.json({ error }, { status: 401 });
    }
    
    const { script } = await req.json();
    
    if (script === 'generate-all-showtimes') {
      // Generate showtimes for all movie-theater combinations
      const result = await generateAllShowtimes(14); // 14 days
      
      if (result) {
        return NextResponse.json({
          success: true,
          message: 'Successfully generated showtimes for all movies and theaters'
        });
      } else {
        return NextResponse.json(
          { error: 'Script execution failed' },
          { status: 500 }
        );
      }
    }
    
    return NextResponse.json(
      { error: 'Invalid script specified' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error running script:', error);
    return NextResponse.json(
      { error: 'Failed to run script' },
      { status: 500 }
    );
  }
}

export async function OPTIONS(req: NextRequest) {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
} 