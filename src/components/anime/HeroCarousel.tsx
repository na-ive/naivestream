'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from '@carbon/icons-react';
import { motion, AnimatePresence } from 'framer-motion';
import { SmartWatchButton } from './SmartWatchButton';

interface HeroCarouselProps {
  items: any[];
}

export function HeroCarousel({ items }: HeroCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % items.length);
  }, [items.length]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
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
      className="relative w-full h-[75vh] min-h-[600px] overflow-hidden group bg-[#040D09]"
      onMouseEnter={() => setIsAutoPlaying(false)}
      onMouseLeave={() => setIsAutoPlaying(true)}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={current.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
          className="absolute inset-0 z-0"
        >
          {/* Background Image (Clear and Darkened) */}
          <div className="absolute inset-0">
            <img
              src={current.poster || current.image}
              alt={current.title}
              className="w-full h-full object-cover opacity-40 object-[center_25%] scale-105"
            />
            {/* Dark Overlays for smooth transition */}
            <div className="absolute inset-0 bg-black/20" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#040D09] via-[#040D09]/60 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#040D09] via-transparent to-transparent" />
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="relative z-10 h-full max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-12 flex flex-col justify-center">
        {/* Top Label - Lowered to avoid navbar overlap */}
        <div className="absolute top-24 left-4 sm:left-6 lg:left-12">
          <h2 className="text-white text-2xl md:text-3xl font-sans font-bold tracking-tight opacity-90">
            Popular New Titles
          </h2>
        </div>

        <div className="flex flex-col md:flex-row items-end md:items-start gap-8 md:gap-12 mt-32">
          {/* Poster on Left */}
          <div className="flex flex-col gap-4">
            <motion.div
              key={`poster-${current.id}`}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative shrink-0 w-[190px] md:w-[260px] aspect-[2/3] shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden rounded-sm"
            >
              <img
                src={current.poster || current.image}
                alt={current.title}
                className="w-full h-full object-cover"
              />
              {/* Japan Flag Indicator */}
              <div className="absolute bottom-2.5 right-2.5 w-6 h-4 bg-white rounded-[1px] flex items-center justify-center overflow-hidden border border-black/10">
                <div className="w-2 h-2 rounded-full bg-[#BC002D]" />
              </div>
            </motion.div>
            
            {/* Author Name / Studio */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-white font-sans italic font-medium text-base md:text-lg opacity-90 pl-1"
            >
              {current.studios || 'Artist Unknown'}
            </motion.div>
          </div>

          {/* Content on Right */}
          <motion.div 
            key={`content-${current.id}`}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex-1 pt-4"
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-sans font-bold leading-[1.1] tracking-tight text-white mb-5">
              {current.title}
            </h1>

            <div className="flex flex-wrap items-center gap-3 mb-8">
              {current.genres?.slice(0, 5).map((genre: string, idx: number) => (
                <span 
                  key={idx}
                  className={`px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.15em] rounded-sm ${
                    idx === 0 ? 'bg-[#F29100] text-white' : 'bg-white/10 text-white/90'
                  }`}
                >
                  {genre}
                </span>
              ))}
            </div>

            <p className="text-white/95 text-[15px] md:text-[17px] leading-relaxed w-full max-w-none mb-10 font-normal font-sans tracking-wide">
              {current.synopsis}
            </p>

            {/* Restored CTA Buttons */}
            <div className="flex items-center space-x-4">
              <SmartWatchButton 
                animeId={current.id} 
                animeTitle={current.title} 
                animeImage={current.poster || current.image} 
                className="px-8 py-3 text-xs tracking-widest shadow-lg shadow-secondary/20"
              />
              <Link 
                href={`/anime/${current.id}`} 
                className="px-8 py-3 border border-white/20 text-white font-black uppercase tracking-widest text-xs hover:bg-white/10 transition-all"
                style={{ clipPath: 'polygon(10% 0, 100% 0, 100% 70%, 90% 100%, 0 100%, 0 30%)' }}
              >
                Details
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Navigation Controls (Bottom Right) */}
        <div className="absolute bottom-12 right-4 sm:right-6 lg:right-12 flex items-center gap-8">
          <div className="text-white font-sans font-bold text-sm tracking-[0.2em] flex items-baseline gap-2">
            <span className="text-white/50 text-xs">NO.</span>
            <span className="text-xl leading-none">{currentIndex + 1}</span>
          </div>
          
          <div className="flex items-center gap-6">
            <button 
              onClick={prevSlide}
              className="text-white/40 hover:text-white transition-all cursor-pointer p-1"
            >
              <ChevronLeft className="w-8 h-8" />
            </button>
            <button 
              onClick={nextSlide}
              className="text-white/40 hover:text-white transition-all cursor-pointer p-1"
            >
              <ChevronRight className="w-8 h-8" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
