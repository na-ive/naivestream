'use client';

import Link from 'next/link';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  baseUrl: string;
}

export function Pagination({ currentPage, totalPages, baseUrl }: PaginationProps) {
  if (totalPages <= 1) return null;

  // Logic to show page numbers (e.g., 2 before and 2 after)
  const delta = 2;
  const range = [];
  const rangeWithDots = [];
  let l;

  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= currentPage - delta && i <= currentPage + delta)) {
      range.push(i);
    }
  }

  for (const i of range) {
    if (l) {
      if (i - l === 2) {
        rangeWithDots.push(l + 1);
      } else if (i - l !== 1) {
        rangeWithDots.push('...');
      }
    }
    rangeWithDots.push(i);
    l = i;
  }

  const getHref = (page: number) => `${baseUrl}?page=${page}`;

  return (
    <div className="flex flex-col items-center space-y-6 py-16">
      <div className="flex items-center gap-1 sm:gap-2">
        {/* First Page */}
        <Link
          href={getHref(1)}
          className={cn(
            "p-2 rounded-xl bg-card border border-border transition-all",
            currentPage <= 1 ? "opacity-50 pointer-events-none" : "hover:border-secondary hover:text-secondary"
          )}
          aria-label="First page"
        >
          <ChevronsLeft className="w-5 h-5" />
        </Link>

        {/* Previous */}
        <Link
          href={getHref(Math.max(1, currentPage - 1))}
          className={cn(
            "p-2 rounded-xl bg-card border border-border transition-all",
            currentPage <= 1 ? "opacity-50 pointer-events-none" : "hover:border-secondary hover:text-secondary"
          )}
          aria-label="Previous page"
        >
          <ChevronLeft className="w-5 h-5" />
        </Link>

        <div className="flex items-center bg-card border border-border rounded-2xl p-1 sm:px-2">
          {rangeWithDots.map((p, idx) => {
            if (p === '...') {
              return (
                <div key={`dot-${idx}`} className="w-9 h-9 sm:w-11 sm:h-11 flex items-center justify-center text-gray-500">
                  <MoreHorizontal className="w-4 h-4" />
                </div>
              );
            }

            const pageNum = p as number;
            return (
              <Link
                key={`page-${pageNum}`}
                href={getHref(pageNum)}
                className={cn(
                  "w-9 h-9 sm:w-11 sm:h-11 flex items-center justify-center rounded-xl text-sm font-bold transition-all",
                  currentPage === pageNum
                    ? "bg-secondary text-white shadow-lg shadow-secondary/30 scale-110 z-10"
                    : "hover:bg-secondary/10"
                )}
              >
                {pageNum}
              </Link>
            );
          })}
        </div>

        {/* Next */}
        <Link
          href={getHref(Math.min(totalPages, currentPage + 1))}
          className={cn(
            "p-2 rounded-xl bg-card border border-border transition-all",
            currentPage >= totalPages ? "opacity-50 pointer-events-none" : "hover:border-secondary hover:text-secondary"
          )}
          aria-label="Next page"
        >
          <ChevronRight className="w-5 h-5" />
        </Link>

        {/* Last Page */}
        <Link
          href={getHref(totalPages)}
          className={cn(
            "p-2 rounded-xl bg-card border border-border transition-all",
            currentPage >= totalPages ? "opacity-50 pointer-events-none" : "hover:border-secondary hover:text-secondary"
          )}
          aria-label="Last page"
        >
          <ChevronsRight className="w-5 h-5" />
        </Link>
      </div>
      
      <div className="flex items-center space-x-2 text-xs font-medium uppercase tracking-widest text-gray-500">
        <span>Page {currentPage} of {totalPages}</span>
      </div>
    </div>
  );
}
