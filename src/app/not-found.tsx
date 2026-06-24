import React from 'react';
import Link from 'next/link';

import { cn } from '@/lib/utils';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center pt-20 pb-20 relative overflow-hidden">
      
      {/* Background Decor */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-20">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-secondary/20 blur-[100px] rounded-full" />
      </div>

      <div className="z-10 px-4 flex flex-col items-center text-center">
        
        {/* 404 Glitch-like display */}
        <div className="relative mb-6">
          <h1 className="text-8xl md:text-[150px] font-black font-serif uppercase tracking-tighter text-foreground/80">
            404
          </h1>
          <div className="absolute top-1/2 -left-4 w-12 h-1 bg-secondary shadow-[0_0_15px_rgba(34,197,94,0.5)]" />
          <div className="absolute bottom-1/4 -right-4 w-8 h-1 bg-secondary shadow-[0_0_15px_rgba(34,197,94,0.5)]" />
        </div>

        {/* Text content */}
        <h2 className="text-2xl md:text-3xl font-black uppercase tracking-widest text-foreground mb-4 flex items-center justify-center">
          <span className="w-2 h-2 bg-secondary mr-3 skew-x-[-15deg]" />
          Signal Lost
          <span className="w-2 h-2 bg-secondary ml-3 skew-x-[-15deg]" />
        </h2>
        
        <p className="text-foreground/60 font-medium max-w-md mx-auto mb-10 text-sm md:text-base">
          The requested data node could not be located within the archive. 
          It may have been moved, deleted, or never existed in the first place.
        </p>

        {/* Action Button */}
        <Link 
          href="/" 
          className={cn(
            "px-8 py-3 bg-card border-2 border-secondary/30 text-secondary hover:border-secondary hover:shadow-[0_0_15px_rgba(34,197,94,0.15)]",
            "font-black uppercase tracking-[0.2em] text-sm transition-all duration-300"
          )}
          style={{ clipPath: 'polygon(10% 0, 100% 0, 100% 70%, 90% 100%, 0 100%, 0 30%)' }}
        >
          Return to Base
        </Link>

      </div>
    </div>
  );
}
