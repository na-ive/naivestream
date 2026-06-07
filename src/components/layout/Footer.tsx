import React from 'react';
import Link from 'next/link';

export function Footer() {
  return (
    <footer className="w-full border-t-2 border-secondary/20 bg-background relative overflow-hidden">
      {/* A-Z Navigation Bar */}
      <div className="border-b border-secondary/10 bg-card/50 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center gap-1.5 md:gap-2">
            {["ALL", "#", "0-9", ..."ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("")].map((letter) => (
              <Link
                key={letter}
                href={`/az-list?letter=${letter}`}
                className="text-[9px] md:text-[10px] font-black hover:text-secondary transition-colors text-muted-text w-6 h-6 md:w-8 md:h-8 flex items-center justify-center border border-transparent hover:border-secondary/30"
              >
                {letter}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-8 md:space-y-0">
          <div className="flex flex-col items-center md:items-start">
            <span className="text-xl font-serif font-black tracking-tighter text-foreground">
              NAIVE<span className="text-secondary">STREAM</span>
            </span>
            <span className="text-[10px] font-bold text-foreground/50 uppercase tracking-[0.2em] mt-2">
              © {new Date().getFullYear()} NaiveStream
            </span>
          </div>
          
          <div className="flex items-center space-x-12">
            <Link href="/about" className="text-[10px] font-black uppercase tracking-widest text-foreground/50 hover:text-secondary transition-colors">
              About
            </Link>
            <Link href="/privacy" className="text-[10px] font-black uppercase tracking-widest text-foreground/50 hover:text-secondary transition-colors">
              Privacy
            </Link>
            <Link href="/dmca" className="text-[10px] font-black uppercase tracking-widest text-foreground/50 hover:text-secondary transition-colors">
              DMCA
            </Link>
          </div>
          
          <div className="flex flex-col items-center md:items-end">
            <div className="text-[10px] font-bold text-foreground/30 uppercase tracking-tighter">
              Powered by Sanka Vollerei API
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
