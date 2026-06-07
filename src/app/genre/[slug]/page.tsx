import React from 'react';
import { AnimeAPI } from '@/lib/api';
import { notFound } from 'next/navigation';
import { GenreAnimeList } from './GenreAnimeList';
import { Tags, Frown } from 'lucide-react';

export const metadata = {
  title: 'Genre - NaiveStream',
};

export default async function GenreDetailPage(props: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await props.searchParams;
  const params = await props.params;
  const { slug } = params;
  
  if (!slug) {
    notFound();
  }

  const res = await AnimeAPI.otakudesu.getGenreAnime(slug, 1);
  const animeList = res?.data?.animeList || [];

  // Try to find the actual genre title from the first item, otherwise format the slug
  let genreTitle = slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  if (animeList.length > 0 && animeList[0].genreList) {
    const matchedGenre = animeList[0].genreList.find((g: any) => g.genreId === slug);
    if (matchedGenre && matchedGenre.title) {
      genreTitle = matchedGenre.title;
    }
  }

  // Next page logic (assuming 15 items per page is full)
  const isLastPage = animeList.length < 15;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="space-y-4 mb-12">
        <div className="flex items-center space-x-3 text-secondary">
          <Tags className="w-8 h-8" />
          <h1 className="text-3xl md:text-5xl font-black uppercase">{genreTitle}</h1>
        </div>
        <p className="text-muted-text font-bold uppercase tracking-widest text-xs">
          Browse anime in {genreTitle} genre
        </p>
      </div>

      {animeList.length > 0 ? (
        <GenreAnimeList initialAnime={animeList} slug={slug} />
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 border-2 border-dashed border-secondary/20 bg-card">
          <Frown className="w-12 h-12 text-muted-text" />
          <p className="text-muted-text font-bold uppercase tracking-widest text-xs">
            No anime found for {genreTitle} on this page.
          </p>
        </div>
      )}
    </div>
  );
}
