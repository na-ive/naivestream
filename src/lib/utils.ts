import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date) {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Parses a string field that might be a JSON array or comma-separated values
 * common in the scraped database.
 */
export function parseArrayField(data: any): string[] {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  
  const strData = String(data).trim();
  if (!strData) return [];

  try {
    // Check if it looks like a JSON array ["Item", "Item"]
    if (strData.startsWith('[') && strData.endsWith(']')) {
      const parsed = JSON.parse(strData);
      return Array.isArray(parsed) ? parsed : [strData];
    }
    
    // Check if it's comma separated
    if (strData.includes(',')) {
      return strData.split(',').map(s => s.trim()).filter(Boolean);
    }
    
    return [strData];
  } catch (e) {
    // If JSON parse fails, return as single item array or split by comma if exists
    if (strData.includes(',')) {
      return strData.split(',').map(s => s.trim()).filter(Boolean);
    }
    return [strData];
  }
}
