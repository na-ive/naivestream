'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { AnimeCard } from '@/components/anime/AnimeCard';
import { CustomSelect } from '@/components/ui/CustomSelect';
import { Search as SearchIcon, Renew, FaceDissatisfied } from '@carbon/icons-react';

function SearchContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const [results, setResults] = useState<any[]>([]);
  const [genres, setGenres] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [filterGenre, setFilterGenre] = useState<string>('All');
  const [filterType, setFilterType] = useState<string>('All');

  useEffect(() => {
    async function fetchGenres() {
      try {
        const res = await fetch('/api/genres');
        const data = await res.json();
        setGenres(data || []);
      } catch (e) {
        console.error('Failed to fetch genres');
      }
    }
    fetchGenres();
  }, []);

  useEffect(() => {
    async function doSearch() {
      if (!query && filterStatus === 'All' && filterGenre === 'All' && filterType === 'All') {
        setResults([]);
        return;
      }
      
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (query) params.set('q', query);
        if (filterStatus !== 'All') params.set('status', filterStatus);
        if (filterGenre !== 'All') params.set('genre', filterGenre);
        if (filterType !== 'All') params.set('type', filterType);
        
        const res = await fetch(`/api/search?${params.toString()}`);
        const data = await res.json();
        setResults(data.items || []);
      } catch (e) {
        setResults([]);
      }
      setLoading(false);
    }
    doSearch();
  }, [query, filterStatus, filterGenre, filterType]);

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
              'Enter a keyword or use filters to search anime'
            )}
          </p>
        </div>
      </div>

      <div 
        className="mb-12 bg-card/50 border-y border-secondary/30 p-6 md:p-8 relative flex flex-wrap items-center justify-between gap-6"
        style={{ clipPath: 'polygon(20px 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%, 0 20px)' }}
      >
        <div className="relative z-10 flex items-center">
          <span className="text-xs font-black text-foreground uppercase tracking-widest">
            Found <span className="text-secondary">{results.length}</span> Results from database
          </span>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 relative z-10">
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
                ...genres.map(g => ({ value: g.slug, label: g.name }))
              ]}
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-widest text-muted-text">Type:</span>
            <CustomSelect
              value={filterType}
              onChange={setFilterType}
              options={[
                { value: 'All', label: 'All Types' },
                { value: 'TV', label: 'TV Series' },
                { value: 'Movie', label: 'Movie' },
                { value: 'OVA', label: 'OVA' },
                { value: 'ONA', label: 'ONA' },
                { value: 'Special', label: 'Special' },
              ]}
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <Renew className="w-12 h-12 text-secondary animate-spin" />
          <p className="text-muted-text font-medium">Searching through the archives...</p>
        </div>
      ) : results.length > 0 ? (
        <div className="anime-grid">
          {results.map((anime: any) => (
            <AnimeCard
              key={anime.slug}
              id={anime.slug}
              title={anime.title}
              image={anime.poster}
              rating={String(anime.score)}
              status={anime.status}
              episode={anime.status === 'Ongoing' ? `ep ${anime.latest_episode || '??'}` : `${anime.episodes_count || '??'} eps`}
            />
          ))}
        </div>
      ) : (query || filterStatus !== 'All' || filterGenre !== 'All' || filterType !== 'All') ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-6 text-center">
          <div className="w-20 h-20 bg-card rounded-full flex items-center justify-center border border-border">
            <FaceDissatisfied className="w-10 h-10 text-muted-text" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold">No results found</h2>
            <p className="text-muted-text max-w-xs mx-auto">We couldn&apos;t find any anime matching your search. Try different keywords or filters!</p>
          </div>
        </div>
      ) : (
        <div className="text-center py-20 text-muted-text uppercase tracking-widest text-xs font-bold">
          Enter a keyword or use filters above to begin.
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
