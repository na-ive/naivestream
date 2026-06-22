'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Grid, List, ChevronRight } from '@carbon/icons-react';
import { cn } from '@/lib/utils';

interface GenreViewProps {
  genres: any[];
}

export function GenreView({ genres }: GenreViewProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  return (
    <div>
      {/* View Toggle */}
      <div className="flex justify-end mb-8">
        <div 
          className="inline-flex bg-card/50 border border-secondary/30 p-1 relative"
        >
          <button
            onClick={() => setViewMode('grid')}
            className={cn(
              "flex items-center gap-2 px-6 py-2.5 font-bold uppercase tracking-widest text-xs transition-all",
              viewMode === 'grid'
                ? "bg-secondary text-background shadow-[0_0_15px_rgba(34,197,94,0.4)]"
                : "text-muted-text hover:text-foreground hover:bg-secondary/10"
            )}
          >
            <Grid className="w-4 h-4" />
            <span className="hidden sm:inline">Grid</span>
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={cn(
              "flex items-center gap-2 px-6 py-2.5 font-bold uppercase tracking-widest text-xs transition-all",
              viewMode === 'list'
                ? "bg-secondary text-background shadow-[0_0_15px_rgba(34,197,94,0.4)]"
                : "text-muted-text hover:text-foreground hover:bg-secondary/10"
            )}
          >
            <List className="w-4 h-4" />
            <span className="hidden sm:inline">List</span>
          </button>
        </div>
      </div>

      {/* Content */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {genres.map((genre) => (
            <Link
              key={genre.genreId}
              href={`/genre/${genre.genreId}`}
              className="group relative h-24 bg-card/40 border border-secondary/10 hover:border-secondary/40 flex items-center justify-center transition-all hover:bg-secondary/10 overflow-hidden"
              style={{
                clipPath: 'polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)'
              }}
            >
              <div className="absolute inset-0 bg-secondary/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300 pointer-events-none" />
              <div className="flex flex-col items-center justify-center relative z-10 px-2">
                <span className="font-black uppercase tracking-widest text-sm text-center group-hover:text-secondary transition-colors">
                  {genre.title}
                </span>
                <span className="text-[11px] font-mono font-bold text-secondary/80 mt-1 group-hover:text-secondary transition-colors">
                  [{genre.count}]
                </span>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {genres.map((genre) => (
            <Link
              key={genre.genreId}
              href={`/genre/${genre.genreId}`}
              className="group flex items-center justify-between p-4 bg-background/30 hover:bg-secondary/10 border-b border-white/5 transition-all relative overflow-hidden"
            >
              <div className="absolute inset-y-0 left-0 w-1 bg-secondary scale-y-0 group-hover:scale-y-100 transition-transform origin-top" />
              <span className="font-black uppercase tracking-widest text-sm sm:text-base group-hover:text-secondary transition-colors pl-2">
                {genre.title}
              </span>
              <div className="flex items-center gap-4">
                <span className="text-[11px] font-mono font-bold text-secondary/80 group-hover:text-secondary transition-colors">
                  [{genre.count}]
                </span>
                <ChevronRight className="w-5 h-5 text-muted-text group-hover:text-secondary transition-transform group-hover:translate-x-1" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
