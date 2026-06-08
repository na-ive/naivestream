'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { CaretRight, ChevronLeft, ChevronRight, Search, List } from '@carbon/icons-react';
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
  const [currentPage, setCurrentPage] = useState(1);
  const [jumpValue, setJumpValue] = useState('');
  const itemsPerPage = 18;

  useEffect(() => {
    const saved = history.find(h => h.animeId === animeId);
    if (saved) setLastEpId(saved.lastEpisodeId);
  }, [history, animeId]);

  const totalPages = Math.ceil(episodes.length / itemsPerPage);
  
  const currentEpisodes = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return episodes.slice(start, start + itemsPerPage);
  }, [episodes, currentPage]);

  const handleJump = (e: React.FormEvent) => {
    e.preventDefault();
    const epNum = parseInt(jumpValue);
    if (isNaN(epNum)) return;

    // Find the index of the episode with this number
    // We assume episodes are numbered or in a certain order
    // In many APIs, index 0 is the latest episode.
    // If epNum 1 is at the end of the array (descending order):
    const index = episodes.findIndex((ep, i) => {
      const currentEpNum = ep.eps || (typeof ep.title === 'number' ? ep.title : null) || episodes.length - i;
      return currentEpNum === epNum;
    });

    if (index !== -1) {
      const page = Math.floor(index / itemsPerPage) + 1;
      setCurrentPage(page);
      setJumpValue('');
    }
  };

  return (
    <div className="space-y-6">
      {/* Navigation & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-secondary/20 pb-4">
        <div className="flex items-center space-x-3 text-lg font-serif font-black uppercase tracking-widest">
          <div className="w-1.5 h-6 bg-secondary" />
          <List className="w-5 h-5 text-secondary" />
          <h2>Episode List<span className="text-secondary opacity-70">_</span></h2>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {episodes.length > itemsPerPage ? (
            <>
              {/* Jump to Episode */}
              <form onSubmit={handleJump} className="relative group">
                <input 
                  type="text" 
                  placeholder="Jump to EP..."
                  value={jumpValue}
                  onChange={(e) => setJumpValue(e.target.value)}
                  className="bg-card/50 border border-white/10 px-3 py-1.5 pl-8 text-[10px] font-black uppercase tracking-widest w-32 group-hover:border-secondary/50 focus:border-secondary focus:outline-none transition-all"
                  style={{ clipPath: 'polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)' }}
                />
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-text group-hover:text-secondary transition-colors" />
              </form>

              {/* Navigation Arrows */}
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-text mr-2">
                  Page {currentPage}/{totalPages}
                </span>
                <button 
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="w-8 h-8 flex items-center justify-center bg-card border border-white/10 hover:border-secondary hover:text-secondary transition-colors disabled:opacity-30 disabled:pointer-events-none"
                  aria-label="Previous page"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="w-8 h-8 flex items-center justify-center bg-card border border-white/10 hover:border-secondary hover:text-secondary transition-colors disabled:opacity-30 disabled:pointer-events-none"
                  aria-label="Next page"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </>
          ) : (
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-text">
              {episodes.length} Total Episodes
            </span>
          )}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {currentEpisodes.map((ep: any, index: number) => {
          // Calculate actual index in the global episodes array
          const globalIndex = (currentPage - 1) * itemsPerPage + index;
          const epNum = ep.eps || (typeof ep.title === 'number' ? ep.title : null) || episodes.length - globalIndex;
          const currentEpId = ep.episodeId || ep.id;
          const isLastWatched = lastEpId === currentEpId;

          return (
            <Link
              key={`${currentEpId}-${globalIndex}`}
              href={`/watch/${currentEpId}?anime=${animeId}&title=${encodeURIComponent(animeTitle)}&img=${encodeURIComponent(poster)}&source=${source}`}
              className={cn(
                "flex items-center p-3 transition-all group relative overflow-hidden h-20",
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
                <CaretRight className={cn(
                  "w-3.5 h-3.5 transition-colors translate-x-[1px]",
                  isLastWatched ? "text-secondary" : "text-muted-text group-hover:text-secondary"
                )} />
              </div>
            </Link>
          );
        })}
      </div>

      {/* Footer count info */}
      {episodes.length > itemsPerPage && (
        <div className="flex justify-center pt-2">
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-text opacity-50">
            Showing {currentEpisodes.length} of {episodes.length} Episodes
          </span>
        </div>
      )}
    </div>
  );
}
