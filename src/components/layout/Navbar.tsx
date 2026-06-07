'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Search, Moon, Sun, Menu, X, Cpu } from 'lucide-react';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';

export function Navbar() {
  const [mounted, setMounted] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { theme, setTheme } = useTheme();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
      setIsMenuOpen(false);
    }
  };

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Ongoing', href: '/ongoing' },
    { name: 'Completed', href: '/completed' },
    { name: 'History', href: '/history' },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full bg-background/90 backdrop-blur-xl border-b-2 border-secondary/20 shadow-[0_0_15px_rgba(34,197,94,0.1)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="relative w-12 h-12 bg-black border-2 border-secondary flex items-center justify-center group-hover:shadow-[0_0_15px_rgba(34,197,94,0.5)] transition-all">
               <div className="absolute inset-0 bg-secondary/10 animate-pulse" />
               <Cpu className="text-secondary w-7 h-7 relative z-10" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-serif font-black tracking-tighter text-foreground leading-none">
                NAIVE<span className="text-secondary">STREAM</span>
              </span>
              <span className="text-[10px] font-bold text-secondary tracking-[0.2em] uppercase leading-none mt-1">
                Media System
              </span>
            </div>
          </Link>

          {/* Desktop Search */}
          <div className="hidden lg:flex flex-1 max-w-lg mx-12">
            <form onSubmit={handleSearch} className="relative w-full group">
              <div className="absolute inset-0 bg-secondary/5 -skew-x-12 group-focus-within:bg-secondary/10 transition-colors" />
              <input
                type="text"
                placeholder="EXECUTE SEARCH..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent border-2 border-secondary/20 group-focus-within:border-secondary/50 rounded-none py-3 pl-12 pr-4 focus:outline-none transition-all font-bold text-sm tracking-widest text-secondary placeholder:text-secondary/30"
              />
              <Search className="absolute left-4 top-3.5 text-secondary w-5 h-5" />
            </form>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "text-xs font-bold uppercase tracking-[0.2em] transition-all hover:text-secondary relative group py-2",
                  pathname === link.href ? "text-secondary" : "text-gray-400"
                )}
              >
                {link.name}
                <span className={cn(
                  "absolute bottom-0 left-0 h-[2px] bg-secondary transition-all duration-300",
                  pathname === link.href ? "w-full" : "w-0 group-hover:w-full"
                )} />
              </Link>
            ))}
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-3 bg-black border border-secondary/30 hover:border-secondary text-secondary transition-all"
              aria-label="System mode"
            >
              {!mounted ? (
                <div className="w-5 h-5" />
              ) : theme === 'dark' ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </button>
          </div>

          {/* Mobile Actions */}
          <div className="flex md:hidden items-center space-x-4">
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 text-secondary"
            >
              {theme === 'dark' ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
            </button>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 bg-secondary text-black"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-background/95 backdrop-blur-2xl border-b-2 border-secondary animate-in slide-in-from-top duration-300">
          <div className="px-4 py-8 space-y-6">
            <form onSubmit={handleSearch} className="relative w-full">
              <input
                type="text"
                placeholder="SEARCH_DB..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-black border-2 border-secondary/50 rounded-none py-4 pl-12 pr-4 focus:outline-none text-secondary"
              />
              <Search className="absolute left-4 top-4.5 text-secondary w-5 h-5" />
            </form>
            <div className="grid grid-cols-1 gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={cn(
                    "flex items-center p-5 font-bold uppercase tracking-widest border-l-4 transition-all",
                    pathname === link.href 
                      ? "bg-secondary/10 border-secondary text-secondary" 
                      : "border-transparent text-gray-500"
                  )}
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
