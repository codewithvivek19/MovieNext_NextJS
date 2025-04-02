import prisma from '@/lib/prisma';

/**
 * Simplified showtime generator that creates the same set of showtimes for all movies and theaters
 * This removes the complexity of random generation and ensures consistent showtimes
 */

// Fixed showtime data - the same for all movies and theaters
const STANDARD_SHOW_TIMES = ['10:00 AM', '1:00 PM', '4:00 PM', '7:00 PM', '10:00 PM'];
const STANDARD_FORMATS = [
  { format: 'standard', price: 150 },
  { format: 'premium', price: 180 },
  { format: 'imax', price: 200 },
  { format: 'vip', price: 220 }
];

/**
 * Generate fixed showtimes for a specific movie at all theaters
 * @param movieId The ID of the movie
 * @param daysToGenerate Number of days to generate showtimes for
 */
export async function generateShowtimesForMovie(movieId: number, daysToGenerate: number = 14) {
  console.log(`Generating fixed showtimes for movie ID ${movieId} across all theaters`);
  try {
    // Verify the movie exists first
    const movie = await prisma.movie.findUnique({
      where: { id: movieId }
    });
    
    if (!movie) {
      throw new Error(`Movie with ID ${movieId} not found`);
    }
    
    // Get all theaters
    const theaters = await prisma.theater.findMany();
    
    if (theaters.length === 0) {
      console.warn(`No theaters found in the database to generate showtimes for movie ${movieId}`);
      return false;
    }
    
    console.log(`Found ${theaters.length} theaters. Generating showtimes for movie "${movie.title}"`);
    
    // Generate showtimes for each theater
    let successCount = 0;
    for (const theater of theaters) {
      try {
        const result = await generateFixedShowtimesForMovieTheater(movieId, theater.id, daysToGenerate);
        if (result) successCount++;
      } catch (error) {
        console.error(`Error generating showtimes for movie ${movieId} at theater ${theater.id}:`, error);
      }
    }
    
    console.log(`Successfully generated showtimes for movie ${movieId} at ${successCount}/${theaters.length} theaters`);
    return successCount > 0;
  } catch (error) {
    console.error('Error generating showtimes for movie:', error);
    return false;
  }
}

/**
 * Generate fixed showtimes for all movies at a specific theater
 * @param theaterId The ID of the theater
 * @param daysToGenerate Number of days to generate showtimes for
 */
export async function generateShowtimesForTheater(theaterId: number, daysToGenerate: number = 14) {
  console.log(`Generating fixed showtimes for theater ID ${theaterId} for all movies`);
  try {
    // Verify the theater exists first
    const theater = await prisma.theater.findUnique({
      where: { id: theaterId }
    });
    
    if (!theater) {
      throw new Error(`Theater with ID ${theaterId} not found`);
    }
    
    // Get all movies
    const movies = await prisma.movie.findMany();
    
    if (movies.length === 0) {
      console.warn(`No movies found in the database to generate showtimes for theater ${theaterId}`);
      return false;
    }
    
    console.log(`Found ${movies.length} movies. Generating showtimes for theater "${theater.name}"`);
    
    // Generate showtimes for each movie
    let successCount = 0;
    for (const movie of movies) {
      try {
        const result = await generateFixedShowtimesForMovieTheater(movie.id, theaterId, daysToGenerate);
        if (result) successCount++;
      } catch (error) {
        console.error(`Error generating showtimes for movie ${movie.id} at theater ${theaterId}:`, error);
      }
    }
    
    console.log(`Successfully generated showtimes for theater ${theaterId} with ${successCount}/${movies.length} movies`);
    return successCount > 0;
  } catch (error) {
    console.error('Error generating showtimes for theater:', error);
    return false;
  }
}

/**
 * Generate fixed showtimes for a specific movie at a specific theater
 * @param movieId The ID of the movie
 * @param theaterId The ID of the theater
 * @param daysToGenerate Number of days to generate showtimes for
 */
