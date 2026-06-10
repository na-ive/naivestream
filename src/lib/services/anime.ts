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
  latest_episode?: number;
  actual_episodes_count?: number;
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
 * Smart status logic: if episodes reach the total count, it's Completed.
 */
function getSmartStatus(item: any): string {
  const normalized = normalizeStatusValue(item.status);
  const latest = item.latest_episode || 0;
  const total = item.episodes_count || 0;
  
  if (normalized === 'Ongoing' && total > 0 && latest >= total) {
    return 'Completed';
  }
  return normalized;
}

/**
 * SQL snippet for smart status filtering.
 */
const SMART_STATUS_CLAUSES = {
  Ongoing: `(status IN ('Ongoing', 'Currently Airing')) AND (episodes_count <= 0 OR (SELECT MAX(eps_number) FROM episodes WHERE anime_id = a.id) < episodes_count)`,
  Completed: `(status IN ('Completed', 'Finished Airing')) OR (episodes_count > 0 AND (SELECT MAX(eps_number) FROM episodes WHERE anime_id = a.id) >= episodes_count)`
};

// SQL subqueries for reuse
const SQL_LATEST_EP = `(SELECT MAX(eps_number) FROM episodes WHERE anime_id = a.id)`;
const SQL_ACTUAL_COUNT = `(SELECT COUNT(*) FROM episodes WHERE anime_id = a.id)`;
const SQL_GENRES = `(SELECT GROUP_CONCAT(g.name) FROM genres g JOIN anime_genres ag ON g.id = ag.genre_id WHERE ag.anime_id = a.id)`;
const SQL_BASE_SELECT = `a.*, ${SQL_LATEST_EP} as latest_episode, ${SQL_ACTUAL_COUNT} as actual_episodes_count, ${SQL_GENRES} as genres`;

