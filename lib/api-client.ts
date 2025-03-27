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
}

export interface Showtime {
  id: number
  theaterId: number
  movieId: number
  time: string
  format: "standard" | "imax" | "vip"
  price: number
  date: string
}

// Cache for data
let moviesCache: Movie[] = [];
let theatersCache: Theater[] = [];
let showtimesCache: Showtime[] = [];

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
    if (theatersCache.length > 0) {
      return theatersCache;
    }
    
    const response = await fetch('/api/public/theaters');
    if (!response.ok) {
      throw new Error('Failed to fetch theaters');
    }
    
    const data = await response.json();
    theatersCache = data.theaters;
    return data.theaters;
  } catch (error) {
    console.error('Error fetching theaters:', error);
    return [];
  }
}

// Get a theater by ID
export async function getTheaterById(id: number): Promise<Theater | null> {
  try {
    // Try cache first
    if (theatersCache.length > 0) {
      const cachedTheater = theatersCache.find(t => t.id === id);
      if (cachedTheater) return cachedTheater;
    }
    
    // Fetch from API
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
    if (showtimesCache.length > 0) {
      return showtimesCache;
    }
    
    const response = await fetch('/api/public/showtimes');
    if (!response.ok) {
      throw new Error('Failed to fetch showtimes');
    }
    
    const data = await response.json();
    showtimesCache = data.showtimes;
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
    
    const response = await fetch(url);
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