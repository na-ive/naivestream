'use client';

import React from 'react';
import { Bookmark } from 'lucide-react';
import { useWatchlist } from '@/lib/hooks/useWatchlist';
import { cn } from '@/lib/utils';
import { Tooltip } from '@/components/ui/Tooltip';

interface BookmarkButtonProps {
  animeId: string;
  animeTitle: string;
  animeImage: string;
  className?: string;
  variant?: 'icon' | 'full';
}

export function BookmarkButton({ animeId, animeTitle, animeImage, className, variant = 'icon' }: BookmarkButtonProps) {
  const { isInWatchlist, toggleWatchlist } = useWatchlist();
  
  // To avoid hydration mismatch, we don't render the active state until mounted
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => {
    setMounted(true);
  }, []);

  const active = mounted && isInWatchlist(animeId);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWatchlist({ animeId, animeTitle, animeImage });
  };

  if (variant === 'full') {
    return (
      <button
        onClick={handleClick}
        className={cn(
          "flex items-center justify-center space-x-2 px-6 py-3 font-black uppercase tracking-widest text-sm transition-all relative overflow-hidden group border",
          active 
            ? "bg-secondary/10 border-secondary text-secondary" 
            : "bg-card/50 hover:bg-secondary/10 border-white/5 hover:border-secondary/30 text-muted-text hover:text-foreground",
          className
        )}
      >
        <div className={cn(
          "absolute left-0 top-0 w-1 h-full transition-all",
          active ? "bg-secondary scale-y-100" : "bg-secondary scale-y-0 group-hover:scale-y-100"
        )} />
        <Bookmark className={cn("w-4 h-4", active && "fill-current")} />
        <span>{active ? 'In Watchlist' : 'Add to Watchlist'}</span>
      </button>
    );
  }

  // Icon variant
  return (
    <Tooltip content={active ? "Remove from Watchlist" : "Add to Watchlist"} position="top">
      <button
        onClick={handleClick}
        className={cn(
          "p-2 bg-background/90 backdrop-blur-md border transition-all relative overflow-hidden group",
          active ? "border-secondary text-secondary hover:border-red-500 hover:text-red-500 hover:bg-red-500/10" : "border-white/10 text-muted-text hover:border-secondary/50 hover:text-foreground",
          className
        )}
        style={{ clipPath: 'polygon(5px 0, 100% 0, 100% calc(100% - 5px), calc(100% - 5px) 100%, 0 100%, 0 5px)' }}
      >
        <div className={cn(
          "absolute bottom-0 left-0 h-1 w-full transition-all",
          active ? "bg-secondary scale-x-100 group-hover:bg-red-500" : "bg-secondary scale-x-0 group-hover:scale-x-100"
        )} />
        <Bookmark className={cn("w-4 h-4 relative z-10", active && "fill-current")} />
      </button>
    </Tooltip>
  );
}
