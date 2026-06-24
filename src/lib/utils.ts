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
 * Parses an Indonesian date string (e.g. '11 Agustus,2025') into a standard ISO date string ('2025-08-11')
 */
export function parseIndonesianDate(dateStr: string): string {
  if (!dateStr) return dateStr;
  
  const months: Record<string, string> = {
    'januari': '01', 'februari': '02', 'maret': '03', 'april': '04',
    'mei': '05', 'juni': '06', 'juli': '07', 'agustus': '08',
    'september': '09', 'oktober': '10', 'november': '11', 'desember': '12'
  };

  // Match "11 Agustus,2025" or "11 Agustus 2025"
  const match = dateStr.match(/(\d+)\s+([A-Za-z]+),?\s*(\d{4})/);
  if (match) {
    const day = match[1].padStart(2, '0');
    const monthStr = match[2].toLowerCase();
    const year = match[3];
    
    const month = months[monthStr] || '01';
    return `${year}-${month}-${day}`;
  }
  
  return dateStr;
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
  } catch {
    // If JSON parse fails, return as single item array or split by comma if exists
    if (strData.includes(',')) {
      return strData.split(',').map(s => s.trim()).filter(Boolean);
    }
    return [strData];
  }
}

/**
 * Formats next airing information into a human-readable string.
 */
export function formatNextAiring(nextEpisode: number, nextAiringAt: number, detailed = false): string | null {
  const now = Math.floor(Date.now() / 1000);
  const diff = nextAiringAt - now;
  if (diff <= 0) return null;
  
  const days = Math.floor(diff / 86400);
  const hours = Math.floor((diff % 86400) / 3600);
  
  if (days > 14) return detailed ? `Ep ${nextEpisode} upcoming` : `Ep ${nextEpisode}`;
  if (days > 0) {
    return detailed 
      ? `Ep ${nextEpisode} in ${days}d ${hours}h` 
      : `Ep ${nextEpisode} in ${days}d`;
  }
  if (hours > 0) return `Ep ${nextEpisode} in ${hours}h`;
  return `Ep ${nextEpisode} soon`;
}

export const FALLBACK_IMAGE = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MDAiIGhlaWdodD0iNjAwIiB2aWV3Qm94PSIwIDAgNDAwIDYwMCI+PGRlZnM+PHBhdHRlcm4gaWQ9ImciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTTQwIDBMMCAwIDAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzIyYzU1ZSIgc3Ryb2tlLXdpZHRoPSIwLjUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiLz48L3BhdHRlcm4+PHBhdHRlcm4gaWQ9InMiIHdpZHRoPSI0IiBoZWlnaHQ9IjQiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiPjxyZWN0IHdpZHRoPSI0IiBoZWlnaHQ9IjEiIGZpbGw9IiMwMDAiIG9wYWNpdHk9IjAuMyIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjQwMCIgaGVpZ2h0PSI2MDAiIGZpbGw9IiMwYzBlMGMiLz48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjYwMCIgZmlsbD0idXJsKCNnKSIvPjxwYXRoIGQ9Ik0yMCw0MEwyMCwyMEw0MCwyME0zODAsNDBMMzgwLDIwTDM2MCwyME0yMCw1NjBMMjAsNTgwTDQwLDU4ME0zODAsNTYwTDM4MCw1ODBMMzYwLDU4MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjMjJjNTVlIiBzdHJva2Utd2lkdGg9IjMiIG9wYWNpdHk9IjAuNSIvPjxwYXRoIGQ9Ik0yMDAsMjQwTDIzMCwyOTBMMTcwLDI5MFoiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzIyYzU1ZSIgc3Ryb2tlLXdpZHRoPSIyIiBvcGFjaXR5PSIwLjQiLz48dGV4dCB4PSIyMDAiIHk9IjI4MiIgZmlsbD0iIzIyYzU1ZSIgZm9udC1mYW1pbHk9Im1vbm9zcGFjZSIgZm9udC1zaXplPSIyMCIgZm9udC13ZWlnaHQ9ImJvbGQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIG9wYWNpdHk9IjAuNCI+ITwvdGV4dD48dGV4dCB4PSIxOTgiIHk9IjM0MCIgZmlsbD0iI2VmNDQ0NCIgZm9udC1mYW1pbHk9Im1vbm9zcGFjZSIgZm9udC1zaXplPSIyNCIgZm9udC13ZWlnaHQ9IjkwMCIgbGV0dGVyLXNwYWNpbmc9IjQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIG9wYWNpdHk9IjAuNiI+Tk9fSU1BR0VfREFUQTwvdGV4dD48dGV4dCB4PSIyMDIiIHk9IjM0MCIgZmlsbD0iIzA2YjZkNCIgZm9udC1mYW1pbHk9Im1vbm9zcGFjZSIgZm9udC1zaXplPSIyNCIgZm9udC13ZWlnaHQ9IjkwMCIgbGV0dGVyLXNwYWNpbmc9IjQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIG9wYWNpdHk9IjAuNiI+Tk9fSU1BR0VfREFUQTwvdGV4dD48dGV4dCB4PSIyMDAiIHk9IjM0MCIgZmlsbD0iIzIyYzU1ZSIgZm9udC1mYW1pbHk9Im1vbm9zcGFjZSIgZm9udC1zaXplPSIyNCIgZm9udC13ZWlnaHQ9IjkwMCIgbGV0dGVyLXNwYWNpbmc9IjQiIHRleHQtYW5jaG9yPSJtaWRkbGUiPk5PX0lNQUdFX0RBVEE8L3RleHQ+PHRleHQgeD0iMjAwIiB5PSIzNjUiIGZpbGw9IiMyMmM1NWUiIGZvbnQtZmFtaWx5PSJtb25vc3BhY2UiIGZvbnQtc2l6ZT0iMTAiIGZvbnQtd2VpZ2h0PSJib2xkIiBsZXR0ZXItc3BhY2luZz0iMiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgb3BhY2l0eT0iMC41Ij5EQVRBX1VOQVZBSUxBQkxFPC90ZXh0PjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iNjAwIiBmaWxsPSJ1cmwoI3MpIi8+PC9zdmc+';
