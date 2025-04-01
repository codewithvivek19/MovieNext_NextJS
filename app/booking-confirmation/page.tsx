"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { CheckCircle, TicketIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { QRTicket } from "@/components/ticket-qr"
import { fetchWithAuth } from "@/lib/api-client"

export default function BookingConfirmationPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const bookingId = searchParams.get("id")
  const [booking, setBooking] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // If no booking ID, redirect to home
    if (!bookingId) {
      router.push("/")
      return
    }

    // Try to fetch the booking details
    const fetchBooking = async () => {
      setLoading(true)
      
      try {
        // First try to get from API if logged in
        try {
          const response = await fetchWithAuth(`/api/bookings/${bookingId}`)
          
          if (response.ok) {
            const data = await response.json()
            if (data.booking) {
              setBooking(data.booking)
              setLoading(false)
              return
            }
          }
        } catch (apiError) {
          console.log("Failed to fetch from API, trying local storage...")
        }
        
        // Fallback to localStorage
        const storedReference = localStorage.getItem("lastBookingReference")
        
        // If the current booking ID matches the stored reference, look for details in sessionStorage
        if (storedReference === bookingId) {
          const bookingDetailsStr = sessionStorage.getItem("bookingDetails")
          
          if (bookingDetailsStr) {
            const bookingDetails = JSON.parse(bookingDetailsStr)
            // Add the booking reference to the data
            bookingDetails.booking_reference = bookingId
            
            setBooking(bookingDetails)
            setLoading(false)
            return
          }
        }
        
        // If we get here, we couldn't find the booking
        setError("Booking not found")
      } catch (err) {
        console.error("Error fetching booking:", err)
        setError("Failed to load booking details")
      } finally {
        setLoading(false)
      }
    }

    fetchBooking()
  }, [bookingId, router])

  if (loading) {
    return (
      <div className="container mx-auto py-8 flex justify-center">
        <div className="animate-pulse space-y-4 w-full max-w-2xl">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="h-64 bg-muted rounded w-full"></div>
          <div className="h-32 bg-muted rounded w-full"></div>
        </div>
      </div>
    )
  }

  if (error || !booking) {
    return (
      <div className="container mx-auto py-8 text-center">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Booking Not Found</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>{error || "The booking information could not be found."}</p>
            <Button onClick={() => router.push("/my-bookings")}>View My Bookings</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 flex items-center mb-8">
          <CheckCircle className="text-green-600 dark:text-green-500 mr-3" />
          <div>
            <h2 className="font-semibold">Booking Confirmed!</h2>
            <p className="text-sm text-muted-foreground">Your tickets have been booked successfully.</p>
          </div>
        </div>

        {/* QR Ticket Component */}
        <div className="mb-8">
          <QRTicket bookingData={booking} />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Important Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p>• Please arrive at least 15 minutes before the showtime.</p>
            <p>• Bring a valid identity proof for verification.</p>
            <p>• Outside food and beverages are not allowed inside the theater.</p>
            <p>• Recording of the movie is strictly prohibited.</p>
            <p>• Cancellation or rescheduling is allowed up to 4 hours before the showtime.</p>
          </CardContent>
        </Card>

        <div className="mt-8 flex justify-center">
          <Button onClick={() => router.push("/my-bookings")}>View All My Bookings</Button>
        </div>
      </div>
    </div>
  )
}

