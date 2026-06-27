'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';
import { User, UserFilled, Login, Logout, Asleep, AsleepFilled, Light, LightFilled, LogoDiscord } from '@carbon/icons-react';
import { cn } from '@/lib/utils';
import { Tooltip } from '@/components/ui/Tooltip';
import { Modal } from '@/components/ui/Modal';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { SyncService } from '@/lib/services/sync';
import { useTheme } from 'next-themes';
import { useTitleLang } from '@/lib/providers/TitleLangProvider';

export function UserMenu() {
  const { data: session, status } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  
  const { theme, setTheme } = useTheme();
  const { titleLang, setTitleLang } = useTitleLang();
  const pathname = usePathname();

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      // Don't close if clicking inside the modal
      if (document.getElementById('login-modal')?.contains(e.target as Node)) {
        return;
      }
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    SyncService.clearAll();
    await signOut();
  };

  const changeTheme = (next: string) => {
    if (typeof document !== 'undefined' && (document as any).startViewTransition) {
      (document as any).startViewTransition(() => setTheme(next));
    } else {
      setTheme(next);
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-w-[44px] h-[44px] border border-secondary/30 p-[2px]">
        <div className="w-full h-full bg-secondary/30 flex items-center justify-center">
          <div className="w-5 h-5 border-2 border-secondary border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="relative" ref={menuRef}>
      <Tooltip content={session ? "Account & Settings" : "Login & Settings"} position="bottom">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "relative p-[2px] transition-all cursor-pointer min-w-[44px] h-[44px] group",
            isOpen
              ? "border border-secondary bg-secondary/10"
              : "border border-secondary/30 hover:border-secondary"
          )}
          aria-label="User menu"
        >
          <div className={cn(
            "relative w-full h-full flex items-center justify-center transition-all overflow-hidden",
            isOpen ? "bg-secondary/50" : "bg-secondary/30 group-hover:bg-secondary/50"
          )}>
            <div className="transition-transform duration-300 group-hover:scale-110 relative z-10 flex items-center justify-center w-full h-full">
              {session?.user?.image ? (
                <Image src={session.user.image} alt={session.user.name || 'User'} fill className="object-cover" />
              ) : (
                <UserFilled className="w-5 h-5 text-secondary" />
              )}
            </div>
            <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%)] bg-[length:100%_4px] z-20" />
          </div>
        </button>
      </Tooltip>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-64 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="bg-card border-2 border-secondary/20 shadow-xl flex flex-col">
            
            {/* ACCOUNT SECTION */}
            <div className="flex items-center gap-2 px-4 pt-3 pb-1">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
              <span className="text-[10px] font-mono font-bold uppercase tracking-[0.3em] text-foreground/30">Account</span>
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
            </div>

            {session ? (
              <div className="p-4 pt-2">
                <div className="flex items-center gap-3 mb-4">
                  <div className="relative w-10 h-10 overflow-hidden border border-secondary/30">
                    {session.user?.image ? (
                      <Image src={session.user.image} alt="Avatar" fill className="object-cover" />
                    ) : (
                      <User className="w-full h-full p-2 text-secondary" />
                    )}
                  </div>
                  <div className="flex flex-col overflow-hidden">
                    <span className="font-mono font-bold text-sm truncate text-foreground">{session.user?.name}</span>
                    <span className="font-mono text-[10px] text-foreground/50 truncate uppercase tracking-widest">{(session.user as any)?.username || session.user?.email}</span>
                  </div>
                </div>
                
                <button
                  onClick={handleSignOut}
                  className="flex items-center justify-center gap-2 w-full py-2 bg-danger/10 text-danger border border-danger/30 hover:bg-danger hover:text-white transition-all font-mono font-bold text-xs uppercase tracking-widest"
                >
                  <Logout className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="p-4 pt-2">
                <button
                  onClick={() => {
                    setIsOpen(false);
                    setIsLoginModalOpen(true);
                  }}
                  className="flex items-center justify-center gap-2 w-full py-2 bg-secondary/10 text-secondary border border-secondary/30 hover:bg-secondary hover:text-background transition-all font-mono font-bold text-xs uppercase tracking-widest"
                >
                  <Login className="w-4 h-4" />
                  Login / Register
                </button>
              </div>
            )}

            {/* NAVIGATE SECTION (MOBILE ONLY) */}
            <div className="md:hidden">
              <div className="flex items-center gap-2 px-4 py-2">
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
                <span className="text-[10px] font-mono font-bold uppercase tracking-[0.3em] text-foreground/30">Navigate</span>
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
              </div>
              <Link
                href="/genre"
                onClick={() => setIsOpen(false)}
                className={cn(
                  "flex items-center h-[44px] px-4 text-xs font-mono font-bold uppercase tracking-[0.2em] transition-all hover:bg-secondary/10 hover:text-secondary",
                  pathname.startsWith('/genre') ? "text-secondary bg-secondary/5" : "text-foreground/70"
                )}
              >
                Browse Genre
              </Link>
              <Link
                href="/schedule"
                onClick={() => setIsOpen(false)}
                className={cn(
                  "flex items-center h-[44px] px-4 text-xs font-mono font-bold uppercase tracking-[0.2em] transition-all hover:bg-secondary/10 hover:text-secondary",
                  pathname.startsWith('/schedule') ? "text-secondary bg-secondary/5" : "text-foreground/70"
                )}
              >
                Schedule
              </Link>
            </div>

            {/* SETTINGS SECTION */}
            <div className="flex items-center gap-2 px-4 py-2">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
              <span className="text-[10px] font-mono font-bold uppercase tracking-[0.3em] text-foreground/30">Settings</span>
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
            </div>

            {/* Theme Toggle */}
            <div className="flex items-center justify-between px-4 h-[52px] hover:bg-secondary/5 transition-all">
              <span className="text-xs font-mono font-bold uppercase tracking-[0.2em] text-foreground/70">Theme</span>
              <div className="inline-flex bg-card/50 border border-secondary/30 p-0.5">
                <button
                  onClick={() => changeTheme('dark')}
                  className={cn(
                    "px-3 py-1.5 flex items-center justify-center transition-all",
                    theme === 'dark'
                      ? "bg-secondary text-background shadow-[0_0_10px_rgba(34,197,94,0.4)]"
                      : "text-muted-text hover:text-foreground hover:bg-secondary/10"
                  )}
                >
                  {theme === 'dark' ? <AsleepFilled className="w-3.5 h-3.5" /> : <Asleep className="w-3.5 h-3.5" />}
                </button>
                <button
                  onClick={() => changeTheme('light')}
                  className={cn(
                    "px-3 py-1.5 flex items-center justify-center transition-all",
                    theme === 'light'
                      ? "bg-secondary text-background shadow-[0_0_10px_rgba(34,197,94,0.4)]"
                      : "text-muted-text hover:text-foreground hover:bg-secondary/10"
                  )}
                >
                  {theme === 'light' ? <LightFilled className="w-3.5 h-3.5" /> : <Light className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Title Language Toggle */}
            <div className="flex items-center justify-between px-4 h-[52px] hover:bg-secondary/5 transition-all mb-2">
              <span className="text-xs font-mono font-bold uppercase tracking-[0.2em] text-foreground/70">Title</span>
              <div className="inline-flex bg-card/50 border border-secondary/30 p-0.5">
                <button
                  onClick={() => setTitleLang('jp')}
                  className={cn(
                    "px-3 py-1.5 font-bold uppercase tracking-widest text-[10px] transition-all",
                    titleLang === 'jp'
                      ? "bg-secondary text-background shadow-[0_0_10px_rgba(34,197,94,0.4)]"
                      : "text-muted-text hover:text-foreground hover:bg-secondary/10"
                  )}
                >
                  JP
                </button>
                <button
                  onClick={() => setTitleLang('en')}
                  className={cn(
                    "px-3 py-1.5 font-bold uppercase tracking-widest text-[10px] transition-all",
                    titleLang === 'en'
                      ? "bg-secondary text-background shadow-[0_0_10px_rgba(34,197,94,0.4)]"
                      : "text-muted-text hover:text-foreground hover:bg-secondary/10"
                  )}
                >
                  EN
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* LOGIN MODAL */}
      <Modal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        title={
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-6 bg-secondary shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
            <h2 className="text-secondary text-xs font-mono font-black uppercase tracking-[0.4em]">
              Auth <span className="text-foreground/50">//</span> Login
            </h2>
          </div>
        }
      >
        <div id="login-modal" className="flex flex-col gap-6 pt-2">
          <div className="flex flex-col items-center justify-center text-center gap-2 mb-4">
            <div className="w-16 h-16 bg-secondary/10 flex items-center justify-center border border-secondary/30 mb-2">
              <UserFilled className="w-8 h-8 text-secondary" />
            </div>
            <h3 className="font-mono text-lg font-bold text-foreground">Welcome to NaiveStream</h3>
            <p className="text-sm text-foreground/70">Log in to track your watch history, save your progress, and sync across devices.</p>
          </div>

          <div className="flex flex-col gap-3">
            <button
              onClick={() => signIn('discord')}
              className="flex items-center justify-center gap-3 w-full p-4 bg-[#5865F2]/10 text-[#5865F2] border border-[#5865F2]/30 hover:bg-[#5865F2] hover:text-white transition-all font-mono font-bold text-sm cursor-pointer"
              style={{
                clipPath: 'polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)',
              }}
            >
              <LogoDiscord className="w-5 h-5" />
              Login with Discord
            </button>
            
            {/* Future providers placeholder */}
            {/* <button className="flex items-center justify-center gap-3 w-full p-4 bg-foreground/5 text-foreground/50 border border-border cursor-not-allowed font-mono font-bold text-sm" style={{ clipPath: 'polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)' }}>
              More providers coming soon
            </button> */}
          </div>
        </div>
      </Modal>
    </div>
  );
}
