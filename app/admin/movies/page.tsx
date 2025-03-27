'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { PlusCircle, Edit, Trash2, Search, RotateCw, Film } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

// Movie type definition
interface Movie {
  id: number;
  title: string;
  description: string;
  poster: string;
  duration: number;
  rating: number;
  release_date: string;
  language: string;
  genres: string[] | string;
  cast: Array<{name: string, role: string}> | string;
  created_at?: string;
  updated_at?: string;
}

// Simple movie form component
interface MovieFormProps {
  movie?: Movie;
  onSubmit: (movie: Partial<Movie>) => void;
  onCancel: () => void;
}

const MovieForm: React.FC<MovieFormProps> = ({ movie, onSubmit, onCancel }) => {
  const [title, setTitle] = useState(movie?.title || '');
  const [description, setDescription] = useState(movie?.description || '');
  const [poster, setPoster] = useState(movie?.poster || '');
  const [duration, setDuration] = useState(movie?.duration?.toString() || '');
  const [rating, setRating] = useState(movie?.rating?.toString() || '');
  const [releaseDate, setReleaseDate] = useState(movie?.release_date ? new Date(movie.release_date).toISOString().split('T')[0] : '');
  const [language, setLanguage] = useState(movie?.language || '');
  
  // Handle genres which could be string or array
  const [genres, setGenres] = useState(() => {
    if (!movie?.genres) return '';
    if (typeof movie.genres === 'string') {
      try {
        return JSON.parse(movie.genres).join(', ');
      } catch {
        return movie.genres;
      }
    }
    return movie.genres.join(', ');
  });
  
  // Handle cast which could be string or array
  const [castStr, setCastStr] = useState(() => {
    if (!movie?.cast) return '';
    if (typeof movie.cast === 'string') {
      try {
        return JSON.parse(movie.cast)
          .map((c: any) => `${c.name} as ${c.role}`)
          .join('\n');
      } catch {
        return movie.cast;
      }
    }
    return movie.cast.map((c: any) => `${c.name} as ${c.role}`).join('\n');
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Parse the cast string to JSON format
    const castArray = castStr
      .split('\n')
      .filter(line => line.trim())
      .map(line => {
        const match = line.match(/(.*) as (.*)/);
        if (match) {
          return { name: match[1].trim(), role: match[2].trim() };
        }
        return { name: line.trim(), role: '' };
      });
    
    // Parse genres from comma-separated string to array
    const genresArray = genres.split(',').map(g => g.trim()).filter(g => g);
    
    onSubmit({
      title,
      description,
      poster,
      duration: parseInt(duration, 10),
      rating: parseFloat(rating),
      release_date: releaseDate,
      language,
      genres: genresArray,
      cast: castArray,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input 
            id="title" 
            value={title} 
            onChange={(e) => setTitle(e.target.value)} 
            required 
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="releaseDate">Release Date</Label>
          <Input 
            id="releaseDate"
            type="date"
            value={releaseDate}
            onChange={(e) => setReleaseDate(e.target.value)}
            required
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea 
          id="description" 
          value={description} 
          onChange={(e) => setDescription(e.target.value)} 
          required 
          rows={3}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="poster">Poster URL</Label>
        <Input 
          id="poster" 
          value={poster} 
          onChange={(e) => setPoster(e.target.value)} 
          required 
        />
      </div>
      
      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="duration">Duration (minutes)</Label>
          <Input 
            id="duration" 
            type="number" 
            value={duration} 
            onChange={(e) => setDuration(e.target.value)} 
            required 
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="rating">Rating (0-10)</Label>
          <Input 
            id="rating" 
            type="number" 
            step="0.1" 
            min="0" 
            max="10" 
            value={rating} 
            onChange={(e) => setRating(e.target.value)} 
            required 
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="language">Language</Label>
          <Input 
            id="language" 
            value={language} 
            onChange={(e) => setLanguage(e.target.value)} 
            required 
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="genres">Genres (comma separated)</Label>
        <Input 
          id="genres" 
          value={genres} 
          onChange={(e) => setGenres(e.target.value)} 
          required 
          placeholder="Action, Adventure, Drama"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="cast">Cast (one per line, format: Name as Role)</Label>
        <Textarea 
          id="cast" 
          value={castStr} 
          onChange={(e) => setCastStr(e.target.value)} 
          required 
          rows={5}
          placeholder="Robert Downey Jr. as Tony Stark"
        />
      </div>
      
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">Save Movie</Button>
      </DialogFooter>
    </form>
  );
};

export default function MoviesAdminPage() {
  const router = useRouter();
  
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [error, setError] = useState('');
  
  useEffect(() => {
    // Check if admin is logged in
    const adminToken = localStorage.getItem('adminToken');
    if (!adminToken) {
      router.push('/admin/login');
      return;
    }
    
    setIsAdmin(true);
    fetchMovies();
  }, [router]);
  
  const fetchMovies = async () => {
    setLoading(true);
    setError('');
    
    try {
      const adminToken = localStorage.getItem('adminToken');
      const response = await fetch('/api/admin/movies', {
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch movies');
      }
      
      const result = await response.json();
      setMovies(result.movies || []);
    } catch (error) {
      console.error('Error fetching movies:', error);
      setError('Failed to load movies. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleAddMovie = async (movieData: Partial<Movie>) => {
    try {
      const adminToken = localStorage.getItem('adminToken');
      const response = await fetch('/api/admin/movies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify(movieData)
      });
      
      if (!response.ok) {
        throw new Error('Failed to add movie');
      }
      
      setIsAddDialogOpen(false);
      fetchMovies();
    } catch (error) {
      console.error('Error adding movie:', error);
      setError('Failed to add movie. Please try again.');
    }
  };
  
  const handleEditMovie = async (movieData: Partial<Movie>) => {
    if (!selectedMovie) return;
    
    try {
      const adminToken = localStorage.getItem('adminToken');
      const response = await fetch(`/api/admin/movies/${selectedMovie.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify(movieData)
      });
      
      if (!response.ok) {
        throw new Error('Failed to update movie');
      }
      
      setIsEditDialogOpen(false);
      setSelectedMovie(null);
      fetchMovies();
    } catch (error) {
      console.error('Error updating movie:', error);
      setError('Failed to update movie. Please try again.');
    }
  };
  
  const handleDeleteMovie = async () => {
    if (!selectedMovie) return;
    
    try {
      const adminToken = localStorage.getItem('adminToken');
      const response = await fetch(`/api/admin/movies/${selectedMovie.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete movie');
      }
      
      setIsDeleteDialogOpen(false);
      setSelectedMovie(null);
      fetchMovies();
    } catch (error) {
      console.error('Error deleting movie:', error);
      setError('Failed to delete movie. Please try again.');
    }
  };
  
  // Filter movies based on search query
  const filteredMovies = movies.filter(movie => 
    movie.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  // Display genres as badges
  const renderGenres = (genresData: string | string[]) => {
    let genres: string[] = [];
    
    if (typeof genresData === 'string') {
      try {
        genres = JSON.parse(genresData);
      } catch {
        genres = [genresData];
      }
    } else {
      genres = genresData;
    }
    
    return (
      <div className="flex flex-wrap gap-1">
        {genres.map((genre, index) => (
          <Badge key={index} variant="secondary">{genre}</Badge>
        ))}
      </div>
    );
  };

  if (!isAdmin) {
    return null; // Don't render anything until we verify admin status
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Movies Management</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchMovies}>
            <RotateCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <PlusCircle className="h-4 w-4 mr-2" />
            Add Movie
          </Button>
        </div>
      </div>
      
      {error && (
        <div className="bg-destructive/15 text-destructive p-3 mb-4 rounded-md">
          {error}
        </div>
      )}
      
      <div className="flex items-center mb-4">
        <Search className="h-4 w-4 mr-2 text-muted-foreground" />
        <Input
          placeholder="Search movies..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-xs"
        />
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin">
              <Film className="h-8 w-8 text-primary" />
            </div>
            <p className="text-muted-foreground">Loading movies...</p>
          </div>
        </div>
      ) : (
        <>
          {filteredMovies.length === 0 ? (
            <div className="text-center p-8 border rounded-lg">
              <Film className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
              <h3 className="text-lg font-semibold">No movies found</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery ? "No movies match your search query" : "Start by adding a movie"}
              </p>
              <Button onClick={() => setIsAddDialogOpen(true)}>
                <PlusCircle className="h-4 w-4 mr-2" />
                Add your first movie
              </Button>
            </div>
          ) : (
            <Tabs defaultValue="grid">
              <TabsList className="mb-4">
                <TabsTrigger value="grid">Grid View</TabsTrigger>
                <TabsTrigger value="table">Table View</TabsTrigger>
              </TabsList>
              
              <TabsContent value="grid" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredMovies.map(movie => (
                    <Card key={movie.id} className="overflow-hidden">
                      <div className="aspect-video relative overflow-hidden">
                        <Image
                          src={movie.poster}
                          alt={movie.title}
                          layout="fill"
                          objectFit="cover"
                          className="transition-transform hover:scale-105"
                        />
                      </div>
                      <CardHeader>
                        <CardTitle className="truncate">{movie.title}</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <p className="text-sm text-muted-foreground line-clamp-2">{movie.description}</p>
                        <div className="flex flex-wrap gap-2 text-sm">
                          <div className="flex items-center">
                            <span className="text-yellow-500 mr-1">★</span>
                            <span>{movie.rating}</span>
                          </div>
                          <div className="text-muted-foreground">
                            {movie.duration} mins
                          </div>
                          <div className="text-muted-foreground">
                            {movie.language}
                          </div>
                        </div>
                        {renderGenres(movie.genres)}
                      </CardContent>
                      <CardFooter className="flex justify-between">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            setSelectedMovie(movie);
                            setIsEditDialogOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => {
                            setSelectedMovie(movie);
                            setIsDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="table">
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Release Date</TableHead>
                        <TableHead>Duration</TableHead>
                        <TableHead>Rating</TableHead>
                        <TableHead>Language</TableHead>
                        <TableHead>Genres</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredMovies.map(movie => (
                        <TableRow key={movie.id}>
                          <TableCell className="font-medium">{movie.title}</TableCell>
                          <TableCell>
                            {movie.release_date ? formatDate(movie.release_date) : 'N/A'}
                          </TableCell>
                          <TableCell>{movie.duration} mins</TableCell>
                          <TableCell>{movie.rating}</TableCell>
                          <TableCell>{movie.language}</TableCell>
                          <TableCell>{renderGenres(movie.genres)}</TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => {
                                  setSelectedMovie(movie);
                                  setIsEditDialogOpen(true);
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                className="text-destructive"
                                onClick={() => {
                                  setSelectedMovie(movie);
                                  setIsDeleteDialogOpen(true);
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>
            </Tabs>
          )}
        </>
      )}
      
      {/* Add Movie Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Movie</DialogTitle>
          </DialogHeader>
          <MovieForm onSubmit={handleAddMovie} onCancel={() => setIsAddDialogOpen(false)} />
        </DialogContent>
      </Dialog>
      
      {/* Edit Movie Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Movie</DialogTitle>
          </DialogHeader>
          {selectedMovie && (
            <MovieForm 
              movie={selectedMovie} 
              onSubmit={handleEditMovie} 
              onCancel={() => setIsEditDialogOpen(false)} 
            />
          )}
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
          </DialogHeader>
          <p>
            Are you sure you want to delete the movie "{selectedMovie?.title}"? 
            This action cannot be undone.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteMovie}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 