import { AnimeCard } from './AnimeCard';

export function ForYouHome({ recommendations }: { recommendations: any[] }) {
  if (!recommendations || recommendations.length === 0) {
    return null;
  }

  return (
    <section>
      <div className="flex items-end justify-between mb-8 border-b border-white/5 pb-4">
        <div className="space-y-2">
          <div className="flex items-baseline space-x-3">
            <span className="text-secondary font-mono font-black text-xl leading-none">{'//'}</span>
            <h2 className="text-2xl md:text-3xl font-serif font-black uppercase tracking-tighter">
              For You
            </h2>
          </div>
          <p className="text-[10px] font-mono font-bold uppercase tracking-[0.3em] text-muted-text pl-8">
            Based on your watch history
          </p>
        </div>
      </div>
      <div className="mobile-snap-scroll gap-4 md:gap-6">
        {recommendations.map((anime: any) => (
          <AnimeCard
            key={anime.slug}
            id={anime.slug}
            title={anime.title}
            titleEnglish={anime.title_english}
            image={anime.poster}
            rating={String(anime.score)}
            status={anime.status}
            episode={`${anime.episodes_count || '??'} eps`}
            totalEpisodes={anime.actual_episodes_count}
            forceGrid={true}
          />
        ))}
      </div>
    </section>
  );
}
