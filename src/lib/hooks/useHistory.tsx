'use client';

import { useCallback, useMemo, useSyncExternalStore } from 'react';
import { toast } from 'sonner';
import { TrashCan } from '@carbon/icons-react';

import { useSession } from 'next-auth/react';
import { SyncService } from '../services/sync';

export interface WatchHistory {
  animeId: string;
  animeTitle: string;
  animeTitleEnglish?: string;
  animeImage: string;
  lastEpisodeId: string;
  lastEpisodeTitle: string;
  updatedAt: number;
}

const subscribeHistory = (listener: () => void) => {
  window.addEventListener('history_updated', listener);
  return () => window.removeEventListener('history_updated', listener);
};

const getHistorySnapshot = () => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('anime_history');
};

const getServerSnapshot = () => null;

export function useHistory() {
  const { data: session } = useSession();
  const ownerId = (session?.user as any)?.id || 'anonymous';
  const historyStr = useSyncExternalStore(subscribeHistory, getHistorySnapshot, getServerSnapshot);

  const history = useMemo<WatchHistory[]>(() => {
    return SyncService.load<WatchHistory[]>('anime_history', ownerId, []);
  }, [historyStr, ownerId]);

  const saveToHistory = useCallback((item: Omit<WatchHistory, 'updatedAt'>) => {
    const currentList = SyncService.load<WatchHistory[]>('anime_history', ownerId, []);
    const newHistory = [...currentList];
    const index = newHistory.findIndex((h) => h.animeId === item.animeId);
    
    if (index !== -1) {
      newHistory[index] = { ...item, updatedAt: Date.now() };
    } else {
      newHistory.unshift({ ...item, updatedAt: Date.now() });
    }

    // Keep only last 50 items
    const limitedHistory = newHistory
      .sort((a, b) => b.updatedAt - a.updatedAt)
      .slice(0, 50);

    SyncService.save('anime_history', ownerId, limitedHistory);
    window.dispatchEvent(new Event('history_updated'));
  }, [ownerId]);

  const removeFromHistory = useCallback((animeId: string) => {
    const currentList = SyncService.load<WatchHistory[]>('anime_history', ownerId, []);
    const item = currentList.find(h => h.animeId === animeId);
    if (item) {
      const newList = currentList.filter((h) => h.animeId !== animeId);
      SyncService.save('anime_history', ownerId, newList);
      if (ownerId !== 'anonymous') SyncService.deleteFromServer('history', [animeId]);
      window.dispatchEvent(new Event('history_updated'));
      toast.error('Removed from History', {
        description: item.animeTitle,
        icon: <div className="w-8 h-8 bg-danger/10 border border-danger flex items-center justify-center shrink-0 mr-3 shadow-[0_0_10px_rgba(239,68,68,0.3)]"><TrashCan className="w-5 h-5 text-danger" /></div>,
      });
    }
  }, [ownerId]);

  const removeMultipleFromHistory = useCallback((animeIds: string[]) => {
    const currentList = SyncService.load<WatchHistory[]>('anime_history', ownerId, []);
    const newList = currentList.filter((h) => !animeIds.includes(h.animeId));
    SyncService.save('anime_history', ownerId, newList);
    if (ownerId !== 'anonymous') SyncService.deleteFromServer('history', animeIds);
    window.dispatchEvent(new Event('history_updated'));
    toast.error(`${animeIds.length} items removed from History`, {
      icon: <div className="w-8 h-8 bg-danger/10 border border-danger flex items-center justify-center shrink-0 mr-3 shadow-[0_0_10px_rgba(239,68,68,0.3)]"><TrashCan className="w-5 h-5 text-danger" /></div>,
    });
  }, [ownerId]);

  return { history, saveToHistory, removeFromHistory, removeMultipleFromHistory };
}
