// Helper functions for accessing data from API
// Replaces the static mock data with actual API calls

export interface Movie {
  id: number
  title: string
  description: string
  poster: string
  duration: number
  rating: number
  releaseDate: string
  language: string
  genres: string[]
  cast: { name: string; role: string }[]
}

export interface Theater {
  id: number
  name: string
  location: string
  rating: number
}

export interface Showtime {
  id: number
  theaterId: number
  time: string
  format: "standard" | "imax" | "vip"
}

// Cache to store fetched data
let moviesCache: Movie[] = [];
let theatersCache: Theater[] = [];
let showtimesCache: Showtime[] = [];

// Fetch all movies from the API
export async function fetchMovies(): Promise<Movie[]> {
  if (moviesCache.length > 0) {
    return moviesCache;
  }
  
  try {
    const response = await fetch('/api/public/movies');
    
    if (!response.ok) {
      throw new Error('Failed to fetch movies');
    }
    
    const data = await response.json();
    
    // Transform the data to match our interface
    const movies: Movie[] = data.movies.map((movie: any) => ({
      id: movie.id,
      title: movie.title,
      description: movie.description,
      poster: movie.poster,
      duration: movie.duration,
      rating: movie.rating,
      releaseDate: movie.release_date,
      language: movie.language,
      genres: typeof movie.genres === 'string' ? JSON.parse(movie.genres) : movie.genres,
      cast: typeof movie.cast === 'string' ? JSON.parse(movie.cast) : movie.cast,
    }));
    
    // Update cache
    moviesCache = movies;
    return movies;
  } catch (error) {
    console.error('Error fetching movies:', error);
    return [];
  }
}

// Fetch all theaters from the API
export async function fetchTheaters(): Promise<Theater[]> {
  if (theatersCache.length > 0) {
    return theatersCache;
  }
  
  try {
    const response = await fetch('/api/public/theaters');
    
    if (!response.ok) {
      throw new Error('Failed to fetch theaters');
    }
    
    const data = await response.json();
    
    // Transform the data to match our interface
    const theaters: Theater[] = data.theaters.map((theater: any) => ({
      id: theater.id,
      name: theater.name,
      location: theater.location,
      rating: theater.rating || 4.5,
    }));
    
    // Update cache
    theatersCache = theaters;
    return theaters;
  } catch (error) {
    console.error('Error fetching theaters:', error);
    return [];
  }
}

// Fetch all showtimes from the API
export async function fetchShowtimes(): Promise<Showtime[]> {
  if (showtimesCache.length > 0) {
    return showtimesCache;
  }
  
  try {
    const response = await fetch('/api/public/showtimes');
    
    if (!response.ok) {
      throw new Error('Failed to fetch showtimes');
    }
    
    const data = await response.json();
    
    // Transform the data to match our interface
    const showtimes: Showtime[] = data.showtimes.map((showtime: any) => ({
      id: showtime.id,
      theaterId: showtime.theater_id,
      time: showtime.time,
      format: showtime.format as "standard" | "imax" | "vip",
    }));
    
    // Update cache
    showtimesCache = showtimes;
    return showtimes;
  } catch (error) {
    console.error('Error fetching showtimes:', error);
    // Return default showtimes
    return [];
  }
}

// Get a movie by ID
export async function getMovieById(id: number): Promise<Movie | undefined> {
  try {
    // Try to fetch from cache first
    if (moviesCache.length > 0) {
      const movie = moviesCache.find(m => m.id === id);
      if (movie) return movie;
    }
    
    // If not in cache, fetch directly
    const response = await fetch(`/api/public/movies/${id}`);
    
    if (!response.ok) {
      throw new Error('Movie not found');
    }
    
    const data = await response.json();
    const movie = data.movie;
    
    return {
      id: movie.id,
      title: movie.title,
      description: movie.description,
      poster: movie.poster,
      duration: movie.duration,
      rating: movie.rating,
      releaseDate: movie.release_date,
      language: movie.language,
      genres: typeof movie.genres === 'string' ? JSON.parse(movie.genres) : movie.genres,
      cast: typeof movie.cast === 'string' ? JSON.parse(movie.cast) : movie.cast,
    };
  } catch (error) {
    console.error('Error fetching movie by ID:', error);
    return undefined;
  }
}

// Get a theater by ID
export async function getTheaterById(id: number): Promise<Theater | undefined> {
  const theaters = await fetchTheaters();
  return theaters.find(t => t.id === id);
}

// Get a showtime by ID
export async function getShowtimeById(id: number): Promise<Showtime | undefined> {
  const showtimes = await fetchShowtimes();
  return showtimes.find(s => s.id === id);
}

// For backwards compatibility, export empty arrays
export const movies: Movie[] = [];
export const theaters: Theater[] = [];
export const showtimes: Showtime[] = [];

