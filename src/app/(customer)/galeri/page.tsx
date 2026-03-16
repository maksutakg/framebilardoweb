import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Image as ImageIcon } from 'lucide-react';

const IMAGES = [
  'https://api.frameclubbilardo.com/uploads/241027/hpWvJub8jHCsDurp9vHytMTIQGRjnzUh.jpg',
  'https://api.frameclubbilardo.com/uploads/241027/4tJjYeIXIG72CjBwj6H7bFkz6se122rv.jpg',
  'https://api.frameclubbilardo.com/uploads/241027/qZZd7gK4jzq7dVeXxPYEhihNmpplHSzn.jpg',
  'https://api.frameclubbilardo.com/uploads/241027/CouCFuEYY6clJzXxquOOuyP48qig2cAn.jpg',
  'https://api.frameclubbilardo.com/uploads/241027/BADnZYqHI8q6Y7S2RoIRBAK47goA6eXx.jpg',
  'https://api.frameclubbilardo.com/uploads/241026/Ar0vFsr3gQNWvotNFoIEomNUdVW1GBbt.jpg',
  'https://api.frameclubbilardo.com/uploads/241026/Xb7f74rEuXXfqJRGj69hsWYuqCxG9mgz.jpeg',
  'https://api.frameclubbilardo.com/uploads/241026/SVT1A1ZBJ7zEwd1LWuFsq9vIkuHdohBF.jpg',
  'https://api.frameclubbilardo.com/uploads/241027/GIVyXquLxJdLKSpzK6KhsHlukGfSEQDN.jpg',
  'https://api.frameclubbilardo.com/uploads/241027/QbJZGaLsEndBLDlwZtfFxRJjSbiSBPlF.jpg',
  'https://api.frameclubbilardo.com/uploads/241027/ztXT31Qnb40ahdFLjQ81TE8mTytYQCYt.jpg',
  'https://api.frameclubbilardo.com/uploads/241027/4X6wJ5pcKOFrFZuAmyTyMhKwRfxlArWF.jpg',
  'https://api.frameclubbilardo.com/uploads/241027/fa1qEv7ILSyUgPcTZ8EVjIgEsTlKcyyE.jpg',
  'https://api.frameclubbilardo.com/uploads/241027/QkXtBbdba00zJOKQzQeNT8K7xhqOhdTo.jpg'
];

export default function GalleryPage() {
  return (
    <div className="min-h-screen w-full bg-background flex justify-center p-4 font-sans text-foreground antialiased selection:bg-primary/30 selection:text-primary relative pt-24 pb-8 overflow-y-auto custom-scroll">
      {/* Background ambient light - inherited from globals.css starfield & vignette */}
      <div className="fixed inset-0 pointer-events-none z-0 mix-blend-multiply bg-black/40" />
      
      {/* Absolute Header - Logo & Back */}
      <div className="fixed top-6 left-6 z-20 flex flex-col gap-5">
        <Link href="/">
          <img src="https://api.frameclubbilardo.com/assets/logo.svg" alt="Frame" className="h-8 md:h-12 object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]" />
        </Link>
        <Link href="/" className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors text-sm font-medium">
          <ArrowLeft className="size-4" />
          Anasayfaya Dön
        </Link>
      </div>

      <div className="relative z-10 w-full max-w-7xl animate-in fade-in slide-in-from-bottom-8 duration-700">
        
        {/* Gallery Header */}
        <div className="flex flex-col items-center justify-center text-center space-y-4 mb-12">
           <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white drop-shadow-xl">
             Salon Galerisi
           </h1>
           <p className="text-zinc-400 max-w-lg text-sm md:text-base leading-relaxed">
             Türkiye'nin prestijli bilardo akademisi Frame'in eşsiz ambiyansını ve profesyonel ekipmanlarını keşfedin.
           </p>
        </div>

        {/* Dynamic Grid Layout matching original request */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 px-2">
           {IMAGES.map((src, idx) => (
             <div 
               key={idx} 
               className="group relative aspect-[4/3] rounded-2xl overflow-hidden cursor-crosshair border border-white/10 bg-black/50 shadow-2xl transition-all duration-300 hover:border-white/30 hover:scale-[1.02] hover:-translate-y-1 hover:shadow-[0_15px_30px_-5px_rgba(0,0,0,0.8)]"
             >
                {/* Blur / Vignette inner effect per Image */}
                <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-300 z-10" />
                
                {/* Fallback pattern while loading or gradient */}
                <img 
                  src={src} 
                  alt={`Frame Galeri ${idx + 1}`} 
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                />
             </div>
           ))}
        </div>

        <div className="mt-16 bg-black/30 border border-white/5 rounded-2xl py-6 px-8 flex justify-center text-sm text-zinc-500 font-medium backdrop-blur-xl">
          © {new Date().getFullYear()} All Rights Reserved - FRAME AKADEMİ TURİZM LTD. ŞTİ.
        </div>
      </div>
    </div>
  );
}
