import { Suspense } from 'react';
import { AnimeService } from '@/lib/services/anime';
import { sanitizeGenreList } from '@/lib/sanitize';
import globalDb from '@/lib/db';
import { parseArrayField } from '@/lib/utils';
import { AnimeCardSkeleton } from '@/components/anime/AnimeCard';
import { ViewGridWrapper } from '@/components/layout/ViewGridWrapper';
import { SearchClient } from './SearchClient';

async function getGenres() {
  try {
    const genres = await AnimeService.getAllGenres();
    return sanitizeGenreList(genres);
  } catch (error) {
    console.error('Failed to fetch genres:', error);
    return [];
  }
}

async function getStudios() {
  try {
    if (!globalDb) return [];
    const rows = globalDb.prepare("SELECT DISTINCT studios FROM anime WHERE studios != '' AND studios IS NOT NULL").all() as { studios: string }[];
    const studioSet = new Set<string>();
    for (const row of rows) {
      const parsed = parseArrayField(row.studios);
      parsed.forEach(s => studioSet.add(s));
    }
    return Array.from(studioSet).sort();
  } catch (error) {
    console.error('Failed to fetch studios:', error);
    return [];
  }
}

export default async function SearchPage() {
  const [genres, studios] = await Promise.all([
    getGenres(),
    getStudios()
  ]);

  return (
    <Suspense fallback={
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <ViewGridWrapper>
          {Array.from({ length: 24 }).map((_, i) => (
            <AnimeCardSkeleton key={i} />
          ))}
        </ViewGridWrapper>
      </div>
    }>
      <SearchClient initialGenres={genres} initialStudios={studios} />
    </Suspense>
  );
}
