'use client';

import React from 'react';
import { Check, Clock, Receipt, X, AlertTriangle } from 'lucide-react';

interface ReceiptData {
  sessionId: string;
  tableName: string;
  tableType: string;
  startedAt: string | Date;
  endedAt: string | Date;
  durationMinutes: number;
  hourlyRate: number;
  totalPrice: number;
  minimumApplied: boolean;
}

interface ReceiptModalProps {
  receipt: ReceiptData | null;
  onClose: () => void;
}

export default function ReceiptModal({ receipt, onClose }: ReceiptModalProps) {
  if (!receipt) return null;

  const startTime = new Date(receipt.startedAt);
  const endTime = new Date(receipt.endedAt);
  const hours = Math.floor(receipt.durationMinutes / 60);
  const minutes = receipt.durationMinutes % 60;

  const formatTime = (d: Date) => d.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
  const formatDate = (d: Date) => d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      
      {/* Modal */}
      <div className="relative z-10 w-full max-w-md bg-background border border-white/10 rounded-2xl shadow-[0_0_80px_rgba(16,185,129,0.15)] overflow-hidden animate-in zoom-in-95 fade-in duration-300">
        
        {/* Header — Yeşil başarı şeridi */}
        <div className="bg-emerald-500/10 border-b border-emerald-500/20 p-6 flex items-center gap-4">
          <div className="size-12 rounded-full bg-emerald-500 flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.5)]">
            <Check className="size-6 text-white" strokeWidth={3} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Hesap Kapatıldı</h3>
            <p className="text-sm text-emerald-400 font-medium">{receipt.tableName} — {receipt.tableType}</p>
          </div>
        </div>

        {/* Fiş detayları */}
        <div className="p-6 space-y-4">
          
          {/* Tarih ve Saat */}
          <div className="flex items-center gap-3 text-sm text-zinc-400">
            <Clock className="size-4" />
            <span>{formatDate(startTime)}</span>
          </div>

          {/* Detay Satırları */}
          <div className="space-y-3 bg-black/40 rounded-xl p-4 border border-white/5">
            <div className="flex justify-between text-sm">
              <span className="text-zinc-400">Başlangıç</span>
              <span className="text-white font-medium">{formatTime(startTime)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-zinc-400">Bitiş</span>
              <span className="text-white font-medium">{formatTime(endTime)}</span>
            </div>
            <div className="border-t border-white/5 pt-3 flex justify-between text-sm">
              <span className="text-zinc-400">Toplam Süre</span>
              <span className="text-white font-semibold">
                {hours > 0 ? `${hours} saat ` : ''}{minutes > 0 ? `${minutes} dakika` : ''}
                {hours === 0 && minutes === 0 ? '< 1 dakika' : ''}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-zinc-400">Saatlik Ücret</span>
              <span className="text-white font-medium">₺{receipt.hourlyRate.toLocaleString('tr-TR')}/sa</span>
            </div>
            {receipt.minimumApplied && (
              <div className="flex items-center gap-2 text-xs text-amber-400 bg-amber-500/10 rounded-lg px-3 py-2 border border-amber-500/20">
                <AlertTriangle className="size-3.5" />
                <span>Minimum 1 saat ücreti uygulandı</span>
              </div>
            )}
          </div>

          {/* Toplam Tutar — Büyük */}
          <div className="bg-white/5 rounded-xl p-5 text-center border border-white/10">
            <p className="text-xs text-zinc-500 uppercase tracking-wider font-medium mb-1">Toplam Tutar</p>
            <p className="text-4xl font-bold text-white font-mono tracking-tight">
              ₺{receipt.totalPrice.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 pt-0">
          <button
            onClick={onClose}
            className="w-full py-3.5 rounded-xl font-bold text-black bg-white hover:bg-zinc-200 transition-colors shadow-lg"
          >
            Tamam
          </button>
        </div>
      </div>
    </div>
  );
}
