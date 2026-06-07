import { AnimeAPI } from "@/lib/api";
import Link from "next/link";
import { FolderGit2, Frown, ChevronRight } from "lucide-react";
import { Pagination } from "@/components/layout/Pagination";

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
      <div className="space-y-4 mb-12">
        <div className="flex items-center space-x-3 text-secondary">
          <FolderGit2 className="w-8 h-8" />
          <h1 className="text-3xl md:text-5xl font-black uppercase">A-Z Index</h1>
        </div>
        <p className="text-muted-text font-bold uppercase tracking-widest text-xs">
          Browse archive by starting letter
        </p>
      </div>

      <div className="mb-12 bg-card border-2 border-secondary/20 p-4">
        <div className="flex flex-wrap gap-2 justify-center">
          {letters.map((letter) => (
            <Link
              key={letter}
              href={`/az-list?letter=${letter}`}
              className={`w-10 h-10 flex items-center justify-center font-bold text-sm transition-all border ${
                currentLetter === letter
                  ? "bg-secondary text-background border-secondary shadow-[0_0_10px_rgba(34,197,94,0.5)]"
                  : "bg-background text-foreground/70 border-secondary/20 hover:border-secondary hover:text-secondary"
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
                className="group p-4 bg-card border border-secondary/10 hover:border-secondary hover:bg-secondary/5 transition-all flex items-center justify-between"
              >
                <span className="font-bold text-sm group-hover:text-secondary line-clamp-1 mr-4">
                  {anime.title}
                </span>
                <ChevronRight className="w-4 h-4 text-muted-text group-hover:text-secondary shrink-0" />
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
