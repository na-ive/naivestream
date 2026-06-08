import { NextRequest, NextResponse } from 'next/server';
import { AnimeService } from '@/lib/services/anime';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get('q');
  const limit = parseInt(searchParams.get('limit') || '5');

  if (!query || query.length < 2) {
    return NextResponse.json({ data: [] });
  }

  try {
    const results = await AnimeService.searchAnime(query, limit);
    return NextResponse.json({ data: results });
  } catch (error) {
    console.error('Search API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
