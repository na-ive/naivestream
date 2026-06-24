'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

type TitleLang = 'jp' | 'en';

interface TitleLangContextType {
  titleLang: TitleLang;
  setTitleLang: (lang: TitleLang) => void;
}

const TitleLangContext = createContext<TitleLangContextType>({
  titleLang: 'jp',
  setTitleLang: () => {},
});

export function TitleLangProvider({ children }: { children: React.ReactNode }) {
  const [titleLang, setTitleLang] = useState<TitleLang>('jp');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem('titleLang');
    let initialLang: TitleLang = 'jp';
    if (stored === 'en' || stored === 'jp') {
      initialLang = stored;
    } else {
      // If not in localStorage, check cookie (fallback)
      const cookieMatch = document.cookie.match(/(?:^|; )titleLang=([^;]*)/);
      if (cookieMatch && (cookieMatch[1] === 'en' || cookieMatch[1] === 'jp')) {
        initialLang = cookieMatch[1] as TitleLang;
      }
    }
    setTitleLang(initialLang);
    document.documentElement.setAttribute('data-title-lang', initialLang);
  }, []);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem('titleLang', titleLang);
      document.cookie = `titleLang=${titleLang}; path=/; max-age=31536000`; // 1 year
      document.documentElement.setAttribute('data-title-lang', titleLang);
    }
  }, [titleLang, mounted]);

  return (
    <TitleLangContext.Provider value={{ titleLang, setTitleLang }}>
      {children}
    </TitleLangContext.Provider>
  );
}

export function useTitleLang() {
  return useContext(TitleLangContext);
}
