import { AnimeAPI } from "@/lib/api";
import { AnimeCard } from "@/components/anime/AnimeCard";
import { HeroCarousel } from "@/components/anime/HeroCarousel";
import { ChevronRight } from "lucide-react";
import Link from "next/link";

async function getOngoing() {
  const res = await AnimeAPI.otakudesu.getHome();
  if (res?.data?.ongoing?.animeList) return res.data.ongoing.animeList;
  
  const directRes = await AnimeAPI.otakudesu.getOngoing(1);
  if (directRes?.data?.animeList) return directRes.data.animeList;
  
  return [];
}

async function getComplete() {
  const res = await AnimeAPI.otakudesu.getHome();
  if (res?.data?.completed?.animeList) return res.data.completed.animeList;

  const directRes = await AnimeAPI.otakudesu.getComplete(1);
  if (directRes?.data?.animeList) return directRes.data.animeList;

  return [];
}

export default async function HomePage() {
  const ongoing = await getOngoing();
  const complete = await getComplete();

  // Trending could be the first 5 ongoing items
  const trendingItems = ongoing?.slice(0, 5) || [];

  return (
    <div className="pb-20">
      {/* Hero Carousel Section */}
      <HeroCarousel items={trendingItems} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 space-y-16">
        {/* Ongoing Section */}
        <section>
          <div className="flex items-center justify-between mb-8">
            <div className="space-y-1">
              <h2 className="text-2xl font-bold">Ongoing Anime</h2>
              <p className="text-sm text-gray-500">Recently updated series</p>
            </div>
            <Link href="/ongoing" className="flex items-center text-sm font-medium text-secondary hover:underline">
              View All <ChevronRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
          <div className="anime-grid">
            {ongoing?.slice(0, 10).map((anime: any) => (
              <AnimeCard
                key={anime.animeId || anime.id}
                id={anime.animeId || anime.id}
                title={anime.title}
                image={anime.poster || anime.image}
                episode={anime.episodes || anime.episode}
                status={anime.releaseDay || anime.day}
              />
            ))}
          </div>
        </section>

        {/* Complete Section */}
        <section>
          <div className="flex items-center justify-between mb-8">
            <div className="space-y-1">
              <h2 className="text-2xl font-bold">Completed Series</h2>
              <p className="text-sm text-gray-500">Watch the full story</p>
            </div>
            <Link href="/completed" className="flex items-center text-sm font-medium text-secondary hover:underline">
              View All <ChevronRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
          <div className="anime-grid">
            {complete?.slice(0, 10).map((anime: any) => (
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
        </section>
      </div>
    </div>
  );
}
