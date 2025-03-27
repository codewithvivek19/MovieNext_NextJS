import { supabase, Movie, Theater, Showtime, Booking, User } from './supabase';
import { v4 as uuidv4 } from 'uuid';

// Movie API functions
export async function getMovies(): Promise<Movie[]> {
  const { data, error } = await supabase
    .from('movies')
    .select('*')
    .order('title');
  
  if (error) {
    console.error('Error fetching movies:', error);
    return [];
  }
  
  return data || [];
}

export async function getMovieById(id: number): Promise<Movie | null> {
  const { data, error } = await supabase
    .from('movies')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) {
    console.error(`Error fetching movie with id ${id}:`, error);
    return null;
  }
  
  return data;
}

export async function getUpcomingMovies(): Promise<Movie[]> {
  const today = new Date().toISOString().split('T')[0];
  
  const { data, error } = await supabase
    .from('movies')
    .select('*')
    .gt('release_date', today)
    .order('release_date');
  
  if (error) {
    console.error('Error fetching upcoming movies:', error);
    return [];
  }
  
  return data || [];
}

export async function getNowShowingMovies(): Promise<Movie[]> {
  const today = new Date().toISOString().split('T')[0];
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split('T')[0];
  
  const { data, error } = await supabase
    .from('movies')
    .select('*')
    .gte('release_date', thirtyDaysAgoStr)
    .lte('release_date', today)
    .order('release_date', { ascending: false });
  
  if (error) {
    console.error('Error fetching now showing movies:', error);
    return [];
  }
  
  return data || [];
}

// Theater API functions
export async function getTheaters(): Promise<Theater[]> {
  const { data, error } = await supabase
    .from('theaters')
    .select('*')
    .order('name');
  
  if (error) {
    console.error('Error fetching theaters:', error);
    return [];
  }
  
  return data || [];
}

export async function getTheaterById(id: number): Promise<Theater | null> {
  const { data, error } = await supabase
    .from('theaters')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) {
    console.error(`Error fetching theater with id ${id}:`, error);
    return null;
  }
  
  return data;
}

// Showtime API functions
export async function getShowtimes(movieId?: number, theaterId?: number, date?: string): Promise<Showtime[]> {
  let query = supabase.from('showtimes').select('*');
  
  if (movieId) {
    query = query.eq('movie_id', movieId);
  }
  
  if (theaterId) {
    query = query.eq('theater_id', theaterId);
  }
  
  if (date) {
    query = query.eq('date', date);
  }
  
  const { data, error } = await query.order('time');
  
  if (error) {
    console.error('Error fetching showtimes:', error);
    return [];
  }
  
  return data || [];
}

export async function getShowtimeById(id: number): Promise<Showtime | null> {
  const { data, error } = await supabase
    .from('showtimes')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) {
    console.error(`Error fetching showtime with id ${id}:`, error);
    return null;
  }
  
  return data;
}

// Booking API functions
export async function createBooking(
  userId: string,
  movieId: number,
  theaterId: number,
  showtimeId: number,
  seats: string[],
  totalPrice: number,
  showtimeDate: string
): Promise<string | null> {
  // Generate a unique booking reference (e.g., BK-UUID)
  const bookingReference = `BK-${uuidv4().slice(0, 8).toUpperCase()}`;
  
  const { data, error } = await supabase
    .from('bookings')
    .insert([
      {
        user_id: userId,
        movie_id: movieId,
        theater_id: theaterId,
        showtime_id: showtimeId,
        seats,
        total_price: totalPrice,
        booking_date: new Date().toISOString(),
        showtime_date: showtimeDate,
        status: 'confirmed',
        payment_status: 'completed',
        booking_reference: bookingReference,
      },
    ])
    .select();
  
  if (error) {
    console.error('Error creating booking:', error);
    return null;
  }
  
  return bookingReference;
}

