'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { CaretRight, SkipForwardFilled } from '@carbon/icons-react';
import { useHistory, WatchHistory } from '@/lib/hooks/useHistory';

export function ContinueWatching({ 
  animeId, 
  animeTitle, 
  animeImage,
  source,
  episodes = []
}: { 
  animeId: string; 
  animeTitle: string; 
  animeImage: string;
  source: string;
  episodes?: any[];
}) {
  const { history } = useHistory();
  const [lastWatched, setLastWatched] = useState<WatchHistory | null>(null);
  const [nextEp, setNextEp] = useState<any>(null);

  useEffect(() => {
    const saved = history.find(h => h.animeId === animeId);
    if (saved) {
      setLastWatched(saved);
      
      // Find next episode logic
      if (episodes.length > 0) {
        // Find index of current episode (API usually descending)
        const currentIndex = episodes.findIndex(ep => (ep.episodeId || ep.id) === saved.lastEpisodeId);
        if (currentIndex !== -1 && currentIndex > 0) {
          // In descending list, next episode is the one BEFORE (currentIndex - 1)
          setNextEp(episodes[currentIndex - 1]);
        }
      }
    }
  }, [history, animeId, episodes]);

  if (!lastWatched) return null;

  // Extract episode number precisely from the stored title
  const epNumber = lastWatched.lastEpisodeTitle.match(/Episode\s*(\d+)/i)?.[1] || 
                   lastWatched.lastEpisodeTitle.match(/(\d+)/)?.[0] || '';

  const watchUrl = (id: string) => `/watch/${id}?anime=${animeId}&title=${encodeURIComponent(animeTitle)}&img=${encodeURIComponent(animeImage)}&source=${source}`;

  return (
    <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-500">
      <Link
        href={watchUrl(lastWatched.lastEpisodeId)}
        className="btn-primary w-full flex items-center justify-center space-x-2 group"
      >
        <CaretRight className="w-5 h-5 fill-current group-hover:scale-110 transition-transform" />
        <span>Continue Episode {epNumber}</span>
      </Link>
      
      {nextEp && (
        <Link
          href={watchUrl(nextEp.episodeId || nextEp.id)}
          className="btn-accent w-full flex items-center justify-center space-x-2 group"
        >
          <SkipForwardFilled className="w-4 h-4 fill-current group-hover:translate-x-1 transition-transform" />
          <span className="text-[11px]">Next: Episode {nextEp.eps || (episodes.length - episodes.indexOf(nextEp))}</span>
        </Link>
      )}

      <p className="text-[9px] text-center font-bold text-secondary uppercase tracking-[0.2em] opacity-40">
        Saved to your device
      </p>
    </div>
  );
}
