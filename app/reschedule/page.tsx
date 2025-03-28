"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Image from "next/image"
import { Calendar, Clock, MapPin, ArrowLeft, AlertCircle, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function ReschedulePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const bookingId = searchParams.get("id")

  const [booking, setBooking] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [availableShowtimes, setAvailableShowtimes] = useState<any[]>([])
  const [selectedShowtime, setSelectedShowtime] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<boolean>(false)

  // Get booking details from localStorage
  useEffect(() => {
    if (!bookingId) {
      setError("No booking ID provided")
      setIsLoading(false)
      return
    }

    const storedBookings = JSON.parse(localStorage.getItem("bookings") || "[]")
    const bookingToReschedule = storedBookings.find((b: any) => b.id === bookingId)

    if (!bookingToReschedule) {
      setError("Booking not found")
      setIsLoading(false)
      return
    }

    setBooking(bookingToReschedule)
    
    // Set initial date to the booking date
    const initialDate = new Date(bookingToReschedule.date)
    setSelectedDate(initialDate)
    
    setIsLoading(false)
  }, [bookingId])

  // Generate random showtimes when date changes
  useEffect(() => {
    if (!selectedDate) return
    
    // Generate 4-6 random showtimes for the selected date
    const count = Math.floor(Math.random() * 3) + 4
    const times = []
    
    // Common movie showtimes
    const baseShowtimes = ["10:00 AM", "12:30 PM", "3:00 PM", "5:30 PM", "8:00 PM", "10:30 PM"]
    
    for (let i = 0; i < count; i++) {
      const time = baseShowtimes[i]
      times.push({ id: `st-${Date.now()}-${i}`, time })
    }
    
    setAvailableShowtimes(times)
  }, [selectedDate])

  const handleReschedule = () => {
    if (!selectedDate || !selectedShowtime || !booking) {
      setError("Please select a date and showtime")
      return
    }

    // Format date to YYYY-MM-DD
    const formattedDate = selectedDate.toISOString().split("T")[0]
    
    // Find the selected showtime object
    const showtime = availableShowtimes.find(st => st.time === selectedShowtime)
    
    if (!showtime) {
      setError("Invalid showtime selected")
      return
    }

    // Update booking in localStorage
    const storedBookings = JSON.parse(localStorage.getItem("bookings") || "[]")
    const updatedBookings = storedBookings.map((b: any) => {
      if (b.id === bookingId) {
        return {
          ...b,
          date: formattedDate,
          showtime: { ...b.showtime, time: selectedShowtime }
        }
      }
      return b
    })

    localStorage.setItem("bookings", JSON.stringify(updatedBookings))
    
    // Show success message and redirect after a delay
    setSuccess(true)
    setTimeout(() => {
      router.push("/my-bookings")
    }, 2000)
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric"
    })
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/4 mx-auto mb-4"></div>
          <div className="h-64 bg-muted rounded max-w-md mx-auto"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive" className="max-w-md mx-auto">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <div className="text-center mt-6">
          <Button variant="outline" onClick={() => router.push("/my-bookings")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to My Bookings
          </Button>
        </div>
      </div>
    )
  }

  if (!booking) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p>Booking not found</p>
        <Button variant="outline" onClick={() => router.push("/my-bookings")} className="mt-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to My Bookings
        </Button>
      </div>
    )
  }

  if (success) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert className="max-w-md mx-auto bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
          <CheckCircle2 className="h-4 w-4 text-green-500" />
          <AlertTitle>Success!</AlertTitle>
          <AlertDescription>Your booking has been rescheduled successfully</AlertDescription>
        </Alert>
        <div className="text-center mt-6">
          <p className="text-sm text-muted-foreground mb-4">Redirecting to My Bookings...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-2 mb-6">
          <Button variant="outline" size="icon" onClick={() => router.push("/my-bookings")}>
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Button>
          <h1 className="text-3xl font-bold">Reschedule Booking</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Current Booking</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 mb-4">
                <div className="relative w-20 h-28 overflow-hidden rounded">
                  <Image
                    src={booking.movie.poster || "/placeholder.svg"}
                    alt={booking.movie.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <h3 className="font-semibold">{booking.movie.title}</h3>
                  <div className="space-y-1 mt-1">
                    <div className="flex items-center">
                      <Calendar size={14} className="mr-2 text-muted-foreground" />
                      <span>{new Date(booking.date).toLocaleDateString("en-US", {
                        weekday: "long",
                        month: "long",
                        day: "numeric"
                      })}</span>
                    </div>
                    <div className="flex items-center">
                      <Clock size={14} className="mr-2 text-muted-foreground" />
                      <span>{booking.showtime.time}</span>
                    </div>
                    <div className="flex items-center">
                      <MapPin size={14} className="mr-2 text-muted-foreground" />
                      <span>{booking.theater.name}</span>
                    </div>
                  </div>
                </div>
              </div>

              <Separator className="my-4" />

              <div>
                <span className="text-sm text-muted-foreground">Seats:</span>
                <span className="ml-2 text-sm">{booking.seats.map((s: any) => s.id).join(", ")}</span>
              </div>
            </CardContent>
          </Card>

          <div>
            <Card>
              <CardHeader>
                <CardTitle>Select New Date & Time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="mb-2 font-medium">Select Date</div>
                    <CalendarComponent
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      disabled={(date) => {
                        // Disable dates in the past and more than 2 weeks in the future
                        const today = new Date()
                        today.setHours(0, 0, 0, 0)
                        const maxDate = new Date()
                        maxDate.setDate(maxDate.getDate() + 14)
                        return date < today || date > maxDate
                      }}
                      className="border rounded-md"
                    />
                  </div>

                  {selectedDate && (
                    <div>
                      <div className="mb-2 font-medium">Select Time</div>
                      <div className="bg-muted/50 rounded-md p-4">
                        <div className="text-sm mb-3">{formatDate(selectedDate)}</div>
                        <RadioGroup value={selectedShowtime || ""} onValueChange={setSelectedShowtime}>
                          <div className="flex flex-wrap gap-2">
                            {availableShowtimes.map((st) => (
                              <div key={st.id} className="flex items-center space-x-2">
                                <RadioGroupItem value={st.time} id={st.id} className="peer sr-only" />
                                <Label
                                  htmlFor={st.id}
                                  className="px-3 py-2 rounded-md border bg-background peer-data-[state=checked]:bg-primary peer-data-[state=checked]:text-primary-foreground hover:bg-muted cursor-pointer"
                                >
                                  {st.time}
                                </Label>
                              </div>
                            ))}
                          </div>
                        </RadioGroup>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  onClick={handleReschedule}
                  disabled={!selectedDate || !selectedShowtime}
                  className="w-full"
                >
                  Confirm Reschedule
                </Button>
              </CardFooter>
            </Card>

            <div className="mt-4 text-sm text-muted-foreground">
              <p>Note: Your seat selection will remain the same. Rescheduling is subject to availability.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

