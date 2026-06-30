'use client';

import { useCallback, useMemo, useSyncExternalStore } from 'react';
import { toast } from 'sonner';
import { CheckboxChecked, TrashCan } from '@carbon/icons-react';

import { useSession } from 'next-auth/react';
import { SyncService } from '../services/sync';

export interface WatchlistItem {
  animeId: string;
  animeTitle: string;
  animeTitleEnglish?: string;
  animeImage: string;
  addedAt: number;
}

const subscribeWatchlist = (listener: () => void) => {
  window.addEventListener('watchlist_updated', listener);
  return () => window.removeEventListener('watchlist_updated', listener);
};

const getWatchlistSnapshot = () => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('anime_watchlist');
};

const getServerSnapshot = () => null;

export function useWatchlist() {
  const { data: session } = useSession();
  const ownerId = (session?.user as any)?.id || 'anonymous';
  const watchlistStr = useSyncExternalStore(subscribeWatchlist, getWatchlistSnapshot, getServerSnapshot);

  const watchlist = useMemo<WatchlistItem[]>(() => {
    return SyncService.load<WatchlistItem[]>('anime_watchlist', ownerId, []);
  }, [watchlistStr, ownerId]);

  const addToWatchlist = useCallback((item: Omit<WatchlistItem, 'addedAt'>) => {
    const currentList = SyncService.load<WatchlistItem[]>('anime_watchlist', ownerId, []);
    if (currentList.some(w => w.animeId === item.animeId)) return;
    
    SyncService.save('anime_watchlist', ownerId, [{ ...item, addedAt: Date.now() }, ...currentList]);
    window.dispatchEvent(new Event('watchlist_updated'));
    
    toast.success('Added to Watchlist', {
      description: item.animeTitle,
      icon: <div className="w-8 h-8 bg-secondary/10 border border-secondary flex items-center justify-center shrink-0 mr-3 shadow-[0_0_10px_rgba(34,197,94,0.3)]"><CheckboxChecked className="w-5 h-5 text-secondary" /></div>,
    });
  }, [ownerId]);

  const removeFromWatchlist = useCallback((animeId: string) => {
    const currentList = SyncService.load<WatchlistItem[]>('anime_watchlist', ownerId, []);
    const item = currentList.find(w => w.animeId === animeId);
    if (item) {
      SyncService.save('anime_watchlist', ownerId, currentList.filter(w => w.animeId !== animeId));
      if (ownerId !== 'anonymous') SyncService.deleteFromServer('watchlist', [animeId]);
      window.dispatchEvent(new Event('watchlist_updated'));
      toast.error('Removed from Watchlist', {
        description: item.animeTitle,
        icon: <div className="w-8 h-8 bg-danger/10 border border-danger flex items-center justify-center shrink-0 mr-3 shadow-[0_0_10px_rgba(239,68,68,0.3)]"><TrashCan className="w-5 h-5 text-danger" /></div>,
      });
    }
  }, [ownerId]);

  const isInWatchlist = useCallback((animeId: string) => {
    return watchlist.some(w => w.animeId === animeId);
  }, [watchlist]);

  const toggleWatchlist = useCallback((item: Omit<WatchlistItem, 'addedAt'>) => {
    const currentList = SyncService.load<WatchlistItem[]>('anime_watchlist', ownerId, []);
    const exists = currentList.some(w => w.animeId === item.animeId);
    
    if (exists) {
      SyncService.save('anime_watchlist', ownerId, currentList.filter(w => w.animeId !== item.animeId));
      if (ownerId !== 'anonymous') SyncService.deleteFromServer('watchlist', [item.animeId]);
      window.dispatchEvent(new Event('watchlist_updated'));
      toast.error('Removed from Watchlist', {
        description: item.animeTitle,
        icon: <div className="w-8 h-8 bg-danger/10 border border-danger flex items-center justify-center shrink-0 mr-3 shadow-[0_0_10px_rgba(239,68,68,0.3)]"><TrashCan className="w-5 h-5 text-danger" /></div>,
      });
    } else {
      SyncService.save('anime_watchlist', ownerId, [{ ...item, addedAt: Date.now() }, ...currentList]);
      window.dispatchEvent(new Event('watchlist_updated'));
      toast.success('Added to Watchlist', {
        description: item.animeTitle,
        icon: <div className="w-8 h-8 bg-secondary/10 border border-secondary flex items-center justify-center shrink-0 mr-3 shadow-[0_0_10px_rgba(34,197,94,0.3)]"><CheckboxChecked className="w-5 h-5 text-secondary" /></div>,
      });
    }
  }, [ownerId]);

  const removeMultipleFromWatchlist = useCallback((animeIds: string[]) => {
    const currentList = SyncService.load<WatchlistItem[]>('anime_watchlist', ownerId, []);
    SyncService.save('anime_watchlist', ownerId, currentList.filter(w => !animeIds.includes(w.animeId)));
    if (ownerId !== 'anonymous') SyncService.deleteFromServer('watchlist', animeIds);
    window.dispatchEvent(new Event('watchlist_updated'));
    toast.error(`${animeIds.length} items removed from Watchlist`, {
      icon: <div className="w-8 h-8 bg-danger/10 border border-danger flex items-center justify-center shrink-0 mr-3 shadow-[0_0_10px_rgba(239,68,68,0.3)]"><TrashCan className="w-5 h-5 text-danger" /></div>,
    });
  }, [ownerId]);

  return {
    watchlist,
    addToWatchlist,
    removeFromWatchlist,
    removeMultipleFromWatchlist,
    isInWatchlist,
    toggleWatchlist
  };
}
