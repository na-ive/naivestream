import { AnimeService } from "@/lib/services/anime";
import type { Metadata } from 'next';
import { Information, StarFilled, Grid } from "@carbon/icons-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ContinueWatching } from "@/components/anime/ContinueWatching";
import { EpisodeList } from "@/components/anime/EpisodeList";
import { BookmarkButton } from "@/components/anime/BookmarkButton";
import { CharacterCarousel } from "@/components/anime/CharacterCarousel";
import { AnimeCard } from "@/components/anime/AnimeCard";
import { AnimeTitleDisplay } from "@/components/anime/AnimeTitleDisplay";
import { LazyIframe } from "@/components/ui/LazyIframe";

async function getAnimeDetails(slug: string) {
  const anime = await AnimeService.getAnimeBySlug(slug);
  if (!anime) return null;
  
  const episodes = await AnimeService.getEpisodes(anime.id);
  
  return {
    source: 'database',
    data: {
      ...anime,
      episodeList: episodes
        .filter(ep => ep.eps_number !== null && ep.eps_number !== undefined)
        .map(ep => ({
          episodeId: ep.slug,
          eps: ep.eps_number,
          title: ep.title,
          date: ep.uploaded_at
        }))
    }
  };
}

export async function generateMetadata(props: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const params = await props.params;
  const { id } = params;
  
  if (!id || id === 'undefined') {
    return { title: 'Not Found' };
  }

  const anime = await AnimeService.getAnimeBySlug(id);
  
  if (!anime) {
    return { title: 'Not Found' };
  }

  return {
    title: anime.title || 'Anime Details',
    description: `Watch ${anime.title} on NaiveStream`,
  };
}

