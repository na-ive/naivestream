'use client';

import { useEffect, useState, useTransition } from 'react';
import { getAnomalies, getNoEpisodesAnime, injectMetadata, handleLogout, triggerScraper } from '../actions';
import Link from 'next/link';
import { toast } from 'sonner';
import { useTheme } from 'next-themes';
import { Tooltip } from '@/components/ui/Tooltip';

type Anomaly = {
  id: number;
  slug: string;
  title: string;
  type: string | null;
};

const SCRAPERS = [
  { id: 'scrape:latest', name: 'Scrape Latest', desc: 'Fetch recent episodes from source grid' },
  { id: 'scrape:ongoing', name: 'Scrape Ongoing', desc: 'Synchronize active simulcast transmissions' },
  { id: 'update:metadata', name: 'Update Metadata', desc: 'Align entity records with AniList databanks' },
  { id: 'fill:schedule', name: 'Fill Schedule', desc: 'Refresh global broadcast timetables' },
];

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'unmatched' | 'noEpisodes'>('unmatched');
  const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
  const [noEpisodeAnomalies, setNoEpisodeAnomalies] = useState<Anomaly[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    Promise.all([
      getAnomalies(),
      getNoEpisodesAnime()
    ]).then(([anomaliesData, noEpisodesData]) => {
      setAnomalies(anomaliesData as Anomaly[]);
      setNoEpisodeAnomalies(noEpisodesData as Anomaly[]);
      setIsLoading(false);
    });
  }, []);

  const handleInject = (animeId: number, formData: FormData) => {
    const anilistIdRaw = formData.get('anilistId') as string;
    
    const anilistId = anilistIdRaw ? parseInt(anilistIdRaw, 10) : null;

    if (!anilistId) {
      toast.error('You must provide an AniList ID');
      return;
    }

    startTransition(async () => {
      const result = await injectMetadata(animeId, anilistId);
      if (result.success) {
        toast.success('Metadata injected successfully');
        setAnomalies((prev) => prev.filter(a => a.id !== animeId));
      } else {
        toast.error('Failed to inject: ' + result.error);
      }
    });
  };

  const handleTriggerScraper = (scriptId: string) => {
    startTransition(async () => {
      toast.info(`Initiating process: ${scriptId}...`);
      const result = await triggerScraper(scriptId);
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.error);
      }
    });
  };

  return (
    <div className="min-h-full p-4 md:p-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-12">
        
        {/* Header */}
        <header className="border-b border-border pb-6">
          <h1 className="text-3xl md:text-4xl font-serif uppercase tracking-tighter text-secondary">
            System Operations
          </h1>
          <p className="text-muted-text uppercase tracking-widest text-sm mt-2">
            Manual Override & Backend Telemetry
          </p>
        </header>

        {/* Telemetry / Scraper Controls */}
        <section className="space-y-6">
          <div>
            <h2 className="text-xl font-bold uppercase tracking-wider">Backend Telemetry</h2>
            <p className="text-sm text-muted-text mt-1">Manual invocation of background scraper routines</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {SCRAPERS.map((scraper) => (
              <div key={scraper.id} className="border border-border bg-card p-4 flex flex-col justify-between hover:border-secondary transition-colors">
                <div className="space-y-1 mb-4">
                  <h3 className="font-bold text-sm uppercase tracking-widest text-secondary">{scraper.name}</h3>
                  <p className="text-xs text-muted-text">{scraper.desc}</p>
                </div>
                <button
                  onClick={() => handleTriggerScraper(scraper.id)}
                  disabled={isPending}
                  className="bg-secondary/10 text-secondary border border-secondary/50 hover:bg-secondary hover:text-black px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer w-full"
                >
                  Execute
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Content Section: Anomalies Toggle */}
        <section className="space-y-6">
          <div className="flex justify-between items-end">
            <div>
              <h2 className="text-xl font-bold uppercase tracking-wider">System Anomalies</h2>
              <p className="text-sm text-muted-text mt-1">Review missing parameters and telemetry gaps</p>
            </div>
            <div className="text-xs font-mono bg-card px-3 py-1 border border-border">
              {activeTab === 'unmatched' ? anomalies.length : noEpisodeAnomalies.length} entries found
            </div>
          </div>

          <div className="flex space-x-2 border-b border-border">
            <button
              onClick={() => setActiveTab('unmatched')}
              className={`px-4 py-2 uppercase tracking-widest text-xs font-bold transition-colors border-b-2 ${
                activeTab === 'unmatched'
                  ? 'border-secondary text-secondary bg-secondary/5'
                  : 'border-transparent text-muted-text hover:text-foreground hover:bg-card'
              }`}
            >
              Unmatched Entities
            </button>
            <button
              onClick={() => setActiveTab('noEpisodes')}
              className={`px-4 py-2 uppercase tracking-widest text-xs font-bold transition-colors border-b-2 ${
                activeTab === 'noEpisodes'
                  ? 'border-red-500 text-red-500 bg-red-500/5'
                  : 'border-transparent text-muted-text hover:text-foreground hover:bg-card'
              }`}
            >
              No Episodes
            </button>
          </div>

          {activeTab === 'unmatched' && (
            <div className="overflow-x-auto border border-border bg-card/30 animate-in fade-in duration-300">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-card text-muted-text uppercase tracking-widest text-[11px] border-b border-border">
                  <tr>
                    <th className="px-6 py-4 font-normal">ID / Type</th>
                    <th className="px-6 py-4 font-normal">Source Title (Otakudesu)</th>
                    <th className="px-6 py-4 font-normal text-right">Inject Anilist ID</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {isLoading ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-muted-text font-mono">
                        Scanning databanks...
                      </td>
                    </tr>
                  ) : anomalies.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-secondary font-mono">
                        No anomalies detected. Grid is optimal.
                      </td>
                    </tr>
                  ) : (
                    anomalies.map((anime) => (
                      <tr key={anime.id} className="hover:bg-card/50 transition-colors">
                        <td className="px-6 py-4">
                          <span className="font-mono text-xs text-muted-text mr-2">#{anime.id}</span>
                          <span className="bg-secondary/10 text-secondary border border-secondary/30 px-2 py-0.5 text-[10px] uppercase">
                            {anime.type || 'UNKNOWN'}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-medium max-w-[250px] truncate" title={anime.title}>
                          {anime.title}
                          <div className="text-[10px] text-muted-text font-mono mt-1 truncate">{anime.slug}</div>
                        </td>
                        
                        {/* Inject Form */}
                        <td className="px-6 py-2">
                          <form action={(formData) => handleInject(anime.id, formData)} className="flex items-center justify-end gap-3 w-full">
                            <input 
                              name="anilistId"
                              type="number" 
                              placeholder="Anilist ID" 
                              className="w-28 bg-transparent border border-border px-3 py-1.5 focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary/50 font-mono text-xs [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            />
                            <button 
                              type="submit" 
                              disabled={isPending}
                              className="bg-secondary/10 text-secondary border border-secondary/50 hover:bg-secondary hover:text-black px-4 py-1.5 font-bold uppercase tracking-wider text-[11px] transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                            >
                              Inject
                            </button>
                          </form>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'noEpisodes' && (
            <div className="overflow-x-auto border border-border bg-card/30 animate-in fade-in duration-300">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-card text-muted-text uppercase tracking-widest text-[11px] border-b border-border">
                  <tr>
                    <th className="px-6 py-4 font-normal">ID / Type</th>
                    <th className="px-6 py-4 font-normal">Title (Otakudesu)</th>
                    <th className="px-6 py-4 font-normal text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {isLoading ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-muted-text font-mono">
                        Scanning databanks...
                      </td>
                    </tr>
                  ) : noEpisodeAnomalies.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-secondary font-mono">
                        No anomalies detected. Grid is optimal.
                      </td>
                    </tr>
                  ) : (
                    noEpisodeAnomalies.map((anime) => (
                      <tr key={`noep-${anime.id}`} className="hover:bg-card/50 transition-colors">
                        <td className="px-6 py-4">
                          <span className="font-mono text-xs text-muted-text mr-2">#{anime.id}</span>
                          <span className="bg-secondary/10 text-secondary border border-secondary/30 px-2 py-0.5 text-[10px] uppercase">
                            {anime.type || 'UNKNOWN'}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-medium max-w-[250px] truncate" title={anime.title}>
                          {anime.title}
                          <div className="text-[10px] text-muted-text font-mono mt-1 truncate">{anime.slug}</div>
                        </td>
                        
                        <td className="px-6 py-4 text-right">
                          <span className="text-xs text-red-500 font-bold uppercase tracking-widest bg-red-500/10 px-3 py-1 border border-red-500/20">
                            PENDING FIX
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </section>

      </div>
    </div>
  );
}
