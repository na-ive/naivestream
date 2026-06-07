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
            <h1 className="text-3xl md:text-4xl font-bold">Your History</h1>
          </div>
          <p className="text-gray-500">Continue where you left off. Saved locally on your device.</p>
        </div>
        
        {history.length > 0 && (
          <button 
            onClick={() => {
              if (confirm('Clear all history?')) {
                localStorage.removeItem('anime_history');
                window.location.reload();
              }
            }}
            className="flex items-center space-x-2 px-4 py-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors font-bold text-sm"
          >
            <Trash2 className="w-4 h-4" />
            <span>Clear History</span>
          </button>
        )}
      </div>

      {history.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-6 text-center">
          <div className="w-20 h-20 bg-card rounded-full flex items-center justify-center border border-border">
            <Clock className="w-10 h-10 text-gray-400" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold">No history found</h2>
            <p className="text-gray-500 max-w-xs mx-auto">Start watching some anime to track your progress here!</p>
          </div>
          <Link href="/" className="btn-primary">
            Explore Anime
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
                status="Recently Watched"
              />
              
              <div className="mt-2 p-3 bg-card rounded-xl border border-border group-hover:border-secondary transition-all">
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">Last Episode</p>
                <Link 
                  href={`/watch/${item.lastEpisodeId}?anime=${item.animeId}&title=${encodeURIComponent(item.animeTitle)}&img=${encodeURIComponent(item.animeImage)}`}
                  className="flex items-center justify-between group/ep"
                >
                  <span className="text-xs font-bold truncate pr-2 group-hover/ep:text-secondary transition-colors">
                    {item.lastEpisodeTitle}
                  </span>
                  <Play className="w-3 h-3 text-secondary fill-current shrink-0" />
                </Link>
              </div>

              <button
                onClick={() => removeFromHistory(item.animeId)}
                className="absolute top-2 right-2 p-2 bg-black/60 backdrop-blur-md rounded-lg text-white opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-500"
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
