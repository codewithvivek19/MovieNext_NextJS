import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Utility function to merge Tailwind CSS classes
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Safely parse a JSON string to an object
 * @param jsonString - The JSON string to parse
 * @param fallback - Optional fallback value if parsing fails
 */
export function parseJson<T>(jsonString: string | null | undefined, fallback: T): T {
  if (!jsonString) return fallback;
  
  try {
    return JSON.parse(jsonString) as T;
  } catch (error) {
    console.error('Error parsing JSON:', error);
    return fallback;
  }
}

/**
 * Safely stringify an object to JSON
 * @param value - The value to stringify
 * @param fallback - Optional fallback value if stringification fails
 */
export function stringifyJson<T>(value: T, fallback: string = '[]'): string {
  if (value === undefined || value === null) return fallback;
  
  try {
    return JSON.stringify(value);
  } catch (error) {
    console.error('Error stringifying to JSON:', error);
    return fallback;
  }
}

/**
 * Format a date to a human-readable format
 * @param date - Date to format
 * @param options - Intl.DateTimeFormatOptions
 */
export function formatDate(
  date: Date | string | number,
  options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }
): string {
  return new Intl.DateTimeFormat('en-US', options).format(new Date(date));
}

/**
 * Format currency values
 * @param amount - Amount in cents/paisa
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
  }).format(amount);
}

/**
 * Generate a random reference number for bookings
 */
export function generateReference(prefix: string = 'BOOK'): string {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `${prefix}-${timestamp}-${random}`;
}
