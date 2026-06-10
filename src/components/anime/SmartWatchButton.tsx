'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CaretRight, Renew } from '@carbon/icons-react';
import { useHistory } from '@/lib/hooks/useHistory';
import { cn } from '@/lib/utils';

interface SmartWatchButtonProps {
  animeId: string;
  animeTitle: string;
  animeImage: string;
  className?: string;
  variant?: 'primary' | 'outline';
}

export function SmartWatchButton({ 
  animeId, 
  animeTitle, 
  animeImage, 
  className,
  variant = 'primary'
}: SmartWatchButtonProps) {
  const router = useRouter();
  const { history } = useHistory();
  const [loading, setLoading] = useState(false);

  const handleWatch = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // 1. Check local history first (Fastest, no API call)
    const savedProgress = history.find(h => h.animeId === animeId);
    
    if (savedProgress) {
      // Resume from last watched
      router.push(`/watch/${savedProgress.lastEpisodeId}?anime=${animeId}&title=${encodeURIComponent(animeTitle)}&img=${encodeURIComponent(animeImage)}`);
      return;
    }

    // 2. No history? Fetch details to find Episode 1 (Only happens ON CLICK)
    setLoading(true);
    try {
      const res = await fetch(`/api/anime/episodes?slug=${animeId}`);
      const data = await res.json();
      const episodes = data.episodes || [];
      
      if (episodes.length > 0) {
        // Episode 1 is usually the last item in the array (asc order by number, desc in DB order)
        const firstEpisode = episodes[episodes.length - 1];
        const epId = firstEpisode.slug;
        
        router.push(`/watch/${epId}?anime=${animeId}&title=${encodeURIComponent(animeTitle)}&img=${encodeURIComponent(animeImage)}`);
      } else {
        router.push(`/anime/${animeId}`);
      }
    } catch (error) {
      console.error("Failed to find Episode 1", error);
      router.push(`/anime/${animeId}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleWatch}
      disabled={loading}
      className={cn(
        "flex items-center justify-center space-x-2 transition-all disabled:opacity-70 cursor-pointer",
        variant === 'primary' ? "btn-primary" : "px-6 py-3 rounded-lg border border-border font-medium hover:bg-white/5",
        className
      )}
    >
      {loading ? (
        <Renew className="w-6 h-6 animate-spin" />
      ) : (
        <CaretRight className="w-6 h-6 fill-current" />
      )}
      <span className="text-xs">{loading ? 'Finding Episode...' : 'Watch Now'}</span>
    </button>
  );
}
