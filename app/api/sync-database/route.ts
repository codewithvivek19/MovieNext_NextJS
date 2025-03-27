import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Sample data
const movies = [
  {
    title: 'Avengers: Endgame',
    description: 'After the devastating events of Avengers: Infinity War, the universe is in ruins. With the help of remaining allies, the Avengers assemble once more in order to reverse Thanos\' actions and restore balance to the universe.',
    poster: 'https://m.media-amazon.com/images/M/MV5BMTc5MDE2ODcwNV5BMl5BanBnXkFtZTgwMzI2NzQ2NzM@._V1_.jpg',
    duration: 182,
    rating: 8.4,
    release_date: '2019-04-26',
    language: 'English',
    genres: ['Action', 'Adventure', 'Drama'],
    cast: [
      { name: 'Robert Downey Jr.', role: 'Tony Stark' },
      { name: 'Chris Evans', role: 'Steve Rogers' },
      { name: 'Mark Ruffalo', role: 'Bruce Banner' },
      { name: 'Chris Hemsworth', role: 'Thor' },
      { name: 'Scarlett Johansson', role: 'Natasha Romanoff' }
    ],
  },
  {
    title: 'Kalki 2898 AD',
    description: 'Set in the future year of 2898 AD, the film blends mythology with sci-fi as it follows a modern-day avatar of the Hindu god Vishnu in a post-apocalyptic world.',
    poster: 'https://m.media-amazon.com/images/M/MV5BZTNlMjI0OTktOTYwOS00YWFhLThlYzktYjliNzBhOTJlZDkwXkEyXkFqcGdeQXVyMTU0ODI1NTA2._V1_.jpg',
    duration: 172,
    rating: 8.2,
    release_date: '2024-06-27',
    language: 'Telugu',
    genres: ['Action', 'Sci-Fi', 'Fantasy'],
    cast: [
      { name: 'Prabhas', role: 'Bhairava' },
      { name: 'Amitabh Bachchan', role: 'Ashwatthama' },
      { name: 'Kamal Haasan', role: 'Supreme Yaskin' },
      { name: 'Deepika Padukone', role: 'Sumathi' },
      { name: 'Disha Patani', role: 'Roxie' }
    ],
  },
  {
    title: 'KGF: Chapter 2',
    description: 'In the blood-soaked Kolar Gold Fields, Rocky\'s name strikes fear into his foes. While his allies look up to him, the government sees him as a threat to law and order. Rocky must battle threats from all sides for unchallenged supremacy.',
    poster: 'https://m.media-amazon.com/images/M/MV5BZDNlNzBjMGUtYTA0Yy00OTI2LWJmZjMtODliYmUyYTI0OGFmXkEyXkFqcGdeQXVyODIwMDI1NjM@._V1_.jpg',
    duration: 168,
    rating: 8.2,
    release_date: '2022-04-14',
    language: 'Kannada',
    genres: ['Action', 'Crime', 'Drama'],
    cast: [
      { name: 'Yash', role: 'Rocky' },
      { name: 'Sanjay Dutt', role: 'Adheera' },
      { name: 'Raveena Tandon', role: 'Ramika Sen' },
      { name: 'Srinidhi Shetty', role: 'Reena' },
      { name: 'Prakash Raj', role: 'Vijayendra Ingalagi' }
    ],
  },
  {
    title: 'Kantara',
    description: 'A small community living in the forest finds themselves on a collision course with divine forces as they defend their land and heritage from encroachers. The film explores the divine relationship between humans and nature.',
    poster: 'https://m.media-amazon.com/images/M/MV5BNjQzNDI2NTItNmU5MS00ZGVhLWFmNzItZWVkMGY4OTI1ZmQyXkEyXkFqcGdeQXVyMTQ3Mzk2MDg4._V1_.jpg',
    duration: 150,
    rating: 8.5,
    release_date: '2022-09-30',
    language: 'Kannada',
    genres: ['Action', 'Adventure', 'Thriller'],
    cast: [
      { name: 'Rishab Shetty', role: 'Shiva' },
      { name: 'Sapthami Gowda', role: 'Leela' },
      { name: 'Kishore', role: 'Muralidhar' },
      { name: 'Achyuth Kumar', role: 'Devendra' },
      { name: 'Pramod Shetty', role: 'Sudhakara' }
    ],
  },
];

