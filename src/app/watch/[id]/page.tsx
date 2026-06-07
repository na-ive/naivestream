'use client';

import React, { useEffect, useState, Suspense, use, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { AnimeAPI } from '@/lib/api';
import { useHistory } from '@/lib/hooks/useHistory';
import { ChevronRight, Layout, Play, Settings, Share2, Loader2, Video, Server, Monitor, RectangleHorizontal } from 'lucide-react';
import Link from 'next/link';
import { Tooltip } from '@/components/ui/Tooltip';

function WatchContent({ id }: { id: string }) {
  const searchParams = useSearchParams();
  const animeId = searchParams.get('anime') || '';
  const animeTitle = searchParams.get('title') || '';
  const animeImg = searchParams.get('img') || '';
  const source = searchParams.get('source') || 'otakudesu';
  
  const [episodeData, setEpisodeData] = useState<any>(null);
  const [animeData, setAnimeData] = useState<any>(null);
  const [currentUrl, setCurrentUrl] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [serverLoading, setServerLoading] = useState(false);
  const [isCinemaMode, setIsCinemaMode] = useState(false);
  const [isTheaterMode, setIsTheaterMode] = useState(false);
  const { saveToHistory } = useHistory();

  // Load Theater Mode preference
  useEffect(() => {
    const saved = localStorage.getItem('theaterMode');
    if (saved === 'true') {
      setIsTheaterMode(true);
    }
  }, []);

  const toggleTheaterMode = () => {
    const newValue = !isTheaterMode;
    setIsTheaterMode(newValue);
    localStorage.setItem('theaterMode', String(newValue));
  };

  // Handle Escape key and Body Scroll for Cinema Mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isCinemaMode) {
        setIsCinemaMode(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isCinemaMode]);

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

  const fetchAnimeData = useCallback(async () => {
    if (!animeId || animeId === 'undefined' || source === 'samehadaku') return;
    try {
      const res = await AnimeAPI.otakudesu.getDetails(animeId);
      if (res?.data) {
        setAnimeData(res.data);
      }
    } catch (e) {
      console.error('Failed to fetch anime data for episode list', e);
    }
  }, [animeId, source]);

  useEffect(() => {
    fetchEpisode();
    fetchAnimeData();
  }, [fetchEpisode, fetchAnimeData]);

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
      {/* Breadcrumbs Status Bar */}
      <div 
        className="flex items-center gap-3 bg-card px-5 py-2.5 mb-6 relative overflow-hidden text-[10px] font-black uppercase tracking-[0.2em] text-muted-text w-max max-w-full shadow-lg"
        style={{ clipPath: 'polygon(0 0, calc(100% - 15px) 0, 100% 15px, 100% 100%, 15px 100%, 0 calc(100% - 15px))' }}
      >
        <div className="relative z-10 flex items-center space-x-2 whitespace-nowrap overflow-hidden pr-2">
          <Link href="/" className="hover:text-foreground transition-colors shrink-0">Home</Link>
          <ChevronRight className="w-3 h-3 shrink-0 text-secondary" />
          <Link href={`/anime/${animeId}`} className="hover:text-foreground truncate max-w-[120px] sm:max-w-[200px] transition-colors">{animeTitle}</Link>
          <ChevronRight className="w-3 h-3 shrink-0 text-secondary" />
          <span className="text-secondary truncate max-w-[150px] sm:max-w-[300px]">{episodeData.title}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-x-8 gap-y-6">
        {/* Cinema Mode Overlay */}
        {isCinemaMode && (
          <div 
            className="fixed inset-0 bg-black/95 backdrop-blur-sm z-[60] transition-all duration-500 cursor-pointer"
            onClick={() => setIsCinemaMode(false)}
            title="Click to exit focus mode"
          />
        )}

        {/* Main Content: Video Player */}
        <div className={`transition-all duration-500 self-start ${isCinemaMode ? 'relative z-[60]' : ''} ${isTheaterMode ? 'lg:col-span-2' : 'lg:col-span-1'}`}>
          <div className={`relative aspect-video bg-black border-b-4 border-secondary/20 shadow-2xl overflow-hidden group transition-all duration-500 ${isCinemaMode ? 'shadow-[0_0_50px_rgba(34,197,94,0.15)] ring-1 ring-secondary/30' : ''}`}>
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

          <div className={`hidden lg:flex items-center gap-4 transition-all duration-500 self-start ${isCinemaMode ? 'relative z-[60]' : ''} ${isTheaterMode ? 'lg:col-span-1 lg:col-start-1 lg:row-start-2' : 'lg:col-span-1 lg:col-start-1 lg:row-start-2'}`}>
             <div 
               className="px-6 py-4 bg-card shadow-lg relative overflow-hidden group flex-grow"
               style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 15px), calc(100% - 15px) 100%, 0 100%)' }}
             >
                <div className="relative z-10">
                  <h1 className="text-2xl font-serif font-black tracking-tighter uppercase leading-none">{episodeData.title}</h1>
                  <p className="text-secondary font-bold text-xs mt-2 tracking-[0.3em] uppercase opacity-60 flex items-center">
                    <Server className="w-3 h-3 mr-2" />
                    Streaming from {source} provider
                  </p>
                </div>
             </div>

             <div className="relative z-10 shrink-0 flex items-center gap-3">
               <Tooltip content={isTheaterMode ? 'Default View' : 'Theater Mode'} position="top">
                 <button 
                   onClick={toggleTheaterMode}
                   className={`p-3 transition-all border ${isTheaterMode ? 'bg-secondary text-black border-secondary shadow-[0_0_20px_rgba(34,197,94,0.4)]' : 'bg-secondary/10 text-secondary hover:bg-secondary hover:text-black border-secondary/30 hover:border-secondary shadow-[0_0_10px_rgba(34,197,94,0.1)] hover:shadow-[0_0_20px_rgba(34,197,94,0.4)]'}`}
                   style={{ clipPath: 'polygon(5px 0, 100% 0, 100% calc(100% - 5px), calc(100% - 5px) 100%, 0 100%, 0 5px)' }}
                 >
                   <RectangleHorizontal className="w-4 h-4" />
                 </button>
               </Tooltip>
               <Tooltip content={isCinemaMode ? 'Exit Focus' : 'Focus Mode'} position="top">
                 <button 
                   onClick={() => setIsCinemaMode(!isCinemaMode)}
                   className={`p-3 transition-all border ${isCinemaMode ? 'bg-secondary text-black border-secondary shadow-[0_0_20px_rgba(34,197,94,0.4)]' : 'bg-secondary/10 text-secondary hover:bg-secondary hover:text-black border-secondary/30 hover:border-secondary shadow-[0_0_10px_rgba(34,197,94,0.1)] hover:shadow-[0_0_20px_rgba(34,197,94,0.4)]'}`}
                   style={{ clipPath: 'polygon(5px 0, 100% 0, 100% calc(100% - 5px), calc(100% - 5px) 100%, 0 100%, 0 5px)' }}
                 >
                   <Monitor className="w-4 h-4" />
                 </button>
               </Tooltip>
             </div>
          </div>
        </div>

        {/* Sidebar: Controls & Info */}
        <div className={`w-full ${isTheaterMode ? 'lg:col-span-2 grid lg:grid-cols-[350px_1fr] lg:gap-8 lg:items-start space-y-8 lg:space-y-0' : 'lg:col-span-1 lg:col-start-2 lg:row-span-2 space-y-8'} shrink-0`}>
          <div 
            className="bg-card/50 border-l-4 border-secondary/50 p-6 space-y-4 relative overflow-hidden"
            style={{ clipPath: 'polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)' }}
          >
             <div className="flex items-center space-x-2 border-b border-white/5 pb-3 mb-4 relative z-10">
                <div className="w-1 h-4 bg-secondary" />
                <Layout className="w-3.5 h-3.5 text-secondary" />
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-text">Navigation</h3>
             </div>
             <div className="grid grid-cols-2 gap-3 relative z-10">
                {episodeData.prevEpisode ? (
                  <Link 
                    href={`/watch/${episodeData.prevEpisode.episodeId}?anime=${animeId}&title=${encodeURIComponent(animeTitle)}&img=${encodeURIComponent(animeImg)}&source=${source}`}
                    className="btn-accent w-full py-2.5 text-[10px] tracking-[0.2em] flex items-center justify-center text-center"
                  >
                    Prev
                  </Link>
                ) : (
                  <div className="btn-accent w-full py-2.5 text-[10px] tracking-[0.2em] flex items-center justify-center text-center opacity-30 pointer-events-none grayscale cursor-not-allowed">
                    Prev
                  </div>
                )}

                {episodeData.nextEpisode ? (
                  <Link 
                    href={`/watch/${episodeData.nextEpisode.episodeId}?anime=${animeId}&title=${encodeURIComponent(animeTitle)}&img=${encodeURIComponent(animeImg)}&source=${source}`}
                    className="btn-primary w-full py-2.5 text-[10px] tracking-[0.2em] flex items-center justify-center text-center"
                  >
                    Next
                  </Link>
                ) : (
                  <div className="btn-primary w-full py-2.5 text-[10px] tracking-[0.2em] flex items-center justify-center text-center opacity-30 pointer-events-none grayscale cursor-not-allowed">
                    Next
                  </div>
                )}
             </div>

             {animeData?.episodeList && animeData.episodeList.length > 0 && (
               <div className="mt-6 space-y-3 relative z-10">
                 <h4 className="font-bold text-xs uppercase tracking-[0.2em] text-muted-text">All Episodes</h4>
                 <div className="grid grid-cols-5 gap-2 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
                   {[...animeData.episodeList].reverse().map((ep: any, index: number) => {
                     const epMatch = ep.title.match(/Episode\s+(\d+(\.\d+)?)/i);
                     const epNum = epMatch ? epMatch[1] : (index + 1);
                     const isActive = ep.episodeId === id;
                     
                     return (
                       <Link
                         key={ep.episodeId}
                         href={`/watch/${ep.episodeId}?anime=${animeId}&title=${encodeURIComponent(animeTitle)}&img=${encodeURIComponent(animeImg)}&source=${source}`}
                         className={`w-full aspect-square flex items-center justify-center text-xs font-bold transition-all ${
                           isActive 
                             ? 'bg-secondary text-background shadow-[0_0_10px_rgba(34,197,94,0.3)] pointer-events-none' 
                             : 'bg-background hover:bg-secondary/20 border border-white/5 hover:border-secondary/50 text-foreground/70 hover:text-secondary'
                         }`}
                         title={ep.title}
                       >
                         {epNum}
                       </Link>
                     );
                   })}
                 </div>
               </div>
             )}

             <div className="pt-2 relative z-10">
                <Link 
                  href={`/anime/${animeId}`}
                  className="btn-accent w-full py-3 text-[10px] tracking-[0.2em] flex justify-center items-center opacity-80 hover:opacity-100"
                >
                  Back to Anime Detail
                </Link>
             </div>
          </div>

          <div 
            className="bg-card/50 border-l-4 border-secondary/30 p-6 space-y-6 relative"
            style={{ clipPath: 'polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)' }}
          >
            <div className="flex items-center space-x-2 border-b border-white/5 pb-3 mb-4 relative z-10">
                <div className="w-1 h-4 bg-secondary" />
                <Video className="w-3.5 h-3.5 text-secondary" />
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-text">Video Servers</h3>
            </div>
            <div className="space-y-6 max-h-[400px] overflow-y-auto pr-2 no-scrollbar">
              {episodeData.server?.qualities?.map((quality: any) => (
                <div key={quality.title} className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-1.5 h-1.5 bg-secondary shadow-[0_0_5px_rgba(34,197,94,1)]" />
                    <p className="text-[10px] font-black text-foreground uppercase tracking-widest">{quality.title}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
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
