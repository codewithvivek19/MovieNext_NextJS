"use client"

import { useEffect, useState, useRef } from "react"
import Image from "next/image"
import { format } from "date-fns"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, MapPin, Ticket, Download, Share2, Users } from "lucide-react"
import QRCode from "qrcode"
import { jsPDF } from "jspdf"

interface TicketProps {
  bookingData: {
    id: string
    booking_reference: string
    showtime: {
      date: string
      time: string
      format: string
      movie: {
        id: number
        title: string
        poster?: string
        duration?: number
        language?: string
      }
      theater: {
        id: number
        name: string
        location: string
      }
    }
    seats: string | string[] | any[]
    total_price: number
    payment_method?: string
    status?: string
  }
}

export function QRTicket({ bookingData }: TicketProps) {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("")
  const qrCanvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    generateQrCode()
  }, [])

  // Format date in a user-friendly way
  const formatDate = (dateStr: string) => {
    try {
      return format(new Date(dateStr), "EEEE, MMMM do, yyyy")
    } catch (error) {
      return dateStr
    }
  }

  // Parse seats if they're stored as a JSON string
  const getSeats = () => {
    if (!bookingData.seats) return []
    
    try {
      if (typeof bookingData.seats === 'string') {
        const parsed = JSON.parse(bookingData.seats)
        return Array.isArray(parsed) ? parsed : []
      }
      return Array.isArray(bookingData.seats) ? bookingData.seats : []
    } catch (error) {
      console.error("Error parsing seats:", error)
      return []
    }
  }

  // Format seats for display
  const formatSeats = () => {
    const seats = getSeats()
    if (Array.isArray(seats)) {
      if (seats.length === 0) return "No seats"
      
      // Handle both string[] and object[] with id property
      return seats.map(seat => typeof seat === 'string' ? seat : (seat.id || '')).join(", ")
    }
    return "No seats"
  }

  // Generate QR code with booking details
  const generateQrCode = async () => {
    try {
      const qrData = JSON.stringify({
        booking_reference: bookingData.booking_reference,
        movie: bookingData.showtime.movie.title,
        date: bookingData.showtime.date,
        time: bookingData.showtime.time,
        theater: bookingData.showtime.theater.name,
        seats: formatSeats(),
      })

      const url = await QRCode.toDataURL(qrData, {
        width: 200,
        margin: 1,
        color: {
          dark: "#000000",
          light: "#ffffff",
        },
      })
      
      setQrCodeUrl(url)
      
      // Render to canvas for PDF generation
      if (qrCanvasRef.current) {
        QRCode.toCanvas(qrCanvasRef.current, qrData, {
          width: 200,
          margin: 1,
        })
      }
    } catch (error) {
      console.error("Error generating QR code:", error)
    }
  }

  // Download ticket as PDF
  const downloadTicket = () => {
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a5",
    })

    // Add title
    doc.setFontSize(20)
    doc.setFont("helvetica", "bold")
    doc.text("Movie Ticket", 105, 15, { align: "center" })

    // Add booking reference
    doc.setFontSize(10)
    doc.setFont("helvetica", "normal")
    doc.text(`Booking: ${bookingData.booking_reference}`, 105, 22, { align: "center" })

    // Add movie details
    doc.setFontSize(16)
    doc.setFont("helvetica", "bold")
    doc.text(bookingData.showtime.movie.title, 105, 32, { align: "center" })

    // Add movie info if available
    if (bookingData.showtime.movie.language || bookingData.showtime.movie.duration) {
      doc.setFontSize(10)
      doc.setFont("helvetica", "normal")
      const movieInfo = [
        bookingData.showtime.movie.language,
        bookingData.showtime.movie.duration ? `${bookingData.showtime.movie.duration} min` : null,
        bookingData.showtime.format
      ].filter(Boolean).join(" | ")
      
      doc.text(movieInfo, 105, 38, { align: "center" })
    }

    // Add date, time, theater
    doc.setFontSize(11)
    doc.setFont("helvetica", "normal")
    doc.text(`Date: ${formatDate(bookingData.showtime.date)}`, 20, 48)
    doc.text(`Time: ${bookingData.showtime.time}`, 20, 54)
    doc.text(`Theater: ${bookingData.showtime.theater.name}`, 20, 60)
    doc.text(`Location: ${bookingData.showtime.theater.location}`, 20, 66)
    doc.text(`Seats: ${formatSeats()}`, 20, 72)
    doc.text(`Amount Paid: $${bookingData.total_price.toFixed(2)}`, 20, 78)

    // Add QR code
    if (qrCodeUrl) {
      doc.addImage(qrCodeUrl, "PNG", 70, 85, 60, 60)
      doc.setFontSize(10)
      doc.text("Scan this QR code at the theater", 105, 155, { align: "center" })
    }

    // Add footer
    doc.setFontSize(8)
    doc.text("Please arrive 15 minutes before the showtime.", 105, 170, { align: "center" })

    // Save PDF
    doc.save(`movie-ticket-${bookingData.booking_reference}.pdf`)
  }

  // Handle sharing ticket
  const shareTicket = () => {
    if (navigator.share) {
      navigator.share({
        title: `Movie Ticket: ${bookingData.showtime.movie.title}`,
        text: `I just booked tickets for ${bookingData.showtime.movie.title} at ${bookingData.showtime.theater.name}!`,
        url: window.location.href,
      }).catch(err => console.error("Error sharing:", err))
    }
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-primary/5 py-3">
        <CardTitle className="flex items-center gap-2 text-xl">
          <Ticket size={20} />
          Movie Ticket
          <span className="ml-auto text-sm font-normal text-muted-foreground">
            #{bookingData.booking_reference}
          </span>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-5">
            <div>
              <h3 className="font-semibold text-xl">{bookingData.showtime.movie.title}</h3>
              {bookingData.showtime.movie.language && (
                <p className="text-muted-foreground text-sm">{bookingData.showtime.movie.language}</p>
              )}
              {bookingData.showtime.format && (
                <span className="bg-primary/10 text-primary text-xs px-2 py-0.5 rounded-full mt-1 inline-block">
                  {bookingData.showtime.format}
                </span>
              )}
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center text-sm">
                <Calendar size={16} className="mr-2 text-muted-foreground" />
                <span>{formatDate(bookingData.showtime.date)}</span>
              </div>
              
              <div className="flex items-center text-sm">
                <Clock size={16} className="mr-2 text-muted-foreground" />
                <span>{bookingData.showtime.time}</span>
              </div>
              
              <div className="flex items-center text-sm">
                <MapPin size={16} className="mr-2 text-muted-foreground" />
                <span>{bookingData.showtime.theater.name}</span>
                <span className="text-muted-foreground ml-1 text-xs">
                  ({bookingData.showtime.theater.location})
                </span>
              </div>
              
              <div className="flex items-center text-sm">
                <Users size={16} className="mr-2 text-muted-foreground" />
                <span>
                  {formatSeats()}
                </span>
              </div>
            </div>
            
            <div className="border-t border-dashed pt-3 mt-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Amount Paid:</span>
                <span className="font-medium">${bookingData.total_price.toFixed(2)}</span>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col items-center justify-center">
            {qrCodeUrl ? (
              <div className="text-center">
                <div className="bg-white p-3 rounded-lg shadow-sm inline-block mb-2 border">
                  <img 
                    src={qrCodeUrl} 
                    alt="Ticket QR Code" 
                    width={150} 
                    height={150}
                    className="rounded"
                  />
                </div>
                <p className="text-xs text-muted-foreground">Scan this code at the theater entrance</p>
              </div>
            ) : (
              <div className="animate-pulse bg-muted h-32 w-32 rounded-lg"></div>
            )}
            <canvas ref={qrCanvasRef} className="hidden" />
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="bg-muted/50 py-3 px-6 flex justify-between">
        <Button variant="outline" size="sm" onClick={shareTicket} className="h-8">
          <Share2 size={14} className="mr-1" /> Share
        </Button>
        <Button size="sm" onClick={downloadTicket} className="h-8">
          <Download size={14} className="mr-1" /> Download
        </Button>
      </CardFooter>
    </Card>
  )
} 