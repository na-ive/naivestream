import { Suspense } from 'react';
import { Renew } from '@carbon/icons-react';
import type { Metadata } from 'next';
import { AnimeAPI } from '@/lib/api';
import WatchContent from './WatchContent';

export async function generateMetadata(
  props: { params: Promise<{ id: string }>; searchParams: Promise<{ [key: string]: string | string[] | undefined }> }
): Promise<Metadata> {
  const searchParams = await props.searchParams;
  const animeTitle = searchParams.title ? String(searchParams.title) : 'Unknown Anime';
  const source = searchParams.source ? String(searchParams.source) : 'otakudesu';
  const episodeSlug = (await props.params).id;
  
  let formattedEpisode = episodeSlug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  
  try {
    const res = source === 'samehadaku' 
      ? await AnimeAPI.samehadaku.getEpisode(episodeSlug)
      : await AnimeAPI.otakudesu.getEpisode(episodeSlug);
      
    const data = res?.data || (res?.title ? res : null);
    if (data && data.title) {
      formattedEpisode = data.title;
    }
  } catch (error) {
    // fallback to formatted slug
  }
  
  const finalTitle = formattedEpisode.toLowerCase().includes(animeTitle.toLowerCase()) 
    ? formattedEpisode 
    : `${animeTitle} - ${formattedEpisode}`;
  
  return {
    title: finalTitle,
    description: `Streaming ${formattedEpisode} on NaiveStream`,
  };
}

export default async function WatchPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[60vh]">
        <Renew className="w-12 h-12 text-secondary animate-spin" />
      </div>
    }>
      <WatchContent id={params.id} />
    </Suspense>
  );
}
