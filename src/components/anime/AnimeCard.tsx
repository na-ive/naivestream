'use client';

import React from 'react';
import Link from 'next/link';
import { CaretRight, StarFilled, Terminal } from '@carbon/icons-react';
import { motion } from 'framer-motion';
import { BookmarkButton } from './BookmarkButton';
import { cn } from '@/lib/utils';

interface AnimeCardProps {
  id: string;
  title: string;
  image: string;
  status?: string;
  rating?: string;
  episode?: string;
  type?: string;
  hideBookmark?: boolean;
  disableHover?: boolean;
}

export function AnimeCard({ id, title, image, status, rating, episode, type, hideBookmark = false, disableHover = false }: AnimeCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className={cn("relative flex flex-col", !disableHover && "group")}
    >
      <Link href={`/anime/${id}`} className="block relative aspect-[3/4] overflow-hidden bg-card border-2 border-secondary/20 group-hover:border-secondary transition-all">
        {/* Decorative Corner */}
        <div className="absolute top-0 right-0 w-8 h-8 bg-secondary/20 transition-all group-hover:bg-secondary/40 clip-path-corner-tr" />
        
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 group-hover:rotate-1"
          loading="lazy"
        />
        
        {/* Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300" />
        
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <div className="w-16 h-16 bg-secondary text-background flex items-center justify-center shadow-[0_0_25px_rgba(34,197,94,0.6)] animate-pulse">
            <CaretRight className="fill-current w-8 h-8 ml-1" />
          </div>
        </div>

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {rating && (
            <div className="flex items-center space-x-1.5 px-2 py-1 bg-background/90 backdrop-blur-md border border-secondary/50 text-[10px] font-black text-secondary uppercase tracking-tighter">
              <StarFilled className="w-3 h-3 fill-current" />
              <span>{rating}</span>
            </div>
          )}
          {status && (
            <div className="flex items-center space-x-1.5 px-2 py-1 bg-secondary text-background text-[10px] font-black uppercase tracking-tighter">
              <Terminal className="w-3 h-3" />
              <span>{status}</span>
            </div>
          )}
          {type && (
            <div className="px-2 py-1 bg-secondary text-background text-[10px] font-black uppercase tracking-tighter">
              {type}
            </div>
          )}
        </div>

        {episode && (
          <div className="absolute bottom-3 right-3 px-3 py-1 bg-background/90 backdrop-blur-md border-r-4 border-secondary text-[10px] font-black text-foreground tracking-widest uppercase">
            {episode}
          </div>
        )}

        {/* Scanline Effect */}
        <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.02),rgba(0,255,0,0.01),rgba(0,0,255,0.02))] bg-[length:100%_4px,100%_100%]" />
      </Link>

      {/* Bookmark Button (Outside Link) */}
      {!hideBookmark && (
        <div className="absolute top-2 right-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
          <BookmarkButton animeId={id} animeTitle={title} animeImage={image} />
        </div>
      )}

      <div className="mt-4 space-y-2">
        <h3 className="text-xs font-serif font-black uppercase tracking-widest line-clamp-2 group-hover:text-secondary transition-colors h-8">
          {title}
        </h3>
      </div>
    </motion.div>
  );
}
