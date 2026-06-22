import { Suspense } from 'react';
import type { Metadata } from 'next';
import { AnimeService } from '@/lib/services/anime';
import { Skeleton } from '@/components/ui/Skeleton';
import WatchContent from './WatchContent';

export async function generateMetadata(
  props: { params: Promise<{ id: string }> }
): Promise<Metadata> {
  const episodeSlug = (await props.params).id;
  
  let formattedEpisode = episodeSlug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

  try {
    const episode = await AnimeService.getEpisodeBySlug(episodeSlug);
    if (episode && episode.title) {
      formattedEpisode = episode.title;
    }
  } catch (error) {
    // fallback to formatted slug
  }

  const cleanEpisodeTitle = formattedEpisode.replace(/\s*Subtitle\s+Indonesia\s*$/i, '').trim();
  
  return {
    title: cleanEpisodeTitle,
    description: `Streaming ${cleanEpisodeTitle} on NaiveStream`,
  };
}
export default async function WatchPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  return (
    <Suspense fallback={
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Skeleton className="h-10 w-96 mb-6 rounded-none" style={{ clipPath: 'polygon(0 0, calc(100% - 15px) 0, 100% 15px, 100% 100%, 15px 100%, 0 calc(100% - 15px))' }} />
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-x-8 gap-y-6">
          <div className="space-y-4">
            <Skeleton className="aspect-video w-full rounded-none" />
            <div className="hidden lg:flex items-center gap-4">
              <Skeleton className="flex-grow h-[76px] rounded-none" style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 15px), calc(100% - 15px) 100%, 0 100%)' }} />
              <div className="shrink-0 flex items-center gap-3">
                <Skeleton className="h-[42px] w-[42px] rounded-none" style={{ clipPath: 'polygon(5px 0, 100% 0, 100% calc(100% - 5px), calc(100% - 5px) 100%, 0 100%, 0 5px)' }} />
                <Skeleton className="h-[42px] w-[42px] rounded-none" style={{ clipPath: 'polygon(5px 0, 100% 0, 100% calc(100% - 5px), calc(100% - 5px) 100%, 0 100%, 0 5px)' }} />
              </div>
            </div>
          </div>
          <div className="space-y-6">
            <div className="bg-card/50 p-6 space-y-4" style={{ clipPath: 'polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)' }}>
              <div className="flex items-center space-x-2 pb-3 mb-4 border-b border-border">
                <Skeleton className="w-1 h-4 rounded-none" />
                <Skeleton className="w-3.5 h-3.5 rounded-none" />
                <Skeleton className="h-3 w-24 rounded-none" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Skeleton className="h-[38px] rounded-none" />
                <Skeleton className="h-[38px] rounded-none" />
              </div>
              <div className="mt-6 space-y-3">
                <Skeleton className="h-3 w-28 rounded-none" />
                <div className="grid grid-cols-5 gap-2">
                  {Array.from({ length: 10 }).map((_, i) => (
                    <Skeleton key={i} className="aspect-square rounded-none" />
                  ))}
                </div>
              </div>
              <Skeleton className="h-[42px] w-full mt-2 rounded-none" />
            </div>
            <div className="bg-card/50 p-6 space-y-6" style={{ clipPath: 'polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)' }}>
              <div className="flex items-center space-x-2 pb-3 mb-4 border-b border-border">
                <Skeleton className="w-1 h-4 rounded-none" />
                <Skeleton className="w-3.5 h-3.5 rounded-none" />
                <Skeleton className="h-3 w-24 rounded-none" />
              </div>
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="h-4 w-20 rounded-none" />
                  <div className="flex flex-wrap gap-2">
                    <Skeleton className="h-[34px] w-[88px] rounded-none" />
                    <Skeleton className="h-[34px] w-[88px] rounded-none" />
                  </div>
                </div>
              ))}
            </div>
            <div className="lg:hidden p-6 bg-card">
              <Skeleton className="h-6 w-3/4 rounded-none" />
              <Skeleton className="h-3 w-24 mt-2 rounded-none" />
            </div>
          </div>
        </div>
        <Skeleton className="h-48 w-full mt-6 rounded-none" />
      </div>
    }>
      <WatchContent id={params.id} />
    </Suspense>
  );
}
