'use client';

import React, { useState, useEffect } from 'react';
import { BarChart3, DollarSign, Clock, TrendingUp, Calendar, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface ReportData {
  period: string;
  totalRevenue: number;
  activeRevenue: number;
  totalSessions: number;
  avgDurationMinutes: number;
  revenueByType: Record<string, { revenue: number; sessions: number }>;
  hourDistribution: Record<number, number>;
  activeSessions: number;
  sessions: Array<{
    id: string;
    tableName: string;
    tableType: string;
    startedAt: string;
    endedAt: string;
    totalPrice: number;
    hourlyRateAtTime: number;
  }>;
}

export default function ReportsPage() {
  const [period, setPeriod] = useState<'today' | 'week' | 'month'>('today');
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReport = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/admin/reports?period=${period}`);
        if (res.ok) {
          setData(await res.json());
        }
      } catch {}
      setLoading(false);
    };
    fetchReport();
  }, [period]);

  const periodLabels = { today: 'Bugün', week: 'Bu Hafta', month: 'Bu Ay' };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 relative z-10 w-full max-w-[1600px] mx-auto">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-black/40 p-6 rounded-2xl border border-white/10 backdrop-blur-md shadow-2xl">
        <div>
          <Link href="/dashboard" className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors text-sm font-medium mb-3">
            <ArrowLeft className="size-4" />
            Masalara Dön
          </Link>
          <h2 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            <BarChart3 className="size-8 text-blue-400" />
            Ciro Raporları
          </h2>
        </div>

        {/* Period Selector */}
        <div className="flex items-center gap-2">
          {(['today', 'week', 'month'] as const).map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 ${
                period === p
                  ? 'bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.4)]'
                  : 'bg-white/5 text-zinc-300 hover:bg-white/10 border border-white/10'
              }`}
            >
              {periodLabels[p]}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center p-12">
          <div className="animate-spin size-8 border-2 border-primary border-t-transparent rounded-full" />
        </div>
      ) : data ? (
        <>
          {/* Özet Kartlar */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-6 border border-emerald-500/20 shadow-xl">
              <div className="flex items-center gap-2 mb-3 text-emerald-400">
                <DollarSign className="size-5" />
                <span className="text-xs uppercase tracking-wider font-semibold">Toplam Ciro</span>
              </div>
              <p className="text-3xl font-bold text-white font-mono">
                ₺{data.totalRevenue.toLocaleString('tr-TR', { minimumFractionDigits: 0 })}
              </p>
            </div>
            
            <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-6 border border-blue-500/20 shadow-xl">
              <div className="flex items-center gap-2 mb-3 text-blue-400">
                <BarChart3 className="size-5" />
                <span className="text-xs uppercase tracking-wider font-semibold">Oturum Sayısı</span>
              </div>
              <p className="text-3xl font-bold text-white font-mono">{data.totalSessions}</p>
            </div>
            
            <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-6 border border-amber-500/20 shadow-xl">
              <div className="flex items-center gap-2 mb-3 text-amber-400">
                <Clock className="size-5" />
                <span className="text-xs uppercase tracking-wider font-semibold">Ort. Süre</span>
              </div>
              <p className="text-3xl font-bold text-white font-mono">
                {data.avgDurationMinutes > 0 
                  ? `${Math.floor(data.avgDurationMinutes / 60)}s ${data.avgDurationMinutes % 60}dk`
                  : '—'}
              </p>
            </div>
            
            <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/20 shadow-xl">
              <div className="flex items-center gap-2 mb-3 text-purple-400">
                <TrendingUp className="size-5" />
                <span className="text-xs uppercase tracking-wider font-semibold">Ort. Tutar</span>
              </div>
              <p className="text-3xl font-bold text-white font-mono">
                ₺{data.totalSessions > 0 
                  ? Math.round(data.totalRevenue / data.totalSessions).toLocaleString('tr-TR')
                  : '0'}
              </p>
            </div>
          </div>

          {/* Masa Tipi Kırılımı */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-6 border border-white/10 shadow-xl">
              <h3 className="text-lg font-bold text-white mb-4">Masa Tipine Göre Dağılım</h3>
              <div className="space-y-3">
                {Object.entries(data.revenueByType).map(([type, info]) => {
                  const percentage = data.totalRevenue > 0 ? (info.revenue / data.totalRevenue) * 100 : 0;
                  return (
                    <div key={type} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-zinc-300 font-medium">{type}</span>
                        <span className="text-white font-semibold">
                          ₺{info.revenue.toLocaleString('tr-TR', { minimumFractionDigits: 0 })} ({info.sessions} oturum)
                        </span>
                      </div>
                      <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-1000"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
                {Object.keys(data.revenueByType).length === 0 && (
                  <p className="text-zinc-500 text-sm">Henüz veri yok</p>
                )}
              </div>
            </div>

            {/* Saat Dağılımı */}
            <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-6 border border-white/10 shadow-xl">
              <h3 className="text-lg font-bold text-white mb-4">Saatlere Göre Yoğunluk</h3>
              <div className="flex items-end gap-1 h-40">
                {Array.from({ length: 24 }, (_, i) => {
                  const count = data.hourDistribution[i] || 0;
                  const maxCount = Math.max(...Object.values(data.hourDistribution), 1);
                  const height = (count / maxCount) * 100;
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                      <div
                        className={`w-full rounded-t transition-all duration-500 ${
                          count > 0 ? 'bg-gradient-to-t from-blue-600 to-blue-400' : 'bg-white/5'
                        }`}
                        style={{ height: `${Math.max(height, 4)}%` }}
                        title={`${i}:00 — ${count} oturum`}
                      />
                      {i % 3 === 0 && (
                        <span className="text-[9px] text-zinc-500">{i}:00</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Son Oturumlar Tablosu */}
          <div className="bg-black/40 backdrop-blur-xl rounded-2xl border border-white/10 shadow-xl overflow-hidden">
            <div className="p-6 border-b border-white/5">
              <h3 className="text-lg font-bold text-white">Son Oturumlar</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="text-left p-4 text-zinc-400 font-semibold">Masa</th>
                    <th className="text-left p-4 text-zinc-400 font-semibold">Tip</th>
                    <th className="text-left p-4 text-zinc-400 font-semibold">Başlangıç</th>
                    <th className="text-left p-4 text-zinc-400 font-semibold">Bitiş</th>
                    <th className="text-left p-4 text-zinc-400 font-semibold">Süre</th>
                    <th className="text-right p-4 text-zinc-400 font-semibold">Tutar</th>
                  </tr>
                </thead>
                <tbody>
                  {data.sessions.map(s => {
                    const start = new Date(s.startedAt);
                    const end = new Date(s.endedAt);
                    const durationMin = Math.floor((end.getTime() - start.getTime()) / (1000 * 60));
                    const hours = Math.floor(durationMin / 60);
                    const mins = durationMin % 60;
                    return (
                      <tr key={s.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td className="p-4 text-white font-medium">{s.tableName || '—'}</td>
                        <td className="p-4 text-zinc-400">{s.tableType || '—'}</td>
                        <td className="p-4 text-zinc-300 font-mono text-xs">
                          {start.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="p-4 text-zinc-300 font-mono text-xs">
                          {end.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="p-4 text-zinc-300">
                          {hours > 0 ? `${hours}s ` : ''}{mins}dk
                        </td>
                        <td className="p-4 text-right text-white font-bold font-mono">
                          ₺{(s.totalPrice || 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    );
                  })}
                  {data.sessions.length === 0 && (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-zinc-500">
                        Bu dönemde tamamlanmış oturum bulunamadı
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        <p className="text-zinc-500 text-center p-12">Rapor yüklenemedi</p>
      )}
    </div>
  );
}
