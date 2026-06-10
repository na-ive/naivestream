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
    if (stored === 'en' || stored === 'jp') setTitleLang(stored);
  }, []);

  useEffect(() => {
    if (mounted) localStorage.setItem('titleLang', titleLang);
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
