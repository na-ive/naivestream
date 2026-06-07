'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Play, RotateCcw } from 'lucide-react';
import { useHistory, WatchHistory } from '@/lib/hooks/useHistory';

export function ContinueWatching({ 
  animeId, 
  animeTitle, 
  animeImage,
  source
}: { 
  animeId: string; 
  animeTitle: string; 
  animeImage: string;
  source: string;
}) {
  const { history } = useHistory();
  const [lastWatched, setLastWatched] = useState<WatchHistory | null>(null);

  useEffect(() => {
    const saved = history.find(h => h.animeId === animeId);
    if (saved) setLastWatched(saved);
  }, [history, animeId]);

  if (!lastWatched) return null;

  return (
    <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-500">
      <Link
        href={`/watch/${lastWatched.lastEpisodeId}?anime=${animeId}&title=${encodeURIComponent(animeTitle)}&img=${encodeURIComponent(animeImage)}&source=${source}`}
        className="btn-primary w-full flex items-center justify-center space-x-2 group"
      >
        <Play className="w-5 h-5 fill-current group-hover:scale-110 transition-transform" />
        <span>Continue Episode {lastWatched.lastEpisodeTitle.match(/\d+/)?.[0] || ''}</span>
      </Link>
      <p className="text-[10px] text-center font-bold text-secondary uppercase tracking-[0.2em] opacity-60">
        Resuming your progress
      </p>
    </div>
  );
}
