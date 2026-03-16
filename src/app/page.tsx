import React from 'react';
import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="relative min-h-screen w-full flex flex-col justify-between overflow-hidden bg-black text-white">
      {/* Background Video Layer */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-black/60 z-10 mix-blend-multiply" /> {/* Dark overlay for readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-transparent to-black/80 z-10" />
        <video 
          autoPlay 
          loop 
          muted 
          playsInline 
          className="w-full h-full object-cover opacity-80"
        >
          <source src="https://api.frameclubbilardo.com/assets/splash_l.mp4" type="video/mp4" />
        </video>
      </div>

      {/* Top Header Navigation */}
      <header className="relative z-20 flex items-center justify-between p-6 w-full max-w-7xl mx-auto">
        <Link href="/">
          <img src="https://api.frameclubbilardo.com/assets/logo.svg" alt="Frame Bilardo" className="h-10 md:h-14 object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]" />
        </Link>

        {/* Desktop Nav Links from Original HTML */}
        <nav className="hidden lg:flex flex-wrap items-center gap-8 text-sm font-semibold tracking-wide uppercase">
          <Link href="/hakkimizda" className="hover:text-primary transition-colors text-gray-200">Hakkımızda</Link>
          <Link href="/galeri" className="hover:text-primary transition-colors text-gray-200">Galeri</Link>
          <Link href="/iletisim" className="hover:text-primary transition-colors text-gray-200">Bize Ulaşın</Link>
        </nav>
        
        {/* Mobile Menu Icon */}
        <button className="lg:hidden p-2 text-white hover:text-primary transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>
        </button>
      </header>

      {/* Hero Content (Center) */}
      <main className="relative z-20 flex-1 flex flex-col items-center justify-center p-6 text-center animate-in fade-in slide-in-from-bottom-8 duration-1000">
        <h1 className="text-4xl md:text-7xl font-extrabold tracking-tighter mb-4 text-transparent bg-clip-text bg-gradient-to-br from-white to-gray-400 drop-shadow-2xl">
          STAR SNOOKER & POOL <br /> ACADEMY
        </h1>
        <p className="text-lg md:text-xl text-gray-300 mb-12 max-w-2xl font-light">
          İstanbul - Türkiye'nin en iyi Bilardo ve Snooker salonuna hoş geldiniz.
        </p>
        
        {/* Giant Reservation Button in the Middle */}
        <Link 
          href="/reservation" 
          className="group relative inline-flex items-center justify-center px-10 py-5 font-bold text-white bg-primary rounded-full overflow-hidden transition-all hover:scale-105 shadow-[0_0_40px_rgba(0,96,48,0.5)] hover:shadow-[0_0_70px_rgba(0,96,48,0.8)] border border-emerald-400/30"
        >
          {/* Shine effect */}
          <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent group-hover:animate-[shimmer_1.5s_infinite]" />
          
          <span className="relative z-10 flex items-center gap-3 text-lg md:text-2xl tracking-wide uppercase">
            Rezervasyon Yap
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover:translate-x-1"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
          </span>
        </Link>
      </main>

      {/* Footer Area */}
      <footer className="relative z-20 flex items-center justify-center p-6 w-full text-xs text-gray-500 font-medium">
        <p>© 2026 Tüm Hakları Saklıdır - FRAME AKADEMİ TURİZM LTD. ŞTİ.</p>
      </footer>

      {/* Floating WhatsApp Button */}
      <a 
        href="https://api.whatsapp.com/send?phone=905539402590" 
        target="_blank" 
        rel="noreferrer" 
        className="absolute z-50 bottom-8 right-8 flex items-center gap-2 bg-[#25D366] text-white px-5 py-3.5 rounded-full font-bold shadow-2xl hover:scale-105 transition-transform hover:shadow-[#25D366]/50"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M16.75 13.96c.25.13.41.2.46.3.06.11.04.61-.21 1.18-.2.56-1.24 1.1-1.7 1.12-.46.02-.47.36-2.96-.73-2.49-1.09-3.99-3.75-4.11-3.92-.12-.17-.96-1.38-.92-2.61.05-1.22.69-1.8.95-2.04.24-.26.51-.29.68-.26h.47c.15 0 .36-.06.55.45l.69 1.87c.06.13.1.28.01.44l-.27.41-.39.42c-.12.12-.26.25-.12.5.12.26.62 1.09 1.32 1.78.91.88 1.71 1.17 1.95 1.3.24.14.39.12.54-.04l.81-.94c.19-.25.35-.19.58-.11l1.67.88M12 2a10 10 0 0 1 10 10 10 10 0 0 1-10 10c-1.97 0-3.8-.57-5.35-1.55L2 22l1.55-4.65A9.969 9.969 0 0 1 2 12 10 10 0 0 1 12 2m0 2a8 8 0 0 0-8 8c0 1.72.54 3.31 1.46 4.61L4.5 19.5l2.89-.96A7.95 7.95 0 0 0 12 20a8 8 0 0 0 8-8 8 8 0 0 0-8-8z"/></svg>
        <span className="hidden sm:inline">WhatsApp İletişim</span>
      </a>

      {/* Background Shimmer Animation */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
      `}} />
    </div>
  );
}
