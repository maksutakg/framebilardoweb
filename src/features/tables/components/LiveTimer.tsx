'use client';

import React, { useState, useEffect, useRef } from 'react';

interface LiveTimerProps {
  startedAt: string | Date;
  hourlyRate: number;
  className?: string;
}

/**
 * Canlı kronometre + tutar hesaplama
 * Her saniye güncellenen masa süresi ve ücreti gösterir
 */
export default function LiveTimer({ startedAt, hourlyRate, className = '' }: LiveTimerProps) {
  const [elapsed, setElapsed] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const [price, setPrice] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const start = new Date(startedAt).getTime();

    const tick = () => {
      const now = Date.now();
      const diffMs = now - start;
      const diffSeconds = Math.floor(diffMs / 1000);
      
      const hours = Math.floor(diffSeconds / 3600);
      const minutes = Math.floor((diffSeconds % 3600) / 60);
      const seconds = diffSeconds % 60;

      setElapsed({ hours, minutes, seconds });

      // Tutar: minimum 1 saat
      const elapsedHours = diffMs / (1000 * 60 * 60);
      const billableHours = Math.max(elapsedHours, 1);
      setPrice(Math.round(billableHours * hourlyRate * 100) / 100);
    };

    tick(); // İlk çağrı
    intervalRef.current = setInterval(tick, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [startedAt, hourlyRate]);

  const pad = (n: number) => n.toString().padStart(2, '0');

  return (
    <div className={`space-y-1 ${className}`}>
      {/* Kronometre */}
      <div className="font-mono text-2xl tracking-tight font-bold tabular-nums text-white">
        {pad(elapsed.hours)}:{pad(elapsed.minutes)}:{pad(elapsed.seconds)}
      </div>
      {/* Canlı Tutar */}
      <div className="font-mono text-lg tracking-tight text-emerald-400 font-semibold">
        ₺{price.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </div>
    </div>
  );
}
