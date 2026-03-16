'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Zap, Check, X, ArrowLeft, Loader2, Calendar, Phone, Hash } from 'lucide-react';

export default function ReservationPage() {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [loading, setLoading] = useState(false);

  const AVAILABLE_TIMES = [
    '12:00', '13:00', '14:00', '15:00', '16:00', '17:00',
    '18:00', '19:00', '20:00', '21:00', '22:00', '23:00',
    '00:00', '01:00', '02:00'
  ];

  // Selections
  const [selectedDay, setSelectedDay] = useState('Bugün');
  const [selectedTime, setSelectedTime] = useState('19:00');
  const [selectedTableType, setSelectedTableType] = useState('Snooker');

  const handleSendSMS = async () => {
    if (!phoneNumber) return;
    setLoading(true);
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phoneNumber })
      });
      if (res.ok) {
        setStep(3);
      } else {
        alert('Doğrulama kodu gönderilemedi. Lütfen geçerli bir numara girin.');
      }
    } catch (error) {
      alert('Sistemsel bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmReservation = async () => {
    if (!otpCode) return;
    setLoading(true);

    try {
      const res = await signIn('credentials', {
        phone: phoneNumber,
        otp: otpCode,
        redirect: false
      });

      if (res?.error) {
        alert('Doğrulama kodu hatalı!');
        setLoading(false);
        return;
      }

      const startTime = new Date();
      startTime.setHours(19, 0, 0, 0); 
      const endTime = new Date();
      endTime.setHours(20, 0, 0, 0);

      await fetch('/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tableId: '123e4567-e89b-12d3-a456-426614174000', 
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString()
        })
      });

      setStep(4 as any);
      setLoading(false);

    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  // Modern UI CheckIcon specifically mimicking the screenshot
  const CheckIconSelected = () => (
    <div className="absolute -top-2.5 -right-2.5 bg-white rounded-full p-0.5 border-4 border-black">
      <Check className="size-3 text-black" strokeWidth={4} />
    </div>
  );

  return (
    <div className="min-h-screen w-full bg-background flex items-center justify-center p-4 font-sans text-foreground antialiased selection:bg-primary/30 selection:text-primary">
      {/* Background ambient light - inheriting from global CSS, so we just add a subtle vignette */}
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

      <div className="relative z-10 w-full max-w-lg bg-black/60 backdrop-blur-3xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-300">
        
        {/* Modal Header */}
        <div className="p-6 md:p-8 pb-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold tracking-tight text-white">
                {step === 1 && "Masa Planınızı Seçin"}
                {step === 2 && "Telefon Doğrulaması"}
                {step === 3 && "Doğrulama Kodu"}
                {step === 4 && "Rezervasyon Tamamlandı"}
              </h2>
            </div>
            {step !== 4 && (
              <Link href="/">
                <button className="text-zinc-500 hover:text-white transition-colors">
                  <X className="size-5" />
                </button>
              </Link>
            )}
          </div>
          
          <p className="mt-3 text-sm text-zinc-400 leading-relaxed">
            {step === 1 && "İhtiyacınıza en uygun masa tipini ve zamanı seçin. Sonrasında ek taleplerinizi kasada belirtebilirsiniz."}
            {step === 2 && "Sahte rezervasyonları engellemek için sadece onaylı numara ile işlem yapıyoruz."}
            {step === 3 && `+90 ${phoneNumber} numarasına gönderdiğimiz 4 haneli SMS kodunu giriniz.`}
          </p>
        </div>

        {/* Modal Content */}
        <div className="px-6 md:px-8 pb-8 space-y-6">
          
          {step === 1 && (
            <div className="space-y-4">
              {/* Day Selection Wrapper mimicking cards */}
              <div className="flex items-center gap-2 overflow-x-auto pb-3 custom-scroll">
                {['Bugün', 'Yarın', '18 Mart'].map((day) => (
                   <button
                     key={day}
                     onClick={() => setSelectedDay(day)}
                     className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                       selectedDay === day 
                         ? 'bg-white text-black drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]' 
                         : 'bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10'
                     }`}
                   >
                     {day}
                   </button>
                ))}
              </div>

              {/* Time Selection Wrapper */}
              <div className="flex items-center gap-2 overflow-x-auto pb-4 pt-1 custom-scroll">
                {AVAILABLE_TIMES.map((time) => (
                   <button
                     key={time}
                     onClick={() => setSelectedTime(time)}
                     className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                       selectedTime === time 
                         ? 'bg-white text-black drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]' 
                         : 'bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10'
                     }`}
                   >
                     {time}
                   </button>
                ))}
              </div>

              {/* Card 1: Snooker (Pro) */}
              <div 
                onClick={() => setSelectedTableType('Snooker')}
                className={`relative cursor-pointer rounded-xl p-5 border transition-all duration-200 ${
                  selectedTableType === 'Snooker' 
                    ? 'border-white bg-white/10' 
                    : 'border-white/10 bg-black/40 hover:border-white/20'
                }`}
              >
                {selectedTableType === 'Snooker' && <CheckIconSelected />}
                
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-white">Snooker</h3>
                    <p className="text-sm text-zinc-500">Profesyoneller için özel alan</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xl font-bold text-white">400₺</span>
                    <span className="text-sm text-zinc-500"> /sa</span>
                  </div>
                </div>

                <div className="space-y-2.5">
                  <div className="flex items-center gap-3 text-sm text-zinc-300">
                    <Check className="size-4 text-zinc-500" />
                    <span>4 Adet Müsait Masa</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-zinc-300">
                    <Check className="size-4 text-zinc-500" />
                    <span>12ft Profesyonel Standart</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-zinc-300">
                    <Check className="size-4 text-zinc-500" />
                    <span>Özel Karbon İstakalar</span>
                  </div>
                </div>
              </div>

              {/* Card 2: Amerikan (Basic) */}
              <div 
                onClick={() => setSelectedTableType('Amerikan')}
                className={`relative cursor-pointer rounded-xl p-5 border transition-all duration-200 ${
                  selectedTableType === 'Amerikan' 
                    ? 'border-white bg-white/10' 
                    : 'border-white/10 bg-black/40 hover:border-white/20'
                }`}
              >
                {selectedTableType === 'Amerikan' && <CheckIconSelected />}
                
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-white">Amerikan (Pool)</h3>
                    <p className="text-sm text-zinc-500">Klasik bilardo deneyimi</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xl font-bold text-white">400₺</span>
                    <span className="text-sm text-zinc-500"> /sa</span>
                  </div>
                </div>

                <div className="space-y-2.5">
                  <div className="flex items-center gap-3 text-sm text-zinc-300">
                    <Check className="size-4 text-zinc-500" />
                    <span>9 Adet Müsait Masa</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-zinc-300">
                    <Check className="size-4 text-zinc-500" />
                    <span>9ft Turnuva Masası</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-zinc-300">
                    <Check className="size-4 text-zinc-500" />
                    <span>Ayrıcalıklı Kasa Hizmeti</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
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
                />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-5 flex justify-center animate-in fade-in slide-in-from-right-4 duration-300">
              <input 
                type="text"
                placeholder="0000"
                className="w-40 text-center bg-black/40 border border-white/10 rounded-xl px-4 py-4 text-white focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-all text-3xl font-mono tracking-widest"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, ''))}
                maxLength={4}
              />
            </div>
          )}

          {step === 4 as any && (
             <div className="py-6 flex flex-col items-center justify-center text-center space-y-4 animate-in fade-in zoom-in duration-500">
                <div className="size-16 rounded-full bg-white flex items-center justify-center mb-2">
                  <Check className="size-8 text-black" strokeWidth={3} />
                </div>
                <h3 className="text-xl font-bold text-white">Hazırsınız!</h3>
                <p className="text-sm text-zinc-400">
                  {selectedDay} günü, saat {selectedTime} itibarıyla {selectedTableType} masanız ayrılmıştır. Geldiğinizde telefon numaranızı söylemeniz yeterlidir.
                </p>
             </div>
          )}

          {/* Action Buttons styled like the screenshot */}
          {step !== 4 && (
            <div className="flex items-center justify-between pt-2">
              <button 
                onClick={() => {
                  if (step === 1) setStep(2);
                  else if (step === 2) handleSendSMS();
                  else if (step === 3) handleConfirmReservation();
                }}
                disabled={loading || (step === 2 && phoneNumber.length < 10) || (step === 3 && otpCode.length < 4)}
                className="bg-white hover:bg-zinc-200 text-black font-semibold rounded-md px-6 py-2 transition-colors disabled:opacity-50 flex items-center"
              >
                {loading && <Loader2 className="mr-2 size-4 animate-spin" />}
                {!loading && step === 1 && "Seçimi Onayla"}
                {!loading && step === 2 && "Devam Et"}
                {!loading && step === 3 && "Rezervasyonu Tamamla"}
              </button>
              
              <button 
                onClick={() => {
                  if (step > 1) setStep(step - 1 as any);
                }}
                className={`font-medium text-sm text-zinc-400 hover:text-white transition-colors ${step === 1 ? 'invisible' : ''}`}
              >
                İptal
              </button>
            </div>
          )}

          {step === 4 as any && (
             <Link href="/" className="block">
                <button className="w-full bg-white hover:bg-zinc-200 text-black font-semibold rounded-lg py-3.5 transition-colors">
                  Anasayfaya Dön
                </button>
             </Link>
          )}
        </div>
      </div>
    </div>
  );
}
