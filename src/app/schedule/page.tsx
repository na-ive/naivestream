import React from 'react';
import { AnimeAPI } from '@/lib/api';
import Link from 'next/link';
import { AnimeCard } from '@/components/anime/AnimeCard';
import { Calendar, Frown } from 'lucide-react';

export const metadata = {
  title: 'Anime Schedule - NaiveStream',
  description: 'Weekly anime release schedule.',
};

const DAY_MAP: Record<number, string> = {
  0: 'Minggu', 1: 'Senin', 2: 'Selasa',
  3: 'Rabu', 4: 'Kamis', 5: 'Jumat', 6: 'Sabtu'
};

const DAY_ORDER = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];

interface SchedulePageProps {
  searchParams: Promise<{ day?: string }>;
}

export default async function SchedulePage({ searchParams }: SchedulePageProps) {
  const scheduleRes = await AnimeAPI.otakudesu.getSchedule();
  const rawParams = await searchParams;
  
  // Default to today if no day parameter is provided
  const currentJsDay = new Date().getDay();
  const defaultDay = DAY_MAP[currentJsDay];
  
  // Ensure day is valid, fallback to defaultDay
  let activeDay = rawParams.day || defaultDay;
  if (!DAY_ORDER.includes(activeDay)) {
    activeDay = defaultDay;
  }

  const scheduleData = scheduleRes?.data || [];
  
  // Find the anime list for the active day
  const activeDayData = scheduleData.find((d: any) => d.day === activeDay);
  const animeList = activeDayData?.anime_list || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-12">
        <div className="flex items-center space-x-4 mb-6">
          <div className="p-3 bg-secondary/10 text-secondary border border-secondary/30 relative">
            <Calendar className="w-8 h-8 relative z-10" />
            <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-secondary" />
            <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-secondary" />
          </div>
          <h1 className="text-4xl md:text-5xl font-serif font-black uppercase tracking-tighter">Schedule<span className="text-secondary">_</span></h1>
        </div>
        
        <div className="inline-block px-6 py-3 bg-card/80 border-l-4 border-secondary/50 shadow-lg relative overflow-hidden"
             style={{ clipPath: 'polygon(0 0, 100% 0, calc(100% - 15px) 100%, 0 100%)' }}>
          <div className="absolute inset-0 bg-gradient-to-r from-secondary/10 to-transparent pointer-events-none" />
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-foreground/80 relative z-10">
            Weekly anime release schedule
          </p>
        </div>
      </div>

      {/* Day Tabs */}
      <div 
        className="mb-12 bg-card/50 border-y border-secondary/30 p-6 md:p-8 relative"
        style={{ clipPath: 'polygon(20px 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%, 0 20px)' }}
      >
        <div className="flex flex-wrap justify-center gap-3 relative z-10">
          {DAY_ORDER.map((day) => {
            const isActive = day === activeDay;
            return (
              <Link
                key={day}
                href={`/schedule?day=${day}`}
                className={`px-8 py-2.5 flex items-center justify-center font-bold text-sm transition-all uppercase tracking-widest ${
                  isActive
                    ? 'bg-secondary text-background shadow-[0_0_15px_rgba(34,197,94,0.4)] pointer-events-none'
                    : 'bg-background/80 text-foreground/70 hover:bg-secondary/20 hover:text-secondary border border-secondary/20 hover:border-secondary/50'
                }`}
              >
                {day}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Anime Grid */}
      {animeList.length > 0 ? (
        <div className="anime-grid">
          {animeList.map((anime: any) => (
            <AnimeCard
              key={anime.slug}
              id={anime.slug}
              title={anime.title}
              image={anime.poster}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 border-2 border-dashed border-secondary/20 bg-card">
          <Frown className="w-12 h-12 text-muted-text" />
          <p className="text-muted-text font-bold uppercase tracking-widest text-xs">
            No anime scheduled for {activeDay}.
          </p>
        </div>
      )}
    </div>
  );
}
