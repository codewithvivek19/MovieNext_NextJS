/**
 * Fixed showtimes configuration for the entire application.
 * This centralizes showtime data to ensure consistency across the app.
 */

export type ShowtimeFormat = 'standard' | 'premium' | 'imax' | 'vip';

export interface FixedShowtime {
  time: string;
  format: ShowtimeFormat;
  price: number;
}

// Standard showtimes that will be used throughout the application
export const FIXED_SHOWTIMES: FixedShowtime[] = [
  { time: '10:00 AM', format: 'standard', price: 150 },
  { time: '1:00 PM', format: 'standard', price: 150 },
  { time: '4:00 PM', format: 'premium', price: 180 },
  { time: '7:00 PM', format: 'imax', price: 200 },
  { time: '10:00 PM', format: 'vip', price: 220 }
];

// Price configuration by seat type
export const SEAT_PRICES = {
  standard: 150,
  premium: 180,
  vip: 220,
};

// Function to get showtimes for a specific date
export function getShowtimesForDate(date: Date): FixedShowtime[] {
  // This could be extended to provide different showtimes for weekends or holidays
  return FIXED_SHOWTIMES;
}

// Function to generate a unique showtime ID
export function generateShowtimeId(movieId: string | number, theaterId: string | number, date: string, time: string): number {
  // Simple hash function for generating deterministic showtime IDs
  const dateStr = new Date(date).toISOString().split('T')[0]; // YYYY-MM-DD
  const seed = `${movieId}-${theaterId}-${dateStr}-${time}`;
  let hash = 0;
  
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  
  // Make sure it's positive and reasonably sized
  return Math.abs(hash % 1000000) + 1000;
} 