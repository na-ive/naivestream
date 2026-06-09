import globalDb from '../db';

if (!globalDb) {
  throw new Error('Database connection not initialized');
}

const db = globalDb;

export interface AnimeMetadata {
  id: number;
  slug: string;
  mal_id: number;
  title: string;
  title_english: string;
  title_japanese: string;
  title_synonyms?: string;
  type: string;
  status: string;
  season: string;
  year: number;
  score: number;
  scored_by: number;
  members: number;
  popularity: number;
  rank: number;
  synopsis: string;
  poster: string;
  duration_minutes: number;
  episodes_count: number;
  aired: string;
  producers: string;
  studios: string;
  rating: string;
  source: string;
  release_day: string;
  youtube_trailer_id: string;
  is_fully_scraped: number;
  last_updated: string;
}

export interface Episode {
  id: number;
  anime_id: number;
  slug: string;
  title: string;
  eps_number: number;
  uploaded_at: string;
}

/**
 * Cleans synopsis text by removing source credits and extra whitespace
 */
function cleanSynopsis(synopsis: string): string {
  if (!synopsis) return '';
  return synopsis
    .replace(/\(Source:.*?\)/gi, '')
    .replace(/\[Written by.*?\]/gi, '')
    .replace(/Written by.*?$/gi, '')
    .replace(/Source:.*?$/gi, '')
    .trim();
}

/**
 * Normalizes raw status from DB to standard 'Ongoing' or 'Completed'
 */
function normalizeStatusValue(status: string): string {
  if (!status) return 'Unknown';
  const s = status.toLowerCase();
  if (s.includes('ongoing') || s.includes('currently airing')) return 'Ongoing';
  if (s.includes('completed') || s.includes('finished airing')) return 'Completed';
  return status;
}

/**
 * Returns the DB status variants for a given normalized status
 */
function getStatusVariants(status: string): string[] {
  if (status === 'Ongoing') return ['Ongoing', 'Currently Airing'];
  if (status === 'Completed') return ['Completed', 'Finished Airing'];
  return [status];
}

