"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { CalendarDays, Clock, Star, Film, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { getMovieById, parseMovieData, fetchTheaters, getShowtimesForMovie } from "@/lib/api-client"
import { Movie, Theater, Showtime } from "@/lib/api-client"

interface MovieDetailPageProps {
  movieId: string
}

export function MovieDetailClient({ movieId }: MovieDetailPageProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [movie, setMovie] = useState<Movie | null>(null)
  const [theaters, setTheaters] = useState<Theater[]>([])
  const [showtimes, setShowtimes] = useState<Showtime[]>([])
  const [selectedDate, setSelectedDate] = useState(getCurrentDate())
  const [selectedTheater, setSelectedTheater] = useState<number | null>(null)
  const [selectedShowtime, setSelectedShowtime] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Fetch movie and theaters on initial load
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)
        
        // Fetch the movie
        const fetchedMovie = await getMovieById(Number.parseInt(movieId))
        if (fetchedMovie) {
          setMovie(parseMovieData(fetchedMovie))
        } else {
          setError("Movie not found")
        }
        
        // Fetch theaters with cache control
        const fetchedTheaters = await fetchTheaters()
        setTheaters(fetchedTheaters)
        
        // Fetch showtimes with fresh data
        const currentDate = new Date(selectedDate);
        const formattedDate = currentDate.toISOString().split('T')[0];
        console.log("Fetching showtimes for date:", formattedDate);
        
        // Use direct fetch to bypass cache and ensure fresh data
        const response = await fetch(
          `/api/public/movies/${movieId}/showtimes?date=${formattedDate}`,
          { 
            cache: 'no-store',
            headers: {
              'Cache-Control': 'no-cache'
            }
          }
        );
        
        if (!response.ok) {
          throw new Error(`Failed to fetch showtimes for movie ${movieId}`);
        }
        
        const data = await response.json();
        setShowtimes(data.showtimes);
        
        // Reset selected theater and showtime when date changes
        setSelectedTheater(null)
        setSelectedShowtime(null)
      } catch (err) {
        console.error("Error loading movie data:", err)
        setError("Failed to load movie data")
      } finally {
        setLoading(false)
      }
    }
    
    loadData()
  }, [movieId, selectedDate])

  function getCurrentDate() {
    const today = new Date()
    return today.toISOString().split("T")[0]
  }

  // Generate dates for the next 7 days
  const dates = Array.from({ length: 7 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() + i)
    return date.toISOString().split("T")[0]
  })

  function formatDate(dateString: string) {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })
  }

  function handleBookTickets() {
    if (selectedTheater && selectedShowtime) {
      router.push(
        `/booking?movie=${movieId}&theater=${selectedTheater}&showtime=${selectedShowtime}&date=${selectedDate}`,
      )
    }
  }

  // Get list of theaters with showtimes for the selected date
  const theatersWithShowtimes = showtimes.length > 0 
    ? [...new Set(showtimes.map(st => st.theaterId))]
    : [];

  // Filter theaters to only show ones with showtimes for this movie on the selected date
  const availableTheaters = theaters.filter(theater => 
    theatersWithShowtimes.includes(theater.id)
  );

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <div className="animate-pulse">
          <div className="h-4 bg-muted rounded w-3/4 mx-auto"></div>
          <div className="h-4 bg-muted rounded w-1/2 mx-auto mt-4"></div>
          <div className="h-40 bg-muted rounded mt-8"></div>
        </div>
      </div>
    )
  }

  if (error || !movie) {
    return <div className="container mx-auto px-4 py-8 text-center">{error || "Movie not found"}</div>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        <div className="relative aspect-[2/3] rounded-lg overflow-hidden shadow-md">
          <Image src={movie.poster || "/placeholder.svg"} alt={movie.title} fill className="object-cover" priority />
        </div>
        <div className="md:col-span-2">
          <h1 className="text-4xl font-bold mb-3">{movie.title}</h1>

          <div className="flex flex-wrap gap-3 mb-4">
            {movie.genres && Array.isArray(movie.genres) && movie.genres.map((genre) => (
              <Badge key={genre} variant="outline">
                {genre}
              </Badge>
            ))}
          </div>

          <div className="flex items-center gap-6 mb-6 text-muted-foreground">
            <div className="flex items-center gap-1">
              <Star size={18} className="fill-amber-500 text-amber-500" />
              <span>{movie.rating}/10</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock size={18} />
              <span>{movie.duration} min</span>
            </div>
            <div className="flex items-center gap-1">
              <Film size={18} />
              <span>{movie.language}</span>
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2">Synopsis</h2>
            <p className="text-muted-foreground">{movie.description}</p>
          </div>

          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2">Cast</h2>
            <div className="flex flex-wrap gap-4">
              {movie.cast && Array.isArray(movie.cast) && movie.cast.map((actor) => (
                <div key={actor.name} className="text-center">
                  <div className="w-16 h-16 rounded-full bg-muted mb-1 overflow-hidden relative">
                    <Image src={`/placeholder.svg?height=64&width=64`} alt={actor.name} fill className="object-cover" />
                  </div>
                  <span className="text-sm block">{actor.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Book Tickets</h2>

        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <CalendarDays size={20} />
            Select Date
          </h3>

          <div className="flex overflow-x-auto gap-3 pb-2 scrollbar-hide">
            {dates.map((date) => {
              const isToday = date === dates[0]
              return (
                <Button
                  key={date}
                  variant={selectedDate === date ? "default" : "outline"}
                  onClick={() => setSelectedDate(date)}
                  className={`min-w-[120px] ${isToday ? "border-green-500 dark:border-green-700" : ""}`}
                >
                  {isToday && <span className="text-xs text-green-600 dark:text-green-500 mr-1">Today</span>}
                  {formatDate(date)}
                </Button>
              )
            })}
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">Select Theater</h3>

          {availableTheaters.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {availableTheaters.map((theater) => (
                <Card
                  key={theater.id}
                  className={`cursor-pointer ${selectedTheater === theater.id ? "border-primary" : ""}`}
                  onClick={() => setSelectedTheater(theater.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold">{theater.name}</h4>
                        <p className="text-sm text-muted-foreground">{theater.location}</p>
                      </div>
                      <div className="flex items-center text-amber-500">
                        <Star size={16} className="fill-amber-500" />
                        <span className="ml-1">{theater.rating}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="p-4 bg-muted rounded-lg text-center">
              <p className="text-muted-foreground">No theaters available for this date</p>
            </div>
          )}
        </div>

        {selectedTheater && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Select Showtime</h3>

            <Tabs defaultValue="standard">
              <TabsList className="mb-4">
                <TabsTrigger value="standard">Standard</TabsTrigger>
                <TabsTrigger value="imax">IMAX</TabsTrigger>
                <TabsTrigger value="vip">VIP</TabsTrigger>
              </TabsList>

              <TabsContent value="standard">
                <div className="flex flex-wrap gap-3">
                  {showtimes
                    .filter((st) => st.theaterId === selectedTheater && st.format === "standard")
                    .map((st) => (
                      <Button
                        key={st.id}
                        variant={selectedShowtime === st.id ? "default" : "outline"}
                        onClick={() => setSelectedShowtime(st.id)}
                      >
                        {st.time}
                      </Button>
                    ))}
                  {showtimes.filter((st) => st.theaterId === selectedTheater && st.format === "standard").length === 0 && (
                    <p className="text-muted-foreground py-2">No standard showtimes available for this date</p>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="imax">
                <div className="flex flex-wrap gap-3">
                  {showtimes
                    .filter((st) => st.theaterId === selectedTheater && st.format === "imax")
                    .map((st) => (
                      <Button
                        key={st.id}
                        variant={selectedShowtime === st.id ? "default" : "outline"}
                        onClick={() => setSelectedShowtime(st.id)}
                      >
                        {st.time}
                      </Button>
                    ))}
                  {showtimes.filter((st) => st.theaterId === selectedTheater && st.format === "imax").length === 0 && (
                    <p className="text-muted-foreground py-2">No IMAX showtimes available for this date</p>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="vip">
                <div className="flex flex-wrap gap-3">
                  {showtimes
                    .filter((st) => st.theaterId === selectedTheater && st.format === "vip")
                    .map((st) => (
                      <Button
                        key={st.id}
                        variant={selectedShowtime === st.id ? "default" : "outline"}
                        onClick={() => setSelectedShowtime(st.id)}
                      >
                        {st.time}
                      </Button>
                    ))}
                  {showtimes.filter((st) => st.theaterId === selectedTheater && st.format === "vip").length === 0 && (
                    <p className="text-muted-foreground py-2">No VIP showtimes available for this date</p>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        )}

        <Button
          size="lg"
          className="w-full md:w-auto"
          disabled={!selectedTheater || !selectedShowtime}
          onClick={handleBookTickets}
        >
          {!selectedTheater || !selectedShowtime ? (
            "Select theater and showtime"
          ) : (
            <>
              Book Tickets <ChevronRight size={16} className="ml-1" />
            </>
          )}
        </Button>
      </div>
    </div>
  )
}

export default function MovieDetailPage({ params }: { params: { id: string } }) {
  return <MovieDetailClient movieId={params.id} />
}

