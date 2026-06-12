import { AnimeService } from "@/lib/services/anime";
import { AnimeCard } from "@/components/anime/AnimeCard";
import { HeroCarousel } from "@/components/anime/HeroCarousel";
import { HomeClientWrapper } from "@/components/home/HomeClientWrapper";
import { AnimeTitleDisplay } from '@/components/anime/AnimeTitleDisplay';
import { ChevronRight, Calendar, Time } from "@carbon/icons-react";
import Link from "next/link";
import { formatNextAiring } from "@/lib/utils";

const DAY_MAP: Record<number, string> = {
  0: 'Sunday', 1: 'Monday', 2: 'Tuesday',
  3: 'Wednesday', 4: 'Thursday', 5: 'Friday', 6: 'Saturday'
};

export default async function HomePage() {
  const { ongoing, completed, popular } = await AnimeService.getHomeData();
  
  // Fetch Schedule for today
  const scheduleData = await AnimeService.getSchedule();
  const currentJsDay = new Date().getDay();
  const todayString = DAY_MAP[currentJsDay];
  const todayAnimeList = scheduleData[todayString] || [];

  // Format today's date for display
  const todayFormatted = new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date());

  // Trending items for HeroCarousel — only ongoing with active episodes
  const trendingAnime = popular.filter((a: any) => (a.actual_episodes_count || 0) >= 2);
  const trendingItems = trendingAnime.slice(0, 5).map(anime => ({
    ...anime,
    id: anime.slug,
    image: anime.poster,
    banner: anime.banner || anime.poster,
    rating: String(anime.score),
    episodes: anime.status === 'Ongoing' ? `ep ${anime.latest_episode || '??'}` : `${anime.episodes_count || '??'} eps`,
    releaseDay: anime.release_day,
    genres: anime.genres ? anime.genres.split(',') : []
  }));

  return (
    <div className="pb-20 -mt-20">
      {/* Hero Carousel Section */}
      <HeroCarousel items={trendingItems} />

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 mt-12 space-y-16">
        <HomeClientWrapper>
        {/* Ongoing Section */}
        <section>
          <div className="flex items-end justify-between mb-8 border-b border-white/5 pb-4">
            <div className="space-y-2">
              <div className="flex items-baseline space-x-3">
                <span className="text-secondary font-mono font-black text-xl leading-none">{'//'}</span>
                <h2 className="text-2xl md:text-3xl font-serif font-black uppercase tracking-tighter">Ongoing Anime</h2>
              </div>
              <p className="text-[10px] font-mono font-bold uppercase tracking-[0.3em] text-muted-text pl-8">
                Recently updated series
              </p>
            </div>
            <Link 
              href="/ongoing" 
              className="group hidden sm:flex items-center space-x-2 px-4 py-2 bg-card/30 hover:bg-secondary/10 border border-white/5 hover:border-secondary/30 transition-colors text-[10px] uppercase font-black tracking-widest text-muted-text hover:text-foreground"
            >
              <span>View All</span> 
              <ChevronRight className="w-3.5 h-3.5 text-secondary group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          {/* Mobile View All */}
          <div className="sm:hidden mb-6 flex justify-end">
            <Link 
              href="/ongoing" 
              className="group flex items-center space-x-2 text-[10px] uppercase font-black tracking-widest text-secondary"
            >
              <span>View All</span> 
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          <div className="mobile-snap-scroll gap-4 md:gap-6">
            {ongoing.slice(0, 12).map((anime: any) => (
              <AnimeCard
                key={anime.slug}
                id={anime.slug}
                title={anime.title}
                titleEnglish={anime.title_english}
                image={anime.poster}
                rating={String(anime.score)}
                episode={`ep ${anime.latest_episode || '??'}`}
                status={anime.next_episode && anime.next_airing_at ? (formatNextAiring(anime.next_episode, anime.next_airing_at, true) || anime.release_day) : anime.release_day}
                totalEpisodes={anime.actual_episodes_count}
                forceGrid={true}
              />
            ))}
          </div>
        </section>

        {/* Complete Section */}
        <section>
          <div className="flex items-end justify-between mb-8 border-b border-white/5 pb-4">
            <div className="space-y-2">
              <div className="flex items-baseline space-x-3">
                <span className="text-secondary font-mono font-black text-xl leading-none">{'//'}</span>
                <h2 className="text-2xl md:text-3xl font-serif font-black uppercase tracking-tighter">Completed Series</h2>
              </div>
              <p className="text-[10px] font-mono font-bold uppercase tracking-[0.3em] text-muted-text pl-8">
                Watch the full story
              </p>
            </div>
            <Link 
              href="/completed" 
              className="group hidden sm:flex items-center space-x-2 px-4 py-2 bg-card/30 hover:bg-secondary/10 border border-white/5 hover:border-secondary/30 transition-colors text-[10px] uppercase font-black tracking-widest text-muted-text hover:text-foreground"
            >
              <span>View All</span> 
              <ChevronRight className="w-3.5 h-3.5 text-secondary group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          {/* Mobile View All */}
          <div className="sm:hidden mb-6 flex justify-end">
            <Link 
              href="/completed" 
              className="group flex items-center space-x-2 text-[10px] uppercase font-black tracking-widest text-secondary"
            >
              <span>View All</span> 
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          <div className="mobile-snap-scroll gap-4 md:gap-6">
            {completed.slice(0, 12).map((anime: any) => (
              <AnimeCard
                key={anime.slug}
                id={anime.slug}
                title={anime.title}
                titleEnglish={anime.title_english}
                image={anime.poster}
                rating={String(anime.score)}
                episode={`${anime.episodes_count || '??'} eps`}
                totalEpisodes={anime.actual_episodes_count}
                forceGrid={true}
              />
            ))}
          </div>
        </section>
        </HomeClientWrapper>

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
              {todayAnimeList.slice(0, 5).map((anime: any, index: number) => {
                const nextAiring = anime.next_episode && anime.next_airing_at
                  ? formatNextAiring(anime.next_episode, anime.next_airing_at)
                  : null;
                return (
                  <Link 
                    key={anime.slug} 
                    href={`/anime/${anime.slug}`}
                    className="group flex items-center justify-between p-4 bg-background/30 hover:bg-secondary/10 border-b border-white/5 last:border-0 transition-all relative overflow-hidden"
                  >
                    <div className="absolute inset-y-0 left-0 w-1 bg-secondary scale-y-0 group-hover:scale-y-100 transition-transform origin-top" />
                    <div className="flex items-center gap-4 pl-2 min-w-0">
                      <span className="text-[10px] font-mono text-muted-text/50 shrink-0">{(index + 1).toString().padStart(2, '0')}</span>
                      <span className="font-bold text-sm group-hover:text-secondary line-clamp-1 uppercase tracking-wider transition-colors">
                        <AnimeTitleDisplay title={anime.title} titleEnglish={anime.title_english} />
                      </span>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      {nextAiring && (
                        <span className="text-[10px] font-mono font-bold text-secondary/70 uppercase tracking-wider flex items-center gap-1">
                          <Time className="w-3 h-3" />
                          {nextAiring}
                        </span>
                      )}
                      <ChevronRight className="w-4 h-4 text-muted-text group-hover:text-secondary transition-transform group-hover:translate-x-1" />
                    </div>
                  </Link>
                );
              })}
              
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

