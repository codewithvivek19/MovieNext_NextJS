"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { CreditCard, Calendar, Clock, MapPin, CheckCircle2, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { toast } from "sonner"
import { fetchWithAuth } from "@/lib/api-client"

export default function CheckoutPage() {
  const router = useRouter()
  const [bookingDetails, setBookingDetails] = useState<any>(null)
  const [paymentMethod, setPaymentMethod] = useState("card")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    try {
      const details = sessionStorage.getItem("bookingDetails")
      if (details) {
        const parsedDetails = JSON.parse(details)
        
        // Ensure movie, theater and showtime data is properly parsed
        if (parsedDetails.movie && typeof parsedDetails.movie.genres === 'string') {
          try {
            parsedDetails.movie.genres = JSON.parse(parsedDetails.movie.genres)
          } catch (e) {
            console.error("Error parsing movie genres:", e)
          }
        }
        
        if (parsedDetails.movie && typeof parsedDetails.movie.cast === 'string') {
          try {
            parsedDetails.movie.cast = JSON.parse(parsedDetails.movie.cast)
          } catch (e) {
            console.error("Error parsing movie cast:", e)
          }
        }
        
        setBookingDetails(parsedDetails)
      } else {
        router.push("/")
      }
    } catch (err) {
      console.error("Error parsing booking details:", err)
      router.push("/")
    }
  }, [router])

  const handlePayment = async () => {
    setLoading(true)

    try {
      // Check for valid booking details
      if (!bookingDetails || !bookingDetails.showtime || !bookingDetails.seats || !Array.isArray(bookingDetails.seats)) {
        throw new Error('Invalid booking details. Please try again.');
      }

      // Prepare booking data
      const bookingData = {
        showtimeId: bookingDetails.showtime.id,
        seats: bookingDetails.seats.map((seat: any) => seat.id),
        totalPrice: bookingDetails.total,
        paymentMethod: paymentMethod
      }

      // Call the booking API with the authenticated helper
      const response = await fetchWithAuth('/api/bookings', {
        method: 'POST',
        body: JSON.stringify(bookingData),
      })

      const data = await response.json()

      if (!response.ok) {
        // Handle specific error cases
        if (response.status === 401) {
          router.push(`/sign-in?returnUrl=${encodeURIComponent('/checkout')}`);
          return;
        }
        throw new Error(data.error || 'Failed to create booking')
      }

      // Ensure we have a booking reference
      if (!data.booking || !data.booking.booking_reference) {
        throw new Error('Missing booking reference from server');
      }

      // Clear the session booking details
      sessionStorage.removeItem("bookingDetails")

      // Store the booking reference for the confirmation page
      localStorage.setItem("lastBookingReference", data.booking.booking_reference)

      toast.success('Booking successful!');
      
      // Navigate to success page
      router.push(`/booking-confirmation?id=${data.booking.booking_reference}`)
    } catch (error: any) {
      console.error('Payment processing error:', error)
      toast.error(error.message || 'Payment failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (!bookingDetails || !bookingDetails.movie || !bookingDetails.theater || !bookingDetails.showtime) {
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
      <h1 className="text-3xl font-bold mb-6">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Payment Method</CardTitle>
              <CardDescription>Select your preferred payment method</CardDescription>
            </CardHeader>
            <CardContent>
              <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                <div
                  className="flex items-center space-x-2 mb-4 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors cursor-pointer"
                  onClick={() => setPaymentMethod("card")}
                >
                  <RadioGroupItem value="card" id="card" />
                  <Label htmlFor="card" className="flex items-center cursor-pointer">
                    <CreditCard className="mr-2" size={18} />
                    Credit / Debit Card
                  </Label>
                </div>

                <div
                  className="flex items-center space-x-2 mb-4 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors cursor-pointer"
                  onClick={() => setPaymentMethod("paypal")}
                >
                  <RadioGroupItem value="paypal" id="paypal" />
                  <Label htmlFor="paypal" className="cursor-pointer">
                    PayPal
                  </Label>
                </div>

                <div
                  className="flex items-center space-x-2 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors cursor-pointer"
                  onClick={() => setPaymentMethod("applepay")}
                >
                  <RadioGroupItem value="applepay" id="applepay" />
                  <Label htmlFor="applepay" className="cursor-pointer">
                    Apple Pay
                  </Label>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>

          {paymentMethod === "card" && (
            <Card>
              <CardHeader>
                <CardTitle>Card Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <Label htmlFor="nameOnCard" className="flex items-center">
                      Name on Card <span className="text-red-500 ml-1">*</span>
                    </Label>
                    <Input id="nameOnCard" placeholder="John Doe" required className="mt-1" />
                  </div>

                  <div>
                    <Label htmlFor="cardNumber" className="flex items-center">
                      Card Number <span className="text-red-500 ml-1">*</span>
                    </Label>
                    <Input id="cardNumber" placeholder="1234 5678 9012 3456" required className="mt-1" />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="expiryDate">Expiry Date</Label>
                      <Input id="expiryDate" placeholder="MM/YY" />
                    </div>
                    <div>
                      <Label htmlFor="cvv">CVV</Label>
                      <Input id="cvv" placeholder="123" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Billing Address</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name</Label>
                  <Input id="firstName" />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input id="lastName" />
                </div>
              </div>

              <div>
                <Label htmlFor="address">Address</Label>
                <Input id="address" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input id="city" />
                </div>
                <div>
                  <Label htmlFor="state">State</Label>
                  <Input id="state" />
                </div>
                <div>
                  <Label htmlFor="zipCode">Zip Code</Label>
                  <Input id="zipCode" />
                </div>
              </div>

              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Booking Summary</CardTitle>
              <CardDescription>{bookingDetails.theater.name}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="relative w-20 h-28 overflow-hidden rounded">
                  <Image
                    src={bookingDetails.movie.poster || "/placeholder.svg"}
                    alt={bookingDetails.movie.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <h3 className="font-semibold">{bookingDetails.movie.title}</h3>
                  <div className="text-muted-foreground text-sm mt-1">{bookingDetails.movie.language}</div>
                  <div className="flex items-center text-muted-foreground text-sm mt-1">
                    <Clock size={14} className="mr-1" />
                    <span>{bookingDetails.movie.duration} min</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center">
                  <Calendar size={16} className="mr-2 text-muted-foreground" />
                  <span>
                    {new Date(bookingDetails.date).toLocaleDateString("en-US", {
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                </div>
                <div className="flex items-center">
                  <Clock size={16} className="mr-2 text-muted-foreground" />
                  <span>{bookingDetails.showtime.time}</span>
                </div>
                <div className="flex items-center">
                  <MapPin size={16} className="mr-2 text-muted-foreground" />
                  <span>{bookingDetails.theater.location}</span>
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="font-medium mb-2">Selected Seats ({bookingDetails.seats.length})</h4>
                <div className="flex flex-wrap gap-2">
                  {bookingDetails.seats.map((seat: any) => (
                    <div key={seat.id} className="bg-muted px-2 py-1 rounded text-xs">
                      {seat.id}
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                {Object.entries(
                  bookingDetails.seats.reduce((acc: any, seat: any) => {
                    acc[seat.type] = (acc[seat.type] || 0) + 1
                    return acc
                  }, {}),
                ).map(([type, count]: [string, any]) => (
                  <div key={type} className="flex justify-between text-sm">
                    <span>
                      {type.charAt(0).toUpperCase() + type.slice(1)} ({count} × ₹
                      {type === "standard" ? 10 : type === "premium" ? 15 : 20})
                    </span>
                    <span>₹{count * (type === "standard" ? 10 : type === "premium" ? 15 : 20)}</span>
                  </div>
                ))}
                <div className="flex justify-between text-sm">
                  <span>Booking Fee</span>
                  <span>₹2</span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span>₹{bookingDetails.total + 2}</span>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handlePayment} disabled={loading} className="w-full" size="lg">
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing Payment...
                  </>
                ) : (
                  <>
                    Pay ₹{bookingDetails.total + 2}
                    <CheckCircle2 size={16} className="ml-2" />
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}

