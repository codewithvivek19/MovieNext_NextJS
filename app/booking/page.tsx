"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Image from "next/image"
import { Clock, Calendar, MapPin, Film, CreditCard } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import { FIXED_SHOWTIMES, SEAT_PRICES, generateShowtimeId } from "@/app/constants/showtimes"

type SeatType = "standard" | "premium" | "vip"

interface Seat {
  id: string
  row: string
  number: number
  type: SeatType
  status: "available" | "selected" | "booked"
}

export default function BookingPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const movieId = searchParams.get("movie")
  const theaterId = searchParams.get("theater")
  const showtimeId = searchParams.get("showtime")
  const selectedDate = searchParams.get("date")
  const selectedTime = searchParams.get("time")

  const [seats, setSeats] = useState<Seat[]>([])
  const [selectedSeats, setSelectedSeats] = useState<Seat[]>([])
  const [movie, setMovie] = useState(null)
  const [theater, setTheater] = useState(null)
  const [showtime, setShowtime] = useState(null)
  const [loading, setLoading] = useState(true)
  
  // Fetch movie and theater data, and construct the showtime
  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      
      if (movieId) {
        try {
          // Fetch movie with cache busting
          const fetchedMovie = await fetch(`/api/public/movies/${movieId}`, {
            cache: 'no-store',
            headers: { 'Cache-Control': 'no-cache' }
          })
            .then(res => res.json())
            .then(data => data.movie)
          
          if (fetchedMovie) {
            setMovie(fetchedMovie)
          }
          
          // Fetch theater with cache busting
          if (theaterId) {
            const fetchedTheater = await fetch(`/api/public/theaters/${theaterId}`, {
              cache: 'no-store',
              headers: { 'Cache-Control': 'no-cache' }
            })
              .then(res => res.json())
              .then(data => data.theater)
            
            if (fetchedTheater) {
              setTheater(fetchedTheater)
            }
          }
          
          // If we have movieId, theaterId, and either showtimeId or time, create a showtime
          if (fetchedMovie && theaterId) {
            // If showtimeId is provided, try to fetch it, but don't fail if it doesn't exist
            if (showtimeId) {
              try {
                const fetchedShowtime = await fetch(`/api/public/showtimes/${showtimeId}`, {
                  cache: 'no-store',
                  headers: { 'Cache-Control': 'no-cache' }
                })
                  .then(res => res.json())
                  .then(data => data.showtime)
                
                if (fetchedShowtime) {
                  setShowtime(fetchedShowtime)
                  setLoading(false)
                  return
                }
              } catch (e) {
                console.log("Showtime fetch failed, creating from fixed showtimes")
              }
            }
            
            // Either no showtimeId, or fetch failed - use fixed showtimes
            const date = selectedDate ? new Date(selectedDate) : new Date()
            
            // Find the selected time in FIXED_SHOWTIMES or use the first one
            const fixedShowtime = selectedTime 
              ? FIXED_SHOWTIMES.find(st => st.time === selectedTime) || FIXED_SHOWTIMES[0]
              : FIXED_SHOWTIMES[0]
            
            // Generate showtime ID
            const generatedId = showtimeId ? parseInt(showtimeId) : 
              generateShowtimeId(movieId, theaterId, date.toISOString(), fixedShowtime.time)
            
            // Construct the showtime object
            const constructedShowtime = {
              id: generatedId,
              movieId: parseInt(movieId),
              theaterId: parseInt(theaterId),
              date: date.toISOString().split('T')[0],
              time: fixedShowtime.time,
              format: fixedShowtime.format,
              price: fixedShowtime.price,
              available_seats: fetchedTheater?.seating_capacity || 100,
              movie: fetchedMovie,
              theater: fetchedTheater
            }
            
            setShowtime(constructedShowtime)
          }
        } catch (err) {
          console.error("Error fetching data:", err)
          toast.error("Failed to load booking information. Please try again.")
        } finally {
          setLoading(false)
        }
      }
    }
    
    fetchData()
  }, [movieId, theaterId, showtimeId, selectedDate, selectedTime])

  useEffect(() => {
    // Generate seats
    const generatedSeats: Seat[] = []
    const rows = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"]
    const seatsPerRow = 12

    rows.forEach((row) => {
      for (let i = 1; i <= seatsPerRow; i++) {
        // Determine seat type based on row
        let type: SeatType = "standard"
        if (row === "A" || row === "B") {
          type = "vip"
        } else if (row === "C" || row === "D" || row === "E") {
          type = "premium"
        }

        // Randomly mark some seats as booked
        const status = Math.random() < 0.2 ? "booked" : "available"

        generatedSeats.push({
          id: `${row}${i}`,
          row,
          number: i,
          type,
          status,
        })
      }
    })

    setSeats(generatedSeats)
  }, [])

  const handleSeatClick = (clickedSeat: Seat) => {
    if (clickedSeat.status === "booked") return

    setSeats((prevSeats) =>
      prevSeats.map((seat) => {
        if (seat.id === clickedSeat.id) {
          const newStatus = seat.status === "available" ? "selected" : "available"
          return { ...seat, status: newStatus }
        }
        return seat
      }),
    )

    setSelectedSeats((prevSelected) => {
      if (prevSelected.some((seat) => seat.id === clickedSeat.id)) {
        return prevSelected.filter((seat) => seat.id !== clickedSeat.id)
      } else {
        return [...prevSelected, { ...clickedSeat, status: "selected" }]
      }
    })
  }

  const getSeatColor = (type: SeatType, status: string) => {
    if (status === "booked") return "bg-gray-300 dark:bg-gray-700 opacity-50 cursor-not-allowed"
    if (status === "selected") return "bg-green-500 text-white hover:bg-green-600"

    switch (type) {
      case "vip":
        return "bg-amber-100 hover:bg-amber-200 dark:bg-amber-900/70 dark:hover:bg-amber-800 border border-amber-300 dark:border-amber-700"
      case "premium":
        return "bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/70 dark:hover:bg-blue-800 border border-blue-300 dark:border-blue-700"
      default:
        return "bg-card hover:bg-muted border border-border"
    }
  }

  const calculateTotal = () => {
    return selectedSeats.reduce((total, seat) => {
      return total + SEAT_PRICES[seat.type]
    }, 0)
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return ""
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })
  }

  const handleCheckout = () => {
    // Validate selected seats
    if (!selectedSeats.length) {
      toast.error("Please select at least one seat");
      return;
    }

    if (!movie || !theater || !showtime) {
      toast.error("Missing booking information. Please try again.");
      return;
    }

    // Save booking details to session storage
    const bookingDetails = {
      movie: movie,
      theater: theater,
      showtime: showtime,
      date: selectedDate,
      seats: selectedSeats,
      total: calculateTotal(),
    }

    try {
      sessionStorage.setItem("bookingDetails", JSON.stringify(bookingDetails));
      router.push("/checkout");
    } catch (error) {
      console.error("Error saving booking details:", error);
      toast.error("An error occurred. Please try again.");
    }
  }

  if (loading || !movie || !theater || !showtime) {
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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <h1 className="text-3xl font-bold mb-6">Select Your Seats</h1>

          <div className="mb-8">
            <div className="w-full bg-muted h-8 rounded-t-lg flex items-center justify-center text-muted-foreground text-sm font-medium">
              SCREEN
            </div>
            <div className="w-full h-4 bg-gradient-to-b from-muted to-transparent mb-6"></div>

            <div className="mt-8 space-y-3">
              {Array.from(new Set(seats.map((seat) => seat.row))).map((row) => (
                <div key={row} className="flex items-center">
                  <div className="w-6 text-center text-sm font-medium mr-2">{row}</div>
                  <div className="flex gap-1 flex-wrap">
                    {seats
                      .filter((seat) => seat.row === row)
                      .map((seat) => (
                        <button
                          key={seat.id}
                          className={`h-8 w-8 rounded text-xs flex items-center justify-center transition-colors ${getSeatColor(seat.type, seat.status)}`}
                          onClick={() => handleSeatClick(seat)}
                          disabled={seat.status === "booked"}
                          aria-label={`Seat ${seat.id} ${seat.status}`}
                        >
                          {seat.number}
                        </button>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-8">
            <div className="flex items-center">
              <div className="h-4 w-4 rounded bg-card border mr-2"></div>
              <span className="text-sm">Standard</span>
            </div>
            <div className="flex items-center">
              <div className="h-4 w-4 rounded bg-blue-100 dark:bg-blue-900 mr-2"></div>
              <span className="text-sm">Premium</span>
            </div>
            <div className="flex items-center">
              <div className="h-4 w-4 rounded bg-amber-100 dark:bg-amber-900 mr-2"></div>
              <span className="text-sm">VIP</span>
            </div>
            <div className="flex items-center">
              <div className="h-4 w-4 rounded bg-green-500 mr-2"></div>
              <span className="text-sm">Selected</span>
            </div>
            <div className="flex items-center">
              <div className="h-4 w-4 rounded bg-gray-300 dark:bg-gray-700 opacity-50 mr-2"></div>
              <span className="text-sm">Booked</span>
            </div>
          </div>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Booking Summary</CardTitle>
              <CardDescription>{theater.name}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="relative w-20 h-28 overflow-hidden rounded">
                  <Image src={movie.poster || "/placeholder.svg"} alt={movie.title} fill className="object-cover" />
                </div>
                <div>
                  <h3 className="font-semibold">{movie.title}</h3>
                  <div className="flex items-center text-muted-foreground text-sm mt-1">
                    <Film size={14} className="mr-1" />
                    <span>{movie.language}</span>
                  </div>
                  <div className="flex items-center text-muted-foreground text-sm mt-1">
                    <Clock size={14} className="mr-1" />
                    <span>{movie.duration} min</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center">
                  <Calendar size={16} className="mr-2 text-muted-foreground" />
                  <span>{formatDate(selectedDate)}</span>
                </div>
                <div className="flex items-center">
                  <Clock size={16} className="mr-2 text-muted-foreground" />
                  <span>{showtime.time}</span>
                </div>
                <div className="flex items-center">
                  <MapPin size={16} className="mr-2 text-muted-foreground" />
                  <span>{theater.location}</span>
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="font-medium mb-2">Selected Seats ({selectedSeats.length})</h4>
                {selectedSeats.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {selectedSeats.map((seat) => (
                      <div key={seat.id} className="bg-muted px-2 py-1 rounded text-xs">
                        {seat.id}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No seats selected</p>
                )}
              </div>

              <Separator />

              <div className="space-y-2">
                {Object.keys(SEAT_PRICES).map((type) => {
                  const count = selectedSeats.filter((seat) => seat.type === type).length
                  if (count === 0) return null
                  return (
                    <div key={type} className="flex justify-between text-sm">
                      <span>
                        {type.charAt(0).toUpperCase() + type.slice(1)} ({count} × ₹{SEAT_PRICES[type as SeatType]})
                      </span>
                      <span>₹{count * SEAT_PRICES[type as SeatType]}</span>
                    </div>
                  )
                })}
                <div className="flex justify-between text-sm">
                  <span>Booking Fee</span>
                  <span>₹{selectedSeats.length > 0 ? 20 : 0}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span>₹{calculateTotal() + (selectedSeats.length > 0 ? 20 : 0)}</span>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleCheckout} disabled={selectedSeats.length === 0} className="w-full" size="lg">
                Proceed to Checkout
                <CreditCard size={16} className="ml-2" />
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}

