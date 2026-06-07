'use client';

import React from 'react';
import Link from 'next/link';
import { Play, Star } from 'lucide-react';
import { motion } from 'framer-motion';

interface AnimeCardProps {
  id: string;
  title: string;
  image: string;
  status?: string;
  rating?: string;
  episode?: string;
  type?: string;
}

export function AnimeCard({ id, title, image, status, rating, episode, type }: AnimeCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="group relative flex flex-col"
    >
      <Link href={`/anime/${id}`} className="block relative aspect-[3/4] rounded-2xl overflow-hidden bg-gray-800">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
        />
        
        {/* Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center scale-0 group-hover:scale-100 transition-transform duration-300 delay-100">
            <Play className="text-white fill-current w-6 h-6 ml-1" />
          </div>
        </div>

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {rating && (
            <div className="flex items-center space-x-1 px-2 py-1 bg-black/60 backdrop-blur-md rounded-lg text-[10px] font-bold text-yellow-400">
              <Star className="w-3 h-3 fill-current" />
              <span>{rating}</span>
            </div>
          )}
          {type && (
            <div className="px-2 py-1 bg-secondary rounded-lg text-[10px] font-bold text-white uppercase">
              {type}
            </div>
          )}
        </div>

        {episode && (
          <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/60 backdrop-blur-md rounded-lg text-[10px] font-bold text-white">
            EP {episode}
          </div>
        )}
      </Link>

      <div className="mt-3 space-y-1">
        <h3 className="text-sm font-bold line-clamp-2 group-hover:text-secondary transition-colors">
          {title}
        </h3>
        {status && (
          <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">
            {status}
          </p>
        )}
      </div>
    </motion.div>
  );
}
