"use client"

import Image from "next/image"
import Link from "next/link"
import { Clock, Calendar, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { useState } from "react"

interface Movie {
  id: number
  title: string
  poster: string
  rating: number
  duration: number
  release_date?: string
  releaseDate?: string
  genres: string[] | string
}

interface MovieCardProps {
  movie: Movie
}

export default function MovieCard({ movie }: MovieCardProps) {
  const [isImageLoading, setIsImageLoading] = useState(true)
  const [imageError, setImageError] = useState(false)

  const fallbackImage = `/placeholder.jpg`
  
  // Parse genres if it's a string
  const genres = typeof movie.genres === 'string' 
    ? JSON.parse(movie.genres as string)
    : movie.genres || []
  
  // Use either release_date or releaseDate property
  const releaseDate = movie.release_date || movie.releaseDate || new Date().toISOString()

  return (
    <Card className="overflow-hidden group h-full transition-all duration-200 hover:shadow-md">
      <div className="relative aspect-[2/3] overflow-hidden bg-muted">
        <Image
          src={imageError ? fallbackImage : movie.poster}
          alt={movie.title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
          priority={movie.id <= 4} // Prioritize loading first 4 movies
          className={`object-cover transition-transform duration-300 group-hover:scale-105 ${
            isImageLoading ? "opacity-0" : "opacity-100"
          }`}
          onLoad={() => setIsImageLoading(false)}
          onError={() => {
            setIsImageLoading(false)
            setImageError(true)
          }}
        />
        {isImageLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted">
            <div className="h-16 w-16 animate-pulse rounded-full bg-muted-foreground/20"></div>
          </div>
        )}
        <div className="absolute top-2 right-2 z-10">
          <Badge className="bg-black/70 hover:bg-black/70 text-white border-0">
            <Star className="h-3 w-3 fill-yellow-500 text-yellow-500 mr-1" />
            {movie.rating}
          </Badge>
        </div>
      </div>
      <CardContent className="p-4">
        <h3 className="font-semibold line-clamp-1 mb-1">{movie.title}</h3>
        <div className="flex items-center text-muted-foreground text-sm mb-2">
          <Clock size={14} className="mr-1" />
          <span className="mr-3">{movie.duration} min</span>
          <Calendar size={14} className="mr-1" />
          <span>{new Date(releaseDate).getFullYear()}</span>
        </div>
        <div className="flex flex-wrap gap-1 mb-3">
          {Array.isArray(genres) && genres.slice(0, 2).map((genre) => (
            <Badge key={genre} variant="outline" className="text-xs">
              {genre}
            </Badge>
          ))}
          {Array.isArray(genres) && genres.length > 2 && (
            <Badge variant="outline" className="text-xs">
              +{genres.length - 2}
            </Badge>
          )}
        </div>
        <Link href={`/movies/${movie.id}`}>
          <Button className="w-full transition-all" size="sm">
            Book Tickets
          </Button>
        </Link>
      </CardContent>
    </Card>
  )
}

