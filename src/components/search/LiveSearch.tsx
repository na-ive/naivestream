'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Search } from '@carbon/icons-react';

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
      return;
    }
    
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/search/live?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        setResults(data.data || []);
        setIsOpen((data.data?.length || 0) > 0);
      } catch (e) {
        setResults([]);
      }
      setLoading(false);
    }, 300);
    
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const targetUrl = query.trim() 
      ? `/search?q=${encodeURIComponent(query)}` 
      : `/search`;
    
    router.push(targetUrl);
    setIsOpen(false);
  };

  return (
    <div className="relative w-full">
      <form onSubmit={handleSubmit} className="relative">
        <input
          ref={inputRef}
          type="text"
          placeholder="Search anime..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => { if (results.length > 0) setIsOpen(true); }}
          className="w-full bg-card/40 border border-secondary/20 rounded-none py-2.5 pl-10 pr-4 focus:outline-none focus:border-secondary/50 text-sm transition-colors"
        />
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-text" />
      </form>

      {/* Dropdown */}
      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute top-full left-0 right-0 bg-card border border-secondary/20 shadow-2xl z-50 mt-1 max-h-[400px] overflow-y-auto"
        >
          {results.map((anime) => (
            <Link
              key={anime.slug}
              href={`/anime/${anime.slug}`}
              onClick={() => { setIsOpen(false); setQuery(''); }}
              className="flex items-center gap-3 p-3 hover:bg-secondary/10 border-b border-white/5 last:border-0 transition-colors"
            >
              <img
                src={anime.poster}
                alt={anime.title}
                className="w-10 h-14 object-cover rounded"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold truncate">{anime.title}</p>
                <p className="text-[10px] text-muted-text">
                  {anime.type} {anime.year ? `• ${anime.year}` : ''} {anime.score ? `• ${anime.score}` : ''}
                </p>
              </div>
              <span className="text-[9px] uppercase tracking-wider text-secondary font-black whitespace-nowrap">{anime.status}</span>
            </Link>
          ))}
          <button
            onClick={handleSubmit}
            className="w-full p-2 text-[10px] uppercase tracking-widest font-black text-center bg-secondary/5 hover:bg-secondary/10 text-secondary transition-colors"
          >
            See all results for "{query}"
          </button>
        </div>
      )}
    </div>
  );
}
