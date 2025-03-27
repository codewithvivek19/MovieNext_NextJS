-- Create movies table
CREATE TABLE IF NOT EXISTS movies (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  poster TEXT NOT NULL,
  duration INTEGER NOT NULL,
  rating DECIMAL(3, 1) NOT NULL,
  release_date DATE NOT NULL,
  language TEXT NOT NULL,
  genres TEXT[] NOT NULL,
  cast JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create theaters table
CREATE TABLE IF NOT EXISTS theaters (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  location TEXT NOT NULL,
  rating DECIMAL(3, 1) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create showtimes table
CREATE TABLE IF NOT EXISTS showtimes (
  id SERIAL PRIMARY KEY,
  movie_id INTEGER NOT NULL REFERENCES movies(id) ON DELETE CASCADE,
  theater_id INTEGER NOT NULL REFERENCES theaters(id) ON DELETE CASCADE,
  time TEXT NOT NULL,
  format TEXT NOT NULL CHECK (format IN ('standard', 'imax', 'vip')),
  price DECIMAL(10, 2) NOT NULL,
  date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  movie_id INTEGER NOT NULL REFERENCES movies(id) ON DELETE CASCADE,
  theater_id INTEGER NOT NULL REFERENCES theaters(id) ON DELETE CASCADE,
  showtime_id INTEGER NOT NULL REFERENCES showtimes(id) ON DELETE CASCADE,
  seats TEXT[] NOT NULL,
  total_price DECIMAL(10, 2) NOT NULL,
  booking_date TIMESTAMP WITH TIME ZONE NOT NULL,
  showtime_date DATE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('confirmed', 'cancelled', 'completed')),
  payment_status TEXT NOT NULL CHECK (payment_status IN ('pending', 'completed')),
  booking_reference TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create profiles table (for additional user information)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Set up Row Level Security (RLS) policies
-- Movies: public read access
ALTER TABLE movies ENABLE ROW LEVEL SECURITY;
CREATE POLICY movies_read_policy ON movies
  FOR SELECT USING (true);

-- Theaters: public read access
ALTER TABLE theaters ENABLE ROW LEVEL SECURITY;
CREATE POLICY theaters_read_policy ON theaters
  FOR SELECT USING (true);

-- Showtimes: public read access
ALTER TABLE showtimes ENABLE ROW LEVEL SECURITY;
CREATE POLICY showtimes_read_policy ON showtimes
  FOR SELECT USING (true);

-- Bookings: users can only see their own bookings
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
CREATE POLICY bookings_read_policy ON bookings
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY bookings_insert_policy ON bookings
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY bookings_update_policy ON bookings
  FOR UPDATE USING (auth.uid() = user_id);

-- Profiles: users can only access their own profiles
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY profiles_select_policy ON users
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY profiles_insert_policy ON users
  FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY profiles_update_policy ON users
  FOR UPDATE USING (auth.uid() = id);

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO users (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to call the function on user signup
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Create search indexes for better performance
CREATE INDEX idx_movies_title ON movies USING GIN (to_tsvector('english', title));
CREATE INDEX idx_theaters_name ON theaters USING GIN (to_tsvector('english', name));
CREATE INDEX idx_theaters_location ON theaters USING GIN (to_tsvector('english', location));
CREATE INDEX idx_bookings_reference ON bookings (booking_reference);
CREATE INDEX idx_showtimes_date ON showtimes (date);
CREATE INDEX idx_showtimes_movie_theater ON showtimes (movie_id, theater_id);

-- Create sample data for movies
INSERT INTO movies (title, description, poster, duration, rating, release_date, language, genres, cast)
VALUES
(
  'Avengers: Endgame',
  'After the devastating events of Avengers: Infinity War, the universe is in ruins. With the help of remaining allies, the Avengers assemble once more in order to reverse Thanos'' actions and restore balance to the universe.',
  'https://m.media-amazon.com/images/M/MV5BMTc5MDE2ODcwNV5BMl5BanBnXkFtZTgwMzI2NzQ2NzM@._V1_.jpg',
  182,
  8.4,
  '2019-04-26',
  'English',
  ARRAY['Action', 'Adventure', 'Drama'],
  '[
    {"name": "Robert Downey Jr.", "role": "Tony Stark"},
    {"name": "Chris Evans", "role": "Steve Rogers"},
    {"name": "Mark Ruffalo", "role": "Bruce Banner"},
    {"name": "Chris Hemsworth", "role": "Thor"},
    {"name": "Scarlett Johansson", "role": "Natasha Romanoff"}
  ]'::jsonb
),
(
  'Kalki 2898 AD',
  'Set in the future year of 2898 AD, the film blends mythology with sci-fi as it follows a modern-day avatar of the Hindu god Vishnu in a post-apocalyptic world.',
  'https://m.media-amazon.com/images/M/MV5BZTNlMjI0OTktOTYwOS00YWFhLThlYzktYjliNzBhOTJlZDkwXkEyXkFqcGdeQXVyMTU0ODI1NTA2._V1_.jpg',
  172,
  8.2,
  '2024-06-27',
  'Telugu',
  ARRAY['Action', 'Sci-Fi', 'Fantasy'],
  '[
    {"name": "Prabhas", "role": "Bhairava"},
    {"name": "Amitabh Bachchan", "role": "Ashwatthama"},
    {"name": "Kamal Haasan", "role": "Supreme Yaskin"},
    {"name": "Deepika Padukone", "role": "Sumathi"},
    {"name": "Disha Patani", "role": "Roxie"}
  ]'::jsonb
),
(
  'KGF: Chapter 2',
  'In the blood-soaked Kolar Gold Fields, Rocky''s name strikes fear into his foes. While his allies look up to him, the government sees him as a threat to law and order. Rocky must battle threats from all sides for unchallenged supremacy.',
  'https://m.media-amazon.com/images/M/MV5BZDNlNzBjMGUtYTA0Yy00OTI2LWJmZjMtODliYmUyYTI0OGFmXkEyXkFqcGdeQXVyODIwMDI1NjM@._V1_.jpg',
  168,
  8.2,
  '2022-04-14',
  'Kannada',
  ARRAY['Action', 'Crime', 'Drama'],
  '[
    {"name": "Yash", "role": "Rocky"},
    {"name": "Sanjay Dutt", "role": "Adheera"},
    {"name": "Raveena Tandon", "role": "Ramika Sen"},
    {"name": "Srinidhi Shetty", "role": "Reena"},
    {"name": "Prakash Raj", "role": "Vijayendra Ingalagi"}
  ]'::jsonb
),
(
  'Kantara',
  'A small community living in the forest finds themselves on a collision course with divine forces as they defend their land and heritage from encroachers. The film explores the divine relationship between humans and nature.',
  'https://m.media-amazon.com/images/M/MV5BNjQzNDI2NTItNmU5MS00ZGVhLWFmNzItZWVkMGY4OTI1ZmQyXkEyXkFqcGdeQXVyMTQ3Mzk2MDg4._V1_.jpg',
  150,
  8.5,
  '2022-09-30',
  'Kannada',
  ARRAY['Action', 'Adventure', 'Thriller'],
  '[
    {"name": "Rishab Shetty", "role": "Shiva"},
    {"name": "Sapthami Gowda", "role": "Leela"},
    {"name": "Kishore", "role": "Muralidhar"},
    {"name": "Achyuth Kumar", "role": "Devendra"},
    {"name": "Pramod Shetty", "role": "Sudhakara"}
  ]'::jsonb
);

