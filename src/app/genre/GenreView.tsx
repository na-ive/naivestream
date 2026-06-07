'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { LayoutGrid, List as ListIcon, ChevronRight } from 'lucide-react';
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
        <div className="inline-flex bg-background border-2 border-secondary/20 p-1">
          <button
            onClick={() => setViewMode('grid')}
            className={cn(
              "flex items-center gap-2 px-4 py-2 font-bold uppercase tracking-widest text-xs transition-all",
              viewMode === 'grid'
                ? "bg-secondary text-background shadow-[0_0_10px_rgba(34,197,94,0.3)]"
                : "text-muted-text hover:text-foreground"
            )}
          >
            <LayoutGrid className="w-4 h-4" />
            <span className="hidden sm:inline">Grid</span>
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={cn(
              "flex items-center gap-2 px-4 py-2 font-bold uppercase tracking-widest text-xs transition-all",
              viewMode === 'list'
                ? "bg-secondary text-background shadow-[0_0_10px_rgba(34,197,94,0.3)]"
                : "text-muted-text hover:text-foreground"
            )}
          >
            <ListIcon className="w-4 h-4" />
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
              className="group relative h-24 bg-card border-2 border-secondary/20 hover:border-secondary flex items-center justify-center transition-all hover:bg-secondary/5 hover:shadow-[0_0_15px_rgba(34,197,94,0.2)] overflow-hidden"
              style={{
                clipPath: 'polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)'
              }}
            >
              <div className="absolute inset-0 bg-secondary/5 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              <span className="relative z-10 font-black uppercase tracking-widest text-sm text-center px-2 group-hover:text-secondary transition-colors">
                {genre.title}
              </span>
            </Link>
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {genres.map((genre) => (
            <Link
              key={genre.genreId}
              href={`/genre/${genre.genreId}`}
              className="group flex items-center justify-between p-5 bg-card border-l-4 border-secondary/20 hover:border-secondary hover:bg-secondary/5 transition-all"
            >
              <span className="font-black uppercase tracking-widest text-sm sm:text-base group-hover:text-secondary transition-colors">
                {genre.title}
              </span>
              <div className="flex items-center gap-4">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-text hidden sm:block">
                  Explore
                </span>
                <ChevronRight className="w-5 h-5 text-secondary transition-transform group-hover:translate-x-2" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
