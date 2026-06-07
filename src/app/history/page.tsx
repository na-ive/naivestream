'use client';

import React from 'react';
import { useHistory } from '@/lib/hooks/useHistory';
import { AnimeCard } from '@/components/anime/AnimeCard';
import { History as HistoryIcon, Trash2, Clock, Play } from 'lucide-react';
import Link from 'next/link';

export default function HistoryPage() {
  const { history, removeFromHistory } = useHistory();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-4">
        <div className="space-y-2">
          <div className="flex items-center space-x-3 text-secondary">
            <HistoryIcon className="w-8 h-8" />
            <h1 className="text-3xl md:text-5xl font-black">History</h1>
          </div>
          <p className="text-foreground/60 font-bold uppercase tracking-widest text-xs">Your locally saved watch progress</p>
        </div>
        
        {history.length > 0 && (
          <button 
            onClick={() => {
              if (confirm('Clear all history?')) {
                localStorage.removeItem('anime_history');
                window.location.reload();
              }
            }}
            className="flex items-center space-x-2 px-6 py-3 bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white transition-all font-bold text-xs uppercase tracking-widest cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            <span>Clear History</span>
          </button>
        )}
      </div>

      {history.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-6 text-center border-2 border-dashed border-secondary/10">
          <div className="w-20 h-20 bg-card flex items-center justify-center border-2 border-secondary/20 shadow-[0_0_15px_rgba(34,197,94,0.1)]">
            <Clock className="w-10 h-10 text-foreground/20" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold uppercase">No history detected</h2>
            <p className="text-foreground/40 text-xs font-bold uppercase tracking-widest">Start watching to track progress</p>
          </div>
          <Link href="/" className="btn-primary">
            Browse Anime
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {history.map((item) => (
            <div key={item.animeId} className="relative group">
              <AnimeCard
                id={item.animeId}
                title={item.animeTitle}
                image={item.animeImage}
              />
              
              <div className="mt-4 p-4 bg-card border-2 border-secondary/10 group-hover:border-secondary transition-all">
                <p className="text-[10px] text-secondary font-black uppercase tracking-[0.2em] mb-2">Resume Point</p>
                <Link 
                  href={`/watch/${item.lastEpisodeId}?anime=${item.animeId}&title=${encodeURIComponent(item.animeTitle)}&img=${encodeURIComponent(item.animeImage)}`}
                  className="flex items-center justify-between group/ep"
                >
                  <span className="text-xs font-black truncate pr-4 group-hover/ep:text-secondary transition-colors uppercase tracking-widest">
                    {item.lastEpisodeTitle}
                  </span>
                  <Play className="w-4 h-4 text-secondary fill-current shrink-0 shadow-[0_0_10px_rgba(34,197,94,0.3)]" />
                </Link>
              </div>

              <button
                onClick={() => removeFromHistory(item.animeId)}
                className="absolute top-3 right-3 w-8 h-8 bg-black/80 backdrop-blur-md border border-red-500/50 text-red-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500 hover:text-white cursor-pointer z-20"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
