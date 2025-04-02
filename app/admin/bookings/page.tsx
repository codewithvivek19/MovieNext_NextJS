"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Search, TicketPlus, Calendar, Clock, CreditCard, User, Film, MapPin, ChevronLeft, ChevronRight } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

interface Booking {
  id: number
  reference: string
  user: {
    id: string
    email: string
    name: string
  }
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
  seats: string[]
  date: string
  time: string
  format: string
  amount: number
  created_at: string
}

interface PaginationMeta {
  total: number
  page: number
  limit: number
  pages: number
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [pagination, setPagination] = useState<PaginationMeta>({
    total: 0,
    page: 1,
    limit: 10,
    pages: 1
  })
  const [error, setError] = useState<string | null>(null)

  // Fetch bookings data
  const fetchBookings = async (page = 1, search = "") => {
    try {
      setLoading(true)
      const response = await fetch(
        `/api/admin/bookings?page=${page}&limit=${pagination.limit}${search ? `&search=${search}` : ""}`
      )
      
      if (!response.ok) {
        throw new Error("Failed to fetch bookings")
      }
      
      const data = await response.json()
      setBookings(data.bookings)
      setPagination(data.meta)
    } catch (err) {
      console.error("Error fetching bookings:", err)
      setError("Failed to load bookings. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  // Initial data load
  useEffect(() => {
    fetchBookings()
  }, [])

  // Handle search
  const handleSearch = () => {
    fetchBookings(1, searchTerm)
  }

  // Handle page change
  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= pagination.pages) {
      fetchBookings(newPage, searchTerm)
    }
  }

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })
  }
  
  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', { 
      style: 'currency', 
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(amount / 100)
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Bookings</h1>
          <p className="text-muted-foreground">
            View and manage all bookings in the system
          </p>
        </div>
      </div>

      {/* Search and filters */}
      <div className="mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search by reference, movie, user..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyUp={(e) => e.key === "Enter" && handleSearch()}
                />
              </div>
              <Button onClick={handleSearch}>Search</Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bookings list */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TicketPlus className="h-5 w-5" />
            Booking Records
          </CardTitle>
          <CardDescription>
            Total {pagination.total} bookings in the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-8 text-center">
              <div className="animate-pulse space-y-3">
                <div className="h-4 bg-gray-200 rounded-lg mx-auto w-1/4"></div>
                <div className="h-4 bg-gray-200 rounded-lg mx-auto w-1/2"></div>
                <div className="h-4 bg-gray-200 rounded-lg mx-auto w-1/3"></div>
              </div>
            </div>
          ) : error ? (
            <div className="py-8 text-center text-red-500">{error}</div>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Booking Ref</TableHead>
                      <TableHead>Movie & Theater</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Date & Time</TableHead>
                      <TableHead>Seats</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Created</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bookings.map((booking) => (
                      <TableRow key={booking.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <TicketPlus className="h-4 w-4 text-primary" />
                            {booking.reference}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="relative w-10 h-14 rounded overflow-hidden bg-muted flex-shrink-0">
                              {booking.movie.poster ? (
                                <Image 
                                  src={booking.movie.poster} 
                                  alt={booking.movie.title}
                                  fill
                                  className="object-cover"
                                />
                              ) : (
                                <Film className="w-6 h-6 m-auto text-muted-foreground" />
                              )}
                            </div>
                            <div>
                              <div className="font-medium">{booking.movie.title}</div>
                              <div className="text-xs text-muted-foreground flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {booking.theater.name}
                              </div>
                              <div className="mt-1">
                                <Badge variant="outline">{booking.format}</Badge>
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <div>{booking.user.name || "User"}</div>
                              <div className="text-xs text-muted-foreground">{booking.user.email}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-1 text-sm">
                              <Calendar className="h-3 w-3 text-muted-foreground" />
                              {formatDate(booking.date)}
                            </div>
                            <div className="flex items-center gap-1 text-sm">
                              <Clock className="h-3 w-3 text-muted-foreground" />
                              {booking.time}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {booking.seats.map((seat) => (
                              <Badge key={seat} variant="secondary" className="text-xs">{seat}</Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 font-medium">
                            <CreditCard className="h-4 w-4 text-muted-foreground" />
                            {formatCurrency(booking.amount)}
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {formatDate(booking.created_at)}
                        </TableCell>
                      </TableRow>
                    ))}
                    
                    {bookings.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                          No bookings found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
              
              {/* Pagination */}
              {pagination.pages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-muted-foreground">
                    Showing page {pagination.page} of {pagination.pages}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={pagination.page === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                      // Show 5 pages max, centered around current page
                      let startPage = Math.max(1, pagination.page - 2);
                      const endPage = Math.min(pagination.pages, startPage + 4);
                      if (endPage - startPage < 4) {
                        startPage = Math.max(1, endPage - 4);
                      }
                      const pageNum = startPage + i;
                      return pageNum <= pagination.pages ? (
                        <Button
                          key={pageNum}
                          variant={pageNum === pagination.page ? "default" : "outline"}
                          size="sm"
                          onClick={() => handlePageChange(pageNum)}
                        >
                          {pageNum}
                        </Button>
                      ) : null;
                    })}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={pagination.page === pagination.pages}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 