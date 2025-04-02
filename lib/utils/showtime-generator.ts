import prisma from '@/lib/prisma';

/**
 * Generate random showtimes for a specific movie at all theaters
 * @param movieId The ID of the movie
 * @param daysToGenerate Number of days to generate showtimes for
 */
export async function generateShowtimesForMovie(movieId: number, daysToGenerate: number = 14) {
  try {
    // Get all theaters
    const theaters = await prisma.theater.findMany();
    
    // Generate showtimes for each theater
    for (const theater of theaters) {
      await generateShowtimesForMovieTheater(movieId, theater.id, daysToGenerate);
    }
    
    return true;
  } catch (error) {
    console.error('Error generating showtimes for movie:', error);
    return false;
  }
}

/**
 * Generate random showtimes for all movies at a specific theater
 * @param theaterId The ID of the theater
 * @param daysToGenerate Number of days to generate showtimes for
 */
export async function generateShowtimesForTheater(theaterId: number, daysToGenerate: number = 14) {
  try {
    // Get all movies
    const movies = await prisma.movie.findMany();
    
    // Generate showtimes for each movie
    for (const movie of movies) {
      await generateShowtimesForMovieTheater(movie.id, theaterId, daysToGenerate);
    }
    
    return true;
  } catch (error) {
    console.error('Error generating showtimes for theater:', error);
    return false;
  }
}

/**
 * Generate random showtimes for a specific movie at a specific theater
 * @param movieId The ID of the movie
 * @param theaterId The ID of the theater
 * @param daysToGenerate Number of days to generate showtimes for
 */
export async function generateShowtimesForMovieTheater(
  movieId: number, 
  theaterId: number, 
  daysToGenerate: number = 14
) {
  try {
    // Define show formats and prices
    const formats = [
      { format: 'standard', price: 150 },
      { format: 'premium', price: 180 },
      { format: 'imax', price: 200 },
      { format: 'vip', price: 220 }
    ];
    
    // Define show times - ensure consistency with the format used elsewhere in the app
    // Remove AM/PM to be consistent with database format
    const times = ['10:00', '13:30', '17:00', '20:30', '22:30'];
    
    // Create dates for the specified number of days
    const dates = [];
    for (let i = 0; i < daysToGenerate; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      // Store dates as Date objects but ensure they're properly set with zeroed time
      date.setHours(0, 0, 0, 0);
      dates.push(date);
    }
    
    // Get theater capacity
    const theater = await prisma.theater.findUnique({
      where: { id: theaterId }
    });
    
    if (!theater) {
      throw new Error(`Theater with ID ${theaterId} not found`);
    }

    // Get movie to verify it exists
    const movie = await prisma.movie.findUnique({
      where: { id: movieId }
    });
    
    if (!movie) {
      throw new Error(`Movie with ID ${movieId} not found`);
    }
    
    const showtimesToCreate = [];
    
    // For each date, create 2-3 showtimes with random formats
    for (const date of dates) {
      // Choose a random number of showtimes per day (2-3)
      const numShowtimes = 2 + Math.floor(Math.random() * 2);
      
      // Choose random times without duplicates
      const shuffledTimes = [...times].sort(() => 0.5 - Math.random());
      const selectedTimes = shuffledTimes.slice(0, numShowtimes);
      
      for (const time of selectedTimes) {
        // Choose a random format
        const formatIndex = Math.floor(Math.random() * formats.length);
        const { format, price } = formats[formatIndex];
        
        showtimesToCreate.push({
          movieId,
          theaterId,
          date,
          time,
          format,
          price,
          available_seats: theater.seating_capacity
        });
      }
    }
    
    // Insert all showtimes in a batch
    if (showtimesToCreate.length > 0) {
      try {
        await prisma.showtime.createMany({
          data: showtimesToCreate,
          skipDuplicates: true
        });
        console.log(`Created ${showtimesToCreate.length} showtimes for movie ${movieId} at theater ${theaterId}`);
      } catch (createError) {
        console.error('Error creating showtimes batch:', createError);
        // Try creating one by one if batch fails
        let successCount = 0;
        for (const showtimeData of showtimesToCreate) {
          try {
            await prisma.showtime.create({
              data: showtimeData
            });
            successCount++;
          } catch (individualError) {
            console.error('Error creating individual showtime:', individualError);
          }
        }
        console.log(`Created ${successCount}/${showtimesToCreate.length} showtimes individually`);
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error generating showtimes for movie-theater:', error);
    return false;
  }
}

/**
 * Generate showtimes for all existing movie-theater combinations
 * @param daysToGenerate Number of days to generate showtimes for
 */
export async function generateAllShowtimes(daysToGenerate: number = 14) {
  try {
    // Get all movies and theaters
    const movies = await prisma.movie.findMany();
    const theaters = await prisma.theater.findMany();
    
    // Generate showtimes for each movie-theater combination
    for (const movie of movies) {
      for (const theater of theaters) {
        await generateShowtimesForMovieTheater(movie.id, theater.id, daysToGenerate);
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error generating all showtimes:', error);
    return false;
  }
} 