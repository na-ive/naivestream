'use client';

import React, { useEffect, useState, Suspense, use, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { AnimeAPI } from '@/lib/api';
import { useHistory } from '@/lib/hooks/useHistory';
import { ChevronRight, Layout, Play, Settings, Share2, Loader2, Video, Server } from 'lucide-react';
import Link from 'next/link';

function WatchContent({ id }: { id: string }) {
  const searchParams = useSearchParams();
  const animeId = searchParams.get('anime') || '';
  const animeTitle = searchParams.get('title') || '';
  const animeImg = searchParams.get('img') || '';
  const source = searchParams.get('source') || 'otakudesu';
  
  const [episodeData, setEpisodeData] = useState<any>(null);
  const [currentUrl, setCurrentUrl] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [serverLoading, setServerLoading] = useState(false);
  const { saveToHistory } = useHistory();

  const fetchEpisode = useCallback(async () => {
    if (!id || id === 'undefined') return;
    
    setLoading(true);
    let res;
    if (source === 'samehadaku') {
      res = await AnimeAPI.samehadaku.getEpisode(id);
    } else {
      res = await AnimeAPI.otakudesu.getEpisode(id);
    }
    
    const data = res?.data || (res?.title ? res : null);
    
    if (data) {
      setEpisodeData(data);
      setCurrentUrl(data.defaultStreamingUrl || '');
      
      // Save to history
      saveToHistory({
        animeId,
        animeTitle,
        animeImage: animeImg,
        lastEpisodeId: id,
        lastEpisodeTitle: data.title || `Episode ${id}`,
      });
    }
    setLoading(false);
  }, [id, animeId, animeTitle, animeImg, source, saveToHistory]);

  useEffect(() => {
    fetchEpisode();
  }, [fetchEpisode]);

  const changeServer = async (serverId: string) => {
    setServerLoading(true);
    try {
      let res;
      if (source === 'samehadaku') {
        res = await AnimeAPI.samehadaku.getServer(serverId);
      } else {
        res = await AnimeAPI.otakudesu.getServer(serverId);
      }
      
      const serverData = res?.data || (res?.url ? res : null);
      if (serverData?.url) {
        setCurrentUrl(serverData.url);
      }
    } catch (e) {
      console.error("Failed to change server", e);
    } finally {
      setServerLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-secondary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!episodeData) return (
    <div className="max-w-7xl mx-auto px-4 py-20 text-center">
      <h2 className="text-xl font-bold">Episode not found</h2>
      <Link href="/" className="btn-primary mt-6 inline-block">Back to Home</Link>
    </div>
  );

  return (
    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumbs */}
      <div className="flex items-center space-x-2 text-[10px] font-black uppercase tracking-[0.2em] text-muted-text mb-6 overflow-hidden whitespace-nowrap">
        <Link href="/" className="hover:text-secondary transition-colors">Home</Link>
        <ChevronRight className="w-4 h-4 shrink-0" />
        <Link href={`/anime/${animeId}`} className="hover:text-secondary truncate max-w-[200px] transition-colors">{animeTitle}</Link>
        <ChevronRight className="w-4 h-4 shrink-0" />
        <span className="text-secondary truncate">{episodeData.title}</span>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Main Content: Video Player */}
        <div className="flex-grow lg:max-w-[calc(100%-400px)] space-y-6">
          <div className="relative aspect-video bg-black border-b-4 border-secondary/20 shadow-2xl overflow-hidden group">
            {serverLoading && (
              <div className="absolute inset-0 z-20 bg-black/60 backdrop-blur-sm flex items-center justify-center">
                <Loader2 className="w-10 h-10 text-secondary animate-spin" />
              </div>
            )}
            {currentUrl && currentUrl !== 'No iframe found' ? (
              <iframe
                src={currentUrl}
                className="absolute inset-0 w-full h-full border-none m-0 p-0"
                allowFullScreen
                scrolling="no"
                style={{ objectFit: 'contain' }}
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center px-4">
                <Video className="w-12 h-12 text-muted-text mb-4" />
                <p className="text-sm font-bold uppercase tracking-widest text-muted-text">Video source offline</p>
              </div>
            )}
            <div className="absolute inset-0 pointer-events-none border-x border-white/5 z-10" />
          </div>

          <div className="hidden lg:block space-y-6">
             <div className="p-8 bg-card border-l-4 border-secondary shadow-lg">
                <h1 className="text-3xl font-serif font-black tracking-tighter uppercase leading-none">{episodeData.title}</h1>
                <p className="text-secondary font-bold text-xs mt-3 tracking-[0.3em] uppercase opacity-60 flex items-center">
                  <Server className="w-3 h-3 mr-2" />
                  Streaming from {source} provider
                </p>
             </div>
          </div>
        </div>

        {/* Sidebar: Controls & Info */}
        <div className="w-full lg:w-[350px] space-y-8 shrink-0">
          <div 
            className="bg-card/50 border-l-4 border-secondary/50 p-6 space-y-4 relative overflow-hidden group"
            style={{ clipPath: 'polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)' }}
          >
             <div className="absolute inset-0 bg-gradient-to-r from-secondary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
             <div className="flex items-center justify-between border-b border-white/10 pb-4 relative z-10">
                <h3 className="font-serif font-black uppercase tracking-widest text-sm text-foreground">Navigation</h3>
                <Layout className="w-4 h-4 text-secondary" />
             </div>
             <div className="grid grid-cols-1 gap-3">
                {episodeData.nextEpisode && (
                  <Link 
                    href={`/watch/${episodeData.nextEpisode.episodeId}?anime=${animeId}&title=${encodeURIComponent(animeTitle)}&img=${encodeURIComponent(animeImg)}&source=${source}`}
                    className="btn-primary w-full py-4 text-xs tracking-[0.2em]"
                  >
                    Next Episode
                  </Link>
                )}
                <Link 
                  href={`/anime/${animeId}`}
                  className="btn-accent w-full py-4 text-xs tracking-[0.2em]"
                >
                  Episode List
                </Link>
             </div>
          </div>

          <div 
            className="bg-card/50 border-l-4 border-secondary/30 p-6 space-y-6 relative"
            style={{ clipPath: 'polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)' }}
          >
            <h3 className="flex items-center text-[10px] font-black uppercase tracking-[0.2em] text-muted-text border-b border-white/5 pb-3">
              <Video className="w-4 h-4 mr-2 text-secondary" />
              Video Servers
            </h3>
            <div className="space-y-6 max-h-[400px] overflow-y-auto pr-2 no-scrollbar">
              {episodeData.server?.qualities?.map((quality: any) => (
                <div key={quality.title} className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-1.5 h-1.5 bg-secondary shadow-[0_0_5px_rgba(34,197,94,1)]" />
                    <p className="text-[10px] font-black text-foreground uppercase tracking-widest">{quality.title}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {quality.serverList?.map((server: any) => (
                      <button
                        key={server.serverId}
                        onClick={() => changeServer(server.serverId)}
                        className="px-3 py-2 bg-background/50 border-l-2 border-secondary/20 text-[10px] font-bold uppercase tracking-tighter hover:bg-secondary/10 hover:border-secondary hover:text-secondary transition-all cursor-pointer text-left"
                      >
                        {server.title}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:hidden p-6 bg-card border-l-4 border-secondary">
             <h1 className="text-xl font-serif font-black tracking-tighter uppercase leading-none">{episodeData.title}</h1>
             <p className="text-secondary font-bold text-[9px] mt-2 tracking-[0.2em] uppercase opacity-60">Source: {source}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function WatchPage(props: { params: Promise<{ id: string }> }) {
  const params = use(props.params);
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-12 h-12 text-secondary animate-spin" />
      </div>
    }>
      <WatchContent id={params.id} />
    </Suspense>
  );
}
