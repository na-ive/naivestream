import type { Metadata } from "next";
import { Exo_2, Orbitron } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { TitleLangProvider } from "@/lib/providers/TitleLangProvider";
import { ViewModeProvider } from "@/lib/providers/ViewModeProvider";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Toaster } from "sonner";

const sans = Exo_2({
  subsets: ["latin"],
  variable: "--font-sans",
});

const serif = Orbitron({
  subsets: ["latin"],
  weight: ["400", "700", "900"],
  variable: "--font-serif",
});

export const metadata: Metadata = {
  title: {
    template: "%s | NaiveStream",
    default: "NaiveStream",
  },
  description: "A personal anime streaming web interface.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${sans.variable} ${serif.variable} antialiased selection:bg-secondary selection:text-black`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          enableColorScheme={false}
          disableTransitionOnChange
        >
          <div className="flex flex-col min-h-screen relative">
            <TitleLangProvider>
              <ViewModeProvider>
                <Navbar />
                <main className="grow pt-20">
                  {children}
                </main>
              </ViewModeProvider>
            </TitleLangProvider>
            <Footer />
          </div>
          <Toaster 
            theme="dark" 
            position="bottom-right"
            toastOptions={{
              classNames: {
                toast: '!bg-card !border !font-mono !rounded-none',
                success: '!border-secondary !text-secondary !shadow-[0_0_20px_rgba(34,197,94,0.25)]',
                error: '!border-red-500 !text-red-500 !shadow-[0_0_20px_rgba(239,68,68,0.25)]',
                info: '!border-blue-500 !text-blue-500 !shadow-[0_0_20px_rgba(59,130,246,0.25)]',
                description: '!text-muted-text !text-[10px] uppercase tracking-widest',
                icon: '!w-10 !h-10 !m-0 !static !bg-transparent',
                content: '!pl-2',
              },
              style: {
                clipPath: 'polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)'
              }
            }} 
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
