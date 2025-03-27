-- Create movies table
CREATE TABLE IF NOT EXISTS public.movies (
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
CREATE TABLE IF NOT EXISTS public.theaters (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  location TEXT NOT NULL,
  rating DECIMAL(3, 1) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create showtimes table
CREATE TABLE IF NOT EXISTS public.showtimes (
  id BIGSERIAL PRIMARY KEY,
  movie_id BIGINT NOT NULL REFERENCES public.movies(id) ON DELETE CASCADE,
  theater_id BIGINT NOT NULL REFERENCES public.theaters(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  time TEXT NOT NULL,
  format TEXT NOT NULL,
  price INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY,
  first_name TEXT,
  last_name TEXT,
  email TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create bookings table
CREATE TABLE IF NOT EXISTS public.bookings (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  showtime_id BIGINT NOT NULL REFERENCES public.showtimes(id) ON DELETE CASCADE,
  seats TEXT[] NOT NULL,
  total_price INTEGER NOT NULL,
  booking_reference TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add RLS policies
ALTER TABLE public.movies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.theaters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.showtimes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Create policies for read access
CREATE POLICY "Allow public read access for movies" ON public.movies FOR SELECT USING (true);
CREATE POLICY "Allow public read access for theaters" ON public.theaters FOR SELECT USING (true);
CREATE POLICY "Allow public read access for showtimes" ON public.showtimes FOR SELECT USING (true);

-- Create policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Create policies for bookings
CREATE POLICY "Users can view their own bookings" ON public.bookings FOR SELECT USING (user_id = auth.uid()::text);
CREATE POLICY "Users can create their own bookings" ON public.bookings FOR INSERT WITH CHECK (user_id = auth.uid()::text);

-- Create policy for admins
CREATE POLICY "Admin has full access to all tables" ON public.movies FOR ALL USING (auth.uid() IN (SELECT id FROM auth.users WHERE email = 'admin@example.com'));
CREATE POLICY "Admin has full access to all tables" ON public.theaters FOR ALL USING (auth.uid() IN (SELECT id FROM auth.users WHERE email = 'admin@example.com'));
CREATE POLICY "Admin has full access to all tables" ON public.showtimes FOR ALL USING (auth.uid() IN (SELECT id FROM auth.users WHERE email = 'admin@example.com'));
CREATE POLICY "Admin has full access to all tables" ON public.profiles FOR ALL USING (auth.uid() IN (SELECT id FROM auth.users WHERE email = 'admin@example.com'));
CREATE POLICY "Admin has full access to all tables" ON public.bookings FOR ALL USING (auth.uid() IN (SELECT id FROM auth.users WHERE email = 'admin@example.com')); 