'use client';

import { useCallback, useMemo, useSyncExternalStore } from 'react';

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
  const watchedStr = useSyncExternalStore(subscribeWatched, getWatchedSnapshot, getServerSnapshot);

  const watched = useMemo<WatchedEpisodesStore>(() => {
    if (!watchedStr) return {};
    try {
      return JSON.parse(watchedStr);
    } catch {
      return {};
    }
  }, [watchedStr]);

  const markAsWatched = useCallback((animeSlug: string, episodeSlug: string) => {
    const currentStr = localStorage.getItem('anime_watched_episodes');
    const current = currentStr ? JSON.parse(currentStr) : {};
    if (!current[animeSlug]) current[animeSlug] = {};
    current[animeSlug][episodeSlug] = Date.now();
    localStorage.setItem('anime_watched_episodes', JSON.stringify(current));
    window.dispatchEvent(new Event('watched_updated'));
  }, []);

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
    const currentStr = localStorage.getItem('anime_watched_episodes');
    if (!currentStr) return;
    const current = JSON.parse(currentStr);
    delete current[animeSlug];
    localStorage.setItem('anime_watched_episodes', JSON.stringify(current));
    window.dispatchEvent(new Event('watched_updated'));
  }, []);

  return { watched, markAsWatched, isWatched, getWatchedEpisodes, getWatchedCount, resetAnime };
}
