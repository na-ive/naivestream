'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { Search, Moon, Sun, Menu, Close, ChevronDown } from '@carbon/icons-react';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import { Tooltip } from '@/components/ui/Tooltip';

import { ThemeToggle } from './ThemeToggle';
import { LiveSearch } from '@/components/search/LiveSearch';

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
          <div className="hidden lg:flex flex-1 max-w-lg mx-12">
            <LiveSearch />
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
                                "px-4 py-3 text-xs font-mono font-bold uppercase tracking-[0.2em] transition-all hover:bg-secondary/10 hover:text-secondary border-b border-white/5 last:border-0",
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
            
            {/* Theme Toggle */}
            <ThemeToggle />
          </div>

          {/* Mobile Actions */}
          <div className="flex md:hidden items-center space-x-4">
            <ThemeToggle />
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 bg-secondary text-background cursor-pointer"
            >
              {isMenuOpen ? <Close className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-background border-b-2 border-secondary/30 animate-in slide-in-from-top duration-300">
          <div className="px-4 py-8 space-y-6">
            <LiveSearch />
            <div className="grid grid-cols-1 gap-2">
              {navLinks.map((link) => {
                if (link.type === 'dropdown') {
                  return (
                    <div key={link.name} className="flex flex-col">
                      <div className={cn(
                        "p-5 font-mono font-bold uppercase tracking-widest bg-white/5",
                        link.items?.some(item => pathname.startsWith(item.href)) ? "text-secondary" : "text-foreground/70"
                      )}>
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
                              pathname.startsWith(item.href) 
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
