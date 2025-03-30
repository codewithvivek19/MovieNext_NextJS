"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { format } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChevronRight, Film, MapPin, CalendarDays, Clock, Ticket, Users, Loader2 } from "lucide-react"
import { toast } from "sonner"

interface Booking {
  id: number
  booking_reference: string
  seats: string
  total_price: number
  payment_method: string
  status: 'CONFIRMED' | 'PENDING' | 'CANCELLED'
  created_at: string
  showtime: {
    id: number
    date: string
    time: string
    format: string
    movie: {
      id: number
      title: string
      poster: string
    }
    theater: {
      id: number
      name: string
      location: string
    }
  }
}

export default function MyBookingsPage() {
  const router = useRouter()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("upcoming")

  useEffect(() => {
    async function fetchBookings() {
      try {
        setLoading(true)
        const response = await fetch("/api/bookings")
        
        if (!response.ok) {
          if (response.status === 401) {
            // Not authenticated
            router.push("/sign-in?returnUrl=/my-bookings")
            return
          }
          throw new Error("Failed to fetch bookings")
        }
        
        const data = await response.json()
        setBookings(data.bookings)
      } catch (err) {
        console.error("Error fetching bookings:", err)
        setError("Failed to load your bookings")
      } finally {
        setLoading(false)
      }
    }
    
    fetchBookings()
  }, [router])

  const parseSeats = (seatsJson: string) => {
    try {
      return JSON.parse(seatsJson)
    } catch (e) {
      return []
    }
  }

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMMM dd, yyyy")
    } catch (e) {
      return dateString
    }
  }

  const handleViewTicket = (bookingReference: string) => {
    router.push(`/booking-confirmation?id=${bookingReference}`)
  }

  // Filter bookings based on date
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const upcomingBookings = bookings.filter(booking => {
    const showDate = new Date(booking.showtime.date)
    return showDate >= today && booking.status !== 'CANCELLED'
  })
  
  const pastBookings = bookings.filter(booking => {
    const showDate = new Date(booking.showtime.date)
    return showDate < today || booking.status === 'CANCELLED'
  })

  const filteredBookings = activeTab === "upcoming" ? upcomingBookings : pastBookings

  if (loading) {
    return (
      <div className="container mx-auto py-10 text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto" />
        <p className="mt-2">Loading your bookings...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto py-10 text-center">
        <p className="text-red-500">{error}</p>
        <Button className="mt-4" onClick={() => router.push("/")}>
          Go back to home
        </Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">My Bookings</h1>
      
      <Tabs defaultValue="upcoming" onValueChange={setActiveTab}>
        <TabsList className="mb-8">
          <TabsTrigger value="upcoming">
            Upcoming ({upcomingBookings.length})
          </TabsTrigger>
          <TabsTrigger value="past">
            Past & Cancelled ({pastBookings.length})
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="upcoming" className="space-y-6">
          {upcomingBookings.length > 0 ? (
            upcomingBookings.map((booking) => (
              <BookingCard 
                key={booking.id} 
                booking={booking} 
                onViewTicket={handleViewTicket} 
              />
            ))
          ) : (
            <div className="text-center p-10 bg-muted rounded-lg">
              <p className="text-muted-foreground mb-4">You don't have any upcoming bookings</p>
              <Button onClick={() => router.push("/")}>Browse Movies</Button>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="past" className="space-y-6">
          {pastBookings.length > 0 ? (
            pastBookings.map((booking) => (
              <BookingCard 
                key={booking.id} 
                booking={booking} 
                onViewTicket={handleViewTicket} 
                isPast
              />
            ))
          ) : (
            <div className="text-center p-10 bg-muted rounded-lg">
              <p className="text-muted-foreground">No past bookings found</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

function BookingCard({ 
  booking, 
  onViewTicket,
  isPast = false 
}: { 
  booking: Booking, 
  onViewTicket: (reference: string) => void,
  isPast?: boolean
}) {
  const seats = typeof booking.seats === 'string' ? JSON.parse(booking.seats) : booking.seats
  
  const statusColor = {
    CONFIRMED: "bg-green-500",
    PENDING: "bg-yellow-500",
    CANCELLED: "bg-red-500"
  }[booking.status]
  
  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>{booking.showtime.movie.title}</CardTitle>
            <CardDescription>
              Booking Reference: {booking.booking_reference}
            </CardDescription>
          </div>
          <Badge variant={isPast || booking.status === 'CANCELLED' ? "outline" : "default"} className={booking.status === 'CANCELLED' ? "bg-red-100 text-red-800 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400" : ""}>
            {booking.status === 'CONFIRMED' ? (isPast ? "Completed" : "Confirmed") : booking.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pb-4">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <div className="md:col-span-1">
            <div className="relative aspect-[2/3] rounded-md overflow-hidden">
              <Image
                src={booking.showtime.movie.poster || "/placeholder.svg"}
                alt={booking.showtime.movie.title}
                fill
                className="object-cover"
              />
            </div>
          </div>
          <div className="md:col-span-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center">
                  <CalendarDays className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>{formatDate(booking.showtime.date)}</span>
                </div>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>{booking.showtime.time}</span>
                </div>
                <div className="flex items-center">
                  <Film className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>{booking.showtime.format}</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>{booking.showtime.theater.name}</span>
                </div>
                <div className="flex items-center">
                  <Ticket className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>
                    {Array.isArray(seats) 
                      ? seats.join(", ") 
                      : "No seats information"
                    }
                  </span>
                </div>
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>{Array.isArray(seats) ? seats.length : 0} tickets</span>
                </div>
              </div>
            </div>
            <Separator />
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-muted-foreground">Total Amount</p>
                <p className="font-semibold">${booking.total_price.toFixed(2)}</p>
              </div>
              <Button
                onClick={() => onViewTicket(booking.booking_reference)}
                variant={isPast ? "outline" : "default"}
              >
                View Ticket <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

