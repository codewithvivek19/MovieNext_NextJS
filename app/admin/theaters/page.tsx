'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PlusCircle, Edit, Trash2, Search, RotateCw, MapPin, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

// Theater type definition
interface Theater {
  id: number;
  name: string;
  location: string;
  rating: number;
  seating_capacity: number;
  created_at?: string;
  updated_at?: string;
  _count?: {
    showtimes: number;
  };
}

// Theater form component
interface TheaterFormProps {
  theater?: Theater;
  onSubmit: (theater: Partial<Theater>) => void;
  onCancel: () => void;
}

const TheaterForm: React.FC<TheaterFormProps> = ({ theater, onSubmit, onCancel }) => {
  const [name, setName] = useState(theater?.name || '');
  const [location, setLocation] = useState(theater?.location || '');
  const [rating, setRating] = useState(theater?.rating?.toString() || '');
  const [seatingCapacity, setSeatingCapacity] = useState(theater?.seating_capacity?.toString() || '100');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    onSubmit({
      name,
      location,
      rating: parseFloat(rating),
      seating_capacity: parseInt(seatingCapacity, 10)
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Theater Name</Label>
        <Input 
          id="name" 
          value={name} 
          onChange={(e) => setName(e.target.value)} 
          required 
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="location">Location</Label>
        <Input 
          id="location" 
          value={location} 
          onChange={(e) => setLocation(e.target.value)} 
          required 
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="rating">Rating (0-5)</Label>
          <Input 
            id="rating" 
            type="number" 
            step="0.1" 
            min="0" 
            max="5" 
            value={rating} 
            onChange={(e) => setRating(e.target.value)} 
            required 
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="seatingCapacity">Seating Capacity</Label>
          <Input 
            id="seatingCapacity" 
            type="number" 
            min="1" 
            value={seatingCapacity} 
            onChange={(e) => setSeatingCapacity(e.target.value)} 
            required 
          />
        </div>
      </div>
      
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">Save Theater</Button>
      </DialogFooter>
    </form>
  );
};

export default function TheatersAdminPage() {
  const router = useRouter();
  
  const [theaters, setTheaters] = useState<Theater[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTheater, setSelectedTheater] = useState<Theater | null>(null);
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
    fetchTheaters();
  }, [router]);
  
  const fetchTheaters = async () => {
    setLoading(true);
    setError('');
    
    try {
      const adminToken = localStorage.getItem('adminToken');
      const response = await fetch('/api/admin/theaters', {
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch theaters');
      }
      
      const result = await response.json();
      setTheaters(result.theaters || []);
    } catch (error) {
      console.error('Error fetching theaters:', error);
      setError('Failed to load theaters. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleAddTheater = async (theaterData: Partial<Theater>) => {
    try {
      const adminToken = localStorage.getItem('adminToken');
      const response = await fetch('/api/admin/theaters', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify(theaterData)
      });
      
      if (!response.ok) {
        throw new Error('Failed to add theater');
      }
      
      setIsAddDialogOpen(false);
      fetchTheaters();
    } catch (error) {
      console.error('Error adding theater:', error);
      setError('Failed to add theater. Please try again.');
    }
  };
  
  const handleEditTheater = async (theaterData: Partial<Theater>) => {
    if (!selectedTheater) return;
    
    try {
      const adminToken = localStorage.getItem('adminToken');
      const response = await fetch(`/api/admin/theaters/${selectedTheater.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify(theaterData)
      });
      
      if (!response.ok) {
        throw new Error('Failed to update theater');
      }
      
      setIsEditDialogOpen(false);
      setSelectedTheater(null);
      fetchTheaters();
    } catch (error) {
      console.error('Error updating theater:', error);
      setError('Failed to update theater. Please try again.');
    }
  };
  
  const handleDeleteTheater = async () => {
    if (!selectedTheater) return;
    
    try {
      const adminToken = localStorage.getItem('adminToken');
      const response = await fetch(`/api/admin/theaters/${selectedTheater.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete theater');
      }
      
      setIsDeleteDialogOpen(false);
      setSelectedTheater(null);
      fetchTheaters();
    } catch (error) {
      console.error('Error deleting theater:', error);
      const errorMsg = error instanceof Error ? error.message : 'Failed to delete theater. Please try again.';
      setError(errorMsg);
    }
  };
  
  // Filter theaters based on search query
  const filteredTheaters = theaters.filter(theater => 
    theater.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    theater.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isAdmin) {
    return null; // Don't render anything until we verify admin status
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Theaters Management</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchTheaters}>
            <RotateCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <PlusCircle className="h-4 w-4 mr-2" />
            Add Theater
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
          placeholder="Search theaters..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-xs"
        />
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin">
              <MapPin className="h-8 w-8 text-primary" />
            </div>
            <p className="text-muted-foreground">Loading theaters...</p>
          </div>
        </div>
      ) : (
        <>
          {filteredTheaters.length === 0 ? (
            <div className="text-center p-8 border rounded-lg">
              <MapPin className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
              <h3 className="text-lg font-semibold">No theaters found</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery ? "No theaters match your search query" : "Start by adding a theater"}
              </p>
              <Button onClick={() => setIsAddDialogOpen(true)}>
                <PlusCircle className="h-4 w-4 mr-2" />
                Add your first theater
              </Button>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Seating Capacity</TableHead>
                    <TableHead>Showtimes</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTheaters.map(theater => (
                    <TableRow key={theater.id}>
                      <TableCell className="font-medium">{theater.name}</TableCell>
                      <TableCell>{theater.location}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Star className="h-4 w-4 text-yellow-500 mr-1" />
                          {theater.rating}
                        </div>
                      </TableCell>
                      <TableCell>{theater.seating_capacity || 'N/A'}</TableCell>
                      <TableCell>{theater._count?.showtimes || 0}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => {
                              setSelectedTheater(theater);
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
                              setSelectedTheater(theater);
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
          )}
        </>
      )}
      
      {/* Add Theater Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Theater</DialogTitle>
          </DialogHeader>
          <TheaterForm onSubmit={handleAddTheater} onCancel={() => setIsAddDialogOpen(false)} />
        </DialogContent>
      </Dialog>
      
      {/* Edit Theater Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Theater</DialogTitle>
          </DialogHeader>
          {selectedTheater && (
            <TheaterForm 
              theater={selectedTheater} 
              onSubmit={handleEditTheater} 
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
            Are you sure you want to delete the theater "{selectedTheater?.name}"?
            {selectedTheater?._count?.showtimes ? 
              " This theater has associated showtimes that will also be affected." : 
              " This action cannot be undone."}
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteTheater}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 