'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { AnimeCard } from '@/components/anime/AnimeCard';
import { CustomSelect } from '@/components/ui/CustomSelect';
import { Pagination } from '@/components/layout/Pagination';
import { cn } from '@/lib/utils';
import { Search as SearchIcon, Renew, FaceDissatisfied } from '@carbon/icons-react';

function SearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // URL params
  const query = searchParams.get('q') || '';
  const genre = searchParams.get('genre') || 'All';
  const status = searchParams.get('status') || 'All';
  const type = searchParams.get('type') || 'All';
  const order = searchParams.get('order') || 'popularity';
  const letter = searchParams.get('letter') || 'ALL';
  const year = searchParams.get('year') || 'All';
  const season = searchParams.get('season') || 'All';
  const page = parseInt(searchParams.get('page') || '1');

  const [results, setResults] = useState<any[]>([]);
  const [genres, setGenres] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current_page: 1, last_page: 1, total: 0 });
  const [showAdvanced, setShowAdvanced] = useState(false);

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
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (query) params.set('q', query);
        if (genre !== 'All') params.set('genre', genre);
        if (status !== 'All') params.set('status', status);
        if (type !== 'All') params.set('type', type);
        if (order !== 'popularity') params.set('order', order);
        if (letter !== 'ALL') params.set('letter', letter);
        if (year !== 'All') params.set('year', year);
        if (season !== 'All') params.set('season', season);
        params.set('page', page.toString());
        
        const res = await fetch(`/api/search?${params.toString()}`);
        const data = await res.json();
        setResults(data.items || []);
        setPagination(data.pagination || { current_page: 1, last_page: 1, total: 0 });
      } catch (e) {
        setResults([]);
      }
      setLoading(false);
    }
    doSearch();
  }, [query, genre, status, type, order, letter, year, season, page]);

  const updateFilters = (updates: Record<string, string | number>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value === 'All' || value === 'ALL' || value === '') {
        params.delete(key);
      } else {
        params.set(key, value.toString());
      }
    });
    // Reset to page 1 on filter change
    if (!updates.page) {
      params.set('page', '1');
    }
    router.push(`/search?${params.toString()}`);
  };

  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  const years = Array.from({ length: 2026 - 1990 + 1 }, (_, i) => (2026 - i).toString());

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-secondary/10 text-secondary border border-secondary/30 relative">
              <SearchIcon className="w-8 h-8 relative z-10" />
              <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-secondary" />
              <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-secondary" />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-serif font-black uppercase tracking-tighter leading-none">Advanced<span className="text-secondary">_</span></h1>
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-text mt-2">Discovery Protocol v2.0</p>
            </div>
          </div>

          <div className="relative w-full md:max-w-md">
            <input
              type="text"
              placeholder="Search by title..."
              defaultValue={query}
              key={query}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  updateFilters({ q: (e.target as HTMLInputElement).value });
                }
              }}
              className="w-full bg-card/50 border border-secondary/20 focus:border-secondary/50 focus:ring-0 text-foreground py-4 px-6 font-mono text-sm tracking-wider outline-none transition-all"
            />
            <button 
              onClick={(e) => {
                const input = e.currentTarget.previousSibling as HTMLInputElement;
                updateFilters({ q: input.value });
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center space-x-2 group"
            >
              <span className="text-[10px] font-bold text-muted-text uppercase group-hover:text-secondary transition-colors">Search</span>
              <SearchIcon className="w-4 h-4 text-secondary" />
            </button>
          </div>
        </div>
        
        <div className="inline-block px-6 py-3 bg-card/80 border-l-4 border-secondary/50 shadow-lg relative overflow-hidden"
             style={{ clipPath: 'polygon(0 0, 100% 0, calc(100% - 15px) 100%, 0 100%)' }}>
          <div className="absolute inset-0 bg-gradient-to-r from-secondary/10 to-transparent pointer-events-none" />
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-foreground/80 relative z-10">
            {query ? (
              <>Results for <span className="text-secondary ml-1">"{query}"</span></>
            ) : (
              'Refine your search parameters below'
            )}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Filters Sidebar */}
        <div className="lg:col-span-1 space-y-8">
          <div className="bg-card/30 border border-secondary/10 p-6 space-y-8 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/5 blur-3xl -mr-16 -mt-16 group-hover:bg-secondary/10 transition-all duration-700" />
            
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black uppercase tracking-[0.3em] text-secondary flex items-center gap-2">
                <span className="w-2 h-2 bg-secondary animate-pulse" />
                Filters
              </h3>
              <button 
                onClick={() => {
                  router.push('/search');
                }}
                className="text-[10px] font-bold uppercase tracking-widest text-muted-text hover:text-secondary transition-colors"
              >
                Clear All
              </button>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-text">Status</label>
                <CustomSelect
                  value={status}
                  onChange={(v) => updateFilters({ status: v })}
                  options={[
                    { value: 'All', label: 'All Status' },
                    { value: 'Ongoing', label: 'Ongoing' },
                    { value: 'Completed', label: 'Completed' },
                  ]}
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-text">Genre</label>
                <CustomSelect
                  value={genre}
                  onChange={(v) => updateFilters({ genre: v })}
                  options={[
                    { value: 'All', label: 'All Genres' },
                    ...genres.map(g => ({ value: g.slug, label: g.name }))
                  ]}
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-text">Type</label>
                <CustomSelect
                  value={type}
                  onChange={(v) => updateFilters({ type: v })}
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

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-text">Order By</label>
                <CustomSelect
                  value={order}
                  onChange={(v) => updateFilters({ order: v })}
                  options={[
                    { value: 'popularity', label: 'Popularity' },
                    { value: 'latest', label: 'Latest Updates' },
                    { value: 'score', label: 'Highest Score' },
                    { value: 'title', label: 'Alphabetical' },
                  ]}
                />
              </div>

              <button 
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="w-full py-3 border border-secondary/20 text-[10px] font-black uppercase tracking-widest hover:bg-secondary/10 hover:border-secondary/50 transition-all"
              >
                {showAdvanced ? '- Fewer Filters' : '+ More Filters'}
              </button>

              {showAdvanced && (
                <div className="space-y-6 pt-4 border-t border-secondary/10 animate-in fade-in slide-in-from-top-4 duration-300">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-text">Year</label>
                    <CustomSelect
                      value={year}
                      onChange={(v) => updateFilters({ year: v })}
                      options={[
                        { value: 'All', label: 'All Years' },
                        ...years.map(y => ({ value: y, label: y }))
                      ]}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-text">Season</label>
                    <CustomSelect
                      value={season}
                      onChange={(v) => updateFilters({ season: v })}
                      options={[
                        { value: 'All', label: 'All Seasons' },
                        { value: 'spring', label: 'Spring' },
                        { value: 'summer', label: 'Summer' },
                        { value: 'fall', label: 'Fall' },
                        { value: 'winter', label: 'Winter' },
                      ]}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Results Content */}
        <div className="lg:col-span-3 space-y-8">
          {/* Alphabet Selector */}
          <div className="flex flex-wrap items-center justify-center gap-1 p-2 bg-card/20 border border-secondary/10 overflow-hidden">
            <button
              onClick={() => updateFilters({ letter: 'ALL' })}
              className={cn(
                "px-2 py-1 text-[10px] font-black transition-all",
                letter === 'ALL' ? "bg-secondary text-background" : "text-muted-text hover:text-secondary"
              )}
            >
              ALL
            </button>
            <button
              onClick={() => updateFilters({ letter: '0-9' })}
              className={cn(
                "px-2 py-1 text-[10px] font-black transition-all",
                letter === '0-9' ? "bg-secondary text-background" : "text-muted-text hover:text-secondary"
              )}
            >
              0-9
            </button>
            {alphabet.map((l) => (
              <button
                key={l}
                onClick={() => updateFilters({ letter: l })}
                className={cn(
                  "w-7 h-7 flex items-center justify-center text-[10px] font-black transition-all",
                  letter === l ? "bg-secondary text-background" : "text-muted-text hover:text-secondary hover:bg-secondary/10"
                )}
              >
                {l}
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-3">
              <div className="w-1 h-4 bg-secondary" />
              <span className="text-[10px] font-black text-foreground uppercase tracking-widest">
                Found <span className="text-secondary">{pagination.total}</span> Results
              </span>
            </div>
            
            <div className="text-[10px] font-bold text-muted-text uppercase tracking-widest">
              Page {pagination.current_page} of {pagination.last_page}
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-40 space-y-4">
              <Renew className="w-12 h-12 text-secondary animate-spin" />
              <p className="text-xs font-black uppercase tracking-[0.3em] text-muted-text">Synchronizing Archives...</p>
            </div>
          ) : results.length > 0 ? (
            <>
              <div className="anime-grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
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
              
              <Pagination
                currentPage={pagination.current_page}
                totalPages={pagination.last_page}
                baseUrl="/search"
              />
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-40 space-y-6 text-center bg-card/10 border border-dashed border-secondary/20">
              <div className="w-20 h-20 bg-card rounded-full flex items-center justify-center border border-border group">
                <FaceDissatisfied className="w-10 h-10 text-muted-text group-hover:text-secondary transition-colors" />
              </div>
              <div className="space-y-2">
                <h2 className="text-lg font-black uppercase tracking-tighter">Negative Identification</h2>
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-text max-w-xs mx-auto">No anime signatures match your current parameters. Reset protocols and try again.</p>
                <button 
                  onClick={() => router.push('/search')}
                  className="mt-4 px-6 py-2 bg-secondary text-background text-[10px] font-black uppercase tracking-widest hover:shadow-[0_0_15px_rgba(34,197,94,0.5)] transition-all"
                >
                  Reset Protocol
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
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
