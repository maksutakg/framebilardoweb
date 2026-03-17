'use client';

import React, { useState, useEffect } from 'react';
import { CalendarClock, Phone, Clock, Check, X as XIcon, ArrowLeft, RefreshCw, User } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/components/ui/toast';

interface Reservation {
  id: string;
  tableId: string;
  tableName: string;
  tableType: string;
  customerName: string | null;
  customerPhone: string;
  startTime: string;
  endTime: string;
  status: string;
  notes: string | null;
  createdAt: string;
}

export default function AdminReservationsPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'confirmed' | 'pending' | 'cancelled'>('all');
  const { showToast } = useToast();

  const fetchReservations = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/reservations');
      if (res.ok) {
        const data = await res.json();
        setReservations(data.reservations || []);
      }
    } catch {}
    setLoading(false);
  };

  useEffect(() => {
    fetchReservations();
  }, []);

  const handleCancel = async (id: string) => {
    try {
      const res = await fetch('/api/reservations/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reservationId: id })
      });
      if (res.ok) {
        showToast('Rezervasyon iptal edildi', 'success');
        fetchReservations();
      } else {
        const error = await res.json();
        showToast(error.error || 'İptal edilemedi', 'error');
      }
    } catch {
      showToast('Bağlantı hatası', 'error');
    }
  };

  const filtered = reservations.filter(r => filter === 'all' || r.status === filter);

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      confirmed: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      pending: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      cancelled: 'bg-red-500/10 text-red-400 border-red-500/20',
      completed: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    };
    const labelMap: Record<string, string> = {
      confirmed: 'Onaylandı',
      pending: 'Beklemede',
      cancelled: 'İptal',
      completed: 'Tamamlandı',
    };
    return (
      <span className={`px-2.5 py-1 rounded-md text-xs font-semibold border ${map[status] || 'bg-white/5 text-zinc-400 border-white/10'}`}>
        {labelMap[status] || status}
      </span>
    );
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 relative z-10 w-full max-w-[1600px] mx-auto">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-black/40 p-6 rounded-2xl border border-white/10 backdrop-blur-md shadow-2xl">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            <CalendarClock className="size-8 text-amber-400" />
            Rezervasyonlar
          </h2>
          <p className="text-zinc-400 mt-1 text-sm">Tüm rezervasyonları görüntüleyin ve yönetin</p>
        </div>

        <div className="flex items-center gap-2">
          {(['all', 'confirmed', 'pending', 'cancelled'] as const).map(f => {
            const labels = { all: 'Tümü', confirmed: 'Onaylı', pending: 'Bekleyen', cancelled: 'İptal' };
            return (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                  filter === f
                    ? 'bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.4)]'
                    : 'bg-white/5 text-zinc-300 hover:bg-white/10 border border-white/10'
                }`}
              >
                {labels[f]}
              </button>
            );
          })}
          <button
            onClick={fetchReservations}
            className="p-2.5 rounded-full bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10 border border-white/10 transition-all"
          >
            <RefreshCw className="size-4" />
          </button>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center p-12">
          <div className="animate-spin size-8 border-2 border-primary border-t-transparent rounded-full" />
        </div>
      ) : (
        <div className="bg-black/40 backdrop-blur-xl rounded-2xl border border-white/10 shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left p-4 text-zinc-400 font-semibold">Müşteri</th>
                  <th className="text-left p-4 text-zinc-400 font-semibold">Masa</th>
                  <th className="text-left p-4 text-zinc-400 font-semibold">Tarih</th>
                  <th className="text-left p-4 text-zinc-400 font-semibold">Saat</th>
                  <th className="text-left p-4 text-zinc-400 font-semibold">Durum</th>
                  <th className="text-left p-4 text-zinc-400 font-semibold">Not</th>
                  <th className="text-right p-4 text-zinc-400 font-semibold">İşlem</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(r => {
                  const start = new Date(r.startTime);
                  const end = new Date(r.endTime);
                  return (
                    <tr key={r.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <User className="size-4 text-zinc-500" />
                          <div>
                            <p className="text-white font-medium">{r.customerName || '—'}</p>
                            <p className="text-zinc-500 text-xs">{r.customerPhone}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-zinc-300">{r.tableName || '—'} <span className="text-zinc-500 text-xs">({r.tableType})</span></td>
                      <td className="p-4 text-zinc-300 font-mono text-xs">{start.toLocaleDateString('tr-TR')}</td>
                      <td className="p-4 text-zinc-300 font-mono text-xs">
                        {start.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })} — {end.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="p-4">{statusBadge(r.status)}</td>
                      <td className="p-4 text-zinc-400 text-xs max-w-[150px] truncate">{r.notes || '—'}</td>
                      <td className="p-4 text-right">
                        {(r.status === 'confirmed' || r.status === 'pending') && new Date(r.startTime) > new Date() ? (
                          <button
                            onClick={() => handleCancel(r.id)}
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold text-red-400 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 transition-all"
                          >
                            İptal Et
                          </button>
                        ) : (
                          <span className="text-zinc-600 text-xs">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-zinc-500">
                      Rezervasyon bulunamadı
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
