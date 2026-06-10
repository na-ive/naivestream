'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Search } from '@carbon/icons-react';
import { cn } from '@/lib/utils';

interface SearchResult {
  id: number;
  slug: string;
  title: string;
  title_english: string;
  poster: string;
  status: string;
  type: string;
  year: number;
  score: number;
}

export function LiveSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node) &&
          inputRef.current && !inputRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    
    if (query.length < 2) {
      setResults([]);
      setIsOpen(false);
      setActiveIndex(-1);
      return;
    }
    
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/search/live?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        // Limit to 4 results
        const limitedResults = (data.data || []).slice(0, 4);
        setResults(limitedResults);
        setIsOpen(limitedResults.length > 0);
        setActiveIndex(-1); // Reset index on new results
      } catch (e) {
        setResults([]);
      }
      setLoading(false);
    }, 300);
    
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    if (activeIndex >= 0 && results[activeIndex]) {
      router.push(`/anime/${results[activeIndex].slug}`);
      setIsOpen(false);
      setQuery('');
      return;
    }

    const targetUrl = query.trim() 
      ? `/search?q=${encodeURIComponent(query)}` 
      : `/search`;
    
    router.push(targetUrl);
    setIsOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;

    // We have results.length + 1 items (results + 'See all' button)
    const totalItems = results.length + 1;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex(prev => (prev < totalItems - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex(prev => (prev > -1 ? prev - 1 : prev));
    } else if (e.key === 'Enter') {
      // If index is valid and it's not the 'See all' button
      if (activeIndex >= 0 && activeIndex < results.length) {
        e.preventDefault();
        handleSubmit();
      } else if (activeIndex === results.length) {
        // 'See all' button is selected
        e.preventDefault();
        // Reset index to -1 so handleSubmit performs normal search
        setActiveIndex(-1);
        setTimeout(() => handleSubmit(), 0);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <div className="relative w-full group">
      <form onSubmit={handleSubmit} className="relative w-full">
        <input
          ref={inputRef}
          type="text"
          placeholder="Search anime..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => { if (results.length > 0) setIsOpen(true); }}
          onKeyDown={handleKeyDown}
          className="w-full bg-card/40 border border-secondary/20 hover:border-secondary/40 focus:border-secondary focus:bg-card rounded-none py-2.5 pl-14 pr-10 focus:outline-none transition-all font-mono font-bold text-sm tracking-widest text-foreground placeholder:text-muted-foreground"
          style={{ clipPath: 'polygon(12px 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%, 0 12px)' }}
        />
        <div 
          className="absolute left-1.5 top-1.5 bottom-1.5 w-10 bg-secondary/20 flex items-center justify-center pointer-events-none transition-colors group-focus-within:bg-secondary/30" 
          style={{ clipPath: 'polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)' }}
        >
          <Search className="text-secondary w-3.5 h-3.5" />
        </div>
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery('');
              setIsOpen(false);
            }}
            className="absolute right-2 top-2 w-7 h-7 bg-red-100 dark:bg-red-950/50 border border-red-300 dark:border-red-900/50 hover:bg-red-200 dark:hover:bg-red-900/80 text-red-600 dark:text-red-500 flex items-center justify-center transition-all z-20"
            style={{ clipPath: 'polygon(5px 0, 100% 0, 100% calc(100% - 5px), calc(100% - 5px) 100%, 0 100%, 0 5px)' }}
            aria-label="Clear search"
          >
            <div className="relative w-4 h-4">
              <div className="absolute top-1/2 left-0 w-full h-0.5 bg-current rotate-45" />
              <div className="absolute top-1/2 left-0 w-full h-0.5 bg-current -rotate-45" />
            </div>
          </button>
        )}
      </form>

      {/* Dropdown */}
      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute top-full left-0 right-0 mt-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200"
        >
          <div className="bg-card border-2 border-secondary/20 shadow-xl flex flex-col max-h-[400px] overflow-y-auto custom-scrollbar">
            {results.map((anime, index) => (
              <Link
                key={anime.slug}
                href={`/anime/${anime.slug}`}
                onClick={() => { setIsOpen(false); setQuery(''); }}
                onMouseEnter={() => setActiveIndex(index)}
                className={cn(
                  "flex items-center gap-4 p-3 border-b border-white/5 last:border-0 transition-all group/item",
                  activeIndex === index ? "bg-secondary/20" : "hover:bg-secondary/10"
                )}
              >
                <div className={cn(
                  "relative w-12 h-16 flex-shrink-0 bg-card border-2 transition-colors overflow-hidden",
                  activeIndex === index ? "border-secondary" : "border-secondary/20 group-hover/item:border-secondary"
                )}>
                  <img
                    src={anime.poster}
                    alt={anime.title}
                    className={cn(
                      "w-full h-full object-cover transition-transform duration-500",
                      activeIndex === index ? "scale-110" : "group-hover/item:scale-110"
                    )}
                  />
                  <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%)] bg-[length:100%_4px]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={cn(
                    "text-sm font-black truncate uppercase tracking-tighter transition-colors",
                    activeIndex === index ? "text-secondary" : "group-hover/item:text-secondary"
                  )}>{anime.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] font-black text-secondary bg-secondary/10 px-1.5 py-0.5 border border-secondary/30 uppercase tracking-tighter">{anime.score || '??'}</span>
                    <p className="text-[10px] text-muted-text font-bold uppercase tracking-widest truncate">
                      {anime.type} • {anime.year || '????'}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="text-[9px] uppercase tracking-[0.2em] text-secondary font-black whitespace-nowrap">{anime.status}</span>
                </div>
              </Link>
            ))}
            <button
              onClick={handleSubmit}
              onMouseEnter={() => setActiveIndex(results.length)}
              className={cn(
                "w-full p-3 text-[10px] uppercase tracking-[0.3em] font-black text-center border-t border-white/5 transition-all",
                activeIndex === results.length 
                  ? "bg-secondary text-background shadow-[0_0_20px_rgba(34,197,94,0.4)]" 
                  : "bg-secondary/5 hover:bg-secondary/10 text-secondary"
              )}
            >
              See all results
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
