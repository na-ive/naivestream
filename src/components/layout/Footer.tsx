import React from 'react';
import Link from 'next/link';

export function Footer() {
  return (
    <footer className="w-full border-t-2 border-secondary/20 bg-background/80 backdrop-blur-xl py-12 relative overflow-hidden">
      {/* Decorative scanline for footer */}
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-secondary/40 to-transparent" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-8 md:space-y-0">
          <div className="flex flex-col items-center md:items-start">
            <div className="flex items-center space-x-2">
              <span className="text-xl font-serif font-black tracking-tighter text-foreground">
                NAIVE<span className="text-secondary">STREAM</span>
              </span>
            </div>
            <span className="text-[10px] font-bold text-secondary uppercase tracking-[0.3em] mt-2">
              © {new Date().getFullYear()} // DECENTRALIZED_MEDIA_CORE
            </span>
          </div>
          
          <div className="flex items-center space-x-12">
            <Link href="/about" className="text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-secondary transition-colors">
              [ PROTOCOL ]
            </Link>
            <Link href="/privacy" className="text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-secondary transition-colors">
              [ SECURITY ]
            </Link>
            <Link href="/dmca" className="text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-secondary transition-colors">
              [ LEGAL ]
            </Link>
          </div>
          
          <div className="flex flex-col items-center md:items-end">
            <div className="text-[10px] font-black text-secondary/60 uppercase tracking-[0.2em]">
              UPLINK_STATUS: <span className="text-secondary animate-pulse">ESTABLISHED</span>
            </div>
            <div className="text-[10px] font-bold text-gray-600 mt-1 uppercase tracking-tighter">
              Powered by Sanka Vollerei API
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
