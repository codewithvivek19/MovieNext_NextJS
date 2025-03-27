const { PrismaClient } = require('@prisma/client');
const { hash } = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create admin user with hashed password
  const adminPassword = await hash('admin', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      first_name: 'Admin',
      last_name: 'User',
      is_admin: true,
      // Storing password field for possible future use
      // Note: The password field doesn't exist in the schema,
      // but we're keeping this code for reference in case you add it later
      // password: adminPassword
    },
  });

  console.log('Created admin user:', admin.email);

  // Create movies
  const movies = [
    {
      title: 'Avengers: Endgame',
      description: 'After the devastating events of Avengers: Infinity War, the universe is in ruins. With the help of remaining allies, the Avengers assemble once more in order to reverse Thanos\' actions and restore balance to the universe.',
      poster: 'https://m.media-amazon.com/images/M/MV5BMTc5MDE2ODcwNV5BMl5BanBnXkFtZTgwMzI2NzQ2NzM@._V1_.jpg',
      duration: 182,
      rating: 8.4,
      release_date: new Date('2019-04-26'),
      language: 'English',
      genres: JSON.stringify(['Action', 'Adventure', 'Drama']),
      cast: JSON.stringify([
        { name: 'Robert Downey Jr.', role: 'Tony Stark' },
        { name: 'Chris Evans', role: 'Steve Rogers' },
        { name: 'Mark Ruffalo', role: 'Bruce Banner' },
        { name: 'Chris Hemsworth', role: 'Thor' },
        { name: 'Scarlett Johansson', role: 'Natasha Romanoff' }
      ]),
    },
    {
      title: 'Kalki 2898 AD',
      description: 'Set in the future year of 2898 AD, the film blends mythology with sci-fi as it follows a modern-day avatar of the Hindu god Vishnu in a post-apocalyptic world.',
      poster: 'https://m.media-amazon.com/images/M/MV5BZTNlMjI0OTktOTYwOS00YWFhLThlYzktYjliNzBhOTJlZDkwXkEyXkFqcGdeQXVyMTU0ODI1NTA2._V1_.jpg',
      duration: 172,
      rating: 8.2,
      release_date: new Date('2024-06-27'),
      language: 'Telugu',
      genres: JSON.stringify(['Action', 'Sci-Fi', 'Fantasy']),
      cast: JSON.stringify([
        { name: 'Prabhas', role: 'Bhairava' },
        { name: 'Amitabh Bachchan', role: 'Ashwatthama' },
        { name: 'Kamal Haasan', role: 'Supreme Yaskin' },
        { name: 'Deepika Padukone', role: 'Sumathi' },
        { name: 'Disha Patani', role: 'Roxie' }
      ]),
    },
    {
      title: 'KGF: Chapter 2',
      description: 'In the blood-soaked Kolar Gold Fields, Rocky\'s name strikes fear into his foes. While his allies look up to him, the government sees him as a threat to law and order. Rocky must battle threats from all sides for unchallenged supremacy.',
      poster: 'https://m.media-amazon.com/images/M/MV5BZDNlNzBjMGUtYTA0Yy00OTI2LWJmZjMtODliYmUyYTI0OGFmXkEyXkFqcGdeQXVyODIwMDI1NjM@._V1_.jpg',
      duration: 168,
      rating: 8.2,
      release_date: new Date('2022-04-14'),
      language: 'Kannada',
      genres: JSON.stringify(['Action', 'Crime', 'Drama']),
      cast: JSON.stringify([
        { name: 'Yash', role: 'Rocky' },
        { name: 'Sanjay Dutt', role: 'Adheera' },
        { name: 'Raveena Tandon', role: 'Ramika Sen' },
        { name: 'Srinidhi Shetty', role: 'Reena' },
        { name: 'Prakash Raj', role: 'Vijayendra Ingalagi' }
      ]),
    },
    {
      title: 'Kantara',
      description: 'A small community living in the forest finds themselves on a collision course with divine forces as they defend their land and heritage from encroachers. The film explores the divine relationship between humans and nature.',
      poster: 'https://m.media-amazon.com/images/M/MV5BNjQzNDI2NTItNmU5MS00ZGVhLWFmNzItZWVkMGY4OTI1ZmQyXkEyXkFqcGdeQXVyMTQ3Mzk2MDg4._V1_.jpg',
      duration: 150,
      rating: 8.5,
      release_date: new Date('2022-09-30'),
      language: 'Kannada',
      genres: JSON.stringify(['Action', 'Adventure', 'Thriller']),
      cast: JSON.stringify([
        { name: 'Rishab Shetty', role: 'Shiva' },
        { name: 'Sapthami Gowda', role: 'Leela' },
        { name: 'Kishore', role: 'Muralidhar' },
        { name: 'Achyuth Kumar', role: 'Devendra' },
        { name: 'Pramod Shetty', role: 'Sudhakara' }
      ]),
    },
  ];

  for (const movie of movies) {
    const createdMovie = await prisma.movie.upsert({
      where: { id: 0 }, // This will always create a new movie since id is auto-incremented
      update: {},
      create: movie
    });
    console.log(`Created movie: ${createdMovie.title}`);
  }

  // Create theaters
  const theaters = [
    {
      name: 'PVR IMAX Orion Mall',
      location: 'Orion Mall, Brigade Gateway, Rajajinagar, Bangalore',
      rating: 4.6,
      seating_capacity: 180
    },
    {
      name: 'INOX Garuda Mall',
      location: 'Garuda Mall, Magrath Road, Ashok Nagar, Bangalore',
      rating: 4.3,
      seating_capacity: 150
    },
    {
      name: 'Cinepolis Forum Shantiniketan',
      location: 'Forum Shantiniketan Mall, Whitefield, Bangalore',
      rating: 4.5,
      seating_capacity: 200
    },
    {
      name: 'PVR 4DX Forum Mall',
      location: 'The Forum Mall, Koramangala, Bangalore',
      rating: 4.7,
      seating_capacity: 120
    },
    {
      name: 'INOX Brookefield Mall',
      location: 'Brookefield Mall, ITPL Main Road, Bangalore',
      rating: 4.4,
      seating_capacity: 160
    },
    {
      name: 'Urvashi Theatre',
      location: '80 Feet Road, Srinagar, Bangalore',
      rating: 4.2,
      seating_capacity: 300
    },
  ];

  for (const theater of theaters) {
    const createdTheater = await prisma.theater.upsert({
      where: { id: 0 }, // This will always create a new theater since id is auto-incremented
      update: {},
      create: theater
    });
    console.log(`Created theater: ${createdTheater.name}`);
  }

  // Get created movies and theaters
  const createdMovies = await prisma.movie.findMany();
  const createdTheaters = await prisma.theater.findMany();

  // Create showtimes
  console.log('Creating showtimes...');
  
  const currentDate = new Date();
  const formats = [
    { name: 'standard', times: ['10:00 AM', '4:00 PM'], priceRange: [200, 250] },
    { name: 'imax', times: ['1:00 PM'], priceRange: [300, 350] },
    { name: 'vip', times: ['7:00 PM'], priceRange: [450, 500] },
  ];

  // Generate showtimes for just 3 days to save space
  for (let day = 0; day < 3; day++) {
    const date = new Date(currentDate);
    date.setDate(date.getDate() + day);
    
    for (const movie of createdMovies) {
      for (const theater of createdTheaters) {
        // Create showtimes for all movies and theaters
        for (const format of formats) {
          // Add all time slots per format
          for (const time of format.times) {
            const price = Math.floor(Math.random() * (format.priceRange[1] - format.priceRange[0])) + format.priceRange[0];
            
            await prisma.showtime.create({
              data: {
                movie: {
                  connect: { id: movie.id }
                },
                theater: {
                  connect: { id: theater.id }
                },
                date: date,
                time: time,
                format: format.name,
                price: price,
                available_seats: theater.seating_capacity || 100
              }
            });
          }
        }
      }
    }
  }

  console.log('Database seeding completed!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 