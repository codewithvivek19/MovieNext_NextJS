"use client"

import { useState, useEffect, useRef } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Calendar, Clock, MapPin, Download, Share2, CheckCircle, TicketIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import QRCode from "qrcode"
import { jsPDF } from "jspdf"

export default function BookingConfirmationPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const bookingId = searchParams.get("id")
  const [booking, setBooking] = useState<any>(null)
  const [qrCodeUrl, setQrCodeUrl] = useState("")
  const qrCanvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!bookingId) {
      router.push("/")
      return
    }

    try {
      // Get booking details from localStorage
      const bookings = JSON.parse(localStorage.getItem("bookings") || "[]")
      const foundBooking = bookings.find((b: any) => b.id === bookingId)

      if (foundBooking) {
        // Parse string JSON fields if needed
        if (foundBooking.movie && typeof foundBooking.movie.genres === 'string') {
          try {
            foundBooking.movie.genres = JSON.parse(foundBooking.movie.genres)
          } catch (e) {
            console.error("Error parsing movie genres:", e)
          }
        }
        
        if (foundBooking.movie && typeof foundBooking.movie.cast === 'string') {
          try {
            foundBooking.movie.cast = JSON.parse(foundBooking.movie.cast)
          } catch (e) {
            console.error("Error parsing movie cast:", e)
          }
        }
        
        setBooking(foundBooking)

        // Generate QR code
        const bookingInfo = {
          id: foundBooking.id,
          movie: foundBooking.movie.title,
          date: foundBooking.date,
          time: foundBooking.showtime.time,
          theater: foundBooking.theater.name,
          seats: foundBooking.seats.map((s: any) => s.id).join(", "),
        }

        const qrData = JSON.stringify(bookingInfo)
        generateQRCode(qrData)
      } else {
        router.push("/")
      }
    } catch (err) {
      console.error("Error processing booking:", err)
      router.push("/")
    }
  }, [bookingId, router])

  const generateQRCode = async (data: string) => {
    try {
      const url = await QRCode.toDataURL(data, {
        width: 256,
        margin: 1,
        color: {
          dark: "#000000",
          light: "#ffffff",
        },
      })
      setQrCodeUrl(url)

      // Also render to canvas for PDF generation
      if (qrCanvasRef.current) {
        QRCode.toCanvas(qrCanvasRef.current, data, {
          width: 256,
          margin: 1,
        })
      }
    } catch (err) {
      console.error("Error generating QR code", err)
    }
  }

  const downloadTicket = () => {
    if (!booking) return

    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    })

    // Add title with better styling
    doc.setFontSize(24)
    doc.setFont("helvetica", "bold")
    doc.setTextColor(44, 62, 80) // Dark blue color
    doc.text("Movie Ticket", 105, 20, { align: "center" })

    // Add booking ID
    doc.setFontSize(12)
    doc.setFont("helvetica", "normal")
    doc.setTextColor(52, 73, 94) // Slightly lighter blue
    doc.text(`Booking ID: ${booking.id}`, 105, 30, { align: "center" })

    // Add movie details with better styling
    doc.setFontSize(18)
    doc.setFont("helvetica", "bold")
    doc.setTextColor(44, 62, 80)
    doc.text(booking.movie.title, 105, 45, { align: "center" })

    doc.setFontSize(12)
    doc.setFont("helvetica", "normal")
    doc.setTextColor(52, 73, 94)
    doc.text(`Language: ${booking.movie.language} | Duration: ${booking.movie.duration} min`, 105, 52, {
      align: "center",
    })

    // Add date, time, theater with better spacing
    doc.setFontSize(12)
    doc.text(
      `Date: ${new Date(booking.date).toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
      })}`,
      20,
      65,
    )
    doc.text(`Time: ${booking.showtime.time}`, 20, 72)
    doc.text(`Theater: ${booking.theater.name}`, 20, 79)
    doc.text(`Location: ${booking.theater.location}`, 20, 86)

    // Add seats
    doc.text(`Seats: ${booking.seats.map((s: any) => s.id).join(", ")}`, 20, 93)

    // Add total with emphasis
    doc.setFont("helvetica", "bold")
    doc.text(`Total Paid: $${booking.total + 2}`, 20, 100)

    // Add QR code with border
    if (qrCodeUrl) {
      // Add a light gray background rectangle
      doc.setDrawColor(200, 200, 200)
      doc.setFillColor(250, 250, 250)
      doc.roundedRect(65, 105, 80, 80, 3, 3, "FD")

      // Add the QR code
      doc.addImage(qrCodeUrl, "PNG", 70, 110, 70, 70)
      doc.setFont("helvetica", "normal")
      doc.setTextColor(52, 73, 94)
      doc.text("Scan this QR code at the theater", 105, 190, { align: "center" })
    }

    // Add footer with better styling
    doc.setFontSize(10)
    doc.setTextColor(127, 140, 141) // Gray color
    doc.text("Thank you for booking with us!", 105, 270, { align: "center" })
    doc.text("Please arrive 15 minutes before the showtime.", 105, 275, { align: "center" })

    // Save PDF
    doc.save(`movie-ticket-${booking.id}.pdf`)
  }

  if (!booking) {
    return <div className="container mx-auto px-4 py-8 text-center">Loading...</div>
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

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <TicketIcon size={24} />
              Movie Ticket
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-lg">{booking.movie.title}</h3>
                  <p className="text-muted-foreground">{booking.movie.language}</p>
                  <div className="flex items-center mt-1 text-sm text-muted-foreground">
                    <Clock size={14} className="mr-1" />
                    <span>{booking.movie.duration} min</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center">
                    <Calendar size={16} className="mr-3 text-muted-foreground" />
                    <span>
                      {new Date(booking.date).toLocaleDateString("en-US", {
                        weekday: "long",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <Clock size={16} className="mr-3 text-muted-foreground" />
                    <span>{booking.showtime.time}</span>
                  </div>
                  <div className="flex items-center">
                    <MapPin size={16} className="mr-3 text-muted-foreground" />
                    <span>
                      {booking.theater.name}, {booking.theater.location}
                    </span>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Seats</h4>
                  <div className="flex flex-wrap gap-2">
                    {booking.seats.map((seat: any) => (
                      <div key={seat.id} className="bg-muted px-2 py-1 rounded text-xs">
                        {seat.id}
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Booking Details</h4>
                  <div className="text-sm">
                    <div className="flex justify-between mb-1">
                      <span>Booking ID</span>
                      <span className="font-mono">{booking.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Paid</span>
                      <span>${booking.total + 2}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-center justify-center">
                {qrCodeUrl && (
                  <div className="text-center">
                    <div className="bg-white p-4 rounded-lg shadow-sm inline-block mb-3 border">
                      <img
                        src={qrCodeUrl || "/placeholder.svg"}
                        alt="Ticket QR Code"
                        width={200}
                        height={200}
                        className="rounded"
                      />
                    </div>
                    <p className="text-sm text-muted-foreground">Scan this QR code at the theater</p>
                  </div>
                )}
                <canvas ref={qrCanvasRef} className="hidden" />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between flex-wrap gap-2">
            <Button variant="outline" onClick={() => router.push("/my-bookings")}>
              My Bookings
            </Button>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: `Movie Ticket: ${booking.movie.title}`,
                      text: `I just booked tickets for ${booking.movie.title} at ${booking.theater.name} on ${new Date(booking.date).toLocaleDateString()}!`,
                      url: window.location.href,
                    })
                  }
                }}
              >
                <Share2 size={16} className="mr-2" />
                Share
              </Button>
              <Button onClick={downloadTicket}>
                <Download size={16} className="mr-2" />
                Download Ticket
              </Button>
            </div>
          </CardFooter>
        </Card>

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
      </div>
    </div>
  )
}

