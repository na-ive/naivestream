import { NextRequest, NextResponse } from 'next/server';
import { AnimeService } from '@/lib/services/anime';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { slugs } = body;

    if (!Array.isArray(slugs) || slugs.length === 0) {
      return NextResponse.json({ data: [] });
    }

    const recommendations = await AnimeService.getForYouRecommendations(slugs, 6);
    return NextResponse.json({ data: recommendations });
  } catch (error) {
    console.error('For You API Error:', error);
    return NextResponse.json({ error: 'Failed to fetch recommendations' }, { status: 500 });
  }
}
