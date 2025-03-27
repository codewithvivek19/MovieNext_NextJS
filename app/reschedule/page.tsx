"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Image from "next/image"
import { Calendar, Clock, MapPin, Film, ArrowRight, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { getTheaterById, showtimes } from "@/lib/data"

export default function ReschedulePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const bookingId = searchParams.get("id")

  const [booking, setBooking] = useState<any>(null)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [selectedTheater, setSelectedTheater] = useState<number | null>(null)
  const [selectedShowtime, setSelectedShowtime] = useState<number | null>(null)
  const [openDialog, setOpenDialog] = useState(false)

  useEffect(() => {
    if (!bookingId) {
      router.push("/my-bookings")
      return
    }

    // Get booking details from localStorage
    const bookings = JSON.parse(localStorage.getItem("bookings") || "[]")
    const foundBooking = bookings.find((b: any) => b.id === bookingId)

    if (foundBooking && foundBooking.status !== "cancelled") {
      setBooking(foundBooking)
      setSelectedDate(foundBooking.date)
      setSelectedTheater(foundBooking.theater.id)
    } else {
      router.push("/my-bookings")
    }
  }, [bookingId, router])

  // Generate dates for the next 14 days
  const generateDates = () => {
    const dates = []
    const today = new Date()

    for (let i = 0; i < 14; i++) {
      const date = new Date()
      date.setDate(today.getDate() + i)
      dates.push(date.toISOString().split("T")[0])
    }

    return dates
  }

  const availableDates = generateDates()

  function formatDate(dateString: string) {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })
  }

  const handleReschedule = () => {
    if (!selectedDate || !selectedTheater || !selectedShowtime) return

    const updatedShowtime = showtimes.find((st) => st.id === selectedShowtime)
    const updatedTheater = getTheaterById(selectedTheater)

    if (!updatedShowtime || !updatedTheater) return

    setOpenDialog(true)
  }

  const confirmReschedule = () => {
    if (!booking || !selectedDate || !selectedTheater || !selectedShowtime) return

    const bookings = JSON.parse(localStorage.getItem("bookings") || "[]")
    const updatedShowtime = showtimes.find((st) => st.id === selectedShowtime)
    const updatedTheater = getTheaterById(selectedTheater)

    if (!updatedShowtime || !updatedTheater) return

    const updatedBookings = bookings.map((b: any) => {
      if (b.id === booking.id) {
        return {
          ...b,
          date: selectedDate,
          theater: updatedTheater,
          showtime: updatedShowtime,
        }
      }
      return b
    })

    localStorage.setItem("bookings", JSON.stringify(updatedBookings))
    router.push(`/booking-confirmation?id=${booking.id}`)
  }

  if (!booking) {
    return <div className="container mx-auto px-4 py-8 text-center">Loading...</div>
  }

  const isDateChanged = selectedDate !== booking.date
  const isTheaterChanged = selectedTheater !== booking.theater.id
  const isShowtimeChanged = selectedShowtime !== booking.showtime.id
  const hasChanges = isDateChanged || isTheaterChanged || isShowtimeChanged

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Reschedule Booking</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Current Booking</CardTitle>
              <CardDescription>Booking ID: {booking.id}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 mb-4">
                <div className="relative w-16 h-24 overflow-hidden rounded">
                  <Image
                    src={booking.movie.poster || "/placeholder.svg"}
                    alt={booking.movie.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <h3 className="font-semibold">{booking.movie.title}</h3>
                  <div className="flex items-center text-muted-foreground text-sm mt-1">
                    <Film size={14} className="mr-1" />
                    <span>{booking.movie.language}</span>
                  </div>
                  <div className="flex items-center text-muted-foreground text-sm mt-1">
                    <Clock size={14} className="mr-1" />
                    <span>{booking.movie.duration} min</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-muted rounded-lg p-3">
                  <div className="text-sm text-muted-foreground mb-1">Date</div>
                  <div className="flex items-center">
                    <Calendar size={16} className="mr-2" />
                    <span>{formatDate(booking.date)}</span>
                  </div>
                </div>
                <div className="bg-muted rounded-lg p-3">
                  <div className="text-sm text-muted-foreground mb-1">Time</div>
                  <div className="flex items-center">
                    <Clock size={16} className="mr-2" />
                    <span>{booking.showtime.time}</span>
                  </div>
                </div>
                <div className="bg-muted rounded-lg p-3">
                  <div className="text-sm text-muted-foreground mb-1">Theater</div>
                  <div className="flex items-center">
                    <MapPin size={16} className="mr-2" />
                    <span>{booking.theater.name}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Select New Schedule</CardTitle>
              <CardDescription>Choose a new date, theater, or showtime</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-3">Select Date</h3>

                <div className="flex overflow-x-auto gap-3 pb-2">
                  {availableDates.map((date) => (
                    <Button
                      key={date}
                      variant={selectedDate === date ? "default" : "outline"}
                      onClick={() => setSelectedDate(date)}
                      className="min-w-[120px]"
                    >
                      {formatDate(date)}
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">Select Theater</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    {
                      id: 1,
                      name: "Cineplex Downtown",
                      location: "123 Main St, Downtown",
                      rating: 4.5,
                    },
                    {
                      id: 2,
                      name: "Silver Screen Multiplex",
                      location: "456 Oak Ave, Westside",
                      rating: 4.2,
                    },
                    {
                      id: 3,
                      name: "Nova Cinema City",
                      location: "789 Pine Blvd, Eastside",
                      rating: 4.7,
                    },
                    {
                      id: 4,
                      name: "Grand Theater IMAX",
                      location: "101 Maple Dr, Northside",
                      rating: 4.8,
                    },
                  ].map((theater) => (
                    <Card
                      key={theater.id}
                      className={`cursor-pointer ${selectedTheater === theater.id ? "border-primary" : ""}`}
                      onClick={() => setSelectedTheater(theater.id)}
                    >
                      <CardContent className="p-4">
                        <div>
                          <h4 className="font-semibold">{theater.name}</h4>
                          <p className="text-sm text-muted-foreground">{theater.location}</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {selectedTheater && (
                <div>
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
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => router.push("/my-bookings")}>
                Cancel
              </Button>
              <Button
                onClick={handleReschedule}
                disabled={!selectedDate || !selectedTheater || !selectedShowtime || !hasChanges}
              >
                Reschedule
                <ArrowRight size={16} className="ml-2" />
              </Button>
            </CardFooter>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Changes Summary</CardTitle>
            </CardHeader>
            <CardContent>
              {!hasChanges ? (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>No changes selected</AlertTitle>
                  <AlertDescription>
                    Select a new date, theater, or showtime to reschedule your booking.
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="space-y-4">
                  {isDateChanged && (
                    <div>
                      <h4 className="text-sm font-medium">Date</h4>
                      <div className="flex items-center gap-4 mt-1">
                        <div className="flex-1">
                          <div className="text-sm text-muted-foreground">From</div>
                          <div>{formatDate(booking.date)}</div>
                        </div>
                        <ArrowRight size={16} />
                        <div className="flex-1">
                          <div className="text-sm text-muted-foreground">To</div>
                          <div>{selectedDate ? formatDate(selectedDate) : ""}</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {isTheaterChanged && (
                    <div>
                      <h4 className="text-sm font-medium">Theater</h4>
                      <div className="flex items-center gap-4 mt-1">
                        <div className="flex-1">
                          <div className="text-sm text-muted-foreground">From</div>
                          <div>{booking.theater.name}</div>
                        </div>
                        <ArrowRight size={16} />
                        <div className="flex-1">
                          <div className="text-sm text-muted-foreground">To</div>
                          <div>{selectedTheater ? getTheaterById(selectedTheater)?.name : ""}</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {isShowtimeChanged && (
                    <div>
                      <h4 className="text-sm font-medium">Showtime</h4>
                      <div className="flex items-center gap-4 mt-1">
                        <div className="flex-1">
                          <div className="text-sm text-muted-foreground">From</div>
                          <div>{booking.showtime.time}</div>
                        </div>
                        <ArrowRight size={16} />
                        <div className="flex-1">
                          <div className="text-sm text-muted-foreground">To</div>
                          <div>{selectedShowtime ? showtimes.find((st) => st.id === selectedShowtime)?.time : ""}</div>
                        </div>
                      </div>
                    </div>
                  )}

                  <Separator />

                  <div>
                    <h4 className="text-sm font-medium">Important Information</h4>
                    <ul className="mt-2 text-sm text-muted-foreground space-y-1">
                      <li>• Your seat selection will remain the same</li>
                      <li>• No additional fees for rescheduling</li>
                      <li>• Reschedule is allowed only once per booking</li>
                      <li>• Original ticket will be invalidated</li>
                    </ul>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <AlertDialog open={openDialog} onOpenChange={setOpenDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Reschedule</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to reschedule this booking? Your original ticket will be invalidated and a new one
              will be issued.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmReschedule}>Yes, reschedule</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

