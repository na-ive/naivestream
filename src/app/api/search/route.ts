import { NextRequest, NextResponse } from 'next/server';
import { AnimeService } from '@/lib/services/anime';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get('q') || '';
  const genre = searchParams.get('genre') || '';
  const status = searchParams.get('status') || '';
  const type = searchParams.get('type') || '';
  const letter = searchParams.get('letter') || '';
  const order = searchParams.get('order') || 'popularity';
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');

  try {
    const results = await AnimeService.advancedSearch({
      query, genre, status, type, letter, order, page, limit
    });
    return NextResponse.json(results);
  } catch (error) {
    console.error('Search API Error:', error);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}
