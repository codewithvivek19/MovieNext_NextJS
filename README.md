# MovieNext - Movie Ticket Booking Application

MovieNext is a modern web application built with Next.js, Prisma, and PostgreSQL for booking movie tickets online. The application provides a seamless experience for users to browse movies, select showtimes, book tickets, and manage their bookings.

## Features

- **User Authentication**: Secure login and registration system
- **Movie Browsing**: View all available movies with details and trailers
- **Theater Selection**: Choose from multiple theaters
- **Seat Selection**: Interactive seat selection interface
- **Booking Management**: View, reschedule, or cancel bookings
- **Admin Dashboard**: Manage movies, theaters, showtimes, and users
- **Responsive Design**: Works on mobile, tablet, and desktop devices

## Tech Stack

- **Frontend**: Next.js, React, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL
- **Authentication**: JWT (JSON Web Tokens)
- **State Management**: React Context API
- **Styling**: Tailwind CSS

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or pnpm
- PostgreSQL database

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/codewithvivek19/MovieNext_NextJS.git
   cd MovieNext_NextJS
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   pnpm install
   ```

3. Set up environment variables:
   Create a `.env` file in the root directory with the following content:
   ```
   DATABASE_URL="postgresql://username:password@localhost:5432/movienext"
   JWT_SECRET="your-secret-jwt-key"
   ```

4. Run database migrations:
   ```bash
   npx prisma migrate dev
   ```

5. Seed the database:
   ```bash
   npm run db:seed
   # or
   pnpm db:seed
   ```

6. Start the development server:
   ```bash
   npm run dev
   # or
   pnpm dev
   ```

7. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

### Admin Access

To access the admin dashboard, use the following credentials:
- Email: admin@example.com
- Password: admin123

## Project Structure

```
/app                  # Next.js app router
  /admin              # Admin pages
  /api                # API routes
  /booking            # Booking pages
  ...
/components           # Reusable components
/lib                  # Utility functions and services
/prisma               # Prisma schema and migrations
/public               # Static assets
```

## API Routes

- `/api/public/*` - Public endpoints for movies, theaters, showtimes
- `/api/admin/*` - Admin-only endpoints (protected)

## License

MIT License

## Contact

For any questions or feedback, please contact:
- GitHub: [codewithvivek19](https://github.com/codewithvivek19) 