'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { CaretRight, StarFilled, Terminal, Warning } from '@carbon/icons-react';
import { motion } from 'framer-motion';
import { BookmarkButton } from './BookmarkButton';
import { Skeleton } from '@/components/ui/Skeleton';
import { cn } from '@/lib/utils';
import { useTitleLang } from '@/lib/providers/TitleLangProvider';

interface AnimeCardProps {
  id: string;
  title: string;
  titleEnglish?: string;
  image: string;
  status?: string;
  rating?: string;
  episode?: string;
  type?: string;
  hideBookmark?: boolean;
  disableHover?: boolean;
  totalEpisodes?: number;
}

export function AnimeCard({ id, title, titleEnglish, image, status, rating, episode, type, hideBookmark = false, disableHover = false, totalEpisodes }: AnimeCardProps) {
  const isEmpty = totalEpisodes === 0;
  const [imgLoaded, setImgLoaded] = useState(false);
  const { titleLang } = useTitleLang();
  const displayTitle = titleLang === 'en' && titleEnglish ? titleEnglish : title;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className={cn("relative flex flex-col h-full", !disableHover && "group")}
    >
      <Link href={`/anime/${id}`} className={cn(
        "block relative aspect-[3/4] overflow-hidden bg-card border-2 transition-all",
        isEmpty ? "border-[#EAB308]" : "border-secondary/20 group-hover:border-secondary"
      )}>
        {!imgLoaded && (
          <div className="absolute inset-0 z-10">
            <Skeleton className="w-full h-full rounded-none" />
          </div>
        )}
        <img
          src={image}
          alt={title}
          className={cn(
            "w-full h-full object-cover transition-all duration-500",
            imgLoaded ? "opacity-100 group-hover:scale-110" : "opacity-0"
          )}
          loading="lazy"
          onLoad={() => setImgLoaded(true)}
          onError={() => setImgLoaded(true)}
        />

        {/* Warning Layer for Empty Episodes - SOLID VIBRANT STYLE */}
        {isEmpty && (
          <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
            <div className="w-20 h-20 bg-[#EAB308] flex items-center justify-center shadow-[0_0_30px_rgba(234,179,8,0.5)]">
              <Warning className="w-12 h-12 text-black fill-current" />
            </div>
            <div className="mt-4 bg-[#EAB308] text-black px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] shadow-[0_0_15px_rgba(234,179,8,0.3)]">
              NO EPISODE IN DB
            </div>
          </div>
        )}
        
        {/* Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300" />
        
        {!isEmpty && (
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <div className="w-16 h-16 bg-secondary text-background flex items-center justify-center shadow-[0_0_25px_rgba(34,197,94,0.6)] animate-pulse">
              <CaretRight className="fill-current w-8 h-8 ml-1" />
            </div>
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2 z-20">
          {rating && (
            <div className={cn(
              "flex items-center space-x-1.5 px-2 py-1 bg-background/90 backdrop-blur-md border text-[10px] font-black uppercase tracking-tighter",
              isEmpty ? "border-[#EAB308]/50 text-[#EAB308]" : "border-secondary/50 text-secondary"
            )}>
              <StarFilled className="w-3 h-3 fill-current" />
              <span>{rating}</span>
            </div>
          )}
          {status && (
            <div className={cn(
              "flex items-center space-x-1.5 px-2 py-1 text-background text-[10px] font-black uppercase tracking-tighter",
              isEmpty ? "bg-[#EAB308] text-black" : "bg-secondary"
            )}>
              <Terminal className="w-3 h-3" />
              <span>{status}</span>
            </div>
          )}
        </div>

        {episode && !isEmpty && (
          <div className="absolute bottom-3 right-3 px-3 py-1 bg-background/90 backdrop-blur-md border-r-4 border-secondary text-[10px] font-black text-foreground tracking-widest uppercase z-20">
            {episode}
          </div>
        )}

        {/* Scanline Effect */}
        <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.02),rgba(0,255,0,0.01),rgba(0,0,255,0.02))] bg-[length:100%_4px,100%_100%] z-30" />
      </Link>

      {/* Bookmark Button (Outside Link) */}
      {!hideBookmark && (
        <div className="absolute top-2 right-2 z-40 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
          <BookmarkButton animeId={id} animeTitle={title} animeTitleEnglish={titleEnglish} animeImage={image} />
        </div>
      )}

      <div className="mt-4 space-y-2">
        <h3 className={cn(
          "text-xs font-serif font-black uppercase tracking-widest line-clamp-2 transition-colors h-8",
          isEmpty ? "text-[#EAB308]/70 group-hover:text-[#EAB308]" : "group-hover:text-secondary"
        )}>
          {displayTitle}
        </h3>
      </div>
    </motion.div>
  );
}

export function AnimeCardSkeleton() {
  return (
    <div className="relative flex flex-col h-full">
      <div className="block relative aspect-[3/4] overflow-hidden bg-card border-2 border-secondary/10">
        <Skeleton className="absolute inset-0" />
        <div className="absolute top-3 left-3 flex flex-col gap-2 z-20">
          <Skeleton className="w-14 h-[22px]" />
          <Skeleton className="w-[76px] h-[22px]" />
        </div>
        <Skeleton className="absolute bottom-3 right-3 w-[68px] h-[22px]" />
        <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%)] bg-[length:100%_4px] z-30" />
      </div>
      <div className="mt-4 space-y-2">
        <Skeleton className="h-8 w-full" />
      </div>
    </div>
  );
}
