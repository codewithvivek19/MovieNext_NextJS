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

// Define the SQL schema directly
const schemaSQL = `
-- Create movies table
CREATE TABLE IF NOT EXISTS movies (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  poster TEXT,
  duration INTEGER NOT NULL,
  rating DECIMAL(3, 1) NOT NULL,
  release_date DATE NOT NULL,
  language TEXT NOT NULL,
  genres TEXT[] NOT NULL,
  cast JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create theaters table
CREATE TABLE IF NOT EXISTS theaters (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  location TEXT NOT NULL,
  rating DECIMAL(3, 1) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create showtimes table
CREATE TABLE IF NOT EXISTS showtimes (
  id BIGSERIAL PRIMARY KEY,
  movie_id BIGINT NOT NULL,
  theater_id BIGINT NOT NULL,
  date DATE NOT NULL,
  time TEXT NOT NULL,
  format TEXT NOT NULL,
  price INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create profiles table (for users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY,
  first_name TEXT,
  last_name TEXT,
  email TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  showtime_id BIGINT NOT NULL,
  seats TEXT[] NOT NULL,
  total_price INTEGER NOT NULL,
  booking_reference TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
`;

// Movies data for insertion
const moviesSql = `
INSERT INTO movies (title, description, poster, duration, rating, release_date, language, genres, cast)
VALUES 
('Avengers: Endgame', 
 'After the devastating events of Avengers: Infinity War, the universe is in ruins. With the help of remaining allies, the Avengers assemble once more in order to reverse Thanos'' actions and restore balance to the universe.', 
 'https://m.media-amazon.com/images/M/MV5BMTc5MDE2ODcwNV5BMl5BanBnXkFtZTgwMzI2NzQ2NzM@._V1_.jpg', 
 182, 
 8.4, 
 '2019-04-26', 
 'English', 
 ARRAY['Action', 'Adventure', 'Drama'], 
 '[{"name": "Robert Downey Jr.", "role": "Tony Stark"}, {"name": "Chris Evans", "role": "Steve Rogers"}, {"name": "Mark Ruffalo", "role": "Bruce Banner"}, {"name": "Chris Hemsworth", "role": "Thor"}, {"name": "Scarlett Johansson", "role": "Natasha Romanoff"}]'::jsonb
),
('Kalki 2898 AD', 
 'Set in the future year of 2898 AD, the film blends mythology with sci-fi as it follows a modern-day avatar of the Hindu god Vishnu in a post-apocalyptic world.', 
 'https://m.media-amazon.com/images/M/MV5BZTNlMjI0OTktOTYwOS00YWFhLThlYzktYjliNzBhOTJlZDkwXkEyXkFqcGdeQXVyMTU0ODI1NTA2._V1_.jpg', 
 172, 
 8.2, 
 '2024-06-27', 
 'Telugu', 
 ARRAY['Action', 'Sci-Fi', 'Fantasy'], 
 '[{"name": "Prabhas", "role": "Bhairava"}, {"name": "Amitabh Bachchan", "role": "Ashwatthama"}, {"name": "Kamal Haasan", "role": "Supreme Yaskin"}, {"name": "Deepika Padukone", "role": "Sumathi"}, {"name": "Disha Patani", "role": "Roxie"}]'::jsonb
),
('KGF: Chapter 2', 
 'In the blood-soaked Kolar Gold Fields, Rocky''s name strikes fear into his foes. While his allies look up to him, the government sees him as a threat to law and order. Rocky must battle threats from all sides for unchallenged supremacy.', 
 'https://m.media-amazon.com/images/M/MV5BZDNlNzBjMGUtYTA0Yy00OTI2LWJmZjMtODliYmUyYTI0OGFmXkEyXkFqcGdeQXVyODIwMDI1NjM@._V1_.jpg', 
 168, 
 8.2, 
 '2022-04-14', 
 'Kannada', 
 ARRAY['Action', 'Crime', 'Drama'], 
 '[{"name": "Yash", "role": "Rocky"}, {"name": "Sanjay Dutt", "role": "Adheera"}, {"name": "Raveena Tandon", "role": "Ramika Sen"}, {"name": "Srinidhi Shetty", "role": "Reena"}, {"name": "Prakash Raj", "role": "Vijayendra Ingalagi"}]'::jsonb
),
('Kantara', 
 'A small community living in the forest finds themselves on a collision course with divine forces as they defend their land and heritage from encroachers. The film explores the divine relationship between humans and nature.', 
 'https://m.media-amazon.com/images/M/MV5BNjQzNDI2NTItNmU5MS00ZGVhLWFmNzItZWVkMGY4OTI1ZmQyXkEyXkFqcGdeQXVyMTQ3Mzk2MDg4._V1_.jpg', 
 150, 
 8.5, 
 '2022-09-30', 
 'Kannada', 
 ARRAY['Action', 'Adventure', 'Thriller'], 
 '[{"name": "Rishab Shetty", "role": "Shiva"}, {"name": "Sapthami Gowda", "role": "Leela"}, {"name": "Kishore", "role": "Muralidhar"}, {"name": "Achyuth Kumar", "role": "Devendra"}, {"name": "Pramod Shetty", "role": "Sudhakara"}]'::jsonb
);
`;

