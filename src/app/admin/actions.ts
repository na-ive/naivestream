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
      // Revalidate admin page so the list refreshes
      revalidatePath('/admin');
      
      // Langsung trigger background scraper HANYA UNTUK ANIME INI
      exec(`node dist/fill-from-anilist.js --id=${animeId}`, { cwd: path.join(process.cwd(), 'backend') });
      
      return { success: true };
    }
    
    return { success: false, error: 'Anime not found or no changes made' };
  } catch (error: any) {
    console.error('Error injecting metadata:', error);
    return { success: false, error: error.message || 'Database error occurred' };
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
