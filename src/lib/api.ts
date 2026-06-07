const API_BASE_URL = 'https://www.sankavollerei.com/anime';

async function fetchWithRetry(url: string, options: RequestInit = {}) {
  const isBrowser = typeof window !== 'undefined';
  
  // Use proxy for client-side requests to avoid CORS
  const fullUrl = isBrowser 
    ? `/api/proxy?path=${encodeURIComponent(url)}`
    : `${API_BASE_URL}${url}`;
  
  const defaultOptions: RequestInit = {
    next: { revalidate: 3600 },
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'application/json',
    },
    ...options
  };

  try {
    const res = await fetch(fullUrl, defaultOptions);
    
    if (!res.ok) {
      console.error(`[API Error] ${res.status} on ${fullUrl}`);
      return null;
    }
    
    const json = await res.json();
    
    if (json && json.ok === false) {
      console.error(`[API Internal Error] ${json.message} on ${fullUrl}`);
      return null;
    }

    return json;
  } catch (error) {
    console.error(`[Fetch Error] ${error} on ${fullUrl}`);
    return null;
  }
}

export const AnimeAPI = {
  // Main Source: Otakudesu
  otakudesu: {
    getHome: () => fetchWithRetry('/home'),
    getOngoing: (page = 1) => fetchWithRetry(`/ongoing-anime?page=${page}`),
    getComplete: (page = 1) => fetchWithRetry(`/complete-anime?page=${page}`),
    getDetails: (slug: string) => fetchWithRetry(`/anime/${slug}`),
    getEpisode: (slug: string) => fetchWithRetry(`/episode/${slug}`),
    getServer: (id: string) => fetchWithRetry(`/server/${id}`),
    search: (query: string) => fetchWithRetry(`/search/${query}`, { cache: 'no-store' }),
    getAZList: () => fetchWithRetry('/unlimited', { 
      next: { revalidate: 2592000, tags: ['az-list'] } // 30 days
    }),
    getSchedule: () => fetchWithRetry('/schedule', {
      next: { revalidate: 3600 } // 1 hour
    }),
  },

  // Fallback Source: Samehadaku
  samehadaku: {
    getRecent: (page = 1) => fetchWithRetry(`/samehadaku/recent?page=${page}`),
    getDetails: (id: string) => fetchWithRetry(`/samehadaku/anime/${id}`),
    getEpisode: (id: string) => fetchWithRetry(`/samehadaku/episode/${id}`),
    getServer: (id: string) => fetchWithRetry(`/samehadaku/server/${id}`),
    search: (query: string) => fetchWithRetry(`/samehadaku/search?q=${query}`, { cache: 'no-store' }),
  },

  // Generic Search with fallback
  search: async (query: string) => {
    const otakudesuRes = await AnimeAPI.otakudesu.search(query);
    const otakudesuData = otakudesuRes?.data?.animeList || otakudesuRes?.data || [];
    if (Array.isArray(otakudesuData) && otakudesuData.length > 0) {
      return { source: 'otakudesu', data: otakudesuData };
    }
    
    const samehadakuRes = await AnimeAPI.samehadaku.search(query);
    const samehadakuData = samehadakuRes?.data?.animeList || samehadakuRes?.data || samehadakuRes || [];
    return { source: 'samehadaku', data: Array.isArray(samehadakuData) ? samehadakuData : [] };
  }
};
