'use client';

import { useState, useEffect } from 'react';
import { ContinueWatchingHome } from '../anime/ContinueWatchingHome';
import { ForYouHome } from '../anime/ForYouHome';
import { GridAnimeCard } from '@/components/anime/GridAnimeCard';

export function PersonalizedHomeSections() {
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let isMounted = true;
    
    const fetchForyou = async () => {
      // Read directly from localStorage to avoid waiting for hook hydration
      const savedHistory = localStorage.getItem('anime_history');
      const savedWatchlist = localStorage.getItem('anime_watchlist');
      
      const h = savedHistory ? JSON.parse(savedHistory) : [];
      const w = savedWatchlist ? JSON.parse(savedWatchlist) : [];
      
      const slugs = new Set([...h.map((x:any) => x.animeId), ...w.map((x:any) => x.animeId)]);
      
      if (slugs.size === 0 || slugs.size < 5) {
        if (isMounted) setIsReady(true);
        return;
      }
      
      try {
        const res = await fetch('/api/anime/foryou', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ slugs: Array.from(slugs) })
        });
        if (res.ok) {
          const data = await res.json();
          if (isMounted) setRecommendations(data.data || []);
        }
      } catch (error) {
        console.error('Failed to fetch For You recommendations:', error);
      } finally {
        if (isMounted) setIsReady(true);
      }
    };
    
    fetchForyou();
    return () => { isMounted = false; };
  }, []);

  // We no longer block with a spinner. 
  // If not ready, it simply renders nothing (transparent loading).
  if (!isReady) return null;

  return (
    <div className="space-y-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <ContinueWatchingHome />
      <ForYouHome recommendations={recommendations} />
    </div>
  );
}
