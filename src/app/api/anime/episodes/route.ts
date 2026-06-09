import { NextRequest, NextResponse } from 'next/server';
import { AnimeService } from '@/lib/services/anime';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get('slug') || '';
  
  if (!slug) {
    return NextResponse.json({ error: 'Missing slug' }, { status: 400 });
  }
  
  try {
    const anime = await AnimeService.getAnimeBySlug(slug);
    if (!anime) {
      return NextResponse.json({ error: 'Anime not found' }, { status: 404 });
    }
    
    const episodes = await AnimeService.getEpisodes(anime.id);
    return NextResponse.json({ animeId: slug, episodes });
  } catch (error) {
    console.error('Episodes API Error:', error);
    return NextResponse.json({ error: 'Failed to fetch episodes' }, { status: 500 });
  }
}
