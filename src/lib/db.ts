import Database from 'better-sqlite3';
import path from 'path';

// Singleton instance to prevent multiple connections in dev (HMR)
declare global {
  var db: Database.Database | undefined;
}

const dbPath = process.env.DATABASE_PATH || path.join(process.cwd(), 'anime.db');

if (!global.db) {
  global.db = new Database(dbPath, { 
    readonly: false, // Set to false so we can update stream_cache if needed
    fileMustExist: true 
  });
  
  // Performance optimization for SQLite
  global.db.pragma('journal_mode = WAL');
  global.db.pragma('synchronous = NORMAL');

  // Ensure indexes exist
  const indexStmts = [
    `CREATE INDEX IF NOT EXISTS idx_anime_status_last_updated ON anime(status, last_updated DESC)`,
    `CREATE INDEX IF NOT EXISTS idx_anime_status_popularity ON anime(status, popularity ASC)`,
    `CREATE INDEX IF NOT EXISTS idx_anime_status_score ON anime(status, score DESC)`,
    `CREATE INDEX IF NOT EXISTS idx_anime_popularity ON anime(popularity ASC)`,
    `CREATE INDEX IF NOT EXISTS idx_anime_score ON anime(score DESC)`,
    `CREATE INDEX IF NOT EXISTS idx_anime_slug ON anime(slug)`,
    `CREATE INDEX IF NOT EXISTS idx_anime_title ON anime(title COLLATE NOCASE)`,
    `CREATE INDEX IF NOT EXISTS idx_anime_status_title ON anime(status, title COLLATE NOCASE)`,
    `CREATE INDEX IF NOT EXISTS idx_anime_status_release_day ON anime(status, release_day)`,
    `CREATE INDEX IF NOT EXISTS idx_episodes_anime_eps ON episodes(anime_id, eps_number DESC)`,
    `CREATE INDEX IF NOT EXISTS idx_episodes_slug ON episodes(slug)`,
    `CREATE INDEX IF NOT EXISTS idx_anime_genres_anime ON anime_genres(anime_id)`,
    `CREATE INDEX IF NOT EXISTS idx_anime_genres_genre ON anime_genres(genre_id)`,
    `CREATE INDEX IF NOT EXISTS idx_anime_characters_anime ON anime_characters(anime_id)`,
    `CREATE INDEX IF NOT EXISTS idx_character_voice_actors_anime ON character_voice_actors(anime_id)`
  ];
  
  for (const stmt of indexStmts) {
    global.db.exec(stmt);
  }
}

export default global.db;
