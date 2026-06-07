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
          <section 
            className="bg-card/40 border-t border-b border-secondary/30 p-8 md:p-12 relative overflow-hidden mt-20"
            style={{ clipPath: 'polygon(30px 0, 100% 0, 100% calc(100% - 30px), calc(100% - 30px) 100%, 0 100%, 0 30px)' }}
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 relative z-10 border-b border-white/10 pb-6">
              <div className="space-y-1 flex items-center gap-4">
                <div className="p-3 bg-secondary/10 text-secondary" style={{ clipPath: 'polygon(5px 0, 100% 0, 100% calc(100% - 5px), calc(100% - 5px) 100%, 0 100%, 0 5px)' }}>
                  <Calendar className="w-8 h-8" />
                </div>
                <div>
                  <h2 className="text-2xl font-serif font-black uppercase tracking-tighter text-foreground leading-none">
                    Today's Schedule
                  </h2>
                  <p className="text-[10px] font-mono font-bold uppercase tracking-[0.3em] text-secondary mt-1">
                    {todayFormatted}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="space-y-2 relative z-10">
              {todayAnimeList.slice(0, 5).map((anime: any, index: number) => (
                <Link 
                  key={anime.slug} 
                  href={`/anime/${anime.slug}`}
                  className="group flex items-center justify-between p-4 bg-background/30 hover:bg-secondary/10 border-b border-white/5 last:border-0 transition-all relative overflow-hidden"
                >
                  <div className="absolute inset-y-0 left-0 w-1 bg-secondary scale-y-0 group-hover:scale-y-100 transition-transform origin-top" />
                  <div className="flex items-center gap-4 pl-2">
                    <span className="text-[10px] font-mono text-muted-text/50">{(index + 1).toString().padStart(2, '0')}</span>
                    <span className="font-bold text-sm group-hover:text-secondary line-clamp-1 uppercase tracking-wider transition-colors">
                      {anime.title}
                    </span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-text group-hover:text-secondary shrink-0 transition-transform group-hover:translate-x-1" />
                </Link>
              ))}
              
              {todayAnimeList.length > 5 && (
                <div className="pt-6 text-center">
                  <Link 
                    href={`/schedule?day=${todayString}`}
                    className="inline-block px-10 py-4 bg-secondary text-background hover:bg-secondary/90 transition-colors text-xs font-black uppercase tracking-[0.2em] shadow-[0_0_20px_rgba(34,197,94,0.2)]"
                    style={{ clipPath: 'polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)' }}
                  >
                    Load Full Schedule ({todayAnimeList.length - 5} More)
                  </Link>
                </div>
              )}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
