import { createClient } from '@supabase/supabase-js';
import { Movie, Theater, Showtime } from './supabase';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

// Create a Supabase client
export const supabaseAdmin = createClient(supabaseUrl, supabaseKey);

// Reset the database (remove all data)
export async function resetDatabase() {
  try {
    // Clear data from tables in the right order (respecting foreign key constraints)
    await supabaseAdmin.from('bookings').delete().neq('id', 0);
    await supabaseAdmin.from('showtimes').delete().neq('id', 0);
    await supabaseAdmin.from('theaters').delete().neq('id', 0);
    await supabaseAdmin.from('movies').delete().neq('id', 0);
    await supabaseAdmin.from('users').delete().neq('id', 0);
    
    return { success: true, message: 'Database reset successfully' };
  } catch (error: any) {
    console.error('Error resetting database:', error);
    return { success: false, message: error.message };
  }
}

// Sync movies to the database
export async function syncMovies(movies: Movie[]) {
  try {
    // Insert or update movies
    const { error } = await supabaseAdmin.from('movies').upsert(
      movies.map(movie => ({
        title: movie.title,
        description: movie.description,
        poster: movie.poster,
        duration: movie.duration,
        rating: movie.rating,
        release_date: movie.release_date,
        language: movie.language,
        genres: movie.genres,
        cast: movie.cast,
      })),
      { onConflict: 'title' }
    );

    if (error) throw error;
    return { success: true, message: `Synced ${movies.length} movies` };
  } catch (error: any) {
    console.error('Error syncing movies:', error);
    return { success: false, message: error.message };
  }
}

// Sync theaters to the database
export async function syncTheaters(theaters: Theater[]) {
  try {
    // Insert or update theaters
    const { error } = await supabaseAdmin.from('theaters').upsert(
      theaters.map(theater => ({
        name: theater.name,
        location: theater.location,
        rating: theater.rating,
      })),
      { onConflict: 'name' }
    );

    if (error) throw error;
    return { success: true, message: `Synced ${theaters.length} theaters` };
  } catch (error: any) {
    console.error('Error syncing theaters:', error);
    return { success: false, message: error.message };
  }
}

// Sync showtimes to the database
export async function syncShowtimes(showtimes: Omit<Showtime, 'id' | 'created_at'>[]) {
  try {
    // Delete all existing showtimes first
    await supabaseAdmin.from('showtimes').delete().neq('id', 0);
    
    // Insert new showtimes
    const { error } = await supabaseAdmin.from('showtimes').insert(showtimes);

    if (error) throw error;
    return { success: true, message: `Synced ${showtimes.length} showtimes` };
  } catch (error: any) {
    console.error('Error syncing showtimes:', error);
    return { success: false, message: error.message };
  }
} 