export const AnimeService = {
  /**
   * Get a list of anime with pagination and optional filters
   */
  async getAnimeList({ 
    page = 1, 
    limit = 24, 
    status = null as string | null,
    orderBy = 'last_updated' as string
  }) {
    const offset = (page - 1) * limit;
    let query = `SELECT ${SQL_BASE_SELECT} FROM anime a`;
    
    if (status === 'Ongoing') {
      query += ` WHERE ${SMART_STATUS_CLAUSES.Ongoing}`;
    } else if (status === 'Completed') {
      query += ` WHERE ${SMART_STATUS_CLAUSES.Completed}`;
    } else if (status) {
      query += ` WHERE a.status = ?`;
    }

    const allowedOrderBy = ['last_updated', 'popularity', 'score', 'year', 'title'];
    const safeOrderBy = allowedOrderBy.includes(orderBy) ? `a.${orderBy}` : 'a.last_updated';
    const direction = (safeOrderBy === 'a.popularity' || safeOrderBy === 'a.title') ? 'ASC' : 'DESC';

    // De-prioritize anime with zero actual episodes
    query += ` ORDER BY CASE WHEN ${SQL_ACTUAL_COUNT} > 0 THEN 0 ELSE 1 END ASC, ${safeOrderBy} ${direction} LIMIT ? OFFSET ?`;
    
    const params: any[] = [];
    if (status && status !== 'Ongoing' && status !== 'Completed') params.push(status);
    params.push(limit, offset);

    const items = db.prepare(query).all(...params) as any[];
    
    // Count total
    let countQuery = 'SELECT COUNT(*) as total FROM anime a';
    const countParams: any[] = [];
    if (status === 'Ongoing') {
      countQuery += ` WHERE ${SMART_STATUS_CLAUSES.Ongoing}`;
    } else if (status === 'Completed') {
      countQuery += ` WHERE ${SMART_STATUS_CLAUSES.Completed}`;
    } else if (status) {
      countQuery += ` WHERE status = ?`;
      countParams.push(status);
    }
    const total = (db.prepare(countQuery).get(...countParams) as any).total;

    return {
      items: items.map(item => ({
        ...item,
        status: getSmartStatus(item),
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
   * Get full details of an anime by its slug
   */
  async getAnimeBySlug(slug: string) {
    const anime = db.prepare(`SELECT ${SQL_BASE_SELECT} FROM anime a WHERE a.slug = ?`).get(slug) as any | undefined;
    if (!anime) return null;

    const genres = db.prepare(`
      SELECT g.name, g.slug 
      FROM genres g 
      JOIN anime_genres ag ON g.id = ag.genre_id 
      WHERE ag.anime_id = ?
    `).all(anime.id) as { name: string; slug: string }[];

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
      status: getSmartStatus(anime),
      synopsis: cleanSynopsis(anime.synopsis),
      genres,
      characters
    };
  },

  /**
   * Live Search dropdown
   */
  async searchAnime(query: string, limit = 5) {
    const sql = `
      SELECT id, slug, title, title_english, poster, status, type, year, score, episodes_count,
      ${SQL_LATEST_EP} as latest_episode,
      ${SQL_ACTUAL_COUNT} as actual_episodes_count
      FROM anime a
      WHERE title LIKE ? OR title_english LIKE ? OR title_japanese LIKE ?
      ORDER BY CASE WHEN ${SQL_ACTUAL_COUNT} > 0 THEN 0 ELSE 1 END ASC, popularity ASC
      LIMIT ?
    `;
    const searchPattern = `%${query}%`;
    const items = db.prepare(sql).all(searchPattern, searchPattern, searchPattern, limit) as any[];
    return items.map(item => ({
      ...item,
      status: getSmartStatus(item),
      synopsis: cleanSynopsis(item.synopsis)
    }));
  },

  /**
   * Home page data
   */
  async getHomeData() {
    const popularSql = `SELECT ${SQL_BASE_SELECT} FROM anime a WHERE ${SMART_STATUS_CLAUSES.Ongoing} ORDER BY CASE WHEN ${SQL_ACTUAL_COUNT} > 0 THEN 0 ELSE 1 END ASC, a.popularity ASC LIMIT 12`;
    const popular = db.prepare(popularSql).all() as any[];

    const ongoingSql = `SELECT ${SQL_BASE_SELECT} FROM anime a WHERE ${SMART_STATUS_CLAUSES.Ongoing} ORDER BY CASE WHEN ${SQL_ACTUAL_COUNT} > 0 THEN 0 ELSE 1 END ASC, a.last_updated DESC LIMIT 12`;
    const ongoing = db.prepare(ongoingSql).all() as any[];

    const completedSql = `SELECT ${SQL_BASE_SELECT} FROM anime a WHERE ${SMART_STATUS_CLAUSES.Completed} ORDER BY CASE WHEN ${SQL_ACTUAL_COUNT} > 0 THEN 0 ELSE 1 END ASC, a.last_updated DESC LIMIT 12`;
    const completed = db.prepare(completedSql).all() as any[];
    
    const normalizeItems = (list: any[]) => list.map(item => ({
      ...item,
      status: getSmartStatus(item),
      synopsis: cleanSynopsis(item.synopsis)
    }));

    return { 
      popular: normalizeItems(popular), 
      ongoing: normalizeItems(ongoing), 
      completed: normalizeItems(completed) 
    };
  },

  async getAllGenres() {
    return db.prepare('SELECT * FROM genres ORDER BY name ASC').all() as { id: number; name: string; slug: string }[];
  },

  async getAnimeByGenre(genreSlug: string, page = 1, limit = 24) {
    const offset = (page - 1) * limit;
    const genre = db.prepare('SELECT id, name FROM genres WHERE slug = ?').get(genreSlug) as { id: number, name: string } | undefined;
    if (!genre) return { items: [], pagination: { current_page: page, last_page: 0, total: 0 }, genreName: '' };

    const items = db.prepare(`
      SELECT ${SQL_BASE_SELECT} 
      FROM anime a
      JOIN anime_genres ag ON a.id = ag.anime_id
      WHERE ag.genre_id = ?
      ORDER BY CASE WHEN ${SQL_ACTUAL_COUNT} > 0 THEN 0 ELSE 1 END ASC, a.last_updated DESC
      LIMIT ? OFFSET ?
    `).all(genre.id, limit, offset) as any[];

    const total = (db.prepare(`SELECT COUNT(*) as total FROM anime_genres WHERE genre_id = ?`).get(genre.id) as any).total;

    return {
      items: items.map(item => ({ 
        ...item, 
        status: getSmartStatus(item),
        synopsis: cleanSynopsis(item.synopsis) 
      })),
      pagination: { current_page: page, last_page: Math.ceil(total / limit), total },
      genreName: genre.name
    };
  },

  async getSchedule() {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const schedule: Record<string, AnimeMetadata[]> = {};
    for (const day of days) {
      const items = db.prepare(`SELECT ${SQL_BASE_SELECT} FROM anime a WHERE ${SMART_STATUS_CLAUSES.Ongoing} AND release_day = ? ORDER BY score DESC`).all(day) as any[];
      schedule[day] = items.map(item => ({ ...item, status: getSmartStatus(item), synopsis: cleanSynopsis(item.synopsis) }));
    }
    return schedule;
  },

  async advancedSearch({ 
    query = '', genre = '', status = '', type = '', letter = '', year = '', season = '', rating = '', order = 'popularity', page = 1, limit = 24 
  }) {
    const offset = (page - 1) * limit;
    let sql = `SELECT DISTINCT ${SQL_BASE_SELECT} FROM anime a`;
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
    if (status === 'Ongoing') {
      whereClauses.push(SMART_STATUS_CLAUSES.Ongoing);
    } else if (status === 'Completed') {
      whereClauses.push(SMART_STATUS_CLAUSES.Completed);
    } else if (status) {
      whereClauses.push(`a.status = ?`);
      params.push(status);
    }
    if (type) { whereClauses.push('a.type = ?'); params.push(type); }
    if (year) { whereClauses.push('a.year = ?'); params.push(parseInt(year)); }
    if (season) { whereClauses.push('a.season = ?'); params.push(season); }
    if (rating) { whereClauses.push('a.rating = ?'); params.push(rating); }
    if (letter) {
      if (letter === '0-9') whereClauses.push("a.title GLOB '[0-9]*'");
      else if (letter === '#') whereClauses.push("a.title NOT GLOB '[a-zA-Z0-9]*'");
      else if (letter !== 'ALL') { whereClauses.push('a.title LIKE ?'); params.push(`${letter}%`); }
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

    const primaryOrder = orderByMap[order] || 'a.popularity ASC';
    sql += ` ORDER BY CASE WHEN ${SQL_ACTUAL_COUNT} > 0 THEN 0 ELSE 1 END ASC, ${primaryOrder} LIMIT ? OFFSET ?`;
    const countParams = [...params];
    params.push(limit, offset);

    const items = db.prepare(sql).all(...params) as any[];
    const totalResult = db.prepare(countSql).get(...countParams) as { total: number };
    const total = totalResult ? totalResult.total : 0;

    return {
      items: items.map(item => ({ ...item, status: getSmartStatus(item), synopsis: cleanSynopsis(item.synopsis) })),
      pagination: { current_page: page, last_page: Math.ceil(total / limit), total }
    };
  },

  async getEpisodes(animeId: number) {
    return db.prepare('SELECT * FROM episodes WHERE anime_id = ? ORDER BY eps_number DESC').all(animeId) as Episode[];
  },

  async getEpisodeBySlug(slug: string) {
    return db.prepare('SELECT * FROM episodes WHERE slug = ?').get(slug) as Episode | undefined;
  },

  async getAnimeById(id: number) {
    const item = db.prepare(`SELECT ${SQL_BASE_SELECT} FROM anime a WHERE id = ?`).get(id) as any | undefined;
    if (!item) return undefined;
    return { ...item, status: getSmartStatus(item), synopsis: cleanSynopsis(item.synopsis) };
  }
};
