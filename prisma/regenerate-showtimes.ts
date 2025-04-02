import { PrismaClient } from '@prisma/client';
import { generateAllShowtimes } from '../lib/utils/showtime-generator';

const prisma = new PrismaClient();

/**
 * Regenerate all showtimes using fixed format for all movies and theaters
 * This script removes existing showtimes and creates new ones with the fixed format
 */
async function regenerateAllShowtimes() {
  try {
    console.log('Starting showtime regeneration script...');

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

    return {
      success,
      deleted: existingCount,
      created: newCount
    };
  } catch (error) {
    console.error('Error regenerating showtimes:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the regeneration script
regenerateAllShowtimes()
  .then((result) => {
    console.log('Showtime regeneration completed successfully:', result);
    process.exit(0);
  })
  .catch((error) => {
    console.error('Showtime regeneration failed:', error);
    process.exit(1);
  }); 