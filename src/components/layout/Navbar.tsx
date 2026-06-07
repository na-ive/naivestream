'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Search, Moon, Sun, Menu, X, Play } from 'lucide-react';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';

export function Navbar() {
  const [mounted, setMounted] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { theme, setTheme } = useTheme();
  const pathname = usePathname();
  const router = useRouter();

  // Handle mounting on client to avoid hydration mismatch
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
    <nav className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur-xl border-b-2 border-secondary/20 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="relative w-10 h-10 bg-secondary flex items-center justify-center transition-all shadow-[0_0_10px_rgba(34,197,94,0.3)]">
               <Play className="text-background fill-current w-5 h-5 relative z-10" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-serif font-black tracking-tighter text-foreground leading-none">
                NAIVE<span className="text-secondary">STREAM</span>
              </span>
            </div>
          </Link>

          {/* Desktop Search */}
          <div className="hidden lg:flex flex-1 max-w-lg mx-12">
            <form onSubmit={handleSearch} className="relative w-full group">
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-card border-2 border-secondary/20 focus:border-secondary rounded-none py-2.5 pl-12 pr-4 focus:outline-none transition-all font-bold text-sm tracking-widest text-foreground placeholder:text-muted-foreground"
              />
              <Search className="absolute left-4 top-3 text-secondary w-5 h-5" />
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
                  pathname === link.href ? "text-secondary" : "text-foreground/70"
                )}
              >
                {link.name}
                <span className={cn(
                  "absolute bottom-0 left-0 h-[2px] bg-secondary transition-all duration-300",
                  pathname === link.href ? "w-full" : "w-0 group-hover:w-full"
                )} />
              </Link>
            ))}
            
            {/* Theme Toggle with mounting check */}
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2.5 rounded-none border border-secondary/30 hover:border-secondary text-secondary transition-all cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center"
              aria-label="Toggle theme"
            >
              {mounted ? (
                theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />
              ) : (
                <div className="w-5 h-5" /> // Empty placeholder to prevent mismatch
              )}
            </button>
          </div>

          {/* Mobile Actions */}
          <div className="flex md:hidden items-center space-x-4">
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 text-secondary cursor-pointer"
            >
              {mounted ? (
                theme === 'dark' ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />
              ) : (
                <div className="w-6 h-6" />
              )}
            </button>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 bg-secondary text-background cursor-pointer"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-background border-b-2 border-secondary/30 animate-in slide-in-from-top duration-300">
          <div className="px-4 py-8 space-y-6">
            <form onSubmit={handleSearch} className="relative w-full">
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-card border-2 border-secondary/30 rounded-none py-4 pl-12 pr-4 focus:outline-none text-foreground"
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
                      : "border-transparent text-foreground/50"
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
