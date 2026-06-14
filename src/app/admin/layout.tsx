import { getSession } from '@/lib/auth';
import type { Metadata } from 'next';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Admin Panel | NaiveStream',
  description: 'Manage NaiveStream database and scraper operations',
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session) {
    redirect('/login');
  }

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden selection:bg-secondary/30 selection:text-secondary">
      {/* Mobile Blocker */}
      <div className="md:hidden fixed inset-0 z-[100] bg-background flex flex-col items-center justify-center p-6 text-center border-t-4 border-red-500">
        <div className="w-16 h-16 mb-6 bg-red-500/10 flex items-center justify-center border border-red-500/20" style={{ clipPath: 'polygon(0 10px, 10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%)' }}>
          <span className="text-red-500 font-black text-2xl">!</span>
        </div>
        <h1 className="text-2xl font-black font-serif uppercase tracking-widest text-red-500 mb-4">Access Denied</h1>
        <p className="text-muted-text font-mono text-sm leading-relaxed max-w-[280px]">
          Operator panel requires a workstation interface. Mobile access is strictly prohibited.
        </p>
      </div>

      <div className="hidden md:flex h-full w-full">
        {/* Sidebar Navigation */}
        <AdminSidebar />
        
        {/* Main Content Area */}
        <main className="flex-1 h-full overflow-y-auto bg-background relative">
          <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.02),rgba(0,255,0,0.01),rgba(0,0,255,0.02))] bg-[length:100%_4px,100%_100%] z-50 opacity-20" />
          {children}
        </main>
      </div>
    </div>
  );
}
