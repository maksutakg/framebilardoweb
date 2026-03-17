'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2, KeyRound } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<1 | 2>(1); // 1: Phone, 2: Code/PIN

  const handleNext = async () => {
    if (phoneNumber.length < 10) return;
    setStep(2);
  };

  const handleLogin = async () => {
    if (!otpCode || !phoneNumber) return;
    setLoading(true);

    try {
      const res = await signIn('credentials', {
        phone: phoneNumber,
        otp: otpCode,
        redirect: false
      });

      if (res?.error) {
        alert('Hatalı giriş! Lütfen bilgilerinizi kontrol edin.');
        setLoading(false);
        return;
      }

      // Giriş başarılı, dashboard'a veya yetkili alana yönlendir
      router.push('/dashboard');
    } catch (err) {
      console.error(err);
      alert('Sistemsel bir hata oluştu');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-background flex items-center justify-center p-4 font-sans text-foreground antialiased selection:bg-primary/30 selection:text-primary">
      {/* Background ambient light - inherited from globals.css starfield & vignette */}
      <div className="fixed inset-0 pointer-events-none z-0 mix-blend-multiply bg-black/40" />
      
      {/* Absolute Header - Logo & Back */}
      <div className="absolute top-6 left-6 z-10 flex flex-col gap-5">
        <Link href="/">
          <img src="https://api.frameclubbilardo.com/assets/logo.svg" alt="Frame" className="h-8 md:h-12 object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]" />
        </Link>
        <Link href="/" className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors text-sm font-medium">
          <ArrowLeft className="size-4" />
          Anasayfaya Dön
        </Link>
      </div>

      <div className="relative z-10 w-full max-w-sm md:max-w-md bg-black/60 backdrop-blur-3xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-300">
        
        {/* Modal Header */}
        <div className="p-6 md:p-8 pb-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <KeyRound className="size-6 text-white" />
              <h2 className="text-xl font-bold tracking-tight text-white">
                Personel Girişi
              </h2>
            </div>
            {step === 2 && (
              <button onClick={() => setStep(1)} className="text-zinc-500 hover:text-white transition-colors">
                Geri Git
              </button>
            )}
          </div>
          
          <p className="mt-3 text-sm text-zinc-400 leading-relaxed">
            {step === 1 
              ? "Yönetim paneline erişmek için yetkili telefon numaranızı giriniz."
              : "Yetkili erişim şifrenizi (veya gönderilen SMS kodunu) giriniz."
            }
          </p>
        </div>

        {/* Modal Content */}
        <div className="px-6 md:px-8 pb-8 space-y-6">
          
          {step === 1 && (
            <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="relative">
                <span className="absolute left-4 top-4 text-zinc-500 font-medium">+90</span>
                <input 
                  type="tel"
                  placeholder="555 123 4567"
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-14 py-4 text-white focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-all text-lg"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value.replace(/[^0-9]/g, ''))}
                  maxLength={10}
                  onKeyDown={(e) => e.key === 'Enter' && handleNext()}
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5 flex justify-center animate-in fade-in slide-in-from-right-4 duration-300">
              <input 
                type="password"
                placeholder="******"
                className="w-full text-center bg-black/40 border border-white/10 rounded-xl px-4 py-4 text-white focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-all text-3xl font-mono tracking-widest"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, ''))}
                maxLength={6}
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              />
            </div>
          )}

          {/* Action Buttons styled exactly like Reservation */}
          <div className="flex items-center justify-between pt-2">
            <button 
              onClick={() => {
                if (step === 1) handleNext();
                else if (step === 2) handleLogin();
              }}
              disabled={loading || (step === 1 && phoneNumber.length < 10) || (step === 2 && otpCode.length < 6)}
              className="bg-white hover:bg-zinc-200 text-black font-semibold rounded-md w-full py-3 transition-colors disabled:opacity-50 flex items-center justify-center text-lg"
            >
              {loading && <Loader2 className="mr-2 size-5 animate-spin" />}
              {!loading && step === 1 && "Devam Et"}
              {!loading && step === 2 && "Giriş Yap"}
            </button>
          </div>
          
        </div>
      </div>
    </div>
  );
}
