'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { Search, ChevronDown, Shuffle } from '@carbon/icons-react';
import { cn } from '@/lib/utils';
import { Tooltip } from '@/components/ui/Tooltip';

import { UserMenu } from './UserMenu';
import { LiveSearch } from '@/components/search/LiveSearch';

export function Navbar() {
  const [mounted, setMounted] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const desktopDropdownRef = React.useRef<HTMLDivElement>(null);
  const tabletSearchRef = React.useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const router = useRouter();
  const [isRandomLoading, setIsRandomLoading] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };
    
    handleScroll();
    window.addEventListener('scroll', handleScroll);

    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        if (window.innerWidth >= 768 && window.innerWidth < 1280) {
          e.preventDefault();
          setIsSearchOpen(true);
        }
      }
    };
    document.addEventListener('keydown', handleGlobalKeyDown);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('keydown', handleGlobalKeyDown);
    };
  }, []);

  const handleRandomAnime = async () => {
    if (isRandomLoading) return;
    setIsRandomLoading(true);
    try {
      const res = await fetch('/api/anime/random');
      const data = await res.json();
      if (data.slug) {
        router.push(`/anime/${data.slug}`);
      }
    } catch (error) {
      console.error('Failed to fetch random anime', error);
    } finally {
      setIsRandomLoading(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (desktopDropdownRef.current && !desktopDropdownRef.current.contains(e.target as Node)) {
        setOpenDropdown(null);
      }
      if (tabletSearchRef.current && !tabletSearchRef.current.contains(e.target as Node)) {
        setIsSearchOpen(false);
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
          ? "bg-background border-b border-secondary/10 shadow-[0_4px_30px_rgba(34,197,94,0.03)]" 
          : "bg-transparent border-b border-transparent shadow-none"
      )}
    >
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
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
          <div className="hidden xl:flex flex-1 max-w-lg mx-12">
            <LiveSearch />
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => {
              if (link.type === 'dropdown') {
                return (
                  <div key={link.name} className="relative py-2" ref={desktopDropdownRef}>
                    <button 
                      type="button"
                      onClick={() => setOpenDropdown(prev => prev === link.name ? null : link.name)}
                      className={cn(
                        "flex items-center text-xs font-mono font-bold uppercase tracking-[0.2em] transition-all hover:text-secondary cursor-pointer",
                        (openDropdown === link.name || link.items?.some(item => pathname.startsWith(item.href))) ? "text-secondary" : "text-foreground/70"
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
                                "px-4 py-3 text-xs font-mono font-bold uppercase tracking-[0.2em] transition-all hover:bg-secondary/10 hover:text-secondary border-b border-border last:border-0",
                                pathname.startsWith(item.href) ? "text-secondary bg-secondary/5" : "text-foreground/70"
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
            
            <div className="flex items-center space-x-2 ml-2">
              {/* Tablet Search Button & Dropdown */}
              <div className="hidden md:flex xl:hidden relative" ref={tabletSearchRef}>
                <Tooltip content="Search" position="bottom">
                  <button
                    onClick={() => setIsSearchOpen(!isSearchOpen)}
                    className={cn(
                      "relative p-2.5 transition-all cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center group",
                      isSearchOpen 
                        ? "border border-secondary bg-secondary/10 text-secondary"
                        : "border border-secondary/30 hover:border-secondary text-secondary"
                    )}
                    aria-label="Search"
                  >
                    <Search className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" />
                  </button>
                </Tooltip>
                
                {isSearchOpen && (
                  <div className="absolute top-full right-0 mt-4 w-[400px] z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    <LiveSearch autoFocus={true} onClose={() => setIsSearchOpen(false)} />
                  </div>
                )}
              </div>

              {/* Random Anime Button */}
              <Tooltip content="Random Anime" position="bottom">
                <button
                  onClick={handleRandomAnime}
                  disabled={isRandomLoading}
                  className="relative p-2.5 border border-secondary/30 hover:border-secondary text-secondary transition-all cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center group disabled:opacity-50"
                  aria-label="Random Anime"
                >
                  <div className={cn("transition-transform duration-300 group-hover:scale-110", isRandomLoading && "animate-spin")}>
                    <Shuffle className="w-5 h-5" />
                  </div>
                </button>
              </Tooltip>
              
              {/* User Menu (Now includes Preference & Mobile Nav) */}
              <UserMenu />
            </div>
          </div>

          {/* Mobile Actions */}
          <div className="flex md:hidden items-center gap-2 relative">
            <button
              onClick={handleRandomAnime}
              disabled={isRandomLoading}
              className="p-2.5 border border-secondary/30 text-secondary flex items-center justify-center min-w-[44px] min-h-[44px] disabled:opacity-50"
              aria-label="Random Anime"
            >
              <Shuffle className={cn("w-5 h-5", isRandomLoading && "animate-spin")} />
            </button>
            
            {/* Unified User & Mobile Menu */}
            <UserMenu />
          </div>
        </div>
      </div>
    </nav>
  );
}
