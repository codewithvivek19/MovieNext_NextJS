import { PrismaClient } from '@prisma/client';
import { generateShowtimesForMovie, generateShowtimesForTheater } from '../lib/utils/showtime-generator';

const prisma = new PrismaClient();

/**
 * This script identifies movies and theaters with no associated showtimes
 * and generates showtimes for them using the showtime generator utility.
 */
async function fixMissingShowtimes() {
  try {
    console.log('Starting missing showtimes fix script...');
    
    // Find movies with no showtimes
    const moviesWithNoShowtimes = await prisma.movie.findMany({
      where: {
        showtimes: {
          none: {}
        }
      }
    });
    
    console.log(`Found ${moviesWithNoShowtimes.length} movies with no showtimes`);
    
    // Generate showtimes for each movie
    let movieFixCount = 0;
    for (const movie of moviesWithNoShowtimes) {
      try {
        console.log(`Generating showtimes for movie: ${movie.title} (ID: ${movie.id})`);
        await generateShowtimesForMovie(movie.id, 14);
        movieFixCount++;
      } catch (error) {
        console.error(`Failed to generate showtimes for movie ${movie.title} (ID: ${movie.id}):`, error);
      }
    }
    
    console.log(`Successfully generated showtimes for ${movieFixCount}/${moviesWithNoShowtimes.length} movies`);
    
    // Find theaters with no showtimes
    const theatersWithNoShowtimes = await prisma.theater.findMany({
      where: {
        showtimes: {
          none: {}
        }
      }
    });
    
    console.log(`Found ${theatersWithNoShowtimes.length} theaters with no showtimes`);
    
    // Generate showtimes for each theater
    let theaterFixCount = 0;
    for (const theater of theatersWithNoShowtimes) {
      try {
        console.log(`Generating showtimes for theater: ${theater.name} (ID: ${theater.id})`);
        await generateShowtimesForTheater(theater.id, 14);
        theaterFixCount++;
      } catch (error) {
        console.error(`Failed to generate showtimes for theater ${theater.name} (ID: ${theater.id}):`, error);
      }
    }
    
    console.log(`Successfully generated showtimes for ${theaterFixCount}/${theatersWithNoShowtimes.length} theaters`);
    
    // Verify results
    const movieShowtimeCount = await prisma.showtime.count();
    console.log(`Total showtimes in database: ${movieShowtimeCount}`);
    
    console.log('Showtime generation completed');
    
  } catch (error) {
    console.error('Error fixing missing showtimes:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the fix script
fixMissingShowtimes()
  .then(() => {
    console.log('Fix script completed successfully');
    process.exit(0);
  })
  .catch((err) => {
    console.error('Fix script failed:', err);
    process.exit(1);
  }); 