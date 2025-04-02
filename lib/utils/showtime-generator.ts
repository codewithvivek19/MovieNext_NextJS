import prisma from '@/lib/prisma';

/**
 * Generate random showtimes for a specific movie at all theaters
 * @param movieId The ID of the movie
 * @param daysToGenerate Number of days to generate showtimes for
 */
export async function generateShowtimesForMovie(movieId: number, daysToGenerate: number = 14) {
  console.log(`Generating showtimes for movie ID ${movieId} across all theaters`);
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
        const result = await generateShowtimesForMovieTheater(movieId, theater.id, daysToGenerate);
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
 * Generate random showtimes for all movies at a specific theater
 * @param theaterId The ID of the theater
 * @param daysToGenerate Number of days to generate showtimes for
 */
export async function generateShowtimesForTheater(theaterId: number, daysToGenerate: number = 14) {
  console.log(`Generating showtimes for theater ID ${theaterId} for all movies`);
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
        const result = await generateShowtimesForMovieTheater(movie.id, theaterId, daysToGenerate);
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
  console.log(`Generating showtimes for movie ${movieId} at theater ${theaterId}`);
  
  try {
    // Define show formats and prices
    const formats = [
      { format: 'standard', price: 150 },
      { format: 'premium', price: 180 },
      { format: 'imax', price: 200 },
      { format: 'vip', price: 220 }
    ];
    
    // Define show times in 12-hour format to ensure consistency
    const times = ['10:00 AM', '1:30 PM', '5:00 PM', '8:30 PM', '10:30 PM'];
    
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
    
    console.log(`Prepared ${showtimesToCreate.length} showtimes for creation`);
    
    // Insert all showtimes in a batch
    if (showtimesToCreate.length > 0) {
      try {
        const result = await prisma.showtime.createMany({
          data: showtimesToCreate,
          skipDuplicates: true
        });
        
        console.log(`Successfully created ${result.count} showtimes for movie ${movieId} at theater ${theaterId}`);
        
        // If no showtimes were created despite having showtimes to create, try individual creation
        if (result.count === 0) {
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
        
        return true;
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
    } else {
      console.log(`No showtimes to create for movie ${movieId} at theater ${theaterId}`);
      return false;
    }
  } catch (error) {
    console.error(`Error generating showtimes for movie ${movieId} at theater ${theaterId}:`, error);
    return false;
  }
}

/**
 * Generate showtimes for all existing movie-theater combinations
 * @param daysToGenerate Number of days to generate showtimes for
 */
export async function generateAllShowtimes(daysToGenerate: number = 14) {
  console.log(`Generating showtimes for all movie-theater combinations for ${daysToGenerate} days`);
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
          const result = await generateShowtimesForMovieTheater(movie.id, theater.id, daysToGenerate);
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