'use client';

import { useState } from 'react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';

function AdminDashboardCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Link href="/admin/movies" className="bg-blue-600 hover:bg-blue-700 text-white p-6 rounded-lg shadow-md transition duration-300 ease-in-out">
        <h2 className="text-xl font-bold">Movies</h2>
        <p className="mt-2">Manage movies, add new releases</p>
      </Link>
      
      <Link href="/admin/theaters" className="bg-green-600 hover:bg-green-700 text-white p-6 rounded-lg shadow-md transition duration-300 ease-in-out">
        <h2 className="text-xl font-bold">Theaters</h2>
        <p className="mt-2">Manage theaters and seating</p>
      </Link>
      
      <Link href="/admin/showtimes" className="bg-purple-600 hover:bg-purple-700 text-white p-6 rounded-lg shadow-md transition duration-300 ease-in-out">
        <h2 className="text-xl font-bold">Showtimes</h2>
        <p className="mt-2">Schedule and manage showtimes</p>
      </Link>
      
      <Link href="/admin/bookings" className="bg-red-600 hover:bg-red-700 text-white p-6 rounded-lg shadow-md transition duration-300 ease-in-out">
        <h2 className="text-xl font-bold">Bookings</h2>
        <p className="mt-2">View and manage bookings</p>
      </Link>
    </div>
  );
}

function FixShowtimesButton() {
  const [isLoading, setIsLoading] = useState(false);
  
  const handleFixShowtimes = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/admin/admin-fix-showtimes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const data = await response.json();
      
      if (response.ok) {
        toast.success(data.message || 'Showtimes fixed successfully');
        console.log('Fix showtimes result:', data);
      } else {
        toast.error(data.error || 'Failed to fix showtimes');
        console.error('Fix showtimes error:', data);
      }
    } catch (error) {
      console.error('Error fixing showtimes:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="mt-6 mb-6">
      <button
        onClick={handleFixShowtimes}
        disabled={isLoading}
        className="bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded transition duration-300 ease-in-out flex items-center"
      >
        {isLoading ? (
          <>
            <span className="mr-2">
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </span>
            Processing...
          </>
        ) : (
          <>
            <span className="mr-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </span>
            Fix Missing Showtimes
          </>
        )}
      </button>
      <p className="text-sm text-gray-500 mt-2">
        This will find movies and theaters with no showtimes and automatically generate them.
      </p>
    </div>
  );
}

function AdminQuickStats() {
  return (
    <div className="mt-6">
      <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link href="/admin/movies/add" className="bg-gray-100 hover:bg-gray-200 p-4 rounded-lg shadow transition duration-300 ease-in-out">
          <h3 className="font-semibold">Add New Movie</h3>
        </Link>
        <Link href="/admin/theaters/add" className="bg-gray-100 hover:bg-gray-200 p-4 rounded-lg shadow transition duration-300 ease-in-out">
          <h3 className="font-semibold">Add New Theater</h3>
        </Link>
        <Link href="/admin/showtimes/add" className="bg-gray-100 hover:bg-gray-200 p-4 rounded-lg shadow transition duration-300 ease-in-out">
          <h3 className="font-semibold">Schedule Showtime</h3>
        </Link>
        <Link href="/admin/reports" className="bg-gray-100 hover:bg-gray-200 p-4 rounded-lg shadow transition duration-300 ease-in-out">
          <h3 className="font-semibold">View Reports</h3>
        </Link>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
      <AdminDashboardCards />
      <FixShowtimesButton />
      <AdminQuickStats />
    </div>
  );
} 