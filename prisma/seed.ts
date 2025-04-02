const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');
const prisma = new PrismaClient();

// Helper function to hash passwords with crypto
const hashPassword = (password) => {
  // Generate a random salt
  const salt = crypto.randomBytes(16).toString('hex');
  
  // Hash the password with the salt using SHA-256
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha256').toString('hex');
  
  // Return the salt and hash together
  return `${salt}:${hash}`;
};

async function main() {
  try {
    // Create admin user
    const adminPassword = await hashPassword('admin');
    await prisma.user.upsert({
      where: { email: 'admin@example.com' },
      update: {},
      create: {
        email: 'admin@example.com',
        password: adminPassword,
        first_name: 'Admin',
        last_name: 'User',
        role: 'ADMIN',
        is_admin: true,
      },
    });

    // Create regular user
    const userPassword = await hashPassword('password123');
    await prisma.user.upsert({
      where: { email: 'user@example.com' },
      update: {},
      create: {
        email: 'user@example.com',
        password: userPassword,
        first_name: 'Regular',
        last_name: 'User',
        role: 'USER',
        is_admin: false,
      },
    });

    // Add sample theaters
    const theaters = [
      {
        name: 'PVR Cinemas',
        location: 'Orion Mall, Bangalore',
        rating: 4.5,
        seating_capacity: 250,
        amenities: 'Dolby Atmos, Recliner Seats, Food Court',
      },
      {
        name: 'INOX Leisure',
        location: 'Phoenix Marketcity, Bangalore',
        rating: 4.3,
        seating_capacity: 200,
        amenities: 'IMAX, Premium Lounge, Valet Parking',
      },
      {
        name: 'Cinepolis',
        location: 'Forum Mall, Koramangala',
        rating: 4.2,
        seating_capacity: 180, 
        amenities: 'VIP Seating, 4DX Experience, Concierge',
      },
      {
        name: 'Urvashi Cinema',
        location: 'Lalbagh Road, Bangalore',
        rating: 3.8,
        seating_capacity: 300,
        amenities: 'Classic Theater, Budget-friendly, Snack Bar',
      },
    ];

    for (const theater of theaters) {
      await prisma.theater.upsert({
        where: { name: theater.name },
        update: theater,
        create: theater,
      });
    }

    // Add sample movies
    const movies = [
      {
        title: 'The Last Adventure',
        description: 'An epic journey across uncharted territories as a group of friends discover a hidden world beneath the ocean.',
        poster: 'https://placehold.co/300x450?text=The+Last+Adventure',
        duration: 142,
        rating: 4.7,
        release_date: new Date('2023-12-10'),
        language: 'English',
        genres: JSON.stringify(['Adventure', 'Fantasy', 'Action']),
        cast: JSON.stringify([
          { name: 'John Smith', role: 'Captain Alex' },
          { name: 'Emma Williams', role: 'Dr. Sarah Chen' },
          { name: 'Michael Davis', role: 'Lieutenant Jake' },
        ]),
      },
      {
        title: 'Midnight Shadows',
        description: 'A psychological thriller that follows a detective solving mysterious disappearances in a small town.',
        poster: 'https://placehold.co/300x450?text=Midnight+Shadows',
        duration: 118,
        rating: 4.5,
        release_date: new Date('2023-11-15'),
        language: 'English',
        genres: JSON.stringify(['Thriller', 'Mystery', 'Crime']),
        cast: JSON.stringify([
          { name: 'Robert Johnson', role: 'Detective Mike Harris' },
          { name: 'Jennifer Lee', role: 'Amanda Blake' },
          { name: 'David Wilson', role: 'Sheriff Thompson' },
        ]),
      },
      {
        title: 'Eternal Love',
        description: 'A heartwarming romance spanning across decades, following two lovers separated by fate but bound by destiny.',
        poster: 'https://placehold.co/300x450?text=Eternal+Love',
        duration: 135,
        rating: 4.8,
        release_date: new Date('2023-10-20'),
        language: 'Hindi',
        genres: JSON.stringify(['Romance', 'Drama']),
        cast: JSON.stringify([
          { name: 'Arjun Kapoor', role: 'Vikram' },
          { name: 'Deepika Sharma', role: 'Meera' },
          { name: 'Raj Malhotra', role: 'Rohan' },
        ]),
      },
      {
        title: 'Tech Revolution',
        description: 'A documentary exploring how technology has transformed human society over the past century.',
        poster: 'https://placehold.co/300x450?text=Tech+Revolution',
        duration: 95,
        rating: 4.3,
        release_date: new Date('2023-09-05'),
        language: 'English',
        genres: JSON.stringify(['Documentary', 'Science']),
        cast: JSON.stringify([
          { name: 'Dr. Sarah Johnson', role: 'Host' },
          { name: 'Elon Mask', role: 'Himself' },
          { name: 'Dr. Jane Chen', role: 'AI Expert' },
        ]),
      },
      {
        title: 'Laugh Out Loud',
        description: 'A hilarious comedy about a family vacation gone wrong, leading to unexpected adventures.',
        poster: 'https://placehold.co/300x450?text=Laugh+Out+Loud',
        duration: 105,
        rating: 4.1,
        release_date: new Date('2023-08-12'),
        language: 'English',
        genres: JSON.stringify(['Comedy', 'Family']),
        cast: JSON.stringify([
          { name: 'Kevin Hart', role: 'Dad' },
          { name: 'Amy Johnson', role: 'Mom' },
          { name: 'Jacob Wilson', role: 'Son' },
        ]),
      },
      {
        title: 'Galactic War',
        description: 'An intergalactic battle for the survival of humanity against alien invaders with advanced technology.',
        poster: 'https://placehold.co/300x450?text=Galactic+War',
        duration: 150,
        rating: 4.6,
        release_date: new Date('2023-12-25'),
        language: 'English',
        genres: JSON.stringify(['Sci-Fi', 'Action', 'Adventure']),
        cast: JSON.stringify([
          { name: 'Chris Evans', role: 'Commander James' },
          { name: 'Zoe Saldana', role: 'Lieutenant Nova' },
          { name: 'Mark Strong', role: 'Alien Leader Zorg' },
        ]),
      },
      {
        title: 'Mountain Peak',
        description: 'The harrowing journey of climbers attempting to conquer the deadliest mountain on Earth.',
        poster: 'https://placehold.co/300x450?text=Mountain+Peak',
        duration: 128,
        rating: 4.4,
        release_date: new Date('2023-11-30'),
        language: 'English',
        genres: JSON.stringify(['Adventure', 'Drama', 'Survival']),
        cast: JSON.stringify([
          { name: 'Tom Hardy', role: 'Lead Climber Alex' },
          { name: 'Jessica Chastain', role: 'Mountaineer Kate' },
          { name: 'Jason Momoa', role: 'Rescue Team Captain' },
        ]),
      },
      {
        title: 'Bollywood Dreams',
        description: 'A musical journey of a small-town girl aspiring to become a Bollywood star despite all odds.',
        poster: 'https://placehold.co/300x450?text=Bollywood+Dreams',
        duration: 160,
        rating: 4.7,
        release_date: new Date('2023-10-02'),
        language: 'Hindi',
        genres: JSON.stringify(['Musical', 'Drama', 'Romance']),
        cast: JSON.stringify([
          { name: 'Alia Bhatt', role: 'Simran' },
          { name: 'Ranveer Singh', role: 'Raj' },
          { name: 'Kareena Kapoor', role: 'Dance Mentor' },
        ]),
      }
    ];

    for (const movie of movies) {
      await prisma.movie.upsert({
        where: { title: movie.title },
        update: movie,
        create: movie,
      });
    }

    // Generate showtimes
    const allMovies = await prisma.movie.findMany();
    const allTheaters = await prisma.theater.findMany();

    // Define show formats and prices with updated price range
    const formats = [
      { format: 'standard', price: 150 },
      { format: 'premium', price: 180 },
      { format: 'imax', price: 200 },
      { format: 'vip', price: 220 }
    ];

    // Define show times in 12-hour format
    const times = ['10:00 AM', '1:00 PM', '4:00 PM', '7:00 PM', '10:00 PM'];

    // Create dates for the next 7 days with zeroed time component
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      date.setHours(0, 0, 0, 0); // Zero out time component
      dates.push(date);
    }

    // Create showtimes
    const showtimes = [];

    for (const theater of allTheaters) {
      for (const movie of allMovies) {
        // Each movie doesn't show in every theater
        if (Math.random() > 0.7) continue;
        
        for (const date of dates) {
          // Not all movies show every day
          if (Math.random() > 0.8) continue;
          
          // Choose 2-3 random times for each movie per day
          const shuffledTimes = [...times].sort(() => 0.5 - Math.random());
          const selectedTimes = shuffledTimes.slice(0, 2 + Math.floor(Math.random() * 2));
          
          for (const time of selectedTimes) {
            // Choose a random format
            const formatIndex = Math.floor(Math.random() * formats.length);
            const { format, price } = formats[formatIndex];
            
            // Calculate available seats (random for demo)
            const available_seats = Math.floor(Math.random() * 50) + 50;
            
            showtimes.push({
              theaterId: theater.id,
              movieId: movie.id,
              date,
              time,
              format,
              price,
              available_seats
            });
          }
        }
      }
    }

    // Batch insert showtimes
    await prisma.showtime.createMany({
      data: showtimes,
      skipDuplicates: true
    });

    console.log('Seed data created successfully');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 