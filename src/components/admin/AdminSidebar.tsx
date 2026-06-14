'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Dashboard, 
  DataBase, 
  Terminal, 
  Power,
  ChevronLeft,
  ChevronRight,
  Home,
  Moon,
  Sun
} from '@carbon/icons-react';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';

export function AdminSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme } = useTheme();

  useEffect(() => setMounted(true), []);

  const menuItems = [
    { name: 'Dashboard', path: '/admin', icon: Dashboard },
    { name: 'Data Nexus', path: '/admin/database', icon: DataBase },
    { name: 'Operations', path: '/admin/operations', icon: Terminal },
  ];

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  };

  return (
    <aside 
      className={cn(
        "hidden md:flex flex-col bg-card border-r border-border transition-all duration-300 relative",
        collapsed ? "w-[80px]" : "w-[280px]"
      )}
    >
      {/* Header */}
      <div className="h-20 flex items-center justify-between px-6 border-b border-secondary/20 shrink-0">
        {!collapsed && (
          <div className="flex items-center gap-3 overflow-hidden">
            <img src="/icon.png" alt="NaiveStream" className="w-8 h-8 bg-black object-contain shrink-0" />
            <span className="font-black tracking-tighter text-secondary uppercase whitespace-nowrap">Operator Panel</span>
          </div>
        )}
        {collapsed && (
          <div className="w-full flex justify-center">
            <img src="/icon.png" alt="NaiveStream" className="w-8 h-8 bg-black object-contain shrink-0" />
          </div>
        )}
      </div>

      {/* Collapse Toggle */}
      <div className="absolute -right-3 top-4 z-50 flex items-center justify-center filter drop-shadow-md">
        <button 
          onClick={() => setCollapsed(!collapsed)}
          className="w-6 h-12 bg-card group relative overflow-hidden flex items-center justify-center"
          style={{ 
            clipPath: collapsed 
              ? 'polygon(0 0, 100% 4px, 100% calc(100% - 4px), 0 100%)' 
              : 'polygon(0 4px, 100% 0, 100% 100%, 0 calc(100% - 4px))'
          }}
        >
          <div className="absolute inset-0 bg-secondary/0 group-hover:bg-secondary/20 transition-colors z-0" />
          <div className="relative z-10">
            {collapsed ? <ChevronRight className="w-4 h-4 text-secondary" /> : <ChevronLeft className="w-4 h-4 text-secondary" />}
          </div>
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 py-8 px-4 flex flex-col gap-2 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link 
              key={item.path} 
              href={item.path}
              className={cn(
                "group flex items-center px-4 py-3 gap-4 text-sm font-bold tracking-widest uppercase transition-all duration-300 relative",
                collapsed ? "justify-center" : "",
                isActive 
                  ? "text-secondary bg-secondary/10" 
                  : "text-muted-text hover:text-foreground hover:bg-foreground/5"
              )}
              title={collapsed ? item.name : undefined}
            >
              {/* Active Indicator */}
              {isActive && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-secondary" />
              )}
              
              <item.icon className={cn(
                "w-5 h-5 shrink-0 transition-colors",
                isActive ? "text-secondary" : "text-muted-text group-hover:text-foreground"
              )} />
              
              {!collapsed && (
                <span className="whitespace-nowrap">{item.name}</span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer / Logout */}
      <div className="p-4 border-t border-secondary/20 shrink-0 flex flex-col gap-2">
        <Link
          href="/"
          className={cn(
            "w-full flex items-center gap-3 px-4 py-3 text-muted-text hover:text-foreground hover:bg-foreground/5 font-bold uppercase tracking-widest text-sm transition-all duration-300 cursor-pointer",
            collapsed ? "justify-center" : ""
          )}
          title={collapsed ? "Public Grid" : undefined}
        >
          <Home className="w-5 h-5 shrink-0" />
          {!collapsed && <span className="whitespace-nowrap">Public Grid</span>}
        </Link>

        {mounted && (
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 text-muted-text hover:text-secondary hover:bg-secondary/10 font-bold uppercase tracking-widest text-sm transition-all duration-300 cursor-pointer",
              collapsed ? "justify-center" : ""
            )}
            title={collapsed ? "Toggle Theme" : undefined}
          >
            {theme === 'dark' ? <Sun className="w-5 h-5 shrink-0" /> : <Moon className="w-5 h-5 shrink-0" />}
            {!collapsed && <span className="whitespace-nowrap">{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>}
          </button>
        )}

        <button
          onClick={handleLogout}
          className={cn(
            "w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:text-red-400 hover:bg-red-500/10 font-bold uppercase tracking-widest text-sm transition-all duration-300 cursor-pointer",
            collapsed ? "justify-center" : ""
          )}
          title={collapsed ? "Terminate Session" : undefined}
        >
          <Power className="w-5 h-5 shrink-0" />
          {!collapsed && <span className="whitespace-nowrap">Terminate</span>}
        </button>
      </div>
    </aside>
  );
}
