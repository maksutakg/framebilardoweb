'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { Check, X, ArrowLeft, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { useToast } from '@/components/ui/toast';

interface AvailableTable {
  id: string;
  name: string;
  type: string;
  hourlyRate: number;
  isAvailable: boolean;
}

export default function ReservationPage() {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const AVAILABLE_TIMES = [
    '12:00', '13:00', '14:00', '15:00', '16:00', '17:00',
    '18:00', '19:00', '20:00', '21:00', '22:00', '23:00',
    '00:00', '01:00'
  ];

  // Gelecek 7 gün
  const dates = useMemo(() => {
    const days: { label: string; date: string; dayName: string }[] = [];
    const dayNames = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];
      days.push({
        label: i === 0 ? 'Bugün' : i === 1 ? 'Yarın' : `${d.getDate()} ${['Oca','Şub','Mar','Nis','May','Haz','Tem','Ağu','Eyl','Eki','Kas','Ara'][d.getMonth()]}`,
        date: dateStr,
        dayName: dayNames[d.getDay()],
      });
    }
    return days;
  }, []);

  // Selections
  const [selectedDate, setSelectedDate] = useState(dates[0]?.date || '');
  const [selectedTime, setSelectedTime] = useState('19:00');
  const [selectedTableType, setSelectedTableType] = useState('');
  const [selectedTableId, setSelectedTableId] = useState('');
  
  // Müsait masalar
  const [availableTables, setAvailableTables] = useState<AvailableTable[]>([]);
  const [tablesLoading, setTablesLoading] = useState(false);

  // Masaları çek — tarih/saat değiştiğinde
  useEffect(() => {
    const fetchTables = async () => {
      setTablesLoading(true);
      try {
        const params = new URLSearchParams();
        if (selectedDate) params.set('date', selectedDate);
        if (selectedTime) params.set('time', selectedTime);
        
        const res = await fetch(`/api/reservations/available?${params.toString()}`);
        if (res.ok) {
          const data = await res.json();
          setAvailableTables(data.tables || []);
        }
      } catch {
        // Fallback — API yoksa boş göster
        setAvailableTables([]);
      }
      setTablesLoading(false);
    };

    if (selectedDate && selectedTime) {
      fetchTables();
    }
  }, [selectedDate, selectedTime]);

  // Masa tiplerini grupla
  const tableTypes = useMemo(() => {
    const types: Record<string, { tables: AvailableTable[]; availableCount: number; hourlyRate: number }> = {};
    availableTables.forEach(t => {
      if (!types[t.type]) {
        types[t.type] = { tables: [], availableCount: 0, hourlyRate: t.hourlyRate };
      }
      types[t.type].tables.push(t);
      if (t.isAvailable) types[t.type].availableCount++;
    });
    return types;
  }, [availableTables]);

  // Seçili tipe ait müsait masalar
  const selectedTypeTables = useMemo(() => {
    return availableTables.filter(t => t.type === selectedTableType && t.isAvailable);
  }, [availableTables, selectedTableType]);

  const typeDisplayNames: Record<string, { name: string; description: string; features: string[] }> = {
    'snooker': { name: 'Snooker', description: 'Profesyoneller için özel alan', features: ['12ft Profesyonel Standart', 'Star Xing Pai Masalar', 'Özel Karbon İstakalar'] },
    'SNOOKER': { name: 'Snooker', description: 'Profesyoneller için özel alan', features: ['12ft Profesyonel Standart', 'Star Xing Pai Masalar', 'Özel Karbon İstakalar'] },
    'SNOOKER VIP': { name: 'Snooker VIP', description: 'Premium snooker deneyimi', features: ['12ft Profesyonel Standart', 'Özel VIP Alan', 'Karbon İstaka Seti'] },
    'pool': { name: 'Amerikan (Pool)', description: 'Klasik bilardo deneyimi', features: ['9ft Turnuva Masası', 'Zeki Bilardo / Knight Shot', 'Ayrıcalıklı Kasa Hizmeti']},
    'POOL': { name: 'Amerikan (Pool)', description: 'Klasik bilardo deneyimi', features: ['9ft Turnuva Masası', 'Zeki Bilardo / Knight Shot', 'Ayrıcalıklı Kasa Hizmeti']},
    '3-cushion': { name: 'Karambol (3-Top)', description: 'Üç bant bilardo', features: ['Profesyonel Karambol Masası', 'Turnuva Standartları', 'Özel Toplar'] },
    'KARAMBOL': { name: 'Karambol (3-Top)', description: 'Üç bant bilardo', features: ['Profesyonel Karambol Masası', 'Turnuva Standartları', 'Özel Toplar'] },
  };

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
        showToast('Doğrulama kodu gönderildi', 'success');
      } else {
        const errorData = await res.json().catch(() => ({}));
        showToast(errorData?.error || 'Doğrulama kodu gönderilemedi', 'error');
      }
    } catch (error: any) {
      showToast('Bağlantı hatası oluştu', 'error');
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
        showToast('Doğrulama kodu hatalı!', 'error');
        setLoading(false);
        return;
      }

      // Seçilen masa, tarih ve saat ile rezervasyon yap
      const [hours, minutes] = selectedTime.split(':').map(Number);
      const startTime = new Date(selectedDate);
      startTime.setHours(hours, minutes || 0, 0, 0);
      const endTime = new Date(startTime);
      endTime.setHours(endTime.getHours() + 1);

      const reserveRes = await fetch('/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tableId: selectedTableId,
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString(),
        })
      });

      if (reserveRes.ok) {
        setStep(4);
        showToast('Rezervasyonunuz onaylandı!', 'success');
      } else {
        const error = await reserveRes.json();
        showToast(error.error || 'Rezervasyon oluşturulamadı', 'error');
      }
    } catch (err) {
      showToast('Bir hata oluştu', 'error');
    } finally {
      setLoading(false);
    }
  };

  const CheckIconSelected = () => (
    <div className="absolute -top-2.5 -right-2.5 bg-white rounded-full p-0.5 border-4 border-black z-10">
      <Check className="size-3 text-black" strokeWidth={4} />
    </div>
  );

  const selectedTypeInfo = typeDisplayNames[selectedTableType] || { name: selectedTableType, description: '', features: [] };
  const selectedDateInfo = dates.find(d => d.date === selectedDate);

  return (
    <div className="min-h-screen w-full bg-background flex flex-col items-center justify-center p-4 pt-32 pb-10 md:pt-4 md:pb-4 font-sans text-foreground antialiased selection:bg-primary/30 selection:text-primary overflow-y-auto">
      <div className="fixed inset-0 pointer-events-none z-0 mix-blend-multiply bg-black/40" />
      
      {/* Header */}
      <div className="absolute top-6 left-6 md:top-8 md:left-8 z-20 flex flex-col gap-5">
        <Link href="/">
          <img src="https://api.frameclubbilardo.com/assets/logo.svg" alt="Frame" className="h-8 md:h-12 object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]" />
        </Link>
        <Link href="/" className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors text-sm font-medium">
          <ArrowLeft className="size-4" />
          Anasayfaya Dön
        </Link>
      </div>

      <div className="relative z-10 w-full max-w-lg mt-8 md:mt-0 bg-black/60 backdrop-blur-3xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-300">
        
        {/* Modal Header */}
        <div className="p-6 md:p-8 pb-4">
          <div className="flex items-start justify-between">
            <h2 className="text-xl font-bold tracking-tight text-white">
              {step === 1 && "Masa Planınızı Seçin"}
              {step === 2 && "Telefon Doğrulaması"}
              {step === 3 && "Doğrulama Kodu"}
              {step === 4 && "Rezervasyon Tamamlandı"}
            </h2>
            {step !== 4 && (
              <Link href="/">
                <button className="text-zinc-500 hover:text-white transition-colors">
                  <X className="size-5" />
                </button>
              </Link>
            )}
          </div>
          
          {/* Step Progress */}
          {step !== 4 && (
            <div className="flex items-center gap-2 mt-4">
              {[1, 2, 3].map(s => (
                <div key={s} className={`h-1 flex-1 rounded-full transition-all ${s <= step ? 'bg-white' : 'bg-white/10'}`} />
              ))}
            </div>
          )}

          <p className="mt-3 text-sm text-zinc-400 leading-relaxed">
            {step === 1 && "Gün, saat ve masa tipini seçin. Sistem otomatik olarak müsait masaları gösterecektir."}
            {step === 2 && "Sahte rezervasyonları engellemek için sadece onaylı numara ile işlem yapıyoruz."}
            {step === 3 && `+90 ${phoneNumber} numarasına gönderdiğimiz 6 haneli kodu giriniz.`}
          </p>
        </div>

        {/* Modal Content */}
        <div className="px-6 md:px-8 pb-8 space-y-6">
          
          {step === 1 && (
            <div className="space-y-5">
              {/* Date Selection */}
              <div>
                <label className="text-xs text-zinc-500 uppercase tracking-wider font-semibold mb-2 block">Tarih Seçin</label>
                <div className="flex items-center gap-2 overflow-x-auto pb-3 custom-scroll">
                  {dates.map((day) => (
                     <button
                       key={day.date}
                       onClick={() => setSelectedDate(day.date)}
                       className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                         selectedDate === day.date 
                           ? 'bg-white text-black drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]' 
                           : 'bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10'
                       }`}
                     >
                       {day.label}
                     </button>
                  ))}
                </div>
              </div>

              {/* Time Selection */}
              <div>
                <label className="text-xs text-zinc-500 uppercase tracking-wider font-semibold mb-2 block">Saat Seçin</label>
                <div className="flex items-center gap-2 overflow-x-auto pb-3 custom-scroll">
                  {AVAILABLE_TIMES.map((time) => {
                    // Geçmiş saatleri devre dışı bırak (bugün için)
                    const now = new Date();
                    const isToday = selectedDate === now.toISOString().split('T')[0];
                    const [h] = time.split(':').map(Number);
                    const isPast = isToday && h <= now.getHours();
                    
                    return (
                      <button
                        key={time}
                        onClick={() => !isPast && setSelectedTime(time)}
                        disabled={isPast}
                        className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                          selectedTime === time 
                            ? 'bg-white text-black drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]' 
                            : isPast
                            ? 'bg-white/5 text-zinc-600 cursor-not-allowed line-through'
                            : 'bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10'
                        }`}
                      >
                        {time}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Table Type Cards — Gerçek veriden */}
              <div>
                <label className="text-xs text-zinc-500 uppercase tracking-wider font-semibold mb-3 block">Masa Tipi Seçin</label>
                {tablesLoading ? (
                  <div className="flex justify-center p-6">
                    <Loader2 className="animate-spin size-6 text-zinc-500" />
                  </div>
                ) : Object.keys(tableTypes).length > 0 ? (
                  <div className="space-y-3">
                    {Object.entries(tableTypes).map(([type, info]) => {
                      const display = typeDisplayNames[type] || { name: type, description: '', features: [] };
                      const isSelected = selectedTableType === type;
                      const hasAvailable = info.availableCount > 0;
                      
                      return (
                        <div
                          key={type}
                          onClick={() => {
                            if (hasAvailable) {
                              setSelectedTableType(type);
                              // İlk müsait masayı otomatik seç
                              const firstAvailable = info.tables.find(t => t.isAvailable);
                              if (firstAvailable) setSelectedTableId(firstAvailable.id);
                            }
                          }}
                          className={`relative cursor-pointer rounded-xl p-5 border transition-all duration-200 ${
                            !hasAvailable ? 'opacity-40 cursor-not-allowed border-white/5 bg-black/40' :
                            isSelected ? 'border-white bg-white/10' : 'border-white/10 bg-black/40 hover:border-white/20'
                          }`}
                        >
                          {isSelected && hasAvailable && <CheckIconSelected />}
                          
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h3 className="text-lg font-bold text-white">{display.name}</h3>
                              <p className="text-sm text-zinc-500">{display.description}</p>
                            </div>
                            <div className="text-right">
                              <span className="text-xl font-bold text-white">{info.hourlyRate}₺</span>
                              <span className="text-sm text-zinc-500"> /sa</span>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <div className="flex items-center gap-3 text-sm text-zinc-300">
                              <Check className="size-4 text-zinc-500" />
                              <span className={hasAvailable ? 'text-emerald-400 font-semibold' : 'text-red-400'}>
                                {hasAvailable ? `${info.availableCount} Adet Müsait Masa` : 'Müsait masa yok'}
                              </span>
                            </div>
                            {display.features.slice(0, 2).map((f, i) => (
                              <div key={i} className="flex items-center gap-3 text-sm text-zinc-300">
                                <Check className="size-4 text-zinc-500" />
                                <span>{f}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-6 text-zinc-500 text-sm">
                    Seçilen tarih ve saat için masa bilgisi bulunamadı
                  </div>
                )}
              </div>

              {/* Belirli masa seçimi (opsiyonel) */}
              {selectedTableType && selectedTypeTables.length > 1 && (
                <div>
                  <label className="text-xs text-zinc-500 uppercase tracking-wider font-semibold mb-2 block">Masa Seçin (Opsiyonel)</label>
                  <div className="flex flex-wrap gap-2">
                    {selectedTypeTables.map(t => (
                      <button
                        key={t.id}
                        onClick={() => setSelectedTableId(t.id)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                          selectedTableId === t.id
                            ? 'bg-white text-black'
                            : 'bg-white/5 text-zinc-400 hover:bg-white/10 border border-white/10'
                        }`}
                      >
                        {t.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
              {/* Seçim Özeti */}
              <div className="bg-white/5 rounded-xl p-4 border border-white/10 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-zinc-400">Tarih</span>
                  <span className="text-white font-medium">{selectedDateInfo?.label} ({selectedDateInfo?.dayName})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Saat</span>
                  <span className="text-white font-medium">{selectedTime}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Masa</span>
                  <span className="text-white font-medium">{selectedTypeInfo.name}</span>
                </div>
              </div>

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
                placeholder="000000"
                className="w-52 text-center bg-black/40 border border-white/10 rounded-xl px-4 py-4 text-white focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-all text-3xl font-mono tracking-widest"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, ''))}
                maxLength={6}
              />
            </div>
          )}

          {step === 4 && (
             <div className="py-6 flex flex-col items-center justify-center text-center space-y-4 animate-in fade-in zoom-in duration-500">
                <div className="size-16 rounded-full bg-white flex items-center justify-center mb-2">
                  <Check className="size-8 text-black" strokeWidth={3} />
                </div>
                <h3 className="text-xl font-bold text-white">Hazırsınız!</h3>
                <p className="text-sm text-zinc-400">
                  {selectedDateInfo?.label} ({selectedDateInfo?.dayName}), saat {selectedTime} itibarıyla {selectedTypeInfo.name} masanız ayrılmıştır. 
                  Geldiğinizde telefon numaranızı söylemeniz yeterlidir.
                </p>
             </div>
          )}

          {/* Action Buttons */}
          {step !== 4 && (
            <div className="flex items-center justify-between pt-2">
              <button 
                onClick={() => {
                  if (step === 1) {
                    if (!selectedTableId) {
                      showToast('Lütfen bir masa tipi seçin', 'warning');
                      return;
                    }
                    setStep(2);
                  }
                  else if (step === 2) handleSendSMS();
                  else if (step === 3) handleConfirmReservation();
                }}
                disabled={loading || (step === 1 && !selectedTableId) || (step === 2 && phoneNumber.length < 10) || (step === 3 && otpCode.length < 6)}
                className="bg-white hover:bg-zinc-200 text-black font-semibold rounded-md px-6 py-2 transition-colors disabled:opacity-50 flex items-center"
              >
                {loading && <Loader2 className="mr-2 size-4 animate-spin" />}
                {!loading && step === 1 && "Seçimi Onayla"}
                {!loading && step === 2 && "Devam Et"}
                {!loading && step === 3 && "Rezervasyonu Tamamla"}
              </button>
              
              <button 
                onClick={() => {
                  if (step > 1) setStep((step - 1) as any);
                }}
                className={`font-medium text-sm text-zinc-400 hover:text-white transition-colors ${step === 1 ? 'invisible' : ''}`}
              >
                Geri
              </button>
            </div>
          )}

          {step === 4 && (
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
