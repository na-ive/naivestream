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
      if (res.status !== 404) {
        console.error(`[API Error] ${res.status} on ${fullUrl}`);
      }
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
    search: (query: string) => fetchWithRetry(`/search/${encodeURIComponent(query)}`),
    getAZList: () => fetchWithRetry('/unlimited', { 
      next: { revalidate: 2592000, tags: ['az-list'] } // 30 days
    }),
    getSchedule: () => fetchWithRetry('/schedule', {
      next: { revalidate: 3600 } // 1 hour
    }),
    getGenreList: () => fetchWithRetry('/genre', {
      next: { revalidate: 86400 } // 24 hours
    }),
    getGenreAnime: (slug: string, page = 1) => fetchWithRetry(`/genre/${slug}?page=${page}`, {
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
  },
  
  // Extra Metadata: Jikan API (MyAnimeList)
  jikan: {
    searchAnime: async (query: string) => {
      // Clean query for better accuracy (remove Sub Indo, S2 -> Season 2)
      let cleanQuery = query.replace(/Subtitle Indonesia|Sub Indo/gi, '').trim();
      cleanQuery = cleanQuery.replace(/\bS(\d+)\b/gi, 'Season $1');

      // Jikan has rate limits, be careful not to spam. Add 350ms throttle.
      await new Promise(r => setTimeout(r, 350));
      
      const url = `https://api.jikan.moe/v4/anime?q=${encodeURIComponent(cleanQuery)}&limit=3`;
      try {
        const res = await fetch(url, {
          next: { revalidate: 86400 }, // Cache for 24 hours
          headers: { 'Accept': 'application/json' }
        });
        if (!res.ok) return null;
        const json = await res.json();
        
        // Simple heuristic: If we asked for a specific season, try to find it in the top 3
        if (json && json.data && json.data.length > 0) {
          const seasonMatch = cleanQuery.match(/Season (\d+)/i);
          if (seasonMatch) {
            const num = seasonMatch[1];
            // Match formats: "Season 2", "2nd Season", "Part 2", " II", etc.
            const romanMap: Record<string, string> = {'2': 'II', '3': 'III', '4': 'IV', '5': 'V'};
            const roman = romanMap[num];
            const suffix = num === '1' ? 'st' : num === '2' ? 'nd' : num === '3' ? 'rd' : 'th';
            
            const seasonRegex = new RegExp(`(Season ${num}|${num}${suffix} Season|Part ${num}|\\b${num}\\b${roman ? `|\\b${roman}\\b` : ''})`, 'i');
            
            const exactMatch = json.data.find((anime: any) => 
              seasonRegex.test(anime.title) ||
              (anime.title_english && seasonRegex.test(anime.title_english)) ||
              (anime.title_synonyms && anime.title_synonyms.some((syn: string) => seasonRegex.test(syn)))
            );
            if (exactMatch) return exactMatch;
          }
          return json.data[0];
        }
        return null;
      } catch (error) {
        console.error(`[Jikan API Error] ${error}`);
        return null;
      }
    },
    getCharacters: async (mal_id: number) => {
      await new Promise(r => setTimeout(r, 350));
      const url = `https://api.jikan.moe/v4/anime/${mal_id}/characters`;
      try {
        const res = await fetch(url, {
          next: { revalidate: 86400 }, // Cache for 24 hours
          headers: { 'Accept': 'application/json' }
        });
        if (!res.ok) return null;
        const json = await res.json();
        if (json && json.data) {
          return json.data;
        }
        return null;
      } catch (error) {
        console.error(`[Jikan Characters Error] ${error}`);
        return null;
      }
    }
  }
};