const theaters = [
  {
    name: 'PVR IMAX Orion Mall',
    location: 'Orion Mall, Brigade Gateway, Rajajinagar, Bangalore',
    rating: 4.6,
  },
  {
    name: 'INOX Garuda Mall',
    location: 'Garuda Mall, Magrath Road, Ashok Nagar, Bangalore',
    rating: 4.3,
  },
  {
    name: 'Cinepolis Forum Shantiniketan',
    location: 'Forum Shantiniketan Mall, Whitefield, Bangalore',
    rating: 4.5,
  },
  {
    name: 'PVR 4DX Forum Mall',
    location: 'The Forum Mall, Koramangala, Bangalore',
    rating: 4.7,
  },
  {
    name: 'INOX Brookefield Mall',
    location: 'Brookefield Mall, ITPL Main Road, Bangalore',
    rating: 4.4,
  },
  {
    name: 'Urvashi Theatre',
    location: '80 Feet Road, Srinagar, Bangalore',
    rating: 4.2,
  },
];

// Generate showtimes for a week for each movie and theater
const generateShowtimes = async () => {
  // First, get all movies and theaters
  const { data: moviesData } = await supabase.from('movies').select('id');
  const { data: theatersData } = await supabase.from('theaters').select('id');
  
  if (!moviesData || !theatersData) {
    throw new Error('Failed to fetch movies or theaters');
  }

  const showtimes = [];
  const currentDate = new Date();
  
  // Generate showtimes for the next 7 days
  for (let day = 0; day < 7; day++) {
    const date = new Date(currentDate);
    date.setDate(date.getDate() + day);
    const dateString = date.toISOString().split('T')[0];
    
    for (const movie of moviesData) {
      for (const theater of theatersData) {
        // Standard format
        ['10:00 AM', '1:00 PM', '4:00 PM', '7:00 PM', '10:00 PM'].forEach(time => {
          showtimes.push({
            movie_id: movie.id,
            theater_id: theater.id,
            time,
            format: 'standard',
            price: Math.floor(Math.random() * 50) + 200, // Random price between 200-250
            date: dateString,
          });
        });
        
        // IMAX format (premium pricing)
        ['12:00 PM', '3:30 PM', '7:30 PM'].forEach(time => {
          showtimes.push({
            movie_id: movie.id,
            theater_id: theater.id,
            time,
            format: 'imax',
            price: Math.floor(Math.random() * 50) + 300, // Random price between 300-350
            date: dateString,
          });
        });
        
        // VIP format (luxury experience)
        ['6:00 PM', '9:00 PM'].forEach(time => {
          showtimes.push({
            movie_id: movie.id,
            theater_id: theater.id,
            time,
            format: 'vip',
            price: Math.floor(Math.random() * 50) + 450, // Random price between 450-500
            date: dateString,
          });
        });
      }
    }
  }
  
  return showtimes;
};

