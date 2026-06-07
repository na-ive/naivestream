'use client';

import React, { useState } from 'react';
import { AnimeAPI } from '@/lib/api';
import { AnimeCard } from '@/components/anime/AnimeCard';
import { Loader2, ChevronDown } from 'lucide-react';

interface GenreAnimeListProps {
  initialAnime: any[];
  slug: string;
}

export function GenreAnimeList({ initialAnime, slug }: GenreAnimeListProps) {
  const [animeList, setAnimeList] = useState<any[]>(initialAnime);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(initialAnime.length === 15);

  const loadMore = async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    
    const nextPage = page + 1;
    const res = await AnimeAPI.otakudesu.getGenreAnime(slug, nextPage);
    const newAnime = res?.data?.animeList || [];
    
    if (newAnime.length > 0) {
      setAnimeList((prev) => [...prev, ...newAnime]);
      setPage(nextPage);
      if (newAnime.length < 15) {
        setHasMore(false);
      }
    } else {
      setHasMore(false);
    }
    
    setLoading(false);
  };

  return (
    <div className="space-y-12">
      <div className="anime-grid">
        {animeList.map((anime: any, index: number) => (
          <AnimeCard
            key={`${anime.animeId || anime.id}-${index}`}
            id={anime.animeId || anime.id}
            title={anime.title}
            image={anime.poster || anime.image}
            rating={anime.score || anime.rating}
            status={anime.status || anime.season}
          />
        ))}
      </div>

      {hasMore && (
        <div className="flex justify-center mt-12">
          <button
            onClick={loadMore}
            disabled={loading}
            className="group flex items-center justify-center space-x-2 px-8 py-4 bg-background border-2 border-secondary/20 hover:border-secondary hover:bg-secondary/5 transition-all w-full max-w-sm font-black uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ clipPath: 'polygon(15px 0, 100% 0, 100% calc(100% - 15px), calc(100% - 15px) 100%, 0 100%, 0 15px)' }}
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 text-secondary animate-spin" />
                <span className="text-secondary">Scanning Data...</span>
              </>
            ) : (
              <>
                <span className="text-foreground group-hover:text-secondary transition-colors">Load More</span>
                <ChevronDown className="w-5 h-5 text-secondary group-hover:translate-y-1 transition-transform" />
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
