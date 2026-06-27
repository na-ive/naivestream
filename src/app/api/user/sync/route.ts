import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import Database from 'better-sqlite3';
import path from 'path';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !(session.user as any).id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const body = await req.json();
    const { history = [], watchlist = [], watched_episodes = [] } = body;

    const dbPath = path.join(process.cwd(), 'anime.db');
    const db = new Database(dbPath);

    // UPSERT History
    if (history.length > 0) {
      const stmt = db.prepare(`
        INSERT INTO user_history (user_id, anime_slug, last_episode_slug, updated_at)
        VALUES (@userId, @animeSlug, @lastEpisodeSlug, CURRENT_TIMESTAMP)
        ON CONFLICT(user_id, anime_slug) DO UPDATE SET
          last_episode_slug = @lastEpisodeSlug,
          updated_at = CURRENT_TIMESTAMP
      `);
      db.transaction(() => {
        for (const item of history) {
          if (!item.animeId) continue;
          stmt.run({
            userId,
            animeSlug: item.animeId,
            lastEpisodeSlug: item.lastEpisodeId || null,
          });
        }
      })();
    }

    // UPSERT Watchlist
    if (watchlist.length > 0) {
      const stmt = db.prepare(`
        INSERT INTO user_watchlist (user_id, anime_slug, added_at)
        VALUES (@userId, @animeSlug, CURRENT_TIMESTAMP)
        ON CONFLICT(user_id, anime_slug) DO UPDATE SET
          added_at = CURRENT_TIMESTAMP
      `);
      db.transaction(() => {
        for (const item of watchlist) {
          if (!item.animeId) continue;
          stmt.run({
            userId,
            animeSlug: item.animeId,
          });
        }
      })();
    }

    // UPSERT Watched Episodes
    if (watched_episodes.length > 0) {
      const stmt = db.prepare(`
        INSERT INTO user_watched_episodes (user_id, anime_slug, episode_slug, watched_at)
        VALUES (@userId, @animeSlug, @episodeSlug, CURRENT_TIMESTAMP)
        ON CONFLICT(user_id, episode_slug) DO UPDATE SET
          watched_at = CURRENT_TIMESTAMP
      `);
      db.transaction(() => {
        for (const item of watched_episodes) {
          if (!item.episodeSlug || !item.animeSlug) continue;
          stmt.run({
            userId,
            animeSlug: item.animeSlug,
            episodeSlug: item.episodeSlug,
          });
        }
      })();
    }

    // SELECT all data to return
    // Note: To return full metadata like title and image, we join with the anime and episodes tables
    const historyRows = db.prepare(`
      SELECT 
        uh.anime_slug as animeId, 
        a.title as animeTitle,
        a.title_english as animeTitleEnglish,
        a.poster as animeImage,
        uh.last_episode_slug as lastEpisodeId,
        e.title as lastEpisodeTitle,
        strftime('%s', uh.updated_at) * 1000 as updatedAt
      FROM user_history uh
      JOIN anime a ON uh.anime_slug = a.slug
      LEFT JOIN episodes e ON uh.last_episode_slug = e.slug
      WHERE uh.user_id = ?
      ORDER BY uh.updated_at DESC
    `).all(userId);

    const watchlistRows = db.prepare(`
      SELECT 
        uw.anime_slug as animeId, 
        a.title as animeTitle,
        a.title_english as animeTitleEnglish,
        a.poster as animeImage,
        strftime('%s', uw.added_at) * 1000 as addedAt
      FROM user_watchlist uw
      JOIN anime a ON uw.anime_slug = a.slug
      WHERE uw.user_id = ?
      ORDER BY uw.added_at DESC
    `).all(userId);

    const watchedRows = db.prepare(`
      SELECT anime_slug as animeSlug, episode_slug as episodeSlug, strftime('%s', watched_at) * 1000 as watchedAt
      FROM user_watched_episodes
      WHERE user_id = ?
    `).all(userId);

    db.close();

    return NextResponse.json({
      success: true,
      userId,
      serverTime: new Date().toISOString(),
      data: {
        history: historyRows,
        watchlist: watchlistRows,
        watched_episodes: watchedRows,
      }
    });

  } catch (error) {
    console.error('Error in sync API:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
