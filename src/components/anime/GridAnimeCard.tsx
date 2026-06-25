import React from 'react';
import Link from 'next/link';
import { CaretRight, StarFilled, Terminal, Warning } from '@carbon/icons-react';
import { BookmarkButton } from './BookmarkButton';
import { cn } from '@/lib/utils';
import { formatNextAiring } from "@/lib/utils";

export interface GridAnimeCardProps {
  id: string;
  title: string;
  titleEnglish?: string;
  image: string;
  status?: string;
  rating?: string;
  episode?: string;
  totalEpisodes?: number;
  priority?: boolean;
}

export function GridAnimeCard({ 
  id, title, titleEnglish, image, status, rating, episode, 
  totalEpisodes, priority = false
}: GridAnimeCardProps) {
  const isEmpty = totalEpisodes === 0;
  const optimizedImage = image ? image.replace('/cover/large/', '/cover/medium/') : image;

  return (
    <div className="relative flex h-full flex-col bg-card/0 border border-border/0 group">
      {/* Cover Image Container */}
      <Link href={`/anime/${id}`} className={cn(
        "block relative overflow-hidden flex-shrink-0 w-full aspect-[3/4] border-2 border-secondary/20 group-hover:border-secondary",
        isEmpty && "border-warning"
      )}>
        <img
          src={optimizedImage}
          alt={title}
          className="absolute inset-0 w-full h-full object-cover z-0"
          loading={priority ? "eager" : "lazy"}
          {...(priority ? { fetchPriority: "high" } : {})}
        />

        {/* Warning Layer for Empty Episodes */}
        {isEmpty && (
          <div className="absolute inset-0 flex flex-col items-center justify-center z-20 bg-black/60">
            <div className="w-16 h-16 bg-warning flex items-center justify-center shadow-[0_0_20px_var(--color-warning)]">
              <Warning className="w-8 h-8 text-black fill-current" />
            </div>
            <div className="mt-4 bg-warning text-black px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] shadow-[0_0_15px_var(--color-warning)]">
              NO EPISODE IN DB
            </div>
          </div>
        )}
        
        {/* Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300" />
        
        {!isEmpty && (
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <div className="w-16 h-16 bg-secondary text-background flex items-center justify-center shadow-[0_0_25px_rgba(34,197,94,0.6)]">
              <CaretRight className="fill-current w-8 h-8 ml-1" />
            </div>
          </div>
        )}

        {/* Badges on Grid Mode */}
        <div className="absolute top-3 left-3 flex flex-col gap-2 z-20 items-start">
          {rating && (
            <div className={cn(
              "flex items-center space-x-1.5 px-2 py-1 bg-background/90 border text-[10px] font-black uppercase tracking-tighter leading-none",
              isEmpty ? "border-warning/50 text-warning" : "border-secondary/50 text-secondary"
            )}>
              <StarFilled className="w-3 h-3 fill-current shrink-0" />
              <span>{rating}</span>
            </div>
          )}
          {status && (
            <div className={cn(
              "flex items-center space-x-1.5 px-2 py-1 text-background text-[10px] font-black uppercase tracking-tighter leading-none",
              isEmpty ? "bg-warning text-black" : "bg-secondary"
            )}>
              <Terminal className="w-3 h-3 shrink-0" />
              <span>{status}</span>
            </div>
          )}
        </div>

        {/* Episode Badge */}
        {episode && !isEmpty && (
          <div className="absolute px-3 py-1 bg-background/90 text-[10px] font-black text-foreground tracking-widest uppercase z-20 bottom-3 right-3 border-r-4 border-secondary">
            {episode}
          </div>
        )}
      </Link>

      {/* Content Area */}
      <div className="flex flex-col flex-grow mt-4 space-y-2">
        {/* Title */}
        <div className="flex justify-between items-start gap-4">
          <Link href={`/anime/${id}`} className="group/title min-w-0 flex-1 mb-1 sm:mb-2">
            <h3 className={cn(
              "font-black transition-colors font-serif uppercase tracking-widest text-xs line-clamp-2 h-8 group-hover/title:text-secondary",
              isEmpty && "text-warning/70 group-hover/title:text-warning"
            )}>
              <span className="title-jp">{title}</span>
              <span className="title-en">{titleEnglish || title}</span>
            </h3>
          </Link>

          {/* Bookmark Button */}
          <div className="z-40 transition-opacity absolute top-2 right-2 opacity-100 md:opacity-0 md:group-hover:opacity-100">
            <BookmarkButton animeId={id} animeTitle={title} animeTitleEnglish={titleEnglish} animeImage={image} />
          </div>
        </div>
      </div>
    </div>
  );
}
