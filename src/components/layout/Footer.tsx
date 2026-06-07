import React from 'react';
import Link from 'next/link';

export function Footer() {
  return (
    <footer className="w-full border-t border-border bg-card py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-6 md:space-y-0">
          <div className="flex items-center space-x-2">
            <span className="text-lg font-bold tracking-tighter text-foreground">
              Anime<span className="text-secondary">Stream</span>
            </span>
            <span className="text-sm text-gray-500">© {new Date().getFullYear()}</span>
          </div>
          
          <div className="flex items-center space-x-8">
            <Link href="/about" className="text-sm text-gray-500 hover:text-secondary transition-colors">
              About
            </Link>
            <Link href="/privacy" className="text-sm text-gray-500 hover:text-secondary transition-colors">
              Privacy
            </Link>
            <Link href="/dmca" className="text-sm text-gray-500 hover:text-secondary transition-colors">
              DMCA
            </Link>
          </div>
          
          <div className="text-sm text-gray-500">
            Powered by Sanka Vollerei API
          </div>
        </div>
      </div>
    </footer>
  );
}