export default async function AnimeDetailPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const { id } = params;
  
  if (!id || id === 'undefined') {
    notFound();
  }

  const result = await getAnimeDetails(id);

  if (!result || !result.data) {
    notFound();
  }

  const { data } = result;
  const source = 'otakudesu';
  const similarAnime = await AnimeService.getSimilarAnime(data.id, 6);

  const poster = data.poster;
  const banner = data.banner || poster;
  const episodes = data.episodeList || [];
  const genres = data.genres || [];
  const synopsis = data.synopsis || "No synopsis available.";
  const rating = data.score;
  const status = data.status;
  
  // Always use episodes_count from data, defaulting to '??' if null or 0
  const totalEpisodes = data.episodes_count > 0 ? data.episodes_count : '??';
  const numEpisodes = `${totalEpisodes} eps`;
  
  const studios = Array.isArray(data.studios) ? data.studios.join(', ') : (data.studios || 'Unknown');
  const producers = Array.isArray(data.producers) ? data.producers.join(', ') : (data.producers || 'Unknown');
  const aired = data.aired || 'Unknown';
  const animeType = data.type || 'Unknown';
  const animeSource = data.source || 'Unknown';
  const ageRating = data.rating || 'Unknown';
  const duration = data.duration_minutes ? `${data.duration_minutes} min` : 'Unknown';
  const season = data.season && data.year ? `${data.season} ${data.year}` : 'Unknown';
  
  const trailerUrl = data.youtube_trailer_id
    ? `https://www.youtube.com/embed/${data.youtube_trailer_id}?autoplay=0`
    : null;

  // Map DB characters to CharacterCarousel expected shape
  const charactersData = (data.characters || []).map((c: any, i: number) => ({
    character: {
      mal_id: i,
      name: c.name,
      images: { webp: { image_url: c.image } }
    },
    role: c.role,
    voice_actors: c.va_name ? [{
      language: 'Japanese',
      person: {
        name: c.va_name,
        images: { jpg: { image_url: c.va_image } }
      }
    }] : []
  }));

  return (
    <div className="pb-20 -mt-20">
      {/* Backdrop Header */}
      <div className="relative w-full h-[40vh] min-h-[300px] overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={banner}
            alt={data.title}
            loading="eager"
            className="w-full h-full object-cover object-[center_25%] blur-sm opacity-50 dark:opacity-100 brightness-110 dark:brightness-[0.3]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 -mt-32 relative z-10">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Poster & Action Sidebar */}
          <div className="w-full max-w-[280px] mx-auto md:mx-0 shrink-0 space-y-6">
            <div className="aspect-[3/4] border-4 border-background shadow-2xl relative">
              <img src={poster} alt={data.title} loading="eager" className="w-full h-full object-cover" />
              <div className="absolute inset-0 border-2 border-secondary/20 pointer-events-none" />
            </div>

            <ContinueWatching 
              animeId={id} 
              animeTitle={data.title} 
              animeTitleEnglish={data.title_english}
              animeImage={poster} 
              source={source} 
              episodes={episodes}
            />

            {/* Bookmark Button */}
            <BookmarkButton 
              animeId={id} 
              animeTitle={data.title} 
              animeTitleEnglish={data.title_english}
              animeImage={poster} 
              variant="full"
              className="w-full"
            />
            
            <div className="space-y-4">
              {rating && (
                <div 
                  className="flex items-center justify-between p-4 bg-card/50 border-l-4 border-secondary/50 relative overflow-hidden group hover:border-secondary transition-colors"
                  style={{ clipPath: 'polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)' }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-secondary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="flex items-center space-x-2 relative z-10">
                    <StarFilled className="text-secondary w-5 h-5" />
                    <span className="font-serif font-black text-xl">{rating}</span>
                  </div>
                  <span className="text-[10px] text-muted-text uppercase font-black tracking-widest relative z-10">Score</span>
                </div>
              )}
              
              <div 
                className="p-5 bg-card/50 border-l-4 border-secondary/20 space-y-4 relative"
                style={{ clipPath: 'polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)' }}
              >
                <div className="flex justify-between text-xs font-bold uppercase tracking-wider">
                  <span className="text-muted-text">Status</span>
                  <span className="text-secondary">{status}</span>
                </div>
                <div className="flex justify-between text-xs font-bold uppercase tracking-wider">
                  <span className="text-muted-text">Episodes</span>
                  <span className="text-foreground">{numEpisodes}</span>
                </div>
                <div className="flex justify-between text-xs font-bold uppercase tracking-wider border-t border-white/5 pt-2">
                  <span className="text-muted-text">Type</span>
                  <span className="text-foreground text-right">{animeType}</span>
                </div>
                <div className="flex justify-between text-xs font-bold uppercase tracking-wider">
                  <span className="text-muted-text">Source</span>
                  <span className="text-foreground text-right">{animeSource}</span>
                </div>
                <div className="flex justify-between text-xs font-bold uppercase tracking-wider">
                  <span className="text-muted-text">Season</span>
                  <span className="text-foreground text-right capitalize">{season}</span>
                </div>
                <div className="flex justify-between items-start text-xs font-bold uppercase tracking-wider gap-4">
                  <span className="text-muted-text shrink-0">Studio</span>
                  <span className="text-foreground text-right leading-relaxed">{studios}</span>
                </div>
                <div className="flex justify-between items-start text-xs font-bold uppercase tracking-wider gap-4">
                  <span className="text-muted-text shrink-0">Aired</span>
                  <span className="text-foreground text-right leading-relaxed">{aired}</span>
                </div>
                <div className="flex justify-between items-start text-xs font-bold uppercase tracking-wider gap-4">
                  <span className="text-muted-text shrink-0">Duration</span>
                  <span className="text-foreground text-right leading-relaxed">{duration}</span>
                </div>
                <div className="flex justify-between items-start text-xs font-bold uppercase tracking-wider gap-4">
                  <span className="text-muted-text shrink-0">Rating</span>
                  <span className="text-foreground text-right leading-relaxed">{ageRating}</span>
                </div>
                {data.anilist_id && (
                  <div className="flex justify-between items-start text-xs font-bold uppercase tracking-wider gap-4 border-t border-white/5 pt-2">
                    <span className="text-muted-text shrink-0">External</span>
                    <a 
                      href={`https://anilist.co/anime/${data.anilist_id}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-secondary hover:underline"
                    >
                      AniList
                    </a>
                  </div>
                )}
              </div>

              {/* Sidebar Trailer */}
              {trailerUrl && (
                <div className="aspect-video w-full bg-black border-4 border-background shadow-2xl relative group">
                  <LazyIframe
                    src={trailerUrl}
                    title="Anime Trailer"
                    poster={banner || poster}
                    overlayText="WATCH TRAILER"
                    className="absolute inset-0 w-full h-full pointer-events-auto"
                  />
                  <div className="absolute inset-0 pointer-events-none border-2 border-secondary/20 group-hover:border-secondary/50 transition-colors duration-300" />
                </div>
              )}
            </div>
          </div>

          {/* Info & Content */}
          <div className="flex-grow min-w-0 space-y-8 mt-8 md:mt-0">
            <div className="space-y-4">
              <h1 className="text-3xl md:text-6xl font-serif font-black leading-none tracking-tighter">
                <AnimeTitleDisplay title={data.title} titleEnglish={data.title_english} />
              </h1>
              <div className="flex flex-wrap gap-2">
                {genres.map((genre: any, idx: number) => {
                  return (
                    <Link 
                      key={genre.slug || `genre-${idx}`} 
                      href={`/genre/${genre.slug}`}
                      className="px-3 py-1 bg-secondary text-background text-[10px] font-black uppercase tracking-widest clip-path-polygon-small hover:bg-secondary/80 transition-colors"
                    >
                      {genre.name}
                    </Link>
                  );
                })}
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-3 text-lg font-serif font-black uppercase tracking-widest">
                <div className="w-1.5 h-6 bg-secondary" />
                <Information className="w-5 h-5 text-secondary" />
                <h2>Synopsis<span className="text-secondary opacity-70">_</span></h2>
              </div>
              <div className="text-foreground/70 leading-relaxed text-sm md:text-base border-l-4 border-secondary/20 pl-6 pr-6 py-4 bg-secondary/[0.02]">
                {synopsis.split(/\n\s*\n+/).filter(Boolean).map((paragraph: string, i: number) => (
                  <p key={i} className={i > 0 ? 'mt-4' : ''}>
                    {paragraph.trim()}
                  </p>
                ))}
              </div>
            </div>

            {/* Episode List Section */}
            <div className="space-y-6 pt-4">
              <EpisodeList 
                episodes={episodes} 
                animeId={id} 
                animeTitle={data.title} 
                animeTitleEnglish={data.title_english}
                poster={poster} 
                source={source} 
              />
            </div>

            {/* Characters Section */}
            <CharacterCarousel characters={charactersData} />

            {/* Similar Anime Section */}
            {similarAnime.length > 0 && (
              <div className="space-y-6">
                <div className="flex items-center space-x-3 text-lg font-serif font-black uppercase tracking-widest">
                  <div className="w-1.5 h-6 bg-secondary" />
                  <Grid className="w-5 h-5 text-secondary" />
                  <h2>Similar Anime<span className="text-secondary opacity-70">_</span></h2>
                </div>
                <div className="anime-grid">
                  {similarAnime.map((anime: any) => (
                    <AnimeCard
                      key={anime.slug}
                      id={anime.slug}
                      title={anime.title}
                      titleEnglish={anime.title_english}
                      image={anime.poster}
                      rating={String(anime.score)}
                      episode={anime.status === 'Ongoing' ? `ep ${anime.latest_episode || '??'}` : `${anime.episodes_count || '??'} eps`}
                      totalEpisodes={anime.actual_episodes_count}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

