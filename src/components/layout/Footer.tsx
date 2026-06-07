import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

export function Footer() {
  return (
    <footer className="w-full border-t border-secondary/10 bg-background/80 backdrop-blur-xl shadow-[0_-4px_30px_rgba(34,197,94,0.03)] relative overflow-hidden mt-auto">
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
          <div className="flex flex-col items-center md:items-start space-y-3">
            <Link href="/" className="relative w-40 h-8 block">
              <Image
                src="/naivestream_logo.png"
                alt="NaiveStream"
                fill
                sizes="160px"
                className="object-contain grayscale opacity-70 hover:grayscale-0 hover:opacity-100 transition-all duration-300"
              />
            </Link>
            <span className="text-[10px] font-bold text-foreground/50 uppercase tracking-[0.2em]">
              © {new Date().getFullYear()} NaiveStream
            </span>
          </div>

          <div className="flex flex-col items-center md:items-end space-y-4">
            <div className="flex items-center space-x-8">
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
            <div className="text-[10px] font-bold text-foreground/30 uppercase tracking-tighter">
              Powered by Sanka API
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
