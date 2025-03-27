"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Calendar, Clock, MapPin, TicketIcon, FileEdit, Trash2, AlertCircle, Eye } from "lucide-react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
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
import { Badge } from "@/components/ui/badge"

export default function MyBookingsPage() {
  const router = useRouter()
  const [bookings, setBookings] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [openDialog, setOpenDialog] = useState(false)
  const [bookingToCancel, setBookingToCancel] = useState<string | null>(null)

  useEffect(() => {
    // Get bookings from localStorage
    const storedBookings = JSON.parse(localStorage.getItem("bookings") || "[]")
    setBookings(storedBookings)
    setIsLoading(false)
  }, [])

  const cancelBooking = (bookingId: string) => {
    setBookingToCancel(bookingId)
    setOpenDialog(true)
  }

  const confirmCancelBooking = () => {
    if (!bookingToCancel) return

    const updatedBookings = bookings.map((booking) => {
      if (booking.id === bookingToCancel) {
        return { ...booking, status: "cancelled" }
      }
      return booking
    })

    setBookings(updatedBookings)
    localStorage.setItem("bookings", JSON.stringify(updatedBookings))
    setOpenDialog(false)
    setBookingToCancel(null)
  }

  const getActiveBookings = () => {
    return bookings.filter((booking) => booking.status !== "cancelled")
  }

  const getCancelledBookings = () => {
    return bookings.filter((booking) => booking.status === "cancelled")
  }

  const canReschedule = (date: string) => {
    const bookingDate = new Date(date)
    const now = new Date()
    // Check if booking is in the future
    return bookingDate > now
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    })
  }

  const isPastBooking = (dateString: string) => {
    const bookingDate = new Date(dateString)
    const now = new Date()
    return bookingDate < now
  }

  if (isLoading) {
    return <div className="container mx-auto px-4 py-8 text-center">Loading your bookings...</div>
  }

  if (bookings.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-lg mx-auto">
          <CardHeader>
            <CardTitle className="text-center">No Bookings Found</CardTitle>
          </CardHeader>
          <CardContent className="text-center py-8">
            <div className="mx-auto w-16 h-16 text-muted-foreground mb-4">
              <TicketIcon size={64} />
            </div>
            <p className="text-muted-foreground mb-4">You don't have any movie bookings yet.</p>
            <Button asChild>
              <Link href="/">Browse Movies</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">My Bookings</h1>

      <Tabs defaultValue="active" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="active">Active Bookings</TabsTrigger>
          <TabsTrigger value="cancelled">Cancelled Bookings</TabsTrigger>
        </TabsList>

        <TabsContent value="active">
          {getActiveBookings().length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-muted-foreground">No active bookings found.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {getActiveBookings().map((booking) => (
                <Card key={booking.id} className={isPastBooking(booking.date) ? "border-muted" : ""}>
                  {isPastBooking(booking.date) && (
                    <div className="bg-muted w-full text-center py-1 text-xs">COMPLETED</div>
                  )}
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-xl">{booking.movie.title}</CardTitle>
                      <Badge variant={isPastBooking(booking.date) ? "outline" : "default"}>{booking.id}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="flex gap-4 mb-3">
                      <div className="relative w-16 h-24 overflow-hidden rounded">
                        <Image
                          src={booking.movie.poster || "/placeholder.svg"}
                          alt={booking.movie.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <div className="space-y-1">
                          <div className="flex items-center">
                            <Calendar size={14} className="mr-2 text-muted-foreground" />
                            <span>{formatDate(booking.date)}</span>
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

                    <Separator className="my-3" />

                    <div className="flex justify-between">
                      <div>
                        <span className="text-sm text-muted-foreground">Seats:</span>
                        <span className="ml-2 text-sm">{booking.seats.map((s: any) => s.id).join(", ")}</span>
                      </div>
                      <div>
                        <span className="text-sm font-semibold">${booking.total + 2}</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="pt-2">
                    <div className="flex justify-between w-full">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push(`/booking-confirmation?id=${booking.id}`)}
                      >
                        <Eye size={16} className="mr-2" />
                        View
                      </Button>
                      <div className="flex gap-2">
                        {!isPastBooking(booking.date) && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={!canReschedule(booking.date)}
                              onClick={() => router.push(`/reschedule?id=${booking.id}`)}
                            >
                              <FileEdit size={16} className="mr-2" />
                              Reschedule
                            </Button>
                            <Button variant="destructive" size="sm" onClick={() => cancelBooking(booking.id)}>
                              <Trash2 size={16} className="mr-2" />
                              Cancel
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="cancelled">
          {getCancelledBookings().length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-muted-foreground">No cancelled bookings found.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {getCancelledBookings().map((booking) => (
                <Card key={booking.id} className="border-muted">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-xl text-muted-foreground">{booking.movie.title}</CardTitle>
                      <Badge variant="outline">{booking.id}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="flex gap-4 mb-3">
                      <div className="relative w-16 h-24 overflow-hidden rounded opacity-50">
                        <Image
                          src={booking.movie.poster || "/placeholder.svg"}
                          alt={booking.movie.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="text-muted-foreground">
                        <div className="space-y-1">
                          <div className="flex items-center">
                            <Calendar size={14} className="mr-2" />
                            <span>{formatDate(booking.date)}</span>
                          </div>
                          <div className="flex items-center">
                            <Clock size={14} className="mr-2" />
                            <span>{booking.showtime.time}</span>
                          </div>
                          <div className="flex items-center">
                            <MapPin size={14} className="mr-2" />
                            <span>{booking.theater.name}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <Separator className="my-3" />

                    <div className="flex justify-between text-muted-foreground">
                      <div>
                        <span className="text-sm">Seats:</span>
                        <span className="ml-2 text-sm">{booking.seats.map((s: any) => s.id).join(", ")}</span>
                      </div>
                      <div>
                        <span className="text-sm">${booking.total + 2}</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="pt-2">
                    <div className="w-full">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <AlertCircle size={14} className="mr-2" />
                        <span>This booking was cancelled</span>
                      </div>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <AlertDialog open={openDialog} onOpenChange={setOpenDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Booking</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel this booking? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>No, keep it</AlertDialogCancel>
            <AlertDialogAction onClick={confirmCancelBooking}>Yes, cancel booking</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

