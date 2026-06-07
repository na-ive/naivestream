import { AnimeAPI } from "@/lib/api";
import { AnimeCard } from "@/components/anime/AnimeCard";
import { CheckCircle2, Frown } from "lucide-react";
import { Pagination } from "@/components/layout/Pagination";

export default async function CompletedPage(props: { searchParams: Promise<{ page?: string }> }) {
  const searchParams = await props.searchParams;
  const currentPage = parseInt(searchParams.page || '1');

  const res = await AnimeAPI.otakudesu.getComplete(currentPage);
  const complete = res?.data?.animeList || [];
  const totalPages = res?.pagination?.totalPages || 1;
  const error = !res;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="space-y-4 mb-12">
        <div className="flex items-center space-x-3 text-secondary">
          <CheckCircle2 className="w-8 h-8" />
          <h1 className="text-3xl md:text-4xl font-bold">Completed Anime</h1>
        </div>
        <p className="text-gray-500">Binge-watch your favorite series from start to finish.</p>
      </div>

      {error && complete.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
          <Frown className="w-12 h-12 text-gray-400" />
          <p className="text-gray-500">Failed to load completed anime. Please try again later.</p>
        </div>
      )}

      {complete.length > 0 && (
        <>
          <div className="anime-grid">
            {complete.map((anime: any) => (
              <AnimeCard
                key={anime.animeId || anime.id}
                id={anime.animeId || anime.id}
                title={anime.title}
                image={anime.poster || anime.image}
                rating={anime.score || anime.rating}
                episode={anime.episodes || anime.episode}
              />
            ))}
          </div>
          <Pagination 
            currentPage={currentPage} 
            totalPages={totalPages} 
            baseUrl="/completed" 
          />
        </>
      )}
    </div>
  );
}
