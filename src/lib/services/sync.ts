export interface StorageStructure<T> {
  version: number;
  local_owner: string;
  data: T;
}

export type SyncState = 'idle' | 'dirty' | 'syncing';

class SyncServiceClass {
  private syncState: SyncState = 'idle';
  private debounceTimer: ReturnType<typeof setTimeout> | null = null;
  private abortController: AbortController | null = null;

  constructor() {
    this.initOnlineListener();
  }

  public load<T>(key: string, currentOwner: string, defaultData: T): T {
    if (typeof window === 'undefined') return defaultData;
    const str = localStorage.getItem(key);
    if (!str) return defaultData;

    try {
      const parsed = JSON.parse(str);
      
      // Check if it is the new StorageStructure format
      if (parsed && typeof parsed === 'object' && 'version' in parsed && 'data' in parsed) {
        const structure = parsed as StorageStructure<T>;
        // Account Switch Protection
        if (String(structure.local_owner) !== String(currentOwner)) {
          if (String(structure.local_owner) !== 'anonymous' && String(currentOwner) !== 'anonymous') {
            // Changed from User A to User B
            this.clearAll();
            return defaultData;
          }
        }
        return structure.data ?? defaultData;
      }
      
      // Legacy format fallback
      if (parsed !== null && parsed !== undefined) {
        return parsed as unknown as T;
      }
      
      return defaultData;
    } catch {
      return defaultData;
    }
  }

  public save<T>(key: string, currentOwner: string, data: T) {
    if (typeof window === 'undefined') return;
    const structure: StorageStructure<T> = {
      version: 1,
      local_owner: currentOwner,
      data
    };
    localStorage.setItem(key, JSON.stringify(structure));
    this.markDirty(currentOwner);
  }

  public markDirty(currentOwner: string) {
    if (currentOwner === 'anonymous') return; // Cannot sync anonymous data yet
    
    this.syncState = 'dirty';
    
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    this.debounceTimer = setTimeout(() => {
      this.sync();
    }, 1000); // 1 second debounce
  }

  public async sync(pullOnly: boolean = false) {
    if (this.syncState === 'syncing') return;
    
    // Abort previous sync if any to prevent stale response overwriting new data
    if (this.abortController) {
      this.abortController.abort();
    }
    this.abortController = new AbortController();

    this.syncState = 'syncing';

    try {
      const history = pullOnly ? [] : (this.getRawData('anime_history') || []);
      const watchlist = pullOnly ? [] : (this.getRawData('anime_watchlist') || []);
      const watchedMap = pullOnly ? {} : (this.getRawData('anime_watched_episodes') || {});
      const watched = [];
      for (const animeSlug in watchedMap) {
        for (const episodeSlug in watchedMap[animeSlug]) {
          watched.push({ animeSlug, episodeSlug, watchedAt: watchedMap[animeSlug][episodeSlug] });
        }
      }

      const res = await fetch('/api/user/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          history,
          watchlist,
          watched_episodes: watched,
          clientVersion: 1
        }),
        signal: this.abortController.signal
      });

      if (!res.ok) {
        throw new Error('Sync failed with status ' + res.status);
      }

      const result = await res.json();
      
      if (result.success && result.data) {
        const owner = result.userId || 'unknown';
        
        // Rebuild watched map
        const newWatchedMap: any = {};
        for (const item of result.data.watched_episodes) {
           if (!newWatchedMap[item.animeSlug]) newWatchedMap[item.animeSlug] = {};
           newWatchedMap[item.animeSlug][item.episodeSlug] = item.watchedAt;
        }

        // Save back
        this.saveRaw('anime_history', owner, result.data.history);
        this.saveRaw('anime_watchlist', owner, result.data.watchlist);
        this.saveRaw('anime_watched_episodes', owner, newWatchedMap);
        
        this.syncState = 'idle';
        // Dispatch events so hooks can re-render
        window.dispatchEvent(new Event('history_updated'));
        window.dispatchEvent(new Event('watchlist_updated'));
        window.dispatchEvent(new Event('watched_updated'));
      } else {
        this.syncState = 'dirty';
      }
    } catch (e: any) {
      if (e.name !== 'AbortError') {
        // Revert to dirty to retry later
        this.syncState = 'dirty';
        console.error('Sync failed:', e);
      }
    }
  }

  private getRawData(key: string) {
    if (typeof window === 'undefined') return null;
    const str = localStorage.getItem(key);
    if (!str) return null;
    try {
      return JSON.parse(str).data;
    } catch {
      return null;
    }
  }

  private saveRaw(key: string, owner: string, data: any) {
    if (typeof window === 'undefined') return;
    const structure = { version: 1, local_owner: owner, data };
    localStorage.setItem(key, JSON.stringify(structure));
  }

  public async deleteFromServer(type: 'history' | 'watchlist' | 'watched_episodes' | 'all', ids?: string[]) {
    if (typeof window === 'undefined') return;
    try {
      await fetch('/api/user/sync', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, ids })
      });
    } catch (e) {
      console.error('Failed to delete from server:', e);
    }
  }

  public clearAll() {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('anime_history');
    localStorage.removeItem('anime_watchlist');
    localStorage.removeItem('anime_watched_episodes');
    
    // Attempt to clear from server as well if user is logged in
    this.deleteFromServer('all');

    window.dispatchEvent(new Event('history_updated'));
    window.dispatchEvent(new Event('watchlist_updated'));
    window.dispatchEvent(new Event('watched_updated'));
  }

  private initOnlineListener() {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        if (this.syncState === 'dirty') {
          this.sync();
        }
      });
    }
  }
}

export const SyncService = new SyncServiceClass();