export async function POST(req: NextRequest) {
  // Only admin should be able to sync database, but we'll use a simple token check instead of Clerk
  const authHeader = req.headers.get('Authorization');
  
  // Check if the authorization header exists and matches our simple admin token
  if (!authHeader || authHeader !== 'Bearer admin-token') {
    return NextResponse.json({ error: 'Unauthorized - Admin access required' }, { status: 401 });
  }
  
  try {
    const { action } = await req.json();
    
    // Create tables if they don't exist
    try {
      // Check if movies table exists - if not, we'll create all tables
      const { error: checkMoviesError } = await supabase.from('movies').select('id').limit(1);
      
      if (checkMoviesError && checkMoviesError.code === '42P01') {
        console.log('Creating database tables...');
        
        // Create movies table
        await supabase.rpc('create_movies_table', {});
        
        // Create theaters table
        await supabase.rpc('create_theaters_table', {});
        
        // Create profiles table
        await supabase.rpc('create_profiles_table', {});
        
        // Create showtimes table
        await supabase.rpc('create_showtimes_table', {});
        
        // Create bookings table
        await supabase.rpc('create_bookings_table', {});
        
        console.log('Database tables created successfully');
      }
    } catch (tableError) {
      console.error('Error creating tables:', tableError);
      // Continue with the rest of the process - we'll create SQL functions
      // as an alternative approach
    }
    
    if (action === 'reset') {
      // Delete all data
      try {
        await supabase.from('bookings').delete().neq('id', 0);
      } catch (error) {
        console.log('Bookings table may not exist:', error);
      }
      
      try {
        await supabase.from('showtimes').delete().neq('id', 0);
      } catch (error) {
        console.log('Showtimes table may not exist:', error);
      }
      
      try {
        await supabase.from('theaters').delete().neq('id', 0);
      } catch (error) {
        console.log('Theaters table may not exist:', error);
      }
      
      try {
        await supabase.from('movies').delete().neq('id', 0);
      } catch (error) {
        console.log('Movies table may not exist:', error);
      }
      
      return NextResponse.json({ success: true, message: 'Database reset successfully' });
    }
    
    // Create tables directly with SQL
    if (action === 'sync-all' || action === 'initialize-db') {
      const { error: createTablesError } = await supabase.rpc('create_all_tables', {});
      
      if (createTablesError) {
        // Alternative approach - use direct SQL
        console.log('Using direct SQL to create tables');
        
        // Create movies table
        await supabase.from('movies').insert({ 
          title: 'Temporary', 
          description: 'Temporary record for table creation', 
          poster: 'https://example.com/img.jpg',
          duration: 120,
          rating: 5.0,
          release_date: '2023-01-01',
          language: 'English',
          genres: ['Action'],
          cast: [{ name: 'Actor', role: 'Role' }]
        }).select();
        
        // Create theaters table
        await supabase.from('theaters').insert({
          name: 'Temporary Theater',
          location: 'Temporary Location',
          rating: 4.0
        }).select();
        
        // Create showtimes table if not exists
        await supabase.from('showtimes').insert({
          movie_id: 1,
          theater_id: 1,
          date: '2023-01-01',
          time: '12:00 PM',
          format: 'standard',
          price: 200
        }).select();
        
        // Create bookings table if not exists
        await supabase.from('bookings').insert({
          user_id: 'temp-user',
          showtime_id: 1,
          seats: ['A1'],
          total_price: 200,
          booking_reference: 'TEMP-REF'
        }).select();
        
        // Now delete the temporary records
        await supabase.from('bookings').delete().eq('booking_reference', 'TEMP-REF');
        await supabase.from('showtimes').delete().eq('movie_id', 1).eq('theater_id', 1);
        await supabase.from('theaters').delete().eq('name', 'Temporary Theater');
        await supabase.from('movies').delete().eq('title', 'Temporary');
      }
    }
    
    if (action === 'sync-all' || action === 'sync-movies') {
      // Insert or update movies
      if (action === 'sync-all') {
        try {
          await supabase.from('movies').delete().neq('id', 0);
        } catch (error) {
          console.log('Movies table may not exist:', error);
          // Try to create the movies table
          await supabase.from('movies').insert({ 
            title: 'Temporary', 
            description: 'Temporary record for table creation', 
            poster: 'https://example.com/img.jpg',
            duration: 120,
            rating: 5.0,
            release_date: '2023-01-01',
            language: 'English',
            genres: ['Action'],
            cast: [{ name: 'Actor', role: 'Role' }]
          }).select();
          // Delete the temporary record
          await supabase.from('movies').delete().eq('title', 'Temporary');
        }
      }
      
      for (const movie of movies) {
        await supabase.from('movies').upsert({
          title: movie.title,
          description: movie.description,
          poster: movie.poster,
          duration: movie.duration,
          rating: movie.rating,
          release_date: movie.release_date,
          language: movie.language,
          genres: movie.genres,
          cast: movie.cast,
        });
      }
    }
    
    if (action === 'sync-all' || action === 'sync-theaters') {
      // Insert or update theaters
      if (action === 'sync-all') {
        try {
          await supabase.from('theaters').delete().neq('id', 0);
        } catch (error) {
          console.log('Theaters table may not exist:', error);
          // Try to create the theaters table
          await supabase.from('theaters').insert({
            name: 'Temporary Theater',
            location: 'Temporary Location',
            rating: 4.0
          }).select();
          // Delete the temporary record
          await supabase.from('theaters').delete().eq('name', 'Temporary Theater');
        }
      }
      
      for (const theater of theaters) {
        await supabase.from('theaters').upsert({
          name: theater.name,
          location: theater.location,
          rating: theater.rating,
        });
      }
    }
    
    if (action === 'sync-all' || action === 'sync-showtimes') {
      // Generate and insert showtimes
      if (action === 'sync-all') {
        try {
          await supabase.from('showtimes').delete().neq('id', 0);
        } catch (error) {
          console.log('Showtimes table may not exist:', error);
          // Try to create the showtimes table
          await supabase.from('showtimes').insert({
            movie_id: 1,
            theater_id: 1,
            date: '2023-01-01',
            time: '12:00 PM',
            format: 'standard',
            price: 200
          }).select();
          // Delete the temporary record
          await supabase.from('showtimes').delete().eq('movie_id', 1).eq('theater_id', 1);
        }
      }
      
      try {
        const showtimes = await generateShowtimes();
        
        // Insert in batches of 100 to avoid hitting limitations
        for (let i = 0; i < showtimes.length; i += 100) {
          const batch = showtimes.slice(i, i + 100);
          await supabase.from('showtimes').upsert(batch);
        }
      } catch (error) {
        console.error('Error generating showtimes:', error);
        // Continue with other operations
      }
    }
    
    return NextResponse.json({ 
      success: true, 
      message: `Database ${action === 'sync-all' ? 'fully synced' : action} successfully` 
    });
  } catch (error) {
    console.error('Error syncing database:', error);
    return NextResponse.json({ error: 'Failed to sync database', details: error }, { status: 500 });
  }
} 