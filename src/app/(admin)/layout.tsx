'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Loader2, LogOut } from 'lucide-react';
import { signOut } from 'next-auth/react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    // Oturum yoksa veya kullanıcı staff/admin değilse login'e yönlendir
    if (status === 'unauthenticated') {
      router.replace('/login');
    }
    if (status === 'authenticated' && session?.user?.role !== 'staff' && session?.user?.role !== 'admin') {
      router.replace('/login');
    }
  }, [status, session, router]);

  // Yüklenirken premium loading
  if (status === 'loading') {
    return (
      <div className="flex h-screen w-full bg-background items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="size-10 animate-spin text-emerald-400" />
          <p className="text-zinc-400 font-medium">Oturum kontrol ediliyor...</p>
        </div>
      </div>
    );
  }

  // Yetkisiz ise boş render (redirect olacak)
  if (status === 'unauthenticated' || (session?.user?.role !== 'staff' && session?.user?.role !== 'admin')) {
    return null;
  }

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
          
          {/* Kullanıcı bilgisi & çıkış */}
          <div className="hidden md:flex items-center gap-2 text-sm text-zinc-300 font-medium">
            <span>{session?.user?.phone}</span>
          </div>

          <button 
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="flex items-center justify-center size-10 rounded-full bg-white/5 hover:bg-red-500/20 transition-colors border border-white/10 shadow-lg text-zinc-400 hover:text-red-400"
            title="Çıkış Yap"
          >
            <LogOut className="size-5" />
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