export const AnimeService = {
  /**
   * Get a list of anime with pagination and optional filters
   */
  async getAnimeList({ 
    page = 1, 
    limit = 20, 
    status = null as string | null,
    orderBy = 'last_updated' as string
  }) {
    const offset = (page - 1) * limit;
    let query = `
      SELECT a.*, 
      (SELECT MAX(eps_number) FROM episodes WHERE anime_id = a.id) as latest_episode 
      FROM anime a`;
    const params: any[] = [];

    if (status) {
      const variants = getStatusVariants(status);
      query += ` WHERE a.status IN (${variants.map(() => '?').join(',')})`;
      params.push(...variants);
    }

    // Safety: only allow certain order by columns
    const allowedOrderBy = ['last_updated', 'popularity', 'score', 'year', 'title'];
    const safeOrderBy = allowedOrderBy.includes(orderBy) ? `a.${orderBy}` : 'a.last_updated';

    query += ` ORDER BY ${safeOrderBy} ${safeOrderBy === 'a.popularity' || safeOrderBy === 'a.title' ? 'ASC' : 'DESC'} LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    const items = db.prepare(query).all(...params) as any[];
    
    // Normalize items
    const normalizedItems = items.map(item => ({
      ...item,
      status: normalizeStatusValue(item.status),
      synopsis: cleanSynopsis(item.synopsis)
    }));

    // Count total for pagination
    let countQuery = 'SELECT COUNT(*) as total FROM anime';
    const countParams: any[] = [];
    if (status) {
      const variants = getStatusVariants(status);
      countQuery += ` WHERE status IN (${variants.map(() => '?').join(',')})`;
      countParams.push(...variants);
    }
    const total = (db.prepare(countQuery).get(...countParams) as any).total;

    return {
      items: normalizedItems,
      pagination: {
        current_page: page,
        last_page: Math.ceil(total / limit),
        total
      }
    };
  },

  /**
   * Get full details of an anime by its slug, including genres and characters
   */
  async getAnimeBySlug(slug: string) {
    const anime = db.prepare(`
      SELECT a.*, 
      (SELECT MAX(eps_number) FROM episodes WHERE anime_id = a.id) as latest_episode 
      FROM anime a 
      WHERE a.slug = ?
    `).get(slug) as any | undefined;
    
    if (!anime) return null;

    // Get Genres
    const genres = db.prepare(`
      SELECT g.name, g.slug 
      FROM genres g 
      JOIN anime_genres ag ON g.id = ag.genre_id 
      WHERE ag.anime_id = ?
    `).all(anime.id) as { name: string; slug: string }[];

    // Get Characters (Top 10)
    const characters = db.prepare(`
      SELECT c.name, c.image, ac.role, va.name as va_name, va.image as va_image
      FROM characters c
      JOIN anime_characters ac ON c.id = ac.character_id
      LEFT JOIN character_voice_actors cva ON (c.id = cva.character_id AND ac.anime_id = cva.anime_id)
      LEFT JOIN voice_actors va ON cva.voice_actor_id = va.id
      WHERE ac.anime_id = ?
      LIMIT 10
    `).all(anime.id);

    return {
      ...anime,
      status: normalizeStatusValue(anime.status),
      synopsis: cleanSynopsis(anime.synopsis),
      genres,
      characters
    };
  },

  /**
   * Simple search for Live Search dropdown
   */
  async searchAnime(query: string, limit = 5) {
    const sql = `
      SELECT id, slug, title, title_english, poster, status, type, year, score,
      (SELECT MAX(eps_number) FROM episodes WHERE anime_id = id) as latest_episode
      FROM anime 
      WHERE title LIKE ? OR title_english LIKE ? OR title_japanese LIKE ?
      ORDER BY popularity ASC
      LIMIT ?
    `;
    const searchPattern = `%${query}%`;
    const items = db.prepare(sql).all(searchPattern, searchPattern, searchPattern, limit) as any[];
    return items.map(item => ({
      ...item,
      status: normalizeStatusValue(item.status),
      synopsis: cleanSynopsis(item.synopsis)
    }));
  },

  /**
   * Get home page data: Popular, Ongoing, and Completed
   */
  async getHomeData() {
    const ongoingVariants = getStatusVariants('Ongoing');
    const completedVariants = getStatusVariants('Completed');
    const variantPlaceholder = (v: string[]) => v.map(() => '?').join(',');

    const popularSql = `
      SELECT a.*, (SELECT MAX(eps_number) FROM episodes WHERE anime_id = a.id) as latest_episode 
      FROM anime a 
      WHERE a.status IN (${variantPlaceholder(ongoingVariants)})
      ORDER BY a.popularity ASC, a.last_updated DESC 
      LIMIT 10
    `;
    const popular = db.prepare(popularSql).all(...ongoingVariants) as any[];

    const ongoingSql = `
      SELECT a.*, (SELECT MAX(eps_number) FROM episodes WHERE anime_id = a.id) as latest_episode 
      FROM anime a 
      WHERE a.status IN (${variantPlaceholder(ongoingVariants)}) 
      ORDER BY a.last_updated DESC 
      LIMIT 15
    `;
    const ongoing = db.prepare(ongoingSql).all(...ongoingVariants) as any[];

    const completedSql = `
      SELECT a.*, (SELECT MAX(eps_number) FROM episodes WHERE anime_id = a.id) as latest_episode 
      FROM anime a 
      WHERE a.status IN (${variantPlaceholder(completedVariants)}) 
      ORDER BY a.last_updated DESC 
      LIMIT 15
    `;
    const completed = db.prepare(completedSql).all(...completedVariants) as any[];
    
    const normalizeItems = (list: any[]) => list.map(item => ({
      ...item,
      status: normalizeStatusValue(item.status),
      synopsis: cleanSynopsis(item.synopsis)
    }));

    return { 
      popular: normalizeItems(popular), 
      ongoing: normalizeItems(ongoing), 
      completed: normalizeItems(completed) 
    };
  },

  /**
   * Get all available genres
   */
  async getAllGenres() {
    return db.prepare('SELECT * FROM genres ORDER BY name ASC').all() as { id: number; name: string; slug: string }[];
  },

  /**
   * Get anime list by genre slug with pagination
   */
  async getAnimeByGenre(genreSlug: string, page = 1, limit = 20) {
    const offset = (page - 1) * limit;
    const genre = db.prepare('SELECT id, name FROM genres WHERE slug = ?').get(genreSlug) as { id: number, name: string } | undefined;
    
    if (!genre) return { items: [], pagination: { current_page: page, last_page: 0, total: 0 }, genreName: '' };

    const items = db.prepare(`
      SELECT a.* FROM anime a
      JOIN anime_genres ag ON a.id = ag.anime_id
      WHERE ag.genre_id = ?
      ORDER BY a.last_updated DESC
      LIMIT ? OFFSET ?
    `).all(genre.id, limit, offset) as AnimeMetadata[];

    const total = (db.prepare(`
      SELECT COUNT(*) as total FROM anime_genres WHERE genre_id = ?
    `).get(genre.id) as any).total;

    return {
      items: items.map(item => ({ 
        ...item, 
        status: normalizeStatusValue(item.status),
        synopsis: cleanSynopsis(item.synopsis) 
      })),
      pagination: {
        current_page: page,
        last_page: Math.ceil(total / limit),
        total
      },
      genreName: genre.name
    };
  },

  /**
   * Get weekly schedule of ongoing anime
   */
  async getSchedule() {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const schedule: Record<string, AnimeMetadata[]> = {};
    const ongoingVariants = getStatusVariants('Ongoing');
    const variantPlaceholder = ongoingVariants.map(() => '?').join(',');
    
    for (const day of days) {
      const items = db.prepare(`SELECT * FROM anime WHERE status IN (${variantPlaceholder}) AND release_day = ? ORDER BY score DESC`).all(...ongoingVariants, day) as AnimeMetadata[];
      schedule[day] = items.map(item => ({ 
        ...item, 
        status: normalizeStatusValue(item.status),
        synopsis: cleanSynopsis(item.synopsis) 
      }));
    }
    
    return schedule;
  },

  /**
   * Advanced search with multiple filters
   */
  async advancedSearch({ 
    query = '', 
    genre = '', 
    status = '', 
    type = '',
    letter = '',
    order = 'popularity',
    page = 1, 
    limit = 20 
  }) {
    const offset = (page - 1) * limit;
    let sql = 'SELECT DISTINCT a.* FROM anime a';
    let countSql = 'SELECT COUNT(DISTINCT a.id) as total FROM anime a';
    const params: any[] = [];
    const whereClauses: string[] = [];

    if (genre) {
      sql += ' JOIN anime_genres ag ON a.id = ag.anime_id JOIN genres g ON ag.genre_id = g.id';
      countSql += ' JOIN anime_genres ag ON a.id = ag.anime_id JOIN genres g ON ag.genre_id = g.id';
      whereClauses.push('g.slug = ?');
      params.push(genre);
    }

    if (query) {
      whereClauses.push('(a.title LIKE ? OR a.title_english LIKE ? OR a.title_japanese LIKE ?)');
      const p = `%${query}%`;
      params.push(p, p, p);
    }

    if (status) {
      const variants = getStatusVariants(status);
      whereClauses.push(`a.status IN (${variants.map(() => '?').join(',')})`);
      params.push(...variants);
    }

    if (type) {
      whereClauses.push('a.type = ?');
      params.push(type);
    }

    if (letter) {
      if (letter === '0-9') {
        whereClauses.push("a.title GLOB '[0-9]*'");
      } else if (letter === '#') {
        whereClauses.push("a.title NOT GLOB '[a-zA-Z0-9]*'");
      } else if (letter !== 'ALL') {
        whereClauses.push('a.title LIKE ?');
        params.push(`${letter}%`);
      }
    }

    if (whereClauses.length > 0) {
      const whereStr = ' WHERE ' + whereClauses.join(' AND ');
      sql += whereStr;
      countSql += whereStr;
    }

    const orderByMap: Record<string, string> = {
      'popularity': 'a.popularity ASC',
      'latest': 'a.last_updated DESC',
      'score': 'a.score DESC',
      'title': 'a.title ASC'
    };

    sql += ` ORDER BY ${orderByMap[order] || 'a.popularity ASC'} LIMIT ? OFFSET ?`;
    const countParams = [...params];
    params.push(limit, offset);

    const items = db.prepare(sql).all(...params) as AnimeMetadata[];
    const totalResult = db.prepare(countSql).get(...countParams) as { total: number };
    const total = totalResult ? totalResult.total : 0;

    return {
      items: items.map(item => ({ 
        ...item, 
        status: normalizeStatusValue(item.status),
        synopsis: cleanSynopsis(item.synopsis) 
      })),
      pagination: {
        current_page: page,
        last_page: Math.ceil(total / limit),
        total
      }
    };
  },

  /**
   * Get all episodes for a specific anime
   */
  async getEpisodes(animeId: number) {
    return db.prepare('SELECT * FROM episodes WHERE anime_id = ? ORDER BY eps_number DESC').all(animeId) as Episode[];
  },

  /**
   * Get a single episode by its slug
   */
  async getEpisodeBySlug(slug: string) {
    return db.prepare('SELECT * FROM episodes WHERE slug = ?').get(slug) as Episode | undefined;
  },

  /**
   * Get basic anime info by ID
   */
  async getAnimeById(id: number) {
    const item = db.prepare('SELECT * FROM anime WHERE id = ?').get(id) as any | undefined;
    if (!item) return undefined;
    return { 
      ...item, 
      status: normalizeStatusValue(item.status),
      synopsis: cleanSynopsis(item.synopsis) 
    };
  }
};
