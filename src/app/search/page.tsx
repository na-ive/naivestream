'use client';

import React, { useEffect, useState, Suspense, useCallback, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { AnimeCard } from '@/components/anime/AnimeCard';
import { Pagination } from '@/components/layout/Pagination';
import { CustomSelect } from '@/components/ui/CustomSelect';
import { MultiSelect } from '@/components/ui/MultiSelect';
import { cn } from '@/lib/utils';
import { Search as SearchIcon, FaceDissatisfied, Filter } from '@carbon/icons-react';
import { AnimatePresence, motion } from 'framer-motion';
import { AnimeCardSkeleton } from '@/components/anime/AnimeCard';

const FILTER_OPTIONS = {
  status: [
    { value: 'All', label: 'All Status' },
    { value: 'Ongoing', label: 'Ongoing' },
    { value: 'Completed', label: 'Completed' },
  ],
  type: [
    { value: 'All', label: 'All Types' },
    { value: 'TV', label: 'TV' },
    { value: 'Movie', label: 'Movie' },
    { value: 'OVA', label: 'OVA' },
    { value: 'Special', label: 'Special' },
    { value: 'ONA', label: 'ONA' },
    { value: 'Music', label: 'Music' },
  ],
  season: [
    { value: 'All', label: 'All Seasons' },
    { value: 'spring', label: 'Spring' },
    { value: 'summer', label: 'Summer' },
    { value: 'fall', label: 'Fall' },
    { value: 'winter', label: 'Winter' },
  ],
  order: [
    { value: 'popularity', label: 'Most Popular' },
    { value: 'popularity_desc', label: 'Least Popular' },
    { value: 'score', label: 'Score' },
    { value: 'score_asc', label: 'Score (Lowest)' },
    { value: 'title', label: 'Title A-Z' },
    { value: 'title_desc', label: 'Title Z-A' },
    { value: 'latest', label: 'Latest' },
    { value: 'oldest', label: 'Oldest' },
  ],
  source: [
    { value: 'All', label: 'All Sources' },
    { value: 'Manga', label: 'Manga' },
    { value: 'Light novel', label: 'Light Novel' },
    { value: 'Original', label: 'Original' },
    { value: 'Web manga', label: 'Web Manga' },
    { value: 'Game', label: 'Game' },
    { value: '4-koma manga', label: '4-Koma Manga' },
    { value: 'Visual novel', label: 'Visual Novel' },
    { value: 'Novel', label: 'Novel' },
    { value: 'Mixed media', label: 'Mixed Media' },
    { value: 'Other', label: 'Other' },
    { value: 'Music', label: 'Music' },
    { value: 'Web novel', label: 'Web Novel' },
    { value: 'Book', label: 'Book' },
    { value: 'Card game', label: 'Card Game' },
  ],
  rating: [
    { value: 'All', label: 'All Ratings' },
    { value: 'PG-13 - Teens 13 or older', label: 'PG-13' },
    { value: 'R - 17+ (violence & profanity)', label: 'R - 17+' },
    { value: 'R+ - Mild Nudity', label: 'R+ - Mild Nudity' },
    { value: 'G - All Ages', label: 'G - All Ages' },
    { value: 'PG - Children', label: 'PG - Children' },
  ],
};

function SearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const query = searchParams.get('q') || '';
  const genresParam = searchParams.get('genres') || '';
  const genreMode = searchParams.get('genreMode') || 'any';
  const status = searchParams.get('status') || 'All';
  const type = searchParams.get('type') || 'All';
  const order = searchParams.get('order') || 'popularity';
  const year = searchParams.get('year') || 'All';
  const season = searchParams.get('season') || 'All';
  const source = searchParams.get('source') || 'All';
  const rating = searchParams.get('rating') || 'All';
  const studiosParam = searchParams.get('studios') || '';
  const page = parseInt(searchParams.get('page') || '1');

  const selectedGenres = genresParam ? genresParam.split(',').filter(Boolean) : [];
  const selectedStudios = studiosParam ? studiosParam.split(',').filter(Boolean) : [];

  const [results, setResults] = useState<any[]>([]);
  const [genres, setGenres] = useState<any[]>([]);
  const [studioOptions, setStudioOptions] = useState<{ value: string; label: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ current_page: 1, last_page: 1, total: 0 });
  const [showFilters, setShowFilters] = useState(true);

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
    async function fetchStudios() {
      try {
        const res = await fetch('/api/studios');
        const data = await res.json();
        setStudioOptions((data || []).map((s: string) => ({ value: s, label: s })));
      } catch (e) {
        console.error('Failed to fetch studios');
      }
    }
    fetchGenres();
    fetchStudios();
  }, []);

  useEffect(() => {
    async function doSearch() {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (query) params.set('q', query);
        if (selectedGenres.length > 0) params.set('genres', selectedGenres.join(','));
        if (genreMode !== 'any') params.set('genreMode', genreMode);
        if (status !== 'All') params.set('status', status);
        if (type !== 'All') params.set('type', type);
        if (order !== 'popularity') params.set('order', order);
        if (year !== 'All') params.set('year', year);
        if (season !== 'All') params.set('season', season);
        if (source !== 'All') params.set('source', source);
        if (rating !== 'All') params.set('rating', rating);
        if (selectedStudios.length > 0) params.set('studios', selectedStudios.join(','));
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
  }, [query, genresParam, genreMode, status, type, order, year, season, source, rating, studiosParam, page]);

  const updateFilters = useCallback((updates: Record<string, string | number>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value === 'All' || value === 'ALL' || value === '') {
        params.delete(key);
      } else {
        params.set(key, value.toString());
      }
    });
    if (!updates.page) {
      params.set('page', '1');
    }
    router.push(`/search?${params.toString()}`);
  }, [searchParams, router]);

  const handleGenreChange = (newGenres: string[]) => {
    const params = new URLSearchParams(searchParams.toString());
    if (newGenres.length > 0) {
      params.set('genres', newGenres.join(','));
    } else {
      params.delete('genres');
    }
    params.delete('genre');
    params.set('page', '1');
    router.push(`/search?${params.toString()}`);
  };

  const years = Array.from({ length: 2026 - 1990 + 1 }, (_, i) => (2026 - i).toString());

  const genreOptions = genres.map((g: any) => ({ value: g.slug, label: g.name }));
  const yearOptions = [
    { value: 'All', label: 'All Years' },
    ...years.map(y => ({ value: y, label: y })),
  ];

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-12">
        <div className="flex items-center space-x-4 mb-6">
          <div className="p-3 bg-secondary/10 text-secondary border border-secondary/30 relative">
            <SearchIcon className="w-8 h-8 relative z-10" />
            <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-secondary" />
            <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-secondary" />
          </div>
          <h1 className="text-4xl md:text-5xl font-serif font-black uppercase tracking-tighter">Advanced Search<span className="text-secondary">_</span></h1>
        </div>
        
        <div className="inline-block px-6 py-3 bg-card/80 border-l-4 border-secondary/50 shadow-lg relative overflow-hidden"
             style={{ clipPath: 'polygon(0 0, 100% 0, calc(100% - 15px) 100%, 0 100%)' }}>
          <div className="absolute inset-0 bg-gradient-to-r from-secondary/10 to-transparent pointer-events-none" />
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-foreground/80 relative z-10">
            {query ? <>Results for <span className="text-secondary ml-1">"{query}"</span></> : 'Refine your search parameters below'}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 mb-6">
        <div className="relative flex-1">
          <DebouncedSearchInput
            initialValue={query}
            onSearch={(q) => updateFilters({ q })}
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={cn(
            "flex items-center justify-center gap-2 px-5 py-4 border-2 text-sm font-black uppercase tracking-wider transition-all shrink-0",
            showFilters
              ? "bg-secondary text-background border-secondary"
              : "bg-card/50 text-muted-text border-secondary/20 hover:border-secondary/50"
          )}
        >
          <Filter className="w-4 h-4 shrink-0" />
          <span className="relative grid">
            <span className="invisible col-start-1 row-start-1">Show Filters</span>
            <span className="col-start-1 row-start-1">{showFilters ? 'Hide Filters' : 'Show Filters'}</span>
          </span>
        </button>
      </div>

      <div className="space-y-6">
        <AnimatePresence>
          {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
            key="filters"
          >
          <div className="space-y-4 p-4 bg-card/20 border border-secondary/10">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              <div className="flex flex-col gap-1">
                <span className="text-xs font-bold uppercase tracking-wider text-foreground">Status</span>
                <CustomSelect
                  value={status}
                  onChange={(v) => updateFilters({ status: v })}
                  options={FILTER_OPTIONS.status}
                  placeholder="Status"
                />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs font-bold uppercase tracking-wider text-foreground">Type</span>
                <CustomSelect
                  value={type}
                  onChange={(v) => updateFilters({ type: v })}
                  options={FILTER_OPTIONS.type}
                  placeholder="Type"
                />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs font-bold uppercase tracking-wider text-foreground">Season</span>
                <CustomSelect
                  value={season}
                  onChange={(v) => updateFilters({ season: v })}
                  options={FILTER_OPTIONS.season}
                  placeholder="Season"
                />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs font-bold uppercase tracking-wider text-foreground">Year</span>
                <CustomSelect
                  value={year}
                  onChange={(v) => updateFilters({ year: v })}
                  options={yearOptions}
                  placeholder="Year"
                />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs font-bold uppercase tracking-wider text-foreground">Source</span>
                <CustomSelect
                  value={source}
                  onChange={(v) => updateFilters({ source: v })}
                  options={FILTER_OPTIONS.source}
                  placeholder="Source"
                />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs font-bold uppercase tracking-wider text-foreground">Rating</span>
                <CustomSelect
                  value={rating}
                  onChange={(v) => updateFilters({ rating: v })}
                  options={FILTER_OPTIONS.rating}
                  placeholder="Rating"
                />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs font-bold uppercase tracking-wider text-foreground">Sort</span>
                <CustomSelect
                  value={order}
                  onChange={(v) => updateFilters({ order: v })}
                  options={FILTER_OPTIONS.order}
                  placeholder="Order"
                />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs font-bold uppercase tracking-wider text-foreground">Studio</span>
                <MultiSelect
                  values={selectedStudios}
                  onChange={(v) => {
                    const params = new URLSearchParams(searchParams.toString());
                    if (v.length > 0) params.set('studios', v.join(','));
                    else params.delete('studios');
                    params.set('page', '1');
                    router.push(`/search?${params.toString()}`);
                  }}
                  options={studioOptions}
                  placeholder="All Studio"
                  formatDisplay={(selected) => selected.length === 1 ? selected[0].label : `${selected.length} Studios selected`}
                />
              </div>
            </div>

            {/* Genre Toggle Buttons */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold uppercase tracking-wider text-foreground">Genres</span>
                <div className="inline-flex bg-card/50 border border-secondary/30 p-0.5">
                  <button
                    onClick={() => updateFilters({ genreMode: 'any' })}
                    className={cn(
                      "px-3 py-1.5 text-[10px] font-black uppercase tracking-widest transition-all",
                      genreMode === 'any'
                        ? "bg-secondary text-background"
                        : "text-muted-text hover:text-foreground hover:bg-secondary/10"
                    )}
                  >
                    OR
                  </button>
                  <button
                    onClick={() => updateFilters({ genreMode: 'all' })}
                    className={cn(
                      "px-3 py-1.5 text-[10px] font-black uppercase tracking-widest transition-all",
                      genreMode === 'all'
                        ? "bg-secondary text-background"
                        : "text-muted-text hover:text-foreground hover:bg-secondary/10"
                    )}
                  >
                    AND
                  </button>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {genreOptions.map((g) => {
                  const isActive = selectedGenres.includes(g.value);
                  return (
                    <button
                      key={g.value}
                      onClick={() => {
                        if (isActive) {
                          handleGenreChange(selectedGenres.filter(v => v !== g.value));
                        } else {
                          handleGenreChange([...selectedGenres, g.value]);
                        }
                      }}
                      className={cn(
                        "px-2.5 py-1 text-[10px] font-black uppercase tracking-widest border transition-all",
                        isActive
                          ? "bg-secondary text-background border-secondary"
                          : "bg-transparent text-muted-text border-secondary/20 hover:border-secondary/50 hover:text-foreground"
                      )}
                    >
                      {g.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
          </motion.div>
          )}
        </AnimatePresence>


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
          <div className="anime-grid">
            {Array.from({ length: 24 }).map((_, i) => (
              <AnimeCardSkeleton key={i} />
            ))}
          </div>
        ) : results.length > 0 ? (
          <>
            <div className="anime-grid">
              {results.map((anime: any) => (
                <AnimeCard
                  key={anime.slug}
                  id={anime.slug}
                  title={anime.title}
                  titleEnglish={anime.title_english}
                  image={anime.poster}
                  rating={String(anime.score)}
                  status={anime.status}
                  episode={anime.status === 'Ongoing' ? `ep ${anime.latest_episode || '??'}` : `${anime.episodes_count || '??'} eps`}
                  totalEpisodes={anime.actual_episodes_count}
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
  );
}

function DebouncedSearchInput({ initialValue, onSearch }: { initialValue: string; onSearch: (q: string) => void }) {
  const [value, setValue] = useState(initialValue);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  const handleChange = (newVal: string) => {
    setValue(newVal);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      onSearch(newVal);
    }, 300);
  };

  const handleClear = () => {
    setValue('');
    if (debounceRef.current) clearTimeout(debounceRef.current);
    onSearch('');
  };

  return (
    <div className="relative w-full group">
      <div
        className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-7 bg-secondary/20 flex items-center justify-center pointer-events-none transition-colors group-focus-within:bg-secondary/30"
        style={{ clipPath: 'polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)' }}
      >
        <SearchIcon className="text-secondary w-3.5 h-3.5" />
      </div>
      <input
        type="text"
        placeholder="Search by title..."
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        className="w-full bg-card/50 border-2 border-secondary/20 focus:border-secondary/50 focus:ring-0 text-foreground py-4 pl-16 pr-12 font-mono text-sm tracking-wider outline-none transition-all"
      />
      {value && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 w-7 h-7 bg-red-100 dark:bg-red-950/50 border border-red-300 dark:border-red-900/50 hover:bg-red-200 dark:hover:bg-red-900/80 text-red-600 dark:text-red-500 flex items-center justify-center transition-all"
          style={{ clipPath: 'polygon(5px 0, 100% 0, 100% calc(100% - 5px), calc(100% - 5px) 100%, 0 100%, 0 5px)' }}
          aria-label="Clear search"
        >
          <div className="relative w-4 h-4">
            <div className="absolute top-1/2 left-0 w-full h-0.5 bg-current rotate-45" />
            <div className="absolute top-1/2 left-0 w-full h-0.5 bg-current -rotate-45" />
          </div>
        </button>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="anime-grid">
          {Array.from({ length: 24 }).map((_, i) => (
            <AnimeCardSkeleton key={i} />
          ))}
        </div>
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}
