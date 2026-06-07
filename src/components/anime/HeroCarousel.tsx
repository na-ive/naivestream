'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { TrendingUp, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { SmartWatchButton } from './SmartWatchButton';

interface HeroCarouselProps {
  items: any[];
}

export function HeroCarousel({ items }: HeroCarouselProps) {
  const [currentIndex, setCurrentPage] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const nextSlide = useCallback(() => {
    setCurrentPage((prev) => (prev + 1) % items.length);
  }, [items.length]);

  const prevSlide = useCallback(() => {
    setCurrentPage((prev) => (prev - 1 + items.length) % items.length);
  }, [items.length]);

  useEffect(() => {
    if (!isAutoPlaying) return;
    const interval = setInterval(nextSlide, 8000);
    return () => clearInterval(interval);
  }, [isAutoPlaying, nextSlide]);

  if (!items.length) return null;

  const current = items[currentIndex];

  return (
    <section 
      className="relative w-full h-[80vh] min-h-[550px] overflow-hidden group bg-background transition-colors duration-300"
      onMouseEnter={() => setIsAutoPlaying(false)}
      onMouseLeave={() => setIsAutoPlaying(true)}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={current.animeId || current.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          className="absolute inset-0 z-0"
        >
          {/* Solid background — fills entire container */}
          <div className="absolute inset-0 bg-background" />

          {/*
            Image: 40% wide on the right.
            CSS mask-image fades the image itself from transparent (left edge)
            to fully visible (right side) — no overlay div, no hard edge possible.
          */}
          <div
            className="absolute right-0 top-0 h-full w-[40%] overflow-hidden"
            style={{
              maskImage: 'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.05) 10%, rgba(0,0,0,0.2) 20%, rgba(0,0,0,0.6) 35%, rgba(0,0,0,0.9) 55%, black 75%)',
              WebkitMaskImage: 'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.05) 10%, rgba(0,0,0,0.2) 20%, rgba(0,0,0,0.6) 35%, rgba(0,0,0,0.9) 55%, black 75%)',
            }}
          >
            <img
              src={current.poster || current.image}
              alt={current.title}
              className="w-full h-full object-cover object-center"
            />
          </div>

          {/* Bottom fade to background */}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
        </motion.div>
      </AnimatePresence>

      <div className="relative z-20 h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-center">
        <motion.div 
          key={`content-${current.animeId || current.id}`}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl space-y-6"
        >
          <div className="flex items-center space-x-2 text-secondary font-black uppercase tracking-[0.2em] text-xs">
            <TrendingUp className="w-4 h-4" />
            <span>Trending Now</span>
          </div>
          
          <h1 className="text-4xl md:text-7xl font-serif font-black leading-tight tracking-tighter text-foreground">
            {current.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4">
            <div className="px-3 py-1 bg-secondary text-background font-black text-xs uppercase skew-x-[-15deg]">
              <span className="inline-block skew-x-[15deg]">{current.episodes ? `${current.episodes} Episodes` : 'Ongoing'}</span>
            </div>
            <div className="flex items-center space-x-2 px-3 py-1 border border-secondary/30 bg-card font-bold text-xs text-secondary tracking-widest skew-x-[-15deg]">
              <Calendar className="w-4 h-4 mr-1 inline-block skew-x-[15deg]" />
              <span className="inline-block skew-x-[15deg]">{current.releaseDay || current.day || 'Airing'}</span>
            </div>
          </div>

          <p className="text-muted-text text-sm md:text-lg leading-relaxed max-w-lg font-bold">
            Stream the latest episodes of {current.title} and stay updated with your favorite series.
          </p>

          <div className="flex items-center space-x-6 pt-2">
            <SmartWatchButton 
              animeId={current.animeId || current.id} 
              animeTitle={current.title} 
              animeImage={current.poster || current.image} 
              className="px-8 py-4 shadow-[0_0_15px_rgba(34,197,94,0.3)]"
            />
            <Link 
              href={`/anime/${current.animeId || current.id}`} 
              className="btn-accent px-8 py-4 text-sm"
            >
              View Details
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Controls - Fixed positioning and high z-index */}
      {items.length > 1 && (
        <>
          <button 
            onClick={prevSlide}
            className="absolute left-6 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center bg-card/80 border border-secondary/20 text-secondary opacity-0 group-hover:opacity-100 hover:bg-secondary hover:text-background transition-all cursor-pointer shadow-lg z-40"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button 
            onClick={nextSlide}
            className="absolute right-6 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center bg-card/80 border border-secondary/20 text-secondary opacity-0 group-hover:opacity-100 hover:bg-secondary hover:text-background transition-all cursor-pointer shadow-lg z-40"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Indicators */}
          <div className="absolute bottom-10 right-10 flex space-x-2 z-40">
            {items.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i)}
                className={`transition-all duration-300 w-8 h-1 ${
                  currentIndex === i ? 'bg-secondary' : 'bg-secondary/20 hover:bg-secondary/40'
                } cursor-pointer`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
