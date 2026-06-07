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
      <div className="flex flex-col md:flex-row md:items-start justify-between mb-12 gap-6">
        <div className="space-y-6">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-secondary/10 text-secondary border border-secondary/30 relative">
              <HistoryIcon className="w-8 h-8 relative z-10" />
              <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-secondary" />
              <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-secondary" />
            </div>
            <h1 className="text-4xl md:text-5xl font-serif font-black uppercase tracking-tighter">History<span className="text-secondary">_</span></h1>
          </div>
          
          <div className="inline-block px-6 py-3 bg-card/80 border-l-4 border-secondary/50 shadow-lg relative overflow-hidden"
               style={{ clipPath: 'polygon(0 0, 100% 0, calc(100% - 15px) 100%, 0 100%)' }}>
            <div className="absolute inset-0 bg-gradient-to-r from-secondary/10 to-transparent pointer-events-none" />
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-foreground/80 relative z-10">
              Your locally saved watch progress
            </p>
          </div>
        </div>
        
        {history.length > 0 && (
          <button 
            onClick={() => {
              if (confirm('Clear all history?')) {
                localStorage.removeItem('anime_history');
                window.location.reload();
              }
            }}
            className="flex items-center space-x-3 px-6 py-2.5 bg-red-100 dark:bg-red-950/50 text-red-600 dark:text-red-500 border border-red-300 dark:border-red-900/50 hover:bg-red-200 dark:hover:bg-red-900/80 hover:text-red-700 dark:hover:text-red-400 transition-all font-black text-[10px] uppercase tracking-[0.2em] cursor-pointer"
            style={{ clipPath: 'polygon(6px 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%, 0 6px)' }}
          >
            <Trash2 className="w-4 h-4 shrink-0" />
            <span>Clear History</span>
          </button>
        )}
      </div>

      {history.length === 0 ? (
        <div 
          className="flex flex-col items-center justify-center py-20 space-y-6 text-center bg-card/30 border-y border-secondary/20 relative"
          style={{ clipPath: 'polygon(30px 0, 100% 0, 100% calc(100% - 30px), calc(100% - 30px) 100%, 0 100%, 0 30px)' }}
        >
          <div 
            className="w-20 h-20 bg-card flex items-center justify-center shadow-[0_0_20px_rgba(34,197,94,0.15)] border border-secondary/30"
            style={{ clipPath: 'polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)' }}
          >
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
              
              <div 
                className="mt-3 p-3 bg-card border border-secondary/10 group-hover:border-secondary/30 transition-all relative"
              >
                <div className="absolute inset-0 bg-gradient-to-t from-secondary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                <p className="text-[9px] text-muted-text font-black uppercase tracking-[0.2em] mb-1.5">
                  Resume Point
                </p>
                <Link 
                  href={`/watch/${item.lastEpisodeId}?anime=${item.animeId}&title=${encodeURIComponent(item.animeTitle)}&img=${encodeURIComponent(item.animeImage)}`}
                  className="flex items-center justify-between group/ep"
                >
                  <span className="text-[11px] font-bold truncate pr-3 group-hover/ep:text-secondary transition-colors uppercase tracking-widest leading-relaxed">
                    {item.lastEpisodeTitle}
                  </span>
                  <div className="w-6 h-6 bg-secondary/10 flex items-center justify-center group-hover/ep:bg-secondary/20 transition-colors shrink-0">
                    <Play className="w-3 h-3 text-secondary fill-current" />
                  </div>
                </Link>
              </div>

              <button
                onClick={() => removeFromHistory(item.animeId)}
                className="absolute top-2 right-2 w-8 h-8 bg-red-100/80 dark:bg-red-950/70 border border-red-300/80 dark:border-red-900/80 text-red-600 dark:text-red-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-red-200 dark:hover:bg-red-900 hover:text-red-700 dark:hover:text-red-400 cursor-pointer z-20"
                style={{ clipPath: 'polygon(6px 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%, 0 6px)' }}
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
