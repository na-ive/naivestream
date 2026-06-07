import React from 'react';
import { AnimeAPI } from '@/lib/api';
import { Tags, Frown } from 'lucide-react';
import { GenreView } from './GenreView';

export const metadata = {
  title: 'Browse by Genre - NaiveStream',
  description: 'Explore anime by genre.',
};

export default async function GenrePage() {
  const res = await AnimeAPI.otakudesu.getGenreList();
  const genres = res?.data?.genreList || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="space-y-4 mb-12">
        <div className="flex items-center space-x-3 text-secondary">
          <Tags className="w-8 h-8" />
          <h1 className="text-3xl md:text-5xl font-black uppercase">Browse by Genre</h1>
        </div>
        <p className="text-muted-text font-bold uppercase tracking-widest text-xs">
          Discover anime across {genres.length || 'various'} categories
        </p>
      </div>

      {genres.length > 0 ? (
        <GenreView genres={genres} />
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 border-2 border-dashed border-secondary/20 bg-card">
          <Frown className="w-12 h-12 text-muted-text" />
          <p className="text-muted-text font-bold uppercase tracking-widest text-xs">
            Failed to load genres.
          </p>
        </div>
      )}
    </div>
  );
}
