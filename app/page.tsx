"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowRight, MapPin, Star, ShieldCheck } from "lucide-react"
import MovieCard from "@/components/movie-card"
import { Button } from "@/components/ui/button"
import { fetchMovies, fetchTheaters } from "@/lib/api-client"
import { Movie, Theater } from "@/lib/api-client"

export default function HomePage() {
  const [movies, setMovies] = useState<Movie[]>([])
  const [theaters, setTheaters] = useState<Theater[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)
        const [movieData, theaterData] = await Promise.all([
          fetchMovies(),
          fetchTheaters()
        ])
        
        setMovies(movieData)
        setTheaters(theaterData)
      } catch (error) {
        console.error("Error loading homepage data:", error)
      } finally {
        setLoading(false)
      }
    }
    
    loadData()
  }, [])

  // Placeholder skeletons for loading state
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <section className="relative mb-12 bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg overflow-hidden">
          <div className="container px-4 py-12 md:py-16">
            <div className="max-w-2xl">
              <div className="h-12 bg-muted rounded w-3/4 mb-4"></div>
              <div className="h-6 bg-muted rounded w-full mb-6"></div>
              <div className="flex gap-3">
                <div className="h-10 bg-muted rounded w-32"></div>
                <div className="h-10 bg-muted rounded w-32"></div>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <div className="h-8 bg-muted rounded w-40"></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array(4).fill(0).map((_, i) => (
              <div key={i} className="bg-card rounded-lg overflow-hidden shadow-sm">
                <div className="aspect-[2/3] bg-muted"></div>
                <div className="p-4">
                  <div className="h-6 bg-muted rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-muted rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <section className="relative mb-12 bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg overflow-hidden">
        <div className="container px-4 py-12 md:py-16">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Book Your Movie Tickets Online</h1>
            <p className="text-xl text-muted-foreground mb-6">
              Get the best seats for the latest movies at your favorite theaters in Bangalore
            </p>
            <div className="flex flex-wrap gap-3">
              <Button size="lg" asChild>
                <Link href="/movies">Browse Movies</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/theaters">Find Theaters</Link>
              </Button>
              <Button size="lg" variant="secondary" asChild className="flex items-center gap-1">
                <Link href="/admin/login">
                  <ShieldCheck size={16} className="mr-1" />
                  Admin Access
                </Link>
              </Button>
            </div>
          </div>
        </div>
        <div className="hidden md:block absolute right-0 bottom-0 w-1/3 h-full opacity-10">
          <div className="relative w-full h-full">
            <div className="absolute right-0 bottom-0 w-64 h-64 rounded-full bg-primary/30 -mr-10 -mb-10"></div>
            <div className="absolute right-20 bottom-20 w-32 h-32 rounded-full bg-primary/40"></div>
            <div className="absolute right-40 bottom-40 w-16 h-16 rounded-full bg-primary/50"></div>
          </div>
        </div>
      </section>

      <section className="mb-12">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold">Now Showing</h2>
          <Link href="/movies">
            <Button variant="ghost" className="flex items-center gap-1">
              View All <ArrowRight size={16} />
            </Button>
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {movies.slice(0, 4).map((movie) => (
            <div key={movie.id} className="h-full">
              <MovieCard movie={movie} />
            </div>
          ))}
        </div>
      </section>

      <section className="mb-12">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold">Coming Soon</h2>
          <Link href="/upcoming">
            <Button variant="ghost" className="flex items-center gap-1">
              View All <ArrowRight size={16} />
            </Button>
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {movies.slice(4, 8).map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-3xl font-bold mb-6">Popular Theaters in Bangalore</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {theaters.slice(0, 4).map((theater) => (
            <div key={theater.id} className="bg-card rounded-lg p-6 shadow-sm">
              <h3 className="text-xl font-semibold mb-2">{theater.name}</h3>
              <div className="flex items-center gap-1 text-muted-foreground mb-2">
                <MapPin size={16} />
                <span>{theater.location}</span>
              </div>
              <div className="flex items-center gap-1 text-amber-500">
                <Star size={16} className="fill-amber-500" />
                <span>{theater.rating}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-16 bg-muted rounded-lg p-8 text-center">
        <h2 className="text-2xl md:text-3xl font-bold mb-4">Download Our Mobile App</h2>
        <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
          Get exclusive offers, easy booking, and manage your tickets on the go with our mobile app
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Button variant="outline" className="gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-apple"
            >
              <path d="M12 20.94c1.5 0 2.75 1.06 4 1.06 3 0 6-8 6-12.22A4.91 4.91 0 0 0 17 5c-2.22 0-4 1.44-5 2-1-.56-2.78-2-5-2a4.9 4.9 0 0 0-5 4.78C2 14 5 22 8 22c1.25 0 2.5-1.06 4-1.06Z"></path>
              <path d="M10 2c1 .5 2 2 2 5"></path>
            </svg>
            App Store
          </Button>
          <Button variant="outline" className="gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-play"
            >
              <polygon points="5 3 19 12 5 21 5 3"></polygon>
            </svg>
            Google Play
          </Button>
        </div>
      </section>
      
      {/* Admin Access Banner */}
      <section className="mt-16 bg-secondary/20 rounded-lg p-6 text-center">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-left">
            <h3 className="text-xl font-semibold mb-2 flex items-center">
              <ShieldCheck className="mr-2" />
              Admin Dashboard Access
            </h3>
            <p className="text-muted-foreground">
              Access the admin dashboard to manage movies, theaters, and showtimes
            </p>
          </div>
          <Button asChild>
            <Link href="/admin/login">
              Access Admin Panel
            </Link>
          </Button>
        </div>
      </section>
    </div>
  )
}

