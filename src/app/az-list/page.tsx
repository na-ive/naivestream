import { Metadata } from 'next';
import { AnimeAPI } from "@/lib/api";
import Link from "next/link";
import { FolderGit2, Frown, ChevronRight } from "lucide-react";
import { Pagination } from "@/components/layout/Pagination";

export const metadata: Metadata = {
  title: 'A-Z List - NaiveStream',
  description: 'Browse all anime from A to Z.',
};

export default async function AZListPage(props: { searchParams: Promise<{ letter?: string, page?: string }> }) {
  const searchParams = await props.searchParams;
  const currentLetter = searchParams.letter || "ALL";
  const currentPage = parseInt(searchParams.page || "1", 10);
  const itemsPerPage = 30;

  const res = await AnimeAPI.otakudesu.getAZList();
  const rawList = res?.data?.list || [];
  
  // Process data to merge 0-9
  let processedData: any[] = [];
  
  if (currentLetter === "ALL") {
    // Flatten all anime into one list
    rawList.forEach((group: any) => {
      processedData = [...processedData, ...group.animeList];
    });
  } else if (currentLetter === "0-9") {
    rawList.forEach((group: any) => {
      if (["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"].includes(group.startWith)) {
        processedData = [...processedData, ...group.animeList];
      }
    });
  } else {
    const group = rawList.find((g: any) => g.startWith.toUpperCase() === currentLetter.toUpperCase());
    if (group) {
      processedData = [...group.animeList];
    }
  }

  // Pagination logic
  const totalItems = processedData.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = processedData.slice(startIndex, startIndex + itemsPerPage);

  const letters = ["ALL", "#", "0-9", ..."ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("")];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-12">
        <div className="flex items-center space-x-4 mb-6">
          <div className="p-3 bg-secondary/10 text-secondary border border-secondary/30 relative">
            <FolderGit2 className="w-8 h-8 relative z-10" />
            <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-secondary" />
            <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-secondary" />
          </div>
          <h1 className="text-4xl md:text-5xl font-serif font-black uppercase tracking-tighter">A-Z Index<span className="text-secondary">_</span></h1>
        </div>
        
        <div className="inline-block px-6 py-3 bg-card/80 border-l-4 border-secondary/50 shadow-lg relative overflow-hidden"
             style={{ clipPath: 'polygon(0 0, 100% 0, calc(100% - 15px) 100%, 0 100%)' }}>
          <div className="absolute inset-0 bg-gradient-to-r from-secondary/10 to-transparent pointer-events-none" />
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-foreground/80 relative z-10">
            Browse archive by starting letter
          </p>
        </div>
      </div>

      <div 
        className="mb-12 bg-card/50 border-y border-secondary/30 p-6 relative"
        style={{ clipPath: 'polygon(20px 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%, 0 20px)' }}
      >
        <div className="flex flex-wrap gap-2 justify-center relative z-10">
          {letters.map((letter) => (
            <Link
              key={letter}
              href={`/az-list?letter=${letter}`}
              className={`w-10 h-10 flex items-center justify-center font-bold text-sm transition-all ${
                currentLetter === letter
                  ? "bg-secondary text-background shadow-[0_0_15px_rgba(34,197,94,0.4)]"
                  : "bg-background/80 text-foreground/70 hover:bg-secondary/20 hover:text-secondary border border-secondary/20 hover:border-secondary/50"
              }`}
            >
              {letter}
            </Link>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between mb-8 border-b-2 border-secondary/20 pb-4">
        <span className="text-sm font-bold text-muted-text uppercase tracking-widest">
          Showing {totalItems} titles for "{currentLetter}"
        </span>
      </div>

      {paginatedData.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {paginatedData.map((anime: any, idx: number) => (
              <Link
                key={`${anime.animeId}-${idx}`}
                href={`/anime/${anime.animeId}`}
                className="group p-4 bg-background/30 hover:bg-secondary/10 border-b border-white/5 transition-all flex items-center justify-between relative overflow-hidden"
              >
                <div className="absolute inset-y-0 left-0 w-1 bg-secondary scale-y-0 group-hover:scale-y-100 transition-transform origin-top" />
                <span className="font-bold text-sm group-hover:text-secondary line-clamp-1 mr-4 uppercase tracking-wider transition-colors pl-2">
                  {anime.title}
                </span>
                <ChevronRight className="w-4 h-4 text-muted-text group-hover:text-secondary shrink-0 transition-transform group-hover:translate-x-1" />
              </Link>
            ))}
          </div>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            baseUrl={`/az-list?letter=${currentLetter}`}
          />
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 border-2 border-dashed border-secondary/20 bg-card">
          <Frown className="w-12 h-12 text-muted-text" />
          <p className="text-muted-text font-bold uppercase tracking-widest text-xs">
            No entries found for this letter.
          </p>
        </div>
      )}
    </div>
  );
}
