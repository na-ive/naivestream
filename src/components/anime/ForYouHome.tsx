'use client';

import { useState, useEffect } from 'react';
import { useHistory } from '@/lib/hooks/useHistory';
import { useWatchlist } from '@/lib/hooks/useWatchlist';
import { AnimeCard } from './AnimeCard';

export function ForYouHome() {
  const { history } = useHistory();
  const { watchlist } = useWatchlist();
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    // Collect unique slugs from history and watchlist
    const slugs = new Set([
      ...history.map(h => h.animeId),
      ...watchlist.map(w => w.animeId)
    ]);

    if (slugs.size < 5) {
      setShouldRender(false);
      setLoading(false);
      return;
    }

    setShouldRender(true);

    const fetchRecommendations = async () => {
      try {
        const res = await fetch('/api/anime/foryou', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ slugs: Array.from(slugs) })
        });
        
        if (res.ok) {
          const data = await res.json();
          setRecommendations(data.data || []);
        }
      } catch (error) {
        console.error('Failed to fetch recommendations:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [history, watchlist]);

  if (!shouldRender || loading || recommendations.length === 0) {
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
            episode={`${anime.episodes_count || '??'} eps`}
            totalEpisodes={anime.actual_episodes_count}
          />
        ))}
      </div>
    </section>
  );
}
