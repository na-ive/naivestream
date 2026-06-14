'use server';

import { getSession, logout } from '@/lib/auth';
import db from '@/lib/db';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';

const execPromise = promisify(exec);

async function checkAuth() {
  const session = await getSession();
  if (!session) {
    redirect('/login');
  }
  return session;
}

export async function getAnomalies() {
  await checkAuth();
  
  if (!db) throw new Error("Database connection failed");
  const stmt = db.prepare('SELECT id, slug, title, type FROM anime WHERE anilist_id IS NULL ORDER BY id DESC LIMIT 50');
  const rows = stmt.all();
  return rows;
}

export async function injectMetadata(animeId: number, anilistId: number) {
  await checkAuth();

  if (!anilistId) {
    return { success: false, error: 'Must provide AniList ID' };
  }

  try {
    const updateQuery = ['anilist_id = ?'];
    const params: any[] = [anilistId, animeId];

    if (!db) throw new Error("Database connection failed");
    const stmt = db.prepare(`UPDATE anime SET ${updateQuery.join(', ')} WHERE id = ?`);
    const info = stmt.run(...params);

    if (info.changes > 0) {
      revalidatePath('/admin');
      exec(`node dist/fill-from-anilist.js --id=${animeId}`, { cwd: path.join(process.cwd(), 'backend') });
      return { success: true };
    }
    
    return { success: false, error: 'Anime not found or no changes made' };
  } catch (error: any) {
    console.error('Error injecting metadata:', error);
    return { success: false, error: error.message || 'Database error occurred' };
  }
}

export async function getAdminStats() {
  await checkAuth();
  if (!db) throw new Error("Database connection failed");
  
  const totalAnime = (db.prepare('SELECT COUNT(*) as count FROM anime').get() as any).count;
  const totalEpisodes = (db.prepare('SELECT COUNT(*) as count FROM episodes').get() as any).count;
  const totalCharacters = (db.prepare('SELECT COUNT(*) as count FROM characters').get() as any).count;
  const totalVoiceActors = (db.prepare('SELECT COUNT(*) as count FROM voice_actors').get() as any).count;
  const noEpisodes = (db.prepare('SELECT COUNT(*) as count FROM anime WHERE id NOT IN (SELECT DISTINCT anime_id FROM episodes)').get() as any).count;
  const missingAnilistId = (db.prepare('SELECT COUNT(*) as count FROM anime WHERE anilist_id IS NULL OR anilist_id = 0').get() as any).count;

  return {
    totalAnime,
    totalEpisodes,
    totalCharacters,
    totalVoiceActors,
    noEpisodes,
    missingAnilistId
  };
}

export async function getAnimeListAdmin({ page = 1, limit = 50, search = '', sort = 'id', order = 'desc' }) {
  await checkAuth();
  if (!db) throw new Error("Database connection failed");

  const offset = (page - 1) * limit;
  let query = 'SELECT id, slug, title, source, mal_id, anilist_id, is_fully_scraped, last_updated FROM anime';
  const params: any[] = [];

  if (search) {
    query += ' WHERE title LIKE ? OR slug LIKE ?';
    params.push(`%${search}%`, `%${search}%`);
  }

  // Safe sorting
  const validSortColumns = ['id', 'title', 'source', 'mal_id', 'anilist_id', 'last_updated'];
  const validOrder = ['asc', 'desc'];
  const sortCol = validSortColumns.includes(sort) ? sort : 'id';
  const sortDir = validOrder.includes(order.toLowerCase()) ? order.toLowerCase() : 'desc';

  query += ` ORDER BY ${sortCol} ${sortDir} LIMIT ? OFFSET ?`;
  params.push(limit, offset);

  const rows = db.prepare(query).all(...params);
  
  let countQuery = 'SELECT COUNT(*) as total FROM anime';
  const countParams: any[] = [];
  if (search) {
    countQuery += ' WHERE title LIKE ? OR slug LIKE ?';
    countParams.push(`%${search}%`, `%${search}%`);
  }
  const total = (db.prepare(countQuery).get(...countParams) as any).total;

  return {
    items: rows as any[],
    total,
    totalPages: Math.ceil(total / limit)
  };
}

export async function updateAnimeMapping(id: number, malId: number | null, anilistId: number | null, triggerResync: boolean = false) {
  await checkAuth();
  if (!db) throw new Error("Database connection failed");

  try {
    const stmt = db.prepare('UPDATE anime SET mal_id = ?, anilist_id = ? WHERE id = ?');
    const info = stmt.run(malId, anilistId, id);

    if (info.changes > 0) {
      if (triggerResync) {
        exec(`node dist/fill-from-anilist.js --id=${id}`, { cwd: path.join(process.cwd(), 'backend') });
      }
      revalidatePath('/admin/database');
      return { success: true };
    }
    return { success: false, error: 'Failed to update mapping' };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}


export async function handleLogout() {
  await logout();
  redirect('/login');
}

export async function triggerScraper(scriptName: string) {
  await checkAuth();

  const allowedScripts = [
    'scrape:latest',
    'scrape:ongoing',
    'scrape:full',
    'update:metadata',
    'fill:schedule',
    'fill:trailers',
    'fill:characters',
  ];

  if (!allowedScripts.includes(scriptName)) {
    return { success: false, error: 'Unauthorized script execution' };
  }

  try {
    // Jalankan perintah di folder backend secara asynchronous (background)
    // Supaya Vercel/Next.js tidak timeout menunggu scraper selesai
    const child = exec(`npm run ${scriptName}`, { cwd: path.join(process.cwd(), 'backend') });
    
    // Kita bisa biarkan jalan di background, atau menyimpan log-nya ke file tertentu
    return { success: true, message: `Process '${scriptName}' initiated in background.` };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to spawn process' };
  }
}
