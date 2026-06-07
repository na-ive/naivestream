'use client';

import React, { useState, useEffect } from 'react';
import { useHistory } from '@/lib/hooks/useHistory';
import { useWatchlist } from '@/lib/hooks/useWatchlist';
import { AnimeCard } from '@/components/anime/AnimeCard';
import { Bookmark, Clock, Trash2, Play, LayoutGrid, CheckSquare } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { Tooltip } from '@/components/ui/Tooltip';

type TabType = 'watchlist' | 'history';

export default function LibraryPage() {
  const { history, removeFromHistory, removeMultipleFromHistory } = useHistory();
  const { watchlist, removeFromWatchlist, removeMultipleFromWatchlist } = useWatchlist();
  
  const [activeTab, setActiveTab] = useState<TabType>('watchlist');
  const [mounted, setMounted] = useState(false);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    setMounted(true);
    const savedTab = localStorage.getItem('library_active_tab') as TabType;
    if (savedTab === 'history' || savedTab === 'watchlist') {
      setActiveTab(savedTab);
    }
  }, []);

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    localStorage.setItem('library_active_tab', tab);
    setIsSelectionMode(false);
    setSelectedIds([]);
  };

  const toggleSelection = (animeId: string) => {
    setSelectedIds(prev => 
      prev.includes(animeId) ? prev.filter(id => id !== animeId) : [...prev, animeId]
    );
  };

  const handleBulkDelete = () => {
    if (selectedIds.length > 0) {
      if (activeTab === 'watchlist') {
        removeMultipleFromWatchlist(selectedIds);
      } else {
        removeMultipleFromHistory(selectedIds);
      }
      setIsSelectionMode(false);
      setSelectedIds([]);
    }
  };

  if (!mounted) return null; // Avoid hydration mismatch

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header & Tabs */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6 border-b border-white/5 pb-6">
        <div className="space-y-6">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-secondary/10 text-secondary border border-secondary/30 relative">
              <LayoutGrid className="w-8 h-8 relative z-10" />
              <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-secondary" />
              <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-secondary" />
            </div>
            <div className="flex flex-col">
              <span className="text-secondary font-mono font-black text-xl leading-none mb-1">{'//'} MY LIBRARY</span>
              <h1 className="text-4xl md:text-5xl font-serif font-black uppercase tracking-tighter">
                {activeTab === 'watchlist' ? 'Watchlist' : 'History'}
                <span className="text-secondary">_</span>
              </h1>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={() => handleTabChange('watchlist')}
              className={cn(
                "flex items-center space-x-2 px-6 py-2.5 transition-all text-xs uppercase font-black tracking-widest relative overflow-hidden group",
                activeTab === 'watchlist' 
                  ? "bg-secondary/10 text-secondary border border-secondary/50 shadow-[0_0_15px_rgba(34,197,94,0.1)]" 
                  : "bg-card/50 text-muted-text border border-white/5 hover:border-secondary/30 hover:text-foreground"
              )}
            >
              <div className={cn(
                "absolute bottom-0 left-0 h-1 w-full transition-all",
                activeTab === 'watchlist' ? "bg-secondary scale-x-100" : "bg-secondary scale-x-0 group-hover:scale-x-100"
              )} />
              <Bookmark className="w-4 h-4" />
              <span>Watchlist</span>
            </button>
            <button 
              onClick={() => handleTabChange('history')}
              className={cn(
                "flex items-center space-x-2 px-6 py-2.5 transition-all text-xs uppercase font-black tracking-widest relative overflow-hidden group",
                activeTab === 'history' 
                  ? "bg-secondary/10 text-secondary border border-secondary/50 shadow-[0_0_15px_rgba(34,197,94,0.1)]" 
                  : "bg-card/50 text-muted-text border border-white/5 hover:border-secondary/30 hover:text-foreground"
              )}
            >
              <div className={cn(
                "absolute bottom-0 left-0 h-1 w-full transition-all",
                activeTab === 'history' ? "bg-secondary scale-x-100" : "bg-secondary scale-x-0 group-hover:scale-x-100"
              )} />
              <Clock className="w-4 h-4" />
              <span>History</span>
            </button>
          </div>
        </div>
        
        {/* Bulk Action Controls */}
        {((activeTab === 'watchlist' && watchlist.length > 0) || (activeTab === 'history' && history.length > 0)) && (
          <div className="flex items-center space-x-3">
            {isSelectionMode ? (
              <>
                <button 
                  onClick={handleBulkDelete}
                  disabled={selectedIds.length === 0}
                  className={cn(
                    "flex items-center space-x-2 px-6 py-2.5 transition-all font-black text-[10px] uppercase tracking-[0.2em]",
                    selectedIds.length > 0
                      ? "bg-red-500 hover:bg-red-600 text-white shadow-[0_0_15px_rgba(239,68,68,0.3)]"
                      : "bg-card/50 text-muted-text cursor-not-allowed"
                  )}
                  style={{ clipPath: 'polygon(6px 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%, 0 6px)' }}
                >
                  <Trash2 className="w-4 h-4 shrink-0" />
                  <span>Delete Selected ({selectedIds.length})</span>
                </button>
                <button 
                  onClick={() => {
                    setIsSelectionMode(false);
                    setSelectedIds([]);
                  }}
                  className="px-6 py-2.5 bg-card/80 border border-white/10 hover:border-white/30 text-foreground transition-all font-black text-[10px] uppercase tracking-[0.2em]"
                  style={{ clipPath: 'polygon(6px 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%, 0 6px)' }}
                >
                  Cancel
                </button>
              </>
            ) : (
              <>
                {activeTab === 'history' && history.length > 0 && (
                  <Tooltip content="Irreversible Action" position="bottom" className="!border-red-500 !text-red-500 !shadow-[0_0_15px_rgba(239,68,68,0.2)]">
                    <button 
                      onClick={() => {
                      if (confirm('Clear all history?')) {
                        localStorage.removeItem('anime_history');
                        window.dispatchEvent(new Event('history_updated'));
                        toast.error('History Cleared', {
                          description: 'All your watch history has been permanently removed.',
                          icon: <div className="w-8 h-8 bg-red-500/10 border border-red-500 flex items-center justify-center shrink-0 mr-3 shadow-[0_0_10px_rgba(239,68,68,0.3)]"><Trash2 className="w-5 h-5 text-red-500" /></div>,
                        });
                      }
                    }}
                    className="flex items-center space-x-2 px-6 py-2.5 bg-red-100 dark:bg-red-950/50 text-red-600 dark:text-red-500 border border-red-300 dark:border-red-900/50 hover:bg-red-200 dark:hover:bg-red-900/80 transition-all font-black text-[10px] uppercase tracking-[0.2em]"
                    style={{ clipPath: 'polygon(6px 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%, 0 6px)' }}
                  >
                    <Trash2 className="w-4 h-4 shrink-0" />
                    <span>Clear All</span>
                    </button>
                  </Tooltip>
                )}
                <Tooltip content="Select multiple items for bulk deletion" position="bottom">
                  <button 
                    onClick={() => setIsSelectionMode(true)}
                    className="flex items-center space-x-2 px-6 py-2.5 bg-secondary text-background hover:bg-secondary/90 transition-all font-black text-[10px] uppercase tracking-[0.2em] shadow-[0_0_15px_rgba(34,197,94,0.3)] hover:shadow-[0_0_25px_rgba(34,197,94,0.5)]"
                    style={{ clipPath: 'polygon(6px 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%, 0 6px)' }}
                  >
                    <CheckSquare className="w-4 h-4" />
                    <span>Select Items</span>
                  </button>
                </Tooltip>
              </>
            )}
          </div>
        )}
      </div>

      {/* Content Area */}
      <div className="mt-8">
        {/* Watchlist View */}
        {activeTab === 'watchlist' && (
          watchlist.length === 0 ? (
            <EmptyState 
              icon={Bookmark} 
              title="Watchlist is empty" 
              subtitle="Save anime to watch later" 
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {watchlist.map((item) => (
                <div 
                  key={item.animeId} 
                  className={cn(
                    "relative transition-all duration-300",
                    !isSelectionMode && "group",
                    isSelectionMode && "group/sel cursor-pointer hover:scale-[1.02] hover:z-10",
                    isSelectionMode && selectedIds.includes(item.animeId) ? "ring-2 ring-secondary ring-offset-4 ring-offset-background scale-[1.02]" : ""
                  )}
                  onClick={() => {
                    if (isSelectionMode) toggleSelection(item.animeId);
                  }}
                >
                  <div className={cn("transition-all duration-300", isSelectionMode ? "pointer-events-none opacity-50 group-hover/sel:opacity-80" : "")}>
                    <AnimeCard
                      id={item.animeId}
                      title={item.animeTitle}
                      image={item.animeImage}
                      hideBookmark={true}
                      disableHover={isSelectionMode}
                    />
                  </div>

                  {/* Selection Overlay */}
                  {isSelectionMode && (
                    <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/20">
                      <div className={cn(
                        "w-12 h-12 flex items-center justify-center border-2 transition-all duration-300",
                        selectedIds.includes(item.animeId) 
                          ? "bg-secondary border-secondary text-background shadow-[0_0_15px_rgba(34,197,94,0.5)]" 
                          : "border-white/50 text-white/50 bg-black/50 group-hover/sel:border-secondary/50 group-hover/sel:text-secondary/50"
                      )}
                      style={{ clipPath: 'polygon(4px 0, 100% 0, 100% calc(100% - 4px), calc(100% - 4px) 100%, 0 100%, 0 4px)' }}>
                        <CheckSquare className={cn("w-6 h-6", selectedIds.includes(item.animeId) ? "fill-current" : "")} />
                      </div>
                    </div>
                  )}

                  {!isSelectionMode && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFromWatchlist(item.animeId);
                      }}
                      className="absolute top-2 right-2 z-20 w-8 h-8 bg-red-500/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 border border-white/10"
                      title="Remove from Watchlist"
                      style={{ clipPath: 'polygon(5px 0, 100% 0, 100% calc(100% - 5px), calc(100% - 5px) 100%, 0 100%, 0 5px)' }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )
        )}

        {/* History View */}
        {activeTab === 'history' && (
          history.length === 0 ? (
            <EmptyState 
              icon={Clock} 
              title="No history detected" 
              subtitle="Start watching to track progress" 
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {history.map((item) => (
                <div 
                  key={item.animeId} 
                  className={cn(
                    "relative transition-all duration-300",
                    !isSelectionMode && "group",
                    isSelectionMode && "group/sel cursor-pointer hover:scale-[1.02] hover:z-10",
                    isSelectionMode && selectedIds.includes(item.animeId) ? "ring-2 ring-secondary ring-offset-4 ring-offset-background scale-[1.02]" : ""
                  )}
                  onClick={() => {
                    if (isSelectionMode) toggleSelection(item.animeId);
                  }}
                >
                  <div className={cn("transition-all duration-300", isSelectionMode ? "pointer-events-none opacity-50 group-hover/sel:opacity-80" : "")}>
                    <AnimeCard
                      id={item.animeId}
                      title={item.animeTitle}
                      image={item.animeImage}
                      hideBookmark={true}
                      disableHover={isSelectionMode}
                    />
                    
                    <div className="mt-3 p-3 bg-card border border-secondary/10 group-hover:border-secondary/30 transition-all relative">
                      <div className="absolute inset-0 bg-gradient-to-t from-secondary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                      <p className="text-[9px] text-muted-text font-black uppercase tracking-[0.2em] mb-1.5">
                        Resume Point
                      </p>
                      <Link 
                        href={`/watch/${item.lastEpisodeId}?anime=${item.animeId}&title=${encodeURIComponent(item.animeTitle)}&img=${encodeURIComponent(item.animeImage)}`}
                        className="flex items-center justify-between group/ep"
                        onClick={(e) => {
                          if (isSelectionMode) e.preventDefault();
                        }}
                      >
                        <span className="text-[11px] font-bold truncate pr-3 group-hover/ep:text-secondary transition-colors uppercase tracking-widest leading-relaxed">
                          {item.lastEpisodeTitle}
                        </span>
                        <div className="w-6 h-6 bg-secondary/10 flex items-center justify-center group-hover/ep:bg-secondary/20 transition-colors shrink-0">
                          <Play className="w-3 h-3 text-secondary fill-current" />
                        </div>
                      </Link>
                    </div>
                  </div>

                  {/* Selection Overlay */}
                  {isSelectionMode && (
                    <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/20">
                      <div className={cn(
                        "w-12 h-12 flex items-center justify-center border-2 transition-all duration-300",
                        selectedIds.includes(item.animeId) 
                          ? "bg-secondary border-secondary text-background shadow-[0_0_15px_rgba(34,197,94,0.5)]" 
                          : "border-white/50 text-white/50 bg-black/50 group-hover/sel:border-secondary/50 group-hover/sel:text-secondary/50"
                      )}
                      style={{ clipPath: 'polygon(4px 0, 100% 0, 100% calc(100% - 4px), calc(100% - 4px) 100%, 0 100%, 0 4px)' }}>
                        <CheckSquare className={cn("w-6 h-6", selectedIds.includes(item.animeId) ? "fill-current" : "")} />
                      </div>
                    </div>
                  )}

                  {/* Delete Button (Top Right) */}
                  {!isSelectionMode && (
                    <div className="absolute top-2 right-2 md:top-3 md:right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <Tooltip content="Remove Item" position="left" className="!border-red-500 !text-red-500">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeFromHistory(item.animeId);
                          }}
                          className="p-1.5 md:p-2 bg-red-500/10 text-red-500 border border-red-500/50 hover:bg-red-500 hover:text-white transition-all shadow-[0_0_10px_rgba(239,68,68,0.2)] hover:shadow-[0_0_15px_rgba(239,68,68,0.5)] z-20"
                          style={{ clipPath: 'polygon(4px 0, 100% 0, 100% calc(100% - 4px), calc(100% - 4px) 100%, 0 100%, 0 4px)' }}
                        >
                          <Trash2 className="w-4 h-4 md:w-5 md:h-5" />
                        </button>
                      </Tooltip>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
}

function EmptyState({ icon: Icon, title, subtitle }: { icon: any, title: string, subtitle: string }) {
  return (
    <div 
      className="flex flex-col items-center justify-center py-20 space-y-6 text-center bg-card/30 border-y border-secondary/20 relative"
      style={{ clipPath: 'polygon(30px 0, 100% 0, 100% calc(100% - 30px), calc(100% - 30px) 100%, 0 100%, 0 30px)' }}
    >
      <div 
        className="w-20 h-20 bg-card flex items-center justify-center shadow-[0_0_20px_rgba(34,197,94,0.15)] border border-secondary/30"
        style={{ clipPath: 'polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)' }}
      >
        <Icon className="w-10 h-10 text-foreground/20" />
      </div>
      <div className="space-y-2">
        <h2 className="text-xl font-bold uppercase">{title}</h2>
        <p className="text-foreground/40 text-[10px] font-bold uppercase tracking-widest">{subtitle}</p>
      </div>
      <Link href="/" className="btn-primary mt-4 inline-block">
        Browse Anime
      </Link>
    </div>
  );
}
