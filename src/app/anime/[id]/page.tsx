import { AnimeService } from "@/lib/services/anime";
import type { Metadata } from 'next';
import { Information, StarFilled, Grid } from "@carbon/icons-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DesktopAnimeDetail } from "@/components/anime/DesktopAnimeDetail";
import { MobileAnimeDetail } from "@/components/anime/MobileAnimeDetail";
import { parseIndonesianDate, formatDate } from "@/lib/utils";

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
          date: formatDate(parseIndonesianDate(ep.uploaded_at))
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
    <>
      <div className="lg:hidden">
        <MobileAnimeDetail 
          id={id} 
          data={data} 
          source={source} 
          similarAnime={similarAnime} 
          charactersData={charactersData} 
        />
      </div>
      <div className="hidden lg:block">
        <DesktopAnimeDetail 
          id={id} 
          data={data} 
          source={source} 
          similarAnime={similarAnime} 
          charactersData={charactersData} 
        />
      </div>
    </>
  );
}

