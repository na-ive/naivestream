'use client';

import { usePathname } from 'next/navigation';
import { TitleLangProvider } from "@/lib/providers/TitleLangProvider";
import { ViewModeProvider } from "@/lib/providers/ViewModeProvider";
import { Navbar } from "@/components/layout/Navbar";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { Footer } from "@/components/layout/Footer";
import { ScrollToTop } from "@/components/layout/ScrollToTop";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isSystemRoute = pathname?.startsWith('/admin') || pathname?.startsWith('/login');

  return (
    <TitleLangProvider>
      <ViewModeProvider>
        {isSystemRoute ? (
          <main className="grow">{children}</main>
        ) : (
          <div className="flex flex-col min-h-screen relative">
            <ScrollToTop />
            <Navbar />
            <MobileBottomNav />
            <main className="grow pt-20 pb-16 md:pb-0">
              {children}
            </main>
            <Footer />
          </div>
        )}
      </ViewModeProvider>
    </TitleLangProvider>
  );
}
