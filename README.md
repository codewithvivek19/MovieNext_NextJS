# Movie Ticket Booking App

This is a NextJS application for booking movie tickets.

## Database Setup

To initialize the database schema and load sample data:

1. **Set up environment variables**:
   Create a `.env.local` file with your Supabase credentials:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Run the database initialization script**:
   ```bash
   node scripts/supabase-init.js
   ```
   
   This script will:
   - Create all necessary database tables
   - Populate tables with sample data (movies, theaters, showtimes)

4. **Start the application**:
   ```bash
   npm run dev
   ```

5. **Log in as admin**:
   After running the app, go to `/admin/login` and use:
   - Username: `admin`
   - Password: `admin`

## Features

- Browse movies and theaters
- View movie details and showtimes
- Book tickets for movies
- Admin dashboard for managing movies, theaters, and showtimes

## Technologies Used

- Next.js 14+
- Supabase (PostgreSQL)
- TypeScript
- Tailwind CSS
- shadcn/ui components 