-- Create sample data for theaters in Bangalore
INSERT INTO theaters (name, location, rating)
VALUES
(
  'PVR IMAX Orion Mall',
  'Orion Mall, Brigade Gateway, Rajajinagar, Bangalore',
  4.6
),
(
  'INOX Garuda Mall',
  'Garuda Mall, Magrath Road, Ashok Nagar, Bangalore',
  4.3
),
(
  'Cinepolis Forum Shantiniketan',
  'Forum Shantiniketan Mall, Whitefield, Bangalore',
  4.5
),
(
  'PVR 4DX Forum Mall',
  'The Forum Mall, Koramangala, Bangalore',
  4.7
),
(
  'INOX Brookefield Mall',
  'Brookefield Mall, ITPL Main Road, Bangalore',
  4.4
),
(
  'Urvashi Theatre',
  '80 Feet Road, Srinagar, Bangalore',
  4.2
);

-- Create sample showtimes for movies and theaters
-- For movie 1 (Avengers: Endgame) at theater 1 (PVR IMAX Orion Mall)
INSERT INTO showtimes (movie_id, theater_id, time, format, price, date)
VALUES
(1, 1, '10:00 AM', 'standard', 250.00, CURRENT_DATE),
(1, 1, '1:00 PM', 'standard', 250.00, CURRENT_DATE),
(1, 1, '4:00 PM', 'standard', 280.00, CURRENT_DATE),
(1, 1, '7:00 PM', 'standard', 300.00, CURRENT_DATE),
(1, 1, '10:00 PM', 'standard', 250.00, CURRENT_DATE),
(1, 1, '12:00 PM', 'imax', 350.00, CURRENT_DATE),
(1, 1, '3:30 PM', 'imax', 380.00, CURRENT_DATE),
(1, 1, '7:30 PM', 'imax', 420.00, CURRENT_DATE),
(1, 1, '6:00 PM', 'vip', 500.00, CURRENT_DATE),
(1, 1, '9:00 PM', 'vip', 550.00, CURRENT_DATE);

