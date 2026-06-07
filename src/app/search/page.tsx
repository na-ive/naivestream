'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { AnimeAPI } from '@/lib/api';
import { AnimeCard } from '@/components/anime/AnimeCard';
import { CustomSelect } from '@/components/ui/CustomSelect';
import { Search as SearchIcon, Renew, FaceDissatisfied } from '@carbon/icons-react';

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
      <div className="mb-12">
        <div className="flex items-center space-x-4 mb-6">
          <div className="p-3 bg-secondary/10 text-secondary border border-secondary/30 relative">
            <SearchIcon className="w-8 h-8 relative z-10" />
            <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-secondary" />
            <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-secondary" />
          </div>
          <h1 className="text-4xl md:text-5xl font-serif font-black uppercase tracking-tighter">Search<span className="text-secondary">_</span></h1>
        </div>
        
        <div className="inline-block px-6 py-3 bg-card/80 border-l-4 border-secondary/50 shadow-lg relative overflow-hidden"
             style={{ clipPath: 'polygon(0 0, 100% 0, calc(100% - 15px) 100%, 0 100%)' }}>
          <div className="absolute inset-0 bg-gradient-to-r from-secondary/10 to-transparent pointer-events-none" />
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-foreground/80 relative z-10">
            {query ? (
              <>Showing results for <span className="text-secondary ml-1">"{query}"</span></>
            ) : (
              'Enter a keyword to search anime'
            )}
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <Renew className="w-12 h-12 text-secondary animate-spin" />
          <p className="text-muted-text font-medium">Searching through the archives...</p>
        </div>
      ) : results?.data?.length > 0 ? (
        <div className="space-y-8">
          <div 
            className="mb-8 bg-card/50 border-y border-secondary/30 p-6 md:p-8 relative flex flex-col md:flex-row md:items-center justify-between gap-6"
            style={{ clipPath: 'polygon(20px 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%, 0 20px)' }}
          >
            <div className="relative z-10 flex items-center">
              <span className="text-xs font-black text-foreground uppercase tracking-widest">
                Found <span className="text-secondary">{results.data.length}</span> Results from {results.source}
              </span>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-widest text-muted-text">Status:</span>
                <CustomSelect
                  value={filterStatus}
                  onChange={setFilterStatus}
                  options={[
                    { value: 'All', label: 'All Status' },
                    { value: 'Ongoing', label: 'Ongoing' },
                    { value: 'Completed', label: 'Completed' },
                  ]}
                />
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-widest text-muted-text">Genre:</span>
                <CustomSelect
                  value={filterGenre}
                  onChange={setFilterGenre}
                  options={[
                    { value: 'All', label: 'All Genres' },
                    ...Array.from(new Set(
                      results.data.flatMap((anime: any) => 
                        anime.genreList?.map((g: any) => g.title) || []
                      )
                    )).sort().map((genre: any) => ({
                      value: genre,
                      label: genre
                    }))
                  ]}
                />
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
            <FaceDissatisfied className="w-10 h-10 text-muted-text" />
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
        <Renew className="w-12 h-12 text-secondary animate-spin" />
        <p className="text-muted-text font-medium">Loading search...</p>
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}
