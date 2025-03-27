import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
// You'll need to add your Supabase URL and anon key to your .env file
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Check if required environment variables are set
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'Warning: Supabase URL or Anon Key is missing. Add them to your .env file to use Supabase client features.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Example function to fetch data from Supabase directly (for reference)
export async function fetchMoviesFromSupabase() {
  try {
    const { data, error } = await supabase
      .from('movies')
      .select('*')
      .order('title');
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching movies from Supabase:', error);
    return [];
  }
}

// Database types based on our schema
export type Movie = {
  id: number;
  title: string;
  description: string;
  poster: string;
  duration: number;
  rating: number;
  release_date: string;
  language: string;
  genres: string[];
  cast: { name: string; role: string }[];
  created_at?: string;
};

export type Theater = {
  id: number;
  name: string;
  location: string;
  rating: number;
  created_at?: string;
};

export type Showtime = {
  id: number;
  theater_id: number;
  movie_id: number;
  time: string;
  format: 'standard' | 'imax' | 'vip';
  price: number;
  date: string;
  created_at?: string;
};

export type Booking = {
  id: number;
  user_id: string;
  movie_id: number;
  theater_id: number;
  showtime_id: number;
  seats: string[];
  total_price: number;
  booking_date: string;
  showtime_date: string;
  status: 'confirmed' | 'cancelled' | 'completed';
  payment_status: 'pending' | 'completed';
  booking_reference: string;
  created_at?: string;
};

export type User = {
  id: string;
  email: string;
  full_name?: string;
  phone?: string;
  created_at?: string;
}; 