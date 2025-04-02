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
      { format: 'premium', price: 250 },
      { format: 'imax', price: 350 },
      { format: 'vip', price: 450 }
    ];
    
    // Define show times
    const times = ['10:00 AM', '1:30 PM', '5:00 PM', '8:30 PM', '10:30 PM'];
    
    // Create dates for the specified number of days
    const dates = [];
    for (let i = 0; i < daysToGenerate; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      dates.push(date);
    }
    
    // Get theater capacity
    const theater = await prisma.theater.findUnique({
      where: { id: theaterId }
    });
    
    if (!theater) {
      throw new Error(`Theater with ID ${theaterId} not found`);
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
      await prisma.showtime.createMany({
        data: showtimesToCreate,
        skipDuplicates: true
      });
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