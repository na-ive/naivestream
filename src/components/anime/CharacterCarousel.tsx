"use client";

import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CharacterCarouselProps {
  characters: any[];
}

export function CharacterCarousel({ characters }: CharacterCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      // 120px card + 16px gap = 136px per card scroll
      const scrollAmount = 136; 
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  if (!characters || characters.length === 0) return null;

  return (
    <div className="space-y-6 pt-4 relative">
      <div className="flex items-center justify-between border-b-2 border-secondary/20 pb-4">
        <div className="flex items-center space-x-3 text-lg font-serif font-black uppercase tracking-widest">
          <div className="w-1.5 h-6 bg-secondary" />
          <Star className="w-5 h-5 text-secondary" />
          <h2>Characters<span className="text-secondary opacity-70">_</span></h2>
        </div>
        
        {/* Navigation Arrows */}
        <div className="flex items-center space-x-2">
          <button 
            onClick={() => scroll('left')}
            className="w-8 h-8 flex items-center justify-center bg-card border border-white/10 hover:border-secondary hover:text-secondary transition-colors"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button 
            onClick={() => scroll('right')}
            className="w-8 h-8 flex items-center justify-center bg-card border border-white/10 hover:border-secondary hover:text-secondary transition-colors"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div 
        ref={scrollRef}
        className="flex overflow-x-auto pb-4 gap-4 scrollbar-none snap-x snap-mandatory scroll-smooth"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {characters.slice(0, 15).map((charItem: any) => {
          const character = charItem.character;
          const va = charItem.voice_actors?.find((v: any) => v.language === 'Japanese')?.person;
          
          if (!character) return null;
          
          return (
            <div key={character.mal_id} className="min-w-[120px] max-w-[120px] flex-shrink-0 space-y-2 snap-start group">
              <div className="aspect-[3/4] relative overflow-hidden bg-card border border-white/5">
                <img 
                  src={character.images?.webp?.image_url} 
                  alt={character.name} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                {va && (
                  <div className="absolute -bottom-1 -right-1 w-10 h-10 border-2 border-background overflow-hidden z-10 rounded-tl-lg bg-black">
                    <img 
                      src={va.images?.jpg?.image_url} 
                      alt={va.name}
                      className="w-full h-full object-cover"
                      title={`VA: ${va.name}`}
                    />
                  </div>
                )}
              </div>
              <div>
                <p className="text-xs font-bold truncate text-foreground">{character.name.split(',').reverse().join(' ').trim()}</p>
                <p className="text-[10px] uppercase tracking-widest text-secondary truncate">{charItem.role}</p>
                {va && (
                  <p className="text-[9px] uppercase tracking-widest text-muted-text truncate mt-1 border-t border-white/5 pt-1" title={va.name}>
                    VA: {va.name.split(',').reverse().join(' ').trim()}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
