'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { TrendingUp, Calendar, ChevronLeft, ChevronRight, Activity, Terminal } from 'lucide-react';
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
      className="relative w-full h-[85vh] min-h-[600px] overflow-hidden group bg-black"
      onMouseEnter={() => setIsAutoPlaying(false)}
      onMouseLeave={() => setIsAutoPlaying(true)}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={current.animeId || current.id}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="absolute inset-0"
        >
          <img
            src={current.poster || current.image}
            alt={current.title}
            className="w-full h-full object-cover brightness-75"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
          
          {/* Cyberpunk Grid Overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(34,197,94,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(34,197,94,0.05)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]" />
        </motion.div>
      </AnimatePresence>

      <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-center">
        <motion.div 
          key={`content-${current.animeId || current.id}`}
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.1, ease: "circOut" }}
          className="max-w-3xl space-y-8"
        >
          <div className="flex flex-col space-y-2">
            <div className="flex items-center space-x-3 text-secondary font-black uppercase tracking-[0.3em] text-[10px]">
               <Activity className="w-4 h-4" />
               <span>SYSTEM_ACTIVE // TOP_PRIORITY</span>
            </div>
            <div className="flex items-center space-x-2 text-secondary font-black uppercase tracking-[0.4em] text-xs">
              <div className="w-12 h-[3px] bg-secondary shadow-[0_0_10px_rgba(34,197,94,1)]" />
              <TrendingUp className="w-4 h-4" />
              <span className="text-neon">TRENDING_DATA</span>
            </div>
          </div>
          
          <h1 className="text-5xl md:text-8xl font-serif font-black leading-[0.9] tracking-tighter text-white">
            {current.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4">
            <div className="px-4 py-1 bg-secondary text-black font-black text-xs uppercase skew-x-[-20deg]">
              <span className="inline-block skew-x-[20deg]">{current.episodes ? `${current.episodes} DATA_UNITS` : 'ACTIVE_FEED'}</span>
            </div>
            <div className="flex items-center space-x-2 px-4 py-1 border border-secondary/30 bg-black/40 backdrop-blur-md font-bold text-xs text-secondary tracking-widest skew-x-[-20deg]">
              <Calendar className="w-4 h-4 mr-1 inline-block skew-x-[20deg]" />
              <span className="inline-block skew-x-[20deg]">{current.releaseDay || current.day || 'NODE_LIVE'}</span>
            </div>
          </div>

          <div className="relative max-w-xl">
             <div className="absolute -left-4 top-0 bottom-0 w-1 bg-secondary shadow-[0_0_15px_rgba(34,197,94,0.5)]" />
             <p className="text-gray-300 text-sm md:text-lg leading-relaxed font-bold tracking-wide italic">
              "Initiating media uplink for target series {current.title}. Processing high-bandwidth visual stream..."
            </p>
          </div>

          <div className="flex items-center space-x-6 pt-4">
            <SmartWatchButton 
              animeId={current.animeId || current.id} 
              animeTitle={current.title} 
              animeImage={current.poster || current.image} 
              className="px-10 py-5 text-lg"
            />
            <Link 
              href={`/anime/${current.animeId || current.id}`} 
              className="group flex items-center space-x-3 px-8 py-5 border-2 border-secondary/40 hover:border-secondary transition-all"
            >
              <Terminal className="w-5 h-5 text-secondary group-hover:animate-pulse" />
              <span className="font-serif font-black uppercase tracking-widest text-sm">Access_Log</span>
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Cyberpunk Decorations */}
      <div className="absolute top-20 right-10 flex flex-col space-y-1 opacity-20 pointer-events-none hidden lg:flex">
         {[...Array(5)].map((_, i) => (
           <div key={i} className="h-1 bg-secondary" style={{ width: `${100 - i*15}%`, opacity: (10 - i*2)/10 }} />
         ))}
      </div>

      {/* Controls */}
      {items.length > 1 && (
        <>
          <button 
            onClick={prevSlide}
            className="absolute left-6 top-1/2 -translate-y-1/2 w-14 h-14 bg-black/40 border border-secondary/20 text-secondary opacity-0 group-hover:opacity-100 hover:bg-secondary hover:text-black transition-all clip-path-polygon"
            style={{ clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%, 0% 50%)' }}
          >
            <ChevronLeft className="w-8 h-8 mx-auto" />
          </button>
          <button 
            onClick={nextSlide}
            className="absolute right-6 top-1/2 -translate-y-1/2 w-14 h-14 bg-black/40 border border-secondary/20 text-secondary opacity-0 group-hover:opacity-100 hover:bg-secondary hover:text-black transition-all clip-path-polygon"
            style={{ clipPath: 'polygon(0% 0%, 100% 0%, 100% 50%, 100% 100%, 0% 100%)' }}
          >
            <ChevronRight className="w-8 h-8 mx-auto" />
          </button>

          {/* Cyberpunk Progress bar */}
          <div className="absolute bottom-0 left-0 w-full h-1 bg-white/5">
             <motion.div 
               key={`progress-${currentIndex}`}
               initial={{ width: "0%" }}
               animate={{ width: "100%" }}
               transition={{ duration: 8, ease: "linear" }}
               className="h-full bg-secondary shadow-[0_0_15px_rgba(34,197,94,1)]"
             />
          </div>

          {/* Indicators */}
          <div className="absolute bottom-10 right-10 flex flex-col space-y-2">
            {items.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i)}
                className={`transition-all duration-300 w-12 h-1 border ${
                  currentIndex === i ? 'bg-secondary border-secondary shadow-[0_0_10px_rgba(34,197,94,1)]' : 'bg-transparent border-secondary/20 hover:border-secondary/50'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
