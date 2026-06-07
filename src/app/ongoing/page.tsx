import { AnimeAPI } from "@/lib/api";
import { AnimeCard } from "@/components/anime/AnimeCard";
import { Activity, Frown } from "lucide-react";
import { Pagination } from "@/components/layout/Pagination";

export default async function OngoingPage(props: { searchParams: Promise<{ page?: string }> }) {
  const searchParams = await props.searchParams;
  const currentPage = parseInt(searchParams.page || '1');
  
  const res = await AnimeAPI.otakudesu.getOngoing(currentPage);
  const ongoing = res?.data?.animeList || [];
  const totalPages = res?.pagination?.totalPages || 1;
  const error = !res;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="space-y-4 mb-12">
        <div className="flex items-center space-x-3 text-secondary">
          <Activity className="w-8 h-8" />
          <h1 className="text-3xl md:text-5xl font-black">Ongoing</h1>
        </div>
        <p className="text-foreground/60 font-bold uppercase tracking-widest text-xs">Latest updates from airing series</p>
      </div>

      {error && ongoing.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 border-2 border-dashed border-secondary/20">
          <Frown className="w-12 h-12 text-foreground/20" />
          <p className="text-foreground/40 font-bold uppercase tracking-widest text-xs">Failed to load data. Please try again later.</p>
        </div>
      )}

      {ongoing.length > 0 && (
        <>
          <div className="anime-grid">
            {ongoing.map((anime: any) => (
              <AnimeCard
                key={anime.animeId || anime.id}
                id={anime.animeId || anime.id}
                title={anime.title}
                image={anime.poster || anime.image}
                rating={anime.score || anime.rating}
                episode={anime.episodes || anime.episode}
                status={anime.releaseDay || anime.day}
              />
            ))}
          </div>
          <Pagination 
            currentPage={currentPage} 
            totalPages={totalPages} 
            baseUrl="/ongoing" 
          />
        </>
      )}
    </div>
  );
}
