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
  // Main Source: Otakudesu (Used only for streaming metadata)
  otakudesu: {
    getEpisode: (slug: string) => fetchWithRetry(`/episode/${slug}`),
    getServer: (id: string) => fetchWithRetry(`/server/${id}`),
  },

  // Fallback Source: Samehadaku
  samehadaku: {
    getEpisode: (id: string) => fetchWithRetry(`/samehadaku/episode/${id}`),
    getServer: (id: string) => fetchWithRetry(`/samehadaku/server/${id}`),
  },
};
