'use client';

import { useState, useEffect, useCallback } from 'react';

export interface WatchlistItem {
  animeId: string;
  animeTitle: string;
  animeImage: string;
  addedAt: number;
}

export function useWatchlist() {
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('anime_watchlist');
    if (saved) {
      try {
        setWatchlist(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse watchlist', e);
      }
    }
  }, []);

  const addToWatchlist = useCallback((item: Omit<WatchlistItem, 'addedAt'>) => {
    setWatchlist((prev) => {
      // Prevent duplicates
      if (prev.some(w => w.animeId === item.animeId)) return prev;

      const newWatchlist = [{ ...item, addedAt: Date.now() }, ...prev];
      localStorage.setItem('anime_watchlist', JSON.stringify(newWatchlist));
      return newWatchlist;
    });
  }, []);

  const removeFromWatchlist = useCallback((animeId: string) => {
    setWatchlist((prev) => {
      const newWatchlist = prev.filter(w => w.animeId !== animeId);
      localStorage.setItem('anime_watchlist', JSON.stringify(newWatchlist));
      return newWatchlist;
    });
  }, []);

  const isInWatchlist = useCallback((animeId: string) => {
    return watchlist.some(w => w.animeId === animeId);
  }, [watchlist]);

  const toggleWatchlist = useCallback((item: Omit<WatchlistItem, 'addedAt'>) => {
    setWatchlist((prev) => {
      const exists = prev.some(w => w.animeId === item.animeId);
      let newWatchlist;
      if (exists) {
        newWatchlist = prev.filter(w => w.animeId !== item.animeId);
      } else {
        newWatchlist = [{ ...item, addedAt: Date.now() }, ...prev];
      }
      localStorage.setItem('anime_watchlist', JSON.stringify(newWatchlist));
      return newWatchlist;
    });
  }, []);

  return {
    watchlist,
    addToWatchlist,
    removeFromWatchlist,
    isInWatchlist,
    toggleWatchlist
  };
}
