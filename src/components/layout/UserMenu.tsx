'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';
import { User, Login, Logout } from '@carbon/icons-react';
import { cn } from '@/lib/utils';
import { Tooltip } from '@/components/ui/Tooltip';
import Image from 'next/image';
import { SyncService } from '@/lib/services/sync';

export function UserMenu() {
  const { data: session, status } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
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

  if (status === 'loading') {
    return (
      <div className="relative p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-secondary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!session) {
    return (
      <Tooltip content="Login with Discord" position="bottom">
        <button
          onClick={() => signIn('discord')}
          className="relative p-2.5 border border-secondary/30 hover:border-secondary text-secondary transition-all cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center group"
          aria-label="Login"
        >
          <Login className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" />
        </button>
      </Tooltip>
    );
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "relative border transition-all cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center overflow-hidden group",
          isOpen ? "border-secondary bg-secondary/10" : "border-secondary/30 hover:border-secondary"
        )}
      >
        {session.user?.image ? (
          <Image src={session.user.image} alt={session.user.name || 'User'} fill className="object-cover transition-transform group-hover:scale-110" />
        ) : (
          <User className="w-5 h-5 text-secondary transition-transform group-hover:scale-110" />
        )}
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-4 w-64 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="bg-card border-2 border-secondary/20 shadow-xl flex flex-col p-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="relative w-12 h-12 rounded-full overflow-hidden border border-secondary/30">
                {session.user?.image ? (
                  <Image src={session.user.image} alt="Avatar" fill className="object-cover" />
                ) : (
                  <User className="w-full h-full p-2 text-secondary" />
                )}
              </div>
              <div className="flex flex-col overflow-hidden">
                <span className="font-mono font-bold text-sm truncate text-foreground">{session.user?.name}</span>
                <span className="font-mono text-[10px] text-foreground/50 truncate uppercase tracking-widest">{session.user?.email}</span>
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
        </div>
      )}
    </div>
  );
}
