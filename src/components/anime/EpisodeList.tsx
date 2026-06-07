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
              "flex items-center p-3 transition-all group relative overflow-hidden",
              isLastWatched 
                ? "bg-secondary/10 border-l-4 border-secondary" 
                : "bg-card/50 hover:bg-secondary/5 border-l-4 border-transparent hover:border-secondary"
            )}
            style={{ clipPath: 'polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)' }}
          >
            {/* Episode Number Block */}
            <div className={cn(
              "relative w-12 h-12 flex items-center justify-center font-black text-lg transition-all shrink-0 z-10",
              isLastWatched ? "text-secondary" : "text-muted-text group-hover:text-foreground"
            )}>
              <span className="absolute text-[8px] top-0 left-0 text-secondary/50 font-mono tracking-tighter">EP</span>
              {epNum}
            </div>

            {/* Episode Info */}
            <div className="ml-4 flex-grow min-w-0 z-10 flex flex-col justify-center">
              <div className="flex items-center gap-2">
                <p className={cn(
                  "text-sm font-bold truncate uppercase tracking-widest transition-colors",
                  isLastWatched ? "text-secondary" : "group-hover:text-secondary"
                )}>Episode {epNum}</p>
                {isLastWatched && (
                  <span className="px-1.5 py-0.5 bg-secondary text-background text-[8px] font-black uppercase tracking-[0.2em] skew-x-[-15deg]">
                    RESUME
                  </span>
                )}
              </div>
              <p className="text-[10px] text-muted-text font-mono mt-0.5 uppercase tracking-wider">{ep.date || ep.uploaded_on || 'Released'}</p>
            </div>

            {/* Play Icon */}
            <div 
              className={cn(
                "w-8 h-8 flex items-center justify-center border transition-all z-10 shrink-0",
                isLastWatched 
                  ? "border-secondary bg-secondary/10 shadow-[0_0_10px_rgba(34,197,94,0.3)]" 
                  : "border-secondary/20 group-hover:border-secondary bg-background"
              )}
              style={{ clipPath: 'polygon(4px 0, 100% 0, 100% calc(100% - 4px), calc(100% - 4px) 100%, 0 100%, 0 4px)' }}
            >
              <Play className={cn(
                "w-3.5 h-3.5 transition-colors translate-x-[1px]",
                isLastWatched ? "text-secondary fill-current" : "text-muted-text group-hover:text-secondary group-hover:fill-secondary/50"
              )} />
            </div>
          </Link>
        );
      })}
    </div>
  );
}
