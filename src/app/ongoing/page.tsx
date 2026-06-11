import { Metadata } from 'next';
import { AnimeService } from "@/lib/services/anime";
import { AnimeCard } from "@/components/anime/AnimeCard";
import { Activity, FaceDissatisfied } from "@carbon/icons-react";
import { Pagination } from "@/components/layout/Pagination";
import { formatNextAiring } from "@/lib/utils";

export const metadata: Metadata = {
  title: 'Ongoing Anime - NaiveStream',
  description: 'Browse currently airing anime series.',
};

export default async function OngoingPage(props: { searchParams: Promise<{ page?: string }> }) {
  const searchParams = await props.searchParams;
  const currentPage = parseInt(searchParams.page || '1');
  
  const res = await AnimeService.getAnimeList({ status: 'Ongoing', page: currentPage, limit: 24 });
  const ongoing = res.items;
  const totalPages = res.pagination.last_page;
  const error = ongoing.length === 0 && currentPage === 1;

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-12">
        <div className="flex items-center space-x-4 mb-6">
          <div className="p-3 bg-secondary/10 text-secondary border border-secondary/30 relative">
            <Activity className="w-8 h-8 relative z-10" />
            <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-secondary" />
            <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-secondary" />
          </div>
          <h1 className="text-4xl md:text-5xl font-serif font-black uppercase tracking-tighter">Ongoing<span className="text-secondary">_</span></h1>
        </div>
        
        <div className="inline-block px-6 py-3 bg-card/80 border-l-4 border-secondary/50 shadow-lg relative overflow-hidden"
             style={{ clipPath: 'polygon(0 0, 100% 0, calc(100% - 15px) 100%, 0 100%)' }}>
          <div className="absolute inset-0 bg-gradient-to-r from-secondary/10 to-transparent pointer-events-none" />
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-foreground/80 relative z-10">
            Latest updates from airing series
          </p>
        </div>
      </div>

      {error && ongoing.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 border-2 border-dashed border-secondary/20">
          <FaceDissatisfied className="w-12 h-12 text-foreground/20" />
          <p className="text-foreground/40 font-bold uppercase tracking-widest text-xs">No ongoing anime found.</p>
        </div>
      )}

      {ongoing.length > 0 && (
        <>
          <div className="anime-grid">
            {ongoing.map((anime: any) => (
              <AnimeCard
                key={anime.slug}
                id={anime.slug}
                title={anime.title}
                titleEnglish={anime.title_english}
                image={anime.poster}
                rating={String(anime.score)}
                episode={`ep ${anime.latest_episode || '??'}`}
                status={anime.next_episode && anime.next_airing_at ? formatNextAiring(anime.next_episode, anime.next_airing_at, true) : anime.release_day}
                totalEpisodes={anime.actual_episodes_count}
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
