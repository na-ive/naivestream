'use client';

import React, { useEffect } from 'react';
import { cn } from '@/lib/utils';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Optionally log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center pt-20 pb-20 relative overflow-hidden">
      
      {/* Background Decor */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-20">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-danger/20 blur-[100px] rounded-full" />
      </div>

      <div className="z-10 px-4 flex flex-col items-center text-center animate-in fade-in zoom-in-95 duration-500">
        
        {/* Error Glitch-like display */}
        <div className="relative mb-6">
          <h1 className="text-8xl md:text-[120px] font-black font-serif uppercase tracking-tighter text-foreground/80">
            500
          </h1>
          <div className="absolute top-1/2 -left-4 w-12 h-1 bg-danger shadow-[0_0_15px_rgba(239,68,68,0.5)]" />
          <div className="absolute bottom-1/4 -right-4 w-8 h-1 bg-danger shadow-[0_0_15px_rgba(239,68,68,0.5)]" />
        </div>

        {/* Text content */}
        <h2 className="text-2xl md:text-3xl font-black uppercase tracking-widest text-foreground mb-4 flex items-center justify-center">
          <span className="w-2 h-2 bg-danger mr-3 skew-x-[-15deg]" />
          System Failure
          <span className="w-2 h-2 bg-danger ml-3 skew-x-[-15deg]" />
        </h2>
        
        <p className="text-foreground/60 font-medium max-w-md mx-auto mb-10 text-sm md:text-base">
          A critical error occurred while fetching the requested data. The external server might be down or unreachable.
        </p>

        {/* Action Button */}
        <button 
          onClick={() => reset()}
          className={cn(
            "px-8 py-3 bg-card border-2 border-danger/30 text-danger hover:border-danger hover:shadow-[0_0_15px_rgba(239,68,68,0.15)]",
            "font-black uppercase tracking-[0.2em] text-sm transition-all duration-300"
          )}
          style={{ clipPath: 'polygon(10% 0, 100% 0, 100% 70%, 90% 100%, 0 100%, 0 30%)' }}
        >
          Initialize Recovery
        </button>

      </div>
    </div>
  );
}
