import React from 'react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen w-full bg-background flex-col relative overflow-hidden">
      {/* Background ambient light - inherited from globals.css starfield & vignette */}
      <div className="fixed inset-0 pointer-events-none z-0 mix-blend-multiply bg-black/40" />
      
      {/* Premium Top Navigation Bar */}
      <header className="flex items-center justify-between px-6 py-4 bg-black/50 backdrop-blur-2xl border-b border-white/10 shrink-0 z-20 sticky top-0">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-full flex items-center justify-center">
             <img src="https://api.frameclubbilardo.com/assets/logo.svg" alt="Frame" className="h-8 object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white drop-shadow-md">Dashboard</h1>
            <p className="text-xs text-zinc-400 uppercase font-medium tracking-wider">Masa Yönetimi</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-sm flex items-center gap-2 text-white">
            <span className="relative flex size-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full size-2.5 bg-emerald-500"></span>
            </span>
            <span className="font-semibold tracking-wide shadow-sm">Canlı Bağlantı</span>
          </div>
          <button className="flex items-center justify-center size-10 rounded-full bg-white/5 hover:bg-white/15 transition-colors border border-white/10 shadow-lg text-white">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 z-20 custom-scroll">
        {children}
      </main>
    </div>
  );
}
