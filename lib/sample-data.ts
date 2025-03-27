// Sample movie data for the application
export const sampleMovies = [
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
    ]
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
    ]
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
    ]
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
    ]
  },
  {
    title: 'Oppenheimer',
    description: 'The story of American scientist, J. Robert Oppenheimer, and his role in the development of the atomic bomb.',
    poster: 'https://m.media-amazon.com/images/M/MV5BMDBmYTZjNjUtN2M1MS00MTQ2LTk2ODgtNzc2M2QyZGE5NTVjXkEyXkFqcGdeQXVyNzAwMjU2MTY@._V1_.jpg',
    duration: 180,
    rating: 8.4,
    release_date: '2023-07-21',
    language: 'English',
    genres: ['Biography', 'Drama', 'History'],
    cast: [
      { name: 'Cillian Murphy', role: 'J. Robert Oppenheimer' },
      { name: 'Emily Blunt', role: 'Katherine Oppenheimer' },
      { name: 'Matt Damon', role: 'Leslie Groves' },
      { name: 'Robert Downey Jr.', role: 'Lewis Strauss' },
      { name: 'Florence Pugh', role: 'Jean Tatlock' }
    ]
  }
];

// Sample theater data for Bangalore
export const sampleTheaters = [
  {
    name: 'PVR IMAX Orion Mall',
    location: 'Orion Mall, Brigade Gateway, Rajajinagar, Bangalore',
    rating: 4.6
  },
  {
    name: 'INOX Garuda Mall',
    location: 'Garuda Mall, Magrath Road, Ashok Nagar, Bangalore',
    rating: 4.3
  },
  {
    name: 'Cinepolis Forum Shantiniketan',
    location: 'Forum Shantiniketan Mall, Whitefield, Bangalore',
    rating: 4.5
  },
  {
    name: 'PVR 4DX Forum Mall',
    location: 'The Forum Mall, Koramangala, Bangalore',
    rating: 4.7
  },
  {
    name: 'INOX Brookefield Mall',
    location: 'Brookefield Mall, ITPL Main Road, Bangalore',
    rating: 4.4
  },
  {
    name: 'Urvashi Theatre',
    location: '80 Feet Road, Srinagar, Bangalore',
    rating: 4.2
  }
];

// Function to generate showtimes for the next 7 days
export function generateShowtimes() {
  const showtimes = [];
  const formats = ['standard', 'imax', 'vip'];
  const startTimes = ['10:00 AM', '1:00 PM', '4:00 PM', '7:00 PM', '10:00 PM'];
  
  // Get movie IDs (1-5) and theater IDs (1-6)
  const movieIds = [1, 2, 3, 4, 5];
  const theaterIds = [1, 2, 3, 4, 5, 6];
  
  // Generate dates for the next 7 days
  const dates = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date();
    date.setDate(date.getDate() + i);
    dates.push(date.toISOString().split('T')[0]);
  }
  
  // Create showtimes for each movie at each theater for each date
  movieIds.forEach(movieId => {
    theaterIds.forEach(theaterId => {
      dates.forEach(date => {
        formats.forEach(format => {
          // Not all movies show in all formats at all theaters
          if (Math.random() > 0.3) {
            // Add 1-3 showtimes per format
            const numShowtimes = 1 + Math.floor(Math.random() * 3);
            const selectedTimes = startTimes
              .sort(() => 0.5 - Math.random())
              .slice(0, numShowtimes);
              
            selectedTimes.forEach(time => {
              // Calculate price based on format, time and randomness
              const basePrice = format === 'standard' ? 200 : format === 'imax' ? 350 : 450;
              const timeMultiplier = time.includes('PM') && !time.includes('1:00') ? 1.2 : 1;
              const randomVariation = 0.9 + Math.random() * 0.2;
              const price = Math.round((basePrice * timeMultiplier * randomVariation) / 10) * 10;
              
              showtimes.push({
                movie_id: movieId,
                theater_id: theaterId,
                date,
                time,
                format,
                price
              });
            });
          }
        });
      });
    });
  });
  
  return showtimes;
} 