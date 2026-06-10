'use client';

import React from 'react';
import { useHistory } from '@/lib/hooks/useHistory';
import { AnimeCard } from './AnimeCard';
import { ChevronRight } from '@carbon/icons-react';
import Link from 'next/link';

export function ContinueWatchingHome() {
  const { history } = useHistory();

  // If no history, don't show the section
  if (!history || history.length === 0) return null;

  // Manual limit of 6 items for 1 row on desktop
  const displayItems = history.slice(0, 6);

  return (
    <section className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-end justify-between mb-8 border-b border-white/5 pb-4">
        <div className="space-y-2">
          <div className="flex items-baseline space-x-3">
            <span className="text-secondary font-mono font-black text-xl leading-none">{'//'}</span>
            <h2 className="text-2xl md:text-3xl font-serif font-black uppercase tracking-tighter">Continue Watching</h2>
          </div>
          <p className="text-[10px] font-mono font-bold uppercase tracking-[0.3em] text-muted-text pl-8">
            Pick up where you left off
          </p>
        </div>
        <Link 
          href="/library" 
          className="group hidden sm:flex items-center space-x-2 px-4 py-2 bg-card/30 hover:bg-secondary/10 border border-white/5 hover:border-secondary/30 transition-colors text-[10px] uppercase font-black tracking-widest text-muted-text hover:text-foreground"
        >
          <span>View History</span> 
          <ChevronRight className="w-3.5 h-3.5 text-secondary group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {/* Mobile View All */}
      <div className="sm:hidden mb-6 flex justify-end">
        <Link 
          href="/library" 
          className="group flex items-center space-x-2 text-[10px] uppercase font-black tracking-widest text-secondary"
        >
          <span>View History</span> 
          <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      <div className="mobile-snap-scroll gap-4 md:gap-6">
        {displayItems.map((item) => {
          // Extract episode number if possible from title for cleaner display
          const epMatch = item.lastEpisodeTitle.match(/Episode\s+(\d+)/i);
          const displayEp = epMatch ? `Episode ${epMatch[1]}` : item.lastEpisodeTitle;

          return (
            <AnimeCard
              key={item.animeId}
              id={item.animeId}
              title={item.animeTitle}
              image={item.animeImage}
              episode={displayEp}
              hideBookmark
            />
          );
        })}
      </div>
    </section>
  );
}
