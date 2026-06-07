'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Play } from 'lucide-react';
import { useHistory } from '@/lib/hooks/useHistory';
import { cn } from '@/lib/utils';

export function EpisodeList({ 
  episodes, 
  animeId, 
  animeTitle, 
  poster, 
  source 
}: { 
  episodes: any[]; 
  animeId: string; 
  animeTitle: string; 
  poster: string;
  source: string;
}) {
  const { history } = useHistory();
  const [lastEpId, setLastEpId] = useState<string | null>(null);

  useEffect(() => {
    const saved = history.find(h => h.animeId === animeId);
    if (saved) setLastEpId(saved.lastEpisodeId);
  }, [history, animeId]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {episodes.map((ep: any, index: number) => {
        const epNum = ep.eps || episodes.length - index;
        const currentEpId = ep.episodeId || ep.id;
        const isLastWatched = lastEpId === currentEpId;

        return (
          <Link
            key={`${currentEpId}-${index}`}
            href={`/watch/${currentEpId}?anime=${animeId}&title=${encodeURIComponent(animeTitle)}&img=${encodeURIComponent(poster)}&source=${source}`}
            className={cn(
              "flex items-center p-4 transition-all group border-2 relative",
              isLastWatched 
                ? "bg-secondary/20 border-secondary shadow-[0_0_15px_rgba(34,197,94,0.2)]" 
                : "bg-card border-secondary/10 hover:border-secondary hover:bg-secondary/5"
            )}
          >
            {isLastWatched && (
              <div className="absolute -top-2.5 -right-2 px-2 py-0.5 bg-secondary text-black text-[9px] font-black uppercase tracking-widest z-10 skew-x-[-10deg]">
                Last Watched
              </div>
            )}
            <div className={cn(
              "w-12 h-12 flex items-center justify-center font-bold text-sm transition-colors shrink-0",
              isLastWatched ? "bg-secondary text-black" : "bg-background group-hover:bg-secondary group-hover:text-white"
            )}>
              {epNum}
            </div>
            <div className="ml-4 flex-grow min-w-0">
              <p className={cn(
                "text-sm font-bold truncate",
                isLastWatched ? "text-secondary" : ""
              )}>Episode {epNum}</p>
              <p className="text-[11px] text-gray-500 mt-0.5">{ep.date || ep.uploaded_on || 'Released'}</p>
            </div>
            <Play className={cn(
              "w-4 h-4 transition-colors shrink-0",
              isLastWatched ? "text-secondary fill-current" : "text-gray-400 group-hover:text-secondary"
            )} />
          </Link>
        );
      })}
    </div>
  );
}
