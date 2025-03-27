'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Calendar, Clock, MapPin, Ticket, AlertCircle, Film } from 'lucide-react';
import { format } from 'date-fns';
import { getUserBookings } from '@/lib/api';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

type Booking = {
  id: string;
  movie: {
    id: string;
    title: string;
    poster_url: string;
  };
  theater: {
    id: string;
    name: string;
    location: string;
  };
  showtime: {
    id: string;
    start_time: string;
    end_time: string;
  };
  booking_reference: string;
  seats: string[];
  total_amount: number;
  created_at: string;
};

export default function BookingsPage() {
  const { isLoaded, isSignedIn, user } = useUser();
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoadingBookings, setIsLoadingBookings] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Redirect if not logged in
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push('/sign-in?redirect_url=/bookings');
    }
  }, [isLoaded, isSignedIn, router]);

  // Fetch bookings when user is loaded
  useEffect(() => {
    async function loadBookings() {
      if (!isSignedIn || !user) return;
      
      try {
        setIsLoadingBookings(true);
        const { data, error } = await getUserBookings(user.id);
        
        if (error) {
          throw new Error(error.message);
        }
        
        setBookings(data || []);
      } catch (err: any) {
        console.error('Error loading bookings:', err);
        setError(err.message || 'Failed to load your bookings');
      } finally {
        setIsLoadingBookings(false);
      }
    }

    if (isSignedIn && user) {
      loadBookings();
    }
  }, [isSignedIn, user]);

  if (!isLoaded || !isSignedIn) {
    return (
      <div className="container mx-auto px-4 py-16 flex justify-center items-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">My Bookings</h1>
        <p className="text-muted-foreground mt-2">View and manage your movie bookings</p>
      </div>

      {isLoadingBookings ? (
        <div className="flex justify-center my-12">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : error ? (
        <div className="bg-destructive/15 p-4 rounded-md flex items-center gap-3 text-destructive">
          <AlertCircle size={20} />
          <p>{error}</p>
        </div>
      ) : bookings.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
              <Ticket className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium mb-2">No bookings found</h3>
            <p className="text-muted-foreground mb-6">You haven't made any bookings yet</p>
            <Link href="/movies">
              <Button>Browse Movies</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {bookings.map((booking) => (
            <Card key={booking.id} className="overflow-hidden">
              <div className="flex flex-col md:flex-row">
                <div className="w-full md:w-1/4 h-48 md:h-auto relative bg-muted">
                  {booking.movie.poster_url ? (
                    <img
                      src={booking.movie.poster_url}
                      alt={booking.movie.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Film className="h-12 w-12 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <div className="flex-1 p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-xl font-semibold">{booking.movie.title}</h3>
                      <p className="text-muted-foreground text-sm">
                        Booking Ref: {booking.booking_reference}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-medium">
                        ${booking.total_amount.toFixed(2)}
                      </div>
                      <time className="text-sm text-muted-foreground">
                        {format(new Date(booking.created_at), 'PPP')}
                      </time>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin size={16} className="text-muted-foreground" />
                      <span>{booking.theater.name}, {booking.theater.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar size={16} className="text-muted-foreground" />
                      <span>{format(new Date(booking.showtime.start_time), 'EEEE, MMMM d, yyyy')}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Clock size={16} className="text-muted-foreground" />
                      <span>
                        {format(new Date(booking.showtime.start_time), 'h:mm a')} - 
                        {format(new Date(booking.showtime.end_time), 'h:mm a')}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Ticket size={16} className="text-muted-foreground" />
                      <span>{booking.seats.length} {booking.seats.length === 1 ? 'Seat' : 'Seats'}: {booking.seats.join(', ')}</span>
                    </div>
                  </div>
                  
                  <div className="mt-6 flex justify-end gap-3">
                    <Button variant="outline" size="sm">Download Ticket</Button>
                    <Button size="sm">View Details</Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
} 