'use client';

import React, { useState, useEffect } from 'react';
import TableGrid from '@/features/tables/components/TableGrid';
import { DollarSign, Clock, BarChart3, Activity } from 'lucide-react';

interface DailyStats {
  totalRevenue: number;
  activeRevenue: number;
  totalSessions: number;
  avgDurationMinutes: number;
  activeSessions: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DailyStats | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/admin/reports?period=today');
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch {}
    };

    fetchStats();
    // Her 60 saniyede güncelle
    const interval = setInterval(fetchStats, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 relative z-10 w-full max-w-[1600px] mx-auto">
      
      {/* Günlük Ciro Özeti Kartları */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={<DollarSign className="size-5" />}
            label="Bugünkü Ciro"
            value={`₺${stats.totalRevenue.toLocaleString('tr-TR', { minimumFractionDigits: 0 })}`}
            accent="emerald"
          />
          <StatCard
            icon={<Activity className="size-5" />}
            label="Açık Masalar"
            value={`${stats.activeSessions} Masa`}
            subtext={`~₺${Math.round(stats.activeRevenue).toLocaleString('tr-TR')} tahmini`}
            accent="red"
          />
          <StatCard
            icon={<BarChart3 className="size-5" />}
            label="Toplam Oturum"
            value={`${stats.totalSessions}`}
            accent="blue"
          />
          <StatCard
            icon={<Clock className="size-5" />}
            label="Ort. Oturum Süresi"
            value={stats.avgDurationMinutes > 0 
              ? `${Math.floor(stats.avgDurationMinutes / 60)}s ${stats.avgDurationMinutes % 60}dk` 
              : '—'}
            accent="amber"
          />
        </div>
      )}

      {/* Masa Grid Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-black/40 p-6 rounded-2xl border border-white/10 backdrop-blur-md shadow-2xl">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white mb-2 flex items-center gap-3">
            <span>Masa Yönetimi</span>
          </h2>
          <p className="text-zinc-400 mt-1 max-w-lg text-sm md:text-base">
            Rezerve edilen, boş ve kullanımda olan masaları anlık olarak takip edin.
          </p>
        </div>
      </div>

      <TableGrid />
    </div>
  );
}


function StatCard({ icon, label, value, subtext, accent }: {
  icon: React.ReactNode;
  label: string;
  value: string;
  subtext?: string;
  accent: 'emerald' | 'red' | 'blue' | 'amber';
}) {
  const accentMap = {
    emerald: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    red: 'text-red-400 bg-red-500/10 border-red-500/20',
    blue: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    amber: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  };

  const iconAccentMap = {
    emerald: 'text-emerald-400',
    red: 'text-red-400',
    blue: 'text-blue-400',
    amber: 'text-amber-400',
  };

  return (
    <div className={`bg-black/40 backdrop-blur-xl rounded-2xl p-5 border ${accentMap[accent]} shadow-xl`}>
      <div className="flex items-center gap-2 mb-3">
        <div className={iconAccentMap[accent]}>{icon}</div>
        <span className="text-xs text-zinc-400 uppercase tracking-wider font-semibold">{label}</span>
      </div>
      <p className="text-2xl font-bold text-white font-mono tracking-tight">{value}</p>
      {subtext && <p className="text-xs text-zinc-500 mt-1">{subtext}</p>}
    </div>
  );
}
