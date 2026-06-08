import Database from 'better-sqlite3';
import path from 'path';

// Singleton instance to prevent multiple connections in dev (HMR)
declare global {
  var db: Database.Database | undefined;
}

const dbPath = path.join(process.cwd(), 'anime.db');

if (!global.db) {
  global.db = new Database(dbPath, { 
    readonly: false, // Set to false so we can update stream_cache if needed
    fileMustExist: true 
  });
  
  // Performance optimization for SQLite
  global.db.pragma('journal_mode = WAL');
  global.db.pragma('synchronous = NORMAL');
}

export default global.db;
