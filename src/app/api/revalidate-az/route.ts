import { revalidatePath } from 'next/cache';
import { NextResponse } from 'next/server';

export async function GET() {
  revalidatePath('/az-list');
  return NextResponse.json({ message: 'A-Z List Cache Revalidated', now: Date.now() });
}
