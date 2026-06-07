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

  const loadWatchlist = useCallback(() => {
    const saved = localStorage.getItem('anime_watchlist');
    if (saved) {
      try {
        setWatchlist(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse watchlist', e);
      }
    } else {
      setWatchlist([]);
    }
  }, []);

  useEffect(() => {
    loadWatchlist();
    window.addEventListener('watchlist_updated', loadWatchlist);
    return () => window.removeEventListener('watchlist_updated', loadWatchlist);
  }, [loadWatchlist]);

  const updateStorage = (newList: WatchlistItem[]) => {
    localStorage.setItem('anime_watchlist', JSON.stringify(newList));
    window.dispatchEvent(new Event('watchlist_updated'));
  };

  const getLatestWatchlist = (): WatchlistItem[] => {
    const saved = localStorage.getItem('anime_watchlist');
    return saved ? JSON.parse(saved) : [];
  };

  const addToWatchlist = useCallback((item: Omit<WatchlistItem, 'addedAt'>) => {
    const currentList = getLatestWatchlist();
    if (currentList.some(w => w.animeId === item.animeId)) return;
    updateStorage([{ ...item, addedAt: Date.now() }, ...currentList]);
  }, []);

  const removeFromWatchlist = useCallback((animeId: string) => {
    const currentList = getLatestWatchlist();
    updateStorage(currentList.filter(w => w.animeId !== animeId));
  }, []);

  const isInWatchlist = useCallback((animeId: string) => {
    return watchlist.some(w => w.animeId === animeId);
  }, [watchlist]);

  const toggleWatchlist = useCallback((item: Omit<WatchlistItem, 'addedAt'>) => {
    const currentList = getLatestWatchlist();
    const exists = currentList.some(w => w.animeId === item.animeId);
    if (exists) {
      updateStorage(currentList.filter(w => w.animeId !== item.animeId));
    } else {
      updateStorage([{ ...item, addedAt: Date.now() }, ...currentList]);
    }
  }, []);

  const removeMultipleFromWatchlist = useCallback((animeIds: string[]) => {
    const currentList = getLatestWatchlist();
    updateStorage(currentList.filter(w => !animeIds.includes(w.animeId)));
  }, []);

  return {
    watchlist,
    addToWatchlist,
    removeFromWatchlist,
    removeMultipleFromWatchlist,
    isInWatchlist,
    toggleWatchlist
  };
}
