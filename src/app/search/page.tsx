'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { AnimeAPI } from '@/lib/api';
import { AnimeCard } from '@/components/anime/AnimeCard';
import { Search as SearchIcon, Loader2, Frown } from 'lucide-react';

function SearchContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [filterGenre, setFilterGenre] = useState<string>('All');

  useEffect(() => {
    async function doSearch() {
      if (!query) return;
      setLoading(true);
      const res = await AnimeAPI.search(query);
      setResults(res);
      setLoading(false);
    }
    doSearch();
  }, [query]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="space-y-4 mb-12">
        <div className="flex items-center space-x-3 text-secondary">
          <SearchIcon className="w-8 h-8" />
          <h1 className="text-3xl md:text-4xl font-bold">Search Results</h1>
        </div>
        <p className="text-muted-text">
          {query ? `Showing results for "${query}"` : 'Enter a keyword to search anime'}
        </p>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <Loader2 className="w-12 h-12 text-secondary animate-spin" />
          <p className="text-muted-text font-medium">Searching through the archives...</p>
        </div>
      ) : results?.data?.length > 0 ? (
        <div className="space-y-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card border-2 border-secondary/20 p-4">
            <span className="text-sm font-bold text-muted-text uppercase tracking-widest">
              Found {results.data.length} Results from {results.source}
            </span>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-widest text-muted-text">Status:</span>
                <select 
                  className="bg-background border-2 border-secondary/20 text-foreground text-sm font-bold uppercase tracking-wider p-2 outline-none focus:border-secondary transition-colors"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="All">All Status</option>
                  <option value="Ongoing">Ongoing</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-widest text-muted-text">Genre:</span>
                <select 
                  className="bg-background border-2 border-secondary/20 text-foreground text-sm font-bold uppercase tracking-wider p-2 outline-none focus:border-secondary transition-colors"
                  value={filterGenre}
                  onChange={(e) => setFilterGenre(e.target.value)}
                >
                  <option value="All">All Genres</option>
                  {/* Extract unique genres from results */}
                  {Array.from(new Set(
                    results.data.flatMap((anime: any) => 
                      anime.genreList?.map((g: any) => g.title) || []
                    )
                  )).sort().map((genre: any) => (
                    <option key={genre} value={genre}>{genre}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Filtered Grid */}
          <div className="anime-grid">
            {results.data
              .filter((anime: any) => {
                if (filterStatus !== 'All' && anime.status !== filterStatus) return false;
                if (filterGenre !== 'All') {
                  const animeGenres = anime.genreList?.map((g: any) => g.title) || [];
                  if (!animeGenres.includes(filterGenre)) return false;
                }
                return true;
              })
              .map((anime: any) => (
              <AnimeCard
                key={anime.animeId || anime.id}
                id={anime.animeId || anime.id}
                title={anime.title}
                image={anime.poster || anime.image}
                rating={anime.score || anime.rating}
                status={anime.status}
              />
            ))}
          </div>
        </div>
      ) : query ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-6 text-center">
          <div className="w-20 h-20 bg-card rounded-full flex items-center justify-center border border-border">
            <Frown className="w-10 h-10 text-muted-text" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold">No results found</h2>
            <p className="text-muted-text max-w-xs mx-auto">We couldn&apos;t find any anime matching your search. Try different keywords!</p>
          </div>
        </div>
      ) : (
        <div className="text-center py-20 text-muted-text">
          Enter a keyword in the search bar above to begin.
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <Loader2 className="w-12 h-12 text-secondary animate-spin" />
        <p className="text-muted-text font-medium">Loading search...</p>
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}