export async function getUserBookings(userId: string): Promise<{ data: Booking[] | null, error: any }> {
  const { data, error } = await supabase
    .from('bookings')
    .select(`
      id,
      booking_reference,
      seats,
      total_price,
      booking_date,
      created_at,
      status,
      movies:movie_id(id, title, poster),
      theaters:theater_id(id, name, location),
      showtimes:showtime_id(id, time, format, date)
    `)
    .eq('user_id', userId)
    .order('booking_date', { ascending: false });
  
  if (error) {
    console.error(`Error fetching bookings for user ${userId}:`, error);
    return { data: null, error };
  }
  
  // Process the response to format it according to the Booking type expected by the UI
  const formattedBookings = data.map((booking) => {
    // Create estimated start/end times from the showtime data
    const showtimeDate = booking.showtimes?.date || '';
    const showtimeTime = booking.showtimes?.time || '';
    
    const startTimeStr = `${showtimeDate}T${showtimeTime.replace(/\s?[AP]M$/i, '')}`;
    const startTime = new Date(startTimeStr);
    const endTime = new Date(startTime);
    endTime.setHours(endTime.getHours() + 2); // Assuming 2 hours duration
    
    return {
      id: booking.id,
      booking_reference: booking.booking_reference,
      seats: booking.seats,
      total_amount: booking.total_price,
      created_at: booking.created_at,
      movie: {
        id: booking.movies?.id,
        title: booking.movies?.title,
        poster_url: booking.movies?.poster,
      },
      theater: {
        id: booking.theaters?.id,
        name: booking.theaters?.name,
        location: booking.theaters?.location,
      },
      showtime: {
        id: booking.showtimes?.id,
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
      },
    };
  });
  
  return { data: formattedBookings, error: null };
}

export async function getBookingByReference(reference: string): Promise<Booking | null> {
  const { data, error } = await supabase
    .from('bookings')
    .select(`
      *,
      movies:movie_id(title, poster),
      theaters:theater_id(name, location),
      showtimes:showtime_id(time, format)
    `)
    .eq('booking_reference', reference)
    .single();
  
  if (error) {
    console.error(`Error fetching booking with reference ${reference}:`, error);
    return null;
  }
  
  return data;
}

export async function cancelBooking(bookingId: number): Promise<boolean> {
  const { error } = await supabase
    .from('bookings')
    .update({ status: 'cancelled' })
    .eq('id', bookingId);
  
  if (error) {
    console.error(`Error cancelling booking with id ${bookingId}:`, error);
    return false;
  }
  
  return true;
}

// User API functions
export async function getUserProfile(userId: string): Promise<User | null> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();
  
  if (error) {
    console.error(`Error fetching user profile for ${userId}:`, error);
    return null;
  }
  
  return data;
}

export async function updateUserProfile(
  userId: string,
  fullName: string,
  phone: string
): Promise<boolean> {
  const { error } = await supabase
    .from('users')
    .update({
      full_name: fullName,
      phone,
    })
    .eq('id', userId);
  
  if (error) {
    console.error(`Error updating profile for user ${userId}:`, error);
    return false;
  }
  
  return true;
}

// Authentication functions
export async function signUp(email: string, password: string, fullName: string): Promise<string | null> {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
    },
  });
  
  if (error) {
    console.error('Error signing up:', error);
    return null;
  }
  
  return data.user?.id || null;
}

export async function signIn(email: string, password: string): Promise<string | null> {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  
  if (error) {
    console.error('Error signing in:', error);
    return null;
  }
  
  return data.user?.id || null;
}

export async function signOut(): Promise<boolean> {
  const { error } = await supabase.auth.signOut();
  
  if (error) {
    console.error('Error signing out:', error);
    return false;
  }
  
  return true;
}

export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function resetPassword(email: string): Promise<boolean> {
  const { error } = await supabase.auth.resetPasswordForEmail(email);
  
  if (error) {
    console.error('Error resetting password:', error);
    return false;
  }
  
  return true;
} 