'use client';

import { useState, useEffect, useCallback } from 'react';

export interface WatchHistory {
  animeId: string;
  animeTitle: string;
  animeImage: string;
  lastEpisodeId: string;
  lastEpisodeTitle: string;
  updatedAt: number;
}

export function useHistory() {
  const [history, setHistory] = useState<WatchHistory[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('anime_history');
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse history', e);
      }
    }
  }, []);

  const saveToHistory = useCallback((item: Omit<WatchHistory, 'updatedAt'>) => {
    setHistory((prevHistory) => {
      const newHistory = [...prevHistory];
      const index = newHistory.findIndex((h) => h.animeId === item.animeId);
      
      if (index !== -1) {
        newHistory[index] = { ...item, updatedAt: Date.now() };
      } else {
        newHistory.unshift({ ...item, updatedAt: Date.now() });
      }

      // Keep only last 50 items
      const limitedHistory = newHistory
        .sort((a, b) => b.updatedAt - a.updatedAt)
        .slice(0, 50);

      localStorage.setItem('anime_history', JSON.stringify(limitedHistory));
      return limitedHistory;
    });
  }, []);

  const removeFromHistory = useCallback((animeId: string) => {
    setHistory((prevHistory) => {
      const newHistory = prevHistory.filter((h) => h.animeId !== animeId);
      localStorage.setItem('anime_history', JSON.stringify(newHistory));
      return newHistory;
    });
  }, []);

  return { history, saveToHistory, removeFromHistory };
}
