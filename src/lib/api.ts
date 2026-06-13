const API_BASE_URL = 'https://www.sankavollerei.com/anime';

async function fetchWithRetry(url: string, options: RequestInit = {}) {
  const isBrowser = typeof window !== 'undefined';
  
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
    if (!res.ok) return null;
    const json = await res.json();
    if (json && json.ok === false) return null;
    return json;
  } catch {
    return null;
  }
}

export async function getEpisode(slug: string) {
  try {
    const res = await fetch(`/api/episode/${slug}`, { next: { revalidate: 3600 } });
    return res.ok ? res.json() : null;
  } catch {
    return null;
  }
}

export async function getServer(serverId: string) {
  try {
    const res = await fetch(`/api/server?id=${encodeURIComponent(serverId)}`);
    return res.ok ? res.json() : null;
  } catch {
    return null;
  }
}

export const AnimeAPI = {
  getEpisode,
  getServer,
};
