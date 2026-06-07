'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Play, TrendingUp, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
    const interval = setInterval(nextSlide, 6000);
    return () => clearInterval(interval);
  }, [isAutoPlaying, nextSlide]);

  if (!items.length) return null;

  const current = items[currentIndex];

  return (
    <section 
      className="relative w-full h-[75vh] min-h-[550px] overflow-hidden group"
      onMouseEnter={() => setIsAutoPlaying(false)}
      onMouseLeave={() => setIsAutoPlaying(true)}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={current.animeId || current.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="absolute inset-0"
        >
          <img
            src={current.poster || current.image}
            alt={current.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
        </motion.div>
      </AnimatePresence>

      <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-center">
        <motion.div 
          key={`content-${current.animeId || current.id}`}
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-2xl space-y-6"
        >
          <div className="flex items-center space-x-2 text-secondary font-bold uppercase tracking-widest text-sm">
            <div className="w-8 h-[2px] bg-secondary" />
            <TrendingUp className="w-4 h-4" />
            <span>Trending Now</span>
          </div>
          
          <h1 className="text-4xl md:text-7xl font-bold leading-tight tracking-tighter">
            {current.title}
          </h1>

          <div className="flex items-center space-x-4 text-sm font-medium">
            <span className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-full border border-white/20">
              {current.episodes ? `${current.episodes} Episodes` : 'Ongoing'}
            </span>
            <span className="flex items-center text-gray-300">
              <Calendar className="w-4 h-4 mr-1.5" />
              {current.releaseDay || current.day || 'Today'}
            </span>
          </div>

          <p className="text-gray-400 line-clamp-3 md:text-lg max-w-lg leading-relaxed">
            Experience the latest journey of {current.title}. Stay updated with every release and never miss a moment of the action.
          </p>

          <div className="flex items-center space-x-4 pt-2">
            <Link href={`/anime/${current.animeId || current.id}`} className="btn-primary flex items-center space-x-2 group/btn">
              <Play className="w-5 h-5 fill-current group-hover/btn:scale-110 transition-transform" />
              <span>Watch Now</span>
            </Link>
            <Link href={`/anime/${current.animeId || current.id}`} className="px-6 py-3 rounded-lg border border-border font-medium hover:bg-white/5 transition-colors">
              Details
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Controls */}
      {items.length > 1 && (
        <>
          <button 
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/20 backdrop-blur-md border border-white/10 text-white opacity-0 group-hover:opacity-100 hover:bg-secondary transition-all"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button 
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/20 backdrop-blur-md border border-white/10 text-white opacity-0 group-hover:opacity-100 hover:bg-secondary transition-all"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Indicators */}
          <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex items-center space-x-3">
            {items.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i)}
                className={`transition-all duration-300 rounded-full ${
                  currentIndex === i ? 'w-8 h-2 bg-secondary' : 'w-2 h-2 bg-white/30 hover:bg-white/60'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
