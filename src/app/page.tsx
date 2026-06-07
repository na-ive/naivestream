import { AnimeAPI } from "@/lib/api";
import { AnimeCard } from "@/components/anime/AnimeCard";
import { HeroCarousel } from "@/components/anime/HeroCarousel";
import { ChevronRight, Calendar } from "lucide-react";
import Link from "next/link";

const DAY_MAP: Record<number, string> = {
  0: 'Minggu', 1: 'Senin', 2: 'Selasa',
  3: 'Rabu', 4: 'Kamis', 5: 'Jumat', 6: 'Sabtu'
};

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
  
  // Fetch Schedule for today
  const scheduleRes = await AnimeAPI.otakudesu.getSchedule();
  const currentJsDay = new Date().getDay();
  const todayString = DAY_MAP[currentJsDay];
  
  const scheduleData = scheduleRes?.data || [];
  const todayData = scheduleData.find((d: any) => d.day === todayString);
  const todayAnimeList = todayData?.anime_list || [];

  // Format today's date for display
  const todayFormatted = new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date());

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
              <p className="text-sm text-muted-text">Recently updated series</p>
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
                rating={anime.score || anime.rating}
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
              <p className="text-sm text-muted-text">Watch the full story</p>
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

        {/* Today's Schedule Section */}
        {todayAnimeList.length > 0 && (
          <section className="bg-card border-2 border-secondary/20 p-6 relative overflow-hidden mt-12">
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <Calendar className="w-48 h-48 text-secondary" />
            </div>
            
            <div className="flex items-center justify-between mb-6 relative z-10 border-b-2 border-secondary/20 pb-4">
              <div className="space-y-1 flex items-center gap-4">
                <Calendar className="w-8 h-8 text-secondary" />
                <div>
                  <h2 className="text-2xl font-black uppercase tracking-widest text-foreground">
                    Today's Schedule
                  </h2>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-secondary">
                    {todayFormatted}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="space-y-3 relative z-10">
              {todayAnimeList.slice(0, 5).map((anime: any) => (
                <Link 
                  key={anime.slug} 
                  href={`/anime/${anime.slug}`}
                  className="group flex items-center justify-between p-4 bg-background border border-secondary/10 hover:border-secondary hover:bg-secondary/5 transition-all"
                >
                  <span className="font-bold text-sm group-hover:text-secondary line-clamp-1 pr-4 uppercase tracking-wider">
                    {anime.title}
                  </span>
                  <ChevronRight className="w-5 h-5 text-muted-text group-hover:text-secondary shrink-0 transition-transform group-hover:translate-x-1" />
                </Link>
              ))}
              
              {todayAnimeList.length > 5 && (
                <Link 
                  href={`/schedule?day=${todayString}`}
                  className="block text-center p-4 bg-secondary text-background hover:bg-secondary/90 transition-colors text-sm font-black uppercase tracking-widest mt-6 border-2 border-secondary"
                >
                  Show More ({todayAnimeList.length - 5} Others)
                </Link>
              )}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
