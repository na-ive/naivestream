'use client';

import React, { createContext, useContext, useEffect, useCallback, useSyncExternalStore } from 'react';
import { useRouter } from 'next/navigation';

type TitleLang = 'jp' | 'en';

interface TitleLangContextType {
  titleLang: TitleLang;
  setTitleLang: (lang: TitleLang) => void;
}

const TitleLangContext = createContext<TitleLangContextType>({
  titleLang: 'jp',
  setTitleLang: () => {},
});

const subscribeTitleLang = (listener: () => void) => {
  window.addEventListener('title_lang_updated', listener);
  return () => window.removeEventListener('title_lang_updated', listener);
};

const getTitleLangSnapshot = () => {
  if (typeof window === 'undefined') return 'jp';
  const stored = localStorage.getItem('titleLang');
  if (stored === 'en' || stored === 'jp') return stored;
  const cookieMatch = document.cookie.match(/(?:^|; )titleLang=([^;]*)/);
  if (cookieMatch && (cookieMatch[1] === 'en' || cookieMatch[1] === 'jp')) {
    return cookieMatch[1];
  }
  return 'jp';
};

const getServerTitleLangSnapshot = () => 'jp';

export function TitleLangProvider({ children }: { children: React.ReactNode }) {
  const titleLangStr = useSyncExternalStore(subscribeTitleLang, getTitleLangSnapshot, getServerTitleLangSnapshot);
  const titleLang = titleLangStr === 'en' ? 'en' : 'jp';
  const router = useRouter();

  const handleSetTitleLang = useCallback((lang: TitleLang) => {
    localStorage.setItem('titleLang', lang);
    document.cookie = `titleLang=${lang}; path=/; max-age=31536000`; // 1 year
    document.documentElement.setAttribute('data-title-lang', lang);
    window.dispatchEvent(new Event('title_lang_updated'));
    router.refresh(); // Crucial for A-Z list & Server Components
  }, [router]);

  useEffect(() => {
    document.documentElement.setAttribute('data-title-lang', titleLang);
  }, [titleLang]);

  return (
    <TitleLangContext.Provider value={{ titleLang, setTitleLang: handleSetTitleLang }}>
      {children}
    </TitleLangContext.Provider>
  );
}

export function useTitleLang() {
  return useContext(TitleLangContext);
}
