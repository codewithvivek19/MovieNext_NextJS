import { PrismaClient } from '@prisma/client';
import { FIXED_SHOWTIMES } from '../app/constants/showtimes';

const prisma = new PrismaClient();

/**
 * Utility script to ensure all movies have basic showtimes at all theaters
 * This is a failsafe to make sure booking works even if the normal showtime generation fails
 */
async function ensureBasicShowtimes() {
  try {
    console.log('Starting ensure-showtimes utility...');

    // Get all movies
    const movies = await prisma.movie.findMany();
    console.log(`Found ${movies.length} movies in database`);

    // Get all theaters
    const theaters = await prisma.theater.findMany();
    console.log(`Found ${theaters.length} theaters in database`);

    if (!theaters.length) {
      console.log('No theaters found. Cannot create showtimes.');
      return;
    }

    // Generate future dates (today + next 7 days)
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      date.setHours(0, 0, 0, 0); // Zero out time component
      dates.push(date);
    }

    // Count of showtimes created
    let createdCount = 0;
    let existingCount = 0;
    let errorCount = 0;

    // Process each movie
    for (const movie of movies) {
      console.log(`Processing movie: ${movie.title} (ID: ${movie.id})`);
      
      // Check how many showtimes this movie already has
      const existingShowtimeCount = await prisma.showtime.count({
        where: { movieId: movie.id }
      });
      
      if (existingShowtimeCount > 0) {
        console.log(`Movie already has ${existingShowtimeCount} showtimes, skipping...`);
        existingCount += existingShowtimeCount;
        continue;
      }
      
      // Create showtimes for this movie at each theater
      for (const theater of theaters) {
        // For each date
        for (const date of dates) {
          // Use fixed showtimes
          for (const showtime of FIXED_SHOWTIMES) {
            try {
              // Check if showtime already exists
              const existingShowtime = await prisma.showtime.findFirst({
                where: {
                  movieId: movie.id,
                  theaterId: theater.id,
                  date: date,
                  time: showtime.time
                }
              });

              if (!existingShowtime) {
                // Create new showtime
                await prisma.showtime.create({
                  data: {
                    movieId: movie.id,
                    theaterId: theater.id,
                    date: date,
                    time: showtime.time,
                    format: showtime.format,
                    price: showtime.price,
                    available_seats: theater.seating_capacity
                  }
                });
                createdCount++;
              } else {
                existingCount++;
              }
            } catch (error) {
              console.error(`Error creating showtime for movie ${movie.title} at theater ${theater.name}:`, error);
              errorCount++;
            }
          }
        }
      }
    }

    console.log('==== Showtime Creation Summary ====');
    console.log(`Created: ${createdCount}`);
    console.log(`Already Existing: ${existingCount}`);
    console.log(`Errors: ${errorCount}`);
    console.log('==================================');

    return {
      created: createdCount,
      existing: existingCount,
      errors: errorCount
    };
  } catch (error) {
    console.error('Error ensuring showtimes:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the utility
ensureBasicShowtimes()
  .then((result) => {
    console.log('Ensure showtimes utility completed successfully:', result);
    process.exit(0);
  })
  .catch((error) => {
    console.error('Ensure showtimes utility failed:', error);
    process.exit(1);
  }); 