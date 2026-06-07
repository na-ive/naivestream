'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { Search, Moon, Sun, Menu, X, Play, ChevronDown } from 'lucide-react';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import { Tooltip } from '@/components/ui/Tooltip';

export function Navbar() {
  const [mounted, setMounted] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);
  const { theme, setTheme } = useTheme();
  const pathname = usePathname();
  const router = useRouter();

  // Handle mounting on client to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
    
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };
    
    // Check initial scroll position
    handleScroll();
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
      setIsMenuOpen(false);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navLinks = [
    { name: 'Home', href: '/' },
    { 
      name: 'Browse', 
      type: 'dropdown',
      items: [
        { name: 'Ongoing', href: '/ongoing' },
        { name: 'Completed', href: '/completed' },
        { name: 'Browse Genre', href: '/genre' },
      ]
    },
    { name: 'Schedule', href: '/schedule' },
    { name: 'Library', href: '/library' },
  ];

  return (
    <nav 
      className={cn(
        "fixed top-0 z-50 w-full transition-all duration-300",
        isScrolled 
          ? "bg-background/80 backdrop-blur-xl border-b border-secondary/10 shadow-[0_4px_30px_rgba(34,197,94,0.03)]" 
          : "bg-transparent border-b border-transparent shadow-none"
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center group py-2">
            <div className="relative w-36 md:w-48 h-8 md:h-10 transition-transform group-hover:scale-105">
              <Image 
                src="/naivestream_logo.png" 
                alt="NaiveStream" 
                fill 
                sizes="(max-width: 768px) 144px, 192px"
                className="object-contain drop-shadow-[0_0_10px_rgba(34,197,94,0.3)]"
                priority
              />
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
                className="w-full bg-card/40 border border-secondary/20 hover:border-secondary/40 focus:border-secondary focus:bg-card rounded-none py-2.5 pl-14 pr-10 focus:outline-none transition-all font-mono font-bold text-sm tracking-widest text-foreground placeholder:text-muted-foreground"
                style={{ clipPath: 'polygon(12px 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%, 0 12px)' }}
              />
              <div className="absolute left-1.5 top-1.5 bottom-1.5 w-10 bg-secondary/20 flex items-center justify-center pointer-events-none transition-colors group-focus-within:bg-secondary/30" style={{ clipPath: 'polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)' }}>
                <Search className="text-secondary w-3.5 h-3.5" />
              </div>
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-2 w-7 h-7 bg-red-100 dark:bg-red-950/50 border border-red-300 dark:border-red-900/50 hover:bg-red-200 dark:hover:bg-red-900/80 text-red-600 dark:text-red-500 flex items-center justify-center transition-all"
                  style={{ clipPath: 'polygon(5px 0, 100% 0, 100% calc(100% - 5px), calc(100% - 5px) 100%, 0 100%, 0 5px)' }}
                  aria-label="Clear search"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </form>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => {
              if (link.type === 'dropdown') {
                return (
                  <div key={link.name} className="relative py-2" ref={dropdownRef}>
                    <button 
                      type="button"
                      onClick={() => setOpenDropdown(prev => prev === link.name ? null : link.name)}
                      className={cn(
                        "flex items-center text-xs font-mono font-bold uppercase tracking-[0.2em] transition-all hover:text-secondary cursor-pointer",
                        openDropdown === link.name ? "text-secondary" : "text-foreground/70"
                      )}
                    >
                      {link.name}
                      <ChevronDown className={cn("w-4 h-4 ml-1 transition-transform", openDropdown === link.name ? "rotate-180" : "")} />
                    </button>
                    {openDropdown === link.name && (
                      <div className="absolute top-full left-0 w-48 pt-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                        <div className="bg-card border-2 border-secondary/20 shadow-xl flex flex-col">
                          {link.items?.map((item) => (
                            <Link
                              key={item.href}
                              href={item.href}
                              onClick={() => setOpenDropdown(null)}
                              className={cn(
                                "px-4 py-3 text-xs font-mono font-bold uppercase tracking-[0.2em] transition-all hover:bg-secondary/10 hover:text-secondary border-b border-white/5 last:border-0",
                                pathname === item.href ? "text-secondary bg-secondary/5" : "text-foreground/70"
                              )}
                            >
                              {item.name}
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              }

              return (
                <Link
                  key={link.name}
                  href={link.href as string}
                  className={cn(
                    "text-xs font-mono font-bold uppercase tracking-[0.2em] transition-all hover:text-secondary relative group py-2",
                    pathname === link.href ? "text-secondary" : "text-foreground/70"
                  )}
                >
                  {link.name}
                  <span className={cn(
                    "absolute bottom-0 left-0 h-[2px] bg-secondary transition-all duration-300",
                    pathname === link.href ? "w-full" : "w-0 group-hover:w-full"
                  )} />
                </Link>
              );
            })}
            
            {/* Theme Toggle with mounting check */}
            <Tooltip content={mounted && theme === 'dark' ? "Switch to Light Mode" : "Switch to Dark Mode"} position="bottom">
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
            </Tooltip>
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
                className="w-full bg-card/40 border border-secondary/20 focus:border-secondary focus:bg-card rounded-none py-4 pl-14 pr-12 focus:outline-none transition-all text-foreground font-mono font-bold text-sm tracking-widest"
                style={{ clipPath: 'polygon(12px 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%, 0 12px)' }}
              />
              <div className="absolute left-2 top-2 bottom-2 w-10 bg-secondary/20 flex items-center justify-center pointer-events-none" style={{ clipPath: 'polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)' }}>
                <Search className="text-secondary w-4 h-4" />
              </div>
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-4 w-8 h-8 bg-red-100 dark:bg-red-950/50 border border-red-300 dark:border-red-900/50 hover:bg-red-200 dark:hover:bg-red-900/80 text-red-600 dark:text-red-500 flex items-center justify-center transition-all"
                  style={{ clipPath: 'polygon(6px 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%, 0 6px)' }}
                  aria-label="Clear search"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </form>
            <div className="grid grid-cols-1 gap-2">
              {navLinks.map((link) => {
                if (link.type === 'dropdown') {
                  return (
                    <div key={link.name} className="flex flex-col">
                      <div className="p-5 font-mono font-bold uppercase tracking-widest text-foreground/70 bg-white/5">
                        {link.name}
                      </div>
                      <div className="flex flex-col pl-4 border-l-4 border-transparent">
                        {link.items?.map((item) => (
                          <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setIsMenuOpen(false)}
                            className={cn(
                              "flex items-center p-4 font-mono font-bold uppercase tracking-widest border-l-4 transition-all",
                              pathname === item.href 
                                ? "bg-secondary/10 border-secondary text-secondary" 
                                : "border-transparent text-foreground/50 hover:text-foreground"
                            )}
                          >
                            {item.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  );
                }

                return (
                  <Link
                    key={link.name}
                    href={link.href as string}
                    onClick={() => setIsMenuOpen(false)}
                    className={cn(
                      "flex items-center p-5 font-mono font-bold uppercase tracking-widest border-l-4 transition-all",
                      pathname === link.href 
                        ? "bg-secondary/10 border-secondary text-secondary" 
                        : "border-transparent text-foreground/50 hover:text-foreground"
                    )}
                  >
                    {link.name}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
