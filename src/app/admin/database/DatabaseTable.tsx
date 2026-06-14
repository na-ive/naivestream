'use client';

import { useState, useTransition, useEffect } from 'react';
import { updateAnimeMapping } from '../actions';
import { toast } from 'sonner';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Search, ChevronDown, ChevronUp, Renew, Checkmark, Close, ChevronLeft, ChevronRight } from '@carbon/icons-react';

type AnimeRow = {
  id: number;
  slug: string;
  title: string;
  source: string;
  mal_id: number | null;
  anilist_id: number | null;
  is_fully_scraped: number;
  last_updated: string;
};

interface DatabaseTableProps {
  initialData: AnimeRow[];
  total: number;
  totalPages: number;
  currentPage: number;
  currentSearch: string;
  currentSort: string;
  currentOrder: string;
}

export function DatabaseTable({ 
  initialData, 
  total, 
  totalPages, 
  currentPage, 
  currentSearch, 
  currentSort, 
  currentOrder 
}: DatabaseTableProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [searchValue, setSearchValue] = useState(currentSearch);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editValues, setEditValues] = useState<{malId: string, anilistId: string}>({ malId: '', anilistId: '' });

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchValue !== currentSearch) {
        updateQuery({ search: searchValue, page: 1 });
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchValue]);

  const updateQuery = (updates: Record<string, string | number>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        params.set(key, String(value));
      } else {
        params.delete(key);
      }
    });
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleSort = (column: string) => {
    const isAsc = currentSort === column && currentOrder === 'asc';
    updateQuery({ sort: column, order: isAsc ? 'desc' : 'asc' });
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      updateQuery({ page: newPage });
    }
  };

  const startEditing = (anime: AnimeRow) => {
    setEditingId(anime.id);
    setEditValues({
      malId: anime.mal_id ? String(anime.mal_id) : '',
      anilistId: anime.anilist_id ? String(anime.anilist_id) : '',
    });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditValues({ malId: '', anilistId: '' });
  };

  const saveMapping = (id: number, resync: boolean) => {
    const malIdParsed = editValues.malId ? parseInt(editValues.malId, 10) : null;
    const anilistIdParsed = editValues.anilistId ? parseInt(editValues.anilistId, 10) : null;

    startTransition(async () => {
      const result = await updateAnimeMapping(id, malIdParsed, anilistIdParsed, resync);
      if (result.success) {
        toast.success(`Mapping saved${resync ? ' & resync triggered' : ''}`);
        setEditingId(null);
      } else {
        toast.error(`Error: ${result.error}`);
      }
    });
  };

  const renderSortIcon = (column: string) => {
    if (currentSort !== column) return <div className="w-4 h-4 opacity-0 group-hover:opacity-30"><ChevronDown /></div>;
    return currentOrder === 'asc' ? <ChevronUp className="w-4 h-4 text-secondary" /> : <ChevronDown className="w-4 h-4 text-secondary" />;
  };

  return (
    <div className="space-y-6">
      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-card border border-border p-4">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-text" />
          <input 
            type="text" 
            placeholder="Search by Title or Slug..." 
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="w-full bg-background border border-border pl-10 pr-4 py-2 text-sm font-mono text-foreground focus:outline-none focus:border-secondary transition-colors placeholder:text-muted-text"
          />
        </div>
        <div className="text-xs font-mono text-muted-text">
          Showing <span className="text-secondary font-black">{initialData.length}</span> of {total} entries
        </div>
      </div>

      {/* Data Table */}
      <div className="overflow-x-auto border border-border bg-card/30">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-card text-muted-text uppercase tracking-widest text-[11px] border-b border-border">
            <tr>
              <th className="px-4 py-3 font-normal cursor-pointer hover:text-foreground group" onClick={() => handleSort('id')}>
                <div className="flex items-center gap-2">ID {renderSortIcon('id')}</div>
              </th>
              <th className="px-4 py-3 font-normal cursor-pointer hover:text-foreground group" onClick={() => handleSort('title')}>
                <div className="flex items-center gap-2">Title / Slug {renderSortIcon('title')}</div>
              </th>
              <th className="px-4 py-3 font-normal cursor-pointer hover:text-foreground group" onClick={() => handleSort('source')}>
                <div className="flex items-center gap-2">Source {renderSortIcon('source')}</div>
              </th>
              <th className="px-4 py-3 font-normal cursor-pointer hover:text-foreground group" onClick={() => handleSort('mal_id')}>
                <div className="flex items-center gap-2">MAL ID {renderSortIcon('mal_id')}</div>
              </th>
              <th className="px-4 py-3 font-normal cursor-pointer hover:text-foreground group" onClick={() => handleSort('anilist_id')}>
                <div className="flex items-center gap-2">AniList ID {renderSortIcon('anilist_id')}</div>
              </th>
              <th className="px-4 py-3 font-normal cursor-pointer hover:text-foreground group" onClick={() => handleSort('last_updated')}>
                <div className="flex items-center gap-2">Last Updated {renderSortIcon('last_updated')}</div>
              </th>
              <th className="px-4 py-3 font-normal text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {initialData.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-muted-text font-mono">
                  No records found matching your query.
                </td>
              </tr>
            ) : (
              initialData.map((anime) => {
                const isEditing = editingId === anime.id;
                
                return (
                  <tr key={anime.id} className="hover:bg-card/50 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-muted-text">#{anime.id}</td>
                    <td className="px-4 py-3 font-medium max-w-[300px] truncate" title={anime.title}>
                      <div className="flex flex-col">
                        <span className="truncate">{anime.title}</span>
                        <span className="text-[10px] text-muted-text font-mono mt-0.5 truncate">{anime.slug}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="bg-foreground/5 text-foreground px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider border border-border">
                        {anime.source}
                      </span>
                    </td>
                    
                    {/* MAL ID COLUMN */}
                    <td className="px-4 py-3">
                      {isEditing ? (
                        <input 
                          type="number" 
                          value={editValues.malId}
                          onChange={(e) => setEditValues({...editValues, malId: e.target.value})}
                          placeholder="Empty"
                          className="w-24 bg-background border border-secondary/50 px-2 py-1 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-secondary [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                      ) : (
                        <span className={`font-mono text-xs ${anime.mal_id ? 'text-secondary' : 'text-red-500'}`}>
                          {anime.mal_id || 'NULL'}
                        </span>
                      )}
                    </td>

                    {/* ANILIST ID COLUMN */}
                    <td className="px-4 py-3">
                      {isEditing ? (
                        <input 
                          type="number" 
                          value={editValues.anilistId}
                          onChange={(e) => setEditValues({...editValues, anilistId: e.target.value})}
                          placeholder="Empty"
                          className="w-24 bg-background border border-secondary/50 px-2 py-1 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-secondary [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                      ) : (
                        <span className={`font-mono text-xs ${anime.anilist_id ? 'text-secondary' : 'text-red-500'}`}>
                          {anime.anilist_id || 'NULL'}
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-3 text-xs text-muted-text font-mono">
                      {new Date(anime.last_updated).toISOString().replace('T', ' ').substring(0, 19)}
                    </td>

                    {/* ACTIONS COLUMN */}
                    <td className="px-4 py-3 text-right">
                      {isEditing ? (
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={cancelEditing}
                            className="p-1.5 text-muted-text hover:text-foreground bg-foreground/5 hover:bg-foreground/20 transition-colors border border-transparent hover:border-border"
                            title="Cancel"
                          >
                            <Close className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => saveMapping(anime.id, false)}
                            disabled={isPending}
                            className="p-1.5 text-secondary bg-secondary/10 hover:bg-secondary hover:text-black transition-colors border border-secondary/30 disabled:opacity-50"
                            title="Save Mapping"
                          >
                            <Checkmark className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => saveMapping(anime.id, true)}
                            disabled={isPending}
                            className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-secondary bg-secondary/10 hover:bg-secondary hover:text-black transition-colors border border-secondary/30 flex items-center gap-1 disabled:opacity-50"
                            title="Save & Trigger Resync Scraper"
                          >
                            <Renew className="w-3.5 h-3.5" /> Save & Sync
                          </button>
                        </div>
                      ) : (
                        <button 
                          onClick={() => startEditing(anime)}
                          className="text-[10px] uppercase font-bold tracking-widest text-muted-text hover:text-secondary px-3 py-1.5 border border-border hover:border-secondary/50 transition-colors bg-card"
                        >
                          EDIT ID
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center bg-card border border-border p-4">
          <button 
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1 || isPending}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider border border-border hover:border-secondary hover:text-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4" /> Prev
          </button>
          
          <div className="text-xs font-mono text-muted-text">
            Page <span className="text-foreground">{currentPage}</span> of {totalPages}
          </div>

          <button 
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages || isPending}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider border border-border hover:border-secondary hover:text-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Next <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
