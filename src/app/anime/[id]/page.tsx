import { AnimeAPI } from "@/lib/api";
import { ChevronRight, Play, Info, List, Star } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

async function getAnimeDetails(id: string) {
  console.log(`[Detail Debug] Fetching details for ID: ${id}`);
  
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
  const poster = data.poster || data.image;
  const episodes = data.episodeList || data.episode_list || [];
  const genres = data.genreList || data.genres || [];
  const synopsis = data.synopsis?.paragraphs?.join('\n\n') || 
                    (typeof data.synopsis === 'string' ? data.synopsis : "No synopsis available.");
  const rating = typeof data.score === 'object' ? data.score.value : data.score;

  return (
    <div className="pb-20">
      {/* Backdrop Header */}
      <div className="relative w-full h-[40vh] min-h-[300px] overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={poster}
            alt={data.title}
            className="w-full h-full object-cover blur-sm brightness-[0.3]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-32 relative z-10">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Poster */}
          <div className="w-full max-w-[280px] mx-auto md:mx-0 shrink-0">
            <div className="aspect-[3/4] rounded-2xl overflow-hidden border-4 border-background shadow-2xl">
              <img src={poster} alt={data.title} className="w-full h-full object-cover" />
            </div>
            
            <div className="mt-6 space-y-4">
              {rating && (
                <div className="flex items-center justify-between p-4 bg-card rounded-xl border border-border">
                  <div className="flex items-center space-x-2">
                    <Star className="text-yellow-400 w-5 h-5 fill-current" />
                    <span className="font-bold">{rating}</span>
                  </div>
                  <span className="text-xs text-gray-500 uppercase font-bold">Score</span>
                </div>
              )}
              
              <div className="p-4 bg-card rounded-xl border border-border space-y-3">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500 uppercase font-bold tracking-wider">Status</span>
                  <span className="text-secondary font-bold">{data.status}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500 uppercase font-bold tracking-wider">Episodes</span>
                  <span className="font-bold">{data.episodes || '??'}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500 uppercase font-bold tracking-wider">Source</span>
                  <span className="font-bold uppercase text-xs">{source}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Info */}
          <div className="flex-grow space-y-8">
            <div className="space-y-4">
              <h1 className="text-3xl md:text-5xl font-bold leading-tight">{data.title || "Unknown Title"}</h1>
              <div className="flex flex-wrap gap-2">
                {genres.map((genre: any, idx: number) => (
                  <span key={genre.genreId || `genre-${idx}`} className="px-3 py-1 bg-secondary/10 text-secondary text-xs font-bold rounded-full border border-secondary/20">
                    {genre.title || genre.name}
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-2 text-lg font-bold">
                <Info className="w-5 h-5 text-secondary" />
                <h2>Synopsis</h2>
              </div>
              <p className="text-gray-400 leading-relaxed text-sm md:text-base whitespace-pre-line">
                {synopsis}
              </p>
            </div>

            {/* Episode List */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-lg font-bold">
                  <List className="w-5 h-5 text-secondary" />
                  <h2>Episode List</h2>
                </div>
                <span className="text-sm text-gray-500">{episodes.length} Episodes</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {episodes.map((ep: any, index: number) => {
                  const epNum = ep.eps || episodes.length - index;
                  return (
                    <Link
                      key={ep.episodeId || ep.id || `ep-${index}`}
                      href={`/watch/${ep.episodeId || ep.id}?anime=${id}&title=${encodeURIComponent(data.title || '')}&img=${encodeURIComponent(poster || '')}&source=${source}`}
                      className="flex items-center p-4 bg-card rounded-xl border border-border hover:border-secondary hover:bg-secondary/5 transition-all group"
                    >
                      <div className="w-12 h-12 bg-background rounded-lg flex items-center justify-center font-bold text-sm group-hover:bg-secondary group-hover:text-white transition-colors shrink-0">
                        {epNum}
                      </div>
                      <div className="ml-4 flex-grow min-w-0">
                        <p className="text-sm font-bold truncate">Episode {epNum}</p>
                        <p className="text-[11px] text-gray-500 mt-0.5">{ep.date || ep.uploaded_on || 'Released'}</p>
                      </div>
                      <Play className="w-4 h-4 text-gray-400 group-hover:text-secondary transition-colors shrink-0" />
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
