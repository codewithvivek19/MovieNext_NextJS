const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

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

// Helper function to generate showtimes
const generateShowtimes = async (moviesData, theatersData) => {
  if (!moviesData || !theatersData || moviesData.length === 0 || theatersData.length === 0) {
    throw new Error('Movies or theaters data is missing');
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
            date: dateString,
            time,
            format: 'standard',
            price: Math.floor(Math.random() * 50) + 200, // Random price between 200-250
          });
        });
        
        // IMAX format (premium pricing)
        ['12:00 PM', '3:30 PM', '7:30 PM'].forEach(time => {
          showtimes.push({
            movie_id: movie.id,
            theater_id: theater.id,
            date: dateString,
            time,
            format: 'imax',
            price: Math.floor(Math.random() * 50) + 300, // Random price between 300-350
          });
        });
        
        // VIP format (luxury experience)
        ['6:00 PM', '9:00 PM'].forEach(time => {
          showtimes.push({
            movie_id: movie.id,
            theater_id: theater.id,
            date: dateString,
            time,
            format: 'vip',
            price: Math.floor(Math.random() * 50) + 450, // Random price between 450-500
          });
        });
      }
    }
  }
  
  return showtimes;
};

async function initializeDatabase() {
  try {
    // Read and execute the SQL schema
    console.log('Creating database schema...');
    const schemaSQL = fs.readFileSync('./scripts/create-schema.sql', 'utf8');
    
    // Split the SQL into separate statements
    const statements = schemaSQL.split(';').filter(stmt => stmt.trim());
    
    // Execute each statement separately
    for (const stmt of statements) {
      if (stmt.trim()) {
        const { error } = await supabase.rpc('exec_sql', { sql: stmt + ';' });
        if (error) {
          console.error('Error executing SQL statement:', error);
          console.log('Trying to continue with the rest of the script...');
        }
      }
    }
    
    console.log('Schema created successfully');
    
    // Insert movies
    console.log('Inserting movies...');
    const { data: moviesData, error: moviesError } = await supabase
      .from('movies')
      .upsert(movies)
      .select();
    
    if (moviesError) {
      console.error('Error inserting movies:', moviesError);
      return;
    }
    
    console.log(`Inserted ${moviesData.length} movies successfully`);
    
    // Insert theaters
    console.log('Inserting theaters...');
    const { data: theatersData, error: theatersError } = await supabase
      .from('theaters')
      .upsert(theaters)
      .select();
    
    if (theatersError) {
      console.error('Error inserting theaters:', theatersError);
      return;
    }
    
    console.log(`Inserted ${theatersData.length} theaters successfully`);
    
    // Generate and insert showtimes
    console.log('Generating showtimes...');
    try {
      const showtimes = await generateShowtimes(moviesData, theatersData);
      console.log(`Generated ${showtimes.length} showtimes`);
      
      // Insert in batches to avoid hitting rate limits
      const batchSize = 100;
      for (let i = 0; i < showtimes.length; i += batchSize) {
        const batch = showtimes.slice(i, i + batchSize);
        const { error: showtimesError } = await supabase
          .from('showtimes')
          .upsert(batch);
        
        if (showtimesError) {
          console.error(`Error inserting showtimes batch ${i / batchSize + 1}:`, showtimesError);
        } else {
          console.log(`Inserted showtimes batch ${i / batchSize + 1} successfully`);
        }
      }
      
      console.log('Database initialization completed successfully!');
    } catch (error) {
      console.error('Error generating showtimes:', error);
    }
  } catch (error) {
    console.error('Error initializing database:', error);
  }
}

// Run the initialization
initializeDatabase(); 