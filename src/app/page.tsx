import { AnimeAPI } from "@/lib/api";
import { AnimeCard } from "@/components/anime/AnimeCard";
import { Play, TrendingUp, Calendar, ChevronRight } from "lucide-react";
import Link from "next/link";

async function getOngoing() {
  const res = await AnimeAPI.otakudesu.getHome();
  if (res?.data?.ongoing?.animeList) return res.data.ongoing.animeList;
  
  // Fallback to direct ongoing endpoint
  const directRes = await AnimeAPI.otakudesu.getOngoing(1);
  if (directRes?.data?.animeList) return directRes.data.animeList;
  
  return [];
}

async function getComplete() {
  const res = await AnimeAPI.otakudesu.getHome();
  if (res?.data?.completed?.animeList) return res.data.completed.animeList;

  // Fallback to direct complete endpoint
  const directRes = await AnimeAPI.otakudesu.getComplete(1);
  if (directRes?.data?.animeList) return directRes.data.animeList;

  return [];
}

export default async function HomePage() {
  const ongoing = await getOngoing();
  const complete = await getComplete();

  const featured = ongoing?.[0];

  return (
    <div className="pb-20">
      {/* Hero Section */}
      {featured && (
        <section className="relative w-full h-[70vh] min-h-[500px] overflow-hidden">
          <div className="absolute inset-0">
            <img
              src={featured.poster || featured.image}
              alt={featured.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-background via-background/60 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
          </div>

          <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-center">
            <div className="max-w-2xl space-y-6">
              <div className="flex items-center space-x-2 text-secondary font-bold uppercase tracking-widest text-sm">
                <TrendingUp className="w-4 h-4" />
                <span>Trending Now</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-bold leading-tight">
                {featured.title}
              </h1>
              <div className="flex items-center space-x-4 text-sm font-medium">
                <span className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-full border border-white/20">
                  {featured.episodes ? `${featured.episodes} Episodes` : 'Ongoing'}
                </span>
                <span className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  {featured.releaseDay || featured.day || 'Today'}
                </span>
              </div>
              <p className="text-gray-400 line-clamp-3 md:text-lg">
                Watch the latest episodes of {featured.title} and stay updated with your favorite series.
              </p>
              <div className="flex items-center space-x-4">
                <Link href={`/anime/${featured.animeId || featured.id}`} className="btn-primary flex items-center space-x-2">
                  <Play className="w-5 h-5 fill-current" />
                  <span>Watch Now</span>
                </Link>
                <Link href={`/anime/${featured.animeId || featured.id}`} className="px-6 py-3 rounded-lg border border-border font-medium hover:bg-white/5 transition-colors">
                  View Details
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

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
            {complete?.slice(0, 12).map((anime: any) => (
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
