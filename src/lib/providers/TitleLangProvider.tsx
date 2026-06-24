'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
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

export function TitleLangProvider({ children }: { children: React.ReactNode }) {
  const [titleLang, setTitleLang] = useState<TitleLang>('jp');
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  const handleSetTitleLang = useCallback((lang: TitleLang) => {
    setTitleLang(lang);
    if (mounted) {
      localStorage.setItem('titleLang', lang);
      document.cookie = `titleLang=${lang}; path=/; max-age=31536000`; // 1 year
      document.documentElement.setAttribute('data-title-lang', lang);
      router.refresh(); // Crucial for A-Z list & Server Components
    }
  }, [mounted, router]);

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

  return (
    <TitleLangContext.Provider value={{ titleLang, setTitleLang: handleSetTitleLang }}>
      {children}
    </TitleLangContext.Provider>
  );
}

export function useTitleLang() {
  return useContext(TitleLangContext);
}
