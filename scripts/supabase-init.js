require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials. Make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

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

async function initializeDatabase() {
  try {
    console.log('Initializing database...');
    
    // Create tables directly using Supabase API
    console.log('Creating movies table...');
    await supabase.from('movies').insert({
      title: 'temp',
      description: 'temp',
      poster: 'temp',
      duration: 120,
      rating: 5.0,
      release_date: '2023-01-01',
      language: 'English',
      genres: ['Action'],
      cast: [{ name: 'temp', role: 'temp' }]
    });
    
    // Delete the temporary record
    await supabase.from('movies').delete().eq('title', 'temp');
    
    console.log('Creating theaters table...');
    await supabase.from('theaters').insert({
      name: 'temp',
      location: 'temp',
      rating: 5.0
    });
    
    // Delete the temporary record
    await supabase.from('theaters').delete().eq('name', 'temp');
    
    console.log('Creating profiles table...');
    // Profiles table is created automatically by Supabase Auth
    
    console.log('Creating showtimes table...');
    await supabase.from('showtimes').insert({
      movie_id: 1,
      theater_id: 1,
      date: '2023-01-01',
      time: '12:00 PM',
      format: 'standard',
      price: 200
    });
    
    // Delete the temporary record
    await supabase.from('showtimes').delete().eq('movie_id', 1).eq('theater_id', 1);
    
    console.log('Creating bookings table...');
    await supabase.from('bookings').insert({
      user_id: 'temp',
      showtime_id: 1,
      seats: ['A1'],
      total_price: 200,
      booking_reference: 'temp'
    });
    
    // Delete the temporary record
    await supabase.from('bookings').delete().eq('booking_reference', 'temp');
    
    // Insert movies
    console.log('Inserting movies...');
    for (const movie of movies) {
      const { error } = await supabase.from('movies').insert(movie);
      if (error) {
        console.error('Error inserting movie:', error);
      }
    }
    
    // Insert theaters
    console.log('Inserting theaters...');
    for (const theater of theaters) {
      const { error } = await supabase.from('theaters').insert(theater);
      if (error) {
        console.error('Error inserting theater:', error);
      }
    }
    
    // Get movie and theater IDs for showtimes
    const { data: moviesData } = await supabase.from('movies').select('id');
    const { data: theatersData } = await supabase.from('theaters').select('id');
    
    // Generate and insert showtimes
    console.log('Generating and inserting showtimes...');
    if (moviesData && theatersData) {
      const currentDate = new Date();
      
      // Generate a small number of showtimes for testing
      for (let day = 0; day < 2; day++) {
        const date = new Date(currentDate);
        date.setDate(date.getDate() + day);
        const dateString = date.toISOString().split('T')[0];
        
        for (const movie of moviesData.slice(0, 2)) { // Just use the first 2 movies
          for (const theater of theatersData.slice(0, 2)) { // Just use the first 2 theaters
            // Add a few showtimes per movie/theater combination
            const showtimes = [
              {
                movie_id: movie.id,
                theater_id: theater.id,
                date: dateString,
                time: '10:00 AM',
                format: 'standard',
                price: 200
              },
              {
                movie_id: movie.id,
                theater_id: theater.id,
                date: dateString,
                time: '6:00 PM',
                format: 'imax',
                price: 350
              }
            ];
            
            for (const showtime of showtimes) {
              const { error } = await supabase.from('showtimes').insert(showtime);
              if (error) {
                console.error('Error inserting showtime:', error);
              }
            }
          }
        }
      }
    }
    
    console.log('Database initialization completed successfully!');
  } catch (error) {
    console.error('Error initializing database:', error);
  }
}

// Run the initialization
initializeDatabase(); 