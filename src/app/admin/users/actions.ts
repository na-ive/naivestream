'use server';

import db from '@/lib/db';
import { checkAuth } from '../actions';
import { revalidatePath } from 'next/cache';

export async function getUsers() {
  await checkAuth();
  if (!db) throw new Error("Database connection failed");

  const query = `
    SELECT 
      id, 
      discord_id, 
      username, 
      display_name,
      email,
      created_at,
      last_login
    FROM users
    ORDER BY id DESC
  `;

  const users = db.prepare(query).all() as {
    id: number;
    discord_id: string;
    username: string;
    display_name: string;
    email: string;
    created_at: string;
    last_login: string;
  }[];

  return users;
}

export async function deleteUser(id: number) {
  await checkAuth();
  if (!db) throw new Error("Database connection failed");

  try {
    const stmt = db.prepare('DELETE FROM users WHERE id = ?');
    const info = stmt.run(id);

    if (info.changes > 0) {
      revalidatePath('/admin/users');
      revalidatePath('/admin');
      return { success: true };
    } else {
      return { success: false, error: 'User not found' };
    }
  } catch (error: any) {
    console.error('Error deleting user:', error);
    return { success: false, error: error.message || 'Failed to delete user' };
  }
}
