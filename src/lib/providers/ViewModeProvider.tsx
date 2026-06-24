'use client';

import React, { createContext, useContext, useCallback, useSyncExternalStore, ReactNode } from 'react';

export type ViewMode = 'grid' | 'detailed' | 'list';

interface ViewModeContextType {
  viewMode: ViewMode;
  changeViewMode: (mode: ViewMode) => void;
  isMounted: boolean;
}

const ViewModeContext = createContext<ViewModeContextType | null>(null);

const subscribeViewMode = (listener: () => void) => {
  window.addEventListener('view_mode_updated', listener);
  return () => window.removeEventListener('view_mode_updated', listener);
};

const getViewModeSnapshot = () => {
  if (typeof window === 'undefined') return 'grid';
  return localStorage.getItem('anime_view_mode') || 'grid';
};

const getServerViewModeSnapshot = () => 'grid';

export function ViewModeProvider({ children }: { children: ReactNode }) {
  const viewModeStr = useSyncExternalStore(subscribeViewMode, getViewModeSnapshot, getServerViewModeSnapshot);
  const viewMode = (viewModeStr === 'detailed' || viewModeStr === 'list') ? viewModeStr : 'grid';
  
  const isMounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  const changeViewMode = useCallback((mode: ViewMode) => {
    localStorage.setItem('anime_view_mode', mode);
    window.dispatchEvent(new Event('view_mode_updated'));
  }, []);

  return (
    <ViewModeContext.Provider value={{ viewMode, changeViewMode, isMounted }}>
      {children}
    </ViewModeContext.Provider>
  );
}

export function useViewMode() {
  const context = useContext(ViewModeContext);
  if (!context) {
    throw new Error('useViewMode must be used within a ViewModeProvider');
  }
  return context;
}
