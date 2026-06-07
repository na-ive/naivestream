'use client';

import React, { useEffect, useState, Suspense, use } from 'react';
import { useSearchParams } from 'next/navigation';
import { AnimeAPI } from '@/lib/api';
import { useHistory } from '@/lib/hooks/useHistory';
import { ChevronRight, Layout, Play, Settings, Share2, Loader2, Video } from 'lucide-react';
import Link from 'next/link';

function WatchContent({ paramsPromise }: { paramsPromise: Promise<{ id: string }> }) {
  const params = use(paramsPromise);
  const { id } = params;
  
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

  useEffect(() => {
    let isMounted = true;

    async function fetchEpisode() {
      if (!id || id === 'undefined') return;
      
      setLoading(true);
      
      let res;
      if (source === 'samehadaku') {
        res = await AnimeAPI.samehadaku.getEpisode(id);
      } else {
        res = await AnimeAPI.otakudesu.getEpisode(id);
      }
      
      const data = res?.data || (res?.title ? res : null);
      
      if (isMounted && data) {
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
      if (isMounted) setLoading(false);
    }

    fetchEpisode();

    return () => {
      isMounted = false;
    };
  }, [id, animeId, animeTitle, animeImg, source, saveToHistory]);

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
      <h2 className="text-xl font-bold text-red-500">Episode not found</h2>
      <p className="text-gray-500 mt-2">The ID <strong>{id}</strong> could not be found on <strong>{source}</strong>.</p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
        <Link href={`/anime/${animeId}`} className="btn-primary">Back to Anime Details</Link>
        <Link href="/" className="px-6 py-3 rounded-lg border border-border hover:bg-card transition-colors">Home</Link>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumbs */}
      <div className="flex items-center space-x-2 text-sm text-gray-500 mb-6 overflow-hidden whitespace-nowrap">
        <Link href="/" className="hover:text-secondary">Home</Link>
        <ChevronRight className="w-4 h-4 shrink-0" />
        <Link href={`/anime/${animeId}`} className="hover:text-secondary truncate max-w-[150px]">{animeTitle}</Link>
        <ChevronRight className="w-4 h-4 shrink-0" />
        <span className="text-foreground font-medium truncate">{episodeData.title}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Player */}
          <div className="relative aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl border border-border">
            {serverLoading && (
              <div className="absolute inset-0 z-20 bg-black/60 backdrop-blur-sm flex items-center justify-center">
                <Loader2 className="w-10 h-10 text-secondary animate-spin" />
              </div>
            )}
            {currentUrl && currentUrl !== 'No iframe found' ? (
              <iframe
                src={currentUrl}
                className="absolute inset-0 w-full h-full"
                allowFullScreen
                scrolling="no"
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center px-4">
                <Video className="w-12 h-12 text-gray-600 mb-4" />
                <p>No video source available for this server.</p>
                <p className="text-sm text-gray-500 mt-2">Please try switching to another server below.</p>
              </div>
            )}
          </div>

          {/* Servers Grid */}
          <div className="space-y-4">
            <h3 className="flex items-center text-sm font-bold uppercase tracking-wider text-gray-500">
              <Video className="w-4 h-4 mr-2" />
              Available Servers
            </h3>
            <div className="space-y-4">
              {episodeData.server?.qualities?.map((quality: any) => (
                <div key={quality.title} className="space-y-2">
                  <p className="text-xs font-bold text-secondary uppercase">{quality.title}</p>
                  <div className="flex flex-wrap gap-2">
                    {quality.serverList?.map((server: any) => (
                      <button
                        key={server.serverId}
                        onClick={() => changeServer(server.serverId)}
                        className="px-4 py-2 bg-card border border-border rounded-lg text-xs font-medium hover:border-secondary transition-all"
                      >
                        {server.title}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Anime Info */}
          <div className="p-6 bg-card rounded-2xl border border-border space-y-4">
            <h1 className="text-2xl font-bold">{episodeData.title}</h1>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <span className="flex items-center">
                  <Play className="w-4 h-4 mr-1 text-secondary" />
                  {animeTitle}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <button className="p-2 hover:bg-secondary/10 rounded-lg transition-colors"><Share2 className="w-5 h-5" /></button>
                <button className="p-2 hover:bg-secondary/10 rounded-lg transition-colors"><Settings className="w-5 h-5" /></button>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-bold">Navigation</h3>
            <Layout className="w-5 h-5 text-gray-400" />
          </div>
          
          <div className="space-y-4">
            {episodeData.nextEpisode && (
              <Link 
                href={`/watch/${episodeData.nextEpisode.episodeId}?anime=${animeId}&title=${encodeURIComponent(animeTitle)}&img=${encodeURIComponent(animeImg)}&source=${source}`}
                className="flex items-center p-4 bg-secondary text-white rounded-xl font-bold text-sm justify-center hover:opacity-90 transition-opacity"
              >
                Next Episode
              </Link>
            )}
            <Link 
              href={`/anime/${animeId}`}
              className="flex items-center p-4 bg-card text-foreground rounded-xl border border-border font-bold text-sm justify-center hover:border-secondary transition-all"
            >
              Back to Episode List
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function WatchPage(props: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-12 h-12 text-secondary animate-spin" />
      </div>
    }>
      <WatchContent paramsPromise={props.params} />
    </Suspense>
  );
}
