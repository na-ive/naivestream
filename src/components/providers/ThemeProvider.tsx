'use client';

import * as React from 'react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { type ThemeProviderProps } from 'next-themes';

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  // Removing the mounted check as it might interfere with next-themes script injection logic in React 19
  // The suppressHydrationWarning on the html tag in layout.tsx should handle mismatches
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
