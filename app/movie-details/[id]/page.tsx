// Find the section that displays the showtimes in the movie details page
// and add the following code to use fixed showtimes when none are available

// Import the fixed showtimes
import { FIXED_SHOWTIMES, generateShowtimeId } from "@/app/constants/showtimes";

// In the component that displays showtimes
const ShowtimesByTheater = ({ showtimes, movie, theaters, selectedDate, onShowtimeSelect }) => {
  // Group showtimes by theater
  const showtimesByTheater = {};
  
  if (showtimes && showtimes.length > 0) {
    // Process real showtimes from the database
    for (const showtime of showtimes) {
      if (!showtimesByTheater[showtime.theaterId]) {
        showtimesByTheater[showtime.theaterId] = [];
      }
      showtimesByTheater[showtime.theaterId].push(showtime);
    }
  } else {
    // If no showtimes found, use fixed showtimes for each theater
    for (const theater of theaters) {
      showtimesByTheater[theater.id] = FIXED_SHOWTIMES.map(st => ({
        id: generateShowtimeId(movie.id, theater.id, selectedDate, st.time),
        movieId: movie.id,
        theaterId: theater.id,
        date: selectedDate,
        time: st.time,
        format: st.format,
        price: st.price,
        theater: theater
      }));
    }
  }
  
  return (
    <div>
      {theaters.map((theater) => (
        <div key={theater.id} className="mb-8">
          <h3 className="text-xl font-semibold mb-2">{theater.name}</h3>
          <p className="text-sm text-muted-foreground mb-4">{theater.location}</p>
          
          <div className="flex flex-wrap gap-3 mb-4">
            {(showtimesByTheater[theater.id] || []).map((showtime) => (
              <button
                key={showtime.id || `${showtime.time}-${theater.id}`}
                onClick={() => onShowtimeSelect(showtime)}
                className="border rounded-md px-4 py-2 text-sm hover:bg-accent transition-colors"
              >
                {showtime.time}
                <span className="block text-xs text-muted-foreground mt-1">
                  {showtime.format.charAt(0).toUpperCase() + showtime.format.slice(1)} · ₹{showtime.price}
                </span>
              </button>
            ))}
            
            {(!showtimesByTheater[theater.id] || showtimesByTheater[theater.id].length === 0) && (
              <p className="text-sm text-muted-foreground">No showtimes available at this theater</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}; 