export async function generateFixedShowtimesForMovieTheater(
  movieId: number, 
  theaterId: number, 
  daysToGenerate: number = 14
) {
  console.log(`Generating fixed showtimes for movie ${movieId} at theater ${theaterId}`);
  
  try {
    // Create dates for the specified number of days
    const dates = [];
    for (let i = 0; i < daysToGenerate; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      // Ensure dates have zeroed time components to prevent time zone issues
      date.setHours(0, 0, 0, 0);
      dates.push(date);
    }
    
    // Verify the movie exists
    const movie = await prisma.movie.findUnique({
      where: { id: movieId }
    });
    
    if (!movie) {
      throw new Error(`Movie with ID ${movieId} not found`);
    }
    
    // Verify the theater exists and get its capacity
    const theater = await prisma.theater.findUnique({
      where: { id: theaterId }
    });
    
    if (!theater) {
      throw new Error(`Theater with ID ${theaterId} not found`);
    }
    
    console.log(`Creating showtimes for movie "${movie.title}" at theater "${theater.name}"`);
    
    // Check if showtimes already exist for this movie-theater combination
    const existingShowtimes = await prisma.showtime.count({
      where: {
        movieId,
        theaterId
      }
    });
    
    if (existingShowtimes > 0) {
      console.log(`${existingShowtimes} showtimes already exist for this movie-theater combination. Skipping.`);
      return true;
    }
    
    const showtimesToCreate = [];
    
    // Create fixed showtimes for all dates
    for (const date of dates) {
      // For each date, create showtimes with all standard times and formats
      
      // For morning and afternoon shows, use standard format
      showtimesToCreate.push({
        movieId,
        theaterId,
        date,
        time: STANDARD_SHOW_TIMES[0], // 10:00 AM
        format: 'standard',
        price: 150,
        available_seats: theater.seating_capacity
      });
      
      showtimesToCreate.push({
        movieId,
        theaterId,
        date,
        time: STANDARD_SHOW_TIMES[1], // 1:00 PM
        format: 'standard',
        price: 150,
        available_seats: theater.seating_capacity
      });
      
      // For evening shows, use premium format
      showtimesToCreate.push({
        movieId,
        theaterId,
        date,
        time: STANDARD_SHOW_TIMES[2], // 4:00 PM
        format: 'premium',
        price: 180,
        available_seats: theater.seating_capacity
      });
      
      // For prime time shows, use IMAX format
      showtimesToCreate.push({
        movieId,
        theaterId,
        date,
        time: STANDARD_SHOW_TIMES[3], // 7:00 PM
        format: 'imax',
        price: 200,
        available_seats: theater.seating_capacity
      });
      
      // For night shows, use VIP format
      showtimesToCreate.push({
        movieId,
        theaterId,
        date,
        time: STANDARD_SHOW_TIMES[4], // 10:00 PM
        format: 'vip',
        price: 220,
        available_seats: theater.seating_capacity
      });
    }
    
    console.log(`Prepared ${showtimesToCreate.length} showtimes for creation`);
    
    // Insert all showtimes in a batch
    if (showtimesToCreate.length > 0) {
      try {
        const result = await prisma.showtime.createMany({
          data: showtimesToCreate,
          skipDuplicates: true
        });
        
        console.log(`Successfully created ${result.count} showtimes for movie ${movieId} at theater ${theaterId}`);
        return result.count > 0;
      } catch (createError) {
        console.error(`Error creating showtimes batch:`, createError);
        
        // Try creating one by one if batch fails
        console.log(`Batch creation failed. Trying individual showtime creation...`);
        let successCount = 0;
        
        for (const showtimeData of showtimesToCreate) {
          try {
            await prisma.showtime.create({
              data: showtimeData
            });
            successCount++;
          } catch (individualError) {
            console.error(`Failed to create individual showtime:`, individualError);
          }
        }
        
        console.log(`Created ${successCount}/${showtimesToCreate.length} showtimes individually`);
        return successCount > 0;
      }
    }
    
    console.log(`No showtimes to create for movie ${movieId} at theater ${theaterId}`);
    return false;
  } catch (error) {
    console.error(`Error generating showtimes for movie ${movieId} at theater ${theaterId}:`, error);
    return false;
  }
}

/**
 * Generate fixed showtimes for all existing movie-theater combinations
 * @param daysToGenerate Number of days to generate showtimes for
 */
export async function generateAllShowtimes(daysToGenerate: number = 14) {
  console.log(`Generating fixed showtimes for all movie-theater combinations for ${daysToGenerate} days`);
  try {
    // Get all movies and theaters
    const movies = await prisma.movie.findMany();
    const theaters = await prisma.theater.findMany();
    
    console.log(`Found ${movies.length} movies and ${theaters.length} theaters`);
    
    if (movies.length === 0 || theaters.length === 0) {
      console.warn(`Cannot generate showtimes: ${movies.length === 0 ? 'No movies' : 'No theaters'} found`);
      return false;
    }
    
    // Generate showtimes for each movie-theater combination
    let totalCombinations = movies.length * theaters.length;
    let successCount = 0;
    
    for (const movie of movies) {
      for (const theater of theaters) {
        try {
          const result = await generateFixedShowtimesForMovieTheater(movie.id, theater.id, daysToGenerate);
          if (result) successCount++;
        } catch (error) {
          console.error(`Error generating showtimes for movie ${movie.id} at theater ${theater.id}:`, error);
        }
      }
    }
    
    console.log(`Successfully generated showtimes for ${successCount}/${totalCombinations} movie-theater combinations`);
    return successCount > 0;
  } catch (error) {
    console.error('Error generating all showtimes:', error);
    return false;
  }
} 