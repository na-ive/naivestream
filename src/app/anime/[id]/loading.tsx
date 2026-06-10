import { Skeleton } from '@/components/ui/Skeleton';
import { EpisodeListSkeleton } from '@/components/anime/EpisodeList';
import { CharacterCarouselSkeleton } from '@/components/anime/CharacterCarousel';
import { ContinueWatchingSkeleton } from '@/components/anime/ContinueWatching';
import { AnimeCardSkeleton } from '@/components/anime/AnimeCard';

export default function AnimeDetailLoading() {
  return (
    <div className="pb-20 -mt-20">
      <div className="relative w-full h-[40vh] min-h-[300px] overflow-hidden">
        <Skeleton className="absolute inset-0 rounded-none" />
        <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
      </div>

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 -mt-32 relative z-10">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="w-full max-w-[280px] mx-auto md:mx-0 shrink-0 space-y-6">
            <Skeleton className="aspect-[3/4] border-4 border-background shadow-2xl rounded-none" />

            <ContinueWatchingSkeleton />

            <Skeleton className="w-full h-12 rounded-none" />

            <div className="space-y-4">
              <Skeleton className="h-16 w-full rounded-none" />
              <Skeleton className="h-[264px] w-full rounded-none" />
              <Skeleton className="aspect-video w-full rounded-none" />
            </div>
          </div>

          <div className="flex-grow min-w-0 space-y-8 mt-8 md:mt-0">
            <div className="space-y-4">
              <Skeleton className="h-14 w-3/4 rounded-none" />
              <Skeleton className="h-14 w-1/2 rounded-none" />
              <div className="flex flex-wrap gap-2">
                <Skeleton className="h-7 w-20 rounded-none" />
                <Skeleton className="h-7 w-24 rounded-none" />
                <Skeleton className="h-7 w-16 rounded-none" />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Skeleton className="w-1.5 h-6 rounded-none" />
                <Skeleton className="w-5 h-5 rounded-none" />
                <Skeleton className="h-6 w-28 rounded-none" />
              </div>
              <div className="space-y-2 border-l-4 border-secondary/20 pl-6 pr-6 py-4">
                <Skeleton className="h-4 w-full rounded-none" />
                <Skeleton className="h-4 w-full rounded-none" />
                <Skeleton className="h-4 w-3/4 rounded-none" />
                <Skeleton className="h-4 w-full rounded-none" />
                <Skeleton className="h-4 w-1/2 rounded-none" />
              </div>
            </div>

            <div className="space-y-6 pt-4">
              <EpisodeListSkeleton />
            </div>

            <CharacterCarouselSkeleton />

            <div className="space-y-6">
              <div className="flex items-center space-x-3">
                <Skeleton className="w-1.5 h-6 rounded-none" />
                <Skeleton className="w-5 h-5 rounded-none" />
                <Skeleton className="h-6 w-36 rounded-none" />
              </div>
              <div className="anime-grid">
                {Array.from({ length: 6 }).map((_, i) => (
                  <AnimeCardSkeleton key={i} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
