import React from 'react';
import Link from 'next/link';
import { ArrowLeft, MapPin, Phone, Mail, Instagram, Clock } from 'lucide-react';

export default function ContactPage() {
  return (
    <div className="min-h-screen w-full bg-background flex flex-col p-4 font-sans text-foreground antialiased selection:bg-primary/30 selection:text-primary relative pt-24 custom-scroll overflow-y-auto">
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

      <div className="relative z-10 w-full max-w-6xl mx-auto flex flex-col lg:flex-row gap-8 items-stretch animate-in fade-in slide-in-from-bottom-8 duration-700 h-full">

        {/* Left Side: Contact Info */}
        <div className="flex-1 bg-black/60 backdrop-blur-3xl border border-white/10 rounded-2xl p-8 md:p-12 shadow-2xl flex flex-col justify-center">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-2">Bize Ulaşın</h1>
          <p className="text-zinc-400 mb-10 text-lg">Sorularınız, rezervasyon veya detaylı bilgi için bizimle iletişime geçebilirsiniz.</p>

          <div className="space-y-8">
            {/* Phone */}
            <div className="flex items-start gap-5">
              <div className="size-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0 text-white">
                <Phone className="size-5" />
              </div>
              <div>
                <h3 className="text-white font-semibold text-lg mb-1">Telefon / WhatsApp</h3>
                <a href="tel:+905539402590" className="text-zinc-300 hover:text-primary transition-colors block text-lg font-medium">
                  +90 553 940 25 90
                </a>
              </div>
            </div>

            {/* Address */}
            <div className="flex items-start gap-5">
              <div className="size-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0 text-white">
                <MapPin className="size-5" />
              </div>
              <div>
                <h3 className="text-white font-semibold text-lg mb-1">Adres</h3>
                <a href="https://maps.app.goo.gl/LnFrfy3T8jXjK7ex7" target="_blank" rel="noreferrer" className="text-zinc-300 hover:text-primary transition-colors leading-relaxed max-w-sm block">
                  Fulya, Vefa Deresi Sk. No:29/B, 34394 Şişli/İstanbul
                </a>
              </div>
            </div>

            {/* Working Hours */}
            <div className="flex items-start gap-5">
              <div className="size-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0 text-white">
                <Clock className="size-5" />
              </div>
              <div>
                <h3 className="text-white font-semibold text-lg mb-1">Çalışma Saatleri</h3>
                <p className="text-zinc-300 leading-relaxed">
                  Her Gün: 12:00 - 02:00
                </p>
              </div>
            </div>

            {/* Email & Social */}
            <div className="pt-8 mt-8 border-t border-white/10 flex flex-wrap gap-6 items-center">
              <a href="mailto:info@frameclubbilardo.com" className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors group">
                <div className="size-10 rounded-full bg-white/5 group-hover:bg-white/10 flex items-center justify-center border border-white/10 transition-colors">
                  <Mail className="size-4" />
                </div>
                <span className="font-medium">info@frame</span>
              </a>

              <a href="https://www.instagram.com/frame_bilardo_snooker" target="_blank" rel="noreferrer" className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors group">
                <div className="size-10 rounded-full bg-white/5 group-hover:bg-white/10 flex items-center justify-center border border-white/10 transition-colors">
                  <Instagram className="size-4" />
                </div>
                <span className="font-medium">@frame_bilardo_snooker</span>
              </a>
            </div>
          </div>
        </div>

        {/* Right Side: Google Maps */}
        <div className="flex-1 min-h-[400px] lg:min-h-full rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-black relative group">
          <div className="absolute inset-0 z-10 pointer-events-none group-hover:bg-transparent bg-black/20 transition-colors duration-500" />
          <iframe
            src="https://maps.google.com/maps?q=Frame+Bilardo+Gaziosmanpasa&t=&z=15&ie=UTF8&iwloc=&output=embed"
            width="100%"
            height="100%"
            style={{ border: 0, minHeight: '100%' }}
            allowFullScreen={false}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="absolute inset-0 grayscale hover:grayscale-0 transition-all duration-700"
          ></iframe>
        </div>

      </div>

      <div className="relative flex-none mt-12 bg-black/30 w-full max-w-6xl mx-auto border border-white/5 rounded-2xl py-6 px-8 flex justify-center text-sm text-zinc-500 font-medium backdrop-blur-xl shrink-0">
        © {new Date().getFullYear()} All Rights Reserved - FRAME AKADEMİ TURİZM LTD. ŞTİ.
      </div>
    </div>
  );
}