-- For movie 2 (Kalki 2898 AD) at theater 2 (INOX Garuda Mall)
INSERT INTO showtimes (movie_id, theater_id, time, format, price, date)
VALUES
(2, 2, '11:00 AM', 'standard', 220.00, CURRENT_DATE),
(2, 2, '2:00 PM', 'standard', 220.00, CURRENT_DATE),
(2, 2, '5:00 PM', 'standard', 250.00, CURRENT_DATE),
(2, 2, '8:00 PM', 'standard', 280.00, CURRENT_DATE),
(2, 2, '11:00 PM', 'standard', 220.00, CURRENT_DATE),
(2, 2, '1:00 PM', 'imax', 320.00, CURRENT_DATE),
(2, 2, '4:30 PM', 'imax', 350.00, CURRENT_DATE),
(2, 2, '8:30 PM', 'imax', 380.00, CURRENT_DATE),
(2, 2, '5:30 PM', 'vip', 450.00, CURRENT_DATE),
(2, 2, '8:45 PM', 'vip', 480.00, CURRENT_DATE);

-- For movie 3 (KGF: Chapter 2) at theater 3 (Cinepolis Forum Shantiniketan)
INSERT INTO showtimes (movie_id, theater_id, time, format, price, date)
VALUES
(3, 3, '10:30 AM', 'standard', 240.00, CURRENT_DATE),
(3, 3, '1:30 PM', 'standard', 240.00, CURRENT_DATE),
(3, 3, '4:30 PM', 'standard', 270.00, CURRENT_DATE),
(3, 3, '7:30 PM', 'standard', 300.00, CURRENT_DATE),
(3, 3, '10:30 PM', 'standard', 240.00, CURRENT_DATE),
(3, 3, '11:45 AM', 'imax', 340.00, CURRENT_DATE),
(3, 3, '3:15 PM', 'imax', 370.00, CURRENT_DATE),
(3, 3, '6:45 PM', 'imax', 400.00, CURRENT_DATE),
(3, 3, '10:15 PM', 'imax', 370.00, CURRENT_DATE),
(3, 3, '7:15 PM', 'vip', 480.00, CURRENT_DATE); 