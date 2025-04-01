// API client functions for fetching data from the backend

export interface Movie {
  id: number
  title: string
  description: string
  poster: string
  duration: number
  rating: number
  release_date: string
  language: string
  genres: string[] | string
  cast: Array<{ name: string; role: string }> | string
}

export interface Theater {
  id: number
  name: string
  location: string
  rating: number
  seating_capacity?: number
  amenities?: string
}

export interface Showtime {
  id: number
  theaterId: number
  movieId: number
  time: string
  format: "standard" | "imax" | "premium" | "vip"
  price: number
  date: string
  available_seats?: number
  movie?: Partial<Movie>
  theater?: Theater
}

// Cache for movie data only (theaters and showtimes should be always fresh)
let moviesCache: Movie[] = [];

// Fetch all movies
export async function fetchMovies(): Promise<Movie[]> {
  try {
    if (moviesCache.length > 0) {
      return moviesCache;
    }
    
    const response = await fetch('/api/public/movies');
    if (!response.ok) {
      throw new Error('Failed to fetch movies');
    }
    
    const data = await response.json();
    moviesCache = data.movies;
    return data.movies;
  } catch (error) {
    console.error('Error fetching movies:', error);
    return [];
  }
}

// Get a movie by ID
export async function getMovieById(id: number): Promise<Movie | null> {
  try {
    // Try cache first
    if (moviesCache.length > 0) {
      const cachedMovie = moviesCache.find(m => m.id === id);
      if (cachedMovie) return cachedMovie;
    }
    
    // Fetch from API
    const response = await fetch(`/api/public/movies/${id}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch movie with ID ${id}`);
    }
    
    const data = await response.json();
    return data.movie;
  } catch (error) {
    console.error('Error fetching movie by ID:', error);
    return null;
  }
}

// Fetch all theaters
export async function fetchTheaters(): Promise<Theater[]> {
  try {
    // Always fetch fresh theater data
    const response = await fetch('/api/public/theaters');
    if (!response.ok) {
      throw new Error('Failed to fetch theaters');
    }
    
    const data = await response.json();
    return data.theaters;
  } catch (error) {
    console.error('Error fetching theaters:', error);
    return [];
  }
}

// Get a theater by ID
export async function getTheaterById(id: number): Promise<Theater | null> {
  try {
    // Always fetch fresh theater data
    const response = await fetch(`/api/public/theaters/${id}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch theater with ID ${id}`);
    }
    
    const data = await response.json();
    return data.theater;
  } catch (error) {
    console.error('Error fetching theater by ID:', error);
    return null;
  }
}

// Fetch all showtimes
export async function fetchShowtimes(): Promise<Showtime[]> {
  try {
    // Always fetch fresh showtime data
    const response = await fetch('/api/public/showtimes');
    if (!response.ok) {
      throw new Error('Failed to fetch showtimes');
    }
    
    const data = await response.json();
    return data.showtimes;
  } catch (error) {
    console.error('Error fetching showtimes:', error);
    return [];
  }
}

// Get showtimes for a specific movie
export async function getShowtimesForMovie(movieId: number, date?: string): Promise<Showtime[]> {
  try {
    let url = `/api/public/movies/${movieId}/showtimes`;
    
    // Add date parameter if provided
    if (date) {
      url += `?date=${date}`;
    }
    
    // Always fetch fresh showtime data
    const response = await fetch(url, { 
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch showtimes for movie ${movieId}`);
    }
    
    const data = await response.json();
    return data.showtimes;
  } catch (error) {
    console.error('Error fetching showtimes for movie:', error);
    return [];
  }
}

// Parse JSON string fields
export function parseMovieData(movie: Movie): Movie {
  return {
    ...movie,
    genres: typeof movie.genres === 'string' ? JSON.parse(movie.genres as string) : movie.genres,
    cast: typeof movie.cast === 'string' ? JSON.parse(movie.cast as string) : movie.cast
  };
}

// Helper function to make authenticated API requests
export async function fetchWithAuth(url: string, options: RequestInit = {}) {
  try {
    // Add default headers for JSON requests
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };
    
    // Make the request with credentials to include cookies
    const response = await fetch(url, {
      ...options,
      headers,
      credentials: 'include', // Include cookies with the request
    });
    
    // Handle unauthorized errors
    if (response.status === 401) {
      // Redirect to sign-in page if needed
      if (typeof window !== 'undefined') {
        window.location.href = `/sign-in?returnUrl=${encodeURIComponent(window.location.pathname)}`;
      }
      throw new Error('Unauthorized');
    }
    
    return response;
  } catch (error) {
    console.error(`Error fetching ${url}:`, error);
    throw error;
  }
} 