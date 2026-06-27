'use client';

import { useCallback, useMemo, useSyncExternalStore } from 'react';

import { useSession } from 'next-auth/react';
import { SyncService } from '../services/sync';

interface WatchedEpisodesStore {
  [animeSlug: string]: {
    [episodeSlug: string]: number;
  };
}

const subscribeWatched = (listener: () => void) => {
  window.addEventListener('watched_updated', listener);
  return () => window.removeEventListener('watched_updated', listener);
};

const getWatchedSnapshot = () => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('anime_watched_episodes');
};

const getServerSnapshot = () => null;

export function useWatchedEpisodes() {
  const { data: session } = useSession();
  const ownerId = (session?.user as any)?.id || 'anonymous';
  const watchedStr = useSyncExternalStore(subscribeWatched, getWatchedSnapshot, getServerSnapshot);

  const watched = useMemo<WatchedEpisodesStore>(() => {
    return SyncService.load<WatchedEpisodesStore>('anime_watched_episodes', ownerId, {});
  }, [watchedStr, ownerId]);

  const markAsWatched = useCallback((animeSlug: string, episodeSlug: string) => {
    const current = SyncService.load<WatchedEpisodesStore>('anime_watched_episodes', ownerId, {});
    if (!current[animeSlug]) current[animeSlug] = {};
    current[animeSlug][episodeSlug] = Date.now();
    SyncService.save('anime_watched_episodes', ownerId, current);
    window.dispatchEvent(new Event('watched_updated'));
  }, [ownerId]);

  const isWatched = useCallback((animeSlug: string, episodeSlug: string): boolean => {
    return !!watched[animeSlug]?.[episodeSlug];
  }, [watched]);

  const getWatchedEpisodes = useCallback((animeSlug: string): string[] => {
    return watched[animeSlug] ? Object.keys(watched[animeSlug]) : [];
  }, [watched]);

  const getWatchedCount = useCallback((animeSlug: string): number => {
    return watched[animeSlug] ? Object.keys(watched[animeSlug]).length : 0;
  }, [watched]);

  const resetAnime = useCallback((animeSlug: string) => {
    const current = SyncService.load<WatchedEpisodesStore>('anime_watched_episodes', ownerId, {});
    delete current[animeSlug];
    SyncService.save('anime_watched_episodes', ownerId, current);
    window.dispatchEvent(new Event('watched_updated'));
  }, [ownerId]);

  return { watched, markAsWatched, isWatched, getWatchedEpisodes, getWatchedCount, resetAnime };
}
