import { AnimeAPI } from "@/lib/api";
import type { Metadata } from 'next';
import { ChevronRight, Play, Info, List, Star, Video } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ContinueWatching } from "@/components/anime/ContinueWatching";
import { EpisodeList } from "@/components/anime/EpisodeList";
import { BookmarkButton } from "@/components/anime/BookmarkButton";
import { CharacterCarousel } from "@/components/anime/CharacterCarousel";

async function getAnimeDetails(id: string) {
  // Try Otakudesu first
  const res = await AnimeAPI.otakudesu.getDetails(id);
  if (res && res.ok !== false && res.data) {
    return { source: 'otakudesu', data: res.data };
  }

  // Fallback to Samehadaku
  const fallbackRes = await AnimeAPI.samehadaku.getDetails(id);
  if (fallbackRes && fallbackRes.ok !== false && fallbackRes.data) {
    return { source: 'samehadaku', data: fallbackRes.data };
  }

  if (res && !res.data && res.title) {
    return { source: 'otakudesu', data: res };
  }

  return null;
}

export async function generateMetadata(props: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const params = await props.params;
  const { id } = params;
  
  if (!id || id === 'undefined') {
    return { title: 'Not Found' };
  }

  const result = await getAnimeDetails(id);
  
  if (!result || !result.data) {
    return { title: 'Not Found' };
  }

  return {
    title: result.data.title || 'Anime Details',
    description: `Watch ${result.data.title} on NaiveStream`,
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

  const { data, source } = result;
  
  // Fetch extra Jikan info seamlessly
  const jikanData = await AnimeAPI.jikan.searchAnime(data.title);
  
  let charactersData = null;
  if (jikanData?.mal_id) {
    charactersData = await AnimeAPI.jikan.getCharacters(jikanData.mal_id);
  }

  const poster = jikanData?.images?.webp?.large_image_url || data.poster || data.image;
  const episodes = data.episodeList || data.episode_list || [];
  const genres = data.genreList || data.genres || jikanData?.genres || [];
  const synopsis = jikanData?.synopsis || data.synopsis?.paragraphs?.join('\n\n') || 
                    (typeof data.synopsis === 'string' ? data.synopsis : "No synopsis available.");
  const rating = jikanData?.score || (typeof data.score === 'object' ? data.score.value : data.score);
  const status = jikanData?.status || data.status;
  const numEpisodes = jikanData?.episodes || data.episodes || '??';
  const studios = jikanData?.studios?.map((s: any) => s.name).join(', ') || 'Unknown';
  const aired = jikanData?.aired?.string || 'Unknown';
  const animeType = jikanData?.type || 'Unknown';
  const animeSource = jikanData?.source || 'Unknown';
  const ageRating = jikanData?.rating || 'Unknown';
  const duration = jikanData?.duration || 'Unknown';
  const season = jikanData?.season ? `${jikanData.season} ${jikanData.year}` : 'Unknown';
  let trailerUrl = jikanData?.trailer?.embed_url;
  if (trailerUrl) {
    trailerUrl = trailerUrl.replace('autoplay=1', 'autoplay=0');
  }

  return (
    <div className="pb-20 -mt-20">
      {/* Backdrop Header */}
      <div className="relative w-full h-[40vh] min-h-[300px] overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={poster}
            alt={data.title}
            className="w-full h-full object-cover blur-sm opacity-50 dark:opacity-100 brightness-110 dark:brightness-[0.3]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-32 relative z-10">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Poster & Action Sidebar */}
          <div className="w-full max-w-[280px] mx-auto md:mx-0 shrink-0 space-y-6">
            <div className="aspect-[3/4] border-4 border-background shadow-2xl relative">
              <img src={poster} alt={data.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 border-2 border-secondary/20 pointer-events-none" />
            </div>
            
            <div className="space-y-4">
              {rating && (
                <div 
                  className="flex items-center justify-between p-4 bg-card/50 border-l-4 border-secondary/50 relative overflow-hidden group hover:border-secondary transition-colors"
                  style={{ clipPath: 'polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)' }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-secondary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="flex items-center space-x-2 relative z-10">
                    <Star className="text-secondary w-5 h-5 fill-current" />
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
                <div className="flex justify-between text-xs font-bold uppercase tracking-wider">
                  <span className="text-muted-text">Provider</span>
                  <span className="text-secondary">{source}</span>
                </div>
                {jikanData && (
                  <>
                    <div className="flex justify-between text-xs font-bold uppercase tracking-wider pt-2 border-t border-white/5">
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
                  </>
                )}
              </div>

              {/* Sidebar Trailer */}
              {trailerUrl && (
                <div className="aspect-video w-full bg-black border-4 border-background shadow-2xl relative group">
                  <iframe
                    src={trailerUrl}
                    className="absolute inset-0 w-full h-full pointer-events-auto"
                    title="Anime Trailer"
                  />
                  <div className="absolute inset-0 pointer-events-none border-2 border-secondary/20 group-hover:border-secondary/50 transition-colors duration-300" />
                </div>
              )}

              {/* Continue Watching Button */}
              <ContinueWatching 
                animeId={id} 
                animeTitle={data.title} 
                animeImage={poster} 
                source={source} 
                episodes={episodes}
              />

              {/* Bookmark Button */}
              <BookmarkButton 
                animeId={id} 
                animeTitle={data.title} 
                animeImage={poster} 
                variant="full"
                className="w-full mt-3"
              />
            </div>
          </div>

          {/* Info & Content */}
          <div className="flex-grow min-w-0 space-y-8 mt-8 md:mt-0">
            <div className="space-y-4">
              <h1 className="text-3xl md:text-6xl font-serif font-black leading-none tracking-tighter">{data.title || "Unknown Title"}</h1>
              <div className="flex flex-wrap gap-2">
                {genres.map((genre: any, idx: number) => {
                  const isJikan = !!genre.mal_id;
                  const name = genre.name || genre.title;
                  const href = isJikan ? `https://myanimelist.net/anime/genre/${genre.mal_id}` : `/genre/${genre.genreId}`;
                  
                  return (
                    <Link 
                      key={genre.mal_id || genre.genreId || `genre-${idx}`} 
                      href={href}
                      target={isJikan ? "_blank" : "_self"}
                      rel={isJikan ? "noopener noreferrer" : ""}
                      className="px-3 py-1 bg-secondary text-background text-[10px] font-black uppercase tracking-widest clip-path-polygon-small hover:bg-secondary/80 transition-colors"
                    >
                      {name}
                    </Link>
                  );
                })}
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-3 text-lg font-serif font-black uppercase tracking-widest">
                <div className="w-1.5 h-6 bg-secondary" />
                <Info className="w-5 h-5 text-secondary" />
                <h2>Synopsis<span className="text-secondary opacity-70">_</span></h2>
              </div>
              <p className="text-foreground/70 leading-relaxed text-sm md:text-base whitespace-pre-line border-l-4 border-secondary/20 pl-6 pr-6 py-4 bg-secondary/[0.02]">
                {synopsis}
              </p>
            </div>

            {/* Episode List Section */}
            <div className="space-y-6 pt-4">
              <div className="flex items-center justify-between border-b-2 border-secondary/20 pb-4">
                <div className="flex items-center space-x-3 text-lg font-serif font-black uppercase tracking-widest">
                  <div className="w-1.5 h-6 bg-secondary" />
                  <List className="w-5 h-5 text-secondary" />
                  <h2>Episode List<span className="text-secondary opacity-70">_</span></h2>
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-text">{episodes.length} Total Units</span>
              </div>

              <EpisodeList 
                episodes={episodes} 
                animeId={id} 
                animeTitle={data.title} 
                poster={poster} 
                source={source} 
              />
            </div>

            {/* Characters Section */}
            <CharacterCarousel characters={charactersData} />
          </div>
        </div>
      </div>
    </div>
  );
}