// Theaters data for insertion
const theatersSql = `
INSERT INTO theaters (name, location, rating)
VALUES 
('PVR IMAX Orion Mall', 'Orion Mall, Brigade Gateway, Rajajinagar, Bangalore', 4.6),
('INOX Garuda Mall', 'Garuda Mall, Magrath Road, Ashok Nagar, Bangalore', 4.3),
('Cinepolis Forum Shantiniketan', 'Forum Shantiniketan Mall, Whitefield, Bangalore', 4.5),
('PVR 4DX Forum Mall', 'The Forum Mall, Koramangala, Bangalore', 4.7),
('INOX Brookefield Mall', 'Brookefield Mall, ITPL Main Road, Bangalore', 4.4),
('Urvashi Theatre', '80 Feet Road, Srinagar, Bangalore', 4.2);
`;

// Function to generate insert statements for showtimes
function generateShowtimesSql() {
  const movieIds = [1, 2, 3, 4]; // Assuming these are the movie IDs
  const theaterIds = [1, 2, 3, 4, 5, 6]; // Assuming these are the theater IDs
  
  let sql = 'INSERT INTO showtimes (movie_id, theater_id, date, time, format, price) VALUES\n';
  let values = [];
  
  const currentDate = new Date();
  const formats = [
    { name: 'standard', times: ['10:00 AM', '1:00 PM', '4:00 PM', '7:00 PM', '10:00 PM'], priceRange: [200, 250] },
    { name: 'imax', times: ['12:00 PM', '3:30 PM', '7:30 PM'], priceRange: [300, 350] },
    { name: 'vip', times: ['6:00 PM', '9:00 PM'], priceRange: [450, 500] },
  ];
  
  // Generate showtimes for the next 7 days
  for (let day = 0; day < 7; day++) {
    const date = new Date(currentDate);
    date.setDate(date.getDate() + day);
    const dateString = date.toISOString().split('T')[0];
    
    // For just the first day, add a few showtimes to avoid generating too many at once
    // In a real scenario, you would handle this in batches
    if (day === 0) {
      for (const movieId of movieIds) {
        for (const theaterId of theaterIds) {
          for (const format of formats) {
            for (const time of format.times.slice(0, 2)) { // Take just the first 2 times
              const price = Math.floor(Math.random() * (format.priceRange[1] - format.priceRange[0])) + format.priceRange[0];
              values.push(`(${movieId}, ${theaterId}, '${dateString}', '${time}', '${format.name}', ${price})`);
            }
          }
        }
      }
    }
  }
  
  sql += values.join(',\n');
  return sql;
}

// Main function to initialize the database
async function initializeDatabase() {
  try {
    console.log('Initializing database...');
    
    // Split the schema SQL into separate statements
    const schemaStatements = schemaSQL.split(';').filter(stmt => stmt.trim());
    
    // Execute each schema statement separately
    for (const stmt of schemaStatements) {
      if (stmt.trim()) {
        console.log(`Executing schema statement: ${stmt.substring(0, 50)}...`);
        const { data, error } = await supabase.rpc('exec_sql', { sql: stmt.trim() + ';' }).catch(err => ({ error: err }));
        
        if (error) {
          console.error('Error executing schema statement:', error);
          console.log('Trying direct SQL instead...');
          
          // If RPC call fails, try direct SQL with REST API
          const { error: directError } = await supabase.rest.from('/rest/v1/').post({ query: stmt.trim() + ';' }).catch(err => ({ error: err }));
          
          if (directError) {
            console.error('Error with direct SQL as well:', directError);
            console.log('Continuing with the next statement...');
          }
        }
      }
    }
    
    // Insert movies
    console.log('Inserting movies...');
    const { error: moviesError } = await supabase.rpc('exec_sql', { sql: moviesSql }).catch(err => ({ error: err }));
    
    if (moviesError) {
      console.error('Error inserting movies:', moviesError);
    } else {
      console.log('Movies inserted successfully');
    }
    
    // Insert theaters
    console.log('Inserting theaters...');
    const { error: theatersError } = await supabase.rpc('exec_sql', { sql: theatersSql }).catch(err => ({ error: err }));
    
    if (theatersError) {
      console.error('Error inserting theaters:', theatersError);
    } else {
      console.log('Theaters inserted successfully');
    }
    
    // Insert showtimes
    console.log('Inserting showtimes...');
    const showtimesSql = generateShowtimesSql();
    const { error: showtimesError } = await supabase.rpc('exec_sql', { sql: showtimesSql }).catch(err => ({ error: err }));
    
    if (showtimesError) {
      console.error('Error inserting showtimes:', showtimesError);
    } else {
      console.log('Showtimes inserted successfully');
    }
    
    console.log('Database initialization completed!');
  } catch (error) {
    console.error('Error initializing database:', error);
  }
}

// Run the initialization
initializeDatabase(); 